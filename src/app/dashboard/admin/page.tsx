"use client";

import { useState, useEffect } from "react";
import { Shield, Check, ArrowUpRight, Loader2, UserCheck, Lock } from "lucide-react";

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
    </div>
  );
}
