export interface ScatterPosition {
  x: number
  y: number
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

interface ViewportBounds {
  minX: number
  maxX: number
  minY: number
  maxY: number
  minRotation: number
  maxRotation: number
  minScale: number
  maxScale: number
}

const MOBILE: ViewportBounds = {
  minX: -20,
  maxX: 20,
  minY: -10,
  maxY: 30,
  minRotation: -4,
  maxRotation: 4,
  minScale: 0.85,
  maxScale: 1.05,
}

const TABLET: ViewportBounds = {
  minX: -30,
  maxX: 30,
  minY: -20,
  maxY: 40,
  minRotation: -6,
  maxRotation: 6,
  minScale: 0.85,
  maxScale: 1.1,
}

const DESKTOP: ViewportBounds = {
  minX: -60,
  maxX: 60,
  minY: -30,
  maxY: 50,
  minRotation: -8,
  maxRotation: 8,
  minScale: 0.9,
  maxScale: 1.15,
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

function getBoundsForItem(
  index: number,
  total: number,
): ViewportBounds {
  // Interpolate based on index spread across items
  const t = total <= 1 ? 0.5 : index / (total - 1)

  if (t < 0.33) return MOBILE
  if (t < 0.66) return TABLET
  return DESKTOP
}

export function getScatterPositions(count: number): ScatterPosition[] {
  const positions: ScatterPosition[] = []

  for (let i = 0; i < count; i++) {
    const rand = mulberry32(i * 1337 + 42)
    const bounds = getBoundsForItem(i, count)

    positions.push({
      x: lerp(bounds.minX, bounds.maxX, rand()),
      y: lerp(bounds.minY, bounds.maxY, rand()),
      rotation: lerp(bounds.minRotation, bounds.maxRotation, rand()),
      scale: lerp(bounds.minScale, bounds.maxScale, rand()),
    })
  }

  return positions
}

// Get responsive scatter positions based on container width
export function getResponsiveScatterPositions(
  count: number,
  containerWidth: number,
): ScatterPosition[] {
  const positions: ScatterPosition[] = []

  for (let i = 0; i < count; i++) {
    const rand = mulberry32(i * 1337 + 42)

    let bounds: ViewportBounds

    if (containerWidth < 640) {
      bounds = MOBILE
    } else if (containerWidth < 1025) {
      bounds = TABLET
    } else {
      bounds = DESKTOP
    }

    positions.push({
      x: lerp(bounds.minX, bounds.maxX, rand()),
      y: lerp(bounds.minY, bounds.maxY, rand()),
      rotation: lerp(bounds.minRotation, bounds.maxRotation, rand()),
      scale: lerp(bounds.minScale, bounds.maxScale, rand()),
    })
  }

  return positions
}
