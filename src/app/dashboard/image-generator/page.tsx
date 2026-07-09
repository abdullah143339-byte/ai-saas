"use client";

import { useState, useRef } from "react";
import {
  ImageIcon,
  Loader2,
  Download,
  Sparkles,
  RefreshCw,
  Upload,
} from "lucide-react";
import toast from "react-hot-toast";

export default function ImageGeneratorPage() {
  const [prompt, setPrompt] = useState("");
  const [size, setSize] = useState("1024x1024");
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [mode, setMode] = useState<"generate" | "edit">("generate");
  const imageRef = useRef<HTMLImageElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const img = new Image();
      img.onload = () => {
        const maxW = 512;
        const maxH = 512;
        let w = img.width;
        let h = img.height;
        if (w > maxW || h > maxH) {
          const ratio = Math.min(maxW / w, maxH / h);
          w = Math.round(w * ratio);
          h = Math.round(h * ratio);
        }
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, w, h);
        const compressed = canvas.toDataURL("image/jpeg", 0.7);
        setUploadedImage(compressed);
        setMode("edit");
        toast.success("Image uploaded! Now describe what to change.");
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || loading) return;

    setLoading(true);
    setImage(null);
    setImageLoading(true);

    try {
      const body: Record<string, unknown> = { prompt, size };
      if (mode === "edit" && uploadedImage) {
        body.imageData = uploadedImage.split(",")[1] || uploadedImage;
      }
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
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
          <div className="flex gap-2 mb-4">
            <button
              type="button"
              onClick={() => { setMode("generate"); setUploadedImage(null); }}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                mode === "generate"
                  ? "bg-primary/20 text-primary-light border border-primary/30"
                  : "text-light-3 hover:text-light border border-transparent"
              }`}
            >
              Generate New
            </button>
            <button
              type="button"
              onClick={() => setMode("edit")}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                mode === "edit"
                  ? "bg-primary/20 text-primary-light border border-primary/30"
                  : "text-light-3 hover:text-light border border-transparent"
              }`}
            >
              Edit Image
            </button>
          </div>

          {mode === "edit" && (
            <div className="mb-4">
              <input
                type="file"
                accept="image/*"
                id="file-upload"
                onChange={handleImageUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => document.getElementById("file-upload")?.click()}
                className="flex items-center gap-2 px-4 py-3 rounded-xl border border-dashed border-dark-3 text-light-3 hover:border-primary-light hover:text-primary-light transition-all w-full justify-center cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                {uploadedImage ? "Change Image" : "Upload Image to Edit"}
              </button>
              {uploadedImage && (
                <div className="mt-3 relative">
                  <img
                    src={uploadedImage}
                    alt="Uploaded"
                    className="w-full max-h-48 object-contain rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={() => { setUploadedImage(null); setMode("generate"); }}
                    className="absolute top-2 right-2 p-1 bg-red-500/80 rounded-full text-white text-xs hover:bg-red-600"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          )}

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
                {mode === "edit" ? "Editing..." : "Creating..."}
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                {mode === "edit" ? "Edit Image" : "Generate Image"}
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
              <h3 className="font-semibold text-light">
                {mode === "edit" ? "Edited Image" : "Your Creation"}
              </h3>
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

            {mode === "edit" && uploadedImage && (
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs text-light-3 mb-2 text-center">Original</p>
                  <img src={uploadedImage} alt="Original" className="w-full rounded-xl" />
                </div>
                <div className="relative">
                  {imageLoading && (
                    <div className="absolute inset-0 z-10 py-12 text-center bg-dark-1/80 rounded-xl">
                      <Loader2 className="w-10 h-10 animate-spin text-primary-light mx-auto mb-3" />
                      <p className="text-light-3 text-sm">Processing...</p>
                    </div>
                  )}
                  <p className="text-xs text-light-3 mb-2 text-center">Result</p>
<img src={image} alt={prompt} className="w-full rounded-xl" style={{ opacity: imageLoading ? 0 : 1 }} onLoad={() => setImageLoading(false)} onError={() => setImageLoading(false)} ref={imageRef} />
                </div>
              </div>
            )}
            {mode !== "edit" && (
              <div className="relative">
                {imageLoading && (
                  <div className="absolute inset-0 z-10 py-12 text-center bg-dark-1/80 rounded-xl">
                    <Loader2 className="w-10 h-10 animate-spin text-primary-light mx-auto mb-3" />
                    <p className="text-light-3 text-sm">Loading image...</p>
                  </div>
                )}
                <img src={image} alt={prompt} className="w-full rounded-xl" style={{ opacity: imageLoading ? 0 : 1 }} onLoad={() => setImageLoading(false)} onError={() => setImageLoading(false)} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
