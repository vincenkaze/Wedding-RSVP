import type { Vec3 } from '../core/contract'

export type Quat = [number, number, number, number]

export function quatIdentity(): Quat {
  return [0, 0, 0, 1]
}

export function quatMultiply(a: Quat, b: Quat): Quat {
  return [
    a[3] * b[0] + a[0] * b[3] + a[1] * b[2] - a[2] * b[1],
    a[3] * b[1] - a[0] * b[2] + a[1] * b[3] + a[2] * b[0],
    a[3] * b[2] + a[0] * b[1] - a[1] * b[0] + a[2] * b[3],
    a[3] * b[3] - a[0] * b[0] - a[1] * b[1] - a[2] * b[2],
  ]
}

export function quatFromAxisAngle(axis: Vec3, angle: number): Quat {
  const halfAngle = angle / 2
  const s = Math.sin(halfAngle)
  const len = Math.sqrt(axis[0] * axis[0] + axis[1] * axis[1] + axis[2] * axis[2])
  if (len === 0) return quatIdentity()
  return [
    (axis[0] / len) * s,
    (axis[1] / len) * s,
    (axis[2] / len) * s,
    Math.cos(halfAngle),
  ]
}

export function quatSlerp(a: Quat, b: Quat, t: number): Quat {
  let dot = a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3]
  let bx = b[0], by = b[1], bz = b[2], bw = b[3]

  if (dot < 0) {
    bx = -bx; by = -by; bz = -bz; bw = -bw
    dot = -dot
  }

  if (dot > 0.9995) {
    return [
      a[0] + t * (bx - a[0]),
      a[1] + t * (by - a[1]),
      a[2] + t * (bz - a[2]),
      a[3] + t * (bw - a[3]),
    ]
  }

  const theta = Math.acos(Math.min(dot, 1))
  const sinTheta = Math.sin(theta)
  const wa = Math.sin((1 - t) * theta) / sinTheta
  const wb = Math.sin(t * theta) / sinTheta

  return [
    wa * a[0] + wb * bx,
    wa * a[1] + wb * by,
    wa * a[2] + wb * bz,
    wa * a[3] + wb * bw,
  ]
}

export function quatNormalize(q: Quat): Quat {
  const len = Math.sqrt(q[0] * q[0] + q[1] * q[1] + q[2] * q[2] + q[3] * q[3])
  if (len === 0) return quatIdentity()
  return [q[0] / len, q[1] / len, q[2] / len, q[3] / len]
}

export function quatToAxisAngle(q: Quat): { axis: Vec3; angle: number } {
  const angle = 2 * Math.acos(Math.min(Math.abs(q[3]), 1))
  const s = Math.sqrt(1 - q[3] * q[3])
  if (s < 0.001) return { axis: [0, 1, 0], angle: 0 }
  return {
    axis: [q[0] / s, q[1] / s, q[2] / s],
    angle,
  }
}
