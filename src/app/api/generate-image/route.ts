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

function escapeXml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

function createLogoSVG(text: string): string {
  const safe = escapeXml(text);
  return `<svg width="800" height="400" viewBox="0 0 800 400" xmlns="http://www.w3.org/2000/svg">
  <rect width="800" height="400" fill="#1a1a2e"/>
  <text x="400" y="200" font-family="Arial,Helvetica,sans-serif" font-size="140" font-weight="bold" fill="#e94560" text-anchor="middle" dominant-baseline="middle" letter-spacing="4">${safe}</text>
</svg>`;
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
      const brand = findBrandName(prompt);
      if (brand) {
        const svg = createLogoSVG(brand);
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
