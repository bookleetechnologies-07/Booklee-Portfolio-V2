import Image from "next/image";

import { PreviewMark } from "@/components/previews/PreviewFrame";
import {
  HERO_CLIENTS,
  HERO_LANDING,
  HERO_LANDING_INDEX,
  HERO_PROCESS,
  HERO_STARTERS,
  heroViews,
  type HeroViewId,
} from "@/content/heroCanvas";
import { cn } from "@/lib/cn";

import styles from "./heroV2.module.css";

/**
 * What the floating canvas shows: four views of what Booklee builds.
 *
 * These are designed pages rendered as real DOM, not screenshots. Every
 * measurement inside them is in `em`, and the canvas sets `font-size: 1cqw`, so
 * 1em is exactly 1% of the canvas's width — the same technique the concept
 * previews in `@/components/previews` are built on. One set of numbers
 * therefore serves a 1120px pinned canvas on a desktop and a 340px card on a
 * phone, staying sharp at both, with no resize observer and no bitmap.
 *
 * The one exception is the client work, which is deliberately *not* redrawn:
 * those are archived captures of real sites that belong to the clients, served
 * through `next/image` from the same files the portfolio page uses.
 *
 * Nothing in here is decorative filler. Every name, tag, category and stage is
 * read from a content file, so a starter renamed or a client removed elsewhere
 * changes here too, and this component can never quietly become the place where
 * an out-of-date claim survives.
 */

/** The nav Booklee's own site actually has, minus the home link. */
const LANDING_NAV = ["About", "Services", "Portfolio", "Book a call"];

function LandingView() {
  return (
    <div className={cn(styles.canvasInner, styles.landing)}>
      <div className={styles.landingNav}>
        <span className={styles.landingBrand}>
          <PreviewMark />
        </span>
        {LANDING_NAV.map((item) => (
          <span key={item} className={item === "About" ? undefined : styles.dense}>
            {item}
          </span>
        ))}
      </div>

      <div className={styles.landingSplit}>
        <div className={styles.landingBody}>
          <p className={styles.viewEyebrow}>Web studio</p>
          <p className={styles.viewHeadline}>{heroViews[0].headline}</p>
          <p className={cn(styles.viewSupport, styles.dense)}>
            {HERO_LANDING.support}
          </p>
          <span className={styles.landingCta}>
            {HERO_LANDING.cta}
            <span aria-hidden="true">&rarr;</span>
          </span>
        </div>

        {/* Real engagements, not filler: the right-hand column exists to
            balance a wide canvas, so what fills it has to be true. */}
        <div className={cn(styles.landingIndex, styles.dense)}>
          {HERO_LANDING_INDEX.map((item) => (
            <span key={item.title} className={styles.landingIndexRow}>
              <span className={styles.landingIndexNum}>{item.index}</span>
              {item.title}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function StartersView() {
  return (
    <div className={cn(styles.canvasInner, styles.starters)}>
      <div className={styles.viewIntro}>
        <p className={styles.viewEyebrow}>Starter systems</p>
        <p className={styles.viewHeadline}>{heroViews[1].headline}</p>
      </div>

      <div className={styles.starterGrid}>
        {HERO_STARTERS.map((starter) => (
          <div
            key={starter.shortName}
            className={styles.starterCard}
            /*
             * The accent is a token everywhere else in the app and stays one
             * here: the card reads `--accent-*` off the cascade rather than
             * carrying a literal colour, so the five pastels are still defined
             * in exactly one place.
             */
            style={
              {
                "--starter-accent": `var(--accent-${starter.accent})`,
              } as React.CSSProperties
            }
          >
            <span className={styles.starterIndex}>{starter.index}</span>
            <span className={styles.starterName}>{starter.shortName}</span>
            <span className={styles.starterAccent} aria-hidden="true" />
            <span className={cn(styles.starterTags, styles.dense)}>
              {starter.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ClientsView() {
  return (
    <div className={cn(styles.canvasInner, styles.clients)}>
      <div className={styles.viewIntro}>
        <p className={styles.viewEyebrow}>Selected work</p>
        <p className={styles.viewHeadline}>{heroViews[2].headline}</p>
      </div>

      <div className={styles.clientGrid}>
        {HERO_CLIENTS.map((entry) => (
          <div key={entry.slug} className={styles.clientCard}>
            <div className={styles.clientPlate}>
              {entry.preview ? (
                <Image
                  src={entry.preview.src}
                  alt=""
                  fill
                  /*
                   * Each plate is a third of the canvas, and the canvas is at
                   * most 1120px, so a third of that is the largest useful
                   * source — never the viewport's width.
                   */
                  sizes="(min-width: 768px) 380px, 40vw"
                  className="object-cover object-top"
                />
              ) : null}
            </div>
            <div className={styles.clientMeta}>
              <span className={styles.clientName}>{entry.client}</span>
              <span className={cn(styles.clientCategory, styles.dense)}>
                {entry.category}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProcessView() {
  return (
    <div className={cn(styles.canvasInner, styles.process)}>
      <div className={styles.viewIntro}>
        <p className={styles.viewEyebrow}>How we work</p>
        <p className={styles.viewHeadline}>{heroViews[3].headline}</p>
      </div>

      <div className={styles.processRow}>
        {HERO_PROCESS.map((stage) => (
          <div key={stage.step} className={styles.processStep}>
            <span className={styles.processIndex}>{stage.step}</span>
            <span className={styles.processName}>{stage.name}</span>
            <span className={cn(styles.processNote, styles.dense)}>
              {stage.note}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

const VIEW_BODY: Record<HeroViewId, () => React.JSX.Element> = {
  landing: LandingView,
  starters: StartersView,
  portfolio: ClientsView,
  process: ProcessView,
};

/**
 * One view inside the canvas.
 *
 * The heading block above the drawing is real text, and it is the only copy in
 * the hero that changes between the two layouts: on the stacked path it is what
 * a reader actually reads, because the drawing beneath it is a thumbnail; on
 * the cinematic path the drawing is a metre wide and the progress rail names it
 * instead, so the stylesheet takes this block out of the layout entirely.
 *
 * Either way the view's own headline exists as text in the document, which is
 * what keeps the hero's meaning independent of whether the animation ran.
 */
export function PreviewSlide({ id }: { id: HeroViewId }) {
  const view = heroViews.find((candidate) => candidate.id === id);
  if (!view) throw new Error(`Unknown hero view "${id}".`);

  const Body = VIEW_BODY[id];

  return (
    <div data-hero="view" className={styles.view}>
      <div className={styles.viewHead}>
        <p className={cn(styles.viewHeadMeta, "eyebrow")}>
          <span className="tabular-nums">{view.index}</span>
          <span>{view.label}</span>
          <span className={styles.viewHeadPath}>{view.path}</span>
        </p>
        <h3 className="display-sm text-bone">{view.headline}</h3>
      </div>

      <div className={styles.canvas} role="img" aria-label={view.summary}>
        <Body />
      </div>
    </div>
  );
}
