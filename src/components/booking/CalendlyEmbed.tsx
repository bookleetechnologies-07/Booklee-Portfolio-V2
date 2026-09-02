"use client";

import { useCallback, useEffect, useRef, useState } from "react";

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
const TIMEOUT_MS = 8000;

type State = "idle" | "loading" | "ready" | "failed";

/**
 * Calendly, loaded only when it is genuinely wanted.
 *
 * Nothing third-party is requested until the section is close to the viewport
 * or the visitor asks for it, the widget is skipped entirely when no URL is
 * configured, and every failure path — blocked script, network error, slow
 * response — lands on the same plain scheduling link that works without any of
 * this. The page is never blocked on Calendly being reachable.
 */
export function CalendlyEmbed({
  url,
  fallbackUrl,
  className,
}: {
  /** From NEXT_PUBLIC_CALENDLY_URL. Empty string disables the widget. */
  url: string;
  /** TODO_CONTENT: confirm this scheduling link before launch. */
  fallbackUrl: string;
  className?: string;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<State>("idle");

  const load = useCallback(() => {
    if (!url) return;
    setState((current) => (current === "idle" ? "loading" : current));
  }, [url]);

  /**
   * Loading starts from a ref callback rather than an effect, so the observer
   * is attached the moment the node exists and nothing has to be synchronised
   * back into React state on mount.
   */
  const rootRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (!node || !url) return;

      if (typeof IntersectionObserver === "undefined") {
        load();
        return;
      }

      const observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            observer.disconnect();
            load();
          }
        },
        { rootMargin: "320px" },
      );
      observer.observe(node);
      return () => observer.disconnect();
    },
    [url, load],
  );

  useEffect(() => {
    if (state !== "loading" || !url) return;

    let cancelled = false;
    const timeout = window.setTimeout(() => {
      if (!cancelled) setState("failed");
    }, TIMEOUT_MS);

    const init = () => {
      if (cancelled) return;
      const host = hostRef.current;
      if (!host || !window.Calendly) {
        setState("failed");
        return;
      }
      try {
        host.replaceChildren();
        window.Calendly.initInlineWidget({ url, parentElement: host });
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
      existing.addEventListener(
        "error",
        () => !cancelled && setState("failed"),
        { once: true },
      );
    } else {
      const script = document.createElement("script");
      script.src = SCRIPT_SRC;
      script.async = true;
      script.addEventListener("load", init, { once: true });
      script.addEventListener(
        "error",
        () => !cancelled && setState("failed"),
        { once: true },
      );
      document.body.append(script);
    }

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [state, url]);

  const showFallbackCard = !url || state === "failed";

  return (
    <div ref={rootRef} className={cn("flex flex-col gap-4", className)}>
      {url ? (
        <>
          <div
            /* Height reserved up front so the page never shifts when the
               widget arrives. */
            style={{ minHeight: 680 }}
            className="relative overflow-hidden rounded-[20px] border border-ink/12 bg-bone"
            aria-busy={state === "loading"}
          >
            {/*
              Calendly replaces the contents of this node, so React must never
              render children into it. Anything React owns — the loading and
              failure states — is a sibling overlay instead. Sharing the node
              would end in a removeChild error the moment React tried to tidy
              up markup the widget had already replaced.
            */}
            <div ref={hostRef} className="h-full min-h-[680px]" />
            {state !== "ready" ? (
              <p className="meta absolute inset-0 grid place-items-center p-8 text-center text-muted">
                {state === "failed"
                  ? "The booking calendar could not load."
                  : "Loading the booking calendar…"}
              </p>
            ) : null}
          </div>
          <noscript>
            <p className="prose-body text-muted">
              The booking calendar needs JavaScript. Use the scheduling link
              below instead — it works without it.
            </p>
          </noscript>
        </>
      ) : null}

      {showFallbackCard ? (
        <div className="rounded-[20px] border border-ink/12 bg-bone p-7 md:p-9">
          <h3 className="display-sm">Book directly</h3>
          <p className="prose-body mt-3 text-muted">
            {url
              ? "The embedded calendar did not load — the scheduling page itself is unaffected."
              : "The embedded calendar is switched off in this environment. The scheduling page works normally."}
          </p>
          <a
            href={fallbackUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="mt-6 inline-flex h-12 items-center gap-2 rounded-full bg-ink px-6 text-sm font-medium text-bone transition-transform duration-200 hover:-translate-y-0.5"
          >
            Open the scheduling page
            <span aria-hidden="true">&rarr;</span>
          </a>
        </div>
      ) : (
        <p className="meta text-muted">
          Prefer a plain link?{" "}
          <a
            href={fallbackUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="underline underline-offset-4"
          >
            Open the scheduling page directly
          </a>
          .
        </p>
      )}
    </div>
  );
}
