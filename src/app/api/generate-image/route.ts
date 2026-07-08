import { NextResponse } from "next/server";
import { checkAndIncrement } from "@/lib/limit";

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

    const enhancedPrompt = `${prompt}, modern style, high quality, detailed, sharp focus, professional look`;
    let url: string;
    if (imageData) {
      const imgParam = encodeURIComponent(imageData);
      url = `https://image.pollinations.ai/prompt/${encodeURIComponent(enhancedPrompt)}?model=flux&width=${Math.min(w || 1024, 1024)}&height=${Math.min(h || 1024, 1024)}&img_input=${imgParam}`;
    } else {
      url = `https://image.pollinations.ai/prompt/${encodeURIComponent(enhancedPrompt)}?model=flux&width=${w || 1024}&height=${h || 1024}`;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000);

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      console.error("Pollinations image error:", res.status, errText);
      return NextResponse.json({ error: `API error: ${res.status}` }, { status: 500 });
    }

    const buffer = Buffer.from(await res.arrayBuffer());
    const base64 = buffer.toString("base64");
    const contentType = res.headers.get("content-type") || "image/jpeg";
    const dataUrl = `data:${contentType};base64,${base64}`;

    return NextResponse.json({ imageUrl: dataUrl });
  } catch (error) {
    console.error("Generation error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
