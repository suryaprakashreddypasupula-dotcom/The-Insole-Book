#!/usr/bin/env python3
"""Reconstruct cork wedge add-on meshes from Bambu .gcode.3mf print files.

These 3MF files contain no mesh (empty model stub) — only sliced toolpaths.
We rebuild the true printed shape by replaying every extrusion move layer by
layer into a heightfield, then meshing it (top surface + walls + flat bottom).

Output: ../models/WEDGE_*.glb (cork-colored) and merged entries in catalog.json.
"""
from __future__ import annotations

import json
import re
import zipfile
from pathlib import Path

import numpy as np
import trimesh

SRC_DIR = Path("/Users/surya/Downloads")
OUT = Path(__file__).resolve().parents[1] / "models"
CATALOG = Path(__file__).resolve().parents[1] / "catalog.json"

CELL = 1.0          # heightfield cell, mm
SAMPLE_MM = 0.8     # sampling step along extrusion segments
CORK = np.array([199, 157, 106], dtype=np.uint8)
CORK_SIDE = np.array([172, 130, 84], dtype=np.uint8)

RISE_LABEL = {"1_8th": '1/8"', "1_4": '1/4"', "3_8ths": '3/8"'}

SKIP_FEATURES = {"BRIM", "SKIRT", "PRIME TOWER", "WIPE TOWER"}


def parse_gcode_points(gcode: str) -> np.ndarray:
    """Return (n,3) points of extruded material positions."""
    x = y = z = 0.0
    feature = ""
    pts = []
    for line in gcode.splitlines():
        if line.startswith("; FEATURE:"):
            feature = line.split(":", 1)[1].strip().upper()
            continue
        if not line.startswith(("G1", "G2", "G3")):
            continue
        code = line.split(";", 1)[0]
        parts = dict(
            (m.group(1), float(m.group(2)))
            # note: Bambu omits leading zeros ("Z.4"), so digits before the
            # decimal point must be optional here
            for m in re.finditer(r"([XYZEIJ])(-?\d*\.?\d+)", code)
        )
        nx, ny = parts.get("X", x), parts.get("Y", y)
        if "Z" in parts:
            z = parts["Z"]
        extruding = parts.get("E", 0.0) > 0 and ("X" in parts or "Y" in parts)
        if extruding and feature not in SKIP_FEATURES:
            seg = np.hypot(nx - x, ny - y)
            n = max(int(seg / SAMPLE_MM), 1)
            ts = np.linspace(0.0, 1.0, n + 1)
            for t in ts:
                pts.append((x + (nx - x) * t, y + (ny - y) * t, z))
        x, y = nx, ny
    return np.asarray(pts)


def heightfield(pts: np.ndarray):
    xmin, ymin = pts[:, 0].min(), pts[:, 1].min()
    xi = ((pts[:, 0] - xmin) / CELL).astype(int)
    yi = ((pts[:, 1] - ymin) / CELL).astype(int)
    nx, ny = xi.max() + 1, yi.max() + 1
    h = np.zeros((nx, ny))
    np.maximum.at(h, (xi, yi), pts[:, 2])
    return h


def terrain_mesh(h: np.ndarray) -> trimesh.Trimesh:
    """Solid mesh from a heightfield: top skin, side walls, flat bottom."""
    from scipy import ndimage

    mask = h > 0.15
    mask = ndimage.binary_closing(mask, iterations=2)
    # keep the largest component only
    lbl, n = ndimage.label(mask)
    if n > 1:
        sizes = ndimage.sum_labels(np.ones_like(h), lbl, index=np.arange(1, n + 1))
        mask = lbl == (np.argmax(sizes) + 1)
    hs = ndimage.gaussian_filter(h, 0.8)  # soften stair-steps from layer sampling

    nx, ny = mask.shape
    idx_top = -np.ones((nx, ny), dtype=int)
    idx_bot = -np.ones((nx, ny), dtype=int)
    verts, colors = [], []

    def add_vert(p, col):
        verts.append(p)
        colors.append(col)
        return len(verts) - 1

    for i in range(nx):
        for j in range(ny):
            if mask[i, j]:
                idx_top[i, j] = add_vert((i * CELL, j * CELL, float(hs[i, j])), CORK)
                idx_bot[i, j] = add_vert((i * CELL, j * CELL, 0.0), CORK_SIDE)

    faces = []
    for i in range(nx - 1):
        for j in range(ny - 1):
            quad = (mask[i, j] and mask[i + 1, j] and mask[i, j + 1] and mask[i + 1, j + 1])
            if not quad:
                continue
            a, b, c, d = idx_top[i, j], idx_top[i + 1, j], idx_top[i + 1, j + 1], idx_top[i, j + 1]
            faces += [(a, b, c), (a, c, d)]
            a2, b2, c2, d2 = idx_bot[i, j], idx_bot[i + 1, j], idx_bot[i + 1, j + 1], idx_bot[i, j + 1]
            faces += [(a2, c2, b2), (a2, d2, c2)]
    # walls along mask boundary edges
    for i in range(nx - 1):
        for j in range(ny - 1):
            if mask[i, j]:
                if not mask[i + 1, j] and idx_top[i, j] >= 0 and idx_top[i, j + 1] >= 0:
                    a, b = idx_top[i, j], idx_top[i, j + 1]
                    faces += [(a, b, idx_bot[i, j + 1]), (a, idx_bot[i, j + 1], idx_bot[i, j])]
                if i > 0 and not mask[i - 1, j] and idx_top[i, j] >= 0 and idx_top[i, j + 1] >= 0:
                    a, b = idx_top[i, j + 1], idx_top[i, j]
                    faces += [(a, b, idx_bot[i, j]), (a, idx_bot[i, j], idx_bot[i, j + 1])]
                if not mask[i, j + 1] and idx_top[i, j] >= 0 and idx_top[i + 1, j] >= 0:
                    a, b = idx_top[i + 1, j], idx_top[i, j]
                    faces += [(a, b, idx_bot[i, j]), (a, idx_bot[i, j], idx_bot[i + 1, j])]
                if j > 0 and not mask[i, j - 1] and idx_top[i, j] >= 0 and idx_top[i + 1, j] >= 0:
                    a, b = idx_top[i, j], idx_top[i + 1, j]
                    faces += [(a, b, idx_bot[i + 1, j]), (a, idx_bot[i + 1, j], idx_bot[i, j])]

    v = np.asarray(verts, dtype=float)
    # the wedge is printed diagonally on the plate; align its long axis to Y
    xy = v[:, :2] - v[:, :2].mean(axis=0)
    _, _, vt = np.linalg.svd(xy, full_matrices=False)
    long_axis, short_axis = vt[0], vt[1]
    v[:, :2] = np.column_stack([xy @ short_axis, xy @ long_axis])
    v[:, 0] -= (v[:, 0].min() + v[:, 0].max()) / 2
    v[:, 1] -= (v[:, 1].min() + v[:, 1].max()) / 2
    rgba = np.column_stack([np.asarray(colors), np.full(len(verts), 255, dtype=np.uint8)])
    mesh = trimesh.Trimesh(vertices=v, faces=np.asarray(faces), process=True)
    mesh.visual = trimesh.visual.ColorVisuals(mesh, vertex_colors=rgba[: len(mesh.vertices)])
    return mesh


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    seen = {}
    for path in sorted(SRC_DIR.glob("*wedge*.3mf")):
        m = re.match(r"(\d+)in_(1_4|1_8th|3_8ths)_wedge_(\w+?)base", path.name)
        if not m:
            print("skip", path.name)
            continue
        length_in, rise, base = m.groups()
        key = (length_in, rise, base.lower())
        if key in seen:
            print(f"dup  {path.name} (same as {seen[key]})")
            continue
        seen[key] = path.name
        with zipfile.ZipFile(path) as zf:
            gcode = zf.read("Metadata/plate_1.gcode").decode("utf-8", "ignore")
        pts = parse_gcode_points(gcode)
        print(f"{path.name}: {len(pts)} extrusion samples, "
              f"footprint {np.ptp(pts[:,0]):.0f} x {np.ptp(pts[:,1]):.0f} mm, "
              f"max z {pts[:,2].max():.1f} mm")
        mesh = terrain_mesh(heightfield(pts))
        wid = f"WEDGE-{length_in}IN-{rise.upper()}"
        out_name = f"{wid}.glb"
        mesh.export(OUT / out_name, include_normals=True)
        size_kb = (OUT / out_name).stat().st_size // 1024
        print(f"    -> {out_name} {size_kb}KB  faces {len(mesh.faces)}")

        entry = {
            "po": wid,
            "categories": ["Cork Wedge (manual add-on)"],
            "orthotic_type": "Manual accommodation",
            "base": f"{base.capitalize()} base",
            "top_cover": "",
            "additions": f'{length_in}" length · {RISE_LABEL[rise]} rise',
            "models": {
                "ADDON": {
                    "file": f"models/{out_name}",
                    "faces": int(len(mesh.faces)),
                    "extents": [round(float(x), 1) for x in mesh.extents],
                    "relief_focus": None,
                    "pad_focus": None,
                    "relief_area_pct": 0.0,
                    "pad_area_pct": 0.0,
                }
            },
        }
        catalog = json.loads(CATALOG.read_text())
        catalog = [e for e in catalog if e["po"] != wid] + [entry]
        CATALOG.write_text(json.dumps(sorted(catalog, key=lambda e: e["po"]), indent=1))
    print(f"catalog now has {len(json.loads(CATALOG.read_text()))} entries")


if __name__ == "__main__":
    main()
