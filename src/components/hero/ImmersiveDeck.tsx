"use client";

import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { ClientCapture } from "@/components/previews/ClientCapture";
import { ConceptPreview } from "@/components/previews";
import { previewStyles } from "@/components/previews/PreviewFrame";
import { PHRASE_SRC_ID } from "@/components/home/phrase-handoff";
import { deckSlides } from "@/content/deck";
import { CARD_BOX } from "@/lib/heroCard";
import { heroSignal, useDeckIndex } from "@/lib/heroState";
import { cn } from "@/lib/cn";

import styles from "./hero.module.css";

/**
 * The five concept websites, shown inside the laptop's display.
 *
 * One DOM tree serves both paths. On large screens the slides stack absolutely
 * and the hero timeline cross-cuts between them; on small screens the same
 * markup is a flex track that Embla makes swipeable. That is why there is no
 * second copy of the previews anywhere in the hero — and why nothing has to be
 * conditionally rendered, which is what used to let CRM flash on a cold load.
 *
 * On the cinematic path this element is not laid out where it appears. It is a
 * card of fixed size at the top-left of the scene, and the WebGL scene writes a
 * `matrix3d` onto it every frame that lands its four corners on the four
 * corners of the laptop's panel — so it is a website *on the screen*, inset
 * inside the bezel, rather than a full-viewport layer the camera flew into.
 *
 * It stays DOM rather than becoming a texture because these previews are real
 * designed pages built on container queries: they stay sharp at whatever size
 * the projection gives them, which no render target would.
 */
export function ImmersiveDeck({
  swipeable,
  className,
}: {
  /** True on the small-screen / reduced-motion path. */
  swipeable: boolean;
  className?: string;
}) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    active: swipeable,
    loop: false,
    align: "start",
    containScroll: "trimSnaps",
  });
  const [selected, setSelected] = useState(0);
  /*
   * The scrubbed path has no Embla to ask, so the caption reads the same
   * normalised progress the timeline is wiping the slides with.
   */
  const scrubbed = useDeckIndex();
  const current = swipeable ? selected : scrubbed;

  useEffect(() => {
    if (!emblaApi || !swipeable) return;
    const onSelect = () => setSelected(emblaApi.selectedScrollSnap());
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, swipeable]);

  /*
   * Hand the element to the render loop.
   *
   * A callback ref rather than an effect, so the scene has it from the moment
   * it exists and gives it back the instant it does not — the loop writes to
   * this element every frame and must never hold a detached node.
   */
  const deckRef = useRef<HTMLDivElement | null>(null);
  const setDeck = useCallback(
    (node: HTMLDivElement | null) => {
      deckRef.current = node;
      emblaRef(node);
      heroSignal.screenCard = swipeable ? null : node;
    },
    [emblaRef, swipeable],
  );

  useEffect(
    () => () => {
      heroSignal.screenCard = null;
    },
    [],
  );

  const prev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const next = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (!swipeable) return;
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        prev();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        next();
      }
    },
    [swipeable, prev, next],
  );

  return (
    <>
      <div
        ref={setDeck}
        data-hero="deck"
        className={cn(styles.deck, className)}
        role={swipeable ? "group" : undefined}
        aria-roledescription={swipeable ? "carousel" : undefined}
        aria-label="Booklee interface designs"
        tabIndex={swipeable ? 0 : -1}
        onKeyDown={onKeyDown}
        /*
         * The card's own box, from the same module the scene projects. Only the
         * cinematic branch of the stylesheet consumes these — on a phone the
         * deck is an ordinary full-width block — but they are set
         * unconditionally so the value is never out of step with the geometry
         * behind it.
         */
        style={
          {
            "--card-w": `${CARD_BOX.width}px`,
            "--card-h": `${CARD_BOX.height}px`,
          } as React.CSSProperties
        }
      >
        <div className={styles.track}>
          {deckSlides.map((slide, index) => (
            <div
              key={slide.slug}
              data-hero="slide"
              className={styles.slide}
              role={swipeable ? "group" : undefined}
              aria-roledescription={swipeable ? "slide" : undefined}
              aria-label={`${index + 1} of ${deckSlides.length}: ${slide.name}`}
            >
              {/*
                Two kinds of slide, one treatment. Both render through
                `PreviewFrame`, so the frame, the clipping and the aspect are
                identical and the wipe between them does not betray which is
                which.
              */}
              {slide.kind === "concept" ? (
                <ConceptPreview
                  slug={slide.slug}
                  className={previewStyles.fill}
                  phraseId={slide.slug === "erp" ? PHRASE_SRC_ID : undefined}
                />
              ) : (
                <ClientCapture
                  entry={slide.entry}
                  className={previewStyles.fill}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/*
        The caption sits outside the card, not in it.
        
        It used to be a child of the deck, which was harmless while the deck was
        the whole viewport. Now the deck is transformed onto the laptop's panel,
        and anything inside it goes along — so the caption would be squeezed
        into the website it is captioning and keystoned with it. It belongs to
        the frame, so it lives in the frame.
      */}
      <div className={styles.deckLabel} data-hero="deck-label">
        <p className={cn(styles.deckLabelInner, "eyebrow")} aria-live="polite">
          <span className="tabular-nums">{deckSlides[current].index}</span>
          <span aria-hidden="true" className="h-px w-5 bg-current opacity-50" />
          <span>{deckSlides[current].shortName}</span>
        </p>
      </div>

      {swipeable ? (
        <div className="mt-5 flex items-center justify-between gap-4">
          <p className="eyebrow flex items-center gap-2.5 text-fog/70" aria-live="polite">
            <span className="tabular-nums">
              {deckSlides[selected].index}
            </span>
            <span aria-hidden="true" className="h-px w-5 bg-current opacity-50" />
            <span>{deckSlides[selected].shortName}</span>
          </p>
          <div className="flex items-center gap-2">
            <DeckButton
              label="Previous design"
              onClick={prev}
              disabled={selected === 0}
            >
              &larr;
            </DeckButton>
            <DeckButton
              label="Next design"
              onClick={next}
              disabled={selected === deckSlides.length - 1}
            >
              &rarr;
            </DeckButton>
          </div>
        </div>
      ) : null}
    </>
  );
}

function DeckButton({
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
      className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 text-fog transition-[opacity,background-color] duration-200 hover:bg-white/10 disabled:opacity-30"
    >
      <span aria-hidden="true">{children}</span>
    </button>
  );
}
