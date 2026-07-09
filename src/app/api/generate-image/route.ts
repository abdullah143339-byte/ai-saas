import { NextResponse } from "next/server";
import { checkAndIncrement } from "@/lib/limit";

function extractTextFromPrompt(prompt: string): string | null {
  const patterns = [
    /text[:\s]+["""]?(.+?)["""]?(?:\s|$|,|\.)/i,
    /saying\s+["""]?(.+?)["""]?(?:\s|$|,|\.)/i,
    /spelling\s+["""]?(.+?)["""]?(?:\s|$|,|\.)/i,
    /with\s+the\s+word\s+["""]?(.+?)["""]?(?:\s|$|,|\.)/i,
    /reads\s+["""]?(.+?)["""]?(?:\s|$|,|\.)/i,
    /the\s+text\s+["""]?(.+?)["""]?(?:\s|$|,|\.)/i,
    /word\s+["""]?(.+?)["""]?(?:\s|$|,|\.)/i,
    /logo\s+(?:of\s+|with\s+)?["""]?(.+?)["""]?(?:\s|$|,|\.)/i,
  ];
  for (const p of patterns) {
    const m = prompt.match(p);
    if (m && m[1] && m[1].length > 1 && m[1].length < 50) {
      return m[1].trim();
    }
  }
  return null;
}

function cleanPrompt(prompt: string): string {
  const textPatterns = [
    /[,;:]?\s*text[:\s]+["""]?.+?["""]?(?:\s|$|,|\.)/gi,
    /[,;:]?\s*saying\s+["""]?.+?["""]?(?:\s|$|,|\.)/gi,
    /[,;:]?\s*spelling\s+["""]?.+?["""]?(?:\s|$|,|\.)/gi,
    /[,;:]?\s*with\s+the\s+word\s+["""]?.+?["""]?(?:\s|$|,|\.)/gi,
    /[,;:]?\s*reads\s+["""]?.+?["""]?(?:\s|$|,|\.)/gi,
    /[,;:]?\s*the\s+text\s+["""]?.+?["""]?(?:\s|$|,|\.)/gi,
    /[,;:]?\s*word\s+["""]?.+?["""]?(?:\s|$|,|\.)/gi,
  ];
  let cleaned = prompt;
  for (const p of textPatterns) {
    cleaned = cleaned.replace(p, "");
  }
  cleaned = cleaned.replace(/,\s*,/g, ",").replace(/^[,\s]+|[,\s]+$/g, "").trim();
  return cleaned || prompt;
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
    const overlayText = extractTextFromPrompt(prompt);
    const cleanPromptText = cleanPrompt(prompt);

    if (imageData) {
      return NextResponse.json({
        imageUrl: `https://image.pollinations.ai/prompt/${encodeURIComponent(cleanPromptText)}?model=flux-realism&width=${Math.min(w || 1024, 1024)}&height=${Math.min(h || 1024, 1024)}&img_input=${encodeURIComponent(imageData)}`,
        overlayText
      });
    }
    return NextResponse.json({
      imageUrl: `https://image.pollinations.ai/prompt/${encodeURIComponent(cleanPromptText)}?model=flux-realism&width=${w || 1024}&height=${h || 1024}`,
      overlayText
    });
  } catch (error) {
    console.error("Generation error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
