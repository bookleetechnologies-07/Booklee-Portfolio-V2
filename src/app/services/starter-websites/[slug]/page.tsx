import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { StarterDetailTemplate } from "@/components/starters/StarterDetailTemplate";
import { starterBySlug, starterWebsites } from "@/content/starter-websites";

type Params = { slug: string };

/** All three detail routes are generated at build time and work on direct load. */
export function generateStaticParams(): Params[] {
  return starterWebsites.map((starter) => ({ slug: starter.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const starter = starterBySlug(slug);
  if (!starter) return {};

  return {
    title: starter.metaTitle,
    description: starter.metaDescription,
    alternates: { canonical: `/services/starter-websites/${starter.slug}` },
    openGraph: {
      title: `${starter.metaTitle} — Booklee`,
      description: starter.metaDescription,
      url: `/services/starter-websites/${starter.slug}`,
    },
  };
}

export default async function StarterDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const starter = starterBySlug(slug);
  if (!starter) notFound();

  return <StarterDetailTemplate starter={starter} />;
}
