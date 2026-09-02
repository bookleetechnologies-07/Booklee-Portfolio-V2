import type { Metadata } from "next";

import { CalendlyEmbed } from "@/components/booking/CalendlyEmbed";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { PageIntro } from "@/components/ui/PageIntro";
import { Reveal } from "@/components/ui/Reveal";
import { calendlyUrl, siteConfig } from "@/content/site";

export const metadata: Metadata = {
  title: "Book a call",
  description:
    "A short, practical call about what you need built. No pitch deck — bring the process you use today and we will work out what the first release should be.",
  alternates: { canonical: "/book-a-call" },
  openGraph: {
    title: "Book a call with Booklee",
    description:
      "A short, practical call about scope, timing and whether we are the right studio for the work.",
    url: "/book-a-call",
  },
};

const PREPARE = [
  {
    title: "What the work is for",
    body: "The outcome you want, in your own words. Even a rough version is more useful than a feature list.",
  },
  {
    title: "How it happens today",
    body: "Whatever you use now — a spreadsheet, a tool you have outgrown, a manual process. Screenshots are perfect.",
  },
  {
    title: "Who it is for",
    body: "Customers, staff, or both, and roughly how many. This changes the shape of almost every decision.",
  },
  {
    title: "Timing and constraints",
    body: "Any fixed date, existing system, or budget shape you are working within. Earlier is better than later.",
  },
];

const AGENDA = [
  "What you are trying to achieve, and what is getting in the way",
  "Where a website or system would genuinely help, and where it would not",
  "A realistic first release, and what could sensibly wait",
  "How we would work together, what it would cost, and roughly how long",
];

export default function BookACallPage() {
  return (
    <>
      <PageIntro
        eyebrow="Book a call"
        heading="Tell us what needs to work."
        standfirst="A short, practical conversation about the problem you are solving. No pitch deck, no obligation, and an honest answer if we are not the right studio for it."
        aside={
          <dl className="mt-8 flex flex-col gap-3">
            <div className="flex items-baseline gap-3">
              <dt className="meta w-24 shrink-0 text-muted">Length</dt>
              {/* TODO_CONTENT: keep in sync with the real Calendly event. */}
              <dd className="text-sm">{siteConfig.booking.duration}</dd>
            </div>
            <div className="flex items-baseline gap-3">
              <dt className="meta w-24 shrink-0 text-muted">Format</dt>
              <dd className="text-sm">Video call, or a phone call if you prefer</dd>
            </div>
            <div className="flex items-baseline gap-3">
              <dt className="meta w-24 shrink-0 text-muted">Cost</dt>
              <dd className="text-sm">None</dd>
            </div>
          </dl>
        }
      />

      <section
        data-nav-theme="light"
        aria-labelledby="booking-widget-heading"
        className="bg-bone"
      >
        <div className="shell grid-12 gap-y-14 py-[clamp(3rem,6vw,6rem)]">
          <div className="col-span-4 md:col-span-8 lg:col-span-5">
            <Eyebrow>What we will cover</Eyebrow>
            <ol className="mt-7 flex flex-col">
              {AGENDA.map((item, index) => (
                <li
                  key={item}
                  className="flex gap-5 border-b border-ink/10 py-4 last:border-b-0"
                >
                  <span className="meta shrink-0 text-muted tabular-nums">
                    0{index + 1}
                  </span>
                  <span className="prose-body">{item}</span>
                </li>
              ))}
            </ol>

            <h2 className="eyebrow mt-14 text-muted">Worth bringing</h2>
            <Reveal stagger className="mt-6 flex flex-col gap-6">
              {PREPARE.map((item) => (
                <div key={item.title}>
                  <h3 className="display-sm">{item.title}</h3>
                  <p className="prose-body mt-2 text-muted">{item.body}</p>
                </div>
              ))}
            </Reveal>

            <p className="prose-body mt-12 text-muted">
              Would rather write than talk? Email{" "}
              {/* TODO_CONTENT: confirm this inbox is monitored. */}
              <a
                href={`mailto:${siteConfig.email}`}
                className="text-ink underline underline-offset-4"
              >
                {siteConfig.email}
              </a>{" "}
              with the same information and we will reply with questions.
            </p>
          </div>

          <div className="col-span-4 md:col-span-8 lg:col-span-6 lg:col-start-7">
            <h2 id="booking-widget-heading" className="display-md">
              Pick a time
            </h2>
            <p className="prose-body mt-4 mb-8 text-muted">
              Choose whatever suits you. If nothing fits, email us and we will
              find a slot outside these hours.
            </p>
            <CalendlyEmbed
              url={calendlyUrl}
              fallbackUrl={siteConfig.booking.fallbackUrl}
            />
          </div>
        </div>
      </section>
    </>
  );
}
