"use client";
/* eslint-disable @next/next/no-img-element -- previews use local data/blob URLs */

import { useEffect, useMemo, useRef, useState } from "react";
import { jsPDF } from "jspdf";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import { Icon } from "@/components/ui/Icon";

/** Bundle the matching PDF.js worker instead of relying on a copied public file. */
if (typeof window !== "undefined") {
const workerUrl = new URL(
"pdfjs-dist/legacy/build/pdf.worker.min.mjs",
import.meta.url,
).toString();
if (pdfjsLib.GlobalWorkerOptions.workerSrc !== workerUrl) {
pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;
}
}

/** Ensure worker available in /public */
// pdfjsLib.GlobalWorkerOptions.workerSrc =
// `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
/* ---------------- PRESETS ---------------- */
const PRESETS = {
PASSPORT: { w: 413, h: 531, label: "Passport" },
PAN: { w: 213, h: 213, label: "PAN" },
AADHAAR: { w: 300, h: 300, label: "Aadhaar" },
SIGNATURE: { w: 680, h: 120, label: "Signature" },
CUSTOM: { w: 680, h: 120, label: "Custom" },
} satisfies Record<string, { w: number; h: number; label: string }>;

type PresetKey = keyof typeof PRESETS;
type FitMode = "FIT" | "FILL";
type Crop = { x: number; y: number; w: number; h: number } | null;

/* ---------------- Crop Overlay Subcomponent ---------------- */
function CropOverlay({
imgRef,
crop,
setCrop,
lockAspect,
aspect,
}: {
imgRef:
| React.RefObject<HTMLImageElement | null>
| React.MutableRefObject<HTMLImageElement | null>;
crop: Crop;
setCrop: (c: Crop) => void;
lockAspect: boolean;
aspect: number; // width/height
}) {
const overlayRef = useRef<HTMLDivElement>(null);
const [displayMetrics, setDisplayMetrics] = useState({
scaleX: 1,
scaleY: 1,
ready: false,
});
const draggingRef = useRef<{
mode: "move" | "resize";
handle:
| "n"
| "s"
| "e"
| "w"
| "ne"
| "nw"
| "se"
| "sw"
| "inside";
startX: number;
startY: number;
startCrop: { x: number; y: number; w: number; h: number };
} | null>(null);

const map = () => {
const img = imgRef.current;
if (!img) return null;
const rect = img.getBoundingClientRect();
const naturalW = img.naturalWidth || 1;
const naturalH = img.naturalHeight || 1;
const scaleX = rect.width / naturalW;
const scaleY = rect.height / naturalH;
return { rect, scaleX, scaleY };
};

const clientToImage = (clientX: number, clientY: number) => {
const m = map();
if (!m) return { ix: 0, iy: 0 };
const { rect, scaleX, scaleY } = m;
const rx = clientX - rect.left;
const ry = clientY - rect.top;
const ix = rx / (scaleX || 1);
const iy = ry / (scaleY || 1);
return { ix, iy };
};

const clampCrop = (c: { x: number; y: number; w: number; h: number }) => {
const img = imgRef.current;
if (!img) return c;
const maxW = img.naturalWidth || 1;
const maxH = img.naturalHeight || 1;
const MIN = 10;
let { x, y, w, h } = c;

w = Math.max(w, MIN);
h = Math.max(h, MIN);

if (x < 0) x = 0;
if (y < 0) y = 0;
if (x + w > maxW) x = maxW - w;
if (y + h > maxH) y = maxH - h;

return { x, y, w, h };
};

const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
if (!imgRef.current || !crop) return;
const handle = (e.target as HTMLElement).dataset.handle as
| "n"
| "s"
| "e"
| "w"
| "ne"
| "nw"
| "se"
| "sw"
| undefined;
const mode = handle ? "resize" : "move";
const { ix, iy } = clientToImage(e.clientX, e.clientY);
draggingRef.current = {
mode,
handle: handle || "inside",
startX: ix,
startY: iy,
startCrop: { ...crop },
};
(e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
};

const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
if (!draggingRef.current || !crop) return;
const info = draggingRef.current;
const { ix, iy } = clientToImage(e.clientX, e.clientY);
const dx = ix - info.startX;
const dy = iy - info.startY;

let { x, y } = info.startCrop;
const { w, h } = info.startCrop;

if (info.mode === "move" && info.handle === "inside") {
x += dx;
y += dy;
setCrop(clampCrop({ x, y, w, h }));
return;
}

const applyAspect = (nx: number, ny: number, nw: number, nh: number) => {
if (!lockAspect) return { x: nx, y: ny, w: nw, h: nh };

const targetAR = aspect || 1;
if (/n|s/.test(info.handle)) {
const adjW = nh * targetAR;
if (/w/.test(info.handle)) nx = x + w - adjW;
nw = adjW;
} else if (/e|w/.test(info.handle)) {
const adjH = nw / targetAR;
if (/n/.test(info.handle)) ny = y + h - adjH;
nh = adjH;
} else {
const byWidthH = nw / targetAR;
const byHeightW = nh * targetAR;
if (Math.abs(byWidthH - nh) < Math.abs(byHeightW - nw)) {
nh = byWidthH;
} else {
nw = byHeightW;
}
}
return { x: nx, y: ny, w: nw, h: nh };
};

switch (info.handle) {
case "n": {
const ny = y + dy;
const nh = h - dy;
const adj = applyAspect(x, ny, w, nh);
setCrop(clampCrop(adj));
break;
}
case "s": {
const nh = h + dy;
const adj = applyAspect(x, y, w, nh);
setCrop(clampCrop(adj));
break;
}
case "w": {
const nx = x + dx;
const nw = w - dx;
const adj = applyAspect(nx, y, nw, h);
setCrop(clampCrop(adj));
break;
}
case "e": {
const nw = w + dx;
const adj = applyAspect(x, y, nw, h);
setCrop(clampCrop(adj));
break;
}
case "nw": {
const nx = x + dx;
const nw = w - dx;
const ny = y + dy;
const nh = h - dy;
const adj = applyAspect(nx, ny, nw, nh);
setCrop(clampCrop(adj));
break;
}
case "ne": {
const ny = y + dy;
const nh = h - dy;
const nw = w + dx;
const adj = applyAspect(x, ny, nw, nh);
setCrop(clampCrop(adj));
break;
}
case "sw": {
const nx = x + dx;
const nw = w - dx;
const nh = h + dy;
const adj = applyAspect(nx, y, nw, nh);
setCrop(clampCrop(adj));
break;
}
case "se": {
const nw = w + dx;
const nh = h + dy;
const adj = applyAspect(x, y, nw, nh);
setCrop(clampCrop(adj));
break;
}
case "inside":
default:
break;
}
};

const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
if (draggingRef.current) {
try {
(e.currentTarget as HTMLDivElement).releasePointerCapture(e.pointerId);
} catch {}
}
draggingRef.current = null;
};

useEffect(() => {
const img = imgRef.current;
if (!img) return;

let frame = 0;
const update = () => {
const rect = img.getBoundingClientRect();
setDisplayMetrics({
scaleX: (rect.width || 1) / (img.naturalWidth || 1),
scaleY: (rect.height || 1) / (img.naturalHeight || 1),
ready: true,
});
};
frame = requestAnimationFrame(update);
const observer = new ResizeObserver(update);
observer.observe(img);
return () => {
cancelAnimationFrame(frame);
observer.disconnect();
};
}, [imgRef]);

if (!crop || !displayMetrics.ready) return null;
const { scaleX, scaleY } = displayMetrics;

const dispX = crop.x * scaleX;
const dispY = crop.y * scaleY;
const dispW = crop.w * scaleX;
const dispH = crop.h * scaleY;

const handleStyle = (cursor: string) =>
({ width: 10, height: 10, cursor } as React.CSSProperties);

return (
<div
ref={overlayRef}
className="absolute inset-0"
onPointerDown={onPointerDown}
onPointerMove={onPointerMove}
onPointerUp={onPointerUp}
>
{/* Darken outside area */}
<svg className="absolute inset-0 w-full h-full pointer-events-none">
<defs>
<mask id="cropMask">
<rect x="0" y="0" width="100%" height="100%" fill="white" />
<rect x={dispX} y={dispY} width={dispW} height={dispH} fill="black" />
</mask>
</defs>
<rect
x="0"
y="0"
width="100%"
height="100%"
fill="rgba(0,0,0,0.35)"
mask="url(#cropMask)"
/>
</svg>

{/* Crop box */}
<div
className="absolute border-2 border-blue-500/90"
style={{ left: dispX, top: dispY, width: dispW, height: dispH, cursor: "move" }}
>
{/* Rule-of-thirds grid */}
<div className="absolute inset-0 pointer-events-none">
<div className="absolute left-1/3 top-0 bottom-0 border-l border-white/50" />
<div className="absolute left-2/3 top-0 bottom-0 border-l border-white/50" />
<div className="absolute top-1/3 left-0 right-0 border-t border-white/50" />
<div className="absolute top-2/3 left-0 right-0 border-t border-white/50" />
</div>

{/* Handles */}
<div data-handle="nw" className="absolute bg-white border-2 border-blue-600 rounded-full shadow -translate-x-1/2 -translate-y-1/2" style={{ left: 0, top: 0, ...handleStyle("nwse-resize") }} />
<div data-handle="ne" className="absolute bg-white border-2 border-blue-600 rounded-full shadow translate-x-1/2 -translate-y-1/2" style={{ right: 0, top: 0, ...handleStyle("nesw-resize") }} />
<div data-handle="sw" className="absolute bg-white border-2 border-blue-600 rounded-full shadow -translate-x-1/2 translate-y-1/2" style={{ left: 0, bottom: 0, ...handleStyle("nesw-resize") }} />
<div data-handle="se" className="absolute bg-white border-2 border-blue-600 rounded-full shadow translate-x-1/2 translate-y-1/2" style={{ right: 0, bottom: 0, ...handleStyle("nwse-resize") }} />
<div data-handle="n" className="absolute bg-white border-2 border-blue-600 rounded-full shadow -translate-x-1/2 -translate-y-1/2" style={{ left: "50%", top: 0, ...handleStyle("n-resize") }} />
<div data-handle="s" className="absolute bg-white border-2 border-blue-600 rounded-full shadow -translate-x-1/2 translate-y-1/2" style={{ left: "50%", bottom: 0, ...handleStyle("s-resize") }} />
<div data-handle="w" className="absolute bg-white border-2 border-blue-600 rounded-full shadow -translate-x-1/2 -translate-y-1/2" style={{ left: 0, top: "50%", ...handleStyle("w-resize") }} />
<div data-handle="e" className="absolute bg-white border-2 border-blue-600 rounded-full shadow translate-x-1/2 -translate-y-1/2" style={{ right: 0, top: "50%", ...handleStyle("e-resize") }} />
</div>
</div>
);
}

/* ---------------- Main Page ---------------- */
export function ImageCompressor() {
const canvasRef = useRef<HTMLCanvasElement>(null);
const originalImgRef = useRef<HTMLImageElement | null>(null);

// NEW: refs to clear file inputs
const imgInputRef = useRef<HTMLInputElement>(null); // NEW
const pdfInputRef = useRef<HTMLInputElement>(null); // NEW

const [preset, setPreset] = useState<PresetKey>("PASSPORT");
const [width, setWidth] = useState<number>(PRESETS.PASSPORT.w);
const [height, setHeight] = useState<number>(PRESETS.PASSPORT.h);

const [imageSrc, setImageSrc] = useState<string | null>(null);
const [outputSrc, setOutputSrc] = useState<string | null>(null);
const [finalSize, setFinalSize] = useState<number | null>(null);

const [busy, setBusy] = useState(false);
const [status, setStatus] = useState<null | { type: "info" | "error" | "success"; msg: string }>(null);

const [fitMode, setFitMode] = useState<FitMode>("FIT");
const [forceWhiteBg, setForceWhiteBg] = useState(true);
const [targetKB, setTargetKB] = useState(50);

// Manual crop
const [manualCrop, setManualCrop] = useState(false);
const [lockAspect, setLockAspect] = useState(true);
const [crop, setCrop] = useState<Crop>(null);

const TARGET_KB = targetKB;
const aspect = useMemo(() => (height > 0 ? width / height : 1), [width, height]);
const notify = (type: "info" | "error" | "success", msg: string) => setStatus({ type, msg });

// Initialize crop when enabling manual crop or changing image/preset
useEffect(() => {
if (!imageSrc || !manualCrop) {
return;
}

const init = () => {
const img = originalImgRef.current;
if (!img) return;
const iw = img.naturalWidth || 1;
const ih = img.naturalHeight || 1;
let cw: number;
let ch: number;

if (lockAspect) {
const targetAR = aspect || 1;
if (iw / ih > targetAR) {
ch = Math.round(ih * 0.8);
cw = Math.round(ch * targetAR);
} else {
cw = Math.round(iw * 0.8);
ch = Math.round(cw / targetAR);
}
} else {
cw = Math.round(iw * 0.8);
ch = Math.round(ih * 0.8);
}
const cx = Math.round((iw - cw) / 2);
const cy = Math.round((ih - ch) / 2);
setCrop({ x: cx, y: cy, w: cw, h: ch });
};
const t = setTimeout(init, 0);
return () => clearTimeout(t);
}, [imageSrc, preset, manualCrop, lockAspect, aspect]);

// ---------- Helpers ----------
const computeCenteredCrop = (srcW: number, srcH: number, targetW: number, targetH: number) => {
const targetAR = targetW / targetH;
const srcAR = srcW / srcH;
let cropW = srcW, cropH = srcH;
if (srcAR > targetAR) {
cropH = srcH;
cropW = Math.round(cropH * targetAR);
} else {
cropW = srcW;
cropH = Math.round(cropW / targetAR);
}
const sx = Math.floor((srcW - cropW) / 2);
const sy = Math.floor((srcH - cropH) / 2);
return { sx, sy, sw: cropW, sh: cropH };
};

const drawToCanvas = (
img: HTMLImageElement,
dstW: number,
dstH: number,
mode: FitMode,
whiten: boolean,
manualCropArea?: { sx: number; sy: number; sw: number; sh: number }
) => {
const c = canvasRef.current!;
const ctx = c.getContext("2d")!;
const dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2)); // cap 2 for perf

c.width = Math.round(dstW * dpr);
c.height = Math.round(dstH * dpr);
c.style.width = `${dstW}px`;
c.style.height = `${dstH}px`;

ctx.imageSmoothingEnabled = true;
ctx.imageSmoothingQuality = "high";

// white background (letterbox base)
ctx.fillStyle = "#ffffff";
ctx.fillRect(0, 0, c.width, c.height);

if (manualCropArea) {
const { sx, sy, sw, sh } = manualCropArea;
ctx.drawImage(img, sx, sy, sw, sh, 0, 0, c.width, c.height);
} else if (mode === "FIT") {
const ratio = Math.min(c.width / img.width, c.height / img.height);
const drawW = img.width * ratio;
const drawH = img.height * ratio;
const dx = Math.round((c.width - drawW) / 2);
const dy = Math.round((c.height - drawH) / 2);
ctx.drawImage(img, 0, 0, img.width, img.height, dx, dy, drawW, drawH);
} else {
const cr = computeCenteredCrop(img.width, img.height, dstW, dstH);
ctx.drawImage(img, cr.sx, cr.sy, cr.sw, cr.sh, 0, 0, c.width, c.height);
}

if (whiten) {
const imgData = ctx.getImageData(0, 0, c.width, c.height);
const d = imgData.data;
for (let i = 0; i < d.length; i += 4) {
const r = d[i], g = d[i + 1], b = d[i + 2];
if (r > 240 && g > 240 && b > 240) {
d[i] = 255; d[i + 1] = 255; d[i + 2] = 255;
}
}
ctx.putImageData(imgData, 0, 0);
}
return c;
};

const compressToTarget = async (canvas: HTMLCanvasElement) => {
const maxBytes = TARGET_KB * 1024;
let low = 0.15, high = 0.95;
let best: Blob | null = null;

for (let i = 0; i < 8; i++) {
const q = (low + high) / 2;
const blob: Blob | null = await new Promise((res) =>
canvas.toBlob((b) => res(b), "image/jpeg", q)
);
if (!blob) break;
if (blob.size <= maxBytes) {
best = blob;
low = q + 0.03;
} else {
high = q - 0.03;
}
if (high - low < 0.02) break;
}
if (!best) {
best = await new Promise((res) => canvas.toBlob((b) => res(b), "image/jpeg", 0.15));
}
return best!;
};

// ---------- Uploads ----------
function onImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
const f = e.target.files?.[0];
if (!f) return;
if (!f.type.startsWith("image/")) {
notify("error", "Please upload a valid image file.");
return;
}
const r = new FileReader();
r.onload = () => {
setImageSrc(r.result as string);
setOutputSrc(null);
setFinalSize(null);
notify("success", "Image loaded.");
};
r.onerror = () => notify("error", "Failed to read the image file.");
r.readAsDataURL(f);
}

async function onPDFUpload(e: React.ChangeEvent<HTMLInputElement>) {
const file = e.target.files?.[0];
if (!file) return;
if (file.type !== "application/pdf") {
notify("error", "Please upload a valid PDF.");
return;
}
if (!canvasRef.current) return;

try {
setBusy(true);
setStatus({ type: "info", msg: "Extracting first page…" });
const buffer = await file.arrayBuffer();
const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
const page = await pdf.getPage(1);
const viewport = page.getViewport({ scale: 2 });
const c = canvasRef.current!;
const ctx = c.getContext("2d")!;

c.width = viewport.width;
c.height = viewport.height;
await page.render({ canvas: c, canvasContext: ctx, viewport }).promise;

setImageSrc(c.toDataURL("image/jpeg", 0.95));
setOutputSrc(null);
setFinalSize(null);
notify("success", "PDF page extracted.");
} catch (e) {
console.error(e);
notify("error", "Failed to extract image from PDF.");
} finally {
setBusy(false);
}
}
function trimWhiteSpace(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d")!;
  const { width, height } = canvas;

  const img = ctx.getImageData(0, 0, width, height);
  const data = img.data;

  let top = 0;
  let bottom = height - 1;
  let left = 0;
  let right = width - 1;

  const isWhite = (r: number, g: number, b: number, a: number) =>
    a === 0 || (r > 245 && g > 245 && b > 245);

  // Top
  outerTop:
  for (; top < height; top++) {
    for (let x = 0; x < width; x++) {
      const i = (top * width + x) * 4;
      if (!isWhite(data[i], data[i + 1], data[i + 2], data[i + 3])) {
        break outerTop;
      }
    }
  }

  // Bottom
  outerBottom:
  for (; bottom >= top; bottom--) {
    for (let x = 0; x < width; x++) {
      const i = (bottom * width + x) * 4;
      if (!isWhite(data[i], data[i + 1], data[i + 2], data[i + 3])) {
        break outerBottom;
      }
    }
  }

  // Left
  outerLeft:
  for (; left < width; left++) {
    for (let y = top; y <= bottom; y++) {
      const i = (y * width + left) * 4;
      if (!isWhite(data[i], data[i + 1], data[i + 2], data[i + 3])) {
        break outerLeft;
      }
    }
  }

  // Right
  outerRight:
  for (; right >= left; right--) {
    for (let y = top; y <= bottom; y++) {
      const i = (y * width + right) * 4;
      if (!isWhite(data[i], data[i + 1], data[i + 2], data[i + 3])) {
        break outerRight;
      }
    }
  }

  const cropWidth = right - left + 1;
  const cropHeight = bottom - top + 1;

  if (cropWidth <= 0 || cropHeight <= 0) return canvas;

  const out = document.createElement("canvas");
  out.width = cropWidth;
  out.height = cropHeight;

  out
    .getContext("2d")!
    .drawImage(canvas, left, top, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);

  return out;
}
function onDrop(e: React.DragEvent<HTMLDivElement>) {
e.preventDefault();
const f = e.dataTransfer.files?.[0];
if (!f) return;
if (f.type.startsWith("image/")) {
const r = new FileReader();
r.onload = () => {
setImageSrc(r.result as string);
setOutputSrc(null);
setFinalSize(null);
notify("success", "Image loaded from drop.");
};
r.readAsDataURL(f);
} else if (f.type === "application/pdf") {
const fakeEvent = { target: { files: [f] } } as unknown as React.ChangeEvent<HTMLInputElement>;
onPDFUpload(fakeEvent);
} else {
notify("error", "Unsupported file type.");
}
}

// ---------- Process ----------
async function processImage() {
if (!imageSrc || !canvasRef.current) {
notify("error", "Upload or capture an image first.");
return;
}
setBusy(true);
setStatus({ type: "info", msg: "Processing…" });

try {
const img = new Image();
img.crossOrigin = "anonymous";
await new Promise<void>((res, rej) => {
img.onload = () => res();
img.onerror = (e) => rej(e);
img.src = imageSrc;
});

let manualArea: { sx: number; sy: number; sw: number; sh: number } | undefined;
if (manualCrop && crop) {
manualArea = { sx: Math.round(crop.x), sy: Math.round(crop.y), sw: Math.round(crop.w), sh: Math.round(crop.h) };
}

const c = drawToCanvas(img, width, height, fitMode, forceWhiteBg, manualArea);

// Remove white borders automatically

const trimmedCanvas = trimWhiteSpace(c);

const blob = await compressToTarget(trimmedCanvas);
const url = URL.createObjectURL(blob);

if (outputSrc) URL.revokeObjectURL(outputSrc);
setOutputSrc(url);
const kb = Math.round(blob.size / 1024);
setFinalSize(kb);

if (kb <= TARGET_KB) notify("success", `Done: ${kb} KB (≤ ${TARGET_KB} KB).`);
else notify("info", `Result ${kb} KB (slightly over). Reduce dimensions or quality.`);
} catch (e) {
console.error(e);
notify("error", "Failed to process image.");
} finally {
setBusy(false);
}
}

// NEW: Reset All
function resetAll() {
// Revoke Blob URL
if (outputSrc) URL.revokeObjectURL(outputSrc);

// Clear state
setPreset("PASSPORT");
setWidth(PRESETS.PASSPORT.w);
setHeight(PRESETS.PASSPORT.h);

setImageSrc(null);
setOutputSrc(null);
setFinalSize(null);

setFitMode("FIT");
setForceWhiteBg(true);
setTargetKB(50);

setManualCrop(false);
setLockAspect(true);
setCrop(null);

setStatus(null);
setBusy(false);

// Clear file inputs
if (imgInputRef.current) imgInputRef.current.value = "";
if (pdfInputRef.current) pdfInputRef.current.value = "";

notify("info", "Reset to defaults.");
}

function downloadImage() {
if (!outputSrc) return;
const a = document.createElement("a");
a.href = outputSrc;
a.download = `${preset.toLowerCase()}_${manualCrop ? "manual" : fitMode.toLowerCase()}.jpg`;
a.click();
}

function downloadPDF() {
if (!outputSrc) return;
const pdf = new jsPDF("p", "mm", "a4");
const img = new Image();
img.onload = () => {
const pageW = pdf.internal.pageSize.getWidth();
const scale = pageW / img.width;
const w = pageW;
const h = img.height * scale;
pdf.addImage(img, "JPEG", 0, 5, w, h);
pdf.save("exam-upload.pdf");
notify("success", "PDF downloaded.");
};
img.onerror = () => notify("error", "Failed to build PDF.");
img.src = outputSrc;
}

function changePreset(p: PresetKey) {
setPreset(p);
setWidth(PRESETS[p].w);
setHeight(PRESETS[p].h);
setOutputSrc(null);
setFinalSize(null);
notify("info", `Preset: ${PRESETS[p].label}`);
}

useEffect(() => {
return () => {
if (outputSrc) URL.revokeObjectURL(outputSrc);
};
// eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

return (
<main className="w-full bg-white text-slate-900">
<div className="mx-auto flex w-full flex-col items-center py-2">
{/* Card */}
<div className="mx-auto w-full max-w-[1240px] overflow-hidden rounded-2xl border border-[#2563EB]/20 bg-white/95 shadow-[0_22px_46px_rgba(15,23,42,0.08)]">
<header className="flex flex-col gap-2 border-b border-blue-100 bg-white px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4">
<div className="flex items-center gap-2.5">
<span className="grid size-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-[0_8px_18px_rgba(37,99,235,0.25)]" aria-hidden="true"><Icon name="spark" size={19} /></span>
<div>
<h1 className="m-0 text-base font-extrabold tracking-[-0.02em] text-slate-900 sm:text-lg">Professional Image Compressor &amp; Converter</h1>
<p className="m-0 mt-0.5 text-[11px] font-medium leading-relaxed text-slate-500 sm:text-xs">Resize, crop and compress photos, signatures, images and PDF pages for online applications.</p>
</div>
</div>
<span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.08em] text-emerald-700">
<i className="size-1.5 rounded-full bg-emerald-500" aria-hidden="true" /> Processed securely on your device
</span>
</header>
{/* Presets */}
<div className="border-b border-[#2563EB]/15 bg-gradient-to-r from-[#eff6ff] to-[#f8faff] px-3 py-2.5 sm:px-4">
<div className="flex flex-wrap gap-1.5">
{Object.entries(PRESETS).map(([k, v]) => (
<button
key={k}
onClick={() => changePreset(k as PresetKey)}
className={`rounded-full border px-2.5 py-1 text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50
${preset === k
? "border-blue-600 bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-[0_6px_14px_rgba(37,99,235,0.28)]"
: "border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:text-blue-700"}`}
aria-pressed={preset === k}
>
{v.label}
</button>
))}
</div>
</div>

{/* Body */}
<div className="grid gap-4 p-3 sm:p-4 md:grid-cols-5">
{/* Left column: Inputs & controls */}
<section className="md:col-span-2 space-y-3">
{/* Dropzone */}
<div
onDrop={onDrop}
onDragOver={(e) => e.preventDefault()}
className="group relative rounded-xl border-2 border-dashed border-[#2563EB]/35 bg-gradient-to-b from-white to-[#f8fbff] p-4 text-center transition hover:border-[#2563EB]"
aria-label="Drop files here"
>
<div className="pointer-events-none">
<span className="mx-auto mb-2 grid size-11 place-items-center rounded-full bg-blue-100 text-blue-700"><Icon name="file" size={20} /></span>
<p className="text-sm font-bold text-slate-800">
Drag & drop an <b>Image</b> or <b>PDF</b> here
</p>
<p className="text-[11px] text-slate-500">or use buttons below</p>
</div>
</div>

<div className="flex flex-wrap gap-2">
<label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-blue-300 hover:bg-blue-50/60 hover:text-blue-700">
<Icon name="file" size={14} /> Upload Image
<input ref={imgInputRef} hidden type="file" accept="image/*" onChange={onImageUpload} /> {/* NEW */}
</label>

<label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-blue-300 hover:bg-blue-50/60 hover:text-blue-700">
<Icon name="book" size={14} /> Upload PDF
<input ref={pdfInputRef} hidden type="file" accept="application/pdf" onChange={onPDFUpload} /> {/* NEW */}
</label>
</div>

{/* Size & Mode */}
<div className="space-y-2 rounded-xl border border-slate-200 bg-white p-3 shadow-[0_10px_22px_rgba(15,23,42,0.05)]">
<div className="grid grid-cols-2 gap-3">
<div>
<label className="mb-1 block text-[11px] font-semibold text-slate-600">Width (px)</label>
<input
value={width}
onChange={(e) => setWidth(Number(e.target.value) || 0)}
className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
inputMode="numeric"
/>
</div>
<div>
<label className="mb-1 block text-[11px] font-semibold text-slate-600">Height (px)</label>
<input
value={height}
onChange={(e) => setHeight(Number(e.target.value) || 0)}
className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
inputMode="numeric"
/>
</div>
</div>

<div className="flex flex-wrap items-center gap-2">
<div className="inline-flex rounded-lg border border-slate-300 bg-slate-50 p-0.5">
<button
onClick={() => setFitMode("FIT")}
disabled={manualCrop}
className={`rounded-md px-3 py-1 text-xs font-semibold ${fitMode === "FIT" ? "bg-white text-blue-700 shadow" : "text-slate-600"} disabled:opacity-40`}
aria-pressed={fitMode === "FIT"}
title={manualCrop ? "Disabled when manual crop is ON" : "Fit (no crop)"}
>
Fit (no crop)
</button>
<button
onClick={() => setFitMode("FILL")}
disabled={manualCrop}
className={`rounded-md px-3 py-1 text-xs font-semibold ${fitMode === "FILL" ? "bg-white text-blue-700 shadow" : "text-slate-600"} disabled:opacity-40`}
aria-pressed={fitMode === "FILL"}
title={manualCrop ? "Disabled when manual crop is ON" : "Fill (center crop)"}
>
Fill (center crop)
</button>
</div>

<label className="inline-flex items-center gap-2 text-xs">
<input
type="checkbox"
checked={forceWhiteBg}
onChange={(e) => setForceWhiteBg(e.target.checked)}
className="accent-blue-600"
/>
Force white background
</label>

<div className="ml-auto flex items-center gap-2 text-xs">
<span className="font-semibold text-slate-600">Max KB</span>
<input
type="number"
min={15}
max={300}
value={targetKB}
onChange={(e) =>
setTargetKB(Math.max(15, Math.min(300, Number(e.target.value) || 50)))
}
className="w-20 rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-800"
/>
</div>
</div>

{/* Manual Crop Controls */}
<div className="mt-1 flex flex-wrap items-center gap-3">
<label className="inline-flex items-center gap-2 text-xs">
<input
type="checkbox"
checked={manualCrop}
onChange={(e) => setManualCrop(e.target.checked)}
className="accent-blue-600"
/>
Enable manual crop
</label>
<label className="inline-flex items-center gap-2 text-xs">
<input
type="checkbox"
checked={lockAspect}
onChange={(e) => setLockAspect(e.target.checked)}
className="accent-blue-600"
disabled={!manualCrop}
/>
Lock to preset aspect ({width}:{height})
</label>
<button
onClick={() => {
if (!originalImgRef.current) return;
const iw = originalImgRef.current.naturalWidth || 1;
const ih = originalImgRef.current.naturalHeight || 1;
const targetAR = aspect || 1;
let cw = Math.round(iw * 0.8);
let ch = Math.round(ih * 0.8);
if (lockAspect) {
if (iw / ih > targetAR) {
ch = Math.round(ih * 0.8);
cw = Math.round(ch * targetAR);
} else {
cw = Math.round(iw * 0.8);
ch = Math.round(cw / targetAR);
}
}
const cx = Math.round((iw - cw) / 2);
const cy = Math.round((ih - ch) / 2);
setCrop({ x: cx, y: cy, w: cw, h: ch });
}}
disabled={!manualCrop || !imageSrc}
className="rounded-lg border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 disabled:opacity-50"
>
Reset crop
</button>

{/* NEW: Reset All */}
<button
onClick={resetAll}
className="ml-auto rounded-lg border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50"
>
Reset All
</button>
</div>
</div>

{/* Action */}
<button
onClick={processImage}
disabled={busy || !imageSrc}
className="w-full rounded-xl bg-gradient-to-r from-[#2563EB] to-[#1d4ed8] py-2.5 text-sm font-bold text-white shadow-[0_12px_22px_rgba(37,99,235,0.32)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
>
<span className="inline-flex items-center justify-center gap-2"><Icon name="settings" size={16} />{busy ? "Processing…" : `Resize & Compress (≤${TARGET_KB}KB)`}</span>
</button>

{/* Status */}
{status && (
<div
className={`text-xs rounded-md px-2.5 py-1.5 border ${
status.type === "error"
? "border-rose-200 bg-rose-50 text-rose-700"
: status.type === "success"
? "border-emerald-200 bg-emerald-50 text-emerald-700"
: "border-blue-200 bg-blue-50 text-blue-700"
}`}
role={status.type === "error" ? "alert" : "status"}
>
{status.msg}
</div>
)}
</section>

{/* Right column: Preview & downloads */}
<section className="md:col-span-3 space-y-3">
<div className="h-full rounded-xl border border-slate-200 bg-white p-3 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
{/* Original Preview + Manual Crop Overlay */}
<div className="overflow-hidden rounded-lg border border-slate-200 bg-[#fbfdff]">
<div className="flex items-center gap-2 border-b border-slate-200 px-2 py-1.5 text-[11px] font-semibold text-slate-600">
<span>Original</span>
{manualCrop && crop && (
<span className="ml-auto text-[10px] text-slate-500">
Crop: x{crop.x} y{crop.y} w{crop.w} h{crop.h}
</span>
)}
</div>
<div className="p-2">
{imageSrc ? (
<div className="relative inline-block">
<img
ref={originalImgRef}
src={imageSrc}
alt="Original"
className="block max-h-64 max-w-full"
/>
{manualCrop && (
<CropOverlay
imgRef={originalImgRef}
crop={crop}
setCrop={setCrop}
lockAspect={lockAspect}
aspect={aspect}
/>
)}
</div>
) : (
<div className="text-[11px] text-slate-500 p-4 text-center">
No image loaded
</div>
)}
</div>
</div>

{/* Processed Preview */}
<div className="overflow-hidden rounded-lg border border-slate-200 bg-[#fbfdff]">
<div className="border-b border-slate-200 px-2 py-1.5 text-[11px] font-semibold text-slate-600">
Processed
</div>
<div className="aspect-video md:aspect-square grid place-items-center p-2">
{busy ? (
<div className="w-full h-36 animate-pulse rounded bg-slate-200/70 dark:bg-slate-700/50" />
) : outputSrc ? (
<img src={outputSrc} alt="Processed" className="max-h-64 object-contain" />
) : (
<div className="text-[11px] text-slate-500">Run processing to preview</div>
)}
</div>
<div className="px-2 pb-2 text-[11px] text-center">
{finalSize ? (
<span>
Final Size: <b>{finalSize} KB</b>
</span>
) : (
<span className="text-slate-400">Size will appear here</span>
)}
</div>
</div>
</div>

<div className="mt-3 grid grid-cols-2 gap-2">
<button
onClick={downloadImage}
disabled={!outputSrc}
className="rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 py-2 text-sm font-bold text-white shadow-[0_10px_20px_rgba(5,150,105,0.24)] transition hover:brightness-105 disabled:opacity-50"
>
<span className="inline-flex items-center justify-center gap-1.5"><Icon name="file" size={15} /> Download Image</span>
</button>
<button
onClick={downloadPDF}
disabled={!outputSrc}
className="rounded-xl bg-gradient-to-r from-slate-800 to-slate-700 py-2 text-sm font-bold text-white shadow-[0_10px_18px_rgba(15,23,42,0.25)] transition hover:brightness-105 disabled:opacity-50"
>
<span className="inline-flex items-center justify-center gap-1.5"><Icon name="book" size={15} /> Download PDF</span>
</button>
</div>

<div className="mt-2 text-center text-[11px] text-slate-500">
Tip: Enable <b>manual crop</b> to frame face/signature precisely. Lock aspect for exact portal dimensions.
</div>
</div>
</section>
</div>

{/* Footer Tips */}
<div className="border-t border-[#2563EB]/15 bg-[#f8fbff] px-4 py-3 text-[11px] text-slate-600">
<ul className="list-disc pl-5 space-y-1">
<li>Use a white background, front-facing, no cap/goggles, no shadows.</li>
<li>Signatures: black ink on white paper for best contrast.</li>
<li>Manual crop overrides Fit/Fill; lock aspect to match the preset size.</li>
</ul>
</div>
</div>

{/* Hidden processing canvas */}
<canvas ref={canvasRef} className="hidden" />
</div>
</main>
);
}

export default ImageCompressor;
