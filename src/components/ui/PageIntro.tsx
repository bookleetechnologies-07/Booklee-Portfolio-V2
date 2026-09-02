import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/ui/Reveal";
import { RevealText } from "@/components/ui/RevealText";
import { cn } from "@/lib/cn";

/**
 * Shared opening block for the secondary routes: one eyebrow, one h1, one
 * standfirst. Keeping it in a single component is what stops five pages from
 * drifting into five different opening rhythms.
 */
export function PageIntro({
  eyebrow,
  heading,
  standfirst,
  aside,
  className,
}: {
  eyebrow: string;
  heading: string;
  standfirst: string;
  aside?: React.ReactNode;
  className?: string;
}) {
  return (
    <header
      data-nav-theme="light"
      className={cn("paper-tooth grain relative bg-paper", className)}
    >
      <div className="shell pt-[calc(var(--header-h)+clamp(3.5rem,8vw,8rem))] pb-[clamp(3rem,6vw,6rem)]">
        <Eyebrow>{eyebrow}</Eyebrow>
        <div className="grid-12 mt-7 items-end gap-y-8">
          <RevealText
            as="h1"
            immediate
            className="display-xl col-span-4 md:col-span-8 lg:col-span-8"
          >
            {heading}
          </RevealText>
          <Reveal className="col-span-4 md:col-span-8 lg:col-span-4">
            <p className="prose-body text-muted">{standfirst}</p>
            {aside}
          </Reveal>
        </div>
      </div>
    </header>
  );
}
