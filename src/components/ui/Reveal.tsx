"use client";

import { useRef } from "react";

import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";
import { gsap } from "@/lib/gsap";

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  /** Stagger children instead of moving the wrapper as one block. */
  stagger?: boolean;
  /**
   * Reveal children one by one, scrubbed against scroll position rather than
   * played on a timer once the wrapper comes into view.
   *
   * Takes precedence over `stagger`, which is the same idea on a clock: the
   * difference is that this one is *reversible* and tied to where the reader
   * actually is, so scrolling back up puts the list back the way it was.
   */
  sequence?: boolean;
  delay?: number;
  /** Travel distance in px. Kept small — this is hierarchy, not decoration. */
  y?: number;
};

/**
 * Section-continuity reveal. One ScrollTrigger per instance, and removed with
 * the component. Reduced-motion users get the finished state immediately
 * because the matchMedia branch simply never runs — which is also why the
 * hidden state is only ever set inside it.
 */
export function Reveal({
  children,
  className,
  stagger = false,
  sequence = false,
  delay = 0,
  y = 22,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;

    const context = gsap.context(() => {
      const media = gsap.matchMedia();

      media.add("(prefers-reduced-motion: no-preference)", () => {
        const targets =
          stagger || sequence
            ? Array.from(element.children)
            : [element as Element];

        gsap.set(targets, { opacity: 0, y });

        if (sequence) {
          /*
           * One timeline, scrubbed, with the children laid along it end to end
           * so they arrive in order as the reader scrolls rather than all at
           * once when the wrapper crosses a line.
           *
           * The range is deliberately short and finishes early: it closes when
           * the wrapper's top has reached a third of the way up the viewport,
           * which for a two-row grid is roughly the point where the section is
           * centred. Everything is therefore fully revealed by the middle of
           * the section's pass, and the rest of the scroll through it has
           * nothing left hidden.
           *
           * `STEP` below one is what makes it read as a sequence rather than a
           * queue: each item starts before its predecessor has quite settled.
           */
          const STEP = 0.55;
          const timeline = gsap.timeline({
            defaults: { duration: 1, ease: "power2.out" },
            scrollTrigger: {
              trigger: element,
              start: "top 88%",
              end: "top 32%",
              scrub: 0.6,
            },
          });

          targets.forEach((target, index) => {
            timeline.to(target, { opacity: 1, y: 0 }, index * STEP);
          });

          return () => {
            timeline.scrollTrigger?.kill();
            timeline.kill();
            gsap.set(targets, { clearProps: "opacity,transform" });
          };
        }

        const tween = gsap.to(targets, {
          opacity: 1,
          y: 0,
          duration: 0.85,
          delay,
          ease: "power3.out",
          stagger: stagger ? 0.08 : 0,
          scrollTrigger: {
            trigger: element,
            start: "top 88%",
            once: true,
          },
        });

        return () => {
          tween.scrollTrigger?.kill();
          tween.kill();
          gsap.set(targets, { clearProps: "opacity,transform" });
        };
      });

      return () => media.revert();
    }, element);

    return () => context.revert();
  }, [delay, sequence, stagger, y]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
