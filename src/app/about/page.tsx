import type { Metadata } from "next";

import { AboutSplit } from "@/components/home/AboutSplit";
import { BookingCTA } from "@/components/home/BookingCTA";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { PageIntro } from "@/components/ui/PageIntro";
import { Reveal } from "@/components/ui/Reveal";
import { RevealText } from "@/components/ui/RevealText";
import { ProcessTiles } from "@/components/home/ProcessTiles";

export const metadata: Metadata = {
  title: "About us",
  description:
    "Booklee is a small web design and development studio. We start with how your business actually works, then choose the design and technology to match.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About Booklee",
    description:
      "A small studio with room for your way of working — how Booklee approaches scope, design and engineering.",
    url: "/about",
  },
};

const PRINCIPLES = [
  {
    index: "01",
    title: "Scope is a decision, not a wish list",
    body: "We would rather remove three features in discovery than build six that nobody opens. What survives the cut is what the first release is for.",
  },
  {
    index: "02",
    title: "The process you already have is evidence",
    body: "Spreadsheets, chat threads and habits are not mess to be cleaned up. They are the most accurate description of how the work is really done.",
  },
  {
    index: "03",
    title: "Design and engineering are one conversation",
    body: "An interface that cannot be built quickly is a slow interface. We decide structure, interaction and technology together rather than in sequence.",
  },
  {
    index: "04",
    title: "Accessible and fast are part of done",
    body: "Keyboard paths, contrast, touch targets and performance budgets are checked as we build. Retrofitting any of them costs several times more.",
  },
  {
    index: "05",
    title: "Nothing is switched over blind",
    body: "Where we replace an existing system, the old one keeps running until the numbers agree. Cutovers are boring on purpose.",
  },
  {
    index: "06",
    title: "We say what we do not know",
    body: "Estimates carry their assumptions. If something is uncertain we will tell you which part, rather than average it into a confident number.",
  },
];

export default function AboutPage() {
  return (
    <>
      <PageIntro
        eyebrow="About Booklee"
        heading="We build the thing your business actually needs."
        standfirst="Booklee is a web design and development studio working on marketing sites, product interfaces and the internal systems businesses quietly run on. Every engagement starts with your workflow, not with our template."
      />

      <AboutSplit />

      <section
        data-nav-theme="dark"
        aria-labelledby="manifesto-heading"
        className="on-dark grain relative bg-black text-fog section-pad"
      >
        <div className="shell">
          <Eyebrow className="text-fog">Manifesto</Eyebrow>
          <RevealText
            as="h2"
            id="manifesto-heading"
            className="display-lg mt-6 max-w-[20ch] text-bone"
          >
            No forced templates. No unnecessary features.
          </RevealText>
          {/*
            Scrubbed rather than staggered: the six principles are meant to be
            read one at a time as the reader comes down the section, and a timed
            stagger fires them all off the moment the grid crosses a line no
            matter how fast or slowly anyone is moving. They are all fully
            revealed by roughly the middle of the section's pass.
          */}
          <Reveal
            sequence
            className="mt-14 grid gap-x-8 gap-y-10 md:grid-cols-2 lg:grid-cols-3"
          >
            {PRINCIPLES.map((principle) => (
              <article key={principle.index} className="flex flex-col gap-3">
                <span className="meta text-fog/45 tabular-nums">
                  {principle.index}
                </span>
                <h3 className="display-sm text-bone">{principle.title}</h3>
                <p className="prose-body text-fog/65">{principle.body}</p>
              </article>
            ))}
          </Reveal>
        </div>
      </section>

      <ProcessTiles />

      {/*
        There was a pale band between here and the call to action carrying a
        single paragraph about the size of the team. The paragraph has been
        removed, and the section went with it: it existed only to hold that one
        sentence, so leaving it behind would have left an empty page-width strip
        of paper between two black sections.

        Nothing else needs adjusting for it. `ProcessTiles` and `BookingCTA` are
        both dark and both carry their own top hairline, so they meet the way
        every other pair of dark sections on the site does.
      */}

      <BookingCTA
        heading="Tell us how your business actually runs."
        support="A short call is usually enough to work out whether we are the right studio for what you need."
      />
    </>
  );
}
