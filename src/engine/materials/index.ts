import type { TextureHandle } from './contract'

export interface MaterialSpec {
  texture: TextureHandle
  opacity: number
  roughness: number
  metallic: number
  fresnel: number
  roundedCorners: boolean
  cornerRadius: number
}

export function createDefaultMaterial(texture: TextureHandle): MaterialSpec {
  return {
    texture,
    opacity: 1,
    roughness: 0.5,
    metallic: 0,
    fresnel: 0.1,
    roundedCorners: true,
    cornerRadius: 0.12,
  }
}
