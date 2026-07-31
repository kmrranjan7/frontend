"use client";

import { useEffect } from "react";
import { announceHeaderPopover, HEADER_POPOVER_OPEN_EVENT, type HeaderPopoverName } from "@/lib/header-popovers";

export function HeaderPopoverCoordinator() {
  useEffect(() => {
    const menu = document.querySelector<HTMLDetailsElement>(".public-header .browse-menu");
    if (!menu) return;

    const announceMenu = () => {
      if (menu.open) announceHeaderPopover("browse-menu");
    };
    const closeMenu = (event: Event) => {
      if ((event as CustomEvent<HeaderPopoverName>).detail !== "browse-menu") menu.open = false;
    };
    const closeAfterSelection = (event: Event) => {
      if (event.target instanceof Element && event.target.closest("a")) menu.open = false;
    };

    menu.addEventListener("toggle", announceMenu);
    menu.addEventListener("click", closeAfterSelection);
    window.addEventListener(HEADER_POPOVER_OPEN_EVENT, closeMenu);
    return () => {
      menu.removeEventListener("toggle", announceMenu);
      menu.removeEventListener("click", closeAfterSelection);
      window.removeEventListener(HEADER_POPOVER_OPEN_EVENT, closeMenu);
    };
  }, []);

  return null;
}
