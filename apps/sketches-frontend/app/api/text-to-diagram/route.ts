import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { prompt } = await req.json();

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return NextResponse.json({ shapes: [] });

  const systemPrompt = `You are a diagram generation AI. Convert natural language descriptions into canvas shapes.

Return ONLY a valid JSON array of shapes. No explanation, no markdown, no backticks.

Available shape types:
- {"type":"rect","x":NUMBER,"y":NUMBER,"width":NUMBER,"height":NUMBER,"color":"#ffffff","lineWidth":2}
- {"type":"circle","centerX":NUMBER,"centerY":NUMBER,"radius":NUMBER,"color":"#ffffff","lineWidth":2}
- {"type":"arrow","x1":NUMBER,"y1":NUMBER,"x2":NUMBER,"y2":NUMBER,"color":"#ffffff","lineWidth":2}
- {"type":"text","x":NUMBER,"y":NUMBER,"text":"TEXT","color":"#ffffff","lineWidth":2}
- {"type":"diamond","x":NUMBER,"y":NUMBER,"width":NUMBER,"height":NUMBER,"color":"#ffffff","lineWidth":2}

Rules:
- Start shapes around x:200, y:150 so they're visible
- Space shapes at least 120px apart vertically, 200px horizontally
- For flowcharts: use rect for process, diamond for decision, circle for start/end
- Always add text labels near shapes using type "text"
- Arrows should connect shapes logically
- Keep diagram within 1200x800 canvas area
- Return ONLY the JSON array, nothing else`;

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        temperature: 0.2,
        max_tokens: 3000,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `User request: ${prompt}` },
        ],
      }),
    });

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content ?? "[]";
    const clean = text.replace(/```json|```/g, "").trim();
    const shapes = JSON.parse(clean);
    return NextResponse.json({ shapes });
  } catch (e) {
    console.error("text-to-diagram error:", e);
    return NextResponse.json({ shapes: [] });
  }
}