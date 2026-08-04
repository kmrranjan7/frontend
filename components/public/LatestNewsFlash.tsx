import Link from "next/link";

import { Icon } from "@/components/ui/Icon";
import { env } from "@/config/env";

type JobsResponse = Readonly<{
  readonly success?: boolean;
  readonly data?: Readonly<{
    readonly content?: readonly Readonly<{
      readonly id?: string;
      readonly title?: string;
      readonly slug?: string;
    }>[];
  }>;
}>;

async function loadLatestUpdates() {
  try {
    const query = new URLSearchParams({
      status: "PUBLISHED",
      page: "0",
      size: "10",
      sortDir: "desc",
    });
    const response = await fetch(`${env.backendApiUrl}/api/v1/jobs?${query}`, {
      next: { revalidate: 300 },
    });
    if (!response.ok) return [];

    const payload = (await response.json()) as JobsResponse;
    return (payload.data?.content ?? []).flatMap((item) => {
      const title = item.title?.trim();
      const slug = item.slug?.trim();
      return title && slug ? [{ id: item.id ?? slug, title, href: `/${encodeURIComponent(slug)}` }] : [];
    });
  } catch {
    return [];
  }
}

export async function LatestNewsFlash() {
  const updates = await loadLatestUpdates();

  if (!updates.length) return null;

  return (
    <section className="latest-updates-flash" aria-label="Latest published updates">
      <strong>
        <span><Icon name="trend" size={13} /></span>
        Latest <span className="latest-live-badge">Live</span>
      </strong>
      <div>
        <div className="latest-updates-track">
          {[...updates, ...updates].map((item, index) => (
            <Link href={item.href} prefetch={false} key={`${item.id}-${index}`}>
              <b>New</b>{item.title}<i aria-hidden="true">→</i>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
