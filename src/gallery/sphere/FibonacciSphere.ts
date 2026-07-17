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

const POLAR_THRESHOLD = 0.75

export function getSelectedAnchors(anchors: Anchor[]): Anchor[] {
  const equatorial = anchors.filter(
    (a) => Math.abs(a.position[1]) <= POLAR_THRESHOLD
  )
  console.log(
    `[Gallery] Polar exclusion: ${anchors.length} → ${equatorial.length} candidates (|y| ≤ ${POLAR_THRESHOLD})`
  )
  const selected = selectMaxMinAnchors(equatorial, SELECTED_COUNT)
  logAngularStats(selected, equatorial.length)

  for (const a of selected) {
    if (Math.abs(a.position[1]) > POLAR_THRESHOLD) {
      console.error(
        `[Gallery] ASSERTION FAILED: anchor at [${a.position[0].toFixed(3)}, ${a.position[1].toFixed(3)}, ${a.position[2].toFixed(3)}] violates polar threshold ${POLAR_THRESHOLD}`
      )
    }
  }
  const maxNormY = Math.max(...selected.map((a) => Math.abs(a.position[1])))
  console.log(`[Gallery] Assertion: max |normalizedY| = ${maxNormY.toFixed(3)} (threshold: ${POLAR_THRESHOLD})`)

  const minX = Math.min(...selected.map((a) => a.position[0]))
  const maxX = Math.max(...selected.map((a) => a.position[0]))
  const minZ = Math.min(...selected.map((a) => a.position[2]))
  const maxZ = Math.max(...selected.map((a) => a.position[2]))
  if (minX >= 0 || maxX <= 0) {
    console.error(`[Gallery] ASSERTION FAILED: X hemisphere span missing (min=${minX.toFixed(3)}, max=${maxX.toFixed(3)})`)
  }
  if (minZ >= 0 || maxZ <= 0) {
    console.error(`[Gallery] ASSERTION FAILED: Z hemisphere span missing (min=${minZ.toFixed(3)}, max=${maxZ.toFixed(3)})`)
  }

  return selected
}

function logAngularStats(selected: Anchor[], eligibleCount: number): void {
  const n = selected.length
  const nearestAngles: number[] = []

  for (let i = 0; i < n; i++) {
    let minAngle = Infinity
    for (let j = 0; j < n; j++) {
      if (i === j) continue
      const dot =
        selected[i].position[0] * selected[j].position[0] +
        selected[i].position[1] * selected[j].position[1] +
        selected[i].position[2] * selected[j].position[2]
      const angle = Math.acos(Math.max(-1, Math.min(1, dot))) * (180 / Math.PI)
      if (angle < minAngle) minAngle = angle
    }
    nearestAngles.push(minAngle)
  }

  const minSep = Math.min(...nearestAngles)
  const maxSep = Math.max(...nearestAngles)
  const avgSep = nearestAngles.reduce((a, b) => a + b, 0) / n

  let posX = 0, negX = 0, posY = 0, negY = 0, posZ = 0, negZ = 0
  let cx = 0, cy = 0, cz = 0
  for (const a of selected) {
    if (a.position[0] >= 0) posX++; else negX++
    if (a.position[1] >= 0) posY++; else negY++
    if (a.position[2] >= 0) posZ++; else negZ++
    cx += a.position[0]
    cy += a.position[1]
    cz += a.position[2]
  }
  cx /= n; cy /= n; cz /= n

  console.log(`[Gallery] Selected ${n} anchors from ${eligibleCount} eligible candidates`)
  console.log(`[Gallery] X hemisphere: ${posX} / ${negX}`)
  console.log(`[Gallery] Y hemisphere: ${posY} / ${negY}`)
  console.log(`[Gallery] Z hemisphere: ${posZ} / ${negZ}`)
  console.log(`[Gallery] Centroid: [${cx.toFixed(3)}, ${cy.toFixed(3)}, ${cz.toFixed(3)}]`)
  console.log(`[Gallery] Angular separation (nearest-neighbor): min=${minSep.toFixed(1)}° avg=${avgSep.toFixed(1)}° max=${maxSep.toFixed(1)}°`)
  console.log(`[Gallery] Selected anchor positions:`)
  for (let i = 0; i < n; i++) {
    const a = selected[i]
    console.log(`  [${i}] idx=${a.index} pos=[${a.position[0].toFixed(3)}, ${a.position[1].toFixed(3)}, ${a.position[2].toFixed(3)}] nearest=${nearestAngles[i].toFixed(1)}°`)
  }
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
