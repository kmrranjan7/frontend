const profiles = [
  { label: "WhatsApp", href: "https://whatsapp.com/channel/0029VbCd7pX2ER6btYssot1V", icon: "whatsapp" },
  { label: "Telegram", href: "https://t.me/sarkariglobalresult", icon: "telegram" },
  { label: "Facebook", href: "https://facebook.com/sarkariglobalresult", icon: "facebook" },
  { label: "Instagram", href: "https://instagram.com/sarkariglobalresult", icon: "instagram" },
  { label: "YouTube", href: "https://youtube.com/@sarkariglobalresult", icon: "youtube" },
  { label: "Contact", href: "/contact", icon: "contact" },
] as const;

function NetworkIcon({ name }: { name: (typeof profiles)[number]["icon"] }) {
  const paths = {
    whatsapp: <path d="M20.5 3.5A10.8 10.8 0 0 0 3.6 16.6L2 22l5.6-1.5A10.8 10.8 0 0 0 20.5 3.5Zm-8.2 17a8.8 8.8 0 0 1-4.5-1.2l-.3-.2-3.3.9.9-3.2-.2-.3a8.8 8.8 0 1 1 7.4 4Zm4.8-6.6c-.3-.1-1.6-.8-1.9-.9-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.6.1a7.2 7.2 0 0 1-2.1-1.3 8 8 0 0 1-1.5-1.8c-.2-.3 0-.5.1-.6l.4-.5.3-.5c.1-.2 0-.4 0-.5l-.8-1.9c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.3-.9.9-.9 2.2 0 1.3.9 2.5 1.1 2.7.1.2 1.9 3 4.7 4.1.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.5-.1 1.6-.7 1.8-1.3.2-.6.2-1.1.2-1.3-.1-.1-.3-.2-.6-.3Z" />,
    telegram: <path d="M21.6 3.4 18.4 20c-.2 1.2-.9 1.5-1.9.9l-4.9-3.6-2.4 2.3c-.3.3-.5.5-1 .5l.4-5 9-8.1c.4-.4-.1-.6-.6-.2L5.8 13.9 1 12.4c-1-.3-1.1-1 .2-1.5L20 3.7c.9-.3 1.7.2 1.6-.3Z" />,
    facebook: <path d="M14 8.5V6.8c0-.8.5-1 1-1h2.5V2.1L14.1 2C10.7 2 9 4 9 6.5v2H6V13h3v9h5v-9h3.2l.6-4.5H14Z" />,
    instagram: <><rect x="3" y="3" width="18" height="18" rx="5" className="network-icon-outline" /><circle cx="12" cy="12" r="4.2" className="network-icon-outline" /><circle cx="17.5" cy="6.5" r="1" /></>,
    youtube: <><path d="M21.4 6.2a2.8 2.8 0 0 0-2-2C17.7 3.7 12 3.7 12 3.7s-5.7 0-7.4.5a2.8 2.8 0 0 0-2 2A29 29 0 0 0 2.1 12a29 29 0 0 0 .5 5.8 2.8 2.8 0 0 0 2 2c1.7.5 7.4.5 7.4.5s5.7 0 7.4-.5a2.8 2.8 0 0 0 2-2 29 29 0 0 0 .5-5.8 29 29 0 0 0-.5-5.8Z" /><path d="m10 15.5 5-3.5-5-3.5Z" className="network-icon-fill" /></>,
    contact: <><rect x="2.5" y="4.5" width="19" height="15" rx="2.5" className="network-icon-outline" /><path d="m4 7 8 6 8-6" className="network-icon-outline" /></>,
  };
  return <svg viewBox="0 0 24 24" aria-hidden="true">{paths[name]}</svg>;
}

export function SocialMediaLinks() {
  return (
    <div className="footer-network-links" aria-label="Follow Sarkari Global Result">
      {profiles.map((profile) => (
        <a
          key={profile.label}
          className={`footer-network-${profile.icon}`}
          href={profile.href}
          target={profile.href.startsWith("http") ? "_blank" : undefined}
          rel={profile.href.startsWith("http") ? "noopener noreferrer" : undefined}
          aria-label={profile.href.startsWith("http") ? `${profile.label} — opens in a new tab` : profile.label}
          title={profile.label}
        >
          <NetworkIcon name={profile.icon} />
        </a>
      ))}
    </div>
  );
}
