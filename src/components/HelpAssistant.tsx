"use client";

import { useState, useRef } from "react";
import { Bot, X, Send, Loader2, MessageCircle } from "lucide-react";

interface HelpMessage {
  role: "user" | "assistant";
  content: string;
}

const WELCOME_MSG = "Hello! I am the AI Forge help assistant. I can answer any question about this website, including features, pricing, how to use the tools, and account help. What would you like to know?";

export default function HelpAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<HelpMessage[]>([
    { role: "assistant", content: WELCOME_MSG },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    const userMsg: HelpMessage = { role: "user", content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/help", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: input,
          history: messages.slice(-6),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setMessages(prev => [...prev, { role: "assistant", content: data.response }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I could not process your request right now. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all"
        title="Need help?"
      >
        {isOpen ? <X className="w-7 h-7 text-white" /> : <MessageCircle className="w-7 h-7 text-white" />}
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 glass rounded-2xl shadow-2xl border border-white/10 overflow-hidden">
          <div className="flex items-center gap-3 p-4 border-b border-white/10 bg-dark-1/50">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary p-1.5">
              <Bot className="w-full h-full text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-light text-sm">AI Help Assistant</h3>
              <p className="text-xs text-light-3">I&apos;ll guide you around</p>
            </div>
          </div>

          <div className="h-72 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : ""}`}>
                <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                  msg.role === "user"
                    ? "bg-primary/20 border border-primary/30 text-light"
                    : "bg-dark-3/50 text-light-2"
                }`}>
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex">
                <div className="bg-dark-3/50 rounded-2xl px-3 py-2">
                  <Loader2 className="w-4 h-4 animate-spin text-primary-light" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="border-t border-white/10 p-3 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask me anything..."
              className="input-field text-sm flex-1"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="btn-primary !p-2"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
