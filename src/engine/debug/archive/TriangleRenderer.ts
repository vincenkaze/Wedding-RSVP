export function createTriangleRenderer(canvas: HTMLCanvasElement): {
  render(): void
  destroy(): void
  log: string[]
} {
  const log: string[] = []

  function record(msg: string) {
    const entry = `[Triangle] ${msg}`
    console.log(entry)
    log.push(entry)
  }

  const gl = canvas.getContext('webgl2', { alpha: true, antialias: false })
  if (!gl) {
    record('ERROR: WebGL2 not available')
    return { render() {}, destroy() {}, log }
  }
  record('WebGL2 context OK')

  // Vertex shader: pass position through unchanged
  const VERT = `#version 300 es
  in vec2 aPos;
  void main() {
    gl_Position = vec4(aPos, 0.0, 1.0);
  }`

  // Fragment shader: solid white
  const FRAG = `#version 300 es
  precision mediump float;
  out vec4 fragColor;
  void main() {
    fragColor = vec4(1.0, 1.0, 1.0, 1.0);
  }`

  function compile(type: number, label: string): WebGLShader | null {
    const src = type === gl!.VERTEX_SHADER ? VERT : FRAG
    const s = gl!.createShader(type)
    if (!s) { record(`createShader(${label}) returned null`); return null }
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
  if (!prog) { record('createProgram returned null'); return { render() {}, destroy() {}, log } }
  gl.attachShader(prog, vs)
  gl.attachShader(prog, fs)
  gl.linkProgram(prog)
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    record(`link FAILED: ${gl.getProgramInfoLog(prog)}`)
    return { render() {}, destroy() {}, log }
  }
  record('program linked OK')

  // Three vertices forming a centered equilateral triangle
  const verts = new Float32Array([
     0.0,  0.5,   // top
    -0.5, -0.5,   // bottom-left
     0.5, -0.5,   // bottom-right
  ])

  const vao = gl.createVertexArray()
  const vbo = gl.createBuffer()
  gl.bindVertexArray(vao)
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo)
  gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW)

  const aPos = gl.getAttribLocation(prog, 'aPos')
  record(`aPos location: ${aPos}`)
  gl.enableVertexAttribArray(aPos)
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)
  gl.bindVertexArray(null)

  record('geometry uploaded')

  function render() {
    if (!gl) return
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight)
    gl.clearColor(1, 0, 0, 1)
    gl.clear(gl.COLOR_BUFFER_BIT)

    gl.useProgram(prog)
    gl.bindVertexArray(vao)
    gl.drawArrays(gl.TRIANGLES, 0, 3)
    gl.bindVertexArray(null)

    const e = gl.getError()
    if (e !== gl.NO_ERROR) record(`gl.getError(): ${e}`)
  }

  function destroy() {
    if (!gl) return
    gl.deleteProgram(prog)
    gl.deleteShader(vs)
    gl.deleteShader(fs)
    gl.deleteVertexArray(vao)
    gl.deleteBuffer(vbo)
    record('destroyed')
  }

  return { render, destroy, log }
}
