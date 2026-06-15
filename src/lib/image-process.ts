export async function enhanceForOcr(imageSrc: string): Promise<string> {
  const img = new Image()
  img.src = imageSrc
  await new Promise((resolve, reject) => {
    img.onload = resolve
    img.onerror = reject
  })

  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")!
  canvas.width = img.naturalWidth
  canvas.height = img.naturalHeight

  ctx.drawImage(img, 0, 0)

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const { data } = imageData

  for (let i = 0; i < data.length; i += 4) {
    let r = data[i], g = data[i + 1], b = data[i + 2]
    const gray = 0.299 * r + 0.587 * g + 0.114 * b
    const factor = gray < 128 ? 1.4 : 1.2
    r = Math.min(255, Math.max(0, (r - 128) * factor + 128))
    g = Math.min(255, Math.max(0, (g - 128) * factor + 128))
    b = Math.min(255, Math.max(0, (b - 128) * factor + 128))
    data[i] = r
    data[i + 1] = g
    data[i + 2] = b
  }

  ctx.putImageData(imageData, 0, 0)
  return canvas.toDataURL("image/jpeg", 0.95)
}
