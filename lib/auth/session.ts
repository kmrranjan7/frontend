import "server-only";
import { cookies } from "next/headers";
import { env } from "@/config/env";

export const DASHBOARD_SESSION_COOKIE = "sgr_dashboard_session";

export async function getDashboardToken() {
  return (await cookies()).get(DASHBOARD_SESSION_COOKIE)?.value ?? "";
}

export async function dashboardAuthHeaders(): Promise<Record<string, string>> {
  const token = await getDashboardToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function hasValidDashboardSession() {
  const token = await getDashboardToken();
  if (!token) return false;

  try {
    const response = await fetch(`${env.backendApiUrl}/api/v1/auth/session`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    return response.ok;
  } catch {
    return false;
  }
}
