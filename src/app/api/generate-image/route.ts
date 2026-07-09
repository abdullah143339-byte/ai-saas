import { NextResponse } from "next/server";
import { checkAndIncrement } from "@/lib/limit";

function isLogoPrompt(prompt: string): boolean {
  const keywords = /\b(logo|brand|text\s|saying|spelling|word\s|reads\s|icon|banner|header|typography|font)\b/i;
  return keywords.test(prompt);
}

async function generateSVG(prompt: string): Promise<string | null> {
  const systemMsg = "You are an expert SVG designer. Generate a clean, professional SVG for this request. Use exact text spelling provided by user. Return ONLY the raw SVG code starting with <svg and ending with </svg>. No explanations, no markdown.";

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemMsg }] },
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 4096, temperature: 0.3 }
        }),
        signal: AbortSignal.timeout(20000)
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const svgMatch = text.match(/<svg[\s\S]*?<\/svg>/i);
    return svgMatch ? svgMatch[0] : null;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { prompt, size, imageData } = body;

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const limit = await checkAndIncrement("image");
    if (limit.error) {
      return NextResponse.json({ error: limit.error }, { status: limit.status });
    }

    const [w, h] = (size || "1024x1024").split("x").map(Number);

    if (isLogoPrompt(prompt) && !imageData) {
      const svg = await generateSVG(prompt);
      if (svg) {
        const base64 = Buffer.from(svg).toString("base64");
        return NextResponse.json({ imageUrl: `data:image/svg+xml;base64,${base64}` });
      }
    }

    const model = "flux";
    if (imageData) {
      return NextResponse.json({
        imageUrl: `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?model=${model}&width=${Math.min(w || 1024, 1024)}&height=${Math.min(h || 1024, 1024)}&img_input=${encodeURIComponent(imageData)}`
      });
    }
    return NextResponse.json({
      imageUrl: `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?model=${model}&width=${w || 1024}&height=${h || 1024}`
    });
  } catch (error) {
    console.error("Generation error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
