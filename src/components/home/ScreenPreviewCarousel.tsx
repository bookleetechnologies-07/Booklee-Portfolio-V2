"use client";

import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useState } from "react";

import { ConceptPreview } from "@/components/previews";
import { previewStyles } from "@/components/previews/PreviewFrame";
import { projectCategories } from "@/content/projects";
import { cn } from "@/lib/cn";

type Props = {
  className?: string;
  /**
   * Wraps the carousel viewport, so the same component can appear inside the
   * laptop screen on the home page and on its own elsewhere. Controls always
   * render outside the frame, where they can be reached and read.
   */
  frame?: (viewport: React.ReactNode) => React.ReactNode;
  tone?: "dark" | "light";
};

/**
 * The small-screen and reduced-motion equivalent of the pinned laptop story:
 * the same five concepts in the same order, driven by the visitor rather than
 * by scroll position — swipe, buttons, or arrow keys. Nothing pins, nothing
 * hijacks touch scrolling, and no information depends on hover.
 */
export function ScreenPreviewCarousel({ className, frame, tone = "dark" }: Props) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: "center",
    containScroll: "trimSnaps",
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

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        scrollPrev();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        scrollNext();
      }
    },
    [scrollPrev, scrollNext],
  );

  const current = projectCategories[selected];
  const dark = tone === "dark";

  const viewport = (
    <div
      ref={emblaRef}
      className="h-full overflow-hidden"
      role="group"
      aria-roledescription="carousel"
      aria-label="Booklee concept website previews"
      tabIndex={0}
      onKeyDown={onKeyDown}
    >
      <div className="flex h-full">
        {projectCategories.map((project, index) => (
          <div
            key={project.slug}
            className="h-full min-w-0 shrink-0 grow-0 basis-full"
            role="group"
            aria-roledescription="slide"
            aria-label={`${index + 1} of ${projectCategories.length}: ${project.name}`}
          >
            <ConceptPreview
              slug={project.slug}
              className={previewStyles.fill}
            />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className={cn("flex flex-col gap-5", className)}>
      {frame ? frame(viewport) : viewport}

      <div className="flex items-center justify-between gap-4">
        <p
          className={cn(
            "eyebrow flex items-center gap-2.5",
            dark ? "text-fog/70" : "text-ink/60",
          )}
          aria-live="polite"
        >
          <span className="tabular-nums">{current.index}</span>
          <span aria-hidden="true" className="h-px w-5 bg-current opacity-50" />
          <span>{current.shortName}</span>
        </p>

        <div className="flex items-center gap-2">
          <CarouselButton
            label="Previous concept"
            onClick={scrollPrev}
            disabled={selected === 0}
            dark={dark}
          >
            &larr;
          </CarouselButton>
          <CarouselButton
            label="Next concept"
            onClick={scrollNext}
            disabled={selected === projectCategories.length - 1}
            dark={dark}
          >
            &rarr;
          </CarouselButton>
        </div>
      </div>
    </div>
  );
}

function CarouselButton({
  children,
  label,
  onClick,
  disabled,
  dark,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  dark: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={cn(
        "inline-flex h-11 w-11 items-center justify-center rounded-full border transition-[opacity,background-color] duration-200 disabled:opacity-30",
        dark
          ? "border-white/20 text-fog hover:bg-white/10"
          : "border-ink/20 text-ink hover:bg-ink/5",
      )}
    >
      <span aria-hidden="true">{children}</span>
    </button>
  );
}
