import { env } from "@/config/env";

export const siteConfig = {
  name: "Sarkari Global Result",
  shortName: "SG Result",
  description:
    "Latest Government Jobs, Sarkari Result, Online Forms, Admit Cards, Exam Results, Answer Keys, Syllabus, Admissions, Scholarships, Railway, SSC, UPSC, Banking, Police, Defence, PSU and State Government Recruitment Notifications.",
  url: env.frontendUrl,
  locale: "en_IN",
  language: "en-IN",
  themeColor: "#7c1d1d",
  publisher: "Sarkari Global Result",
  email: "sarkariglobalresult@gmail.com",
  twitter: "@sarkariglobal",
  telegram: "https://t.me/sarkariglobalresult",
  whatsapp: "https://www.whatsapp.com/channel/0029VbCd7pX2wRZMSqVgFe2Q",
  logo: "/logo.png",
  ogImage: "/opengraph-image",
  manifest: "/manifest.webmanifest",
} as const;

export function absoluteUrl(path = "/") {
  return new URL(path, `${siteConfig.url}/`).toString();
}
