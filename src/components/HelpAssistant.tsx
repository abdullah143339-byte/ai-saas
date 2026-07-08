"use client";

import { useState, useRef } from "react";
import { Bot, X, Send, Loader2, MessageCircle } from "lucide-react";

interface HelpMessage {
  role: "user" | "assistant";
  content: string;
}

const helpResponses: Record<string, string> = {
  chat: "To use AI Chat: Go to Dashboard → AI Chat. Type your question and hit send. The AI will respond instantly.",
  image: "To generate images: Go to Dashboard → Image Generator. Type a description and click Generate. You can also upload an image to edit it!",
  summarize: "To summarize text: Go to Dashboard → Summarizer. Paste your text or upload a file, then click Summarize.",
  pricing: "We offer Free, Pro ($19/mo), and Enterprise ($49/mo) plans. Pro gives unlimited chat, 100 images, 50 summaries + image editing.",
  account: "Sign up with Google or email. Your usage resets every 12 hours for free users.",
  admin: "For account upgrades or issues, contact Muhammad Abdullah via the contact info in the website.",
};

const genericHelp = "Hi! I'm AI Forge Help Assistant. I can guide you on:\n\n💬 **AI Chat** - Ask questions, get answers\n🖼️ **Image Generator** - Create & edit images\n📄 **Summarizer** - Summarize text & documents\n💰 **Pricing** - Plans and features\n👤 **Account** - Usage limits & login\n\nWhat do you need help with?";

export default function HelpAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<HelpMessage[]>([
    { role: "assistant", content: genericHelp },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const getHelpResponse = (query: string): string => {
    const q = query.toLowerCase();
    if (q.includes("chat") || q.includes("talk") || q.includes("message")) return helpResponses.chat;
    if (q.includes("image") || q.includes("picture") || q.includes("photo") || q.includes("generate")) return helpResponses.image;
    if (q.includes("summar") || q.includes("text") || q.includes("document") || q.includes("pdf")) return helpResponses.summarize;
    if (q.includes("price") || q.includes("plan") || q.includes("cost") || q.includes("pro") || q.includes("free") || q.includes("enterprise")) return helpResponses.pricing;
    if (q.includes("account") || q.includes("login") || q.includes("sign") || q.includes("usage") || q.includes("limit")) return helpResponses.account;
    if (q.includes("admin") || q.includes("contact") || q.includes("owner")) return helpResponses.admin;
    return `I can help you with:\n\n💬 **AI Chat** - Intelligent conversations\n🖼️ **Image Generator** - Create & edit images\n📄 **Summarizer** - Text & document summaries\n💰 **Pricing** - Plans from Free to Enterprise\n\nWhich one interests you?`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    const userMsg: HelpMessage = { role: "user", content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    setTimeout(() => {
      const response = getHelpResponse(input);
      setMessages(prev => [...prev, { role: "assistant", content: response }]);
      setLoading(false);
    }, 500);
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
