import { portfolioEntries, type PortfolioEntry } from "@/content/portfolio";
import type { AccentToken } from "@/content/starter-websites";

/**
 * The seven interfaces in the hero's deck, in the order they are shown.
 *
 * Two kinds of thing sit in one sequence, and the distinction is real rather
 * than cosmetic. Five of them are Booklee's own concept interfaces — designs
 * this studio owns, rendered as live DOM, which is why they can be scaled onto
 * the laptop's panel and stay sharp. The other two are *live client sites*, and
 * they are not re-drawn here: they are the same archived captures the portfolio
 * page shows, pulled from `@/content/portfolio` so there is exactly one
 * description of each client's work in the codebase.
 *
 * The union is what keeps that honest. A slide cannot claim to be a rendered
 * concept and carry a client's capture at the same time, and adding a client
 * slide means naming an entry that already exists in the portfolio rather than
 * writing a new one here.
 *
 * This is presentation data for the hero only — nothing links out of it. The
 * three B2B foundations have their own pages under `/services/starter-websites`;
 * Portfolio and Travel exist here as demonstrations of range and deliberately
 * carry no destination, because inventing a case study behind them is exactly
 * what this file must not do.
 */

export type DeckSlug = "crm" | "hrm" | "portfolio" | "travel" | "erp";

type DeckCommon = {
  /** Two-digit editorial index shown on the deck label. */
  index: string;
  /** Short name used on the deck label and mobile controls. */
  shortName: string;
  /** Full name used for the slide's accessible label. */
  name: string;
  accent: AccentToken;
};

export type DeckSlide =
  | (DeckCommon & {
      kind: "concept";
      /** Which of the five designed previews to render. */
      slug: DeckSlug;
    })
  | (DeckCommon & {
      kind: "client";
      slug: string;
      /** The live site, taken whole from the portfolio. */
      entry: PortfolioEntry;
    });

/**
 * Look a client up by slug rather than by position, and fail loudly at build
 * time if it has gone. A silent `undefined` here would render an empty slide in
 * the middle of the hero, which is the kind of thing nobody notices until it is
 * in front of someone.
 */
function client(slug: string): PortfolioEntry {
  const entry = portfolioEntries.find((item) => item.slug === slug);
  if (!entry) {
    throw new Error(
      `Hero deck references the portfolio entry "${slug}", which does not exist.`,
    );
  }
  return entry;
}

/*
 * Order matters in two places.
 *
 * The two live sites sit *before* the ERP concept rather than after it, because
 * ERP is the finale: its footer carries the phrase the hero hands into the next
 * section's heading, and the handoff animates out of that text's real position
 * on screen. Appending the client sites after it would leave the phrase covered
 * by two later slides at the moment the handoff starts, so it would appear to
 * fly out of nothing.
 *
 * Accents are each client's own, from the portfolio, and are arranged so no two
 * neighbours share one — the screen's glow is tinted from this, so two
 * consecutive slides on the same accent would light the room identically and
 * lose a beat.
 */
export const deckSlides: DeckSlide[] = [
  {
    kind: "concept",
    slug: "crm",
    index: "01",
    shortName: "CRM",
    name: "CRM workspace",
    accent: "lilac",
  },
  {
    kind: "concept",
    slug: "hrm",
    index: "02",
    shortName: "HRM",
    name: "HRM workspace",
    accent: "blue",
  },
  {
    kind: "concept",
    slug: "portfolio",
    index: "03",
    shortName: "Portfolio",
    name: "Editorial portfolio",
    accent: "yellow",
  },
  {
    kind: "concept",
    slug: "travel",
    index: "04",
    shortName: "Travel",
    name: "Travel website",
    accent: "coral",
  },
  {
    kind: "client",
    slug: "womens-swimming-training-centre",
    entry: client("womens-swimming-training-centre"),
    index: "05",
    shortName: "Swimming",
    name: "Women's Swimming Training Centre — live client site",
    accent: "mint",
  },
  {
    kind: "client",
    slug: "placenet",
    entry: client("placenet"),
    index: "06",
    shortName: "PlaceNet",
    name: "PlaceNet — live client site",
    accent: "blue",
  },
  {
    kind: "concept",
    slug: "erp",
    index: "07",
    shortName: "ERP",
    name: "ERP and operations",
    accent: "mint",
  },
];

/**
 * How many slides the deck chapter has to be divided into.
 *
 * Exported so the hero's chapter arithmetic can read it without importing the
 * slides themselves. Every place that paces the deck — the wipe timings, the
 * caption's index, the accent the screen glows — derives from this one number,
 * so the sequence can grow or shrink in this file alone.
 */
export const DECK_COUNT = deckSlides.length;

/**
 * The accent tokens as literal colour, for the WebGL scene.
 *
 * Everywhere else in the app an accent is a CSS custom property and stays one.
 * The screen's emissive texture is drawn on a 2D canvas inside the render loop,
 * which has no cascade to read from and no frame to spare for
 * `getComputedStyle`, so it needs the value itself. These mirror `--color-*` in
 * `globals.css`; they are the same five pastels and must be kept in step with
 * them.
 */
export const DECK_ACCENT: Record<AccentToken, string> = {
  lilac: "#dcccf4",
  blue: "#bfd9f2",
  yellow: "#f4e98a",
  coral: "#f1b9a7",
  mint: "#cbefae",
};
