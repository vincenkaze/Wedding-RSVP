import sharp from 'sharp'
import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const svg = readFileSync(join(root, 'public', 'favicon.svg'), 'utf-8')

const SIZES = [48, 32, 16]

for (const size of SIZES) {
  const buf = await sharp(Buffer.from(svg))
    .resize(size, size)
    .png()
    .toBuffer()

  const dest = join(root, 'public', `favicon-${size}x${size}.png`)
  writeFileSync(dest, buf)
  console.log(`✓ favicon-${size}x${size}.png (${buf.length} bytes)`)

  if (size === 48) {
    const ico = join(root, 'public', 'favicon.ico')
    writeFileSync(ico, buf)
    console.log(`✓ favicon.ico (copied from 48×48 PNG)`)
  }
}
