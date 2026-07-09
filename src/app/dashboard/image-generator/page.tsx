"use client";

import { useState, useRef } from "react";
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
  const [imageLoading, setImageLoading] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || loading) return;

    setLoading(true);
    setImage(null);
    setImageLoading(true);

    try {
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, size }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate image");

      setImage(data.imageUrl);
      setLoading(false);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      toast.error(message);
      setLoading(false);
      setImageLoading(false);
    }
  };

  const handleDownload = () => {
    if (imageRef.current?.src) {
      const link = document.createElement("a");
      link.download = `ai-image-${Date.now()}.png`;
      link.href = imageRef.current.src;
      link.click();
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
              AI understands your vision and creates stunning images
            </p>
          </div>
        </div>

        <form onSubmit={handleGenerate} className="glass rounded-2xl p-6 mb-8">
          <div className="mb-4">
            <label className="block text-sm font-medium text-light-2 mb-2">
              What do you want to create?
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="A futuristic city with neon lights, a professional brand logo, a beautiful sunset landscape..."
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
              <option value="413x531">Passport (413x531)</option>
              <option value="600x600">Passport Square (600x600)</option>
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
                Creating...
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
            <p className="text-light-2">AI is creating your image...</p>
          </div>
        )}

        {image && !loading && (
          <div className="glass rounded-2xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-light">Your Creation</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => { setImage(null); setImageLoading(false); }}
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

            <div className="relative">
              {imageLoading && (
                <div className="absolute inset-0 z-10 py-12 text-center bg-dark-1/80 rounded-xl">
                  <Loader2 className="w-10 h-10 animate-spin text-primary-light mx-auto mb-3" />
                  <p className="text-light-3 text-sm">Loading image...</p>
                </div>
              )}
              <img
                src={image}
                alt={prompt}
                className="w-full rounded-xl"
                style={{ opacity: imageLoading ? 0 : 1 }}
                onLoad={() => setImageLoading(false)}
                onError={() => setImageLoading(false)}
                ref={imageRef}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
