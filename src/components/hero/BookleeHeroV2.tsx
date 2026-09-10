"use client";

import Link from "next/link";
import { useRef } from "react";

import { FloatingSiteFrame } from "@/components/hero/FloatingSiteFrame";
import { HeroAtmosphere } from "@/components/hero/HeroAtmosphere";
import { HeroProgress } from "@/components/hero/HeroProgress";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { RevealText } from "@/components/ui/RevealText";
import {
  HERO_CTAS,
  HERO_EYEBROW,
  HERO_HANDOFF,
  HERO_HEADLINE,
  HERO_SUPPORT,
  HERO_SUPPORT_LINES,
} from "@/content/heroCanvas";
import { useHeroV2Timeline } from "@/hooks/useHeroV2Timeline";
import { useMotionMode } from "@/hooks/useMotionMode";
import { cn } from "@/lib/cn";

import styles from "./heroV2.module.css";

/**
 * The Booklee hero: a living website canvas in a dark room.
 *
 * A single floating site preview stands in a black void and, as the page is
 * scrolled, comes forward, straightens out of its perspective, and navigates
 * through four views of what this studio actually builds — a business site, the
 * five starter systems, live client work, and the shape of an engagement. Then
 * it settles and gives the page over to the section beneath it.
 *
 * Three things about it are worth knowing before changing it.
 *
 * **It is not a device.** There is no laptop, no bezel and no hardware. The
 * previous hero modelled one in WebGL and projected the websites onto its
 * panel; those files are still on disk and still work, but nothing imports them
 * any more. A frame with a browser chrome needs no modelling to be convincing,
 * costs no GLB and no shader, and puts the reader's whole attention on the page
 * inside it rather than on the object around it.
 *
 * **It never hides the navigation.** The laptop hero published a phase that
 * made the floating header retract and go inert for the length of the
 * animation. This one publishes nothing the header reads, so the bar stays
 * visible and usable for every frame; and the two calls to action are a
 * separate layer from the headline, so they survive the headline fading out. A
 * scroll-driven hero that removes every way out of itself is a trap, however
 * good it looks.
 *
 * **There are two layouts, and the stylesheet chooses.** Below 768px, or under
 * `prefers-reduced-motion`, none of the choreography exists: the hero is a
 * headline, two links and four readable cards in ordinary document flow. That
 * branch is what the server renders and what a cold load paints, and the
 * cinematic branch is opted into during hydration — which is why the media
 * queries in `heroV2.module.css` have to stay identical to the one
 * `useMotionMode` tests.
 */
export function BookleeHeroV2() {
  const sectionRef = useRef<HTMLElement>(null);
  const mode = useMotionMode();
  const cinematic = mode === "cinematic";

  useHeroV2Timeline({ sectionRef, enabled: cinematic });

  return (
    <section
      ref={sectionRef}
      data-nav-theme="dark"
      aria-label="What Booklee builds"
      className="relative"
    >
      <div data-hero="scene" className={cn(styles.scene, "on-dark grain")}>
        <HeroAtmosphere />

        {/*
          None of the classes below are chosen by `cinematic`, and that is
          load-bearing rather than tidiness. `useMotionMode` is a media query
          read through `useSyncExternalStore`, and its server snapshot is
          `false` — so the prerendered HTML always carries the stacked branch,
          the browser paints that first even on a desktop whose stylesheet has
          already gone cinematic, and the swap only lands on the re-render after
          hydration. Anything switched here is therefore guaranteed to be wrong
          in the first painted frame. `shell` is inert in the cinematic branch
          because `.layout` is `display: contents` there, and the three
          differences it used to hide now live in media queries in
          `heroV2.module.css`.
        */}
        <div className={cn(styles.layout, "shell")}>
          <div data-hero="copy" className={styles.copy}>
            <div className={styles.copyShell}>
              <div className={styles.copyInner}>
                <Eyebrow className="text-fog">{HERO_EYEBROW}</Eyebrow>
                <RevealText
                  as="h1"
                  immediate
                  delay={0.15}
                  className={cn(
                    "mt-6 text-balance text-bone uppercase display-lg",
                    styles.headline,
                  )}
                >
                  {HERO_HEADLINE}
                </RevealText>
                {/*
                  Set as three lines rather than left to wrap, so the clause
                  breaks are chosen rather than decided by the column width —
                  and so no line reaches across into the resting canvas. The
                  sentence itself is still one sentence: the spans are display
                  blocks inside a single paragraph, and `HERO_SUPPORT` is the
                  same text joined back up for anything that needs it whole.
                */}
                <p
                  className="lede mt-6 max-w-none text-fog/75"
                  aria-label={HERO_SUPPORT}
                >
                  {HERO_SUPPORT_LINES.map((line) => (
                    <span key={line} className={styles.supportLine}>
                      {line}
                    </span>
                  ))}
                </p>
              </div>
            </div>
          </div>

          {/*
            A sibling of the copy, not a child of it. The stylesheet parks this
            row at the foot of the cinematic scene and the timeline never
            touches it, which is what keeps both destinations clickable for the
            entire hero rather than only its first ten per cent.
          */}
          <div className={styles.ctaRow} data-hero="cta">
            <Link href={HERO_CTAS[0].href} className={styles.ctaPrimary}>
              {HERO_CTAS[0].label}
              <span aria-hidden="true">&rarr;</span>
            </Link>
            <Link href={HERO_CTAS[1].href} className={styles.ctaSecondary}>
              {HERO_CTAS[1].label}
              <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>

          <FloatingSiteFrame parallax={cinematic} />
        </div>

        <HeroProgress />

        <p
          data-hero="handoff"
          className={cn(styles.handoff, "eyebrow")}
          aria-hidden="true"
        >
          {HERO_HANDOFF}
        </p>
      </div>
    </section>
  );
}
