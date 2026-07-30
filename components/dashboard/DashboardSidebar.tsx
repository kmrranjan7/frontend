"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminNavigation, dashboardNavigation } from "@/config/navigation";
import { Icon } from "@/components/ui/Icon";
import { Logo } from "@/components/ui/Logo";

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="dashboard-sidebar">
      <div className="sidebar-logo"><Logo /></div>
      <div className="workspace-switcher">
        <span className="avatar purple">A</span>
        <span><b>Acme Studio</b><small>Business workspace</small></span>
        <span>⌄</span>
      </div>
      <nav aria-label="Dashboard">
        <NavSection items={dashboardNavigation} pathname={pathname} />
        <p className="nav-label">ADMINISTRATION</p>
        <NavSection items={adminNavigation} pathname={pathname} />
      </nav>
      <div className="sidebar-upgrade">
        <span><Icon name="spark" size={17} /></span>
        <b>Unlock more with Pro</b>
        <p>Advanced analytics and unlimited projects.</p>
        <button>View plans</button>
      </div>
      <div className="sidebar-profile">
        <span className="avatar warm">KR</span>
        <span><b>Kumar Ranjan</b><small>Admin</small></span>
        <span>•••</span>
      </div>
    </aside>
  );
}

function NavSection({
  items,
  pathname,
}: {
  items: typeof dashboardNavigation;
  pathname: string;
}) {
  return items.map((item) => {
    const cleanHref = item.href.split("#")[0];
    const active =
      cleanHref === "/dashboard"
        ? pathname === cleanHref
        : pathname.startsWith(cleanHref);
    return (
      <Link className={active ? "active" : ""} href={item.href} key={item.label}>
        <Icon name={item.icon as "grid" | "file" | "users" | "chart" | "settings"} size={19} />
        {item.label}
      </Link>
    );
  });
}
