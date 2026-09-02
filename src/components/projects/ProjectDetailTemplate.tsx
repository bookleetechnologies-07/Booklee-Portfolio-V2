import Link from "next/link";

import { BookingCTA } from "@/components/home/BookingCTA";
import { ConceptPreview } from "@/components/previews";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/ui/Reveal";
import { RevealText } from "@/components/ui/RevealText";
import type { ProjectCategory } from "@/content/projects";
import { projectCategories } from "@/content/projects";
import { cn } from "@/lib/cn";

const ACCENT: Record<string, string> = {
  lilac: "var(--accent-lilac)",
  blue: "var(--accent-blue)",
  yellow: "var(--accent-yellow)",
  mint: "var(--accent-mint)",
  coral: "var(--accent-coral)",
};

/**
 * One template, five projects. Everything on the page comes from the typed
 * content module, so replacing a concept with a real case study later is a data
 * change rather than a rebuild.
 */
export function ProjectDetailTemplate({
  project,
}: {
  project: ProjectCategory;
}) {
  const accent = ACCENT[project.accent];
  const others = projectCategories.filter((item) => item.slug !== project.slug);

  return (
    <>
      <header
        data-nav-theme="light"
        className="paper-tooth grain relative bg-paper"
      >
        <div className="shell pt-[calc(var(--header-h)+clamp(3rem,6vw,6rem))] pb-[clamp(2.5rem,5vw,5rem)]">
          <nav aria-label="Breadcrumb" className="meta text-muted">
            <ol className="flex items-center gap-2">
              <li>
                <Link href="/projects" className="hover:underline">
                  Projects
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page">{project.shortName}</li>
            </ol>
          </nav>

          <div className="grid-12 mt-8 items-end gap-y-8">
            <div className="col-span-4 md:col-span-8 lg:col-span-7">
              <div className="flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: accent }}
                />
                <p className="eyebrow text-muted">
                  {project.index} — {project.label}
                </p>
              </div>
              <RevealText as="h1" immediate className="display-xl mt-6">
                {project.name}
              </RevealText>
            </div>
            <Reveal className="col-span-4 md:col-span-8 lg:col-span-4 lg:col-start-9">
              <p className="prose-body text-muted">{project.lede}</p>
              <ul className="mt-6 flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <li
                    key={tag}
                    className="meta rounded-full border border-ink/15 px-3 py-1.5 text-muted"
                  >
                    {tag}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>

        <div className="shell pb-[clamp(3rem,6vw,6rem)]">
          <div
            className="overflow-hidden rounded-[24px] p-3 md:p-6"
            style={{ backgroundColor: accent }}
          >
            <ConceptPreview slug={project.slug} className="rounded-[14px]" />
          </div>
          <p className="meta mt-4 text-muted">{project.previewAlt}</p>
        </div>
      </header>

      <section
        data-nav-theme="light"
        aria-labelledby="challenge-heading"
        className="bg-bone"
      >
        <div className="shell grid-12 gap-y-12 py-[clamp(3.5rem,7vw,7rem)]">
          <div className="col-span-4 md:col-span-8 lg:col-span-5">
            <Eyebrow>The challenge</Eyebrow>
            <RevealText
              as="h2"
              id="challenge-heading"
              className="display-md mt-6 max-w-[20ch]"
            >
              What usually goes wrong here.
            </RevealText>
          </div>
          <Reveal
            stagger
            className="col-span-4 flex flex-col gap-5 md:col-span-8 lg:col-span-6 lg:col-start-7"
          >
            {project.challenge.map((paragraph) => (
              <p key={paragraph} className="prose-body text-muted">
                {paragraph}
              </p>
            ))}
          </Reveal>
        </div>
      </section>

      <section
        data-nav-theme="dark"
        aria-labelledby="experience-heading"
        className="on-dark grain relative bg-graphite text-fog"
      >
        <div className="shell grid-12 gap-y-12 py-[clamp(3.5rem,7vw,7rem)]">
          <div className="col-span-4 md:col-span-8 lg:col-span-5">
            <Eyebrow className="text-fog">Proposed experience</Eyebrow>
            <RevealText
              as="h2"
              id="experience-heading"
              className="display-md mt-6 max-w-[20ch] text-bone"
            >
              How it would actually feel to use.
            </RevealText>
          </div>
          <ol className="col-span-4 flex flex-col md:col-span-8 lg:col-span-6 lg:col-start-7">
            {project.experience.map((paragraph, index) => (
              <li
                key={paragraph}
                className="flex gap-6 border-t border-white/12 py-6 first:border-t-0 first:pt-0"
              >
                <span className="meta shrink-0 text-fog/40 tabular-nums">
                  0{index + 1}
                </span>
                <p className="prose-body text-fog/75">{paragraph}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section
        data-nav-theme="light"
        aria-labelledby="capabilities-heading"
        className="paper-tooth grain relative bg-paper"
      >
        <div className="shell py-[clamp(3.5rem,7vw,7rem)]">
          <Eyebrow>Key capabilities</Eyebrow>
          <RevealText
            as="h2"
            id="capabilities-heading"
            className="display-md mt-6 max-w-[24ch]"
          >
            The parts that carry the weight.
          </RevealText>

          <Reveal
            stagger
            className="mt-12 grid gap-x-8 gap-y-10 md:grid-cols-2 lg:grid-cols-3"
          >
            {project.capabilities.map((capability) => (
              <article key={capability.title} className="flex flex-col gap-3">
                <span
                  aria-hidden="true"
                  className="h-1 w-10 rounded-full"
                  style={{ backgroundColor: accent }}
                />
                <h3 className="display-sm">{capability.title}</h3>
                <p className="prose-body text-muted">{capability.body}</p>
              </article>
            ))}
          </Reveal>

          <div className="mt-16 rounded-[20px] border border-ink/12 p-7 md:p-9">
            <h3 className="eyebrow text-muted">What we would tailor for you</h3>
            <p className="prose-body mt-4 max-w-[62ch]">{project.tailoring}</p>
          </div>
        </div>
      </section>

      <section
        data-nav-theme="light"
        aria-labelledby="stack-heading"
        className="bg-bone"
      >
        <div className="shell grid-12 gap-y-12 py-[clamp(3.5rem,7vw,7rem)]">
          <div className="col-span-4 md:col-span-8 lg:col-span-4">
            <Eyebrow>Stack rationale</Eyebrow>
            <RevealText
              as="h2"
              id="stack-heading"
              className="display-md mt-6 max-w-[18ch]"
            >
              Chosen for this problem, not for the CV.
            </RevealText>
          </div>
          <dl className="col-span-4 md:col-span-8 lg:col-span-7 lg:col-start-6">
            {project.stack.map((choice) => (
              <div
                key={choice.name}
                className="grid gap-2 border-b border-ink/10 py-6 last:border-b-0 md:grid-cols-[14rem_1fr] md:gap-8"
              >
                <dt className="display-sm">{choice.name}</dt>
                <dd className="prose-body text-muted">{choice.reason}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section
        data-nav-theme="light"
        aria-labelledby="gallery-heading"
        className="paper-tooth grain relative bg-paper"
      >
        <div className="shell py-[clamp(3.5rem,7vw,7rem)]">
          <Eyebrow>Concept views</Eyebrow>
          <h2 id="gallery-heading" className="display-md mt-6 max-w-[22ch]">
            The same concept at three scales.
          </h2>

          <ul className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {project.gallery.map((item) => (
              <li key={item.caption} className="flex flex-col gap-3">
                <div
                  className={cn(
                    "overflow-hidden rounded-[16px] p-2.5",
                    item.focus === "compact" && "mx-auto w-[62%] md:w-full",
                  )}
                  style={{ backgroundColor: accent }}
                >
                  <ConceptPreview
                    slug={project.slug}
                    className="rounded-[9px]"
                  />
                </div>
                <p className="meta text-muted">{item.caption}</p>
              </li>
            ))}
          </ul>
          <p className="meta mt-8 max-w-[58ch] text-muted">
            Every view above is the same live interface rendered at a different
            width — not a mock-up image — which is why the layout genuinely
            changes rather than shrinking.
          </p>
        </div>
      </section>

      <section
        data-nav-theme="light"
        aria-labelledby="more-heading"
        className="bg-bone"
      >
        <div className="shell py-[clamp(3rem,6vw,6rem)]">
          <h2 id="more-heading" className="eyebrow text-muted">
            Other concepts
          </h2>
          <ul className="mt-8 grid gap-px overflow-hidden rounded-[20px] border border-ink/12 bg-ink/12 md:grid-cols-2 lg:grid-cols-4">
            {others.map((item) => (
              <li key={item.slug}>
                <Link
                  href={`/projects/${item.slug}`}
                  className="group flex h-full flex-col gap-3 bg-bone p-6 transition-colors duration-200 hover:bg-paper"
                >
                  <span className="meta text-muted tabular-nums">
                    {item.index}
                  </span>
                  <span className="display-sm">{item.name}</span>
                  <span
                    aria-hidden="true"
                    className="mt-auto text-muted transition-transform duration-200 group-hover:translate-x-1"
                  >
                    &rarr;
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <BookingCTA
        heading={`Want a ${project.shortName} shaped around your business?`}
        support="Bring the process you use today, including the awkward parts. That is where the useful decisions come from."
      />
    </>
  );
}
