import type { Metadata } from "next";

import { BookingCTA } from "@/components/home/BookingCTA";
import { ProjectsExplorer } from "@/components/projects/ProjectsExplorer";
import { PageIntro } from "@/components/ui/PageIntro";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Five Booklee concept projects — CRM, HRM, editorial portfolio, travel and ERP — each built to show how a system changes shape around the business using it.",
  alternates: { canonical: "/projects" },
  openGraph: {
    title: "Booklee projects",
    description:
      "Five concept projects showing the range: CRM, HRM, portfolio, travel and ERP.",
    url: "/projects",
  },
};

export default function ProjectsPage() {
  return (
    <>
      <PageIntro
        eyebrow="Projects"
        heading="Five starting points. None of them templates."
        standfirst="These are concepts and demo builds, not client case studies. Each one exists to show how we think about a category of problem — and each would look different for your business."
      />
      <ProjectsExplorer />
      <BookingCTA
        heading="Something here close to what you need?"
        support="Tell us which parts fit and which do not. That conversation is usually the fastest way to a realistic scope."
      />
    </>
  );
}
