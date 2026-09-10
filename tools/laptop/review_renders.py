"""
Renders the four review stills of `public/models/laptop.glb`.

    blender --background --factory-startup --python tools/laptop/review_renders.py -- <out_dir>

Closed, half-open, open with the screen off, and open with the screen lit — all
from one camera, so they can be read as a sequence and compared against the
reference photographs before the model is wired into anything.

This deliberately renders the exported GLB rather than the scene that produced
it. What ships is the GLB, so what gets reviewed should be the GLB: an export
that silently dropped a material, a normal or a modifier would otherwise pass
review and fail in the browser.

The lighting is a plain product-shot setup — a soft key above and in front, a
fill to camera left, and a light grey sweep behind — because the references are
product photographs and matching their lighting is the only way to judge
silhouette, thinness and the corner treatment against them. It is not the hero's
lighting, which is a dark room, and is not meant to be.
"""

from __future__ import annotations

import math
import os
import sys

import bpy
from mathutils import Vector

GLB = os.path.join("public", "models", "laptop.glb")

# The lid is modelled upright, so upright is zero. Shut is a quarter turn
# forward; open is seventeen degrees the other side of upright, which is the
# 107-degree resting angle measured from the deck.
CLOSED = math.radians(90.0)
OPEN = math.radians(-17.0)

SHOTS = [
    ("01-closed", CLOSED, False),
    ("02-half-open", (CLOSED + OPEN) / 2.0, False),
    ("03-open-screen-off", OPEN, False),
    ("04-open-screen-on", OPEN, True),
]


def find(name: str):
    for obj in bpy.data.objects:
        if obj.name == name or obj.name.startswith(f"{name}."):
            return obj
    return None


def world_bounds(objects):
    lo = Vector((1e9, 1e9, 1e9))
    hi = Vector((-1e9, -1e9, -1e9))
    for obj in objects:
        for corner in obj.bound_box:
            point = obj.matrix_world @ Vector(corner)
            lo = Vector(min(lo[i], point[i]) for i in range(3))
            hi = Vector(max(hi[i], point[i]) for i in range(3))
    return lo, hi


def frame(camera, scene, lo, hi, pitch_deg: float, margin: float = 1.14):
    """
    Place the camera so the given box fills the frame, at a fixed pitch.

    A long lens is kept and the distance is solved for, rather than the other
    way round, because the references are shot long and changing focal length
    between stills would change the silhouette being compared.
    """
    centre = (lo + hi) / 2.0
    half_w = (hi.x - lo.x) / 2.0 * margin
    half_h = (hi.z - lo.z) / 2.0 * margin

    sensor_w = camera.data.sensor_width
    sensor_h = sensor_w * scene.render.resolution_y / scene.render.resolution_x
    tan_h = (sensor_w / 2.0) / camera.data.lens
    tan_v = (sensor_h / 2.0) / camera.data.lens

    # A little depth allowance, so a lid leaning back does not clip the frame.
    depth = (hi.y - lo.y) / 2.0
    distance = max(half_w / tan_h, half_h / tan_v) + depth

    # `pitch_deg` is the angle above horizontal, so the camera sits mostly in
    # front of the subject and only a little above it.
    pitch = math.radians(pitch_deg)
    camera.location = centre + Vector(
        (0.0, -math.cos(pitch) * distance, math.sin(pitch) * distance)
    )
    camera.rotation_euler = (math.radians(90.0) - pitch, 0.0, 0.0)


def main() -> None:
    argv = sys.argv
    out_dir = argv[argv.index("--") + 1] if "--" in argv else "."
    os.makedirs(out_dir, exist_ok=True)

    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=os.path.abspath(GLB))

    pivot = find("LidPivot")
    if pivot is None:
        raise SystemExit("LidPivot missing from the export — nothing to rotate")

    # The glTF importer stores rotations as quaternions, and while an object is
    # in quaternion mode assigning `rotation_euler` is silently ignored — the
    # lid simply never moves and all four stills come out identical.
    pivot.rotation_mode = "XYZ"

    screen_mat = bpy.data.materials.get("Screen")
    if screen_mat is None:
        raise SystemExit("Screen material missing from the export")

    # Measure what actually came back, so the camera frames the real thing
    # rather than the numbers the build script intended.
    meshes = [o for o in bpy.data.objects if o.type == "MESH"]
    depsgraph = bpy.context.evaluated_depsgraph_get()
    lo = Vector((1e9, 1e9, 1e9))
    hi = Vector((-1e9, -1e9, -1e9))
    for obj in meshes:
        for corner in obj.bound_box:
            world = obj.matrix_world @ Vector(corner)
            lo = Vector((min(lo[i], world[i]) for i in range(3)))
            hi = Vector((max(hi[i], world[i]) for i in range(3)))
    width = hi.x - lo.x
    print(f"[review] model bounds  W {width:.3f}  D {hi.y - lo.y:.3f}  H {hi.z - lo.z:.3f}")
    for obj in sorted(meshes, key=lambda o: o.name):
        dims = obj.dimensions
        print(f"[review]   {obj.name:<12} {dims.x:6.3f} x {dims.y:6.3f} x {dims.z:6.3f}")

    # --- backdrop ---------------------------------------------------------
    bpy.ops.mesh.primitive_plane_add(size=width * 14.0, location=(0.0, 0.0, 0.0))
    floor = bpy.context.active_object
    sweep = bpy.data.materials.new("Sweep")
    sweep.use_nodes = True
    sweep.node_tree.nodes["Principled BSDF"].inputs["Base Color"].default_value = (
        0.72, 0.72, 0.73, 1.0,
    )
    sweep.node_tree.nodes["Principled BSDF"].inputs["Roughness"].default_value = 0.62
    floor.data.materials.append(sweep)

    bpy.ops.mesh.primitive_plane_add(size=width * 14.0, location=(0.0, width * 2.4, 0.0))
    wall = bpy.context.active_object
    wall.rotation_euler = (math.radians(90.0), 0.0, 0.0)
    wall.data.materials.append(sweep)

    world = bpy.data.worlds.new("World")
    world.use_nodes = True
    world.node_tree.nodes["Background"].inputs["Color"].default_value = (
        0.42, 0.43, 0.45, 1.0,
    )
    world.node_tree.nodes["Background"].inputs["Strength"].default_value = 0.65
    bpy.context.scene.world = world

    # --- lights -----------------------------------------------------------
    def area(name, location, rotation, size, energy):
        bpy.ops.object.light_add(type="AREA", location=location, rotation=rotation)
        light = bpy.context.active_object
        light.name = name
        light.data.size = size
        light.data.energy = energy
        return light

    # Restrained on purpose. Aluminium clipping to white hides exactly what
    # these stills exist to show — the roll-over on the edges, the gradient
    # across the lid, and how dark the keys are against the deck.
    area("Key", (0.0, -width * 1.1, width * 1.5), (math.radians(38.0), 0.0, 0.0),
         width * 2.6, width * width * 42.0)
    area("Fill", (-width * 1.5, -width * 0.5, width * 0.7),
         (math.radians(72.0), 0.0, math.radians(-52.0)),
         width * 1.8, width * width * 15.0)
    area("Rim", (width * 1.3, width * 0.9, width * 0.8),
         (math.radians(74.0), 0.0, math.radians(146.0)),
         width * 1.4, width * width * 12.0)

    # --- camera -----------------------------------------------------------
    bpy.ops.object.camera_add(location=(0.0, -width * 3.0, width * 0.4))
    camera = bpy.context.active_object
    camera.data.lens = 85.0
    camera.data.sensor_width = 36.0
    bpy.context.scene.camera = camera

    scene = bpy.context.scene
    # Blender 5 folded EEVEE Next back into the plain EEVEE identifier.
    scene.render.engine = "BLENDER_EEVEE"
    scene.render.resolution_x = 1600
    scene.render.resolution_y = 1000
    scene.render.film_transparent = False
    scene.render.image_settings.file_format = "PNG"
    try:
        scene.eevee.taa_render_samples = 40
        scene.eevee.use_raytracing = True
    except AttributeError:
        pass
    scene.view_settings.view_transform = "AgX"
    try:
        scene.view_settings.look = "AgX - Base Contrast"
    except TypeError:
        pass

    bsdf = screen_mat.node_tree.nodes.get("Principled BSDF")

    subject = [o for o in bpy.data.objects if o.type == "MESH" and o not in (floor, wall)]

    for name, angle, lit in SHOTS:
        pivot.rotation_euler = (angle, 0.0, 0.0)
        bpy.context.view_layer.update()

        # The closed machine is a 15 mm slab and the open one is 230 mm tall, so
        # each pose is framed on its own bounds. A single distance would either
        # lose the seam on the closed shot or crop the open one.
        lo, hi = world_bounds(subject)
        # A shut machine is a slab, and a slab seen edge-on says nothing about
        # its top. It gets a higher angle; the open poses stay low, which is
        # where the lid's thinness and the hinge line read.
        frame(camera, scene, lo, hi, pitch_deg=24.0 if angle > 1.0 else 16.0)
        print(f"[review] {name}: bounds {hi.x - lo.x:.3f} x {hi.z - lo.z:.3f}")

        if bsdf is not None:
            emission = (1.0, 0.98, 0.94, 1.0) if lit else (0.0, 0.0, 0.0, 1.0)
            bsdf.inputs["Emission Color"].default_value = emission
            bsdf.inputs["Emission Strength"].default_value = 9.0 if lit else 0.0
        scene.render.filepath = os.path.join(out_dir, f"laptop-{name}.png")
        bpy.ops.render.render(write_still=True)
        print(f"[review] {scene.render.filepath}")


if __name__ == "__main__":
    main()
