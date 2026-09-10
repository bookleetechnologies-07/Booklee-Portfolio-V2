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
      href: "https://www.instagram.com/booklee.in/",
      handle: "@booklee.in",
    },
  ] satisfies SocialLink[],
  booking: {
    /**
     * Booklee's real scheduling link, and the default the inline widget is
     * built from. It is the same event the previous Booklee site embedded.
     *
     * It doubles as the plain-link fallback, which is what the page offers if
     * the widget script is blocked or fails.
     */
    fallbackUrl: "https://calendly.com/bookleetechnologies/30min",
    /**
     * TODO_CONTENT: confirm the meeting title and length against the real
     * Calendly event. These are presented by the page itself, because the
     * embed is configured to hide Calendly's own event header so the booking
     * flow sits inside Booklee's design rather than in a white card.
     */
    title: "Intro call",
    duration: "30 minutes",
  },
} as const;

/**
 * The event the inline widget books, read at module scope so the value is
 * inlined at build time.
 *
 * It defaults to the real scheduling link rather than to nothing. Requiring an
 * environment variable meant that in every environment where it was unset —
 * which was all of them — the booking card had no widget to open and fell
 * through to its "the calendar is unavailable" state as the *normal* result of
 * pressing Schedule a call. The variable is still honoured, so a different
 * event can be pointed at without a code change.
 */
export const calendlyUrl =
  process.env.NEXT_PUBLIC_CALENDLY_URL || siteConfig.booking.fallbackUrl;
