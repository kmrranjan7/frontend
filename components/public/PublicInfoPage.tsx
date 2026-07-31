import type { ReactNode } from "react";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";

export function PublicInfoPage({ title, description, path, children }: { title: string; description: string; path: string; children: ReactNode }) {
  return (
    <div className="content-page shell public-info-page">
      <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: title, path }]} />
      <header className="jobs-listing-heading"><p className="content-label">SARKARI GLOBAL RESULT</p><h1>{title}</h1><p>{description}</p></header>
      <article className="public-info-panel">{children}</article>
    </div>
  );
}
