import type { GalleryItem } from '../../content/content'

interface FloatingPhotoProps {
  item: GalleryItem
  index: number
  onOpen: (index: number) => void
}

const POSITIONS = [
  { left: '5%', top: '8%', width: '28%' },
  { left: '62%', top: '5%', width: '22%' },
  { left: '35%', top: '18%', width: '18%' },
  { left: '72%', top: '25%', width: '20%' },
  { left: '8%', top: '50%', width: '20%' },
  { left: '42%', top: '55%', width: '26%' },
  { left: '75%', top: '58%', width: '18%' },
  { left: '18%', top: '75%', width: '22%' },
  { left: '55%', top: '78%', width: '24%' },
]

export default function FloatingPhoto({ item, index, onOpen }: FloatingPhotoProps) {
  const pos = POSITIONS[index % POSITIONS.length]

  return (
    <button
      type="button"
      onClick={() => onOpen(index)}
      className="floating-photo absolute rounded-lg overflow-hidden border border-accent/15 shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      style={{
        left: pos.left,
        top: pos.top,
        width: pos.width,
        '--rot': `${item.rotation}deg`,
        '--drift-delay': `${(index * 1.3) % 6}s`,
      } as React.CSSProperties}
      aria-label={`View photo: ${item.alt}`}
    >
      <div className="aspect-square w-full overflow-hidden rounded-lg">
        <img
          src={item.src}
          alt={item.alt}
          loading="lazy"
          decoding="async"
          draggable={false}
          className="h-full w-full object-cover"
        />
      </div>
    </button>
  )
}
