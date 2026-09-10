import type { Metadata } from "next";

import { AboutSplit } from "@/components/home/AboutSplit";
import { BookingCTA } from "@/components/home/BookingCTA";
import { BookleeHeroV2 } from "@/components/hero/BookleeHeroV2";
import { StarterRail } from "@/components/home/StarterRail";
import { ServicesGrid } from "@/components/home/ServicesGrid";
import { StackMarquee } from "@/components/home/StackMarquee";
import { TestimonialsCarousel } from "@/components/home/TestimonialsCarousel";
import { siteConfig } from "@/content/site";

export const metadata: Metadata = {
  title: `${siteConfig.name} — ${siteConfig.positioning}`,
  description: siteConfig.description,
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <>
      <BookleeHeroV2 />
      <StarterRail />
      <StackMarquee />
      <ServicesGrid />
      <AboutSplit />
      <TestimonialsCarousel />
      <BookingCTA />
    </>
  );
}
