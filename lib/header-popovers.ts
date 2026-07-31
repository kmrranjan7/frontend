export const HEADER_POPOVER_OPEN_EVENT = "sarkari-global-result:header-popover-open";

export type HeaderPopoverName = "bottom-more" | "browse-menu" | "latest-updates" | "saved-jobs";

export function announceHeaderPopover(name: HeaderPopoverName) {
  window.dispatchEvent(new CustomEvent<HeaderPopoverName>(HEADER_POPOVER_OPEN_EVENT, { detail: name }));
}
