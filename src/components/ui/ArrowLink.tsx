import Link from "next/link";
import type { Route } from "next";

import { cn } from "@/lib/cn";

type Props = {
  href: Route | string;
  children: React.ReactNode;
  className?: string;
  /** Renders as a solid pill rather than an inline underlined link. */
  variant?: "inline" | "pill" | "pill-quiet";
};

export function ArrowLink({
  href,
  children,
  className,
  variant = "inline",
}: Props) {
  const base =
    "group inline-flex items-center gap-2 transition-[transform,background-color,border-color,opacity] duration-200";

  const styles = {
    inline: "text-sm font-medium underline-offset-[6px] hover:underline",
    pill: "h-12 rounded-full bg-ink px-6 text-sm font-medium text-bone hover:-translate-y-0.5",
    "pill-quiet":
      "h-12 rounded-full border border-current/25 px-6 text-sm font-medium hover:-translate-y-0.5",
  } as const;

  return (
    <Link href={href as Route} className={cn(base, styles[variant], className)}>
      {children}
      <span
        aria-hidden="true"
        className="translate-x-0 transition-transform duration-200 group-hover:translate-x-1"
      >
        &rarr;
      </span>
    </Link>
  );
}
