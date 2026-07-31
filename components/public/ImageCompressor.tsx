"use client";

import { useEffect, useState } from "react";

export function ImageCompressor() {
  const [file, setFile] = useState<File | null>(null);
  const [quality, setQuality] = useState(75);
  const [resultUrl, setResultUrl] = useState("");
  const [resultSize, setResultSize] = useState(0);
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => () => { if (resultUrl) URL.revokeObjectURL(resultUrl); }, [resultUrl]);

  async function compress() {
    if (!file) return;
    setWorking(true);
    setMessage("");
    try {
      const bitmap = await createImageBitmap(file);
      const maxWidth = 1920;
      const scale = Math.min(1, maxWidth / bitmap.width);
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(bitmap.width * scale));
      canvas.height = Math.max(1, Math.round(bitmap.height * scale));
      canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      bitmap.close();
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", quality / 100));
      if (!blob) throw new Error("Compression failed");
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      setResultUrl(URL.createObjectURL(blob));
      setResultSize(blob.size);
    } catch {
      setMessage("Unable to process this image. Try a JPG, PNG, or WebP file.");
    } finally {
      setWorking(false);
    }
  }

  return (
    <section className="compressor-panel">
      <label className="compressor-drop"><strong>Select an image</strong><span>JPG, PNG, or WebP · processed only in your browser</span><input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => { setFile(event.target.files?.[0] ?? null); setResultUrl(""); setResultSize(0); }} /></label>
      <label className="compressor-quality"><span>Quality: {quality}%</span><input type="range" min="40" max="95" value={quality} onChange={(event) => setQuality(Number(event.target.value))} /></label>
      {file ? <p className="compressor-file">Original: {file.name} · {(file.size / 1024).toFixed(1)} KB</p> : null}
      <button className="button button-primary" type="button" disabled={!file || working} onClick={() => void compress()}>{working ? "Compressing…" : "Compress image"}</button>
      {message ? <p className="compressor-error" role="alert">{message}</p> : null}
      {resultUrl ? <div className="compressor-result"><strong>Compressed: {(resultSize / 1024).toFixed(1)} KB</strong><a className="button button-quiet" href={resultUrl} download="compressed-image.webp">Download WebP</a></div> : null}
    </section>
  );
}
