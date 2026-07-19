import type { GalleryItem } from '../content/content'

export interface EditorialCard {
  id: string
  src: string
  alt: string
  width: number
  height: number
  x: number
  y: number
  rotation: number
  depth: number
}

export interface EditorialLayout {
  cards: EditorialCard[]
  contentWidth: number
  contentHeight: number
}

interface CardSpec {
  w: number
  h: number
  yPercent: number
  rotation: number
  depth: number
}

const SEQUENCE: CardSpec[] = [
  { w: 0.22, h: 0.42, yPercent: 0.30, rotation: -1.2, depth: 1 },
  { w: 0.18, h: 0.56, yPercent: 0.20, rotation: 0.8, depth: 0.97 },
  { w: 0.26, h: 0.48, yPercent: 0.26, rotation: -0.6, depth: 1 },
  { w: 0.15, h: 0.38, yPercent: 0.38, rotation: 1.4, depth: 0.96 },
  { w: 0.30, h: 0.60, yPercent: 0.18, rotation: -0.4, depth: 1 },
  { w: 0.20, h: 0.50, yPercent: 0.24, rotation: 1.0, depth: 0.98 },
  { w: 0.24, h: 0.44, yPercent: 0.32, rotation: -1.0, depth: 1 },
  { w: 0.17, h: 0.54, yPercent: 0.22, rotation: 0.6, depth: 0.97 },
  { w: 0.28, h: 0.46, yPercent: 0.28, rotation: -0.8, depth: 1 },
  { w: 0.19, h: 0.52, yPercent: 0.20, rotation: 1.2, depth: 0.98 },
  { w: 0.25, h: 0.40, yPercent: 0.34, rotation: -1.4, depth: 1 },
  { w: 0.21, h: 0.58, yPercent: 0.18, rotation: 0.4, depth: 0.97 },
  { w: 0.23, h: 0.44, yPercent: 0.30, rotation: -0.6, depth: 1 },
  { w: 0.16, h: 0.50, yPercent: 0.24, rotation: 1.0, depth: 0.96 },
  { w: 0.27, h: 0.42, yPercent: 0.32, rotation: -1.0, depth: 1 },
  { w: 0.20, h: 0.56, yPercent: 0.20, rotation: 0.8, depth: 0.98 },
  { w: 0.24, h: 0.48, yPercent: 0.26, rotation: -0.4, depth: 1 },
]

const GAP = -12

export function buildEditorialLayout(
  items: GalleryItem[],
  viewportWidth: number,
  viewportHeight: number,
): EditorialLayout {
  const cards: EditorialCard[] = []
  let x = 0

  items.forEach((item, index) => {
    const spec = SEQUENCE[index % SEQUENCE.length]
    const cardW = Math.round(viewportWidth * spec.w)
    const cardH = Math.round(viewportHeight * spec.h)
    const yPos = Math.round(viewportHeight * spec.yPercent)

    cards.push({
      id: item.id ?? item.src,
      src: item.src,
      alt: item.alt,
      width: cardW,
      height: cardH,
      x,
      y: yPos,
      rotation: spec.rotation,
      depth: spec.depth,
    })

    x += cardW + GAP
  })

  const contentWidth = Math.max(0, x - GAP)

  const minTop = Math.min(...cards.map((c) => c.y))
  const maxBottom = Math.max(...cards.map((c) => c.y + c.height))
  const contentHeight = maxBottom - minTop
  const verticalOffset = -minTop

  for (const card of cards) {
    card.y += verticalOffset
  }

  return { cards, contentWidth, contentHeight }
}
