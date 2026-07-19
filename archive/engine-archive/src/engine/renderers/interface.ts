import type { Camera } from '../core/contract'
import type { PhotoMesh } from '../objects/PhotoMesh'
import type { TextureHandle } from '../core/contract'
import type { RendererCapabilities } from '../core/RendererCapabilities'

export interface Renderer {
  initialize(canvas: HTMLCanvasElement): RendererCapabilities
  beginFrame(): void
  endFrame(): void
  resize(width: number, height: number): void
  drawMesh(mesh: PhotoMesh): void
  setCamera(camera: Camera): void
  setModelRotation(rotX: number, rotY: number): void
  uploadTexture(bitmap: ImageBitmap): TextureHandle
  destroyTexture(handle: TextureHandle): void
  dispose(): void
}
