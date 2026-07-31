"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import logoImage from "@/app/logo.png";
import { publicNavigation } from "@/config/navigation";
import { Icon } from "@/components/ui/Icon";

export function PublicHeader() {
  const pathname = usePathname();
  const primaryNavigation = publicNavigation.slice(0, 5);
  const browseNavigation = publicNavigation.slice(5);
  const isActive = (href: string) => href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="public-header minimal-public-header">
      <div className="minimal-header-card">
        <Link className="public-header-logo" href="/" aria-label="Sarkari Global Result home">
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
              aria-current={isActive(item.href) ? "page" : undefined}
              className={isActive(item.href) ? "active" : ""}
              key={item.label}
              href={item.href}
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
                    aria-current={isActive(item.href) ? "page" : undefined}
                    className={isActive(item.href) ? "active" : ""}
                    key={item.label}
                    href={item.href}
                  >
                    <span>{item.label}</span><i>→</i>
                  </Link>
                ))}
              </div>
            </div>
          </details>
        </nav>
      </div>

    </header>
  );
}
