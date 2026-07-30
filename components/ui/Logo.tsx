import Link from "next/link";

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link className={`logo ${light ? "logo-light" : ""}`} href="/">
      <span className="logo-mark" aria-hidden="true">
        <span />
        <span />
      </span>
      <span>Sarkari Global Result</span>
    </Link>
  );
}
