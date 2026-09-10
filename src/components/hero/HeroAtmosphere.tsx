import { cn } from "@/lib/cn";

import styles from "./heroV2.module.css";

/**
 * The dark void the website canvas floats in.
 *
 * Five composited layers and nothing else: two slow radial hazes, a masked
 * point grid, a screen-blended bloom that stands in for the light the canvas
 * throws, and a vignette that closes the corners. No canvas, no particle
 * system, no `filter`.
 *
 * That restraint is the point rather than a compromise. The reference animation
 * reaches for a whole WebGL context to draw sixty additive points and eight
 * lines behind its stage; at the sizes this hero is actually looked at, four
 * gradients read as more depth than the points did, cost one composited layer
 * each, and leave the frame rate to the one object that is meant to move.
 *
 * Everything is `aria-hidden` and pointer-transparent — it is weather, not
 * content. The elements carry `data-hero` handles because the timeline animates
 * them by attribute selector rather than by imported class name, which keeps
 * the choreography readable next to the chapter it belongs to.
 */
export function HeroAtmosphere() {
  return (
    <div className={styles.atmosphere} aria-hidden="true">
      <div data-hero="haze" className={cn(styles.haze, styles.hazeA)} />
      <div data-hero="haze" className={cn(styles.haze, styles.hazeB)} />
      <div data-hero="grid" className={styles.grid} />
      <div data-hero="bloom" className={styles.bloom} />
      <div className={styles.vignette} />
    </div>
  );
}
