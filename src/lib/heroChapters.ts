/**
 * The hero's chapter boundaries, and every signal derived from them.
 *
 * This module is the single normalised source of truth for the hero. The GSAP
 * timeline, the WebGL scene, the DOM glow layers and the navigation all read
 * these same pure functions, so the camera, the lid, the screen light and the
 * nav can never disagree about where in the story the page is. Nothing here
 * touches React, the DOM or Three — it is arithmetic on one number.
 *
 * All boundaries are normalised progress across the pinned hero, 0 to 1:
 *
 *   0.00–0.08  resting intro     headline, closed laptop, nav visible
 *   0.08–0.20  motion begins     camera approaches, nav exits and goes inert
 *   0.20–0.38  lid opens         screen still physically black
 *   0.38–0.50  power on          the screen lights the laptop, desk and room
 *   0.50–0.60  startup           Booklee's own identity, before any website
 *   0.60–0.72  camera closes in  framing settles on the display, bezel and all
 *   0.72–0.94  the deck          the websites, inset inside that display
 *   0.94–1.00  handoff/release   phrase completes, nav returns
 *
 * What changed, and why the shape of this file changed with it
 * ------------------------------------------------------------
 * The camera used to travel *through* the display: the last chapter pushed the
 * lens past the bezel, the 3D stage cross-faded to black, and a full-viewport
 * DOM deck took over. That is why this module used to export a `HANDOFF` window
 * and why `screenPower` was a pulse that came back down to zero — the light had
 * to be gone by the time the machine was no longer on screen.
 *
 * The hero no longer leaves the laptop. The camera stops short of the bezel and
 * the websites are shown *on* the panel, inset inside it, so there is no
 * hand-off and nothing to fade through. `screenPower` is therefore monotone: it
 * rises once when the machine wakes and stays up, because the screen stays on
 * for the rest of the story.
 */

import { DECK_COUNT } from "@/content/deck";

export const CHAPTER = {
  introOut: 0.08,
  motionDone: 0.2,
  lidOpen: 0.2,
  lidDone: 0.38,
  powerOn: 0.38,
  powerDone: 0.5,
  startup: 0.5,
  startupDone: 0.6,
  /** The camera's final approach to the display. */
  focus: 0.6,
  focusDone: 0.72,
  deckIn: 0.72,
  deckDone: 0.94,
  release: 0.94,
} as const;

/** Where Booklee's startup identity gives the panel over to the websites. */
export const WAKE = { start: 0.68, end: 0.75 } as const;

export const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

/** Normalised position within [a, b], clamped outside it. */
export const span = (p: number, a: number, b: number) =>
  clamp01((p - a) / (b - a));

export const easeInOut = (t: number) =>
  t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;

/** Smooth 0→1→0 pulse across [a, b, c, d]. */
const pulse = (p: number, a: number, b: number, c: number, d: number) =>
  easeInOut(span(p, a, b)) * (1 - easeInOut(span(p, c, d)));

/* ------------------------------------------------------------------ *
 * Derived signals. Each is 0–1 and each is read by more than one layer.
 * ------------------------------------------------------------------ */

/** Lid angle, 0 closed and 1 fully open. */
export const lidOpen = (p: number) =>
  easeInOut(span(p, CHAPTER.lidOpen, CHAPTER.lidDone));

/**
 * The one value every lighting layer is driven from: the emissive display, the
 * area-light rig, the volumetric haze, the desk response and the DOM bleed.
 *
 * Exactly zero while the lid is closed or the screen is off, and one from the
 * moment the machine has woken to the end of the hero. It does not come back
 * down: the display is the thing the rest of the story is looking at, so the
 * light it throws has to still be there when the story ends.
 */
export const screenPower = (p: number) =>
  easeInOut(span(p, CHAPTER.powerOn, CHAPTER.powerDone));

/**
 * Booklee's own startup identity on the display. Rises after the screen is
 * already lit — light first, then identity — and clears as the first website
 * arrives, so the panel is never showing both.
 */
export const startupIdentity = (p: number) =>
  pulse(p, CHAPTER.startup, CHAPTER.startupDone, WAKE.start, WAKE.end);

/** A restrained Booklee pastel tint, warmest during startup only. */
export const screenTint = (p: number) =>
  pulse(p, CHAPTER.startup, CHAPTER.startupDone, CHAPTER.focus, CHAPTER.focusDone);

/**
 * How present the inset website card is, 0–1.
 *
 * Drives the DOM card's opacity and the glow drawn behind it on the panel, so
 * the card and the light it appears to cast arrive together. It rises inside
 * the window the startup identity is leaving through, which is what makes the
 * two read as one screen changing rather than two things crossing over.
 */
export const deckOn = (p: number) => easeInOut(span(p, WAKE.start, WAKE.end));

/** Camera approach during "motion begins". */
export const cameraApproach = (p: number) =>
  easeInOut(span(p, CHAPTER.introOut, CHAPTER.motionDone));

/** Camera settling square onto the display's normal. */
export const cameraSettle = (p: number) =>
  easeInOut(span(p, CHAPTER.lidOpen, CHAPTER.startupDone));

/**
 * The camera's final approach: from the settled three-quarter view to the
 * framing the deck is read in.
 *
 * This is where the old `cameraEnter` used to fly the lens through the glass.
 * It now lands on a distance solved from the panel's own size and the viewport,
 * so the bezel is still in frame at the closest point on every aspect ratio.
 */
export const cameraFocus = (p: number) =>
  easeInOut(span(p, CHAPTER.focus, CHAPTER.focusDone));

/**
 * A last few per cent of push across the deck chapter.
 *
 * Small on purpose. The framing has to stay put while the websites change
 * inside it — the movement is there so the closing shot is not frozen, not so
 * it goes anywhere.
 */
export const cameraDrift = (p: number) =>
  easeInOut(span(p, CHAPTER.deckIn, CHAPTER.release));

/**
 * One slide's share of the deck chapter, in normalised progress.
 *
 * Divided by the number of slides rather than by a literal, so the sequence can
 * be lengthened in `@/content/deck` alone. It used to be a hard five, in three
 * separate places, which is the sort of thing that silently strands the last
 * slide off the end of the chapter.
 */
const DECK_STEP = (CHAPTER.deckDone - CHAPTER.deckIn) / DECK_COUNT;

/**
 * What share of a slide's slot its wipe occupies. The rest of the slot is the
 * slide at rest, which is when it is actually read — so this is the ratio that
 * has to hold as the deck grows, not the wipe's absolute length.
 */
export const DECK_WIPE_SHARE = 0.68;

/**
 * Half of a slide's wipe. The label changes when the incoming website is
 * halfway across rather than the moment its wipe begins, so the caption and the
 * thing it is captioning agree at every point a reader could stop and look.
 */
const DECK_WIPE_HALF = (DECK_STEP * DECK_WIPE_SHARE) / 2;

/**
 * Which website the deck is showing, as a continuous position along the deck.
 *
 * The scene reads the fractional value to cross-fade the accent it lights the
 * screen with; the caption reads `deckIndex`, which is this rounded down. Both
 * come from progress for the same reason everything else here does: the
 * scrubbed timeline animates the slides and these name them, and if the two
 * were tracked separately they would disagree. They did — the caption was
 * pinned to the first slide for the whole chapter, so a reader looking at the
 * portfolio site was told they were looking at the CRM.
 */
export const deckPosition = (p: number) => {
  const last = DECK_COUNT - 1;
  const at = (p - CHAPTER.deckIn - DECK_WIPE_HALF) / DECK_STEP;
  return at < 0 ? 0 : at > last ? last : at;
};

/** Which website the deck is showing, 0 to `DECK_COUNT - 1`. */
export const deckIndex = (p: number) => Math.floor(deckPosition(p));

/**
 * Navigation visibility.
 *
 * Hidden for the *entire* active animation — from the first meaningful laptop
 * motion until the hero has finished — not merely during the immersive deck.
 * Because it is a pure function of progress it reverses exactly: scrolling back
 * up from below re-enters at a progress below `release`, which hides the nav
 * again, and it only returns once the laptop is back at its resting state.
 */
export const navHidden = (p: number) =>
  p >= CHAPTER.introOut && p < CHAPTER.release;
