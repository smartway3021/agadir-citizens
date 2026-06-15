export async function enhanceForOcr(imageSrc: string): Promise<string> {
  const img = new Image()
  img.src = imageSrc
  await new Promise((resolve, reject) => {
    img.onload = resolve; img.onerror = reject
  })

  let w = img.naturalWidth
  let h = img.naturalHeight

  // Lightweight resize for preview only — max 1000px
  const MAX = 1000
  if (Math.max(w, h) > MAX) {
    const s = MAX / Math.max(w, h)
    w = Math.round(w * s)
    h = Math.round(h * s)
  }

  const canvas = document.createElement("canvas")
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext("2d")!
  ctx.drawImage(img, 0, 0, w, h)

  return canvas.toDataURL("image/jpeg", 0.9)
}
