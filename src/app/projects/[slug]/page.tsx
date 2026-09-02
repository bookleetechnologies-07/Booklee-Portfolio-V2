import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProjectDetailTemplate } from "@/components/projects/ProjectDetailTemplate";
import { projectBySlug, projectCategories } from "@/content/projects";

type Params = { slug: string };

/** All five detail routes are generated at build time and work on direct load. */
export function generateStaticParams(): Params[] {
  return projectCategories.map((project) => ({ slug: project.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = projectBySlug(slug);
  if (!project) return {};

  return {
    title: project.metaTitle,
    description: project.metaDescription,
    alternates: { canonical: `/projects/${project.slug}` },
    openGraph: {
      title: `${project.metaTitle} — Booklee`,
      description: project.metaDescription,
      url: `/projects/${project.slug}`,
    },
  };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const project = projectBySlug(slug);
  if (!project) notFound();

  return <ProjectDetailTemplate project={project} />;
}
