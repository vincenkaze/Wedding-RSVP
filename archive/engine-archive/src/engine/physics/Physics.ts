const SNAP_SPEED = 8
const SNAP_STOP_THRESHOLD = 0.001

export interface PhysicsState {
  isDragging: boolean
  isSnapping: boolean
  snapTargetX: number | null
  snapTargetY: number | null
}

export function createPhysics(): PhysicsState {
  return {
    isDragging: false,
    isSnapping: false,
    snapTargetX: null,
    snapTargetY: null,
  }
}

export function startSnap(
  state: PhysicsState,
  targetX: number,
  targetY: number,
): void {
  state.isSnapping = true
  state.snapTargetX = targetX
  state.snapTargetY = targetY
}

export function updateSnap(
  state: PhysicsState,
  rotX: number,
  rotY: number,
  dt: number,
): { x: number; y: number; done: boolean } {
  if (!state.isSnapping || state.snapTargetX === null || state.snapTargetY === null) {
    return { x: rotX, y: rotY, done: true }
  }

  const dx = state.snapTargetX - rotX
  let dy = state.snapTargetY - rotY

  if (dy > Math.PI) dy -= 2 * Math.PI
  if (dy < -Math.PI) dy += 2 * Math.PI

  const alpha = 1 - Math.exp(-SNAP_SPEED * dt / 1000)
  const newRotX = rotX + dx * alpha
  const newRotY = rotY + dy * alpha

  const done = Math.abs(dx) < SNAP_STOP_THRESHOLD && Math.abs(dy) < SNAP_STOP_THRESHOLD

  if (done) {
    state.isSnapping = false
    state.snapTargetX = null
    state.snapTargetY = null
    return { x: newRotX, y: newRotY, done: true }
  }

  return { x: newRotX, y: newRotY, done: false }
}
