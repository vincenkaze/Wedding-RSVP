import type { Camera } from '../core/contract'

export function createDefaultCamera(aspect: number): Camera {
  return {
    fov: Math.PI / 3,
    aspect,
    near: 0.1,
    far: 100,
    eye: [0, 0, 4],
    target: [0, 0, 0],
    up: [0, 1, 0],
  }
}

export function getDesiredFill(width: number): number {
  if (width <= 480) return 0.85
  if (width <= 768) return 0.78
  return 0.68
}

export function computeCameraDistance(
  sphereRadius: number,
  fovY: number,
  aspect: number,
  desiredFill: number,
  cardExtent: number,
): number {
  const effectiveRadius = sphereRadius + cardExtent

  const halfFovY = fovY / 2
  const halfFovX = Math.atan(Math.tan(halfFovY) * aspect)

  const distForHeight = effectiveRadius / (desiredFill * Math.tan(halfFovY))
  const distForWidth = effectiveRadius / (desiredFill * Math.tan(halfFovX))

  const d = Math.max(distForHeight, distForWidth)
  return Math.max(2.2, Math.min(6, d))
}

export function updateCameraAspect(camera: Camera, aspect: number): void {
  camera.aspect = aspect
}

export function updateCameraZoom(camera: Camera, zoom: number): void {
  camera.eye[2] = Math.max(2.2, Math.min(6, zoom))
}
