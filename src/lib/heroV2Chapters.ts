/**
 * The floating-canvas hero's chapter boundaries, and every signal derived from
 * them.
 *
 * This is the single normalised source of truth for `BookleeHeroV2`. The GSAP
 * timeline, the frame's transform, the view captions and the progress rail all
 * read these same pure functions of one number, so nothing in the hero can
 * disagree with anything else about where in the story the page is. Nothing
 * here touches React or the DOM — it is arithmetic on one scalar.
 *
 * It deliberately does not extend `@/lib/heroChapters`. That module describes a
 * different object with a different story (a laptop that opens, wakes and is
 * approached), and folding two narratives into one table is how the boundaries
 * of each stop meaning anything. The old module stays exactly as it is.
 *
 * All boundaries are normalised progress across the pinned hero, 0 to 1:
 *
 *   0.00–0.10  rest       headline readable, canvas floating back and small
 *   0.10–0.28  approach   canvas scales closer and straightens in perspective
 *   0.28–0.88  canvas     the four internal views cross-cut inside the frame
 *   0.88–1.00  settle     the canvas comes to rest and hands off to the page
 */

import { HERO_VIEW_COUNT } from "@/content/heroCanvas";

export const CHAPTER = {
  /**
   * Where the resting shot ends and the canvas starts moving.
   *
   * As near the top as it can be without the canvas twitching before the page
   * has really been scrolled. At the trigger's current length this is about
   * 80px of wheel, so the canvas is already moving inside the first flick —
   * a long flat stretch where nothing happens reads as the hero being stuck,
   * and it also leaves the headline and the canvas sharing the screen as
   * equals for longer than either of them wants.
   */
  approach: 0.02,
  /**
   * The approach is short as well as early: about seven tenths of a screen of
   * scrolling, down from well over one. The scroll it gives up is handed to the
   * views rather than saved, so each of the four still gets the same reading
   * time it had before while the hero as a whole answers the wheel sooner.
   */
  approachDone: 0.18,
  /** Where the internal views begin and end. */
  canvasIn: 0.18,
  canvasDone: 0.88,
  /** The closing shot. */
  settle: 0.88,
} as const;

export const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

/** Normalised position within [a, b], clamped outside it. */
export const span = (p: number, a: number, b: number) =>
  clamp01((p - a) / (b - a));

export const easeInOut = (t: number) =>
  t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;

/* ------------------------------------------------------------------ *
 * Derived signals. Each is 0–1 and each is read by more than one layer.
 * ------------------------------------------------------------------ */

/** How far the canvas has come forward, 0 resting and 1 fully approached. */
export const frameApproach = (p: number) =>
  easeInOut(span(p, CHAPTER.approach, CHAPTER.approachDone));

/** How far into the closing shot the hero is. */
export const frameSettle = (p: number) => easeInOut(span(p, CHAPTER.settle, 1));

/**
 * One view's share of the canvas chapter, in normalised progress.
 *
 * Divided by the number of views rather than written as a literal, so a fifth
 * view can be added in `@/content/heroCanvas` alone without stranding it off
 * the end of the chapter.
 */
export const VIEW_STEP =
  (CHAPTER.canvasDone - CHAPTER.canvasIn) / HERO_VIEW_COUNT;

/**
 * What share of a view's slot its transition occupies. The rest of the slot is
 * the view at rest, which is when it is actually read — so this is the ratio
 * that has to hold as the sequence grows, not the transition's absolute length.
 */
export const VIEW_WIPE_SHARE = 0.5;

/**
 * Half of a view's transition. The caption changes when the incoming view is
 * halfway across rather than the instant its transition begins, so the label
 * and the thing it is labelling agree at every point a reader could stop.
 */
const VIEW_WIPE_HALF = (VIEW_STEP * VIEW_WIPE_SHARE) / 2;

/**
 * Which view the canvas is showing, as a continuous position along the chapter.
 *
 * The caption reads `viewIndex`, which is this rounded down. Both come from
 * progress for the same reason everything else here does: the scrubbed timeline
 * animates the views and these name them, and tracking the two separately is
 * what lets a caption describe a view that left the screen two beats ago.
 */
export const viewPosition = (p: number) => {
  const last = HERO_VIEW_COUNT - 1;
  const at = (p - CHAPTER.canvasIn - VIEW_WIPE_HALF) / VIEW_STEP;
  return at < 0 ? 0 : at > last ? last : at;
};

/** Which view the canvas is showing, 0 to `HERO_VIEW_COUNT - 1`. */
export const viewIndex = (p: number) => Math.floor(viewPosition(p));
