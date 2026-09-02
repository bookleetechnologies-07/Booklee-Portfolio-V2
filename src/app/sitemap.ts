import type { MetadataRoute } from "next";

import { navItems } from "@/content/nav";
import { projectCategories } from "@/content/projects";
import { siteConfig } from "@/content/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    ...navItems.map((item) => ({
      url: new URL(item.href, siteConfig.url).toString(),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: item.href === "/" ? 1 : 0.8,
    })),
    ...projectCategories.map((project) => ({
      url: new URL(`/projects/${project.slug}`, siteConfig.url).toString(),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
