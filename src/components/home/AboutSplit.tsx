import { ArrowLink } from "@/components/ui/ArrowLink";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Monogram } from "@/components/ui/Logo";
import { Reveal } from "@/components/ui/Reveal";
import { RevealText } from "@/components/ui/RevealText";
import { cn } from "@/lib/cn";

/**
 * Asymmetric split: an oversized, deliberately cropped Booklee mark on the
 * left, copy on the right. The mark is a vector, so cropping it hard costs
 * nothing and stays crisp at any size.
 */
export function AboutSplit({ className }: { className?: string }) {
  return (
    <section
      data-nav-theme="light"
      aria-labelledby="about-heading"
      className={cn("relative bg-bone", className)}
    >
      <div className="grid-12 shell items-center gap-y-12 section-pad">
        <div className="col-span-4 md:col-span-8 lg:col-span-5">
          <div className="grain relative aspect-[5/4] overflow-hidden rounded-[24px] bg-lilac">
            <div
              aria-hidden="true"
              className="absolute inset-0 [background:radial-gradient(120%_90%_at_20%_10%,rgba(250,250,247,0.7),transparent_62%)]"
            />
            <Monogram
              className="absolute -top-[14%] -left-[10%] h-[128%] w-auto text-ink/85"
              title="Booklee"
            />
            {/* One quiet annotation — a print-like registration mark rather
                than a floating icon. Kept clear of the cropped monogram so it
                stays readable. */}
            <span className="absolute top-6 right-6 flex items-center gap-2.5 text-ink/45">
              <span className="eyebrow">Studio practice</span>
              <span
                aria-hidden="true"
                className="block h-7 w-7 rounded-full border border-current"
              />
            </span>
          </div>
        </div>

        <div className="col-span-4 md:col-span-8 lg:col-span-6 lg:col-start-7">
          <Eyebrow>About Booklee</Eyebrow>
          <RevealText as="h2" id="about-heading" className="display-lg mt-6">
            A small studio with room for your way of working.
          </RevealText>
          <Reveal stagger className="mt-7 flex flex-col gap-5">
            <p className="prose-body text-muted">
              Booklee designs and develops websites and web applications for
              teams that need more than an off-the-shelf theme. We begin with
              how your business works, what your users need, and what success
              should feel like—then shape the design and technology around it.
            </p>
            <p className="prose-body text-muted">
              That may mean a focused portfolio, a conversion-led travel
              website, or a complete operational platform. The output changes
              because every client does; the care behind it does not.
            </p>
          </Reveal>
          <ArrowLink href="/about" className="mt-8">
            More about us
          </ArrowLink>
        </div>
      </div>
    </section>
  );
}
