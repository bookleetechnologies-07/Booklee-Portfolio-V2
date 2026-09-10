import { BRAND } from "@/lib/brand";
import { cn } from "@/lib/cn";

type BrandProps = {
  className?: string;
  /** Supply only when the artwork is the accessible name for its context. */
  title?: string;
};

/**
 * The Booklee Technologies mark on its own, vectorised from the supplied logo
 * artwork. Filled with `currentColor` and even-odd, so the counters stay
 * transparent and one path works on black, on paper and inside a pastel field.
 *
 * Every viewBox in `BRAND` is tight to the visible artwork — measured from the
 * path data, not eyeballed — so centring the viewBox centres what is actually
 * drawn. `preserveAspectRatio` is left at its default (`xMidYMid meet`), which
 * is what keeps the artwork centred and undistorted at any height.
 */
export function Monogram({ className, title }: BrandProps) {
  return (
    <svg
      viewBox={BRAND.markViewBox}
      role={title ? "img" : "presentation"}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      className={cn("block h-6 w-auto", className)}
      fill="none"
    >
      {title ? <title>{title}</title> : null}
      <path fillRule="evenodd" d={BRAND.markPath} fill="currentColor" />
    </svg>
  );
}

/**
 * Mark plus BOOKLEE. The smaller TECHNOLOGIES line is dropped here because at
 * navigation size it would render around two pixels tall and read as a smudge
 * rather than as type. The full lockup is used wherever there is room for it.
 */
export function Signature({ className, title }: BrandProps) {
  return (
    <svg
      viewBox={BRAND.signatureViewBox}
      role={title ? "img" : "presentation"}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      className={cn("block h-6 w-auto", className)}
      fill="none"
    >
      {title ? <title>{title}</title> : null}
      <path fillRule="evenodd" d={BRAND.lockupMarkPath} fill="currentColor" />
      <path fillRule="evenodd" d={BRAND.lockupWordPath} fill="currentColor" />
    </svg>
  );
}

/**
 * The complete lockup. The three paths stay separate because the About section
 * animates the mark, the wordmark and the technologies line independently.
 */
export function Lockup({
  className,
  title,
  markId,
  wordId,
  tagId,
}: BrandProps & { markId?: string; wordId?: string; tagId?: string }) {
  return (
    <svg
      viewBox={BRAND.lockupViewBox}
      role={title ? "img" : "presentation"}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      className={cn("block h-8 w-auto", className)}
      fill="none"
    >
      {title ? <title>{title}</title> : null}
      <path id={markId} fillRule="evenodd" d={BRAND.lockupMarkPath} fill="currentColor" />
      <path id={wordId} fillRule="evenodd" d={BRAND.lockupWordPath} fill="currentColor" />
      <path id={tagId} fillRule="evenodd" d={BRAND.lockupTagPath} fill="currentColor" />
    </svg>
  );
}

/**
 * Header and footer signature, in an explicit fixed-height alignment box.
 *
 * The box is `grid` rather than `inline-flex` for a specific reason. An
 * inline-level wrapper participates in a line box, so the artwork is aligned to
 * the *text baseline* of the inherited `line-height: 1.6` — which parks the
 * descender space underneath it and lifts the visible mark roughly three pixels
 * above the optical centre of the bar. That was the cause of the off-centre
 * signature, not slack in the viewBox. A block-level grid box with
 * `place-items: center` has no baseline to answer to, so the artwork is centred
 * geometrically inside a slot whose height we control.
 *
 * The slot is `h-9`, matching the height of the navigation links and the call
 * to action beside it, so every item in the bar occupies the same vertical band.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("grid h-9 place-items-center", className)}>
      <Signature className="h-[1.15rem] w-auto md:h-6" />
    </span>
  );
}
