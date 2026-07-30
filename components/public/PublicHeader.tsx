import Link from "next/link";
import { publicNavigation } from "@/config/navigation";
import { Icon } from "@/components/ui/Icon";
import { Logo } from "@/components/ui/Logo";

export function PublicHeader() {
  return (
    <header className="public-header">
      <div className="public-nav shell">
        <Logo />
        <nav className="public-links" aria-label="Main navigation">
          {publicNavigation.map((item) => (
            <Link key={item.label} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="public-actions">
          <Link className="text-link" href="/search">Search</Link>
          <Link className="button button-dark button-small" href="/dashboard">Admin</Link>
          <button className="icon-button mobile-menu" aria-label="Open menu">
            <Icon name="menu" />
          </button>
        </div>
      </div>
    </header>
  );
}
