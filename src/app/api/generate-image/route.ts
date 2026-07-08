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

    let url: string;
    if (imageData) {
      url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?model=flux&width=${Math.min(w || 1024, 1024)}&height=${Math.min(h || 1024, 1024)}&img_input=${encodeURIComponent(imageData)}`;
    } else {
      url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?model=flux&width=${w || 1024}&height=${h || 1024}`;
    }

    const res = await fetch(url, { signal: AbortSignal.timeout(60000) });
    if (!res.ok) {
      return NextResponse.json({ error: `API error: ${res.status}` }, { status: 500 });
    }
    const arrayBuffer = await res.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const imageUrl = `data:${res.headers.get("content-type") || "image/jpeg"};base64,${base64}`;
    return NextResponse.json({ imageUrl });
  } catch (error) {
    console.error("Generation error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
