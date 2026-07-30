import { Icon } from "@/components/ui/Icon";

export function DashboardHeader({
  title,
  eyebrow = "Workspace",
}: {
  title: string;
  eyebrow?: string;
}) {
  return (
    <header className="dashboard-header">
      <div>
        <span>{eyebrow}</span>
        <h1>{title}</h1>
      </div>
      <div className="dashboard-tools">
        <label className="search-box">
          <Icon name="search" size={17} />
          <input aria-label="Search" placeholder="Search anything..." />
          <kbd>⌘ K</kbd>
        </label>
        <button className="notification" aria-label="Notifications">♢<i /></button>
        <button className="button button-primary button-small"><Icon name="plus" size={17} /> Create new</button>
      </div>
    </header>
  );
}
