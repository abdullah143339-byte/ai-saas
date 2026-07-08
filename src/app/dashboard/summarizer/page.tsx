"use client";

import { useState, useRef } from "react";
import {
  FileText,
  Loader2,
  Sparkles,
  Copy,
  Check,
  BookOpen,
  Upload,
} from "lucide-react";
import toast from "react-hot-toast";

async function extractText(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch("/api/extract-text", { method: "POST", body: formData });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to extract text");
  return data.text;
}

export default function SummarizerPage() {
  const [text, setText] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingFile, setLoadingFile] = useState(false);
  const [copied, setCopied] = useState(false);
  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!ext || !["txt", "pdf", "docx"].includes(ext)) {
      toast.error("Only .txt, .pdf, and .docx files are supported");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File too large (max 5MB)");
      return;
    }

    setLoadingFile(true);
    setFileName(file.name);

    try {
      const content = await extractText(file);
      setText(content);
      toast.success(`Loaded: ${file.name}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to read file");
    } finally {
      setLoadingFile(false);
    }
  };

  const handleSummarize = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || loading) return;

    setLoading(true);
    setSummary("");

    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to summarize");

      setSummary(data.summary);
      toast.success("Text summarized successfully!");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(summary);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 p-2.5">
            <FileText className="w-full h-full text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-light">AI Summarizer</h1>
            <p className="text-light-3 text-sm">
              Get concise summaries in seconds
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="glass rounded-2xl p-6">
            <h3 className="flex items-center gap-2 font-semibold text-light mb-4">
              <BookOpen className="w-5 h-5 text-primary-light" />
              Input Text
            </h3>

            <div className="mb-4">
              <input
                type="file"
                accept=".txt,.pdf,.docx"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={loadingFile}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-dashed border-dark-3 text-light-3 hover:border-primary-light hover:text-primary-light transition-all w-full justify-center cursor-pointer disabled:opacity-50"
              >
                {loadingFile ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                {loadingFile ? "Reading..." : fileName ? fileName : "Upload .txt, .pdf, or .docx"}
              </button>
            </div>

            <form onSubmit={handleSummarize}>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste your article, document, or any lengthy text here..."
                rows={10}
                className="input-field resize-none mb-4"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !text.trim()}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Summarize
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="flex items-center gap-2 font-semibold text-light">
                <Sparkles className="w-5 h-5 text-primary-light" />
                Summary
              </h3>
              {summary && (
                <button
                  onClick={copyToClipboard}
                  className="p-2 text-light-3 hover:text-primary-light transition-colors rounded-lg hover:bg-white/5 cursor-pointer"
                >
                  {copied ? (
                    <Check className="w-5 h-5 text-green-400" />
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                </button>
              )}
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="w-10 h-10 animate-spin text-primary-light mb-4" />
                <p className="text-light-3 text-sm">Summarizing...</p>
              </div>
            ) : summary ? (
              <div className="text-light-2 leading-relaxed text-sm whitespace-pre-wrap">
                {summary}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <FileText className="w-12 h-12 text-light-3 mb-4" />
                <p className="text-light-3">
                  Your summary will appear here
                </p>
                <p className="text-light-3 text-sm mt-2">
                  Paste text or upload .txt / .pdf / .docx
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
