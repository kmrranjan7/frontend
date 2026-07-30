"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  adminNavigation,
  contentTypeNavigation,
  dashboardNavigation,
} from "@/config/navigation";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Logo } from "@/components/ui/Logo";

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="dashboard-sidebar">
      <div className="sidebar-brand">
        <Logo />
        <span><i /> ADMIN PORTAL</span>
      </div>
      <nav aria-label="Dashboard">
        <p className="nav-label nav-label-first">WORKSPACE</p>
        <NavSection items={dashboardNavigation} pathname={pathname} />
        <p className="nav-label">CONTENT TYPES</p>
        <NavSection items={contentTypeNavigation} pathname={pathname} compact />
        <p className="nav-label">ADMINISTRATION</p>
        <NavSection items={adminNavigation} pathname={pathname} />
      </nav>
      <div className="sidebar-profile">
        <span className="sidebar-profile-avatar">KR<i aria-hidden="true" /></span>
        <span><b>Kumar Ranjan</b><small>Administrator</small></span>
        <button type="button" aria-label="Open account menu">•••</button>
      </div>
    </aside>
  );
}

function NavSection({
  items,
  pathname,
  compact = false,
}: {
  items: typeof dashboardNavigation;
  pathname: string;
  compact?: boolean;
}) {
  return items.map((item) => {
    const cleanHref = item.href.split("#")[0];
    const active =
      item.href.includes("?type=")
        ? false
        : cleanHref === "/dashboard"
        ? pathname === cleanHref
        : pathname.startsWith(cleanHref);
    return (
      <Link
        aria-current={active ? "page" : undefined}
        className={`${active ? "active" : ""}${compact ? " compact" : ""}`}
        href={item.href}
        key={item.label}
        title={item.label}
      >
        <span className="sidebar-nav-icon">
          <Icon name={item.icon as IconName} size={18} />
        </span>
        <span className="sidebar-nav-text">{item.label}</span>
        {active && <i className="sidebar-active-dot" aria-hidden="true" />}
      </Link>
    );
  });
}
