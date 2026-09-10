"use client";

import type { RefObject } from "react";

import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";
import { heroViews } from "@/content/heroCanvas";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { CHAPTER, VIEW_WIPE_SHARE } from "@/lib/heroV2Chapters";
import { resetHeroView, setHeroViewFromProgress } from "@/lib/heroV2State";

export type HeroV2TimelineOptions = {
  sectionRef: RefObject<HTMLElement | null>;
  /** False on the stacked path, where there is no timeline at all. */
  enabled: boolean;
};

/**
 * The chapter table on GSAP's 0–100 playhead.
 *
 * Every number is `CHAPTER` from `@/lib/heroV2Chapters` multiplied by a hundred,
 * because that module is the single normalised source of truth: the frame's
 * transform, the view transitions and the progress rail's caption all derive
 * from the same functions of one progress value. Writing the boundaries out by
 * hand a second time here is precisely what lets a timeline and the labels
 * describing it drift apart.
 */
const at = (progress: number) => progress * 100;

const CH = {
  approach: at(CHAPTER.approach),
  approachDone: at(CHAPTER.approachDone),
  canvasIn: at(CHAPTER.canvasIn),
  canvasDone: at(CHAPTER.canvasDone),
  settle: at(CHAPTER.settle),
} as const;

/** The views share the canvas chapter evenly. */
const VIEW_SLOT = (CH.canvasDone - CH.canvasIn) / heroViews.length;
const VIEW_AT = heroViews.map((_, index) => CH.canvasIn + VIEW_SLOT * index);

/**
 * How long one view takes to arrive. Derived from the slot rather than fixed,
 * because the transition and the still frame that follows it are a ratio, not
 * two independent numbers — add a fifth view and both shorten together instead
 * of the chapter becoming a run of transitions with nothing between them.
 */
const VIEW_WIPE = VIEW_SLOT * VIEW_WIPE_SHARE;

/**
 * How each view arrives, alternating down the sequence: a wipe in from the
 * right, then one in from the left, then right again.
 *
 * Both of the alternatives were built and looked at, and both were worse.
 *
 * A cross-dissolve spends its whole duration showing two large headlines
 * double-exposed over each other in the same corner, which reads as a broken
 * render rather than as a transition.
 *
 * A wipe *up from the bottom* is worse still, and for a subtler reason: the
 * cut is horizontal, so it runs straight between the two lines of a headline
 * and briefly composes a sentence out of one line of the outgoing view and one
 * line of the incoming one. Mid-transition the frame read "Starter systems for
 * client pages." — a phrase neither view contains and which nobody wrote.
 *
 * A vertical cut sweeping across cannot do that, and it is also what a browser
 * moving forward and back through history looks like, which is exactly the
 * reading this frame wants.
 */
const ENTRANCES = [
  "inset(0% 0% 0% 100%)",
  "inset(0% 100% 0% 0%)",
] as const;

const entranceFor = (index: number) => ({
  clipPath: ENTRANCES[(index - 1) % ENTRANCES.length],
});

/** Where every entrance finishes: the view filling the glass. */
const AT_REST = { clipPath: "inset(0% 0% 0% 0%)" } as const;

/**
 * The one authoritative timeline for the floating-canvas hero.
 *
 * Everything the hero does is derived from this single scrubbed playhead, and
 * nothing else in the hero listens to scroll.
 *
 * What it deliberately does *not* do is touch `@/lib/heroState`. The laptop
 * hero published a phase there so the floating navigation could hide itself for
 * the length of the animation; this hero leaves the bar visible and usable
 * throughout, so it publishes nothing the header reads. `SiteHeader` stays on
 * its `"intro"` default and never goes inert while this hero is mounted.
 */
export function useHeroV2Timeline({
  sectionRef,
  enabled,
}: HeroV2TimelineOptions) {
  useIsomorphicLayoutEffect(() => {
    const section = sectionRef.current;
    if (!enabled || !section) return;

    const context = gsap.context(() => {
      const media = gsap.matchMedia();

      const build = (endScroll: string) => () => {
        const q = gsap.utils.selector(section);
        const pick = (name: string) =>
          q(`[data-hero='${name}']`)[0] as HTMLElement | undefined;

        const scene = pick("scene");
        const stage = pick("stage");
        const copy = pick("copy");
        const veil = pick("veil");
        const edge = pick("edge");
        const bloom = pick("bloom");
        const grid = pick("grid");
        const progress = pick("progress");
        const handoff = pick("handoff");
        const views = q("[data-hero='view']") as HTMLElement[];
        const haze = q("[data-hero='haze']") as HTMLElement[];

        if (!scene || !stage || views.length !== heroViews.length) return;

        /*
         * Motion amplitudes come from the stylesheet, not from literals here.
         *
         * They are declared unitless on `.scene` so `parseFloat` can read them,
         * and the tablet branch of the stylesheet redefines the same seven
         * custom properties with flatter values. That is what lets one timeline
         * serve both breakpoints: the choreography is identical and only its
         * amplitude changes, so there is no second copy of this function to
         * keep in step with the first.
         */
        const computed = getComputedStyle(scene);
        const amount = (name: string, fallback: number) => {
          const value = Number.parseFloat(computed.getPropertyValue(name));
          return Number.isFinite(value) ? value : fallback;
        };

        /*
         * The resting pose puts the canvas below and to the right of the
         * headline, dimmed, rather than centred behind it. Centred, the outer
         * headline and the view's own headline land on top of one another and
         * neither is readable — the canvas has to be somewhere the type is not
         * until the type has gone.
         */
        const rest = {
          rotateX: amount("--hero-rx-rest", 11),
          rotateY: amount("--hero-ry-rest", -13),
          scale: amount("--hero-scale-rest", 0.62),
          yPercent: amount("--hero-lift-rest", 25),
          xPercent: amount("--hero-shift-rest", 22),
        };

        /*
         * Note what is *not* in `rest`: an opacity.
         *
         * The canvas is the top layer now, so fading it would show the headline
         * straight through the window. It stays opaque and the veil inside it
         * carries the "not yet arrived" reading instead.
         */
        const veilRest = amount("--hero-veil-rest", 0.72);
        const near = {
          rotateX: amount("--hero-rx-near", 2),
          rotateY: amount("--hero-ry-near", -1.5),
        };

        /* --- initial state, set before the first animated frame ----------
         *
         * This is no longer the *first* time the resting pose is applied: the
         * stylesheet now states it too, from these same five custom
         * properties, so it is already true in the frame the browser paints
         * before this hook can run. What happens here is the handover from that
         * rule to GSAP's inline transform, and the two are built to land on the
         * identical matrix.
         *
         * Every channel is written explicitly, including the four that `rest`
         * has no opinion about, and that is the whole trick.
         *
         * GSAP seeds an element's transform record by decomposing its computed
         * matrix, and that decomposition assumes the scale is uniform across
         * all three axes. The stylesheet's `scale()` is two-dimensional — it
         * scales x and y and leaves z alone — so the matrix it produces is one
         * GSAP's inverse cannot express, and it lands on the nearest thing it
         * can: it reads 11deg/-13deg back as 6.43/-7.72 and makes up the
         * difference as 1.64deg of in-plane `rotation` plus 1.64deg of
         * `skewX`. The rotations and the scale are then overwritten from
         * `rest` — but nothing in this hero ever sets `rotation` or `skewX`,
         * so those two survived the handover and stayed on the frame for the
         * entire timeline. That is a canvas visibly rotated and sheared in the
         * plane of the screen, worst of all at the near pose where it is meant
         * to be square to the reader.
         *
         * `x`/`y` are zeroed for a second, unrelated reason: a computed matrix
         * has no notion of a percentage, so the stylesheet's
         * `translate(22%, 22%)` comes back as pixels and lands in `x`/`y`.
         * Setting `xPercent`/`yPercent` without clearing those would apply
         * both and put the canvas at roughly twice its intended offset.
         *
         * Between them these six zeroes mean the pose after this line is
         * exactly `rest`, whatever the parse made of the CSS — which is what
         * lets the stylesheet state the resting pose for the first paint
         * without GSAP inheriting a misreading of it.
         * --------------------------------------------------------------- */
        gsap.set(stage, {
          ...rest,
          x: 0,
          y: 0,
          z: 0,
          rotation: 0,
          skewX: 0,
          skewY: 0,
          transformOrigin: "50% 50%",
        });

        /*
         * The stylesheet hides every view but the first, so a cold load cannot
         * flash the last one before this runs. Visibility is handed back here
         * and the clip takes over the job of hiding them, which is what the
         * wipes then animate open.
         */
        for (let i = 1; i < views.length; i += 1) {
          gsap.set(views[i], { visibility: "visible", ...entranceFor(i) });
        }

        if (progress) gsap.set(progress, { opacity: 0 });
        if (handoff) gsap.set(handoff, { opacity: 0 });
        if (bloom) gsap.set(bloom, { opacity: 0 });
        if (veil) gsap.set(veil, { opacity: veilRest });

        const timeline = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: endScroll,
            pin: scene,
            pinSpacing: true,
            /*
             * Tighter than it was. Scrub is a lag as well as a smoother, and at
             * 0.9 the first small scroll was answered late enough to read as
             * the hero not responding at all. 0.65 still glides — it is well
             * clear of the jitter you get near zero — but the canvas now starts
             * moving while the wheel is still turning.
             */
            scrub: 0.65,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            refreshPriority: 1,
          },
        });

        // The progress rail's caption is derived from the playhead rather than
        // remembered, so scrubbing backwards relabels the views correctly with
        // no extra bookkeeping.
        timeline.eventCallback("onUpdate", () => {
          setHeroViewFromProgress(timeline.progress());
        });

        /* ---------------------------------------------------------------
         * 2–18 · the canvas comes forward and takes the space over.
         *
         * The headline goes first and is finished well before the canvas
         * arrives, rather than fading alongside it. Two things are doing that
         * work and they are meant to be read together: the copy is *under* the
         * canvas in the paint order, so the window physically covers it as it
         * sweeps up and left across the space the type occupied; and the copy
         * leaves early and drifts with the sweep, so what is left of it is
         * going the same way the window came from.
         *
         * The fade finishing at 12 while the canvas settles at 18 is the whole
         * point. There is no stretch where a full-strength headline and a
         * full-strength window are both asking to be looked at.
         *
         * The calls to action are not in this tween and never fade — they are a
         * sibling layer parked at the foot of the scene, above the canvas, so
         * the two ways out of the hero are clickable for every frame of it.
         * ------------------------------------------------------------- */
        if (copy) {
          timeline.to(
            copy,
            {
              autoAlpha: 0,
              y: -22,
              x: -34,
              duration: 10,
              ease: "power2.in",
            },
            CH.approach,
          );
        }

        // The page inside the frame lights up as the frame arrives, finishing
        // a little ahead of the movement so the canvas is fully itself by the
        // time it stops.
        if (veil) {
          timeline.to(
            veil,
            {
              opacity: 0,
              duration: CH.approachDone - CH.approach - 3,
              ease: "power2.out",
            },
            CH.approach,
          );
        }

        timeline.to(
          stage,
          {
            ...near,
            scale: 1,
            yPercent: 0,
            xPercent: 0,
            duration: CH.approachDone - CH.approach,
            ease: "power2.out",
          },
          CH.approach,
        );

        // The light the canvas throws arrives with the canvas, not before it.
        if (bloom) {
          timeline.to(
            bloom,
            {
              opacity: 1,
              duration: CH.approachDone - CH.approach,
              ease: "power2.out",
            },
            CH.approach,
          );
        }

        if (edge) {
          timeline.to(
            edge,
            {
              opacity: 0.9,
              duration: CH.approachDone - CH.approach,
              ease: "power2.out",
            },
            CH.approach,
          );
        }

        /* ---------------------------------------------------------------
         * 28–88 · the views cross-cut inside the frame.
         *
         * The framing barely moves here. A few per cent of push and a degree
         * of yaw keep the closing shot from being frozen; anything more and
         * the reader is being asked to read a page that is still travelling.
         * ------------------------------------------------------------- */
        timeline.to(
          stage,
          {
            scale: 1.02,
            rotateY: near.rotateY + 2.4,
            duration: CH.canvasDone - CH.canvasIn,
            ease: "sine.inOut",
          },
          CH.canvasIn,
        );

        if (progress) {
          timeline.to(
            progress,
            { opacity: 1, duration: 5, ease: "power1.out" },
            CH.canvasIn,
          );
        }

        for (let i = 1; i < views.length; i += 1) {
          timeline.to(
            views[i],
            { ...AT_REST, duration: VIEW_WIPE, ease: "power2.inOut" },
            VIEW_AT[i],
          );
        }

        /* ---------------------------------------------------------------
         * 88–100 · the closing shot.
         *
         * The canvas settles back and dims the light it was throwing, the rail
         * retires, and a signpost names what is underneath. Then the pin
         * releases and the section scrolls away like any other.
         *
         * This is deliberately not the laptop hero's phrase handoff. That
         * animation flew a measured line of text out of a specific word on a
         * specific screen into the next section's heading; there is no such
         * word in this hero, and manufacturing one so the old transition had
         * something to fly out of would be building the content around the
         * animation rather than the other way round.
         * ------------------------------------------------------------- */
        timeline.to(
          stage,
          {
            scale: 0.9,
            rotateX: near.rotateX + 3,
            yPercent: -2,
            duration: 100 - CH.settle,
            ease: "power2.inOut",
          },
          CH.settle,
        );

        if (bloom) {
          timeline.to(
            bloom,
            { opacity: 0.35, duration: 100 - CH.settle, ease: "power1.in" },
            CH.settle,
          );
        }

        if (edge) {
          timeline.to(
            edge,
            { opacity: 0.2, duration: 100 - CH.settle, ease: "power1.in" },
            CH.settle,
          );
        }

        if (progress) {
          timeline.to(progress, { opacity: 0, duration: 6 }, CH.settle);
        }

        if (handoff) {
          timeline.to(
            handoff,
            { opacity: 1, duration: 7, ease: "power1.out" },
            CH.settle + 2,
          );
        }

        /* --- ambient -----------------------------------------------------
         * Not on the timeline: the void keeps breathing whether or not anyone
         * is scrolling. The grid is the exception — it is parallax, so it is
         * scrubbed with everything else.
         * --------------------------------------------------------------- */
        if (grid) {
          timeline.fromTo(
            grid,
            { yPercent: 0, scale: 1 },
            { yPercent: -6, scale: 1.08, duration: 100, ease: "none" },
            0,
          );
        }

        const ambient = haze.map((layer, index) =>
          gsap.to(layer, {
            y: index === 0 ? 14 : -11,
            x: index === 0 ? -10 : 8,
            duration: index === 0 ? 9 : 7,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
          }),
        );

        ScrollTrigger.refresh();

        return () => {
          ambient.forEach((tween) => tween.kill());
          timeline.scrollTrigger?.kill();
          timeline.kill();
          resetHeroView();
        };
      };

      /*
       * Shorter than they were (520% and 380%). The whole hero now asks for
       * about four and a half screens of scrolling rather than five and a
       * quarter, and because the approach chapter shrank by more than the
       * trigger did, the four views kept their reading time while everything
       * before them got quicker.
       */
      media.add(
        "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
        build("+=440%"),
      );
      media.add(
        "(min-width: 768px) and (max-width: 1023.98px) and (prefers-reduced-motion: no-preference)",
        build("+=320%"),
      );

      return () => media.revert();
    }, section);

    return () => {
      context.revert();
      resetHeroView();
    };
  }, [enabled, sectionRef]);
}
