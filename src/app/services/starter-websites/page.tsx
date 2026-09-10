import type { Metadata } from "next";
import Link from "next/link";

import { BookingCTA } from "@/components/home/BookingCTA";
import { ConceptPreview } from "@/components/previews";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { PageIntro } from "@/components/ui/PageIntro";
import { Reveal } from "@/components/ui/Reveal";
import { RevealText } from "@/components/ui/RevealText";
import { STARTER_PROMISE, starterWebsites } from "@/content/starter-websites";
import { cn } from "@/lib/cn";

export const metadata: Metadata = {
  title: "Starter websites",
  description:
    "Starter websites from Booklee — CRM, HRM, editorial portfolio, travel and ERP foundations, adapted to your workflow, users, integrations and growth stage.",
  alternates: { canonical: "/services/starter-websites" },
  openGraph: {
    title: "Booklee starter websites",
    description:
      "Five foundations — CRM, HRM, editorial portfolio, travel and ERP — shaped around how your business already works.",
    url: "/services/starter-websites",
  },
};

const ACCENT: Record<string, string> = {
  lilac: "var(--accent-lilac)",
  blue: "var(--accent-blue)",
  yellow: "var(--accent-yellow)",
  mint: "var(--accent-mint)",
  coral: "var(--accent-coral)",
};

export default function StarterWebsitesPage() {
  return (
    <>
      <PageIntro
        eyebrow="Services / Starter websites"
        heading="Foundations, not templates."
        standfirst={`Five systems that already work on the day they arrive, and are then shaped around your business. ${STARTER_PROMISE}`}
      />

      {/* What a starter website is — stated plainly before the options. */}
      <section
        data-nav-theme="light"
        aria-labelledby="starter-definition-heading"
        className="bg-bone"
      >
        <div className="shell grid-12 gap-y-10 border-t border-ink/10 py-[clamp(3rem,6vw,6rem)]">
          <div className="col-span-4 md:col-span-8 lg:col-span-5">
            <Eyebrow>What you are starting from</Eyebrow>
            <RevealText
              as="h2"
              id="starter-definition-heading"
              className="display-md mt-6 max-w-[20ch]"
            >
              A working system on day one.
            </RevealText>
          </div>
          <Reveal
            stagger
            className="col-span-4 flex flex-col gap-5 md:col-span-8 lg:col-span-6 lg:col-start-7"
          >
            <p className="prose-body text-muted">
              Each starter is a complete, working application rather than a
              theme or a mock-up. The screens below are real interfaces, and the
              parts that every business needs identically — records, permissions,
              audit trails, imports — are already built and tested.
            </p>
            <p className="prose-body text-muted">
              What changes is everything specific to you: the vocabulary, the
              rules, the approval routes, the reports and the systems it has to
              talk to. That is the work, and it starts from something that
              already runs rather than from an empty repository.
            </p>
            <p className="prose-body text-muted">
              These are foundations we build on, not finished client products.
              Nothing here is a case study.
            </p>
          </Reveal>
        </div>
      </section>

      <section
        data-nav-theme="light"
        aria-labelledby="starter-list-heading"
        className="bg-bone"
      >
        <h2 id="starter-list-heading" className="sr-only">
          The starter websites
        </h2>

        <ul>
          {starterWebsites.map((starter, index) => (
            <li key={starter.slug} className="border-t border-ink/10">
              <Link
                href={`/services/starter-websites/${starter.slug}`}
                aria-label={`${starter.name}. ${starter.lede}`}
                className="group block py-[clamp(2.5rem,5vw,4.5rem)]"
              >
                <article
                  className={cn(
                    "shell grid-12 items-center gap-y-8",
                    index % 2 === 1 && "lg:[&>*:first-child]:order-2",
                  )}
                >
                  <div className="col-span-4 md:col-span-8 lg:col-span-6">
                    <div
                      className="overflow-hidden rounded-[20px] p-3 transition-transform duration-300 group-hover:-translate-y-1 md:p-4"
                      style={{ backgroundColor: ACCENT[starter.accent] }}
                    >
                      <ConceptPreview
                        slug={starter.slug}
                        className="rounded-[12px]"
                      />
                    </div>
                  </div>

                  <div
                    className={cn(
                      "col-span-4 md:col-span-8 lg:col-span-5",
                      index % 2 === 1 ? "lg:col-start-1" : "lg:col-start-8",
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <span className="meta text-muted tabular-nums">
                        {starter.index}
                      </span>
                      <span className="meta rounded-full border border-ink/15 px-3 py-1 text-muted">
                        Starter website
                      </span>
                    </div>
                    <h3 className="display-lg mt-6">{starter.name}</h3>
                    <p className="prose-body mt-4 text-muted">{starter.lede}</p>
                    <ul className="mt-6 flex flex-wrap gap-2">
                      {starter.tags.map((tag) => (
                        <li key={tag} className="meta text-muted">
                          {tag}
                          <span aria-hidden="true" className="ml-2 opacity-40">
                            /
                          </span>
                        </li>
                      ))}
                    </ul>
                    <p className="mt-7 flex items-center gap-2 text-sm font-medium">
                      Explore the {starter.shortName} starter
                      <span
                        aria-hidden="true"
                        className="transition-transform duration-200 group-hover:translate-x-1"
                      >
                        &rarr;
                      </span>
                    </p>
                  </div>
                </article>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <BookingCTA
        heading="Which of these is closest to your problem?"
        support="Tell us which parts fit and which do not. Adapting one of these is usually faster and steadier than starting from nothing."
      />
    </>
  );
}
