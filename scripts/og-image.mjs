import sharp from 'sharp'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const svgPath = resolve('public/og-image.svg')
const pngPath = resolve('public/og-image.png')

const svg = readFileSync(svgPath, 'utf8')

await sharp(Buffer.from(svg))
  .resize(1200, 630)
  .png({ quality: 95 })
  .toFile(pngPath)

console.log('✅ og-image.png generated (1200×630)')
