"use client";

import { useRef } from "react";

import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";
import { gsap } from "@/lib/gsap";

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  /** Stagger children instead of moving the wrapper as one block. */
  stagger?: boolean;
  delay?: number;
  /** Travel distance in px. Kept small — this is hierarchy, not decoration. */
  y?: number;
};

/**
 * Section-continuity reveal. One ScrollTrigger per instance, fired once, and
 * removed with the component. Reduced-motion users get the finished state
 * immediately because the matchMedia branch simply never runs.
 */
export function Reveal({
  children,
  className,
  stagger = false,
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
        const targets = stagger
          ? Array.from(element.children)
          : [element as Element];

        gsap.set(targets, { opacity: 0, y });

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
  }, [delay, stagger, y]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
