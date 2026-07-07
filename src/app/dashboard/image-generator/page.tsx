"use client";

import { useState } from "react";
import {
  ImageIcon,
  Loader2,
  Download,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";

export default function ImageGeneratorPage() {
  const [prompt, setPrompt] = useState("");
  const [size, setSize] = useState("1024x1024");
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || loading) return;

    setLoading(true);
    setImage(null);

    try {
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, size }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate image");

      setImage(data.imageUrl);
      toast.success("Image generated successfully!");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!image) return;
    try {
      const res = await fetch(image);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const ext = blob.type === "image/svg+xml" ? "svg" : "png";
      a.href = url;
      a.download = `ai-generated-${Date.now()}.${ext}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      window.open(image, "_blank");
    }
  };

  return (
    <div className="p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 p-2.5">
            <ImageIcon className="w-full h-full text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-light">Image Generator</h1>
            <p className="text-light-3 text-sm">
              Turn your imagination into stunning visuals
            </p>
          </div>
        </div>

        <form onSubmit={handleGenerate} className="glass rounded-2xl p-6 mb-8">
          <div className="mb-4">
            <label className="block text-sm font-medium text-light-2 mb-2">
              Prompt
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="A modern logo for my brand, a futuristic city, a professional icon set..."
              rows={3}
              className="input-field resize-none"
              disabled={loading}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-light-2 mb-2">
              Image Size
            </label>
            <select
              value={size}
              onChange={(e) => setSize(e.target.value)}
              className="input-field"
              disabled={loading}
            >
              <option value="1024x1024">Square (1024x1024)</option>
              <option value="1792x1024">Landscape (1792x1024)</option>
              <option value="1024x1792">Portrait (1024x1792)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading || !prompt.trim()}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generate Image
              </>
            )}
          </button>
        </form>

        {loading && (
          <div className="glass rounded-2xl p-12 text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary-light mx-auto mb-4" />
            <p className="text-light-2">Creating your masterpiece...</p>
            <p className="text-light-3 text-sm mt-2">
              This may take a moment
            </p>
          </div>
        )}

        {image && !loading && (
          <div className="glass rounded-2xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-light">Generated Image</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setImage(null)}
                  className="btn-secondary !py-2 !px-3"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  onClick={handleDownload}
                  className="btn-primary !py-2 !px-3"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
            <img
              src={image}
              alt={prompt}
              className="w-full rounded-xl"
              onError={() => {
                setImage(null);
                toast.error("Image failed to load. Try a different prompt.");
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
