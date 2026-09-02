/**
 * Project categories.
 *
 * Everything here is a *concept* built by Booklee to demonstrate capability.
 * There are no real clients, results or metrics in this file, and none should
 * be added without written approval from the client in question.
 */

export type ProjectSlug = "crm" | "hrm" | "portfolio" | "travel" | "erp";

export type AccentToken = "lilac" | "blue" | "yellow" | "coral" | "mint";

export type StackChoice = {
  name: string;
  reason: string;
};

export type Capability = {
  title: string;
  body: string;
};

export type ProjectCategory = {
  slug: ProjectSlug;
  /** Two-digit editorial index, 01-05. */
  index: string;
  /** Short name used in the laptop screen label and rail. */
  shortName: string;
  /** Full name used for headings and navigation. */
  name: string;
  /** "Concept project" / "Demo build" - never a case study. */
  label: "Concept project" | "Demo build";
  accent: AccentToken;
  /** One sentence, outcome-shaped, used on the rail panel. */
  outcome: string;
  /** Compact capability tags. */
  tags: string[];
  /** Editorial lede for the projects index and detail hero. */
  lede: string;
  /** Alt text for the concept preview. */
  previewAlt: string;
  challenge: string[];
  experience: string[];
  capabilities: Capability[];
  stack: StackChoice[];
  /** Captions for the detail-page gallery crops of the same concept preview. */
  gallery: { caption: string; focus: "full" | "detail" | "compact" }[];
  tailoring: string;
  metaTitle: string;
  metaDescription: string;
};

export const projectCategories: ProjectCategory[] = [
  {
    slug: "crm",
    index: "01",
    shortName: "CRM",
    name: "CRM platform",
    label: "Concept project",
    accent: "lilac",
    outcome:
      "A sales workspace where the pipeline mirrors how the team already sells, instead of forcing a new vocabulary on them.",
    tags: ["Pipeline", "Contacts", "Reporting"],
    lede: "A customer platform shaped around one team's actual sales motion - its stages, its handoffs, its definition of a good week.",
    previewAlt:
      "Concept CRM interface showing a five-stage deal pipeline, a contact record and an activity feed in lilac and graphite.",
    challenge: [
      "Most sales teams outgrow a spreadsheet long before they are ready for a large CRM suite. The suite arrives with stages, scoring rules and required fields that belong to somebody else's business, and the team quietly keeps working in the spreadsheet anyway.",
      "The interesting problem is not storing deals. It is fitting the software to a sales motion that already works, so that recording the truth is faster than avoiding it.",
    ],
    experience: [
      "The pipeline is the home screen, and its stages carry the team's own names. Moving a deal is a drag or a single keystroke, and every move writes a timestamped note without anyone being asked to fill in a form.",
      "A contact record puts the last five interactions above the field list, because that is what someone reads before a call. Everything else - company, source, owner, custom fields - sits beneath it and stays out of the way.",
      "Reporting answers three questions the team asks weekly: what is likely to close, what has gone quiet, and where deals are stalling. Anything beyond that is exportable rather than embedded.",
    ],
    capabilities: [
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
        body: "Logging happens as a by-product of the work - moving a card, sending an email, completing a task - rather than as a separate chore.",
      },
      {
        title: "Forecast and stall reporting",
        body: "Weighted forecast, ageing report and a stalled-deal view, each exportable to CSV for the finance conversation.",
      },
      {
        title: "Roles and visibility",
        body: "Per-role field visibility so a wider team can use the system without exposing commercial terms to everyone.",
      },
      {
        title: "Integration surface",
        body: "Webhooks and a typed REST layer so the CRM can feed invoicing, support or a data warehouse later.",
      },
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
          "Caches the expensive aggregate views - forecast and ageing - so the dashboard stays instant without hammering the primary database.",
      },
      {
        name: "Background job runner",
        reason:
          "Email sync, deduplication and digest sending belong off the request path where a slow third-party API cannot block the interface.",
      },
    ],
    gallery: [
      { caption: "Pipeline overview with the team's own stage names", focus: "full" },
      { caption: "Deal detail - activity above fields", focus: "detail" },
      { caption: "Compact layout for phone check-ins between meetings", focus: "compact" },
    ],
    tailoring:
      "Stage names, required fields, scoring, permissions and the weekly digest are all configuration. The parts we would rebuild per client are the reports, because every team measures a good week differently.",
    metaTitle: "CRM platform concept",
    metaDescription:
      "A Booklee concept project: a CRM workspace built around an existing sales motion - configurable pipeline, contact records, activity capture and forecast reporting.",
  },
  {
    slug: "hrm",
    index: "02",
    shortName: "HRM",
    name: "HRM workspace",
    label: "Concept project",
    accent: "blue",
    outcome:
      "A people system that answers the three questions managers actually ask, without turning the team into a data-entry department.",
    tags: ["Attendance", "Leave", "People"],
    tailoring:
      "Leave policy, accrual rules, approval chains and the working week are configuration. Payroll is deliberately left to a specialist system and integrated rather than rebuilt.",
    lede: "An employee workspace that treats attendance and leave as everyday actions rather than paperwork, and gives managers a readable picture of the week.",
    previewAlt:
      "Concept HRM interface with an employee directory, a weekly attendance strip and pending leave requests in pastel blue.",
    challenge: [
      "Growing teams usually run people operations across a chat thread, a shared calendar and a spreadsheet of leave balances. Nothing is wrong until someone needs an answer - who is off next Thursday, how much leave is left, who has not been approved - and three sources disagree.",
      "The hard part is not the database. It is designing approvals that take seconds, so the system stays current instead of becoming another place where the truth goes stale.",
    ],
    experience: [
      "The directory leads with people, not records: photo or initials, role, team, and whether they are working today. Search is instant and forgiving of spelling.",
      "Attendance is a week strip rather than a punch clock. A manager reads the whole team's week at a glance, and corrections are a click with a reason attached.",
      "Requesting leave takes one screen and shows the remaining balance and any clash with teammates before submission. Approvals arrive where the approver already works, and a decision is a single action.",
    ],
    capabilities: [
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
        title: "Reporting for planning",
        body: "Headcount, absence patterns and upcoming coverage gaps - the numbers used for planning, not surveillance.",
      },
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
    gallery: [
      { caption: "People overview with today's working status", focus: "full" },
      { caption: "Weekly attendance strip and corrections", focus: "detail" },
      { caption: "Leave request on a phone, balance shown up front", focus: "compact" },
    ],
    metaTitle: "HRM workspace concept",
    metaDescription:
      "A Booklee concept project: an HRM workspace with an employee directory, weekly attendance, leave balances and fast approval chains.",
  },
  {
    slug: "portfolio",
    index: "03",
    shortName: "Portfolio",
    name: "Editorial portfolio",
    label: "Demo build",
    accent: "yellow",
    outcome:
      "A portfolio that reads like a printed issue, where the work is the layout rather than a grid of thumbnails.",
    tags: ["Editorial", "Art direction", "Performance"],
    tailoring:
      "Typography, grid and the rhythm of each case study are art-directed per client. The image pipeline, navigation and content model are the reusable parts.",
    lede: "A creative portfolio for people whose work is visual - art-directed, quiet, and fast enough that large imagery never feels like a cost.",
    previewAlt:
      "Concept editorial portfolio with an oversized headline, an indexed list of works and a large cropped image block on warm paper.",
    challenge: [
      "Photographers, designers and studios are usually offered the same template: a masonry grid, a lightbox and a contact form. It flattens very different bodies of work into one shape, and the person viewing it never gets a sense of pace.",
      "The challenge is to give each project its own composition without rebuilding the site every time, and to keep large imagery genuinely fast on a phone.",
    ],
    experience: [
      "The index is a list, not a grid - year, title, discipline - with a large preview that changes as you move through it. It reads like a contents page and sets an editorial tone before any image loads.",
      "Each project is a composed page. Full-bleed plates, half-column details, quiet type, and generous space between sections, so a viewer moves at the pace the work deserves.",
      "Motion is limited to masked headings and a shallow parallax on plates. Nothing moves while it is being read.",
    ],
    capabilities: [
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
        body: "A typographic index with keyboard navigation and a previous/next path through the work.",
      },
      {
        title: "Editorial typography",
        body: "A display and body pairing with real hierarchy - oversized statements against small precise metadata.",
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
    gallery: [
      { caption: "Index page with live preview", focus: "full" },
      { caption: "Case study plate and caption detail", focus: "detail" },
      { caption: "Phone layout - type first, plates full-bleed", focus: "compact" },
    ],
    metaTitle: "Editorial portfolio demo build",
    metaDescription:
      "A Booklee demo build: an art-directed portfolio with composed case studies, a typographic index and an image pipeline that keeps large photography fast.",
  },
  {
    slug: "travel",
    index: "04",
    shortName: "Travel",
    name: "Travel websites",
    label: "Concept project",
    accent: "coral",
    outcome:
      "A destination site that sells the trip through story and detail, then makes the enquiry the easiest thing on the page.",
    tags: ["Destinations", "Itineraries", "Enquiry"],
    tailoring:
      "Destination structure, itinerary format and the enquiry questions change per operator. The search, booking handoff and content model stay the same.",
    lede: "A travel and destination site built for operators who sell considered trips - long-form storytelling with a booking path that never gets lost.",
    previewAlt:
      "Concept travel website with a large destination hero, an itinerary summary and a row of trip cards in coral and sky tones.",
    challenge: [
      "Travel sites tend to split into two failures: a beautiful magazine with no way to book, or a booking engine with no reason to want the trip. Considered travel needs both in the same page.",
      "There is also a practical constraint. Trip content is heavy - photography, maps, day-by-day detail - and much of the audience is browsing on a phone on a slow connection.",
    ],
    experience: [
      "A destination opens with one strong image and one honest sentence about what the place is actually like, not a superlative. The detail that follows is specific: season, pace, terrain, what a day looks like.",
      "The itinerary is readable as a list and as a timeline. Each day carries an image, a short note and the practical facts - distance, stay, meals - so a reader can judge the trip rather than admire it.",
      "The enquiry sits at every natural decision point, pre-filled with the trip and dates being viewed, and it never becomes a modal that hides the page behind it.",
    ],
    capabilities: [
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
    gallery: [
      { caption: "Destination hero and orientation", focus: "full" },
      { caption: "Day-by-day itinerary detail", focus: "detail" },
      { caption: "Phone layout with a persistent enquiry path", focus: "compact" },
    ],
    metaTitle: "Travel website concept",
    metaDescription:
      "A Booklee concept project: a destination and itinerary website that pairs long-form travel storytelling with a booking path that stays visible.",
  },
  {
    slug: "erp",
    index: "05",
    shortName: "ERP",
    name: "ERP and operations",
    label: "Concept project",
    accent: "mint",
    outcome:
      "An operations layer that replaces the spreadsheet everyone actually runs the business on - one module at a time.",
    tags: ["Inventory", "Orders", "Reporting"],
    tailoring:
      "Modules are adopted one at a time and each maps to a process the business already has. Nothing is switched on because it came in the box.",
    lede: "An operations platform assembled from the modules a business genuinely runs on, delivered in an order that keeps the business working throughout.",
    previewAlt:
      "Concept ERP interface showing operations modules, an orders table, inventory levels and a reporting chart in mint and graphite.",
    challenge: [
      "ERP projects fail in a recognisable way: everything is specified at once, the rollout is a single event, and the business is asked to change its processes to match the software on a Monday morning.",
      "The alternative is unglamorous and works better - find the spreadsheet the business is actually run from, replace that one first, and keep going only where there is a real cost being paid.",
    ],
    experience: [
      "The home screen is a module board, not a dashboard of charts. It shows what needs attention today: orders to fulfil, stock below threshold, invoices overdue.",
      "Every list is dense on purpose. Operations staff are experts working at speed, so keyboard navigation, bulk actions and inline editing matter more than generous whitespace.",
      "Reporting is built for the three conversations that recur: what did we sell, what do we hold, and what is late. Everything else is an export.",
    ],
    capabilities: [
      {
        title: "Module architecture",
        body: "Orders, inventory, purchasing, invoicing and reporting as separable modules that can be adopted in any order.",
      },
      {
        title: "Inventory and stock movements",
        body: "Locations, thresholds, adjustments and a full movement history - an audit trail rather than a current-value field.",
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
        title: "Migration path",
        body: "Import tooling and a documented mapping from the existing spreadsheets, run in parallel until the numbers agree.",
      },
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
    gallery: [
      { caption: "Module board - what needs attention today", focus: "full" },
      { caption: "Orders table with inline editing", focus: "detail" },
      { caption: "Compact view for warehouse devices", focus: "compact" },
    ],
    metaTitle: "ERP and operations concept",
    metaDescription:
      "A Booklee concept project: a modular ERP and operations platform with inventory, order lifecycle, dense operational lists and a real migration path.",
  },
];

export const projectBySlug = (slug: string): ProjectCategory | undefined =>
  projectCategories.find((project) => project.slug === slug);
