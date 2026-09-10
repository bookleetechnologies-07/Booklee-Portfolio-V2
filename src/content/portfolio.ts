/**
 * Client work.
 *
 * Everything in this file describes a real, live client website. Two rules
 * govern what may be written here:
 *
 * 1. No invented outcomes. No traffic figures, conversion lifts, rankings or
 *    revenue claims appear below, because none has been supplied or measured.
 * 2. No invented scope. Each `description` says what the site visibly *is*,
 *    not how much of it Booklee built. Where the division of work matters it
 *    has to come from the client, not from a guess made here.
 *
 * Preview media stays optional in the type even though every entry currently
 * has a capture, so that a fourth client can be added ahead of its screenshot
 * without the page rendering a broken image.
 *
 * The files in `public/portfolio/` are captures of each client's own live site,
 * taken at 1440x900 at 2x. They are the real sites rather than mock-ups, which
 * means they go out of date as the clients update them — `capturedOn` is shown
 * in the caption so that staleness is visible on the page instead of hidden.
 */

export type PortfolioPreview = {
  /** Archival PNG in `public/portfolio/`. next/image derives AVIF and WebP. */
  src: string;
  /** Intrinsic pixel dimensions. Required, so the card never shifts on load. */
  width: number;
  height: number;
  /** Describes the screenshot itself, for anyone who cannot see it. */
  alt: string;
  /** ISO date the screenshot was captured, so staleness is visible. */
  capturedOn: string;
};

export type PortfolioEntry = {
  slug: string;
  /** Two-digit editorial index. */
  index: string;
  /** The client's own name, spelled the way they spell it. */
  client: string;
  /** Verified category. */
  category: string;
  /** Optional longer descriptor shown beneath the category. */
  descriptor?: string;
  /** What the site is. Never what it achieved. */
  description: string;
  /** Live destination. */
  url: string;
  /** Hostname shown as the visible link text. */
  displayUrl: string;
  accent: "lilac" | "blue" | "yellow" | "coral" | "mint";
  /** Null until an approved capture is supplied. */
  preview: PortfolioPreview | null;
};

export const portfolioEntries: PortfolioEntry[] = [
  {
    slug: "placenet",
    index: "01",
    client: "PlaceNet",
    category: "Travel / Study Abroad",
    descriptor: "Travel Agency & Global Education",
    description:
      "A travel and global-education site, where the study-abroad journey and the travel side of the business sit in one place. The structure has to carry two quite different intents — someone researching a course abroad and someone planning the trip around it — without either one burying the other.",
    url: "https://placenet.in/",
    displayUrl: "placenet.in",
    accent: "blue",
    preview: {
      src: "/portfolio/portfolio-placenet.png",
      width: 2880,
      height: 1800,
      alt: "The PlaceNet home page: a dark blue study-abroad site headed “We don’t just send you abroad. We prepare you to thrive there.”, with a student carrying a laptop beside the heading and British Council and New Zealand Education accreditations along the bottom.",
      capturedOn: "2026-09-03",
    },
  },
  {
    slug: "mark-daniel-saddlery",
    index: "02",
    client: "Mark Daniel Saddlery",
    category: "Editorial Portfolio",
    description:
      "An editorial portfolio for a saddlery, built around imagery and craft rather than a product grid. The work is the layout: large plates, quiet type, and enough space between pieces that each one is looked at rather than scrolled past.",
    url: "https://markdanielsaddlery.com/",
    displayUrl: "markdanielsaddlery.com",
    accent: "yellow",
    preview: {
      src: "/portfolio/portfolio-mark-daniel-saddlery.png",
      width: 2880,
      height: 1800,
      alt: "The Mark Daniel Saddlery home page: a full-bleed black and white photograph of a rider lying back along a horse, with “Crafted for the ride” set over it above the shop’s name and a Shop now button.",
      capturedOn: "2026-09-03",
    },
  },
  {
    slug: "womens-swimming-training-centre",
    index: "03",
    client: "Women's Swimming Training Centre",
    category: "E-commerce & Program Booking",
    description:
      "A programme and booking experience for a women's swimming training centre. The centre of the site is the programme list — what is running, who it suits and how to join it — so the path from reading about a programme to booking a place stays short.",
    url: "https://womensswimmingpool.com/programs",
    displayUrl: "womensswimmingpool.com",
    accent: "mint",
    preview: {
      src: "/portfolio/portfolio-womens-swimming.png",
      width: 2880,
      height: 1800,
      alt: "The Women’s Swimming Training Centre programmes page: a pale blue layout headed “Swimming programs” above three programme cards — junior water safety and basics, senior swimmers, and an exclusive ladies swim program — each listing the ages it suits, how long it runs and what it covers.",
      capturedOn: "2026-09-03",
    },
  },
  {
    slug: "anis-boutique",
    index: "04",
    client: "Anis Boutique",
    category: "E-commerce",
    /*
     * TODO_CONTENT: replace with a description of what this store actually
     * sells and how it is organised, once that has been confirmed with the
     * client. The line below deliberately says only what the category already
     * says and what the address proves — nothing about the catalogue, the
     * scope of Booklee's work or the results has been supplied, and none of it
     * is going to be guessed at here.
     */
    description:
      "An online store for the boutique, live at anisboutique.in.",
    url: "https://www.anisboutique.in/index.html",
    displayUrl: "anisboutique.in",
    accent: "lilac",
    preview: {
      src: "/portfolio/portfolio-anis-boutique.png",
      width: 2880,
      height: 1800,
      alt: "The Anis Boutique home page: a full-bleed photograph of the shop’s interior, its shelves stacked floor to ceiling with bolts of coloured fabric, and a worktop of thread spools, beading and gold scissors in the foreground. “Anis Boutique” is set across the middle above the lines “all in one shop for all your designing needs” and “linings, blouses, satin, net, stitching items, aari materials”, with a search field above and an Explore button below.",
      capturedOn: "2026-09-10",
    },
  },
];

/** True once at least one approved capture has been supplied. */
export const hasPortfolioMedia = portfolioEntries.some(
  (entry) => entry.preview !== null,
);
