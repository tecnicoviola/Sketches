import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { imageBase64 } = await req.json();

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return NextResponse.json({ code: "" });

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [
              {
                inline_data: {
                  mime_type: "image/png",
                  data: imageBase64,
                },
              },
              {
                text: "Convert this wireframe/sketch into a single complete HTML file with embedded CSS. Make it look modern and professional. Use a clean dark theme with proper spacing. Return ONLY the raw HTML code starting with <!DOCTYPE html>, no explanation, no markdown, no backticks.",
              },
            ],
          }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 4000,
          },
        }),
      }
    );

    const data = await response.json();
    const code = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    const clean = code.replace(/```html|```/g, "").trim();
    return NextResponse.json({ code: clean });
  } catch (e) {
    console.error("wireframe-to-code error:", e);
    return NextResponse.json({ code: "" });
  }
}
