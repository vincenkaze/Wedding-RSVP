import type { GalleryItem } from '../content/content'

export function getBaseName(src: string): string {
  return src.replace('.avif', '').split('/').pop() ?? ''
}

export function getWebp(src: string): string {
  return src.replace('.avif', '.webp')
}

export function getSrcSet(src: string, sizes: number[] = [512, 1024]): {
  avif: string
  webp: string
} {
  const name = getBaseName(src)
  const avifSrcs = sizes.map((s) => `/gallery/sizes/${s}/${name}.avif ${s}w`).join(', ')
  const webpSrcs = sizes.map((s) => `/gallery/sizes/${s}/${name}.webp ${s}w`).join(', ')
  return {
    avif: `${avifSrcs}, ${src} 1920w`,
    webp: `${webpSrcs}, ${getWebp(src)} 1920w`,
  }
}

export function getSizes(): string {
  return '(max-width: 1023px) 50vw, 33vw'
}

export function getSpanValue(item: GalleryItem): number {
  if (item.span === 'tall') return 2
  return 1
}
