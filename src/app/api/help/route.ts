import { NextResponse } from "next/server";

const WEBSITE_INFO = "AI Forge website. Features: AI Chat at /dashboard/chat with voice input, Image Generator at /dashboard/image-generator with edit mode, AI Summarizer at /dashboard/summarizer with file upload. Plans: Free (50 chat, 10 images, 5 summaries per 12h), Pro $19/month (unlimited chat, 100 images, 50 summaries, image editing), Enterprise $49/month. Payment JazzCash 0342 2898741. Support WhatsApp 03187637648, Email abdullah143339@gmail.com. Limits reset every 12h.";

function stripMarkdown(text: string): string {
  return text.replace(/\*{1,2}(.+?)\*{1,2}/g, "$1").trim();
}

export async function POST(request: Request) {
  try {
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
      { error: error instanceof Error ? error.message : "Failed to get response" },
      { status: 500 }
    );
  }
}
