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
  if (nonStop.length > 0) return nonStop[0];
  return "";
}

function escapeXml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

function hashCode(s: string): number {
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    hash = ((hash << 5) - hash) + s.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

const COLORS = ["#e94560","#0f3460","#16213e","#533483","#e07c24","#0ea5e9","#8b5cf6","#06b6d4"];

function createLogoSVG(text: string): string {
  const safe = escapeXml(text.toUpperCase());
  const ci = hashCode(text) % COLORS.length;
  const c = COLORS[ci];
  const c2 = COLORS[(ci + 1) % COLORS.length];
  return `<svg width="800" height="400" viewBox="0 0 800 400" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${c}22"/>
      <stop offset="100%" stop-color="${c2}22"/>
    </linearGradient>
    <linearGradient id="fg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${c}"/>
      <stop offset="100%" stop-color="${c2}"/>
    </linearGradient>
    <filter id="shadow">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="${c}44"/>
    </filter>
  </defs>
  <rect width="800" height="400" fill="url(#bg)" rx="20"/>
  <circle cx="400" cy="200" r="160" fill="${c}15"/>
  <circle cx="400" cy="200" r="120" fill="${c}10"/>
  <text x="400" y="200" font-family="Arial,Helvetica,sans-serif" font-size="140" font-weight="bold" fill="url(#fg)" text-anchor="middle" dominant-baseline="middle" letter-spacing="6" filter="url(#shadow)">${safe}</text>
</svg>`;
}

async function generateGeminiSVG(prompt: string, brand: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{
              text: "You are an expert SVG logo designer. The text must be rendered using <text> tags. Text to render: " + brand + ". Return ONLY raw SVG code."
            }]
          },
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 8192, temperature: 0.2 }
        }),
        signal: AbortSignal.timeout(20000)
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const svgMatch = text.match(/<svg[\s\S]*?<\/svg>/i);
    if (svgMatch) return svgMatch[0];
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
      const brand = findBrandName(prompt);
      if (brand) {
        const geminiSvg = await generateGeminiSVG(prompt, brand);
        if (geminiSvg && geminiSvg.toLowerCase().includes(brand.toLowerCase())) {
          const base64 = Buffer.from(geminiSvg).toString("base64");
          return NextResponse.json({ imageUrl: `data:image/svg+xml;base64,${base64}` });
        }
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
