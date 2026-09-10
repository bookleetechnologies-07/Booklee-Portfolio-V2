"use client";

import { useCallback, useRef, useState } from "react";

import { CalendlyEmbed } from "@/components/booking/CalendlyEmbed";
import { Signature } from "@/components/ui/Logo";
import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { gsap } from "@/lib/gsap";

/**
 * The booking interface, compact until someone asks for it.
 *
 * The scheduler used to be the first thing on the page: an 800px calendar
 * loading a third-party script before a visitor had read a sentence about what
 * the call is. This is the same scheduler, behind one button — the card states
 * the meeting and its length, and the calendar arrives inside the card when it
 * is wanted.
 *
 * The expansion is a measured height tween rather than a CSS transition,
 * because the height being animated to is `auto` and CSS cannot interpolate
 * that. The compact height is read before the state flips, the expanded height
 * after it, and the tween runs between the two before the inline height is
 * cleared — so the card grows into the calendar instead of the page jumping
 * around it. Under reduced motion the state simply changes.
 *
 * Nothing about the embed itself is rebuilt here: `CalendlyEmbed` still owns
 * the script, the theming and every failure path.
 */
export function BookingPanel({
  url,
  fallbackUrl,
  title,
  duration,
}: {
  /** From NEXT_PUBLIC_CALENDLY_URL. Empty string means no inline widget. */
  url: string;
  fallbackUrl: string;
  title: string;
  duration: string;
}) {
  const [open, setOpen] = useState(false);
  /**
   * Whether the calendar itself may start.
   *
   * Separate from `open` so the sequence is the one the card is meant to have:
   * the box is reserved and the card grows into it first, and Calendly is only
   * initialised once that space exists. Loading the widget into a box that is
   * still animating means the calendar lays itself out against a height that is
   * changing underneath it.
   */
  const [ready, setReady] = useState(false);
  const shellRef = useRef<HTMLDivElement>(null);
  /** The card's height at the moment the button was pressed. */
  const collapsedHeight = useRef(0);
  const reduceMotion = usePrefersReducedMotion();

  const expand = useCallback(() => {
    collapsedHeight.current = shellRef.current?.offsetHeight ?? 0;
    setOpen(true);
  }, []);

  useIsomorphicLayoutEffect(() => {
    if (!open) return;

    const shell = shellRef.current;
    const from = collapsedHeight.current;
    const to = shell?.offsetHeight ?? 0;

    // Nothing to animate: start the calendar straight away.
    if (!shell || !from || reduceMotion || to <= from) {
      setReady(true);
      return;
    }

    const tween = gsap.fromTo(
      shell,
      { height: from },
      {
        height: to,
        duration: 0.62,
        ease: "power2.inOut",
        onComplete: () => {
          // Back to `auto`, so the card keeps growing with the calendar once
          // Calendly has finished laying itself out.
          shell.style.height = "";
          setReady(true);
        },
      },
    );

    return () => {
      tween.kill();
      shell.style.height = "";
    };
  }, [open, reduceMotion]);

  return (
    <div
      ref={shellRef}
      className="overflow-hidden rounded-[18px] border border-white/12 bg-[#0a0a0b]"
    >
      {/* Booklee's own identity and the meeting facts. Calendly's event header
          is hidden by the embed, so this is where they are stated. */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 px-6 py-5">
        <Signature className="h-5 w-auto text-bone" title="Booklee Technologies" />
        <dl className="flex items-center gap-4">
          <div>
            <dt className="sr-only">Meeting</dt>
            <dd className="text-sm text-bone">{title}</dd>
          </div>
          <div>
            <dt className="sr-only">Duration</dt>
            <dd className="meta rounded-full border border-white/15 px-3 py-1 text-fog/70">
              {duration}
            </dd>
          </div>
        </dl>
      </div>

      {open ? (
        <div className="p-3 md:p-4">
          <CalendlyEmbed active={ready} url={url} fallbackUrl={fallbackUrl} />
          <p className="meta mt-3 px-2 pb-1 text-fog/45">
            Times are shown in your own timezone.
          </p>
        </div>
      ) : (
        <div className="p-6 md:p-8">
          <p className="prose-body text-fog/70">
            Pick a time that suits you. If nothing fits, say so in the notes and
            we will find something that does.
          </p>
          <button
            type="button"
            onClick={expand}
            className="mt-7 inline-flex h-12 items-center gap-2 rounded-[10px] bg-mint px-6 text-sm font-medium text-ink transition-transform duration-200 hover:-translate-y-0.5"
          >
            Schedule a call
            <span aria-hidden="true">&rarr;</span>
          </button>
          <p className="meta mt-5 text-fog/45">
            Prefer a plain link?{" "}
            <a
              href={fallbackUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="text-fog/70 underline underline-offset-4 hover:text-bone"
            >
              Open the scheduling page
            </a>
            .
          </p>
        </div>
      )}
    </div>
  );
}
