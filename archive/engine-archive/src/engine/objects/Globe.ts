import type { Vec3 } from '../core/contract'
import { generateAnchors, getSelectedAnchors } from '../../gallery/sphere/FibonacciSphere'

export const TOTAL_ANCHORS = 120
export const PHOTO_COUNT = 17
export const SPHERE_RADIUS = 1.2

export interface GlobeAnchor {
  position: Vec3
  normal: Vec3
  index: number
}

export interface GlobeState {
  anchors: GlobeAnchor[]
  photoAnchors: GlobeAnchor[]
  positions: Vec3[]
  normals: Vec3[]
  tangents: Vec3[]
  bitangents: Vec3[]
  rotX: number
  rotY: number
  selectedPhotoIndex: number | null
  autoRotateSpeed: number
}

function computeTangentBasis(normal: Vec3): { tangent: Vec3; bitangent: Vec3 } {
  const worldUp: Vec3 = [0, 1, 0]
  const ref = Math.abs(normal[0] * worldUp[0] + normal[1] * worldUp[1] + normal[2] * worldUp[2]) > 0.95
    ? [1, 0, 0] as Vec3
    : worldUp

  const tx = ref[1] * normal[2] - ref[2] * normal[1]
  const ty = ref[2] * normal[0] - ref[0] * normal[2]
  const tz = ref[0] * normal[1] - ref[1] * normal[0]
  const tLen = Math.sqrt(tx * tx + ty * ty + tz * tz) || 1
  const tangent: Vec3 = [tx / tLen, ty / tLen, tz / tLen]

  const bx = normal[1] * tangent[2] - normal[2] * tangent[1]
  const by = normal[2] * tangent[0] - normal[0] * tangent[2]
  const bz = normal[0] * tangent[1] - normal[1] * tangent[0]
  const bLen = Math.sqrt(bx * bx + by * by + bz * bz) || 1
  const bitangent: Vec3 = [bx / bLen, by / bLen, bz / bLen]

  return { tangent, bitangent }
}

export function createGlobe(): GlobeState {
  const anchors = generateAnchors(TOTAL_ANCHORS)
  const photoAnchors = getSelectedAnchors(anchors)

  const positions: Vec3[] = photoAnchors.map(
    (a) => [a.position[0] * SPHERE_RADIUS, a.position[1] * SPHERE_RADIUS, a.position[2] * SPHERE_RADIUS],
  )

  const normals: Vec3[] = photoAnchors.map((a) => [...a.normal] as Vec3)

  const tangents: Vec3[] = []
  const bitangents: Vec3[] = []
  for (const n of normals) {
    const { tangent, bitangent } = computeTangentBasis(n)
    tangents.push(tangent)
    bitangents.push(bitangent)
  }

  let avgZ = 0
  for (const p of positions) avgZ += p[2]
  avgZ /= positions.length

  return {
    anchors,
    photoAnchors,
    positions,
    normals,
    tangents,
    bitangents,
    rotX: 0.22,
    rotY: avgZ < 0 ? Math.PI : 0,
    selectedPhotoIndex: null,
    autoRotateSpeed: 0.003,
  }
}

export function rotateNormal(normal: Vec3, rotX: number, rotY: number): Vec3 {
  const cosRy = Math.cos(rotY)
  const sinRy = Math.sin(rotY)
  const cosRx = Math.cos(rotX)
  const sinRx = Math.sin(rotX)

  const nx = normal[0] * cosRy + normal[2] * sinRy
  let nz = -normal[0] * sinRy + normal[2] * cosRy
  let ny = normal[1]

  const ny2 = ny * cosRx - nz * sinRx
  const nz2 = ny * sinRx + nz * cosRx
  ny = ny2
  nz = nz2

  return [nx, ny, nz]
}

export function computeBackfaceAlpha(normal: Vec3, rotX: number, rotY: number): number {
  const rotated = rotateNormal(normal, rotX, rotY)
  const dot = rotated[2]
  const alpha = -0.08 * dot * dot + 0.60 * dot + 0.78
  return Math.max(0.40, Math.min(1.0, alpha))
}

export function computeDepthScale(position: Vec3, rotX: number, rotY: number, baseScale: number): number {
  const rotated = rotateNormal(position, rotX, rotY)
  const depth = 1 + rotated[2] * 0.15
  return baseScale * Math.max(0.6, Math.min(1.2, depth))
}

export function findFrontPhoto(positions: Vec3[], normals: Vec3[], rotX: number, rotY: number): number {
  let maxDot = -Infinity
  let frontIdx = 0
  const viewDir: Vec3 = [0, 0, -1]

  for (let i = 0; i < positions.length; i++) {
    const rotated = rotateNormal(normals[i], rotX, rotY)
    const dot = rotated[0] * viewDir[0] + rotated[1] * viewDir[1] + rotated[2] * viewDir[2]
    if (dot > maxDot) {
      maxDot = dot
      frontIdx = i
    }
  }
  return frontIdx
}
