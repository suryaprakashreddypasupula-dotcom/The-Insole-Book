"""Build a plain 3/4-length Hike Shell mesh from the plain full-length plate.

The only 3/4 shell PO we have (CPO-307216) carries a met bar and a met
offload, which a shell cannot have. So we take the plain full-length plate
(CPO-307228, same foot outline) and trim it along the met-line curve
measured from CPO-307216's front edge. The kept region is convex, so the
curved cut is a sequence of capped plane slices. Slicing and capping are
done in numpy (no scipy / shapely needed).

  python3 tools/make_shell.py            # writes models/HIKE-SHELL_{LEFT,RIGHT}.glb
"""
import os
import numpy as np
import trimesh

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EPS = 1e-6


def load(path):
    s = trimesh.load(path, force='scene')
    return list(s.geometry.values())[0]


def front_curve(shell):
    """Quadratic fit y = f(x) of the shell's distal edge, heel-origin frame."""
    v = shell.vertices
    heel = v[:, 1].min()
    xs = np.linspace(v[:, 0].min() + 3, v[:, 0].max() - 3, 12)
    pts = []
    for i in range(len(xs) - 1):
        sel = v[(v[:, 0] >= xs[i]) & (v[:, 0] < xs[i + 1])]
        if len(sel):
            pts.append(((xs[i] + xs[i + 1]) / 2, sel[:, 1].max() - heel))
    pts = np.array(pts)
    return np.polyfit(pts[:, 0], pts[:, 1], 2)


# ---------- numpy plane slice with cap ----------

def _lerp(p, q, dp, dq):
    t = dp / (dp - dq)
    return p + (q - p) * t


def slice_cap(verts, faces, origin, normal):
    """Keep the half-space (p - origin)·normal < 0. Cap the cut with a flat
    face whose outward normal is +normal. Returns (verts, faces)."""
    d = (verts - origin) @ normal
    keep = d < -EPS
    fk = keep[faces]
    n_in = fk.sum(axis=1)

    out_faces = [faces[n_in == 3]]
    new_verts = list(verts)
    segs = []  # (a, b) indices of cut points, oriented with the kept triangle

    def add(p):
        new_verts.append(p)
        return len(new_verts) - 1

    for f in faces[(n_in == 1) | (n_in == 2)]:
        ids = list(f)
        # rotate so pattern is [in, in, out] or [in, out, out]
        kf = [keep[i] for i in ids]
        while not (kf[0] and (not kf[2])):
            ids = ids[1:] + ids[:1]
            kf = kf[1:] + kf[:1]
        a, b, c = ids
        pa, pb, pc = verts[a], verts[b], verts[c]
        da, db, dc = d[a], d[b], d[c]
        if kf[1]:  # a,b in ; c out  -> quad a,b,bc,ca
            bc = add(_lerp(pb, pc, db, dc))
            ca = add(_lerp(pc, pa, dc, da))
            out_faces.append(np.array([[a, b, bc], [a, bc, ca]]))
            segs.append((bc, ca))
        else:      # a in ; b,c out  -> tri a,ab,ca
            ab = add(_lerp(pa, pb, da, db))
            ca = add(_lerp(pc, pa, dc, da))
            out_faces.append(np.array([[a, ab, ca]]))
            segs.append((ab, ca))

    verts = np.array(new_verts)
    faces = np.vstack([f for f in out_faces if len(f)])

    # ---- weld cut points so segments chain into loops
    cut_ids = sorted({i for s in segs for i in s})
    key = {}
    remap = {}
    for i in cut_ids:
        k = tuple(np.round(verts[i], 4))
        if k in key:
            remap[i] = key[k]
        else:
            key[k] = i
            remap[i] = i
    segs = [(remap[a], remap[b]) for a, b in segs if remap[a] != remap[b]]
    if remap:
        faces = np.vectorize(lambda i: remap.get(i, i))(faces)

    # ---- chain segments into loops (a->b direction from kept triangles)
    nxt = {}
    for a, b in segs:
        nxt.setdefault(a, []).append(b)
    used = set()
    loops = []
    for a, _ in segs:
        if a in used:
            continue
        loop = [a]
        used.add(a)
        cur = a
        while True:
            cands = [x for x in nxt.get(cur, []) if x not in used]
            if not cands:
                break
            cur = cands[0]
            loop.append(cur)
            used.add(cur)
        if len(loop) >= 3:
            loops.append(loop)

    # ---- triangulate each loop (ear clipping) in plane coords
    u = np.cross(normal, [0, 0, 1.0])
    if np.linalg.norm(u) < 1e-6:
        u = np.cross(normal, [0, 1.0, 0])
    u /= np.linalg.norm(u)
    w = np.cross(normal, u)  # u × w = normal

    cap = []
    for loop in loops:
        P = verts[loop]
        p2 = np.stack([(P - origin) @ u, (P - origin) @ w], axis=1)
        area = 0.5 * np.sum(p2[:, 0] * np.roll(p2[:, 1], -1) - np.roll(p2[:, 0], -1) * p2[:, 1])
        idx = list(range(len(loop)))
        if area < 0:
            idx.reverse()
        tris = ear_clip(p2, idx)
        cap.extend([[loop[i], loop[j], loop[k]] for i, j, k in tris])
    if cap:
        faces = np.vstack([faces, np.array(cap)])

    # drop unreferenced verts
    m = trimesh.Trimesh(verts, faces, process=False)
    m.remove_unreferenced_vertices()
    return m.vertices, m.faces


def ear_clip(p2, idx):
    """Ear clipping for a CCW simple polygon given as index list into p2."""
    def cross(o, a, b):
        return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])

    def inside(pt, a, b, c):
        return (cross(a, b, pt) >= -1e-9 and cross(b, c, pt) >= -1e-9 and cross(c, a, pt) >= -1e-9)

    idx = list(idx)
    tris = []
    guard = 0
    while len(idx) > 3 and guard < 20000:
        guard += 1
        n = len(idx)
        found = False
        for i in range(n):
            a, b, c = idx[i - 1], idx[i], idx[(i + 1) % n]
            if cross(p2[a], p2[b], p2[c]) <= 1e-9:
                continue  # reflex or degenerate
            ok = True
            for j in idx:
                if j in (a, b, c):
                    continue
                if inside(p2[j], p2[a], p2[b], p2[c]):
                    ok = False
                    break
            if ok:
                tris.append((a, b, c))
                del idx[i]
                found = True
                break
        if not found:
            # fallback: clip the first convex-ish vertex anyway
            a, b, c = idx[-1], idx[0], idx[1]
            tris.append((a, b, c))
            del idx[0]
    if len(idx) == 3:
        tris.append(tuple(idx))
    return tris


def trim(plate, coef, n_planes=9):
    verts = np.array(plate.vertices, dtype=float)
    faces = np.array(plate.faces)
    heel = verts[:, 1].min()
    a, b, c = coef
    for xi in np.linspace(verts[:, 0].min() + 4, verts[:, 0].max() - 4, n_planes):
        fx = a * xi * xi + b * xi + c
        dfx = 2 * a * xi + b
        # tangent line y = fx + dfx (x - xi); remove the side above it.
        normal = np.array([-dfx, 1.0, 0.0])
        normal /= np.linalg.norm(normal)
        origin = np.array([xi, heel + fx, 0.0])
        verts, faces = slice_cap(verts, faces, origin, normal)
    m = trimesh.Trimesh(verts, faces, process=True)
    return m


def main():
    for side in ('LEFT', 'RIGHT'):
        shell = load(os.path.join(ROOT, 'models', f'CPO-307216_{side}.glb'))
        plate = load(os.path.join(ROOT, 'models', f'CPO-307228_{side}.glb'))
        coef = front_curve(shell)
        out = trim(plate, coef)
        # centre in plan like every other catalog mesh (z stays on the bed)
        c = out.bounds.mean(axis=0)
        out.apply_translation([-c[0], -c[1], 0.0])
        # winding is inherited from the source plate and caps are built CCW
        # about the outward normal, so no fix_normals (needs scipy) required
        out.visual = trimesh.visual.ColorVisuals(
            out, vertex_colors=np.tile([23, 24, 28, 255], (len(out.vertices), 1)))
        dst = os.path.join(ROOT, 'models', f'HIKE-SHELL_{side}.glb')
        trimesh.Scene({f'HIKE-SHELL_{side}': out}).export(dst)
        print(side, 'faces', len(out.faces), 'extents', out.extents.round(1),
              'watertight', out.is_watertight, '->', dst)


if __name__ == '__main__':
    main()
