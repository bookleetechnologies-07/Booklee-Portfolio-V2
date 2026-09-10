"use client";

import { useId, useRef } from "react";

import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { BRAND } from "@/lib/brand";
import { cn } from "@/lib/cn";
import { gsap } from "@/lib/gsap";

/**
 * The oversized BOOKLEE wordmark that closes the footer.
 *
 * At rest it is an outline: the letterforms are filled a shade off black and
 * drawn with a hairline, so on the black footer they read as an embossed
 * watermark rather than as a second logo competing with the signature at the
 * top of the footer.
 *
 * The white is *local to the pointer*. A `:hover` rule would flip the whole
 * wordmark at once, which is not the effect: instead a second, white copy of
 * the same path is stacked exactly on top of the outline and revealed through a
 * soft radial mask centred on the cursor. Only the letters under the pool of
 * light turn white, and the pool follows the pointer across them.
 *
 * The mask is driven by three custom properties rather than by re-rendering, so
 * a pointer move costs one `setProperty` call and no React work. GSAP's
 * `quickTo` eases the centre towards the cursor, which is what stops the pool
 * from snapping between frames and gives it the slight trailing weight that
 * makes it read as light rather than as a cursor sprite.
 *
 * The travelling gloss is the same idea as the brand tile on Home and About: a
 * narrow white band, angled, scrubbed across the artwork by scroll position.
 * Here it is expressed as a gradient *fill* on a third copy of the path rather
 * than as an overlaid div, because `mix-blend-overlay` over a black background
 * does nothing — on the tile the overlay lightens lilac paper, and on black
 * there is nothing to lighten. Painting the band into the letters themselves
 * keeps the same read: a highlight that crosses the word and leaves.
 */

/** Horizontal extent of the wordmark in its own user units. */
const WORD_X0 = 335;
const WORD_X1 = 1149;
/** Vertical extent, used to angle the gloss band across the letters. */
const WORD_Y0 = 500;
const WORD_Y1 = 694;
/** Width of the gloss band, so it can start and finish clear of the artwork. */
const SWEEP_BAND = 340;
/*
 * Extra horizontal travel at each end, because the band is angled.
 *
 * A vertical band that has moved one word-width has left the word. An angled
 * one has not: its leading plane is tilted, so the corner of the word furthest
 * along that tilt is still inside the band, which parks a permanent highlight
 * on the last letters at the end of the scroll and on the first letters before
 * it starts. The shortfall is the word's height projected onto the band's own
 * axis — height squared over the band width — with a little margin on top.
 */
const SWEEP_CLEAR = Math.ceil((WORD_Y1 - WORD_Y0) ** 2 / SWEEP_BAND) + 8;
const SWEEP_FROM = WORD_X0 - SWEEP_CLEAR;
const SWEEP_TO = WORD_X1 + SWEEP_CLEAR;

export function FooterWordmark({ className }: { className?: string }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  const uid = useId().replace(/:/g, "");
  const glossId = `footer-gloss-${uid}`;
  const sweepId = `footer-sweep-${uid}`;

  useIsomorphicLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    /*
     * The mask centre and the reveal's strength are tweened separately, and
     * they are deliberately two objects rather than one.
     *
     * The fade needs `overwrite: true`, so that flicking on and off quickly
     * cannot leave two opacity tweens fighting. GSAP's overwrite works per
     * *target*, not per property, so sharing one object would have the fade
     * kill the `quickTo` tweens on entry — and a killed `quickTo` never
     * restarts, which strands the pool of light wherever the pointer first
     * touched the word.
     */
    const point = { x: 0, y: 0 };
    const glow = { opacity: 0 };
    const apply = () => {
      root.style.setProperty("--reveal-x", `${point.x}px`);
      root.style.setProperty("--reveal-y", `${point.y}px`);
      root.style.setProperty("--reveal-opacity", `${glow.opacity}`);
    };

    /*
     * The pool is sized from the artwork, not fixed in pixels. The wordmark is
     * around 340px tall on a wide screen and around 80px on a phone, so a
     * radius that lights two or three letters on the first would light the
     * whole word on the second.
     */
    const sizeReveal = () => {
      const radius = gsap.utils.clamp(110, 340, root.clientHeight * 1.3);
      root.style.setProperty("--reveal-r", `${radius}px`);
    };
    sizeReveal();
    const resize = new ResizeObserver(sizeReveal);
    resize.observe(root);

    const context = gsap.context(() => {
      const moveX = gsap.quickTo(point, "x", {
        duration: 0.34,
        ease: "power3",
        onUpdate: apply,
      });
      const moveY = gsap.quickTo(point, "y", {
        duration: 0.34,
        ease: "power3",
        onUpdate: apply,
      });

      const fade = (to: number) => {
        if (reduced) {
          glow.opacity = to;
          apply();
          return;
        }
        gsap.to(glow, {
          opacity: to,
          duration: to === 0 ? 0.42 : 0.26,
          ease: "power2.out",
          overwrite: true,
          onUpdate: apply,
        });
      };

      const local = (event: PointerEvent) => {
        const rect = root.getBoundingClientRect();
        return { x: event.clientX - rect.left, y: event.clientY - rect.top };
      };

      const onEnter = (event: PointerEvent) => {
        /*
         * Placed, not tweened. Easing in from wherever the pointer happened to
         * leave last time would drag a bright streak across the whole word on
         * the way to the letter actually being pointed at.
         */
        const at = local(event);
        point.x = at.x;
        point.y = at.y;
        apply();
        moveX(at.x);
        moveY(at.y);
        fade(1);
      };

      const onMove = (event: PointerEvent) => {
        const at = local(event);
        if (reduced) {
          point.x = at.x;
          point.y = at.y;
          apply();
          return;
        }
        moveX(at.x);
        moveY(at.y);
      };

      const onLeave = () => fade(0);

      /*
       * Pointer-fine only. On a touch screen there is no cursor to follow,
       * `pointermove` arrives only during a drag, and the reveal would be left
       * stuck wherever the last tap landed. The outlined wordmark is the
       * intended resting state, so those visitors simply keep it.
       */
      const canHover = window.matchMedia("(hover: hover) and (pointer: fine)");
      if (canHover.matches) {
        root.addEventListener("pointerenter", onEnter);
        root.addEventListener("pointermove", onMove);
        root.addEventListener("pointerleave", onLeave);
      }

      /*
       * The gloss is scrubbed rather than looped: an idle repeating tween in
       * the footer would keep the compositor awake on every page of the site.
       * Its window runs from the wordmark entering the viewport to the page
       * bottoming out, which is a window that can always actually be
       * completed — the footer is the last thing on the page, so a window
       * measured against the middle of the viewport would leave the highlight
       * stranded mid-word.
       */
      const gradient = root.querySelector<SVGLinearGradientElement>(
        "[data-footer-sweep]",
      );
      if (gradient && !reduced) {
        gsap.fromTo(
          gradient,
          { attr: { x1: SWEEP_FROM - SWEEP_BAND, x2: SWEEP_FROM } },
          {
            attr: { x1: SWEEP_TO, x2: SWEEP_TO + SWEEP_BAND },
            ease: "none",
            scrollTrigger: {
              trigger: root,
              start: "top bottom",
              end: "bottom bottom",
              scrub: 0.8,
            },
          },
        );
      }

      return () => {
        root.removeEventListener("pointerenter", onEnter);
        root.removeEventListener("pointermove", onMove);
        root.removeEventListener("pointerleave", onLeave);
      };
    }, root);

    return () => {
      resize.disconnect();
      context.revert();
    };
  }, [reduced]);

  return (
    <div
      ref={rootRef}
      /*
       * Decorative. The footer already opens with a linked, labelled Booklee
       * signature, so announcing the word a second time would only add noise
       * for a screen reader.
       */
      aria-hidden="true"
      className={cn("relative isolate w-full select-none", className)}
      style={
        {
          "--reveal-x": "50%",
          "--reveal-y": "50%",
          "--reveal-r": "220px",
          "--reveal-opacity": 0,
        } as React.CSSProperties
      }
    >
      {/* Base layer: dark letterforms with a hairline outline. */}
      <svg
        viewBox={BRAND.wordViewBox}
        className="block h-auto w-full"
        role="presentation"
      >
        <path
          fillRule="evenodd"
          d={BRAND.lockupWordPath}
          fill="#0c0c0f"
          stroke="rgba(250,250,247,0.3)"
          /* A hairline at every size: the artwork scales from around 340px
             wide on a phone to 1440px on a desktop, and a stroke measured in
             user units would scale with it. */
          strokeWidth={1.1}
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      {/* Gloss: one angled band of light crossing the letters. */}
      <svg
        viewBox={BRAND.wordViewBox}
        className="pointer-events-none absolute inset-0 block h-full w-full"
        role="presentation"
      >
        <defs>
          <linearGradient
            data-footer-sweep=""
            id={sweepId}
            gradientUnits="userSpaceOnUse"
            /* Authored in the rest state — clear of the artwork — so the
               wordmark is a clean outline before the scrub runs, and stays one
               under reduced motion, where the sweep never starts. */
            x1={SWEEP_FROM - SWEEP_BAND}
            y1={WORD_Y1}
            x2={SWEEP_FROM}
            y2={WORD_Y0}
          >
            <stop offset="0" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="0.5" stopColor="#ffffff" stopOpacity="0.5" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          fillRule="evenodd"
          d={BRAND.lockupWordPath}
          fill={`url(#${sweepId})`}
        />
      </svg>

      {/*
        Reveal layer: the same wordmark in white, shown only through a soft
        radial hole that tracks the pointer. The stops are deliberately gradual
        — a single hard edge reads as a spotlight cut-out rather than as light
        falling on the letters.
      */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          opacity: "var(--reveal-opacity)",
          maskImage:
            "radial-gradient(circle var(--reveal-r) at var(--reveal-x) var(--reveal-y), rgba(0,0,0,1) 0%, rgba(0,0,0,0.95) 24%, rgba(0,0,0,0.6) 52%, rgba(0,0,0,0.2) 76%, rgba(0,0,0,0) 100%)",
          WebkitMaskImage:
            "radial-gradient(circle var(--reveal-r) at var(--reveal-x) var(--reveal-y), rgba(0,0,0,1) 0%, rgba(0,0,0,0.95) 24%, rgba(0,0,0,0.6) 52%, rgba(0,0,0,0.2) 76%, rgba(0,0,0,0) 100%)",
          maskRepeat: "no-repeat",
          WebkitMaskRepeat: "no-repeat",
        }}
      >
        <svg
          viewBox={BRAND.wordViewBox}
          className="block h-full w-full"
          role="presentation"
        >
          <defs>
            {/* Not flat white: the lit letters carry the same soft diagonal
                sheen the brand tile uses, so the reveal reads as polished
                rather than as a fill swap. */}
            <linearGradient
              id={glossId}
              gradientUnits="userSpaceOnUse"
              x1={WORD_X0}
              y1={WORD_Y1}
              x2={WORD_X1}
              y2={WORD_Y0}
            >
              <stop offset="0" stopColor="#fafaf7" stopOpacity="0.78" />
              <stop offset="0.42" stopColor="#ffffff" stopOpacity="1" />
              <stop offset="0.74" stopColor="#fafaf7" stopOpacity="0.9" />
              <stop offset="1" stopColor="#e9e9e3" stopOpacity="0.95" />
            </linearGradient>
          </defs>
          <path
            fillRule="evenodd"
            d={BRAND.lockupWordPath}
            fill={`url(#${glossId})`}
          />
        </svg>
      </div>
    </div>
  );
}
