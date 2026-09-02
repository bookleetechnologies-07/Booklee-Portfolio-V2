"use client";

import { useRef } from "react";

import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";
import { gsap, SplitText } from "@/lib/gsap";

type RevealTextProps = {
  children: React.ReactNode;
  as?: "h1" | "h2" | "h3" | "p" | "div";
  className?: string;
  id?: string;
  delay?: number;
  /** Fire on mount rather than on scroll — used above the fold. */
  immediate?: boolean;
};

/**
 * Masked line reveal for headings. Lines slide up from behind their own clip
 * edge rather than fading, which is what makes a heading read as arriving
 * instead of appearing.
 *
 * SplitText is created inside a matchMedia branch, so reduced-motion users keep
 * the untouched, fully readable markup. `autoSplit` re-splits after a resize or
 * a font swap, and `aria: "auto"` preserves the original string for assistive
 * technology after the DOM is cut into per-line spans.
 */
export function RevealText({
  children,
  as = "h2",
  className,
  id,
  delay = 0,
  immediate = false,
}: RevealTextProps) {
  const ref = useRef<HTMLElement>(null);

  useIsomorphicLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;

    const context = gsap.context(() => {
      const media = gsap.matchMedia();

      media.add("(prefers-reduced-motion: no-preference)", () => {
        const split = SplitText.create(element, {
          type: "lines",
          mask: "lines",
          autoSplit: true,
          aria: "auto",
          linesClass: "reveal-line",
          onSplit(self) {
            return gsap.from(self.lines, {
              yPercent: 108,
              duration: 0.95,
              delay,
              ease: "power3.out",
              stagger: 0.075,
              scrollTrigger: immediate
                ? undefined
                : { trigger: element, start: "top 88%", once: true },
            });
          },
        });

        return () => split.revert();
      });

      return () => media.revert();
    }, element);

    return () => context.revert();
  }, [delay, immediate]);

  // Rendered as literal intrinsic elements rather than through a dynamic tag,
  // so the ref is handed to the reconciler instead of to a variable component.
  const props = { className, id };
  const heading = ref as React.RefObject<HTMLHeadingElement | null>;

  switch (as) {
    case "h1":
      return (
        <h1 ref={heading} {...props}>
          {children}
        </h1>
      );
    case "h3":
      return (
        <h3 ref={heading} {...props}>
          {children}
        </h3>
      );
    case "p":
      return (
        <p ref={ref as React.RefObject<HTMLParagraphElement | null>} {...props}>
          {children}
        </p>
      );
    case "div":
      return (
        <div ref={ref as React.RefObject<HTMLDivElement | null>} {...props}>
          {children}
        </div>
      );
    default:
      return (
        <h2 ref={heading} {...props}>
          {children}
        </h2>
      );
  }
}
