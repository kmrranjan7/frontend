import Link from "next/link";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Icon } from "@/components/ui/Icon";
import { PostRowActions } from "@/components/dashboard/PostRowActions";
import {
  fetchPostListings,
  postTypeConfig,
  type PostTypeSlug,
} from "@/lib/api/post-listings";

function formatDate(value: string | null) {
  if (!value) return "Not specified";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

function pageHref(
  postType: PostTypeSlug,
  page: number,
  search: string,
  sortDir: "asc" | "desc",
) {
  const query = new URLSearchParams({ page: String(page), sortDir });
  if (search) query.set("search", search);
  return `/dashboard/content/${postType}?${query}`;
}

export async function PostTypeListing({
  postType,
  page,
  search,
  sortDir,
}: {
  postType: PostTypeSlug;
  page: number;
  search: string;
  sortDir: "asc" | "desc";
}) {
  const config = postTypeConfig[postType];
  const result = await fetchPostListings({ postType, page, search, sortDir });

  return (
    <>
      <DashboardHeader title={`${config.label} posts`} eyebrow="Content library" />
      <div className="dashboard-content">
        <section className="listing-toolbar">
          <form className="listing-search">
            <Icon name="search" size={18} />
            <input name="search" defaultValue={search} placeholder={`Search ${config.label.toLowerCase()} posts…`} />
            <select name="sortDir" defaultValue={sortDir} aria-label="Sort order">
              <option value="desc">Newest first</option>
              <option value="asc">Oldest first</option>
            </select>
            <button className="button button-primary button-small" type="submit">Search</button>
          </form>
          <Link href={`/dashboard/content/new?type=${encodeURIComponent(config.label)}`} className="button button-primary button-small">
            <Icon name="plus" size={16} /> Create {config.label}
          </Link>
        </section>

        <section className="panel listing-panel">
          <div className="listing-summary">
            <div>
              <h2>{config.label}</h2>
              <p>{result.totalElements} {result.totalElements === 1 ? "record" : "records"}</p>
            </div>
            <span>Page {result.page + 1} of {Math.max(result.totalPages, 1)}</span>
          </div>

          {result.content.length ? (
            <div className="listing-table-wrap">
              <table className="listing-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Department</th>
                    <th>State</th>
                    <th>Start date</th>
                    <th>Last date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {result.content.map((item, index) => (
                    <tr key={`${item.title}-${index}`}>
                      <td><strong>{item.title}</strong></td>
                      <td>{item.department || "—"}</td>
                      <td>{item.state || "—"}</td>
                      <td>{formatDate(item.startDate)}</td>
                      <td>{formatDate(item.lastDate)}</td>
                      <td><span className={`listing-status ${item.status.toLowerCase()}`}>{item.status.replaceAll("_", " ")}</span></td>
                      <td><PostRowActions postId={item.id} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="listing-empty">
              <Icon name="file" size={28} />
              <h3>No {config.label.toLowerCase()} posts found</h3>
              <p>{search ? "Try a different search term." : `Create your first ${config.label.toLowerCase()} post.`}</p>
            </div>
          )}

          <div className="listing-pagination">
            {result.first
              ? <span>← Previous</span>
              : <Link href={pageHref(postType, result.page - 1, search, sortDir)}>← Previous</Link>}
            <span>{result.totalElements} total</span>
            {result.last
              ? <span>Next →</span>
              : <Link href={pageHref(postType, result.page + 1, search, sortDir)}>Next →</Link>}
          </div>
        </section>
      </div>
    </>
  );
}
