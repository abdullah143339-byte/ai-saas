import { NextResponse } from "next/server";
import { checkAndIncrement } from "@/lib/limit";

function isLogoPrompt(prompt: string): boolean {
  const keywords = /\b(logo|brand|text\s|saying|spelling|word\s|reads\s|icon|banner|header|typography|font|make\s+\w+\s+logo|create\s+\w+\s+logo|design\s+\w+\s+logo|generate\s+\w+\s+logo)\b/i;
  return keywords.test(prompt);
}

function extractExactText(prompt: string): string | null {
  const patterns = [
    /with text[""']?\s*[""']?([\w\s]+?)(?:[""']|$)/i,
    /saying[""']?\s*[""']?([\w\s]+?)(?:[""']|$)/i,
    /reads[""']?\s*[""']?([\w\s]+?)(?:[""']|$)/i,
    /word[""']?\s*[""']?([\w\s]+?)(?:[""']|$)/i,
    /spelling[""']?\s*[""']?([\w\s]+?)(?:[""']|$)/i,
    /name[""']?\s*[""']?([\w\s]+?)(?:[""']|$)/i,
    /called[""']?\s*[""']?([\w\s]+?)(?:[""']|$)/i,
    /logo\s+(?:for|of|called|named)?\s*[""']?([\w\s]+?)[""']?(?:with|\s+logo|$)/i,
    /(?:make|create|design|generate)\s+(?:a\s+|an\s+)?(?:logo|brand)\s+(?:for|of|called|named)?\s*[""']?([\w\s]+?)[""']?(?:with|\s+logo|$)/i,
    /(\w+)\s+logo/i
  ];
  for (const p of patterns) {
    const m = prompt.match(p);
    if (m) {
      const text = m[1].trim().split(/\s+/)[0];
      if (text) return text;
    }
  }
  return null;
}

async function generateSVG(prompt: string): Promise<string | null> {
  const exactText = extractExactText(prompt) || "";
  const systemMsg = `You are an expert SVG designer. Generate a clean, professional SVG for: "${prompt}". IMPORTANT: The text "${exactText || prompt}" must appear EXACTLY as specified with CORRECT SPELLING. Return ONLY raw SVG code starting with <svg and ending with </svg>. No markdown, no explanations.`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemMsg }] },
          contents: [{ parts: [{ text: `Create an SVG logo for "${prompt}". The text "${exactText || prompt}" must be spelled EXACTLY as shown here.` }] }],
          generationConfig: { maxOutputTokens: 8192, temperature: 0.2 }
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
        const exactText = extractExactText(prompt);
        if (!exactText || svg.includes(exactText)) {
          const base64 = Buffer.from(svg).toString("base64");
          return NextResponse.json({ imageUrl: `data:image/svg+xml;base64,${base64}` });
        }
      }
    }

    const model = "flux-pro";
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
