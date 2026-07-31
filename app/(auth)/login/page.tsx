import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/LoginForm";
import { Logo } from "@/components/ui/Logo";
import { hasValidDashboardSession } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Dashboard Login",
  robots: { index: false, follow: false },
};

export default async function LoginPage() {
  if (await hasValidDashboardSession()) redirect("/dashboard");

  return (
    <main className="login-page">
      <section className="login-panel">
        <Logo />
        <div className="login-heading">
          <span>SECURE WORKSPACE</span>
          <h1>Welcome back</h1>
          <p>Sign in with your registered email and password to manage Sarkari Global Result.</p>
        </div>
        <LoginForm />
      </section>
    </main>
  );
}
