"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { MobileMenu } from "@/components/layout/MobileMenu";
import { Logo } from "@/components/ui/Logo";
import { navItems } from "@/content/nav";
import { cn } from "@/lib/cn";

type NavTheme = "dark" | "light";

/**
 * Reads the section currently sitting under the header by watching a thin
 * sampling band just below the header line. Sections opt in with
 * `data-nav-theme="dark" | "light"`; anything unmarked leaves the last value in
 * place, which is what you want for short spacer elements.
 */
function useSectionNavTheme(initial: NavTheme): NavTheme {
  const [theme, setTheme] = useState<NavTheme>(initial);

  useEffect(() => {
    // `read()` below sets the theme from whatever section is actually under
    // the header, including on the first pass after a route change, so there
    // is nothing to seed here.
    const line = 40; // sampling line, in px from the top of the viewport
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

export function SiteHeader() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const theme = useSectionNavTheme(isHome ? "dark" : "light");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const dark = theme === "dark";

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,color] duration-300",
        dark ? "text-bone on-dark" : "text-ink",
        scrolled
          ? dark
            ? "border-b border-white/10 bg-ink/70 backdrop-blur-md"
            : "border-b border-ink/10 bg-paper/80 backdrop-blur-md"
          : "border-b border-transparent bg-transparent",
      )}
    >
      {/*
        The mobile menu panel renders inside this header and is positioned, so
        the bar itself needs to sit above it — otherwise the wordmark and the
        close button end up underneath the open panel.
      */}
      <div className="shell relative z-50 flex h-[var(--header-h)] items-center justify-between gap-6">
        <Link
          href="/"
          aria-label="Booklee — home"
          className="relative z-50 text-[0.8rem] transition-opacity duration-200 hover:opacity-70"
        >
          <Logo />
        </Link>

        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {navItems.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);

              if (item.cta) {
                return (
                  <li key={item.href} className="ml-4">
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "inline-flex h-10 items-center rounded-full px-5 text-sm font-medium transition-[transform,background-color] duration-200 hover:-translate-y-px",
                        "bg-mint text-ink hover:bg-[color-mix(in_oklab,var(--color-mint)_82%,white)]",
                      )}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              }

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "relative inline-flex h-10 items-center px-4 text-sm transition-opacity duration-200",
                      active ? "opacity-100" : "opacity-70 hover:opacity-100",
                    )}
                  >
                    {item.label}
                    <span
                      aria-hidden="true"
                      className={cn(
                        "absolute bottom-1.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-current transition-opacity duration-200",
                        active ? "opacity-100" : "opacity-0",
                      )}
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <MobileMenu />
      </div>
    </header>
  );
}
