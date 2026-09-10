import Image from "next/image";

import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/ui/Reveal";
import { RevealText } from "@/components/ui/RevealText";
import { portfolioEntries, type PortfolioEntry } from "@/content/portfolio";
import { cn } from "@/lib/cn";

const ACCENT: Record<string, string> = {
  lilac: "var(--accent-lilac)",
  blue: "var(--accent-blue)",
  yellow: "var(--accent-yellow)",
  mint: "var(--accent-mint)",
  coral: "var(--accent-coral)",
};

/**
 * Client work, set as an editorial sequence rather than a card grid.
 *
 * Each entry gets a full row of the shell: an oversized plate on one side, the
 * writing on the other, alternating down the page so the eye is not asked to
 * scan a repeating grid. There are no iframes — a live third-party page inside
 * this one would be slow, unstable and outside our control — so the plate is
 * either an approved screenshot or a typographic composition standing in for it.
 */
export function PortfolioGallery() {
  return (
    <section
      data-nav-theme="light"
      aria-labelledby="portfolio-list-heading"
      className="bg-bone"
    >
      <h2 id="portfolio-list-heading" className="sr-only">
        Selected client work
      </h2>

      <ul>
        {portfolioEntries.map((entry, index) => (
          <li key={entry.slug} className="border-t border-ink/10 first:border-t-0">
            <article
              className={cn(
                "shell grid-12 items-center gap-y-10 py-[clamp(3rem,6vw,6.5rem)]",
              )}
            >
              <div
                className={cn(
                  "col-span-4 md:col-span-8 lg:col-span-7",
                  index % 2 === 1 && "lg:order-2 lg:col-start-6",
                )}
              >
                <Plate entry={entry} priority={index === 0} />
              </div>

              <div
                className={cn(
                  "col-span-4 md:col-span-8 lg:col-span-4",
                  index % 2 === 1 ? "lg:order-1 lg:col-start-1" : "lg:col-start-9",
                )}
              >
                <div className="flex items-center gap-4">
                  <span className="meta text-muted tabular-nums">
                    {entry.index}
                  </span>
                  <span
                    aria-hidden="true"
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: ACCENT[entry.accent] }}
                  />
                  <span className="meta text-muted">{entry.category}</span>
                </div>

                <RevealText as="h3" className="display-lg mt-5">
                  {entry.client}
                </RevealText>

                {entry.descriptor ? (
                  <p className="display-sm mt-3 text-muted">{entry.descriptor}</p>
                ) : null}

                <Reveal>
                  <p className="prose-body mt-6 text-muted">{entry.description}</p>

                  <a
                    href={entry.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group mt-8 inline-flex h-12 items-center gap-2.5 rounded-full bg-ink px-6 text-sm font-medium text-bone transition-transform duration-200 hover:-translate-y-0.5"
                  >
                    Visit site
                    <span
                      aria-hidden="true"
                      className="transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    >
                      &#8599;
                    </span>
                    {/* The new tab is announced rather than sprung on people. */}
                    <span className="sr-only">
                      {entry.client} — opens in a new tab
                    </span>
                  </a>

                  <p className="meta mt-4 text-muted">{entry.displayUrl}</p>
                </Reveal>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}

/**
 * The plate. An approved capture when one exists, and a typographic
 * composition when it does not — never a broken image and never an empty box.
 */
function Plate({
  entry,
  priority,
}: {
  entry: PortfolioEntry;
  priority: boolean;
}) {
  const accent = ACCENT[entry.accent];

  return (
    <figure className="m-0">
      <div
        className="overflow-hidden rounded-[24px] p-3 md:p-4"
        style={{ backgroundColor: accent }}
      >
        {entry.preview ? (
          <Image
            src={entry.preview.src}
            width={entry.preview.width}
            height={entry.preview.height}
            alt={entry.preview.alt}
            priority={priority}
            sizes="(min-width: 1024px) 56vw, (min-width: 768px) 88vw, 92vw"
            className="h-auto w-full rounded-[14px]"
          />
        ) : (
          <TypographicPlate entry={entry} />
        )}
      </div>

      {entry.preview ? (
        <figcaption className="meta mt-4 text-muted">
          {entry.displayUrl} — captured {entry.preview.capturedOn}
        </figcaption>
      ) : null}
    </figure>
  );
}

/**
 * Stand-in composition, used until an approved screenshot is supplied.
 *
 * It is built to be a legitimate editorial plate in its own right rather than
 * an obvious gap: the client's name set large on their accent, with the live
 * address beneath it. Nothing here claims to be a screenshot, and no
 * implementation-facing "pending" wording is shown to a visitor.
 */
function TypographicPlate({ entry }: { entry: PortfolioEntry }) {
  return (
    <div
      className="relative flex aspect-[16/10] flex-col justify-between overflow-hidden rounded-[14px] bg-bone p-[6%]"
      role="img"
      aria-label={`${entry.client} — ${entry.category}. Live at ${entry.displayUrl}.`}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 [background:radial-gradient(120%_90%_at_85%_8%,rgba(0,0,0,0.05),transparent_58%)]"
      />
      <Eyebrow className="relative text-muted">{entry.category}</Eyebrow>
      <p
        aria-hidden="true"
        className="display-lg relative mt-auto max-w-[14ch] text-ink"
      >
        {entry.client}
      </p>
      <p aria-hidden="true" className="meta relative mt-4 text-muted">
        {entry.displayUrl}
      </p>
    </div>
  );
}
