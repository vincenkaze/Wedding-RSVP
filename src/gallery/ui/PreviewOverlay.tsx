import { motion } from 'framer-motion'

interface PreviewData {
  photoId: string
  photoSrc: string
  origin: { x: number; y: number; width: number; height: number }
}

interface Props {
  data: PreviewData | null
  closing: boolean
  onCollapseComplete: () => void
}

function getCenterTarget() {
  const vw = typeof window !== 'undefined' ? window.innerWidth : 800
  const vh = typeof window !== 'undefined' ? window.innerHeight : 600
  const size = Math.min(vw * 0.80, vh * 0.80, 560)
  return {
    left: (vw - size) / 2,
    top: (vh - size) / 2,
    width: size,
    height: size,
  }
}

function getOriginTarget(origin: PreviewData['origin']) {
  return {
    left: origin.x,
    top: origin.y,
    width: origin.width,
    height: origin.height,
  }
}

export default function PreviewOverlay({ data, closing, onCollapseComplete }: Props) {
  if (!data) return null

  const center = getCenterTarget()
  const origin = getOriginTarget(data.origin)

  return (
    <>
      <motion.div
        key={`dim-${data.photoId}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: closing ? 0 : 0.4 }}
        exit={{ opacity: 0 }}
        transition={{ type: 'tween', duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: 'fixed',
          inset: 0,
          background: '#000',
          zIndex: 999,
          pointerEvents: 'none',
        }}
      />
      <motion.div
        key={data.photoId}
        initial={origin}
        animate={closing ? origin : center}
        transition={{ type: 'tween', duration: 0.40, ease: [0.22, 1, 0.36, 1] }}
        onAnimationComplete={() => {
          if (closing) onCollapseComplete()
        }}
        style={{
          position: 'fixed',
          borderRadius: 16,
          overflow: 'hidden',
          zIndex: 1000,
          pointerEvents: 'none',
          boxShadow: '0 12px 48px rgba(0,0,0,0.3)',
        }}
      >
        <img
          src={data.photoSrc}
          alt=""
          draggable={false}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </motion.div>
    </>
  )
}
