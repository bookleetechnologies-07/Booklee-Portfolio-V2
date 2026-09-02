"use client";

import { useMediaQuery } from "@/hooks/useMediaQuery";

/**
 * Defaults to `true` on the server so the reduced-motion-safe branch is what
 * gets rendered into the HTML. Anything richer is opted into on the client,
 * once the preference is actually known.
 */
export function usePrefersReducedMotion(): boolean {
  return useMediaQuery("(prefers-reduced-motion: reduce)", true);
}
