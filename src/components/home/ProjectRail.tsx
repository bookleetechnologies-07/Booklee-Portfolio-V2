"use client";

import Link from "next/link";
import { useCallback, useRef } from "react";

import { OFFERED_SECTION_ID, PHRASE_DEST_ID } from "@/components/home/phrase-handoff";
import { ConceptPreview } from "@/components/previews";
import { Reveal } from "@/components/ui/Reveal";
import { projectCategories } from "@/content/projects";
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
 * The rail converts vertical scroll into horizontal travel on large screens,
 * and is a plain scroll-snapping overflow container everywhere else.
 *
 * Two rules keep the desktop version from becoming a scroll trap: the previous
 * and next controls are real buttons that move the page, and focusing a panel
 * scrolls it into view, so a keyboard user is never left looking at a card that
 * has been translated off screen.
 */
export function ProjectRail() {
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
          const distance = () =>
            Math.max(0, track.scrollWidth - viewport.clientWidth);

          const tween = gsap.to(track, {
            x: () => -distance(),
            ease: "none",
            scrollTrigger: {
              trigger: viewport,
              start: "top top",
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
    index.current = Math.min(
      Math.max(next, 0),
      projectCategories.length - 1,
    );

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
      <div className="shell pt-[clamp(4.5rem,9vw,9rem)] pb-[clamp(2.5rem,4vw,4rem)]">
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
            <p className="display-md mt-4 max-w-[18ch] text-muted">
              Five starting points. None of them templates.
            </p>
          </div>

          <div className="col-span-4 md:col-span-8 lg:col-span-5 lg:justify-self-end">
            <p className="prose-body max-w-[42ch] text-muted">
              Each of these is a concept we have designed and built to show how
              we work. Every one of them would change shape for your business —
              that is rather the point.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <RailButton label="Previous concept" onClick={() => step(-1)}>
                &larr;
              </RailButton>
              <RailButton label="Next concept" onClick={() => step(1)}>
                &rarr;
              </RailButton>
              <Link
                href="/projects"
                className="ml-2 text-sm font-medium underline-offset-[6px] hover:underline"
              >
                All projects
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
          "no-scrollbar snap-rail w-full overflow-x-auto pb-[clamp(3rem,6vw,6rem)]",
          "lg:flex lg:h-screen lg:items-center lg:overflow-hidden lg:pb-0",
        )}
      >
        <div
          ref={trackRef}
          className="flex w-max gap-5 px-6 md:gap-6 md:px-10 xl:px-16"
        >
          {projectCategories.map((project, position) => (
            <Link
              key={project.slug}
              data-panel=""
              href={`/projects/${project.slug}`}
              /* An explicit name, so the link is not announced as the concept
                 preview's long image description followed by the copy. */
              aria-label={`${project.name} — ${project.label}. ${project.outcome}`}
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
                  style={{ backgroundColor: ACCENT[project.accent] }}
                >
                  <div className="p-3 md:p-4">
                    <ConceptPreview
                      slug={project.slug}
                      className="rounded-[12px]"
                    />
                  </div>
                </div>

                <div className="mt-5 flex items-start gap-4 md:gap-6">
                  <span className="eyebrow mt-1.5 shrink-0 text-muted tabular-nums">
                    {project.index}
                  </span>
                  <div className="min-w-0">
                    <h3 className="display-sm">{project.name}</h3>
                    <p className="prose-body mt-2 max-w-[46ch] text-muted">
                      {project.outcome}
                    </p>
                    <ul className="mt-4 flex flex-wrap gap-2">
                      {project.tags.map((tag) => (
                        <li
                          key={tag}
                          className="meta rounded-full border border-ink/15 px-3 py-1 text-muted"
                        >
                          {tag}
                        </li>
                      ))}
                    </ul>
                    <p className="mt-5 flex items-center gap-2 text-sm font-medium">
                      View project
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

      <Reveal className="shell pb-[clamp(3rem,6vw,6rem)]">
        <p className="meta text-muted">
          Concept and demo builds — not client case studies.
        </p>
      </Reveal>
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
