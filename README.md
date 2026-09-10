# Booklee — marketing site

Websites and systems, built around your business.

A five-route marketing site for Booklee on a true-black canvas, built around a
scroll-cinematic hero: a silver notebook opens, its screen powers on and lights
the room, Booklee's own startup identity appears, the camera closes in on the
display, and seven websites play **on that display** — five Booklee concept
interfaces and two live client sites, inset
inside the bezel, with the machine still in frame — before the phrase **Built
around you.** is handed into the heading of the next section.

The camera stops short of the glass. At the closest point the panel takes about
three quarters of the viewport's width and the laptop's bezel, hinge and deck
are all still visible, so the closing shot reads as a website on a laptop rather
than as a website that replaced one.

## Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 16, App Router | Five crawlable routes with per-route metadata, sitemap and share previews |
| Language | TypeScript, strict | Content and component contracts are typed end to end |
| Styling | Tailwind CSS v4 + a small global CSS layer | Tokens in `@theme`; texture, masks and the 3D device in hand-written CSS |
| Motion | GSAP 3 (ScrollTrigger, SplitText, ScrollTo) | The hero is a deterministic, reversible, scrubbed timeline — not component transitions |
| 3D | three + React Three Fiber + drei, dynamically imported | Loads and lights a modelled GLB notebook, and drives its hinge from scroll. Desktop/tablet only; never in the shared bundle |
| Modelling | Blender 5, scripted | The notebook is authored in `tools/laptop/`, not assembled from primitives at runtime |
| Smooth scroll | Lenis, driven by GSAP's ticker | One loop, so ScrollTrigger never reads a stale scroll position |
| Carousels | Embla | Keyboard- and touch-accessible, tiny |
| Fonts | `next/font` — Barlow Condensed (display), Inter (body) | Self-hosted, no layout shift from a third-party stylesheet |

Deliberately excluded: CMS, database, auth, API layer, UI component framework,
Framer Motion (GSAP owns motion), background video, and any remotely-fetched 3D
asset — the notebook is modelled in this repository and served from it.

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

There are five primary destinations: Home, About us, Services, Portfolio and
Book a call. **Portfolio** is real client work; **Starter websites** are the
CRM, HRM and ERP foundations, and they sit under Services rather than beside it,
because they are something Booklee offers rather than something Booklee has
done for a named client. Keeping those two apart is the point of the structure.

| Route | Notes |
|---|---|
| `/` | Pinned hero, starter rail, stack, services, about, client notes, booking CTA |
| `/about` | Manifesto, principles, animated four-step process |
| `/services` | Six services expanded — problem, deliverables, what is tailored, related work |
| `/services/starter-websites` | The three customizable B2B foundations |
| `/services/starter-websites/[slug]` | `crm`, `hrm`, `erp` — statically generated |
| `/portfolio` | Three live client sites, as an editorial sequence |
| `/book-a-call` | Inline Calendly on true black, expectations, plain-link fallback |

The old `/projects` catalogue is gone. Every one of its URLs answers with a
permanent redirect — the three starters to their new home under Services, and
the two demonstration categories to `/portfolio` — so nothing that linked to
them breaks. The redirects are in `next.config.ts`.

## Where things live

```
src/
  app/                    routes, metadata, sitemap, robots, icon
  components/
    layout/               SiteHeader (floating nav), MobileMenu, SiteFooter,
                          SmoothScroll
    hero/                 HeroStory, LaptopScene3D (dynamic), ImmersiveDeck
    home/                 LaptopScene2D (fallback), StarterRail, StackMarquee,
                          ServicesGrid, AboutSplit, BrandReveal, ProcessTiles,
                          TestimonialsCarousel, BookingCTA
    previews/             the five concept websites as real DOM, plus the
                          frame the two live client captures share
    portfolio/            PortfolioGallery
    starters/             StarterDetailTemplate
    booking/              CalendlyEmbed
    ui/                   Reveal, RevealText, ArrowLink, Eyebrow, Logo, PageIntro
  content/                site, nav, deck, portfolio, starter-websites, services,
                          technologies, testimonials — all typed, all replaceable
  hooks/                  useHeroTimeline, useMediaQuery, useMotionMode, …
  lib/                    gsap registration, brand paths, heroChapters,
                          heroState, laptopMetrics (generated), cn
public/brand/             mark, wordmark and full lockup, vectorised from the
                          supplied Booklee Technologies artwork
public/portfolio/         client site captures, archived as PNG
public/models/            laptop.glb — built by tools/laptop, not hand-edited
tools/laptop/             the Blender build script and its review renders
```

Animation lives beside the component it drives, or in a focused hook. There is
no global animation file that queries the whole document.

## The concept previews

The five concept previews are **real DOM, not screenshots**. Each is rendered
inside a container query with `font-size: 1cqw`, so one em equals one percent of
the preview's width and every internal measurement is in em. The result scales
from a full-width project hero down to a thumbnail with no JavaScript, no resize
observer, and no blurry bitmap — and it genuinely re-lays-out at narrow widths
rather than shrinking.

## The laptop, honestly

The notebook is a **modelled asset**, not something React Three Fiber assembles
at runtime. It lives at `public/models/laptop.glb` (33k triangles, ~1.0 MB) and
is built by `tools/laptop/build_laptop.py`:

```bash
blender --background --factory-startup --python tools/laptop/build_laptop.py
```

That script is the source of truth — the binary is a build product. It models a
generic 14-inch aluminium notebook, 312.6 x 214.5 x 15.9 mm closed, from real
dimensions with bevel and boolean modifiers. The parts that matter:

- **The lid's bottom edge is a barrel concentric with the hinge axis.** A flat
  edge over a flat deck opens a wedge of shadow that changes shape as the lid
  moves, and that wedge is what the eye reads as a floating screen. A half-round
  on the axis shows the same silhouette at every angle — and when the lid shuts,
  it is the rear edge of the closed machine.
- **The panel lives in a pocket milled into the lid**, half a millimetre deep,
  with the printed mask and the glass inside it and aluminium standing proud
  around all four sides. The bezel has walls; the display is inside the
  enclosure rather than a rectangle stuck to it.
- **The base is two shells**, deck and chassis, the lower one a quarter of a
  millimetre narrower with a heavier roll-over — because the groove where two
  rolled perimeters meet is the seam a unibody has, and one slab has nowhere to
  put one.
- **The grilles are perforated**, not cut out: a staggered field of small dark
  discs on the floor of a very shallow recess, joined into one mesh.
- **The keyboard is on an 18.4 mm pitch with a 2.4 mm gap**, on its own black
  well floor rather than on aluminium in shadow.
- The depth is *derived* from the display, not chosen: the lid has to reach the
  front lip when it shuts, so its height fixes how deep the machine is.

It also writes `src/lib/laptopMetrics.ts`, so the hinge axis, the panel size and
the panel's position in the lid — all of which the camera and the inset card are
solved from — cannot drift from the geometry.

It carries **no manufacturer's marks**: nothing on the lid, no notch, an
uninterrupted bezel on all four sides. Proportions were taken from a modern
professional laptop because that is the class of object the hero depicts; the
branding was not.

Why it is not built from primitives, since it used to be: rounded boxes cannot
express a shell that is continuous around its corners, a chamfer that carries a
highlight, or a nearly flush closed state — and no amount of material tuning
fixes geometry that is wrong.

React Three Fiber's job is everything else: loading, lighting, materials, the
screen texture, the camera, and the scroll-driven state. It rotates exactly one
thing, the `LidPivot` node, from `closedAngle` to `openAngle`.

Its limits, stated plainly:

- a scripted model is real modelling, but a product artist would add port
  cutouts, key legends and material imperfection this does not have;
- the environment is six Lightformers rather than a photographed HDRI, so
  reflections read as studio light rather than a real room;
- there is no bloom pass — the glow is an emissive display, an area light, five
  additive haze quads, a halo painted into the screen's own texture and two CSS
  radial gradients. Cheap, cannot wash out the website on the screen, and a
  simulation.

Swapping in a different asset is contained: match the node names (`LidPivot` on
the hinge axis, `Screen` for the panel) and rerun the build script so
`laptopMetrics.ts` agrees.

Four review stills — closed, half-open, open with the screen off, open with it
lit — can be rendered from the exported GLB at any time:

```bash
blender --background --factory-startup --python tools/laptop/review_renders.py -- out/
```

`LaptopScene2D` remains as the fallback for small screens, reduced motion, and
any device where WebGL is unavailable or the scene throws.

## Motion and reduced motion

`gsap.matchMedia()` builds three different experiences:

- **≥1024px** — the full narrative over 700vh: approach, lid, power-on, startup
  identity, the camera closing on the display, seven websites inset in it,
  phrase handoff;
- **768–1023px** — the same story over 460vh with a shallower camera;
- **<768px or `prefers-reduced-motion: reduce`** — no pin at all. The laptop is
  already open showing the startup identity, and the seven interfaces become a
  swipeable full-width carousel with buttons and arrow-key support. The handoff
  phrase is simply the next section's heading. Marquees become a static wrapped
  list, and every process graphic renders its finished state.

### The websites are on the screen, not over it

The deck is a card of fixed size positioned at the top-left of the scene, and
the WebGL loop writes a `matrix3d` onto it every frame that lands its four
corners on the four corners of the panel. A full projective map, not a
translate and a scale: the camera is only square to the display at the end of
the story, and before that the lid is turning and the panel is a trapezoid, so
anything less would slide against the bezel it is meant to be inside. The maths
is in `src/lib/screenInset.ts` and the card's size in `src/lib/heroCard.ts`,
which the scene also measures its glow from.

The deck is seven slides: the five Booklee concept interfaces, then two live
client sites taken whole from `src/content/portfolio.ts` rather than re-described
in the hero. Both kinds render through the same `PreviewFrame`, so the wipe
between them does not betray which is which, and the pacing — how long each
slide holds and how long its wipe takes — is derived from the slide count rather
than written out per slide.

The card is inset six per cent of the panel's width on every side, so a margin
of lit black glass stays visible all the way round it. The glow in that margin
is painted into the display's emissive texture, which means the halo around the
card and the light it throws on the keyboard are the same data.

It stays DOM rather than becoming a texture for the reason above: these previews
are real designed pages, and rendering them to a texture would throw away the
one thing that makes them worth having.

### Why no preview can flash before its phase

The immersive deck is hidden by a CSS media query, not by JavaScript:

```css
@media (min-width: 768px) and (prefers-reduced-motion: no-preference) {
  .deck { visibility: hidden; opacity: 0; pointer-events: none; }
}
```

That is true at first paint, before hydration, with no timeout involved — and
the laptop no longer contains project previews at all, so there is nothing for a
cold load to reveal early. Verified on cold load at 1×, 6× and 20× CPU
throttling.

### One state source

`src/lib/heroState.ts` holds both channels: `heroSignal` is a mutable object the
scrubbed timeline writes every frame and the WebGL loop reads (never touching
React), and `heroState` is a tiny external store that changes only at phase
boundaries. The floating navigation subscribes to the latter and adds `inert`
when the page is immersive. Nothing else listens to scroll.

## Before launch

Every placeholder is marked `TODO_CONTENT` in the source. In short:

- **Client notes** are unpublished. `src/content/testimonials.ts` exports an
  empty `clientNotes` array; the section renders nothing in production until
  approved entries with `approved: true` are added. Development fixtures exist
  for layout only and never ship.
- **`NEXT_PUBLIC_CALENDLY_URL`** is unset, so the booking page shows the plain
  scheduling link. Set it once the event URL, title and duration are confirmed —
  the title and duration shown above the calendar come from
  `siteConfig.booking`.
- **The technology list** in `src/content/technologies.ts` reads publicly as a
  claim of competence and needs confirming.
- **Contact, socials and the production domain** in `src/content/site.ts` were
  carried over from the previous Booklee site and should be re-verified.
