import { NextResponse } from "next/server";
import { checkAndIncrement } from "@/lib/limit";

function stripMarkdown(text: string): string {
  return text.replace(/\*{1,2}(.+?)\*{1,2}/g, "$1").trim();
}

async function callPollinations(messages: { role: string; content: string }[]) {
  const res = await fetch("https://text.pollinations.ai/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, model: "openai" }),
    signal: AbortSignal.timeout(30000),
  });
  if (res.status === 429) throw new Error("AI is busy. Try again.");
  if (!res.ok) throw new Error(`API ${res.status}`);
  return stripMarkdown(await res.text());
}

export async function POST(request: Request) {
  try {
    const limit = await checkAndIncrement("summary");
    if (limit.error) {
      return NextResponse.json({ error: limit.error }, { status: limit.status });
    }

    const { text } = await request.json();

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const truncatedText = text.slice(0, 5000);

    const messages = [
      { role: "system", content: "Summarize the following text in 2-4 sentences. Use plain text only." },
      { role: "user", content: truncatedText },
    ];

    const summary = await callPollinations(messages);

    return NextResponse.json({ summary });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to summarize" },
      { status: 500 }
    );
  }
}
