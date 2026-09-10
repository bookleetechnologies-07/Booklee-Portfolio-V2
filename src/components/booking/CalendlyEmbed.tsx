"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/cn";

type CalendlyGlobal = {
  initInlineWidget: (options: {
    url: string;
    parentElement: HTMLElement;
  }) => void;
};

declare global {
  interface Window {
    Calendly?: CalendlyGlobal;
  }
}

const SCRIPT_SRC = "https://assets.calendly.com/assets/external/widget.js";
const STYLE_HREF = "https://assets.calendly.com/assets/external/widget.css";
const TIMEOUT_MS = 9000;

/**
 * There is no "idle": the component is mounted by the booking card at the
 * moment the calendar is wanted, so loading is the state it starts in. Tracking
 * a not-yet-asked state as well meant one effect existing only to move from it
 * to the next one, which is a cascading render for nothing.
 */
type State = "loading" | "ready" | "failed";

/**
 * Calendly's own embed options, so the scheduler sits inside the Booklee page
 * instead of arriving as a white card. The event header is hidden because the
 * page already states the meeting title and length above the calendar; the
 * timezone selector stays, because that is Calendly's to control.
 */
function themedUrl(url: string): string {
  try {
    const next = new URL(url);
    /*
     * The event header stays.
     *
     * It used to be hidden, on the reasoning that the card above already states
     * the meeting and its length. But the header is also where Calendly puts
     * the organiser — "Booklee Technologies", "30 Minute Meeting" — and without
     * it the embed opens on a bare month grid that could belong to anyone. The
     * previous Booklee site embedded the widget with its defaults for the same
     * reason, and a little duplication with the card is the smaller cost.
     */
    next.searchParams.set("hide_gdpr_banner", "1");
    next.searchParams.set("background_color", "0a0a0b");
    next.searchParams.set("text_color", "fafaf7");
    next.searchParams.set("primary_color", "cbefae");
    return next.toString();
  } catch {
    return url;
  }
}

/**
 * Calendly, loaded only when it is genuinely wanted.
 *
 * Nothing third-party is requested until the booking card is opened, the widget
 * is skipped entirely when no URL is configured, and every failure path —
 * blocked script, network error, slow response — lands on the same plain
 * scheduling link that works without any of it.
 */
export function CalendlyEmbed({
  url,
  fallbackUrl,
  active = false,
  className,
}: {
  /** From NEXT_PUBLIC_CALENDLY_URL. Empty string disables the widget. */
  url: string;
  /** TODO_CONTENT: confirm this scheduling link before launch. */
  fallbackUrl: string;
  /**
   * Whether the calendar is wanted yet. The booking card mounts this only once
   * it has been opened, so this is what starts the script — a viewport check
   * would be wrong now that the embed is revealed by a button rather than by
   * scrolling to it.
   */
  active?: boolean;
  className?: string;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<State>("loading");

  useEffect(() => {
    if (!active || !url) return;

    let cancelled = false;
    /*
     * The deadline only applies while the calendar has not arrived.
     *
     * It used to fire regardless: nine seconds after loading began it set
     * "failed" whether or not the widget was up, so a calendar that had mounted
     * and was already fetching availability was declared broken and replaced by
     * the plain-link card. It went unnoticed for as long as failure left the
     * calendar on screen — the moment failing also removed it, a working
     * booking flow started collapsing a few seconds after it appeared.
     */
    const timeout = window.setTimeout(() => {
      if (!cancelled) {
        setState((current) => (current === "ready" ? current : "failed"));
      }
    }, TIMEOUT_MS);

    const init = () => {
      if (cancelled) return;
      const host = hostRef.current;
      if (!host || !window.Calendly) {
        setState("failed");
        return;
      }
      try {
        /*
         * Calendly's script claims every `.calendly-inline-widget[data-url]`
         * on the page when it loads, so the node may already be mounted by the
         * time this runs. Initialising it a second time would tear the calendar
         * down and rebuild it; this call is here for the case auto-init cannot
         * cover — the script already being loaded when the card is opened,
         * which is every open after the first.
         */
        if (!host.querySelector("iframe")) {
          window.Calendly.initInlineWidget({
            url: themedUrl(url),
            parentElement: host,
          });
        }
        window.clearTimeout(timeout);
        setState("ready");
      } catch {
        setState("failed");
      }
    };

    if (!document.querySelector(`link[href="${STYLE_HREF}"]`)) {
      const style = document.createElement("link");
      style.rel = "stylesheet";
      style.href = STYLE_HREF;
      document.head.append(style);
    }

    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${SCRIPT_SRC}"]`,
    );

    if (window.Calendly) {
      init();
    } else if (existing) {
      existing.addEventListener("load", init, { once: true });
      existing.addEventListener("error", () => !cancelled && setState("failed"), {
        once: true,
      });
    } else {
      const script = document.createElement("script");
      script.src = SCRIPT_SRC;
      script.async = true;
      script.addEventListener("load", init, { once: true });
      script.addEventListener("error", () => !cancelled && setState("failed"), {
        once: true,
      });
      document.body.append(script);
    }

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [active, url]);

  const showFallbackCard = !url || state === "failed";

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {/*
        The reserved box goes away when the widget fails.

        Its height exists to stop the card jumping while the calendar loads, so
        once there is no calendar coming it is 820px of nothing above a card
        that already explains what to do instead.
      */}
      {url && state !== "failed" ? (
        <>
          <div
            /* Height reserved up front so the card never shifts once it has
               expanded, and tall enough that Calendly renders the calendar
               without a nested scrollbar at common viewport sizes. */
            className="relative min-h-[760px] overflow-hidden rounded-[12px] bg-[#0a0a0b] md:min-h-[820px]"
            aria-busy={state === "loading"}
          >
            {/*
              Calendly replaces the contents of this node, so React must never
              render children into it. Anything React owns is a sibling overlay
              instead; sharing the node ends in a removeChild error the moment
              React tidies up markup the widget has already replaced.
            */}
            {/*
              The iframe is sized here rather than by Calendly.

              `initInlineWidget` injects a bare iframe and leaves the sizing to
              `widget.css`, which only matches a parent carrying Calendly's own
              `calendly-inline-widget` class. Injecting into an arbitrary node
              means no rule matches it and the iframe falls back to the HTML
              default of 150px — a scheduler four fifths of an inch tall inside
              an 820px box that had been reserved for it. Stating the rule here
              makes the embed independent of a third-party stylesheet loading at
              all, which is the same reason nothing else in this component
              depends on one.
            */}
            <div
              ref={hostRef}
              /*
                The node Calendly recognises, exactly as the previous Booklee
                site declared it: the `calendly-inline-widget` class plus a
                `data-url`. Both are required together — the class is what the
                script scans for and `widget.css` sizes through, and the
                attribute is where it reads the event from. The class on its own
                is worse than neither, because auto-init finds the node, reads a
                `data-url` that is not there and throws on `null.split`, which
                took the whole widget down and dropped the card into its
                "calendar unavailable" state.

                The URL carries the theme, so the calendar is the same dark
                widget whichever path mounts it — the script's own sweep on
                load, or the explicit call above.

                The size rules after the class do what `widget.css` would, so
                the calendar is right even if that stylesheet never arrives.
              */
              className="calendly-inline-widget h-full min-h-[760px] md:min-h-[820px] [&>iframe]:h-full [&>iframe]:min-h-[760px] [&>iframe]:w-full [&>iframe]:border-0 md:[&>iframe]:min-h-[820px]"
              data-url={themedUrl(url)}
            />
            {/* Only "loading" can reach this: the box above is not rendered at
                all once the widget has failed, so the failure is described by
                the card that replaces it rather than by a line inside a frame
                that is never going to fill. */}
            {state !== "ready" ? (
              <p className="meta absolute inset-0 grid place-items-center p-8 text-center text-fog/60">
                Loading the booking calendar…
              </p>
            ) : null}
          </div>
          <noscript>
            <p className="prose-body text-fog/70">
              The booking calendar needs JavaScript. Use the scheduling link
              below instead — it works without it.
            </p>
          </noscript>
        </>
      ) : null}

      {/*
        No inline calendar, either because none is configured or because it
        could not load. Both land here, and neither says so: what a visitor
        needs is the way to pick a time, not a report on the widget.
      */}
      {showFallbackCard ? (
        <div className="rounded-[12px] bg-[#0a0a0b] px-4 py-6 md:px-6 md:py-8">
          <h3 className="display-sm text-bone">Pick a time</h3>
          <p className="prose-body mt-3 text-fog/70">
            Our scheduling page has the same times and opens in a new tab.
          </p>
          <a
            href={fallbackUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="mt-6 inline-flex h-12 items-center gap-2 rounded-[10px] bg-mint px-6 text-sm font-medium text-ink transition-transform duration-200 hover:-translate-y-0.5"
          >
            Open the scheduling page
            <span aria-hidden="true">&rarr;</span>
          </a>
        </div>
      ) : (
        <p className="meta px-2 text-fog/55">
          Prefer a plain link?{" "}
          <a
            href={fallbackUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="text-bone underline underline-offset-4"
          >
            Open the scheduling page directly
          </a>
          .
        </p>
      )}
    </div>
  );
}
