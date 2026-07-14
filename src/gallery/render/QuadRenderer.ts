export function createQuadRenderer(canvas: HTMLCanvasElement, imageSrc: string): {
  render(): void
  destroy(): void
  log: string[]
} {
  const log: string[] = []

  function record(msg: string) {
    const entry = `[Quad] ${msg}`
    console.log(entry)
    log.push(entry)
  }

  const gl = canvas.getContext('webgl2', { alpha: true, antialias: false })
  if (!gl) {
    record('ERROR: WebGL2 not available')
    return { render() {}, destroy() {}, log }
  }
  record('WebGL2 context OK')

  // ─── Shaders ───
  const VERT = `#version 300 es
  in vec2 aPos;
  in vec2 aUV;
  out vec2 vUV;
  void main() {
    gl_Position = vec4(aPos, 0.0, 1.0);
    vUV = aUV;
  }`

  const FRAG = `#version 300 es
  precision mediump float;
  in vec2 vUV;
  out vec4 fragColor;
  uniform sampler2D uTex;
  void main() {
    fragColor = texture(uTex, vUV);
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
  if (!vs || !fs) return { render() {}, destroy() {}, log }

  const prog = gl.createProgram()
  if (!prog) return { render() {}, destroy() {}, log }
  gl.attachShader(prog, vs)
  gl.attachShader(prog, fs)
  gl.linkProgram(prog)
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    record(`link FAILED: ${gl.getProgramInfoLog(prog)}`)
    return { render() {}, destroy() {}, log }
  }
  record('program linked OK')

  // ─── Quad geometry: TRIANGLE_STRIP ───
  // position (x,y) + UV (u,v)
  const verts = new Float32Array([
    -0.5,  0.5,  0.0, 0.0,  // top-left
    -0.5, -0.5,  0.0, 1.0,  // bottom-left
     0.5,  0.5,  1.0, 0.0,  // top-right
     0.5, -0.5,  1.0, 1.0,  // bottom-right
  ])

  const vao = gl.createVertexArray()
  const vbo = gl.createBuffer()
  gl.bindVertexArray(vao)
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo)
  gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW)

  const aPos = gl.getAttribLocation(prog, 'aPos')
  const aUV = gl.getAttribLocation(prog, 'aUV')
  gl.enableVertexAttribArray(aPos)
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 16, 0)
  gl.enableVertexAttribArray(aUV)
  gl.vertexAttribPointer(aUV, 2, gl.FLOAT, false, 16, 8)
  gl.bindVertexArray(null)

  record(`aPos=${aPos} aUV=${aUV} — geometry uploaded`)

  // ─── Load one texture ───
  const tex = gl.createTexture()
  let textureReady = false

  const img = new Image()
  img.crossOrigin = 'anonymous'
  img.onload = () => {
    gl.bindTexture(gl.TEXTURE_2D, tex)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    textureReady = true
    record(`image loaded: ${img.naturalWidth}x${img.naturalHeight}`)
  }
  img.onerror = () => record(`FAILED to load: ${imageSrc}`)
  img.src = imageSrc
  record(`loading image: ${imageSrc}`)

  function render() {
    if (!gl) return
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight)
    gl.clearColor(0.98, 0.97, 0.96, 1.0)
    gl.clear(gl.COLOR_BUFFER_BIT)

    if (!textureReady) return

    gl.useProgram(prog)
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, tex)
    gl.uniform1i(gl.getUniformLocation(prog, 'uTex'), 0)

    gl.bindVertexArray(vao)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    gl.bindVertexArray(null)

    const e = gl.getError()
    if (e !== gl.NO_ERROR) record(`gl.getError(): ${e}`)
  }

  function destroy() {
    if (!gl) return
    gl.deleteTexture(tex)
    gl.deleteProgram(prog)
    gl.deleteShader(vs)
    gl.deleteShader(fs)
    gl.deleteVertexArray(vao)
    gl.deleteBuffer(vbo)
    record('destroyed')
  }

  return { render, destroy, log }
}
