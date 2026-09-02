"use client";

import { useMediaQuery } from "@/hooks/useMediaQuery";

export type MotionMode = "simple" | "cinematic";

const CINEMATIC = "(min-width: 768px) and (prefers-reduced-motion: no-preference)";

/**
 * "simple" is the server-rendered default, so the HTML always contains the
 * version that works without scroll choreography. Desktop visitors are upgraded
 * to "cinematic" as part of hydration rather than after a visible first paint.
 */
export function useMotionMode(): MotionMode {
  return useMediaQuery(CINEMATIC, false) ? "cinematic" : "simple";
}
