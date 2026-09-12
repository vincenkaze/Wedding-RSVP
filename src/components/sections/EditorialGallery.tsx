import { useCallback, useMemo, useState, useEffect } from 'react'
import type { GalleryItem } from '../../content/content'
import EditorialGalleryCard from './EditorialGalleryCard'

interface EditorialGalleryProps {
  items: GalleryItem[]
  onPhotoActivate: (index: number) => void
}

interface GalleryCell {
  item: GalleryItem
  index: number
}

function spanHeight(item: GalleryItem): number {
  return item.span === 'tall' ? 4 / 3 : item.span === 'wide' ? 10 / 16 : 1
}

// Mobile segments: non-wide photos flow into paired 2-col blocks, while
// `wide` photos break out as full-bleed cinematic rows between them.
interface MobileSegment {
  type: 'cols' | 'wide'
  cells: GalleryCell[]
}

function buildMobileSegments(items: GalleryItem[]): MobileSegment[] {
  const segments: MobileSegment[] = []
  let acc: GalleryCell[] = []
  const flush = () => {
    if (acc.length > 0) {
      segments.push({ type: 'cols', cells: acc })
      acc = []
    }
  }
  items.forEach((item, index) => {
    if (item.span === 'wide') {
      flush()
      segments.push({ type: 'wide', cells: [{ item, index }] })
    } else {
      acc.push({ item, index })
    }
  })
  flush()
  return segments
}

function splitPair(cells: GalleryCell[]): GalleryCell[][] {
  const cols: GalleryCell[][] = [[], []]
  const heights = [0, 0]
  for (const cell of cells) {
    const ci = heights[0] <= heights[1] ? 0 : 1
    cols[ci].push(cell)
    heights[ci] += spanHeight(cell.item)
  }
  return cols
}

export default function EditorialGallery({
  items,
  onPhotoActivate,
}: EditorialGalleryProps) {
  const [isDesktop, setIsDesktop] = useState(
    () => window.matchMedia('(min-width: 1024px)').matches,
  )

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const columnCount = isDesktop ? 3 : 2

  const columns = useMemo(() => {
    const cols: Array<Array<{ item: GalleryItem; index: number }>> = Array.from({ length: columnCount }, () => [])
    const heights = new Array(columnCount).fill(0)

    items.forEach((item, index) => {
      const minHeight = Math.min(...heights)
      const columnIndex = heights.indexOf(minHeight)
      cols[columnIndex].push({ item, index })
      heights[columnIndex] +=
        item.span === 'tall' ? 4 / 3 : item.span === 'wide' ? 10 / 16 : 1
    })

    return cols
  }, [items, columnCount])

  const handleActivate = useCallback(
    (index: number) => onPhotoActivate(index),
    [onPhotoActivate],
  )

  const mobileSegments = useMemo(() => buildMobileSegments(items), [items])

  function renderCard({ item, index }: GalleryCell) {
    return (
      <EditorialGalleryCard
        item={item}
        index={index}
        totalItems={items.length}
        onActivate={handleActivate}
      />
    )
  }

  // Phones: paired columns interrupted by full-width wide rows.
  if (!isDesktop) {
    return (
      <div className="gallery-stack" role="list" aria-label="Photo gallery">
        {mobileSegments.map((seg, segIndex) =>
          seg.type === 'wide' ? (
            <div
              key={seg.cells[0].item.id}
              className="gallery-grid-cell"
              data-span="wide"
              role="listitem"
            >
              {renderCard(seg.cells[0])}
            </div>
          ) : (
            <div
              key={`seg-${segIndex}`}
              className="gallery-grid gallery-grid--nested"
            >
              {splitPair(seg.cells).map((column, columnIndex) => (
                <div
                  key={`seg-${segIndex}-col-${columnIndex}`}
                  className="gallery-masonry-column"
                >
                  {column.map((cell) => (
                    <div
                      key={cell.item.id}
                      className="gallery-grid-cell"
                      data-span={cell.item.span}
                      role="listitem"
                    >
                      {renderCard(cell)}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ),
        )}
      </div>
    )
  }

  return (
    <div className="gallery-grid" role="list" aria-label="Photo gallery">
      {columns.map((column, columnIndex) => (
        <div key={`col-${columnIndex}`} className="gallery-masonry-column">
          {column.map(({ item, index }) => (
            <div
              key={item.id}
              className="gallery-grid-cell"
              data-span={item.span}
              role="listitem"
            >
              <EditorialGalleryCard
                item={item}
                index={index}
                totalItems={items.length}
                onActivate={handleActivate}
              />
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
