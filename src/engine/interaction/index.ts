export interface InteractionCallbacks {
  onDragStart: () => void
  onDragMove: (deltaX: number, deltaY: number) => void
  onDragEnd: (velocityX: number, velocityY: number) => void
  onPinch: (scale: number) => void
  onPointerDown: (x: number, y: number) => void
  onPointerMove: (x: number, y: number) => void
  onPointerUp: () => void
}

const DRAG_THRESHOLD = 8

export class Interaction {
  private canvas: HTMLCanvasElement | null = null
  private callbacks: InteractionCallbacks
  private isDragging = false
  private lastPointerX = 0
  private lastPointerY = 0
  private pointerCount = 0
  private activePointerId: number | null = null
  private lastPinchDistance = 0
  private velocityX = 0
  private velocityY = 0
  private moveHistory: Array<{ x: number; y: number; time: number }> = []
  private pointerStartX = 0
  private pointerStartY = 0

  constructor(callbacks: InteractionCallbacks) {
    this.callbacks = callbacks
  }

  attach(canvas: HTMLCanvasElement): void {
    if (!canvas) return
    this.canvas = canvas
    canvas.style.touchAction = 'none'
    canvas.addEventListener('pointerdown', this.handlePointerDown)
    canvas.addEventListener('pointermove', this.handlePointerMove)
    canvas.addEventListener('pointerup', this.handlePointerUp)
    canvas.addEventListener('pointercancel', this.handlePointerUp)
    canvas.addEventListener('lostpointercapture', this.handlePointerUp)
  }

  detach(): void {
    if (!this.canvas) return
    this.canvas.removeEventListener('pointerdown', this.handlePointerDown)
    this.canvas.removeEventListener('pointermove', this.handlePointerMove)
    this.canvas.removeEventListener('pointerup', this.handlePointerUp)
    this.canvas.removeEventListener('pointercancel', this.handlePointerUp)
    this.canvas.removeEventListener('lostpointercapture', this.handlePointerUp)
    this.canvas = null
  }

  private handlePointerDown = (e: PointerEvent): void => {
    if (!this.canvas) return
    this.pointerCount++

    if (this.pointerCount === 1) {
      this.lastPointerX = e.clientX
      this.lastPointerY = e.clientY
      this.pointerStartX = e.clientX
      this.pointerStartY = e.clientY
      this.isDragging = false
      this.moveHistory = []
      this.velocityX = 0
      this.velocityY = 0
      this.activePointerId = e.pointerId
      this.callbacks.onPointerDown(e.clientX, e.clientY)
    }

    if (this.pointerCount === 2) {
      this.lastPinchDistance = this.getPinchDistance(e)
    }
  }

  private handlePointerMove = (e: PointerEvent): void => {
    if (this.pointerCount === 0) return
    if (e.pointerId !== this.activePointerId) return

    this.callbacks.onPointerMove(e.clientX, e.clientY)

    if (this.pointerCount === 2) {
      const dist = this.getPinchDistance(e)
      if (this.lastPinchDistance > 0) {
        const scale = dist / this.lastPinchDistance
        this.callbacks.onPinch(scale)
      }
      this.lastPinchDistance = dist
      return
    }

    const totalDist = Math.sqrt(
      (e.clientX - this.pointerStartX) ** 2 + (e.clientY - this.pointerStartY) ** 2,
    )

    if (totalDist <= DRAG_THRESHOLD && !this.isDragging) {
      this.lastPointerX = e.clientX
      this.lastPointerY = e.clientY
      return
    }

    const dx = e.clientX - this.lastPointerX
    const dy = e.clientY - this.lastPointerY

    if (!this.isDragging) {
      this.isDragging = true
      this.canvas?.setPointerCapture(e.pointerId)
      this.callbacks.onDragStart()
    }

    const now = performance.now()
    this.moveHistory.push({ x: dx, y: dy, time: now })
    if (this.moveHistory.length > 5) this.moveHistory.shift()

    this.callbacks.onDragMove(dx, dy)

    this.lastPointerX = e.clientX
    this.lastPointerY = e.clientY
  }

  private handlePointerUp = (e: PointerEvent): void => {
    void e
    if (!this.canvas) return

    if (this.activePointerId !== null && this.canvas.hasPointerCapture(this.activePointerId)) {
      this.canvas.releasePointerCapture(this.activePointerId)
    }

    this.pointerCount = Math.max(0, this.pointerCount - 1)

    if (this.pointerCount === 0) {
      this.callbacks.onPointerUp()

      if (this.isDragging) {
        const now = performance.now()
        const recentMoves = this.moveHistory.filter((m) => now - m.time < 100)

        if (recentMoves.length > 0) {
          const totalX = recentMoves.reduce((sum, m) => sum + m.x, 0)
          const totalY = recentMoves.reduce((sum, m) => sum + m.y, 0)
          const first = recentMoves[0]
          const last = recentMoves[recentMoves.length - 1]
          const dt = Math.max(last.time - first.time, 1)
          this.velocityX = totalX / dt * 16
          this.velocityY = totalY / dt * 16
        }

        this.callbacks.onDragEnd(this.velocityX, this.velocityY)
        this.isDragging = false
      }

      this.activePointerId = null
    }

    this.lastPinchDistance = 0
    this.moveHistory = []
  }

  private getPinchDistance(e: PointerEvent): number {
    if (!this.canvas) return 0
    const rect = this.canvas.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const dx = e.clientX - cx
    const dy = e.clientY - cy
    return Math.sqrt(dx * dx + dy * dy)
  }
}
