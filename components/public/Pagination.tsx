import Link from "next/link";

export function Pagination({
  currentPage,
  totalPages,
  basePath,
  ariaLabel = "Pagination",
}: {
  currentPage: number;
  totalPages: number;
  basePath: string;
  ariaLabel?: string;
}) {
  if (totalPages <= 1) return null;

  const normalizedBasePath =
    basePath === "/" ? "" : basePath.replace(/\/+$/, "");
  const pageHref = (page: number) =>
    page === 1 ? normalizedBasePath || "/" : `${normalizedBasePath}/page/${page}`;

  return (
    <nav className="pagination" aria-label={ariaLabel}>
      {currentPage > 1 ? (
        <Link rel="prev" href={pageHref(currentPage - 1)}>← Previous</Link>
      ) : <span />}
      <span>Page {currentPage} of {totalPages}</span>
      {currentPage < totalPages ? (
        <Link rel="next" href={pageHref(currentPage + 1)}>Next →</Link>
      ) : <span />}
    </nav>
  );
}
