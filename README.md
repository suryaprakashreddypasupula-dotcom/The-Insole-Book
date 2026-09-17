# The Hike Insole Book

An interactive training book that teaches Hike Medical insole types, offloads,
and conditions using 72 real production 3D renders (37 purchase orders), plus
6 cork wedge manual add-ons reconstructed from their real print files.
Everything is local — no git, no network needed after the folder exists.

## How to open it

Double-click **Start Book.command**. It starts a tiny local web server and opens
the book in your browser. (Browsers refuse to load 3D model files straight from
disk, so the server is required — if the page ever stops loading, just
double-click the launcher again.)

## What's inside

- `index.html`, `app.js`, `content.js` — the book itself (no build tools, plain ES modules)
- `models/` — 72 GLB files baked from the real STLs: black shell, offload wells in cyan, raised pads in amber
- `catalog.json` — PO metadata (offload types, base material, sides, highlight stats)
- `sanity.html` — QA grid to eyeball highlight detection quality per model
- `tools/build_models.py` — the preprocessing pipeline (STL → colored GLB); rerun it if the STLs change:
  `"/Users/surya/Downloads/Ops Agent/.venv/bin/python" tools/build_models.py`
- `tools/insole-types.csv` — PO → offload/base/additions mapping used by the pipeline
- `tools/build_wedges.py` — rebuilds the cork wedges from `*wedge*.3mf` print files in Downloads
- `tools/build_pairs.py` — builds the animated add-on pairs (met bar, met pad, and offload
  plugs for every met head — 1st through 5th plus 2nd+3rd and 4th+5th combos):
  insole STLs from `/Users/surya/Downloads/pair-insole-stls/` + add-on STLs from
  `/Users/surya/Downloads/insole-addon-stls/` → `models/PAIR-*.glb`. The production
  "extra" files are print pucks (the part's crown on a tall support column); the script
  recovers the true seated part by subtracting the insole surface heightfield from the
  puck crown, so the piece rests exactly where production places it. The met bar and met
  pad pairs are `hidden` (lesson-only); the offload plug pairs also appear in the library
  under "Offload Met Head", where the Replay button lifts the plug off its insole.
- `vendor/`, `utils/` — three.js, vendored locally so the book works offline

## The finished-product lesson (top covers)

Chapter 2 ends with "The finished product": the real top-cover pair dressed as
the device the patient receives — colored cover, perforation pinholes, black
printed base. A swatch bar under the stage switches cover materials live.

Cover materials live in `TOP_COVERS` at the bottom of `content.js` — one line
per cover. Each entry takes a name, 1 or 2 hex colors (`layers`, top color
first; two colors = a laminated cover whose second color shows on the die-cut
edge and the underside), an optional `split` (how much of the edge the top
layer takes, as a 0–1 fraction, default 0.4), and `perforated` (true/false for
the breathable pinhole grid). The current entries are placeholders — replace
them with the real cover lineup and the swatches update automatically.

## Adding new insole STLs

1. Drop the STL files into `/Users/surya/Downloads/po-insole-stls/`.
   Filenames must look like `CPO-123456_Anything_LEFT.stl` / `..._RIGHT.stl`
   (the middle part is free text; PO number and side are what matter).
2. Add one row per PO to `tools/insole-types.csv` — this is what tells the
   pipeline which offloads to look for and highlight. List every offload in the
   `additions` column joined with ` + ` (e.g. `Met Pad + Heel Spur`).
3. Rerun the pipeline:
   `"/Users/surya/Downloads/Ops Agent/.venv/bin/python" tools/build_models.py`
4. Reload the book. New POs appear in the Library automatically, with filter
   chips created from their offload types. Check `sanity.html` if you want to
   eyeball the highlight quality first.

To rebuild only specific POs, pass them as arguments:
`... tools/build_models.py CPO-123456 CPO-123457`

## Adding new wedges

Drop the sliced `*wedge*Corkbase*.gcode.3mf` files in `/Users/surya/Downloads/`
(names like `12in_1_4_wedge_Corkbase.gcode.3mf` — length and rise are read from
the name) and run:
`"/Users/surya/Downloads/Ops Agent/.venv/bin/python" tools/build_wedges.py`

These print files contain no mesh, only printer toolpaths, so the script
replays every extrusion move into a heightfield and rebuilds the exact printed
shape from it. Duplicate sizes are skipped automatically.

## How highlights are made

Each STL's top surface is turned into a heightfield. A rolling-ball filter finds
depressions (reliefs/wells → cyan) and local raises (pads/bars → amber), and the
result is gated by the anatomical zone that each PO's prescribed offloads should
occupy (from the catalog), so plain devices stay clean black and highlights only
appear where prescription and geometry agree. Soft diabetic tops are printed
with a waffle/lattice texture, which is filled to its top envelope before
detection so texture never reads as an offload. Detected regions are then
despeckled, hole-filled and edge-feathered so each offload reads as one solid,
smooth-edged patch of color instead of scattered paint.
