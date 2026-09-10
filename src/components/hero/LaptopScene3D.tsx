"use client";

import { Canvas, createPortal, useFrame, useThree } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  Lightformer,
  useGLTF,
} from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { RectAreaLightUniformsLib } from "three/examples/jsm/lights/RectAreaLightUniformsLib.js";

import { DECK_ACCENT, deckSlides } from "@/content/deck";
import { BRAND } from "@/lib/brand";
import { CARD, CARD_INSET } from "@/lib/heroCard";
import {
  cameraApproach,
  cameraDrift,
  cameraFocus,
  cameraSettle,
  deckOn,
  deckPosition,
  lidOpen as lidOpenAt,
  screenPower,
  screenTint,
  startupIdentity,
} from "@/lib/heroChapters";
import { heroSignal } from "@/lib/heroState";
import { LAPTOP } from "@/lib/laptopMetrics";
import { quadTransform, type Point } from "@/lib/screenInset";

/* ------------------------------------------------------------------ *
 * The machine.
 *
 * The notebook is a modelled asset — `public/models/laptop.glb`, built by
 * `tools/laptop/build_laptop.py` and rebuildable from it. Nothing about its
 * shape is decided in this file, and nothing here draws it.
 *
 * That division is deliberate. The hero used to assemble the device out of
 * rounded boxes, planes and an instanced key field, and primitives cannot
 * express what makes a machined product read as machined: a shell that is
 * continuous around its corners, chamfers that carry a highlight, a lid that
 * shuts to a seam instead of into the deck. This module now does what it is
 * actually good at — loading, lighting, materials, the screen texture, the
 * camera, and the scroll-driven state — and the geometry comes from Blender.
 *
 * Swapping in a different asset is a contained change: match the node names
 * (`LidPivot` on the hinge axis, `Screen` for the panel) and rerun the build
 * script so `laptopMetrics.ts` agrees, and everything below keeps working.
 * ------------------------------------------------------------------ */

const MODEL_URL = "/models/laptop.glb";

/**
 * Where the model sits. Its own origin is the underside of the base, so this is
 * simply the height of the desk, and the machine lands on it exactly.
 */
const GROUND = -0.406;

const lerp = THREE.MathUtils.lerp;

/**
 * RectAreaLight needs its BRDF lookup tables uploaded before the first light of
 * that type is created, or it renders black. The call is idempotent and cheap,
 * and this module is only ever imported on the client behind `ssr: false`.
 */
RectAreaLightUniformsLib.init();

/* ------------------------------------------------------------------ *
 * The inset website card.
 *
 * The deck is not the display. It is a card *on* the display, with a deliberate
 * margin of lit black glass all the way round it — the composition the brief
 * asks for, and the thing that stops the closing shot reading as "the laptop
 * went away and we are on a website now". Its size lives in `@/lib/heroCard`,
 * because the DOM element being projected has to agree with the glow painted
 * behind it down to the pixel.
 * ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ *
 * Framing.
 *
 * The camera's closest position is *solved*, not chosen. Both limits below are
 * shares of the viewport the panel is allowed to take up, and the distance is
 * whichever of the two is further away — so on a wide viewport the width limit
 * binds, on a tall one the height limit does, and on every aspect ratio the
 * bezel is still in frame at the end of the scroll. Picking a distance by eye
 * satisfies exactly one window size.
 * ------------------------------------------------------------------ */

/** The panel never occupies more than this share of the viewport's width. */
const FRAME_W = 0.82;
/** Nor more than this share of its height. */
const FRAME_H = 0.84;
/** How much further out the deck's slow final push starts from. */
const FRAME_BACK_OFF = 1.06;
/**
 * Clear air kept above the lid's top edge, as a share of the panel's height.
 * Whatever is left over after that goes below the machine, which is what puts
 * the front of the deck in the bottom of the closing shot.
 */
const FRAME_TOP_MARGIN = 0.05;

/** How far above the hinge the lid's far edge is, relative to the panel centre. */
const LID_ABOVE_PANEL = LAPTOP.lidLength - LAPTOP.panelCentre;

/* ------------------------------------------------------------------ *
 * Volumetric haze.
 *
 * A RectAreaLight illuminates surfaces but does not scatter, so on its own the
 * screen lights the keyboard and the desk and the air between them stays empty.
 * The mist in front of the display has to be drawn.
 *
 * It is drawn as a short stack of screen-parallel quads rather than as a cone.
 * A cone is the obvious primitive and it is the wrong one: an open-ended cone
 * is a *shell*, so what gets rasterised is its lateral surface, and the surface
 * is lit by how squarely each part of it faces the camera. Because the lid
 * leans back and the camera looks down, part of that shell faced the viewer and
 * part did not — which drew a hard-edged disc across the room and washed the
 * true black out to grey. A shell cannot represent a volume.
 *
 * Each quad here fades radially to nothing well inside its own edge, so no
 * layer has a silhouette to give away, and the layers together read as depth:
 * near the panel the glow is tight and bright, and by the far layer it is wide
 * and almost gone. `uPower` scales all of them from the one screen-power value,
 * and the fragment is discarded outright while the screen is off, so nothing is
 * drawn at all before the display lights.
 * ------------------------------------------------------------------ */

const HAZE_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const HAZE_FRAG = /* glsl */ `
  uniform float uPower;
  uniform vec3 uColor;
  uniform float uWeight;
  varying vec2 vUv;
  void main() {
    if (uPower <= 0.001) discard;

    // Elliptical falloff, a little wider than tall so it follows the shape of
    // the panel the light leaves rather than pooling as a circle.
    vec2 d = (vUv - 0.5) * 2.0;
    float r = length(vec2(d.x * 0.74, d.y));

    // Cubed, so the centre stays soft and the edge reaches zero early — the
    // quad's own boundary is never reached by a non-zero alpha.
    float fall = 1.0 - smoothstep(0.0, 1.0, r);
    fall = fall * fall * fall;

    // Hollowed out in the middle.
    //
    // These quads hang in front of the display, and a radial falloff peaks
    // exactly where the display is — so the mist was brightest over the one
    // surface it should be invisible against, and it turned a black screen
    // showing a small white mark into an even grey wash. Mist is only ever seen
    // where there is darkness behind it to see it against, so the centre is
    // suppressed and the glow lives outside the panel's own silhouette.
    fall *= mix(0.26, 1.0, smoothstep(0.0, 0.5, r));

    gl_FragColor = vec4(uColor, fall * uWeight * uPower);
  }
`;

/**
 * Distance in front of the panel, size relative to it, and how much light each
 * layer contributes.
 *
 * The stack starts a third of a unit off the glass and every layer is already
 * wider than the panel, which is the other half of the fix described in the
 * fragment above: the nearest layer used to sit on the display's own surface at
 * barely more than its size, so its brightest part covered the screen exactly.
 *
 * The weights are roughly a third of what they were. Added together the old
 * ones came to about three quarters of full white at the centre of the frame,
 * which is not mist — it is a white card held in front of the machine.
 */
const HAZE_LAYERS = [
  { z: 0.32, scale: 1.45, weight: 0.105 },
  { z: 0.72, scale: 1.85, weight: 0.075 },
  { z: 1.25, scale: 2.35, weight: 0.05 },
  { z: 1.95, scale: 3.0, weight: 0.032 },
  { z: 2.8, scale: 3.7, weight: 0.02 },
] as const;

/* ------------------------------------------------------------------ *
 * Screen texture.
 *
 * Black, then Booklee's own startup identity drawn from the real brand path,
 * then the glow the website card sits inside. It is the display's emissive map,
 * so everything painted here is also what lights the keyboard, the deck and the
 * desk — the picture on the screen and the light in the room are the same data.
 * ------------------------------------------------------------------ */

const TEX_W = 1024;
/**
 * Matched to the panel's aspect rather than rounded to something convenient, so
 * a square of texture is a square of screen. It also makes the card's margin
 * the same number of pixels on all four sides, which is why the drawing code
 * below only needs one of them.
 */
const TEX_H = Math.round((TEX_W * LAPTOP.panel.height) / LAPTOP.panel.width);

const CARD_PX = {
  margin: TEX_W * CARD_INSET,
  radius: TEX_W * 0.013,
};

/** Glow layers stepped outward from the card, and how far each one reaches. */
const GLOW_STEPS = 12;
const GLOW_REACH = CARD_PX.margin * 1.5;

type Rgb = readonly [number, number, number];

const WHITE: Rgb = [255, 255, 255];

function hexToRgb(hex: string): Rgb {
  const value = Number.parseInt(hex.slice(1), 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

const mix = (a: Rgb, b: Rgb, t: number): Rgb => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
];

const rgba = (c: Rgb, alpha: number) =>
  `rgba(${Math.round(c[0])},${Math.round(c[1])},${Math.round(c[2])},${alpha})`;

/**
 * The colour the screen glows, per slide.
 *
 * Pulled well towards white on purpose. A website is mostly paper, so the light
 * coming off a display showing one is close to white with the page's accent in
 * it — not the accent itself. At full saturation the room turned lilac, which
 * reads as a coloured lamp behind the laptop rather than as a screen.
 */
const SLIDE_GLOW: Rgb[] = deckSlides.map((slide) =>
  mix(hexToRgb(DECK_ACCENT[slide.accent]), WHITE, 0.55),
);

/** `roundRect` is recent enough to be worth not depending on. */
function roundedPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const radius = Math.max(0, Math.min(r, w / 2, h / 2));
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function useScreenTexture() {
  const store = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = TEX_W;
    canvas.height = TEX_H;
    const ctx = canvas.getContext("2d");
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 4;
    // The panel's UVs come from Blender with the usual glTF orientation, which
    // is the opposite of a 2D canvas.
    texture.flipY = false;

    const [vx, vy, vw, vh] = BRAND.markViewBox.split(" ").map(Number);
    const mark = new Path2D(BRAND.markPath);

    const draw = (identity: number, deck: number, glow: Rgb) => {
      if (!ctx) return;
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, TEX_W, TEX_H);

      if (deck > 0.004) {
        const { margin, radius } = CARD_PX;
        const w = TEX_W - margin * 2;
        const h = TEX_H - margin * 2;

        /*
         * The halo, drawn outward from the card as a stack of rounded rings
         * that grow and dim. It is additive, so the layers pile up into a
         * gradient that is dense against the card's edge and gone before it
         * reaches the bezel.
         *
         * This is the only part of the screen that is ever *seen* as drawn
         * here. The card's own area is covered by the DOM element pinned on top
         * of it, and what is painted underneath matters for the light it casts
         * rather than the pixels it shows — which is why it is a flat wash and
         * not an attempt to imitate the website.
         */
        ctx.globalCompositeOperation = "lighter";
        for (let i = GLOW_STEPS - 1; i >= 0; i -= 1) {
          const t = (i + 1) / GLOW_STEPS;
          const grow = GLOW_REACH * t;
          ctx.fillStyle = rgba(glow, deck * 0.05 * (1 - t) ** 1.4);
          roundedPath(
            ctx,
            margin - grow,
            margin - grow,
            w + grow * 2,
            h + grow * 2,
            radius + grow,
          );
          ctx.fill();
        }

        ctx.globalCompositeOperation = "source-over";
        ctx.fillStyle = rgba(glow, deck * 0.86);
        roundedPath(ctx, margin, margin, w, h, radius);
        ctx.fill();
      }

      if (identity > 0.004) {
        const scale = (TEX_W * 0.16) / vw;
        ctx.globalCompositeOperation = "source-over";
        ctx.save();
        ctx.globalAlpha = identity;
        ctx.translate(
          TEX_W / 2 - (vw * scale) / 2 - vx * scale,
          TEX_H / 2 - (vh * scale) / 2 - vy * scale,
        );
        ctx.scale(scale, scale);
        ctx.fillStyle = "#fafaf7";
        ctx.fill(mark, "evenodd");
        ctx.restore();

        // A quiet rule beneath the mark for pacing — not an OS boot imitation.
        const barW = TEX_W * 0.1;
        ctx.globalAlpha = identity * 0.45;
        ctx.fillStyle = "#fafaf7";
        ctx.fillRect((TEX_W - barW) / 2, TEX_H * 0.68, barW * identity, 2);
        ctx.globalAlpha = 1;
      }

      texture.needsUpdate = true;
    };

    draw(0, 0, WHITE);
    return { texture, draw };
  }, []);

  useEffect(() => () => store.texture.dispose(), [store]);
  return store;
}

/**
 * The desk only exists where light falls on it. A single radial-gradient
 * texture gives the device something to sit on without introducing a grey
 * plane that would break the true-black canvas.
 */
function useDeskPool() {
  const store = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      const g = ctx.createRadialGradient(256, 256, 0, 256, 256, 256);
      g.addColorStop(0, "rgba(255,255,255,0.20)");
      g.addColorStop(0.42, "rgba(255,255,255,0.06)");
      g.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 512, 512);
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }, []);
  useEffect(() => () => store.dispose(), [store]);
  return store;
}

/* ------------------------------------------------------------------ *
 * Device
 * ------------------------------------------------------------------ */

/**
 * The parts of the loaded asset this scene drives, resolved once from the
 * mounted object rather than from the loader's own `nodes` and `materials`
 * maps.
 *
 * The distinction matters for a dull reason: those maps are hook return values,
 * and writing to something reached from one after render is exactly what the
 * compiler's immutability rule exists to catch. Every other light and material
 * in this file is already driven through a ref for the same reason, so the
 * model is too — resolve from `rootRef`, keep the handles here, and the
 * per-frame writes look like every other imperative write in the scene.
 */
type Rig = {
  pivot: THREE.Object3D | null;
  display: THREE.MeshStandardMaterial | null;
};

function Laptop() {
  const screen = useScreenTexture();
  const { scene } = useGLTF(MODEL_URL);
  const invalidate = useThree((state) => state.invalidate);

  const rootRef = useRef<THREE.Object3D>(null);
  const rig = useRef<Rig>({ pivot: null, display: null });

  // The portal target has to exist during render, so this one is read straight
  // off the loaded scene. It is only ever read here, never written.
  const pivot = useMemo(
    () => scene.getObjectByName("LidPivot") ?? null,
    [scene],
  );

  const keyLight = useRef<THREE.SpotLight>(null);
  const spill = useRef<THREE.PointLight>(null);
  const panelLight = useRef<THREE.RectAreaLight>(null);
  const hazeLayers = useRef<THREE.Group>(null);

  /** Quantised state of the last screen repaint, so most frames skip it. */
  const painted = useRef({ identity: -1, deck: -1, slide: -1 });
  const target = useMemo(() => new THREE.Vector3(), []);
  const glow = useRef<Rgb>(WHITE);

  /*
   * The card's four corners, in the lid pivot's own space. Constant — the card
   * does not move on the screen, the screen moves under the camera — so they
   * are built once and only ever transformed.
   */
  const cardCorners = useMemo(
    () =>
      (
        [
          [-1, 1],
          [1, 1],
          [1, -1],
          [-1, -1],
        ] as const
      ).map(
        ([sx, sy]) =>
          new THREE.Vector3(
            (sx * CARD.width) / 2,
            LAPTOP.panelCentre + (sy * CARD.height) / 2,
            // A hair proud of the glass, so the projected quad is the face the
            // viewer sees rather than a plane buried inside the lid.
            LAPTOP.panelFace + 0.001,
          ),
      ),
    [],
  );
  /*
   * Where those corners landed, in CSS pixels. A ref rather than a memo,
   * because it is written to every frame and a memo's result is not the
   * scene's to modify after render — the same reason the lights, the materials
   * and the haze uniforms in this file are all reached through refs.
   */
  const projected = useRef<Point[]>([
    { x: 0, y: 0 },
    { x: 0, y: 0 },
    { x: 0, y: 0 },
    { x: 0, y: 0 },
  ]);
  const scratch = useMemo(() => new THREE.Vector3(), []);
  /** The card element's own untransformed size, re-read only when it changes. */
  const cardBox = useRef({ el: null as HTMLElement | null, w: 0, h: 0 });

  /*
   * One uniform set per haze layer, created once. They are handed to the
   * materials as JSX props and then written to per frame through the group ref
   * below — the same way every other material and light in this scene is
   * driven. Going through the ref rather than closing over these objects also
   * keeps the render pass honest: nothing a hook returned is mutated after
   * render.
   */
  const hazeUniforms = useMemo(
    () =>
      HAZE_LAYERS.map((layer) => ({
        uPower: { value: 0 },
        uColor: { value: new THREE.Color("#ffffff") },
        uWeight: { value: layer.weight },
      })),
    [],
  );

  /*
   * The asset arrives with the materials it was authored with, which are tuned
   * for a grey product-shot backdrop. This room is black, so they are re-tuned
   * once on load.
   *
   * The display is the important one. Its job in the off state is to be black,
   * and the thing that stops it being black is the environment: spread across
   * the whole panel a soft reflection does not read as a reflection, it reads
   * as a screen that is already on. So the environment is damped almost to
   * nothing and the surface roughened, and every photon the display emits comes
   * from the emissive map on the timeline's schedule.
   */
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const display = (
      root.getObjectByName("Screen") as THREE.Mesh | undefined
    )?.material as THREE.MeshStandardMaterial | undefined;

    rig.current = {
      pivot: root.getObjectByName("LidPivot") ?? null,
      display: display ?? null,
    };

    if (display) {
      display.map = screen.texture;
      display.emissiveMap = screen.texture;
      display.color.set("#000000");
      display.emissive.set("#ffffff");
      display.emissiveIntensity = 0;
      display.metalness = 0.12;
      display.roughness = 0.44;
      display.envMapIntensity = 0.05;
      display.needsUpdate = true;
    }

    /*
     * Silver is a mid tone that happens to have bright highlights. Left at the
     * strength it was authored with — for a lit grey backdrop — the aluminium
     * clips to flat white in this room and the material goes with it.
     *
     * Parts are found by *node* name rather than material name. The node names
     * are the contract this scene has with the asset and are asserted by the
     * build script; material names are an implementation detail of the exporter
     * and are the kind of thing that quietly acquires a `.001` suffix, which
     * fails silently and looks exactly like a lighting problem.
     */
    const tune: Record<string, { env: number; roughness?: number }> = {
      Base: { env: 0.55, roughness: 0.36 },
      Chassis: { env: 0.5, roughness: 0.38 },
      Lid: { env: 0.55, roughness: 0.36 },
      Keys: { env: 0.14 },
      Well: { env: 0.08 },
      Speakers: { env: 0.1 },
      Trackpad: { env: 0.42, roughness: 0.34 },
      Bezel: { env: 0.1 },
      Hinge: { env: 0.22 },
    };

    for (const [name, settings] of Object.entries(tune)) {
      const mesh = root.getObjectByName(name) as THREE.Mesh | undefined;
      const material = mesh?.material as THREE.MeshStandardMaterial | undefined;
      if (!material) continue;
      material.envMapIntensity = settings.env;
      if (settings.roughness !== undefined) material.roughness = settings.roughness;
    }

    /*
     * Ask for a frame now the machine is actually here.
     *
     * The canvas draws on demand and the model is fetched, so the machine
     * arrives some time after the room it stands in. The next request for a
     * frame would otherwise be the first scroll — and until then the hero would
     * be showing a room the laptop has already loaded into.
     */
    let handle = 0;
    let remaining = 4;
    const prime = () => {
      invalidate();
      remaining -= 1;
      if (remaining > 0) handle = requestAnimationFrame(prime);
    };
    prime();
    return () => cancelAnimationFrame(handle);
  }, [invalidate, screen.texture, scene]);

  useFrame((state) => {
    // The store types the camera as the union of both projections, because a
    // scene is free to swap one in. This one is declared perspective on the
    // `<Canvas>` and the framing solve below is trigonometry on its field of
    // view, so it is narrowed once here rather than asserted at each use.
    const camera = state.camera as THREE.PerspectiveCamera;
    const { size } = state;
    const p = heroSignal.progress;

    // Every value below comes from `@/lib/heroChapters` — the same pure
    // functions the GSAP timeline, the DOM glow layers and the navigation read.
    // Nothing in this file decides for itself where in the story the page is.
    const open = lidOpenAt(p);
    const hinge = rig.current.pivot;
    if (hinge) {
      hinge.rotation.x = lerp(LAPTOP.closedAngle, LAPTOP.openAngle, open);
    }

    // One normalised value drives all six lighting layers: the emissive display,
    // the area-light rig, the volumetric haze, the desk pool, the contact
    // response and the DOM bleed. It is exactly zero while the lid is closed,
    // so nothing glows before the screen is on, and it stays up once the
    // machine has woken because the display is what the rest of the hero is
    // looking at.
    const emissive = screenPower(p);
    const deck = deckOn(p);
    const identity = startupIdentity(p);

    // A restrained pastel warmth during startup only.
    const warm = screenTint(p);

    // The website the screen is glowing the colour of, cross-faded rather than
    // switched, so the light in the room moves with the wipe on the card.
    const at = deckPosition(p);
    const from = SLIDE_GLOW[Math.min(Math.floor(at), SLIDE_GLOW.length - 1)];
    const to = SLIDE_GLOW[Math.min(Math.floor(at) + 1, SLIDE_GLOW.length - 1)];
    glow.current = mix(from, to, at - Math.floor(at));

    const display = rig.current.display;
    if (display) {
      display.emissiveIntensity = emissive * 1.25;
      display.emissive.setRGB(1, lerp(1, 0.985, warm * 0.6), lerp(1, 0.93, warm));
    }

    /*
     * Repaint the panel only when it would actually look different. The card's
     * glow, the startup mark and the slide colour all move continuously, so
     * without this the 2D canvas would be redrawn and re-uploaded on every
     * scroll frame for changes of a fraction of a per cent.
     */
    const slide = Math.round(at * 24);
    const marks = painted.current;
    if (
      Math.abs(identity - marks.identity) > 0.008 ||
      Math.abs(deck - marks.deck) > 0.008 ||
      slide !== marks.slide
    ) {
      screen.draw(identity, deck, glow.current);
      marks.identity = identity;
      marks.deck = deck;
      marks.slide = slide;
    }

    // Layer 2 — physical spill. A RectAreaLight is the honest primitive for a
    // display: it is an emitting rectangle the size of the panel, so the
    // falloff across the palm rest and the way the aluminium edges catch it are
    // computed from the panel's real shape rather than faked with a cone.
    //
    // All three lift once a website is up, because a panel showing a mostly
    // white page throws considerably more light than one showing a small mark
    // on black — and the deck chapter is where the keyboard and the deck should
    // be most clearly lit by the screen.
    //
    // The base strengths are about two thirds of what they were. Aluminium is
    // already near the top of the tone curve from the environment alone, so the
    // screen's contribution was landing in the shoulder and taking the palm
    // rest to flat white and the black keycaps to mid grey — which reads as the
    // room being lit rather than as one panel throwing light across a dark desk.
    const output = emissive * (1 + deck * 0.55);
    if (panelLight.current) {
      panelLight.current.intensity = output * 3.0;
      if (display) panelLight.current.color.copy(display.emissive);
    }
    if (keyLight.current) {
      const light = keyLight.current;
      light.intensity = output * 1.45;
      if (display) light.color.copy(display.emissive);
      // Aim down and forward at the deck. Without an explicit target the cone
      // points back at the display and blows out the startup screen.
      light.target.position.set(0, GROUND - 1.4, 1.6);
      light.target.updateMatrixWorld();
    }
    if (spill.current) spill.current.intensity = output * 0.55;

    // --- camera ------------------------------------------------------
    // Screen centre and facing, derived from the hinge geometry the model was
    // exported with, so the final approach lands exactly on the display's
    // normal rather than by eye.
    const hingeY = GROUND + LAPTOP.hinge.y;
    const hingeZ = LAPTOP.hinge.z;
    const cos = Math.cos(LAPTOP.openAngle);
    const sin = Math.sin(LAPTOP.openAngle);
    // Up the lid, and out of it. The panel's normal is the lid's up vector
    // turned a quarter turn towards the viewer.
    const upY = cos;
    const upZ = sin;
    const normalY = -sin;
    const normalZ = cos;
    const panelY = hingeY + upY * LAPTOP.panelCentre + normalY * LAPTOP.panelFace;
    const panelZ = hingeZ + upZ * LAPTOP.panelCentre + normalZ * LAPTOP.panelFace;

    const approach = cameraApproach(p);
    const settleIn = cameraSettle(p);
    const focus = cameraFocus(p);
    const drift = cameraDrift(p);

    /*
     * The closest the camera goes, solved from the panel and the viewport.
     *
     * Both limits are applied and the further of the two wins, so a wide window
     * is bounded by the panel's width and a tall one by its height. This is the
     * whole mechanism that keeps the bezel on screen: there is no distance in
     * here that was picked by looking at one browser window.
     */
    const tanV = Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2);
    const tanH = tanV * (size.width / size.height);
    const focusDistance =
      Math.max(
        LAPTOP.panel.width / (2 * FRAME_W * tanH),
        LAPTOP.panel.height / (2 * FRAME_H * tanV),
      ) * lerp(FRAME_BACK_OFF, 1, drift);

    /*
     * A lens shift rather than a tilt.
     *
     * The composition wants the machine low in the frame, with the top bezel
     * clear and some of the deck showing underneath. Tilting the camera down to
     * get that would put the panel into perspective and keystone the website on
     * it. Sliding the camera and its target down the lid by the same amount
     * keeps the view direction exactly along the panel's normal, so the display
     * stays a true rectangle and simply sits higher in frame.
     */
    const halfHeight = focusDistance * tanV;
    const shift = Math.min(
      Math.max(
        halfHeight - LID_ABOVE_PANEL - LAPTOP.panel.height * FRAME_TOP_MARGIN,
        0,
      ),
      // Capped, because the shift is only worth what it buys. On a tall window
      // there is far more spare height than the composition needs, and letting
      // all of it go under the machine simply fills the bottom third of the
      // frame with keyboard.
      LAPTOP.panel.height * 0.18,
    );

    const focusY = panelY + normalY * focusDistance - upY * shift;
    const focusZ = panelZ + normalZ * focusDistance - upZ * shift;
    const focusLookY = panelY - upY * shift;
    const focusLookZ = panelZ - upZ * shift;

    // Three staged viewpoints, then the solved one.
    const camY = lerp(lerp(2.2, 1.85, approach), 1.02, settleIn);
    const camZ = lerp(lerp(7.3, 6.3, approach), 4.6, settleIn);
    const lookY = lerp(lerp(0.28, 0.1, approach), 0.4, settleIn);
    const lookZ = lerp(0, -0.35, settleIn);

    camera.position.set(0, lerp(camY, focusY, focus), lerp(camZ, focusZ, focus));
    target.set(
      0,
      lerp(lookY, focusLookY, focus),
      lerp(lookZ, focusLookZ, focus),
    );
    camera.lookAt(target);

    // Layer 3 — atmosphere. Three.js lights do not scatter, so the mist has to
    // be geometry: layered quads in front of the panel that only become visible
    // in proportion to the same screen power.
    //
    // It thins out as the camera closes in. Mist is convincing across a room
    // and merely milky at arm's length, and by the closing shot it would be a
    // wash laid over the bezel the whole composition is built around.
    const haze = emissive * (1 - focus * 0.62);
    for (const layer of hazeLayers.current?.children ?? []) {
      const uniforms = ((layer as THREE.Mesh).material as THREE.ShaderMaterial)
        .uniforms;
      uniforms.uPower.value = haze;
      if (display) uniforms.uColor.value.copy(display.emissive);
    }

    // --- the inset card ----------------------------------------------
    /*
     * Pin the DOM deck to the panel.
     *
     * The matrices have to be forced up to date here because R3F updates them
     * as part of the render that happens *after* every `useFrame` callback has
     * run. Projecting against last frame's matrices would leave the card
     * trailing the lid by one frame during the opening, which reads as the
     * website sliding around inside the screen.
     */
    const card = heroSignal.screenCard;
    if (card && hinge) {
      const box = cardBox.current;
      if (box.el !== card || box.w === 0) {
        box.el = card;
        box.w = card.offsetWidth;
        box.h = card.offsetHeight;
      }

      hinge.updateWorldMatrix(true, false);
      camera.updateMatrixWorld();
      camera.matrixWorldInverse.copy(camera.matrixWorld).invert();

      const corners = projected.current;
      for (let i = 0; i < cardCorners.length; i += 1) {
        scratch.copy(cardCorners[i]).applyMatrix4(hinge.matrixWorld).project(camera);
        corners[i].x = (scratch.x * 0.5 + 0.5) * size.width;
        corners[i].y = (0.5 - scratch.y * 0.5) * size.height;
      }

      const transform = quadTransform(
        [corners[0], corners[1], corners[2], corners[3]],
        box.w,
        box.h,
      );
      if (transform) card.style.transform = transform;
    }
  });

  return (
    <group position={[0, GROUND, 0]}>
      {/*
        The loaded scene goes inside a group rather than carrying the ref
        itself: `<primitive>` does not forward one, so a ref put on it stays
        null and every lookup below silently finds nothing — which showed up as
        a display with no texture on it and a keyboard that never went black.
      */}
      <group ref={rootRef}>
        <primitive object={scene} />
      </group>

      {/*
        The screen's own light rig, portalled into the lid so it travels with
        the display rather than being re-aimed every frame. Everything here is
        positioned in the hinge's space: +Y runs up the lid, +Z is the way the
        panel faces.
      */}
      {pivot
        ? createPortal(
            <>
              {/* Both punctual lights sit clear of the display plane, so the
                  spill lands on the deck and the desk and never washes across
                  the screen itself. */}
              <spotLight
                ref={keyLight}
                position={[0, LAPTOP.panelCentre - 0.75, 1.35]}
                angle={0.95}
                penumbra={1}
                distance={8}
                decay={1.4}
                intensity={0}
              />
              <pointLight
                ref={spill}
                position={[0, LAPTOP.panelCentre - 1.35, 2.4]}
                distance={6}
                decay={2}
                intensity={0}
              />

              {/*
                The panel itself as a light source, matched to the display's real
                width and height. Rotated a half turn because a RectAreaLight
                emits along its local -Z, the same convention `lookAt` uses, and
                the screen faces +Z in the lid's space.
              */}
              <rectAreaLight
                ref={panelLight}
                position={[0, LAPTOP.panelCentre, LAPTOP.panelFace + 0.02]}
                rotation={[0, Math.PI, 0]}
                width={LAPTOP.panel.width}
                height={LAPTOP.panel.height}
                intensity={0}
              />

              <group ref={hazeLayers}>
                {HAZE_LAYERS.map((layer, index) => (
                  <mesh
                    key={layer.z}
                    position={[
                      0,
                      LAPTOP.panelCentre,
                      LAPTOP.panelFace + layer.z,
                    ]}
                    renderOrder={2}
                  >
                    <planeGeometry
                      args={[
                        LAPTOP.panel.width * layer.scale,
                        LAPTOP.panel.height * layer.scale,
                      ]}
                    />
                    <shaderMaterial
                      vertexShader={HAZE_VERT}
                      fragmentShader={HAZE_FRAG}
                      uniforms={hazeUniforms[index]}
                      transparent
                      depthWrite={false}
                      /*
                       * Depth *testing* is off as well, not just depth writing.
                       * Mist is between the camera and everything else, so it
                       * has no business being clipped by what it hangs in front
                       * of. With the test on, the desk — nearer the camera
                       * across the bottom of the frame — cut the haze off along
                       * its own horizon. The falloff in the shader is what
                       * bounds these quads; depth was only ever making a seam.
                       */
                      depthTest={false}
                      blending={THREE.AdditiveBlending}
                      toneMapped={false}
                    />
                  </mesh>
                ))}
              </group>
            </>,
            pivot,
          )
        : null}
    </group>
  );
}

/* ------------------------------------------------------------------ *
 * Room
 * ------------------------------------------------------------------ */

function Scene() {
  const deskPool = useDeskPool();
  const pool = useRef<THREE.Mesh>(null);

  useFrame(() => {
    const material = pool.current?.material as THREE.Material | undefined;
    if (!material) return;
    // A little light on the desk even before the screen is on, so the machine
    // is sitting on something rather than floating in the void, then the
    // screen's own contribution on top of it.
    material.opacity = 0.12 + screenPower(heroSignal.progress) * 0.5;
  });

  return (
    <>
      <color attach="background" args={["#000000"]} />
      {/*
        Distance fog dissolves the desk into the black canvas, which is what
        gives the scene depth without a grey backdrop.

        The near plane has to sit *behind* the machine, or the product is two
        thirds of the way to black before anything else has a say. The far plane
        is pushed well past anything the camera frames, because linear fog
        reaches its far distance by clamping and the crease that leaves is
        visible on a large ground plane.
      */}
      <fog attach="fog" args={["#000000", 9, 30]} />
      {/*
        Almost all of the light on the machine comes from the environment, and
        very little from lamps. That is not a stylistic preference, it is what
        the material is: the chassis is `metalness: 1`, so a directional light
        contributes nothing but a specular lobe, and across a panel as large and
        as flat as the palm rest a broad lobe is not a highlight — it is a wash.
        Three of them at the strength they were had the aluminium clipped to
        white regardless of what the environment or the exposure did, which is
        why turning both of those down repeatedly changed nothing.

        Lamps now only pick out edges. Shape comes from what the metal reflects.
      */}
      <ambientLight intensity={0.06} />
      <directionalLight position={[-3.2, 5.2, 4.2]} intensity={0.28} color="#dfe6f2" />
      <directionalLight position={[4.5, 2.2, -3]} intensity={0.14} color="#8ea0bd" />
      {/* Grazing light along the front edge, so the machined chamfer reads. */}
      <directionalLight position={[0, 0.6, 8]} intensity={0.16} color="#ffffff" />

      {/*
        Procedural environment for the aluminium reflections. Rendered once from
        Lightformers, so nothing is fetched over the network.

        These are the brightness control for the whole machine, not the lamps
        above. The chassis is a metal, and a metal has no diffuse response — it
        only reflects. Worse, the closed lid is seen almost edge-on, and at a
        grazing angle Fresnel drives reflectance towards one regardless of base
        colour, so the shut laptop is effectively a mirror. Turning the lamps or
        the exposure down did nothing to it; turning down what it is mirroring
        is the only thing that does.
      */}
      <Environment resolution={192} frames={1}>
        {/* A broad softbox overhead. The closed lid is close to horizontal, so
            this is the shape it actually reflects — it is what stops the
            aluminium reading as a flat grey slab. */}
        <Lightformer
          intensity={0.95}
          color="#ffffff"
          position={[0, 7, 1.5]}
          scale={[12, 7, 1]}
        />
        <Lightformer
          intensity={0.85}
          color="#eaf0ff"
          position={[-4, 3.5, 3]}
          scale={[6, 3, 1]}
        />
        <Lightformer
          intensity={0.62}
          color="#8fa6cc"
          position={[4.5, 1.5, -2.5]}
          scale={[5, 5, 1]}
        />
        {/*
          Behind and slightly above, at a fraction of its original strength.
          This one sits at the far end of the desk, and at full power it lit the
          ground plane brightest exactly where the plane runs out — drawing a
          hard horizontal line across the full width of the room.
        */}
        <Lightformer
          intensity={1.0}
          color="#ffffff"
          position={[0, 2.8, -9]}
          scale={[18, 5, 1]}
        />
        <Lightformer
          intensity={0.78}
          color="#cddaf0"
          position={[-6, 1.4, -6]}
          scale={[8, 4, 1]}
        />
        <Lightformer
          intensity={0.42}
          color="#ffffff"
          position={[0, -1.5, 4]}
          scale={[9, 1.6, 1]}
        />
      </Environment>

      {/*
        The model is fetched, so it arrives a beat after the room does. Giving
        it its own boundary means the lights, the desk and the fog mount
        immediately and the hero is never a blank canvas waiting on a file —
        the machine simply appears in a room that is already there.
      */}
      <Suspense fallback={null}>
        <Laptop />
      </Suspense>

      {/*
        The desk, and why it is unlit.

        A large ground plane is the worst surface in a scene like this one: it
        is nearly edge-on to the camera across most of the frame, which
        exaggerates every discontinuity a renderer has. Three separate ones
        showed up on it — a Lightformer's rectangular reflection, linear fog
        clamping at its far plane, and a punctual light reaching its `distance`
        cutoff — and each drew the same symptom, a straight bright line across
        the full width of the room that looked like broken geometry.

        They are all the same bug: a lit surface at a grazing angle reports the
        seams in whatever is lighting it. So nothing lights this one. The plane
        is `meshBasicMaterial` and black — no lights, no environment, no fog
        term, nothing that can crease — and every visible thing on the desk is
        drawn on top of it: the additive pool below, and the contact shadow that
        sits the machine down on it.

        It has to exist even though it is black, because it occludes. Without it
        the mist behind the machine would spill down over the floor.
      */}
      <mesh position={[0, GROUND - 0.006, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[30, 30]} />
        <meshBasicMaterial color="#000000" fog={false} />
      </mesh>

      {/*
        The pool of light on the desk. This is the desk, as far as the eye is
        concerned. Its opacity is driven by the same screen-power value as
        everything else, so the surface in front of the machine is dark while
        the lid is shut and brightens as the display comes up — which is most of
        what makes the power-on read as a light being switched on in a room
        rather than as a texture swap on a screen.
      */}
      <mesh
        ref={pool}
        position={[0, GROUND - 0.0015, 0.1]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[13, 9]} />
        <meshBasicMaterial
          map={deskPool}
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          fog={false}
        />
      </mesh>

      <ContactShadows
        position={[0, GROUND + 0.002, 0]}
        opacity={0.78}
        scale={9}
        blur={2.6}
        far={2.4}
        resolution={512}
        color="#000000"
        frames={1}
      />
    </>
  );
}

/**
 * Draws only while the hero is the thing on screen.
 *
 * The canvas is on `frameloop="demand"`, so a frame happens only when something
 * asks for one. The asking is done by the scrubbed hero timeline, through
 * `heroSignal.requestFrame` — never from inside `useFrame`, which cannot
 * restart itself once the loop has stopped. One `invalidate` here covers the
 * resting frame drawn at mount, and a resize has to ask for one too: the camera
 * distance is solved from the viewport, so a window that changes shape while
 * the hero is still needs the framing re-solved.
 */
function RenderGate() {
  const invalidate = useThree((state) => state.invalidate);
  const size = useThree((state) => state.size);

  useEffect(() => {
    heroSignal.requestFrame = invalidate;
    return () => {
      heroSignal.requestFrame = () => {};
    };
  }, [invalidate]);

  /*
   * Prime the scene with a short burst of frames, and again whenever the
   * viewport changes shape.
   *
   * A burst rather than a single frame, because two things here capture
   * themselves once and then stop — the environment cube the aluminium
   * reflects, and the contact shadow under the machine — and both do that
   * capture from inside a `useFrame`. On a demand loop a `useFrame` only runs
   * when a frame has been asked for, so anything that has not mounted by the
   * time the one startup frame is served never gets to capture at all. The
   * chassis is `metalness: 1` in a black room, so an environment map that never
   * rendered would not leave the machine dim, it would leave it invisible.
   *
   * The resize case is not insurance, it is required: the closing camera
   * distance is solved from the viewport, so a window that changes shape while
   * the page is still needs the framing worked out again.
   *
   * Six frames across six animation frames is a few milliseconds once, and then
   * the loop goes back to sleep until the timeline moves.
   */
  useEffect(() => {
    let handle = 0;
    let remaining = 6;
    const prime = () => {
      invalidate();
      remaining -= 1;
      if (remaining > 0) handle = requestAnimationFrame(prime);
    };
    prime();
    return () => cancelAnimationFrame(handle);
  }, [invalidate, size.width, size.height]);

  return null;
}

export default function LaptopScene3D({ className }: { className?: string }) {
  useEffect(() => {
    heroSignal.webgl = true;
    return () => {
      heroSignal.webgl = false;
    };
  }, []);

  return (
    <Canvas
      className={className}
      // `demand` plus an explicit invalidate keeps the GPU idle once the hero
      // has been scrolled past, instead of rendering behind the rest of the page.
      frameloop="demand"
      shadows
      dpr={[1, 1.75]}
      gl={{ antialias: true, powerPreference: "high-performance", alpha: false }}
      camera={{ fov: 34, near: 0.05, far: 60, position: [0, 2.2, 7.3] }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        /*
         * Pulled down from 0.72. ACES compresses highlights hard, so once the
         * aluminium is into the shoulder of the curve a thirty per cent cut to
         * the lights moves the rendered value by about one per cent — the metal
         * stays clipped to white and only the exposure can bring it back. This
         * is a dark room, and the machine is the only thing in it.
         */
        gl.toneMappingExposure = 0.52;
      }}
    >
      <Scene />
      <RenderGate />
    </Canvas>
  );
}

useGLTF.preload(MODEL_URL);
