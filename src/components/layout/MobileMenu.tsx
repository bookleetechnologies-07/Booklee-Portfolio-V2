"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { createPortal } from "react-dom";

import { navItems } from "@/content/nav";
import { siteConfig } from "@/content/site";
import { cn } from "@/lib/cn";

const FOCUSABLE =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** True only on the client, without an effect and without a hydration gap. */
const subscribeNever = () => () => {};
const useMounted = () =>
  useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false,
  );

export function MobileMenu() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const mounted = useMounted();
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => setOpen(false), []);

  // Route changes should never leave the panel hanging open behind the new
  // page. Adjusting during render is React's documented way to reset state
  // when a value changes, and avoids an extra render pass.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;

    const { body } = document;
    const previousOverflow = body.style.overflow;
    const previousPadding = body.style.paddingRight;
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    body.style.overflow = "hidden";
    if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`;

    const panel = panelRef.current;
    const trigger = triggerRef.current;
    const first = panel?.querySelector<HTMLElement>(FOCUSABLE);
    first?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }
      if (event.key !== "Tab" || !panel) return;

      const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (items.length === 0) return;
      const firstItem = items[0];
      const lastItem = items[items.length - 1];

      if (event.shiftKey && document.activeElement === firstItem) {
        event.preventDefault();
        lastItem.focus();
      } else if (!event.shiftKey && document.activeElement === lastItem) {
        event.preventDefault();
        firstItem.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPadding;
      // Return focus where the user left it.
      trigger?.focus();
    };
  }, [open, close]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={panelId}
        className={cn(
          /*
           * This `z-50` ranks the trigger inside the header only. It cannot
           * lift it above the open panel: the header is `fixed ... z-50` and so
           * is its own stacking context, while the panel is portalled to
           * `document.body` at `z-[60]` and therefore paints over the whole bar
           * — trigger included. That is why the panel carries its own close
           * button below rather than relying on this one being re-tappable.
           */
          "relative z-50 -mr-2 inline-flex h-11 min-w-11 items-center gap-2.5 rounded-full px-3 text-sm lg:hidden",
          "transition-opacity duration-200 hover:opacity-70",
        )}
      >
        <span className="sr-only">
          {open ? "Close navigation menu" : "Open navigation menu"}
        </span>
        <span aria-hidden="true" className="relative block h-3.5 w-5">
          <span
            className={cn(
              "absolute left-0 block h-px w-5 bg-current transition-transform duration-300",
              open ? "top-1.5 rotate-45" : "top-0",
            )}
          />
          <span
            className={cn(
              "absolute left-0 block h-px w-5 bg-current transition-transform duration-300",
              open ? "top-1.5 -rotate-45" : "top-3",
            )}
          />
        </span>
        <span aria-hidden="true" className="meta uppercase">
          {open ? "Close" : "Menu"}
        </span>
      </button>

      {mounted
        ? createPortal(
            <div
              id={panelId}
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-label="Site navigation"
              hidden={!open}
              className={cn(
                "on-dark fixed inset-0 z-[60] flex flex-col bg-black text-bone lg:hidden",
                "grain grain-strong",
              )}
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-70 [background:radial-gradient(120%_70%_at_80%_0%,rgba(220,204,244,0.14),transparent_60%)]"
              />
              {/*
                The panel's own way out.

                It has to live in here rather than in the header, because the
                header's trigger — which does flip to an X and does call the
                same state — is painted over by this panel and cannot be
                reached while it is open. Without this button the only ways out
                were the Escape key and following a link, neither of which is
                available to someone using the menu on a phone.

                It sits in the band the nav below already reserves with its
                `--header-h` top padding, so it overlaps nothing and no
                existing layout moves. The band ignores pointer events and only
                the button takes them back, so it cannot swallow a scroll aimed
                at the list underneath it.

                It is also first in the DOM, which puts it first in the focus
                trap's order: opening the menu now lands focus on Close, which
                is the conventional place for a dialog to start.
              */}
              <div className="shell pointer-events-none absolute inset-x-0 top-0 z-20 flex h-[var(--header-h)] items-center justify-end">
                <button
                  type="button"
                  onClick={close}
                  aria-label="Close menu"
                  className={cn(
                    "pointer-events-auto -mr-2 inline-flex h-11 min-w-11 items-center gap-2.5 rounded-full px-3 text-sm",
                    "transition-opacity duration-200 hover:opacity-70",
                  )}
                >
                  <span aria-hidden="true" className="relative block h-3.5 w-5">
                    <span className="absolute top-1.5 left-0 block h-px w-5 rotate-45 bg-current" />
                    <span className="absolute top-1.5 left-0 block h-px w-5 -rotate-45 bg-current" />
                  </span>
                  <span aria-hidden="true" className="meta uppercase">
                    Close
                  </span>
                </button>
              </div>

              <nav
                aria-label="Primary"
                className="shell relative z-10 flex flex-1 flex-col justify-center overflow-y-auto pt-[calc(var(--header-h)+1.5rem)] pb-10"
              >
                <ul className="flex flex-col">
                  {navItems.map((item, index) => {
                    const active =
                      item.href === "/"
                        ? pathname === "/"
                        : pathname.startsWith(item.href);
                    return (
                      <li key={item.href} className="border-b border-white/10">
                        <Link
                          href={item.href}
                          aria-current={active ? "page" : undefined}
                          className="flex items-baseline gap-4 py-5"
                        >
                          <span className="meta w-8 shrink-0 text-fog/50">
                            0{index + 1}
                          </span>
                          <span
                            className={cn(
                              "display-lg",
                              active ? "text-mint" : "text-bone",
                            )}
                          >
                            {item.label}
                          </span>
                        </Link>

                        {/*
                          Sub-destinations are simply present and expanded — no
                          accordion to discover and nothing to toggle. The
                          parent above stays a real link, so /services is never
                          traded away for its own submenu.
                        */}
                        {item.children ? (
                          <ul
                            aria-label={`${item.label} sections`}
                            className="-mt-1 flex flex-col gap-1 pb-5 pl-12"
                          >
                            {item.children.map((child) => {
                              const childActive =
                                child.href === "/services"
                                  ? pathname === "/services"
                                  : pathname.startsWith(child.href);
                              return (
                                <li key={child.href}>
                                  <Link
                                    href={child.href}
                                    aria-current={
                                      childActive ? "page" : undefined
                                    }
                                    className={cn(
                                      "flex min-h-11 items-center text-base",
                                      childActive
                                        ? "text-mint"
                                        : "text-fog/70",
                                    )}
                                  >
                                    {child.label}
                                  </Link>
                                </li>
                              );
                            })}
                          </ul>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>

                <div className="mt-10 flex flex-col gap-4">
                  <Link
                    href="/book-a-call"
                    className="inline-flex h-14 items-center justify-center rounded-[12px] bg-mint px-8 text-base font-medium text-ink"
                  >
                    Book a call
                  </Link>
                  <a
                    href={`mailto:${siteConfig.email}`}
                    className="meta text-fog/70 underline-offset-4 hover:underline"
                  >
                    {siteConfig.email}
                  </a>
                </div>
              </nav>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
