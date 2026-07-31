import Image from "next/image";
import Link from "next/link";
import logoImage from "@/app/logo.png";
import { publicNavigation } from "@/config/navigation";
import { Icon } from "@/components/ui/Icon";
import { SavedJobsHeaderButton } from "@/components/public/SavedJobsHeaderButton";
import { LatestUpdatesHeaderButton } from "@/components/public/LatestUpdatesHeaderButton";
import { HeaderPopoverCoordinator } from "@/components/public/HeaderPopoverCoordinator";

export function PublicHeader() {
  const primaryNavigation = publicNavigation.slice(0, 5);
  const browseNavigation = publicNavigation.slice(5);

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
              {item.label}
            </Link>
          ))}
          <details className="browse-menu">
            <summary>
              Menu
              <Icon name="chevron" size={13} />
            </summary>
            <div className="browse-menu-panel">
              <div className="browse-menu-heading">
                <span>EXPLORE SARKARI GLOBAL RESULT</span>
                <strong>Find the update you need</strong>
                <small>Jobs, examinations, tools, and important information in one place.</small>
              </div>
              <div className="browse-menu-links">
                {browseNavigation.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    prefetch={false}
                  >
                    <span>{item.label}</span><i>→</i>
                  </Link>
                ))}
              </div>
            </div>
          </details>
        </nav>
        <LatestUpdatesHeaderButton />
        <SavedJobsHeaderButton />
      </div>

    </header>
  );
}
