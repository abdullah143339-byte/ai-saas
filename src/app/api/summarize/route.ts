import { NextResponse } from "next/server";
import { checkAndIncrement } from "@/lib/limit";

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

    const truncatedText = text.slice(0, 5000);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000);

    const res = await fetch("https://text.pollinations.ai/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content: "You are an expert analyst. Provide a comprehensive, detailed summary with bold headings for each section. Use **bold** markdown for section titles like **Main Topic**, **Key Points**, **Details & Insights**, **Key Takeaways**. Be thorough and structured.",
          },
          {
            role: "user",
            content: `Analyze and summarize this text in detail:\n\n${truncatedText}`,
          },
        ],
        model: "openai",
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (res.status === 429) {
      return NextResponse.json(
        { error: "AI is busy. Please wait and try again." },
        { status: 429 }
      );
    }

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`API ${res.status}: ${errText.slice(0, 200)}`);
    }

    const summary = await res.text();

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
