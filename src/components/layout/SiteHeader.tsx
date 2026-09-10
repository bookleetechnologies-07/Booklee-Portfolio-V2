"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";

import { MobileMenu } from "@/components/layout/MobileMenu";
import { Logo } from "@/components/ui/Logo";
import { navItems, type NavItem } from "@/content/nav";
import { useHeroPhase } from "@/lib/heroState";
import { cn } from "@/lib/cn";

type NavTheme = "dark" | "light";

/**
 * Reads the section currently sitting under the navigation by sampling a thin
 * band just below it. Sections opt in with `data-nav-theme`; anything unmarked
 * leaves the last value in place.
 */
function useSectionNavTheme(initial: NavTheme): NavTheme {
  const [theme, setTheme] = useState<NavTheme>(initial);

  useEffect(() => {
    const line = 56;
    const sections = Array.from(
      document.querySelectorAll<HTMLElement>("[data-nav-theme]"),
    );
    if (sections.length === 0) return;

    const read = () => {
      let next: NavTheme | null = null;
      for (const section of sections) {
        const rect = section.getBoundingClientRect();
        if (rect.top <= line && rect.bottom > line) {
          next = (section.dataset.navTheme as NavTheme) ?? null;
        }
      }
      if (next) setTheme(next);
    };

    read();
    window.addEventListener("scroll", read, { passive: true });
    window.addEventListener("resize", read);
    return () => {
      window.removeEventListener("scroll", read);
      window.removeEventListener("resize", read);
    };
  }, [initial]);

  return theme;
}

const isActive = (pathname: string, href: string) =>
  href === "/" ? pathname === "/" : pathname.startsWith(href);

/**
 * A floating navigation bar: detached from the viewport edges, opaque black
 * with a hairline edge and a little grain — no frosted glass, no translucency,
 * nothing that would smear over the full-screen websites behind it.
 *
 * Its visibility is choreography rather than a scroll listener. The hero
 * timeline is the only thing that decides when the page is animating; this
 * component reads that phase, and the phase is a pure function of scrubbed
 * progress, so reverse scrolling reverses the bar exactly.
 *
 * The bar is hidden for the whole active hero — from the first meaningful
 * laptop motion at 8% through to the hero releasing at 94% — not merely during
 * the immersive deck. While hidden it is `inert` and `aria-hidden`, so it
 * leaves the tab order and stops receiving pointer events. It is never
 * `display: none`, so the transform and opacity transition always plays.
 */
export function SiteHeader() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const theme = useSectionNavTheme(isHome ? "dark" : "light");
  const phase = useHeroPhase();
  const hidden = phase === "active";
  const dark = theme === "dark";

  return (
    <header
      inert={hidden}
      aria-hidden={hidden || undefined}
      className={cn(
        "fixed inset-x-0 top-0 z-50 flex justify-center px-3 pt-3 md:px-6 md:pt-5",
        "transition-[transform,opacity] duration-[620ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
        hidden
          ? "pointer-events-none -translate-y-[150%] scale-[0.97] opacity-0"
          : "translate-y-0 scale-100 opacity-100",
      )}
    >
      <div
        className={cn(
          "grain on-dark relative flex w-full items-center gap-1 rounded-[14px] border border-white/14 bg-black px-3 py-2 text-bone md:gap-3 md:px-4 lg:w-auto",
          "shadow-[0_18px_44px_-24px_rgba(0,0,0,0.95)]",
          // A hairline that lifts the bar off light sections too.
          !dark && "border-white/20",
        )}
      >
        <Link
          href="/"
          aria-label="Booklee — home"
          className="relative z-50 shrink-0 pr-1 transition-opacity duration-200 hover:opacity-70 md:pr-2"
        >
          <Logo />
        </Link>

        <span
          aria-hidden="true"
          className="hidden h-6 w-px shrink-0 bg-white/14 lg:block"
        />

        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center">
            {navItems
              .filter((item) => !item.cta)
              .map((item) =>
                item.children ? (
                  <ServicesMenu
                    key={item.href}
                    item={item}
                    pathname={pathname}
                  />
                ) : (
                  <li key={item.href}>
                    <NavLink item={item} pathname={pathname} />
                  </li>
                ),
              )}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/book-a-call"
            aria-current={
              pathname.startsWith("/book-a-call") ? "page" : undefined
            }
            className="hidden h-9 items-center rounded-[9px] bg-mint px-4 text-sm font-medium text-ink transition-[transform,background-color] duration-200 hover:-translate-y-px hover:bg-[color-mix(in_oklab,var(--color-mint)_84%,white)] lg:inline-flex"
          >
            Book a call
          </Link>
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}

function NavLink({
  item,
  pathname,
  className,
}: {
  item: NavItem;
  pathname: string;
  className?: string;
}) {
  const active = isActive(pathname, item.href);
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative inline-flex h-9 items-center px-3.5 text-sm transition-colors duration-200",
        active ? "text-bone" : "text-fog/65 hover:text-bone",
        className,
      )}
    >
      {item.label}
      <span
        aria-hidden="true"
        className={cn(
          "absolute bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-mint transition-opacity duration-200",
          active ? "opacity-100" : "opacity-0",
        )}
      />
    </Link>
  );
}

/**
 * Services, with its submenu.
 *
 * The parent is a real link that always navigates to /services — the disclosure
 * is a separate button beside it, so opening the submenu can never cost anyone
 * access to the parent page. That is the whole reason this is a link plus a
 * button rather than a single button that swallows the destination.
 *
 * Pointer users get it on hover; keyboard users get it from the button, with
 * ArrowDown to open, Escape to close and focus restored to the button. It also
 * closes when focus leaves the group entirely, which is what makes tabbing
 * straight through it behave.
 */
function ServicesMenu({
  item,
  pathname,
}: {
  item: NavItem;
  pathname: string;
}) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const rootRef = useRef<HTMLLIElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeTimer = useRef<number | null>(null);

  const close = useCallback(() => {
    setOpen(false);
    if (closeTimer.current !== null) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }, []);

  // Route changes should never leave the panel open over the new page.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    if (open) setOpen(false);
  }

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) close();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      close();
      triggerRef.current?.focus();
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, close]);

  useEffect(
    () => () => {
      if (closeTimer.current !== null) window.clearTimeout(closeTimer.current);
    },
    [],
  );

  const active = isActive(pathname, item.href);

  return (
    <li
      ref={rootRef}
      className="relative"
      onPointerEnter={() => {
        if (closeTimer.current !== null) {
          window.clearTimeout(closeTimer.current);
          closeTimer.current = null;
        }
        setOpen(true);
      }}
      onPointerLeave={() => {
        // A short grace period, so crossing the gap to the panel does not
        // close it out from under the pointer.
        closeTimer.current = window.setTimeout(() => setOpen(false), 120);
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node)) close();
      }}
    >
      <div className="flex items-center">
        <NavLink item={item} pathname={pathname} className="pr-1.5" />
        <button
          ref={triggerRef}
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          aria-label={`${item.label} submenu`}
          onClick={() => setOpen((value) => !value)}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown") {
              event.preventDefault();
              setOpen(true);
            }
          }}
          className={cn(
            "inline-flex h-9 w-6 items-center justify-center rounded-md transition-colors duration-200",
            active ? "text-bone" : "text-fog/65 hover:text-bone",
          )}
        >
          <svg
            viewBox="0 0 10 6"
            aria-hidden="true"
            className={cn(
              "h-[5px] w-[9px] transition-transform duration-200",
              open && "rotate-180",
            )}
          >
            <path
              d="M1 1l4 4 4-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {/*
        `hidden` rather than conditional rendering, so the panel keeps a stable
        id for aria-controls and never re-mounts mid-interaction.
      */}
      <div
        id={panelId}
        hidden={!open}
        className="absolute top-[calc(100%+0.55rem)] left-0 z-50 w-[19rem] rounded-[12px] border border-white/14 bg-black p-1.5 shadow-[0_24px_60px_-28px_rgba(0,0,0,0.95)]"
      >
        <ul className="flex flex-col">
          {item.children?.map((child) => {
            const childActive =
              child.href === "/services"
                ? pathname === "/services"
                : pathname.startsWith(child.href);
            return (
              <li key={child.href}>
                <Link
                  href={child.href}
                  aria-current={childActive ? "page" : undefined}
                  className={cn(
                    "flex flex-col gap-1 rounded-[9px] px-3.5 py-3 transition-colors duration-200",
                    childActive ? "bg-white/10 text-bone" : "hover:bg-white/[0.07]",
                  )}
                >
                  <span
                    className={cn(
                      "text-sm font-medium",
                      childActive ? "text-bone" : "text-fog/90",
                    )}
                  >
                    {child.label}
                  </span>
                  <span className="text-[0.8125rem] leading-snug text-fog/55">
                    {child.description}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </li>
  );
}
