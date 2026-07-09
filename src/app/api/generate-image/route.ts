import { NextResponse } from "next/server";
import { checkAndIncrement } from "@/lib/limit";

const STOP_WORDS = new Set([
  "ka","ki","ke","ko","kya","kyu","hai","ho","hain","tha","the","thi",
  "banao","banaye","banana","banega","kar","karo","kare","karna",
  "logo","brand","text","saying","spelling","word","reads","icon",
  "banner","header","typography","font","make","create","design",
  "generate","with","for","and","the","this","that","a","an","of","in",
  "on","to","by","is","are","was","were","be","been","has","have","had",
  "please","can","you","need","want","like","some","new","my","your"
]);

function isLogoPrompt(prompt: string): boolean {
  return /\b(logo|brand|icon|banner|header|typography)\b/i.test(prompt);
}

function findBrandName(prompt: string): string {
  const words = prompt.split(/\s+/).filter(w => w.length > 0);
  const meaningful = words.find(w => /^[A-Z]/.test(w));
  if (meaningful) return meaningful;
  const nonStop = words.filter(w => !STOP_WORDS.has(w.toLowerCase()));
  if (nonStop.length > 0) return nonStop[nonStop.length - 1];
  return words[0] || "";
}

function svgHasText(svg: string): boolean {
  return /<text\b/i.test(svg);
}

async function generateSVG(prompt: string): Promise<string | null> {
  const brand = findBrandName(prompt);
  const geminiPrompt = `Create an SVG logo. The text "${brand}" must appear in the logo using <text> tags. Style: modern, professional. Return ONLY raw SVG code starting with <svg.`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{
              text: "You are an expert SVG logo designer. Always use <text> tags to render text exactly as requested. Never use images for text. Return ONLY raw SVG code."
            }]
          },
          contents: [{ parts: [{ text: geminiPrompt }] }],
          generationConfig: { maxOutputTokens: 8192, temperature: 0.1 }
        }),
        signal: AbortSignal.timeout(20000)
      }
    );
    if (!res.ok) return null;

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const svgMatch = text.match(/<svg[\s\S]*?<\/svg>/i);

    if (svgMatch && svgHasText(svgMatch[0])) {
      return svgMatch[0];
    }
    return null;
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
