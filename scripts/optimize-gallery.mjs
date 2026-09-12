import sharp from 'sharp'
import { readdir, mkdir } from 'node:fs/promises'
import { resolve, basename, extname } from 'node:path'
import { existsSync } from 'node:fs'

const SRC_DIR = resolve('public/gallery')
const OUT_DIR = resolve('public/gallery/sizes')
const SIZES = [512, 1024]
const MAX_FULL = 1920

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
      .rotate()
      .resize(size, size, { fit: 'cover', position: 'centre' })
      .avif({ quality: 65, effort: 4 })
      .toFile(avifOut),
    sharp(srcPath)
      .rotate()
      .resize(size, size, { fit: 'cover', position: 'centre' })
      .webp({ quality: 75, effort: 4 })
      .toFile(webpOut),
  ])
}

// Best available full-size source: converted AVIF first, then WebP, then JPEG.
function pickSource(name) {
  for (const ext of ['.avif', '.webp', '.jpg', '.jpeg']) {
    const p = resolve(SRC_DIR, `${name}${ext}`)
    if (existsSync(p)) return p
  }
  return null
}

async function ensureRoot(name, srcPath) {
  const jobs = []
  if (!existsSync(resolve(SRC_DIR, `${name}.avif`))) {
    jobs.push(
      sharp(srcPath)
        .rotate()
        .resize(MAX_FULL, MAX_FULL, { fit: 'inside', withoutEnlargement: true })
        .avif({ quality: 65, effort: 4 })
        .toFile(resolve(SRC_DIR, `${name}.avif`)),
    )
  }
  if (!existsSync(resolve(SRC_DIR, `${name}.webp`))) {
    jobs.push(
      sharp(srcPath)
        .rotate()
        .resize(MAX_FULL, MAX_FULL, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 75, effort: 4 })
        .toFile(resolve(SRC_DIR, `${name}.webp`)),
    )
  }
  await Promise.all(jobs)
}

async function main() {
  const files = (await readdir(SRC_DIR)).filter((f) =>
    ['.avif', '.webp', '.jpg', '.jpeg'].includes(extname(f).toLowerCase()),
  )

  const unique = [...new Set(files.map((f) => basename(f, extname(f))))].sort(
    (a, b) => Number(a) - Number(b),
  )

  console.log(`Found ${unique.length} gallery images: ${unique.join(', ')}`)
  console.log(`Generating sizes: ${SIZES.join(', ')}px`)

  let total = 0
  for (const name of unique) {
    const src = pickSource(name)
    if (!src) continue
    await ensureRoot(name, src)
    for (const size of SIZES) {
      await processImage(resolve(SRC_DIR, `${name}.avif`), size)
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
