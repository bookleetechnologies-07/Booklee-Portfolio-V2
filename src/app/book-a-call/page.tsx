import type { Metadata } from "next";

import { BookingPanel } from "@/components/booking/BookingPanel";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/ui/Reveal";
import { RevealText } from "@/components/ui/RevealText";
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

const AGENDA = [
  "What you are trying to achieve, and what is getting in the way",
  "Where a website or system would genuinely help, and where it would not",
  "A realistic first release, and what could sensibly wait",
  "How we would work together, what it would cost, and roughly how long",
];

/**
 * Book a call.
 *
 * Two columns and one job each: the left says what the conversation is, the
 * right books it. That split replaces a page where the scheduler, the agenda,
 * a four-item "worth bringing" list and an email note all competed for the same
 * attention — and where an 800px calendar was the first thing anyone met.
 */
export default function BookACallPage() {
  return (
    <div data-nav-theme="dark" className="on-dark grain relative bg-black text-fog">
      <div className="shell grid-12 gap-y-14 pt-[calc(var(--header-h)+clamp(3rem,7vw,7rem))] pb-[clamp(4rem,8vw,8rem)]">
        {/* --- what the call is ---------------------------------------- */}
        <div className="col-span-4 md:col-span-8 lg:col-span-6">
          <Eyebrow className="text-fog">Book a call</Eyebrow>
          <RevealText as="h1" immediate className="display-xl mt-7 text-bone">
            Tell us what needs to work.
          </RevealText>

          <Reveal>
            <p className="prose-body mt-6 max-w-[46ch] text-fog/70">
              A short, practical conversation about the problem you are solving.
              No pitch deck, no obligation, and an honest answer if we are not
              the right studio for it.
            </p>
          </Reveal>

          <section aria-labelledby="agenda-heading" className="mt-12">
            <h2 id="agenda-heading" className="eyebrow text-fog/60">
              What we will cover
            </h2>
            <ol className="mt-6 flex flex-col">
              {AGENDA.map((item, index) => (
                <li
                  key={item}
                  className="flex gap-5 border-b border-white/10 py-4 last:border-b-0"
                >
                  <span className="meta shrink-0 text-fog/40 tabular-nums">
                    0{index + 1}
                  </span>
                  <span className="prose-body text-fog/80">{item}</span>
                </li>
              ))}
            </ol>
          </section>

          <p className="prose-body mt-10 max-w-[46ch] text-fog/65">
            Would rather write than talk? Email{" "}
            {/* TODO_CONTENT: confirm this inbox is monitored. */}
            <a
              href={`mailto:${siteConfig.email}`}
              className="text-bone underline underline-offset-4"
            >
              {siteConfig.email}
            </a>{" "}
            with the same information and we will reply with questions.
          </p>
        </div>

        {/* --- booking ------------------------------------------------- */}
        <section
          aria-labelledby="booking-heading"
          className="col-span-4 md:col-span-8 lg:col-span-6 lg:col-start-7"
        >
          <h2 id="booking-heading" className="sr-only">
            Choose a time
          </h2>
          {/* TODO_CONTENT: confirm the title and length against the real
              Calendly event. The card states them because the embed hides
              Calendly's own event header. */}
          <BookingPanel
            url={calendlyUrl}
            fallbackUrl={siteConfig.booking.fallbackUrl}
            title={siteConfig.booking.title}
            duration={siteConfig.booking.duration}
          />
        </section>
      </div>
    </div>
  );
}
