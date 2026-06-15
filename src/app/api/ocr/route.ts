import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { image } = await req.json()

    if (!image) {
      return NextResponse.json(
        { error: "Image requise" },
        { status: 400 }
      )
    }

    // Google Vision API integration
    const visionApiKey = process.env.GOOGLE_VISION_API_KEY

    if (visionApiKey) {
      const base64Data = image.replace(/^data:image\/\w+;base64,/, "")

      const visionRes = await fetch(
        `https://vision.googleapis.com/v1/images:annotate?key=${visionApiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            requests: [
              {
                image: { content: base64Data },
                features: [{ type: "TEXT_DETECTION" }],
              },
            ],
          }),
        }
      )

      const visionData = await visionRes.json()

      if (visionData.responses?.[0]?.textAnnotations?.[0]) {
        const extractedText = visionData.responses[0].textAnnotations[0].description
        const result = parseOcrText(extractedText)
        return NextResponse.json(result)
      }
    }

    return NextResponse.json({
      first_name: "",
      last_name: "",
      national_id: "",
      birth_date: "",
      address: "",
      sector: "",
      gender: "male",
    })
  } catch (error) {
    console.error("OCR Error:", error)
    return NextResponse.json(
      { error: "Erreur OCR" },
      { status: 500 }
    )
  }
}

function parseOcrText(text: string) {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean)

  let first_name = ""
  let last_name = ""
  let national_id = ""
  let birth_date = ""
  const address = ""
  const sector = ""
  let gender: "male" | "female" = "male"

  // CIN pattern: XX-XXXXXX or XX XXXXXX (Moroccan ID format)
  const cinMatch = text.match(/[A-Z]{1,2}\s*[-–—]?\s*\d{5,6}/)
  if (cinMatch) {
    national_id = cinMatch[0].replace(/\s+/g, "")
  }

  // Birth date patterns
  const dateMatch = text.match(
    /(\d{2})[\s/.-](\d{2})[\s/.-](\d{4})|(\d{4})[\s/.-](\d{2})[\s/.-](\d{2})/
  )
  if (dateMatch) {
    const parts = dateMatch[0].split(/[\s/.-]+/)
    if (parts[0].length === 4) {
      birth_date = `${parts[0]}-${parts[1].padStart(2, "0")}-${parts[2].padStart(2, "0")}`
    } else {
      birth_date = `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`
    }
  }

  // Name extraction - look for name patterns in the text
  const upperLines = lines.filter((l) => /^[A-ZÀ-Ÿ\s-]{3,}$/.test(l))
  for (const line of upperLines) {
    const words = line.split(/\s+/).filter(Boolean)
    if (words.length >= 2 && !last_name) {
      if (words.length >= 3) {
        last_name = words.slice(0, -1).join(" ")
        first_name = words[words.length - 1]
      } else {
        last_name = words[0]
        first_name = words[1]
      }
    }
  }

  // Gender detection
  if (/homme|male|masculin|M\b/i.test(text)) gender = "male"
  if (/femme|female|féminin|F\b/i.test(text)) gender = "female"

  return {
    first_name: capitalize(first_name),
    last_name: capitalize(last_name),
    national_id,
    birth_date,
    address,
    sector,
    gender,
  }
}

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}
