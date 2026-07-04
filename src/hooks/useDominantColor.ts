import { useEffect, useState } from 'react'

const SAMPLE_SIZE = 10

export function useDominantColor(src: string): string | null {
  const [color, setColor] = useState<string | null>(null)

  useEffect(() => {
    if (!src) return

    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = src

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    img.onload = () => {
      canvas.width = SAMPLE_SIZE
      canvas.height = SAMPLE_SIZE
      ctx.drawImage(img, 0, 0, SAMPLE_SIZE, SAMPLE_SIZE)

      const data = ctx.getImageData(0, 0, SAMPLE_SIZE, SAMPLE_SIZE).data
      let r = 0, g = 0, b = 0
      const pixels = SAMPLE_SIZE * SAMPLE_SIZE

      for (let i = 0; i < data.length; i += 4) {
        r += data[i]
        g += data[i + 1]
        b += data[i + 2]
      }

      r = Math.round(r / pixels)
      g = Math.round(g / pixels)
      b = Math.round(b / pixels)

      setColor(`rgb(${r}, ${g}, ${b})`)
    }

    img.onerror = () => {
      setColor(null)
    }
  }, [src])

  return color
}
