"use client";

import type { RefObject } from "react";

import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { deckSlides } from "@/content/deck";
import { CHAPTER, DECK_WIPE_SHARE, WAKE } from "@/lib/heroChapters";
import {
  heroSignal,
  resetHeroPhase,
  setDeckFromProgress,
  setHeroPhase,
  setHeroPhaseFromProgress,
} from "@/lib/heroState";

export type HeroTimelineOptions = {
  sectionRef: RefObject<HTMLElement | null>;
  enabled: boolean;
  phraseSrcId: string;
  phraseDestId: string;
  receiverId: string;
  overlayRef: RefObject<HTMLElement | null>;
};

/**
 * The chapter table, expressed on GSAP's 0–100 playhead.
 *
 * These are not independent numbers. Every one is `CHAPTER` from
 * `@/lib/heroChapters` multiplied by 100, because that module is the single
 * normalised source of truth the brief requires: the WebGL camera, the lid, the
 * screen light, the DOM glow layers and the navigation all read those same pure
 * functions of one progress value. Writing the boundaries out again by hand
 * here is what previously let the timeline, the scene and the nav disagree
 * about where in the story the page was.
 */
const at = (progress: number) => progress * 100;

const CH = {
  introOut: at(CHAPTER.introOut),
  lidOpen: at(CHAPTER.lidOpen),
  lidDone: at(CHAPTER.lidDone),
  powerOn: at(CHAPTER.powerOn),
  powerDone: at(CHAPTER.powerDone),
  startup: at(CHAPTER.startup),
  startupDone: at(CHAPTER.startupDone),
  focus: at(CHAPTER.focus),
  focusDone: at(CHAPTER.focusDone),
  /** Where the startup identity gives the panel over to the websites. */
  wake: at(WAKE.start),
  wakeDone: at(WAKE.end),
  deckIn: at(CHAPTER.deckIn),
  deckDone: at(CHAPTER.deckDone),
  release: at(CHAPTER.release),
} as const;

/**
 * The interfaces share the deck chapter evenly, so no slide is on screen
 * appreciably longer than its neighbours regardless of how many there are or
 * where the deck boundaries move to.
 */
const SLIDE_SLOT = (CH.deckDone - CH.deckIn) / deckSlides.length;
const SLIDE_AT = deckSlides.map(
  (_, index) => CH.deckIn + SLIDE_SLOT * index,
);

/**
 * How long one slide takes to arrive.
 *
 * Derived from the slot rather than fixed, because the wipe and the rest that
 * follows it are a ratio, not two independent numbers. At five slides this
 * works out at almost exactly the 3 playhead units it was hard-coded to before;
 * at seven it shortens with the slot, which is what stops the deck becoming a
 * sequence of wipes with no still frames between them.
 */
const SLIDE_WIPE = SLIDE_SLOT * DECK_WIPE_SHARE;

/**
 * How each slide arrives, cycled down the deck.
 *
 * These are the four treatments the five-slide deck used, in the order it used
 * them: a wipe in from the right, one up from the bottom, one in from the left,
 * then a dissolve off a slight scale. Expressing them as a cycle rather than as
 * four hand-placed tweens is what lets the sequence grow without inventing a
 * new look for the slides on the end — the sixth simply comes in from the right
 * again, exactly as the second did.
 *
 * The first slide is not in here. It is already on screen when the chapter
 * opens, faded up with the card itself.
 */
const ENTRANCES = [
  { clipPath: "inset(0% 0% 0% 100%)" },
  { clipPath: "inset(0% 0% 100% 0%)" },
  { clipPath: "inset(0% 100% 0% 0%)" },
  { autoAlpha: 0, scale: 1.04 },
] as const;

const entranceFor = (index: number) => ENTRANCES[(index - 1) % ENTRANCES.length];

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

/**
 * The one authoritative hero timeline.
 *
 * Everything the hero does — DOM layers, the WebGL camera, navigation
 * visibility, and the phrase handoff — is derived from this single scrubbed
 * playhead. Nothing else listens to scroll.
 */
export function useHeroTimeline({
  sectionRef,
  enabled,
  phraseSrcId,
  phraseDestId,
  receiverId,
  overlayRef,
}: HeroTimelineOptions) {
  useIsomorphicLayoutEffect(() => {
    const section = sectionRef.current;
    const overlay = overlayRef.current;
    if (!enabled || !section || !overlay) return;

    const context = gsap.context(() => {
      const media = gsap.matchMedia();

      const build = (endScroll: string) => () => {
        const q = gsap.utils.selector(section);
        const pick = (name: string) =>
          q(`[data-hero='${name}']`)[0] as HTMLElement | undefined;

        const scene = pick("scene");
        const deck = pick("deck");
        const deckLabel = pick("deck-label");
        const intro = pick("intro");
        const hint = pick("hint");
        const vignette = pick("vignette");
        const glow = pick("glow");
        const glowTight = pick("glow-tight");
        const slides = q("[data-hero='slide']") as HTMLElement[];
        const fog = q("[data-hero='fog']") as HTMLElement[];

        const src = document.getElementById(phraseSrcId);
        const dest = document.getElementById(phraseDestId);
        const receiver = document.getElementById(receiverId);

        if (!scene || !deck || slides.length !== deckSlides.length) return;

        // --- initial state, set before the first animated frame ---------
        gsap.set(deck, { autoAlpha: 0 });
        gsap.set(slides[0], { autoAlpha: 0 });
        for (let i = 1; i < slides.length; i += 1) {
          gsap.set(slides[i], entranceFor(i));
        }
        gsap.set([glow, glowTight].filter(Boolean), { opacity: 0 });
        if (deckLabel) gsap.set(deckLabel, { autoAlpha: 0 });

        heroSignal.progress = 0;

        const timeline = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: endScroll,
            pin: scene,
            pinSpacing: true,
            scrub: 0.85,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            refreshPriority: 1,
            onToggle: (self) => {
              heroSignal.active = self.isActive;
              if (!self.isActive && self.progress >= 1) setHeroPhase("released");
            },
          },
        });

        // The WebGL scene and the navigation both read from here.
        //
        // The phase is *derived* from progress rather than remembered, which is
        // what makes reverse scrolling correct without any extra code: coming
        // back up into the hero from below lands on a progress inside the
        // active range and hides the navigation again, and it only returns once
        // the laptop is back at its resting closed state. The mapping lives in
        // `heroChapters.navHidden`, so the bar is hidden for the whole active
        // animation — from the first meaningful laptop motion through to the
        // hero releasing — not merely during the immersive deck.
        timeline.eventCallback("onUpdate", () => {
          const p = timeline.progress();
          heroSignal.progress = p;
          heroSignal.active = true;
          // One WebGL frame per scrub update. The scene cannot ask for its own
          // next frame without the request eventually being dropped, so the
          // timeline that moved the story is what asks for it to be drawn.
          heroSignal.requestFrame();
          setHeroPhaseFromProgress(p);
          setDeckFromProgress(p);
        });

        // 8–20 · intro copy hands over to the object, alongside the nav exit.
        timeline.to(
          [intro, hint].filter(Boolean) as HTMLElement[],
          {
            autoAlpha: 0,
            y: -26,
            duration: CH.lidOpen - CH.introOut,
            ease: "power2.in",
          },
          CH.introOut,
        );

        // 38–51 · the screen powers on and its light fills the room. These DOM
        // layers are the outermost of the six lighting layers — the bleed that
        // carries past the edge of the canvas — and they rise on exactly the
        // chapter the WebGL emissive, area light and haze rise on.
        timeline
          .to(
            [glow, glowTight].filter(Boolean),
            { opacity: 1, duration: CH.powerDone - CH.powerOn, ease: "power2.out" },
            CH.powerOn,
          )
          .to(
            fog,
            { opacity: 1.6, duration: CH.startupDone - CH.powerOn, ease: "power1.out" },
            CH.powerOn,
          );

        // 60–72 · the camera closes on the display.
        //
        // The 3D stage does *not* fade out here any more. It used to: the old
        // hero flew the camera through the bezel and cross-faded to a
        // full-viewport DOM deck, so the machine had to be gone by the time the
        // websites arrived. The camera now stops short of the glass and the
        // websites are shown on the panel, so the laptop stays on screen for
        // the rest of the hero and there is nothing to cross-fade.
        //
        // What does go is the room. The ambient fog is scenery for a wide shot
        // and haze over a close-up, and the two full-viewport glow layers step
        // down rather than out — the screen is still on, so its bleed into the
        // page should still be there, just not at the strength that suited the
        // machine sitting small in a dark room.
        const closing = CH.focusDone - CH.focus;
        timeline
          .to(fog, { autoAlpha: 0, duration: closing, ease: "power2.in" }, CH.focus)
          .to(
            [glow, glowTight].filter(Boolean),
            { opacity: 0.5, duration: closing, ease: "power1.inOut" },
            CH.focus,
          );

        if (vignette) {
          // Eased off, not removed. At the closing framing the display reaches
          // most of the way across the viewport, and a vignette at full
          // strength crushes the two bezel edges the shot is built around.
          timeline.to(
            vignette,
            { opacity: 0.5, duration: closing, ease: "power1.inOut" },
            CH.focus,
          );
        }

        // 68–75 · Booklee's startup identity clears and the first website
        // arrives on the panel behind it. The card's own glow is painted into
        // the screen's emissive texture on the same window, so the light in the
        // room and the thing casting it appear together.
        const wake = CH.wakeDone - CH.wake;
        timeline
          .to(deck, { autoAlpha: 1, duration: wake, ease: "power2.inOut" }, CH.wake)
          .to(
            slides[0],
            { autoAlpha: 1, duration: wake * 0.8, ease: "power2.out" },
            CH.wake + wake * 0.2,
          );

        if (deckLabel) {
          timeline.to(deckLabel, { autoAlpha: 1, duration: 4 }, CH.deckIn);
        }

        // 72–94 · the websites, each arriving with its own crop.
        for (let i = 1; i < slides.length; i += 1) {
          const entrance = entranceFor(i);
          timeline.to(
            slides[i],
            "clipPath" in entrance
              ? {
                  clipPath: "inset(0% 0% 0% 0%)",
                  duration: SLIDE_WIPE,
                  ease: "power2.inOut",
                }
              : {
                  autoAlpha: 1,
                  scale: 1,
                  duration: SLIDE_WIPE,
                  ease: "power2.out",
                },
            SLIDE_AT[i],
          );
        }

        // Hold the final frame so the last screen stays readable to the end.
        // This also fixes the timeline's total length at exactly 100, which is
        // what lets `at()` map chapter progress onto the playhead one-to-one.
        timeline.to({}, { duration: 100 - CH.release }, CH.release);

        // --- phrase handoff, after the pin releases ----------------------
        let active = false;
        let start: { x: number; y: number; width: number } | null = null;
        const colour = gsap.utils.interpolate("#cbefae", "#0b0b0d");
        const ease = gsap.parseEase("power2.inOut");

        const deactivate = () => {
          if (!active) return;
          active = false;
          gsap.set(overlay, { autoAlpha: 0 });
          if (src) src.style.visibility = "";
          if (dest) dest.style.visibility = "";
        };

        const activate = () => {
          if (active || !src || !dest) return;
          const rect = src.getBoundingClientRect();
          start = { x: rect.left, y: rect.top, width: rect.width };
          active = true;
          src.style.visibility = "hidden";
          dest.style.visibility = "hidden";
          gsap.set(overlay, { autoAlpha: 1 });
        };

        const applyHandoff = (raw: number) => {
          const t = clamp01(raw);
          if (t <= 0 || t >= 1 || !src || !dest) {
            deactivate();
            return;
          }
          activate();
          if (!start) return;
          const destRect = dest.getBoundingClientRect();
          if (destRect.width === 0) return;

          const e = ease(t);
          const from = start.width / Math.max(destRect.width, 1);
          gsap.set(overlay, {
            x: start.x + (destRect.left - start.x) * e,
            y: start.y + (destRect.top - start.y) * e,
            scale: from + (1 - from) * e,
            color: colour(e),
          });
        };

        const handoff = { t: 0 };
        const outro = gsap.timeline({
          scrollTrigger: {
            trigger: receiver ?? section,
            start: "top bottom",
            end: "top 28%",
            scrub: 0.85,
            invalidateOnRefresh: true,
            onRefreshInit: () => {
              start = null;
              deactivate();
            },
          },
        });

        outro
          .to(
            handoff,
            {
              t: 1,
              ease: "none",
              duration: 1,
              onUpdate: () => applyHandoff(handoff.t),
              onComplete: () => applyHandoff(1),
              onReverseComplete: () => applyHandoff(0),
            },
            0,
          )
          .to(scene, { autoAlpha: 0, ease: "power1.in", duration: 0.5 }, 0);

        // --- ambient -----------------------------------------------------
        const ambient = fog.map((layer, index) =>
          gsap.to(layer, {
            y: index === 0 ? 12 : -10,
            x: index === 0 ? -9 : 7,
            duration: index === 0 ? 8.5 : 6.5,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
          }),
        );

        ScrollTrigger.refresh();

        return () => {
          ambient.forEach((tween) => tween.kill());
          deactivate();
          outro.scrollTrigger?.kill();
          outro.kill();
          timeline.scrollTrigger?.kill();
          timeline.kill();
          resetHeroPhase();
        };
      };

      media.add(
        "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
        build("+=700%"),
      );
      media.add(
        "(min-width: 768px) and (max-width: 1023.98px) and (prefers-reduced-motion: no-preference)",
        build("+=460%"),
      );

      return () => media.revert();
    }, section);

    return () => {
      context.revert();
      resetHeroPhase();
    };
  }, [enabled, phraseSrcId, phraseDestId, receiverId, sectionRef, overlayRef]);
}
