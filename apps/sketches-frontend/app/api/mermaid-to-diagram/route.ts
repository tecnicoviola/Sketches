import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { mermaid } = await req.json();

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return NextResponse.json({ shapes: [] });

  const systemPrompt = `You are a Mermaid diagram to canvas converter. Convert Mermaid diagram syntax into canvas shapes.

Return ONLY a valid JSON array of shapes. No explanation, no markdown, no backticks.

Available shape types:
- {"type":"rect","x":NUMBER,"y":NUMBER,"width":NUMBER,"height":NUMBER,"color":"#ffffff","lineWidth":2}
- {"type":"circle","centerX":NUMBER,"centerY":NUMBER,"radius":NUMBER,"color":"#ffffff","lineWidth":2}
- {"type":"arrow","x1":NUMBER,"y1":NUMBER,"x2":NUMBER,"y2":NUMBER,"color":"#ffffff","lineWidth":2}
- {"type":"text","x":NUMBER,"y":NUMBER,"text":"TEXT","color":"#ffffff","lineWidth":2}
- {"type":"diamond","x":NUMBER,"y":NUMBER,"width":NUMBER,"height":NUMBER,"color":"#ffffff","lineWidth":2}

Rules:
- Parse the Mermaid syntax carefully
- For flowchart TD (top-down): arrange nodes vertically with 150px gap
- For flowchart LR (left-right): arrange nodes horizontally with 200px gap
- Rectangle nodes ([text]): use rect shape, width 160, height 60
- Diamond nodes ({text}): use diamond shape, width 160, height 80
- Circle nodes ((text)): use circle shape, radius 40
- Arrows (-->): use arrow shape connecting the shapes
- Add text labels inside/near each shape using type "text"
- Start at x:300, y:100
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
          { role: "user", content: `Convert this Mermaid diagram to canvas shapes:\n\n${mermaid}` },
        ],
      }),
    });

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content ?? "[]";
    const clean = text.replace(/```json|```/g, "").trim();
    const shapes = JSON.parse(clean);
    return NextResponse.json({ shapes });
  } catch (e) {
    console.error("mermaid-to-diagram error:", e);
    return NextResponse.json({ shapes: [] });
  }
}