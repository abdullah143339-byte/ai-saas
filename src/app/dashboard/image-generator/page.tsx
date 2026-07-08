"use client";

import { useState, useRef } from "react";
import {
  ImageIcon,
  Loader2,
  Download,
  Sparkles,
  RefreshCw,
  Upload,
  Type,
  Check,
} from "lucide-react";
import toast from "react-hot-toast";

export default function ImageGeneratorPage() {
  const [prompt, setPrompt] = useState("");
  const [size, setSize] = useState("1024x1024");
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [mode, setMode] = useState<"generate" | "edit">("generate");
  const [overlayText, setOverlayText] = useState("");
  const [overlayApplied, setOverlayApplied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
      toast.success(mode === "edit" ? "Image edited successfully!" : "Image generated successfully!");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const applyTextOverlay = () => {
    if (!image || !overlayText.trim()) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(img, 0, 0, img.width, img.height);
      const fontSize = Math.max(20, Math.round(img.width / 15));
      ctx.font = `bold ${fontSize}px Arial, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const cx = img.width / 2;
      const cy = img.height - fontSize * 2;
      ctx.shadowColor = "rgba(0,0,0,0.8)";
      ctx.shadowBlur = 8;
      ctx.fillStyle = "white";
      ctx.fillText(overlayText, cx, cy);
      ctx.shadowBlur = 0;
      ctx.fillStyle = "black";
      ctx.fillText(overlayText, cx + 2, cy + 2);
      ctx.fillStyle = "white";
      ctx.fillText(overlayText, cx, cy);
      setOverlayApplied(true);
      toast.success("Text added to image!");
    };
    img.src = image;
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `ai-image-${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
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
                ref={fileInputRef}
                onChange={handleImageUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
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
              {mode === "edit" ? "Describe the changes" : "Prompt"}
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={mode === "edit" ? "Make the background green, add a sunset, change colors..." : "A modern logo for my brand, a futuristic city..."}
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
                {mode === "edit" ? "Editing..." : "Generating..."}
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
            <p className="text-light-2">Creating your masterpiece...</p>
            <p className="text-light-3 text-sm mt-2">
              This may take a moment
            </p>
          </div>
        )}

        {image && !loading && (
          <div className="glass rounded-2xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-light">
                {mode === "edit" ? "Edited Image" : "Generated Image"}
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => { setImage(null); setOverlayApplied(false); setOverlayText(""); }}
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
                <div>
                  <p className="text-xs text-light-3 mb-2 text-center">Edited</p>
                  <img src={image} alt={prompt} className="w-full rounded-xl"
                    onError={() => { setImage(null); toast.error("Image failed to load."); }} />
                </div>
              </div>
            )}
            {mode !== "edit" && (
              <img src={image} alt={prompt} className="w-full rounded-xl"
                onError={() => { setImage(null); toast.error("Image failed to load."); }} />
            )}

            <canvas ref={canvasRef} className="hidden" />

            <div className="mt-4 p-3 rounded-xl bg-dark-2/50 border border-white/5">
              <div className="flex items-center gap-2 mb-2">
                <Type className="w-4 h-4 text-primary-light" />
                <span className="text-sm font-medium text-light-2">Add Text Overlay</span>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={overlayText}
                  onChange={(e) => { setOverlayText(e.target.value); setOverlayApplied(false); }}
                  placeholder="Type text with correct spelling..."
                  className="input-field text-sm flex-1"
                />
                <button
                  onClick={applyTextOverlay}
                  disabled={!overlayText.trim()}
                  className="btn-primary !px-3 !py-2 text-sm"
                >
                  {overlayApplied ? <Check className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                </button>
              </div>
              {overlayApplied && (
                <p className="text-xs text-green-400 mt-2">Text applied. Download to save.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
