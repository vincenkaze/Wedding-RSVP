import type { BackendType } from './contract'

export interface RendererCapabilities {
  backend: BackendType
  maxTextureSize: number
  supportsMSAA: boolean
  supportsHDR: boolean
  supportsInstancing: boolean
  supportsFloatTextures: boolean
  maxVertexAttributes: number
  maxViewportDims: [number, number]
}

export function detectCapabilities(gl: WebGL2RenderingContext): RendererCapabilities {
  return {
    backend: 'webgl2',
    maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
    supportsMSAA: true,
    supportsHDR: false,
    supportsInstancing: true,
    supportsFloatTextures: false,
    maxVertexAttributes: gl.getParameter(gl.MAX_VERTEX_ATTRIBS),
    maxViewportDims: gl.getParameter(gl.MAX_VIEWPORT_DIMS),
  }
}

export function createDefaultCapabilities(): RendererCapabilities {
  return {
    backend: 'webgl2',
    maxTextureSize: 4096,
    supportsMSAA: true,
    supportsHDR: false,
    supportsInstancing: true,
    supportsFloatTextures: false,
    maxVertexAttributes: 16,
    maxViewportDims: [4096, 4096],
  }
}
