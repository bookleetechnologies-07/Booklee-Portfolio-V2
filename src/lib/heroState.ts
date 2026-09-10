"use client";

import { useSyncExternalStore } from "react";

import { deckIndex, navHidden } from "@/lib/heroChapters";

/**
 * The hero's phase, and the single source of truth for anything that has to
 * react to it — currently the floating navigation.
 *
 * Two channels on purpose:
 *
 * - `heroSignal` is a plain mutable object written by GSAP on every scrubbed
 *   frame and read inside the WebGL render loop. It never touches React, so
 *   scrubbing the hero causes zero re-renders.
 * - `heroState` is a tiny external store that only changes at discrete phase
 *   boundaries, which is what React subscribes to.
 */

export type HeroPhase =
  /** Resting intro: closed laptop, headline, navigation visible. */
  | "intro"
  /**
   * The whole active animation — camera approach, lid, power-on, startup,
   * camera entry and the immersive deck. The navigation is hidden and inert
   * for all of it.
   */
  | "active"
  /** Hero finished; the rest of the page behaves normally. */
  | "released";

/** Frame-rate data. Mutated in place; never a dependency of a render. */
export const heroSignal = {
  /** 0–1 across the pinned hero. */
  progress: 0,
  /** False once the hero is scrolled past, so the render loop can idle. */
  active: false,
  /** True while a WebGL hero is mounted and drawing. */
  webgl: false,
  /**
   * Requests exactly one WebGL frame. Installed by the scene when it mounts and
   * reset to a no-op when it leaves, so the timeline can call it unconditionally
   * whether or not a canvas exists.
   *
   * This exists because the canvas runs on `frameloop="demand"`, and the only
   * safe place to ask for the next frame is *outside* the render loop. Asking
   * from inside a `useFrame` is self-referential — it needs a frame to run in
   * order to request the following one — so a single missed frame stops the
   * scene permanently, which showed up as a laptop frozen shut halfway through
   * the story. Driving it from the scrubbed timeline instead means one frame is
   * drawn per scroll update and none at all when the page is still.
   */
  requestFrame: (() => {}) as () => void,
  /**
   * The element showing the website deck, which the WebGL scene transforms onto
   * the laptop's panel every frame.
   *
   * It is registered here rather than passed as a prop because the two live on
   * opposite sides of the canvas boundary — the deck is ordinary page DOM and
   * the scene is inside `<Canvas>` — and because the write is a per-frame
   * imperative one. Putting it on the frame-rate channel keeps it alongside
   * everything else the render loop touches without a React update, which is
   * the whole point of this object.
   */
  screenCard: null as HTMLElement | null,
};

let phase: HeroPhase = "intro";
const listeners = new Set<() => void>();

export function setHeroPhase(next: HeroPhase) {
  if (phase === next) return;
  phase = next;
  for (const listener of listeners) listener();
}

/**
 * Map scrubbed progress onto the discrete phase React subscribes to.
 *
 * Derived rather than remembered, so reverse scrolling is correct for free:
 * re-entering the hero from below lands on a progress inside the active range
 * and hides the navigation again, exactly as it did on the way down.
 */
export function setHeroPhaseFromProgress(progress: number) {
  setHeroPhase(
    navHidden(progress) ? "active" : progress > 0.5 ? "released" : "intro",
  );
}

/* ------------------------------------------------------------------ *
 * Which website the immersive deck is showing.
 *
 * A second tiny store rather than a field on the phase, because it changes on a
 * different cadence — five times inside one phase — and anything subscribing to
 * the phase should not re-render for it.
 * ------------------------------------------------------------------ */

let deck = 0;
const deckListeners = new Set<() => void>();

/** Mirror of `deckIndex`, so the caption is derived rather than remembered. */
export function setDeckFromProgress(progress: number) {
  const next = deckIndex(progress);
  if (deck === next) return;
  deck = next;
  for (const listener of deckListeners) listener();
}

function subscribeDeck(listener: () => void) {
  deckListeners.add(listener);
  return () => deckListeners.delete(listener);
}

const getDeckSnapshot = () => deck;
const getDeckServerSnapshot = () => 0;

/** 0–4. Only meaningful on the scrubbed path; the swipeable one owns its own. */
export function useDeckIndex(): number {
  return useSyncExternalStore(
    subscribeDeck,
    getDeckSnapshot,
    getDeckServerSnapshot,
  );
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const getSnapshot = () => phase;
/** The server always renders the intro state, which is the visible-nav case. */
const getServerSnapshot = (): HeroPhase => "intro";

export function useHeroPhase(): HeroPhase {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** Reset when the hero unmounts, so other routes never inherit "active". */
export function resetHeroPhase() {
  setHeroPhase("intro");
  setDeckFromProgress(0);
  heroSignal.progress = 0;
  heroSignal.active = false;
  heroSignal.webgl = false;
  heroSignal.requestFrame();
}
