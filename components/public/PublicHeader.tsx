import Image from "next/image";
import Link from "next/link";
import logoImage from "@/app/logo.png";
import { publicNavigation } from "@/config/navigation";
import { SavedJobsHeaderButton } from "@/components/public/SavedJobsHeaderButton";
import { LatestUpdatesHeaderButton } from "@/components/public/LatestUpdatesHeaderButton";
import { HeaderPopoverCoordinator } from "@/components/public/HeaderPopoverCoordinator";
import { Icon, type IconName } from "@/components/ui/Icon";

const navigationIcons: Record<string, IconName> = {
  "/": "grid",
  "/jobs": "briefcase",
  "/results": "trophy",
  "/admit-cards": "admit",
  "/exams": "exam",
  "/image-compressor": "settings",
  "/answer-keys": "answerKey",
  "/syllabus": "book",
  "/admissions": "graduation",
  "/about": "users",
  "/contact": "contact",
  "/privacy-policy": "check",
  "/terms-and-conditions": "file",
  "/disclaimer": "bell",
};

export function PublicHeader() {
  const primaryNavigation = publicNavigation.slice(0, 6);
  const menuNavigation = publicNavigation.slice(6);

  return (
    <header className="public-header minimal-public-header">
      <div className="minimal-header-card">
        <HeaderPopoverCoordinator />
        <Link className="public-header-logo" href="/" prefetch={false} aria-label="Sarkari Global Result home">
          <Image
            src={logoImage}
            alt="Sarkari Global Result"
            preload
            quality={55}
            sizes="(max-width: 760px) 165px, 200px"
          />
        </Link>

        <nav className="minimal-primary-nav" aria-label="Main navigation">
          {primaryNavigation.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              prefetch={false}
            >
              <Icon name={navigationIcons[item.href] ?? "grid"} size={14} />
              <span>{item.label}</span>
            </Link>
          ))}
          <details className="public-company-menu minimal-more-menu">
            <summary>
              Menu <Icon name="chevron" size={13} />
            </summary>
            <div>
              <span><strong>Explore</strong><small>Useful links and resources</small></span>
              {menuNavigation.map((item) => (
                <Link key={item.label} href={item.href} prefetch={false}>
                  <span className="minimal-menu-tile-icon"><Icon name={navigationIcons[item.href] ?? "grid"} size={14} /></span>
                  <small>{item.label}</small>
                </Link>
              ))}
            </div>
          </details>
        </nav>
        <div className="minimal-header-actions">
          <LatestUpdatesHeaderButton />
          <SavedJobsHeaderButton />
        </div>
      </div>

    </header>
  );
}
