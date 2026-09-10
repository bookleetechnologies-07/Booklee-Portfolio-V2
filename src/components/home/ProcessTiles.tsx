"use client";

import { useRef } from "react";

import { Eyebrow } from "@/components/ui/Eyebrow";
import { RevealText } from "@/components/ui/RevealText";
import { processSteps } from "@/content/services";
import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";
import { gsap } from "@/lib/gsap";
import { cn } from "@/lib/cn";

/*
 * Four process tiles, each with a motion graphic that explains its step.
 *
 * The SVG markup is authored as the *finished* state and GSAP animates
 * backwards from a scattered one with `gsap.from`. That means reduced-motion
 * users, and anyone whose JavaScript has not run, see the meaningful end state
 * of every graphic rather than an empty box — no separate static variant to
 * keep in sync.
 *
 * Nothing here pins. Each tile drives its own graphic from its own position in
 * the viewport, which keeps the section scrollable at normal speed.
 */

const VIEW = "0 0 240 140";

function DiscoveryArt() {
  // Scattered origins for the converging nodes, in viewBox units.
  const nodes = [
    { x: 120, y: 42, fx: -70, fy: -34 },
    { x: 152, y: 62, fx: 62, fy: -46 },
    { x: 146, y: 96, fx: 74, fy: 30 },
    { x: 108, y: 104, fx: -18, fy: 44 },
    { x: 88, y: 76, fx: -78, fy: 16 },
    { x: 136, y: 78, fx: 46, fy: 52 },
    { x: 104, y: 58, fx: -44, fy: -50 },
  ];

  return (
    <svg viewBox={VIEW} className="h-full w-full" aria-hidden="true">
      <g stroke="currentColor" fill="none" opacity="0.35">
        {[38, 26, 14].map((r) => (
          <circle
            key={r}
            data-art="ring"
            cx="120"
            cy="70"
            r={r}
            pathLength="1"
            strokeDasharray="1"
            strokeWidth="1"
          />
        ))}
      </g>
      {nodes.map((node, i) => (
        <circle
          key={i}
          data-art="node"
          data-fx={node.fx}
          data-fy={node.fy}
          cx={node.x}
          cy={node.y}
          r="2.6"
          fill="currentColor"
        />
      ))}
      <circle data-art="core" cx="120" cy="70" r="5" fill="var(--color-mint)" />
    </svg>
  );
}

function DesignArt() {
  const blocks = [
    { x: 40, y: 26, w: 92, h: 9, fx: -30, fy: -16, r: -7 },
    { x: 40, y: 42, w: 62, h: 6, fx: -44, fy: 10, r: 5 },
    { x: 40, y: 56, w: 74, h: 6, fx: -22, fy: 26, r: -4 },
    { x: 40, y: 78, w: 46, h: 32, fx: -36, fy: 34, r: 6 },
    { x: 94, y: 78, w: 46, h: 32, fx: 30, fy: 40, r: -6 },
    { x: 150, y: 26, w: 50, h: 84, fx: 52, fy: -22, r: 8 },
  ];

  return (
    <svg viewBox={VIEW} className="h-full w-full" aria-hidden="true">
      {/* The grid the fragments resolve onto. */}
      <g stroke="currentColor" opacity="0.16">
        {[40, 94, 150, 200].map((x) => (
          <line key={x} data-art="guide" x1={x} y1="18" x2={x} y2="122" strokeWidth="0.75" />
        ))}
      </g>
      {blocks.map((block, i) => (
        <rect
          key={i}
          data-art="block"
          data-fx={block.fx}
          data-fy={block.fy}
          data-fr={block.r}
          x={block.x}
          y={block.y}
          width={block.w}
          height={block.h}
          rx="2.5"
          fill="currentColor"
          opacity={i === 5 ? 0.9 : 0.55}
        />
      ))}
    </svg>
  );
}

function BuildArt() {
  return (
    <svg viewBox={VIEW} className="h-full w-full" aria-hidden="true">
      {/* Structural layers assembling underneath. */}
      {[
        { y: 96, o: 0.2 },
        { y: 86, o: 0.3 },
        { y: 76, o: 0.42 },
      ].map((layer, i) => (
        <rect
          key={i}
          data-art="layer"
          x={54 - i * 6}
          y={layer.y}
          width={132 + i * 12}
          height="8"
          rx="2"
          fill="currentColor"
          opacity={layer.o}
        />
      ))}

      {/* The working window they add up to. */}
      <g data-art="window">
        <rect
          x="58"
          y="24"
          width="124"
          height="46"
          rx="4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.25"
          opacity="0.75"
        />
        <line x1="58" y1="36" x2="182" y2="36" stroke="currentColor" strokeWidth="1" opacity="0.5" />
        {[66, 73, 80].map((cx) => (
          <circle key={cx} cx={cx} cy="30" r="1.7" fill="currentColor" opacity="0.6" />
        ))}
        <rect x="68" y="46" width="52" height="5" rx="2" fill="currentColor" opacity="0.45" />
        <rect x="68" y="56" width="34" height="5" rx="2" fill="currentColor" opacity="0.3" />
      </g>

      {/* Completion line. */}
      <rect x="54" y="116" width="132" height="2" rx="1" fill="currentColor" opacity="0.18" />
      <rect
        data-art="progress"
        x="54"
        y="116"
        width="132"
        height="2"
        rx="1"
        fill="var(--color-mint)"
      />
    </svg>
  );
}

function ImproveArt() {
  return (
    <svg viewBox={VIEW} className="h-full w-full" aria-hidden="true">
      {/* The iteration loop. */}
      <path
        data-art="loop"
        d="M78 70a30 30 0 1 1 12 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity="0.55"
        pathLength="1"
        strokeDasharray="1"
      />
      <path
        data-art="loopHead"
        d="M84 88l6 8 9-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.55"
      />

      {/* A line that gets better. No numbers, because there is no claim. */}
      <path
        data-art="trend"
        d="M132 104l14-8 14 4 14-16 14-6 14-22"
        fill="none"
        stroke="var(--color-mint)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength="1"
        strokeDasharray="1"
      />
      <circle data-art="trendEnd" cx="202" cy="56" r="3.5" fill="var(--color-mint)" />
      <line x1="132" y1="112" x2="210" y2="112" stroke="currentColor" strokeWidth="0.75" opacity="0.25" />
    </svg>
  );
}

const ART = [DiscoveryArt, DesignArt, BuildArt, ImproveArt];

export function ProcessTiles({
  eyebrow = "How we work",
  heading = "Four steps, and none of them are a surprise.",
}: {
  eyebrow?: string;
  heading?: string;
}) {
  const sectionRef = useRef<HTMLElement>(null);

  useIsomorphicLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const context = gsap.context(() => {
      const media = gsap.matchMedia();

      media.add("(prefers-reduced-motion: no-preference)", () => {
        const tiles = gsap.utils.toArray<HTMLElement>("[data-tile]", section);
        const num = (el: Element, key: string) =>
          Number((el as HTMLElement).dataset[key] ?? 0);

        tiles.forEach((tile, index) => {
          const q = gsap.utils.selector(tile);
          const timeline = gsap.timeline({
            defaults: { ease: "power2.out" },
            scrollTrigger: {
              trigger: tile,
              start: "top 88%",
              end: "top 42%",
              scrub: 0.6,
            },
          });

          if (index === 0) {
            // Discovery — fragments converge, then the target draws in.
            timeline
              .from(q("[data-art='node']"), {
                x: (_i, el: Element) => num(el, "fx"),
                y: (_i, el: Element) => num(el, "fy"),
                opacity: 0,
                duration: 1,
                stagger: 0.06,
              })
              .from(
                q("[data-art='ring']"),
                { strokeDashoffset: 1, duration: 0.8, stagger: 0.1 },
                0.3,
              )
              .from(
                q("[data-art='core']"),
                { scale: 0, transformOrigin: "120px 70px", duration: 0.5 },
                0.7,
              );
          } else if (index === 1) {
            // Design — misaligned pieces snap onto the grid.
            timeline
              .from(q("[data-art='guide']"), {
                scaleY: 0,
                transformOrigin: "50% 50%",
                duration: 0.6,
                stagger: 0.05,
              })
              .from(
                q("[data-art='block']"),
                {
                  x: (_i, el: Element) => num(el, "fx"),
                  y: (_i, el: Element) => num(el, "fy"),
                  rotate: (_i, el: Element) => num(el, "fr"),
                  opacity: 0,
                  transformOrigin: "50% 50%",
                  duration: 1,
                  stagger: 0.07,
                },
                0,
              );
          } else if (index === 2) {
            // Build — layers stack, the window resolves, the line completes.
            timeline
              .from(q("[data-art='layer']"), {
                y: 16,
                opacity: 0,
                duration: 0.7,
                stagger: 0.12,
              })
              .from(
                q("[data-art='window']"),
                { y: -12, opacity: 0, duration: 0.8 },
                0.35,
              )
              .from(
                q("[data-art='progress']"),
                { scaleX: 0, transformOrigin: "0% 50%", duration: 1 },
                0.4,
              );
          } else {
            // Improve — the loop travels and the line settles higher.
            timeline
              .from(q("[data-art='loop']"), { strokeDashoffset: 1, duration: 1 })
              .from(q("[data-art='loopHead']"), { opacity: 0, duration: 0.3 }, 0.8)
              .from(
                q("[data-art='trend']"),
                { strokeDashoffset: 1, duration: 1 },
                0.25,
              )
              .from(
                q("[data-art='trendEnd']"),
                {
                  scale: 0,
                  opacity: 0,
                  transformOrigin: "202px 56px",
                  duration: 0.4,
                },
                1.1,
              );
          }
        });
      });

      return () => media.revert();
    }, section);

    return () => context.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      data-nav-theme="dark"
      aria-labelledby="process-heading"
      className="on-dark grain relative border-t border-white/10 bg-black text-fog section-pad"
    >
      <div className="shell">
        <div className="grid-12 items-end gap-y-8">
          <div className="col-span-4 md:col-span-8 lg:col-span-6">
            <Eyebrow className="text-fog">{eyebrow}</Eyebrow>
            <RevealText
              as="h2"
              id="process-heading"
              className="display-lg mt-6 text-bone"
            >
              {heading}
            </RevealText>
          </div>
          <p className="prose-body col-span-4 text-fog/65 md:col-span-8 lg:col-span-5 lg:col-start-8">
            The shape stays the same whether the project is a five-page site or
            an operations platform. What changes is how long each step takes and
            how much of it you want to be in the room for.
          </p>
        </div>

        <ol className="mt-16 grid gap-4 md:grid-cols-2 lg:mt-20 lg:grid-cols-4">
          {processSteps.map((step, index) => {
            const Art = ART[index];
            return (
              <li
                key={step.index}
                data-tile=""
                className={cn(
                  "flex flex-col rounded-[18px] border border-white/12 bg-[#070708] p-6",
                  "transition-colors duration-300 hover:border-white/20",
                )}
              >
                <div className="mb-6 h-[132px] w-full text-fog/70">
                  <Art />
                </div>
                <span className="meta text-fog/40 tabular-nums">
                  {step.index}
                </span>
                <h3 className="display-sm mt-3 text-bone">{step.title}</h3>
                <p className="prose-body mt-3 text-fog/65">{step.body}</p>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
