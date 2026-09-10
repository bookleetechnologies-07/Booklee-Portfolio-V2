"use client";

import { heroViews } from "@/content/heroCanvas";
import { useHeroViewIndex } from "@/lib/heroV2State";
import { cn } from "@/lib/cn";

import styles from "./heroV2.module.css";

/**
 * Where the canvas is in its sequence.
 *
 * Four ticks and the current view's name, parked in the corner of the pinned
 * scene. It exists so that a reader who has been scrolling for four viewport
 * heights can tell how much of the hero is left — a pinned section with no
 * indication of its own length is the main reason people bail out of one.
 *
 * The index comes from the same normalised progress the timeline animates the
 * views with, via `useHeroViewIndex`, so the label cannot describe a view that
 * left the screen two beats ago. It re-renders four times across the whole
 * hero rather than on every scrubbed frame, because that store only publishes
 * at the boundaries.
 *
 * The stylesheet hides this entirely on the stacked path, where all four views
 * are on screen at once and there is no sequence to be partway through.
 */
export function HeroProgress() {
  const current = useHeroViewIndex();

  return (
    <div className={styles.progress} data-hero="progress">
      <p className={cn(styles.progressLabel, "eyebrow")} aria-live="polite">
        {heroViews[current].label}
      </p>
      <span className={styles.progressTicks} aria-hidden="true">
        {heroViews.map((view, index) => (
          <span
            key={view.id}
            className={cn(styles.tick, index <= current && styles.tickOn)}
          />
        ))}
      </span>
    </div>
  );
}
