import type { AccentToken, ProjectSlug } from "@/content/projects";

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
  /** Concept projects that show this service in use. */
  related: ProjectSlug[];
};

export const services: Service[] = [
  {
    slug: "discovery-product-strategy",
    index: "01",
    title: "Discovery & Product Strategy",
    summary:
      "Work out what should be built, in what order, before anyone writes code.",
    accent: "lilac",
    problem:
      "There is a clear sense that something needs to change, and a long list of features that may or may not address it. Building the list is expensive and usually answers the wrong question.",
    deliverables: [
      "Stakeholder and user conversations, written up rather than summarised into slides",
      "A map of the current workflow, including the parts that happen outside any software",
      "A prioritised scope with an explicit first release and an explicit not-yet list",
      "Estimated effort per area, with the assumptions that estimate depends on",
    ],
    tailoring:
      "Depth scales with risk. A marketing site needs a short session; an operations platform that touches money needs weeks and a written process map.",
    related: ["crm", "erp"],
  },
  {
    slug: "ui-ux-visual-systems",
    index: "02",
    title: "UI/UX & Visual Systems",
    summary:
      "Interface design and a design system that survives contact with real content.",
    accent: "blue",
    problem:
      "Screens exist, but they were designed one at a time. Nothing quite matches, every new feature invents a new pattern, and the result feels harder to use than it is.",
    deliverables: [
      "Interaction design for the core flows, at the fidelity the decision requires",
      "A component and token set — type scale, spacing, colour, states — implemented, not just drawn",
      "Accessibility built into the components: focus, contrast, keyboard paths, touch targets",
      "Documentation of the rules, so the next person makes consistent decisions",
    ],
    tailoring:
      "A brand-led marketing site is art-directed page by page. A product is systematised, because consistency there is a usability feature rather than a preference.",
    related: ["portfolio", "hrm"],
  },
  {
    slug: "website-design-development",
    index: "03",
    title: "Website Design & Development",
    summary:
      "Marketing sites that are fast, findable and genuinely designed for their audience.",
    accent: "yellow",
    problem:
      "The current site was built from a theme, loads slowly, and says the same thing as every competitor. Editing it is unpleasant enough that it has not been edited in a year.",
    deliverables: [
      "Art direction, content structure and copy support for the pages that matter",
      "A built site with per-page metadata, structured data, sitemap and share previews",
      "An image pipeline and performance budget, tested on a mid-range phone",
      "A content model the client can actually edit, or static content if they would rather not",
    ],
    tailoring:
      "Scope follows how often the site changes. Rarely-edited sites stay static and cheap to host; frequently-edited ones get an editing workflow before they get a CMS.",
    related: ["portfolio", "travel"],
  },
  {
    slug: "web-applications-internal-tools",
    index: "04",
    title: "Web Applications & Internal Tools",
    summary:
      "The system that replaces the spreadsheet the business is quietly run on.",
    accent: "mint",
    problem:
      "Something important is held together by a spreadsheet, a chat thread and one person's memory. It works until that person is away, or until two copies of the file disagree.",
    deliverables: [
      "A data model that matches the real process, including its exceptions",
      "Application screens designed for people who will use them all day, at speed",
      "Roles, permissions and an audit trail proportional to what the data is worth",
      "Import tooling and a parallel-running migration, so nothing is switched over blind",
    ],
    tailoring:
      "Delivered one module at a time, starting with whichever process is costing the most today. The business keeps working throughout.",
    related: ["crm", "hrm", "erp"],
  },
  {
    slug: "integrations-automation-apis",
    index: "05",
    title: "Integrations, Automation & APIs",
    summary:
      "Connect the systems you already pay for, and delete the copy-and-paste step.",
    accent: "coral",
    problem:
      "Data is re-entered by hand between two or three tools. Each re-entry is a chance to be wrong, and nobody is sure which system is authoritative any more.",
    deliverables: [
      "A written map of which system owns which fact, agreed before anything is wired together",
      "Integrations with retries, idempotency and a visible failure state — not silent cron jobs",
      "A typed API surface with versioning, for the systems that need to be integrated against later",
      "Monitoring and alerting on the paths that would hurt if they stopped overnight",
    ],
    tailoring:
      "Some clients need one reliable sync. Others need a documented public API. The engineering rigour is the same; the surface area is not.",
    related: ["crm", "erp"],
  },
  {
    slug: "performance-support-iteration",
    index: "06",
    title: "Performance, Support & Iteration",
    summary:
      "Keep the thing fast, current and improving after launch, without a retainer you cannot read.",
    accent: "lilac",
    problem:
      "The project shipped, then slowly degraded. Dependencies aged, images crept up in size, and small improvements never quite got scheduled.",
    deliverables: [
      "A performance and accessibility audit against real devices, with a prioritised fix list",
      "Dependency and security updates on a predictable cadence",
      "Analytics and error monitoring that measure the outcomes the business cares about",
      "A short, itemised improvement cycle — you can see what each block of time bought",
    ],
    tailoring:
      "Anything from an occasional audit to a standing block of hours each month. No minimum term, and the backlog stays visible to the client.",
    related: ["travel", "portfolio"],
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
