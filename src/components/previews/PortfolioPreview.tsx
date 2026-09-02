import { cn } from "@/lib/cn";

import {
  PreviewFrame,
  PreviewMark,
  previewStyles as s,
  type PreviewProps,
} from "./PreviewFrame";

const WORKS = [
  { year: "2026", title: "Salt Marsh, in four visits", discipline: "Photography" },
  { year: "2025", title: "Kilnwork — a ceramics studio", discipline: "Identity" },
  { year: "2025", title: "Low Light", discipline: "Book design" },
  { year: "2024", title: "Rope & Rigging", discipline: "Editorial" },
  { year: "2024", title: "Field Notes, vol. 3", discipline: "Print" },
  { year: "2023", title: "The Quiet Hours", discipline: "Photography" },
];

/**
 * Abstract plate for the portfolio concept. Built from hard-edged geometry and
 * a fine print screen rather than a gradient blob, so it reads as a printed
 * image crop rather than as decoration.
 */
function PlateArt() {
  return (
    <div className={s.portfolioPlateArt} aria-hidden="true">
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(168deg, #efe8d8 0%, #ded4bf 46%, #b9ae95 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: "-12%",
          bottom: "-18%",
          width: "78%",
          height: "78%",
          borderRadius: "999em",
          background: "#f4e98a",
          mixBlendMode: "multiply",
          opacity: 0.85,
        }}
      />
      <div
        style={{
          position: "absolute",
          right: "-8%",
          top: "-14%",
          width: "58%",
          height: "72%",
          background: "#2b2a26",
          transform: "rotate(14deg)",
          opacity: 0.9,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "repeating-linear-gradient(180deg, rgb(23 22 26 / 0.14) 0 0.12em, transparent 0.12em 0.34em)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: "18%",
          top: "22%",
          width: "26%",
          aspectRatio: "1",
          borderRadius: "999em",
          border: "0.14em solid #f4f1e9",
        }}
      />
    </div>
  );
}

export function PortfolioPreview({ className }: PreviewProps) {
  return (
    <PreviewFrame
      className={className}
      canvasClassName={s.portfolio}
      label="Concept editorial portfolio: an oversized display heading, a typographic index of works and a large cropped plate on warm paper with a yellow accent."
    >
      <header className={s.portfolioTop}>
        <span className={s.brandRow}>
          <PreviewMark />
          Marlow &amp; Fen
        </span>
        <nav className={cn(s.portfolioNav, s.dense)}>
          <span>Index</span>
          <span>Studio</span>
          <span>Print</span>
          <span>Contact</span>
        </nav>
      </header>

      <div className={s.portfolioHead}>
        <span className={s.portfolioTitle}>
          Selected
          <br />
          work
        </span>
        <span
          className={cn(s.dense)}
          style={{
            fontSize: "0.82em",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "rgb(23 22 26 / 0.64)",
            textAlign: "right",
            lineHeight: 1.6,
          }}
        >
          Twenty-three projects
          <br />
          2023 &ndash; 2026
        </span>
      </div>

      <div className={s.portfolioBody}>
        <div className={s.portfolioIndex}>
          {WORKS.map((work, index) => (
            <div
              key={work.title}
              className={cn(
                s.portfolioIndexRow,
                index === 1 && s.portfolioIndexRowActive,
              )}
            >
              <span className={s.portfolioIndexYear}>{work.year}</span>
              <span
                style={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {work.title}
              </span>
              <span className={cn(s.portfolioIndexDisc, s.dense)}>
                {work.discipline}
              </span>
            </div>
          ))}
        </div>

        <figure className={s.portfolioPlate}>
          <PlateArt />
          <figcaption className={s.portfolioCaption}>
            02 — Kilnwork, studio identity
          </figcaption>
        </figure>
      </div>

      <footer className={s.portfolioFoot}>
        <span>Built by Booklee</span>
        <span className={s.dense}>No forced templates</span>
        <span>hello@marlowfen.example</span>
      </footer>
    </PreviewFrame>
  );
}
