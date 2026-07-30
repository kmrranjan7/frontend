function requireEnvironmentVariable(name: string, value: string | undefined) {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value.replace(/\/$/, "");
}

export const env = {
  backendApiUrl: requireEnvironmentVariable(
    "NEXT_PUBLIC_BACKEND_API_URL",
    process.env.NEXT_PUBLIC_BACKEND_API_URL,
  ),
  frontendUrl: requireEnvironmentVariable(
    "NEXT_PUBLIC_FRONTEND_URL",
    process.env.NEXT_PUBLIC_FRONTEND_URL,
  ),
} as const;
