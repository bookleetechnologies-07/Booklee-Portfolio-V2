import type { Metadata } from "next";

import { AboutSplit } from "@/components/home/AboutSplit";
import { BookingCTA } from "@/components/home/BookingCTA";
import { LaptopStory } from "@/components/home/LaptopStory";
import { ProjectRail } from "@/components/home/ProjectRail";
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
      <LaptopStory />
      <ProjectRail />
      <StackMarquee />
      <ServicesGrid />
      <AboutSplit />
      <TestimonialsCarousel />
      <BookingCTA />
    </>
  );
}
