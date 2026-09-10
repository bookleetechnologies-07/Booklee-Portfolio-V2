import type { MetadataRoute } from "next";

import { siteConfig } from "@/content/site";
import { starterWebsites } from "@/content/starter-websites";

/**
 * Every canonical URL on the site, listed once.
 *
 * The routes are written out rather than derived from the navigation, because
 * the two answer different questions: navigation is what we choose to surface,
 * a sitemap is everything that exists. The legacy /projects URLs are absent on
 * purpose — they are permanent redirects now, and listing a redirect here would
 * ask search engines to keep crawling a page that no longer exists.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const url = (path: string) => new URL(path, siteConfig.url).toString();

  return [
    { url: url("/"), lastModified: now, changeFrequency: "monthly", priority: 1 },
    {
      url: url("/about"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: url("/services"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: url("/services/starter-websites"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    ...starterWebsites.map((starter) => ({
      url: url(`/services/starter-websites/${starter.slug}`),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    {
      url: url("/portfolio"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: url("/book-a-call"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];
}
