import Link from "next/link";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Icon } from "@/components/ui/Icon";
import { fetchContacts } from "@/lib/api/contacts";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function pageHref(page: number, sortDir: "asc" | "desc") {
  return `/dashboard/contacts?page=${page}&sortDir=${sortDir}`;
}

export default async function ContactsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; sortDir?: string }>;
}) {
  const query = await searchParams;
  const parsedPage = Number(query.page ?? 0);
  const page = Number.isInteger(parsedPage) && parsedPage >= 0 ? parsedPage : 0;
  const sortDir = query.sortDir === "asc" ? "asc" : "desc";
  const result = await fetchContacts({ page, sortDir });

  return (
    <>
      <DashboardHeader title="Contacts" eyebrow="Administration" />
      <div className="dashboard-content">
        <section className="listing-toolbar">
          <div>
            <h1 className="contacts-title">Contact enquiries</h1>
            <p className="contacts-subtitle">Review messages submitted through your contact form.</p>
          </div>
          <form className="contacts-sort">
            <select name="sortDir" defaultValue={sortDir} aria-label="Sort contacts">
              <option value="desc">Newest first</option>
              <option value="asc">Oldest first</option>
            </select>
            <button className="button button-primary button-small" type="submit">Apply</button>
          </form>
        </section>

        <section className="panel listing-panel">
          <div className="listing-summary">
            <div>
              <h2>Messages</h2>
              <p>{result.totalElements} {result.totalElements === 1 ? "enquiry" : "enquiries"}</p>
            </div>
            <span>Page {result.page + 1} of {Math.max(result.totalPages, 1)}</span>
          </div>

          {result.content.length ? (
            <div className="listing-table-wrap">
              <table className="listing-table contacts-table">
                <thead>
                  <tr>
                    <th>Contact</th>
                    <th>Phone</th>
                    <th>Type</th>
                    <th>Subject</th>
                    <th>Message</th>
                    <th>Received</th>
                  </tr>
                </thead>
                <tbody>
                  {result.content.map((contact) => (
                    <tr key={contact.id}>
                      <td>
                        <strong>{contact.fullName}</strong>
                        <a href={`mailto:${contact.email}`}>{contact.email}</a>
                      </td>
                      <td><a href={`tel:${contact.phone}`}>{contact.phone}</a></td>
                      <td><span className="listing-status">{contact.inquiryType}</span></td>
                      <td>{contact.subject}</td>
                      <td title={contact.message}>{contact.message}</td>
                      <td>{formatDate(contact.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="listing-empty">
              <Icon name="users" size={28} />
              <h3>No contact enquiries yet</h3>
              <p>New contact form submissions will appear here.</p>
            </div>
          )}

          <div className="listing-pagination">
            {result.first
              ? <span>← Previous</span>
              : <Link href={pageHref(result.page - 1, sortDir)}>← Previous</Link>}
            <span>{result.totalElements} total</span>
            {result.last
              ? <span>Next →</span>
              : <Link href={pageHref(result.page + 1, sortDir)}>Next →</Link>}
          </div>
        </section>
      </div>
    </>
  );
}
