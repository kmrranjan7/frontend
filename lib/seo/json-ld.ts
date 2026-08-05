import { absoluteUrl, siteConfig } from "@/config/site";

export type BreadcrumbItem = {
  name: string;
  path: string;
};

export type FaqItem = {
  question: string;
  answer: string;
};

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": absoluteUrl("/#organization"),
    name: siteConfig.name,
    alternateName: siteConfig.shortName,
    url: siteConfig.url,
    logo: absoluteUrl(siteConfig.logo),
    email: siteConfig.email,
    sameAs: [siteConfig.telegram, siteConfig.whatsapp],
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": absoluteUrl("/#website"),
    url: siteConfig.url,
    name: siteConfig.name,
    alternateName: siteConfig.shortName,
    description: siteConfig.description,
    publisher: { "@id": absoluteUrl("/#organization") },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: absoluteUrl("/?q={search_term_string}"),
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function breadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function faqJsonLd(items: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export type JobPostingInput = {
  title: string;
  description: string;
  slug: string;
  datePosted: string;
  validThrough: string;
  organization: string;
  employmentType: string;
  locality: string;
  region: string;
  vacancies?: number;
};

export function jobPostingJsonLd(job: JobPostingInput) {
  return {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: `<p>${job.description}</p>`,
    identifier: {
      "@type": "PropertyValue",
      name: job.organization,
      value: job.slug,
    },
    datePosted: job.datePosted,
    validThrough: job.validThrough,
    employmentType: job.employmentType,
    hiringOrganization: {
      "@type": "Organization",
      name: job.organization,
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: job.locality,
        addressRegion: job.region,
        addressCountry: "IN",
      },
    },
    totalJobOpenings: job.vacancies,
    url: absoluteUrl(`/jobs/${job.slug}`),
    directApply: false,
  };
}

export type ArticleInput = {
  title: string;
  description: string;
  slug: string;
  datePublished: string;
  dateModified: string;
  author: string;
  image?: string;
  keywords?: string[];
};

export function articleJsonLd(article: ArticleInput) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    keywords: article.keywords,
    image: [absoluteUrl(article.image ?? siteConfig.ogImage)],
    datePublished: article.datePublished,
    dateModified: article.dateModified,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": absoluteUrl(`/${article.slug}`),
    },
    author: { "@type": "Organization", name: article.author },
    publisher: { "@id": absoluteUrl("/#organization") },
  };
}
