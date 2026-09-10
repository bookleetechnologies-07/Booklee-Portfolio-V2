/**
 * The hero's living website canvas — what the floating frame shows, in order.
 *
 * Four views, each one a different answer to "what does Booklee actually
 * build". Nothing here is invented: the starter systems come from
 * `@/content/starter-websites`, the client work from `@/content/portfolio`, and
 * every `path` is a route that genuinely exists in this app. The frame's
 * address bar shows those paths, so a reader who follows one gets the page they
 * were shown.
 *
 * On the five starter systems, and the missing sixth
 * -------------------------------------------------
 * The hero brief asked the systems view to read "CRM, HRM, ERP, E-commerce,
 * Portfolio". Booklee has five starter systems and none of them is an
 * e-commerce foundation — the set is CRM, HRM, Editorial portfolio, Travel and
 * ERP, each with a real page under `/services/starter-websites`. A card here
 * for a sixth would advertise a product that does not exist and would link
 * nowhere, which is the one thing `@/content/starter-websites` forbids. The
 * view therefore shows the five that are real, read straight out of that file
 * so it can never drift from the pages behind it.
 *
 * (Booklee has shipped e-commerce work — two of the portfolio's four clients
 * are e-commerce sites — but a delivered client project and a productised
 * starter system are different claims, and only the second belongs on a card
 * that says "starter system".)
 */

import type { Route } from "next";

import { portfolioEntries, type PortfolioEntry } from "@/content/portfolio";
import { services } from "@/content/services";
import { starterWebsites } from "@/content/starter-websites";

export type HeroViewId = "landing" | "starters" | "portfolio" | "process";

export type HeroView = {
  id: HeroViewId;
  /** Two-digit editorial index shown on the progress rail. */
  index: string;
  /** Short name used on the progress rail and the mobile view headers. */
  label: string;
  /** The real route this view is a preview of. Shown in the frame's address bar. */
  path: string;
  /** The view's own headline, set inside the frame. */
  headline: string;
  /** Accessible description of what the view shows, for the frame's label. */
  summary: string;
};

export const heroViews: HeroView[] = [
  {
    id: "landing",
    index: "01",
    label: "Business site",
    path: "/",
    headline: "Websites that make businesses look ready.",
    summary:
      "A business website landing page: headline, supporting copy and a call to action over a dark editorial layout.",
  },
  {
    id: "starters",
    index: "02",
    label: "Starter systems",
    path: "/services/starter-websites",
    headline: "Starter systems for real operations.",
    summary:
      "Booklee's five starter systems — CRM, HRM, editorial portfolio, travel and ERP — as a row of cards.",
  },
  {
    id: "portfolio",
    index: "03",
    label: "Client work",
    path: "/portfolio",
    headline: "Portfolio-grade client pages.",
    summary:
      "Three live client websites Booklee has built, shown as archived captures with their categories.",
  },
  {
    id: "process",
    index: "04",
    label: "How we work",
    path: "/services",
    headline: "From brief to launch.",
    summary:
      "The five stages of a Booklee engagement: brief, structure, design, build and deploy.",
  },
];

export const HERO_VIEW_COUNT = heroViews.length;

/**
 * The landing view's own copy.
 *
 * Deliberately the *supporting* line rather than the page's outer headline, so
 * the frame is not simply repeating in miniature what is already set beside it.
 */
export const HERO_LANDING = {
  support:
    "Sharp, fast, conversion-focused sites for brands that need credibility from day one.",
  cta: "Explore work",
} as const;

/**
 * The index that balances the landing view's right-hand side.
 *
 * Four of Booklee's six real engagements, numbered, read out of
 * `@/content/services`. It exists because the landing view is a wide canvas
 * with a left-weighted composition and needed something on the other side of
 * it — but the something had to be true, so it is the service list rather than
 * a decorative panel of invented labels.
 */
export const HERO_LANDING_INDEX = services.slice(0, 4).map((service, i) => ({
  index: String(i + 1).padStart(2, "0"),
  title: service.title,
}));

/**
 * The five starter systems, reduced to what a card at this size can carry.
 *
 * Mapped from the real records rather than retyped, so a starter renamed in
 * `@/content/starter-websites` is renamed here too.
 */
export const HERO_STARTERS = starterWebsites.map((starter) => ({
  index: starter.index,
  shortName: starter.shortName,
  accent: starter.accent,
  /** Three capability tags, already written for exactly this kind of surface. */
  tags: starter.tags,
}));

/**
 * The client work shown in the portfolio view.
 *
 * Only entries with an approved capture. A client without one is not
 * substituted for, padded around or represented by a placeholder plate here —
 * the view simply shows fewer, which is the honest outcome and also the one
 * that cannot render a broken image inside a pinned hero.
 */
export const HERO_CLIENTS: PortfolioEntry[] = portfolioEntries
  .filter((entry) => entry.preview !== null)
  .slice(0, 3);

/**
 * The stages of an engagement.
 *
 * Descriptors say what happens in each stage and nothing about how long it
 * takes or what it produces for a given client, because neither has been
 * supplied. `@/content/services` describes the same engagement at greater
 * length; this is the five-beat version the frame has room for.
 */
export const HERO_PROCESS = [
  { step: "01", name: "Brief", note: "What the business needs to do" },
  { step: "02", name: "Structure", note: "Pages, flows and hierarchy" },
  { step: "03", name: "Design", note: "Type, colour and composition" },
  { step: "04", name: "Build", note: "Next.js, typed and tested" },
  { step: "05", name: "Deploy", note: "Live, measured and handed over" },
] as const;

/* ------------------------------------------------------------------ *
 * The copy set around the frame, rather than inside it.
 * ------------------------------------------------------------------ */

export const HERO_EYEBROW = "Booklee — web studio";

export const HERO_HEADLINE =
  "Websites for businesses that need to look ready.";

/**
 * The supporting sentence, written as the three lines it is set on.
 *
 * The break points are a design decision, not a wrapping accident: left to
 * wrap, "starter systems," ended up sharing a line with the clause before it
 * and the line ran into the resting canvas beside it. Breaking after each
 * clause keeps the block inside its column and reads better besides.
 *
 * `HERO_SUPPORT` is joined from these rather than written out again, so the
 * sentence and the lines it is set on cannot drift apart.
 */
export const HERO_SUPPORT_LINES = [
  "Booklee builds polished web experiences,",
  "starter systems,",
  "and portfolio-grade business sites.",
] as const;

export const HERO_SUPPORT = HERO_SUPPORT_LINES.join(" ");

export const HERO_CTAS: ReadonlyArray<{ label: string; href: Route }> = [
  { label: "Explore starter websites", href: "/services/starter-websites" },
  { label: "View portfolio", href: "/portfolio" },
];

/** The signpost the closing shot leaves the reader on. */
export const HERO_HANDOFF = "Next — starter websites";
