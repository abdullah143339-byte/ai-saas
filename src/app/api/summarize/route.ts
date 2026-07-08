import { NextResponse } from "next/server";
import { checkAndIncrement } from "@/lib/limit";
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

export async function POST(request: Request) {
  try {
    const limit = await checkAndIncrement("summary");
    if (limit.error) {
      return NextResponse.json({ error: limit.error }, { status: limit.status });
    }

    const { text } = await request.json();

    if (!text) {
      return NextResponse.json(
        { error: "Text is required" },
        { status: 400 }
      );
    }

    const truncatedText = text.slice(0, 10000);

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `Summarize the following text concisely in 2-4 sentences. Only give the summary, nothing else:\n\n${truncatedText}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000);

    const result = await model.generateContent(prompt, { signal: controller.signal });
    clearTimeout(timeout);

    const summary = result.response.text();

    return NextResponse.json({ summary: summary.trim() });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return NextResponse.json(
        { error: "Request timed out. Try shorter text." },
        { status: 504 }
      );
    }
    console.error("Summarization error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to summarize" },
      { status: 500 }
    );
  }
}
