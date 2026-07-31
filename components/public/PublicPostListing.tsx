import Link from "next/link";
import { Icon, type IconName } from "@/components/ui/Icon";
import { POST_SEARCH_MAX_LENGTH } from "@/config/search";
import type { PostListingItem } from "@/lib/api/post-listings";

function formatDate(value: string | null) {
  if (!value) return "As per schedule";

  const date = new Date(`${value.slice(0, 10)}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function PublicPostListing({
  items,
  search,
  basePath,
  singularLabel,
  emptyMessage,
  icon = "file",
}: {
  items: readonly PostListingItem[];
  search: string;
  basePath: string;
  singularLabel: string;
  emptyMessage: string;
  icon?: IconName;
}) {
  return (
    <section className="public-listing-panel" aria-label={`${singularLabel} listings`}>
      <form action={basePath} className="public-listing-search">
        <label>
          <Icon name="search" size={15} />
          <span className="sr-only">Search {singularLabel.toLowerCase()}</span>
          <input
            name="q"
            maxLength={POST_SEARCH_MAX_LENGTH}
            defaultValue={search}
            placeholder={`Search ${singularLabel.toLowerCase()}, department, state...`}
          />
        </label>
        {search ? <Link href={basePath}>Clear</Link> : null}
      </form>

      <div className="public-listing-rows">
        {items.map((item) => (
          <article key={item.id}>
            <span className="public-listing-icon">
              <Icon name={icon} size={16} />
            </span>
            <div>
              <p>{item.department || "Sarkari Global Result"}</p>
              <h2>{item.title}</h2>
              <dl>
                <div>
                  <dt>State</dt>
                  <dd>{item.state || "All India"}</dd>
                </div>
                <div>
                  <dt>Published</dt>
                  <dd>{formatDate(item.startDate)}</dd>
                </div>
                <div>
                  <dt>Status</dt>
                  <dd>{item.status === "PUBLISHED" ? "Available" : item.status}</dd>
                </div>
              </dl>
            </div>
          </article>
        ))}

        {items.length === 0 ? (
          <div className="public-listing-empty">
            <Icon name={icon} size={22} />
            <strong>{emptyMessage}</strong>
            <span>New official updates will appear here when published.</span>
            {search ? <Link href={basePath}>Clear search</Link> : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
