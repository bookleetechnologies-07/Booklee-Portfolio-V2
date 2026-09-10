/**
 * Pinning a DOM element to a quadrilateral.
 *
 * The hero shows five real websites on the laptop's display. They are DOM — the
 * previews are designed pages with container queries, not screenshots — so they
 * cannot be drawn into the WebGL scene, and rendering them to a texture would
 * throw away the one thing that makes them worth having: they stay crisp at any
 * size, on any display, with no bitmap in the middle.
 *
 * So the element stays in the DOM, on top of the canvas, and is transformed to
 * land exactly on the four corners of the panel as the camera sees them. The
 * scene projects those corners every frame and hands them here.
 *
 * A plain `translate`/`scale` cannot do this. The camera is only square to the
 * display at the end of the story; before that the lid is turning and the panel
 * is a trapezoid, and anything short of a projective map would visibly slide
 * against the bezel it is supposed to be inside. A full homography lands on the
 * corners at every angle, which is what makes the card read as being *on* the
 * screen rather than floating in front of it.
 */

export type Point = { x: number; y: number };

/**
 * The four corners of a quad, in the order an element's own box gives them.
 * Clockwise from the top-left, in the coordinate space the element is
 * positioned in.
 */
export type Quad = readonly [Point, Point, Point, Point];

/**
 * A CSS `matrix3d` that maps an element of `width` x `height`, with
 * `transform-origin: 0 0`, onto `quad`. Returns null if the quad is degenerate
 * — collapsed to a line, or turned inside out — which is the one case the
 * projective solve has no answer for and the one case the caller should simply
 * skip a frame over rather than write a NaN into a style.
 *
 * The unknowns are the standard eight of a plane-to-plane projective map:
 *
 *     x' = (a·u + b·v + c) / (g·u + h·v + 1)
 *     y' = (d·u + e·v + f) / (g·u + h·v + 1)
 *
 * solved for the unit square first — which is why the element's own size only
 * appears at the end, dividing the columns that consume it.
 */
export function quadTransform(
  quad: Quad,
  width: number,
  height: number,
): string | null {
  if (!(width > 0) || !(height > 0)) return null;

  const [p0, p1, p2, p3] = quad;
  for (const p of quad) {
    if (!Number.isFinite(p.x) || !Number.isFinite(p.y)) return null;
  }

  const dx1 = p1.x - p2.x;
  const dx2 = p3.x - p2.x;
  const dy1 = p1.y - p2.y;
  const dy2 = p3.y - p2.y;
  const sx = p0.x - p1.x + p2.x - p3.x;
  const sy = p0.y - p1.y + p2.y - p3.y;

  const den = dx1 * dy2 - dy1 * dx2;
  // Two opposite edges parallel *and* coincident: the quad has no area, so
  // there is no map onto it.
  if (Math.abs(den) < 1e-9) return null;

  const g = (sx * dy2 - sy * dx2) / den;
  const h = (dx1 * sy - dy1 * sx) / den;

  const a = p1.x - p0.x + g * p1.x;
  const d = p1.y - p0.y + g * p1.y;
  const b = p3.x - p0.x + h * p3.x;
  const e = p3.y - p0.y + h * p3.y;

  // CSS lists a matrix3d column by column, and the matrix multiplies a column
  // vector, so the four groups below are the images of x, y, z and 1.
  const m = [
    a / width, d / width, 0, g / width,
    b / height, e / height, 0, h / height,
    0, 0, 1, 0,
    p0.x, p0.y, 0, 1,
  ];

  for (const value of m) if (!Number.isFinite(value)) return null;

  return `matrix3d(${m.map((v) => (Math.abs(v) < 1e-7 ? 0 : v)).join(",")})`;
}
