import Image from "next/image";

import type { PortfolioEntry } from "@/content/portfolio";

import { PreviewFrame, type PreviewProps } from "./PreviewFrame";

/**
 * A live client site inside the same frame the concept previews use.
 *
 * The five Booklee concepts beside this in the hero deck are drawn as real DOM,
 * because they are designs this studio owns and can render. A client's site is
 * not: it belongs to them, it changes when they change it, and the only honest
 * way to show it is the archived capture that already backs the portfolio page.
 *
 * So this is deliberately thin. It shares `PreviewFrame` with the concepts,
 * which is what keeps the deck's treatment — the frame, the clipping, the
 * aspect — identical from slide to slide; the only difference is that what
 * fills the frame is a photograph of a real page rather than a rendering of a
 * designed one. It takes the portfolio entry itself rather than an image path,
 * so there is one source of truth for what these sites are and the deck cannot
 * drift from the portfolio page.
 */
export function ClientCapture({
  entry,
  className,
}: PreviewProps & { entry: PortfolioEntry }) {
  const label = `${entry.client} — ${entry.category}. Live at ${entry.displayUrl}.`;

  if (!entry.preview) {
    /*
     * No approved capture. Not a broken image and not an empty slide: the
     * client's name on plain stock, which is the same stand-in the portfolio
     * page falls back to.
     */
    return (
      <PreviewFrame
        className={className}
        canvasClassName="flex-col justify-end gap-[1em] p-[6%]"
        label={label}
      >
        <p className="display-lg max-w-[14ch] text-ink">{entry.client}</p>
        <p className="meta text-muted">{entry.displayUrl}</p>
      </PreviewFrame>
    );
  }

  return (
    <PreviewFrame className={className} label={label}>
      <Image
        src={entry.preview.src}
        alt=""
        fill
        /*
         * The deck's card is a fixed 1600px box that the hero projects down
         * onto the laptop's panel, so the largest useful source is that width
         * — never the viewport's.
         */
        sizes="(min-width: 768px) 1600px, 92vw"
        className="object-cover object-top"
      />
    </PreviewFrame>
  );
}
