export type Vec2 = [number, number]
export type Vec3 = [number, number, number]
export type Vec4 = [number, number, number, number]
export type Mat4 = Float32Array
export type TextureHandle = number

export type BackendType = 'webgpu' | 'webgl2'
export type MotionPolicy = 'full' | 'reduced' | 'static'
export type SchedulerState = 'boot' | 'loading' | 'active' | 'idle' | 'sleeping' | 'disposed'

export interface PhotoManifest {
  photos: PhotoEntry[]
  sphereRadius: number
}

export interface PhotoEntry {
  id: string
  src: string
  alt: string
  position: Vec3
  normal: Vec3
}

export interface FrameStats {
  fps: number
  drawCalls: number
  visibleCount: number
  loadedCount: number
  totalCount: number
}

export interface EngineCallbacks {
  onHover: (photoId: string | null) => void
  onActivePhotoChange: (photoId: string | null) => void
  onPhotoHold: (photoId: string) => void
  onFrame: (stats: FrameStats) => void
  onBackendChosen: (backend: BackendType) => void
  onError: (error: Error) => void
}

export interface Camera {
  fov: number
  aspect: number
  near: number
  far: number
  eye: Vec3
  target: Vec3
  up: Vec3
}

export interface SceneNode {
  id: string
  position: Vec3
  visible: boolean
}
