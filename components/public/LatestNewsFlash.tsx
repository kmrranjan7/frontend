import Link from "next/link";
import { Icon } from "@/components/ui/Icon";

const latestNews = [
  { label: "Latest government job notifications", href: "/jobs" },
  { label: "Download recently released admit cards", href: "/admit-cards" },
  { label: "Check newly declared examination results", href: "/results" },
  { label: "View upcoming examination schedules", href: "/exams" },
] as const;

export function LatestNewsFlash() {
  return (
    <section className="latest-news-flash" aria-label="Latest news">
      <strong>
        <span className="latest-news-symbol"><Icon name="trend" size={13} /></span>
        <span className="latest-news-label">Latest News</span>
        <small><i aria-hidden="true" /> Live</small>
      </strong>
      <div className="latest-news-window">
        <div className="latest-news-track">
          {[...latestNews, ...latestNews].map((item, index) => (
            <Link href={item.href} key={`${item.href}-${index}`}>
              <span>Update</span>{item.label}<i aria-hidden="true">→</i>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
