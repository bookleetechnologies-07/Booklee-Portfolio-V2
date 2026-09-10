import Link from "next/link";

import { RevealText } from "@/components/ui/RevealText";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/cn";

type Props = {
  heading?: string;
  support?: string;
  className?: string;
};

export function BookingCTA({
  heading = "Have something specific in mind?",
  support = "Tell us what needs to work. We'll help shape what gets built.",
  className,
}: Props) {
  return (
    <section
      data-nav-theme="dark"
      aria-labelledby="booking-heading"
      className={cn(
        "on-dark grain grain-strong relative overflow-hidden border-t border-white/10 bg-black text-fog",
        className,
      )}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 [background:radial-gradient(70%_60%_at_78%_100%,rgba(203,239,174,0.16),transparent_62%)]"
      />

      <div className="shell relative section-pad">
        <div className="grid-12 items-end gap-y-10">
          <div className="col-span-4 md:col-span-8 lg:col-span-7">
            <RevealText
              as="h2"
              id="booking-heading"
              className="display-xl text-bone"
            >
              {heading}
            </RevealText>
          </div>

          <Reveal className="col-span-4 md:col-span-8 lg:col-span-4 lg:col-start-9">
            <p className="lede text-fog/75">{support}</p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link
                href="/book-a-call"
                className="group inline-flex h-14 items-center gap-2 rounded-full bg-mint px-8 text-base font-medium text-ink transition-transform duration-200 hover:-translate-y-0.5"
              >
                Book a call
                <span
                  aria-hidden="true"
                  className="transition-transform duration-200 group-hover:translate-x-1"
                >
                  &rarr;
                </span>
              </Link>
              <Link
                href="/portfolio"
                className="inline-flex h-14 items-center rounded-full border border-white/25 px-8 text-base font-medium text-bone transition-colors duration-200 hover:bg-white/10"
              >
                See our work
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
