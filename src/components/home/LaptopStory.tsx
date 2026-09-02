"use client";

import Link from "next/link";
import { useRef } from "react";

import { LaptopScene2D, laptopStyles as styles } from "@/components/home/LaptopScene2D";
import { ScreenPreviewCarousel } from "@/components/home/ScreenPreviewCarousel";
import { ConceptPreview } from "@/components/previews";
import { previewStyles } from "@/components/previews/PreviewFrame";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Monogram } from "@/components/ui/Logo";
import { RevealText } from "@/components/ui/RevealText";
import { projectCategories } from "@/content/projects";
import { useLaptopTimeline } from "@/hooks/useLaptopTimeline";
import { useMotionMode } from "@/hooks/useMotionMode";
import { cn } from "@/lib/cn";

import {
  OFFERED_SECTION_ID,
  PHRASE_DEST_ID,
  PHRASE_SRC_ID,
} from "./phrase-handoff";

const HEADLINE = "Websites and systems, built around your business.";
const SUPPORT =
  "We design expressive websites and practical tools that fit the way your team, brand and customers actually work.";

export function LaptopStory() {
  const sectionRef = useRef<HTMLElement>(null);
  const overlayRef = useRef<HTMLSpanElement>(null);
  const mode = useMotionMode();
  const cinematic = mode === "cinematic";

  useLaptopTimeline({
    sectionRef,
    enabled: cinematic,
    phraseSrcId: PHRASE_SRC_ID,
    phraseDestId: PHRASE_DEST_ID,
    receiverId: OFFERED_SECTION_ID,
    overlayRef,
  });

  return (
    <section
      ref={sectionRef}
      data-nav-theme="dark"
      aria-label="Booklee concept websites"
      className="relative"
    >
      <div
        data-laptop="scene"
        className={cn(
          styles.scene,
          "on-dark grain grain-strong",
          !cinematic && "h-auto min-h-0 py-0",
        )}
      >
        <div
          data-laptop="fog"
          className={cn(styles.fog, styles.fogA)}
          aria-hidden="true"
        />
        <div
          data-laptop="fog"
          className={cn(styles.fog, styles.fogB)}
          aria-hidden="true"
        />
        <div data-laptop="recede" className={styles.desk} aria-hidden="true" />

        {cinematic ? <CinematicStage /> : <CompactStage />}

        <div
          data-laptop="recede"
          className={styles.vignette}
          aria-hidden="true"
        />
      </div>

      {/*
        Fixed, outside the pinned scene, and inert to pointers. It carries a
        single copy of the phrase during the handoff; the ERP screen copy and
        the destination heading are both hidden while it is on screen.
      */}
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

/** Desktop and tablet: pinned, scrubbed, five screens. */
function CinematicStage() {
  return (
    <>
      <div className={styles.stage}>
        <LaptopScene2D>
          <div className={styles.screenIdle} data-laptop="idle">
            <Monogram className={styles.screenIdleMark} />
          </div>
          {projectCategories.map((project) => (
            <div
              key={project.slug}
              data-laptop="slide"
              className={styles.slide}
            >
              <ConceptPreview
                slug={project.slug}
                className={previewStyles.fill}
                phraseId={project.slug === "erp" ? PHRASE_SRC_ID : undefined}
              />
            </div>
          ))}
        </LaptopScene2D>
      </div>

      <div className={styles.labels} aria-hidden="true">
        <div className="shell relative h-full">
          {projectCategories.map((project) => (
            <p
              key={project.slug}
              data-laptop="label"
              className={cn(styles.label, "eyebrow")}
            >
              <span className="tabular-nums">{project.index}</span>
              <span className={styles.labelRule} />
              <span>{project.shortName}</span>
            </p>
          ))}
        </div>
      </div>

      <div className={styles.intro} data-laptop="intro">
        <div className="shell w-full">
          <div className={cn(styles.introInner, "grid-12 items-end gap-y-8")}>
            <div className="col-span-4 md:col-span-8 lg:col-span-7">
              <Eyebrow className="text-fog">
                Booklee — custom digital products
              </Eyebrow>
              <RevealText
                as="h1"
                immediate
                className="display-xl mt-6 text-bone"
                delay={0.15}
              >
                {HEADLINE}
              </RevealText>
            </div>
            <div className="col-span-4 md:col-span-8 lg:col-span-4 lg:col-start-9">
              <p className="lede text-fog/75">{SUPPORT}</p>
              <Link
                href="/projects"
                className="mt-7 inline-flex h-12 items-center gap-2 rounded-full bg-bone px-6 text-sm font-medium text-ink transition-transform duration-200 hover:-translate-y-0.5"
              >
                See what we build
                <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <p
        className={cn(styles.scrollHint, "eyebrow")}
        data-laptop="hint"
        aria-hidden="true"
      >
        <span className={styles.scrollHintLine} />
        Scroll to open
        <span className={styles.scrollHintLine} />
      </p>
    </>
  );
}

/** Small screens and reduced motion: open laptop, then a manual carousel. */
function CompactStage() {
  return (
    <div className="shell relative z-10 flex flex-col gap-10 py-[calc(var(--header-h)+3rem)] pb-16">
      <div>
        <Eyebrow className="text-fog">Booklee — custom digital products</Eyebrow>
        <h1 className="display-lg mt-5 text-bone">{HEADLINE}</h1>
        <p className="lede mt-5 text-fog/75">{SUPPORT}</p>
        <Link
          href="/projects"
          className="mt-7 inline-flex h-12 items-center gap-2 rounded-full bg-bone px-6 text-sm font-medium text-ink"
        >
          See what we build
          <span aria-hidden="true">&rarr;</span>
        </Link>
      </div>

      <div className={styles.compactStage}>
        <ScreenPreviewCarousel
          frame={(viewport) => (
            /* The deck overflows the lid box, so the carousel controls need
               clearance beneath it. */
            <LaptopScene2D
              open
              className="!mb-[15%] !aspect-[1.6/1] !w-full"
            >
              {viewport}
            </LaptopScene2D>
          )}
        />
      </div>
    </div>
  );
}
