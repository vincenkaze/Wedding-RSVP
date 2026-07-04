export interface ScatterPosition {
  leftPct: number
  topPct: number
  rotation: number
  scale: number
}

// Simple seeded PRNG (mulberry32)
function mulberry32(seed: number): () => number {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

interface ScatterBounds {
  leftMin: number
  leftMax: number
  topMin: number
  topMax: number
  minRotation: number
  maxRotation: number
  minScale: number
  maxScale: number
}

// Percentage-based bounds: photos spread across canvas area
const MOBILE: ScatterBounds = {
  leftMin: 5,
  leftMax: 55,
  topMin: 5,
  topMax: 65,
  minRotation: -5,
  maxRotation: 5,
  minScale: 0.88,
  maxScale: 1.05,
}

const TABLET: ScatterBounds = {
  leftMin: 5,
  leftMax: 60,
  topMin: 5,
  topMax: 60,
  minRotation: -6,
  maxRotation: 6,
  minScale: 0.88,
  maxScale: 1.1,
}

const DESKTOP: ScatterBounds = {
  leftMin: 3,
  leftMax: 62,
  topMin: 3,
  topMax: 58,
  minRotation: -7,
  maxRotation: 7,
  minScale: 0.92,
  maxScale: 1.12,
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

function pickBounds(width: number): ScatterBounds {
  if (width < 640) return MOBILE
  if (width < 1025) return TABLET
  return DESKTOP
}

export function getScatterPositions(
  count: number,
  containerWidth: number,
): ScatterPosition[] {
  const bounds = pickBounds(containerWidth)
  const positions: ScatterPosition[] = []

  for (let i = 0; i < count; i++) {
    const rand = mulberry32(i * 1337 + 42)

    positions.push({
      leftPct: lerp(bounds.leftMin, bounds.leftMax, rand()),
      topPct: lerp(bounds.topMin, bounds.topMax, rand()),
      rotation: lerp(bounds.minRotation, bounds.maxRotation, rand()),
      scale: lerp(bounds.minScale, bounds.maxScale, rand()),
    })
  }

  return positions
}
