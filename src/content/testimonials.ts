/**
 * Client notes.
 *
 * PENDING USER CONTENT — approved names, roles, companies, quotes and optional
 * portraits have not been supplied yet.
 *
 * The rule this file enforces: nothing renders in production unless a real
 * person approved it. `publishedNotes` filters on `approved`, and the section
 * removes itself entirely when that list is empty, so the site never shows
 * unapproved praise to a visitor.
 *
 * `sampleNotes` below is the stand-in the carousel is built and reviewed
 * against. Every name, role and company in it is invented, and deliberately
 * generic enough that it matches no real business — nothing here may be
 * attributed to an identifiable person or organisation. It is not approved, so
 * it never reaches production; it reads as ordinary client feedback rather than
 * as visible scaffolding, because a reviewer looking at the section should be
 * judging the design and not reading around the word "fixture".
 */

export type ClientNote = {
  id: string;
  quote: string;
  /** The person's own name. */
  name: string;
  /** Their role at the time the note was given. */
  role: string;
  company: string;
  /** Local, approved portrait. Initials are used when absent. */
  portrait?: string;
  /** Written approval on file from the person quoted. */
  approved: boolean;
};

/**
 * TODO_CONTENT: replace with approved client notes and set `approved: true`.
 * Adding an entry here without approval publishes it — that is the whole point
 * of the flag, so do not set it optimistically.
 */
export const clientNotes: ClientNote[] = [];

/**
 * Invented stand-in notes, used to review the carousel until approved ones
 * exist. `approved` is false on every one, so none of them can be published.
 *
 * The three lengths are chosen on purpose — a long note, a short one and one
 * that wraps to a fourth line at the narrowest card — because unequal lengths
 * beside each other is the case worth looking at.
 */
export const sampleNotes: ClientNote[] = [
  {
    id: "note-1",
    quote:
      "They spent the first week understanding how we actually work before proposing anything. What we ended up with fits the way the team already runs, so nobody had to be talked into using it.",
    name: "Rachel Ahearn",
    role: "Operations lead",
    company: "Halloway Interiors",
    approved: false,
  },
  {
    id: "note-2",
    quote:
      "Clear about what was worth building and what was not. That saved us more than the build itself did.",
    name: "Tomas Vieira",
    role: "Founder",
    company: "Northbank Studio",
    approved: false,
  },
  {
    id: "note-3",
    quote:
      "We had outgrown a spreadsheet and were dreading the switch. They kept the old process running until we trusted the new one, and the changeover turned out to be the least dramatic part of the year.",
    name: "Priya Desai",
    role: "Marketing manager",
    company: "Kestrel Logistics",
    approved: false,
  },
];

/** The only list the site is allowed to publish. */
export const publishedNotes: ClientNote[] = clientNotes.filter(
  (note) => note.approved,
);

export const hasPublishedNotes = publishedNotes.length > 0;
