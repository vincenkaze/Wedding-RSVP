import { useCallback, useMemo, useState, useEffect } from 'react'
import type { GalleryItem } from '../../content/content'
import EditorialGalleryCard from './EditorialGalleryCard'

interface EditorialGalleryProps {
  items: GalleryItem[]
  onPhotoActivate: (index: number) => void
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
