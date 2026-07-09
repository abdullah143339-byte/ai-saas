"use client";

import { useState, useEffect } from "react";
import { Shield, Check, ArrowUpRight, Loader2, UserCheck, Lock, Globe, Brain, Code, Server, ExternalLink, Sparkles, MessageSquare, ImageIcon, GitBranch } from "lucide-react";

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [email, setEmail] = useState("");
  const [tier, setTier] = useState<"pro" | "enterprise">("pro");
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/admin/check")
      .then((r) => r.json())
      .then((d) => setIsAdmin(d.isAdmin))
      .catch(() => setIsAdmin(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus(null);
    setLoading(true);

    try {
      const res = await fetch("/api/admin/upgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, tier }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus({ type: "success", message: data.message });
        setEmail("");
      } else {
        setStatus({ type: "error", message: data.error || "Failed" });
      }
    } catch {
      setStatus({ type: "error", message: "Network error" });
    }
    setLoading(false);
  }

  if (isAdmin === null) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary-light" />
      </div>
    );
  }

  if (isAdmin === false) {
    return (
      <div className="max-w-md mx-auto text-center py-20">
        <Lock className="w-16 h-16 text-light-3 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-light mb-2">Access Denied</h1>
        <p className="text-light-3">Only the admin can access this page.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-light flex items-center gap-3">
          <Shield className="w-8 h-8 text-primary-light" />
          Admin Panel
        </h1>
        <p className="text-light-3 mt-2">Upgrade users to Pro or Enterprise after payment.</p>
      </div>

      <div className="glass rounded-2xl p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-light-2 mb-2">User Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              className="w-full px-4 py-3 rounded-xl bg-dark-2 border border-white/10 text-light placeholder:text-light-3/50 focus:outline-none focus:border-primary-light transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-light-2 mb-2">Tier</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setTier("pro")}
                className={`p-4 rounded-xl border text-left transition-all ${
                  tier === "pro"
                    ? "border-primary-light bg-primary/10 text-light"
                    : "border-white/10 text-light-3 hover:border-white/20"
                }`}
              >
                <div className="font-bold text-lg">Pro</div>
                <div className="text-sm text-light-3">Unlimited everything</div>
              </button>
              <button
                type="button"
                onClick={() => setTier("enterprise")}
                className={`p-4 rounded-xl border text-left transition-all ${
                  tier === "enterprise"
                    ? "border-primary-light bg-primary/10 text-light"
                    : "border-white/10 text-light-3 hover:border-white/20"
                }`}
              >
                <div className="font-bold text-lg">Enterprise</div>
                <div className="text-sm text-light-3">Everything + team</div>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary flex items-center justify-center gap-2 py-3"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <UserCheck className="w-5 h-5" />
                Upgrade User
                <ArrowUpRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {status && (
          <div
            className={`mt-6 p-4 rounded-xl flex items-start gap-3 ${
              status.type === "success"
                ? "bg-green-500/10 border border-green-500/30 text-green-400"
                : "bg-red-500/10 border border-red-500/30 text-red-400"
            }`}
          >
            {status.type === "success" ? (
              <Check className="w-5 h-5 mt-0.5 flex-shrink-0" />
            ) : (
              <span className="text-lg mt-0.5 flex-shrink-0">!</span>
            )}
            <span>{status.message}</span>
          </div>
        )}
      </div>

      <div className="glass rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-light mb-3">Recent Upgrades</h2>
        <p className="text-light-3 text-sm">Upgrade history will appear here after each upgrade.</p>
      </div>

      {/* About This Website */}
      <div className="glass rounded-2xl p-8">
        <div className="flex items-center gap-3 mb-6">
          <Globe className="w-6 h-6 text-primary-light" />
          <h2 className="text-2xl font-bold text-light">About This Website</h2>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-primary-light font-semibold mb-3 flex items-center gap-2">
              <Code className="w-4 h-4" /> Tech Stack
            </h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { label: "Framework", value: "Next.js 16 (App Router)" },
                { label: "Styling", value: "Tailwind CSS v4" },
                { label: "Language", value: "TypeScript" },
                { label: "Database", value: "Turso (libSQL)" },
                { label: "Auth", value: "NextAuth.js" },
                { label: "Hosting", value: "Vercel" },
                { label: "Animations", value: "Framer Motion" },
                { label: "Icons", value: "Lucide React" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                  <span className="text-light-3 text-sm">{item.label}</span>
                  <span className="text-light text-sm font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-primary-light font-semibold mb-3 flex items-center gap-2">
              <Brain className="w-4 h-4" /> AI Models Used
            </h3>
            <div className="space-y-3">
              {[
                { icon: MessageSquare, name: "Gemini 2.5 Flash", use: "Chat, Summarizer, Help Assistant (free, daily quota resets)" },
                { icon: ImageIcon, name: "Pollinations Flux / Flux-Pro", use: "Image Generation (free, unlimited)" },
              ].map((model) => (
                <div key={model.name} className="flex items-start gap-3 p-3 rounded-xl bg-white/5">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center shrink-0">
                    <model.icon className="w-4 h-4 text-primary-light" />
                  </div>
                  <div>
                    <p className="text-light text-sm font-medium">{model.name}</p>
                    <p className="text-light-3 text-xs">{model.use}</p>
                  </div>
                </div>
              ))}
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <p className="text-amber-400 text-xs">
                  Note: All AI models used are completely free. No paid API keys required.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-primary-light font-semibold mb-3 flex items-center gap-2">
              <Server className="w-4 h-4" /> Website Architecture
            </h3>
            <div className="space-y-2 text-sm text-light-2 leading-relaxed p-4 rounded-xl bg-white/5">
              <p>This is a full-stack AI SaaS application built with <strong className="text-light">Next.js 16</strong> using the App Router. 
              The frontend and backend are combined in one Next.js project (monolithic architecture).</p>
              <p>Authentication is handled by <strong className="text-light">NextAuth.js</strong> with credentials provider. 
              User data and usage limits are stored in <strong className="text-light">Turso</strong> (libSQL database, SQLite-compatible).</p>
              <p>The app has <strong className="text-light">3 main AI features</strong>: AI Chat with voice input, 
              Image Generator (creates logos via template + photos via Flux), and AI Text Summarizer with file upload support.</p>
              <p>Usage limits reset every <strong className="text-light">12 hours</strong>. 
              Free users get 50 chat messages, 10 image generations, and 5 summaries. Pro/Enterprise users get unlimited access.</p>
            </div>
          </div>

          <div>
            <h3 className="text-primary-light font-semibold mb-3 flex items-center gap-2">
              <GitBranch className="w-4 h-4" /> Source Code &amp; Deploy
            </h3>
            <div className="flex flex-wrap gap-3">
              <a
                href="https://github.com/abdullah143339-byte/ai-saas"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-light hover:bg-white/10 hover:border-primary-light/30 transition-all text-sm"
              >
                <GitBranch className="w-4 h-4" />
                GitHub Repository
                <ExternalLink className="w-3 h-3 text-light-3" />
              </a>
              <a
                href="https://ai-saas-opal-alpha.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-light hover:bg-white/10 hover:border-primary-light/30 transition-all text-sm"
              >
                <Sparkles className="w-4 h-4" />
                Live Website
                <ExternalLink className="w-3 h-3 text-light-3" />
              </a>
            </div>
          </div>

          <div className="pt-2 border-t border-white/10">
            <p className="text-light-3 text-xs text-center">
              Built by <span className="text-primary-light">Abdullah Fauji</span> &mdash; Serf University
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
