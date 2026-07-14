import { generateAnchors, getSelectedAnchors } from '../sphere/FibonacciSphere'
import type { Vec3 } from '../sphere/FibonacciSphere'
import {
  mat4Identity,
  mat4Multiply,
  mat4Perspective,
  mat4LookAt,
  mat4RotateY,
  mat4RotateX,
} from '../render/mat4'

interface TextureEntry {
  texture: WebGLTexture
  loaded: boolean
}

export interface GlobeDebugInfo {
  fps: number
  drawCalls: number
  visibleCount: number
  loadedCount: number
  totalCount: number
  rotationY: number
}

export function createGlobeRenderer(
  canvas: HTMLCanvasElement,
  imageSrcs: string[],
  onDebug: (info: GlobeDebugInfo) => void,
): {
  render(time: number): void
  destroy(): void
  log: string[]
  setRotation(rx: number, ry: number): void
} {
  const log: string[] = []
  function record(msg: string) {
    const entry = `[Globe] ${msg}`
    console.log(entry)
    log.push(entry)
  }

  const gl = canvas.getContext('webgl2', {
    alpha: true,
    antialias: true,
    premultipliedAlpha: true,
  })
  if (!gl) {
    record('ERROR: WebGL2 not available')
    return {
      render() {},
      destroy() {},
      log,
      setRotation() {},
    }
  }
  record('WebGL2 context OK')

  // ─── Shaders ───
  // Vertex: MVP transform + pass UV + pass view-space depth for fading
  const VERT = `#version 300 es
  uniform mat4 uMVP;
  uniform vec3 uPosition;
  uniform vec2 uScale;
  uniform float uAlpha;
  in vec2 aCorner;
  out vec2 vUV;
  out float vAlpha;
  void main() {
    // Billboard: extract camera-space right and up from MVP
    vec3 right = vec3(uMVP[0][0], uMVP[1][0], uMVP[2][0]);
    vec3 up = vec3(uMVP[0][1], uMVP[1][1], uMVP[2][1]);
    vec3 center = (uMVP * vec4(uPosition, 1.0)).xyz;
    vec2 c = aCorner;
    vec3 pos = center + right * c.x * uScale.x + up * c.y * uScale.y;
    gl_Position = vec4(pos, 1.0);
    vUV = c * 0.5 + 0.5;
    vAlpha = uAlpha;
  }`

  const FRAG = `#version 300 es
  precision mediump float;
  in vec2 vUV;
  in float vAlpha;
  out vec4 fragColor;
  uniform sampler2D uTex;
  void main() {
    vec4 color = texture(uTex, vUV);
    // Rounded corners
    vec2 uv = vUV * 2.0 - 1.0;
    float radius = 0.12;
    vec2 d = abs(uv) - (1.0 - radius);
    float mask = 1.0 - smoothstep(0.0, radius, length(max(d, 0.0)) - radius);
    color.a *= mask * vAlpha;
    if (color.a < 0.01) discard;
    fragColor = color;
  }`

  function compile(type: number, label: string): WebGLShader | null {
    const src = type === gl!.VERTEX_SHADER ? VERT : FRAG
    const s = gl!.createShader(type)
    if (!s) { record(`createShader(${label}) null`); return null }
    gl!.shaderSource(s, src)
    gl!.compileShader(s)
    if (!gl!.getShaderParameter(s, gl!.COMPILE_STATUS)) {
      record(`compile ${label} FAILED: ${gl!.getShaderInfoLog(s)}`)
      gl!.deleteShader(s)
      return null
    }
    record(`compile ${label} OK`)
    return s
  }

  const vs = compile(gl.VERTEX_SHADER, 'vert')
  const fs = compile(gl.FRAGMENT_SHADER, 'frag')
  if (!vs || !fs) return { render() {}, destroy() {}, log, setRotation() {} }

  const prog = gl.createProgram()
  if (!prog) return { render() {}, destroy() {}, log, setRotation() {} }
  gl.attachShader(prog, vs)
  gl.attachShader(prog, fs)
  gl.linkProgram(prog)
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    record(`link FAILED: ${gl.getProgramInfoLog(prog)}`)
    return { render() {}, destroy() {}, log, setRotation() {} }
  }
  record('program linked OK')

  // Uniforms
  const uMVP = gl.getUniformLocation(prog, 'uMVP')
  const uPosition = gl.getUniformLocation(prog, 'uPosition')
  const uScale = gl.getUniformLocation(prog, 'uScale')
  const uAlpha = gl.getUniformLocation(prog, 'uAlpha')
  const uTex = gl.getUniformLocation(prog, 'uTex')

  // ─── Quad geometry ───
  const corners = new Float32Array([
    -1, -1,  1, -1,  -1, 1,
    -1,  1,  1, -1,   1, 1,
  ])

  const vao = gl.createVertexArray()
  const vbo = gl.createBuffer()
  gl.bindVertexArray(vao)
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo)
  gl.bufferData(gl.ARRAY_BUFFER, corners, gl.STATIC_DRAW)

  const aCorner = gl.getAttribLocation(prog, 'aCorner')
  gl.enableVertexAttribArray(aCorner)
  gl.vertexAttribPointer(aCorner, 2, gl.FLOAT, false, 0, 0)
  gl.bindVertexArray(null)
  record(`aCorner=${aCorner} — geometry uploaded`)

  // ─── Load all 17 textures ───
  const textures: TextureEntry[] = []
  let texturesLoaded = 0

  for (let i = 0; i < imageSrcs.length; i++) {
    const tex = gl.createTexture()!
    textures.push({ texture: tex, loaded: false })

    const img = new Image()
    img.crossOrigin = 'anonymous'
    const idx = i
    img.onload = () => {
      gl.bindTexture(gl.TEXTURE_2D, tex)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      textures[idx].loaded = true
      texturesLoaded++
      record(`texture ${idx} loaded: ${img.naturalWidth}x${img.naturalHeight}`)
    }
    img.onerror = () => record(`FAILED to load: ${imageSrcs[idx]}`)
    img.src = imageSrcs[i]
  }
  record(`loading ${imageSrcs.length} textures`)

  // ─── Sphere positions ───
  const anchors = generateAnchors(120)
  const selected = getSelectedAnchors(anchors)
  const sphereRadius = 1.2
  const positions: Vec3[] = selected.map(
    (a) => [a.position[0] * sphereRadius, a.position[1] * sphereRadius, a.position[2] * sphereRadius],
  )
  const normals: Vec3[] = selected.map((a) => a.normal)
  record(`${positions.length} sphere positions computed`)

  // ─── State ───
  let rotX = 0.15
  let rotY = 0
  const projMatrix = mat4Identity()
  const viewMatrix = mat4Identity()
  const modelMatrix = mat4Identity()
  const mvMatrix = mat4Identity()
  const mvpMatrix = mat4Identity()

  // FPS tracking
  let frameCount = 0
  let lastFpsTime = 0
  let currentFps = 0

  function setRotation(rx: number, ry: number) {
    rotX = rx
    rotY = ry
  }

  // ─── Render ───
  function render(time: number) {
    if (!gl) return

    // FPS
    frameCount++
    if (time - lastFpsTime >= 1000) {
      currentFps = frameCount
      frameCount = 0
      lastFpsTime = time
    }

    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight)
    gl.clearColor(0.98, 0.97, 0.96, 1.0)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    if (texturesLoaded === 0) {
      onDebug({
        fps: currentFps,
        drawCalls: 0,
        visibleCount: 0,
        loadedCount: 0,
        totalCount: imageSrcs.length,
        rotationY: rotY,
      })
      return
    }

    // Auto-rotate
    rotY += 0.003

    // Projection
    const aspect = canvas.width / canvas.height
    mat4Perspective(projMatrix, Math.PI / 3, aspect, 0.1, 100)

    // View: camera at (0, 0, 4) looking at origin
    mat4LookAt(viewMatrix, [0, 0, 4], [0, 0, 0], [0, 1, 0])

    // Model: user rotation
    modelMatrix.set(mat4Identity())
    mat4RotateX(modelMatrix, rotX)
    mat4RotateY(modelMatrix, rotY)

    // MV = View * Model
    mat4Multiply(mvMatrix, viewMatrix, modelMatrix)

    // MVP = Projection * MV
    mat4Multiply(mvpMatrix, projMatrix, mvMatrix)

    gl.useProgram(prog)
    gl.enable(gl.DEPTH_TEST)
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

    gl.bindVertexArray(vao)

    const quadScale: [number, number] = [0.22, 0.22]
    let drawCalls = 0
    let visibleCount = 0

    // Camera direction in world space (for back-face fading)
    // Camera is at (0, 0, 4), looking at origin
    const camDir: Vec3 = [0, 0, -1] // normalized direction from camera to scene

    for (let i = 0; i < positions.length; i++) {
      if (!textures[i]?.loaded) continue

      const pos = positions[i]
      const normal = normals[i]

      // Rotate normal by model matrix (just Y rotation for simplicity)
      const cosRy = Math.cos(rotY)
      const sinRy = Math.sin(rotY)
      const cosRx = Math.cos(rotX)
      const sinRx = Math.sin(rotX)

      // Apply Y rotation
      const nx = normal[0] * cosRy + normal[2] * sinRy
      let nz = -normal[0] * sinRy + normal[2] * cosRy
      let ny = normal[1]

      // Apply X rotation
      const ny2 = ny * cosRx - nz * sinRx
      const nz2 = ny * sinRx + nz * cosRx
      ny = ny2
      nz = nz2

      // Back-face fading: dot(rotatedNormal, cameraDir)
      const dot = nx * camDir[0] + ny * camDir[1] + nz * camDir[2]
      // dot ranges from -1 (facing away) to +1 (facing camera)
      // Map to alpha: front (dot>0) → 1.0, back (dot<0) → 0.25
      const alpha = 0.25 + 0.75 * Math.max(0, dot)

      gl.uniformMatrix4fv(uMVP, false, mvpMatrix)
      gl.uniform3fv(uPosition, pos)
      gl.uniform2fv(uScale, quadScale)
      gl.uniform1f(uAlpha, alpha)

      gl.activeTexture(gl.TEXTURE0)
      gl.bindTexture(gl.TEXTURE_2D, textures[i].texture)
      gl.uniform1i(uTex, 0)

      gl.drawArrays(gl.TRIANGLES, 0, 6)
      drawCalls++
      if (alpha > 0.3) visibleCount++
    }

    gl.bindVertexArray(null)

    const e = gl.getError()
    if (e !== gl.NO_ERROR) record(`gl.getError(): ${e}`)

    onDebug({
      fps: currentFps,
      drawCalls,
      visibleCount,
      loadedCount: texturesLoaded,
      totalCount: imageSrcs.length,
      rotationY: rotY,
    })
  }

  function destroy() {
    if (!gl) return
    for (const t of textures) gl.deleteTexture(t.texture)
    gl.deleteProgram(prog)
    gl.deleteShader(vs)
    gl.deleteShader(fs)
    gl.deleteVertexArray(vao)
    gl.deleteBuffer(vbo)
    record('destroyed')
  }

  return { render, destroy, log, setRotation }
}
