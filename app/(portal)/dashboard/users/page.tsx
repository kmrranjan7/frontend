import Link from "next/link";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { UserDetailsManager } from "@/components/dashboard/UserDetailsManager";
import { fetchUsers } from "@/lib/api/users";

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const query = await searchParams;
  const parsedPage = Number(query.page ?? 0);
  const page = Number.isInteger(parsedPage) && parsedPage >= 0 ? parsedPage : 0;
  const result = await fetchUsers(page);

  return (
    <>
      <DashboardHeader title="Users" eyebrow="Administration" />
      <div className="dashboard-content">
        <UserDetailsManager users={result.content} totalElements={result.totalElements} />
        <div className="listing-pagination panel user-pagination">
          {result.first
            ? <span>← Previous</span>
            : <Link href={`/dashboard/users?page=${result.page - 1}`}>← Previous</Link>}
          <span>Page {result.page + 1} of {Math.max(result.totalPages, 1)}</span>
          {result.last
            ? <span>Next →</span>
            : <Link href={`/dashboard/users?page=${result.page + 1}`}>Next →</Link>}
        </div>
      </div>
    </>
  );
}
