import { motion } from 'framer-motion'

interface PreviewData {
  photoId: string
  photoSrc: string
  screenRect: { x: number; y: number; width: number; height: number }
}

interface Props {
  data: PreviewData | null
  closing: boolean
  onCollapseComplete: () => void
}

function getRectStyle(rect: { x: number; y: number; width: number; height: number }): React.CSSProperties {
  return {
    position: 'fixed',
    left: rect.x,
    top: rect.y,
    width: rect.width,
    height: rect.height,
    borderRadius: 12,
    overflow: 'hidden',
    zIndex: 1000,
    pointerEvents: 'none',
  }
}

const CENTER_STYLE: React.CSSProperties = {
  position: 'fixed',
  left: '50%',
  top: '50%',
  width: '80vw',
  maxWidth: 560,
  aspectRatio: '1',
  translate: '-50% -50%',
  borderRadius: 16,
  overflow: 'hidden',
  zIndex: 1000,
  pointerEvents: 'none',
}

export default function PreviewOverlay({ data, closing, onCollapseComplete }: Props) {
  if (!data) return null

  return (
    <motion.div
      key={data.photoId}
      initial={CENTER_STYLE}
      animate={closing ? CENTER_STYLE : getRectStyle(data.screenRect)}
      transition={{ type: 'tween', duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      onAnimationComplete={() => {
        if (closing) onCollapseComplete()
      }}
      className="gallery-preview-overlay"
    >
      <img
        src={data.photoSrc}
        alt=""
        draggable={false}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
    </motion.div>
  )
}
