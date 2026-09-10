"use client";

import { useId, useRef } from "react";

import { BRAND } from "@/lib/brand";
import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";
import { gsap } from "@/lib/gsap";
import { cn } from "@/lib/cn";

/**
 * The Booklee mark becoming the complete Booklee Technologies logo.
 *
 * A literal path morph was the wrong tool here: the mark is one closed
 * hourglass form and the wordmark is twenty-four separate letter and counter
 * subpaths, so normalising between them deforms the brand rather than
 * transforming it. Instead the frame itself pulls back — the SVG's own viewBox
 * widens from the mark's bounding box to the full lockup's — while the wordmark
 * is reconstructed left to right behind travelling clip edges and a single
 * pastel light sweep passes across the finished artwork.
 *
 * The markup is authored as the finished logo and GSAP animates away from it,
 * so reduced-motion users and anyone whose JavaScript has not run see the
 * correct, undistorted lockup. Everything is in SVG user units, which makes it
 * resize-safe and crisp at any size.
 */

/** Padded frames, so the artwork never touches the tile edge. */
const MARK_FRAME = "10 405 392 349";
const FULL_FRAME = "10 405 1177 349";

/** Word and tagline extents in the shared lockup coordinate space. */
const WORD = { x: 330, width: 824 };
const TAG = { x: 330, width: 824 };

export function BrandReveal({ className }: { className?: string }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const uid = useId().replace(/[:]/g, "");
  const wordClip = `word-${uid}`;
  const tagClip = `tag-${uid}`;

  useIsomorphicLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const context = gsap.context(() => {
      const media = gsap.matchMedia();

      const build = (mobile: boolean) => () => {
        const q = gsap.utils.selector(root);
        const svg = q("svg")[0];
        if (!svg) return;

        const timeline = gsap.timeline({
          defaults: { ease: "power2.inOut" },
          scrollTrigger: {
            trigger: root,
            start: mobile ? "top 82%" : "top 78%",
            end: mobile ? "top 40%" : "center 42%",
            scrub: 0.7,
          },
        });

        timeline
          /*
           * The frame pulls back from the mark to the whole lockup — and it
           * does it *with* the wordmark, not ahead of it.
           *
           * This is what keeps the symbol centred while it is the only thing on
           * the tile. The viewBox is the only thing positioning the artwork:
           * with `MARK_FRAME` the mark is the whole frame and `xMidYMid` centres
           * it, and as the frame widens towards the lockup the mark necessarily
           * slides left, because in the finished lockup it lives at the left.
           *
           * So a frame that has already opened while the wordmark is still
           * hidden leaves the symbol stranded at a fifth of the way across with
           * the rest of the tile empty. Running the pull-back on the wordmark's
           * own window means the space only ever opens as something arrives to
           * fill it.
           */
          .from(svg, { attr: { viewBox: MARK_FRAME }, duration: 0.5 }, 0.78)
          /*
           * The wordmark reconstructs behind a travelling edge — and does it
           * late, which is the whole point of these two positions.
           *
           * The tile is 424px tall and the scrub runs from its top at 78% of
           * the viewport to its centre at 42%, so the tile is not even fully on
           * screen until the timeline is around 45% through. Starting the word
           * at 0.24, as this used to, meant the BOOKLEE lettering was most of
           * the way written by the first moment anyone could see the whole
           * tile: the animation appeared to begin with the text already there,
           * and the mark never had a beat on its own.
           *
           * Starting it at 0.78 puts the reveal after that point rather than
           * across it. The frame widens around the standalone symbol, that is
           * held for a beat with the whole tile in view, and only then does the
           * wordmark write in, followed by the tagline — which is the order the
           * lockup is actually built in.
           *
           * The position has to allow for the ease as well as the timing:
           * `power3.out` spends a fifth of its travel in the first few per cent
           * of the tween, so a start that merely coincides with the tile
           * settling still shows a slice of lettering on the first frame anyone
           * sees whole.
           */
          .from(
            q("[data-logo='wordClip']"),
            { attr: { width: 0 }, duration: 0.5, ease: "power3.out" },
            0.78,
          )
          .from(
            q("[data-logo='word']"),
            { yPercent: 6, opacity: 0, duration: 0.38 },
            0.78,
          )
          // Then the technologies line resolves last, and sharply.
          .from(
            q("[data-logo='tagClip']"),
            { attr: { width: 0 }, duration: 0.31, ease: "power3.out" },
            1.14,
          )
          /*
           * One controlled pastel sweep, all the way across the finished
           * artwork and out the other side.
           *
           * The endpoints look arbitrary and are not. `xPercent` is a share of
           * the *element's* width, and the highlight is a third of the tile
           * wide sitting at `left: -1/3`. So its left edge lands at
           * `(x/100 - 1) / 3` of the tile, which makes 400 the number at which
           * it has finally cleared the right-hand edge.
           *
           * It used to end at 130 — which put its trailing edge at 43% of the
           * tile — and then fade out from there, so the sweep visibly gave up
           * around the middle of the logo instead of leaving the frame. Ending
           * at 420 crosses the whole tile and exits; the fade now only tidies
           * up the tail once the highlight is already past the edge.
           *
           * The travel is a little over twice what it was and the tween is
           * half again as long, so the sweep is faster across the tile than
           * before. That is the unavoidable trade: the scroll distance this
           * timeline is scrubbed over has not changed, and the highlight now
           * has more than twice as far to go inside it.
           */
          .fromTo(
            q("[data-logo='sweep']"),
            { xPercent: -120, opacity: 0 },
            { xPercent: 420, opacity: 1, duration: 0.9, ease: "none" },
            0.5,
          )
          .to(q("[data-logo='sweep']"), { opacity: 0, duration: 0.2 }, 1.25);

        return () => {
          timeline.scrollTrigger?.kill();
          timeline.kill();
        };
      };

      media.add(
        "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
        build(false),
      );
      media.add(
        "(max-width: 767.98px) and (prefers-reduced-motion: no-preference)",
        build(true),
      );

      return () => media.revert();
    }, root);

    return () => context.revert();
  }, []);

  return (
    <div
      ref={rootRef}
      className={cn(
        "grain relative aspect-[5/4] overflow-hidden rounded-[24px] bg-lilac",
        className,
      )}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 [background:radial-gradient(120%_90%_at_20%_10%,rgba(250,250,247,0.7),transparent_62%)]"
      />

      <svg
        viewBox={FULL_FRAME}
        className="absolute inset-0 h-full w-full p-[6%] text-ink"
        role="img"
        aria-label="Booklee Technologies"
      >
        <defs>
          <clipPath id={wordClip}>
            <rect
              data-logo="wordClip"
              x={WORD.x}
              y="380"
              width={WORD.width}
              height="400"
            />
          </clipPath>
          <clipPath id={tagClip}>
            <rect
              data-logo="tagClip"
              x={TAG.x}
              y="380"
              width={TAG.width}
              height="400"
            />
          </clipPath>
        </defs>

        <path
          data-logo="mark"
          fillRule="evenodd"
          d={BRAND.lockupMarkPath}
          fill="currentColor"
        />
        <g clipPath={`url(#${wordClip})`}>
          <path
            data-logo="word"
            fillRule="evenodd"
            d={BRAND.lockupWordPath}
            fill="currentColor"
          />
        </g>
        <g clipPath={`url(#${tagClip})`}>
          <path
            data-logo="tag"
            fillRule="evenodd"
            d={BRAND.lockupTagPath}
            fill="currentColor"
          />
        </g>
      </svg>

      {/* The light sweep sits above the artwork and only ever lightens it. */}
      <div
        aria-hidden="true"
        data-logo="sweep"
        className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 opacity-0 mix-blend-overlay [background:linear-gradient(105deg,transparent,rgba(255,255,255,0.85),transparent)]"
      />

      <span className="absolute top-6 right-6 flex items-center gap-2.5 text-ink/45">
        <span className="eyebrow">Studio practice</span>
        <span
          aria-hidden="true"
          className="block h-7 w-7 rounded-full border border-current"
        />
      </span>
    </div>
  );
}
