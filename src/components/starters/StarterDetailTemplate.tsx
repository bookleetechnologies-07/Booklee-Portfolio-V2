import Link from "next/link";

import { BookingCTA } from "@/components/home/BookingCTA";
import { ConceptPreview } from "@/components/previews";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/ui/Reveal";
import { RevealText } from "@/components/ui/RevealText";
import {
  STARTER_PROMISE,
  starterWebsites,
  type StarterWebsite,
} from "@/content/starter-websites";
import { cn } from "@/lib/cn";

const ACCENT: Record<string, string> = {
  lilac: "var(--accent-lilac)",
  blue: "var(--accent-blue)",
  yellow: "var(--accent-yellow)",
  mint: "var(--accent-mint)",
  coral: "var(--accent-coral)",
};

/**
 * One template, three starter websites. Everything on the page comes from the
 * typed content module, so the page can never claim a capability the content
 * does not list — and the order of sections answers the questions in the order
 * a buyer asks them: who is it for, what already works, what changes for me,
 * and what can it talk to.
 */
export function StarterDetailTemplate({
  starter,
}: {
  starter: StarterWebsite;
}) {
  const accent = ACCENT[starter.accent];
  const others = starterWebsites.filter((item) => item.slug !== starter.slug);

  return (
    <>
      <header
        data-nav-theme="light"
        className="paper-tooth grain relative bg-paper"
      >
        <div className="shell pt-[calc(var(--header-h)+clamp(3rem,6vw,6rem))] pb-[clamp(2.5rem,5vw,5rem)]">
          <nav aria-label="Breadcrumb" className="meta text-muted">
            <ol className="flex flex-wrap items-center gap-2">
              <li>
                <Link href="/services" className="hover:underline">
                  Services
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link href="/services/starter-websites" className="hover:underline">
                  Starter websites
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page">{starter.shortName}</li>
            </ol>
          </nav>

          <div className="grid-12 mt-8 items-end gap-y-8">
            <div className="col-span-4 md:col-span-8 lg:col-span-7">
              <div className="flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: accent }}
                />
                <p className="eyebrow text-muted">
                  {starter.index} — Starter website
                </p>
              </div>
              <RevealText as="h1" immediate className="display-xl mt-6">
                {starter.name}
              </RevealText>
            </div>
            <Reveal className="col-span-4 md:col-span-8 lg:col-span-4 lg:col-start-9">
              <p className="prose-body text-muted">{starter.lede}</p>
              <ul className="mt-6 flex flex-wrap gap-2">
                {starter.tags.map((tag) => (
                  <li
                    key={tag}
                    className="meta rounded-full border border-ink/15 px-3 py-1.5 text-muted"
                  >
                    {tag}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>

        <div className="shell pb-[clamp(3rem,6vw,6rem)]">
          <div
            className="overflow-hidden rounded-[24px] p-3 md:p-6"
            style={{ backgroundColor: accent }}
          >
            <ConceptPreview slug={starter.slug} className="rounded-[14px]" />
          </div>
          <p className="meta mt-4 text-muted">{starter.previewAlt}</p>
        </div>
      </header>

      {/* --- who it is for ------------------------------------------------ */}
      <section
        data-nav-theme="light"
        aria-labelledby="audience-heading"
        className="bg-bone"
      >
        <div className="shell grid-12 gap-y-10 py-[clamp(3.5rem,7vw,7rem)]">
          <div className="col-span-4 md:col-span-8 lg:col-span-5">
            <Eyebrow>Who it is for</Eyebrow>
            <RevealText
              as="h2"
              id="audience-heading"
              className="display-md mt-6 max-w-[18ch]"
            >
              Built for a particular kind of team.
            </RevealText>
          </div>
          <ul className="col-span-4 md:col-span-8 lg:col-span-6 lg:col-start-7">
            {starter.audience.map((item, index) => (
              <li
                key={item}
                className="flex gap-6 border-b border-ink/10 py-5 last:border-b-0"
              >
                <span className="meta shrink-0 text-muted tabular-nums">
                  0{index + 1}
                </span>
                <span className="prose-body">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* --- the problem -------------------------------------------------- */}
      <section
        data-nav-theme="light"
        aria-labelledby="challenge-heading"
        className="paper-tooth grain relative bg-paper"
      >
        <div className="shell grid-12 gap-y-12 py-[clamp(3.5rem,7vw,7rem)]">
          <div className="col-span-4 md:col-span-8 lg:col-span-5">
            <Eyebrow>The challenge</Eyebrow>
            <RevealText
              as="h2"
              id="challenge-heading"
              className="display-md mt-6 max-w-[20ch]"
            >
              What usually goes wrong here.
            </RevealText>
          </div>
          <Reveal
            stagger
            className="col-span-4 flex flex-col gap-5 md:col-span-8 lg:col-span-6 lg:col-start-7"
          >
            {starter.challenge.map((paragraph) => (
              <p key={paragraph} className="prose-body text-muted">
                {paragraph}
              </p>
            ))}
          </Reveal>
        </div>
      </section>

      {/* --- how it feels to use ------------------------------------------ */}
      <section
        data-nav-theme="dark"
        aria-labelledby="experience-heading"
        className="on-dark grain relative bg-black text-fog"
      >
        <div className="shell grid-12 gap-y-12 py-[clamp(3.5rem,7vw,7rem)]">
          <div className="col-span-4 md:col-span-8 lg:col-span-5">
            <Eyebrow className="text-fog">How it works</Eyebrow>
            <RevealText
              as="h2"
              id="experience-heading"
              className="display-md mt-6 max-w-[20ch] text-bone"
            >
              How it actually feels to use.
            </RevealText>
          </div>
          <ol className="col-span-4 flex flex-col md:col-span-8 lg:col-span-6 lg:col-start-7">
            {starter.experience.map((paragraph, index) => (
              <li
                key={paragraph}
                className="flex gap-6 border-t border-white/12 py-6 first:border-t-0 first:pt-0"
              >
                <span className="meta shrink-0 text-fog/40 tabular-nums">
                  0{index + 1}
                </span>
                <p className="prose-body text-fog/75">{paragraph}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* --- what is already built ---------------------------------------- */}
      <section
        data-nav-theme="light"
        aria-labelledby="baseline-heading"
        className="paper-tooth grain relative bg-paper"
      >
        <div className="shell py-[clamp(3.5rem,7vw,7rem)]">
          <Eyebrow>Baseline capabilities</Eyebrow>
          <RevealText
            as="h2"
            id="baseline-heading"
            className="display-md mt-6 max-w-[24ch]"
          >
            Already built, already working.
          </RevealText>

          <Reveal
            stagger
            className="mt-12 grid gap-x-8 gap-y-10 md:grid-cols-2 lg:grid-cols-3"
          >
            {starter.baseline.map((capability) => (
              <article key={capability.title} className="flex flex-col gap-3">
                <span
                  aria-hidden="true"
                  className="h-1 w-10 rounded-full"
                  style={{ backgroundColor: accent }}
                />
                <h3 className="display-sm">{capability.title}</h3>
                <p className="prose-body text-muted">{capability.body}</p>
              </article>
            ))}
          </Reveal>
        </div>
      </section>

      {/* --- what changes for you ----------------------------------------- */}
      <section
        data-nav-theme="light"
        aria-labelledby="customization-heading"
        className="bg-bone"
      >
        <div className="shell py-[clamp(3.5rem,7vw,7rem)]">
          <div className="grid-12 items-end gap-y-8">
            <div className="col-span-4 md:col-span-8 lg:col-span-6">
              <Eyebrow>What we adapt</Eyebrow>
              <RevealText
                as="h2"
                id="customization-heading"
                className="display-md mt-6 max-w-[22ch]"
              >
                The part that becomes yours.
              </RevealText>
            </div>
            <p className="prose-body col-span-4 text-muted md:col-span-8 lg:col-span-5 lg:col-start-8">
              {STARTER_PROMISE}
            </p>
          </div>

          <Reveal stagger className="mt-12 grid gap-5 md:grid-cols-2">
            {starter.customization.map((item) => (
              <article
                key={item.title}
                className="flex flex-col gap-3 rounded-[18px] border border-ink/12 p-6 md:p-7"
              >
                <h3 className="display-sm">{item.title}</h3>
                <p className="prose-body text-muted">{item.body}</p>
              </article>
            ))}
          </Reveal>

          <div
            className="mt-10 rounded-[20px] p-7 md:p-9"
            style={{ backgroundColor: accent }}
          >
            <h3 className="eyebrow text-ink/60">Configuration versus build</h3>
            <p className="prose-body mt-4 max-w-[62ch] text-ink/80">
              {starter.tailoring}
            </p>
          </div>
        </div>
      </section>

      {/* --- what it can talk to ------------------------------------------ */}
      <section
        data-nav-theme="light"
        aria-labelledby="integrations-heading"
        className="paper-tooth grain relative bg-paper"
      >
        <div className="shell grid-12 gap-y-10 py-[clamp(3.5rem,7vw,7rem)]">
          <div className="col-span-4 md:col-span-8 lg:col-span-5">
            <Eyebrow>Possible integrations</Eyebrow>
            <RevealText
              as="h2"
              id="integrations-heading"
              className="display-md mt-6 max-w-[20ch]"
            >
              It has to fit what you already run.
            </RevealText>
            <p className="prose-body mt-6 text-muted">
              These are the connections this starter is commonly asked for. Each
              one is scoped against the specific system you use — an
              integration is only real once we have seen the account it has to
              talk to.
            </p>
          </div>
          <ul className="col-span-4 md:col-span-8 lg:col-span-6 lg:col-start-7">
            {starter.integrations.map((item) => (
              <li
                key={item}
                className="flex items-center gap-4 border-b border-ink/10 py-4 last:border-b-0"
              >
                <span
                  aria-hidden="true"
                  className="h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: accent }}
                />
                <span className="prose-body">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* --- stack -------------------------------------------------------- */}
      <section
        data-nav-theme="light"
        aria-labelledby="stack-heading"
        className="bg-bone"
      >
        <div className="shell grid-12 gap-y-12 py-[clamp(3.5rem,7vw,7rem)]">
          <div className="col-span-4 md:col-span-8 lg:col-span-4">
            <Eyebrow>Stack rationale</Eyebrow>
            <RevealText
              as="h2"
              id="stack-heading"
              className="display-md mt-6 max-w-[18ch]"
            >
              Chosen for this problem, not for the CV.
            </RevealText>
          </div>
          <dl className="col-span-4 md:col-span-8 lg:col-span-7 lg:col-start-6">
            {starter.stack.map((choice) => (
              <div
                key={choice.name}
                className="grid gap-2 border-b border-ink/10 py-6 last:border-b-0 md:grid-cols-[14rem_1fr] md:gap-8"
              >
                <dt className="display-sm">{choice.name}</dt>
                <dd className="prose-body text-muted">{choice.reason}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* --- the same interface at three widths --------------------------- */}
      <section
        data-nav-theme="light"
        aria-labelledby="views-heading"
        className="paper-tooth grain relative bg-paper"
      >
        <div className="shell py-[clamp(3.5rem,7vw,7rem)]">
          <Eyebrow>Responsive views</Eyebrow>
          <h2 id="views-heading" className="display-md mt-6 max-w-[22ch]">
            The same interface at three scales.
          </h2>

          <ul className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {(["full", "detail", "compact"] as const).map((focus, index) => (
              <li key={focus} className="flex flex-col gap-3">
                <div
                  className={cn(
                    "overflow-hidden rounded-[16px] p-2.5",
                    focus === "compact" && "mx-auto w-[62%] md:w-full",
                  )}
                  style={{ backgroundColor: accent }}
                >
                  <ConceptPreview
                    slug={starter.slug}
                    className="rounded-[9px]"
                  />
                </div>
                <p className="meta text-muted">
                  {
                    [
                      "Full layout — the working week at a glance",
                      "Detail view — one record, in context",
                      "Compact layout for phone use between meetings",
                    ][index]
                  }
                </p>
              </li>
            ))}
          </ul>
          <p className="meta mt-8 max-w-[58ch] text-muted">
            Every view above is the same live interface rendered at a different
            width — not a mock-up image — which is why the layout genuinely
            changes rather than shrinking.
          </p>
        </div>
      </section>

      {/* --- the other two ------------------------------------------------ */}
      <section
        data-nav-theme="light"
        aria-labelledby="more-heading"
        className="bg-bone"
      >
        <div className="shell py-[clamp(3rem,6vw,6rem)]">
          <h2 id="more-heading" className="eyebrow text-muted">
            Other starter websites
          </h2>
          <ul className="mt-8 grid gap-px overflow-hidden rounded-[20px] border border-ink/12 bg-ink/12 md:grid-cols-2">
            {others.map((item) => (
              <li key={item.slug}>
                <Link
                  href={`/services/starter-websites/${item.slug}`}
                  className="group flex h-full flex-col gap-3 bg-bone p-6 transition-colors duration-200 hover:bg-paper"
                >
                  <span className="meta text-muted tabular-nums">
                    {item.index}
                  </span>
                  <span className="display-sm">{item.name}</span>
                  <span className="prose-body text-muted">{item.outcome}</span>
                  <span
                    aria-hidden="true"
                    className="mt-auto pt-4 text-muted transition-transform duration-200 group-hover:translate-x-1"
                  >
                    &rarr;
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <BookingCTA
        heading={`Want a ${starter.shortName} shaped around your business?`}
        support="Bring the process you use today, including the awkward parts. That is where the useful decisions come from."
      />
    </>
  );
}
