import type { Renderer } from '../renderers/interface'
import type { RendererCapabilities } from './RendererCapabilities'
import type { BackendType } from './contract'
import { WebGL2Renderer } from '../renderers/webgl2/WebGL2Renderer'
import { WebGPURenderer } from '../renderers/webgpu/WebGPURenderer'

export interface RendererFactoryResult {
  renderer: Renderer
  capabilities: RendererCapabilities
  backend: BackendType
}

export async function detectBackend(): Promise<BackendType> {
  return 'webgl2'
}

export function createRendererForCanvas(canvas: HTMLCanvasElement, backend: BackendType): Renderer {
  if (backend === 'webgpu') {
    const renderer = new WebGPURenderer()
    renderer.initialize(canvas)
    return renderer
  }
  const renderer = new WebGL2Renderer()
  renderer.initialize(canvas)
  return renderer
}
