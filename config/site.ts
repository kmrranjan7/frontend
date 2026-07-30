import { env } from "@/config/env";

export const siteConfig = {
  name: "Sarkari Global Result",
  shortName: "SG Result",
  description:
    "Latest government jobs, recruitment notifications, online forms, admit cards, results, answer keys, syllabus, admissions, and exam updates.",
  url: env.frontendUrl,
  locale: "en_IN",
  language: "en-IN",
  themeColor: "#7c1d1d",
  email: "support@sarkariglobalresult.com",
  publisher: "Sarkari Global Result",
} as const;

export function absoluteUrl(path = "/") {
  return new URL(path, `${siteConfig.url}/`).toString();
}
