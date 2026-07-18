import { generateAnchors, getSelectedAnchors } from '../sphere/FibonacciSphere'
import { mat4Multiply, mat4Perspective, mat4LookAt, mat4Identity, mat4RotateY, mat4RotateX } from './mat4'

interface TextureEntry {
  texture: WebGLTexture
  loaded: boolean
  width: number
  height: number
}

export function createSphereRenderer(canvas: HTMLCanvasElement, imageSrcs: string[]): {
  render(time: number): void
  destroy(): void
  getError(): string | null
  setRotation(rx: number, ry: number): void
  getFrontIndex(): number
  isReady(): boolean
} {
  const gl = canvas.getContext('webgl2', { alpha: true, antialias: true, premultipliedAlpha: true })
  if (!gl) return {
    render() {}, destroy() {}, getError: () => 'WebGL2 not available',
    setRotation() {}, getFrontIndex: () => 0, isReady: () => false,
  }

  // ─── Shaders ───
  const VERT = `#version 300 es
  uniform mat4 uMVP;
  uniform vec3 uPosition;
  uniform vec2 uScale;
  in vec2 aCorner;
  out vec2 vUV;
  void main() {
    vec3 right = vec3(uMVP[0][0], uMVP[1][0], uMVP[2][0]);
    vec3 up = vec3(uMVP[0][1], uMVP[1][1], uMVP[2][1]);
    vec3 center = (uMVP * vec4(uPosition, 1.0)).xyz;
    vec2 c = aCorner;
    vec3 pos = center + right * c.x * uScale.x + up * c.y * uScale.y;
    gl_Position = vec4(pos, 1.0);
    vUV = c * 0.5 + 0.5;
  }`

  const FRAG = `#version 300 es
  precision mediump float;
  in vec2 vUV;
  out vec4 fragColor;
  uniform sampler2D uTex;
  void main() {
    fragColor = texture(uTex, vUV);
  }`

  function compile(type: number, src: string): WebGLShader | null {
    const s = gl!.createShader(type)
    if (!s) return null
    gl!.shaderSource(s, src)
    gl!.compileShader(s)
    if (!gl!.getShaderParameter(s, gl!.COMPILE_STATUS)) {
      console.error('[SphereRenderer] Shader:', gl!.getShaderInfoLog(s))
      gl!.deleteShader(s)
      return null
    }
    return s
  }

  const vs = compile(gl.VERTEX_SHADER, VERT)
  const fs = compile(gl.FRAGMENT_SHADER, FRAG)
  if (!vs || !fs) return {
    render() {}, destroy() {}, getError: () => 'Shader failed',
    setRotation() {}, getFrontIndex: () => 0, isReady: () => false,
  }

  const prog = gl.createProgram()!
  gl.attachShader(prog, vs)
  gl.attachShader(prog, fs)
  gl.linkProgram(prog)
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.error('[SphereRenderer] Link:', gl.getProgramInfoLog(prog))
    return {
      render() {}, destroy() {}, getError: () => 'Link failed',
      setRotation() {}, getFrontIndex: () => 0, isReady: () => false,
    }
  }

  // ─── Quad geometry (unit quad, instanced) ───
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

  // ─── Load textures ───
  const textures: TextureEntry[] = []
  let texturesLoaded = 0

  for (let i = 0; i < imageSrcs.length; i++) {
    const tex = gl.createTexture()!
    textures.push({ texture: tex, loaded: false, width: 0, height: 0 })

    const img = new Image()
    img.crossOrigin = 'anonymous'
    const idx = i
    img.onload = () => {
      gl.bindTexture(gl.TEXTURE_2D, tex)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img)
      gl.generateMipmap(gl.TEXTURE_2D)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      textures[idx].loaded = true
      textures[idx].width = img.naturalWidth
      textures[idx].height = img.naturalHeight
      texturesLoaded++
    }
    img.onerror = () => console.error(`[SphereRenderer] Failed: ${imageSrcs[idx]}`)
    img.src = imageSrcs[i]
  }

  // ─── Compute sphere positions ───
  const anchors = generateAnchors(120)
  const selected = getSelectedAnchors(anchors)
  const sphereRadius = 1.2
  const positions = selected.map((a) => a.position.map((v) => v * sphereRadius) as [number, number, number])

  // ─── State ───
  let rotX = 0.2
  let rotY = 0
  const projMatrix = mat4Identity()
  const viewMatrix = mat4Identity()
  const modelMatrix = mat4Identity()
  const mvpMatrix = mat4Identity()

  let error: string | null = null

  function setRotation(rx: number, ry: number) {
    rotX = rx
    rotY = ry
  }

  function getFrontIndex(): number {
    let maxDot = -Infinity
    let frontIdx = 0
    const viewDir: [number, number, number] = [0, 0, -1]
    const cosRx = Math.cos(-rotX)
    const sinRx = Math.sin(-rotX)
    const cosRy = Math.cos(-rotY)
    const sinRy = Math.sin(-rotY)

    for (let i = 0; i < positions.length; i++) {
      const [px, py, pz] = positions[i]
      const y1 = py * cosRx - pz * sinRx
      const z1 = py * sinRx + pz * cosRx
      const x1 = px * cosRy + z1 * sinRy
      const z2 = -px * sinRy + z1 * cosRy
      const dot = x1 * viewDir[0] + y1 * viewDir[1] + z2 * viewDir[2]
      if (dot > maxDot) {
        maxDot = dot
        frontIdx = i
      }
    }
    return frontIdx
  }

  function isReady() {
    return texturesLoaded >= imageSrcs.length
  }

  // ─── Render ───
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function render(_time: number) {
    if (!gl) return
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight)
    gl.clearColor(0.98, 0.97, 0.96, 1.0)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    if (texturesLoaded === 0) return

    // Projection: perspective
    const aspect = canvas.width / canvas.height
    mat4Perspective(projMatrix, Math.PI / 3, aspect, 0.1, 100)

    // View: camera at (0, 0, 4) looking at origin
    mat4LookAt(viewMatrix, [0, 0, 4], [0, 0, 0], [0, 1, 0])

    // Model: rotate by user drag
    modelMatrix.set(mat4Identity())
    mat4RotateX(modelMatrix, rotX)
    mat4RotateY(modelMatrix, rotY)

    // MVP
    mat4Multiply(mvpMatrix, projMatrix, viewMatrix)
    mat4Multiply(mvpMatrix, mvpMatrix, modelMatrix)

    gl.useProgram(prog)
    gl.enable(gl.DEPTH_TEST)
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

    gl.bindVertexArray(vao)

    const uMVP = gl.getUniformLocation(prog, 'uMVP')
    const uPosition = gl.getUniformLocation(prog, 'uPosition')
    const uScale = gl.getUniformLocation(prog, 'uScale')
    const uTex = gl.getUniformLocation(prog, 'uTex')

    const quadScale: [number, number] = [0.22, 0.22]

    for (let i = 0; i < positions.length; i++) {
      if (!textures[i]?.loaded) continue

      gl.uniformMatrix4fv(uMVP, false, mvpMatrix)
      gl.uniform3fv(uPosition, positions[i])
      gl.uniform2fv(uScale, quadScale)

      gl.activeTexture(gl.TEXTURE0)
      gl.bindTexture(gl.TEXTURE_2D, textures[i].texture)
      gl.uniform1i(uTex, 0)

      gl.drawArrays(gl.TRIANGLES, 0, 6)
    }

    gl.bindVertexArray(null)

    const glErr = gl.getError()
    if (glErr !== gl.NO_ERROR) {
      error = `GL error: ${glErr}`
      console.error('[SphereRenderer]', error)
    }
  }

  function destroy() {
    if (!gl) return
    for (const t of textures) gl.deleteTexture(t.texture)
    gl.deleteProgram(prog)
    gl.deleteShader(vs)
    gl.deleteShader(fs)
    gl.deleteVertexArray(vao)
    gl.deleteBuffer(vbo)
  }

  function getError() { return error }

  return { render, destroy, getError, setRotation, getFrontIndex, isReady }
}
