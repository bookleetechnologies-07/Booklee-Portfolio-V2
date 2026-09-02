/**
 * TODO_CONTENT: every entry below is a placeholder written by Booklee to show
 * the shape of a real review. None of these people exist and none of this is
 * client feedback.
 *
 * Before launch, either replace each entry with an approved quote — `approved`
 * must be set to true and `placeholder` to false — or delete the section
 * entirely. The component renders the "Sample testimonial" badge for every
 * entry where `placeholder` is true, and that badge must not be removed while
 * placeholder content is on the page.
 */

export type Testimonial = {
  id: string;
  quote: string;
  /** Role and organisation, or the placeholder descriptor. */
  attribution: string;
  /** What kind of work the note refers to. */
  context: string;
  /** Written approval on file from the person quoted. */
  approved: boolean;
  placeholder: boolean;
};

export const PLACEHOLDER_BADGE = "Sample testimonial — replace before launch";

export const testimonials: Testimonial[] = [
  {
    id: "sample-1",
    quote:
      "They started by asking how we actually work, not by showing us a template. The first version already matched the way the team talks about the pipeline.",
    attribution: "Placeholder attribution — operations lead",
    context: "Internal tooling",
    approved: false,
    placeholder: true,
  },
  {
    id: "sample-2",
    quote:
      "The scope got smaller in discovery, which we did not expect. Half the features on our list turned out to be solving a problem we had already fixed elsewhere.",
    attribution: "Placeholder attribution — founder",
    context: "Product strategy",
    approved: false,
    placeholder: true,
  },
  {
    id: "sample-3",
    quote:
      "The site is the first one we have had that our own team is happy to send to a client. It loads instantly on a phone, which is where most of our traffic is.",
    attribution: "Placeholder attribution — marketing manager",
    context: "Website design and build",
    approved: false,
    placeholder: true,
  },
  {
    id: "sample-4",
    quote:
      "We moved one module at a time and never had a day where the business could not operate. That mattered more to us than any single feature.",
    attribution: "Placeholder attribution — general manager",
    context: "Operations platform",
    approved: false,
    placeholder: true,
  },
];
