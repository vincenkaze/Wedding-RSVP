type Mat4 = Float32Array

export function mat4Identity(): Mat4 {
  const m = new Float32Array(16)
  m[0] = 1; m[5] = 1; m[10] = 1; m[15] = 1
  return m
}

export function mat4Multiply(out: Mat4, a: Mat4, b: Mat4): void {
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      out[i * 4 + j] =
        a[0 * 4 + j] * b[i * 4 + 0] +
        a[1 * 4 + j] * b[i * 4 + 1] +
        a[2 * 4 + j] * b[i * 4 + 2] +
        a[3 * 4 + j] * b[i * 4 + 3]
    }
  }
}

export function mat4Translate(m: Mat4, v: [number, number, number]): void {
  const t = mat4Identity()
  t[12] = v[0]; t[13] = v[1]; t[14] = v[2]
  mat4Multiply(m, m, t)
}

export function mat4Scale(m: Mat4, v: [number, number, number]): void {
  const s = mat4Identity()
  s[0] = v[0]; s[5] = v[1]; s[10] = v[2]
  mat4Multiply(m, m, s)
}

export function mat4RotateY(m: Mat4, angle: number): void {
  const c = Math.cos(angle)
  const s = Math.sin(angle)
  const r = mat4Identity()
  r[0] = c; r[2] = -s
  r[8] = s; r[10] = c
  mat4Multiply(m, m, r)
}

export function mat4RotateX(m: Mat4, angle: number): void {
  const c = Math.cos(angle)
  const s = Math.sin(angle)
  const r = mat4Identity()
  r[5] = c; r[6] = s
  r[9] = -s; r[10] = c
  mat4Multiply(m, m, r)
}

export function mat4Perspective(out: Mat4, fovy: number, aspect: number, near: number, far: number): void {
  const f = 1.0 / Math.tan(fovy / 2)
  const nf = 1 / (near - far)
  out.fill(0)
  out[0] = f / aspect
  out[5] = f
  out[10] = (far + near) * nf
  out[11] = -1
  out[14] = 2 * far * near * nf
}

export function mat4LookAt(out: Mat4, eye: [number, number, number], center: [number, number, number], up: [number, number, number]): void {
  const zx = eye[0] - center[0]
  const zy = eye[1] - center[1]
  const zz = eye[2] - center[2]
  let len = 1 / Math.sqrt(zx * zx + zy * zy + zz * zz)
  const fz = [zx * len, zy * len, zz * len]

  const xx = up[1] * fz[2] - up[2] * fz[1]
  const xy = up[2] * fz[0] - up[0] * fz[2]
  const xz = up[0] * fz[1] - up[1] * fz[0]
  len = 1 / Math.sqrt(xx * xx + xy * xy + xz * xz)
  const fx = [xx * len, xy * len, xz * len]

  const fy = [
    fz[1] * fx[2] - fz[2] * fx[1],
    fz[2] * fx[0] - fz[0] * fx[2],
    fz[0] * fx[1] - fz[1] * fx[0],
  ]

  out[0] = fx[0]; out[1] = fy[0]; out[2] = fz[0]; out[3] = 0
  out[4] = fx[1]; out[5] = fy[1]; out[6] = fz[1]; out[7] = 0
  out[8] = fx[2]; out[9] = fy[2]; out[10] = fz[2]; out[11] = 0
  out[12] = -(fx[0] * eye[0] + fx[1] * eye[1] + fx[2] * eye[2])
  out[13] = -(fy[0] * eye[0] + fy[1] * eye[1] + fy[2] * eye[2])
  out[14] = -(fz[0] * eye[0] + fz[1] * eye[1] + fz[2] * eye[2])
  out[15] = 1
}

export function mat4Invert(m: Mat4): Mat4 {
  const out = new Float32Array(16)
  const m00 = m[0]; const m01 = m[1]; const m02 = m[2]; const m03 = m[3]
  const m10 = m[4]; const m11 = m[5]; const m12 = m[6]; const m13 = m[7]
  const m20 = m[8]; const m21 = m[9]; const m22 = m[10]; const m23 = m[11]
  const m30 = m[12]; const m31 = m[13]; const m32 = m[14]; const m33 = m[15]

  const b00 = m00 * m11 - m01 * m10
  const b01 = m00 * m12 - m02 * m10
  const b02 = m00 * m13 - m03 * m10
  const b03 = m01 * m12 - m02 * m11
  const b04 = m01 * m13 - m03 * m11
  const b05 = m02 * m13 - m03 * m12
  const b06 = m20 * m31 - m21 * m30
  const b07 = m20 * m32 - m22 * m30
  const b08 = m20 * m33 - m23 * m30
  const b09 = m21 * m32 - m22 * m31
  const b10 = m21 * m33 - m23 * m31
  const b11 = m22 * m33 - m23 * m32

  let det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06
  if (!det) return mat4Identity()
  det = 1 / det

  out[0] = (m11 * b11 - m12 * b10 + m13 * b09) * det
  out[1] = (m02 * b10 - m01 * b11 - m03 * b09) * det
  out[2] = (m31 * b05 - m32 * b04 + m33 * b03) * det
  out[3] = (m22 * b04 - m21 * b05 - m23 * b03) * det
  out[4] = (m12 * b08 - m10 * b11 - m13 * b07) * det
  out[5] = (m00 * b11 - m02 * b08 + m03 * b07) * det
  out[6] = (m32 * b02 - m30 * b05 - m33 * b01) * det
  out[7] = (m20 * b05 - m22 * b02 + m23 * b01) * det
  out[8] = (m10 * b10 - m11 * b08 + m13 * b06) * det
  out[9] = (m01 * b08 - m00 * b10 - m03 * b06) * det
  out[10] = (m30 * b04 - m31 * b02 + m33 * b00) * det
  out[11] = (m21 * b02 - m20 * b04 - m23 * b00) * det
  out[12] = (m11 * b07 - m10 * b09 - m12 * b06) * det
  out[13] = (m00 * b09 - m01 * b07 + m02 * b06) * det
  out[14] = (m31 * b01 - m30 * b03 - m32 * b00) * det
  out[15] = (m20 * b03 - m21 * b01 + m22 * b00) * det

  return out
}

export function mat4Transpose(m: Mat4): Mat4 {
  const out = new Float32Array(16)
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      out[i * 4 + j] = m[j * 4 + i]
    }
  }
  return out
}
