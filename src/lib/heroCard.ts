import { LAPTOP } from "@/lib/laptopMetrics";

/**
 * The website card that sits inside the laptop's display.
 *
 * Shared because two layers have to agree about it exactly: the WebGL scene,
 * which projects the card's four corners onto the viewport every frame and
 * paints the glow around it into the screen's emissive texture, and the DOM
 * deck, which is the element those corners are mapped onto. If either had its
 * own copy of these numbers the card would drift out of its glow.
 */

/**
 * The margin of lit black glass kept between the card and the edge of the
 * panel, as a share of the panel's *width*.
 *
 * One number for all four sides, deliberately. Expressed per-axis it would come
 * out visibly deeper at the sides than at the top on a 16:10 panel; expressed
 * once against the width it is the same distance all the way round, which is
 * what an inset looks like.
 */
export const CARD_INSET = 0.06;

const MARGIN = LAPTOP.panel.width * CARD_INSET;

/** The card's size in scene units. */
export const CARD = {
  width: LAPTOP.panel.width - MARGIN * 2,
  height: LAPTOP.panel.height - MARGIN * 2,
} as const;

/**
 * The card's own box, in CSS pixels, before the projection is applied to it.
 *
 * Fixed rather than sized to the viewport, for two reasons. The previews are
 * built on container queries — `1em` is one per cent of the card's width — so a
 * fixed box means the website inside it is laid out identically on every
 * screen and only ever *scaled* by the projection, never reflowed by it. And a
 * box that never changes size is a box the browser never has to lay out again,
 * which matters when the only thing touching it per frame is a transform.
 *
 * Wide enough that on all but the largest displays the projection is scaling it
 * down, which is the direction that stays sharp.
 */
export const CARD_BOX = {
  width: 1600,
  height: Math.round((1600 * CARD.height) / CARD.width),
} as const;
