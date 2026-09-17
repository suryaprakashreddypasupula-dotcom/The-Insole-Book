/* ============================================================
   The Hike Insole Book — viewer + navigation
   Real PO GLB renders, spring-eased camera flights, synced
   compare mode, lesson stepper, glossary, floor quiz.
   ============================================================ */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CHAPTERS, GLOSSARY } from './content.js?v=offload3';
import { initQuiz, openQuiz, quizBlocksKeys } from './quiz.js?v=offload3';

const catalog = await (await fetch('./catalog.json')).json();
const byPO = Object.fromEntries(catalog.map(e => [e.po, e]));
const loader = new GLTFLoader();
const modelCache = new Map();
const coverCache = new Map();   // top-cover variant GLBs, keyed by file path

/* ---------- glossary markup ---------- */
function renderText(t) {
  return t.replace(/\{\{(.+?)\}\}/g, (_, term) => {
    const def = GLOSSARY[term] || '';
    return `<button class="gloss" data-def="${def.replace(/"/g, '&quot;')}">${term}</button>`;
  });
}

/* ---------- model loading & orientation ---------- */
function orientFlat(group) {
  // thinnest bbox axis is the insole's up; rotate it to +Y
  const box = new THREE.Box3().setFromObject(group);
  const s = box.getSize(new THREE.Vector3());
  const dims = [['x', s.x], ['y', s.y], ['z', s.z]].sort((a, b) => a[1] - b[1]);
  if (dims[0][0] === 'z') group.rotation.x = -Math.PI / 2;
  else if (dims[0][0] === 'x') group.rotation.z = Math.PI / 2;
  group.updateMatrixWorld(true);
  // heel toward -Z on screen space: length axis is the longest horizontal
  const b2 = new THREE.Box3().setFromObject(group);
  const c2 = b2.getCenter(new THREE.Vector3());
  group.position.sub(c2);           // center at origin
  group.updateMatrixWorld(true);
}

function prepMeshes(scene, isAddon = false) {
  scene.traverse(o => {
    if (o.isMesh) {
      if (!o.geometry.attributes.normal) o.geometry.computeVertexNormals();
      o.material = new THREE.MeshStandardMaterial(
        isAddon
          ? { vertexColors: true, roughness: 0.48, metalness: 0.04, color: 0xffffff }
          : { vertexColors: false, roughness: 0.48, metalness: 0.08, color: 0x4a4a50 }
      );
      o.castShadow = true;
      // thin add-on parts self-shadow into speckle ("shadow acne") — they
      // cast onto the insole but don't receive
      o.receiveShadow = !isAddon;
    }
  });
}

async function loadModel(po, side) {
  const key = `${po}_${side}`;
  if (modelCache.has(key)) return modelCache.get(key).clone(true);
  const entry = byPO[po];
  const model = entry?.models?.[side] || entry?.models?.[Object.keys(entry.models)[0]];
  const g = await loader.loadAsync('./' + model.file);
  prepMeshes(g.scene);
  const group = new THREE.Group();
  group.add(g.scene);
  // animation pairs ship a second GLB: the physical add-on part, seated in
  // the same coordinate frame as its insole. Same group = same orientation.
  if (model.addon) {
    const a = await loader.loadAsync('./' + model.addon);
    prepMeshes(a.scene, true);
    a.scene.userData.isAddon = true;
    // "lift": raises lift off & reseat. "press": soft fills compress under
    // load. "flip": the device flips over and the part glues onto the base.
    a.scene.userData.motion = entry.motion || 'lift';
    group.add(a.scene);
  }
  orientFlat(group);
  modelCache.set(key, group);
  return group.clone(true);
}

/* ---------- viewer ---------- */
class Stage {
  constructor(canvas) {
    this.canvas = canvas;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(32, 1, 1, 5000);
    this.camera.position.set(0, 340, 260);

    this.scene.add(new THREE.HemisphereLight(0xffffff, 0x9298a5, 1.35));
    const key = new THREE.DirectionalLight(0xffffff, 2.1);
    key.position.set(160, 420, 240);
    key.castShadow = true;
    key.shadow.mapSize.set(4096, 4096);
    Object.assign(key.shadow.camera, { left: -320, right: 320, top: 320, bottom: -320, far: 1400 });
    key.shadow.bias = -0.0004;
    key.shadow.radius = 6;               // soft penumbra hides map aliasing
    this.scene.add(key);
    const fill = new THREE.DirectionalLight(0xdfe6ff, 0.55);
    fill.position.set(-260, 180, -160);
    this.scene.add(fill);

    const ground = new THREE.Mesh(
      new THREE.CircleGeometry(2200, 64),
      new THREE.ShadowMaterial({ opacity: 0.16 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -14;
    ground.receiveShadow = true;
    this.scene.add(ground);

    this.holder = new THREE.Group();
    this.scene.add(this.holder);

    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.06;
    this.controls.enablePan = false;
    this.controls.minDistance = 90;
    this.controls.maxDistance = 900;
    this.controls.maxPolarAngle = Math.PI * 0.62;

    this.flight = null;          // {p0,p1,t0,t1,start,dur}
    this.filmLock = false;       // product-film mode: camera is a loop, not a widget
    this.filmRegion = 'overview';
    this.flipT = 0;              // 0 = upright, 1 = flipped over
    this.timeline = [];          // queued flip/sep tweens for flip pairs
    this.flipGroups = [];
    this.labels = [];            // {el, anchor:Vector3}
    this.addonOpacity = 1;       // 1 = teaching color on, 0 = production insole
    this.addonFade = null;
    this._concealAfter = null;
    this._resize();
    addEventListener('resize', () => this._resize());
    this._ro = new ResizeObserver(() => this._resize());
    this._ro.observe(this.canvas);
    if (this.canvas.parentElement) this._ro.observe(this.canvas.parentElement);
    this._tick = this._tick.bind(this);
    requestAnimationFrame(this._tick);
  }

  _resize() {
    const wrap = this.canvas.parentElement;
    const w = Math.round(this.canvas.clientWidth || wrap?.clientWidth || 0);
    const h = Math.round(this.canvas.clientHeight || wrap?.clientHeight || 0);
    if (w < 8 || h < 8) return;
    const pr = this.renderer.getPixelRatio();
    if (this.canvas.width === Math.round(w * pr) && this.canvas.height === Math.round(h * pr)
        && Math.abs(this.camera.aspect - w / h) < 0.001) return;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  /* ---- product film: every device from the intro in ONE scene ----
     All groups load once and sit at the origin. Only one is visible; the
     next slides in from the right as the current slides out left, both
     fading, so there is never a reload or a hard cut. Materials are cloned
     so the plain-black paint never leaks into the cached models other
     lessons use. */
  async showFilm(specs, coverVariant) {
    const last = specs[specs.length - 1];
    await this.show([{ po: last.po, side: last.side }]);
    if (coverVariant && this.addons?.length) await this.swapCover(coverVariant, true);
    const main = this.holder.children[0];
    const others = await Promise.all(specs.slice(0, -1).map(s => loadModel(s.po, s.side)));
    this.filmSlide = 170;
    this.filmGroups = [];
    for (const g of others) {
      this.holder.add(g);
      this.filmGroups.push({ g, home: g.position.clone() });
    }
    this.filmGroups.push({ g: main, home: main.position.clone() });
    const bounds = new THREE.Box3();
    for (const f of this.filmGroups) {
      f.meshes = [];
      f.g.traverse(o => {
        if (!o.isMesh || !o.material) return;
        o.material = o.material.clone();
        let addon = false;
        for (let p = o; p && p !== this.holder; p = p.parent) {
          if (p.userData?.isAddon) { addon = true; break; }
        }
        if (!addon) {
          // graphite production shell — reads as black, bright enough to show form
          o.material.vertexColors = false;
          o.material.color.set(0x4a4a50);
          o.material.roughness = 0.48;
          o.material.metalness = 0.08;
          o.material.needsUpdate = true;
        }
        f.meshes.push(o);
      });
      f.g.updateMatrixWorld(true);
      bounds.union(new THREE.Box3().setFromObject(f.g));
    }
    bounds.max.y += 70;
    this.bounds = bounds;
    this.filmAnim = null;
    this.filmJump(this.filmGroups.length - 1);
  }

  _setGroupFade(f, v) {
    f.g.visible = v > 0.01;
    for (const m of f.meshes) {
      m.material.transparent = v < 0.999;
      m.material.opacity = v;
      m.material.depthWrite = v > 0.5;
      m.castShadow = v > 0.35;
    }
  }

  filmJump(i) {
    if (!this.filmGroups?.length) return;
    this.filmAnim = null;
    this.filmIndex = i;
    this.filmGroups.forEach((f, k) => {
      f.g.position.x = f.home.x;
      this._setGroupFade(f, k === i ? 1 : 0);
    });
  }

  filmGo(i, dur = 1900) {
    if (!this.filmGroups?.length || i === this.filmIndex) return;
    if (this.filmAnim) this._tickFilm(performance.now(), true);
    this.filmAnim = { from: this.filmIndex, to: i, start: performance.now(), dur };
    this.filmIndex = i;
  }

  _tickFilm(now, finish = false) {
    const a = this.filmAnim;
    if (!a) return;
    const u = finish ? 1 : Math.min(1, (now - a.start) / a.dur);
    const smooth = t => t * t * t * (t * (t * 6 - 15) + 10);
    const e = smooth(u);
    const out = this.filmGroups[a.from];
    const inn = this.filmGroups[a.to];
    out.g.position.x = out.home.x - this.filmSlide * e;
    inn.g.position.x = inn.home.x + this.filmSlide * (1 - e);
    this._setGroupFade(out, 1 - smooth(Math.min(1, u / 0.7)));
    this._setGroupFade(inn, smooth(Math.max(0, (u - 0.3) / 0.7)));
    if (u >= 1) {
      out.g.position.x = out.home.x;
      inn.g.position.x = inn.home.x;
      this._setGroupFade(out, 0);
      this._setGroupFade(inn, 1);
      this.filmAnim = null;
    }
  }

  async show(specs) {
    // specs: [{po, side, label?}] — one or two models
    this.holder.clear();
    this.holder.rotation.z = 0;
    this.underside = false;
    this.labels.forEach(l => l.el.remove());
    this.labels = [];
    this.addon = false;
    this.addons = [];
    this.sepAnim = null;
    this.sepOffset = 0;
    this.sepMode = 'seated';
    this.addonOpacity = 1;
    this.addonFade = null;
    this._concealAfter = null;
    this.filmGroups = [];
    this.filmAnim = null;
    const groups = await Promise.all(specs.map(s => loadModel(s.po, s.side)));
    const boxes = groups.map(g => new THREE.Box3().setFromObject(g));
    const widths = boxes.map(b => b.getSize(new THREE.Vector3()).x);
    const gap = 46;
    const total = widths.reduce((a, b) => a + b, 0) + gap * (groups.length - 1);
    let x = -total / 2;
    groups.forEach((g, i) => {
      g.position.x += x + widths[i] / 2;
      x += widths[i] + gap;
      this.holder.add(g);
      if (specs[i].label) {
        const el = document.createElement('div');
        el.className = 'stage-label';
        el.textContent = specs[i].label;
        this.canvas.parentElement.appendChild(el);
        const b = new THREE.Box3().setFromObject(g);
        this.labels.push({ el, anchor: new THREE.Vector3(g.position.x, b.min.y - 4, b.max.z + 18) });
      }
    });
    this._prepAddons();
    // flip pairs roll the whole device over around its length axis; each
    // group pivots about its own bounding-box center so it stays in place
    this.flipT = 0;
    this.timeline = [];
    this.flipGroups = this.motion === 'flip'
      ? groups.map(g => {
          const box = new THREE.Box3().setFromObject(g);
          return {
            g,
            home: g.position.clone(),
            homeQuat: g.quaternion.clone(),
            center: box.getCenter(new THREE.Vector3()),
          };
        })
      : [];
    this.bounds = new THREE.Box3().setFromObject(this.holder);
    // leave headroom in the framing for the risen add-on (flip pairs also
    // hop mid-roll and hover the part above the flipped device)
    if (this.addon) this.bounds.max.y += this.motion === 'flip' ? 80 : this.motion === 'drape' ? 70 : 40;
    this.specs = specs;
    return groups;
  }

  /* ---- add-on bookkeeping: find every seated add-on part and its local
     "up" (library view shows both feet, each with its own part). Factored
     out of show() so swapCover() can re-run it after replacing a part. */
  _prepAddons() {
    const addonObjs = [];
    this.holder.traverse(o => { if (o.userData.isAddon) addonObjs.push(o); });
    this.addons = addonObjs.map(obj => {
      const motion = obj.userData.motion || 'lift';
      const q = new THREE.Quaternion();
      obj.parent.getWorldQuaternion(q);
      const up = new THREE.Vector3(0, 1, 0).applyQuaternion(q.invert()).normalize();
      // press squash happens along the local axis closest to world-up
      // (models are axis-aligned after orientFlat, so this is exact)
      const comps = [Math.abs(up.x), Math.abs(up.y), Math.abs(up.z)];
      const axis = comps.indexOf(Math.max(...comps));
      const sign = Math.sign(up.getComponent(axis)) || 1;
      // part's underside coordinate along that axis, in obj-local space —
      // the squash is anchored there so the base never moves
      obj.updateWorldMatrix(true, true);
      const invWorld = obj.matrixWorld.clone().invert();
      const box = new THREE.Box3();
      obj.traverse(m => {
        if (m.isMesh) {
          if (!m.geometry.boundingBox) m.geometry.computeBoundingBox();
          box.union(m.geometry.boundingBox.clone()
            .applyMatrix4(invWorld.clone().multiply(m.matrixWorld)));
        }
      });
      const base = sign > 0 ? box.min.getComponent(axis) : box.max.getComponent(axis);
      const entry = { obj, up, axis, base, home: obj.position.clone(), homeQuat: obj.quaternion.clone(), motion };
      if (motion === 'drape') {
        // top covers lay down heel-first: find the long (foot) axis and the
        // heel end (the narrower end), build a hinge there
        const pts = [];
        obj.traverse(m => {
          if (m.isMesh) {
            const rel = invWorld.clone().multiply(m.matrixWorld);
            const pos = m.geometry.attributes.position;
            const stride = Math.max(1, Math.floor(pos.count / 4000));
            for (let i = 0; i < pos.count; i += stride) {
              pts.push(new THREE.Vector3().fromBufferAttribute(pos, i).applyMatrix4(rel));
            }
          }
        });
        const horiz = [0, 1, 2].filter(k => k !== axis);
        const size = box.getSize(new THREE.Vector3());
        const longIdx = size.getComponent(horiz[0]) >= size.getComponent(horiz[1]) ? horiz[0] : horiz[1];
        const latIdx = longIdx === horiz[0] ? horiz[1] : horiz[0];
        const ts = pts.map(p => p.getComponent(longIdx));
        const tmin = Math.min(...ts), tmax = Math.max(...ts), tr = tmax - tmin;
        const widthAt = lo => {
          const w = pts.filter(p => lo
            ? p.getComponent(longIdx) < tmin + 0.22 * tr
            : p.getComponent(longIdx) > tmax - 0.22 * tr)
            .map(p => p.getComponent(latIdx));
          return Math.max(...w) - Math.min(...w);
        };
        const heelLo = widthAt(true) < widthAt(false);
        const toeSign = heelLo ? 1 : -1;
        const pivot = new THREE.Vector3();
        pivot.setComponent(longIdx, (heelLo ? tmin : tmax) + toeSign * 2);
        pivot.setComponent(latIdx, (box.min.getComponent(latIdx) + box.max.getComponent(latIdx)) / 2);
        pivot.setComponent(axis, box.min.getComponent(axis));
        const longDir = new THREE.Vector3();
        longDir.setComponent(longIdx, toeSign);
        const upVec = new THREE.Vector3();
        upVec.setComponent(axis, sign);
        // rotating by +angle about (longDir x up) lifts the toe end
        const tiltAxis = longDir.clone().cross(upVec).normalize();
        entry.drape = {
          pivot: entry.home.clone().add(pivot.applyQuaternion(entry.homeQuat)),
          axis: tiltAxis.applyQuaternion(entry.homeQuat).normalize(),
          maxAng: 0.14,
        };
      }
      return entry;
    });
    this.addon = this.addons.length > 0;
    this.motion = this.addons[0]?.motion || 'lift';
  }

  /* ---- top-cover swap: lift the current cover off, replace the mesh with
     the chosen variant's true-thickness GLB, lay the new one down. All
     variants ship in the same coordinate frame as the insole, so the new
     part drops into the exact seat of the old one. ---- */
  async swapCover(variant, instant = false) {
    if (!this.addons?.length || this._swapping) return false;
    this._swapping = true;
    try {
      if (!instant && this.sepMode !== 'separated') {
        this.setSeparation('separated');
        await new Promise(r => setTimeout(r, 1250));
      }
      let src = coverCache.get(variant.addon);
      if (!src) {
        const g = await loader.loadAsync('./' + variant.addon);
        src = g.scene;
        coverCache.set(variant.addon, src);
      }
      for (const a of this.addons) {
        const fresh = src.clone(true);
        prepMeshes(fresh, true);
        fresh.userData.isAddon = true;
        fresh.userData.motion = 'drape';
        const parent = a.obj.parent;
        parent.remove(a.obj);
        parent.add(fresh);
      }
      this._prepAddons();
      // the new part enters already airborne, then drapes down heel-first
      this.sepMode = 'separated';
      this.sepOffset = 46;
      this._applySeparation(performance.now());
      this.setSeparation('seated', instant);
      return true;
    } finally {
      this._swapping = false;
    }
  }

  /* ---- training mode: user-manual callouts ----
     Like the labeled diagram on a product manual: one pill per layer on a
     right-hand rail, each with a thin leader line ending in a dot ON the
     exact layer it names at the forefoot edge. The pills and their numbers
     never change with the view; only the leader lines re-route each frame
     so the dots stay glued to the part as it rotates. Nothing covers the
     model. ---- */
  setTraining(on) {
    this.training = on;
    const wrap = document.getElementById('callouts');
    const svg = document.getElementById('trainArrow');
    if (on) {
      this._loupeY = null;               // re-find the forefoot surface height
      buildCallouts();
      wrap.hidden = false;
      svg.removeAttribute('hidden');     // SVG: .hidden isn't wired like HTML
      requestAnimationFrame(() => wrap.classList.add('show'));
      this.flyTo('forefootEdge', 1500);
    } else {
      wrap.classList.remove('show');
      svg.setAttribute('hidden', '');
      setTimeout(() => { if (!this.training) wrap.hidden = true; }, 450);
    }
  }

  _updateTraining() {
    const cos = this._callouts;
    if (!cos?.length || !this.addons?.length) return;
    // anchor column: the forefoot rim of the seated cover (toe at min z).
    // The cover's bounding box spans the tall heel cup, so its midline is
    // far above the low forefoot — find the true surface height there by
    // raycasting straight down onto the cover (throttled; only while the
    // part is seated, so a mid-swap cover doesn't drag the dots around).
    const ab = new THREE.Box3().setFromObject(this.addons[0].obj);
    const s = ab.getSize(new THREE.Vector3());
    const axp = ab.max.x - s.x * 0.07;
    const azp = ab.min.z + s.z * 0.30;
    this._loupeFrame = (this._loupeFrame || 0) + 1;
    if (this._loupeY == null || (this._loupeFrame % 30 === 0 && this.sepMode === 'seated')) {
      const rc = new THREE.Raycaster(
        new THREE.Vector3(axp, ab.max.y + 20, azp), new THREE.Vector3(0, -1, 0));
      const hits = rc.intersectObject(this.addons[0].obj, true);
      if (hits.length) this._loupeY = hits[0].point.y;
    }
    const topY = this._loupeY ?? ab.min.y + 4;
    const w = this.canvas.clientWidth, h = this.canvas.clientHeight;
    // pass 1: stack the pills on the right rail, project each dot
    let railY = Math.max(86, h * 0.15);
    const wired = [];
    for (const c of cos) {
      c.el.style.top = `${railY}px`;
      const pillL = w - 26 - c.el.offsetWidth;
      const pillC = railY + c.el.offsetHeight / 2;
      railY += c.el.offsetHeight + 14;
      if (c.depth == null) continue;               // total pill: no leader
      const p = new THREE.Vector3(axp, topY - c.depth, azp).project(this.camera);
      wired.push({ c, pillL, pillC, ax: (p.x * 0.5 + 0.5) * w, ay: (-p.y * 0.5 + 0.5) * h });
    }
    // pass 2: thin layers project millimeters apart — spread the dots to a
    // readable minimum gap, the way a printed manual fans its pointers
    for (let i = 1; i < wired.length; i++) {
      wired[i].ay = Math.max(wired[i].ay, wired[i - 1].ay + 10);
    }
    for (const d of wired) {
      d.c.path.setAttribute('d',
        `M ${(d.pillL - 2).toFixed(1)} ${d.pillC.toFixed(1)} H ${(d.pillL - 30).toFixed(1)} L ${d.ax.toFixed(1)} ${d.ay.toFixed(1)}`);
      d.c.dot.setAttribute('cx', d.ax.toFixed(1));
      d.c.dot.setAttribute('cy', d.ay.toFixed(1));
    }
  }

  /* ---- teaching color vs finished insole ----
     Lift/press parts are painted so the move reads. Production is one black
     shell, so after a part rises and seats we fade the colored mesh away
     and leave the insole as it ships. Covers and wedges stay — they ARE
     the finished surface. */
  _isHighlightAddon() {
    return this.motion === 'lift' || this.motion === 'press';
  }

  _setAddonOpacity(v) {
    this.addonOpacity = v;
    for (const a of this.addons) {
      a.obj.traverse(o => {
        if (!o.isMesh || !o.material) return;
        const m = o.material;
        m.transparent = v < 0.999;
        m.opacity = v;
        m.depthWrite = v > 0.85;
        o.castShadow = v > 0.25;
        o.visible = v > 0.02;
      });
    }
  }

  revealAddons(instant = true) {
    if (!this._isHighlightAddon()) return;
    this._concealAfter = null;
    if (instant || this.addonOpacity > 0.98) {
      this.addonFade = null;
      this._setAddonOpacity(1);
      return;
    }
    this.addonFade = { from: this.addonOpacity, to: 1, start: performance.now(), dur: 280 };
  }

  concealAddons(instant = false) {
    if (!this._isHighlightAddon()) return;
    this._concealAfter = null;
    if (instant) {
      this.addonFade = null;
      this._setAddonOpacity(0);
      return;
    }
    this.addonFade = { from: this.addonOpacity, to: 0, start: performance.now(), dur: 720 };
  }

  _tickAddonFade(now) {
    if (this._concealAfter && now >= this._concealAfter) {
      this._concealAfter = null;
      this.concealAddons(false);
    }
    if (!this.addonFade) return;
    const a = this.addonFade;
    const u = Math.min(1, (now - a.start) / a.dur);
    const s = u * u * (3 - 2 * u);
    this._setAddonOpacity(a.from + (a.to - a.from) * s);
    if (u >= 1) this.addonFade = null;
  }

  /* ---- add-on separation: lift off / reseat with spring easing ---- */
  setFilmLock(on) {
    this.filmLock = !!on;
    if (on) this.controls.enabled = false;
    else if (!this.flight) this.controls.enabled = true;
  }

  setSeparation(mode, instant = false, dur) {
    if (!this.addon) return;
    if (this.motion === 'flip') {
      // flip pairs use richer states: seated (upright device), flipped
      // (upside down, part attached) and apart (upside down, part hovering)
      this._setFlip(mode === 'separated' ? 'apart' : mode, instant);
      return;
    }
    this._concealAfter = null;
    if (mode === 'separated') this.revealAddons(true);
    const LIFT = 46;
    const to = mode === 'separated' ? LIFT : 0;
    this.sepMode = mode;
    if (instant) {
      this.sepAnim = null;
      this.sepOffset = to;
      this._applySeparation(performance.now());
      return;
    }
    const press = this.motion === 'press';
    this.sepAnim = {
      from: this.sepOffset, to,
      start: performance.now(),
      dur: dur ?? (mode === 'separated' ? (press ? 1100 : 1600) : 1250),
      // lift decelerates like the camera; press ramps in like a foot loading;
      // the return lands with a barely-there overshoot (~2% of travel) so it
      // reads as "click into place" (lift) or "spring back" (press)
      ease: mode === 'separated'
        ? (press ? u => u * u * (3 - 2 * u) : u => 1 - Math.pow(1 - u, 3.2))
        : u => 1 + 2.3 * Math.pow(u - 1, 3) + 1.3 * Math.pow(u - 1, 2),
    };
  }

  /* ---- flip choreography: roll over -> glue the part on -> roll back ----
     Transitions are queued so every path plays in a sensible order:
     attach (part down) first, then roll, then lift (part up). */
  _setFlip(target, instant = false) {
    const LIFT = 44;
    const wantFlip = target === 'seated' ? 0 : 1;
    const wantSep = target === 'apart' ? LIFT : 0;
    this.sepMode = target;
    if (instant) {
      this.timeline = [];
      this.sepAnim = null;
      this.flipT = wantFlip;
      this.sepOffset = wantSep;
      this._applyFlip();
      this._applySeparation(performance.now());
      return;
    }
    const smooth = u => u * u * u * (u * (u * 6 - 15) + 10);   // smootherstep
    const land = u => 1 + 2.3 * Math.pow(u - 1, 3) + 1.3 * Math.pow(u - 1, 2);
    const rise = u => 1 - Math.pow(1 - u, 3.2);
    const tl = [];
    if (wantSep < this.sepOffset) tl.push({ prop: 'sep', to: wantSep, dur: 1350, ease: land });
    if (wantFlip !== this.flipT) tl.push({ prop: 'flip', to: wantFlip, dur: 1750, ease: smooth });
    if (wantSep > this.sepOffset) tl.push({ prop: 'sep', to: wantSep, dur: 1150, ease: rise });
    this.timeline = tl;
  }

  _processTimeline(now) {
    if (!this.timeline.length) return;
    const t = this.timeline[0];
    if (t.start === undefined) {
      t.start = now;
      t.from = t.prop === 'flip' ? this.flipT : this.sepOffset;
    }
    const u = Math.min(1, (now - t.start) / t.dur);
    const v = t.from + (t.to - t.from) * t.ease(u);
    if (t.prop === 'flip') this.flipT = v; else this.sepOffset = v;
    if (u >= 1) {
      if (t.prop === 'flip') this.flipT = t.to; else this.sepOffset = t.to;
      this.timeline.shift();
    }
  }

  _applyFlip() {
    // roll each device 180 deg about its length axis (world z) through its
    // own center, with a small hop mid-roll so it clears the bench
    const angle = this.flipT * Math.PI;
    const q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), angle);
    const hop = Math.sin(this.flipT * Math.PI) * 26;
    for (const f of this.flipGroups) {
      f.g.quaternion.copy(q).multiply(f.homeQuat);
      const p = f.center.clone().add(
        f.home.clone().sub(f.center).applyQuaternion(q));
      p.y += hop;
      f.g.position.copy(p);
    }
  }

  _applySeparation(now) {
    if (!this.addon) return;
    if (this.sepAnim) {
      const a = this.sepAnim;
      const u = Math.min(1, (now - a.start) / a.dur);
      this.sepOffset = a.from + (a.to - a.from) * a.ease(u);
      if (u >= 1) {
        this.sepOffset = a.to;
        this.sepAnim = null;
      }
    } else if (this.sepMode === 'separated') {
      // idle motion so the frame never feels frozen: floating hover for
      // lifted parts, a breathing pulse for parts held under load
      this.sepOffset = this.motion === 'press'
        ? 46 + Math.sin(now * 0.0016) * 1.2
        : 46 + Math.sin(now * 0.0011) * 1.5;
    } else if (this.sepMode === 'apart' && !this.timeline.length) {
      this.sepOffset = 44 + Math.sin(now * 0.0011) * 1.5;
    }
    for (const a of this.addons) {
      if (a.motion === 'flip') {
        // the part always hovers along WORLD up, whatever the roll angle —
        // convert world up into the (rotating) parent's frame each frame
        const q = new THREE.Quaternion();
        a.obj.parent.getWorldQuaternion(q).invert();
        const dir = new THREE.Vector3(0, 1, 0).applyQuaternion(q);
        a.obj.position.copy(a.home).addScaledVector(dir, this.sepOffset);
        continue;
      }
      if (a.motion === 'drape' && a.drape) {
        // top cover: hinge at the heel. Rising, the toe end tips up and the
        // whole cover lifts; landing, the heel skims down first (the lift
        // term decays quadratically) and the tilt flattens out last —
        // exactly how a tech rolls a glued cover on without trapping air.
        const d = a.drape;
        const t = THREE.MathUtils.clamp(this.sepOffset / 46, 0, 1);
        const q = new THREE.Quaternion().setFromAxisAngle(d.axis, d.maxAng * t);
        const p = d.pivot.clone().add(a.home.clone().sub(d.pivot).applyQuaternion(q));
        p.addScaledVector(a.up, this.sepOffset * t * 0.55);
        a.obj.position.copy(p);
        a.obj.quaternion.copy(q).multiply(a.homeQuat);
        continue;
      }
      if (a.motion === 'press') {
        // vertical squash anchored at the underside: 1 -> 0.3 at full press.
        // The return ease overshoots slightly negative, giving a tiny rebound
        // bulge (>1 scale) as the soft fill springs back.
        const p = THREE.MathUtils.clamp(this.sepOffset / 46, -0.06, 1);
        const f = 1 - 0.7 * p;
        a.obj.scale.setComponent(a.axis, f);
        const pos = a.home.clone();
        pos.setComponent(a.axis, a.home.getComponent(a.axis) + a.base * (1 - f));
        a.obj.position.copy(pos);
      } else {
        a.obj.position.copy(a.home).addScaledVector(a.up, this.sepOffset);
      }
    }
  }

  regionTarget(region) {
    // named region -> {target, distance, elevation, azimuth}
    // Rule: the WHOLE insole always fits in frame. Region views change the
    // ANGLE and lean the framing toward the region — they never zoom past
    // the point where part of the device leaves the frame.
    const b = this.bounds ?? new THREE.Box3(new THREE.Vector3(-80, 0, -140), new THREE.Vector3(80, 30, 140));
    const size = b.getSize(new THREE.Vector3());
    const c = b.getCenter(new THREE.Vector3());
    const L = Math.max(size.x, size.z);
    const halfTan = Math.tan(this.camera.fov * Math.PI / 360);
    // conservative fit: works from any azimuth (top-down or side profile)
    const fitD = (L / (2 * halfTan)) * Math.max(1, 1 / this.camera.aspect) * 1.14;
    // side views are vertically shallow, so they can fill the frame width
    const profD = (L / (2 * halfTan * Math.max(this.camera.aspect, 1))) * 1.15;
    // insole length runs along Z after orientFlat (heel at max z, toe at min z)
    const zAt = f => b.min.z + size.z * f;
    // lean the look-at point toward a region so the camera tilts that way
    // while the full device stays visible; leaning shifts the far end of the
    // device toward the frame edge, so leaned views get extra distance
    const lean = f => new THREE.Vector3(c.x, c.y, c.z + (zAt(f) - c.z) * 0.22);
    const leanD = f => fitD * (1 + 0.30 * Math.abs(f - 0.5));
    const R = {
      overview: { t: c,          d: fitD,           el: 0.72, az: 0.45 },
      profile:  { t: c,          d: profD,          el: 0.10, az: 1.35 },  // classic low side view — the arch line
      // near-ground side view leaned to the heel — where cover thickness reads
      heelProfile: { t: lean(0.74), d: profD * 1.16, el: 0.06, az: 1.35 },
      // product-film explode: high enough to see the cover sheet and the
      // printed shell as two objects, not a knife-edge silhouette
      coverSplit: { t: lean(0.58), d: profD * 1.12, el: 0.28, az: 1.08 },
      // training mode: low diagonal from the toe corner — the forefoot edge
      // faces the camera so the cover's thickness band reads immediately
      forefootEdge: { t: lean(0.30), d: profD * 1.22, el: 0.10, az: Math.PI - 0.55 },
      heel:     { t: lean(0.82), d: leanD(0.82),    el: 0.45, az: 0.55 },
      arch:     { t: lean(0.55), d: leanD(0.55),    el: 0.26, az: -1.15 }, // low, from the side — arch reads as a silhouette
      forefoot: { t: lean(0.30), d: leanD(0.30),    el: 0.80, az: 0.12 },
      toes:     { t: lean(0.14), d: leanD(0.14),    el: 0.65, az: 0.0 },
      pad:      { t: lean(0.34), d: leanD(0.34),    el: 1.02, az: 0.10 },
      relief:   { t: lean(0.45), d: leanD(0.45),    el: 1.02, az: -0.10 },
      // flipped over — looking at the print-bed / bottom of the shell so
      // heel posts, ribs, and skives read as shapes instead of a flat lid
      underside: { t: lean(0.86), d: leanD(0.86),   el: 0.88, az: 0.22 },
    };
    const r = R[region] || R.overview;
    // compare mode: two devices sit side by side along X, so a true side view
    // would hide one behind the other — pull the angle back to a diagonal
    if ((this.specs?.length ?? 1) > 1) {
      r.az = Math.max(-0.7, Math.min(0.7, r.az));
      r.el = Math.max(r.el, 0.35);
      // the diagonal angle projects both devices' full extent — fit the
      // real projected width at this azimuth so neither device gets cropped
      const proj = size.x * Math.abs(Math.cos(r.az)) + size.z * Math.abs(Math.sin(r.az));
      const diagD = (proj / (2 * halfTan)) * Math.max(1, 1 / this.camera.aspect) * 1.10;
      r.d = Math.max(r.d, fitD, diagD);
    }
    return r;
  }

  _tickFilmDrift(now) {
    const r = this.regionTarget(this.filmRegion || 'overview');
    const az = r.az + Math.sin(now * 0.0002) * 0.16;
    const el = r.el + Math.sin(now * 0.00015) * 0.025;
    const p = new THREE.Vector3(
      r.t.x + Math.sin(az) * r.d * Math.cos(el),
      r.t.y + r.d * Math.sin(el),
      r.t.z + Math.cos(az) * r.d * Math.cos(el)
    );
    this.camera.position.lerp(p, 0.035);
    this.controls.target.lerp(r.t, 0.035);
    this.camera.lookAt(this.controls.target);
  }

  flyTo(region, dur = 1400) {
    this.filmRegion = region;
    this.underside = region === 'underside';
    const { t, d, el, az } = this.regionTarget(region);
    const p1 = new THREE.Vector3(
      t.x + Math.sin(az) * d * Math.cos(el),
      t.y + d * Math.sin(el),
      t.z + Math.cos(az) * d * Math.cos(el)
    );
    this.flight = {
      p0: this.camera.position.clone(), p1,
      t0: this.controls.target.clone(), t1: t.clone(),
      z0: this.holder.rotation.z,
      z1: this.underside ? Math.PI : 0,
      start: performance.now(), dur,
    };
    this.controls.enabled = false;   // flight owns the camera until it lands
  }

  _tick(now) {
    this._processTimeline(now);
    this._tickFilm(now);
    if (this.motion === 'flip') this._applyFlip();
    this._applySeparation(now);
    this._tickAddonFade(now);
    if (this.training) this._updateTraining();
    if (this.flight) {
      const f = this.flight;
      let u = Math.min(1, (now - f.start) / f.dur);
      u = 1 - Math.pow(1 - u, 3.2);          // decelerating spring-like ease
      this.camera.position.lerpVectors(f.p0, f.p1, u);
      this.controls.target.lerpVectors(f.t0, f.t1, u);
      this.camera.lookAt(this.controls.target);
      if (f.z1 !== undefined) this.holder.rotation.z = f.z0 + (f.z1 - f.z0) * u;
      if (u >= 1) {
        this.flight = null;
        this.controls.enabled = !this.filmLock;
      }
      this.renderer.render(this.scene, this.camera);
      requestAnimationFrame(this._tick);
      this._projectLabels();
      return;
    }
    if (this.filmLock) this._tickFilmDrift(now);
    else this.controls.update();
    this._projectLabels();
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this._tick);
  }

  _projectLabels() {
    for (const l of this.labels) {
      const p = l.anchor.clone().project(this.camera);
      const r = this.canvas.getBoundingClientRect();
      const x = Math.min(Math.max((p.x * 0.5 + 0.5) * r.width, 90), r.width - 90);
      const y = Math.min(Math.max((-p.y * 0.5 + 0.5) * r.height, 24), r.height - 110);
      l.el.style.left = `${x}px`;
      l.el.style.top = `${y}px`;
      l.el.style.opacity = p.z < 1 ? 1 : 0;
    }
  }
}

/* ---------- lesson navigation ---------- */
const state = { chapter: 0, lesson: 0, step: 0, quiz: false, welcome: true };
const stage = new Stage(document.getElementById('gl'));
window.__stage = stage;   // console/debug access

const els = {
  sideNav: document.getElementById('sideNav'),
  side: document.getElementById('side'),
  quizSection: document.getElementById('quiz'),
  chapterTag: document.getElementById('chapterTag'),
  lessonTitle: document.getElementById('lessonTitle'),
  stepText: document.getElementById('stepText'),
  explore: document.getElementById('lessonExplore'),
  stepDots: document.getElementById('stepDots'),
  prev: document.getElementById('prevBtn'),
  next: document.getElementById('nextBtn'),
  nextLabel: document.getElementById('nextLabel'),
  progress: document.getElementById('progressFill'),
  legend: document.getElementById('legend'),
  reader: document.getElementById('reader'),
  welcome: document.getElementById('welcome'),
  welcomeLink: document.getElementById('welcomeLink'),
  lessonPane: document.getElementById('lessonPane'),
  replay: document.getElementById('replayBtn'),
  reelCaption: document.getElementById('reelCaption'),
  flowChart: document.getElementById('flowChart'),
  reelBeats: document.getElementById('reelBeats'),
};

const flatLessons = [];
CHAPTERS.forEach((ch, ci) => ch.lessons.forEach((ls, li) => flatLessons.push({ ci, li })));

function lessonIndex(ci, li) { return flatLessons.findIndex(f => f.ci === ci && f.li === li); }

function isTextOnly(ls) {
  return ls.layout === 'info' && !ls.chart && !ls.reel && !ls.models && !ls.compare;
}

function updateLegend(specs) {
  const hasRelief = specs.some(s => (byPO[s.po]?.models?.[s.side]?.relief_area_pct ?? 0) > 0.1);
  const hasPad = specs.some(s => (byPO[s.po]?.models?.[s.side]?.pad_area_pct ?? 0) > 0.1);
  const addonPair = specs.some(s => byPO[s.po]?.models?.[s.side]?.addon);
  if (addonPair) {
    const press = specs.some(s => byPO[s.po]?.motion === 'press');
    const flip = specs.some(s => byPO[s.po]?.motion === 'flip');
    const drape = specs.some(s => byPO[s.po]?.motion === 'drape');
    els.legend.innerHTML = flip
      ? '<span class="key" style="background:#17181c"></span>True cork blank, finished black like the shell — HIGH edge straight along the prescribed border, heel to arch, trimmed flush'
      : drape
        ? `<span class="key" style="background:${currentCover ? swatchBg(currentCover) : '#b0804f'}"></span>Top cover — the real production sheet at true thickness, glued on last; the only layer the foot touches`
        : press
          ? '<span class="key well"></span>Cyan = the soft fill / well. Production is the black insole.'
          : '<span class="key pad"></span>Amber = the raised part. Production is the black insole.';
    return;
  }
  els.legend.innerHTML =
    (hasPad ? '<span class="key pad"></span>Raised pad / bar ' : '') +
    (hasRelief ? '<span class="key well"></span>Relief well' : '') ||
    '<span class="muted">Plain surface — no offloads on this device</span>';
}

/* ---------- top cover selector (T1–T14, the real production lineup) ----------
   Every chip is a variant from the catalog: a true-thickness layered GLB with
   photo-sampled colors baked in. Clicking swaps the actual 3D geometry — the
   old cover lifts, the new one drapes down heel-first. No photos on screen;
   the swatch gradient shows the laminate stack (top color over cushion). */
const coverBar = document.getElementById('coverBar');
const COVER_VARIANTS = byPO['PAIR-TOP-COVER']?.variants || [];
let currentCover = COVER_VARIANTS[0];
const swatchBg = v => {
  const sw = v.swatches || [v.swatch];       // build order is bottom-up
  return sw.length > 1
    ? `linear-gradient(to bottom, ${sw[1]} 0 55%, ${sw[0]} 55% 100%)`
    : sw[0];
};
coverBar.innerHTML =
  `<div id="coverName"></div>` +
  `<div id="coverChips">` +
  COVER_VARIANTS.map((v, i) =>
    `<button class="swatch" data-i="${i}" title="${v.name} — ${v.recipe}">` +
    `<i style="background:${swatchBg(v)}"></i><b>${v.code}</b></button>`).join('') +
  `</div>`;
const coverNameEl = document.getElementById('coverName');
const fmtMM = v => v.mm.toFixed(1).replace(/\.0$/, '') + ' mm';
function coverReadout(v) {
  return `<b>${v.code} · ${v.name}</b><span class="sep"></span>${v.recipe}` +
    `<span class="sep"></span><b class="mm">${fmtMM(v)}</b> true thickness` +
    (v.layers > 1 ? `<span class="sep"></span>${v.layers} layers — read the edge` : '') +
    (v.perf ? `<span class="sep"></span>perforated` : '');
}
function markCover(i) {
  coverBar.querySelectorAll('.swatch').forEach((x, k) => x.classList.toggle('on', k === i));
  coverNameEl.innerHTML = coverReadout(COVER_VARIANTS[i]);
  if (stage.training) buildCallouts();
}
async function selectCover(i, instant = false) {
  const v = COVER_VARIANTS[i];
  if (!v) return;
  currentCover = v;
  markCover(i);
  await stage.swapCover(v, instant);
}
coverBar.querySelectorAll('.swatch').forEach(b => b.addEventListener('click', () => {
  if (COVER_VARIANTS[+b.dataset.i] === currentCover) return;
  selectCover(+b.dataset.i);
}));

/* ---------- training mode toggle (top covers) ----------
   For the lab bench, not the showroom: flies to a low forefoot-edge view
   and labels the insole like a product-manual diagram — one pill per layer
   (displayed name + ACTUAL millimeters), one for the printed base, and a
   total, each wired to its exact layer by a leader line and dot. */
const trainBtn = document.getElementById('trainBtn');
function buildCallouts() {
  const v = currentCover;
  if (!v || !v.layerInfo) return;
  const wrap = document.getElementById('callouts');
  const svg = document.getElementById('trainArrow');
  wrap.innerHTML = '';
  svg.innerHTML = '';
  const items = [];
  let cum = 0;
  for (const l of v.layerInfo) {
    items.push({
      html: `<b><i style="background:${l.hex}"></i>${l.label}</b>` +
            `<span><em>${l.mm.toFixed(2)} mm</em></span>`,
      depth: cum + l.mm / 2,
    });
    cum += l.mm;
  }
  items.push({
    html: `<b>${v.code} · ${v.name}</b>` +
          `<span>total cover on the insole — <em>${v.mm.toFixed(1)} mm</em></span>`,
    depth: null, cls: 'total',
  });
  stage._callouts = items.map((it, i) => {
    const el = document.createElement('div');
    el.className = 'co-pill' + (it.cls ? ` ${it.cls}` : '');
    el.style.transitionDelay = `${90 + i * 80}ms`;
    el.innerHTML = it.html;
    wrap.appendChild(el);
    let path = null, dot = null;
    if (it.depth != null) {
      path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      dot.setAttribute('r', '3.4');
      svg.appendChild(path);
      svg.appendChild(dot);
    }
    return { el, path, dot, depth: it.depth };
  });
}
function setTrainAvailable() {
  /* Training toggle + leader-line callouts are retired. Cover swap stays. */
  if (trainBtn) {
    trainBtn.hidden = true;
    trainBtn.classList.remove('on');
  }
  if (stage.training) stage.setTraining(false);
}

/* ---------- views: one screen, the sidebar picks what fills it ---------- */
function showView(name) {
  const quiz = name === 'quiz';
  const welcome = name === 'welcome';
  state.quiz = quiz;
  state.welcome = welcome;
  els.quizSection.hidden = !quiz;
  els.welcome.hidden = !welcome;
  els.reader.hidden = quiz || welcome;
  els.welcomeLink.classList.toggle('on', welcome);
  els.side.classList.remove('open');
  if (quiz || welcome) stopMeetFilm();
  if (!quiz && !welcome) requestAnimationFrame(() => stage._resize());
  if (quiz) openQuiz();
}

/* lessons the student has opened, so the sidebar can tick them */
const seen = new Set(JSON.parse(localStorage.getItem('hikeSeen') || '[]'));
function markSeen(ci, li) {
  seen.add(`${ci}.${li}`);
  localStorage.setItem('hikeSeen', JSON.stringify([...seen]));
}

let navLock = false;
async function renderLesson(animate = true) {
  const ch = CHAPTERS[state.chapter];
  const ls = ch.lessons[state.lesson];
  markSeen(state.chapter, state.lesson);
  syncSideNav();
  const gi0 = lessonIndex(state.chapter, state.lesson);
  els.progress.style.width = `${((gi0 + 1) / flatLessons.length) * 100}%`;
  if (ls.layout === 'quiz') {
    navLock = false;
    showView('quiz');
    return;
  }
  navLock = true;
  showView('reader');
  const specs = ls.compare ?? ls.models;
  els.chapterTag.textContent = `Chapter ${ch.number} · ${ch.title}`;
  els.lessonTitle.textContent = ls.title;
  els.reader.classList.toggle('info', ls.layout === 'info');
  els.reader.classList.toggle('film', !!ls.reel);
  els.reader.classList.toggle('chart', !!ls.chart);
  els.reader.classList.toggle('text', isTextOnly(ls));
  requestAnimationFrame(() => stage._resize());
  els.reader.classList.add('loading');
  explorePair = null;
  stopMeetFilm();
  renderFlowChart(ls);
  try {
    if (ls.chart || isTextOnly(ls)) {
      /* no GLB on info-only pages */
    } else if (ls.reel && ls.film) {
      const cv = COVER_VARIANTS.find(v => v.code === (ls.film[ls.film.length - 1].cover || 'T3'));
      await stage.showFilm(ls.film, cv);
      stage._resize();
    } else {
      await stage.show(specs);
    }
    explorePair = specs ? JSON.stringify(specs) : null;
  } finally {
    navLock = false;
  }
  els.reader.classList.remove('loading');
  state.step = 0;
  renderStep(false);
  if (ls.reel) {
    startMeetFilm();
  } else if (!ls.chart && !isTextOnly(ls)) {
    if (animate) stage.camera.position.multiplyScalar(1.35);
    stage.flyTo(ls.steps[0].camera || ls.camera || 'overview', 1600);
  }
  if (specs) updateLegend(specs);
  if (ls.covers && COVER_VARIANTS.length) {
    coverBar.hidden = false;
    currentCover = COVER_VARIANTS[0];   // stage.show() reloads the default T1 part
    markCover(0);
  } else {
    coverBar.hidden = true;
  }
  setTrainAvailable();
  const gi = lessonIndex(state.chapter, state.lesson);
  els.progress.style.width = `${((gi + 1) / flatLessons.length) * 100}%`;
  els.lessonPane.scrollTop = 0;
}

/* step anim -> separation target: lift pairs use separate/reseat, press
   pairs use press/release, flip pairs use flip/attach/settle — one state
   machine underneath */
function animTarget(anim) {
  if (anim === 'flip') return 'separated';      // roll over + part hovers
  if (anim === 'attach') return 'flipped';      // part glues onto the base
  if (anim === 'settle') return 'seated';       // roll back upright
  return (anim === 'separate' || anim === 'press') ? 'separated' : 'seated';
}

/* separation state a lesson's steps imply BEFORE step i runs its own anim */
function sepStateBefore(ls, i) {
  let s = 'seated';
  for (let k = 0; k < i; k++) {
    if (ls.steps[k].anim) s = animTarget(ls.steps[k].anim);
  }
  return s;
}

function lastStepAnim(ls, i) {
  for (let k = i - 1; k >= 0; k--) {
    if (ls.steps[k].anim) return ls.steps[k].anim;
  }
  return null;
}

/* ---------- Chapter 1 explorer: one lesson, click the map, few page turns ---- */
const FOOT_LANDMARKS = [
  { id: 'heel-pad', name: 'Heel Pad', camera: 'heel',
    remember: 'Heel Pad = cushion beneath the heel. Heel = foundation of the device.',
    cx: 58, cy: 168 },
  { id: 'medial-arch', name: 'Medial Arch', camera: 'arch',
    remember: 'Medial Arch = inner longitudinal arch.',
    cx: 78, cy: 108 },
  { id: 'met-heads', name: '1st–5th Met-Heads', camera: 'forefoot',
    remember: 'Met-Heads = ball-of-the-foot landmarks. 1st = medial (big toe). 5th = lateral (little toe).',
    cx: 56, cy: 48 },
  { id: 'met-pad', name: 'Met-Head Pad', camera: 'forefoot',
    remember: 'Met-Head Pad = natural cushioning under the ball of the foot.',
    cx: 56, cy: 62 },
  { id: 'sulcus', name: 'Sulcus', camera: 'toes',
    remember: 'Sulcus = the line behind the toe bases. A sulcus-length cover stops here.',
    cx: 56, cy: 32 },
  { id: 'base-5th', name: 'Base of 5th', camera: 'arch',
    remember: 'Base of 5th = lateral midfoot bony prominence.',
    cx: 28, cy: 88 },
  { id: 'peroneal', name: 'Peroneal Arch', camera: 'arch',
    remember: 'Peroneal Arch = smaller outer-foot arch, heel to Base of 5th.',
    cx: 30, cy: 118 },
];
const FOOT_REGIONS = [
  { id: 'forefoot', name: 'Forefoot — Anterior', camera: 'forefoot',
    span: 'Toe tips → 1st–5th metatarsal heads' },
  { id: 'midfoot', name: 'Midfoot — Arch', camera: 'arch',
    span: 'Metatarsal heads → calcaneus' },
  { id: 'rearfoot', name: 'Rearfoot — Heel', camera: 'heel',
    span: 'Calcaneus and posterior structures' },
];
function plantarFig() {
  // Digital recreation of the training plantar map. Hotspots sit on the
  // labelled rings so a click still flies the 3D insole to that place.
  const spots = [
    { id: 'sulcus',     x: 68, y: 16 },
    { id: 'met-heads',  x: 62, y: 28 },
    { id: 'met-pad',    x: 36, y: 33 },
    { id: 'base-5th',   x: 32, y: 54 },
    { id: 'peroneal',   x: 22, y: 61 },
    { id: 'medial-arch',x: 72, y: 49 },
    { id: 'heel-pad',   x: 48, y: 72 },
    { id: 'forefoot',   x: 50, y: 26 },
    { id: 'rearfoot',   x: 48, y: 80 },
  ];
  return `<div class="plantar-fig" aria-label="Plantar surface — weight-bearing regions">
    <img src="./assets/plantar-surface.png" alt="Plantar surface (ventral): Heel Pad, Met-Head Pad, lateral border, and named landmarks">
    ${spots.map(s =>
      `<button class="hot" data-lm="${s.id}" style="left:${s.x}%;top:${s.y}%" title="${s.id}"></button>`
    ).join('')}
  </div>`;
}
function bindFootExplorer(root) {
  const remember = root.querySelector('.lm-remember');
  const setOn = id => {
    root.querySelectorAll('.hot').forEach(el => el.classList.toggle('on', el.dataset.lm === id));
    root.querySelectorAll('.lm-chip,.reg-card').forEach(el => el.classList.toggle('on', el.dataset.lm === id));
    const lm = FOOT_LANDMARKS.find(x => x.id === id) || FOOT_REGIONS.find(x => x.id === id);
    if (!lm) return;
    if (remember) remember.innerHTML = `<b>${lm.name}.</b> ${lm.remember || lm.span}`;
    stage.flyTo(lm.camera, 1100);
  };
  root.querySelectorAll('.hot,.lm-chip,.reg-card').forEach(el => {
    el.addEventListener('click', () => setOn(el.dataset.lm));
  });
}
function applyCoverCode(code, instant = true) {
  const ci = COVER_VARIANTS.findIndex(v => v.code === code);
  if (ci < 0) return;
  if (COVER_VARIANTS[ci] === currentCover && !instant) return;
  selectCover(ci, instant);
}

const INSERT_BUILDS = {
  sweet: {
    id: 'sweet', name: 'Sweet', kind: 'Bi-Lam · 2 layers', cover: 'T1',
    layers: [
      { name: '1/8″ P-Cell', role: 'Top · cushioning, shear / friction protection', hex: '#faceac' },
      { name: '35 durometer', role: 'Base · soft support, pressure distribution', hex: '#e4d2bc' },
    ],
    remember: 'Diabetic 35. Highest-risk feet. T1 is one layer of 1/8″ P-Cell — the surface the foot touches.',
  },
  double: {
    id: 'double', name: 'Double Sweet', kind: 'Tri-Lam · 3 layers', cover: 'T2',
    layers: [
      { name: '1/16″ P-Cell', role: 'Top · skin interface, friction reduction', hex: '#f4c89e' },
      { name: '1/16″ Poron', role: 'Mid · shock absorption, energy return', hex: '#74baf6' },
      { name: '45 durometer', role: 'Base · medium support, balanced comfort', hex: '#c4b196' },
    ],
    remember: 'Diabetic 45. Protection plus structure — the usual middle ground. T2 is P-Cell over Poron, still 3.2 mm.',
  },
  triple: {
    id: 'triple', name: 'Triple Sweet', kind: 'Tri-Lam · 3 layers', cover: 'T3',
    layers: [
      { name: '1/8″ P-Cell', role: 'Top · thicker cushion at the skin', hex: '#edaf85' },
      { name: '1/16″ Poron', role: 'Mid · shock absorption', hex: '#74baf6' },
      { name: '55 durometer', role: 'Base · firm load distribution, high activity', hex: '#8f7f6c' },
    ],
    remember: 'Diabetic 55. Firmest Sweet shell. T3 is nearly 5 mm — 1/8″ P-Cell over 1/16″ Poron. Two colors at the edge.',
  },
};
const DUROMETERS = [
  { n: '35', feel: 'Soft', use: 'Sensitive skin, high-risk ulceration, basic diabetic protection' },
  { n: '45', feel: 'Medium', use: 'Moderate deformity, balanced support and comfort' },
  { n: '55', feel: 'Firm', use: 'Severe deformity, maximum load distribution, high activity' },
];
const BYO_LAYERS = [
  { id: 'base', name: 'Base', opts: [
    { name: 'Cork', note: 'Natural structural support. Pressure distribution and moisture management.' },
    { name: 'EVA', note: 'Durable mid-soft foam. Balanced load distribution as a base or mid-layer.' },
    { name: 'High-durometer foam', note: 'Maximum structure when the foot needs a firmer platform.' },
  ]},
  { id: 'mid', name: 'Mid-layer', opts: [
    { name: 'P-Cell', note: 'Soft foam. Cushioning and friction reduction — pressure relief at high-risk skin.' },
    { name: 'Poron', note: 'Denser foam. Shock absorption, durability, better energy return.' },
  ]},
  { id: 'top', name: 'Top cover', opts: [
    { name: 'P-Cell', note: 'Skin-contact cushioning. The usual diabetic top.' },
    { name: 'Leather', note: 'Smooth durable surface. Reduces friction; suitable for sensitive skin.' },
    { name: 'Puff', note: 'Soft comfort layer. The standard cover on a rigid UCBL (1/8″).' },
  ]},
];
function lamStack(layers) {
  return `<div class="lam-stack">${layers.map(l =>
    `<div class="lam-layer" style="--lam:${l.hex}"><b>${l.name}</b><span>${l.role}</span></div>`
  ).join('')}</div>`;
}
function bindInsertExplorer(root) {
  const remember = root.querySelector('.lm-remember');
  const stackBox = root.querySelector('[data-stack]');
  root.querySelectorAll('[data-build]').forEach(el => {
    el.addEventListener('click', () => {
      const b = INSERT_BUILDS[el.dataset.build];
      if (!b) return;
      root.querySelectorAll('[data-build]').forEach(x => x.classList.toggle('on', x === el));
      if (stackBox) stackBox.innerHTML = lamStack(b.layers);
      if (remember) remember.innerHTML = `<b>${b.name}.</b> ${b.remember}`;
      applyCoverCode(b.cover);
      stage.flyTo('heelProfile', 1100);
    });
  });
  root.querySelectorAll('[data-dur]').forEach(el => {
    el.addEventListener('click', () => {
      const d = DUROMETERS.find(x => x.n === el.dataset.dur);
      if (!d) return;
      root.querySelectorAll('[data-dur]').forEach(x => x.classList.toggle('on', x === el));
      if (remember) remember.innerHTML = `<b>${d.n} — ${d.feel} base.</b> ${d.use}. Durometer is the hardness of the base. Sweet names come after the matching cover is on.`;
      stage.flyTo(d.n === '35' ? 'overview' : 'heel', 1100);
    });
  });
  root.querySelectorAll('[data-byo]').forEach(el => {
    el.addEventListener('click', () => {
      const layer = BYO_LAYERS.find(x => x.id === el.dataset.layer);
      const opt = layer?.opts.find(o => o.name === el.dataset.byo);
      if (!opt) return;
      root.querySelectorAll(`[data-layer="${el.dataset.layer}"]`).forEach(x =>
        x.classList.toggle('on', x === el));
      if (remember) remember.innerHTML = `<b>${layer.name} · ${opt.name}.</b> ${opt.note}`;
    });
  });
}
function renderInsertExplore(step) {
  const box = els.explore;
  const panel = step.panel;
  box.hidden = false;
  if (panel === 'layers') {
    box.innerHTML = `<div class="reg-row">
      <div class="reg-card"><b>Bi-Lam</b><span>2 layers — base + one cover. Finished name: Sweet.</span></div>
      <div class="reg-card"><b>Tri-Lam</b><span>3 layers — base + mid + cover. Finished names: Double or Triple Sweet.</span></div>
      <div class="reg-card"><b>Durometer</b><span>35 soft · 45 middle · 55 firm. The clinical dial for risk.</span></div>
    </div>`;
    return;
  }
  if (INSERT_BUILDS[panel]) {
    const b = INSERT_BUILDS[panel];
    box.innerHTML = `${lamStack(b.layers)}
      <div class="lm-remember"><b>${b.name}.</b> ${b.remember}</div>`;
    return;
  }
  if (panel === 'bilam') {
    const b = INSERT_BUILDS.sweet;
    box.innerHTML = `${lamStack(b.layers)}
      <div class="lm-remember"><b>Sweet.</b> ${b.remember}</div>`;
    return;
  }
  if (panel === 'trilam') {
    const b = INSERT_BUILDS.double;
    box.innerHTML = `<div class="pick-row">
      <button class="reg-card on" data-build="double"><b>Double Sweet</b><span>45 · 1/16″ Poron · 1/16″ P-Cell</span></button>
      <button class="reg-card" data-build="triple"><b>Triple Sweet</b><span>55 · 1/16″ Poron · 1/8″ P-Cell</span></button>
    </div>
    <div data-stack>${lamStack(b.layers)}</div>
    <div class="lm-remember"><b>Double Sweet.</b> ${b.remember}</div>`;
    bindInsertExplorer(box);
    return;
  }
  if (panel === 'durometer') {
    box.innerHTML = `<div class="pick-row thirds">${DUROMETERS.map(d =>
      `<button class="reg-card" data-dur="${d.n}"><b>${d.n} — ${d.feel}</b><span>${d.use}</span></button>`
    ).join('')}</div>
    <div class="lm-remember">Click a rating. Durometer is base hardness. Sweet, Double Sweet, and Triple Sweet are Hike’s internal company names for the finished insole after the matching cover is on.</div>`;
    bindInsertExplorer(box);
    return;
  }
  if (panel === 'byo') {
    box.innerHTML = `<div class="byo-grid">${BYO_LAYERS.map(layer =>
      `<div class="side-card"><div class="tag">${layer.name}</div>
        <div class="lm-chips">${layer.opts.map(o =>
          `<button class="lm-chip" data-layer="${layer.id}" data-byo="${o.name}">${o.name}</button>`
        ).join('')}</div></div>`
    ).join('')}</div>
    <div class="lm-remember">Click a material. Each of the three layers can be specified independently.</div>`;
    bindInsertExplorer(box);
    return;
  }
  if (panel === 'ucbl') {
    box.innerHTML = `<div class="side-grid">
      <div class="side-card"><div class="tag">Shell</div><h4>Polypropylene mimic</h4>
        <p>High structural rigidity. Deep heel cup and flanges control the heel and midfoot.</p></div>
      <div class="side-card"><div class="tag">Cover</div><h4>1/8″ Puff</h4>
        <p>Standard comfort layer on a rigid device. BYO covers optional.</p></div>
    </div>
    <div class="lm-remember"><b>Indicated for</b> pronation, flatfoot, high-risk plantar pressures, and Charcot foot stabilisation. Reduces shear and pressure points. A stiffer upgraded shell is the upcoming rigid option.</div>`;
    return;
  }
  if (panel === 'choose') {
    box.innerHTML = `<table class="qref">
      <tr><th>Insert</th><th>Layers</th><th>Best for</th></tr>
      <tr><td>Sweet <span style="color:var(--ink-3)">(Hike name · Bi-Lam)</span></td><td>35 + T1</td><td>Basic cushioning, low-to-moderate risk</td></tr>
      <tr><td>Double Sweet <span style="color:var(--ink-3)">(Hike name · Tri-Lam)</span></td><td>45 + T2</td><td>Moderate deformity, extra redistribution</td></tr>
      <tr><td>Triple Sweet <span style="color:var(--ink-3)">(Hike name · Tri-Lam)</span></td><td>55 + T3</td><td>Moderate-to-severe deformity, high shock need</td></tr>
      <tr><td>BYO</td><td>2–3 custom</td><td>Unique deformity or activity · VA / private</td></tr>
      <tr><td>UCBL</td><td>Rigid + cover</td><td>Pronation, flatfoot, Charcot, post-surgical</td></tr>
      <tr><td>Rigid (upgraded)</td><td>Rigid shell</td><td>Maximum rigidity — upcoming release</td></tr>
    </table>
    <table class="qref" style="margin-top:14px">
      <tr><th>Material</th><th>Job</th></tr>
      <tr><td>P-Cell</td><td>Soft foam · cushioning, friction reduction at the skin</td></tr>
      <tr><td>Poron</td><td>Denser foam · shock absorption and durability</td></tr>
      <tr><td>EVA</td><td>Base foam · 35 / 45 / 55 durometer load distribution</td></tr>
      <tr><td>Cork</td><td>Natural base · structure and moisture management</td></tr>
      <tr><td>Leather</td><td>Top cover · smooth, low-friction surface</td></tr>
      <tr><td>Puff</td><td>Top cover · comfort layer on rigid / UCBL</td></tr>
    </table>
    <p class="note" style="margin-top:10px;font-size:14px;color:var(--ink-3)">Patient profile → layer count → durometer → cover. Hike’s Sweet names describe that finished stack.</p>`;
  }
}
const PLUGS = [
  { id: '1st', po: 'PAIR-OFFLOAD-1ST', side: 'LEFT' },
  { id: '2nd', po: 'PAIR-OFFLOAD-2ND', side: 'LEFT' },
  { id: '3rd', po: 'PAIR-OFFLOAD-3RD', side: 'LEFT' },
  { id: '2nd+3rd', po: 'PAIR-OFFLOAD-2ND-3RD', side: 'LEFT' },
  { id: '4th', po: 'PAIR-OFFLOAD-4TH', side: 'LEFT' },
  { id: '5th', po: 'PAIR-OFFLOAD-5TH', side: 'LEFT' },
  { id: '4th+5th', po: 'PAIR-OFFLOAD-4TH-5TH', side: 'LEFT' },
];
function renderPlugExplore(step) {
  const box = els.explore;
  if (!box) return;
  if (step.panel !== 'plugs') { box.hidden = true; box.innerHTML = ''; return; }
  box.hidden = false;
  const cur = (step.pair && step.pair[0]?.po) || '';
  box.innerHTML = `<div class="lm-chips">${PLUGS.map(p =>
    `<button class="lm-chip${p.po === cur ? ' on' : ''}" data-plug="${p.id}">${p.id}</button>`
  ).join('')}</div>
  <div class="lm-remember">Click a met head. The cyan plug on stage is that well\u2019s production fill.</div>`;
  box.querySelectorAll('[data-plug]').forEach(el => {
    el.addEventListener('click', async () => {
      const p = PLUGS.find(x => x.id === el.dataset.plug);
      if (!p) return;
      box.querySelectorAll('.lm-chip').forEach(x => x.classList.toggle('on', x === el));
      const remember = box.querySelector('.lm-remember');
      if (remember) remember.innerHTML = `<b>${p.id} met head.</b> Soft fill for that well, flush until a step compresses it.`;
      await ensureStepPair({ models: [{ po: p.po, side: p.side, label: p.id }] }, {});
      stage.flyTo('relief', 900);
    });
  });
}
let meetFilmGen = 0;
function stopMeetFilm() {
  meetFilmGen += 1;
  stage.setFilmLock(false);
  if (els.reelCaption) {
    els.reelCaption.classList.remove('show');
    els.reelCaption.hidden = true;
  }
  if (els.reelBeats) els.reelBeats.hidden = true;
}
function meetFilmAlive(gen) {
  return gen === meetFilmGen && CHAPTERS[state.chapter]?.lessons[state.lesson]?.reel;
}
function waitMeet(ms, gen) {
  return new Promise(resolve => {
    setTimeout(() => resolve(meetFilmAlive(gen)), ms);
  });
}
function buildMeetBeats(n) {
  const box = els.reelBeats;
  if (!box) return;
  box.innerHTML = Array.from({ length: n }, () => '<i></i>').join('');
  box.hidden = false;
}
function setMeetBeat(i) {
  const box = els.reelBeats;
  if (!box) return;
  box.hidden = false;
  box.querySelectorAll('i').forEach((dot, n) => dot.classList.toggle('on', n === i));
}
async function setMeetCaption(line, sub, gen) {
  const el = els.reelCaption;
  if (!el) return true;
  const strong = el.querySelector('strong');
  const span = el.querySelector('span');
  el.hidden = false;
  if (el.classList.contains('show')) {
    el.classList.remove('show');
    if (!await waitMeet(520, gen)) return false;
  }
  if (strong) strong.textContent = line;
  if (span) span.textContent = sub || '';
  requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('show')));
  return meetFilmAlive(gen);
}
/* The intro film. One scene, no reloads: each device the paragraphs name
   slides through in order — Functional, Diabetic, Hike Shell, UCBL — then
   the finished insole, whose top cover lifts off the printed shell and
   seats back on. Then it loops. */
async function startMeetFilm() {
  const gen = ++meetFilmGen;
  const ls = CHAPTERS[state.chapter].lessons[state.lesson];
  const film = ls.film || [];
  if (!film.length || !stage.filmGroups?.length) return;
  const last = film.length - 1;
  coverBar.hidden = true;
  setTrainAvailable();
  els.replay.hidden = true;
  stage.setFilmLock(true);
  stage.setSeparation('seated', true);
  buildMeetBeats(film.length);
  stage._resize();
  stage.filmJump(0);
  requestAnimationFrame(() => {
    stage._resize();
    if (meetFilmAlive(gen)) stage.flyTo(film[0].camera || 'overview', 2200);
  });
  let first = true;
  while (meetFilmAlive(gen)) {
    for (let i = 0; i < last; i++) {
      if (!first || i > 0) {
        if (!await setMeetCaption(film[i].title, '', gen)) return;
        stage.filmGo(i, 1900);
        stage.flyTo(film[i].camera || 'overview', 2400);
      } else if (!await setMeetCaption(film[i].title, '', gen)) return;
      setMeetBeat(i);
      if (!await waitMeet(3600, gen)) return;
    }
    first = false;
    if (!await setMeetCaption('Finished insole', '', gen)) return;
    stage.filmGo(last, 1900);
    stage.flyTo(film[last].camera || 'overview', 2400);
    setMeetBeat(last);
    if (!await waitMeet(3400, gen)) return;
    stage.flyTo('coverSplit', 2600);
    stage.setSeparation('separated', false, 2800);
    if (!await waitMeet(3300, gen)) return;
    stage.flyTo(film[last].camera || 'overview', 2600);
    stage.setSeparation('seated', false, 2600);
    if (!await waitMeet(3400, gen)) return;
  }
}
function renderFlowChart(ls) {
  const box = els.flowChart;
  if (!box) return;
  if (!ls?.chart) { box.hidden = true; box.innerHTML = ''; return; }
  box.hidden = false;
  if (ls.photos) {
    box.innerHTML = renderProdPhotos();
    return;
  }
  if (ls.materials) {
    box.innerHTML = renderMaterialsStack();
    return;
  }
  box.innerHTML = `<div class="flow">
    <div class="flow-col">
      <div class="flow-kicker">Consumer</div>
      <div class="flow-box">Consumer</div>
      <i class="flow-arrow"></i>
      <div class="flow-box">Scan and submit<span>On the Hike platform</span></div>
      <i class="flow-arrow"></i>
      <div class="flow-box end">Hike<span>Design team</span></div>
    </div>
    <div class="flow-col clin">
      <div class="flow-kicker">Clinical</div>
      <div class="flow-box">Patient</div>
      <i class="flow-arrow"></i>
      <div class="flow-box accent">Clinician<span>Podiatrist, orthotist, or qualified provider</span></div>
      <i class="flow-arrow"></i>
      <div class="flow-box rich">Clinical prescription
        <ul>
          <li>Orthotic type &amp; cover length</li>
          <li>Offloads, drill &amp; fill</li>
          <li>Met pads, met bars, heel raises</li>
          <li>Posting, flanges, accommodations</li>
        </ul>
      </div>
      <i class="flow-arrow"></i>
      <div class="flow-box end">Hike<span>Design team</span></div>
    </div>
  </div>`;
}
function renderMaterialsStack() {
  return `<div class="mat">
    <div class="mat-kicker">Two parts · every insole</div>
    <div class="mat-layer cover">
      <b>Top cover</b>
      <span>The fabric sheet the foot rests on. Glued on last. T-codes T1–T14.</span>
    </div>
    <i class="mat-join plus"></i>
    <div class="mat-layer base">
      <b>Base</b>
      <span>The 3D-printed shell. Structural foundation, shaped to that foot.</span>
    </div>
    <i class="mat-join eq"></i>
    <div class="mat-layer done">
      <b>Finished insole</b>
      <span>How it feels, how it performs, and whether it does its job.</span>
    </div>
    <div class="mat-split">
      <div>
        <div class="mat-kicker">Bases next</div>
        <ul>
          <li>Sweet family</li>
          <li>Functional family</li>
          <li>UCBL</li>
        </ul>
      </div>
      <div>
        <div class="mat-kicker">Then covers</div>
        <ul>
          <li>How the sheet is glued</li>
          <li>T-codes T1–T14</li>
          <li>P-Cell, Spenco, Puff</li>
        </ul>
      </div>
    </div>
  </div>`;
}
function renderProdPhotos() {
  const steps = [
    { n: '01', name: 'Design', shots: [
      ['design-side', 'Side view'],
      ['design-model', 'Insole model'],
    ]},
    { n: '02', name: 'Printing', shots: [
      ['print-printer', 'On the printer'],
      ['print-closeup', 'Layer by layer'],
    ]},
    { n: '03', name: 'Gluing', shots: [
      ['glue-adhesive', 'Adhesive'],
      ['glue-cover', 'Top cover'],
    ]},
    { n: '04', name: 'Finishing', shots: [
      ['finish-belt', 'The wheel'],
      ['finish-edges', 'Edges'],
    ]},
    { n: '05', name: 'Quality Control', shots: [
      ['qc-compare', 'Against the order'],
      ['qc-side', 'Side inspection'],
    ]},
  ];
  return `<div class="prod">${steps.map((s, i) => `
    <div class="prod-step">
      <div class="prod-mark"><b>${s.n}</b><span>${s.name}</span></div>
      <div class="prod-pair">${s.shots.map(([file, cap]) => `
        <figure>
          <img src="./assets/prod/${file}.jpg" alt="${cap}">
          <figcaption>${cap}</figcaption>
        </figure>`).join('')}
      </div>
    </div>${i < steps.length - 1 ? '<i class="prod-join"></i>' : ''}`).join('')}
  </div>`;
}
function renderExplore(step, ls) {
  const box = els.explore;
  if (!box) return;
  if (ls?.reel || ls?.layout === 'info' || ls?.chart) { box.hidden = true; box.innerHTML = ''; return; }
  if (!ls?.explorer || !step.panel) { box.hidden = true; box.innerHTML = ''; return; }
  if (ls.explorer === 'inserts') return renderInsertExplore(step);
  if (ls.explorer === 'plugs') return renderPlugExplore(step);
  const panel = step.panel;
  if (panel === 'why') { box.hidden = true; box.innerHTML = ''; return; }
  box.hidden = false;
  if (panel === 'regions') {
    box.innerHTML = `${plantarFig()}<div class="reg-row">${FOOT_REGIONS.map(r =>
      `<button class="reg-card" data-lm="${r.id}"><b>${r.name}</b><span>${r.span}</span></button>`
    ).join('')}</div>
    <div class="lm-remember">Click Heel Pad, Met-Head Pad, or the lateral / Peroneal Arch on the figure. Those three regions carry the load.</div>`;
    bindFootExplorer(box);
    return;
  }
  if (panel === 'landmarks') {
    box.innerHTML = `${plantarFig()}
      <div class="lm-chips">${FOOT_LANDMARKS.map(l =>
        `<button class="lm-chip" data-lm="${l.id}">${l.name}</button>`).join('')}</div>
      <div class="lm-remember">Click a landmark on the figure — or the chips. The insole turns to that place. The line to remember appears here.</div>`;
    bindFootExplorer(box);
    return;
  }
  if (panel === 'sides') {
    box.innerHTML = `<div class="side-grid">
      <div class="side-card"><div class="tag">Medial</div><h4>Inner · big-toe side</h4>
        <p>1st Met-Head · Medial Arch. Same on the left foot and the right foot.</p></div>
      <div class="side-card"><div class="tag">Lateral</div><h4>Outer · little-toe side</h4>
        <p>5th Met-Head · Base of 5th · Peroneal Arch. Does not flip when the foot does.</p></div>
    </div>
    <div class="side-grid" style="margin-top:10px">
      <div class="side-card"><div class="tag">Forefoot</div><p>Toe tips → metatarsal heads. Sulcus, met-heads, many accommodations.</p></div>
      <div class="side-card"><div class="tag">Midfoot</div><p>Met-heads → calcaneus. Medial and lateral contours.</p></div>
    </div>
    <div class="side-card" style="margin-top:10px"><div class="tag">Rearfoot</div>
      <p>Calcaneus and posterior structures. Heel cup, heel thickness, heel position.</p></div>`;
    return;
  }
  if (panel === 'compare') {
    box.innerHTML = `<table class="qref">
      <tr><th>Term</th><th>Remember it as</th></tr>
      <tr><td>Medial</td><td>Inner / big-toe side</td></tr>
      <tr><td>Lateral</td><td>Outer / little-toe side</td></tr>
      <tr><td>1st Met-Head</td><td>Medial end of the met-head row</td></tr>
      <tr><td>5th Met-Head</td><td>Lateral end of the met-head row</td></tr>
      <tr><td>Met-Head Pad</td><td>Cushion under the ball of the foot</td></tr>
      <tr><td>Sulcus</td><td>Groove behind the toe bases</td></tr>
      <tr><td>Medial Arch</td><td>Inner longitudinal arch</td></tr>
      <tr><td>Base of 5th</td><td>Lateral bony prominence</td></tr>
      <tr><td>Peroneal Arch</td><td>Smaller outer-foot arch</td></tr>
      <tr><td>Heel Pad</td><td>Cushion beneath the heel</td></tr>
      <tr><td>Forefoot / Midfoot / Rearfoot</td><td>Toes→mets · mets→heel · heel</td></tr>
      <tr><td>Functional / Diabetic</td><td>Influence motion / even contact</td></tr>
    </table>
    <p class="note" style="margin-top:10px;font-size:14px;color:var(--ink-3)">Find the anatomy → understand the pressure → understand the purpose of the device → then understand the design.</p>`;
  }
}
let explorePair = null;
async function ensureStepPair(ls, step) {
  const want = step.pair || ls.compare || ls.models;
  const key = JSON.stringify(want);
  if (explorePair === key) return;
  explorePair = key;
  await stage.show(want);
  updateLegend(want);
}
async function applyExplorerStage(ls, step) {
  await ensureStepPair(ls, step);
  if (step.cover && COVER_VARIANTS.length) {
    applyCoverCode(step.cover, true);
    coverBar.hidden = !ls.covers;
    setTrainAvailable();
    const names = {
      T1: 'Sweet · Diabetic 35 · T1',
      T2: 'Double Sweet · Diabetic 45 · T2',
      T3: 'Triple Sweet · Diabetic 55 · T3',
      T6: 'Flexible Shell · T6 Spenco',
      T7: 'UCBL · T7 Puff',
    };
    const label = step.legend || names[step.cover];
    if (label && els.legend) {
      els.legend.innerHTML = `<span class="key" style="background:${currentCover ? swatchBg(currentCover) : '#b0804f'}"></span>${label}`;
    }
  } else if (!ls.covers) {
    setTrainAvailable();
    coverBar.hidden = true;
    if (step.legend && els.legend) {
      els.legend.innerHTML = `<span class="muted">${step.legend}</span>`;
    }
  }
}

let animTimer = null;
function renderStep(fly = true) {
  const ls = CHAPTERS[state.chapter].lessons[state.lesson];
  const step = ls.steps[state.step];
  els.stepText.style.opacity = 0;
  setTimeout(() => {
    els.stepText.innerHTML = renderText(step.text);
    els.stepText.scrollTop = 0;
    els.stepText.style.opacity = 1;
    bindGloss();
    renderExplore(step, ls);
  }, fly ? 180 : 0);
  if (ls.explorer || step.pair || step.cover) applyExplorerStage(ls, step);
  else if (els.explore) { els.explore.hidden = true; els.explore.innerHTML = ''; }
  if (fly && !ls.reel && !ls.chart && !isTextOnly(ls)) stage.flyTo(step.camera || ls.camera || 'overview');
  // add-on animation: snap to this step's starting state, then play its move.
  // Snapping first means step-skipping can never strand a mid-flight part.
  clearTimeout(animTimer);
  clearTimeout(animTimer2);
  if (ls.reel || ls.chart || isTextOnly(ls)) {
    els.replay.hidden = true;
    els.stepDots.innerHTML = '';
    els.nextLabel.textContent = nextLessonLabel(true);
    els.prev.disabled = false;
    return;
  }
  if (stage.addon) {
    const before = sepStateBefore(ls, state.step);
    stage.setSeparation(before, true);
    if (step.anim) {
      if (animTarget(step.anim) !== 'seated') stage.revealAddons(true);
      animTimer = setTimeout(() => stage.setSeparation(animTarget(step.anim)), 650);
    } else if (before === 'seated' && lastStepAnim(ls, state.step) === 'settle') {
      // cork wedges stay on after they glue — they ARE the finished surface
      stage.concealAddons(true);
    }
  }
  // selector lessons can pin a cover per step: the stage lifts the current
  // cover off and drapes the named one down as the step's animation
  if (ls.covers && step.cover) {
    const ci = COVER_VARIANTS.findIndex(v => v.code === step.cover);
    if (ci >= 0 && COVER_VARIANTS[ci] !== currentCover) {
      animTimer = setTimeout(() => selectCover(ci), 500);
    }
  }
  els.replay.hidden = !stage.addon || ls.steps.every(s => !s.anim);
  els.stepDots.innerHTML = ls.steps
    .map((_, i) => `<i class="${i === state.step ? 'on' : ''}" data-i="${i}"></i>`).join('');
  els.stepDots.querySelectorAll('i').forEach(dot =>
    dot.addEventListener('click', () => { state.step = +dot.dataset.i; renderStep(); }));
  const last = state.step === ls.steps.length - 1;
  els.nextLabel.textContent = last ? nextLessonLabel(true) : 'Next';
  els.prev.disabled = false;
}

function nextLessonLabel() {
  const gi = lessonIndex(state.chapter, state.lesson);
  if (gi >= flatLessons.length - 1) return 'Take the quiz';
  const nxt = flatLessons[gi + 1];
  return CHAPTERS[nxt.ci].lessons[nxt.li].layout === 'quiz' ? 'Take the quiz' : 'Next lesson';
}

function go(dir) {
  if (navLock) return;   // ignore presses while a lesson is still loading
  const ls = CHAPTERS[state.chapter].lessons[state.lesson];
  const gi = lessonIndex(state.chapter, state.lesson);
  if (dir > 0) {
    if (state.step < ls.steps.length - 1) { state.step++; renderStep(); return; }
    if (gi < flatLessons.length - 1) {
      const nxt = flatLessons[gi + 1];
      state.chapter = nxt.ci; state.lesson = nxt.li;
      renderLesson(); return;
    }
    showView('quiz');
  } else {
    if (state.step > 0) { state.step--; renderStep(); return; }
    if (gi > 0) {
      const prv = flatLessons[gi - 1];
      state.chapter = prv.ci; state.lesson = prv.li;
      renderLesson().then(() => {
        state.step = CHAPTERS[state.chapter].lessons[state.lesson].steps.length - 1;
        renderStep();
      });
    } else {
      showView('welcome');
    }
  }
}
els.next.addEventListener('click', () => go(1));
els.prev.addEventListener('click', () => go(-1));
/* console/debug: jump straight to a chapter/lesson/step */
window.__goto = async (ci, li, si = 0) => {
  state.chapter = ci; state.lesson = li;
  await renderLesson(false);
  if (si) { state.step = si; renderStep(); }
};
let animTimer2 = null;
let animTimer3 = null;
els.replay.addEventListener('click', () => {
  if (!stage.addon) return;
  stage.revealAddons(true);
  clearTimeout(animTimer);
  clearTimeout(animTimer2);
  clearTimeout(animTimer3);
  if (!state.quiz) {
    const ls = CHAPTERS[state.chapter].lessons[state.lesson];
    const step = ls.steps[state.step];
    if (step.anim) {
      // replay this step's own move from its starting state
      stage.setSeparation(sepStateBefore(ls, state.step), true);
      animTimer = setTimeout(() => stage.setSeparation(animTarget(step.anim)), 250);
      return;
    }
  }
  // a step with no move of its own: play the full cycle —
  // lift & reseat for raises, press & spring-back for soft fills, and for
  // flip pairs: roll over with the part hovering, glue it on, roll back
  stage.setSeparation('seated', true);
  if (stage.motion === 'flip') {
    animTimer = setTimeout(() => stage.setSeparation('separated'), 250);
    animTimer2 = setTimeout(() => stage.setSeparation('flipped'), 3600);
    animTimer3 = setTimeout(() => stage.setSeparation('seated'), 5700);
    return;
  }
  animTimer = setTimeout(() => stage.setSeparation('separated'), 250);
  animTimer2 = setTimeout(() => stage.setSeparation('seated'), 2600);
});
addEventListener('keydown', e => {
  const t = e.target;
  if (t && t.closest && t.closest('input,textarea')) return;
  if (quizBlocksKeys()) return;
  if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); go(1); }
  if (e.key === 'ArrowLeft') go(-1);
});

/* ---------- glossary popover ---------- */
let pop = null;
function bindGloss() {
  document.querySelectorAll('.gloss').forEach(b => b.addEventListener('click', e => {
    e.stopPropagation();
    pop?.remove();
    pop = document.createElement('div');
    pop.className = 'gloss-pop';
    pop.textContent = b.dataset.def;
    document.body.appendChild(pop);
    const r = b.getBoundingClientRect();
    pop.style.left = `${Math.min(r.left, innerWidth - 340)}px`;
    pop.style.top = `${r.bottom + 8}px`;
  }));
}
document.addEventListener('click', () => { pop?.remove(); pop = null; });

/* ---------- sidebar: chapters open like a course player, lessons under them ----
   Click a chapter to open its lesson list. Click a lesson to load it. The
   chapter you are in stays open; lessons you have opened get a tick. */
els.sideNav.innerHTML = CHAPTERS.map((ch, ci) => `
  <div class="nav-ch" data-ch="${ci}">
    <button class="nav-ch-btn" data-ch="${ci}">
      <span class="n">${String(ch.number).padStart(2, '0')}</span>
      <span class="t">${ch.title}</span>
      <span class="c">${ch.lessons.length}<i class="chev"></i></span>
    </button>
    <div class="nav-ls">
      ${ch.lessons.map((ls, li) => `
      <button class="nav-ls-btn" data-ch="${ci}" data-ls="${li}"><i>${li + 1}</i><span>${ls.title}</span></button>`).join('')}
    </div>
  </div>`).join('');
els.sideNav.querySelectorAll('.nav-ch-btn').forEach(btn => btn.addEventListener('click', () => {
  const wrap = btn.parentElement;
  const wasOpen = wrap.classList.contains('on');
  els.sideNav.querySelectorAll('.nav-ch').forEach(el => el.classList.remove('on'));
  if (!wasOpen) wrap.classList.add('on');
}));
els.sideNav.querySelectorAll('.nav-ls-btn').forEach(btn => btn.addEventListener('click', () => {
  if (navLock) return;
  state.chapter = +btn.dataset.ch; state.lesson = +btn.dataset.ls;
  renderLesson();
}));
function syncSideNav() {
  els.sideNav.querySelectorAll('.nav-ch').forEach(el =>
    el.classList.toggle('on', +el.dataset.ch === state.chapter));
  els.sideNav.querySelectorAll('.nav-ls-btn').forEach(el => {
    const on = +el.dataset.ch === state.chapter && +el.dataset.ls === state.lesson;
    const was = seen.has(`${el.dataset.ch}.${el.dataset.ls}`);
    el.classList.toggle('on', on);
    el.classList.toggle('seen', was);
    el.querySelector('i').innerHTML = was ? '&#10003;' : String(+el.dataset.ls + 1);
  });
  const on = els.sideNav.querySelector('.nav-ls-btn.on');
  on?.scrollIntoView({ block: 'nearest' });
}
els.welcomeLink.addEventListener('click', () => {
  els.sideNav.querySelectorAll('.nav-ls-btn').forEach(el => el.classList.remove('on'));
  showView('welcome');
});
document.getElementById('welcomeBegin').addEventListener('click', () => {
  state.chapter = 0; state.lesson = 0;
  renderLesson();
});
document.getElementById('sideToggle').addEventListener('click', () =>
  els.side.classList.toggle('open'));

/* ---------- quiz ---------- */
function lastBookLesson() {
  for (let i = flatLessons.length - 1; i >= 0; i--) {
    const { ci, li } = flatLessons[i];
    if (CHAPTERS[ci].lessons[li].layout !== 'quiz') return flatLessons[i];
  }
  return flatLessons[0];
}
initQuiz({
  onBack: () => {
    const prv = lastBookLesson();
    state.chapter = prv.ci;
    state.lesson = prv.li;
    renderLesson();
  },
});

/* ---------- boot ---------- */
/* deep link: #lesson=1.4 opens chapter index 1, lesson index 4 */
const jump = location.hash.match(/lesson=(\d+)\.(\d+)(?:\.(\d+))?/);
if (jump) {
  state.chapter = Math.min(+jump[1], CHAPTERS.length - 1);
  state.lesson = Math.min(+jump[2], CHAPTERS[state.chapter].lessons.length - 1);
}
if (jump) {
  await renderLesson(false);
} else {
  showView('welcome');
}
if (jump && CHAPTERS[state.chapter].lessons[state.lesson].layout !== 'quiz') {
  const si = Math.min(+(jump[3] || 0), CHAPTERS[state.chapter].lessons[state.lesson].steps.length - 1);
  if (si) { state.step = si; renderStep(); }
  /* cover=N deep-links a selector chip — after the model is on stage */
  const cv = location.hash.match(/cover=(\d+)/);
  if (cv) selectCover(Math.min(+cv[1], COVER_VARIANTS.length - 1), true);
}
const introEl = document.getElementById('intro');
if (location.hash.length > 1) introEl?.classList.add('done');
