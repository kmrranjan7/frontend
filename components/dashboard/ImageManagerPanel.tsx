"use client";

import { useCallback, useEffect, useState } from "react";

type ImageReference = {
  id: string;
  title: string;
  slug: string;
  postType: string;
  postStatus: string;
};

type ManagedImage = {
  name: string;
  url: string;
  references: ImageReference[];
};

type ImageMode = "matched" | "unmatched";

export function ImageManagerPanel() {
  const [images, setImages] = useState<ManagedImage[]>([]);
  const [mode, setMode] = useState<ImageMode>("matched");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [uploadMessage, setUploadMessage] = useState("");
  const [referencesUnavailable, setReferencesUnavailable] = useState(false);

  const loadImages = useCallback(async (selectedMode: ImageMode) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/images?mode=${selectedMode}&page=1&size=50`, { cache: "no-store" });
      const payload = (await response.json()) as {
        images?: ManagedImage[];
        message?: string;
        referencesUnavailable?: boolean;
      };
      if (!response.ok) throw new Error(payload.message ?? "Images could not be loaded.");
      setImages(payload.images ?? []);
      setReferencesUnavailable(Boolean(payload.referencesUnavailable));
      setError("");
    } catch (loadError) {
      setImages([]);
      setReferencesUnavailable(false);
      setError(loadError instanceof Error ? loadError.message : "Images could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadImages(mode), 0);
    return () => window.clearTimeout(timer);
  }, [loadImages, mode]);

  async function uploadImage(file?: File) {
    if (!file) return;
    setUploading(true);
    const body = new FormData();
    body.append("file", file);
    try {
      const response = await fetch("/api/uploads/image", { method: "POST", body });
      const payload = (await response.json()) as {
        message?: string;
        originalSize?: number;
        size?: number;
        compressed?: boolean;
      };
      if (!response.ok) throw new Error(payload.message ?? "Image upload failed.");
      const originalKb = Math.round((payload.originalSize ?? file.size) / 1024);
      const savedKb = Math.max(originalKb - Math.round((payload.size ?? file.size) / 1024), 0);
      setUploadMessage(payload.compressed
        ? `Image uploaded and compressed by ${savedKb} KB.`
        : "Image uploaded. It was already optimized, so the original size was kept.");
      await loadImages(mode);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Image upload failed.");
      setUploadMessage("");
    } finally {
      setUploading(false);
    }
  }

  async function copyUrl(image: ManagedImage) {
    const url = new URL(image.url, window.location.origin).toString();
    await navigator.clipboard.writeText(url);
    setCopied(image.name);
    window.setTimeout(() => setCopied((current) => current === image.name ? null : current), 1400);
  }

  async function deleteImage(image: ManagedImage) {
    const referenceWarning = image.references.length
      ? ` This image is referenced by ${image.references.length} post(s).`
      : "";
    if (!window.confirm(`Delete ${image.name}?${referenceWarning}`)) return;

    const response = await fetch(`/api/images?name=${encodeURIComponent(image.name)}`, { method: "DELETE" });
    const payload = (await response.json()) as { message?: string };
    if (!response.ok) {
      setError(payload.message ?? "Image could not be deleted.");
      return;
    }
    setImages((current) => current.filter((item) => item.name !== image.name));
  }

  return (
    <section className="image-manager panel">
      <div className="image-manager-heading">
        <div>
          <span className="dashboard-eyebrow">MEDIA LIBRARY</span>
          <h1>Images</h1>
          <p>Upload images, copy their URLs, and see every post that uses them.</p>
        </div>
        <label className="button image-upload-button">
          {uploading ? "Uploading…" : "+ Upload image"}
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            disabled={uploading}
            onChange={(event) => {
              void uploadImage(event.target.files?.[0]);
              event.currentTarget.value = "";
            }}
          />
        </label>
      </div>

      <div className="image-manager-toolbar">
        <div className="image-tabs" role="tablist" aria-label="Image reference filter">
          <button className={mode === "matched" ? "active" : ""} onClick={() => setMode("matched")} type="button">Used in posts</button>
          <button className={mode === "unmatched" ? "active" : ""} onClick={() => setMode("unmatched")} type="button">Not used</button>
        </div>
        <button className="image-refresh" type="button" onClick={() => void loadImages(mode)}>Refresh</button>
      </div>

      {error && <p className="image-message error" role="alert">{error}</p>}
      {uploadMessage && <p className="image-message success" role="status">{uploadMessage}</p>}
      {referencesUnavailable && <p className="image-message warning">Images loaded, but post references are temporarily unavailable.</p>}

      {loading ? (
        <p className="image-manager-empty">Loading images…</p>
      ) : images.length === 0 ? (
        <p className="image-manager-empty">No images found in this group.</p>
      ) : (
        <div className="image-manager-grid">
          {images.map((image) => (
            <article className="image-card" key={image.name}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image.url} alt={image.name} loading="lazy" />
              <strong title={image.name}>{image.name}</strong>
              <div className="image-url-row">
                <input readOnly value={image.url} aria-label={`URL for ${image.name}`} onFocus={(event) => event.currentTarget.select()} />
                <button type="button" onClick={() => void copyUrl(image)}>{copied === image.name ? "Copied" : "Copy URL"}</button>
              </div>
              <div className="image-references">
                <b>{image.references.length ? `Used in ${image.references.length} post${image.references.length === 1 ? "" : "s"}` : "Not used in any post"}</b>
                {image.references.length > 0 && (
                  <ul>
                    {image.references.map((reference) => (
                      <li key={reference.id || reference.slug}>
                        <a href={reference.slug ? `/${reference.slug}` : undefined} target="_blank" rel="noreferrer">
                          <span>{reference.title}</span>
                          <small>{[reference.postType, reference.postStatus].filter(Boolean).join(" · ")}</small>
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="image-card-actions">
                <a href={image.url} target="_blank" rel="noreferrer">View</a>
                <button type="button" onClick={() => void deleteImage(image)}>Delete</button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
