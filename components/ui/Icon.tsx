export type IconName =
  | "admit"
  | "answerKey"
  | "arrow"
  | "book"
  | "briefcase"
  | "chart"
  | "check"
  | "chevron"
  | "clock"
  | "contact"
  | "exam"
  | "file"
  | "graduation"
  | "grid"
  | "layers"
  | "menu"
  | "plus"
  | "search"
  | "settings"
  | "spark"
  | "trend"
  | "trophy"
  | "user"
  | "users";

const paths: Record<IconName, React.ReactNode> = {
  admit: <><rect x="4" y="3" width="16" height="18" rx="2" /><circle cx="9" cy="9" r="2" /><path d="M7 16c.5-1.7 1.5-2.5 3-2.5s2.5.8 3 2.5M14 8h3M14 11h3" /></>,
  answerKey: <><circle cx="8" cy="15" r="4" /><path d="m11 12 8-8M15 8l2 2M17 6l2 2" /></>,
  arrow: <><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>,
  book: <><path d="M4 5.5A3.5 3.5 0 0 1 7.5 2H11v17H7.5A3.5 3.5 0 0 0 4 22z" /><path d="M20 5.5A3.5 3.5 0 0 0 16.5 2H13v17h3.5A3.5 3.5 0 0 1 20 22z" /></>,
  briefcase: <><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18M10 12v2h4v-2" /></>,
  chart: <><path d="M4 19V9" /><path d="M10 19V5" /><path d="M16 19v-7" /><path d="M22 19H2" /></>,
  check: <path d="m5 12 4 4L19 6" />,
  chevron: <path d="m9 18 6-6-6-6" />,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  contact: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m4 7 8 6 8-6" /><circle cx="8" cy="10" r="1" /></>,
  exam: <><path d="M9 4h6l1 2h3v15H5V6h3z" /><path d="m8 12 2 2 5-5M8 18h8" /></>,
  file: <><path d="M6 3h8l4 4v14H6z" /><path d="M14 3v5h5" /><path d="M9 13h6M9 17h5" /></>,
  graduation: <><path d="m2 9 10-5 10 5-10 5z" /><path d="M6 11.5V16c3 2.7 9 2.7 12 0v-4.5M22 9v6" /></>,
  grid: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
  layers: <><path d="m12 3 9 5-9 5-9-5z" /><path d="m3 12 9 5 9-5M3 16l9 5 9-5" /></>,
  menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>,
  plus: <><path d="M12 5v14M5 12h14" /></>,
  search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
  settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.6v-.2h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z" /></>,
  spark: <><path d="m12 3 1.3 4.1L17 9l-3.7 1.9L12 15l-1.3-4.1L7 9l3.7-1.9z" /><path d="m19 15 .7 2.3L22 18l-2.3.7L19 21l-.7-2.3L16 18l2.3-.7z" /></>,
  trend: <><path d="m4 16 5-5 4 4 7-8" /><path d="M15 7h5v5" /></>,
  trophy: <><path d="M8 4h8v5a4 4 0 0 1-8 0zM12 13v5M8 21h8M9 18h6" /><path d="M8 6H4v2a4 4 0 0 0 4 4M16 6h4v2a4 4 0 0 1-4 4" /></>,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /><path d="M17.5 14.5 20 17l2-2" /></>,
  users: <><path d="M16 20v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 20v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8" /></>,
};

export function Icon({
  name,
  size = 20,
}: {
  name: IconName;
  size?: number;
}) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  );
}
