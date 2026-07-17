# Gallery Engine Architecture
Version: 3.1

---

# Philosophy

Gallery Engine is a rendering engine that powers an interactive wedding gallery.

It is NOT a WebGL engine.
It is NOT a WebGPU engine.
It is NOT a React component.

Gallery Engine is a graphics engine.
Rendering APIs are implementation details.

The engine describes WHAT should be rendered. The renderer decides HOW.

---

# Core Principle

The engine should never care HOW pixels reach the screen.
The engine only describes WHAT should be rendered.
The rendering backend decides HOW.

---

# High-Level Architecture

                    React
                      │
                      │
             Gallery Engine
                      │
      ┌───────────────┼───────────────┐
      │               │               │
    Scene         Physics       Interaction
      │               │               │
      └───────────────┼───────────────┘
                      │
                Render API
                      │
        ┌─────────────┴─────────────┐
        │                           │
   WebGL2 Renderer           WebGPU Renderer (stub)

Everything above Render API is platform independent.

---

# Responsibilities

React
- UI
- Routing
- Lightbox
- Accessibility
- Loading
- Canvas mount / unmount

React NEVER performs gallery rendering.

Gallery Engine
- Scene
- Camera
- Globe
- Physics
- Scheduler
- Materials
- Meshes
- Selection
- Input
- Texture management

Gallery Engine NEVER calls WebGL/WebGPU directly.

Renderer
- GPU initialization
- Buffers
- Textures
- Shaders
- Draw calls
- Frame submission

Renderer NEVER contains gallery logic.

---

# Rendering Backends

Supported:
- WebGL2
- WebGPU (stub; not selected at runtime)

Future:
- WebXR
- Headless Renderer
- Offline Screenshot Renderer

All backends implement the same interface.

---

# Renderer Interface

Every renderer MUST implement:

```ts
interface Renderer {
  initialize(canvas: HTMLCanvasElement): RendererCapabilities
  beginFrame(): void
  endFrame(): void
  resize(width: number, height: number): void
  drawMesh(mesh: PhotoMesh): void
  setCamera(camera: Camera): void
  setModelRotation(rotX: number, rotY: number): void
  uploadTexture(bitmap: ImageBitmap): TextureHandle
  destroyTexture(handle: TextureHandle): void
  dispose(): void
}
```

Optional:
```ts
setDebugAnchors?(allAnchors: Vec3[], photoPositions: Vec3[], frontFacingFlags: boolean[]): void
renderDebugDots?(): void
```

No renderer may expose API-specific objects outside this boundary.

---

# Startup Sequence

GalleryEngine.mount()
  ↓
detectBackend() → webgl2
  ↓
createRendererForCanvas(canvas, backend)
  ↓
setCamera(camera)
  ↓
interaction.attach(canvas)
  ↓
scheduler.transitionTo('loading')

loadPhotos(manifest)
  ↓
Promise.allSettled(texture loads)
  ↓
createPhotoMesh for each photo
  ↓
scene.addNode() for each mesh
  ↓
lifecycle.transitionTo('run')
  ↓
scheduler.transitionTo('active')
  ↓
First frame renders automatically

---

# Render Loop

tick()
  ↓
Physics: idle yaw blend / drag velocity / snap
  ↓
globeScale smoothing
  ↓
setModelRotation(rotX, rotY)
  ↓
beginFrame()
  ↓
for each scene.getVisibleNodes():
    lookup mesh by id
    update mesh.transform.position from globe.positions * globeScale
    update mesh.alpha via computeBackfaceAlpha()
    update mesh.colorAmount toward target
    drawMesh(mesh)
  ↓
endFrame()

Sleep/wake controlled by scheduler and interaction.

---

# Scene Graph

SceneNode:
- id
- position
- rotationY (reserved)
- rotationX (reserved)
- visible

Scene owns node visibility culling. Engine maintains mesh↔node identity by id.

Currently only PhotoMesh-backed scene nodes are rendered. Future objects can coexist as long as renderer traversal is id-driven.

---

# Camera

Fixed perspective camera. Never rotates.

Responsive framing:
- `createDefaultCamera(aspect)` → fov, aspect, near, far, eye, target, up
- `computeCameraDistance(sphereRadius, fov, aspect, desiredFill)` → eye.z
- DPR capped at 2

Resize updates aspect + camera distance. Does not change world-space sphere radius.

---

# Globe

Produces:
- `positions[]` — rotated anchor world positions
- `normals[]` — anchor normals
- `tangents[]` / `bitangents[]` — billboard basis vectors
- `rotX`, `rotY` — current rotation state
- `autoRotateSpeed`

Anchor generation:
1. Generate ~120 Fibonacci candidates.
2. Select 17 occupied anchors via max-min angular separation.
3. Normalize to unit sphere, scale by `sphereRadius`.

Orient globe so front hemisphere faces camera by default.

---

# Physics

Owns:
- Angular velocity
- Damping
- Velocity smoothing
- Spring snap

Does not own absolute rotation. Produces incremental rotation changes only.

---

# Interaction

Owns:
- Pointer Events binding
- Pointer capture
- Drag detection threshold
- Gesture intent arbitration (mobile)
- Pinch tracking
- Velocity sampling

Does not own scene state. Calls engine callbacks only.

---

# Texture Manager

Responsibilities:
- Decode source → ImageBitmap
- Upload to GPU via renderer
- Cache by handle
- Reuse

Never uploads during dragging.

---

# Sleep System

Scheduler sleeps when:
- `motionPolicy === 'static'`
- engine disabled
- lightbox open

Scheduler wakes when:
- interaction drag start
- resize
- texture load completes
- lightbox closes
- explicit wake()

Goal: near-zero idle GPU usage.

---

# Memory Philosophy

Allocate reusable buffers once.
Avoid allocations inside tick().
Dispose all GPU resources on unmount.

Allocations inside render loop (to refactor):
- `buildModelMatrix()` allocates new Float32Array each frame.
- `pickPhoto()` allocates proj/view/pv/model matrices per call.
