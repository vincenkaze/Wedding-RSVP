import { useEffect, useRef, useState, useCallback } from 'react'

interface GyroState {
  pitch: number
  roll: number
  permissionGranted: boolean
  isSupported: boolean
}

const SPRING_STIFFNESS = 0.08
const DAMPING = 0.85
const TREMOR_FILTER = 0.15

function isGyroSupported(): boolean {
  if (typeof window === 'undefined') return false
  return 'DeviceOrientationEvent' in window
}

async function requestPermission(): Promise<boolean> {
  if (typeof DeviceOrientationEvent !== 'undefined' &&
      typeof (DeviceOrientationEvent as unknown as { requestPermission: () => Promise<string> }).requestPermission === 'function') {
    try {
      const result = await (DeviceOrientationEvent as unknown as { requestPermission: () => Promise<string> }).requestPermission()
      return result === 'granted'
    } catch {
      return false
    }
  }
  return true
}

export function useGyroscope() {
  const [state, setState] = useState<GyroState>({
    pitch: 0,
    roll: 0,
    permissionGranted: false,
    isSupported: isGyroSupported(),
  })

  const velocityRef = useRef({ pitch: 0, roll: 0 })
  const currentRef = useRef({ pitch: 0, roll: 0 })
  const rafRef = useRef<number>(0)
  const rawRef = useRef({ pitch: 0, roll: 0 })
  const hasReading = useRef(false)

  const requestGyroPermission = useCallback(async () => {
    const granted = await requestPermission()
    setState(prev => ({ ...prev, permissionGranted: granted }))
    return granted
  }, [])

  useEffect(() => {
    if (!state.isSupported || !state.permissionGranted) return

    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.beta === null || e.gamma === null) return
      hasReading.current = true
      rawRef.current = {
        pitch: Math.max(-30, Math.min(30, e.beta)) / 30,
        roll: Math.max(-30, Math.min(30, e.gamma)) / 30,
      }
    }

    const tick = () => {
      const target = rawRef.current
      const current = currentRef.current
      const velocity = velocityRef.current

      const dx = target.pitch - current.pitch
      const dy = target.roll - current.roll

      velocity.pitch = (velocity.pitch + dx * SPRING_STIFFNESS) * DAMPING
      velocity.roll = (velocity.roll + dy * SPRING_STIFFNESS) * DAMPING

      current.pitch += velocity.pitch
      current.roll += velocity.roll

      if (Math.abs(current.pitch) < TREMOR_FILTER && Math.abs(velocity.pitch) < 0.01) {
        current.pitch = 0
      }
      if (Math.abs(current.roll) < TREMOR_FILTER && Math.abs(velocity.roll) < 0.01) {
        current.roll = 0
      }

      if (hasReading.current) {
        setState(prev => ({
          ...prev,
          pitch: current.pitch,
          roll: current.roll,
        }))
      }

      rafRef.current = requestAnimationFrame(tick)
    }

    window.addEventListener('deviceorientation', handleOrientation, { passive: true })
    rafRef.current = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation)
      cancelAnimationFrame(rafRef.current)
    }
  }, [state.isSupported, state.permissionGranted])

  return { ...state, requestGyroPermission }
}
