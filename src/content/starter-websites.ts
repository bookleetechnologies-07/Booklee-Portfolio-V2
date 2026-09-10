/**
 * Starter websites — CRM, HRM, Editorial portfolio, Travel and ERP.
 *
 * These are customizable foundations, not fixed themes and not completed client
 * products. Every page built from this file has to read as "a practical
 * starting point, adapted to your workflow" rather than as a case study, so
 * there are no client names, no metrics and no outcomes anywhere below.
 *
 * The portfolio and travel foundations were written for an earlier version of
 * this site and are restored here rather than reinvented: their challenge,
 * experience, stack and tailoring copy is the original. Only the fields this
 * type gained afterwards — who each one is for, what gets customized, and what
 * it commonly connects to — are new, and they follow the same rule as the rest
 * of the file.
 */

export type StarterSlug = "crm" | "hrm" | "portfolio" | "travel" | "erp";

export type AccentToken = "lilac" | "blue" | "yellow" | "coral" | "mint";

export type Capability = {
  title: string;
  body: string;
};

export type StackChoice = {
  name: string;
  reason: string;
};

export type StarterWebsite = {
  slug: StarterSlug;
  /** Two-digit editorial index, 01–05. */
  index: string;
  /** Short name used in rails, labels and breadcrumbs. */
  shortName: string;
  /** Full name used for headings and navigation. */
  name: string;
  accent: AccentToken;
  /** One sentence for the rail panel and index card. */
  outcome: string;
  /** Compact capability tags. */
  tags: string[];
  /** Editorial lede for the index and the detail hero. */
  lede: string;
  /** Alt text for the responsive preview. */
  previewAlt: string;
  /** Who this foundation is for. */
  audience: string[];
  /** The situation that usually leads a business here. */
  challenge: string[];
  /** How the interface behaves out of the box. */
  experience: string[];
  /** What is already built and working on day one. */
  baseline: Capability[];
  /** What Booklee changes for a specific business. */
  customization: Capability[];
  /** Systems this commonly connects to. Possibilities, never promises. */
  integrations: string[];
  stack: StackChoice[];
  /** The one-line framing the brief asks every starter to carry. */
  tailoring: string;
  metaTitle: string;
  metaDescription: string;
};

/** Shared framing, used on the index and repeated on each detail page. */
export const STARTER_PROMISE =
  "A practical starting point, adapted to your workflow, users, integrations, and growth stage.";

export const starterWebsites: StarterWebsite[] = [
  {
    slug: "crm",
    index: "01",
    shortName: "CRM",
    name: "CRM starter",
    accent: "lilac",
    outcome:
      "A sales workspace that adopts the pipeline your team already sells with, instead of imposing a new vocabulary on them.",
    tags: ["Pipeline", "Contacts", "Reporting"],
    lede: "A customer platform that starts complete and is then shaped around one team's actual sales motion — its stages, its handoffs, its definition of a good week.",
    previewAlt:
      "CRM starter interface showing a five-stage deal pipeline, a contact record and an activity feed in lilac and graphite.",
    audience: [
      "Teams that have outgrown a shared spreadsheet but do not want a large vendor suite",
      "Sales operations where the stages already have names everyone uses",
      "Businesses that need reporting their finance conversation can actually rely on",
    ],
    challenge: [
      "Most sales teams outgrow a spreadsheet long before they are ready for a large CRM suite. The suite arrives with stages, scoring rules and required fields that belong to somebody else's business, and the team quietly keeps working in the spreadsheet anyway.",
      "The interesting problem is not storing deals. It is fitting the software to a sales motion that already works, so that recording the truth is faster than avoiding it.",
    ],
    experience: [
      "The pipeline is the home screen, and its stages carry the team's own names. Moving a deal is a drag or a single keystroke, and every move writes a timestamped note without anyone being asked to fill in a form.",
      "A contact record puts the last five interactions above the field list, because that is what someone reads before a call. Everything else — company, source, owner, custom fields — sits beneath it and stays out of the way.",
      "Reporting answers three questions the team asks weekly: what is likely to close, what has gone quiet, and where deals are stalling. Anything beyond that is exportable rather than embedded.",
    ],
    baseline: [
      {
        title: "Configurable pipeline",
        body: "Stages, required fields and win criteria are data, not code. Changing the sales process does not require a release.",
      },
      {
        title: "Contact and company records",
        body: "Deduplicated records with a merge flow, ownership history and an activity timeline assembled from email, calls and notes.",
      },
      {
        title: "Activity capture",
        body: "Logging happens as a by-product of the work — moving a card, sending an email, completing a task — rather than as a separate chore.",
      },
      {
        title: "Forecast and stall reporting",
        body: "Weighted forecast, ageing report and a stalled-deal view, each exportable to CSV for the finance conversation.",
      },
      {
        title: "Roles and visibility",
        body: "Per-role field visibility, so a wider team can use the system without exposing commercial terms to everyone.",
      },
      {
        title: "Typed integration surface",
        body: "Webhooks and a typed REST layer, so the CRM can feed invoicing, support or a data warehouse later.",
      },
    ],
    customization: [
      {
        title: "Your stages, your language",
        body: "Stage names, win criteria and required fields are set to match how the team already talks about a deal, before anyone is asked to use the system.",
      },
      {
        title: "The reports you actually run",
        body: "Every team measures a good week differently. The reporting views are the part we expect to build specifically for you rather than configure.",
      },
      {
        title: "Permission shape",
        body: "Who sees commercial terms, who can reassign an owner, and what a wider team is allowed to read, mapped to your actual roles.",
      },
      {
        title: "Data migration",
        body: "Import tooling written against your existing spreadsheet or system, run in parallel until both sides agree.",
      },
    ],
    integrations: [
      "Email and calendar (Google Workspace, Microsoft 365)",
      "Invoicing and accounting systems",
      "Support desks and shared inboxes",
      "Data warehouses and BI tools",
      "Webhooks into anything with an HTTP endpoint",
    ],
    stack: [
      {
        name: "Next.js + TypeScript",
        reason:
          "Server-rendered lists stay fast as record counts grow, and a shared type layer keeps the pipeline schema honest between client and server.",
      },
      {
        name: "PostgreSQL + Prisma",
        reason:
          "Relational data with real constraints. Deals, contacts and activities need referential integrity far more than they need schema flexibility.",
      },
      {
        name: "Redis",
        reason:
          "Caches the expensive aggregate views — forecast and ageing — so the dashboard stays instant without hammering the primary database.",
      },
      {
        name: "Background job runner",
        reason:
          "Email sync, deduplication and digest sending belong off the request path, where a slow third-party API cannot block the interface.",
      },
    ],
    tailoring:
      "Stage names, required fields, scoring, permissions and the weekly digest are all configuration. The reports are the part we expect to build for you, because every team measures a good week differently.",
    metaTitle: "CRM starter website",
    metaDescription:
      "A Booklee starter website: a CRM workspace with a configurable pipeline, contact records, activity capture and forecast reporting — adapted to your sales motion.",
  },
  {
    slug: "hrm",
    index: "02",
    shortName: "HRM",
    name: "HRM starter",
    accent: "blue",
    outcome:
      "A people system that answers the three questions managers actually ask, without turning the team into a data-entry department.",
    tags: ["Attendance", "Leave", "People"],
    lede: "An employee workspace that treats attendance and leave as everyday actions rather than paperwork, and gives managers a readable picture of the week.",
    previewAlt:
      "HRM starter interface with an employee directory, a weekly attendance strip and pending leave requests in pastel blue.",
    audience: [
      "Growing teams running people operations across a calendar, a chat thread and a spreadsheet",
      "Managers who need to know who is off next Thursday without asking three people",
      "Businesses with location-specific holidays or part-time working patterns",
    ],
    challenge: [
      "Growing teams usually run people operations across a chat thread, a shared calendar and a spreadsheet of leave balances. Nothing is wrong until someone needs an answer — who is off next Thursday, how much leave is left, who has not been approved — and three sources disagree.",
      "The hard part is not the database. It is designing approvals that take seconds, so the system stays current instead of becoming another place where the truth goes stale.",
    ],
    experience: [
      "The directory leads with people, not records: photo or initials, role, team, and whether they are working today. Search is instant and forgiving of spelling.",
      "Attendance is a week strip rather than a punch clock. A manager reads the whole team's week at a glance, and corrections are a click with a reason attached.",
      "Requesting leave takes one screen and shows the remaining balance and any clash with teammates before submission. Approvals arrive where the approver already works, and a decision is a single action.",
    ],
    baseline: [
      {
        title: "Employee directory",
        body: "Profiles, teams, reporting lines and start dates, with a clean archive path for people who leave.",
      },
      {
        title: "Attendance and working patterns",
        body: "Configurable working weeks, part-time patterns, holidays by location, and corrections with an audit trail.",
      },
      {
        title: "Leave and balances",
        body: "Accrual rules, carry-over, clash detection against the team calendar, and a balance that is always visible before requesting.",
      },
      {
        title: "Approval chains",
        body: "Per-team approvers with delegation for absence, so nothing sits waiting on one person's inbox.",
      },
      {
        title: "Documents and onboarding",
        body: "Checklists and document storage per employee, with expiry reminders for anything that needs renewing.",
      },
      {
        title: "Planning reports",
        body: "Headcount, absence patterns and upcoming coverage gaps — the numbers used for planning, not for surveillance.",
      },
    ],
    customization: [
      {
        title: "Your leave policy",
        body: "Accrual, carry-over caps, notice periods and the working week are set to your policy rather than to a default someone else wrote.",
      },
      {
        title: "Approval routing",
        body: "Who approves what, how delegation works when they are away, and what happens when a request is left unanswered.",
      },
      {
        title: "Location and holiday calendars",
        body: "Public holidays and working patterns per office or per country, so a distributed team is not forced onto one calendar.",
      },
      {
        title: "Payroll handoff",
        body: "Payroll stays with a specialist system. We build the export or integration that feeds it, rather than rebuilding it here.",
      },
    ],
    integrations: [
      "Payroll providers",
      "Google Workspace and Microsoft 365 calendars",
      "Slack or Teams for approvals and reminders",
      "Identity providers for single sign-on",
      "Document storage",
    ],
    stack: [
      {
        name: "Next.js + TypeScript",
        reason:
          "Role-aware server rendering keeps sensitive employee data on the server and out of client bundles by default.",
      },
      {
        name: "PostgreSQL",
        reason:
          "Leave balances are an accounting problem. Transactions and constraints prevent the double-approval class of bug outright.",
      },
      {
        name: "Auth with per-role scoping",
        reason:
          "Managers, HR and employees see genuinely different data. Scoping belongs in one audited layer rather than in each screen.",
      },
      {
        name: "Scheduled jobs",
        reason:
          "Accrual, carry-over and reminders run on a schedule with an idempotency key, so a retry never grants leave twice.",
      },
    ],
    tailoring:
      "Leave policy, accrual rules, approval chains and the working week are configuration. Payroll is deliberately left to a specialist system and integrated rather than rebuilt.",
    metaTitle: "HRM starter website",
    metaDescription:
      "A Booklee starter website: an HRM workspace with an employee directory, weekly attendance, leave balances and fast approval chains — adapted to your policy.",
  },
  {
    slug: "portfolio",
    index: "03",
    shortName: "Portfolio",
    name: "Editorial portfolio",
    accent: "yellow",
    outcome:
      "A portfolio that reads like a printed issue, where the work is the layout rather than a grid of thumbnails.",
    tags: ["Editorial", "Art direction", "Performance"],
    lede: "A creative portfolio for people whose work is visual — art-directed, quiet, and fast enough that large imagery never feels like a cost.",
    previewAlt:
      "Editorial portfolio starter interface with an oversized headline, an indexed list of works and a large cropped image block on warm paper.",
    audience: [
      "Photographers, designers and studios whose work is judged on how it is presented",
      "Practices with a small number of substantial projects rather than a long catalogue",
      "Anyone who has been offered the same masonry grid three times and wants a considered alternative",
    ],
    challenge: [
      "Photographers, designers and studios are usually offered the same template: a masonry grid, a lightbox and a contact form. It flattens very different bodies of work into one shape, and the person viewing it never gets a sense of pace.",
      "The challenge is to give each project its own composition without rebuilding the site every time, and to keep large imagery genuinely fast on a phone.",
    ],
    experience: [
      "The index is a list, not a grid — year, title, discipline — with a large preview that changes as you move through it. It reads like a contents page and sets an editorial tone before any image loads.",
      "Each project is a composed page. Full-bleed plates, half-column details, quiet type, and generous space between sections, so a viewer moves at the pace the work deserves.",
      "Motion is limited to masked headings and a shallow parallax on plates. Nothing moves while it is being read.",
    ],
    baseline: [
      {
        title: "Art-directed case studies",
        body: "A small set of composed layout blocks that can be arranged per project, instead of one repeating template.",
      },
      {
        title: "Image pipeline",
        body: "Responsive AVIF and WebP with reserved dimensions and priority only on the first plate, so nothing shifts and nothing over-downloads.",
      },
      {
        title: "Indexed navigation",
        body: "A typographic index with keyboard navigation and a previous and next path through the work.",
      },
      {
        title: "Editorial typography",
        body: "A display and body pairing with real hierarchy — oversized statements against small precise metadata.",
      },
      {
        title: "Enquiry flow",
        body: "A short enquiry form that asks about scope and timing, routed to email without a backend to maintain.",
      },
      {
        title: "Content editing",
        body: "Structured content files, or a CMS once there is a genuine editing workflow to justify one.",
      },
    ],
    customization: [
      {
        title: "Typography and grid",
        body: "The type pairing, scale and column rhythm are art-directed for your work rather than picked from the foundation. This is the part that makes it yours.",
      },
      {
        title: "The shape of a case study",
        body: "Which layout blocks exist, and the order a project is allowed to use them in, set against the work you actually have.",
      },
      {
        title: "Index behaviour",
        body: "What the list shows and how it is ordered — by year, discipline or client — and what the preview does as someone moves through it.",
      },
      {
        title: "Editing workflow",
        body: "Content stays in the repository until there is a real reason to add a CMS. When there is, we add one you will actually use.",
      },
    ],
    integrations: [
      "A headless CMS, once there is an editing workflow to justify one",
      "Email and enquiry routing",
      "Image hosting and delivery networks",
      "Analytics without third-party tracking scripts",
      "Print and PDF export of a case study",
    ],
    stack: [
      {
        name: "Next.js static rendering",
        reason:
          "A portfolio changes rarely and is read often. Fully static pages give the fastest possible first paint and cost almost nothing to host.",
      },
      {
        name: "next/image with AVIF",
        reason:
          "Photography is the payload. Modern formats and correct sizing usually cut image weight by more than half with no visible loss.",
      },
      {
        name: "GSAP",
        reason:
          "Masked heading reveals and a shallow parallax, scoped per section, with a complete reduced-motion path.",
      },
      {
        name: "Structured content files",
        reason:
          "Typed content in the repository until the client actually wants to edit without a developer. A CMS added too early is a cost with no reader.",
      },
    ],
    tailoring:
      "Typography, grid and the rhythm of each case study are art-directed per client. The image pipeline, navigation and content model are the reusable parts.",
    metaTitle: "Editorial portfolio starter website",
    metaDescription:
      "A Booklee starter website: an art-directed portfolio with composed case studies, a typographic index and an image pipeline that keeps large photography fast.",
  },
  {
    slug: "travel",
    index: "04",
    shortName: "Travel",
    name: "Travel starter",
    accent: "coral",
    outcome:
      "A destination site that sells the trip through story and detail, then makes the enquiry the easiest thing on the page.",
    tags: ["Destinations", "Itineraries", "Enquiry"],
    lede: "A travel and destination site built for operators who sell considered trips — long-form storytelling with a booking path that never gets lost.",
    previewAlt:
      "Travel starter interface with a large destination hero, an itinerary summary and a row of trip cards in coral and sky tones.",
    audience: [
      "Operators selling considered trips rather than high-volume package holidays",
      "Businesses whose enquiries arrive by email and are currently retyped somewhere else",
      "Teams whose audience browses on a phone, often on a slow connection",
    ],
    challenge: [
      "Travel sites tend to split into two failures: a beautiful magazine with no way to book, or a booking engine with no reason to want the trip. Considered travel needs both in the same page.",
      "There is also a practical constraint. Trip content is heavy — photography, maps, day-by-day detail — and much of the audience is browsing on a phone on a slow connection.",
    ],
    experience: [
      "A destination opens with one strong image and one honest sentence about what the place is actually like, not a superlative. The detail that follows is specific: season, pace, terrain, what a day looks like.",
      "The itinerary is readable as a list and as a timeline. Each day carries an image, a short note and the practical facts — distance, stay, meals — so a reader can judge the trip rather than admire it.",
      "The enquiry sits at every natural decision point, pre-filled with the trip and dates being viewed, and it never becomes a modal that hides the page behind it.",
    ],
    baseline: [
      {
        title: "Destination and trip content",
        body: "A structured model for destinations, trips, departures and day-by-day itineraries that stays editable by non-developers.",
      },
      {
        title: "Search and filtering",
        body: "Server-rendered filtering by region, month, duration and pace, so every filtered view is a real, shareable, crawlable URL.",
      },
      {
        title: "Itinerary rendering",
        body: "Day cards with images, distances and stays, printable to PDF for travellers who want something offline.",
      },
      {
        title: "Enquiry and booking handoff",
        body: "Context-aware enquiry forms, with a clean handoff to an existing booking or CRM system rather than a parallel one.",
      },
      {
        title: "Media performance",
        body: "Aggressive responsive imagery and staged loading, tested on a throttled connection rather than an office network.",
      },
      {
        title: "Search visibility",
        body: "Per-destination metadata, structured data and a sitemap, because most of this audience arrives from search.",
      },
    ],
    customization: [
      {
        title: "How a trip is described",
        body: "Which facts a day card carries — distance, stay, meals, grading — set to what your travellers actually ask before they commit.",
      },
      {
        title: "Enquiry questions",
        body: "What the form asks, and what it pre-fills from the trip being viewed, so the first reply can be useful rather than a request for details.",
      },
      {
        title: "Departures and pricing",
        body: "Whether departures are fixed, seasonal or on request, and how pricing is shown, mapped to how you really sell.",
      },
      {
        title: "Where the enquiry lands",
        body: "Routed into the inbox or system your team already works in. Building a second inbox nobody checks is the common failure here.",
      },
    ],
    integrations: [
      "Existing booking and reservation systems",
      "CRM systems and shared inboxes",
      "Payment providers, for deposits",
      "Mapping and route services",
      "Email marketing platforms",
    ],
    stack: [
      {
        name: "Next.js with incremental rendering",
        reason:
          "Destination pages are static until pricing or departures change, then regenerate. Fast for readers, current for the operator.",
      },
      {
        name: "PostgreSQL",
        reason:
          "Departures, availability and pricing are relational and time-bound. This is exactly the data a relational database is good at.",
      },
      {
        name: "next/image + AVIF",
        reason:
          "Photography carries the sale. Correct sizing is the single biggest performance win available on a travel site.",
      },
      {
        name: "Email + CRM handoff",
        reason:
          "Enquiries go where the operator already works. Building a second inbox nobody checks is the common failure here.",
      },
    ],
    tailoring:
      "Destination structure, itinerary format and the enquiry questions change per operator. The search, booking handoff and content model stay the same.",
    metaTitle: "Travel starter website",
    metaDescription:
      "A Booklee starter website: a destination and itinerary site that pairs long-form travel storytelling with a booking path that stays visible.",
  },
  {
    slug: "erp",
    index: "05",
    shortName: "ERP",
    name: "ERP starter",
    accent: "mint",
    outcome:
      "An operations layer that replaces the spreadsheet the business actually runs on — one module at a time.",
    tags: ["Inventory", "Orders", "Reporting"],
    lede: "An operations platform assembled from the modules a business genuinely runs on, adopted in an order that keeps the business working throughout.",
    previewAlt:
      "ERP starter interface showing operations modules, an orders table, inventory levels and a reporting chart in mint and graphite.",
    audience: [
      "Businesses holding stock, fulfilling orders and reconciling both against money",
      "Operations teams whose real system of record is a spreadsheet nobody wants to touch",
      "Companies that need to replace one process at a time rather than all at once",
    ],
    challenge: [
      "ERP projects fail in a recognisable way: everything is specified at once, the rollout is a single event, and the business is asked to change its processes to match the software on a Monday morning.",
      "The alternative is unglamorous and works better — find the spreadsheet the business is actually run from, replace that one first, and keep going only where there is a real cost being paid.",
    ],
    experience: [
      "The home screen is a module board, not a dashboard of charts. It shows what needs attention today: orders to fulfil, stock below threshold, invoices overdue.",
      "Every list is dense on purpose. Operations staff are experts working at speed, so keyboard navigation, bulk actions and inline editing matter more than generous whitespace.",
      "Reporting is built for the three conversations that recur: what did we sell, what do we hold, and what is late. Everything else is an export.",
    ],
    baseline: [
      {
        title: "Module architecture",
        body: "Orders, inventory, purchasing, invoicing and reporting as separable modules that can be adopted in any order.",
      },
      {
        title: "Inventory and stock movements",
        body: "Locations, thresholds, adjustments and a full movement history — an audit trail rather than a current-value field.",
      },
      {
        title: "Order lifecycle",
        body: "Quote to fulfilment to invoice, with a state machine that makes invalid transitions impossible instead of merely discouraged.",
      },
      {
        title: "Dense operational lists",
        body: "Virtualised tables, keyboard navigation, saved views and bulk actions, designed for people who use it all day.",
      },
      {
        title: "Roles and audit",
        body: "Per-module permissions and a complete audit log, because operations data is eventually reconciled against money.",
      },
      {
        title: "Migration tooling",
        body: "Import tooling and a documented mapping from the existing spreadsheets, run in parallel until the numbers agree.",
      },
    ],
    customization: [
      {
        title: "Adoption order",
        body: "We start with whichever process is costing the most today, and only continue where there is a real cost being paid.",
      },
      {
        title: "Your order states",
        body: "The state machine is built around the transitions your operation actually has, including the awkward ones nobody documents.",
      },
      {
        title: "Stock model",
        body: "Locations, units, batch or serial tracking and threshold rules set to how the business really holds inventory.",
      },
      {
        title: "Document templates",
        body: "Invoices, picking lists and purchase orders in your format, with the fields your suppliers and customers expect.",
      },
    ],
    integrations: [
      "Accounting systems",
      "Shipping and fulfilment providers",
      "E-commerce storefronts",
      "Supplier and purchasing portals",
      "Barcode and warehouse scanning hardware",
    ],
    stack: [
      {
        name: "Next.js + TypeScript",
        reason:
          "Server components keep large operational tables off the client bundle, and shared types stop the schema drifting between screens.",
      },
      {
        name: "PostgreSQL",
        reason:
          "Stock and money need transactions, constraints and a real audit trail. This is not a place for eventual consistency.",
      },
      {
        name: "Background workers",
        reason:
          "Imports, reconciliations and document generation run out of band with retries, so a slow report never blocks fulfilment.",
      },
      {
        name: "Docker",
        reason:
          "Predictable environments matter when a system is reconciled against money. The same image runs in staging and production.",
      },
    ],
    tailoring:
      "Modules are adopted one at a time and each maps to a process the business already has. Nothing is switched on because it came in the box.",
    metaTitle: "ERP starter website",
    metaDescription:
      "A Booklee starter website: a modular ERP and operations platform with inventory, order lifecycle, dense operational lists and a real migration path.",
  },
];

export const starterBySlug = (slug: string): StarterWebsite | undefined =>
  starterWebsites.find((starter) => starter.slug === slug);
