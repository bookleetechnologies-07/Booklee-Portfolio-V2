/**
 * Central site configuration.
 *
 * TODO_CONTENT: confirm every value below with Booklee before launch. Contact
 * details and social handles were carried over from the previous Booklee site
 * and should be re-verified rather than assumed current.
 */

export type SocialLink = {
  label: string;
  href: string;
  handle: string;
};

export const siteConfig = {
  name: "Booklee",
  legalName: "Booklee Technologies",
  /** Used for metadataBase, sitemap and canonical URLs. */
  url: "https://booklee.studio", // TODO_CONTENT: replace with the real production domain.
  positioning: "Websites and systems, built around your business.",
  description:
    "Booklee designs and builds tailored websites and web applications — from expressive portfolios to CRM, HRM and ERP platforms. The structure, features and technology adapt to you.",
  /** TODO_CONTENT: verify this inbox is monitored before launch. */
  email: "bookleetechnologies@gmail.com",
  location: "Remote-first · working across time zones", // TODO_CONTENT: confirm.
  socials: [
    {
      label: "LinkedIn",
      href: "https://www.linkedin.com/company/booklee-technologies/",
      handle: "booklee-technologies",
    },
    {
      label: "Instagram",
      href: "https://www.instagram.com/booklee_technologies/",
      handle: "@booklee_technologies",
    },
  ] satisfies SocialLink[],
  booking: {
    /**
     * The Calendly widget only renders when NEXT_PUBLIC_CALENDLY_URL is set.
     * Without it the page falls back to the plain scheduling link below, which
     * always works — including when the widget script is blocked or fails.
     *
     * TODO_CONTENT: confirm the event type, then set NEXT_PUBLIC_CALENDLY_URL.
     */
    fallbackUrl: "https://calendly.com/bookleetechnologies/30min",
    /** TODO_CONTENT: keep this in sync with the real Calendly event length. */
    duration: "About 30 minutes",
  },
} as const;

/** Read at module scope so the value is inlined at build time. */
export const calendlyUrl = process.env.NEXT_PUBLIC_CALENDLY_URL ?? "";
