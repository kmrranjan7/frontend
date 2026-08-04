"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { dashboardPostTemplates } from "@/components/dashboard/postTemplates";
import { Icon } from "@/components/ui/Icon";
import { env } from "@/config/env";
import { indianStates } from "@/data/indianStates";
import { qualifications } from "@/data/qualifications";

const Editor = dynamic(
  () => import("@tinymce/tinymce-react").then((module) => module.Editor),
  {
    ssr: false,
    loading: () => <div className="editor-loading">Loading editor…</div>,
  },
);

const postTypes = [
  "Job",
  "Admit",
  "Exam",
  "Result",
  "Admission",
  "Syllabus",
  "Answer Key",
  "Others",
] as const;

const POST_DRAFT_CACHE_KEY = "dashboard:new-post:draft:v1";

function createSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function countWordsFromHtml(value: string) {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;|&#160;/gi, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .length;
}

function truncateSeoText(value: string, maxLength: number) {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) return normalized;
  const textLimit = maxLength - 1;
  const shortened = normalized.slice(0, textLimit + 1);
  const lastSpace = shortened.lastIndexOf(" ");
  return `${shortened.slice(0, lastSpace > textLimit * 0.7 ? lastSpace : textLimit).trim()}…`;
}

function createSeoTitle(title: string) {
  const normalized = title.replace(/\s+/g, " ").trim();
  if (!normalized) return "";
  const brandedTitle = `${normalized} | Sarkari Global Result`;
  return truncateSeoText(brandedTitle.length <= 60 ? brandedTitle : normalized, 60);
}

function createMetaDescription(html: string, title: string) {
  const contentText = html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, "\"")
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();

  if (contentText) return truncateSeoText(contentText, 160);
  if (!title.trim()) return "";
  return truncateSeoText(
    `${title.trim()}. Check important dates, eligibility, application details, official notification, and the latest updates.`,
    160,
  );
}

function removeLegacyImagePlaceholder(value: string) {
  return value
    .replace(
      /<figure\b[^>]*class=["'][^"']*\bsarkari-image-area\b[^"']*["'][^>]*>[\s\S]*?<\/figure>/gi,
      "",
    )
    .replace(
      /<div\b[^>]*class=["'][^"']*\bsarkari-image-placeholder\b[^"']*["'][^>]*>[\s\S]*?<\/div>/gi,
      "",
    );
}

function extractImageUrls(value: string) {
  return Array.from(value.matchAll(/<img\b[^>]*\bsrc=["']([^"']+)["']/gi))
    .map((match) => match[1])
    .filter(Boolean)
    .join(",");
}

export default function NewContentPage() {
  const formRef = useRef<HTMLFormElement>(null);
  const autosaveTimerRef = useRef<number | null>(null);
  const seoTitleManualRef = useRef(false);
  const seoDescriptionManualRef = useRef(false);
  const [postTitle, setPostTitle] = useState("");
  const [postSlug, setPostSlug] = useState("");
  const [manualSlug, setManualSlug] = useState(false);
  const [autosavedAt, setAutosavedAt] = useState("");
  const [content, setContent] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState(dashboardPostTemplates[0].id);
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [seoTitleManual, setSeoTitleManual] = useState(false);
  const [seoDescriptionManual, setSeoDescriptionManual] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [saveError, setSaveError] = useState("");
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const automaticSlug = useMemo(() => createSlug(postTitle), [postTitle]);
  const displayedSlug = manualSlug ? postSlug : automaticSlug;
  const permalink = `${env.frontendUrl}/${displayedSlug}`;
  const selectedTemplate = dashboardPostTemplates.find(({ id }) => id === selectedTemplateId)
    ?? dashboardPostTemplates[0];
  const seoChecks = useMemo(() => [
    { label: "Permalink is ready", passed: displayedSlug.length >= 3 && displayedSlug.length <= 75 },
    { label: "SEO title is 30–60 characters", passed: seoTitle.trim().length >= 30 && seoTitle.trim().length <= 60 },
    { label: "Description is 120–160 characters", passed: seoDescription.trim().length >= 120 && seoDescription.trim().length <= 160 },
    { label: "Content has at least 100 words", passed: countWordsFromHtml(content) >= 100 },
  ], [content, displayedSlug, seoDescription, seoTitle]);
  const seoScore = seoChecks.filter(({ passed }) => passed).length * 25;
  const seoScoreLabel = seoScore >= 75 ? "Good" : seoScore >= 50 ? "Needs work" : "Incomplete";

  const uploadImage = async (file: Blob, progress?: (percent: number) => void) => {
    const body = new FormData();
    body.append("file", file);

    progress?.(25);

    const response = await fetch("/api/uploads/image", {
      method: "POST",
      body,
    });

    progress?.(80);

    if (!response.ok) {
      const errorPayload = await response.json().catch(() => null) as { message?: string } | null;
      throw new Error(errorPayload?.message ?? "The image could not be uploaded. Please try again.");
    }

    const payload = (await response.json()) as { readonly location?: string };

    if (!payload.location) {
      throw new Error("Image URL was not returned.");
    }

    progress?.(100);
    return payload.location;
  };


  useEffect(() => {
    const postId = new URLSearchParams(window.location.search).get("postId");
    if (!postId) return;

    const controller = new AbortController();

    fetch(`/api/v1/posts/${encodeURIComponent(postId)}`, {
      signal: controller.signal,
      cache: "no-store",
    })
      .then(async (response) => {
        const payload = await response.json() as {
          message?: string;
          data?: Record<string, unknown>;
        };
        if (!response.ok || !payload.data) {
          throw new Error(payload.message || "Unable to load the post.");
        }
        return payload.data;
      })
      .then((post) => {
        const value = (name: string) => post[name] == null ? "" : String(post[name]);
        const postType = value("postType")
          .toLowerCase()
          .split("_")
          .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
          .join(" ");

        setEditingPostId(postId);
        setPostTitle(value("postTitle"));
        setPostSlug(value("postSlug"));
        setManualSlug(true);
        setContent(value("contentHtml"));
        setSeoTitle(value("seoTitle"));
        setSeoDescription(value("seoDescription"));
        seoTitleManualRef.current = Boolean(value("seoTitle"));
        seoDescriptionManualRef.current = Boolean(value("seoDescription"));
        setSeoTitleManual(seoTitleManualRef.current);
        setSeoDescriptionManual(seoDescriptionManualRef.current);

        window.requestAnimationFrame(() => {
          if (!formRef.current) return;

          const formValues: Record<string, string> = {
            applicationId: value("applicationId"),
            department: value("department"),
            organization: value("organization"),
            qualification: value("qualification"),
            vacancies: value("vacancies"),
            startDate: value("startDate"),
            endDate: value("endDate"),
            stateName: value("stateName"),
            seoFocusKeyword: value("seoFocusKeyword"),
            priorityScore: value("priorityScore"),
          };

          for (const element of Array.from(formRef.current.elements)) {
            if (!(element instanceof HTMLInputElement || element instanceof HTMLSelectElement)) continue;
            if (element.name === "postType" && element instanceof HTMLInputElement) {
              element.checked = element.value === postType;
            } else if (element.name === "isFeatured" && element instanceof HTMLInputElement) {
              element.checked = Boolean(post.isFeatured);
            } else if (formValues[element.name] !== undefined) {
              element.value = formValues[element.name];
            }
          }
        });
      })
      .catch((error) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setSaveError(error instanceof Error ? error.message : "Unable to load the post.");
      });

    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).has("postId")) return;

    const cachedDraft = window.localStorage.getItem(POST_DRAFT_CACHE_KEY);
    if (!cachedDraft || !formRef.current) return;

    try {
      const draft = JSON.parse(cachedDraft) as {
        values?: Record<string, string>;
        manualSlug?: boolean;
        seoTitleManual?: boolean;
        seoDescriptionManual?: boolean;
        savedAt?: string;
      };
      const values = draft.values ?? {};
      if (values.postType === "Other") values.postType = "Others";
      const restoredContent = removeLegacyImagePlaceholder(values.content ?? "");

      if (restoredContent !== values.content) {
        values.content = restoredContent;
        window.localStorage.setItem(POST_DRAFT_CACHE_KEY, JSON.stringify({ ...draft, values }));
      }

      const frameId = window.requestAnimationFrame(() => {
        setPostTitle(values.postTitle ?? "");
        setPostSlug(values.postSlug ?? "");
        setManualSlug(Boolean(draft.manualSlug));
        setContent(restoredContent);
        setSeoTitle(values.seoTitle ?? "");
        setSeoDescription(values.seoDescription ?? "");
        seoTitleManualRef.current = draft.seoTitleManual ?? Boolean(values.seoTitle);
        seoDescriptionManualRef.current = draft.seoDescriptionManual ?? Boolean(values.seoDescription);
        setSeoTitleManual(seoTitleManualRef.current);
        setSeoDescriptionManual(seoDescriptionManualRef.current);
        setAutosavedAt(draft.savedAt ?? "");

        if (!formRef.current) return;

        for (const element of Array.from(formRef.current.elements)) {
          if (!(element instanceof HTMLInputElement || element instanceof HTMLSelectElement || element instanceof HTMLTextAreaElement)) continue;
          if (["postTitle", "postSlug", "content", "seoTitle", "seoDescription"].includes(element.name)) continue;

          if (element instanceof HTMLInputElement && (element.type === "radio" || element.type === "checkbox")) {
            element.checked = values[element.name] === element.value || values[element.name] === "true";
          } else if (values[element.name] !== undefined) {
            element.value = values[element.name];
          }
        }
      });

      return () => window.cancelAnimationFrame(frameId);
    } catch {
      window.localStorage.removeItem(POST_DRAFT_CACHE_KEY);
    }
  }, []);

  useEffect(() => () => {
    if (autosaveTimerRef.current) window.clearTimeout(autosaveTimerRef.current);
  }, []);

  useEffect(() => {
    if (!saveMessage && !saveError) return;

    const timer = window.setTimeout(() => {
      setSaveMessage("");
      setSaveError("");
    }, 6000);

    return () => window.clearTimeout(timer);
  }, [saveError, saveMessage]);

  function cacheFormDraft() {
    setSaveMessage("");
    setSaveError("");

    if (autosaveTimerRef.current) window.clearTimeout(autosaveTimerRef.current);

    autosaveTimerRef.current = window.setTimeout(() => {
      if (!formRef.current) return;

      const values = Object.fromEntries(
        Array.from(new FormData(formRef.current).entries()).map(([key, value]) => [key, String(value)]),
      );
      const savedAt = new Date().toLocaleTimeString("en-IN", { hour12: false });

      window.localStorage.setItem(POST_DRAFT_CACHE_KEY, JSON.stringify({
        values,
        manualSlug: values.postSlug !== createSlug(values.postTitle ?? ""),
        seoTitleManual: seoTitleManualRef.current,
        seoDescriptionManual: seoDescriptionManualRef.current,
        savedAt,
      }));
      setAutosavedAt(savedAt);
    }, 500);
  }

  function clearCachedDraft() {
    if (autosaveTimerRef.current) window.clearTimeout(autosaveTimerRef.current);
    window.localStorage.removeItem(POST_DRAFT_CACHE_KEY);
    setAutosavedAt("");
  }

  function resetFormAndCache() {
    const confirmed = window.confirm("Reset this post? All unsaved form data and browser cache will be removed.");
    if (!confirmed) return;

    clearCachedDraft();
    formRef.current?.reset();
    setPostTitle("");
    setPostSlug("");
    setManualSlug(false);
    setContent("");
    setSeoTitle("");
    setSeoDescription("");
    seoTitleManualRef.current = false;
    seoDescriptionManualRef.current = false;
    setSeoTitleManual(false);
    setSeoDescriptionManual(false);
    setSelectedTemplateId(dashboardPostTemplates[0].id);
    setEditingPostId(null);
    window.history.replaceState(null, "", "/dashboard/content/new");
  }

  async function savePost(postStatus: "DRAFT" | "PUBLISHED") {
    const form = formRef.current;
    if (!form || saving) return;

    setSaveMessage("");
    setSaveError("");

    if (!form.reportValidity()) return;
    if (countWordsFromHtml(content) < 2) {
      setSaveError("Add post content before saving.");
      return;
    }

    const formData = new FormData(form);
    const text = (name: string) => String(formData.get(name) ?? "").trim();
    const nullableText = (name: string) => text(name) || null;
    const vacanciesValue = text("vacancies");
    const priorityValue = text("priorityScore");

    const payload = {
      postTitle: postTitle.trim(),
      postSlug: displayedSlug,
      contentHtml: content,
      applicationId: nullableText("applicationId"),
      department: nullableText("department"),
      organization: nullableText("organization"),
      qualification: nullableText("qualification"),
      imageUrls: extractImageUrls(content) || null,
      vacancies: vacanciesValue ? Number(vacanciesValue) : null,
      startDate: nullableText("startDate"),
      endDate: nullableText("endDate"),
      stateName: nullableText("stateName"),
      seoTitle: seoTitle.trim() || null,
      seoDescription: seoDescription.trim() || null,
      seoFocusKeyword: nullableText("seoFocusKeyword"),
      faqSchemaJson: null,
      postStatus,
      scheduledAt: null,
      postType: text("postType").toUpperCase().replace(/\s+/g, "_"),
      isFeatured: formData.get("isFeatured") === "on",
      priorityScore: priorityValue ? Number(priorityValue) : 0,
    };

    setSaving(true);

    try {
      const response = await fetch(
        editingPostId
          ? `/api/v1/posts/${encodeURIComponent(editingPostId)}`
          : "/api/v1/posts",
        {
        method: editingPostId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json() as {
        message?: string;
        errors?: readonly { message?: string }[];
        data?: { id?: string };
      };

      if (!response.ok) {
        if (response.status === 409) {
          const conflictMessage = result.message?.toLowerCase() ?? "";

          if (conflictMessage.includes("title")) {
            throw new Error("A post with this title already exists. Enter a different post title, then try again.");
          }

          if (conflictMessage.includes("slug")) {
            throw new Error("This permalink is already in use. Change the permalink, then try again.");
          }

          throw new Error("A post with these details already exists. Change the title and permalink, then try again.");
        }

        throw new Error(result.errors?.[0]?.message ?? result.message ?? "The post could not be saved.");
      }

      clearCachedDraft();
      if (result.data?.id) {
        setEditingPostId(result.data.id);
        window.history.replaceState(
          null,
          "",
          `/dashboard/content/new?postId=${encodeURIComponent(result.data.id)}`,
        );
      }
      setSaveMessage(editingPostId
        ? "Post updated successfully."
        : postStatus === "PUBLISHED"
          ? "Post published successfully."
          : "Draft saved successfully.");
    } catch (error) {
      setSaveError(error instanceof Error
        ? error.message
        : "The post could not be saved. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <DashboardHeader title={editingPostId ? "Edit post" : "Create new post"} eyebrow="Content" />
      {(saveMessage || saveError) && (
        <div className={`save-toast ${saveError ? "error" : "success"}`} role={saveError ? "alert" : "status"}>
          <span>{saveError ? "!" : "✓"}</span>
          <div>
            <strong>{saveError ? "Unable to save post" : "Post saved"}</strong>
            <p>{saveError || saveMessage}</p>
          </div>
          <button
            type="button"
            aria-label="Dismiss message"
            onClick={() => {
              setSaveMessage("");
              setSaveError("");
            }}
          >
            ×
          </button>
        </div>
      )}
      <div className="dashboard-content">
        <form
          ref={formRef}
          className="post-form"
          onChange={cacheFormDraft}
          onSubmit={(event) => {
            event.preventDefault();
            void savePost("PUBLISHED");
          }}
        >
          <div className="post-form-main">
            <section className="panel form-card">
              <div className="form-section-heading">
                <span>01</span>
                <div>
                  <h2>Post basics</h2>
                  <p>Enter a clear, descriptive title and select the appropriate post type.</p>
                </div>
              </div>

              <div className="form-grid">
                <label className="form-field form-field-wide">
                  <span>Post title <b>*</b></span>
                  <input
                    name="postTitle"
                    required
                    placeholder="e.g. SSC CGL Recruitment 2026"
                    value={postTitle}
                    onChange={(event) => {
                      const nextTitle = event.target.value;
                      setPostTitle(nextTitle);
                      if (!seoTitleManual) setSeoTitle(createSeoTitle(nextTitle));
                      if (!seoDescriptionManual && !content.trim()) {
                        setSeoDescription(createMetaDescription("", nextTitle));
                      }
                    }}
                  />
                  <small>Use a specific title that readers can understand at a glance.</small>
                </label>

                <label className="form-field form-field-wide">
                  <span>Permalink <b>*</b></span>
                  <div className="input-prefix">
                    <span>/</span>
                    <input
                      name="postSlug"
                      required
                      placeholder="ssc-cgl-recruitment-2026"
                      value={displayedSlug}
                      onChange={(event) => {
                        setManualSlug(true);
                        setPostSlug(createSlug(event.target.value));
                      }}
                    />
                  </div>
                </label>

                <div className="permalink-panel form-field-wide">
                  <p><strong>Permalink:</strong> <a href={permalink} target="_blank" rel="noreferrer">{permalink}</a></p>
                  <div>
                    <button
                      type="button"
                      onClick={() => {
                        setManualSlug(false);
                      }}
                    >
                      Reset to auto slug
                    </button>
                    <span>{autosavedAt ? `Autosaved at ${autosavedAt}` : "Waiting for changes"}</span>
                  </div>
                </div>
              </div>

              <fieldset className="radio-field">
                <legend>Post type <b>*</b></legend>
                <div className="post-type-grid">
                  {postTypes.map((value, index) => (
                    <label className="post-type-option" key={value}>
                      <input type="radio" name="postType" value={value} defaultChecked={index === 0} />
                      <span className="radio-mark" />
                      <strong>{value}</strong>
                    </label>
                  ))}
                </div>
              </fieldset>
            </section>

            <section className="panel form-card">
              <div className="form-section-heading">
                <span>02</span>
                <div>
                  <h2>Application details</h2>
                  <p>Enter the organization, eligibility, vacancies, and dates.</p>
                </div>
              </div>

              <div className="form-grid">
                <label className="form-field">
                  <span>Application ID</span>
                  <input name="applicationId" placeholder="SSC-CGL-2026" />
                </label>
                <label className="form-field">
                  <span>Organization <b>*</b></span>
                  <input name="organization" required placeholder="Staff Selection Commission" />
                </label>
                <label className="form-field">
                  <span>Department</span>
                  <input name="department" placeholder="Government of India" />
                </label>
                <label className="form-field">
                  <span>Qualification <b>*</b></span>
                  <select name="qualification" required defaultValue="">
                    <option value="" disabled>Select qualification</option>
                    {qualifications.map((qualification) => (
                      <option key={qualification} value={qualification}>{qualification}</option>
                    ))}
                  </select>
                </label>
                <label className="form-field">
                  <span>State</span>
                  <select name="stateName" defaultValue="All India">
                    {indianStates.map((state) => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </label>
                <label className="form-field">
                  <span>Total vacancies</span>
                  <input type="number" name="vacancies" min="0" placeholder="0" />
                </label>
                <label className="form-field">
                  <span>Application start date</span>
                  <input type="date" name="startDate" />
                </label>
                <label className="form-field">
                  <span>Application end date</span>
                  <input type="date" name="endDate" />
                </label>
              </div>
            </section>

            <section className="panel form-card">
              <div className="form-section-heading">
                <span>03</span>
                <div>
                  <h2>Post content</h2>
                  <p>Write the complete notification for your readers.</p>
                </div>
              </div>
              <div className="template-picker">
                <div>
                  <span><Icon name="spark" size={17} /></span>
                  <div>
                    <strong>Start with a template</strong>
                    <small>Insert a structured format and customize the details.</small>
                  </div>
                </div>
                <div>
                  <select
                    aria-label="Post template"
                    value={selectedTemplateId}
                    onChange={(event) => setSelectedTemplateId(event.target.value)}
                  >
                    {dashboardPostTemplates.map((template) => (
                      <option key={template.id} value={template.id}>{template.label}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => {
                      const templateContent = `<section class="sarkari-template-block">${selectedTemplate.html}</section><p>&nbsp;</p>`;
                      setContent(templateContent);
                      if (!seoDescriptionManual) {
                        setSeoDescription(createMetaDescription(templateContent, postTitle));
                      }
                      cacheFormDraft();
                    }}
                  >
                    Use template
                  </button>
                </div>
              </div>
              <div className="form-field">
                <span>Content <b>*</b></span>
                <div className="tinymce-shell">
                  <Editor
                    tinymceScriptSrc="/tinymce/tinymce.min.js"
                    textareaName="content"
                    id="post-content"
                  apiKey="no-api-key"
                  licenseKey="gpl"
                    value={content}
                    onEditorChange={(value) => {
                      setContent(value);
                      if (!seoDescriptionManual) {
                        setSeoDescription(createMetaDescription(value, postTitle));
                      }
                      cacheFormDraft();
                    }}
                    init={{
                      height: 500,

    // UI
    menubar: true,
    branding: false,
    browser_spellcheck: true,
    contextmenu: "link image table",
    toolbar_sticky: true,
    resize: true,

    // Uploads
    automatic_uploads: true,

    // Plugins
    plugins: [
      "advlist",
      "autolink",
      "lists",
      "link",
      "image",
      "charmap",
      "preview",
      "anchor",
      "searchreplace",
      "visualblocks",
      "code",
      "fullscreen",
      "insertdatetime",
      "media",
      "table",
      "help",
      "wordcount",
      "emoticons",
      "codesample",
      "pagebreak",
      "nonbreaking",
      "quickbars"
    ].join(" "),

    // Toolbar
    toolbar: [
      "undo redo | blocks fontfamily fontsize",
      "| bold italic underline strikethrough",
      "| forecolor backcolor",
      "| alignleft aligncenter alignright alignjustify",
      "| bullist numlist outdent indent",
      "| blockquote",
      "| table",
      "| link image media",
      "| emoticons charmap",
      "| codesample",
      "| pagebreak",
      "| removeformat",
      "| code fullscreen preview"
    ].join(" "),
    // Font sizes
    fontsize_formats:
      "8pt 10pt 12pt 14pt 16pt 18pt 24pt 30pt 36pt 48pt",

    // Font families
    font_family_formats:
      "Arial=arial,helvetica,sans-serif;" +
      "Calibri=calibri,sans-serif;" +
      "Courier New=courier new,courier,monospace;" +
      "Georgia=georgia,palatino,serif;" +
      "Helvetica=helvetica;" +
      "Tahoma=tahoma,arial,helvetica,sans-serif;" +
      "Times New Roman=times new roman,times;" +
      "Verdana=verdana,geneva,sans-serif",

    // Table defaults
    table_default_attributes: {
      border: "1"
    },

    table_default_styles: {
      width: "100%",
      borderCollapse: "collapse"
    },

    // Quick toolbar on selection
    quickbars_selection_toolbar:
      "bold table h1 h2 h3 forecolor backcolor",

    quickbars_insert_toolbar:
      "image h1 h2 table",

                    images_upload_handler: async (
                      blobInfo: { readonly blob: () => Blob },
                      progress: (percent: number) => void,
                    ) => {
                      return uploadImage(blobInfo.blob(), progress);
                    },
                    content_style:
                      "body { margin: 0; padding: 14px; background: #f8fafc; color: #0f172a; font-family: Georgia, 'Times New Roman', serif; font-size: 15px; line-height: 1.72; } " +
                      ".sarkari-template-block { border: 1px solid #dbeafe; background: #ffffff; border-radius: 12px; padding: 14px; box-shadow: 0 8px 18px rgba(15, 23, 42, 0.06); } " +
                      ".post-recruitment-overview { padding: 18px 20px; margin: 0 0 22px; border: 1px solid #bfdbfe; border-left: 5px solid #2563eb; border-radius: 10px; background: linear-gradient(135deg, #eff6ff, #ffffff); box-shadow: 0 8px 22px rgba(30, 64, 175, 0.07); } " +
                      ".sarkari-template-block .post-recruitment-overview h2 { padding: 0; margin: 0 0 9px; border: 0; background: transparent; color: #1e3a8a; font-size: 18px; font-weight: 800; } " +
                      ".post-recruitment-overview div { color: #334155; font-size: 14px; line-height: 1.75; } " +
                      ".sarkari-template-block h2 { margin: 0 0 10px; font-size: 1.35rem; line-height: 1.35; color: #0f172a; background: linear-gradient(90deg, #e0f2fe, #dbeafe); border: 1px solid #bfdbfe; border-radius: 10px; padding: 8px 10px; } " +
                      ".sarkari-template-block h3 { margin: 14px 0 8px; font-size: 1.05rem; color: #1e3a8a; border-left: 4px solid #2563eb; padding-left: 8px; } " +
                      ".sarkari-template-block > h3:not(:last-of-type):not(:has(img)) { padding: 9px 11px; margin: 22px 0 10px; border-left: 4px solid #2563eb; border-radius: 7px 7px 0 0; color: #1e3a8a; font-size: 17px; font-weight: bold; } " +
                      ".sarkari-template-block > h3:has(img) { padding-left: 0; border-left: 0; } " +
                      ".sarkari-template-block > h3:last-of-type { padding: 0 0 8px; margin: 22px 0 8px; border-left: 0; border-bottom: 2px solid #2563eb; color: #1e3a8a; font-size: 17px; } " +
                      ".sarkari-template-block h4 { margin: 12px 0 6px; font-size: 0.98rem; color: #1e40af; } " +
                      ".sarkari-template-block p { margin: 0 0 10px; } " +
                      ".sarkari-template-block ul, .sarkari-template-block ol { margin: 0 0 10px 22px; padding: 0; } " +
                      ".sarkari-template-block ul { list-style: disc; } " +
                      ".sarkari-template-block ol { list-style: decimal; } " +
                      ".sarkari-template-block ul li::marker, .sarkari-template-block ol li::marker { color: #2563eb; font-weight: 800; } " +
                      ".sarkari-template-block li { margin: 0 0 6px; } " +
                      ".sarkari-template-block strong { color: #111827; } " +
                      ".sarkari-template-block a { color: #1d4ed8; text-decoration: underline; font-weight: 600; } " +
                      ".sarkari-template-block table a { display: inline-flex; min-height: 28px; align-items: center; justify-content: center; padding: 4px 10px; border-radius: 6px; background: #dbeafe; color: #1d4ed8; font-weight: 800; text-decoration: none; white-space: nowrap; } " +
                      ".sarkari-template-block table a:hover { background: #bfdbfe; } " +
                      ".sarkari-template-block table a[href*='whatsapp.com'] { background: #dcfce7; color: #15803d; } " +
                      ".sarkari-template-block table a[href*='whatsapp.com']:hover { background: #bbf7d0; color: #166534; } " +
                      ".sarkari-template-block table a[href*='t.me'] { background: #e0f2fe; color: #0369a1; } " +
                      ".sarkari-template-block table a[href*='t.me']:hover { background: #bae6fd; color: #075985; } " +
                      ".sarkari-template-block table a[href$='.pdf'], .sarkari-template-block table a[href*='.pdf?'] { background: #fee2e2; color: #b91c1c; } " +
                      ".sarkari-template-block table a[href$='.pdf']:hover, .sarkari-template-block table a[href*='.pdf?']:hover { background: #fecaca; color: #991b1b; } " +
                      ".sarkari-template-block table a[href*='sarkariresultportal.com'] { background: #f3e8ff; color: #7e22ce; } " +
                      ".sarkari-template-block table a[href*='sarkariresultportal.com']:hover { background: #e9d5ff; color: #6b21a8; } " +
                      ".sarkari-template-block table a[href*='bpssc.bihar.gov.in']:not([href*='.pdf']) { background: #e0e7ff; color: #3730a3; } " +
                      ".sarkari-template-block table a[href*='bpssc.bihar.gov.in']:not([href*='.pdf']):hover { background: #c7d2fe; color: #312e81; } " +
                      ".sarkari-template-block table { width: 100%; overflow: hidden; margin: 12px 0 20px; border: 1px solid #cbd5e1; border-radius: 10px; border-collapse: separate; border-spacing: 0; background: #ffffff; box-shadow: 0 7px 20px rgba(15, 23, 42, 0.06); font-size: 13px; line-height: 1.55; } " +
                      ".sarkari-template-block table caption { padding: 9px 12px; color: #1e3a8a; font-size: 14px; font-weight: 800; text-align: left; } " +
                      ".sarkari-template-block th, .sarkari-template-block td { min-width: 110px; padding: 11px 13px; border: 0; border-right: 1px solid #dbe3ee; border-bottom: 1px solid #dbe3ee; text-align: left; vertical-align: top; overflow-wrap: anywhere; } " +
                      ".sarkari-template-block th { background: #1e3a8a; color: #ffffff; font-size: 12px; font-weight: 800; letter-spacing: 0.01em; } " +
                      ".sarkari-template-block tr:nth-child(even) td { background: #f8fbff; } " +
                      ".sarkari-template-block tr:last-child td { border-bottom: 0; } " +
                      ".sarkari-template-block th:last-child, .sarkari-template-block td:last-child { border-right: 0; } " +
                      ".sarkari-template-block h3:last-of-type + ul { margin: 8px 0 18px; padding: 0; list-style: none; counter-reset: faq; } " +
                      ".sarkari-template-block h3:last-of-type + ul li { position: relative; margin: 0; padding: 13px 0 13px 42px; border-bottom: 1px solid #dbeafe; counter-increment: faq; } " +
                      ".sarkari-template-block h3:last-of-type + ul li::before { content: counter(faq, decimal-leading-zero); position: absolute; top: 14px; left: 0; color: #2563eb; font-size: 12px; font-weight: 800; } " +
                      ".sarkari-template-block h3:last-of-type + ul li strong:first-child { display: inline-block; margin-bottom: 6px; color: #1e3a8a; font-size: 1rem; } " +
                      ".sarkari-template-block h3:last-of-type + ul li br + strong { color: #2563eb; } " +
                      ".candidate-notice { display: flex; align-items: center; gap: 12px; margin: 20px 0 4px; padding: 14px 0; border-top: 1px solid #bfdbfe; border-bottom: 1px solid #bfdbfe; } " +
                      ".candidate-notice-mark { width: 32px; height: 32px; display: grid; place-items: center; flex: none; border-radius: 50%; background: #1d4ed8; color: #ffffff; font-weight: 800; } " +
                      ".candidate-notice div { display: flex; flex-direction: column; gap: 4px; } " +
                      ".candidate-notice small { color: #2563eb; font-size: 0.7rem; font-weight: 800; letter-spacing: 0.1em; } " +
                      ".candidate-notice strong { color: #172554; font-size: 0.98rem; line-height: 1.5; } " +
                      "blockquote { border-left: 4px solid #93c5fd; margin: 10px 0; padding: 6px 0 6px 10px; color: #334155; background: #f8fafc; border-radius: 4px; }",
                  }}
                />
                </div>
                <small>{countWordsFromHtml(content)} words · Aim for at least 100 words.</small>
              </div>
            </section>

            <section className="panel form-card seo-form-card">
              <div className="form-section-heading">
                <span>04</span>
                <div>
                  <h2>Search preview</h2>
                  <p>Help candidates discover this post through search.</p>
                </div>
              </div>
              <div className="form-grid">
                <label className="form-field form-field-wide">
                  <span>SEO title</span>
                  <input
                    name="seoTitle"
                    maxLength={60}
                    placeholder="SSC CGL Recruitment 2026 – Apply Online"
                    value={seoTitle}
                    onChange={(event) => {
                      seoTitleManualRef.current = true;
                      setSeoTitleManual(true);
                      setSeoTitle(event.target.value);
                    }}
                  />
                  <small>{seoTitleManual ? "Custom SEO title" : "Generated automatically from the post title"} · Up to 60 characters.</small>
                </label>
                <label className="form-field form-field-wide">
                  <span>Meta description</span>
                  <textarea
                    name="seoDescription"
                    rows={3}
                    maxLength={160}
                    placeholder="Add a concise summary for search results…"
                    value={seoDescription}
                    onChange={(event) => {
                      seoDescriptionManualRef.current = true;
                      setSeoDescriptionManual(true);
                      setSeoDescription(event.target.value);
                    }}
                  />
                  <small>{seoDescriptionManual ? "Custom meta description" : "Generated automatically from post content"} · Up to 160 characters.</small>
                </label>
                <label className="form-field form-field-wide">
                  <span>SEO focus keyword</span>
                  <input
                    name="seoFocusKeyword"
                    maxLength={160}
                    placeholder="e.g. SSC CGL Recruitment 2026"
                  />
                  <small>Use the primary phrase candidates are likely to search for.</small>
                </label>

                <section className="seo-snippet form-field-wide" aria-label="SEO snippet preview">
                  <div className="seo-snippet-heading">
                    <div>
                      <span>SEO Snippet Preview</span>
                      <p>This is how the post may appear in search results.</p>
                    </div>
                    <span>Desktop</span>
                  </div>
                  <div className="seo-snippet-result">
                    <div className="seo-snippet-site">
                      <span>SGR</span>
                      <div>
                        <strong>Sarkari Global Result</strong>
                        <small>{permalink}</small>
                      </div>
                    </div>
                    <h3>{seoTitle.trim() || postTitle.trim() || "Your SEO title will appear here"}</h3>
                    <p>
                      {seoDescription.trim()
                        || "Add a useful meta description to show candidates what this post contains before they open it."}
                    </p>
                  </div>
                </section>
              </div>
            </section>
          </div>

          <aside className="post-form-side">
            <section className="panel seo-score-card">
              <div className="seo-score-top">
                <div
                  className="seo-score-ring"
                  style={{ background: `conic-gradient(#2563eb ${seoScore}%, #dbeafe 0)` }}
                >
                  <span>{seoScore}</span>
                </div>
                <div>
                  <span>SEO SCORE</span>
                  <h2>{seoScoreLabel}</h2>
                  <p>Complete the checks below to improve visibility.</p>
                </div>
              </div>
              <div className="seo-check-list">
                {seoChecks.map(({ label, passed }) => (
                  <div className={passed ? "passed" : ""} key={label}>
                    <span>{passed ? "✓" : "○"}</span>
                    <p>{label}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="panel publish-card">
              <div className="publish-accent" />
              <div className="publish-heading">
                <div>
                  <h2>Publish</h2>
                  <p>Choose how this post will appear.</p>
                </div>
                <span className="status-dot">Draft</span>
              </div>
              <label className="form-field">
                <span>Priority score</span>
                <input type="number" name="priorityScore" min="0" max="100" defaultValue="0" />
                <small>Use 0–100 to control display priority.</small>
              </label>
              <label className="check-option">
                <input type="checkbox" name="isFeatured" />
                <span>
                  <strong>Featured post</strong>
                  <small>Show this post in highlighted sections.</small>
                </span>
              </label>
              <div className="publish-actions">
                <button type="submit" className="button button-primary" disabled={saving}>
                  <Icon name="check" size={17} /> {saving ? "Saving…" : "Publish post"}
                </button>
                <button
                  type="button"
                  className="button button-quiet"
                  disabled={saving}
                  onClick={() => void savePost("DRAFT")}
                >
                  Save draft
                </button>
                <button type="button" className="reset-form-button" onClick={resetFormAndCache}>
                  Reset form and clear cache
                </button>
              </div>
              {saveMessage && <p className="save-feedback success" role="status">{saveMessage}</p>}
              {saveError && <p className="save-feedback error" role="alert">{saveError}</p>}
            </section>

            <section className="panel form-help">
              <span><Icon name="spark" size={18} /></span>
              <div>
                <strong>Before publishing</strong>
                <p>Confirm dates, qualification, official links, and vacancy details.</p>
              </div>
            </section>

            <Link href="/dashboard/content" className="back-link">← Back to content library</Link>
          </aside>
        </form>
      </div>
    </>
  );
}
