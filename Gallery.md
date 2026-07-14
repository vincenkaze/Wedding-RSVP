# M5 — Gallery Engine Implementation

Status: Planned

---

# Purpose

This document defines the implementation of the Gallery Engine.

Unlike `Gallery_design.md`, which describes the vision and architecture of the engine, this document defines the functionality, systems, rendering behaviour, interaction, and performance targets that the gallery must provide.

This is the implementation specification.

---

# Experience Goal

The gallery should feel like a physical object.

Users should instinctively drag it, spin it, and explore it.

The interaction should resemble rotating a floating glass planet made of wedding memories.

Users should never think:

> "This is a carousel."

Instead they should feel:

- depth
- weight
- momentum
- premium quality
- effortless interaction

---

# Rendering

Rendering is performed entirely inside a GPU canvas.

The Gallery Engine does not create DOM elements for photographs.

Every photograph exists as a GPU-rendered object.

Image

↓

Texture

↓

Rounded Plane

↓

Mesh

↓

Rendered by active renderer

The active renderer is automatically selected by the engine.

Possible renderers

- WebGPU Renderer
- WebGL2 Renderer

The gallery behaves identically regardless of the renderer.

---

# Scene

The scene contains

Camera

↓

Globe

↓

Photo Meshes

↓

Particle System

↓

Environment

The camera remains fixed.

The globe rotates.

The user never rotates the camera.

---

# Sphere Layout

Photo positions are generated mathematically.

Use

Fibonacci Sphere Distribution

Generate approximately

120 anchor positions.

Only

17 anchors receive photographs.

The remaining anchors remain available for decorative scene objects.

Each anchor stores

- position
- normal
- rotation
- occupancy

Purpose

- consistent spacing
- premium composition
- scalable layout

---

# Photo Objects

Each photograph is represented by a mesh.

Each mesh contains

Geometry

Material

Texture

Transform

Properties

- position
- rotation
- scale
- opacity
- visibility

Photos should eventually support

- rounded corners
- glass appearance
- metallic border
- Fresnel highlight

---

# Globe Behaviour

The globe is a single scene object.

Every photo is attached to the globe.

Only the globe rotates.

Children inherit transforms automatically.

Rotation must always use quaternions.

Never animate Euler angles.

---

# Camera

Perspective camera.

Always faces the center of the globe.

Never rotates.

Never orbits.

Only projection changes during resize.

---

# Interaction

Primary interaction

Horizontal drag

↓

Rotate globe

Vertical drag

↓

Allow native page scrolling

Gesture detection

If

abs(horizontal movement)

>

abs(vertical movement)

Capture interaction.

Otherwise

Pass input directly to the browser.

Scrolling should always feel native.

---

# Physics

Interaction produces

Angular Velocity

↓

Inertia

↓

Damping

↓

Spring

↓

Final Rotation

The globe never stops instantly.

The movement should feel heavy but responsive.

---

# Magnetic Snap

After user release

Find

photo closest to camera center.

Compute shortest rotational path.

Spring interpolate.

Finish with the selected image perfectly centered.

The snap should feel magnetic rather than mechanical.

---

# Selection

The front-most visible image becomes the active selection.

Selection state is exposed to React.

React controls

- lightbox
- captions
- metadata

The engine only determines which image is selected.

---

# Lightbox

Tap selected image

↓

Pause engine

↓

Open lightbox

↓

Close

↓

Resume engine

The globe resumes from its previous state.

---

# Materials

Photos should eventually support

Glass Material

including

- texture
- opacity
- roughness
- metallic edge
- Fresnel
- soft reflection

Material implementation depends on the renderer.

The visual appearance should remain consistent.

---

# Environment

The scene should contain subtle decorative elements.

Examples

- gold particles
- glowing dust
- petals
- light sprites

These elements should reinforce the feeling of depth without distracting from the photographs.

---

# Particle System

Particles exist inside the same 3D scene.

Preferred implementation

GPU simulation

Fallback implementation

CPU simulation or instanced rendering

Particle behaviour

Idle

↓

Slow drifting

During globe movement

↓

Respond to angular velocity

↓

Subtle orbital motion

Particles should remain secondary to the photographs.

---

# Texture Management

Textures should

Decode

↓

Resize if necessary

↓

Upload once

↓

Cache

↓

Reuse

Never upload textures during interaction.

The renderer chooses the optimal implementation.

Possible techniques include

- texture arrays
- atlases
- bind groups

---

# Visibility

Objects outside the camera view should not be rendered.

Implement

- frustum culling
- back-face culling
- visibility checks

Reduce unnecessary GPU work.

---

# Performance

Performance is a design requirement.

Target

60 FPS minimum

120 Hz where supported

Low CPU usage

Minimal memory allocations

Battery friendly

Near-zero idle GPU usage

---

# Adaptive Quality

The engine automatically selects quality.

Possible adjustments

- bloom
- particle count
- texture resolution
- pixel ratio
- post-processing

The user should never manually select quality.

---

# Render Loop

Each frame

Input

↓

Physics

↓

Scene Update

↓

Visibility

↓

Renderer

↓

Post Processing

↓

Present

Render only while necessary.

Sleep when idle.

---

# Accessibility

Respect

prefers-reduced-motion

Fallback

Responsive photo grid

Disable

- globe rotation
- inertia
- particles

Support

- keyboard navigation
- focus management
- ARIA labels
- screen readers

Accessibility should never be sacrificed for visual effects.

---

# Browser Compatibility

The Gallery Engine automatically selects the best available renderer.

Preferred

WebGPU

Fallback

WebGL2

Final fallback

Responsive CSS gallery

The gallery must remain fully functional on all supported browsers.

---

# Future Features

- Glass materials
- HDR environment lighting
- Gold edge highlights
- GPU particle simulation
- Bloom
- Depth of Field
- Motion blur
- Dynamic reflections
- Image clustering
- Unlimited photo support

These features should enhance the experience without changing the overall interaction model.

---

# Success Criteria

The gallery should disappear behind the experience.

Users should feel as though they are gently rotating a floating globe made of memories.

The interaction should feel smooth, physical, responsive, and effortless.

The renderer should be invisible.

The technology should disappear.

Only the photographs and the interaction should remain.