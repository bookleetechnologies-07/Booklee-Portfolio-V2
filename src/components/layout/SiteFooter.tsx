import Link from "next/link";

import { Logo } from "@/components/ui/Logo";
import { navItems } from "@/content/nav";
import { siteConfig } from "@/content/site";

export function SiteFooter() {
  // Rendered on the server at build/request time, so it can never disagree with
  // the client and cause a hydration mismatch.
  const year = new Date().getFullYear();

  return (
    <footer
      data-nav-theme="dark"
      className="on-dark grain relative bg-ink text-fog"
    >
      <div className="shell relative z-10 py-16 md:py-20">
        <div className="grid-12 gap-y-12">
          <div className="col-span-4 flex flex-col gap-5 md:col-span-8 lg:col-span-5">
            <Link
              href="/"
              aria-label="Booklee — home"
              className="w-fit text-[0.95rem] text-bone transition-opacity duration-200 hover:opacity-70"
            >
              <Logo />
            </Link>
            <p className="max-w-[34ch] text-[0.95rem] leading-relaxed text-fog/70">
              {siteConfig.positioning} We start with how your business actually
              works, then choose the design and technology to match.
            </p>
          </div>

          <nav
            aria-label="Footer"
            className="col-span-2 md:col-span-3 lg:col-span-3 lg:col-start-7"
          >
            <h2 className="eyebrow mb-5 text-fog/45">Pages</h2>
            <ul className="flex flex-col gap-2.5">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-[0.95rem] text-fog/80 underline-offset-4 transition-colors duration-200 hover:text-bone hover:underline"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="col-span-2 md:col-span-3 lg:col-span-3">
            <h2 className="eyebrow mb-5 text-fog/45">Contact</h2>
            <ul className="flex flex-col gap-2.5">
              <li>
                {/* TODO_CONTENT: confirm this inbox is monitored before launch. */}
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="text-[0.95rem] break-words text-fog/80 underline-offset-4 transition-colors duration-200 hover:text-bone hover:underline"
                >
                  {siteConfig.email}
                </a>
              </li>
              {/* TODO_CONTENT: verify each social account is active and owned by Booklee. */}
              {siteConfig.socials.map((social) => (
                <li key={social.href}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-[0.95rem] text-fog/80 underline-offset-4 transition-colors duration-200 hover:text-bone hover:underline"
                  >
                    {social.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-white/10 pt-6 text-fog/45 md:flex-row md:items-center md:justify-between">
          <p className="meta">
            &copy; {year} {siteConfig.legalName}. All rights reserved.
          </p>
          <p className="meta">
            {/* TODO_CONTENT: add privacy and terms links once those pages exist. */}
            {siteConfig.location}
          </p>
        </div>
      </div>
    </footer>
  );
}
