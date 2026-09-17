#!/usr/bin/env python3
"""Build insole + add-on animation pairs.

The production "extra" STLs are print pucks: the true add-on shape (crown)
sits on a straight support column ~36-40 mm above the plate, in the SAME
x/y frame as the insole's taika STL. We recover the real seated part by
heightfield subtraction:

    thickness(x, y) = crown(x, y) - insole_surface(x, y) - C

where C is the constant print lift (5th percentile of the difference —
add-on edges feather to zero thickness). The seated mesh is then built
between the insole surface (bottom, slightly embedded) and
surface + thickness (top), so it rests exactly where production places it.

Outputs models/PAIR-*_{SIDE}.glb (black insole) + models/PAIR-*_{SIDE}_addon.glb
(colored add-on) and merges PAIR-* entries into catalog.json.
"""
from __future__ import annotations

import json
from pathlib import Path

import numpy as np
import trimesh
from scipy import ndimage

from build_models import colorize, simplify

INS_DIR = Path("/Users/surya/Downloads/pair-insole-stls")
ADD_DIR = Path("/Users/surya/Downloads/insole-addon-stls")
OUT = Path(__file__).resolve().parents[1] / "models"
CATALOG = Path(__file__).resolve().parents[1] / "catalog.json"

CELL = 1.0
EMBED = 0.8          # sink the add-on base slightly into the insole surface
MIN_T = 0.25         # ignore sub-noise thickness
PROUD = 0.5          # keep the top skin above surface-sampling noise
MIN_BODY = 0.6       # minimum visible thickness inside the part

AMBER = (np.array([255, 176, 32]), np.array([214, 138, 18]))   # top, side/bottom
CYAN = (np.array([64, 205, 222]), np.array([38, 160, 178]))
CORK = (np.array([199, 157, 106], dtype=np.uint8),
        np.array([172, 130, 84], dtype=np.uint8))

PAIRS = [
    {
        "id": "PAIR-MET-BAR",
        "label": "Met Bar",
        "insole": "CPO-306171_Met-Bar_{side}.stl",
        "addon": "met-bar_2_{side}.stl",
        "color": AMBER,
        "cap": 6.0,
        "additions": "Met Bar (separate printed part)",
    },
    {
        "id": "PAIR-MET-PAD",
        "label": 'Met Pad \u2014 low 1/8"',
        "insole": "CPO-304024_Met-Pad_{side}.stl",
        "addon": "met-pad-low-1-8in_1_{side}.stl",
        "color": AMBER,
        "cap": 6.0,
        "additions": 'Met Pad 1/8" (separate printed part)',
    },
    {
        "id": "PAIR-OFFLOAD-5TH",
        "label": "Offload plug \u2014 5th met head",
        "insole": "CPO-305750_Offload-Met-Head_{side}.stl",
        "addon": "offload-5th-met-head_4_{side}.stl",
        "color": CYAN,
        "cap": 8.0,
        "additions": "Offload plug, 5th met head (soft fill)",
        "library": True,
    },
    {
        "id": "PAIR-OFFLOAD-1ST",
        "label": "Offload plug \u2014 1st met head",
        "insole": "CPO-305165_Offload-1st_{side}.stl",
        "addon": "offload-1st-met-head_2_{side}.stl",
        "color": CYAN,
        "cap": 8.0,
        "additions": "Offload plug, 1st met head (soft fill)",
        "library": True,
    },
    {
        "id": "PAIR-OFFLOAD-2ND",
        "label": "Offload plug \u2014 2nd met head",
        "insole": "CPO-305573_Offload-2nd_{side}.stl",
        "addon": "offload-2nd-met-head_1_{side}.stl",
        "color": CYAN,
        "cap": 8.0,
        "additions": "Offload plug, 2nd met head (soft fill)",
        "library": True,
    },
    {
        "id": "PAIR-OFFLOAD-3RD",
        "label": "Offload plug \u2014 3rd met head",
        "insole": "CPO-303522_Offload-3rd_{side}.stl",
        "addon": "offload-3rd-met-head_1_{side}.stl",
        "color": CYAN,
        "cap": 8.0,
        "additions": "Offload plug, 3rd met head (soft fill)",
        "library": True,
    },
    {
        "id": "PAIR-OFFLOAD-4TH",
        "label": "Offload plug \u2014 4th met head",
        "insole": "CPO-303476_Offload-4th_{side}.stl",
        "addon": "offload-4th-met-head_1_{side}.stl",
        "color": CYAN,
        "cap": 8.0,
        "additions": "Offload plug, 4th met head (soft fill)",
        "library": True,
    },
    {
        "id": "PAIR-OFFLOAD-2ND-3RD",
        "label": "Offload plug \u2014 2nd + 3rd met heads",
        "insole": "CPO-304939_Offload-2nd-3rd_{side}.stl",
        "addon": "offload-2nd-3rd-met-head_1_{side}.stl",
        "color": CYAN,
        "cap": 8.0,
        "additions": "Offload plug, 2nd + 3rd met heads (soft fill)",
        "library": True,
    },
    {
        "id": "PAIR-OFFLOAD-4TH-5TH",
        "label": "Offload plug \u2014 4th + 5th met heads",
        "insole": "CPO-302385_Offload-4th-5th_{side}.stl",
        "addon": "offload-4th-5th-met-head_1_{side}.stl",
        "color": CYAN,
        "cap": 8.0,
        "additions": "Offload plug, 4th + 5th met heads (soft fill)",
        "library": True,
    },
    {
        "id": "PAIR-NEUROMA-PAD",
        "label": "Neuroma pad",
        "insole": "CPO-305815_Neuroma-Pad_{side}.stl",
        "addon": "neuroma-pad_1_{side}.stl",
        "color": AMBER,
        "cap": 6.0,
        "additions": "Neuroma pad (separate printed part)",
        "library": True,
        "category": "Neuroma Pad",
    },
    {
        "id": "PAIR-HEEL-PAD",
        "label": "Heel pad",
        "insole": "PO-304251_heel-pad_{side}.stl",
        "addon": "heel-pad_1_{side}.stl",
        "color": AMBER,
        "cap": 8.0,
        "additions": "Heel pad (separate printed part)",
        "library": True,
        "category": "Heel Pad",
    },
    {
        "id": "PAIR-ARCH-PAD",
        "label": "Arch pad",
        "insole": "PO-304877_arch-pad_{side}.stl",
        "addon": "arch-pad_1_{side}.stl",
        "color": AMBER,
        "cap": 8.0,
        "feather": 14.0,   # raw extra is a grind blank; taper the edges
        "additions": "Arch pad (separate printed part)",
        "library": True,
        "category": "Arch Pad",
    },
    {
        "id": "PAIR-DANCERS-PAD",
        "label": "Dancer's pad",
        "insole": "PO-1876256-0018_dancers-pad_{side}.stl",
        "addon": "dancers-pad_1_{side}.stl",
        "color": AMBER,
        "cap": 8.0,
        "additions": "Dancer's pad (separate printed part)",
        "library": True,
        "category": "Dancer Pad",
    },
    {
        "id": "PAIR-CUBOID-PAD",
        "label": "Cuboid pad",
        "insole": "PO-Gaillard_cuboid-pad_{side}.stl",
        "addon": "cuboid-pad_1_{side}.stl",
        "color": AMBER,
        "cap": 8.0,
        "additions": "Cuboid pad (separate printed part)",
        "library": True,
        "category": "Cuboid Raise",
    },
    {
        "id": "PAIR-TOE-CREST",
        "label": "Toe crest",
        "insole": "PO-1900049-0018_toe-crest_{side}.stl",
        "addon": "toe-crest_1_{side}.stl",
        "color": AMBER,
        "cap": 12.0,
        "additions": "Toe crest across the forefoot (mets 2\u20135, separate printed part)",
        "library": True,
        "category": "Toe Crest",
    },
    {
        "id": "PAIR-DRILL-FILL-1ST",
        "label": "Drill & fill \u2014 1st met head",
        "insole": "PO-304133_drill-fill-1st_{side}.stl",
        "addon": "drill-fill-1st_1_{side}.stl",
        "color": CYAN,
        "cap": 12.0,
        "additions": "Drill & fill plug, 1st met head (soft fill)",
        "library": True,
        "category": "Drill & Fill Offload",
    },
]


def surface_heightfield(pts: np.ndarray, xs0, ys0, nx, ny):
    g = np.full((nx, ny), np.nan)
    xi = ((pts[:, 0] - xs0) / CELL).astype(int)
    yi = ((pts[:, 1] - ys0) / CELL).astype(int)
    ok = (xi >= 0) & (xi < nx) & (yi >= 0) & (yi < ny)
    xi, yi, z = xi[ok], yi[ok], pts[ok, 2]
    np.fmax.at(g, (xi, yi), z)
    return g


def bottom_heightfield(pts: np.ndarray, xs0, ys0, nx, ny):
    g = np.full((nx, ny), np.nan)
    xi = ((pts[:, 0] - xs0) / CELL).astype(int)
    yi = ((pts[:, 1] - ys0) / CELL).astype(int)
    ok = (xi >= 0) & (xi < nx) & (yi >= 0) & (yi < ny)
    xi, yi, z = xi[ok], yi[ok], pts[ok, 2]
    np.fmin.at(g, (xi, yi), z)
    return g


def fill_nan(g: np.ndarray) -> np.ndarray:
    """Fill NaN cells from nearest valid neighbors."""
    mask = np.isnan(g)
    if not mask.any():
        return g
    idx = ndimage.distance_transform_edt(mask, return_distances=False, return_indices=True)
    return g[tuple(idx)]


def grid_solid(mask, top_z, bot_z, xs0, ys0, colors, cell=None):
    """Watertight solid between two heightfields over a boolean mask."""
    top_c, side_c = colors
    CELL = cell if cell is not None else globals()["CELL"]
    nx, ny = mask.shape
    idx_top = -np.ones((nx, ny), dtype=int)
    idx_bot = -np.ones((nx, ny), dtype=int)
    verts, cols = [], []

    def add(p, c):
        verts.append(p)
        cols.append(c)
        return len(verts) - 1

    for i in range(nx):
        for j in range(ny):
            if mask[i, j]:
                x, y = xs0 + i * CELL, ys0 + j * CELL
                idx_top[i, j] = add((x, y, top_z[i, j]), top_c)
                idx_bot[i, j] = add((x, y, bot_z[i, j]), side_c)

    faces = []
    for i in range(nx - 1):
        for j in range(ny - 1):
            if mask[i, j] and mask[i + 1, j] and mask[i, j + 1] and mask[i + 1, j + 1]:
                a, b, c, d = idx_top[i, j], idx_top[i + 1, j], idx_top[i + 1, j + 1], idx_top[i, j + 1]
                faces += [(a, b, c), (a, c, d)]
                a2, b2, c2, d2 = idx_bot[i, j], idx_bot[i + 1, j], idx_bot[i + 1, j + 1], idx_bot[i, j + 1]
                faces += [(a2, c2, b2), (a2, d2, c2)]
    # walls on the mask boundary
    for i in range(nx):
        for j in range(ny - 1):
            if mask[i, j] and idx_top[i, j + 1] >= 0:
                if i + 1 >= nx or not mask[i + 1, j] or not mask[i + 1, j + 1]:
                    a, b = idx_top[i, j], idx_top[i, j + 1]
                    faces += [(a, b, idx_bot[i, j + 1]), (a, idx_bot[i, j + 1], idx_bot[i, j])]
                if i == 0 or not mask[i - 1, j] or not mask[i - 1, j + 1]:
                    a, b = idx_top[i, j + 1], idx_top[i, j]
                    faces += [(a, b, idx_bot[i, j]), (a, idx_bot[i, j], idx_bot[i, j + 1])]
    for j in range(ny):
        for i in range(nx - 1):
            if mask[i, j] and idx_top[i + 1, j] >= 0:
                if j + 1 >= ny or not mask[i, j + 1] or not mask[i + 1, j + 1]:
                    a, b = idx_top[i + 1, j], idx_top[i, j]
                    faces += [(a, b, idx_bot[i, j]), (a, idx_bot[i, j], idx_bot[i + 1, j])]
                if j == 0 or not mask[i, j - 1] or not mask[i + 1, j - 1]:
                    a, b = idx_top[i, j], idx_top[i + 1, j]
                    faces += [(a, b, idx_bot[i + 1, j]), (a, idx_bot[i + 1, j], idx_bot[i, j])]

    v = np.asarray(verts, dtype=float)
    rgba = np.column_stack([np.asarray(cols), np.full(len(verts), 255)]).astype(np.uint8)
    mesh = trimesh.Trimesh(vertices=v, faces=np.asarray(faces), process=True)
    mesh.visual = trimesh.visual.ColorVisuals(mesh, vertex_colors=rgba[: len(mesh.vertices)])
    return mesh


def seated_addon_mesh(surf, thick, xs0, ys0, colors):
    """Solid mesh between the insole surface and surface + thickness."""
    mask = thick > MIN_T
    mask = ndimage.binary_closing(mask, iterations=2)
    mask = ndimage.binary_fill_holes(mask)
    lbl, n = ndimage.label(mask)
    if n > 1:
        sizes = ndimage.sum_labels(np.ones_like(thick), lbl, index=np.arange(1, n + 1))
        mask = lbl == (np.argmax(sizes) + 1)
    ts = ndimage.gaussian_filter(np.where(mask, thick, 0.0), 0.9)
    ts = np.where(mask, np.maximum(ts, MIN_BODY) + PROUD, ts)
    ss = ndimage.gaussian_filter(surf, 0.9)
    return grid_solid(mask, ss + ts, ss - EMBED, xs0, ys0, colors)


def strip_print_raft(mesh):
    """Some extras ship a disconnected print plate ~40 mm above the part.
    If Z is two occupied bands with an empty gap, keep only the lower band
    — that is the real add-on sitting on the insole."""
    z = np.asarray(mesh.vertices)[:, 2]
    lo, hi = float(z.min()), float(z.max())
    if hi - lo < 20:
        return mesh
    edges = np.linspace(lo, hi, 18)
    h, _ = np.histogram(z, bins=edges)
    occ = np.where(h > 0)[0]
    if occ.size < 2 or occ.max() - occ.min() + 1 == occ.size:
        return mesh
    run_end = occ[0]
    for i in range(1, len(occ)):
        if occ[i] != occ[i - 1] + 1:
            run_end = occ[i - 1]
            break
    zcut = edges[run_end + 1]
    fz = mesh.vertices[mesh.faces].mean(axis=1)[:, 2]
    keep = fz <= zcut + 0.5
    if int(keep.sum()) < 20:
        return mesh
    out = mesh.copy()
    out.update_faces(keep)
    out.remove_unreferenced_vertices()
    return out


def build_pair(spec: dict, side: str):
    ins_path = INS_DIR / spec["insole"].format(side=side)
    add_path = ADD_DIR / spec["addon"].format(side=side)
    if not ins_path.exists() or not add_path.exists():
        print(f"  {side}: missing file, skipped")
        return None

    insole = simplify(trimesh.load(ins_path))
    v = np.asarray(insole.vertices)
    offset = np.array([
        (v[:, 0].min() + v[:, 0].max()) / 2,
        (v[:, 1].min() + v[:, 1].max()) / 2,
        v[:, 2].min(),
    ])
    insole.apply_translation(-offset)
    addon_raw = strip_print_raft(trimesh.load(add_path))
    addon_raw.apply_translation(-offset)

    # heightfields over the add-on footprint
    ab = addon_raw.bounds
    xs0, ys0 = ab[0][0] - 2, ab[0][1] - 2
    nx = int((ab[1][0] - xs0) / CELL) + 4
    ny = int((ab[1][1] - ys0) / CELL) + 4
    ap, _ = trimesh.sample.sample_surface(addon_raw, 150000)
    ip, _ = trimesh.sample.sample_surface(insole, 500000)
    crown_raw = surface_heightfield(ap, xs0, ys0, nx, ny)
    surf_raw = surface_heightfield(ip, xs0, ys0, nx, ny)
    # only cells where BOTH the puck and the insole really exist — pucks that
    # wrap up the arch wall spill past the insole edge and must be trimmed
    coverage = ~np.isnan(crown_raw) & ~np.isnan(surf_raw)
    crown = fill_nan(crown_raw)
    surf = fill_nan(surf_raw)

    d = crown - surf
    lift = np.percentile(d[coverage], 5)     # puck edges feather to zero thickness
    t_raw = d - lift
    # clip depth to the cap, but drop cells far beyond it — those are the
    # puck's tall removal stem, which must not become a colored pillar
    stem_cut = spec["cap"] + 6.0
    thick = np.where(t_raw > stem_cut, 0.0, np.minimum(np.maximum(t_raw, 0.0), spec["cap"]))
    thick[~coverage] = 0.0
    # near-vertical puck walls (arch pads) read as single-cell spikes and
    # one-cell-wide fins in the heightfield: median kills lone spikes, grey
    # opening shaves fins narrower than ~2 cells, broad domes pass untouched
    thick = ndimage.median_filter(thick, size=3)
    thick = ndimage.grey_opening(thick, size=(3, 3))
    # some extras (arch pad) ship as tall grind blanks, not molded pads —
    # feather the capped thickness to zero at the footprint edge so the
    # rendered part reads as the pad it becomes once seated and finished
    if spec.get("feather"):
        inside_mm = ndimage.distance_transform_edt(thick > MIN_T) * CELL
        thick = np.minimum(thick, inside_mm * (spec["cap"] / spec["feather"]))
    addon = seated_addon_mesh(surf, thick, xs0, ys0, spec["color"])

    # insole: plain black shell (the physical add-on IS the highlight)
    iv = np.asarray(insole.vertices)
    rgba, _, _ = colorize(iv, [], np.asarray(insole.vertex_normals))
    insole.visual = trimesh.visual.ColorVisuals(insole, vertex_colors=rgba)

    ins_name = f"{spec['id']}_{side}.glb"
    add_name = f"{spec['id']}_{side}_addon.glb"
    insole.export(OUT / ins_name, include_normals=True)
    addon.export(OUT / add_name, include_normals=True)
    tmax = float(thick.max())
    print(f"  {side}: lift {lift:.1f}mm, addon thickness max {tmax:.1f}mm, "
          f"{len(addon.faces)} faces -> {add_name}")
    return {
        "file": f"models/{ins_name}",
        "addon": f"models/{add_name}",
        "faces": int(len(insole.faces)),
        "extents": [round(float(x), 1) for x in insole.extents],
        "relief_focus": None,
        "pad_focus": None,
        "relief_area_pct": 0.0,
        "pad_area_pct": 0.0,
    }


# ---------------------------------------------------------------------------
# Extrinsic cork wedges. The rise comes from the TRUE production blank STL
# (1/4" prism strip). On the bench the blank is glued to the FLAT BASE and
# ground: the HIGHEST POINT of the wedge is referenced from the HEEL, on the
# prescribed border (medial or lateral); everything forward is ground away
# until only a thin line of cork shows by the toe. Motion "flip": the device
# flips over to expose the base, the ground wedge attaches exactly where it
# is glued, then the device rolls back upright and the heel lean appears.
# ---------------------------------------------------------------------------
WEDGE_STL = Path("/Users/surya/Downloads/14in_1_4_wedge.stl")
FLIP_INSOLE = "CPO-307228_LEFT.glb"   # plain functional insole, left foot

FLIP_PAIRS = [
    {
        "id": "PAIR-WEDGE-MEDIAL",
        "edge": "medial",
        "label": "Extrinsic wedge \u2014 medial",
        "additions": 'True cork blank (1/4"), high edge straight along the MEDIAL border, heel to arch, trimmed flush to the insole outline',
    },
    {
        "id": "PAIR-WEDGE-LATERAL",
        "edge": "lateral",
        "label": "Extrinsic wedge \u2014 lateral",
        "additions": 'True cork blank (1/4"), high edge straight along the LATERAL border, heel to arch, trimmed flush to the insole outline',
    },
]


def aligned_blank():
    """True blank STL -> axis-aligned strip: length on y, width on x, z up,
    HIGH edge at +x, centered on the origin."""
    m = trimesh.load(WEDGE_STL)
    v = np.asarray(m.vertices, dtype=float)
    c = v[:, :2].mean(axis=0)
    _, _, Vt = np.linalg.svd(v[:, :2] - c)
    R = np.eye(4)
    R[0, :2] = Vt[1]          # width (second principal axis) -> x
    R[1, :2] = Vt[0]          # length (first principal axis) -> y
    if np.linalg.det(R[:3, :3]) < 0:
        R[0, :2] = -R[0, :2]  # keep it a rotation, not a reflection
    m.apply_translation([-c[0], -c[1], 0])
    m.apply_transform(R)
    # HIGH edge = where the top vertices sit; put it at +x (rotate, not mirror)
    v = np.asarray(m.vertices)
    hi_x = v[v[:, 2] > v[:, 2].max() * 0.5][:, 0].mean()
    if hi_x < 0:
        m.apply_transform(trimesh.transformations.rotation_matrix(np.pi, [0, 0, 1]))
    m.apply_translation([0, -np.asarray(m.vertices)[:, 1].mean(), 0])
    return m


def build_flip_pair(spec: dict):
    src = OUT / FLIP_INSOLE
    if not src.exists() or not WEDGE_STL.exists():
        print("  missing insole GLB or wedge STL, skipped")
        return None
    insole = trimesh.load(src, force="mesh")

    b = insole.bounds
    xs0, ys0 = b[0][0] - 2, b[0][1] - 2
    nx = int((b[1][0] - xs0) / CELL) + 4
    ny = int((b[1][1] - ys0) / CELL) + 4
    ip, _ = trimesh.sample.sample_surface(insole, 400000)
    top_raw = surface_heightfield(ip, xs0, ys0, nx, ny)

    mask = ~np.isnan(top_raw)
    mask = ndimage.binary_closing(mask, iterations=2)
    mask = ndimage.binary_fill_holes(mask)
    lbl, n = ndimage.label(mask)
    if n > 1:
        sizes = ndimage.sum_labels(np.ones(mask.shape), lbl, index=np.arange(1, n + 1))
        mask = lbl == (np.argmax(sizes) + 1)

    # locate the heel (narrow) end, then the medial side: in the arch band
    # (25-55% of length from the heel) the medial rim carries the tall arch
    width = mask.sum(axis=0).astype(float)
    ys = np.where(width > 0)[0]
    q = max(1, len(ys) // 4)
    heel_lo = width[ys[:q]].mean() < width[ys[-q:]].mean()
    L = ys[-1] - ys[0]
    if heel_lo:
        band = (ys[0] + 0.25 * L, ys[0] + 0.55 * L)
    else:
        band = (ys[-1] - 0.55 * L, ys[-1] - 0.25 * L)
    jj = np.arange(ny)[None, :]
    band_mask = mask & (jj >= band[0]) & (jj <= band[1])
    top = fill_nan(top_raw)
    ii = np.arange(nx)[:, None]
    xs_c = np.where(mask.any(axis=1))[0]
    cx = (xs_c[0] + xs_c[-1]) / 2
    medial_hi_x = top[band_mask & (ii > cx)].mean() > top[band_mask & (ii < cx)].mean()
    hi_at_pos_x = (spec["edge"] == "medial") == bool(medial_hi_x)

    # ---- the wedge: the TRUE blank STL, shape untouched ----
    # Bench recipe: lay the strip STRAIGHT along the foot, HIGH edge on the
    # prescribed border (lateral wedge -> rise on the lateral side, medial ->
    # medial), running from the heel forward. Only two cuts are allowed:
    # shorten the LENGTH so it stops at the arch (never toe-to-heel), and
    # trim the plan outline flush with the insole's bottom taper -- which
    # mostly bites at the heel curve. The slant itself is never modified.
    blank = aligned_blank()
    bw = float(blank.extents[0])         # strip width (high edge -> feather)
    rise = float(blank.bounds[1][2])     # true 1/4" rise from the STL

    # world-mm footprint extents along the length
    y_heel = ys0 + (ys[0] if heel_lo else ys[-1]) * CELL
    Lmm = L * CELL
    wedge_len = 0.55 * Lmm               # heel up to the arch
    s = 1.0 if heel_lo else -1.0         # sign of heel->toe along +y

    # rotate (not mirror) so the HIGH edge sits on the prescribed border
    if not hi_at_pos_x:
        blank.apply_transform(trimesh.transformations.rotation_matrix(np.pi, [0, 0, 1]))

    # shorten the length: slide the two square prism ends in; the
    # cross-section (the slant) is untouched. 3mm overhang past the heel
    # edge so the outline trim shapes the heel curve.
    v = np.asarray(blank.vertices).copy()
    v[:, 1] = y_heel + s * np.where(v[:, 1] > v[:, 1].mean(), wedge_len, -3.0)
    # slide sideways: high edge just OUTSIDE the border within the wedge's
    # span, so the boolean cut makes the high wall follow the insole taper
    yy = ys0 + np.arange(ny) * CELL
    jsel = (yy >= min(y_heel, y_heel + s * wedge_len)) & \
           (yy <= max(y_heel, y_heel + s * wedge_len))
    cols = np.where(mask[:, jsel].any(axis=1))[0]
    if hi_at_pos_x:
        x_out = xs0 + cols[-1] * CELL + 1.0
        v[:, 0] += x_out - v[:, 0].max()
    else:
        x_out = xs0 + cols[0] * CELL - 1.0
        v[:, 0] += x_out - v[:, 0].min()
    blank.vertices = v

    # cut flush with the insole outline: boolean-intersect the placed strip
    # with the footprint extruded straight down (the bench grinder's cut)
    import shapely.geometry as sgeom
    import shapely.ops as sops
    step = ndimage.binary_erosion(mask, iterations=1)
    ii2, jj2 = np.nonzero(mask & ~step)                   # outline cells
    ring = np.column_stack([xs0 + ii2 * CELL, ys0 + jj2 * CELL])
    poly = sops.unary_union([sgeom.Point(p).buffer(CELL * 1.6) for p in ring])
    if poly.geom_type == "MultiPolygon":
        poly = max(poly.geoms, key=lambda g: g.area)
    poly = sgeom.Polygon(poly.exterior)              # fill: footprint, not a ring
    poly = poly.buffer(-CELL * 1.2)
    # the grid outline wobbles at millimeter scale: refit it as a periodic
    # smoothing spline so the cut wall reads as one continuous curve
    from scipy.interpolate import splprep, splev
    xy = np.asarray(poly.exterior.coords)[:-1]
    tck, _ = splprep([xy[:, 0], xy[:, 1]], s=len(xy) * 1.5, per=True)
    sx, sy = splev(np.linspace(0, 1, 500, endpoint=False), tck)
    poly = sgeom.Polygon(np.column_stack([sx, sy])).buffer(0)
    cutter = trimesh.creation.extrude_polygon(poly, height=rise * 3 + 20)
    cutter.merge_vertices()
    cutter.update_faces(cutter.nondegenerate_faces())
    cutter.remove_unreferenced_vertices()
    cutter.apply_translation([0, 0, -(rise + 5)])
    # guard the knife edge: if the insole outline reaches past the feather
    # side, stop the cut 2mm short so no zero-thickness slivers appear
    vb = np.asarray(blank.vertices)
    box = trimesh.creation.box(extents=[600, 600, 60])
    if hi_at_pos_x:
        box.apply_translation([vb[:, 0].min() + 2.0 + 300.0, y_heel, 0])
    else:
        box.apply_translation([vb[:, 0].max() - 2.0 - 300.0, y_heel, 0])
    wedge = trimesh.boolean.intersection([blank, cutter, box], engine="manifold")
    wedge.update_faces(wedge.nondegenerate_faces())
    wedge.remove_unreferenced_vertices()

    # ---- rest pose: the flat base sits on the strip's sloped top face, so
    # the device tilts about the length axis and the prescribed border rides
    # high; the strip's own slant sets the angle ----
    beta = np.arctan2(rise, bw)
    x_hi = vb[:, 0].max() if hi_at_pos_x else vb[:, 0].min()
    x_lo = vb[:, 0].min() if hi_at_pos_x else vb[:, 0].max()
    Rt = trimesh.transformations.rotation_matrix(
        -beta if hi_at_pos_x else beta, [0, 1, 0],
        point=[x_hi, y_heel + s * wedge_len / 2, rise])
    insole.apply_transform(Rt)
    # seat the tilted base flush on the sloped top (tiny clearance)
    ip2, _ = trimesh.sample.sample_surface(insole, 200000)
    wb = wedge.bounds
    on = (ip2[:, 0] > wb[0][0] + 2) & (ip2[:, 0] < wb[1][0] - 2) & \
         (ip2[:, 1] > wb[0][1] + 2) & (ip2[:, 1] < wb[1][1] - 2)
    plane_z = rise * np.clip((ip2[on, 0] - x_lo) / (x_hi - x_lo), 0, 1)
    gap = ip2[on, 2] - plane_z
    insole.apply_translation([0, 0, -np.percentile(gap, 1) + 0.15])

    # ---- colors: both parts in the same near-black — on the finished
    # device the glued wedge is ground and finished to match the shell ----
    iv = np.asarray(insole.vertices)
    rgba, _, _ = colorize(iv, [], np.asarray(insole.vertex_normals))
    insole.visual = trimesh.visual.ColorVisuals(insole, vertex_colors=rgba)
    # smooth normals on the curved cut wall (flat shading scallops it);
    # the prism's big faces stay visually flat anyway
    wedge = trimesh.graph.smooth_shade(wedge, angle=np.radians(40))
    wc = np.tile(np.array([23, 24, 28, 255]), (len(wedge.vertices), 1)).astype(np.uint8)
    wedge.visual = trimesh.visual.ColorVisuals(wedge, vertex_colors=wc)

    ins_name = f"{spec['id']}_LEFT.glb"
    add_name = f"{spec['id']}_LEFT_addon.glb"
    insole.export(OUT / ins_name, include_normals=True)
    wedge.export(OUT / add_name, include_normals=True)
    print(f"  LEFT: true blank rise {rise:.1f}mm, tilt {np.degrees(beta):.2f} deg, "
          f"high edge straight along the {spec['edge']} border, heel to arch "
          f"({wedge_len:.0f}mm), wedge {len(wedge.faces)} faces -> {add_name}")
    return {
        "file": f"models/{ins_name}",
        "addon": f"models/{add_name}",
        "faces": int(len(insole.faces)),
        "extents": [round(float(x), 1) for x in insole.extents],
        "relief_focus": None,
        "pad_focus": None,
        "relief_area_pct": 0.0,
        "pad_area_pct": 0.0,
    }


# ---------------------------------------------------------------------------
# Top covers T1-T14: the real production lineup, at TRUE sheet thickness.
# Each cover is a skin (one or two stacked layers) following the insole's
# finished top surface, die-cut just inside the outline. Layer order is
# bottom-up: Poron is always the glue-side cushion layer, the comfort
# material (P-Cell / Puff / ...) faces the foot. Colors are sampled from
# the real sheet photos in assets/topcovers/.
# Motion "drape": hover tilted, lay down heel-first, press flat.
# ---------------------------------------------------------------------------
COVER_INSOLE = "CPO-307228_LEFT.glb"
IN16 = 1.5875    # 1/16 inch in mm
IN8 = 3.175      # 1/8 inch in mm
PORON = "#74baf6"

# layers listed bottom-up: (material label, thickness mm, face color)
# "Preferred Puff" sheets are PERFORATED in production (see the t12/t4 face
# photos: pinholes on a ~4mm diagonal lattice) — flagged by material below.
PERF_MATERIAL = "Preferred Puff"
COVERS = [
    {"code": "T1",  "name": '1/8" P-Cell',            "layers": [('1/8" P-Cell', IN8, "#faceac")]},
    {"code": "T2",  "name": '1/16" P-Cell over Poron', "layers": [('1/16" Poron', IN16, PORON), ('1/16" P-Cell', IN16, "#f4c89e")]},
    {"code": "T3",  "name": '1/8" P-Cell over Poron', "layers": [('1/16" Poron', IN16, PORON), ('1/8" P-Cell', IN8, "#edaf85")]},
    {"code": "T4",  "name": "Everyday",               "layers": [('1/16" Poron', IN16, PORON), ('1/16" Preferred Puff', IN16, "#3c75e8")]},
    {"code": "T5",  "name": "Vinyl",                  "layers": [("Vinyl", 1.0, "#2a2a2e")]},
    {"code": "T6",  "name": "Spenco",                 "layers": [('1/8" Spenco', IN8, "#3a3a40")]},
    {"code": "T7",  "name": '1/8" Puff',              "layers": [('1/8" Puff', IN8, "#5caaf6")]},
    {"code": "T8",  "name": '1/16" Puff',             "layers": [('1/16" Puff', IN16, "#4f9cf8")]},
    {"code": "T9",  "name": '1/16" Neo Sponge',       "layers": [('1/16" Neo Sponge', IN16, "#26262b")]},
    {"code": "T11", "name": '1/16" P-Cell',           "layers": [('1/16" P-Cell', IN16, "#f8c6a3")]},
    {"code": "T12", "name": '1/16" Preferred Puff',   "layers": [('1/16" Preferred Puff', IN16, "#4b94f0")]},
    {"code": "T13", "name": '1/16" Poron',            "layers": [('1/16" Poron', IN16, PORON)]},
    {"code": "T14", "name": '1/8" Poron',             "layers": [('1/8" Poron', IN8, "#79cdfb")]},
]


def _cover_colors(hexs):
    h = hexs.lstrip("#")
    top = np.array([int(h[i:i + 2], 16) for i in (0, 2, 4)], dtype=np.uint8)
    side = (top.astype(float) * 0.78).astype(np.uint8)   # cut edge reads darker
    return (top, side)


def _diecut_polygon(mask, xs0, ys0):
    """Smooth die-cut outline that TRACKS the insole edge. A smoothing
    spline cuts tight corners (it left the toe 5mm bare), so instead:
    take the footprint, inset a uniform ~1mm, kill the 1mm grid wobble with
    Chaikin corner-cutting (which by construction never overshoots), and
    resample to an even ring for clean wall quads."""
    import shapely
    import shapely.geometry as sgeom
    import shapely.ops as sops
    step = ndimage.binary_erosion(mask, iterations=1)
    ii, jj = np.nonzero(mask & ~step)
    ring = np.column_stack([xs0 + ii * CELL, ys0 + jj * CELL])
    poly = sops.unary_union([sgeom.Point(p).buffer(CELL * 1.6) for p in ring])
    if poly.geom_type == "MultiPolygon":
        poly = max(poly.geoms, key=lambda g: g.area)
    # point-union rim sits ~1.1mm outside the true edge; -2.8 nets a snug
    # ~1mm inset with no overhang anywhere (measured, not guessed)
    poly = sgeom.Polygon(poly.exterior).buffer(-2.8).simplify(0.35)
    xy = np.asarray(poly.exterior.coords)[:-1]
    for _ in range(3):                       # Chaikin: clean, no overshoot
        nxt = np.empty((2 * len(xy), 2))
        nxt[0::2] = 0.75 * xy + 0.25 * np.roll(xy, -1, axis=0)
        nxt[1::2] = 0.25 * xy + 0.75 * np.roll(xy, -1, axis=0)
        xy = nxt
    # uniform resample so wall quads are even along the whole outline
    seg = np.linalg.norm(np.roll(xy, -1, axis=0) - xy, axis=1)
    s = np.concatenate([[0], np.cumsum(seg)])
    tgt = np.linspace(0, s[-1], 700, endpoint=False)
    closed = np.vstack([xy, xy[:1]])
    rx = np.interp(tgt, s, closed[:, 0])
    ry = np.interp(tgt, s, closed[:, 1])
    return sgeom.Polygon(np.column_stack([rx, ry])).buffer(0)


def _patch(poly, spacing):
    """Triangulated flat patch of a polygon: interior grid points at the
    given spacing plus the exact spline boundary ring, Delaunay-connected,
    with outside triangles dropped. Density is controlled, the boundary is
    the smooth spline — no grid stair-steps. Returns (verts2d, faces); the
    first len(ring) vertices are the boundary ring, in order."""
    import shapely
    from scipy.spatial import Delaunay
    ring = np.asarray(poly.exterior.coords)[:-1]
    minx, miny, maxx, maxy = poly.bounds
    gx, gy = np.meshgrid(np.arange(minx, maxx, spacing), np.arange(miny, maxy, spacing))
    pts = np.column_stack([gx.ravel(), gy.ravel()])
    # keep interior points clear of the boundary so no sliver triangles form
    inner = poly.buffer(-spacing * 0.55)
    pts = pts[shapely.contains_xy(inner, pts[:, 0], pts[:, 1])]
    v2 = np.vstack([ring, pts])
    tri = Delaunay(v2)
    cent = v2[tri.simplices].mean(axis=1)
    keep = shapely.contains_xy(poly.buffer(0.05), cent[:, 0], cent[:, 1])
    return v2, tri.simplices[keep]


def _cover_layer(poly, zoff, t, surf, xs0, ys0, hexs, perforate):
    """One cover layer with a genuinely smooth die-cut wall: top and bottom
    patches bounded by the spline outline, wall quads sealing the two
    boundary rings, all draped onto the insole's top surface by vertical
    displacement.
    Perforated sheets get their real pinholes: a ~4mm diagonal lattice of
    darkened dimples pressed into the top face, matching the sheet photos."""
    ring = np.asarray(poly.exterior.coords)[:-1]
    nr = len(ring)
    vt2, ft = _patch(poly, 0.9 if perforate else 1.8)    # top: the seen face
    vb2, fb = _patch(poly, 3.5)                          # bottom: glue side
    # assemble: both patches start with the identical boundary ring, so the
    # wall quads between the two rings seal the solid exactly
    vt = np.column_stack([vt2, np.full(len(vt2), float(t))])
    vb = np.column_stack([vb2, np.zeros(len(vb2))])
    nt = len(vt)
    fb = fb[:, ::-1] + nt                                # bottom faces wind down
    wall = []
    for k in range(nr):
        k2 = (k + 1) % nr
        wall += [(k, nt + k2, nt + k), (k, k2, nt + k2)]
    v = np.vstack([vt, vb])
    f = np.vstack([ft, fb, np.asarray(wall)])
    top = v[:, 2] > t - 1e-6              # identified before displacement
    # drape: follow the finished insole surface (bilinear sample of the grid)
    gi = (v[:, 0] - xs0) / CELL
    gj = (v[:, 1] - ys0) / CELL
    dz = ndimage.map_coordinates(surf, [gi, gj], order=1, mode="nearest")
    v[:, 2] += dz + zoff - 0.5            # sink slightly to avoid z-fighting
    top_c, side_c = _cover_colors(hexs)
    rgba = np.empty((len(v), 4), dtype=np.uint8)
    rgba[:, :3] = np.where(top[:, None], top_c, side_c)
    rgba[:, 3] = 255
    if perforate:
        pitch = 4.0                        # 45-degree lattice, like the photo
        u = (v[:, 0] - xs0 + v[:, 1] - ys0) / pitch
        w = (v[:, 0] - xs0 - v[:, 1] + ys0) / pitch
        du = (u - np.round(u)) * pitch
        dw = (w - np.round(w)) * pitch
        d = np.sqrt(du * du + dw * dw)
        hole = top & (d < 0.95)
        fade = np.clip(1 - d[hole] / 0.95, 0, 1)
        rgba[hole, :3] = (rgba[hole, :3] * (1 - 0.65 * fade[:, None])).astype(np.uint8)
        v[hole, 2] -= 0.45 * fade          # shallow dimple so light catches it
    mesh = trimesh.Trimesh(vertices=v, faces=f, process=False)
    mesh.visual = trimesh.visual.ColorVisuals(mesh, vertex_colors=rgba)
    return mesh


def build_cover_variants():
    """One shared black insole + one true-thickness cover GLB per T-code."""
    src = OUT / COVER_INSOLE
    if not src.exists():
        print("  missing insole GLB, skipped")
        return None, []
    insole = trimesh.load(src, force="mesh")
    b = insole.bounds
    xs0, ys0 = b[0][0] - 2, b[0][1] - 2
    nx = int((b[1][0] - xs0) / CELL) + 4
    ny = int((b[1][1] - ys0) / CELL) + 4
    ip, _ = trimesh.sample.sample_surface(insole, 500000)
    top_raw = surface_heightfield(ip, xs0, ys0, nx, ny)
    mask = ~np.isnan(top_raw)
    mask = ndimage.binary_closing(mask, iterations=2)
    mask = ndimage.binary_fill_holes(mask)
    lbl, n = ndimage.label(mask)
    if n > 1:
        sizes = ndimage.sum_labels(np.ones(mask.shape), lbl, index=np.arange(1, n + 1))
        mask = lbl == (np.argmax(sizes) + 1)
    # covers follow the finished top surface exactly — arch and heel cup
    # included; median+gaussian kill single-cell spikes near steep walls
    surf = fill_nan(top_raw)
    surf = ndimage.median_filter(surf, size=3)
    surf = ndimage.gaussian_filter(surf, 1.4)
    # the smooth knife line every layer is cut with
    poly = _diecut_polygon(mask, xs0, ys0)

    variants = []
    for spec in COVERS:
        zoff = 0.0
        parts = []
        for mat, t, hexs in spec["layers"]:
            parts.append(_cover_layer(poly, zoff, t, surf, xs0, ys0,
                                      hexs, PERF_MATERIAL in mat))
            zoff += t
        cover = trimesh.util.concatenate(parts) if len(parts) > 1 else parts[0]
        add_name = f"PAIR-TOP-COVER_{spec['code']}_addon.glb"
        cover.export(OUT / add_name, include_normals=True)
        total = sum(l[1] for l in spec["layers"])
        recipe = " over ".join(l[0] for l in reversed(spec["layers"]))
        variants.append({
            "code": spec["code"],
            "name": spec["name"],
            "recipe": recipe,
            "mm": round(total, 1),
            "layers": len(spec["layers"]),
            "perf": any(PERF_MATERIAL in l[0] for l in spec["layers"]),
            "swatch": spec["layers"][-1][2],
            "swatches": [l[2] for l in spec["layers"]],   # bottom-up
            # training mode: displayed name vs ACTUAL thickness, top-down
            "layerInfo": [{"label": l[0], "mm": round(l[1], 2), "hex": l[2]}
                          for l in reversed(spec["layers"])],
            "addon": f"models/{add_name}",
            "photo": f"assets/topcovers/{spec['code'].lower()}-face.jpg",
            "edge": f"assets/topcovers/{spec['code'].lower()}-edge.jpg",
        })
        print(f"  {spec['code']} {spec['name']}: {recipe}, {total:.1f}mm, "
              f"{len(cover.faces)} faces -> {add_name}")

    iv = np.asarray(insole.vertices)
    rgba, _, _ = colorize(iv, [], np.asarray(insole.vertex_normals))
    insole.visual = trimesh.visual.ColorVisuals(insole, vertex_colors=rgba)
    ins_name = "PAIR-TOP-COVER_LEFT.glb"
    insole.export(OUT / ins_name, include_normals=True)
    model = {
        "file": f"models/{ins_name}",
        "addon": variants[0]["addon"],   # default cover: T1 1/8" P-Cell
        "faces": int(len(insole.faces)),
        "extents": [round(float(x), 1) for x in insole.extents],
        "relief_focus": None,
        "pad_focus": None,
        "relief_area_pct": 0.0,
        "pad_area_pct": 0.0,
    }
    return model, variants


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    catalog = json.loads(CATALOG.read_text()) if CATALOG.exists() else []
    for spec in PAIRS:
        print(spec["id"])
        models = {}
        for side in ("LEFT", "RIGHT"):
            entry = build_pair(spec, side)
            if entry:
                models[side] = entry
        if not models:
            continue
        in_library = spec.get("library", False)
        entry = {
            "po": spec["id"],
            "categories": [spec.get("category", "Offload Met Head")] if in_library else [],
            "orthotic_type": "Insole + separate part",
            "base": "",
            "top_cover": "",
            "additions": spec["additions"],
            "label": spec["label"],
            "hidden": not in_library,   # non-library pairs are lesson-only
            # cyan parts are soft fills: they press into the insole under load;
            # amber parts are raises: they lift off to show they're separate
            "motion": spec.get("motion", "press" if spec["color"] is CYAN else "lift"),
            "models": models,
        }
        catalog = [e for e in catalog if e["po"] != spec["id"]] + [entry]
    for spec in FLIP_PAIRS:
        print(spec["id"])
        m = build_flip_pair(spec)
        if not m:
            continue
        entry = {
            "po": spec["id"],
            "categories": ["Cork Wedge (manual add-on)"],
            "orthotic_type": "Insole + glued cork wedge",
            "base": "",
            "top_cover": "",
            "additions": spec["additions"],
            "label": spec["label"],
            "hidden": False,
            "motion": "flip",   # flip over, glue the blank on, roll back upright
            "models": {"LEFT": m},
        }
        catalog = [e for e in catalog if e["po"] != spec["id"]] + [entry]
    print("PAIR-TOP-COVER")
    m, variants = build_cover_variants()
    if m:
        entry = {
            "po": "PAIR-TOP-COVER",
            "categories": ["Top Cover"],
            "orthotic_type": "Insole + top cover",
            "base": "",
            "top_cover": "Full",
            "additions": "13 production covers (T1\u2013T14) at true sheet thickness \u2014 select one to try it on",
            "label": "Top covers \u2014 T1 to T14",
            "hidden": False,
            "motion": "drape",   # hover tilted, lay down heel-first, press flat
            "models": {"LEFT": m},
            "variants": variants,
        }
        catalog = [e for e in catalog if e["po"] != "PAIR-TOP-COVER"] + [entry]
    CATALOG.write_text(json.dumps(sorted(catalog, key=lambda e: e["po"]), indent=1))
    print(f"catalog now has {len(catalog)} entries")


if __name__ == "__main__":
    main()
