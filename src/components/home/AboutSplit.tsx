import { BrandReveal } from "@/components/home/BrandReveal";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { Eyebrow } from "@/components/ui/Eyebrow";
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
          <BrandReveal />
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
