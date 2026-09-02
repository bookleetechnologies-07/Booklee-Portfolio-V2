"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";

import { navItems } from "@/content/nav";
import { siteConfig } from "@/content/site";
import { cn } from "@/lib/cn";

const FOCUSABLE =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function MobileMenu() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const panelId = useId();
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
          // Above the panel, which is a sibling inside the same header bar.
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

      <div
        id={panelId}
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Site navigation"
        hidden={!open}
        className={cn(
          "on-dark fixed inset-0 z-40 flex flex-col bg-ink text-bone lg:hidden",
          "grain grain-strong",
        )}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-70 [background:radial-gradient(120%_70%_at_80%_0%,rgba(220,204,244,0.14),transparent_60%)]"
        />
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
                </li>
              );
            })}
          </ul>

          <div className="mt-10 flex flex-col gap-4">
            <Link
              href="/book-a-call"
              className="inline-flex h-14 items-center justify-center rounded-full bg-mint px-8 text-base font-medium text-ink"
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
      </div>
    </>
  );
}
