import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { env } from "@/config/env";

type LatestNewsResponse = { success?: boolean; data?: { title?: string; link?: string }[] | null };

async function loadLatestNews() {
  try {
    const response = await fetch(`${env.backendApiUrl}/api/v1/latest-news`, { next: { revalidate: 30 } });
    if (!response.ok) return [];
    const payload = await response.json() as LatestNewsResponse;
    const managed = (payload.data ?? []).flatMap((item) => {
      const title = item.title?.trim(); const link = item.link?.trim();
      return title && link ? [{ label: title, href: link }] : [];
    });
    return managed;
  } catch {
    return [];
  }
}

export async function LatestNewsFlash() {
  const newsItems = await loadLatestNews();
  if (!newsItems.length) return null;
  return (
    <section className="latest-news-flash" aria-label="Latest news">
      <strong>
        <span className="latest-news-symbol"><Icon name="trend" size={13} /></span>
        <span className="latest-news-label">Latest News</span>
        <small><i aria-hidden="true" /> Live</small>
      </strong>
      <div className="latest-news-window">
        <div className="latest-news-track">
          {[...newsItems, ...newsItems].map((item, index) => (
            <Link href={item.href} prefetch={false} key={`${item.href}-${index}`}>
              <span>New</span>{item.label}<i aria-hidden="true">→</i>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
