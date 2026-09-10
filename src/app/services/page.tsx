import type { Metadata } from "next";
import Link from "next/link";

import { BookingCTA } from "@/components/home/BookingCTA";
import { ProcessTiles } from "@/components/home/ProcessTiles";
import { PageIntro } from "@/components/ui/PageIntro";
import { Reveal } from "@/components/ui/Reveal";
import { RevealText } from "@/components/ui/RevealText";
import { services } from "@/content/services";
import { starterBySlug } from "@/content/starter-websites";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Discovery, design systems, websites, web applications, integrations and ongoing improvement — six focused Booklee engagements, and what can be tailored in each.",
  alternates: { canonical: "/services" },
  openGraph: {
    title: "Booklee services",
    description:
      "Six focused engagements, from discovery through to ongoing improvement, and exactly what changes from client to client.",
    url: "/services",
  },
};

const ACCENT: Record<string, string> = {
  lilac: "var(--accent-lilac)",
  blue: "var(--accent-blue)",
  yellow: "var(--accent-yellow)",
  mint: "var(--accent-mint)",
  coral: "var(--accent-coral)",
};

export default function ServicesPage() {
  return (
    <>
      <PageIntro
        eyebrow="Services"
        heading="Everything your idea needs to become useful."
        standfirst="Choose a focused engagement or let us shape the complete product around your goals. Each of these can be a standalone piece of work or one stage of a longer build."
        aside={
          <ul className="mt-8 flex flex-wrap gap-2">
            {services.map((service) => (
              <li key={service.slug}>
                <a
                  href={`#${service.slug}`}
                  className="meta inline-flex rounded-full border border-ink/15 px-3 py-1.5 text-muted transition-colors duration-200 hover:border-ink/40 hover:text-ink"
                >
                  {service.title}
                </a>
              </li>
            ))}
          </ul>
        }
      />

      <div data-nav-theme="light" className="bg-bone">
        {services.map((service, index) => (
          <section
            key={service.slug}
            id={service.slug}
            aria-labelledby={`${service.slug}-heading`}
            className="scroll-mt-24 border-t border-ink/10"
          >
            <div className="shell grid-12 gap-y-10 py-[clamp(3.5rem,7vw,7rem)]">
              <div className="col-span-4 md:col-span-8 lg:col-span-5">
                <div className="flex items-center gap-4">
                  <span
                    aria-hidden="true"
                    className="h-10 w-10 rounded-full"
                    style={{ backgroundColor: ACCENT[service.accent] }}
                  />
                  <span className="meta text-muted tabular-nums">
                    {service.index} / 06
                  </span>
                </div>
                <RevealText
                  as="h2"
                  id={`${service.slug}-heading`}
                  className="display-lg mt-7"
                >
                  {service.title}
                </RevealText>
                <p className="prose-body mt-6 text-muted">{service.problem}</p>

                {service.secondary ? (
                  <Link
                    href={service.secondary.href}
                    className="group mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-ink px-6 text-sm font-medium text-bone transition-transform duration-200 hover:-translate-y-0.5"
                  >
                    {service.secondary.label}
                    <span
                      aria-hidden="true"
                      className="transition-transform duration-200 group-hover:translate-x-1"
                    >
                      &rarr;
                    </span>
                  </Link>
                ) : null}

                {service.related.length > 0 ? (
                  <div className="mt-8">
                    <h3 className="eyebrow text-muted">Seen in</h3>
                    <ul className="mt-3 flex flex-wrap gap-2">
                      {service.related.map((slug) => {
                        const starter = starterBySlug(slug);
                        if (!starter) return null;
                        return (
                          <li key={slug}>
                            <Link
                              href={`/services/starter-websites/${slug}`}
                              className="meta inline-flex items-center gap-1.5 rounded-full border border-ink/15 px-3 py-1.5 transition-colors duration-200 hover:border-ink/40"
                            >
                              {starter.name}
                              <span aria-hidden="true">&rarr;</span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ) : null}
              </div>

              <Reveal
                className="col-span-4 md:col-span-8 lg:col-span-6 lg:col-start-7"
                delay={index === 0 ? 0.1 : 0}
              >
                <h3 className="eyebrow text-muted">What you get</h3>
                <ul className="mt-5 flex flex-col">
                  {service.deliverables.map((item) => (
                    <li
                      key={item}
                      className="flex gap-4 border-b border-ink/10 py-4 last:border-b-0"
                    >
                      <span
                        aria-hidden="true"
                        className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{ backgroundColor: ACCENT[service.accent] }}
                      />
                      <span className="prose-body">{item}</span>
                    </li>
                  ))}
                </ul>

                <div
                  className="mt-8 rounded-[18px] p-6"
                  style={{ backgroundColor: ACCENT[service.accent] }}
                >
                  <h3 className="eyebrow text-ink/60">What we tailor</h3>
                  <p className="prose-body mt-3 text-ink/80">
                    {service.tailoring}
                  </p>
                </div>
              </Reveal>
            </div>
          </section>
        ))}
      </div>

      <ProcessTiles
        eyebrow="The shape of a project"
        heading="Discovery, Design, Build, Improve."
      />

      <BookingCTA
        heading="Not sure which of these you need?"
        support="Describe the problem rather than the solution. Working out the right shape of engagement is part of the first call."
      />
    </>
  );
}
