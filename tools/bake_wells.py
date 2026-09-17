#!/usr/bin/env python3
"""Bake offload highlight data into the shell GLBs.

For every base-shell GLB that carries a well-type offload (met head wells,
drill & fill, heel spur, base of 5th, PT groove) — plus the pad devices used
in stacked lessons — run the rolling-ball detector from build_models.py and
write the result into the mesh's vertex colors:

    R = well signed distance to the lip, 0.5 + d/8 mm  (0.5 on the contour)
    G = bowl depth 0..1 (blend of true depth and distance in from the lip)
    B = pad signed distance, same encoding as R

The viewer moves that COLOR_0 attribute to a `well` attribute and shades the
well as a lit cavity with a rim contour. Production shells never show these
colors — vertexColors stays off on the base material.

Also writes `well_focus` {center, radius, depth_mm} into catalog.json so the
viewer can pin a measured callout on the well.

Usage:  python3 tools/bake_wells.py            # all offload devices
        python3 tools/bake_wells.py DRILL-FILL # only POs containing this
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

import numpy as np
import trimesh
from scipy import ndimage

sys.path.insert(0, str(Path(__file__).resolve().parent))
import build_models as bm  # noqa: E402

ROOT = Path(__file__).resolve().parents[1]
CATALOG = ROOT / "catalog.json"

# PO -> offload names fed to the zone-gated detector. Entries not listed fall
# back to their catalog categories/additions when those contain a well type.
# An empty list skips the device: its geometry carries no well to show
# (Drill & Fill is a soft zone in a flush surface; the PT-groove demo's
# channel is indistinguishable from the natural arch valley at this scale).
OVERRIDES = {
    "SG-HEEL-FILL": [],
    "SG-OFFLOAD": [],
    "DRILL-FILL": [],
    "PAIR-DRILL-FILL-1ST": [],
    "SG-HEEL-OFFLOAD": ["Heel Spur"],
    "OFFLOAD-MET-HEAD": ["Offload Met Head"],
}
# the real met-head well on a printed diabetic base is ~1 mm deep and sits
# well inside the forefoot; keep the zone off the arch-to-forefoot drop
bm.OFFLOAD_ZONES["Offload Met Head"] = ("well", 0.62, 0.92, "any", 14)
bm.OFFLOAD_ZONES["Base of Fifth Relief"] = ("well", 0.25, 0.70, "lateral", 6)
# the heel-spur well sits under the calcaneus; the natural valley where the
# arch dome meets the heel cup starts right behind it and must stay out
bm.OFFLOAD_ZONES["Heel Spur"] = ("well", 0.00, 0.27, "any", 3)
# per-offload depth ramps (start, full) in mm; default = build_models values
RAMPS = {
    "Offload Met Head": (0.35, 0.85),
    "Base of Fifth Relief": (0.6, 1.6),
    "Heel Spur": (1.8, 3.2),
}

WELL_TYPES = {k for k, v in bm.OFFLOAD_ZONES.items() if v[0] == "well"}


def z_up_order(v: np.ndarray) -> list[int]:
    """Axis order that puts the thinnest bbox dimension last (z = up) and the
    longest horizontal axis second (y = heel->toe), like the STL frame."""
    ext = v.max(axis=0) - v.min(axis=0)
    up = int(np.argmin(ext))
    order = [i for i in range(3) if i != up] + [up]
    if ext[order[0]] > ext[order[1]]:
        order[0], order[1] = order[1], order[0]
    return order


def z_up(v: np.ndarray, order: list[int]) -> np.ndarray:
    w = v[:, order].copy()
    w[:, 2] -= w[:, 2].min()
    return w


def offloads_for(entry: dict) -> list[str]:
    po = entry["po"]
    if po in OVERRIDES:
        return OVERRIDES[po]
    # plug pairs: the cyan plug is the visual; their bases carry no consistent well
    if po.startswith("PAIR-OFFLOAD"):
        return []
    names = set(entry.get("categories") or [])
    for part in (entry.get("additions") or "").split("+"):
        part = part.strip()
        if part:
            names.add(part)
    return sorted(n for n in names if n in bm.OFFLOAD_ZONES and bm.OFFLOAD_ZONES[n][0])


def detect_dense(mesh: trimesh.Trimesh, v: np.ndarray, order: list[int]):
    """build_models.detect(), but the heightfield comes from a dense surface
    sample instead of the (simplified) vertex set — otherwise every cell that
    happens to hold no top-surface vertex reads as a 4 mm pit."""
    pts, _ = trimesh.sample.sample_surface(mesh, 450_000, seed=7)
    pts = np.asarray(pts)[:, order]
    pts[:, 2] -= np.asarray(mesh.vertices)[:, order][:, 2].min()
    h, mask, xmin, ymin, _, _ = bm.build_heightfield(pts)
    nx, ny = h.shape
    xi = np.clip(((v[:, 0] - xmin) / bm.CELL).astype(int), 0, nx - 1)
    yi = np.clip(((v[:, 1] - ymin) / bm.CELL).astype(int), 0, ny - 1)
    hs = ndimage.gaussian_filter(h, bm.PRE_SIGMA_MM / bm.CELL)
    closed = ndimage.grey_closing(hs, footprint=bm._disk(bm.BALL_MM), mode="nearest")
    opened = ndimage.grey_opening(hs, footprint=bm._disk(bm.RAISE_BALL_MM), mode="nearest")
    well = np.clip(closed - hs, 0, None)
    raise_ = np.clip(hs - opened, 0, None)
    narrow = np.clip(ndimage.grey_closing(hs, footprint=bm._disk(6.0), mode="nearest") - hs, 0, None)
    dist = ndimage.distance_transform_edt(mask) * bm.CELL
    ok = (dist >= bm.EDGE_KEEPOUT) & mask
    well[~ok] = 0.0
    raise_[~ok] = 0.0
    narrow[~ok] = 0.0
    # fractional grid coordinates of every vertex, for bilinear sampling
    fc = np.stack([(v[:, 0] - xmin) / bm.CELL, (v[:, 1] - ymin) / bm.CELL])
    return well, raise_, narrow, dist, h, xi, yi, fc, (xmin, ymin)


def fit_ellipse(cells: np.ndarray, well: np.ndarray, peak: float):
    """Ellipse (cx, cy, a, b, theta) in grid units through a well's half-depth
    contour. SoleGen cuts ovals; the detector's mask is a smoothed polygon of
    that oval, so the fit is the faithful shape and the mask only says where."""
    near = ndimage.binary_dilation(cells, iterations=1)
    core = near & (well >= 0.6 * peak)
    if core.sum() < 6:
        core = cells
    pts = np.argwhere(core).astype(float)
    c = pts.mean(axis=0)
    cov = np.cov((pts - c).T) + np.eye(2) * 1e-6
    evals, evecs = np.linalg.eigh(cov)
    # uniform ellipse: covariance eigenvalues are a^2/4, b^2/4; add half a
    # cell so the contour sits on the lip rather than through the edge cells
    a, b = 2.0 * np.sqrt(np.maximum(evals, 1e-6)) + 0.5
    theta = float(np.arctan2(evecs[1, 1], evecs[0, 1]))   # major axis direction
    return float(c[0]), float(c[1]), float(b), float(a), theta


def ellipse_field(v: np.ndarray, xmin: float, ymin: float, e, lip_pad_mm=0.4):
    """Per-vertex (signed radial distance in mm, bowl 0..1) for an ellipse."""
    cx, cy, a, b, theta = e
    x = (v[:, 0] - xmin) / bm.CELL - cx
    y = (v[:, 1] - ymin) / bm.CELL - cy
    ct, st = np.cos(theta), np.sin(theta)
    u = x * ct + y * st
    w = -x * st + y * ct
    a_mm, b_mm = a * bm.CELL + lip_pad_mm, b * bm.CELL + lip_pad_mm
    u_mm, w_mm = u * bm.CELL, w * bm.CELL
    r = np.sqrt((u_mm / a_mm) ** 2 + (w_mm / b_mm) ** 2)
    phi = np.arctan2(w_mm, u_mm)
    radius = a_mm * b_mm / np.sqrt((b_mm * np.cos(phi)) ** 2 + (a_mm * np.sin(phi)) ** 2)
    sd = (1.0 - r) * radius
    bowl = np.sqrt(np.clip(1.0 - r * r, 0.0, 1.0))
    return sd, bowl


SD_RANGE_MM = 8.0   # R/B channels: 0.5 + signed_distance / SD_RANGE  (±4 mm)


def sample(grid: np.ndarray, fc: np.ndarray) -> np.ndarray:
    return ndimage.map_coordinates(grid, fc, order=1, mode="nearest")


def signed_distance(mask: np.ndarray) -> np.ndarray:
    """mm, positive inside the region, negative outside."""
    if not mask.any():
        return np.full(mask.shape, -SD_RANGE_MM)
    return (ndimage.distance_transform_edt(mask) - ndimage.distance_transform_edt(~mask)) * bm.CELL


def encode_sd(sd_v: np.ndarray) -> np.ndarray:
    return np.clip(0.5 + sd_v / SD_RANGE_MM, 0.0, 1.0)


def weights(mesh, v, n, order, offloads):
    """Zone-gated well / pad regions per vertex (mirrors build_models.colorize),
    encoded as signed distance to the region contour so the shader can draw a
    sub-vertex, anti-aliased edge and a precise rim line."""
    well, raise_, narrow, dist, h, xi, yi, fc, grid_origin = detect_dense(mesh, v, order)
    medial_pos = bm.medial_is_positive_x(v)
    raise_w = bm.smoothstep((raise_ - bm.PAD_START) / (bm.PAD_FULL - bm.PAD_START))
    nx, ny = well.shape
    yf = (np.arange(ny) / max(ny - 1, 1))[None, :]
    xpos = (np.arange(nx) > (nx - 1) / 2)[:, None]
    relief_raw = np.zeros_like(well)
    pad_raw = np.zeros_like(raise_w)
    for name in offloads:
        spec = bm.OFFLOAD_ZONES.get(name)
        if not spec or spec[0] is None:
            continue
        polarity, y0, y1, side, min_edge = spec
        zone = (yf >= y0) & (yf <= y1) & (dist >= min_edge)
        if side in ("medial", "lateral"):
            want_pos = medial_pos if side == "medial" else not medial_pos
            zone = zone & (xpos if want_pos else ~xpos)
        if polarity == "well":
            start, full = RAMPS.get(name, (bm.RELIEF_START, bm.RELIEF_FULL))
            w = bm.smoothstep((well - start) / (full - start))
            relief_raw = np.maximum(relief_raw, np.where(zone, w, 0.0))
        else:
            pad_raw = np.maximum(pad_raw, np.where(zone, raise_w, 0.0))
    relief_grid = bm.clean_weight_grid(relief_raw, min_area_mm2=60.0, feather_mm=2.2)
    pad_grid = bm.clean_weight_grid(pad_raw, min_area_mm2=60.0)
    relief_mask = relief_grid > 0.4
    pad_mask = pad_grid > 0.4
    on_surface = (n[:, 2] > 0.1) & (v[:, 2] >= (h[xi, yi] - 6.0))
    pad_w = encode_sd(sample(signed_distance(pad_mask), fc))
    pad_w[~on_surface] = 0.0
    # wells: one analytic ellipse per blob -> exact oval edge at any zoom,
    # plus a callout focus for each
    lbl, nblob = ndimage.label(relief_mask)
    footprint = dist > 0
    blobs = []
    sd_all = np.full(len(v), -SD_RANGE_MM)
    depth = np.zeros(len(v))
    d_grid = sample(well, fc)
    for i in range(1, nblob + 1):
        cells = lbl == i
        if cells.sum() * bm.CELL ** 2 < 60:
            continue
        cx, cy = np.argwhere(cells).mean(axis=0)
        peak = max(float(np.percentile(well[cells], 90)), 0.2)
        e = fit_ellipse(cells, well, peak)
        sd, bowl = ellipse_field(v, grid_origin[0], grid_origin[1], e)
        sel = (sd > 0) & on_surface
        if not sel.any():
            continue
        # bowl profile: half true depth, half ellipse dome, so a flat floor
        # still shades lip -> centre
        d = np.clip(d_grid / peak, 0, 1)
        depth = np.where(sd > -1.5, np.maximum(depth, 0.45 * d + 0.55 * bowl), depth)
        sd_all = np.maximum(sd_all, sd)
        blobs.append({
            "sel": sel,
            "depth": float(np.percentile(well[cells], 90)),
            "name": well_name(offloads, cx, cy, nx, ny, footprint, medial_pos),
        })
    relief_w = encode_sd(sd_all)
    relief_w[~on_surface] = 0.0
    depth[~on_surface] = 0.0
    return relief_w, pad_w, depth, blobs


MET_HEAD_FRACS = [0.13, 0.32, 0.50, 0.68, 0.86]   # MT1..MT5 across the forefoot, medial -> lateral


def well_name(offloads, cx, cy, nx, ny, footprint, medial_pos):
    """Human label for a well from where it sits: which met head, heel spur, etc."""
    yf = cy / max(ny - 1, 1)
    zones = [(n, bm.OFFLOAD_ZONES[n]) for n in offloads if bm.OFFLOAD_ZONES.get(n) and bm.OFFLOAD_ZONES[n][0] == "well"]
    hit = [n for n, z in zones if z[1] <= yf <= z[2]]
    name = hit[0] if hit else (zones[0][0] if zones else "Relief")
    if name == "Offload Met Head":
        row = footprint[:, int(round(cy))]
        xs = np.nonzero(row)[0]
        if len(xs) > 2:
            lo, hi = xs.min(), xs.max()
            f = (cx - lo) / max(hi - lo, 1)
            if not medial_pos:
                f = 1 - f
            mt = int(np.argmin([abs(f - m) for m in MET_HEAD_FRACS])) + 1
            return f"MT{mt} offload well"
        return "Met head offload well"
    if name == "Heel Spur":
        return "Heel spur well"
    if name == "Base of Fifth Relief":
        return "Base of 5th well"
    return "Relief well"


def bake(path: Path, offloads: list[str]):
    mesh = trimesh.load(path, force="mesh")
    v0 = np.asarray(mesh.vertices, dtype=np.float64)
    order = z_up_order(v0)
    v = z_up(v0, order)
    n = np.asarray(mesh.vertex_normals)[:, order]
    # the thin axis may point down in this file's frame: flip so the walking
    # surface (the side with more area high up) faces +z
    if n[v[:, 2] > np.percentile(v[:, 2], 60), 2].mean() < 0:
        n = -n
    well_w, pad_w, depth, blobs = weights(mesh, v, n, order, offloads)

    # R = well signed distance (0.5 at the lip), G = bowl depth 0..1 relative
    # to the well's own deepest point, B = pad signed distance
    rgba = np.zeros((len(v), 4), dtype=np.uint8)
    rgba[:, 0] = np.clip(np.round(well_w * 255), 0, 255)
    rgba[:, 1] = np.clip(np.round(depth * 255), 0, 255)
    rgba[:, 2] = np.clip(np.round(pad_w * 255), 0, 255)
    rgba[:, 3] = 255
    out = trimesh.Trimesh(vertices=v0, faces=mesh.faces, process=False)
    out.visual = trimesh.visual.ColorVisuals(out, vertex_colors=rgba)
    out.export(path, include_normals=True)

    wells = []
    for b in blobs:
        pts = v0[b["sel"]]
        c = pts.mean(axis=0)
        wells.append({
            "center": [round(float(x), 1) for x in c],
            "radius": round(float(np.sqrt(((pts - c) ** 2).sum(axis=1)).max()), 1),
            "depth_mm": round(b["depth"], 1),
            "label": b["name"],
        })
    return {
        "relief_area_pct": round(float((well_w > 0.5).mean() * 100), 2),
        "pad_area_pct": round(float((pad_w > 0.5).mean() * 100), 2),
        "wells": wells,
        "highlight": "v2",   # COLOR_0 = (well signed dist, bowl depth, pad signed dist)
    }


def main(only: list[str]):
    cat = json.loads(CATALOG.read_text())
    done = 0
    for entry in cat:
        po = entry["po"]
        if only and not any(o in po for o in only):
            continue
        offloads = offloads_for(entry)
        wells = [o for o in offloads if o in WELL_TYPES]
        if not wells:
            for m in entry["models"].values():
                m.pop("wells", None)
                m.pop("well_focus", None)
                m.pop("highlight", None)
            continue
        for side, m in entry["models"].items():
            path = ROOT / m["file"]
            if not path.exists():
                print(f"missing {path}")
                continue
            info = bake(path, offloads)
            m.pop("well_focus", None)
            m.update(info)
            desc = ", ".join(f"{w['depth_mm']}mm@({w['center'][0]},{w['center'][1]})" for w in info["wells"]) or "-"
            print(f"{po:24s} {side:5s} wells {info['relief_area_pct']:5.2f}%  pads {info['pad_area_pct']:5.2f}%  {desc}")
            done += 1
    CATALOG.write_text(json.dumps(cat, indent=1))
    print(f"baked {done} models -> {CATALOG}")


if __name__ == "__main__":
    main(sys.argv[1:])
