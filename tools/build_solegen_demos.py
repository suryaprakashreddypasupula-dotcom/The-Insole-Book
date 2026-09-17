#!/usr/bin/env python3
"""Colorize SoleGen demo STLs with the book palette and register SG-* catalog entries.

Geometry comes from SoleGen's HIKE-149491 generate. Colors match the rest of
the book: graphite shell, amber raises, cyan reliefs — never SoleGen blue/purple.
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

import numpy as np
import trimesh

sys.path.insert(0, str(Path(__file__).resolve().parent))
from build_models import (  # noqa: E402
    CATALOG,
    OUT,
    colorize,
    highlight_focus,
    simplify,
)

SRC = Path(__file__).resolve().parents[1] / "demo-stls"

# Identical 1,094,284-byte bodies: add-on lived in manifest.addons, not the mesh.
SKIP = {
    "custom_offload.stl",
    "drillandfill_met.stl",
    "heel_cut.stl",
    "heelpad.stl",
    "med_cuneiform_offload.stl",
    "mt1_base_offload.stl",
    "mt5_base_offload.stl",
    "navicular_offload.stl",
    "pt_groove_offload.stl",
}

# stem -> (catalog PO, offload names for colorize, label)
META = {
    "arch_pad": ("SG-ARCH-PAD", ["Arch Pad"], "Arch pad"),
    "arch_reinforcement": ("SG-ARCH-REINFORCEMENT", ["Arch Reinforcement"], "Arch reinforcement"),
    "cuboid_pad": ("SG-CUBOID-PAD", ["Cuboid Raise"], "Cuboid pad"),
    "dancerspad": ("SG-DANCERSPAD", ["Dancer Pad"], "Dancer's pad"),
    "forefoot_posting": ("SG-FOREFOOT-POSTING", ["Wedges"], "Forefoot posting"),
    "gait_plate": ("SG-GAIT-PLATE", [], "Gait plate"),
    "heel_fill": ("SG-HEEL-FILL", ["Heel Pad"], "Heel fill"),
    "heel_offload": ("SG-HEEL-OFFLOAD", ["Heel Spur"], "Heel offload"),
    "heel_post_flat": ("SG-HEEL-POST-FLAT", [], "Heel post · Flat"),
    "heel_post_oval": ("SG-HEEL-POST-OVAL", [], "Heel post · Oval"),
    "heel_post_stabilizer": ("SG-HEEL-POST-STABILIZER", [], "Heel post · Stabilizer"),
    "heel_post_u": ("SG-HEEL-POST-U", [], "Heel post · U"),
    "heel_skive": ("SG-HEEL-SKIVE", [], "Kirby Skive"),
    "kinetic_wedge": ("SG-KINETIC-WEDGE", ["Dancer Pad"], "Dannenburg / kinetic wedge"),
    "lateral_flange": ("SG-LATERAL-FLANGE", [], "Lateral flange"),
    "medial_flange": ("SG-MEDIAL-FLANGE", [], "Medial flange"),
    "metbar": ("SG-METBAR", ["Met Bar"], "Met bar"),
    "metpad": ("SG-METPAD", ["Met Pad"], "Met pad"),
    "mortons_extension": ("SG-MORTONS-EXTENSION", ["Morton Extension"], "Morton extension"),
    "neuroma_pad": ("SG-NEUROMA-PAD", ["Met Pad"], "Neuroma pad"),
    "offload": ("SG-OFFLOAD", ["Offload Met Head"], "Offload met head"),
    "ray1_cutout": ("SG-RAY1-CUTOUT", [], "1st ray cutout"),
    "ray5_cutout": ("SG-RAY5-CUTOUT", [], "5th ray cutout"),
    "rearfoot_posting": ("SG-REARFOOT-POSTING", ["Wedges"], "Rearfoot posting"),
    "reinforcement_arch": ("SG-REINFORCEMENT-ARCH", ["Arch Reinforcement"], "Reinforcement · Arch"),
    "reinforcement_grid": ("SG-REINFORCEMENT-GRID", ["Arch Reinforcement"], "Reinforcement · Isogrid"),
    "reinforcement_radial": ("SG-REINFORCEMENT-RADIAL", ["Arch Reinforcement"], "Reinforcement · Radial"),
    "reinforcement_ribbed": ("SG-REINFORCEMENT-RIBBED", ["Arch Reinforcement"], "Reinforcement · Ribbed"),
    "reverse_mortons_extension": (
        "SG-REVERSE-MORTONS-EXTENSION",
        ["Reverse Morton Extension"],
        "Reverse Morton",
    ),
    "reversedancerspad": ("SG-REVERSEDANCERSPAD", ["Dancer Pad"], "Reverse dancer's pad"),
    "sensory_bumps": ("SG-SENSORY-BUMPS", ["Met Pad", "Heel Pad"], "Sensory bumps"),
    "shell_lateral_flange": ("SG-SHELL-LATERAL-FLANGE", [], "Shell lateral flange"),
    "shell_medial_flange": ("SG-SHELL-MEDIAL-FLANGE", [], "Shell medial flange"),
    "thickness_boost": ("SG-THICKNESS-BOOST", [], "Thickness boost"),
    "toe_crest": ("SG-TOE-CREST", ["Toe Crest"], "Toe crest"),
    "wedge_lateral": ("SG-WEDGE-LATERAL", ["Wedges"], "Printed lateral wedge"),
    "wedge_medial": ("SG-WEDGE-MEDIAL", ["Wedges"], "Printed medial wedge"),
}


def convert(path: Path, po: str, offloads: list[str]) -> dict:
    mesh = trimesh.load(path)
    mesh = simplify(mesh)
    v = np.asarray(mesh.vertices)
    offset = np.array(
        [
            (v[:, 0].min() + v[:, 0].max()) / 2,
            (v[:, 1].min() + v[:, 1].max()) / 2,
            v[:, 2].min(),
        ]
    )
    mesh.apply_translation(-offset)
    v = np.asarray(mesh.vertices)
    rgba, relief_w, pad_w = colorize(v, offloads, np.asarray(mesh.vertex_normals))
    mesh.visual = trimesh.visual.ColorVisuals(mesh, vertex_colors=rgba)
    out_name = f"{po}_LEFT.glb"
    mesh.export(OUT / out_name, include_normals=True)
    return {
        "file": f"models/{out_name}",
        "faces": int(len(mesh.faces)),
        "extents": [round(float(x), 1) for x in mesh.extents],
        "relief_focus": highlight_focus(v, relief_w),
        "pad_focus": highlight_focus(v, pad_w),
        "relief_area_pct": round(float((relief_w > 0.4).mean() * 100), 2),
        "pad_area_pct": round(float((pad_w > 0.4).mean() * 100), 2),
    }


def main(only: list[str] | None = None) -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    existing = {}
    if CATALOG.exists():
        existing = {e["po"]: e for e in json.loads(CATALOG.read_text())}
    rebuilt = 0
    for path in sorted(SRC.glob("*.stl")):
        if path.name in SKIP:
            continue
        stem = path.stem
        if stem not in META:
            print("skip unknown", path.name)
            continue
        if only and not any(o in stem or o in META[stem][0] for o in only):
            continue
        po, offloads, label = META[stem]
        print(f"{po}  {path.name}")
        side = convert(path, po, offloads)
        existing[po] = {
            "po": po,
            "categories": offloads or ["SoleGen add-on"],
            "orthotic_type": "SoleGen demo",
            "base": "",
            "top_cover": "",
            "additions": label,
            "label": label,
            "hidden": True,
            "models": {"LEFT": side},
        }
        rebuilt += 1
        print(
            f"    -> {side['file']}  relief {side['relief_area_pct']}%"
            f"  pad {side['pad_area_pct']}%"
        )
    CATALOG.write_text(json.dumps(sorted(existing.values(), key=lambda e: e["po"]), indent=1))
    print(f"catalog -> {CATALOG}  ({rebuilt} SG demos, {len(existing)} total entries)")


if __name__ == "__main__":
    main(sys.argv[1:] or None)
