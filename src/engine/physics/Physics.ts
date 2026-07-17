import type { Vec3 } from '../core/contract'

const DAMPING = 0.96
const SPRING_STIFFNESS = 0.08
const SPRING_DAMPING = 0.85
const MIN_VELOCITY = 0.0001

export interface PhysicsState {
  velocityX: number
  velocityY: number
  isDragging: boolean
  isSnapping: boolean
  snapTargetX: number | null
  snapTargetY: number | null
}

export function createPhysics(): PhysicsState {
  return {
    velocityX: 0,
    velocityY: 0,
    isDragging: false,
    isSnapping: false,
    snapTargetX: null,
    snapTargetY: null,
  }
}

export function applyInertia(state: PhysicsState): void {
  if (state.isDragging || state.isSnapping) return

  state.velocityX *= DAMPING
  state.velocityY *= DAMPING

  if (Math.abs(state.velocityX) < MIN_VELOCITY) state.velocityX = 0
  if (Math.abs(state.velocityY) < MIN_VELOCITY) state.velocityY = 0
}

export function startSnap(
  state: PhysicsState,
  targetX: number,
  targetY: number,
): void {
  state.isSnapping = true
  state.snapTargetX = targetX
  state.snapTargetY = targetY
  state.velocityX = 0
  state.velocityY = 0
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

  state.velocityX = state.velocityX * SPRING_DAMPING + dx * SPRING_STIFFNESS
  state.velocityY = state.velocityY * SPRING_DAMPING + dy * SPRING_STIFFNESS

  const newRotX = rotX + state.velocityX * dt
  const newRotY = rotY + state.velocityY * dt

  const done = Math.abs(dx) < 0.001 && Math.abs(dy) < 0.001 &&
    Math.abs(state.velocityX) < MIN_VELOCITY &&
    Math.abs(state.velocityY) < MIN_VELOCITY

  if (done) {
    state.isSnapping = false
    state.snapTargetX = null
    state.snapTargetY = null
    state.velocityX = 0
    state.velocityY = 0
    return { x: state.snapTargetX ?? rotX, y: state.snapTargetY ?? rotY, done: true }
  }

  return { x: newRotX, y: newRotY, done: false }
}

export function findClosestToCenter(
  positions: Vec3[],
  normals: Vec3[],
  rotX: number,
  rotY: number,
): { index: number; position: Vec3 } {
  const viewDir: Vec3 = [0, 0, -1]
  let maxDot = -Infinity
  let bestIdx = 0

  for (let i = 0; i < positions.length; i++) {
    const nx = normals[i][0] * Math.cos(rotY) + normals[i][2] * Math.sin(rotY)
    let nz = -normals[i][0] * Math.sin(rotY) + normals[i][2] * Math.cos(rotY)
    let ny = normals[i][1]
    const ny2 = ny * Math.cos(rotX) - nz * Math.sin(rotX)
    const nz2 = ny * Math.sin(rotX) + nz * Math.cos(rotX)
    ny = ny2
    nz = nz2

    const dot = nx * viewDir[0] + ny * viewDir[1] + nz * viewDir[2]
    if (dot > maxDot) {
      maxDot = dot
      bestIdx = i
    }
  }

  return { index: bestIdx, position: positions[bestIdx] }
}
