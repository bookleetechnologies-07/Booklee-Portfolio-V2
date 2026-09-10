import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    /*
     * Portfolio previews are archived as PNG and served as AVIF or WebP,
     * whichever the browser accepts. The widths match the two compositions the
     * portfolio page actually renders — a full-bleed plate and a half-column
     * detail — so no oversized variant is generated for a size nothing uses.
     */
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 828, 1080, 1200, 1600, 1920, 2048],
  },

  /*
   * The old /projects catalogue moved under Services. These are permanent
   * (308) because the previous URLs are gone for good, not paused — anything
   * that had linked to them should be updated to the new location.
   *
   * Order matters: Next matches top to bottom, so the three starter routes are
   * listed before the catch-all that sweeps up anything else that used to live
   * under /projects.
   */
  async redirects() {
    return [
      {
        source: "/projects",
        destination: "/services/starter-websites",
        permanent: true,
      },
      {
        source: "/projects/crm",
        destination: "/services/starter-websites/crm",
        permanent: true,
      },
      {
        source: "/projects/hrm",
        destination: "/services/starter-websites/hrm",
        permanent: true,
      },
      {
        source: "/projects/erp",
        destination: "/services/starter-websites/erp",
        permanent: true,
      },
      // The two demonstration categories were never client work of their own;
      // the real client sites they gestured at now live on the portfolio page.
      { source: "/projects/portfolio", destination: "/portfolio", permanent: true },
      { source: "/projects/travel", destination: "/portfolio", permanent: true },
      {
        source: "/projects/:slug*",
        destination: "/services/starter-websites",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
