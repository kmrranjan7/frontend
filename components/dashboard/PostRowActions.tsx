"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function PostRowActions({ postId }: { postId: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState("");

  async function deletePost() {
    setDeleting(true);
    setError("");

    try {
      const response = await fetch(`/api/v1/posts/${encodeURIComponent(postId)}`, {
        method: "DELETE",
      });
      const payload = await response.json() as { message?: string };

      if (!response.ok) throw new Error(payload.message || "Unable to delete the post.");
      setConfirmOpen(false);
      router.refresh();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Unable to delete the post.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="row-actions">
      <Link href={`/dashboard/content/new?postId=${encodeURIComponent(postId)}`}>Edit</Link>
      <button type="button" onClick={() => setConfirmOpen(true)} disabled={deleting}>
        Delete
      </button>
      {error && <span role="alert">{error}</span>}
      {confirmOpen && (
        <div className="delete-modal-backdrop" role="presentation" onMouseDown={() => !deleting && setConfirmOpen(false)}>
          <section
            className="delete-modal"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby={`delete-title-${postId}`}
            aria-describedby={`delete-description-${postId}`}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="delete-modal-icon">!</div>
            <div className="delete-modal-copy">
              <span>PERMANENT ACTION</span>
              <h2 id={`delete-title-${postId}`}>Delete this post?</h2>
              <p id={`delete-description-${postId}`}>
                This post and its stored content will be permanently removed. This action cannot be undone.
              </p>
            </div>
            <div className="delete-modal-actions">
              <button type="button" className="button button-quiet" onClick={() => setConfirmOpen(false)} disabled={deleting}>
                Cancel
              </button>
              <button type="button" className="button delete-confirm-button" onClick={() => void deletePost()} disabled={deleting} autoFocus>
                {deleting ? "Deleting…" : "Delete permanently"}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
