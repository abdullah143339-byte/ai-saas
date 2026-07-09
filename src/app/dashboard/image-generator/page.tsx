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
  Palette,
  Move,
  Italic,
  Bold,
} from "lucide-react";
import toast from "react-hot-toast";

const FONTS = [
  "Arial", "Helvetica", "Verdana", "Trebuchet MS", "Tahoma",
  "Georgia", "Times New Roman", "Palatino Linotype", "Garamond", "Baskerville",
  "Courier New", "Lucida Console", "Monaco",
  "Impact", "Comic Sans MS", "Gill Sans", "Futura", "Optima", "Copperplate",
];

const POSITIONS = [
  { id: "top-left", label: "TL", align: "left", baseline: "top" },
  { id: "top-center", label: "TC", align: "center", baseline: "top" },
  { id: "top-right", label: "TR", align: "right", baseline: "top" },
  { id: "center-left", label: "CL", align: "left", baseline: "middle" },
  { id: "center", label: "C", align: "center", baseline: "middle" },
  { id: "center-right", label: "CR", align: "right", baseline: "middle" },
  { id: "bottom-left", label: "BL", align: "left", baseline: "bottom" },
  { id: "bottom-center", label: "BC", align: "center", baseline: "bottom" },
  { id: "bottom-right", label: "BR", align: "right", baseline: "bottom" },
];

const STYLES = [
  { id: "neon", label: "Neon Glow" },
  { id: "classic", label: "Classic" },
  { id: "gradient", label: "Gradient" },
  { id: "minimal", label: "Minimal" },
  { id: "outline", label: "Outline" },
  { id: "shadow", label: "Shadow" },
];

export default function ImageGeneratorPage() {
  const [prompt, setPrompt] = useState("");
  const [size, setSize] = useState("1024x1024");
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [mode, setMode] = useState<"generate" | "edit">("generate");
  const [overlayText, setOverlayText] = useState("");
  const [overlayApplied, setOverlayApplied] = useState(false);
  const [overlayResult, setOverlayResult] = useState<string | null>(null);
  const [overlayFont, setOverlayFont] = useState("Arial");
  const [overlayPosition, setOverlayPosition] = useState("bottom-center");
  const [overlayColor, setOverlayColor] = useState("#ffffff");
  const [overlayFontSize, setOverlayFontSize] = useState(48);
  const [overlayStyle, setOverlayStyle] = useState("neon");
  const [overlayBg, setOverlayBg] = useState(true);
  const autoOverlayRef = useRef<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  function getPositionCoords(posId: string, w: number, h: number, fs: number) {
    const pos = POSITIONS.find(p => p.id === posId) || POSITIONS[7];
    const margin = Math.max(20, w * 0.05);
    let x = w / 2;
    if (pos.align === "left") x = margin;
    if (pos.align === "right") x = w - margin;
    let y = h - fs - margin;
    if (pos.baseline === "top") y = margin + fs;
    if (pos.baseline === "middle") y = h / 2;
    return { x, y, align: pos.align, baseline: pos.baseline };
  }

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

      const text = data.overlayText || null;
      autoOverlayRef.current = text;
      setImage(data.imageUrl);
      setOverlayText(text || "");
      setLoading(false);
      if (text) {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          const canvas = canvasRef.current;
          if (!canvas) return;
          const ctx = canvas.getContext("2d");
          if (!ctx) return;
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0, img.width, img.height);
          const fs = overlayFontSize;
          const pos = getPositionCoords(overlayPosition, img.width, img.height, fs);
          ctx.font = `bold ${fs}px ${overlayFont}`;
          ctx.textAlign = pos.align as CanvasTextAlign;
          ctx.textBaseline = pos.baseline as CanvasTextBaseline;

          if (overlayBg) {
            const metrics = ctx.measureText(text);
            const padX = fs * 0.6;
            const padY = fs * 0.3;
            let bx = pos.x;
            let by = pos.y - fs * 0.7;
            let bw = metrics.width + padX * 2;
            let bh = fs * 1.2;
            if (pos.align === "center") bx = pos.x - bw / 2;
            else if (pos.align === "right") bx = pos.x - bw;
            if (pos.baseline === "middle") by = pos.y - bh / 2;
            else if (pos.baseline === "bottom") by = pos.y - bh + fs * 0.2;
            ctx.fillStyle = "rgba(0,0,0,0.55)";
            const r = bh / 2;
            ctx.beginPath();
            ctx.moveTo(bx + r, by);
            ctx.lineTo(bx + bw - r, by);
            ctx.quadraticCurveTo(bx + bw, by, bx + bw, by + r);
            ctx.lineTo(bx + bw, by + bh - r);
            ctx.quadraticCurveTo(bx + bw, by + bh, bx + bw - r, by + bh);
            ctx.lineTo(bx + r, by + bh);
            ctx.quadraticCurveTo(bx, by + bh, bx, by + bh - r);
            ctx.lineTo(bx, by + r);
            ctx.quadraticCurveTo(bx, by, bx + r, by);
            ctx.closePath();
            ctx.fill();
          }

          if (overlayStyle === "neon") {
            ctx.shadowColor = overlayColor;
            ctx.shadowBlur = fs * 1.5;
            ctx.fillStyle = overlayColor;
            ctx.fillText(text, pos.x, pos.y);
            ctx.shadowBlur = fs * 3;
            ctx.globalAlpha = 0.4;
            ctx.fillText(text, pos.x, pos.y);
            ctx.globalAlpha = 1;
            ctx.shadowBlur = 0;
          } else if (overlayStyle === "classic") {
            ctx.shadowColor = "rgba(0,0,0,0.8)";
            ctx.shadowBlur = 8;
            ctx.fillStyle = overlayColor;
            ctx.fillText(text, pos.x, pos.y);
            ctx.shadowBlur = 0;
            ctx.strokeStyle = "rgba(0,0,0,0.5)";
            ctx.lineWidth = 3;
            ctx.strokeText(text, pos.x, pos.y);
            ctx.fillText(text, pos.x, pos.y);
          } else if (overlayStyle === "gradient") {
            const grad = ctx.createLinearGradient(pos.x - 100, pos.y - 50, pos.x + 100, pos.y + 50);
            grad.addColorStop(0, overlayColor);
            grad.addColorStop(0.5, "#ff6b6b");
            grad.addColorStop(1, "#ffd93d");
            ctx.shadowColor = "rgba(0,0,0,0.6)";
            ctx.shadowBlur = 6;
            ctx.fillStyle = grad;
            ctx.fillText(text, pos.x, pos.y);
            ctx.shadowBlur = 0;
          } else if (overlayStyle === "minimal") {
            ctx.fillStyle = overlayColor;
            ctx.fillText(text, pos.x, pos.y);
          } else if (overlayStyle === "outline") {
            ctx.strokeStyle = overlayColor;
            ctx.lineWidth = Math.max(3, fs / 10);
            ctx.strokeText(text, pos.x, pos.y);
          } else if (overlayStyle === "shadow") {
            ctx.shadowColor = "rgba(0,0,0,0.9)";
            ctx.shadowBlur = 0;
            ctx.shadowOffsetX = 4;
            ctx.shadowOffsetY = 4;
            ctx.fillStyle = overlayColor;
            ctx.fillText(text, pos.x, pos.y);
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
            ctx.shadowBlur = 0;
          }

          setOverlayResult(canvas.toDataURL("image/png"));
          setOverlayApplied(true);
        };
        img.src = data.imageUrl;
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      toast.error(message);
      setLoading(false);
      setImageLoading(false);
    }
  };

  const applyTextOverlay = (text?: string) => {
    const finalText = text || overlayText;
    if (!image || !finalText.trim()) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0, img.width, img.height);
      const fs = overlayFontSize;
      const pos = getPositionCoords(overlayPosition, img.width, img.height, fs);
      ctx.font = `bold ${fs}px ${overlayFont}`;
      ctx.textAlign = pos.align as CanvasTextAlign;
      ctx.textBaseline = pos.baseline as CanvasTextBaseline;

      if (overlayBg) {
        const metrics = ctx.measureText(finalText);
        const padX = fs * 0.6;
        const padY = fs * 0.3;
        let bx = pos.x;
        let by = pos.y - fs * 0.7;
        let bw = metrics.width + padX * 2;
        let bh = fs * 1.2;
        if (pos.align === "center") bx = pos.x - bw / 2;
        else if (pos.align === "right") bx = pos.x - bw;
        if (pos.baseline === "middle") by = pos.y - bh / 2;
        else if (pos.baseline === "bottom") by = pos.y - bh + fs * 0.2;
        ctx.fillStyle = "rgba(0,0,0,0.55)";
        const r = bh / 2;
        ctx.beginPath();
        ctx.moveTo(bx + r, by);
        ctx.lineTo(bx + bw - r, by);
        ctx.quadraticCurveTo(bx + bw, by, bx + bw, by + r);
        ctx.lineTo(bx + bw, by + bh - r);
        ctx.quadraticCurveTo(bx + bw, by + bh, bx + bw - r, by + bh);
        ctx.lineTo(bx + r, by + bh);
        ctx.quadraticCurveTo(bx, by + bh, bx, by + bh - r);
        ctx.lineTo(bx, by + r);
        ctx.quadraticCurveTo(bx, by, bx + r, by);
        ctx.closePath();
        ctx.fill();
      }

      if (overlayStyle === "neon") {
        ctx.shadowColor = overlayColor;
        ctx.shadowBlur = fs * 1.5;
        ctx.fillStyle = overlayColor;
        ctx.fillText(finalText, pos.x, pos.y);
        ctx.shadowBlur = fs * 3;
        ctx.globalAlpha = 0.4;
        ctx.fillText(finalText, pos.x, pos.y);
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
      } else if (overlayStyle === "classic") {
        ctx.shadowColor = "rgba(0,0,0,0.8)";
        ctx.shadowBlur = 8;
        ctx.fillStyle = overlayColor;
        ctx.fillText(finalText, pos.x, pos.y);
        ctx.shadowBlur = 0;
        ctx.strokeStyle = "rgba(0,0,0,0.5)";
        ctx.lineWidth = 3;
        ctx.strokeText(finalText, pos.x, pos.y);
        ctx.fillText(finalText, pos.x, pos.y);
      } else if (overlayStyle === "gradient") {
        const grad = ctx.createLinearGradient(pos.x - 100, pos.y - 50, pos.x + 100, pos.y + 50);
        grad.addColorStop(0, overlayColor);
        grad.addColorStop(0.5, "#ff6b6b");
        grad.addColorStop(1, "#ffd93d");
        ctx.shadowColor = "rgba(0,0,0,0.6)";
        ctx.shadowBlur = 6;
        ctx.fillStyle = grad;
        ctx.fillText(finalText, pos.x, pos.y);
        ctx.shadowBlur = 0;
      } else if (overlayStyle === "minimal") {
        ctx.fillStyle = overlayColor;
        ctx.fillText(finalText, pos.x, pos.y);
      } else if (overlayStyle === "outline") {
        ctx.strokeStyle = overlayColor;
        ctx.lineWidth = Math.max(3, fs / 10);
        ctx.strokeText(finalText, pos.x, pos.y);
        ctx.fillStyle = "transparent";
      } else if (overlayStyle === "shadow") {
        ctx.shadowColor = "rgba(0,0,0,0.9)";
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 4;
        ctx.shadowOffsetY = 4;
        ctx.fillStyle = overlayColor;
        ctx.fillText(finalText, pos.x, pos.y);
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.shadowBlur = 0;
      }

      setOverlayResult(canvas.toDataURL("image/png"));
      setOverlayApplied(true);
      if (!text) toast.success("Text added to image!");
    };
    img.src = image;
  };

  const handleDownload = () => {
    if (overlayResult) {
      const link = document.createElement("a");
      link.download = `ai-image-${Date.now()}.png`;
      link.href = overlayResult;
      link.click();
      return;
    }
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
                  onClick={() => { setImage(null); setImageLoading(false); setOverlayApplied(false); setOverlayResult(null); setOverlayText(""); setOverlayStyle("neon"); setOverlayBg(true); autoOverlayRef.current = null; }}
                  className="btn-secondary !py-2 !px-3"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  onClick={handleDownload}
                  className="btn-primary !py-2 !px-3"
                  title={overlayResult ? "Download with text" : "Download image"}
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
                      <p className="text-light-3 text-sm">Loading edited image...</p>
                    </div>
                  )}
                  <p className="text-xs text-light-3 mb-2 text-center">Edited</p>
                  <img src={overlayResult || image} alt={prompt} className="w-full rounded-xl" style={{ opacity: imageLoading ? 0 : 1 }} onLoad={() => setImageLoading(false)} onError={() => setImageLoading(false)} />
                </div>
              </div>
            )}
            {mode !== "edit" && (
              <div className="relative">
                {imageLoading && (
                  <div className="absolute inset-0 z-10 py-12 text-center bg-dark-1/80 rounded-xl">
                    <Loader2 className="w-10 h-10 animate-spin text-primary-light mx-auto mb-3" />
                    <p className="text-light-3 text-sm">Loading image from server...</p>
                  </div>
                )}
                <img src={overlayResult || image} alt={prompt} className="w-full rounded-xl" style={{ opacity: imageLoading ? 0 : 1 }} onLoad={() => setImageLoading(false)} onError={() => setImageLoading(false)} />
              </div>
            )}

            <canvas ref={canvasRef} className="hidden" />

            <div className="mt-6 p-4 rounded-xl bg-dark-2/50 border border-white/5">
              <div className="flex items-center gap-2 mb-4">
                <Type className="w-4 h-4 text-primary-light" />
                <span className="text-sm font-medium text-light-2">Text Overlay</span>
              </div>

              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={overlayText}
                  onChange={(e) => { setOverlayText(e.target.value); setOverlayApplied(false); setOverlayResult(null); }}
                  placeholder="Type text with correct spelling..."
                  className="input-field text-sm flex-1"
                />
                <button
                  onClick={() => applyTextOverlay()}
                  disabled={!overlayText.trim() || !image}
                  className="btn-primary !px-3 !py-2 text-sm"
                >
                  {overlayApplied ? <Check className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                </button>
              </div>

              <div className="mb-3">
                <label className="block text-xs text-light-3 mb-1.5">Modern Design Style</label>
                <div className="grid grid-cols-3 gap-1">
                  {STYLES.map(s => (
                    <button
                      key={s.id}
                      onClick={() => setOverlayStyle(s.id)}
                      className={`text-xs py-1.5 rounded-lg border transition-all ${
                        overlayStyle === s.id
                          ? "bg-primary/20 border-primary/30 text-primary-light"
                          : "border-white/10 text-light-3 hover:border-white/20"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-xs text-light-3 mb-1">Font</label>
                  <select value={overlayFont} onChange={e => setOverlayFont(e.target.value)} className="input-field text-xs py-1.5">
                    {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-light-3 mb-1">Font Size</label>
                  <select value={overlayFontSize} onChange={e => setOverlayFontSize(Number(e.target.value))} className="input-field text-xs py-1.5">
                    {[16,24,32,40,48,56,64,72,84,96,120].map(s => <option key={s} value={s}>{s}px</option>)}
                  </select>
                </div>
              </div>

              <div className="mb-3">
                <label className="block text-xs text-light-3 mb-1">Text Color</label>
                <div className="flex gap-2 items-center">
                  <input type="color" value={overlayColor} onChange={e => setOverlayColor(e.target.value)} className="w-10 h-8 rounded cursor-pointer bg-transparent border-0" />
                  <span className="text-xs text-light-3 font-mono">{overlayColor}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 mb-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={overlayBg} onChange={e => setOverlayBg(e.target.checked)} className="accent-primary-light" />
                  <span className="text-xs text-light-3">Background pill</span>
                </label>
              </div>

              <div>
                <label className="block text-xs text-light-3 mb-1.5">Position</label>
                <div className="grid grid-cols-3 gap-1">
                  {POSITIONS.map(p => (
                    <button
                      key={p.id}
                      onClick={() => setOverlayPosition(p.id)}
                      className={`text-xs py-1.5 rounded-lg border transition-all ${
                        overlayPosition === p.id
                          ? "bg-primary/20 border-primary/30 text-primary-light"
                          : "border-white/10 text-light-3 hover:border-white/20"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {overlayApplied && (
                <p className="text-xs text-green-400 mt-3">Text applied. Download to save.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
