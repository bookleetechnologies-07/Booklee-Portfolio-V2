import type { Route } from "next";

export type NavChild = {
  label: string;
  href: Route;
  /** One line of orientation shown in the desktop submenu and mobile group. */
  description: string;
};

export type NavItem = {
  label: string;
  href: Route;
  /** Primary call to action gets the pastel mint treatment in the header. */
  cta?: boolean;
  /**
   * Present only on Services. The parent link stays a real, reachable
   * destination — the submenu adds children, it never replaces the parent.
   */
  children?: NavChild[];
};

export const navItems: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "About us", href: "/about" },
  {
    label: "Services",
    href: "/services",
    children: [
      {
        label: "All services",
        href: "/services",
        description: "Six engagements, from strategy through to improvement.",
      },
      {
        label: "Starter websites",
        href: "/services/starter-websites",
        description: "CRM, HRM and ERP foundations, adapted to your workflow.",
      },
    ],
  },
  { label: "Portfolio", href: "/portfolio" },
  { label: "Book a call", href: "/book-a-call", cta: true },
];

/**
 * Footer grouping. Services children are listed under their parent rather than
 * flattened, so Starter websites reads as part of Services and not as a sixth
 * top-level destination.
 */
export const footerGroups: { heading: string; links: NavChild[] }[] = [
  {
    heading: "Pages",
    links: [
      { label: "Home", href: "/", description: "" },
      { label: "About us", href: "/about", description: "" },
      { label: "Portfolio", href: "/portfolio", description: "" },
      { label: "Book a call", href: "/book-a-call", description: "" },
    ],
  },
  {
    heading: "Services",
    links: [
      { label: "All services", href: "/services", description: "" },
      {
        label: "Starter websites",
        href: "/services/starter-websites",
        description: "",
      },
    ],
  },
];
