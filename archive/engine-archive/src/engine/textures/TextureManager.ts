export interface TextureManagerEntry {
  id: string
  src: string
  bitmap: ImageBitmap | null
  textureHandle: number | null
  loaded: boolean
}

export class TextureManager {
  private entries: Map<string, TextureManagerEntry> = new Map()
  private loadingPromises: Map<string, Promise<ImageBitmap>> = new Map()

  async load(id: string, src: string): Promise<ImageBitmap> {
    if (this.entries.has(id) && this.entries.get(id)!.bitmap) {
      return this.entries.get(id)!.bitmap!
    }

    if (this.loadingPromises.has(id)) {
      return this.loadingPromises.get(id)!
    }

    const promise = this.decodeAndResize(src)
    this.loadingPromises.set(id, promise)

    try {
      const bitmap = await promise
      const entry = this.entries.get(id) ?? { id, src, bitmap: null, textureHandle: null, loaded: false }
      entry.bitmap = bitmap
      entry.loaded = true
      this.entries.set(id, entry)
      return bitmap
    } catch (err) {
      this.loadingPromises.delete(id)
      throw err
    }
  }

  private async decodeAndResize(src: string): Promise<ImageBitmap> {
    const response = await fetch(src)
    const blob = await response.blob()
    const bitmap = await createImageBitmap(blob)

    const maxDim = 512
    if (bitmap.width <= maxDim && bitmap.height <= maxDim) {
      return bitmap
    }

    const scale = maxDim / Math.max(bitmap.width, bitmap.height)
    const newWidth = Math.round(bitmap.width * scale)
    const newHeight = Math.round(bitmap.height * scale)

    const canvas = new OffscreenCanvas(newWidth, newHeight)
    const ctx = canvas.getContext('2d')
    if (!ctx) return bitmap

    ctx.drawImage(bitmap, 0, 0, newWidth, newHeight)
    bitmap.close()
    return createImageBitmap(canvas)
  }

  getEntry(id: string): TextureManagerEntry | undefined {
    return this.entries.get(id)
  }

  getLoadedCount(): number {
    let count = 0
    for (const entry of this.entries.values()) {
      if (entry.loaded) count++
    }
    return count
  }

  dispose(): void {
    for (const entry of this.entries.values()) {
      entry.bitmap?.close()
    }
    this.entries.clear()
    this.loadingPromises.clear()
  }
}
