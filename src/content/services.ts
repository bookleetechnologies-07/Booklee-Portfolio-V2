import type { Route } from "next";

import type { AccentToken, StarterSlug } from "@/content/starter-websites";

export type Service = {
  slug: string;
  index: string;
  title: string;
  /** One line for the home grid tile. */
  summary: string;
  accent: AccentToken;
  /** The situation a client is usually in when they ask for this. */
  problem: string;
  /** What actually gets handed over. */
  deliverables: string[];
  /** What changes from client to client. */
  tailoring: string;
  /**
   * A real secondary destination for this service. Only Web Development has
   * one today — the starter websites entry point the brief asks for — and it
   * is typed as a route so a broken link fails the build rather than the page.
   */
  secondary?: { label: string; href: Route };
  /** Starter foundations that show this service in use. */
  related: StarterSlug[];
};

/**
 * Booklee's six offerings, in the order they are presented everywhere.
 *
 * Web Development leads, because it is the work most people arrive looking for
 * and it is the route into the starter websites. The optimisation copy
 * deliberately avoids promising rankings, views or follower growth — those are
 * not ours to guarantee, and a services page that implies otherwise is the
 * fastest way to start a project badly.
 */
export const services: Service[] = [
  {
    slug: "web-development",
    index: "01",
    title: "Web Development",
    summary:
      "Tailored websites that express the brand clearly and work properly across every screen.",
    accent: "yellow",
    problem:
      "The current site came from a theme. It loads slowly, says roughly what every competitor says, and editing it is unpleasant enough that it has not been touched in a year.",
    deliverables: [
      "Custom websites: portfolio, marketing, travel, e-commerce and content-led experiences",
      "Art direction and content structure for the pages that actually matter",
      "Responsive implementation with accessibility and performance treated as part of done",
      "Conversion-minded build: the path to enquiry or purchase designed, not assumed",
      "Per-page metadata, structured data, sitemap and share previews",
      "A content model the client can edit — or static content, if they would rather not",
    ],
    tailoring:
      "Scope follows how often the site changes. Rarely-edited sites stay static and cheap to host; frequently-edited ones get an editing workflow before they get a CMS.",
    secondary: {
      label: "Explore starter websites",
      href: "/services/starter-websites",
    },
    related: ["crm"],
  },
  {
    slug: "marketing",
    index: "02",
    title: "Marketing",
    summary:
      "Marketing shaped around the audience—whether you are growing a company, a product, or a creator-led brand.",
    accent: "lilac",
    problem:
      "There is something worth talking about, but the message changes depending on who is writing it and the channels are being fed rather than chosen. Effort goes out; very little comes back in a form you can read.",
    deliverables: [
      "Positioning and messaging that survives being said out loud by different people",
      "Campaign planning with a stated objective per campaign, not just a calendar",
      "Content direction — formats, cadence and tone, for company and creator-led brands alike",
      "Channel strategy: which platforms are worth your time, and which are not",
      "Audience growth work that is measured against something specific",
    ],
    tailoring:
      "A product business and a creator-led brand need different rhythms. What stays constant is that we agree what a campaign is for before it runs, and how we will know whether it worked.",
    related: [],
  },
  {
    slug: "seo-optimisation",
    index: "03",
    title: "SEO & Optimisation",
    summary:
      "Search, platform, content, and performance optimisation across websites, software, Instagram, and YouTube.",
    accent: "blue",
    problem:
      "The work is good and nobody is finding it. Pages are slow, titles were written once and never revisited, and the platform-specific fundamentals — the things each platform actually rewards — were never set up.",
    deliverables: [
      "Technical site audit: crawlability, structured data, metadata, internal linking, Core Web Vitals",
      "Content and keyword work grounded in what you can credibly rank for",
      "Discoverability and performance work inside software and web apps where it applies",
      "Instagram profile and content optimisation — structure, hooks, captions, alt text",
      "YouTube channel work: titles, thumbnails, descriptions, chapters and metadata hygiene",
    ],
    tailoring:
      "We optimise what is in our control and report on it honestly. We do not guarantee rankings, views or follower counts, and we will say so plainly rather than sell an outcome no one can promise.",
    related: [],
  },
  {
    slug: "mobile-app-development",
    index: "04",
    title: "Mobile App Development",
    summary:
      "Thoughtful Android and iOS products, designed around real users and built for maintainable growth.",
    accent: "mint",
    problem:
      "A mobile product is needed, and the decision has already been framed as a technology question — native or cross-platform — before anyone has agreed what the app is for or who opens it on a Tuesday morning.",
    deliverables: [
      "Product UX for the flows that carry the weight, designed for thumbs and interruptions",
      "Android application design and development",
      "iOS application design and development",
      "Cross-platform delivery where it is genuinely the sensible technical choice",
      "Integrations, testing and release support through to the stores",
    ],
    tailoring:
      "Native or cross-platform is a consequence of what the app has to do, not a starting position. We decide it with you, in the open, and explain the trade we are making.",
    related: ["crm", "hrm"],
  },
  {
    slug: "b2b-software-solutions",
    index: "05",
    title: "B2B Software Solutions",
    summary:
      "CRM, HRM, ERP, dashboards, and internal tools shaped around the way your business actually operates.",
    accent: "coral",
    problem:
      "Something important is held together by a spreadsheet, a chat thread and one person's memory. It works until that person is away, or until two copies of the file disagree.",
    deliverables: [
      "CRM, HRM and ERP systems built around your existing process rather than a vendor's",
      "Portals, dashboards and workflow tools for the people who use them all day",
      "API and third-party integrations, with retries, idempotency and visible failure states",
      "Roles, permissions and an audit trail proportional to what the data is worth",
      "Import tooling and a parallel-running migration, so nothing is switched over blind",
    ],
    tailoring:
      "Delivered one module at a time, starting with whichever process is costing the most today. The business keeps working throughout.",
    related: ["crm", "hrm", "erp"],
  },
  {
    slug: "product-strategy",
    index: "06",
    title: "Product Strategy",
    summary:
      "From first idea to a focused roadmap, we turn business needs into a product that is sensible to build.",
    accent: "lilac",
    problem:
      "There is a clear sense that something needs to change, and a long list of features that may or may not address it. Building the list is expensive and usually answers the wrong question.",
    deliverables: [
      "Product discovery: stakeholder and user conversations, written up rather than summarised into slides",
      "Feature definition and prioritisation, including what not to build",
      "User flows and a map of the current process, including the parts outside any software",
      "Scope and technical direction, with the assumptions each estimate depends on",
      "A delivery roadmap with an explicit first release and an explicit not-yet list",
    ],
    tailoring:
      "Depth scales with risk. A marketing site needs a short session; an operations platform that touches money needs weeks and a written process map.",
    related: ["erp", "crm"],
  },
];

export const processSteps = [
  {
    index: "01",
    title: "Discovery",
    body: "We learn how the business actually works — including the parts that live in spreadsheets and habits — and agree what the first release has to achieve.",
  },
  {
    index: "02",
    title: "Design",
    body: "Structure first, then interface. We design the flows that carry the most weight and build the system that keeps the rest consistent.",
  },
  {
    index: "03",
    title: "Build",
    body: "Delivered in working slices you can use and react to, with accessibility and performance treated as part of done rather than a later pass.",
  },
  {
    index: "04",
    title: "Improve",
    body: "We measure what happens, fix what the first version got wrong, and schedule the next thing worth doing. Nothing is abandoned at launch.",
  },
] as const;

export type ProcessStep = (typeof processSteps)[number];
