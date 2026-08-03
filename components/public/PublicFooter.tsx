import Link from "next/link";
import { siteConfig } from "@/config/site";
import { Logo } from "@/components/ui/Logo";
import { SocialMediaLinks } from "@/components/public/SocialMediaLinks";

const updateLinks = [
  { label: "Latest Jobs", href: "/jobs" },
  { label: "Results", href: "/results" },
  { label: "Admit Cards", href: "/admit-cards" },
  { label: "Exam Updates", href: "/exams" },
  { label: "Answer Keys", href: "/answer-keys" },
] as const;

const resourceLinks = [
  { label: "Syllabus", href: "/syllabus" },
  { label: "Admissions", href: "/admissions" },
  { label: "Image Compressor", href: "/image-compressor" },
  { label: "About Us", href: "/about" },
  { label: "Contact Us", href: "/contact" },
] as const;

const legalLinks = [
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms & Conditions", href: "/terms-and-conditions" },
  { label: "Disclaimer", href: "/disclaimer" },
  { label: "XML Sitemap", href: "/sitemap.xml" },
] as const;

function FooterLinkGroup({
  title,
  links,
}: {
  title: string;
  links: readonly { label: string; href: string }[];
}) {
  return (
    <nav className="footer-link-group" aria-label={`${title} links`}>
      <h2>{title}</h2>
      <ul>
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} prefetch={false}>{link.label}<span aria-hidden="true">›</span></Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function PublicFooter() {
  return (
    <footer className="public-footer">
      <div className="footer-accent" aria-hidden="true" />
      <div className="shell footer-main">
        <section className="footer-brand" aria-labelledby="footer-about-title">
          <Logo />
          <h2 id="footer-about-title" className="sr-only">About Sarkari Global Result</h2>
          <p>
            Timely government job, examination, result and education updates for candidates across India.
          </p>
          <div className="footer-trust-note">
            <span aria-hidden="true">✓</span>
            <p><strong>Independent information service</strong>Always confirm dates, eligibility and instructions on the official website.</p>
          </div>
        </section>

        <FooterLinkGroup title="Latest Updates" links={updateLinks} />
        <FooterLinkGroup title="Resources" links={resourceLinks} />
        <FooterLinkGroup title="Information" links={legalLinks} />
        <section className="footer-reach" aria-labelledby="footer-reach-title">
          <h2 id="footer-reach-title">Contact &amp; Follow</h2>
          <p>Questions or feedback? Reach our team or follow our official channels.</p>
          <div className="footer-reach-actions">
            <Link className="footer-contact-link" href="/contact" prefetch={false}>Contact Us <span aria-hidden="true">→</span></Link>
            <a className="footer-email" href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
            <SocialMediaLinks />
          </div>
        </section>
      </div>

      <div className="shell footer-bottom">
        <span>© {new Date().getUTCFullYear()} Sarkari Global Result. All rights reserved.</span>
        <span>Made for students and job seekers across India</span>
      </div>
    </footer>
  );
}
