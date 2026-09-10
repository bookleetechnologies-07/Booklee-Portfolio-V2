"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { Component, useRef, type ReactNode } from "react";

import {
  OFFERED_SECTION_ID,
  PHRASE_DEST_ID,
  PHRASE_SRC_ID,
} from "@/components/home/phrase-handoff";
import { LaptopScene2D } from "@/components/home/LaptopScene2D";
import { ImmersiveDeck } from "@/components/hero/ImmersiveDeck";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Monogram } from "@/components/ui/Logo";
import { RevealText } from "@/components/ui/RevealText";
import { useHeroTimeline } from "@/hooks/useHeroTimeline";
import { useMotionMode } from "@/hooks/useMotionMode";
import { cn } from "@/lib/cn";

import styles from "./hero.module.css";

const LaptopScene3D = dynamic(() => import("./LaptopScene3D"), {
  ssr: false,
  loading: () => null,
});

const HEADLINE = "Websites and systems, built around your business.";
const SUPPORT =
  "We design expressive websites and practical tools that fit the way your team, brand and customers actually work.";

/**
 * One-off capability probe, memoised at module scope so it runs at most once
 * per page load and the throwaway context is released immediately. It is only
 * ever reached on the client, because the cinematic branch is false during
 * server rendering and on the first hydration pass.
 */
let webglSupport: boolean | null = null;

function supportsWebgl(): boolean {
  if (webglSupport !== null) return webglSupport;
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl2") ??
      (canvas.getContext("webgl") as WebGLRenderingContext | null);
    webglSupport = Boolean(gl);
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
  } catch {
    webglSupport = false;
  }
  return webglSupport;
}

/** If the WebGL scene throws for any reason, the 2.5D device takes over. */
class SceneBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

export function HeroStory() {
  const sectionRef = useRef<HTMLElement>(null);
  const overlayRef = useRef<HTMLSpanElement>(null);
  const mode = useMotionMode();
  const cinematic = mode === "cinematic";
  const webgl = cinematic && supportsWebgl();

  useHeroTimeline({
    sectionRef,
    enabled: cinematic,
    phraseSrcId: PHRASE_SRC_ID,
    phraseDestId: PHRASE_DEST_ID,
    receiverId: OFFERED_SECTION_ID,
    overlayRef,
  });

  const fallbackDevice = (
    <div
      className={cn(
        !cinematic && styles.compactStage,
        // Keeps the fallback device from filling a wide reduced-motion desktop.
        !cinematic && "mx-auto w-full max-w-[44rem]",
      )}
    >
      <LaptopScene2D open={!cinematic} className="!aspect-[1.6/1] !w-full">
        <StartupIdentity />
      </LaptopScene2D>
    </div>
  );

  return (
    <section
      ref={sectionRef}
      data-nav-theme="dark"
      aria-label="Booklee concept websites"
      className="relative"
    >
      <div data-hero="scene" className={cn(styles.scene, "on-dark grain grain-strong")}>
        <div data-hero="fog" className={cn(styles.fog, styles.fogA)} aria-hidden="true" />
        <div data-hero="fog" className={cn(styles.fog, styles.fogB)} aria-hidden="true" />
        <div data-hero="glow" className={styles.screenGlow} aria-hidden="true" />
        <div
          data-hero="glow-tight"
          className={styles.screenGlowTight}
          aria-hidden="true"
        />

        <div className={cn(styles.compactWrap, !cinematic && "shell")}>
          <div className={styles.intro} data-hero="intro">
            <div className={cn(cinematic && "shell w-full")}>
              <div className={cn(styles.introInner, cinematic && "grid-12 items-end gap-y-8")}>
                <div className="col-span-4 md:col-span-8 lg:col-span-7">
                  <Eyebrow className="text-fog">
                    Booklee — custom digital products
                  </Eyebrow>
                  <RevealText
                    as="h1"
                    immediate
                    className={cn(
                      "mt-6 text-bone",
                      cinematic ? "display-xl" : "display-lg",
                    )}
                    delay={0.15}
                  >
                    {HEADLINE}
                  </RevealText>
                </div>
                <div className="col-span-4 md:col-span-8 lg:col-span-4 lg:col-start-9">
                  <p
                    className={cn(
                      "lede text-fog/75",
                      // Only the two-column cinematic layout aligns the
                      // paragraph to the heading's baseline; stacked, it needs
                      // its own gap at every width.
                      cinematic ? "mt-5 lg:mt-0" : "mt-6",
                    )}
                  >
                    {SUPPORT}
                  </p>
                  <Link
                    href="/portfolio"
                    className="mt-7 inline-flex h-12 items-center gap-2 rounded-full bg-bone px-6 text-sm font-medium text-ink transition-transform duration-200 hover:-translate-y-0.5"
                  >
                    See our work
                    <span aria-hidden="true">&rarr;</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.stage} data-hero="stage">
            {cinematic && webgl ? (
              <SceneBoundary fallback={fallbackDevice}>
                <LaptopScene3D className={styles.canvas} />
              </SceneBoundary>
            ) : (
              fallbackDevice
            )}
          </div>

          <ImmersiveDeck swipeable={!cinematic} />
        </div>

        <div data-hero="vignette" className={styles.vignette} aria-hidden="true" />

        <p
          className={cn(styles.scrollHint, "eyebrow")}
          data-hero="hint"
          aria-hidden="true"
        >
          <span className={styles.scrollHintLine} />
          Scroll to begin
          <span className={styles.scrollHintLine} />
        </p>
      </div>

      {cinematic ? (
        <span
          ref={overlayRef}
          aria-hidden="true"
          className={cn(styles.phraseOverlay, "display-lg")}
        >
          Built around you.
        </span>
      ) : null}
    </section>
  );
}

/**
 * Booklee's own startup identity, shown on the fallback device's screen. The
 * WebGL path draws the same mark straight into the screen texture.
 */
function StartupIdentity() {
  return (
    <div className="absolute inset-0 grid place-items-center bg-[#050505]">
      <div className="flex flex-col items-center gap-[6%]">
        <Monogram className="h-auto w-[16%] min-w-10 text-bone" title="Booklee" />
        <span
          aria-hidden="true"
          className="block h-px w-16 bg-bone/40"
        />
      </div>
    </div>
  );
}
