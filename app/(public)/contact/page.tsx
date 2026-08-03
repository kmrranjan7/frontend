"use client";

import { useState } from "react";
import { SocialMediaLinks } from "@/components/public/SocialMediaLinks";

const backendOrigin = process.env.NEXT_PUBLIC_BACKEND_API_URL?.replace(/\/$/, "");
function getStringField(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function getValidationMessage(payload: {
  fullName: string;
  email: string;
  phone: string;
  inquiryType: string;
  subject: string;
  message: string;
}): string | null {
  if (payload.fullName.length < 2) return "Please enter a name with at least 2 characters.";
  if (!/^\S+@\S+\.\S+$/.test(payload.email)) return "Please enter a valid email address.";
  if (!/^\d{10}$/.test(payload.phone)) return "Please enter a valid 10-digit mobile number.";
  if (!payload.inquiryType) return "Please select an inquiry type.";
  if (payload.subject.length < 3) return "Subject must be at least 3 characters.";
  if (payload.message.length < 10) return "Message must be at least 10 characters.";
  return null;
}

function getResponseErrorMessage(responseData: unknown): string {
  if (!responseData || typeof responseData !== "object") {
    return "Unable to send your message right now.";
  }

  const payload = responseData as { readonly message?: unknown; readonly details?: unknown };
  if (Array.isArray(payload.details) && payload.details.length > 0) {
    return payload.details.filter((detail): detail is string => typeof detail === "string").join(" ");
  }

  return typeof payload.message === "string" ? payload.message : "Unable to send your message right now.";
}

export default function ContactForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: { preventDefault: () => void; currentTarget: HTMLFormElement }) {
    event.preventDefault();
    const form = event.currentTarget;

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const formData = new FormData(form);
    const payload = {
      fullName: getStringField(formData, "fullName"),
      email: getStringField(formData, "email"),
      phone: getStringField(formData, "phone"),
      inquiryType: getStringField(formData, "inquiryType"),
      subject: getStringField(formData, "subject"),
      message: getStringField(formData, "message"),
    };

    const validationMessage = getValidationMessage(payload);
    if (validationMessage) {
      setErrorMessage(validationMessage);
      return;
    }

    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const response = await fetch(`${backendOrigin}/api/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json().catch(() => null);
      const success = Boolean(responseData?.success);

      if (!response.ok || !success) {
        throw new Error(getResponseErrorMessage(responseData));
      }

      setIsOpen(true);
      form.reset();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to send your message right now.";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-bold text-slate-900">Contact Form</h2>
          <p className="mt-1 text-sm text-slate-600">
            Fill in the form below and our team will get back to you shortly.
          </p>

          <form className="mt-5 grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit} noValidate>
            <label className="grid gap-1.5 text-sm text-slate-700">
              <span>Full Name</span>
              <input
                type="text"
                name="fullName"
                required
                minLength={2}
                maxLength={120}
                className="h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                placeholder="Enter your full name"
              />
            </label>

            <label className="grid gap-1.5 text-sm text-slate-700">
              <span>Email Address</span>
              <input
                type="email"
                name="email"
                required
                maxLength={160}
                className="h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                placeholder="you@example.com"
              />
            </label>

            <label className="grid gap-1.5 text-sm text-slate-700">
              <span>Mobile Number</span>
              <input
                type="text"
                name="phone"
                required
                inputMode="numeric"
                pattern="[0-9]{10}"
                minLength={10}
                maxLength={10}
                title="Enter a valid 10-digit mobile number using digits only"
                className="h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                placeholder="Enter 10-digit mobile number"
              />
            </label>

            <label className="grid gap-1.5 text-sm text-slate-700">
              <span>Inquiry Type</span>
              <select
                name="inquiryType"
                defaultValue=""
                required
                className="h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="" disabled>
                  Select inquiry type
                </option>
                <option value="support">Support</option>
                <option value="correction">Correction Request</option>
                <option value="business">Business Inquiry</option>
                <option value="advertising">Advertising</option>
              </select>
            </label>

            <label className="grid gap-1.5 text-sm text-slate-700 sm:col-span-2">
              <span>Subject</span>
              <input
                type="text"
                name="subject"
                required
                minLength={3}
                maxLength={180}
                className="h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                placeholder="Write a short subject"
              />
            </label>

            <label className="grid gap-1.5 text-sm text-slate-700 sm:col-span-2">
              <span>Message</span>
              <textarea
                name="message"
                rows={5}
                required
                minLength={10}
                maxLength={4000}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                placeholder="Write your message here..."
              />
            </label>

            <div className="sm:col-span-2">
              {errorMessage ? (
                <p className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {errorMessage}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex h-11 items-center justify-center rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? "Sending..." : "Submit Message"}
              </button>
            </div>
          </form>
        </div>

        <aside>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-base font-bold text-slate-900">Contact & Social</h3>
            <p className="mt-1 text-sm text-slate-600">Prefer email for support. Follow us for updates.</p>

            <div className="mt-4 space-y-4">
              <div className="flex gap-3">
                <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-700">
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M4 4h16v16H4z" stroke="none" />
                    <path d="m4 7 8 6 8-6" />
                  </svg>
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-800">Email</p>
                  <a href="mailto:sarkariglobalresult@gmail.com" className="text-sm text-slate-600 transition hover:text-blue-700">
                    sarkariglobalresult@gmail.com
                  </a>
                </div>
              </div>
            </div>

            <div className="my-5 border-t border-slate-200" />

            <p className="text-sm font-semibold text-slate-800">Follow Us</p>
            <div className="mt-3">
              <SocialMediaLinks />
            </div>
          </div>
        </aside>
      </div>

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900">Submitted Successfully</h3>
            <p className="mt-2 text-sm text-slate-600">
              Thank you for contacting us. We will get back to you soon.
            </p>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="mt-5 inline-flex h-10 items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              OK
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
