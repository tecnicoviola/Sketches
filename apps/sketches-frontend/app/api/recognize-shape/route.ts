import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { points } = await req.json();

  const prompt = `You are a shape recognition AI. Given a list of points from a freehand drawing, identify what shape was drawn and return the perfect version of it.

Points (x,y): ${JSON.stringify(points.slice(0, 50))}

Analyze the points and return ONLY a JSON object (no explanation, no markdown) in one of these formats:

For a rectangle: {"type":"rect","x":NUMBER,"y":NUMBER,"width":NUMBER,"height":NUMBER}
For a circle: {"type":"circle","centerX":NUMBER,"centerY":NUMBER,"radius":NUMBER}
For a line: {"type":"line","x1":NUMBER,"y1":NUMBER,"x2":NUMBER,"y2":NUMBER}

Use the actual coordinate values from the points to determine position and size. Return only the JSON.`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  const data = await response.json();
  const text = data.content?.[0]?.text ?? "";

  try {
    const clean = text.replace(/```json|```/g, "").trim();
    const shape = JSON.parse(clean);
    return NextResponse.json({ shape });
  } catch {
    return NextResponse.json({ shape: null });
  }
}