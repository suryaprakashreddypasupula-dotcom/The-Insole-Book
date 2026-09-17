#!/usr/bin/env python3
"""Preprocess Hike insole STL renders into web-ready GLBs with baked offload colors.

Input:  /Users/surya/Downloads/po-insole-stls/*.stl   (real PO renders, mm units,
        X=width, Y=length heel->toe, Z=up, flat bottom at z=0 — verified)
Output: ../models/{PO}_{SIDE}.glb  + ../catalog.json

Offload detection: build a max-z heightfield of the top surface, subtract a
heavily gaussian-smoothed baseline; local depressions (reliefs/wells) go cyan,
local raises (pads/bars) go amber, the rest of the shell stays near-black.
Edge cells (heel-cup rim, sidewalls) are excluded via a distance-to-boundary
mask so the rim doesn't false-positive as a pad.
"""
from __future__ import annotations

import csv
import json
import re
import sys
from pathlib import Path

import numpy as np
import trimesh
from scipy import ndimage

SRC = Path("/Users/surya/Downloads/po-insole-stls")
OUT = Path(__file__).resolve().parents[1] / "models"
CATALOG = Path(__file__).resolve().parents[1] / "catalog.json"
CSV = Path(__file__).resolve().parent / "insole-types.csv"

CELL = 1.5            # heightfield cell size, mm
BALL_MM = 15.0        # rolling-ball radius for wells (reliefs are 20-30mm wide)
RAISE_BALL_MM = 24.0  # larger ball for raises (met pads/bars are 30-45mm wide)
PRE_SIGMA_MM = 1.5    # light pre-smooth to suppress print-lattice texture
LATTICE_FILL_MM = 3.5 # closing radius that fills waffle-texture pits pre-detection
TOP_BAND = 1.6        # verts within this many mm of the cell top count as "surface"
EDGE_KEEPOUT = 8.0    # mm from footprint boundary excluded from highlights
RELIEF_START, RELIEF_FULL = 0.7, 2.4    # mm well-depth ramp (depressions)
PAD_START, PAD_FULL = 0.6, 2.0          # mm raise-height ramp (pads/bars)

SHELL = np.array([23, 24, 28])      # near-black shell
RELIEF = np.array([53, 200, 255])   # cyan wells
PAD = np.array([255, 179, 64])      # amber pads/bars

MAX_FACES = 28000

# Anatomical gates per offload type: (polarity, y0, y1, x-side, min_edge_mm)
# y is fraction of length heel(0) -> toe(1); side is medial / lateral / center / any.
# min_edge_mm keeps highlights away from sidewalls/rims (heel-cup rim especially).
# Detection only fires where prescribed offload zone AND geometry agree.
OFFLOAD_ZONES = {
    "Met Pad":                  ("raise", 0.45, 0.80, "any", 8),
    "Met Bar":                  ("raise", 0.45, 0.82, "any", 8),
    "Offload Met Head":         ("well", 0.55, 0.88, "any", 8),
    "Toe Crest":                ("raise", 0.65, 0.92, "any", 8),
    "Dancer Pad":               ("raise", 0.45, 0.85, "any", 8),
    "Morton Extension":         ("raise", 0.60, 0.98, "medial", 8),
    "Reverse Morton Extension": ("raise", 0.50, 0.90, "any", 8),
    "Heel Pad":                 ("raise", 0.00, 0.25, "any", 16),
    "Heel Spur":                ("well", 0.00, 0.34, "any", 3),
    "Arch Pad":                 ("raise", 0.25, 0.65, "medial", 10),
    "Cuboid Raise":             ("raise", 0.22, 0.60, "lateral", 10),
    "Base of Fifth Relief":     ("well", 0.25, 0.65, "lateral", 8),
    "Drill & Fill Offload":     ("well", 0.15, 0.95, "any", 8),
    "Wedges":                   (None, 0, 0, "any", 8),     # angulation, no local feature
    "Arch Reinforcement":       (None, 0, 0, "any", 8),
}
DEEP_WELL_MM = 2.9   # unmistakable wells highlighted anywhere regardless of zones


def smoothstep(t: np.ndarray) -> np.ndarray:
    t = np.clip(t, 0.0, 1.0)
    return t * t * (3 - 2 * t)


def build_heightfield(v: np.ndarray):
    """Max-z heightfield over an (x, y) grid + footprint mask."""
    xmin, ymin = v[:, 0].min(), v[:, 1].min()
    xi = ((v[:, 0] - xmin) / CELL).astype(int)
    yi = ((v[:, 1] - ymin) / CELL).astype(int)
    nx, ny = xi.max() + 1, yi.max() + 1
    h = np.full((nx, ny), -np.inf)
    np.maximum.at(h, (xi, yi), v[:, 2])
    mask = np.isfinite(h)
    # close small vertex-sampling holes inside the footprint
    mask_closed = ndimage.binary_closing(mask, iterations=2)
    hole_fill = ndimage.grey_dilation(np.where(mask, h, -np.inf), size=3)
    h = np.where(mask, h, hole_fill)
    h[~np.isfinite(h)] = 0.0
    return h, mask_closed, xmin, ymin, xi, yi


def _disk(radius_mm: float) -> np.ndarray:
    r = max(1, int(round(radius_mm / CELL)))
    y, x = np.ogrid[-r : r + 1, -r : r + 1]
    return (x * x + y * y) <= r * r


def detect(v: np.ndarray):
    """Rolling-ball top-hat well/raise fields plus footprint geometry.

    Closing fills depressions narrower than the ball (wells, drill holes);
    opening shaves raises narrower than the ball (pads, bars). Broad anatomy
    (arch dome, heel cup) is wider than the ball and cancels out — mostly;
    remaining anatomical residue is suppressed by prescription-zone gating.
    """
    h, mask, xmin, ymin, xi, yi = build_heightfield(v)
    # soft diabetic tops are printed with a waffle/lattice texture; every pit
    # would read as its own "raise". Close the narrow pits first so detection
    # sees the top envelope, then smooth. Real wells (10mm+) survive this.
    h_env = ndimage.grey_closing(h, footprint=_disk(LATTICE_FILL_MM), mode="nearest")
    hs = ndimage.gaussian_filter(h_env, PRE_SIGMA_MM / CELL)
    closed = ndimage.grey_closing(hs, footprint=_disk(BALL_MM), mode="nearest")
    opened = ndimage.grey_opening(hs, footprint=_disk(RAISE_BALL_MM), mode="nearest")
    well = np.clip(closed - hs, 0, None)
    raise_ = np.clip(hs - opened, 0, None)
    # narrow wells (drill & fill holes, ~6-10mm) get erased by the lattice fill,
    # so detect them separately on the unfilled surface. Only used for devices
    # that actually prescribe Drill & Fill (their tops are smooth, no lattice).
    hs_raw = ndimage.gaussian_filter(h, PRE_SIGMA_MM / CELL)
    narrow = np.clip(
        ndimage.grey_closing(hs_raw, footprint=_disk(6.0), mode="nearest") - hs_raw, 0, None
    )
    dist = ndimage.distance_transform_edt(mask) * CELL
    ok = (dist >= EDGE_KEEPOUT) & mask
    well[~ok] = 0.0
    raise_[~ok] = 0.0
    narrow[~ok] = 0.0
    on_top = v[:, 2] >= (h[xi, yi] - TOP_BAND)
    return well, raise_, narrow, dist, h, xi, yi, on_top


def medial_is_positive_x(v: np.ndarray) -> bool:
    """The arch dome (tallest midfoot surface) sits on the medial side."""
    y0, y1 = np.percentile(v[:, 1], [35, 65])
    mid = v[(v[:, 1] >= y0) & (v[:, 1] <= y1)]
    xc = np.median(mid[:, 0])
    pos = mid[mid[:, 0] > xc][:, 2]
    neg = mid[mid[:, 0] <= xc][:, 2]
    return np.percentile(pos, 92) > np.percentile(neg, 92)


def clean_weight_grid(w: np.ndarray, thresh=0.30, min_area_mm2=100.0, feather_mm=3.5):
    """Turn a noisy per-cell weight field into solid, smooth-edged regions.

    Print-surface texture speckles the raw response, which reads as 'paint
    splatter' once baked. Threshold -> despeckle -> close holes -> feather.
    Inside a kept region the fill is at least 0.75, rising with intensity.
    """
    mask = w >= thresh
    if not mask.any():
        return np.zeros_like(w)
    mask = ndimage.binary_closing(mask, iterations=2)
    mask = ndimage.binary_fill_holes(mask)
    lbl, n = ndimage.label(mask)
    if n:
        areas = ndimage.sum_labels(np.ones_like(w), lbl, index=np.arange(1, n + 1)) * CELL * CELL
        keep = np.isin(lbl, np.nonzero(areas >= min_area_mm2)[0] + 1)
    else:
        keep = mask
    if not keep.any():
        return np.zeros_like(w)
    # round off the jagged threshold coastline (gaussian blur + re-threshold),
    # otherwise a slowly-sloping pad produces a fractal, torn-looking border
    keep = ndimage.gaussian_filter(keep.astype(float), 3.0 / CELL) > 0.45
    if not keep.any():
        return np.zeros_like(w)
    # feather: full strength deeper than feather_mm inside the boundary
    inside = ndimage.distance_transform_edt(keep) * CELL
    edge = np.clip(inside / feather_mm, 0.0, 1.0)
    intensity = ndimage.gaussian_filter(np.where(keep, np.maximum(w, 0.75), 0.0), 1.0)
    return np.clip(intensity, 0, 1) * edge


def colorize(v: np.ndarray, offloads: list[str], normals: np.ndarray | None = None):
    well, raise_, narrow, dist, h, xi, yi, on_top = detect(v)
    medial_pos = medial_is_positive_x(v)

    # everything happens on the grid: raw response -> zone gating -> cleanup.
    # Cleaning LAST means zone boundaries get despeckled and feathered too,
    # instead of leaving a ragged vertex-resolution cut line.
    well_w = smoothstep((well - RELIEF_START) / (RELIEF_FULL - RELIEF_START))
    raise_w = smoothstep((raise_ - PAD_START) / (PAD_FULL - PAD_START))
    narrow_w = smoothstep((narrow - 1.5) / 1.5)
    deep_w = smoothstep((well - DEEP_WELL_MM) / 1.0)

    nx, ny = well.shape
    yf = (np.arange(ny) / max(ny - 1, 1))[None, :]        # heel->toe fraction per column
    xpos = (np.arange(nx) > (nx - 1) / 2)[:, None]        # +x half of the footprint

    relief_raw = np.zeros_like(well_w)
    pad_raw = np.zeros_like(raise_w)
    for name in offloads:
        spec = OFFLOAD_ZONES.get(name)
        if not spec or spec[0] is None:
            continue
        polarity, y0, y1, side, min_edge = spec
        zone = (yf >= y0) & (yf <= y1) & (dist >= min_edge)
        if side in ("medial", "lateral"):
            want_pos = medial_pos if side == "medial" else not medial_pos
            zone = zone & (xpos if want_pos else ~xpos)
        if polarity == "well":
            w = np.maximum(well_w, narrow_w) if name == "Drill & Fill Offload" else well_w
            relief_raw = np.maximum(relief_raw, np.where(zone, w, 0.0))
        else:
            pad_raw = np.maximum(pad_raw, np.where(zone, raise_w, 0.0))
    # unmistakably deep wells glow anywhere, but only on devices that actually
    # prescribe a well (drill & fill, spurs...) — otherwise natural arch/heel
    # curvature on wedged devices gets falsely painted
    has_well = any(OFFLOAD_ZONES.get(n, (None,))[0] == "well" for n in offloads)
    if has_well:
        relief_raw = np.maximum(relief_raw, deep_w)

    # reliefs include small drill holes (~40mm²), so their cleanup must not
    # despeckle or feather away legitimately small features
    relief_w = clean_weight_grid(relief_raw, min_area_mm2=30.0, feather_mm=1.8)[xi, yi]
    pad_w = clean_weight_grid(pad_raw, min_area_mm2=60.0)[xi, yi]

    # gate to the walking surface. A fixed height band bites ragged holes into
    # sloped pad edges (surface drops faster than the band within one cell), so
    # prefer the face direction: upward-facing and near the local top.
    if normals is not None:
        on_surface = (normals[:, 2] > 0.1) & (v[:, 2] >= (h[xi, yi] - 6.0))
    else:
        on_surface = on_top
    relief_w[~on_surface] = 0.0
    pad_w[~on_surface] = 0.0
    colors = np.tile(SHELL, (len(v), 1)).astype(float)
    colors += (RELIEF - SHELL) * relief_w[:, None]
    colors += (PAD - SHELL) * pad_w[:, None]
    rgba = np.empty((len(v), 4), dtype=np.uint8)
    rgba[:, :3] = np.clip(colors, 0, 255).astype(np.uint8)
    rgba[:, 3] = 255
    return rgba, relief_w, pad_w


def highlight_focus(v, w):
    """Centroid + radius of a highlight region for camera fly-tos."""
    if w.sum() < 1e-6:
        return None
    c = (v * w[:, None]).sum(axis=0) / w.sum()
    spread = np.sqrt(((v - c) ** 2).sum(axis=1) @ w / w.sum())
    return {"center": [round(float(x), 1) for x in c], "radius": round(float(spread), 1)}


def simplify(mesh: trimesh.Trimesh) -> trimesh.Trimesh:
    if len(mesh.faces) <= MAX_FACES:
        return mesh
    try:
        import fast_simplification

        out_v, out_f = fast_simplification.simplify(
            np.asarray(mesh.vertices, dtype=np.float32),
            np.asarray(mesh.faces, dtype=np.int64),
            target_count=MAX_FACES,
        )
        return trimesh.Trimesh(vertices=out_v, faces=out_f, process=True)
    except Exception as exc:  # noqa: BLE001 — fall back to original mesh
        print(f"    simplify failed ({exc}); keeping full mesh")
        return mesh


def load_catalog_rows():
    rows = {}
    with open(CSV) as f:
        for r in csv.DictReader(f):
            po = r.get("po", "").strip()
            if not po:
                continue
            e = rows.setdefault(
                po,
                {
                    "po": po,
                    "categories": [],
                    "orthotic_type": r["orthotic_type"].strip(),
                    "base": r["base"].strip(),
                    "top_cover": r["top_cover"].strip(),
                    "additions": r["additions"].strip(),
                },
            )
            cat = r["category"].strip()
            if cat not in e["categories"]:
                e["categories"].append(cat)
    return rows


def main(only: list[str] | None = None):
    OUT.mkdir(parents=True, exist_ok=True)
    meta = load_catalog_rows()
    entries = {}
    files = sorted(SRC.glob("*.stl"))
    if only:
        files = [f for f in files if any(o in f.name for o in only)]
    for path in files:
        m = re.match(r"(CPO-\d+)_(.+)_(LEFT|RIGHT)\.stl", path.name)
        if not m:
            print("skip", path.name)
            continue
        po, _slug, side = m.groups()
        print(f"{po} {side}")
        mesh = trimesh.load(path)
        mesh = simplify(mesh)
        v = np.asarray(mesh.vertices)
        # center x/y on bbox center, keep z bottom at 0
        offset = np.array(
            [
                (v[:, 0].min() + v[:, 0].max()) / 2,
                (v[:, 1].min() + v[:, 1].max()) / 2,
                v[:, 2].min(),
            ]
        )
        mesh.apply_translation(-offset)
        v = np.asarray(mesh.vertices)
        info = meta.get(po, {})
        offloads = set(info.get("categories", []))
        for part in (info.get("additions") or "").split("+"):
            part = part.strip()
            if part:
                offloads.add(part)
        rgba, relief_w, pad_w = colorize(v, sorted(offloads), np.asarray(mesh.vertex_normals))
        mesh.visual = trimesh.visual.ColorVisuals(mesh, vertex_colors=rgba)
        out_name = f"{po}_{side}.glb"
        mesh.export(OUT / out_name, include_normals=True)
        entry = entries.setdefault(
            po,
            {
                **meta.get(
                    po,
                    {"po": po, "categories": [], "orthotic_type": "", "base": "",
                     "top_cover": "", "additions": ""},
                ),
                "models": {},
            },
        )
        entry["models"][side] = {
            "file": f"models/{out_name}",
            "faces": int(len(mesh.faces)),
            "extents": [round(float(x), 1) for x in mesh.extents],
            "relief_focus": highlight_focus(v, relief_w),
            "pad_focus": highlight_focus(v, pad_w),
            "relief_area_pct": round(float((relief_w > 0.4).mean() * 100), 2),
            "pad_area_pct": round(float((pad_w > 0.4).mean() * 100), 2),
        }
        size_kb = (OUT / out_name).stat().st_size // 1024
        print(
            f"    -> {out_name} {size_kb}KB  relief {entry['models'][side]['relief_area_pct']}%"
            f"  pad {entry['models'][side]['pad_area_pct']}%"
        )
    # merge instead of overwrite: keeps wedge add-on entries (WEDGE-*) and, on
    # partial rebuilds, every PO that wasn't rebuilt this run
    existing = {}
    if CATALOG.exists():
        existing = {e["po"]: e for e in json.loads(CATALOG.read_text())}
    existing.update(entries)
    CATALOG.write_text(json.dumps(sorted(existing.values(), key=lambda e: e["po"]), indent=1))
    print(f"catalog -> {CATALOG}  ({len(entries)} POs rebuilt, {len(existing)} total entries)")


if __name__ == "__main__":
    main(sys.argv[1:] or None)
