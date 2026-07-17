import type {
  EngineCallbacks,
  FrameStats,
  MotionPolicy,
  PhotoManifest,
} from './contract'
import type { Renderer } from './Renderer'
import { Scheduler } from './Scheduler'
import { detectBackend, createRenderer } from '../renderers/detect'
import { createGlobe, computeBackfaceAlpha, findFrontPhoto } from '../objects/Globe'
import { createPhysics, applyInertia, startSnap, updateSnap } from '../physics/Physics'
import { Interaction } from '../Interaction'
import { TextureManager } from '../textures/TextureManager'
import { createDefaultCamera } from '../scene/Camera'
import { mat4Identity, mat4Multiply, mat4Perspective, mat4LookAt, mat4RotateX, mat4RotateY } from '../math/mat4'

const QUAD_MESH_HANDLE = 0

export class Engine {
  private renderer: Renderer | null = null
  private scheduler: Scheduler
  private interaction: Interaction
  private textureManager: TextureManager
  private canvas: HTMLCanvasElement | null = null
  private callbacks: EngineCallbacks
  private globe = createGlobe()
  private physics = createPhysics()
  private camera = createDefaultCamera(1)
  private motionPolicy: MotionPolicy = 'full'
  private enabled = true
  private manifest: PhotoManifest | null = null
  private textureHandles: Map<number, number> = new Map()
  private lastFrameTime = 0
  private frameCount = 0
  private fpsAccum = 0
  private lastStatsTime = 0
  private statsThrottleMs = 1000
  private isLightboxOpen = false
  private meshCreated = false

  constructor(callbacks: EngineCallbacks) {
    this.callbacks = callbacks
    this.textureManager = new TextureManager()

    this.scheduler = new Scheduler({
      onTick: (dt, time) => this.tick(dt, time),
      onSleep: () => {},
    })

    this.interaction = new Interaction({
      onDragStart: () => this.handleDragStart(),
      onDragMove: (dx, dy) => this.handleDragMove(dx, dy),
      onDragEnd: (vx, vy) => this.handleDragEnd(vx, vy),
      onPinch: (scale) => this.handlePinch(scale),
    })
  }

  async mount(canvas: HTMLCanvasElement): Promise<void> {
    this.canvas = canvas

    const backend = await detectBackend()
    this.callbacks.onBackendChosen(backend)

    this.renderer = createRenderer(backend)
    this.renderer.initialize(canvas)

    const rect = canvas.getBoundingClientRect()
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    this.camera.aspect = canvas.width / canvas.height

    this.renderer.createMesh([0, 0, 0], [1, 1])
    this.meshCreated = true

    this.interaction.attach(canvas)
    this.scheduler.wake()
  }

  unmount(): void {
    this.interaction.detach()
    this.scheduler.dispose()
    if (this.renderer) {
      this.renderer.dispose()
      this.renderer = null
    }
    this.textureManager.dispose()
    this.canvas = null
  }

  loadPhotos(manifest: PhotoManifest): void {
    this.manifest = manifest
    this.globe = createGlobe()

    for (let i = 0; i < manifest.photos.length; i++) {
      const photo = manifest.photos[i]
      this.loadTexture(i, photo.src)
    }
  }

  private async loadTexture(index: number, src: string): Promise<void> {
    try {
      const bitmap = await this.textureManager.load(String(index), src)
      if (this.renderer) {
        const handle = this.renderer.uploadTexture(bitmap)
        this.textureHandles.set(index, handle)
      }
    } catch (err) {
      console.error(`[Engine] Failed to load texture ${index}:`, err)
    }
  }

  setActiveSelection(photoId: string | null): void {
    if (photoId === null) {
      this.globe.selectedPhotoIndex = null
      return
    }

    if (!this.manifest) return
    const idx = this.manifest.photos.findIndex((p) => p.id === photoId)
    if (idx === -1) return

    this.globe.selectedPhotoIndex = idx
    const targetRotX = this.globe.rotX
    const targetRotY = this.globe.rotY

    startSnap(this.physics, targetRotX, targetRotY)
  }

  setMotionPolicy(policy: MotionPolicy): void {
    this.motionPolicy = policy
    if (policy === 'static') {
      this.scheduler.sleep()
    } else {
      this.scheduler.wake()
    }
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled
    if (!enabled) {
      this.scheduler.sleep()
    } else {
      this.scheduler.wake()
    }
  }

  setLightboxOpen(open: boolean): void {
    this.isLightboxOpen = open
    if (open) {
      this.scheduler.sleep()
    } else {
      this.scheduler.wake()
    }
  }

  resize(width: number, height: number): void {
    if (!this.canvas) return
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    this.renderer?.resize(width * dpr, height * dpr)
    this.camera.aspect = (width * dpr) / (height * dpr)
  }

  private tick(dt: number, time: number): void {
    if (!this.enabled || !this.renderer || this.isLightboxOpen) return
    if (this.motionPolicy === 'static') return

    // Update physics
    if (!this.physics.isDragging && !this.physics.isSnapping) {
      applyInertia(this.physics)
      if (this.motionPolicy !== 'reduced') {
        this.globe.rotY += this.globe.autoRotateSpeed
      }
      this.globe.rotY += this.physics.velocityX * 0.001
      this.globe.rotX += this.physics.velocityY * 0.001
    }

    if (this.physics.isSnapping) {
      const result = updateSnap(this.physics, this.globe.rotX, this.globe.rotY, dt)
      this.globe.rotX = result.x
      this.globe.rotY = result.y
    }

    // Clamp rotX
    this.globe.rotX = Math.max(-0.5, Math.min(0.5, this.globe.rotX))

    this.render(time)
    this.reportStats(time)
  }

  private render(time: number): void {
    if (!this.renderer || !this.canvas) return

    this.renderer.setCamera(this.camera)
    this.renderer.beginFrame()

    const mvp = this.getMVP()

    for (let i = 0; i < this.globe.positions.length; i++) {
      if (!this.textureHandles.has(i)) continue

      const pos = this.globe.positions[i]
      const normal = this.globe.normals[i]
      const alpha = computeBackfaceAlpha(normal, this.globe.rotX, this.globe.rotY)

      const texHandle = this.textureHandles.get(i)!

      this.renderer.drawMesh(
        QUAD_MESH_HANDLE,
        { alpha: 1, texture: texHandle, roundedCorners: true },
        mvp,
        pos,
        [0.22, 0.22],
        alpha,
      )
    }

    this.renderer.endFrame()
    this.lastFrameTime = time
  }

  private getMVP() {
    const proj = mat4Identity()
    mat4Perspective(proj, this.camera.fov, this.camera.aspect, this.camera.near, this.camera.far)

    const view = mat4Identity()
    mat4LookAt(view, this.camera.eye, this.camera.target, this.camera.up)

    const model = mat4Identity()
    mat4RotateX(model, this.globe.rotX)
    mat4RotateY(model, this.globe.rotY)

    const mv = mat4Identity()
    mat4Multiply(mv, view, model)

    const mvp = mat4Identity()
    mat4Multiply(mvp, proj, mv)
    return mvp
  }

  private reportStats(time: number): void {
    this.frameCount++
    this.fpsAccum += time - this.lastFrameTime

    if (time - this.lastStatsTime >= this.statsThrottleMs) {
      const fps = this.frameCount / (this.fpsAccum / 1000)
      const stats: FrameStats = {
        fps: Math.round(fps),
        drawCalls: this.globe.positions.length,
        visibleCount: this.globe.positions.length,
        loadedCount: this.textureManager.getLoadedCount(),
        totalCount: this.manifest?.photos.length ?? 0,
      }
      this.callbacks.onFrame(stats)
      this.frameCount = 0
      this.fpsAccum = 0
      this.lastStatsTime = time
    }
  }

  private handleDragStart(): void {
    this.physics.isDragging = true
    this.physics.velocityX = 0
    this.physics.velocityY = 0
    this.scheduler.wake()
  }

  private handleDragMove(dx: number, dy: number): void {
    if (!this.physics.isDragging) return
    this.globe.rotY += dx * 0.005
    this.globe.rotX += dy * 0.005
    this.globe.rotX = Math.max(-0.5, Math.min(0.5, this.globe.rotX))
  }

  private handleDragEnd(velocityX: number, velocityY: number): void {
    this.physics.isDragging = false
    this.physics.velocityX = velocityX * 0.3
    this.physics.velocityY = velocityY * 0.3

    const front = findFrontPhoto(
      this.globe.positions,
      this.globe.normals,
      this.globe.rotX,
      this.globe.rotY,
    )

    this.globe.selectedPhotoIndex = front

    if (this.manifest) {
      const photo = this.manifest.photos[front]
      if (photo) {
        this.callbacks.onSelect(photo.id)
      }
    }

    this.scheduler.requestSleep()
  }

  private handlePinch(scale: number): void {
    this.scheduler.wake()
    const zoomDelta = (scale - 1) * 0.1
    this.camera.eye[2] = Math.max(2.5, Math.min(6, this.camera.eye[2] - zoomDelta))
  }
}
