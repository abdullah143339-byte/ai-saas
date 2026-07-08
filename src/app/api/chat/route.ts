import { NextResponse } from "next/server";
import { checkAndIncrement } from "@/lib/limit";
import { GoogleGenerativeAI } from "@google/generative-ai";

const CREATOR_INFO = `# Muhammad Abdullah

## Professional Summary
Motivated Computer Science student with a strong interest in Artificial Intelligence, Web Development, and AI Automation. Passionate about building modern web applications, AI chatbots, and AI-powered SaaS solutions.

## Technical Skills
HTML, CSS, JavaScript, React, Next.js, Tailwind CSS, Python, Java, Git & GitHub, Firebase, Supabase, AI APIs (OpenAI, Gemini, Groq), Dify, Ollama, API Integration

## Projects
- AI Chatbot: Built and tested AI chatbot applications using modern LLM APIs.
- Portfolio Website: Developed using React with responsive design.
- AI SaaS Learning Project: AI SaaS platform with auth, chat, dashboards, and AI tools.`;

const API_KEY = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

const SYSTEM_PROMPT = `You are an expert AI assistant created by Muhammad Abdullah. If anyone asks who created you or who is your creator, respond that you were created by Muhammad Abdullah and share his information.

Here is the information about your creator Muhammad Abdullah:
${CREATOR_INFO}

CRITICAL INSTRUCTIONS:
1. Be concise and direct - answer ONLY what the user asks. No extra fluff.
2. Think intelligently and understand the user's real need before answering.
3. Do NOT show any thinking process, chain-of-thought, or internal reasoning.
4. When writing code, provide complete working examples but keep them minimal.
5. If the user's question is unclear, ask for clarification politely.
6. Be helpful but don't over-explain. Short answers are better than long ones.`;

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

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const historyMessages = (history || []).slice(-6).map((msg: Record<string, unknown>) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: String(msg.content ?? "") }],
    }));

    const chat = model.startChat({
      history: historyMessages,
      systemInstruction: { role: "user", parts: [{ text: SYSTEM_PROMPT }] },
    });

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000);

    const result = await chat.sendMessage(message, { signal: controller.signal });
    clearTimeout(timeout);

    const response = result.response.text();

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
