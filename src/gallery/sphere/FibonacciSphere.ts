export type Vec3 = [number, number, number]

export interface Anchor {
  position: Vec3
  normal: Vec3
  index: number
}

export const TOTAL_ANCHORS = 120
export const SELECTED_COUNT = 17

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5))

export function generateAnchors(count: number = TOTAL_ANCHORS): Anchor[] {
  const anchors: Anchor[] = []

  for (let i = 0; i < count; i++) {
    const y = 1 - (2 * i) / (count - 1)
    const radiusAtY = Math.sqrt(1 - y * y)
    const theta = GOLDEN_ANGLE * i

    const x = Math.cos(theta) * radiusAtY
    const z = Math.sin(theta) * radiusAtY

    const position: Vec3 = [x, y, z]
    const normal: Vec3 = [x, y, z]

    anchors.push({ position, normal, index: i })
  }

  return anchors
}

const POLAR_LIMIT = 0.80

export function getSelectedAnchors(anchors: Anchor[]): Anchor[] {
  const eligible = anchors.filter(
    (a) => Math.abs(a.position[1]) <= POLAR_LIMIT
  )
  return selectMaxMinAnchors(eligible, SELECTED_COUNT)
}

function selectMaxMinAnchors(anchors: Anchor[], count: number): Anchor[] {
  if (anchors.length <= count) return [...anchors]

  const selected: number[] = [0]

  for (let s = 1; s < count; s++) {
    let bestIdx = -1
    let bestMaxDot = Infinity

    for (let i = 0; i < anchors.length; i++) {
      if (selected.includes(i)) continue

      let maxDot = -Infinity
      for (const j of selected) {
        const dot =
          anchors[i].position[0] * anchors[j].position[0] +
          anchors[i].position[1] * anchors[j].position[1] +
          anchors[i].position[2] * anchors[j].position[2]
        if (dot > maxDot) maxDot = dot
      }

      if (maxDot < bestMaxDot) {
        bestMaxDot = maxDot
        bestIdx = i
      }
    }

    if (bestIdx !== -1) {
      selected.push(bestIdx)
    }
  }

  return selected.map((i) => anchors[i])
}

export function vec3Normalize(v: Vec3): Vec3 {
  const len = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2])
  if (len === 0) return [0, 0, 1]
  return [v[0] / len, v[1] / len, v[2] / len]
}

export function vec3Dot(a: Vec3, b: Vec3): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
}

export function vec3Sub(a: Vec3, b: Vec3): Vec3 {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
}

export function vec3Cross(a: Vec3, b: Vec3): Vec3 {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ]
}

export function vec3Scale(v: Vec3, s: number): Vec3 {
  return [v[0] * s, v[1] * s, v[2] * s]
}

export function vec3Lerp(a: Vec3, b: Vec3, t: number): Vec3 {
  return [
    a[0] + (b[0] - a[0]) * t,
    a[1] + (b[1] - a[1]) * t,
    a[2] + (b[2] - a[2]) * t,
  ]
}
