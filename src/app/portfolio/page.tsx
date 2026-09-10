import type { Metadata } from "next";

import { BookingCTA } from "@/components/home/BookingCTA";
import { PortfolioGallery } from "@/components/portfolio/PortfolioGallery";
import { PageIntro } from "@/components/ui/PageIntro";
import { portfolioEntries } from "@/content/portfolio";
import { siteConfig } from "@/content/site";

export const metadata: Metadata = {
  title: "Portfolio",
  description:
    "Live client work by Booklee — a travel and study-abroad platform, an editorial saddlery portfolio, a swimming programme and booking experience, and an e-commerce boutique.",
  alternates: { canonical: "/portfolio" },
  openGraph: {
    title: "Booklee portfolio",
    description:
      "Selected client websites, each built around how that business actually works.",
    url: "/portfolio",
  },
};

/**
 * Structured data for the client work. Only facts that are visible on the page
 * are described here — name, category and destination. No ratings, no results
 * and no invented authorship, because none of that has been verified.
 */
function collectionSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Booklee portfolio",
    url: new URL("/portfolio", siteConfig.url).toString(),
    hasPart: portfolioEntries.map((entry) => ({
      "@type": "WebSite",
      name: entry.client,
      url: entry.url,
      about: entry.category,
    })),
  };
}

export default function PortfolioPage() {
  return (
    <>
      <script
        type="application/ld+json"
        // Serialised server-side from typed content; no user input reaches it.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema()) }}
      />

      <PageIntro
        eyebrow="Portfolio"
        heading="Work that went live and stayed useful."
        standfirst="A travel and study-abroad platform, an editorial portfolio for a saddlery, a programme and booking experience for a swimming centre, and an e-commerce boutique. Different businesses, different shapes — each one built around how that business actually works."
      />

      <PortfolioGallery />

      <BookingCTA
        heading="Want something built around how you work?"
        support="Tell us what your business actually does day to day. That conversation is usually the fastest route to a realistic scope."
      />
    </>
  );
}
