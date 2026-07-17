import type { Renderer } from '../interface'
import type { Camera, Mat4, TextureHandle } from '../../core/contract'
import type { PhotoMesh } from '../../objects/PhotoMesh'
import type { RendererCapabilities } from '../../core/RendererCapabilities'
import { detectCapabilities } from '../../core/RendererCapabilities'
import { mat4Identity, mat4Multiply, mat4Perspective, mat4LookAt } from '../../math/mat4'

interface TextureEntry {
  texture: WebGLTexture
}

const BILLBOARD_VERT = `#version 300 es
uniform mat4 uProjection;
uniform mat4 uView;
uniform mat4 uModel;
uniform vec3 uPosition;
uniform vec3 uTangent;
uniform vec3 uBitangent;
uniform vec2 uScale;
uniform float uAlpha;
uniform float uColorAmount;
in vec2 aCorner;
out vec2 vUV;
out float vAlpha;
out float vColorAmount;
void main() {
  vec3 rotatedTangent = (uModel * vec4(uTangent, 0.0)).xyz;
  vec3 rotatedBitangent = (uModel * vec4(uBitangent, 0.0)).xyz;
  vec3 rotatedNormal = (uModel * vec4(cross(uTangent, uBitangent), 0.0)).xyz;
  vec3 rotatedCenter = (uModel * vec4(uPosition, 1.0)).xyz;

  vec3 viewDir = normalize(-rotatedCenter);
  float facing = abs(dot(normalize(rotatedNormal), viewDir));
  float tangentBlend = min(0.7, smoothstep(0.3, 0.7, 1.0 - facing));

  vec3 billboardRight = normalize(cross(viewDir, vec3(0.0, 1.0, 0.0)));
  vec3 billboardUp = normalize(cross(billboardRight, viewDir));

  vec3 blendedRight = normalize(mix(billboardRight, rotatedTangent, tangentBlend));
  vec3 blendedUp = normalize(mix(billboardUp, rotatedBitangent, tangentBlend));

  vec3 worldVertex = rotatedCenter + blendedRight * aCorner.x * uScale.x + blendedUp * aCorner.y * uScale.y;
  vec4 viewPos = uView * vec4(worldVertex, 1.0);
  gl_Position = uProjection * viewPos;
  vUV = vec2(aCorner.x * 0.5 + 0.5, 1.0 - (aCorner.y * 0.5 + 0.5));
  vAlpha = uAlpha;
  vColorAmount = uColorAmount;
}`

const BILLBOARD_FRAG = `#version 300 es
precision mediump float;
in vec2 vUV;
in float vAlpha;
in float vColorAmount;
out vec4 fragColor;
uniform sampler2D uTex;
void main() {
  vec4 color = texture(uTex, vUV);
  vec3 gray = vec3(dot(color.rgb, vec3(0.299, 0.587, 0.114)));
  vec3 finalColor = mix(gray, color.rgb, vColorAmount);
  vec2 uv = vUV * 2.0 - 1.0;
  float radius = 0.12;
  vec2 d = abs(uv) - (1.0 - radius);
  float mask = 1.0 - smoothstep(0.0, radius, length(max(d, 0.0)) - radius);
  color.a *= mask * vAlpha;
  if (color.a < 0.01) discard;
  fragColor = vec4(finalColor, color.a);
}`

export class WebGL2Renderer implements Renderer {
  private gl: WebGL2RenderingContext | null = null
  private canvas: HTMLCanvasElement | null = null
  private program: WebGLProgram | null = null
  private vs: WebGLShader | null = null
  private fs: WebGLShader | null = null
  private uProjection: WebGLUniformLocation | null = null
  private uView: WebGLUniformLocation | null = null
  private uModel: WebGLUniformLocation | null = null
  private uPosition: WebGLUniformLocation | null = null
  private uTangent: WebGLUniformLocation | null = null
  private uBitangent: WebGLUniformLocation | null = null
  private uScale: WebGLUniformLocation | null = null
  private uAlpha: WebGLUniformLocation | null = null
  private uColorAmount: WebGLUniformLocation | null = null
  private uTex: WebGLUniformLocation | null = null
  private vao: WebGLVertexArrayObject | null = null
  private vbo: WebGLBuffer | null = null
  private textures: Map<TextureHandle, TextureEntry> = new Map()
  private nextTextureHandle = 0
  private capabilities: RendererCapabilities | null = null
  private camera: Camera = {
    fov: Math.PI / 3,
    aspect: 1,
    near: 0.1,
    far: 100,
    eye: [0, 0, 4],
    target: [0, 0, 0],
    up: [0, 1, 0],
  }
  private modelRotX = 0
  private modelRotY = 0
  private cachedProjection: Mat4 = new Float32Array(16)
  private cachedView: Mat4 = new Float32Array(16)
  private cachedModel: Mat4 = new Float32Array(16)
  private mvpDirty = true

  initialize(canvas: HTMLCanvasElement): RendererCapabilities {
    this.canvas = canvas
    const gl = canvas.getContext('webgl2', {
      alpha: true,
      antialias: true,
      premultipliedAlpha: true,
    })
    if (!gl) throw new Error('WebGL2 not available')
    this.gl = gl

    this.capabilities = detectCapabilities(gl)

    this.vs = this.compileShader(gl.VERTEX_SHADER, BILLBOARD_VERT)
    this.fs = this.compileShader(gl.FRAGMENT_SHADER, BILLBOARD_FRAG)
    if (!this.vs || !this.fs) throw new Error('Shader compilation failed')

    this.program = gl.createProgram()!
    gl.attachShader(this.program, this.vs)
    gl.attachShader(this.program, this.fs)
    gl.linkProgram(this.program)
    if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
      throw new Error(`Program link failed: ${gl.getProgramInfoLog(this.program)}`)
    }

    this.uProjection = gl.getUniformLocation(this.program, 'uProjection')
    this.uView = gl.getUniformLocation(this.program, 'uView')
    this.uModel = gl.getUniformLocation(this.program, 'uModel')
    this.uPosition = gl.getUniformLocation(this.program, 'uPosition')
    this.uTangent = gl.getUniformLocation(this.program, 'uTangent')
    this.uBitangent = gl.getUniformLocation(this.program, 'uBitangent')
    this.uScale = gl.getUniformLocation(this.program, 'uScale')
    this.uAlpha = gl.getUniformLocation(this.program, 'uAlpha')
    this.uColorAmount = gl.getUniformLocation(this.program, 'uColorAmount')
    this.uTex = gl.getUniformLocation(this.program, 'uTex')

    const corners = new Float32Array([
      -1, -1,  1, -1,  -1, 1,
      -1,  1,  1, -1,   1, 1,
    ])

    this.vao = gl.createVertexArray()!
    this.vbo = gl.createBuffer()!
    gl.bindVertexArray(this.vao)
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo)
    gl.bufferData(gl.ARRAY_BUFFER, corners, gl.STATIC_DRAW)

    const aCorner = gl.getAttribLocation(this.program, 'aCorner')
    gl.enableVertexAttribArray(aCorner)
    gl.vertexAttribPointer(aCorner, 2, gl.FLOAT, false, 0, 0)
    gl.bindVertexArray(null)

    return this.capabilities
  }

  private compileShader(type: number, src: string): WebGLShader | null {
    const gl = this.gl!
    const s = gl.createShader(type)
    if (!s) return null
    gl.shaderSource(s, src)
    gl.compileShader(s)
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      const info = gl.getShaderInfoLog(s)
      gl.deleteShader(s)
      void info
      return null
    }
    return s
  }

  private recomputeMVP(): void {
    mat4Perspective(this.cachedProjection, this.camera.fov, this.camera.aspect, this.camera.near, this.camera.far)

    mat4LookAt(this.cachedView, this.camera.eye, this.camera.target, this.camera.up)

    this.cachedModel.fill(0)
    this.cachedModel[0] = 1; this.cachedModel[5] = 1; this.cachedModel[10] = 1; this.cachedModel[15] = 1
    const cosRx = Math.cos(this.modelRotX)
    const sinRx = Math.sin(this.modelRotX)
    const cosRy = Math.cos(this.modelRotY)
    const sinRy = Math.sin(this.modelRotY)

    const rx = mat4Identity()
    rx[5] = cosRx; rx[6] = sinRx
    rx[9] = -sinRx; rx[10] = cosRx
    const temp = mat4Identity()
    mat4Multiply(temp, this.cachedModel, rx)
    const ry = mat4Identity()
    ry[0] = cosRy; ry[2] = -sinRy
    ry[8] = sinRy; ry[10] = cosRy
    mat4Multiply(this.cachedModel, temp, ry)

    this.mvpDirty = false
  }

  beginFrame(): void {
    const gl = this.gl
    if (!gl || !this.canvas) return
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight)
    gl.clearColor(0.98, 0.97, 0.96, 1.0)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    gl.enable(gl.DEPTH_TEST)
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
    gl.useProgram(this.program)
    if (this.mvpDirty) this.recomputeMVP()
  }

  endFrame(): void {
    const gl = this.gl
    if (!gl) return
    const err = gl.getError()
    void err
  }

  resize(width: number, height: number): void {
    if (!this.canvas) return
    this.canvas.width = width
    this.canvas.height = height
    this.camera.aspect = width / height
    this.mvpDirty = true
  }

  setModelRotation(rotX: number, rotY: number): void {
    if (this.modelRotX === rotX && this.modelRotY === rotY) return
    this.modelRotX = rotX
    this.modelRotY = rotY
    this.mvpDirty = true
  }

  drawMesh(mesh: PhotoMesh): void {
    const gl = this.gl
    if (!gl || !mesh.visible) return

    const texEntry = this.textures.get(mesh.material.texture)
    if (!texEntry) return

    if (this.mvpDirty) this.recomputeMVP()

    gl.uniformMatrix4fv(this.uProjection, false, this.cachedProjection)
    gl.uniformMatrix4fv(this.uView, false, this.cachedView)
    gl.uniformMatrix4fv(this.uModel, false, this.cachedModel)
    gl.uniform3fv(this.uPosition, mesh.transform.position)
    gl.uniform3fv(this.uTangent, mesh.transform.tangent)
    gl.uniform3fv(this.uBitangent, mesh.transform.bitangent)
    gl.uniform2fv(this.uScale, mesh.transform.scale)
    gl.uniform1f(this.uAlpha, mesh.alpha)
    gl.uniform1f(this.uColorAmount, mesh.colorAmount)

    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, texEntry.texture)
    gl.uniform1i(this.uTex, 0)

    gl.bindVertexArray(this.vao)
    gl.drawArrays(gl.TRIANGLES, 0, 6)
    gl.bindVertexArray(null)
  }

  setCamera(camera: Camera): void {
    this.camera = { ...camera }
    this.mvpDirty = true
  }

  uploadTexture(bitmap: ImageBitmap): TextureHandle {
    const gl = this.gl!
    const tex = gl.createTexture()!
    gl.bindTexture(gl.TEXTURE_2D, tex)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, bitmap)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)

    const handle = this.nextTextureHandle++
    this.textures.set(handle, { texture: tex })
    return handle
  }

  destroyTexture(handle: TextureHandle): void {
    const gl = this.gl
    if (!gl) return
    const entry = this.textures.get(handle)
    if (!entry) return
    gl.deleteTexture(entry.texture)
    this.textures.delete(handle)
  }

  dispose(): void {
    const gl = this.gl
    if (!gl) return
    if (this.vao) gl.deleteVertexArray(this.vao)
    if (this.vbo) gl.deleteBuffer(this.vbo)
    for (const [, tex] of this.textures) {
      gl.deleteTexture(tex.texture)
    }
    if (this.program) gl.deleteProgram(this.program)
    if (this.vs) gl.deleteShader(this.vs)
    if (this.fs) gl.deleteShader(this.fs)
    this.textures.clear()
    this.gl = null
  }
}
