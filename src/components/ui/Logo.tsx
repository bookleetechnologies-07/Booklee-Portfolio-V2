import { cn } from "@/lib/cn";

type MonogramProps = {
  className?: string;
  title?: string;
};

/**
 * Geometric Booklee "B". Drawn as a single even-odd path so the counters stay
 * transparent on any background, and coloured with `currentColor` so the mark
 * works on the dark hero, on paper, and inside a pastel field without variants.
 */
export function Monogram({ className, title }: MonogramProps) {
  return (
    <svg
      viewBox="0 0 40 40"
      role={title ? "img" : "presentation"}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      className={cn("h-6 w-6", className)}
      fill="none"
    >
      {title ? <title>{title}</title> : null}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M5 5h18.4a7 7 0 0 1 0 14h1.6a7.5 7.5 0 0 1 0 15H5V5Zm6.6 5.6v3.2h11.3a1.6 1.6 0 0 0 0-3.2H11.6Zm0 14.6v3.6h12.9a1.8 1.8 0 0 0 0-3.6H11.6Z"
        fill="currentColor"
      />
    </svg>
  );
}

type LogoProps = {
  className?: string;
  /** Rendered inside a link that already carries the accessible name. */
  decorative?: boolean;
};

export function Logo({ className, decorative = true }: LogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <Monogram
        className="h-[1.15em] w-[1.15em]"
        title={decorative ? undefined : "Booklee"}
      />
      <span
        className="font-[family-name:var(--font-display)] text-[1.35em] leading-none font-semibold tracking-[-0.01em] uppercase"
        style={{ fontFeatureSettings: '"ss01"' }}
      >
        Booklee
      </span>
    </span>
  );
}
