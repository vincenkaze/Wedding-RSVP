import type {
  EngineCallbacks,
  FrameStats,
  MotionPolicy,
  PhotoManifest,
  SchedulerState,
  BackendType,
  PreviewStartData,
} from './core/contract'
import type { Renderer } from './renderers/interface'
import type { PhotoMesh } from './objects/PhotoMesh'
import { Scheduler } from './core/Scheduler'
import { detectBackend, createRendererForCanvas } from './core/RendererFactory'
import { createGlobe, computeBackfaceAlpha } from './objects/Globe'
import { createPhysics, updateSnap } from './physics/Physics'
import { Interaction } from './interaction'
import { TextureManager } from './textures/TextureManager'
import { createDefaultCamera, computeCameraDistance } from './scene/Camera'
import { Scene } from './scene/Scene'
import { ResourceLifecycle } from './lifecycle/ResourceLifecycle'
import { createPhotoMesh } from './objects/PhotoMesh'
import { mat4Perspective, mat4LookAt, mat4Multiply, mat4Identity } from './math/mat4'

const PREVIEW_DELAY_MS = 450
const COLOR_DECAY = 0.85
const SCALE_DECAY = 0.92
const MAX_PITCH = 0.30
const PITCH_SENSITIVITY = 0.003
const PITCH_DECAY = 0.90
const BASE_YAW_SENSITIVITY = 0.0055
const MIN_SPEED_MULTIPLIER = 0.9
const MAX_SPEED_MULTIPLIER = 1.5
const VELOCITY_SMOOTHING = 0.20
const MAX_THROW_VELOCITY = 0.012

export class GalleryEngine {
  private renderer: Renderer | null = null
  private scheduler: Scheduler
  private interaction: Interaction
  private textureManager: TextureManager
  private scene: Scene
  private lifecycle: ResourceLifecycle
  private canvas: HTMLCanvasElement | null = null
  private callbacks: EngineCallbacks
  private globe = createGlobe()
  private physics = createPhysics()
  private camera = createDefaultCamera(1)
  private targetPitch = 0.15
  private motionPolicy: MotionPolicy = 'full'
  private enabled = true
  private manifest: PhotoManifest | null = null
  private meshes: PhotoMesh[] = []
  private meshById: Map<string, PhotoMesh> = new Map()
  private textureHandles: Map<number, number> = new Map()
  private lastFrameTime = 0
  private frameCount = 0
  private fpsAccum = 0
  private lastStatsTime = 0
  private statsThrottleMs = 1000
  private isLightboxOpen = false
  private backend: BackendType = 'webgl2'
  private readonly IDLE_YAW_SPEED = (2 * Math.PI) / (25 * 1000)
  private currentYawVelocity = 0
  private globeScale = 1.0
  private targetGlobeScale = 1.0
  private isMobile = false
  private smoothedYawVelocity = 0
  private lastDragTime = 0
  private maxDpr = 2

  private pressedPhotoId: string | null = null
  private previewPhotoSrc: string | null = null
  private previewOrigin: PreviewStartData['origin'] | null = null
  private isPreviewActive = false
  private previewTimer: ReturnType<typeof setTimeout> | null = null
  private userControlling = false

  constructor(canvas: HTMLCanvasElement, callbacks: EngineCallbacks) {
    this.canvas = canvas
    this.callbacks = callbacks
    this.textureManager = new TextureManager()
    this.scene = new Scene()

    this.lifecycle = new ResourceLifecycle({
      onStateChange: () => {},
    })

    this.scheduler = new Scheduler({
      onTick: (dt, time) => this.tick(dt, time),
      onStateChange: (state) => this.handleSchedulerStateChange(state),
    })

    this.interaction = new Interaction({
      onDragStart: () => this.handleDragStart(),
      onDragMove: (dx, dy) => this.handleDragMove(dx, dy),
      onDragEnd: (vx, vy) => this.handleDragEnd(vx, vy),
      onPinch: (scale) => this.handlePinch(scale),
      onPointerDown: (x, y) => this.handlePointerDown(x, y),
      onPointerMove: (x, y) => this.handlePointerMove(x, y),
      onPointerUp: () => this.handlePointerUp(),
    })
  }

  async mount(): Promise<void> {
    this.lifecycle.transitionTo('engine')

    const rect = this.canvas!.getBoundingClientRect()
    const dpr = Math.min(window.devicePixelRatio || 1, this.maxDpr)
    this.canvas!.width = rect.width * dpr
    this.canvas!.height = rect.height * dpr
    this.camera.aspect = this.canvas!.width / this.canvas!.height
    const desiredFill = this.camera.aspect < 0.75 ? 0.86 : 0.76
    this.camera.eye[2] = computeCameraDistance(1.2, this.camera.fov, this.camera.aspect, desiredFill)
    this.isMobile = rect.width < 768

    this.backend = await detectBackend()

    if (!this.canvas) return
    this.callbacks.onBackendChosen(this.backend)

    this.renderer = createRendererForCanvas(this.canvas!, this.backend)
    this.renderer.setCamera(this.camera)
    this.interaction.attach(this.canvas!)
    this.scheduler.transitionTo('loading')
  }

  private handleSchedulerStateChange(state: SchedulerState): void {
    if (state === 'active') {
      this.scheduler.wake()
    }
  }

  unmount(): void {
    this.cancelPreviewTimer()
    this.interaction.detach()
    this.scheduler.dispose()
    if (this.renderer) {
      this.renderer.dispose()
      this.renderer = null
    }
    this.textureManager.dispose()
    this.scene.clear()
    this.meshes = []
    this.meshById.clear()
    this.textureHandles.clear()
    this.lifecycle.transitionTo('freed')
    this.canvas = null
  }

  async loadPhotos(manifest: PhotoManifest): Promise<void> {
    this.manifest = manifest
    this.globe = createGlobe()
    this.targetPitch = this.globe.rotX
    this.meshes = []
    this.meshById.clear()
    this.scene.clear()

    this.lifecycle.transitionTo('textures')

    const loadPromises: Promise<void>[] = []
    for (let i = 0; i < manifest.photos.length; i++) {
      const photo = manifest.photos[i]
      loadPromises.push(this.loadTexture(i, photo))
    }

    await Promise.allSettled(loadPromises)
    this.lifecycle.transitionTo('run')
    this.scheduler.transitionTo('active')
  }

  private async loadTexture(index: number, photo: { id: string; src: string }): Promise<void> {
    try {
      const bitmap = await this.textureManager.load(String(index), photo.src)
      if (!this.renderer) return

      const handle = this.renderer.uploadTexture(bitmap)
      this.textureHandles.set(index, handle)

      const mesh = createPhotoMesh(
        photo.id,
        index,
        this.globe.positions[index],
        this.globe.normals[index],
        this.globe.tangents[index],
        this.globe.bitangents[index],
        handle,
        photo.src,
      )
      this.meshes[index] = mesh
      this.meshById.set(mesh.id, mesh)

      this.scene.addNode({
        id: mesh.id,
        position: mesh.transform.position,
        visible: true,
      })
    } catch {
      console.warn(`[Gallery] Texture load failed: index=${index} src=${photo.src}`)
    }
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
      this.userControlling = false
      this.pressedPhotoId = null
      this.previewPhotoSrc = null
      this.previewOrigin = null
      this.isPreviewActive = false
      this.cancelPreviewTimer()
      this.targetGlobeScale = 1.0
      this.scheduler.sleep()
    } else {
      this.scheduler.wake()
    }
  }

  setMaxDpr(dpr: number): void {
    this.maxDpr = dpr
  }

  resize(width: number, height: number): void {
    if (!this.canvas) return
    const dpr = Math.min(window.devicePixelRatio || 1, this.maxDpr)
    this.renderer?.resize(width * dpr, height * dpr)
    this.camera.aspect = (width * dpr) / (height * dpr)
    const desiredFill = this.camera.aspect < 0.75 ? 0.86 : 0.76
    this.camera.eye[2] = computeCameraDistance(1.2, this.camera.fov, this.camera.aspect, desiredFill)
    this.renderer?.setCamera(this.camera)
  }

  private tick(dt: number, time: number): void {
    if (!this.enabled || !this.renderer || this.isLightboxOpen) return
    if (this.motionPolicy === 'static') return

    if (!this.userControlling && !this.isPreviewActive) {
      if (!this.physics.isDragging) {
        const blend = 1 - Math.pow(0.98, dt / 16.667)
        this.currentYawVelocity += (this.IDLE_YAW_SPEED - this.currentYawVelocity) * blend
      }
      this.globe.rotY += this.currentYawVelocity * dt
    }

    const pitchBlend = 1 - Math.pow(PITCH_DECAY, dt / 16.667)
    this.globe.rotX += (this.targetPitch - this.globe.rotX) * pitchBlend

    if (this.physics.isSnapping) {
      const result = updateSnap(this.physics, this.globe.rotX, this.globe.rotY, dt)
      this.globe.rotX = result.x
      this.globe.rotY = result.y
    }

    this.globe.rotX = Math.max(-MAX_PITCH, Math.min(MAX_PITCH, this.globe.rotX))

    this.render(time, dt)
    this.reportStats(time)
  }

  private render(time: number, dt: number): void {
    if (!this.renderer) return

    const scaleBlend = 1 - Math.pow(SCALE_DECAY, dt / 16.667)
    this.globeScale += (this.targetGlobeScale - this.globeScale) * scaleBlend

    this.renderer.setModelRotation(this.globe.rotX, this.globe.rotY)
    this.renderer.beginFrame()

    const visibleNodes = this.scene.getVisibleNodes()
    for (const node of visibleNodes) {
      const mesh = this.meshById.get(node.id)
      if (!mesh) continue

      const basePos = this.globe.positions[mesh.index]
      if (basePos) {
        mesh.transform.position = [
          basePos[0] * this.globeScale,
          basePos[1] * this.globeScale,
          basePos[2] * this.globeScale,
        ]
      }
      mesh.transform.tangent = this.globe.tangents[mesh.index] ?? mesh.transform.tangent
      mesh.transform.bitangent = this.globe.bitangents[mesh.index] ?? mesh.transform.bitangent
      mesh.alpha = computeBackfaceAlpha(mesh.normal, this.globe.rotX, this.globe.rotY)
      mesh.transform.scale = [0.26 * this.globeScale, 0.26 * this.globeScale]

      const targetColor = (this.pressedPhotoId === mesh.id && mesh.alpha > 0.15) ? 1 : 0
      const colorBlend = 1 - Math.pow(COLOR_DECAY, dt / 16.667)
      mesh.colorAmount += (targetColor - mesh.colorAmount) * colorBlend

      this.renderer.drawMesh(mesh)
    }

    this.renderer.endFrame()
    this.lastFrameTime = time
  }

  private reportStats(time: number): void {
    this.frameCount++
    this.fpsAccum += time - this.lastFrameTime

    if (time - this.lastStatsTime >= this.statsThrottleMs) {
      const fps = this.frameCount / (this.fpsAccum / 1000)
      const stats: FrameStats = {
        fps: Math.round(fps),
        drawCalls: this.meshes.length,
        visibleCount: this.scene.getVisibleNodes().length,
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
    if (this.isPreviewActive) {
      this.isPreviewActive = false
      this.callbacks.onPreviewEnd()
    }
    this.cancelPreviewTimer()
    this.pressedPhotoId = null
    this.previewPhotoSrc = null
    this.previewOrigin = null

    this.physics.isDragging = true
    this.physics.velocityX = 0
    this.physics.velocityY = 0
    this.smoothedYawVelocity = 0
    this.lastDragTime = performance.now()
    this.scheduler.wake()
  }

  private handleDragMove(dx: number, dy: number): void {
    if (!this.physics.isDragging) return

    const now = performance.now()
    const dt = Math.max(1, now - this.lastDragTime)
    const rawVelocityX = dx / dt
    const speed = Math.abs(rawVelocityX)

    const t = Math.min(1, speed / 2)
    const multiplier = MIN_SPEED_MULTIPLIER + (MAX_SPEED_MULTIPLIER - MIN_SPEED_MULTIPLIER) * t * t
    const effectiveSensitivity = BASE_YAW_SENSITIVITY * multiplier

    this.globe.rotY += dx * effectiveSensitivity
    this.smoothedYawVelocity += (rawVelocityX * BASE_YAW_SENSITIVITY - this.smoothedYawVelocity) * VELOCITY_SMOOTHING

    this.targetPitch += dy * PITCH_SENSITIVITY
    this.targetPitch = Math.max(-MAX_PITCH, Math.min(MAX_PITCH, this.targetPitch))

    this.lastDragTime = now
  }

  private handleDragEnd(velocityX: number, velocityY: number): void {
    void velocityX
    void velocityY
    this.physics.isDragging = false
    this.userControlling = false
    const clampedVelocity = Math.max(-MAX_THROW_VELOCITY, Math.min(MAX_THROW_VELOCITY, this.smoothedYawVelocity))
    this.currentYawVelocity = clampedVelocity

    this.scheduler.requestIdle()
  }

  private handlePinch(scale: number): void {
    this.scheduler.wake()
    this.targetGlobeScale = Math.max(0.5, Math.min(2.0, this.targetGlobeScale * scale))
  }

  private handlePointerDown(x: number, y: number): void {
    this.userControlling = true
    this.currentYawVelocity = 0
    this.scheduler.wake()

    const picked = this.pickPhoto(x, y)
    if (picked !== null) {
      this.pressedPhotoId = picked
      const mesh = this.meshById.get(picked)
      if (mesh) {
        this.previewPhotoSrc = this.manifest?.photos[mesh.index]?.src ?? null
        this.previewOrigin = this.projectMeshToViewport(mesh)

        // @debug Temporary identity diagnostic — remove after diagnosis
        console.log(
          `PICK CHECK: pickedId=${picked}, meshTextureSource=${mesh.textureSource}, previewSource=${this.previewPhotoSrc}`,
        )
      }
      if (this.isMobile) {
        this.startPreviewTimer(picked)
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- callback signature required by Interaction
  private handlePointerMove(_x: number, _y: number): void {
    // No re-picking. The pressed photo ID is retained from pointerdown.
    // Drag detection is handled by the Interaction class.
  }

  private handlePointerUp(): void {
    if (this.isLightboxOpen) {
      return
    }

    const wasPreview = this.isPreviewActive
    const photoId = this.pressedPhotoId
    const wasDragging = this.physics.isDragging

    this.cancelPreviewTimer()
    this.isPreviewActive = false
    this.pressedPhotoId = null
    this.previewPhotoSrc = null
    this.previewOrigin = null

    if (!wasDragging) {
      this.userControlling = false
      this.currentYawVelocity = 0
    }

    if (wasPreview) {
      this.callbacks.onPreviewEnd()
    } else if (photoId && !wasDragging) {
      this.callbacks.onSelect(photoId)
    }
  }

  private projectMeshToViewport(mesh: PhotoMesh): PreviewStartData['origin'] | null {
    if (!this.canvas || !this.renderer) return null

    const canvasRect = this.canvas.getBoundingClientRect()
    const scaleX = this.canvas.width / canvasRect.width
    const scaleY = this.canvas.height / canvasRect.height

    const proj = new Float32Array(16)
    mat4Perspective(proj, this.camera.fov, this.camera.aspect, this.camera.near, this.camera.far)
    const view = new Float32Array(16)
    mat4LookAt(view, this.camera.eye, this.camera.target, this.camera.up)
    const pv = new Float32Array(16)
    mat4Multiply(pv, proj, view)
    const model = this.buildModelMatrix()

    const result = this.computeCardWorldCorners(mesh, model, pv)
    if (!result) return null

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity
    for (const [sx, sy] of result.screenCorners) {
      minX = Math.min(minX, sx); maxX = Math.max(maxX, sx)
      minY = Math.min(minY, sy); maxY = Math.max(maxY, sy)
    }

    if (minX > maxX) return null

    return {
      x: canvasRect.left + minX / scaleX,
      y: canvasRect.top + minY / scaleY,
      width: (maxX - minX) / scaleX,
      height: (maxY - minY) / scaleY,
    }
  }

  private startPreviewTimer(photoId: string): void {
    this.cancelPreviewTimer()
    this.previewTimer = setTimeout(() => {
      if (this.pressedPhotoId === photoId && !this.physics.isDragging && this.previewOrigin) {
        this.isPreviewActive = true
        this.callbacks.onPreviewStart({
          photoId,
          photoSrc: this.previewPhotoSrc ?? '',
          origin: this.previewOrigin,
        })
      }
    }, PREVIEW_DELAY_MS)
  }

  private cancelPreviewTimer(): void {
    if (this.previewTimer) {
      clearTimeout(this.previewTimer)
      this.previewTimer = null
    }
  }

  private computeCardWorldCorners(
    mesh: PhotoMesh,
    model: Float32Array,
    pv: Float32Array,
  ): { screenCorners: [number, number][]; depth: number } | null {
    if (!this.canvas) return null

    const rotatedCenter = this.transformPoint(mesh.transform.position, model)
    const rotatedTangent = this.transformDirection(mesh.transform.tangent, model)
    const rotatedBitangent = this.transformDirection(mesh.transform.bitangent, model)
    const rotatedNormal = this.transformDirection(
      [
        mesh.transform.tangent[1] * mesh.transform.bitangent[2] - mesh.transform.tangent[2] * mesh.transform.bitangent[1],
        mesh.transform.tangent[2] * mesh.transform.bitangent[0] - mesh.transform.tangent[0] * mesh.transform.bitangent[2],
        mesh.transform.tangent[0] * mesh.transform.bitangent[1] - mesh.transform.tangent[1] * mesh.transform.bitangent[0],
      ],
      model,
    )

    const viewDir = this.normalize([-rotatedCenter[0], -rotatedCenter[1], -rotatedCenter[2]])
    const nLen = Math.sqrt(rotatedNormal[0] ** 2 + rotatedNormal[1] ** 2 + rotatedNormal[2] ** 2) || 1
    const facing = Math.abs(
      (rotatedNormal[0] / nLen) * viewDir[0] +
      (rotatedNormal[1] / nLen) * viewDir[1] +
      (rotatedNormal[2] / nLen) * viewDir[2],
    )
    const tangentBlend = Math.min(0.7, this.smoothstep(0.3, 0.7, 1.0 - facing))

    const billboardRight = this.normalize(this.cross(viewDir, [0, 1, 0]))
    const billboardUp = this.normalize(this.cross(billboardRight, viewDir))
    const blendedRight = this.normalize(this.lerpVec3(billboardRight, rotatedTangent, tangentBlend))
    const blendedUp = this.normalize(this.lerpVec3(billboardUp, rotatedBitangent, tangentBlend))

    const sx = mesh.transform.scale[0]
    const sy = mesh.transform.scale[1]

    const screenCorners: [number, number][] = []
    let allInFront = true

    for (const [cx, cy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
      const worldVertex = [
        rotatedCenter[0] + blendedRight[0] * cx * sx + blendedUp[0] * cy * sy,
        rotatedCenter[1] + blendedRight[1] * cx * sx + blendedUp[1] * cy * sy,
        rotatedCenter[2] + blendedRight[2] * cx * sx + blendedUp[2] * cy * sy,
      ]

      const clip = this.transformPoint4(worldVertex, pv)
      if (clip[3] <= 0) { allInFront = false; break }

      const ndcX = (clip[0] / clip[3]) * 0.5 + 0.5
      const ndcY = (clip[1] / clip[3]) * 0.5 + 0.5
      screenCorners.push([ndcX * this.canvas.width, (1.0 - ndcY) * this.canvas.height])
    }

    if (!allInFront || screenCorners.length !== 4) return null

    const dx = rotatedCenter[0] - this.camera.eye[0]
    const dy = rotatedCenter[1] - this.camera.eye[1]
    const dz = rotatedCenter[2] - this.camera.eye[2]
    const depth = dx * dx + dy * dy + dz * dz

    return { screenCorners, depth }
  }

  private pickPhoto(x: number, y: number): string | null {
    if (!this.canvas || !this.renderer) return null

    const rect = this.canvas.getBoundingClientRect()
    const scaleX = this.canvas.width / rect.width
    const scaleY = this.canvas.height / rect.height
    const canvasX = (x - rect.left) * scaleX
    const canvasY = (y - rect.top) * scaleY

    const proj = new Float32Array(16)
    mat4Perspective(proj, this.camera.fov, this.camera.aspect, this.camera.near, this.camera.far)
    const view = new Float32Array(16)
    mat4LookAt(view, this.camera.eye, this.camera.target, this.camera.up)
    const pv = new Float32Array(16)
    mat4Multiply(pv, proj, view)
    const model = this.buildModelMatrix()

    interface Candidate {
      id: string
      depth: number
      alpha: number
      centerDist: number
      screenCorners: [number, number][]
    }

    const candidates: Candidate[] = []

    for (const mesh of this.meshes) {
      if (mesh.alpha < 0.15) continue

      const result = this.computeCardWorldCorners(mesh, model, pv)
      if (!result) continue

      if (!this.pointInQuad(canvasX, canvasY, result.screenCorners)) continue

      const centerScreenX = (result.screenCorners[0][0] + result.screenCorners[2][0]) / 2
      const centerScreenY = (result.screenCorners[0][1] + result.screenCorners[2][1]) / 2
      const centerDist = (canvasX - centerScreenX) ** 2 + (canvasY - centerScreenY) ** 2

      candidates.push({ id: mesh.id, depth: result.depth, alpha: mesh.alpha, centerDist, screenCorners: result.screenCorners })
    }

    if (candidates.length === 0) return null

    candidates.sort((a, b) => {
      if (a.depth !== b.depth) return a.depth - b.depth
      if (a.alpha !== b.alpha) return b.alpha - a.alpha
      return a.centerDist - b.centerDist
    })

    const winner = candidates[0]

    // @debug Temporary coordinate diagnostic — remove after diagnosis
    console.log(
      `POINTER: client=(${x.toFixed(1)},${y.toFixed(1)}) canvas=(${canvasX.toFixed(1)},${canvasY.toFixed(1)}) scaleX=${scaleX.toFixed(3)} scaleY=${scaleY.toFixed(3)}\n` +
      `HIT: id=${winner.id}\n` +
      `QUAD: [${winner.screenCorners.map(([cx, cy]) => `(${cx.toFixed(1)},${cy.toFixed(1)})`).join(',')}]`,
    )

    return winner.id
  }

  private pointInQuad(px: number, py: number, corners: [number, number][]): boolean {
    if (corners.length !== 4) return false
    return (
      this.pointInTriangle(px, py, corners[0], corners[1], corners[2]) ||
      this.pointInTriangle(px, py, corners[0], corners[2], corners[3])
    )
  }

  private pointInTriangle(
    px: number, py: number,
    a: [number, number], b: [number, number], c: [number, number],
  ): boolean {
    const v0x = c[0] - a[0], v0y = c[1] - a[1]
    const v1x = b[0] - a[0], v1y = b[1] - a[1]
    const v2x = px - a[0], v2y = py - a[1]

    const dot00 = v0x * v0x + v0y * v0y
    const dot01 = v0x * v1x + v0y * v1y
    const dot02 = v0x * v2x + v0y * v2y
    const dot11 = v1x * v1x + v1y * v1y
    const dot12 = v1x * v2x + v1y * v2y

    const denom = dot00 * dot11 - dot01 * dot01
    if (Math.abs(denom) < 1e-10) return false
    const inv = 1 / denom
    const u = (dot11 * dot02 - dot01 * dot12) * inv
    const v = (dot00 * dot12 - dot01 * dot02) * inv

    return u >= 0 && v >= 0 && u + v <= 1
  }

  private buildModelMatrix(): Float32Array {
    const model = new Float32Array(16)
    model[0] = 1; model[5] = 1; model[10] = 1; model[15] = 1

    const cosRx = Math.cos(this.globe.rotX)
    const sinRx = Math.sin(this.globe.rotX)
    const cosRy = Math.cos(this.globe.rotY)
    const sinRy = Math.sin(this.globe.rotY)

    const rx = mat4Identity()
    rx[5] = cosRx; rx[6] = sinRx
    rx[9] = -sinRx; rx[10] = cosRx
    const temp = new Float32Array(16)
    mat4Multiply(temp, model, rx)
    const ry = mat4Identity()
    ry[0] = cosRy; ry[2] = -sinRy
    ry[8] = sinRy; ry[10] = cosRy
    mat4Multiply(model, temp, ry)
    return model
  }

  private transformPoint(p: [number, number, number], m: Float32Array): [number, number, number] {
    return [
      m[0] * p[0] + m[4] * p[1] + m[8] * p[2] + m[12],
      m[1] * p[0] + m[5] * p[1] + m[9] * p[2] + m[13],
      m[2] * p[0] + m[6] * p[1] + m[10] * p[2] + m[14],
    ]
  }

  private transformDirection(d: [number, number, number], m: Float32Array): [number, number, number] {
    return [
      m[0] * d[0] + m[4] * d[1] + m[8] * d[2],
      m[1] * d[0] + m[5] * d[1] + m[9] * d[2],
      m[2] * d[0] + m[6] * d[1] + m[10] * d[2],
    ]
  }

  private transformPoint4(p: number[], m: Float32Array): [number, number, number, number] {
    return [
      m[0] * p[0] + m[4] * p[1] + m[8] * p[2] + m[12],
      m[1] * p[0] + m[5] * p[1] + m[9] * p[2] + m[13],
      m[2] * p[0] + m[6] * p[1] + m[10] * p[2] + m[14],
      m[3] * p[0] + m[7] * p[1] + m[11] * p[2] + m[15],
    ]
  }

  private cross(a: number[], b: number[]): [number, number, number] {
    return [
      a[1] * b[2] - a[2] * b[1],
      a[2] * b[0] - a[0] * b[2],
      a[0] * b[1] - a[1] * b[0],
    ]
  }

  private normalize(v: number[]): [number, number, number] {
    const len = Math.sqrt(v[0] ** 2 + v[1] ** 2 + v[2] ** 2) || 1
    return [v[0] / len, v[1] / len, v[2] / len]
  }

  private lerpVec3(a: number[], b: number[], t: number): [number, number, number] {
    return [
      a[0] + (b[0] - a[0]) * t,
      a[1] + (b[1] - a[1]) * t,
      a[2] + (b[2] - a[2]) * t,
    ]
  }

  private smoothstep(edge0: number, edge1: number, x: number): number {
    const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)))
    return t * t * (3 - 2 * t)
  }
}
