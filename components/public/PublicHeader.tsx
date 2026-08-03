import Image from "next/image";
import Link from "next/link";
import logoImage from "@/app/logo.png";
import { publicNavigation } from "@/config/navigation";
import { SavedJobsHeaderButton } from "@/components/public/SavedJobsHeaderButton";
import { LatestUpdatesHeaderButton } from "@/components/public/LatestUpdatesHeaderButton";
import { HeaderPopoverCoordinator } from "@/components/public/HeaderPopoverCoordinator";

export function PublicHeader() {
  const primaryNavigation = publicNavigation.slice(0, 6);

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
        </nav>
        <div className="minimal-header-actions">
          <LatestUpdatesHeaderButton />
          <SavedJobsHeaderButton />
        </div>
      </div>

    </header>
  );
}
