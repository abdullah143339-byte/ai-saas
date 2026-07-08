"use client";

import { useState, useRef } from "react";
import { Bot, X, Send, Loader2, MessageCircle } from "lucide-react";

interface HelpMessage {
  role: "user" | "assistant";
  content: string;
}

const websiteInfo = `AI Forge - Complete Website Guide

🌐 **Website:** https://ai-saas-opal-alpha.vercel.app
👤 **Creator:** Muhammad Abdullah (Full-Stack Developer & AI Enthusiast)

--- FEATURES ---

💬 **AI Chat Assistant** (/dashboard/chat)
- Chat with AI powered by Google Gemini
- Ask questions, get code help, brainstorming
- Voice input support (mic button) - speak instead of type
- Concise, intelligent responses

🖼️ **Image Generator** (/dashboard/image-generator)
- **Generate New:** Create images from text prompts
- **Edit Image:** Upload a picture + describe changes to remix it
- Powered by Pollinations.ai Flux model

📄 **AI Summarizer** (/dashboard/summarizer)
- Paste text or upload .txt/.pdf/.docx files
- Get concise 2-4 sentence summaries
- Max 5MB file size

--- ACCOUNT & PLANS ---

🔓 **Free Plan:**
- 50 AI Chat messages per 12 hours
- 10 Image generations per 12 hours
- 5 Summarizations per 12 hours

⭐ **Pro Plan** ($19/month):
- Unlimited AI Chat
- 100 Image generations
- 50 Summarizations
- Image editing & remix
- Priority support
- Payment: JazzCash (0342 2898741) - Heaven Choice Beauty Sallon

🏢 **Enterprise Plan** ($49/month):
- Everything in Pro
- Unlimited generations
- Team collaboration
- Dedicated support

--- HOW TO USE ---

1. **Sign Up:** Click "Get Started" or go to /auth/signup
2. **Login:** Use Google OAuth or email/password
3. **Dashboard:** Access all tools from the sidebar
4. **Admin Panel:** Account upgrades handled by Muhammad Abdullah via JazzCash payment

--- SUPPORT ---

📞 **WhatsApp:** 03187637648
📧 **Email:** abdullah143339@gmail.com
💰 **Payment:** JazzCash 0342 2898741 (Heaven Choice Beauty Sallon)

Usage limits reset every 12 hours automatically.`;

const genericHelp = `🌟 **Welcome to AI Forge!** 🌟

I'm your help assistant. I know everything about this website!

Here's what I can help you with:

💬 **AI Chat** - Chat with voice support
🖼️ **Image Generator** - Create & edit images
📄 **Summarizer** - Summarize text & docs
💰 **Pricing** - Free / Pro / Enterprise plans
👤 **Account** - Login, limits, usage
⚙️ **Features** - How to use everything

Just ask me anything about the website!`;

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
    const info = websiteInfo;

    if (q.includes("chat") || (q.includes("ai") && q.includes("talk"))) return `${info.split("--- FEATURES ---")[1].split("--- ACCOUNT")[0].trim()}\n\n${info.split("--- HOW TO USE ---")[1].split("--- SUPPORT")[0].trim()}`;
    if (q.includes("image") || q.includes("edit") || q.includes("picture") || q.includes("photo") || q.includes("generate")) return `${info.split("🖼️")[1].split("📄")[0].trim()}\n\nTip: In Edit mode, upload an image and describe what you want to change!`;
    if (q.includes("summar") || q.includes("text") || q.includes("document") || q.includes("pdf")) return `${info.split("📄")[1].split("--- ACCOUNT")[0].trim()}`;
    if (q.includes("price") || q.includes("plan") || q.includes("cost") || q.includes("pro") || q.includes("free") || q.includes("enterprise")) return `${info.split("--- ACCOUNT & PLANS ---")[1].split("--- HOW TO USE ---")[0].trim()}\n\nPayment: JazzCash 0342 2898741 (Heaven Choice Beauty Sallon)`;
    if (q.includes("account") || q.includes("login") || q.includes("sign") || q.includes("usage") || q.includes("limit") || q.includes("reset")) return `${info.split("🔓")[1].split("⭐")[0].trim()}\n\nSign up with Google or email. Limits reset every 12 hours.`;
    if (q.includes("admin") || q.includes("upgrade") || q.includes("owner") || q.includes("contact") || q.includes("email") || q.includes("whatsapp")) return info.split("--- SUPPORT ---")[1].trim();
    if (q.includes("voice") || q.includes("mic") || q.includes("speak")) return "AI Chat has voice input! Click the 🎤 mic button next to the input field and speak your question. Works best in Chrome browser.";
    if (q.includes("forget") || q.includes("memory") || q.includes("history")) return "The chat remembers your last 6 messages for context. You can clear chat with the 🗑️ trash icon.";
    
    return genericHelp;
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
