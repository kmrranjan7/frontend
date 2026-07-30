import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Icon } from "@/components/ui/Icon";

export default function UsersPage() {
  return (
    <>
      <DashboardHeader title="Team members" eyebrow="Administration" />
      <div className="dashboard-content">
        <section className="panel empty-state">
          <span><Icon name="users" size={32} /></span>
          <h2>Your team, in one place</h2>
          <p>Manage access, roles, and workspace permissions as your team grows.</p>
          <button className="button button-primary"><Icon name="plus" size={17} /> Invite member</button>
        </section>
      </div>
    </>
  );
}
