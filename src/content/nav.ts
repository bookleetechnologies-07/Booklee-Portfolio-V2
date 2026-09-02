export type NavItem = {
  label: string;
  href: "/" | "/about" | "/services" | "/projects" | "/book-a-call";
  /** Primary call to action gets the pastel mint treatment in the header. */
  cta?: boolean;
};

export const navItems: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "About us", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Projects", href: "/projects" },
  { label: "Book a call", href: "/book-a-call", cta: true },
];
