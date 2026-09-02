/**
 * TODO_CONTENT: confirm actual Booklee capabilities before launch.
 *
 * This list is displayed publicly and reads as a claim of competence. Remove
 * anything the studio would not want to be asked about in a first call, and add
 * only what someone here has genuinely shipped. `mobileOnly` items are shown in
 * the second marquee row because they apply to projects that actually include
 * mobile delivery, not to every engagement.
 */

export type Technology = {
  name: string;
  /** Grouping is used only to split the two marquee rows sensibly. */
  group: "core" | "data" | "platform" | "mobile";
};

export const technologies: Technology[] = [
  { name: "React", group: "core" },
  { name: "Next.js", group: "core" },
  { name: "TypeScript", group: "core" },
  { name: "Node.js", group: "core" },
  { name: "Python", group: "core" },
  { name: "PostgreSQL", group: "data" },
  { name: "GraphQL", group: "data" },
  { name: "Supabase", group: "data" },
  { name: "Prisma", group: "data" },
  { name: "Redis", group: "data" },
  { name: "Stripe", group: "platform" },
  { name: "Docker", group: "platform" },
  { name: "Kubernetes", group: "platform" },
  { name: "Terraform", group: "platform" },
  { name: "Vercel", group: "platform" },
  { name: "AWS", group: "platform" },
  { name: "Figma", group: "platform" },
  { name: "Flutter", group: "mobile" },
  { name: "Swift", group: "mobile" },
  { name: "Kotlin", group: "mobile" },
];

const isFirstRow = (technology: Technology) =>
  technology.group === "core" || technology.group === "data";

export const marqueeRowOne = technologies.filter(isFirstRow);
export const marqueeRowTwo = technologies.filter((t) => !isFirstRow(t));
