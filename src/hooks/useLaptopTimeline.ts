"use client";

import type { RefObject } from "react";

import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";
import { gsap, ScrollTrigger } from "@/lib/gsap";

export type LaptopTimelineOptions = {
  sectionRef: RefObject<HTMLElement | null>;
  /** Only the cinematic branch builds a timeline at all. */
  enabled: boolean;
  /** Real phrase node living inside the ERP concept screen. */
  phraseSrcId: string;
  /** Matching phrase node inside the next section's heading. */
  phraseDestId: string;
  /** The next section, used as the trigger for the phrase handoff. */
  receiverId: string;
  overlayRef: RefObject<HTMLElement | null>;
};

/** Chapter boundaries, expressed on a 0–100 timeline. */
const CHAPTER = {
  settle: 0,
  open: 12,
  crm: 27,
  hrm: 37,
  portfolio: 47,
  travel: 57,
  erp: 67,
  camera: 78,
  end: 90,
} as const;

const LID_CLOSED = -102;
const LID_OPEN = 8;

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

/**
 * Builds the pinned laptop narrative.
 *
 * Two triggers, deliberately:
 *
 *  1. the pinned story — settle, lid, five concept screens, camera push;
 *  2. a short outro that runs *after* the pin releases, during which the real
 *     `Built around you.` phrase leaves the ERP screen and lands in the next
 *     section's heading.
 *
 * Splitting them is what makes the handoff land without a jump. While a section
 * is pinned, the section below it is by definition still a full viewport away,
 * so a phrase that finished its flight at the end of the pin would be flying to
 * somewhere off-screen. Running the flight across the scroll that follows means
 * the destination is genuinely on screen, and because the overlay reads the
 * destination's live position every frame, the swap back to real document text
 * is exact at any scroll speed.
 */
export function useLaptopTimeline({
  sectionRef,
  enabled,
  phraseSrcId,
  phraseDestId,
  receiverId,
  overlayRef,
}: LaptopTimelineOptions) {
  useIsomorphicLayoutEffect(() => {
    const section = sectionRef.current;
    const overlay = overlayRef.current;
    if (!enabled || !section || !overlay) return;

    const context = gsap.context(() => {
      const media = gsap.matchMedia();

      const build = (endScroll: string, zoomFactor: number) => () => {
        const q = gsap.utils.selector(section);
        const scene = q("[data-laptop='scene']")[0] as HTMLElement | undefined;
        const zoom = q("[data-laptop='zoom']")[0] as HTMLElement | undefined;
        const lid = q("[data-laptop='lid']")[0] as HTMLElement | undefined;
        const device = q("[data-laptop='device']")[0] as HTMLElement | undefined;
        const slides = q("[data-laptop='slide']") as HTMLElement[];
        const labels = q("[data-laptop='label']") as HTMLElement[];
        const idle = q("[data-laptop='idle']")[0] as HTMLElement | undefined;
        const intro = q("[data-laptop='intro']")[0] as HTMLElement | undefined;
        const hint = q("[data-laptop='hint']")[0] as HTMLElement | undefined;
        const fog = q("[data-laptop='fog']") as HTMLElement[];
        const recede = q("[data-laptop='recede']") as HTMLElement[];

        const src = document.getElementById(phraseSrcId);
        const dest = document.getElementById(phraseDestId);
        const receiver = document.getElementById(receiverId);

        if (!scene || !zoom || !lid || !device || slides.length < 5) return;

        // --- initial state -------------------------------------------------
        gsap.set(lid, {
          rotateX: LID_CLOSED,
          z: -14,
          transformOrigin: "50% 100%",
        });
        gsap.set(device, { scale: 0.94, yPercent: 3 });
        gsap.set(slides[0], { autoAlpha: 0 });
        gsap.set(slides[1], { clipPath: "inset(0% 0% 0% 100%)" });
        gsap.set(slides[2], { clipPath: "inset(0% 0% 100% 0%)" });
        gsap.set(slides[3], { clipPath: "inset(0% 100% 0% 0%)" });
        gsap.set(slides[4], { autoAlpha: 0, scale: 1.05 });
        gsap.set(labels, { autoAlpha: 0 });

        // --- camera --------------------------------------------------------
        const geo = { scale: 1.6, dx: 0, dy: 0 };
        const camera = { t: 0 };
        // Assigned once the timeline exists; ScrollTrigger's first refresh
        // fires while the timeline is still being constructed.
        let story: gsap.core.Timeline | null = null;

        const applyCamera = () => {
          const t = camera.t;
          gsap.set(zoom, {
            scale: 1 + (geo.scale - 1) * t,
            x: geo.dx * t,
            y: geo.dy * t,
          });
        };

        const measure = () => {
          if (!story) return;
          const progress = story.progress();
          story.progress(CHAPTER.camera / 100, true);
          gsap.set(zoom, { scale: 1, x: 0, y: 0 });

          const zoomRect = zoom.getBoundingClientRect();
          const phraseRect = src?.getBoundingClientRect();
          const vw = window.innerWidth;
          const vh = window.innerHeight;

          geo.scale = gsap.utils.clamp(
            1.25,
            2.2,
            (vw * zoomFactor) / Math.max(zoomRect.width, 1),
          );

          if (phraseRect) {
            const cx = zoomRect.left + zoomRect.width / 2;
            const cy = zoomRect.top + zoomRect.height / 2;
            const px = phraseRect.left + phraseRect.width / 2;
            const py = phraseRect.top + phraseRect.height / 2;
            // Land the phrase near the lower third: the screen still fills the
            // frame, and the text has somewhere to travel from.
            geo.dx = vw * 0.5 - (cx + (px - cx) * geo.scale);
            geo.dy = vh * 0.74 - (cy + (py - cy) * geo.scale);
          } else {
            geo.dx = 0;
            geo.dy = 0;
          }

          story.progress(progress, true);
        };

        // --- pinned story ---------------------------------------------------
        const timeline = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: endScroll,
            pin: scene,
            pinSpacing: true,
            scrub: 0.9,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            // This pin adds several viewports of spacer. Everything below it
            // has to be measured afterwards, so it refreshes first.
            refreshPriority: 1,
            onRefresh: measure,
          },
        });

        story = timeline;

        // 0–12 · the device settles into the scene.
        timeline.to(
          device,
          { scale: 0.97, yPercent: 0, duration: 12, ease: "power2.out" },
          CHAPTER.settle,
        );

        // 12–27 · the lid opens and the camera advances slightly.
        timeline
          .to(
            lid,
            {
              rotateX: LID_OPEN,
              duration: 15,
              ease: "power2.inOut",
            },
            CHAPTER.open,
          )
          .to(
            device,
            { scale: 1, duration: 15, ease: "power2.inOut" },
            CHAPTER.open,
          )
          .to(
            [intro, hint].filter(Boolean) as HTMLElement[],
            { autoAlpha: 0, y: -28, duration: 8, ease: "power2.in" },
            CHAPTER.open,
          );

        if (idle) {
          timeline.to(
            idle,
            { autoAlpha: 0, duration: 3 },
            CHAPTER.crm - 1.5,
          );
        }

        // 27–78 · five concept screens, each arriving with its own crop.
        const screenStarts = [
          CHAPTER.crm,
          CHAPTER.hrm,
          CHAPTER.portfolio,
          CHAPTER.travel,
          CHAPTER.erp,
        ];

        timeline.to(
          slides[0],
          { autoAlpha: 1, duration: 4, ease: "power2.out" },
          CHAPTER.crm,
        );
        timeline.to(
          slides[1],
          {
            clipPath: "inset(0% 0% 0% 0%)",
            duration: 4.5,
            ease: "power2.inOut",
          },
          CHAPTER.hrm,
        );
        timeline.to(
          slides[2],
          {
            clipPath: "inset(0% 0% 0% 0%)",
            duration: 4.5,
            ease: "power2.inOut",
          },
          CHAPTER.portfolio,
        );
        timeline.to(
          slides[3],
          {
            clipPath: "inset(0% 0% 0% 0%)",
            duration: 4.5,
            ease: "power2.inOut",
          },
          CHAPTER.travel,
        );
        timeline.to(
          slides[4],
          { autoAlpha: 1, scale: 1, duration: 4.5, ease: "power2.out" },
          CHAPTER.erp,
        );

        labels.forEach((label, index) => {
          const start = screenStarts[index];
          const next = screenStarts[index + 1] ?? CHAPTER.camera + 4;
          timeline
            .to(label, { autoAlpha: 1, duration: 2 }, start + 0.5)
            .to(label, { autoAlpha: 0, duration: 2 }, next - 1.5);
        });

        // 78–90 · the camera pushes toward the screen; the room recedes.
        timeline
          .to(
            camera,
            {
              t: 1,
              duration: 12,
              ease: "power2.inOut",
              onUpdate: applyCamera,
            },
            CHAPTER.camera,
          )
          .to(
            recede,
            { autoAlpha: 0, duration: 9, ease: "power1.in" },
            CHAPTER.camera,
          )
          .to(
            fog,
            { autoAlpha: 0, duration: 9, ease: "power1.in" },
            CHAPTER.camera,
          );

        // Hold the final frame so the ERP screen and its phrase stay readable
        // for the last stretch of the pin.
        timeline.to({}, { duration: 100 - CHAPTER.end }, CHAPTER.end);

        // The first refresh ran before the timeline existed, so take the
        // measurement now that it does. The full refresh matters because the
        // pin spacer created above moves every trigger further down the page,
        // including ones built before this component upgraded to cinematic.
        measure();
        ScrollTrigger.refresh();

        // --- phrase handoff, after the pin releases -------------------------
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
          const scale =
            start.width / Math.max(destRect.width, 1) +
            (1 - start.width / Math.max(destRect.width, 1)) * e;

          gsap.set(overlay, {
            x: start.x + (destRect.left - start.x) * e,
            y: start.y + (destRect.top - start.y) * e,
            scale,
            color: colour(e),
          });
        };

        const handoff = { t: 0 };
        const outro = gsap.timeline({
          scrollTrigger: {
            trigger: receiver ?? section,
            start: "top bottom",
            end: "top 28%",
            scrub: 0.9,
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
          // The scene clears well before the phrase finishes travelling, so the
          // dark hero is not still hanging over the section it hands off to.
          .to(scene, { autoAlpha: 0, ease: "power1.in", duration: 0.5 }, 0);

        // --- ambient --------------------------------------------------------
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

        return () => {
          ambient.forEach((tween) => tween.kill());
          deactivate();
          outro.scrollTrigger?.kill();
          outro.kill();
          timeline.scrollTrigger?.kill();
          timeline.kill();
        };
      };

      media.add(
        "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
        build("+=520%", 0.98),
      );
      media.add(
        "(min-width: 768px) and (max-width: 1023.98px) and (prefers-reduced-motion: no-preference)",
        build("+=340%", 0.92),
      );

      return () => media.revert();
    }, section);

    return () => context.revert();
  }, [enabled, phraseSrcId, phraseDestId, receiverId, sectionRef, overlayRef]);
}
