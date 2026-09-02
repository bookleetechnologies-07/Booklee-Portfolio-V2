"use client";

import { gsap } from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

/**
 * Single registration point. Importing plugins from more than one module leads
 * to duplicate registration warnings and, worse, to timelines that silently do
 * nothing because a plugin was not registered on that import path.
 *
 * Flip is deliberately absent. The phrase handoff on the home page uses a
 * measured fixed overlay instead, because Flip's tween-based model does not
 * scrub cleanly backwards and forwards under a ScrollTrigger. Shipping the
 * plugin unused would be ~30KB of dead weight in the entry bundle.
 */
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, SplitText);
}

export { gsap, ScrollTrigger, ScrollToPlugin, SplitText };
