export function getAverageColor(imgUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'Anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) return resolve('#00ffcc') // fallback

      // Scale down for faster processing
      canvas.width = 64
      canvas.height = 64
      ctx.drawImage(img, 0, 0, 64, 64)

      try {
        const data = ctx.getImageData(0, 0, 64, 64).data
        let r = 0, g = 0, b = 0
        for (let i = 0; i < data.length; i += 4) {
          r += data[i]
          g += data[i + 1]
          b += data[i + 2]
        }
        const pxCount = data.length / 4
        resolve(`rgb(${Math.floor(r / pxCount)}, ${Math.floor(g / pxCount)}, ${Math.floor(b / pxCount)})`)
      } catch (e) {
        resolve('#00ffcc') // fallback on CORS error
      }
    }
    img.onerror = () => resolve('#00ffcc')
    img.src = imgUrl
  })
}
