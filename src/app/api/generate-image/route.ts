import { NextResponse } from "next/server";
import { checkAndIncrement } from "@/lib/limit";

async function enhancePrompt(userPrompt: string): Promise<string> {
  const systemMsg = "You are an expert AI image prompt engineer. Rewrite the user's prompt to be more detailed, visually descriptive, and optimized for AI image generation (Flux model). Add details about lighting, style, composition, colors, and mood. Keep it under 200 characters. Return ONLY the enhanced prompt, no explanation.";

  try {
    const gRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            { role: "user", parts: [{ text: systemMsg + "\n\nUser prompt: " + userPrompt }] }
          ],
          generationConfig: { maxOutputTokens: 100, temperature: 0.7 }
        }),
        signal: AbortSignal.timeout(10000)
      }
    );
    if (gRes.ok) {
      const gData = await gRes.json();
      const text = gData?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      if (text && text.length > 10) return text;
    }
  } catch {}

  try {
    const pRes = await fetch("https://text.pollinations.ai/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [
          { role: "system", content: systemMsg },
          { role: "user", content: userPrompt }
        ]
      }),
      signal: AbortSignal.timeout(10000)
    });
    if (pRes.ok) {
      const text = (await pRes.text()).trim();
      if (text && text.length > 10) return text;
    }
  } catch {}

  return userPrompt;
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
    const enhancedPrompt = await enhancePrompt(prompt);

    if (imageData) {
      return NextResponse.json({
        imageUrl: `https://image.pollinations.ai/prompt/${encodeURIComponent(enhancedPrompt)}?model=flux-realism&width=${Math.min(w || 1024, 1024)}&height=${Math.min(h || 1024, 1024)}&img_input=${encodeURIComponent(imageData)}`
      });
    }
    return NextResponse.json({
      imageUrl: `https://image.pollinations.ai/prompt/${encodeURIComponent(enhancedPrompt)}?model=flux-realism&width=${w || 1024}&height=${h || 1024}`
    });
  } catch (error) {
    console.error("Generation error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
