"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";

export function LoginForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");
    const form = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: String(form.get("email") || "").trim(),
          password: String(form.get("password") || ""),
        }),
      });
      const payload = await response.json() as { success: boolean; message?: string };

      if (!response.ok || !payload.success) {
        setMessage(payload.message || "Unable to sign in. Check your details and try again.");
        return;
      }

      router.replace("/dashboard");
      router.refresh();
    } catch {
      setMessage("Unable to reach the login service. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="login-form" onSubmit={login}>
      <label>
        <span>Email address</span>
        <div><Icon name="user" size={16} /><input name="email" type="email" autoComplete="username" required maxLength={255} placeholder="name@company.com" /></div>
      </label>
      <label>
        <span>Password</span>
        <div><Icon name="settings" size={16} /><input name="password" type="password" autoComplete="current-password" required minLength={8} maxLength={72} placeholder="Enter your password" /></div>
      </label>
      {message ? <p className="login-error" role="alert">{message}</p> : null}
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Signing in..." : "Sign in to dashboard"}
        {!isSubmitting ? <Icon name="chevron" size={14} /> : null}
      </button>
      <small>Authorized team members only. Your session is securely protected.</small>
    </form>
  );
}
