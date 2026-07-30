import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Icon } from "@/components/ui/Icon";

export default function ContentPage() {
  return (
    <>
      <DashboardHeader title="Content library" />
      <div className="dashboard-content">
        <section className="panel empty-state">
          <span><Icon name="file" size={32} /></span>
          <h2>Build your content library</h2>
          <p>Create, organize, and publish content from one focused workspace.</p>
          <button className="button button-primary"><Icon name="plus" size={17} /> Create content</button>
        </section>
      </div>
    </>
  );
}
