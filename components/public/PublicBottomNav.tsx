"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { publicNavigation } from "@/config/navigation";
import { Icon, type IconName } from "@/components/ui/Icon";

const navigationIcons: readonly IconName[] = [
  "grid",
  "briefcase",
  "trophy",
  "admit",
  "exam",
  "file",
  "answerKey",
  "book",
  "graduation",
  "users",
  "contact",
  "file",
  "check",
  "settings",
];

export function PublicBottomNav() {
  const pathname = usePathname();
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const primaryItems = publicNavigation.slice(0, 4);
  const moreItems = publicNavigation.slice(4);
  const isActive = (href: string) => href === "/" ? pathname === "/" : pathname.startsWith(href);
  const isMoreActive = moreItems.some((item) => isActive(item.href));

  useEffect(() => {
    if (!isMoreOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsMoreOpen(false);
    };

    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [isMoreOpen]);

  return (
    <>
      <nav className="public-compact-nav" aria-label="Quick navigation">
        {primaryItems.map((item, index) => (
          <Link
            aria-current={isActive(item.href) ? "page" : undefined}
            className={isActive(item.href) ? "active" : ""}
            key={item.label}
            href={item.href}
          >
            <span><Icon name={navigationIcons[index]} size={15} /></span>
            <small>{item.label}</small>
          </Link>
        ))}
        <div className={`public-bottom-more ${isMoreActive ? "active" : ""} ${isMoreOpen ? "open" : ""}`}>
          <button
            type="button"
            aria-expanded={isMoreOpen}
            aria-controls="public-bottom-more-menu"
            onClick={() => setIsMoreOpen((open) => !open)}
            onTouchEnd={(event) => {
              event.preventDefault();
              setIsMoreOpen((open) => !open);
            }}
          >
            <span><Icon name="menu" size={15} /></span>
            <small>More</small>
          </button>
        </div>
      </nav>
      {isMoreOpen ? createPortal(
        <div className="public-bottom-menu-layer">
          <button
            className="public-bottom-menu-backdrop"
            type="button"
            aria-label="Close menu"
            onClick={() => setIsMoreOpen(false)}
          />
          <section className="public-bottom-menu" id="public-bottom-more-menu" aria-label="More navigation">
          <header>
            <span>Explore</span>
            <strong>All Sarkari Global Result sections</strong>
          </header>
          <div>
            {moreItems.map((item, index) => (
              <Link
                aria-current={isActive(item.href) ? "page" : undefined}
                className={isActive(item.href) ? "active" : ""}
                key={item.label}
                href={item.href}
                onClick={() => setIsMoreOpen(false)}
              >
                <span><Icon name={navigationIcons[index + primaryItems.length] ?? "grid"} size={16} /></span>
                <small>{item.label}</small>
              </Link>
            ))}
          </div>
          </section>
        </div>,
        document.body,
      ) : null}
    </>
  );
}
