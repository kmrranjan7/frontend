import { cache } from "react";

export type Job = {
  title: string;
  slug: string;
  description: string;
  organization: string;
  datePosted: string;
  dateModified: string;
  validThrough: string;
  employmentType: string;
  locality: string;
  region: string;
  vacancies: number;
  qualification: string;
  applyUrl: string;
  faqs: { question: string; answer: string }[];
};

export const jobs: Job[] = [
  {
    title: "SSC Combined Graduate Level Recruitment 2026",
    slug: "ssc-cgl-recruitment-2026",
    description:
      "Staff Selection Commission Combined Graduate Level recruitment notification, eligibility, important dates, vacancies, selection process, and official application link.",
    organization: "Staff Selection Commission",
    datePosted: "2026-07-25",
    dateModified: "2026-07-29",
    validThrough: "2026-08-24T23:59:59+05:30",
    employmentType: "FULL_TIME",
    locality: "New Delhi",
    region: "Delhi",
    vacancies: 14582,
    qualification: "Bachelor’s degree from a recognized university",
    applyUrl: "https://ssc.gov.in/",
    faqs: [
      {
        question: "What is the last date to apply for SSC CGL 2026?",
        answer: "The online application closes on 24 August 2026.",
      },
      {
        question: "What qualification is required?",
        answer: "Applicants must hold a bachelor’s degree from a recognized university.",
      },
    ],
  },
  {
    title: "Railway RRB Technician Recruitment 2026",
    slug: "railway-rrb-technician-recruitment-2026",
    description:
      "Railway Recruitment Board Technician vacancies, eligibility, application dates, selection process, and official online form details.",
    organization: "Railway Recruitment Board",
    datePosted: "2026-07-22",
    dateModified: "2026-07-28",
    validThrough: "2026-08-20T23:59:59+05:30",
    employmentType: "FULL_TIME",
    locality: "New Delhi",
    region: "Delhi",
    vacancies: 6238,
    qualification: "ITI, diploma, or equivalent qualification",
    applyUrl: "https://www.rrbcdg.gov.in/",
    faqs: [],
  },
];

export type NewsArticle = {
  title: string;
  slug: string;
  description: string;
  body: string[];
  datePublished: string;
  dateModified: string;
  author: string;
};

export const articles: NewsArticle[] = [
  {
    title: "How to Prepare Documents for Government Job Applications",
    slug: "prepare-documents-government-job-applications",
    description:
      "A practical checklist to prepare certificates, photographs, signatures, and identity documents before completing a government job form.",
    body: [
      "Preparing your documents before an application window opens helps you avoid rushed uploads and preventable form errors.",
      "Keep clear scans of your identity proof, educational certificates, category certificate where applicable, photograph, and signature. Always follow the dimensions and file-size limits in the official notification.",
    ],
    datePublished: "2026-07-20T09:00:00+05:30",
    dateModified: "2026-07-24T11:30:00+05:30",
    author: "Sarkari Global Result Editorial Team",
  },
];

export const getJobBySlug = cache(async (slug: string) =>
  jobs.find((job) => job.slug === slug),
);

export const getArticleBySlug = cache(async (slug: string) =>
  articles.find((article) => article.slug === slug),
);
