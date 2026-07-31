import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { hasValidDashboardSession } from "@/lib/auth/session";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    nocache: true,
    noarchive: true,
    nosnippet: true,
    noimageindex: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  if (!(await hasValidDashboardSession())) redirect("/login");

  return (
    <div className="dashboard-shell">
      <DashboardSidebar />
      <main className="dashboard-main">{children}</main>
    </div>
  );
}
