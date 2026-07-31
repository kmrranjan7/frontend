"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { publicNavigation } from "@/config/navigation";
import { Icon, type IconName } from "@/components/ui/Icon";
import { announceHeaderPopover, HEADER_POPOVER_OPEN_EVENT, type HeaderPopoverName } from "@/lib/header-popovers";

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

  function toggleMoreMenu() {
    const next = !isMoreOpen;
    if (next) announceHeaderPopover("bottom-more");
    setIsMoreOpen(next);
  }

  useEffect(() => {
    const closeForAnotherPopover = (event: Event) => {
      if ((event as CustomEvent<HeaderPopoverName>).detail !== "bottom-more") setIsMoreOpen(false);
    };
    window.addEventListener(HEADER_POPOVER_OPEN_EVENT, closeForAnotherPopover);
    return () => window.removeEventListener(HEADER_POPOVER_OPEN_EVENT, closeForAnotherPopover);
  }, []);

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
            prefetch={false}
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
            onClick={toggleMoreMenu}
            onTouchEnd={(event) => {
              event.preventDefault();
              toggleMoreMenu();
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
                prefetch={false}
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
