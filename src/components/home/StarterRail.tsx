"use client";

import Link from "next/link";
import { useCallback, useRef } from "react";

import { OFFERED_SECTION_ID, PHRASE_DEST_ID } from "@/components/home/phrase-handoff";
import { ConceptPreview } from "@/components/previews";
import { starterWebsites } from "@/content/starter-websites";
import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";
import { gsap } from "@/lib/gsap";
import { cn } from "@/lib/cn";

const ACCENT: Record<string, string> = {
  lilac: "var(--accent-lilac)",
  blue: "var(--accent-blue)",
  yellow: "var(--accent-yellow)",
  mint: "var(--accent-mint)",
  coral: "var(--accent-coral)",
};

/**
 * The starter websites, as a rail.
 *
 * The rail converts vertical scroll into horizontal travel on large screens,
 * and is a plain scroll-snapping overflow container everywhere else.
 *
 * Two rules keep the desktop version from becoming a scroll trap: the previous
 * and next controls are real buttons that move the page, and focusing a panel
 * scrolls it into view, so a keyboard user is never left looking at a card that
 * has been translated off screen.
 *
 * This section is also the destination of the hero's phrase handoff, which is
 * why its heading carries `PHRASE_DEST_ID` and the section carries
 * `OFFERED_SECTION_ID`.
 */
export function StarterRail() {
  const sectionRef = useRef<HTMLElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  /** Scroll position of each panel, filled in by the desktop branch. */
  const stops = useRef<number[]>([]);
  const index = useRef(0);

  useIsomorphicLayoutEffect(() => {
    const section = sectionRef.current;
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!section || !viewport || !track) return;

    const context = gsap.context(() => {
      const media = gsap.matchMedia();

      media.add(
        "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
        () => {
          /*
           * How far the track travels while the section is pinned.
           *
           * The obvious answer — `scrollWidth - clientWidth`, which is what
           * this used to be — runs the rail until its trailing edge meets the
           * viewport's, so the fifth card finishes hard against the right edge
           * with the rest of the set already gone. The horizontal move ends on
           * its most cramped frame.
           *
           * So the rail stops earlier, on a composition rather than on an
           * edge: it comes to rest with the *second to last* panel centred in
           * the viewport and the final one entering beside it, which puts the
           * closing group around the middle of the screen. Deriving it from
           * the panels' measured offsets and widths rather than from a fixed
           * pixel figure means it holds at any width — the panels are
           * `min(46vw, 40rem)` wide, so the same expression re-solves itself
           * on every refresh as the card size changes.
           *
           * Clamped to the natural travel so it can never ask for more scroll
           * than there is track, and floored at zero for the case where the
           * whole set already fits on screen.
           */
          const distance = () => {
            const full = Math.max(0, track.scrollWidth - viewport.clientWidth);
            const panels = track.querySelectorAll<HTMLElement>("[data-panel]");
            const anchor = panels[panels.length - 2];
            if (!anchor) return full;

            const rest =
              anchor.offsetLeft +
              anchor.offsetWidth / 2 -
              viewport.clientWidth / 2;

            return gsap.utils.clamp(0, full, rest);
          };

          /*
           * Where the rail comes to rest vertically for the whole pinned
           * phase.
           *
           * Pinning at `top top` parks the rail's own top edge against the top
           * of the screen, which tucks the cards up under the floating
           * navigation and leaves the entire remainder of the viewport empty
           * beneath them. The rail is sized to its cards rather than to the
           * screen, so that leftover space is real: on a 982px viewport a
           * 740px rail leaves 242px of nothing below it.
           *
           * Pinning lower puts that space where it belongs — split evenly
           * above and below the cards, inside the part of the screen the
           * visitor can actually see. The navigation is a fixed bar over the
           * page rather than something the layout makes room for, so it is
           * measured and subtracted first: centring against the raw viewport
           * would centre the cards behind the bar and still leave them reading
           * high. `offsetHeight` is the measurement to take because the bar
           * hides itself with a transform during the hero, and a transformed
           * element still reports its layout height.
           *
           * A function, not a constant: it re-solves on every refresh, so a
           * resize or a card that reflows to a different height re-centres
           * rather than keeping an offset computed for a screen that is gone.
           * If the rail is ever taller than the space under the bar the
           * remainder goes negative, and it simply sits directly below the bar
           * instead of being pushed off the bottom of the screen.
           */
          const pinOffset = () => {
            const bar = document.querySelector("header");
            const barHeight = bar ? bar.offsetHeight : 0;
            const spare =
              window.innerHeight - barHeight - viewport.offsetHeight;
            return Math.round(barHeight + Math.max(0, spare / 2));
          };

          const tween = gsap.to(track, {
            x: () => -distance(),
            ease: "none",
            scrollTrigger: {
              trigger: viewport,
              start: () => `top ${pinOffset()}px`,
              end: () => `+=${distance()}`,
              pin: true,
              scrub: 1,
              anticipatePin: 1,
              invalidateOnRefresh: true,
              onRefresh: (self) => {
                const panels = Array.from(
                  track.querySelectorAll<HTMLElement>("[data-panel]"),
                );
                const total = distance();
                stops.current = panels.map((panel) => {
                  const offset = Math.min(panel.offsetLeft, total);
                  const ratio = total === 0 ? 0 : offset / total;
                  return self.start + ratio * (self.end - self.start);
                });
              },
            },
          });

          return () => {
            tween.scrollTrigger?.kill();
            tween.kill();
            stops.current = [];
          };
        },
      );

      return () => media.revert();
    }, section);

    return () => context.revert();
  }, []);

  const goTo = useCallback((next: number) => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    index.current = Math.min(Math.max(next, 0), starterWebsites.length - 1);

    // Desktop: the rail is pinned, so "moving" means moving the page.
    const stop = stops.current[index.current];
    if (typeof stop === "number") {
      gsap.to(window, {
        scrollTo: { y: stop, autoKill: false },
        duration: 0.45,
        ease: "power2.inOut",
        overwrite: true,
      });
      return;
    }

    // Everywhere else it is a real overflow container.
    const panel =
      viewport.querySelectorAll<HTMLElement>("[data-panel]")[index.current];
    panel?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "start",
    });
  }, []);

  const step = useCallback(
    (direction: 1 | -1) => goTo(index.current + direction),
    [goTo],
  );

  return (
    <section
      ref={sectionRef}
      id={OFFERED_SECTION_ID}
      data-nav-theme="light"
      aria-labelledby="offered-heading"
      className="paper-tooth grain relative bg-paper"
    >
      {/* The bottom padding is the whole gap between the heading block and the
          cards — the rail's own top padding is shared with its bottom padding,
          so widening it here is the only way to give the cards more room above
          without also opening up the space beneath them. */}
      <div className="shell pt-[clamp(4.5rem,9vw,9rem)] pb-[clamp(4rem,6vw,7rem)]">
        <div className="grid-12 items-end gap-y-8">
          <div className="col-span-4 md:col-span-8 lg:col-span-7">
            <h2 id="offered-heading" className="display-lg">
              {/*
                The destination of the home-page phrase handoff. It is ordinary
                document text: on small screens and under reduced motion it is
                simply the heading, with nothing flying into it.
              */}
              <span id={PHRASE_DEST_ID}>Built around you.</span>
            </h2>
            <p className="display-md mt-4 max-w-[20ch] text-muted">
              Five starting points. None of them templates.
            </p>
          </div>

          <div className="col-span-4 md:col-span-8 lg:col-span-5 lg:justify-self-end">
            <p className="prose-body max-w-[42ch] text-muted">
              Our starter websites are complete, working systems that we then
              adapt to your workflow, your users and the tools you already run.
              The foundation is solid; the shape is yours.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <RailButton label="Previous starter website" onClick={() => step(-1)}>
                &larr;
              </RailButton>
              <RailButton label="Next starter website" onClick={() => step(1)}>
                &rarr;
              </RailButton>
              <Link
                href="/services/starter-websites"
                className="ml-2 text-sm font-medium underline-offset-[6px] hover:underline"
              >
                All starter websites
              </Link>
              <Link
                href="/portfolio"
                className="text-sm font-medium text-muted underline-offset-[6px] hover:text-ink hover:underline"
              >
                See client work
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div
        ref={viewportRef}
        /* When focus leaves the rail the browser scrolls the next element into
           view; a programmatic scroll still running would fight it. */
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node)) {
            gsap.killTweensOf(window);
          }
        }}
        className={cn(
          "no-scrollbar snap-rail w-full overflow-x-auto pb-[clamp(2.5rem,5vw,5rem)]",
          /*
             The pinned box is sized to the cards, not to the screen.

             It used to be `h-screen`, which on a 860px viewport left 226px of
             empty paper around 634px of card and put a void between the rail
             and whatever followed it. Auto height with its own padding hugs the
             tallest card instead, so the section is that much shorter and
             nothing is clipped if a card's copy runs a line longer.

             Shortening a pinned element is safe here: `pinSpacing` keeps a
             spacer the height of the pin in the flow, so what comes after the
             section is still a full pin's worth of scrolling below the fold and
             cannot appear underneath the rail while it is travelling.
          */
          "lg:flex lg:h-auto lg:items-center lg:overflow-hidden lg:py-[clamp(2rem,3.5vw,3.5rem)]",
        )}
      >
        <div
          ref={trackRef}
          className="flex w-max gap-5 px-6 md:gap-6 md:px-10 xl:px-16"
        >
          {starterWebsites.map((starter, position) => (
            <Link
              key={starter.slug}
              data-panel=""
              href={`/services/starter-websites/${starter.slug}`}
              /* An explicit name, so the link is not announced as the interface
                 preview's long image description followed by the copy. */
              aria-label={`${starter.name} — starter website. ${starter.outcome}`}
              /* Keyboard focus only: clicking a panel must not move the page
                 out from under the click. */
              onFocus={(event) => {
                if (event.currentTarget.matches(":focus-visible")) {
                  goTo(position);
                }
              }}
              className="group block w-[min(84vw,30rem)] shrink-0 lg:w-[min(46vw,40rem)]"
            >
              <article className="flex h-full flex-col">
                <div
                  className="relative overflow-hidden rounded-[20px] transition-transform duration-300 group-hover:-translate-y-1"
                  style={{ backgroundColor: ACCENT[starter.accent] }}
                >
                  <div className="p-3 md:p-4">
                    <ConceptPreview
                      slug={starter.slug}
                      className="rounded-[12px]"
                    />
                  </div>
                </div>

                <div className="mt-5 flex items-start gap-4 md:gap-6">
                  <span className="eyebrow mt-1.5 shrink-0 text-muted tabular-nums">
                    {starter.index}
                  </span>
                  <div className="min-w-0">
                    <h3 className="display-sm">{starter.name}</h3>
                    <p className="prose-body mt-2 max-w-[46ch] text-muted">
                      {starter.outcome}
                    </p>
                    <ul className="mt-4 flex flex-wrap gap-2">
                      {starter.tags.map((tag) => (
                        <li
                          key={tag}
                          className="meta rounded-full border border-ink/15 px-3 py-1 text-muted"
                        >
                          {tag}
                        </li>
                      ))}
                    </ul>
                    <p className="mt-5 flex items-center gap-2 text-sm font-medium">
                      Explore this starter
                      <span
                        aria-hidden="true"
                        className="transition-transform duration-200 group-hover:translate-x-1"
                      >
                        &rarr;
                      </span>
                    </p>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>

    </section>
  );
}

function RailButton({
  children,
  label,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-ink/20 transition-colors duration-200 hover:bg-ink hover:text-bone"
    >
      <span aria-hidden="true">{children}</span>
    </button>
  );
}
