import type { Mat4 } from '../core/contract'

export interface FrustumPlane {
  x: number
  y: number
  z: number
  w: number
}

export function extractFrustumPlanes(mvp: Mat4): FrustumPlane[] {
  const planes: FrustumPlane[] = []

  // Left
  planes.push({
    x: mvp[3] + mvp[0],
    y: mvp[7] + mvp[4],
    z: mvp[11] + mvp[8],
    w: mvp[15] + mvp[12],
  })

  // Right
  planes.push({
    x: mvp[3] - mvp[0],
    y: mvp[7] - mvp[4],
    z: mvp[11] - mvp[8],
    w: mvp[15] - mvp[12],
  })

  // Bottom
  planes.push({
    x: mvp[3] + mvp[1],
    y: mvp[7] + mvp[5],
    z: mvp[11] + mvp[9],
    w: mvp[15] + mvp[13],
  })

  // Top
  planes.push({
    x: mvp[3] - mvp[1],
    y: mvp[7] - mvp[5],
    z: mvp[11] - mvp[9],
    w: mvp[15] - mvp[13],
  })

  // Near
  planes.push({
    x: mvp[3] + mvp[2],
    y: mvp[7] + mvp[6],
    z: mvp[11] + mvp[10],
    w: mvp[15] + mvp[14],
  })

  // Far
  planes.push({
    x: mvp[3] - mvp[2],
    y: mvp[7] - mvp[6],
    z: mvp[11] - mvp[10],
    w: mvp[15] - mvp[14],
  })

  // Normalize planes
  for (const plane of planes) {
    const len = Math.sqrt(plane.x * plane.x + plane.y * plane.y + plane.z * plane.z)
    if (len > 0) {
      plane.x /= len
      plane.y /= len
      plane.z /= len
      plane.w /= len
    }
  }

  return planes
}

export function isPointInFrustum(planes: FrustumPlane[], x: number, y: number, z: number, radius: number): boolean {
  for (const plane of planes) {
    const dist = plane.x * x + plane.y * y + plane.z * z + plane.w
    if (dist < -radius) return false
  }
  return true
}
