import {
  mat4Identity,
  mat4Multiply,
  mat4Perspective,
  mat4LookAt,
} from '../render/mat4'

export function createDebugRenderer(canvas: HTMLCanvasElement): {
  render(time: number): void
  destroy(): void
  log: string[]
} {
  const log: string[] = []
  function record(msg: string) {
    const entry = `[Debug] ${msg}`
    console.log(entry)
    log.push(entry)
  }

  const gl = canvas.getContext('webgl2', { alpha: true, antialias: false })
  if (!gl) { record('ERROR: no WebGL2'); return { render() {}, destroy() {}, log } }
  record('WebGL2 OK')

  // ─── Shader: CONSTANT GREEN, no texture ───
  const VERT = `#version 300 es
  uniform mat4 uMVP;
  in vec3 aPos;
  void main() {
    gl_Position = uMVP * vec4(aPos, 1.0);
  }`

  const FRAG = `#version 300 es
  precision mediump float;
  out vec4 fragColor;
  void main() {
    fragColor = vec4(0.0, 1.0, 0.0, 1.0);
  }`

  function compile(type: number, label: string): WebGLShader | null {
    const src = type === gl!.VERTEX_SHADER ? VERT : FRAG
    const s = gl!.createShader(type)
    if (!s) return null
    gl!.shaderSource(s, src)
    gl!.compileShader(s)
    if (!gl!.getShaderParameter(s, gl!.COMPILE_STATUS)) {
      record(`${label} FAILED: ${gl!.getShaderInfoLog(s)}`)
      return null
    }
    record(`${label} OK`)
    return s
  }

  const vs = compile(gl.VERTEX_SHADER, 'vert')
  const fs = compile(gl.FRAGMENT_SHADER, 'frag')
  if (!vs || !fs) return { render() {}, destroy() {}, log }

  const prog = gl.createProgram()!
  gl.attachShader(prog, vs)
  gl.attachShader(prog, fs)
  gl.linkProgram(prog)
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    record(`link FAILED: ${gl.getProgramInfoLog(prog)}`)
    return { render() {}, destroy() {}, log }
  }
  record('program OK')

  const uMVP = gl.getUniformLocation(prog, 'uMVP')

  // ─── One quad at origin ───
  // prettier-ignore
  const verts = new Float32Array([
    // x,    y,    z
    -0.5,  0.5,  0.0,  // top-left
    -0.5, -0.5,  0.0,  // bottom-left
     0.5,  0.5,  0.0,  // top-right
     0.5, -0.5,  0.0,  // bottom-right
  ])

  const vao = gl.createVertexArray()
  const vbo = gl.createBuffer()
  gl.bindVertexArray(vao)
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo)
  gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW)

  const aPos = gl.getAttribLocation(prog, 'aPos')
  record(`aPos=${aPos}`)
  gl.enableVertexAttribArray(aPos)
  gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, 0, 0)
  gl.bindVertexArray(null)

  // ─── Matrices ───
  const proj = mat4Identity()
  const view = mat4Identity()
  const model = mat4Identity()
  const mv = mat4Identity()
  const mvp = mat4Identity()

  let logged = false

  function mat4ToStr(m: Float32Array): string {
    return `[${Array.from(m).map((v) => v.toFixed(3)).join(', ')}]`
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function render(_time: number) {
    if (!gl) return
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight)
    gl.clearColor(0.98, 0.97, 0.96, 1.0)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    const aspect = canvas.width / canvas.height

    // Projection: 60° FOV
    mat4Perspective(proj, Math.PI / 3, aspect, 0.1, 100)

    // View: camera at (0, 0, 3) looking at origin
    mat4LookAt(view, [0, 0, 3], [0, 0, 0], [0, 1, 0])

    // Model: identity (no rotation)
    model.set(mat4Identity())

    // MV = View * Model
    mat4Multiply(mv, view, model)

    // MVP = Proj * MV
    mat4Multiply(mvp, proj, mv)

    if (!logged) {
      logged = true
      record(`canvas: ${canvas.width}x${canvas.height} aspect=${aspect.toFixed(3)}`)
      record(`Projection: ${mat4ToStr(proj)}`)
      record(`View:       ${mat4ToStr(view)}`)
      record(`Model:      ${mat4ToStr(model)}`)
      record(`MV:         ${mat4ToStr(mv)}`)
      record(`MVP:        ${mat4ToStr(mvp)}`)

      // Compute clip-space positions for all 4 vertices
      for (let i = 0; i < 4; i++) {
        const x = verts[i * 3 + 0]
        const y = verts[i * 3 + 1]
        const z = verts[i * 3 + 2]
        const w = 1.0

        // MVP * vertex (column-major)
        const cx = mvp[0] * x + mvp[4] * y + mvp[8] * z + mvp[12] * w
        const cy = mvp[1] * x + mvp[5] * y + mvp[9] * z + mvp[13] * w
        const cz = mvp[2] * x + mvp[6] * y + mvp[10] * z + mvp[14] * w
        const cw = mvp[3] * x + mvp[7] * y + mvp[11] * z + mvp[15] * w

        const ndcx = cx / cw
        const ndcy = cy / cw
        const ndcz = cz / cw

        record(
          `v${i} world=(${x},${y},${z}) clip=(${cx.toFixed(3)},${cy.toFixed(3)},${cz.toFixed(3)},${cw.toFixed(3)}) ndc=(${ndcx.toFixed(3)},${ndcy.toFixed(3)},${ndcz.toFixed(3)})`,
        )
      }

      // Also test: bypass MVP entirely
      record('--- BYPASS TEST: rendering with raw positions (no MVP) ---')
    }

    gl.useProgram(prog)

    // ─── PASS 1: With MVP (should show green quad if MVP is correct) ───
    gl.uniformMatrix4fv(uMVP, false, mvp)
    gl.bindVertexArray(vao)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)

    // ─── PASS 2: Without MVP, bypass transform ───
    // Override gl_Position in a separate draw: use identity MVP
    // Actually, just draw at NDC coordinates directly
    // We need a second shader for this. Instead, let's just use identity.
    const ident = mat4Identity()
    gl.uniformMatrix4fv(uMVP, false, ident)
    // Draw a small quad in the bottom-left corner at NDC coords
    // Rebind with NDC-positioned verts
    const ndcVerts = new Float32Array([
      -0.9,  0.7,  0.0,
      -0.9,  0.3,  0.0,
      -0.5,  0.7,  0.0,
      -0.5,  0.3,  0.0,
    ])
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo)
    gl.bufferData(gl.ARRAY_BUFFER, ndcVerts, gl.DYNAMIC_DRAW)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)

    // Restore original verts
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo)
    gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW)

    gl.bindVertexArray(null)
  }

  function destroy() {
    if (!gl) return
    gl.deleteProgram(prog)
    gl.deleteShader(vs)
    gl.deleteShader(fs)
    gl.deleteVertexArray(vao)
    gl.deleteBuffer(vbo)
  }

  return { render, destroy, log }
}
