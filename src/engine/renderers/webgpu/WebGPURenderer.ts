import type { Renderer } from '../interface'
import type { Camera, TextureHandle } from '../../core/contract'
import type { PhotoMesh } from '../../objects/PhotoMesh'
import type { RendererCapabilities } from '../../core/RendererCapabilities'
import { createDefaultCapabilities } from '../../core/RendererCapabilities'

export class WebGPURenderer implements Renderer {
  private capabilities: RendererCapabilities | null = null
  private camera: Camera = {
    fov: Math.PI / 3,
    aspect: 1,
    near: 0.1,
    far: 100,
    eye: [0, 0, 4],
    target: [0, 0, 0],
    up: [0, 1, 0],
  }

  initialize(canvas: HTMLCanvasElement): RendererCapabilities {
    void canvas
    this.capabilities = {
      ...createDefaultCapabilities(),
      backend: 'webgpu',
    }
    return this.capabilities
  }

  beginFrame(): void {}

  endFrame(): void {}

  resize(width: number, height: number): void {
    void width; void height
  }

  drawMesh(mesh: PhotoMesh): void {
    void mesh
  }

  setCamera(camera: Camera): void {
    this.camera = { ...camera }
  }

  setModelRotation(rotX: number, rotY: number): void {
    void rotX; void rotY
  }

  uploadTexture(bitmap: ImageBitmap): TextureHandle {
    void bitmap
    return 0
  }

  destroyTexture(handle: TextureHandle): void {
    void handle
  }

  dispose(): void {}
}
