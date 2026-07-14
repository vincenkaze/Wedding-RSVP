# Gallery Engine Architecture
Version: 3.0

---

# Philosophy

Gallery Engine is a rendering engine that powers an interactive wedding gallery.

It is NOT a WebGL engine.

It is NOT a WebGPU engine.

It is NOT a React component.

Gallery Engine is a graphics engine.

Rendering APIs are implementation details.

---

# Design Goals

- Rendering backend independent
- Mobile-first
- Battery efficient
- High FPS
- Future-proof
- Easy to extend
- Engine-first architecture

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
        ┌─────────────────┼─────────────────┐
        │                 │                 │
      Scene            Physics        Interaction
        │                 │                 │
        └─────────────────┼─────────────────┘
                          │
                    Render API
                          │
          ┌───────────────┴───────────────┐
          │                               │
    WebGL2 Renderer                 WebGPU Renderer

Everything above Render API is platform independent.

---

# Responsibilities

React

Owns

- UI
- Routing
- Lightbox
- Accessibility
- Loading

React NEVER performs rendering.

---

Gallery Engine

Owns

- Scene
- Camera
- Globe
- Physics
- Scheduler
- Materials
- Meshes
- Selection
- Input

Gallery Engine NEVER calls WebGL directly.

---

Renderer

Owns

- GPU initialization
- Buffers
- Textures
- Shaders
- Draw calls
- Frame submission

Renderer NEVER contains gallery logic.

---

# Rendering Backends

Supported

- WebGPU
- WebGL2

Future

- WebXR
- Headless Renderer
- Offline Screenshot Renderer

All backends implement the same interface.

---

# Renderer Interface

Every renderer MUST implement

initialize()

beginFrame()

endFrame()

resize()

createMesh()

destroyMesh()

uploadTexture()

destroyTexture()

drawMesh()

setCamera()

dispose()

No renderer may expose API-specific objects.

---

# Startup Sequence

Application Starts

↓

Create Gallery Engine

↓

Detect Browser Capabilities

↓

Is WebGPU Supported?

↓

YES

↓

Attempt WebGPU Initialization

↓

Success?

↓

YES

↓

Use WebGPU Renderer

↓

NO

↓

Fallback

↓

Create WebGL2 Renderer

↓

Continue

The user should never notice.

---

# Renderer Selection

Priority

1. WebGPU
2. WebGL2

Never fail unless neither renderer exists.

---

# Engine Startup

Initialize Engine

↓

Create Renderer

↓

Create Scene

↓

Create Camera

↓

Create Globe

↓

Generate Sphere

↓

Load Textures

↓

Upload GPU Resources

↓

Begin Rendering

---

# Scene Graph

Scene

└── Globe

     ├── Photo
     ├── Photo
     ├── Photo
     ├── Particle System
     └── Future Objects

Only Globe rotates.

Everything else follows automatically.

---

# Render Loop

Frame

↓

Input

↓

Physics

↓

Update Scene

↓

Visibility

↓

Renderer.beginFrame()

↓

Renderer.draw()

↓

Renderer.endFrame()

↓

Sleep if Idle

Every frame follows this order.

---

# Sleep System

Renderer sleeps when

- no dragging
- no inertia
- no snapping
- no animations
- no particles

Renderer wakes when

- pointer moves
- resize
- texture upload
- lightbox closes

Goal

Near-zero idle GPU usage.

---

# Engine Modules

Engine

├── Scene
├── Camera
├── Renderer
├── Scheduler
├── Globe
├── Texture Manager
├── Material System
├── Physics
├── Interaction
├── Debug
└── Post Processing

Each module should be replaceable.

---

# Scene

Owns

- Objects
- Hierarchy
- Visibility

Scene knows nothing about WebGL.

---

# Camera

Owns

- Projection Matrix
- View Matrix
- Frustum

Camera never rotates.

The Globe rotates.

---

# Globe

Owns

- Sphere Layout
- Rotation
- Selection
- Photo Anchors

Globe contains no rendering code.

---

# Physics

Owns

- Angular Velocity
- Inertia
- Damping
- Spring Snap

Physics only produces transforms.

Never render.

---

# Interaction

Owns

- Pointer Input
- Drag Detection
- Gesture Recognition

Interaction never modifies GPU resources.

---

# Texture Manager

Responsibilities

Decode

↓

Resize

↓

Upload

↓

Cache

↓

Reuse

Never upload textures during dragging.

---

# Material System

Every material contains

- Texture
- Opacity
- Roughness
- Metalness
- Fresnel
- Border

Renderer decides how these are implemented.

---

# Mesh

A Mesh consists of

Geometry

+

Material

+

Transform

Mesh contains no renderer-specific code.

---

# Memory Philosophy

Allocate once.

Reuse forever.

Never allocate inside the render loop.

Reuse

- vectors
- matrices
- quaternions
- arrays
- buffers

Avoid garbage collection.

---

# Quality System

Detect

↓

GPU

↓

Memory

↓

Refresh Rate

↓

Select Quality

Never ask the user.

---

# Quality Levels

Ultra

- WebGPU
- HDR
- Bloom
- Glass Materials
- High Particle Count

High

- WebGPU
- Bloom
- Standard Particles

Medium

- WebGL2
- Reduced Bloom
- Fewer Particles

Low

- WebGL2
- Minimal Effects
- Lower DPR

Experience remains identical.

Only visual fidelity changes.

---

# Future Renderer Features

WebGPU

- Compute Shaders
- GPU Particle Simulation
- HDR Pipeline
- Advanced PBR
- Better Bloom
- GPU Culling

WebGL2

- Standard Rendering
- CPU Particle Simulation
- Simplified Effects

Feature parity should remain as close as possible.

---

# Folder Structure

src/

gallery/

engine/

    Engine.ts

    Scene.ts

    Camera.ts

    Scheduler.ts

    Renderer.ts        (Interface)

renderers/

    WebGL2Renderer.ts

    WebGPURenderer.ts

objects/

    Globe.ts

    Photo.ts

    ParticleSystem.ts

materials/

    Material.ts

    GlassMaterial.ts

geometry/

    RoundedPlane.ts

    SphereDistribution.ts

physics/

    Inertia.ts

    Spring.ts

interaction/

    PointerController.ts

textures/

    TextureManager.ts

math/

    Vector2.ts

    Vector3.ts

    Matrix4.ts

    Quaternion.ts

debug/

    DebugOverlay.ts

shaders/

    webgl/

    webgpu/

---

# Guiding Rule

If a module imports

WebGLRenderingContext

or

GPUDevice

outside the renderer,

the architecture has been violated.

Only renderers may speak directly to the graphics API.

---

# Long-Term Vision

The engine should eventually support

React
      │
      ▼
Gallery Engine
      │
      ▼
Renderer Interface
      │
 ┌────┴───────────────┐
 │                    │
WebGL2          WebGPU
 │                    │
 └──────Same Experience──────┘

Changing the renderer should never require changes to

- Physics
- Globe
- Scene
- Camera
- Interaction
- Materials

Only the renderer changes.

---

# Success Criteria

A user opens the website.

The engine silently chooses the best renderer.

If WebGPU is available,
it uses WebGPU.

If not,
it automatically falls back to WebGL2.

The experience remains smooth,
beautiful,
responsive,
and visually consistent.

The user never knows which renderer was chosen.

That is the hallmark of a well-designed rendering engine.