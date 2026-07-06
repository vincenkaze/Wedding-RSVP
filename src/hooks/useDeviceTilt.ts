import { useEffect } from 'react'

interface TiltOptions {
  maxDeg?: number
  invertX?: boolean
  invertY?: boolean
}

export function useDeviceTilt({
  maxDeg = 15,
  invertX = false,
  invertY = false,
}: TiltOptions = {}) {
  useEffect(() => {
    const isCoarse = window.matchMedia('(pointer: coarse)').matches
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!isCoarse || reduce) return

    const handler = (e: DeviceOrientationEvent) => {
      if (e.beta == null || e.gamma == null) return
      const x = Math.max(-maxDeg, Math.min(maxDeg, e.gamma)) / maxDeg
      const y = Math.max(-maxDeg, Math.min(maxDeg, e.beta - 30)) / maxDeg
      const tx = (invertX ? -x : x).toFixed(3)
      const ty = (invertY ? -y : y).toFixed(3)
      document.documentElement.style.setProperty('--tiltX', tx)
      document.documentElement.style.setProperty('--tiltY', ty)
    }

    window.addEventListener('deviceorientation', handler, { passive: true })
    return () => {
      window.removeEventListener('deviceorientation', handler)
      document.documentElement.style.setProperty('--tiltX', '0')
      document.documentElement.style.setProperty('--tiltY', '0')
    }
  }, [maxDeg, invertX, invertY])
}
