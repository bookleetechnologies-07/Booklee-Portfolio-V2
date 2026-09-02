"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { ConceptPreview } from "@/components/previews";
import { projectCategories } from "@/content/projects";
import { cn } from "@/lib/cn";

const ACCENT: Record<string, string> = {
  lilac: "var(--accent-lilac)",
  blue: "var(--accent-blue)",
  yellow: "var(--accent-yellow)",
  mint: "var(--accent-mint)",
  coral: "var(--accent-coral)",
};

const FILTERS = ["All", "Concept project", "Demo build"] as const;
type Filter = (typeof FILTERS)[number];

/**
 * Progressive enhancement, in the sense that matters for search engines and for
 * anyone whose JavaScript fails: the default filter is "All", so the server
 * response already contains every project in full. The filter only ever removes
 * things from a page that was complete without it.
 */
export function ProjectsExplorer() {
  const [filter, setFilter] = useState<Filter>("All");

  const visible = useMemo(
    () =>
      filter === "All"
        ? projectCategories
        : projectCategories.filter((project) => project.label === filter),
    [filter],
  );

  return (
    <section
      data-nav-theme="light"
      aria-labelledby="projects-list-heading"
      className="bg-bone"
    >
      <h2 id="projects-list-heading" className="sr-only">
        All Booklee concept projects
      </h2>

      <div className="shell flex flex-wrap items-center gap-2 border-b border-ink/10 py-6">
        <span className="eyebrow mr-2 text-muted">Filter</span>
        {FILTERS.map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={filter === option}
            onClick={() => setFilter(option)}
            className={cn(
              "inline-flex h-10 items-center rounded-full border px-4 text-sm transition-colors duration-200",
              filter === option
                ? "border-ink bg-ink text-bone"
                : "border-ink/20 text-muted hover:border-ink/50 hover:text-ink",
            )}
          >
            {option}
          </button>
        ))}
        <span className="meta ml-auto text-muted" aria-live="polite">
          {visible.length} of {projectCategories.length}
        </span>
      </div>

      <ul>
        {visible.map((project, index) => (
          <li key={project.slug} className="border-b border-ink/10">
            <Link
              href={`/projects/${project.slug}`}
              aria-label={`${project.name} — ${project.label}. ${project.lede}`}
              className="group block py-[clamp(2.5rem,5vw,4.5rem)]"
            >
              <article
                className={cn(
                  "shell grid-12 items-center gap-y-8",
                  index % 2 === 1 && "lg:[&>*:first-child]:order-2",
                )}
              >
                <div className="col-span-4 md:col-span-8 lg:col-span-6">
                  <div
                    className="overflow-hidden rounded-[20px] p-3 transition-transform duration-300 group-hover:-translate-y-1 md:p-4"
                    style={{ backgroundColor: ACCENT[project.accent] }}
                  >
                    <ConceptPreview
                      slug={project.slug}
                      className="rounded-[12px]"
                    />
                  </div>
                </div>

                <div
                  className={cn(
                    "col-span-4 md:col-span-8 lg:col-span-5",
                    index % 2 === 1 ? "lg:col-start-1" : "lg:col-start-8",
                  )}
                >
                  <div className="flex items-center gap-4">
                    <span className="meta text-muted tabular-nums">
                      {project.index}
                    </span>
                    <span className="meta rounded-full border border-ink/15 px-3 py-1 text-muted">
                      {project.label}
                    </span>
                  </div>
                  <h3 className="display-lg mt-6">{project.name}</h3>
                  <p className="prose-body mt-4 text-muted">{project.lede}</p>
                  <ul className="mt-6 flex flex-wrap gap-2">
                    {project.tags.map((tag) => (
                      <li key={tag} className="meta text-muted">
                        {tag}
                        <span aria-hidden="true" className="ml-2 opacity-40">
                          /
                        </span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-7 flex items-center gap-2 text-sm font-medium">
                    View project
                    <span
                      aria-hidden="true"
                      className="transition-transform duration-200 group-hover:translate-x-1"
                    >
                      &rarr;
                    </span>
                  </p>
                </div>
              </article>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
