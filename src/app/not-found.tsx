import type { Metadata } from "next";
import Link from "next/link";

import { navItems } from "@/content/nav";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <section
      data-nav-theme="light"
      className="paper-tooth grain relative flex min-h-screen items-center bg-paper"
    >
      <div className="shell py-24">
        <p className="eyebrow text-muted">404</p>
        <h1 className="display-xl mt-6 max-w-[16ch]">
          That page is not part of the build.
        </h1>
        <p className="prose-body mt-6 text-muted">
          The link may be out of date, or the page may never have existed. Here
          is everything that does.
        </p>
        <ul className="mt-10 flex flex-wrap gap-3">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="inline-flex h-12 items-center rounded-full border border-ink/20 px-6 text-sm font-medium transition-colors duration-200 hover:bg-ink hover:text-bone"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
