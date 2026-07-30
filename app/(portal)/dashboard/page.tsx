import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Icon } from "@/components/ui/Icon";
import { metrics, projects } from "@/features/dashboard/data";

const activity = [
  ["SK", "Sarah completed", "Homepage wireframes", "12m"],
  ["JL", "Jamie commented on", "Design system audit", "38m"],
  ["AM", "Alex created a task", "Finalize launch copy", "1h"],
  ["KR", "You moved", "API integration to Done", "2h"],
];

export default function DashboardPage() {
  return (
    <>
      <DashboardHeader title="Good morning, Kumar" eyebrow="Thursday, July 30" />
      <div className="dashboard-content">
        <section className="metric-grid" aria-label="Workspace metrics">
          {metrics.map((metric) => (
            <article className="metric-card" key={metric.label}>
              <div className="metric-label"><span><Icon name={metric.icon} size={18} /></span>{metric.label}<button>•••</button></div>
              <strong>{metric.value}</strong>
              <p><b><Icon name="trend" size={14} /> {metric.change}</b> {metric.note}</p>
            </article>
          ))}
        </section>

        <section className="dashboard-grid">
          <article className="panel performance-panel" id="analytics">
            <div className="panel-heading">
              <div><h2>Team performance</h2><p>Tasks completed across all projects</p></div>
              <select aria-label="Period"><option>Last 6 months</option></select>
            </div>
            <div className="chart-wrap">
              <div className="chart-labels"><span>1,200</span><span>900</span><span>600</span><span>300</span><span>0</span></div>
              <div className="chart">
                <div className="chart-line line-a" />
                <div className="chart-line line-b" />
                <div className="chart-tooltip"><b>May</b><span>Completed&nbsp; 924</span><span>Created&nbsp;&nbsp;&nbsp;&nbsp; 780</span></div>
              </div>
            </div>
            <div className="chart-months"><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span></div>
            <div className="chart-legend"><span><i className="purple-dot" /> Completed tasks</span><span><i className="grey-dot" /> Created tasks</span></div>
          </article>

          <article className="panel activity-panel">
            <div className="panel-heading"><div><h2>Recent activity</h2><p>Latest updates from your team</p></div><button>View all</button></div>
            <div className="activity-list">
              {activity.map(([avatar, action, item, time]) => (
                <div className="activity-item" key={item}>
                  <span className="avatar">{avatar}</span>
                  <p><b>{action}</b><br /><span>{item}</span></p>
                  <time>{time}</time>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="panel projects-panel">
          <div className="panel-heading"><div><h2>Active projects</h2><p>Your team’s work at a glance</p></div><button>View all projects <Icon name="arrow" size={15} /></button></div>
          <div className="project-table">
            <div className="project-row table-head"><span>PROJECT</span><span>PROGRESS</span><span>TEAM</span><span>DUE DATE</span><span /></div>
            {projects.map((project) => (
              <div className="project-row" key={project.name}>
                <span className="project-name"><i className={`project-icon ${project.color}`}><Icon name="file" size={17} /></i><span><b>{project.name}</b><small>{project.type}</small></span></span>
                <span className="progress-cell"><i><b style={{ width: `${project.progress}%` }} /></i>{project.progress}%</span>
                <span className="people">{project.people.map((person) => <i key={person}>{person}</i>)}</span>
                <span>{project.due}</span>
                <button>•••</button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
