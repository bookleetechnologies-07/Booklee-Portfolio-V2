"use client";

import { useEffect, useRef } from "react";

import { PreviewSlide } from "@/components/hero/HeroViews";
import { heroViews } from "@/content/heroCanvas";
import { useHeroViewIndex } from "@/lib/heroV2State";

import styles from "./heroV2.module.css";

/** How far the pointer may tilt the canvas, in degrees. */
const TILT_Y = 2.4;
const TILT_X = 1.4;
/** Per-frame approach toward the pointer. Low enough to feel like weight. */
const DAMPING = 0.055;

/**
 * The floating website canvas: the one object this hero is about.
 *
 * Three nested transform layers, and the nesting is the whole design:
 *
 *   .stageWrap   owns `perspective` and nothing else
 *     .parallax  owns the damped pointer tilt, written from a rAF loop
 *       .stage   owned exclusively by the GSAP timeline
 *
 * Splitting the pointer tilt off the scrubbed transform is the one structural
 * idea taken wholesale from the reference animation, and it is worth taking:
 * two writers on a single element's `transform` overwrite each other every
 * frame, and the symptom — a canvas that twitches between two poses while you
 * scroll with the mouse over it — is miserable to diagnose after the fact.
 *
 * The frame is a site canvas rather than a device. There is no bezel, no hinge,
 * no keyboard and no hardware to get wrong: a thin browser chrome, a hairline
 * spectral edge, and the page itself. That is deliberate — a device has to be
 * modelled convincingly or it reads as a toy, and nothing about what Booklee
 * sells depends on the reader believing in a laptop.
 */
export function FloatingSiteFrame({ parallax }: { parallax: boolean }) {
  const parallaxRef = useRef<HTMLDivElement>(null);
  const current = useHeroViewIndex();

  useEffect(() => {
    const element = parallaxRef.current;
    if (!parallax || !element) return;

    /*
     * Target and current are tracked separately so the pointer sets a
     * destination and the frame travels toward it, rather than being nailed to
     * the cursor. `frame` is kept so a pending callback is cancelled on unmount
     * — an orphaned rAF writing to a detached node is a leak that survives
     * client-side navigation.
     */
    const target = { x: 0, y: 0 };
    const at = { x: 0, y: 0 };
    let frame = 0;

    const onMove = (event: PointerEvent) => {
      target.x = (event.clientX / window.innerWidth - 0.5) * 2;
      target.y = (event.clientY / window.innerHeight - 0.5) * 2;
    };

    const tick = () => {
      at.x += (target.x - at.x) * DAMPING;
      at.y += (target.y - at.y) * DAMPING;
      element.style.transform = `rotateX(${-at.y * TILT_X}deg) rotateY(${
        at.x * TILT_Y
      }deg)`;
      frame = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    frame = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(frame);
      element.style.transform = "";
    };
  }, [parallax]);

  return (
    <div className={styles.stageWrap} data-hero="stage-wrap">
      <div ref={parallaxRef} className={styles.parallax}>
        <div className={styles.stage} data-hero="stage">
          <div className={styles.frame} data-hero="frame">
            <div className={styles.frameEdge} data-hero="edge" aria-hidden="true" />

            {/*
              The address bar is not decoration. It shows the real route each
              view previews, so a reader who goes looking for the page they were
              shown finds it — and it makes the view change legible as a
              *navigation* rather than as a slide transition.
            */}
            <div className={styles.chrome} aria-hidden="true">
              <span className={styles.chromeDots}>
                <span className={styles.chromeDot} />
                <span className={styles.chromeDot} />
                <span className={styles.chromeDot} />
              </span>
              <span className={styles.chromeAddress}>
                {heroViews[current].path}
              </span>
            </div>

            <div className={styles.viewport}>
              <div className={styles.viewList}>
                {heroViews.map((view) => (
                  <PreviewSlide key={view.id} id={view.id} />
                ))}
              </div>
            </div>

            {/*
              The scrim that dims the page while the canvas is still on its way
              in. It sits inside the frame rather than on it, so the frame stays
              opaque and keeps occluding the headline behind it throughout —
              see `.frameVeil` for why that distinction matters.
            */}
            <div
              data-hero="veil"
              className={styles.frameVeil}
              aria-hidden="true"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
