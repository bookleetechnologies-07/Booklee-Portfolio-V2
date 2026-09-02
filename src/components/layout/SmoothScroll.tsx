"use client";

import Lenis from "lenis";
import { useEffect } from "react";

import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { gsap, ScrollTrigger } from "@/lib/gsap";

/**
 * Lenis is driven by GSAP's ticker rather than its own rAF loop. Two loops
 * competing is the usual cause of ScrollTrigger reading a stale scroll position
 * one frame behind the smoothed one, which shows up as pinned sections jittering.
 *
 * Nothing is instantiated at all for reduced-motion users: they get the
 * browser's native scrolling, untouched.
 */
export function SmoothScroll() {
  const reduced = usePrefersReducedMotion();

  // A font swap changes the height of every heading on the page, which moves
  // every trigger start with it. One refresh once the real faces are in.
  useEffect(() => {
    let cancelled = false;
    document.fonts?.ready.then(() => {
      if (!cancelled) ScrollTrigger.refresh();
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (reduced) return;

    const lenis = new Lenis({
      duration: 1.05,
      // Restrained: enough to take the edge off a wheel, not enough to feel
      // like the page is disobeying the input.
      easing: (t: number) => 1 - Math.pow(1 - t, 3),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.6,
      autoRaf: false,
    });

    lenis.on("scroll", ScrollTrigger.update);

    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      gsap.ticker.lagSmoothing(500, 33);
      lenis.destroy();
    };
  }, [reduced]);

  return null;
}
