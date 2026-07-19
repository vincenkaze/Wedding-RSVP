export const FRICTION = 0.92
export const MAX_VELOCITY = 2.2
export const SETTLE_DURATION = 650

const FRAME_MS = 16.667

export function frameDecay(velocity: number, dt: number): number {
  return velocity * Math.pow(FRICTION, dt / FRAME_MS)
}

export interface DragState {
  position: number
  velocity: number
  dragging: boolean
  lastPointerX: number
  lastTime: number
}

export function clampToBounds(position: number, min: number, max: number): number {
  if (min > max) return min
  return Math.min(max, Math.max(min, position))
}

export function createDragState(initialPosition = 0): DragState {
  return {
    position: initialPosition,
    velocity: 0,
    dragging: false,
    lastPointerX: 0,
    lastTime: 0,
  }
}

export function startDrag(state: DragState, pointerX: number, time: number): DragState {
  return {
    ...state,
    dragging: true,
    velocity: 0,
    lastPointerX: pointerX,
    lastTime: time,
  }
}

export function moveDrag(state: DragState, pointerX: number, time: number): DragState {
  if (!state.dragging) return state
  const dt = state.lastTime > 0 ? time - state.lastTime : FRAME_MS
  const delta = pointerX - state.lastPointerX
  const instantaneous = dt > 0 ? (delta / dt) * FRAME_MS : 0
  const velocity = clampVelocity(instantaneous)
  return {
    ...state,
    position: state.position + delta,
    velocity,
    lastPointerX: pointerX,
    lastTime: time,
  }
}

export function endDrag(state: DragState): DragState {
  return {
    ...state,
    dragging: false,
    lastTime: 0,
  }
}

export function clampVelocity(velocity: number): number {
  return Math.min(MAX_VELOCITY, Math.max(-MAX_VELOCITY, velocity))
}

export function stepInertia(state: DragState, dt: number): DragState {
  if (state.dragging) return state
  const velocity = frameDecay(state.velocity, dt)
  if (Math.abs(velocity) < 0.01) {
    return { ...state, velocity: 0, position: state.position + state.velocity }
  }
  return {
    ...state,
    velocity,
    position: state.position + velocity,
  }
}
