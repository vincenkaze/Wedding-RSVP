import type { Vec2, Vec3, TextureHandle } from '../core/contract'
import type { MaterialSpec } from '../materials'

export interface PhotoMeshGeometry {
  corners: Float32Array
  uvs: Float32Array
}

export interface PhotoMeshTransform {
  position: Vec3
  tangent: Vec3
  bitangent: Vec3
  scale: Vec2
}

export interface PhotoMesh {
  id: string
  index: number
  geometry: PhotoMeshGeometry
  material: MaterialSpec
  transform: PhotoMeshTransform
  normal: Vec3
  alpha: number
  colorAmount: number
  visible: boolean
}

const QUAD_CORNERS = new Float32Array([
  -1, -1,  1, -1,  -1, 1,
  -1,  1,  1, -1,   1, 1,
])

const QUAD_UVS = new Float32Array([
  0, 0,  1, 0,  0, 1,
  0, 1,  1, 0,  1, 1,
])

export function createPhotoMesh(
  id: string,
  index: number,
  position: Vec3,
  normal: Vec3,
  tangent: Vec3,
  bitangent: Vec3,
  texture: TextureHandle,
): PhotoMesh {
  return {
    id,
    index,
    geometry: {
      corners: QUAD_CORNERS,
      uvs: QUAD_UVS,
    },
    material: {
      texture,
      opacity: 1,
      roughness: 0.5,
      metallic: 0,
      fresnel: 0.1,
      roundedCorners: true,
      cornerRadius: 0.12,
    },
    transform: {
      position,
      tangent,
      bitangent,
      scale: [0.22, 0.22],
    },
    normal,
    alpha: 1,
    colorAmount: 0,
    visible: true,
  }
}
