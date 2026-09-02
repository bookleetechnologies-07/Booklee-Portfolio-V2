import Link from "next/link";

import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/ui/Reveal";
import { RevealText } from "@/components/ui/RevealText";
import { services } from "@/content/services";
import { cn } from "@/lib/cn";

const ACCENT: Record<string, string> = {
  lilac: "var(--accent-lilac)",
  blue: "var(--accent-blue)",
  yellow: "var(--accent-yellow)",
  mint: "var(--accent-mint)",
  coral: "var(--accent-coral)",
};

/**
 * Six tiles in a staggered 3x2 composition. The stagger is a translate on the
 * middle and last columns rather than a masonry library — it reads as
 * deliberate typesetting and costs nothing.
 */
export function ServicesGrid() {
  return (
    <section
      data-nav-theme="light"
      aria-labelledby="services-heading"
      className="paper-tooth grain relative bg-paper section-pad"
    >
      <div className="shell">
        <div className="grid-12 gap-y-8">
          <div className="col-span-4 md:col-span-8 lg:col-span-5">
            <Eyebrow>Services</Eyebrow>
            <RevealText
              as="h2"
              id="services-heading"
              className="display-lg mt-6"
            >
              Everything your idea needs to become useful.
            </RevealText>
          </div>
          <Reveal className="col-span-4 md:col-span-8 lg:col-span-4 lg:col-start-9 lg:self-end">
            <p className="prose-body max-w-[40ch] text-muted">
              Choose a focused engagement or let us shape the complete product
              around your goals.
            </p>
            <Link
              href="/services"
              className="group mt-6 inline-flex items-center gap-2 text-sm font-medium underline-offset-[6px] hover:underline"
            >
              All services in detail
              <span
                aria-hidden="true"
                className="transition-transform duration-200 group-hover:translate-x-1"
              >
                &rarr;
              </span>
            </Link>
          </Reveal>
        </div>

        <ul className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5 lg:mt-20 lg:mb-24 lg:grid-cols-3">
          {services.map((service, index) => (
            <li
              key={service.slug}
              className={cn(
                index % 3 === 1 && "lg:translate-y-10",
                index % 3 === 2 && "lg:translate-y-20",
              )}
            >
              <Link
                href={`/services#${service.slug}`}
                className="group flex h-full flex-col justify-between gap-10 rounded-[18px] p-6 transition-transform duration-[240ms] hover:-translate-y-1 md:p-7"
                style={{ backgroundColor: ACCENT[service.accent] }}
              >
                <div>
                  <span className="meta text-ink/50 tabular-nums">
                    {service.index}
                  </span>
                  <h3 className="display-sm mt-5 text-ink">{service.title}</h3>
                  <p className="prose-body mt-3 text-ink/70">
                    {service.summary}
                  </p>
                </div>
                <span
                  aria-hidden="true"
                  className="text-lg text-ink/70 transition-transform duration-[240ms] group-hover:translate-x-1"
                >
                  &rarr;
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
