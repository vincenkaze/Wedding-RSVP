export function createRedRenderer(canvas: HTMLCanvasElement): {
  render(): void
  destroy(): void
  log: string[]
} {
  const log: string[] = []

  function record(msg: string) {
    const entry = `[RedRenderer] ${msg}`
    console.log(entry)
    log.push(entry)
  }

  record(`canvas: ${canvas.width}x${canvas.height}`)

  const gl = canvas.getContext('webgl2', { alpha: true, antialias: false })
  if (!gl) {
    record('ERROR: getContext("webgl2") returned null')
    return { render() {}, destroy() {}, log }
  }
  record('WebGL2 context created')

  const err0 = gl.getError()
  record(`gl.getError() after context: ${err0 === gl.NO_ERROR ? 'NO_ERROR' : err0}`)

  gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight)
  record(`viewport: ${gl.drawingBufferWidth}x${gl.drawingBufferHeight}`)

  gl.clearColor(1, 0, 0, 1)
  record('clearColor set to (1, 0, 0, 1) — red')

  gl.clear(gl.COLOR_BUFFER_BIT)
  record('clear(COLOR_BUFFER_BIT) called')

  const err1 = gl.getError()
  record(`gl.getError() after clear: ${err1 === gl.NO_ERROR ? 'NO_ERROR' : err1}`)

  function render() {
    if (!gl) return
    gl.clearColor(1, 0, 0, 1)
    gl.clear(gl.COLOR_BUFFER_BIT)
    const e = gl.getError()
    if (e !== gl.NO_ERROR) record(`gl.getError() during render: ${e}`)
  }

  function destroy() {
    record('destroy called')
  }

  return { render, destroy, log }
}
