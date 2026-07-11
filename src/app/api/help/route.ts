import { NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";

const WEBSITE_INFO = "AI Forge website. Features: AI Chat at /dashboard/chat with voice input, Image Generator at /dashboard/image-generator with edit mode, AI Summarizer at /dashboard/summarizer with file upload. Plans: Free (50 chat, 10 images, 5 summaries per 12h), Pro $19/month (unlimited chat, 100 images, 50 summaries, image editing), Enterprise $49/month. Payment JazzCash 0342 2898741. Support WhatsApp 03187637648, Email abdullah143339@gmail.com. Limits reset every 12h.";

function stripMarkdown(text: string): string {
  return text.replace(/\*/g, "").trim();
}

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
    if (!checkRateLimit(`help:${ip}`, 30, 3600000)) {
      return NextResponse.json({ error: "Too many requests. Try again later." }, { status: 429 });
    }

    const { message, history } = await request.json();

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const pastMessages = (history || []).slice(-6).map((m: Record<string, unknown>) => ({
      role: String(m.role ?? "user"),
      content: String(m.content ?? ""),
    }));

    const messages = [
      { role: "system", content: `You are the AI Forge help assistant. Only answer questions about the website. Use plain text only, no markdown. Website info: ${WEBSITE_INFO}` },
      ...pastMessages,
      { role: "user", content: message },
    ];

    const res = await fetch("https://text.pollinations.ai/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages, model: "openai" }),
      signal: AbortSignal.timeout(30000),
    });

    if (!res.ok) throw new Error(`API ${res.status}`);

    const response = stripMarkdown(await res.text());

    return NextResponse.json({ response });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to get response" },
      { status: 500 }
    );
  }
}
