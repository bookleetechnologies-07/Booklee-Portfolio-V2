"""
Builds the Booklee hero notebook and exports it as a glTF binary.

Run it headless:

    blender --background --factory-startup --python tools/laptop/build_laptop.py

It writes `public/models/laptop.glb`. Nothing is fetched: the mesh is generated
from the numbers below every time, so the asset is reproducible and the script
rather than the binary is the thing to review when the shape needs changing.

Why this exists
---------------
The hero used to build its notebook out of `RoundedBox` primitives inside React
Three Fiber. Primitives cannot express the things that make a machined product
read as machined — a continuous unibody shell, corner radii that carry around a
chamfer, a lid that closes to a seam rather than into the deck — and no amount
of material tuning fixes geometry that is wrong. So the geometry is modelled
here, with real modifiers, and R3F is left to do what it is good at: loading,
lighting, camera, materials, screen texture and scroll animation.

What it is, and is not
----------------------
A generic silver aluminium notebook. Proportions are taken from a modern 14-inch
professional laptop because that is the class of object the hero is depicting.

It carries no manufacturer's marks. There is no logo on the lid, no notch in the
display, and no badge anywhere on the chassis. The bezel is uninterrupted on all
four sides. That is a deliberate constraint, not an oversight: the references
this was modelled against are photographs of a branded product, and only the
proportions and the construction were taken from them.

The five things this revision changes, and why
----------------------------------------------
1.  **The lid's bottom edge is a barrel concentric with the hinge axis.** It was
    a flat cut sitting a couple of millimetres above the deck, which is what
    made the display read as floating: a flat edge over a flat deck shows a
    wedge of shadow that opens and closes as the lid moves, and the eye reads
    that wedge as a gap rather than as a joint. A half-round centred on the axis
    presents the same silhouette at every angle, so the lid turns *in* the base
    instead of hovering over it — and when shut that same barrel is the rear
    edge of the closed machine.

2.  **The panel lives in a pocket milled into the lid.** It used to be a black
    plate laid on the lid's front face with the aluminium showing only as a
    hairline around it, so the display was a rectangle stuck to a slab. Now the
    face is cut 0.5 mm deep and the mask and the glass sit inside that cut, with
    a visible aluminium rim standing proud around all four sides. The bezel has
    walls, and the screen is inside the enclosure rather than in front of it.

3.  **The base is two shells.** One slab cannot have the seam a unibody has. The
    upper deck and the lower chassis are separate, the chassis a quarter of a
    millimetre narrower with a heavier roll-over, and where the two roll-overs
    meet they draw the groove that runs round a real machine.

4.  **The speaker grilles are perforated.** They were two shallow rectangular
    pits, which is what a cut-out looks like and not what a grille looks like.
    They are now a staggered field of small dark discs lying on the floor of a
    very shallow recess — the whole field is one joined mesh, so it costs one
    draw call and about six thousand triangles.

5.  **The keyboard is on a real pitch.** The well was too narrow, so the caps
    came out small and the gaps between them too tight to see, and the field
    read as one dark mass with lines scratched in it. The well is wider, the
    caps sit on an 18.4 mm pitch with a 2.4 mm gap, and the floor of the well is
    its own black plate rather than aluminium in shadow.

Conventions
-----------
Blender is Z-up; glTF is Y-up and the exporter converts. Modelling happens with
X across the machine, +Y toward the back, Z up, which lands in three.js as X
across, Y up, and the front of the laptop facing +Z — that is, toward a camera
on the +Z axis, which is where the hero puts it.

The lid is modelled *upright*, standing perpendicular to the base, and hangs off
an empty named `LidPivot` placed on the hinge axis. The hero rotates that empty
and nothing else: +90 degrees lays the lid shut, -17 degrees opens it to 107.
"""

from __future__ import annotations

import math
import os
import sys

import bpy
from mathutils import Vector

# --------------------------------------------------------------------------- #
# Dimensions.
#
# Everything is written in millimetres and converted once, so the numbers below
# can be compared directly against a real machine. `U` is the scene unit: the
# hero's camera framing is built around a laptop three units wide, so the export
# is scaled to land there rather than being rescaled at load time.
# --------------------------------------------------------------------------- #

WIDTH_MM = 312.6

U = 3.0 / WIDTH_MM  # scene units per millimetre
MM = U


def mm(value: float) -> float:
    return value * MM


W = mm(WIDTH_MM)

BASE_H = mm(11.1)
LID_T = mm(4.4)

# The base splits into two shells. The deck carries everything that is cut into
# the machine; the chassis is the tray underneath it.
DECK_H = mm(4.9)
CHASSIS_H = BASE_H - DECK_H
# How much narrower the lower tray is, per side. Small enough to read as a
# manufacturing seam and not as a step.
CHASSIS_INSET = mm(0.25)

# The radius the whole silhouette is built on. Large, even, and identical on the
# lid and the base, which is what makes the closed machine read as one object.
CORNER_R = mm(11.5)

# The roll-over on the top and bottom perimeters. Not a hard chamfer — six
# segments of it reads as the soft break a machined edge actually has. The
# chassis gets the heavier one, so the machine looks thinner than it is from the
# front and the seam between the two shells has somewhere to sit.
EDGE_R_DECK = mm(0.85)
EDGE_R_CHASSIS = mm(1.35)
EDGE_R_LID = mm(0.9)

# The gap the lid closes onto. Small enough to read as a seam rather than a gap,
# large enough that the two halves never intersect.
SEAM = mm(0.45)

# --------------------------------------------------------------------------- #
# Display.
#
# The chain across the lid is: aluminium rim, then the wall of the pocket, then
# the printed mask, then the panel. Every one of those has to be a real
# thickness or the display goes back to being a sticker.
#
# The depth is *derived* from the display, not chosen: the lid has to reach the
# front lip when it shuts, so its height fixes how deep the machine is. Solving
# it in that direction is what stops the closed silhouette from ending in a
# step, which is what it did when the two were picked independently.
# --------------------------------------------------------------------------- #

# Aluminium standing proud around the glass, per side.
RIM = mm(2.6)
# How deep the glass sits inside the lid.
POCKET_D = mm(0.5)
BEZEL_T = mm(0.35)

# The printed border, inside the pocket. Even on three sides with a deeper chin,
# because the driver board has to live somewhere and a perfectly even border is
# one of the things that makes a rendered laptop look rendered.
BEZEL = mm(5.0)
CHIN = mm(9.0)

# 16:10.4, which is the shape a 14-inch panel of this class actually is.
PANEL_ASPECT = 1.54

PANEL_W = W - RIM * 2.0 - BEZEL * 2.0
PANEL_H = PANEL_W / PANEL_ASPECT
LID_H = PANEL_H + RIM * 2.0 + BEZEL + CHIN

# The lid hangs off an axis half its own thickness in front of the back edge, so
# that when it shuts its far edge lands exactly on the front lip.
D = LID_H + LID_T / 2.0
DEPTH_MM = D / MM

# --------------------------------------------------------------------------- #
# Keyboard well.
#
# The deck is laid out front to back and the numbers have to agree, or parts of
# it end up inside each other: front lip, trackpad, a gap, the key field, and
# then the run back to the hinge.
# --------------------------------------------------------------------------- #

WELL_W = mm(264.0)
WELL_D = mm(104.0)
WELL_DEPTH = mm(1.5)
WELL_R = mm(3.2)
PAD_FRONT_MM = 10.0
PAD_W = mm(128.0)
PAD_D = mm(78.0)
PAD_DEPTH = mm(0.22)
PAD_R = mm(5.5)
PAD_TO_WELL_MM = 8.0
WELL_FRONT_MM = PAD_FRONT_MM + PAD_D / MM + PAD_TO_WELL_MM

# Caps sit on an 18.4 mm pitch with a 2.4 mm gap, which is the spacing that
# makes a laptop keyboard read as separate keys rather than as a dark field.
KEY_GAP = mm(2.4)
KEY_H = mm(1.0)  # how far a cap stands proud of the well floor
KEY_R = mm(0.7)

# The shallow scallop in the front lip that a thumb opens the lid with. Cut into
# the chamfer, not out of the face — restrained, because an exaggerated one is
# the single most obvious tell on a CG notebook.
RECESS_W = mm(52.0)
RECESS_D = mm(7.0)
RECESS_H = mm(1.6)

# --------------------------------------------------------------------------- #
# Speaker grilles.
#
# Narrow bands either side of the key field, each a very shallow recess with a
# staggered field of small dark discs lying on its floor. Two offset grids
# rather than one, because an orthogonal lattice reads as a texture mistake and
# a hexagonal one reads as a grille.
# --------------------------------------------------------------------------- #

GRILLE_W = mm(15.0)
GRILLE_GAP = mm(3.0)
GRILLE_DEPTH = mm(0.28)
DOT_PITCH = mm(2.6)
DOT_R = mm(0.62)

# --------------------------------------------------------------------------- #
# Hinge.
# --------------------------------------------------------------------------- #

# The dark band across the rear of the deck, in front of the barrel. Real
# machines show very little here; this is just enough for the joint to be
# readable at the distance the hero frames it from.
HINGE_BAND_D = mm(5.5)
HINGE_BAND_DEPTH = mm(0.45)

LID_OPEN_DEG = 107.0

OUT = os.path.join("public", "models", "laptop.glb")
METRICS = os.path.join("src", "lib", "laptopMetrics.ts")


# --------------------------------------------------------------------------- #
# Scene helpers
# --------------------------------------------------------------------------- #


def reset_scene() -> None:
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene
    scene.unit_settings.system = "NONE"


def material(name: str, colour, metallic: float, roughness: float):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = (*colour, 1.0)
    bsdf.inputs["Metallic"].default_value = metallic
    bsdf.inputs["Roughness"].default_value = roughness
    return mat


def bake(obj, *, location=False, rotation=False, scale=False) -> None:
    """
    Push an object's transform into its mesh.

    `transform_apply` is an operator, and an operator acts on the *selection*,
    not on whatever happens to be active. Several things here leave the
    selection empty — a boolean deletes its cutter, `shade_smooth` deselects on
    the way out — and calling the operator then silently does nothing at all.
    That failure is invisible: the object still looks right, because an unbaked
    rotation is applied at draw time anyway, and it only surfaces later when
    something joins to it or reads its local bounds. So selection is set here,
    every time, rather than assumed.
    """
    bpy.ops.object.select_all(action="DESELECT")
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.transform_apply(
        location=location, rotation=rotation, scale=scale
    )
    obj.select_set(False)


def add_box(name: str, size, location=(0.0, 0.0, 0.0)):
    """A box whose dimensions are given directly, centred on `location`."""
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=location)
    obj = bpy.context.active_object
    obj.name = name
    obj.scale = Vector(size)
    bake(obj, scale=True)
    return obj


def set_corner_bevel_weights(obj) -> None:
    """
    Mark the four vertical corner edges so the corner bevel can find them.

    Blender 4.x moved bevel weights out of `MeshEdge` and into a named float
    attribute, so this writes the attribute and falls back to the old property
    if it is ever run on something older.
    """
    mesh = obj.data
    vertical = [
        i
        for i, edge in enumerate(mesh.edges)
        if abs(
            mesh.vertices[edge.vertices[0]].co.z - mesh.vertices[edge.vertices[1]].co.z
        )
        > 1e-6
    ]

    attribute = mesh.attributes.get("bevel_weight_edge")
    if attribute is None:
        try:
            attribute = mesh.attributes.new("bevel_weight_edge", "FLOAT", "EDGE")
        except (RuntimeError, TypeError):
            attribute = None

    if attribute is not None:
        for index in vertical:
            attribute.data[index].value = 1.0
        return

    mesh.use_customdata_edge_bevel = True  # pragma: no cover - legacy Blender
    for index in vertical:
        mesh.edges[index].bevel_weight = 1.0


def apply(obj, modifier) -> None:
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.modifier_apply(modifier=modifier.name)


def bevel(obj, *, width: float, segments: int, limit: str, angle: float = 30.0):
    modifier = obj.modifiers.new("Bevel", "BEVEL")
    modifier.width = width
    modifier.segments = segments
    modifier.limit_method = limit
    modifier.miter_outer = "MITER_ARC"
    modifier.harden_normals = False
    if limit == "ANGLE":
        modifier.angle_limit = math.radians(angle)
    apply(obj, modifier)
    return obj


def rounded_slab(name: str, width: float, depth: float, height: float,
                 corner: float, edge: float, location, edge_segments: int = 6,
                 corner_segments: int = 14):
    """
    The shape everything here is made of: a slab with large vertical corner radii
    and a rolled-over top and bottom perimeter.

    Two bevels, in this order and applied rather than stacked. The first rounds
    only the four corner columns, using the weights marked above. The second runs
    on angle and catches everything left sharp — including the perimeter the
    first one just created, so the roll-over carries continuously around the
    corners instead of stopping at them. That continuity is the whole point; it
    is what a unibody looks like and what a stack of boxes cannot do.
    """
    obj = add_box(name, (width, depth, height), location)
    set_corner_bevel_weights(obj)
    bevel(obj, width=corner, segments=corner_segments, limit="WEIGHT")
    bevel(obj, width=edge, segments=edge_segments, limit="ANGLE", angle=25.0)
    return obj


def boolean(obj, cutter, operation: str = "DIFFERENCE") -> None:
    modifier = obj.modifiers.new("Boolean", "BOOLEAN")
    modifier.operation = operation
    modifier.object = cutter
    modifier.solver = "EXACT"
    apply(obj, modifier)
    bpy.data.objects.remove(cutter, do_unlink=True)


def assign(obj, mat) -> None:
    obj.data.materials.clear()
    obj.data.materials.append(mat)


def shade_smooth(obj, angle: float = 35.0) -> None:
    """
    Smooth the curved surfaces and leave the machined edges sharp.

    Blender 4.1 removed the old `use_auto_smooth` flag in favour of an operator
    that bakes the split-normal decision into the mesh, which is also what the
    glTF exporter reads. Sharpness matters here: a chamfer that has been
    smoothed across loses the highlight that makes it read as a chamfer, and the
    highlight running around the corner radii is most of what says "milled from
    one piece" rather than "assembled from parts".
    """
    bpy.ops.object.select_all(action="DESELECT")
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.shade_smooth_by_angle(angle=math.radians(angle))
    obj.select_set(False)


def join(objects, name: str):
    """Collapse a list of objects into one, so a field of parts is one draw."""
    bpy.ops.object.select_all(action="DESELECT")
    for obj in objects:
        obj.select_set(True)
    bpy.context.view_layer.objects.active = objects[0]
    bpy.ops.object.join()
    joined = bpy.context.active_object
    joined.name = name
    joined.select_set(False)
    return joined


# --------------------------------------------------------------------------- #
# The base
# --------------------------------------------------------------------------- #

def build_chassis(materials):
    """
    The tray the machine sits on.

    Its own shell rather than the bottom of one slab, because the groove where
    two rolled-over perimeters meet is the seam a unibody has and a single slab
    has nowhere to put one. It is also slightly narrower and more heavily
    rolled, which is what makes the machine look thinner from the front than its
    section actually is.
    """
    chassis = rounded_slab(
        "Chassis",
        W - CHASSIS_INSET * 2.0,
        D - CHASSIS_INSET * 2.0,
        CHASSIS_H,
        CORNER_R - CHASSIS_INSET,
        EDGE_R_CHASSIS,
        (0.0, 0.0, CHASSIS_H / 2.0),
    )
    assign(chassis, materials["aluminium"])
    shade_smooth(chassis)
    return chassis


def build_deck(materials):
    """
    The upper shell: one piece, then everything else cut out of it.

    Each recess is a boolean rather than a plate laid on top, so the keyboard
    well, the trackpad seam, the grilles and the finger scallop all have real
    walls and a real floor and catch light on their own edges. That is the
    difference between a recess and a dark rectangle.
    """
    deck = rounded_slab(
        "Base",
        W,
        D,
        DECK_H,
        CORNER_R,
        EDGE_R_DECK,
        (0.0, 0.0, CHASSIS_H + DECK_H / 2.0),
    )

    top = BASE_H

    # Keyboard well. Cut deep enough that the caps sit below the deck line and
    # the closed lid never touches them.
    well_centre_y = -D / 2.0 + mm(WELL_FRONT_MM) + WELL_D / 2.0
    well = rounded_slab(
        "WellCutter",
        WELL_W,
        WELL_D,
        WELL_DEPTH * 2.0,
        WELL_R,
        mm(0.3),
        (0.0, well_centre_y, top),
        edge_segments=3,
        corner_segments=6,
    )
    boolean(deck, well)

    # Speaker recesses either side of the well. Barely a recess at all — it
    # exists so the perforation has a floor to lie on and a wall to shadow it,
    # not so there is a visible pit.
    for side in (-1, 1):
        x = side * (WELL_W / 2.0 + GRILLE_GAP + GRILLE_W / 2.0)
        grille = rounded_slab(
            f"GrilleCutter{side}",
            GRILLE_W,
            WELL_D * 0.92,
            GRILLE_DEPTH * 2.0,
            mm(2.2),
            mm(0.15),
            (x, well_centre_y, top),
            edge_segments=2,
            corner_segments=4,
        )
        boolean(deck, grille)

    # Trackpad seam. A fifth of a millimetre — enough to draw a line, not enough
    # to read as a step.
    pad_centre_y = -D / 2.0 + mm(PAD_FRONT_MM) + PAD_D / 2.0
    pad = rounded_slab(
        "PadCutter",
        PAD_W,
        PAD_D,
        PAD_DEPTH * 2.0,
        PAD_R,
        mm(0.1),
        (0.0, pad_centre_y, top),
        edge_segments=2,
        corner_segments=8,
    )
    boolean(deck, pad)

    # The hinge band: a shallow flat across the rear of the deck, immediately in
    # front of the barrel. Without it the lid's underside meets plain aluminium
    # and the joint has no line to read along.
    band = rounded_slab(
        "HingeBandCutter",
        W - CORNER_R * 2.0,
        HINGE_BAND_D,
        HINGE_BAND_DEPTH * 2.0,
        mm(1.6),
        mm(0.12),
        (0.0, D / 2.0 - LID_T - HINGE_BAND_D / 2.0, top),
        edge_segments=2,
        corner_segments=6,
    )
    boolean(deck, band)

    # The finger scallop in the front lip. A wide, very shallow ellipse cut into
    # the chamfer rather than a notch taken out of the face.
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.5, segments=48, ring_count=24)
    recess = bpy.context.active_object
    recess.name = "RecessCutter"
    recess.scale = Vector((RECESS_W, RECESS_D, RECESS_H))
    recess.location = Vector((0.0, -D / 2.0 + mm(0.8), top - mm(1.1)))
    bake(recess, scale=True)
    boolean(deck, recess)

    assign(deck, materials["aluminium"])
    shade_smooth(deck)
    return deck, well_centre_y, pad_centre_y


def build_well_floor(materials, well_centre_y):
    """
    The black floor the keys stand on.

    Aluminium in shadow is not black, it is dark grey with a highlight in it,
    and a keyboard well that colour makes the caps look like they are sitting on
    a tray instead of in a machine. So the floor is its own plate.
    """
    floor = rounded_slab(
        "Well",
        WELL_W - mm(0.5),
        WELL_D - mm(0.5),
        mm(0.12),
        WELL_R - mm(0.2),
        mm(0.04),
        (0.0, well_centre_y, BASE_H - WELL_DEPTH + mm(0.06)),
        edge_segments=2,
        corner_segments=6,
    )
    assign(floor, materials["well"])
    return floor


def build_trackpad(materials, pad_centre_y):
    """The pad surface itself, sitting on the floor of its recess."""
    pad = rounded_slab(
        "Trackpad",
        PAD_W - mm(0.45),
        PAD_D - mm(0.45),
        mm(0.28),
        PAD_R - mm(0.18),
        mm(0.09),
        (0.0, pad_centre_y, BASE_H - PAD_DEPTH + mm(0.04)),
        edge_segments=2,
    )
    assign(pad, materials["trackpad"])
    shade_smooth(pad, 20.0)
    return pad


def build_speakers(materials, well_centre_y):
    """
    The perforation, as one mesh.

    Each hole is a flat disc lying on the floor of the grille recess rather than
    a cylinder bored through the deck: at the size this renders, a dark disc in
    a shadowed recess is indistinguishable from a hole, and boring several
    hundred real ones would cost an exact boolean per hole to build and about
    five times the triangles to draw.

    Two offset grids rather than one. An orthogonal lattice of dots reads as a
    texture that has gone wrong; staggering the rows is what makes it read as a
    grille.
    """
    floor_z = BASE_H - GRILLE_DEPTH + mm(0.05)
    field_w = GRILLE_W - mm(2.4)
    field_d = WELL_D * 0.92 - mm(3.0)

    cols = max(int(field_w / DOT_PITCH), 1)
    rows = max(int(field_d / DOT_PITCH), 1)

    dots = []
    for side in (-1, 1):
        centre_x = side * (WELL_W / 2.0 + GRILLE_GAP + GRILLE_W / 2.0)
        # Two grids on the same pitch, the second shifted half a pitch in both
        # directions. Together they are a hexagonal packing.
        for stagger in (0, 1):
            n_cols = cols - stagger
            n_rows = rows - stagger
            if n_cols < 1 or n_rows < 1:
                continue

            start_x = centre_x - (n_cols - 1) * DOT_PITCH / 2.0
            start_y = well_centre_y - (n_rows - 1) * DOT_PITCH / 2.0

            bpy.ops.mesh.primitive_circle_add(
                vertices=10,
                radius=DOT_R,
                fill_type="NGON",
                location=(start_x, start_y, floor_z),
            )
            dot = bpy.context.active_object
            dot.name = f"Dots{side}{stagger}"

            for axis, count in (("x", n_cols), ("y", n_rows)):
                modifier = dot.modifiers.new(f"Array{axis}", "ARRAY")
                modifier.use_relative_offset = False
                modifier.use_constant_offset = True
                modifier.constant_offset_displace = (
                    DOT_PITCH if axis == "x" else 0.0,
                    DOT_PITCH if axis == "y" else 0.0,
                    0.0,
                )
                modifier.count = count
                apply(dot, modifier)

            dots.append(dot)

    speakers = join(dots, "Speakers")
    assign(speakers, materials["grille"])
    return speakers


# --------------------------------------------------------------------------- #
# Keys
# --------------------------------------------------------------------------- #

# Row layouts, in key units. Rows are normalised to the well width, so the field
# always fills its recess whatever the individual widths add up to.
ROWS = [
    # (height in units, [key widths])
    (0.58, [1.55] + [1.0] * 12 + [1.05]),
    (1.0, [1.0] * 13 + [1.55]),
    (1.0, [1.55] + [1.0] * 12 + [1.05]),
    (1.0, [1.8] + [1.0] * 11 + [1.8]),
    (1.0, [2.35] + [1.0] * 10 + [2.35]),
]

# The bottom row is described separately, because the arrow cluster is the one
# place a keyboard stops being a grid: two half-height keys stacked inside a
# full-height slot.
BOTTOM = [1.0, 1.0, 1.15, 1.3, 5.2, 1.3, 1.15]
ARROWS = 3.0


def build_keys(materials, well_centre_y):
    caps = []

    field_w = WELL_W - mm(6.0)
    field_d = WELL_D - mm(6.0)
    front = well_centre_y - field_d / 2.0
    top = BASE_H - WELL_DEPTH

    total_rows = sum(row[0] for row in ROWS) + 1.0
    row_h = field_d / total_rows

    def cap(x, y, w, h, name):
        obj = rounded_slab(
            name,
            max(w, mm(1.0)),
            max(h, mm(1.0)),
            KEY_H,
            KEY_R,
            mm(0.2),
            (x, y, top + KEY_H / 2.0),
            edge_segments=2,
            corner_segments=4,
        )
        caps.append(obj)

    # Bottom row first, so rows can be laid out front to back.
    y = front + row_h / 2.0
    unit = field_w / (sum(BOTTOM) + ARROWS)
    x = -field_w / 2.0
    for index, width in enumerate(BOTTOM):
        w = width * unit
        cap(x + w / 2.0, y, w - KEY_GAP, row_h - KEY_GAP, f"Key_b{index}")
        x += w

    # Arrow cluster: left, a stacked up/down pair, right.
    arrow_unit = ARROWS * unit / 3.0
    cap(x + arrow_unit / 2.0, y, arrow_unit - KEY_GAP, row_h - KEY_GAP, "Key_left")
    half = (row_h - KEY_GAP) / 2.0 - KEY_GAP / 4.0
    for offset, label in ((-1, "down"), (1, "up")):
        obj = rounded_slab(
            f"Key_{label}",
            arrow_unit - KEY_GAP,
            half,
            KEY_H,
            KEY_R,
            mm(0.2),
            (
                x + arrow_unit * 1.5,
                y + offset * (half / 2.0 + KEY_GAP / 4.0),
                top + KEY_H / 2.0,
            ),
            edge_segments=2,
            corner_segments=4,
        )
        caps.append(obj)
    cap(
        x + arrow_unit * 2.5,
        y,
        arrow_unit - KEY_GAP,
        row_h - KEY_GAP,
        "Key_right",
    )

    # Then the five main rows, back from there.
    y += row_h / 2.0
    for row_index, (height, widths) in enumerate(reversed(ROWS)):
        h = row_h * height
        y += h / 2.0
        unit = field_w / sum(widths)
        x = -field_w / 2.0
        for key_index, width in enumerate(widths):
            w = width * unit
            cap(
                x + w / 2.0,
                y,
                w - KEY_GAP,
                h - KEY_GAP,
                f"Key_{row_index}_{key_index}",
            )
            x += w
        y += h / 2.0

    keys = join(caps, "Keys")
    assign(keys, materials["key"])
    shade_smooth(keys, 30.0)
    return keys


# --------------------------------------------------------------------------- #
# The lid
# --------------------------------------------------------------------------- #


def build_lid(materials):
    """
    The display half, modelled upright so the hero can rotate it about the hinge.

    Two things here are the difference between a display and a black rectangle.

    The front face is *milled*, not covered: a rounded pocket is cut half a
    millimetre into it, and the mask and the glass live inside that pocket with
    aluminium standing proud around all four sides. So the bezel has walls, and
    the panel is inside the enclosure.

    The bottom edge is a barrel centred exactly on the hinge axis, joined into
    the shell. A flat bottom edge over a flat deck opens a wedge of shadow that
    changes shape as the lid moves, and that wedge is what the eye reads as a
    floating screen. A half-round on the axis presents the same silhouette at
    every angle — and when the lid shuts, it is the rear edge of the machine.
    """
    hinge_z = BASE_H + SEAM + LID_T / 2.0
    hinge_y = D / 2.0 - LID_T / 2.0

    # Built lying flat and then stood up, which is not a detour: the corner
    # bevel finds its edges by looking for the ones running vertically, so the
    # slab has to be lying on its back for "corner" to mean the corners of the
    # display and not the top and bottom of the machine. One definition of
    # corner, used by both halves, is what makes the closed silhouette continuous.
    lid = rounded_slab(
        "Lid",
        W,
        LID_H,
        LID_T,
        CORNER_R,
        EDGE_R_LID,
        (0.0, 0.0, 0.0),
    )

    # The pocket, cut while the lid is still lying on its back. Its +Z face
    # becomes the front of the display once the slab is stood up.
    pocket = rounded_slab(
        "PocketCutter",
        W - RIM * 2.0,
        LID_H - RIM * 2.0,
        POCKET_D * 2.0,
        CORNER_R - RIM,
        mm(0.1),
        (0.0, 0.0, LID_T / 2.0),
        edge_segments=2,
        corner_segments=10,
    )
    boolean(lid, pocket)

    lid.rotation_euler = (math.radians(90.0), 0.0, 0.0)
    bake(lid, rotation=True)
    lid.location = Vector((0.0, hinge_y, hinge_z + LID_H / 2.0))
    bake(lid, location=True)

    # The barrel: a capsule on the hinge axis, the same section as the lid, so
    # the shell simply becomes round where it turns. Its overall length is the
    # width of the lid's own bottom edge — that is, the full width less the two
    # corner radii — so the spherical ends land inside the corner curve instead
    # of standing proud of the silhouette.
    barrel_len = W - CORNER_R * 2.0 - LID_T
    bpy.ops.mesh.primitive_cylinder_add(
        radius=LID_T / 2.0,
        depth=barrel_len,
        location=(0.0, hinge_y, hinge_z),
        rotation=(0.0, math.radians(90.0), 0.0),
        vertices=32,
    )
    barrel = bpy.context.active_object
    barrel.name = "LidBarrel"
    caps = [barrel]
    for side in (-1, 1):
        bpy.ops.mesh.primitive_uv_sphere_add(
            radius=LID_T / 2.0,
            segments=24,
            ring_count=12,
            location=(side * barrel_len / 2.0, hinge_y, hinge_z),
        )
        cap = bpy.context.active_object
        cap.name = f"LidBarrelCap{side}"
        caps.append(cap)

    lid = join([lid, *caps], "Lid")
    assign(lid, materials["aluminium"])
    shade_smooth(lid)

    # The printed mask, at the floor of the pocket. On a machine like this the
    # whole display front is one sheet of glass and the border is printed behind
    # it, so it is a layer rather than a frame — which is what keeps it
    # uninterrupted on all four sides.
    face_y = hinge_y - LID_T / 2.0
    floor_y = face_y + POCKET_D
    bezel = rounded_slab(
        "Bezel",
        W - RIM * 2.0 - mm(0.12),
        LID_H - RIM * 2.0 - mm(0.12),
        BEZEL_T,
        CORNER_R - RIM,
        mm(0.05),
        (0.0, 0.0, 0.0),
        edge_segments=2,
        corner_segments=10,
    )
    bezel.rotation_euler = (math.radians(90.0), 0.0, 0.0)
    bake(bezel, rotation=True)
    bezel.location = Vector(
        (0.0, floor_y - BEZEL_T / 2.0, hinge_z + LID_H / 2.0)
    )
    bake(bezel, location=True)
    assign(bezel, materials["bezel"])

    screen_y = floor_y - BEZEL_T - mm(0.02)
    return lid, bezel, hinge_y, hinge_z, screen_y


def build_screen(materials, hinge_z, screen_y):
    """
    The panel: a flat plate just in front of the mask, which is the surface the
    hero swaps its canvas texture onto.

    The border is even on the sides and top and deeper at the chin, because the
    driver board has to live somewhere — so the panel is nudged up by half the
    difference rather than being centred in the opening. A perfectly even border
    is one of the things that makes a rendered laptop look rendered.
    """
    # A plane, not a box.
    #
    # The hero draws Booklee's startup identity and the website card onto this
    # face with a canvas texture, and a texture is only as good as the UVs under
    # it. Blender's cube arrives unwrapped as a cross — every face gets a
    # *portion* of UV space — so a mark drawn across the full 0-1 square lands
    # almost entirely off the front face and the display shows a blank grey
    # rectangle. A plane is unwrapped edge to edge, which is what the texture
    # expects.
    bpy.ops.mesh.primitive_plane_add(size=1.0)
    screen = bpy.context.active_object
    screen.name = "Screen"
    screen.scale = Vector((PANEL_W, PANEL_H, 1.0))
    bake(screen, scale=True)
    # Stand it up and turn it to face the front of the machine.
    screen.rotation_euler = (math.radians(90.0), 0.0, 0.0)
    bake(screen, rotation=True)
    screen.location = Vector(
        (0.0, screen_y, hinge_z + LID_H / 2.0 + (CHIN - BEZEL) / 2.0)
    )
    bake(screen, location=True)

    assign(screen, materials["screen"])
    return screen


def build_hinge(materials, hinge_y, hinge_z):
    """
    The dark line the lid turns against.

    A plate on the floor of the band cut across the rear of the deck, not a
    barrel: the barrel is part of the lid now, and the only thing left for this
    to do is give the joint a shadow line that stays put while the lid moves.
    """
    hinge = rounded_slab(
        "Hinge",
        W - CORNER_R * 2.0 - mm(0.5),
        HINGE_BAND_D - mm(0.5),
        mm(0.1),
        mm(1.4),
        mm(0.04),
        (
            0.0,
            D / 2.0 - LID_T - HINGE_BAND_D / 2.0,
            BASE_H - HINGE_BAND_DEPTH + mm(0.05),
        ),
        edge_segments=2,
        corner_segments=6,
    )
    assign(hinge, materials["hinge"])
    return hinge


# --------------------------------------------------------------------------- #
# Assembly and export
# --------------------------------------------------------------------------- #


def main() -> None:
    reset_scene()

    materials = {
        # Anodised, not polished. Roughness is the whole difference between
        # aluminium and chrome, and the previous value was low enough that the
        # lid mirrored whatever was in front of it.
        "aluminium": material("Aluminium", (0.598, 0.610, 0.630), 1.0, 0.36),
        "bezel": material("Bezel", (0.016, 0.016, 0.019), 0.0, 0.22),
        "screen": material("Screen", (0.005, 0.005, 0.006), 0.0, 0.24),
        "key": material("KeyCap", (0.042, 0.042, 0.046), 0.0, 0.48),
        "well": material("Well", (0.021, 0.021, 0.024), 0.0, 0.62),
        # Glass over metal, and only just distinguishable from the deck.
        #
        # It has been wrong in both directions. As a light dielectric it
        # rendered as a white plastic slab, because a diffuse surface that
        # bright next to a metal is simply brighter than the metal. As a very
        # smooth metal it rendered near-black, because a sharp mirror facing up
        # reflects whatever is above it and in this scene that is not much. It
        # has to be the *same kind* of surface as the deck — a metal on a
        # similar roughness — and then differ only in tone.
        "trackpad": material("Trackpad", (0.590, 0.601, 0.621), 1.0, 0.34),
        "grille": material("Grille", (0.030, 0.030, 0.034), 0.0, 0.70),
        # Dark anodised rather than polished. A mirror-finish barrel spanning
        # the full width is the single most conspicuous thing a laptop render
        # can have, and on the machines this is drawn from you can barely find
        # the hinge at all.
        "hinge": material("Hinge", (0.048, 0.049, 0.054), 0.35, 0.62),
    }

    chassis = build_chassis(materials)
    deck, well_centre_y, pad_centre_y = build_deck(materials)
    well_floor = build_well_floor(materials, well_centre_y)
    trackpad = build_trackpad(materials, pad_centre_y)
    speakers = build_speakers(materials, well_centre_y)
    keys = build_keys(materials, well_centre_y)
    lid, bezel, hinge_y, hinge_z, screen_y = build_lid(materials)
    screen = build_screen(materials, hinge_z, screen_y)
    hinge = build_hinge(materials, hinge_y, hinge_z)

    # The one thing the hero animates.
    pivot = bpy.data.objects.new("LidPivot", None)
    pivot.empty_display_type = "PLAIN_AXES"
    pivot.empty_display_size = mm(30.0)
    bpy.context.scene.collection.objects.link(pivot)
    pivot.location = Vector((0.0, hinge_y, hinge_z))

    # `matrix_world` is lazily evaluated, so the pivot's location has to be
    # flushed before it is read. Without this the inverse being compensated for
    # is the identity, and the lid, mask and panel all end up displaced by the
    # hinge offset — which looks like a modelling mistake and is not one.
    bpy.context.view_layer.update()

    for child in (lid, bezel, screen):
        child.parent = pivot
        child.matrix_parent_inverse = pivot.matrix_world.inverted()

    body = bpy.data.objects.new("Body", None)
    body.empty_display_type = "PLAIN_AXES"
    bpy.context.scene.collection.objects.link(body)
    bpy.context.view_layer.update()
    for child in (chassis, deck, well_floor, trackpad, speakers, keys, hinge):
        child.parent = body
        child.matrix_parent_inverse = body.matrix_world.inverted()

    root = bpy.data.objects.new("Laptop", None)
    root.empty_display_type = "PLAIN_AXES"
    bpy.context.scene.collection.objects.link(root)
    for child in (body, pivot):
        child.parent = root

    # Sit the machine on the world origin's XZ plane, centred, so the hero can
    # place it without hunting for an offset.
    root.location = Vector((0.0, 0.0, 0.0))

    bpy.context.view_layer.update()

    # A parenting mistake shows up as a silently oversized bounding box rather
    # than as an error, so the assembled size is checked against the dimensions
    # it was built from. With the lid upright the machine is exactly as deep as
    # its base and as tall as the hinge plus the lid.
    lo = Vector((1e9, 1e9, 1e9))
    hi = Vector((-1e9, -1e9, -1e9))
    for obj in bpy.data.objects:
        if obj.type != "MESH":
            continue
        for corner in obj.bound_box:
            point = obj.matrix_world @ Vector(corner)
            lo = Vector(min(lo[i], point[i]) for i in range(3))
            hi = Vector(max(hi[i], point[i]) for i in range(3))

    measured = hi - lo
    expected = Vector((W, D, hinge_z + LID_H))
    print(
        f"[laptop] bounds  W {measured.x:.3f}  D {measured.y:.3f}  H {measured.z:.3f}"
        f"   (expected {expected.x:.3f} / {expected.y:.3f} / {expected.z:.3f})"
    )
    for axis, got, want in zip("WDH", measured, expected):
        if abs(got - want) > mm(1.5):
            raise SystemExit(
                f"[laptop] {axis} is {got:.3f}, expected {want:.3f} — "
                "something is parented or positioned wrongly"
            )

    triangles = 0
    for obj in bpy.data.objects:
        if obj.type == "MESH":
            triangles += sum(len(p.vertices) - 2 for p in obj.data.polygons)

    path = os.path.abspath(OUT)
    os.makedirs(os.path.dirname(path), exist_ok=True)

    bpy.ops.object.select_all(action="DESELECT")
    bpy.ops.export_scene.gltf(
        filepath=path,
        export_format="GLB",
        export_apply=True,
        export_yup=True,
        use_selection=False,
        export_cameras=False,
        export_lights=False,
        export_extras=False,
        export_normals=True,
        export_tangents=False,
        export_materials="EXPORT",
    )

    # The hero has to aim a camera at the display and rotate the hinge, which
    # means it needs a handful of numbers from in here. They are written out
    # rather than copied across by hand, because a model change that silently
    # invalidates the camera's idea of where the screen is would be very hard to
    # see and very easy to make.
    #
    # `panelCentre` and `panelFace` are the panel's own position in the pivot's
    # space, along the lid and out from it. The hero used to reconstruct both
    # from the closed height and a couple of guessed offsets, which was correct
    # only for as long as nothing about the lid's section changed.
    panel_centre = LID_H / 2.0 + (CHIN - BEZEL) / 2.0
    panel_face = hinge_y - screen_y
    metrics_path = os.path.abspath(METRICS)
    os.makedirs(os.path.dirname(metrics_path), exist_ok=True)
    metrics = f'''/**
 * Generated by `tools/laptop/build_laptop.py`. Do not edit by hand — rerun the
 * build script instead, or the numbers here and the geometry in
 * `public/models/laptop.glb` will disagree.
 *
 * Three.js axes, not Blender's. The exporter converts Z-up to Y-up, so a
 * measurement taken along Blender's +Y — towards the back of the machine — is
 * read here along -Z.
 */

export const LAPTOP = {{
  /** Overall width, in scene units. */
  width: {W:.5f},
  /** Front-to-back depth of the base. */
  depth: {D:.5f},
  /** Height of the base alone. */
  baseHeight: {BASE_H:.5f},
  /** Height of the closed machine, lid included. */
  closedHeight: {BASE_H + SEAM + LID_T:.5f},
  /** Hinge axis, relative to the model's own origin. */
  hinge: {{ y: {hinge_z:.5f}, z: {-hinge_y:.5f} }},
  /** Hinge to the far edge of the lid. */
  lidLength: {LID_H:.5f},
  /** Panel size, for framing the camera on the display. */
  panel: {{ width: {PANEL_W:.5f}, height: {PANEL_H:.5f} }},
  /** Panel centre above the hinge axis, measured along the lid. */
  panelCentre: {panel_centre:.5f},
  /** Panel surface out from the hinge axis, along the lid's normal. */
  panelFace: {panel_face:.5f},
  /** Resting open angle, in radians, measured from upright. */
  openAngle: {math.radians(90.0 - LID_OPEN_DEG):.5f},
  /** Shut: a quarter turn forward from upright. */
  closedAngle: Math.PI / 2,
}} as const;
'''
    with open(metrics_path, "w", encoding="utf-8", newline="\n") as handle:
        handle.write(metrics)
    print(f"[laptop] wrote {metrics_path}")

    size = os.path.getsize(path)
    print(f"\n[laptop] wrote {path}")
    print(f"[laptop] {triangles} triangles, {size / 1024:.0f} KB")
    print(f"[laptop] {WIDTH_MM:.1f} x {DEPTH_MM:.1f} x {(BASE_H + SEAM + LID_T) / MM:.1f} mm closed")
    print(f"[laptop] panel {PANEL_W / MM:.1f} x {PANEL_H / MM:.1f} mm, {PANEL_W / PANEL_H:.3f}:1")
    print(f"[laptop] lid opens to {LID_OPEN_DEG} degrees about 'LidPivot'")


if __name__ == "__main__":
    try:
        main()
    except Exception:  # noqa: BLE001 - headless Blender swallows tracebacks
        import traceback

        traceback.print_exc()
        sys.exit(1)
