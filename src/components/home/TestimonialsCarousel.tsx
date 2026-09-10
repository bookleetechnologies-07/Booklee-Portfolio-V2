"use client";

import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

import { Eyebrow } from "@/components/ui/Eyebrow";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import {
  sampleNotes,
  publishedNotes,
  type ClientNote,
} from "@/content/testimonials";
import { cn } from "@/lib/cn";

/** How long a note is left alone before the rail moves on. */
const AUTOPLAY_MS = 6500;

/**
 * The card widths, and the trailing pad derived from them.
 *
 * These have to be read together, which is why they are next to each other: the
 * pad is `(viewport - card) / 2` at every breakpoint, and the percentages below
 * resolve against the shell exactly as the cards' own `basis` does.
 *
 * Why that expression. Embla clamps a contained rail's travel to
 * `-(contentSize - viewport)`, so widening the content is the only way to buy
 * the rail more travel — and how much is bought decides where it comes to rest.
 * Half the difference between the viewport and one card leaves roughly that
 * same half split around the last note. Measured at a 1440px viewport it lands
 * the note at 394–998 against a viewport centre of 720: centred to the eye,
 * with balanced space either side.
 *
 * The clamp has to bind on the last note and no other, and it does. It is
 * looser than the last note's own snap, so that note stops short of the page
 * margin and settles in the middle instead; and it is tighter than every
 * earlier snap, so those notes are untouched and still rest on the margin.
 */
const CARD_BASIS = "basis-[88%] md:basis-[62%] lg:basis-[46%]";
const END_PAD =
  "w-[calc((100vw-88%)/2)] md:w-[calc((100vw-62%)/2)] lg:w-[calc((100vw-46%)/2)]";

/**
 * One prominent note with its neighbours peeking in, advancing on its own.
 *
 * The section renders nothing at all when there is no approved content. That is
 * deliberate — an empty rail or a placeholder card that says "replace before
 * launch" both end up in front of real visitors, and neither is honest. Until
 * approved notes exist, the page simply does not claim social proof.
 */
export function TestimonialsCarousel() {
  const isDev = process.env.NODE_ENV === "development";
  const notes: ClientNote[] =
    publishedNotes.length > 0 ? publishedNotes : isDev ? sampleNotes : [];

  /*
   * Containment is off, and why the last note used to stop short.
   *
   * This rail is deliberately full-bleed — its viewport is the window while its
   * container is the shell — so cards run past the page margin on both sides.
   * That also means it has far less travel than it has content: three cards at
   * 46% of the shell come to roughly 1860px inside a 1440px viewport, so with
   * containment on the rail can only move about 500px, which is less than one
   * card.
   *
   * `trimSnaps` was fatal first: it discards any snap that would scroll past
   * the end, so a three-slide rail collapsed to two and the third note was
   * unreachable, permanently dimmed, with the counter stuck at 02 / 03.
   *
   * `keepSnaps` fixed the *bookkeeping* but not the movement. It keeps all
   * three snaps, so selecting the third note did set the counter to 03 and did
   * give that card full opacity — but it still clamps how far the rail may
   * travel, and both the second and third snaps sit past that clamp. The rail
   * stopped at -507px whichever of them was selected, which left the third note
   * pinned against the right edge of the window, clipped, and lit up as the
   * active card from a position no active card should ever be in. It read as
   * the carousel giving up one note early.
   *
   * Turning containment off entirely was tried and is worse: Embla then aligns
   * to the *viewport* rather than to the shell, so the last note slid flush
   * against the window's left edge — losing the page margin every other card
   * keeps — and stranded roughly 840px of blank paper to its right.
   *
   * So containment stays, and the rail is given the travel it was missing as
   * actual content: a trailing spacer, sized in `END_PAD` below. The clamp then
   * falls where the last note is genuinely well placed instead of where it ran
   * out of track.
   *
   * `loop` cannot help here for the same reason the snaps were trimmed: Embla
   * will not wrap a rail with less than a card of slack, and silently leaves it
   * alone. Autoplay wraps by scrolling back to the first note instead.
   */
  /*
   * Alignment is measured, not named.
   *
   * `align: "start"` lines a slide up with the start of the *viewport*, and
   * this rail's viewport is the whole window while its track is the shell. So
   * "start" meant the window's left edge: the first note kept the page margin
   * only because the rail cannot scroll backwards past zero, and every note
   * after it came to rest flush against the glass with no margin at all.
   *
   * Returning the track's own left padding instead aligns each note to the
   * shell's content edge — the same line the heading above it starts on — so
   * the first and second notes now stop in exactly the same place. Padding is
   * unaffected by the transform Embla writes on this element, which is what
   * makes it safe to read during measurement; anything positional would be
   * measured mid-scroll and feed the rail its own movement.
   */
  const trackRef = useRef<HTMLDivElement | null>(null);
  const alignToShell = useCallback(() => {
    const track = trackRef.current;
    if (!track) return 0;
    return Number.parseFloat(getComputedStyle(track).paddingLeft) || 0;
  }, []);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    active: notes.length > 1,
    loop: false,
    align: alignToShell,
    containScroll: "keepSnaps",
  });
  const [selected, setSelected] = useState(0);
  /** Autoplay holds while someone is reading or tabbing through the rail. */
  const [held, setHeld] = useState(false);
  /** And while the section is nowhere near the screen. */
  const [inView, setInView] = useState(false);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const reduceMotion = usePrefersReducedMotion();

  /*
   * Embla owns the viewport node and so does the observer below, so the ref is
   * shared rather than handed to whichever asked first.
   */
  const setViewport = useCallback(
    (node: HTMLDivElement | null) => {
      viewportRef.current = node;
      emblaRef(node);
    },
    [emblaRef],
  );

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

  /*
   * Autoplay: exactly one pending timer, always.
   *
   * `selected` is in the dependency list, so every advance — the timer's own,
   * an arrow, a keypress, a swipe — tears the timer down and schedules the next
   * one from that moment. There is no separate "reset" path that could leave a
   * second timer running, and the cleanup covers unmount as well as every
   * restart. It does not run at all under reduced motion, while the pointer or
   * focus is inside the rail, while the section is off screen, or when there is
   * only one note to show.
   *
   * At the last note it returns to the first rather than stopping, which is the
   * wrap this rail cannot get from Embla's own `loop`.
   */
  useEffect(() => {
    if (!emblaApi || reduceMotion || held || !inView || notes.length < 2) return;
    const timer = window.setTimeout(() => {
      if (emblaApi.canScrollNext()) emblaApi.scrollNext();
      else emblaApi.scrollTo(0);
    }, AUTOPLAY_MS);
    return () => window.clearTimeout(timer);
  }, [emblaApi, reduceMotion, held, inView, notes.length, selected]);

  /*
   * Autoplay only runs while the section is somewhere near the screen.
   *
   * Without this the rail advances on a page nobody has scrolled to yet, and a
   * visitor arriving a minute later finds it already on the third note with no
   * sign that there were two before it.
   */
  useEffect(() => {
    const node = viewportRef.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: "-10% 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

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

  if (notes.length === 0) return null;

  const total = notes.length;

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
            {/*
              Unchanged: the arrows still grey out at the ends of the rail. They
              simply now do it at the real ends — with the snaps trimmed away,
              the next arrow used to die on the second of three notes.
            */}
            <div className="flex gap-2">
              <NavButton label="Previous note" onClick={prev} disabled={selected === 0}>
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
        ref={setViewport}
        className="mt-12 overflow-hidden lg:mt-16"
        role="group"
        aria-roledescription="carousel"
        aria-label="Client notes"
        tabIndex={0}
        onKeyDown={onKeyDown}
        onMouseEnter={() => setHeld(true)}
        onMouseLeave={() => setHeld(false)}
        onFocusCapture={() => setHeld(true)}
        onBlurCapture={() => setHeld(false)}
      >
        <div ref={trackRef} className="shell flex">
          {notes.map((note, index) => (
            <figure
              key={note.id}
              role="group"
              aria-roledescription="slide"
              aria-label={`${index + 1} of ${total}`}
              className={cn(
                "mr-4 min-w-0 shrink-0 grow-0 md:mr-6",
                CARD_BASIS,
                "transition-opacity duration-300",
                index === selected ? "opacity-100" : "opacity-45",
              )}
            >
              <div className="flex h-full flex-col justify-between gap-8 rounded-[20px] border border-ink/10 bg-bone p-7 md:p-9">
                <blockquote className="display-sm text-ink">
                  <p>&ldquo;{note.quote}&rdquo;</p>
                </blockquote>
                <figcaption className="flex items-center gap-4 border-t border-ink/10 pt-5">
                  <Avatar note={note} />
                  <span className="flex flex-col">
                    <span className="text-sm font-medium text-ink">
                      {note.name}
                    </span>
                    <span className="meta text-muted">
                      {note.role}, {note.company}
                    </span>
                  </span>
                </figcaption>
              </div>
            </figure>
          ))}
          {/*
            The end pad. Not decoration — it is the rail's missing travel.

            Embla clamps how far a contained rail may move to
            `contentSize - viewportSize`, and with three cards that clamp landed
            long before the last note reached anywhere worth being. Widening the
            content widens the clamp, so this spacer is what decides where the
            rail comes to rest.

            Its width is half the gap between the viewport and one card, which
            works out — see the arithmetic in the comment on `END_PAD` — as the
            last note sitting centred with balanced space around it, while the
            notes before it still stop exactly where they always did. Because it
            is written in the same units as the card beside it, it re-solves
            itself at every breakpoint instead of needing a value per screen.
          */}
          <div aria-hidden="true" className={cn("shrink-0 grow-0", END_PAD)} />
        </div>
      </div>
    </section>
  );
}

function Avatar({ note }: { note: ClientNote }) {
  const initials = note.name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("");

  if (note.portrait) {
    return (
      <Image
        src={note.portrait}
        alt=""
        width={44}
        height={44}
        className="h-11 w-11 shrink-0 rounded-full object-cover"
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-ink/15 text-sm font-medium text-muted"
    >
      {initials}
    </span>
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
