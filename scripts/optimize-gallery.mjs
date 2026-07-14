import sharp from 'sharp'
import { readdir, mkdir } from 'node:fs/promises'
import { resolve, basename, extname } from 'node:path'

const SRC_DIR = resolve('public/gallery')
const OUT_DIR = resolve('public/gallery/sizes')
const SIZES = [512, 1024]

async function ensureDir(dir) {
  await mkdir(dir, { recursive: true })
}

async function processImage(srcPath, size) {
  const name = basename(srcPath, extname(srcPath))
  const outDir = resolve(OUT_DIR, String(size))
  await ensureDir(outDir)

  const avifOut = resolve(outDir, `${name}.avif`)
  const webpOut = resolve(outDir, `${name}.webp`)

  await Promise.all([
    sharp(srcPath)
      .resize(size, size, { fit: 'cover', position: 'centre' })
      .avif({ quality: 65, effort: 4 })
      .toFile(avifOut),
    sharp(srcPath)
      .resize(size, size, { fit: 'cover', position: 'centre' })
      .webp({ quality: 75, effort: 4 })
      .toFile(webpOut),
  ])
}

async function main() {
  const files = (await readdir(SRC_DIR)).filter(
    (f) => f.endsWith('.avif') || f.endsWith('.webp')
  )

  const unique = [...new Set(files.map((f) => basename(f, extname(f))))].sort(
    (a, b) => Number(a) - Number(b)
  )

  console.log(`Found ${unique.length} gallery images: ${unique.join(', ')}`)
  console.log(`Generating sizes: ${SIZES.join(', ')}px`)

  let total = 0
  for (const name of unique) {
    const srcAvif = resolve(SRC_DIR, `${name}.avif`)
    for (const size of SIZES) {
      await processImage(srcAvif, size)
      total += 2
      console.log(`  ✓ ${name} @ ${size}px (avif + webp)`)
    }
  }

  console.log(`\nDone. Generated ${total} files in ${OUT_DIR}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
