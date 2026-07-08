import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

const WEBSITE_INFO = `Website Name: AI Forge
URL: https://ai-saas-opal-alpha.vercel.app
Creator: Muhammad Abdullah (Full-Stack Developer & AI Enthusiast)

FEATURES:
- AI Chat Assistant at /dashboard/chat: Chat with Google Gemini, voice input supported (mic button), remembers last 6 messages, clear chat option
- Image Generator at /dashboard/image-generator: Create images from text prompts, upload image to edit/remix it, powered by Pollinations.ai Flux
- AI Summarizer at /dashboard/summarizer: Paste text or upload .txt/.pdf/.docx files (max 5MB), get concise 2-4 sentence summaries

PLANS:
- Free: 50 chat messages per 12 hours, 10 image generations per 12 hours, 5 summarizations per 12 hours
- Pro $19/month: Unlimited chat, 100 images, 50 summaries, image editing, priority support
- Enterprise $49/month: Everything in Pro, unlimited generations, team collaboration, dedicated support
- Payment via JazzCash 0342 2898741 (Heaven Choice Beauty Sallon). After payment, account activated manually.

HOW TO USE:
- Sign up at /auth/signup or click Get Started
- Login with Google OAuth or email/password
- Access all tools from dashboard sidebar
- Admin upgrades handled by Muhammad Abdullah via JazzCash payment

SUPPORT:
- WhatsApp: 03187637648
- Email: abdullah143339@gmail.com
- Payment JazzCash: 0342 2898741 (Heaven Choice Beauty Sallon)
- Usage limits reset every 12 hours automatically`;

const SYSTEM_PROMPT = `You are the AI Forge website help assistant. You were created by Muhammad Abdullah.

Your ONLY job is to answer questions about the AI Forge website - its features, pricing, how to use it, account info, and support.

Here is complete info about the website:
${WEBSITE_INFO}

RULES:
1. Only answer questions about this website. If asked something else, politely say you can only help with website questions.
2. Be friendly and helpful. Answer in the same language the user asks in.
3. NEVER use asterisks, stars, or any markdown formatting in your responses. Write in plain text only.
4. Keep answers concise and direct.`;

export async function POST(request: Request) {
  try {
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

    const result = await chat.sendMessage(message);

    const response = result.response.text();

    return NextResponse.json({ response: response.trim() });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to get response" },
      { status: 500 }
    );
  }
}
