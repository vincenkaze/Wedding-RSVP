import type { SchedulerState } from './contract'

const IDLE_TIMEOUT_MS = 2000

export interface SchedulerCallbacks {
  onTick: (dt: number, time: number) => void
  onStateChange: (state: SchedulerState) => void
}

export class Scheduler {
  private state: SchedulerState = 'boot'
  private rafId = 0
  private lastTime = 0
  private idleTimer: ReturnType<typeof setTimeout> | null = null
  private callbacks: SchedulerCallbacks

  constructor(callbacks: SchedulerCallbacks) {
    this.callbacks = callbacks
  }

  getState(): SchedulerState {
    return this.state
  }

  transitionTo(newState: SchedulerState): void {
    if (this.state === newState) return
    if (this.state === 'disposed') return

    this.state = newState
    this.callbacks.onStateChange(newState)

    if (newState === 'active') {
      this.lastTime = performance.now()
      this.scheduleFrame()
    } else if (newState === 'sleeping' || newState === 'disposed') {
      this.stop()
    }
  }

  wake(): void {
    if (this.state === 'disposed') return
    if (this.state === 'active') {
      this.resetIdleTimer()
      return
    }
    this.transitionTo('active')
  }

  sleep(): void {
    if (this.state === 'disposed') return
    this.transitionTo('sleeping')
  }

  requestIdle(): void {
    if (this.state !== 'active') return
    this.resetIdleTimer()
  }

  private scheduleFrame(): void {
    if (this.state !== 'active') return
    this.rafId = requestAnimationFrame((time) => {
      const dt = Math.min(time - this.lastTime, 50)
      this.lastTime = time
      this.callbacks.onTick(dt, time)
      this.scheduleFrame()
    })
  }

  private resetIdleTimer(): void {
    this.clearIdleTimer()
    if (this.state !== 'active') return
    this.idleTimer = setTimeout(() => {
      this.transitionTo('idle')
    }, IDLE_TIMEOUT_MS)
  }

  private clearIdleTimer(): void {
    if (this.idleTimer !== null) {
      clearTimeout(this.idleTimer)
      this.idleTimer = null
    }
  }

  private stop(): void {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId)
      this.rafId = 0
    }
    this.clearIdleTimer()
  }

  dispose(): void {
    this.stop()
    this.transitionTo('disposed')
  }
}
