import { NextResponse } from "next/server";
import { checkAndIncrement } from "@/lib/limit";

const STOP_WORDS = new Set([
  "ka","ki","ke","ko","kya","kyu","hai","ho","hain","tha","the","thi",
  "banao","banaye","banana","banega","kar","karo","kare","karna",
  "with","for","and","the","this","that","a","an","of","in",
  "on","to","by","is","are","was","were","be","been","has","have","had",
  "please","can","you","need","want","like","some","new","my","your",
  "make","create","design","generate","write","show","text","saying",
  "spelling","word","reads","font","typography","logo","brand","icon",
  "banner","header","image","picture","photo","background"
]);

function isLogoPrompt(prompt: string): boolean {
  return /\b(logo|brand|icon|banner|header|typography|write|saying|spelling)\b/i.test(prompt)
    || /['"][A-Za-z]/.test(prompt);
}

function findBrandName(prompt: string): string {
  const quoteMatch = prompt.match(/['"]([A-Za-z0-9\s]+)['"]/);
  if (quoteMatch) return quoteMatch[1].trim();
  const words = prompt.split(/\s+/).filter(w => w.length > 0);
  const meaningful = words.find(w => w.length >= 3 && /^[A-Z]/.test(w));
  if (meaningful) return meaningful;
  const nonStop = words.filter(w => !STOP_WORDS.has(w.toLowerCase()) && /^[a-zA-Z]/.test(w));
  if (nonStop.length > 0) return nonStop[0];
  const alpha = words.filter(w => /^[a-zA-Z]/.test(w));
  if (alpha.length > 0) return alpha[0];
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
  const c3 = COLORS[(ci + 2) % COLORS.length];
  const gradientId = `g${hashCode(text)}`;
  return `<svg width="800" height="400" viewBox="0 0 800 400" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="${gradientId}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${c}"/>
      <stop offset="50%" stop-color="${c2}"/>
      <stop offset="100%" stop-color="${c3}"/>
    </linearGradient>
    <linearGradient id="${gradientId}bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${c}15"/>
      <stop offset="100%" stop-color="${c2}15"/>
    </linearGradient>
    <filter id="${gradientId}shadow">
      <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="${c}66"/>
    </filter>
    <filter id="${gradientId}glow">
      <feGaussianBlur stdDeviation="3" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  <rect width="800" height="400" fill="url(#${gradientId}bg)" rx="24"/>
  <rect x="1" y="1" width="798" height="398" fill="none" stroke="${c}30" stroke-width="2" rx="24"/>
  <circle cx="200" cy="100" r="140" fill="${c}10"/>
  <circle cx="600" cy="300" r="120" fill="${c2}10"/>
  <circle cx="400" cy="200" r="180" fill="${c}08"/>
  <circle cx="400" cy="200" r="130" fill="${c2}08"/>
  <line x1="0" y1="200" x2="800" y2="200" stroke="${c}15" stroke-width="1"/>
  <rect x="260" y="150" width="280" height="100" rx="12" fill="url(#${gradientId}bg)" stroke="${c}40" stroke-width="2"/>
  <text x="400" y="215" font-family="'Segoe UI','Arial Black',Arial,Helvetica,sans-serif" font-size="${safe.length > 8 ? 80 : 120}" font-weight="900" fill="url(#${gradientId})" text-anchor="middle" dominant-baseline="middle" letter-spacing="4" filter="url(#${gradientId}shadow)">${safe}</text>
  <line x1="300" y1="270" x2="500" y2="270" stroke="${c}30" stroke-width="2" stroke-linecap="round"/>
  <circle cx="300" cy="270" r="3" fill="${c}50"/>
  <circle cx="500" cy="270" r="3" fill="${c}50"/>
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
    return NextResponse.json({ error: "Failed to generate image" }, { status: 500 });
  }
}
