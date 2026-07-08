import { NextResponse } from "next/server";
import { checkAndIncrement } from "@/lib/limit";

const SYSTEM_PROMPT = "You are an expert AI assistant created by Muhammad Abdullah. Be concise and direct. NEVER use any markdown formatting like asterisks or stars - write in plain text only.";

async function callPollinations(messages: { role: string; content: string }[]) {
  const res = await fetch("https://text.pollinations.ai/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, model: "openai" }),
    signal: AbortSignal.timeout(30000),
  });
  if (res.status === 429) throw new Error("AI is busy. Try again.");
  if (!res.ok) throw new Error(`API ${res.status}`);
  return (await res.text()).trim();
}

export async function POST(request: Request) {
  try {
    const limit = await checkAndIncrement("chat");
    if (limit.error) {
      return NextResponse.json({ error: limit.error }, { status: limit.status });
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
      { role: "system", content: SYSTEM_PROMPT },
      ...pastMessages,
      { role: "user", content: message },
    ];

    const response = await callPollinations(messages);

    return NextResponse.json({ response });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to get response" },
      { status: 500 }
    );
  }
}
