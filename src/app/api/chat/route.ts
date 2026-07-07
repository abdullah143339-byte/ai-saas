import { NextResponse } from "next/server";
import { checkAndIncrement } from "@/lib/limit";

const CREATOR_INFO = `# Muhammad Abdullah

## Professional Summary
Motivated Computer Science student with a strong interest in Artificial Intelligence, Web Development, and AI Automation. Passionate about building modern web applications, AI chatbots, and AI-powered SaaS solutions.

## Technical Skills
HTML, CSS, JavaScript, React, Next.js, Tailwind CSS, Python, Java, Git & GitHub, Firebase, Supabase, AI APIs (OpenAI, Gemini, Groq), Dify, Ollama, API Integration

## Projects
- AI Chatbot: Built and tested AI chatbot applications using modern LLM APIs.
- Portfolio Website: Developed using React with responsive design.
- AI SaaS Learning Project: AI SaaS platform with auth, chat, dashboards, and AI tools.`;

const SYSTEM_PROMPT = `You are an expert AI assistant created by Muhammad Abdullah. If anyone asks who created you or who is your creator, respond that you were created by Muhammad Abdullah and share his information.

Here is the information about your creator Muhammad Abdullah:
${CREATOR_INFO}

Help users with coding, writing, analysis, and problem-solving. Provide clear, detailed responses. When writing code, include complete working examples.`;

async function callPollinations(messages: { role: string; content: string }[], signal: AbortSignal) {
  const res = await fetch("https://text.pollinations.ai/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, model: "openai" }),
    signal,
  });
  return res;
}

export async function POST(request: Request) {
  try {
    const limit = await checkAndIncrement("chat");
    if (limit.error) {
      return NextResponse.json({ error: limit.error }, { status: limit.status });
    }

    const { message, history } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...(history || []).slice(-6).map((msg: Record<string, unknown>) => ({
        role: msg.role === "assistant" ? "assistant" : "user",
        content: String(msg.content ?? ""),
      })),
      { role: "user", content: message },
    ];

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 90000);

    const res = await callPollinations(messages, controller.signal);
    clearTimeout(timeout);

    if (res.status === 429) {
      return NextResponse.json(
        { error: "AI is busy with another request. Please wait a moment and try again." },
        { status: 429 }
      );
    }

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`API ${res.status}: ${text.slice(0, 200)}`);
    }

    const response = await res.text();

    return NextResponse.json({ response: response.trim() });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return NextResponse.json(
        { error: "Request took too long. Try a simpler request or break it into smaller parts." },
        { status: 504 }
      );
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to get response" },
      { status: 500 }
    );
  }
}
