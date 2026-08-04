import Link from "next/link";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Icon } from "@/components/ui/Icon";
import { fetchPostListings, type PostTypeSlug } from "@/lib/api/post-listings";

const dashboardTypes: Array<{
  slug: PostTypeSlug;
  label: string;
  icon: "grid" | "check" | "users" | "clock";
}> = [
  { slug: "job", label: "Published jobs", icon: "grid" },
  { slug: "admit", label: "Admit cards", icon: "check" },
  { slug: "result", label: "Results", icon: "users" },
  { slug: "exam", label: "Exams", icon: "clock" },
];

function formatDate(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function displayPostType(value?: string | null) {
  if (!value) return "Post";
  return value.toLowerCase().split("_").map((part) => (
    part.charAt(0).toUpperCase() + part.slice(1)
  )).join(" ");
}

export default async function DashboardPage() {
  const [recentPosts, ...typeTotals] = await Promise.all([
    fetchPostListings({ page: 0, size: 8, status: "PUBLISHED" }),
    ...dashboardTypes.map(({ slug }) => (
      fetchPostListings({ postType: slug, page: 0, size: 1, status: "PUBLISHED" })
    )),
  ]);
  const dateLabel = new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  return (
    <>
      <DashboardHeader title="Content dashboard" eyebrow={dateLabel} />
      <div className="dashboard-content">
        <section className="metric-grid" aria-label="Published content totals">
          {dashboardTypes.map((metric, index) => (
            <Link className="metric-card" href={`/dashboard/content/${metric.slug}`} key={metric.slug}>
              <div className="metric-label">
                <span><Icon name={metric.icon} size={18} /></span>
                {metric.label}
              </div>
              <strong>{typeTotals[index].totalElements.toLocaleString("en-IN")}</strong>
              <p>Live records from your content database</p>
            </Link>
          ))}
        </section>

        <section className="panel listing-panel projects-panel">
          <div className="listing-summary">
            <div>
              <h2>Recent published posts</h2>
              <p>{recentPosts.totalElements.toLocaleString("en-IN")} total published records</p>
            </div>
            <Link href="/dashboard/content/new" className="button button-primary button-small">
              <Icon name="plus" size={16} /> Create post
            </Link>
          </div>

          {recentPosts.content.length ? (
            <div className="listing-table-wrap">
              <table className="listing-table">
                <thead>
                  <tr>
                    <th>Post</th>
                    <th>Type</th>
                    <th>State</th>
                    <th>Start date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentPosts.content.map((post) => (
                    <tr key={post.id}>
                      <td><strong>{post.title}</strong></td>
                      <td>{displayPostType(post.postType)}</td>
                      <td>{post.state || "All India"}</td>
                      <td>{formatDate(post.startDate || post.createdAt)}</td>
                      <td><span className="listing-status published">Published</span></td>
                      <td className="row-actions">
                        <Link href={`/dashboard/content/new?postId=${encodeURIComponent(post.id)}`}>Edit</Link>
                        <Link href={`/${post.slug}`} target="_blank">View</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="listing-empty">
              <Icon name="file" size={28} />
              <h3>No published posts</h3>
              <p>Create and publish your first content post.</p>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
