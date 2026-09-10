"use client";

import { useSyncExternalStore } from "react";

import { viewIndex } from "@/lib/heroV2Chapters";

/**
 * Which view the floating canvas is showing.
 *
 * A tiny external store rather than React state, for the same reason the laptop
 * hero used one: the timeline writes on every scrubbed frame, and only the
 * progress rail's caption cares, and only at the four boundaries. Anything
 * subscribing to a state that changed sixty times a second would re-render the
 * whole hero for a label that changes four times.
 *
 * Note what is deliberately *not* here: a hero phase. The laptop hero published
 * one so `SiteHeader` could hide the navigation for the length of the
 * animation. This hero does not hide it — the bar stays visible and usable
 * throughout — so it publishes nothing the header reads, and the header's
 * `useHeroPhase()` simply stays on its `"intro"` default while this hero is
 * mounted. That is the whole of the header integration: an absence.
 */

let current = 0;
const listeners = new Set<() => void>();

/** Mirror of `viewIndex`, so the caption is derived rather than remembered. */
export function setHeroViewFromProgress(progress: number) {
  const next = viewIndex(progress);
  if (current === next) return;
  current = next;
  for (const listener of listeners) listener();
}

/** Reset when the hero unmounts, so a later mount does not inherit a view. */
export function resetHeroView() {
  setHeroViewFromProgress(0);
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const getSnapshot = () => current;
/** The server always renders the first view, which is the resting state. */
const getServerSnapshot = () => 0;

export function useHeroViewIndex(): number {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
