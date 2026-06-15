import type { OcrResult } from "@/lib/types"

// Simple image prep: just upscale + grayscale, no aggressive processing
async function preprocessForOcr(imageSrc: string): Promise<string> {
  const img = new Image()
  img.src = imageSrc
  await new Promise((resolve, reject) => {
    img.onload = resolve; img.onerror = reject
  })

  let w = img.naturalWidth
  let h = img.naturalHeight

  // Upscale so text is large enough for Tesseract
  const MIN = 2000
  if (Math.max(w, h) < MIN) {
    const s = MIN / Math.max(w, h)
    w = Math.round(w * s)
    h = Math.round(h * s)
  }

  const canvas = document.createElement("canvas")
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext("2d")!

  // Draw in grayscale
  ctx.filter = "grayscale(1) contrast(1.3) brightness(1.1)"
  ctx.drawImage(img, 0, 0, w, h)
  ctx.filter = "none"

  return canvas.toDataURL("image/jpeg", 0.9)
}

function cleanLine(s: string): string {
  return s.replace(/[^A-Za-zÀ-ÿ0-9\s\-'/,.]/g, "").trim()
}

interface RawResult {
  first_name: string
  last_name: string
  father_name: string
  mother_name: string
  national_id: string
  birth_date: string
  birth_place: string
  address: string
  gender: "male" | "female"
}

function parseOcrText(raw: string): RawResult {
  const lines = raw.split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 1)

  const result: RawResult = {
    first_name: "", last_name: "", father_name: "", mother_name: "",
    national_id: "", birth_date: "", birth_place: "", address: "",
    gender: "male",
  }

  // Try to extract CIN number from entire text
  const cinMatch = raw.match(/[A-Za-z]{1,3}\s*[-–—]?\s*\d{5,6}/)
  if (cinMatch) {
    result.national_id = cinMatch[0].replace(/[^A-Za-z0-9]/g, "").toUpperCase()
  }

  // Try to extract birth date
  const dateMatch = raw.match(/(\d{2})\s*[/.-]\s*(\d{2})\s*[/.-]\s*(\d{4})/)
  if (dateMatch) {
    result.birth_date = `${dateMatch[3]}-${dateMatch[2].padStart(2, "0")}-${dateMatch[1].padStart(2, "0")}`
  } else {
    // Try French format: "Né(e) le 09 12 1987" or "09.12.1987"
    const frDate = raw.match(/(?:N[EÉ](?:\s*E)?\s+LE|LE)\s+(\d{1,2})\s*[/.\s]\s*(\d{1,2})\s*[/.\s]\s*(\d{4})/i)
    if (frDate) {
      result.birth_date = `${frDate[3]}-${frDate[2].padStart(2, "0")}-${frDate[1].padStart(2, "0")}`
    }
  }

  // Try to find sexe
  const sexeMatch = raw.match(/SEXE\s*:?\s*([MF])/i)
  if (sexeMatch) {
    result.gender = sexeMatch[1].toUpperCase() === "F" ? "female" : "male"
  } else if (raw.match(/FEMME|F[EÉ]MININ/i)) {
    result.gender = "female"
  }

  // Collect clean lines (remove obvious garbage)
  const cleanLines: string[] = []
  for (const l of lines) {
    const cl = cleanLine(l)
    // Skip lines that are too short or have too many special chars
    const specialCount = (l.match(/[^A-Za-zÀ-ÿ0-9\s]/g) || []).length
    if (cl.length < 2 || specialCount > l.length * 0.4) continue
    cleanLines.push(cl)
  }

  // Build full text from clean lines for searching
  const cleanFull = cleanLines.join(" ")

  // ---- Try to extract NOM and PRÉNOM from lines containing these labels ----
  for (let i = 0; i < cleanLines.length; i++) {
    const l = cleanLines[i]

    // Match "NOM: GUERRABI" pattern
    const mNom = l.match(/NOM\s*:?\s*(.{2,})/i)
    if (mNom && !result.last_name) {
      const v = mNom[1].trim()
      if (/^[A-ZÀ-Ÿ][A-ZÀ-Ÿ\s-]{2,}$/i.test(v) && !/PR[EÉ]NOM|P[EÈ]RE|M[EÈ]RE/.test(v.toUpperCase())) {
        result.last_name = v.replace(/[^A-Za-zÀ-ÿ\s-]/g, "").toUpperCase()
      }
    }

    // Match "PRÉNOM: REDOUANE" pattern
    const mPrenom = l.match(/PR[EÉ]NOM\s*:?\s*(.{2,})/i)
    if (mPrenom && !result.first_name) {
      const v = mPrenom[1].trim()
      if (/^[A-ZÀ-Ÿ][A-ZÀ-Ÿ\s-]{2,}$/i.test(v)) {
        result.first_name = v.replace(/[^A-Za-zÀ-ÿ\s-]/g, "").toUpperCase()
      }
    }

    // Match "NOM DU PÈRE:" or "PÈRE:"
    const mPere = l.match(/(?:NOM\s+DU\s+P[EÈ]RE|P[EÈ]RE|FILIATION)\s*:?\s*(.{2,})/i)
    if (mPere && !result.father_name) {
      const v = mPere[1].trim()
      if (/^[A-ZÀ-Ÿ][A-ZÀ-Ÿ\s-]{2,}$/i.test(v) && !/M[EÈ]RE/.test(v.toUpperCase())) {
        result.father_name = v.replace(/[^A-Za-zÀ-ÿ\s-]/g, "").toUpperCase()
      }
    }

    // Match "NOM DE LA MÈRE:" or "MÈRE:"
    const mMere = l.match(/NOM\s+DE\s+LA\s+M[EÈ]RE\s*:?\s*(.{2,})/i)
    if (mMere && !result.mother_name) {
      const v = mMere[1].trim()
      if (/^[A-ZÀ-Ÿ][A-ZÀ-Ÿ\s-]{2,}$/i.test(v)) {
        result.mother_name = v.replace(/[^A-Za-zÀ-ÿ\s-]/g, "").toUpperCase()
      }
    }

    // Address
    const mAddr = l.match(/(?:ADRESSE|DOMICILE)\s*:?\s*(.{3,})/i)
    if (mAddr && !result.address) {
      result.address = mAddr[1].trim()
    }

    // Birth place
    const mLieu = l.match(/LIEU\s+DE\s+NAISSANCE\s*:?\s*(.{2,})/i)
    if (mLieu && !result.birth_place) {
      result.birth_place = mLieu[1].trim()
    }
  }

  // ---- Fallback: label on one line, value on next ----
  for (let i = 0; i < cleanLines.length - 1; i++) {
    const cur = cleanLines[i].toUpperCase().trim()
    const nextVal = cleanLines[i + 1]

    if (!result.last_name && /^NOM$/.test(cleanLines[i]) && /^[A-ZÀ-Ÿ]{3,}/i.test(nextVal)) {
      result.last_name = nextVal.replace(/[^A-Za-zÀ-ÿ\s-]/g, "").toUpperCase()
    }
    if (!result.first_name && /^PR[EÉ]NOM$/.test(cleanLines[i]) && /^[A-ZÀ-Ÿ]{3,}/i.test(nextVal)) {
      result.first_name = nextVal.replace(/[^A-Za-zÀ-ÿ\s-]/g, "").toUpperCase()
    }
    if (!result.father_name && /^(NOM DU P[EÈ]RE|P[EÈ]RE|FILIATION)$/.test(cleanLines[i]) && /^[A-ZÀ-Ÿ]{3,}/i.test(nextVal)) {
      result.father_name = nextVal.replace(/[^A-Za-zÀ-ÿ\s-]/g, "").toUpperCase()
    }
    if (!result.mother_name && /^(NOM DE LA M[EÈ]RE|M[EÈ]RE)$/.test(cleanLines[i]) && /^[A-ZÀ-Ÿ]{3,}/i.test(nextVal)) {
      result.mother_name = nextVal.replace(/[^A-Za-zÀ-ÿ\s-]/g, "").toUpperCase()
    }
    if (!result.birth_place && /^(LIEU DE NAISSANCE|LIEU)$/.test(cleanLines[i]) && nextVal.length > 2) {
      result.birth_place = nextVal
    }
  }

  // ---- Fallback: find names from clean uppercase lines ----
  if (!result.last_name || !result.first_name) {
    // Look for lines that look like names (uppercase, 2+ words, not headers)
    const nameCandidates = cleanLines.filter((l) => {
      const u = l.toUpperCase()
      return /^[A-ZÀ-Ÿ][A-ZÀ-Ÿ\s-]{5,}$/.test(u) && u.length < 45
        && !/ROYAUME|CARTE|NATIONALE|IDENTIT[EÉ]|MAROC|NAISSANCE|ADRESSE|DOMICILE|SEXE|CIN|N[°°]|P[EÈ]RE|M[EÈ]RE|FILIATION/.test(u)
    })

    // Pick the first name-like line that isn't the CIN or date
    for (const cand of nameCandidates) {
      const words = cand.split(/\s+/).filter((w) => w.length > 1)
      if (words.length >= 2) {
        if (!result.last_name) result.last_name = words.slice(0, -1).join(" ")
        if (!result.first_name) result.first_name = words[words.length - 1]
        break
      }
    }
  }

  // ---- Fallback: find address from remaining long lines ----
  if (!result.address) {
    // Look for lines containing "RUE", "AV", "BOUL", "QUARTIER", "HAY", "VILLE", numbers
    const addrCandidates = cleanLines.filter((l) => {
      const u = l.toUpperCase()
      return l.length > 10
        && !/ROYAUME|CARTE|NATIONALE|IDENTIT[EÉ]|MAROC|NAISSANCE|SEXE|CIN|N[°°]|PR[EÉ]NOM/.test(u)
        && /\d/.test(l)  // Has numbers (street numbers)
    })
    if (addrCandidates.length > 0) {
      result.address = addrCandidates[0]
    }
  }

  return result
}

export async function runOcr(image: string): Promise<OcrResult> {
  const empty: OcrResult = {
    first_name: "", last_name: "", father_name: "", mother_name: "",
    national_id: "", birth_date: "", birth_place: "", address: "",
    sector: "", gender: "male", rawText: "",
  }
  try {
    const processed = await preprocessForOcr(image)
    const Tesseract = await import("tesseract.js")
    const { data } = await Tesseract.recognize(processed, "fra", {
      logger: () => {},
    })

    const rawText = (data.text || "").trim()
    const parsed = parseOcrText(rawText)

    return {
      first_name: parsed.first_name,
      last_name: parsed.last_name,
      father_name: parsed.father_name,
      mother_name: parsed.mother_name,
      national_id: parsed.national_id,
      birth_date: parsed.birth_date,
      birth_place: parsed.birth_place,
      address: parsed.address,
      sector: "",
      gender: parsed.gender,
      rawText: "",
    }
  } catch {
    return empty
  }
}
