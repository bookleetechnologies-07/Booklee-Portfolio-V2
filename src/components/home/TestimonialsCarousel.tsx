"use client";

import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useState } from "react";

import { Eyebrow } from "@/components/ui/Eyebrow";
import {
  PLACEHOLDER_BADGE,
  testimonials,
} from "@/content/testimonials";
import { cn } from "@/lib/cn";

/**
 * One prominent review with its neighbours peeking in. No autoplay at all —
 * an unattended carousel that moves while someone is reading is a usability
 * problem, and the spec's 7-second floor exists to make that less bad rather
 * than to make it good.
 */
export function TestimonialsCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    // Start-aligned so the prominent card sits on the page's left margin and
    // the next one peeks in, instead of leaving dead space beside the first.
    align: "start",
    containScroll: "trimSnaps",
    skipSnaps: false,
  });
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelected(emblaApi.selectedScrollSnap());
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi]);

  const prev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const next = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        prev();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        next();
      }
    },
    [prev, next],
  );

  const total = testimonials.length;

  return (
    <section
      data-nav-theme="light"
      aria-labelledby="notes-heading"
      className="paper-tooth grain relative overflow-hidden bg-paper pt-[clamp(4.5rem,9vw,10rem)] pb-[clamp(3.5rem,6vw,6rem)]"
    >
      <div className="shell">
        <div className="flex flex-wrap items-end justify-between gap-8">
          <div>
            <Eyebrow>Client notes</Eyebrow>
            <h2 id="notes-heading" className="display-lg mt-6 max-w-[16ch]">
              Good work should feel good to make.
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <p className="meta text-muted tabular-nums" aria-live="polite">
              {String(selected + 1).padStart(2, "0")}{" "}
              <span aria-hidden="true">/</span>{" "}
              {String(total).padStart(2, "0")}
            </p>
            <div className="flex gap-2">
              <NavButton
                label="Previous note"
                onClick={prev}
                disabled={selected === 0}
              >
                &larr;
              </NavButton>
              <NavButton
                label="Next note"
                onClick={next}
                disabled={selected === total - 1}
              >
                &rarr;
              </NavButton>
            </div>
          </div>
        </div>
      </div>

      <div
        ref={emblaRef}
        className="mt-12 overflow-hidden lg:mt-16"
        role="group"
        aria-roledescription="carousel"
        aria-label="Client notes"
        tabIndex={0}
        onKeyDown={onKeyDown}
      >
        <div className="shell flex">
          {testimonials.map((note, index) => (
            <figure
              key={note.id}
              role="group"
              aria-roledescription="slide"
              aria-label={`${index + 1} of ${total}`}
              className={cn(
                "mr-4 min-w-0 shrink-0 grow-0 basis-[88%] md:mr-6 md:basis-[62%] lg:basis-[46%]",
                "transition-opacity duration-300",
                index === selected ? "opacity-100" : "opacity-45",
              )}
            >
              <div className="flex h-full flex-col justify-between gap-8 rounded-[20px] border border-ink/10 bg-bone p-7 md:p-9">
                <div>
                  {note.placeholder ? (
                    <p className="eyebrow mb-6 inline-flex rounded-full bg-butter px-3 py-1.5 text-ink">
                      {PLACEHOLDER_BADGE}
                    </p>
                  ) : null}
                  <blockquote className="display-sm text-ink">
                    <p>&ldquo;{note.quote}&rdquo;</p>
                  </blockquote>
                </div>
                <figcaption className="flex items-center justify-between gap-4 border-t border-ink/10 pt-5">
                  <span className="text-sm text-muted">{note.attribution}</span>
                  <span className="meta text-muted">{note.context}</span>
                </figcaption>
              </div>
            </figure>
          ))}
        </div>
      </div>

      <div className="shell">
        <p className="meta mt-10 max-w-[60ch] text-muted">
          {/* TODO_CONTENT: replace with approved client quotes, or delete this
              section entirely, before launch. */}
          These notes are written by Booklee to show the shape of a real review.
          They are not client feedback and no client is named.
        </p>
      </div>
    </section>
  );
}

function NavButton({
  children,
  label,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-ink/20 transition-colors duration-200 hover:bg-ink hover:text-bone disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-ink"
    >
      <span aria-hidden="true">{children}</span>
    </button>
  );
}
