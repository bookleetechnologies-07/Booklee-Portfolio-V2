# Booklee — marketing site

Websites and systems, built around your business.

A five-route marketing site for Booklee, built around a scroll-cinematic hero:
a 2.5D laptop opens as you scroll, presents five Booklee concept websites, then
hands the phrase **Built around you.** out of its screen and into the heading of
the next section.

## Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 16, App Router | Five crawlable routes with per-route metadata, sitemap and share previews |
| Language | TypeScript, strict | Content and component contracts are typed end to end |
| Styling | Tailwind CSS v4 + a small global CSS layer | Tokens in `@theme`; texture, masks and the 3D device in hand-written CSS |
| Motion | GSAP 3 (ScrollTrigger, SplitText, ScrollTo) | The hero is a deterministic, reversible, scrubbed timeline — not component transitions |
| Smooth scroll | Lenis, driven by GSAP's ticker | One loop, so ScrollTrigger never reads a stale scroll position |
| Carousels | Embla | Keyboard- and touch-accessible, tiny |
| Fonts | `next/font` — Barlow Condensed (display), Inter (body) | Self-hosted, no layout shift from a third-party stylesheet |

Deliberately excluded: CMS, database, auth, API layer, UI component framework,
Framer Motion (GSAP owns motion), background video, custom cursor, and any
remotely-fetched 3D asset.

## Getting started

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
npm run lint       # eslint
npx tsc --noEmit   # type check
```

### Environment

Copy `.env.example` to `.env.local` and fill in what you need. Everything works
without it — the booking page falls back to a plain scheduling link.

| Variable | Effect |
|---|---|
| `NEXT_PUBLIC_CALENDLY_URL` | When set, `/book-a-call` lazy-loads the Calendly inline widget. When empty, the page renders the plain scheduling link instead. |

## Routes

| Route | Notes |
|---|---|
| `/` | Pinned laptop story, project rail, stack, services, about, testimonials, booking CTA |
| `/about` | Manifesto, principles, four-step collaboration process |
| `/services` | Six services expanded — problem, deliverables, what is tailored, related concepts |
| `/projects` | Server-rendered list of all five concepts with a progressive-enhancement filter |
| `/projects/[slug]` | `crm`, `hrm`, `portfolio`, `travel`, `erp` — statically generated |
| `/book-a-call` | Expectations, what to prepare, lazy Calendly, plain-link fallback |

## Where things live

```
src/
  app/                    routes, metadata, sitemap, robots, icon
  components/
    layout/               SiteHeader, MobileMenu, SiteFooter, SmoothScroll
    home/                 LaptopStory, LaptopScene2D, ScreenPreviewCarousel,
                          ProjectRail, StackMarquee, ServicesGrid, AboutSplit,
                          TestimonialsCarousel, BookingCTA
    previews/             the five concept websites, as real DOM
    projects/             ProjectDetailTemplate, ProjectsExplorer
    booking/              CalendlyEmbed
    ui/                   Reveal, RevealText, ArrowLink, Eyebrow, Logo, PageIntro
  content/                site, nav, projectCategories, services, technologies,
                          testimonials — all typed, all replaceable
  hooks/                  useLaptopTimeline, useMediaQuery, useMotionMode, …
  lib/                    gsap registration, cn
```

Animation lives beside the component it drives, or in a focused hook. There is
no global animation file that queries the whole document.

## The concept previews

The five website previews are **real DOM, not screenshots**. Each is rendered
inside a container query with `font-size: 1cqw`, so one em equals one percent of
the preview's width and every internal measurement is in em. The result scales
from a full-width project hero down to a thumbnail with no JavaScript, no resize
observer, and no blurry bitmap — and it genuinely re-lays-out at narrow widths
rather than shrinking.

## The laptop, honestly

The device is a **2.5D CSS composition**, not a 3D model: real CSS 3D
(`perspective` + `preserve-3d`) with a deck plane tipped away from the camera
and a lid hinged on its back edge, so opening it is a single `rotateX` driven by
the scroll timeline. It is stylised on purpose — it does not pretend to be a
photograph.

Its limits, stated plainly:

- the camera is fixed; there is no orbit, and lighting is painted, not computed;
- the screen is a flat plane, so there is no curvature, reflection or refraction;
- keys are suggested, not modelled.

Upgrading it later does not touch the page. `LaptopScene2D` is the only
component that knows how the device is drawn, and it exposes exactly two inputs:
the `--lid` angle and whatever transform the timeline applies to the wrapping
`.zoom` element. A React Three Fiber scene or a scrubbed canvas image sequence
can replace it behind the same contract, with the concept previews staying as a
DOM overlay so the handoff phrase remains real text.

## Motion and reduced motion

`gsap.matchMedia()` builds three different experiences:

- **≥1024px** — full pinned narrative, 520vh of scroll, five screens, camera push;
- **768–1023px** — the same story over 340vh with a shallower camera;
- **<768px or `prefers-reduced-motion: reduce`** — no pin at all. The laptop is
  already open and the five concepts become a swipeable carousel with buttons
  and arrow-key support. The handoff phrase is simply the next section's
  heading. Marquees become a static wrapped list, in CSS.

## Before launch

Every placeholder is marked `TODO_CONTENT` in the source. See the handover notes
for the full list — in short: the testimonials are written by Booklee and must be
replaced or deleted, the technology list must be confirmed, and the contact,
social and Calendly details need verifying.
