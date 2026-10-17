import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

// ---------- Palette ----------
const PALETTE = {
  sage: 0xe8ede4,
  ground: 0xc9d4c4,
  base: 0xd6d0c2,
  water: 0x6b9a9a,
  lake: 0x7aa6a6,
  ivory: 0xf0e9dc,
  beige: 0xd9d2c3,
  graygreen: 0x8a9a8a,
  dark: 0x4a5a52,
  columbia: 0x3a4a44,
  smith: 0xc9c2b4,
  smithRoof: 0x4a6a52,
  pikeRoof: 0xb87a5a,
  trunk: 0x6b5a4a,
  foliage1: 0x5a7a5a,
  foliage2: 0x4a6a4a,
  needle: 0x9aa098,
  needleDeck: 0xd9d2c3,
  glass: 0x8aa8a8,
};

// ---------- WebGL check ----------
const canvas = document.getElementById('scene');
let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
} catch (e) {
  renderer = null;
}
if (!renderer) {
  document.getElementById('fallback').classList.remove('hidden');
  throw new Error('WebGL unavailable');
}

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------- Scene ----------
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xe8ede4);
scene.fog = new THREE.Fog(0xe8ede4, 40, 90);

const aspect = window.innerWidth / window.innerHeight;
const frustumSize = 22;
const camera = new THREE.OrthographicCamera(
  -frustumSize * aspect / 2, frustumSize * aspect / 2,
  frustumSize / 2, -frustumSize / 2,
  0.1, 200
);
camera.position.set(13, 12, 13);
camera.lookAt(0, 1, 0);

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;

const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(window.innerWidth, window.innerHeight);
labelRenderer.domElement.style.position = 'absolute';
labelRenderer.domElement.style.top = '0';
labelRenderer.domElement.style.pointerEvents = 'none';
document.getElementById('labels').appendChild(labelRenderer.domElement);

// ---------- Controls ----------
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 1, 0);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.minDistance = 6;   // zoom limits via zoom property? orthographic uses zoom
controls.maxDistance = 60;
controls.minZoom = 0.6;
controls.maxZoom = 2.6;
controls.minPolarAngle = 0.15;
controls.maxPolarAngle = 1.35;
controls.autoRotate = false;
controls.autoRotateSpeed = 0.6;
controls.enablePan = false;

// ---------- Lighting ----------
const ambient = new THREE.AmbientLight(0xf0ece4, 0.55);
scene.add(ambient);
const hemi = new THREE.HemisphereLight(0xe8ede4, 0x6b7a6e, 0.35);
scene.add(hemi);
const sun = new THREE.DirectionalLight(0xfff3e0, 1.1);
sun.position.set(8, 16, 6);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -25; sun.shadow.camera.right = 25;
sun.shadow.camera.top = 25; sun.shadow.camera.bottom = -25;
sun.shadow.camera.near = 1; sun.shadow.camera.far = 60;
sun.shadow.bias = -0.0005;
scene.add(sun);
const fill = new THREE.DirectionalLight(0xd0e0e8, 0.25);
fill.position.set(-6, 8, -4);
scene.add(fill);

// ---------- Materials (reused) ----------
const M = {};
function mat(color, opts = {}) {
  return new THREE.MeshStandardMaterial({
    color, roughness: opts.r ?? 0.75, metalness: opts.m ?? 0,
    transparent: opts.t ?? false, opacity: opts.o ?? 1,
  });
}
function getMat(key, color, opts) {
  if (!M[key]) M[key] = mat(color, opts);
  return M[key];
}

const matGround = getMat('ground', PALETTE.ground, { r: 0.9 });
const matBase = getMat('base', PALETTE.base, { r: 0.85 });
const matWater = getMat('water', PALETTE.water, { r: 0.3, m: 0.1 });
const matLake = getMat('lake', PALETTE.lake, { r: 0.3 });
const matRoad = getMat('road', 0x9aa098, { r: 0.9 });
const matIvory = getMat('ivory', PALETTE.ivory, { r: 0.8 });
const matBeige = getMat('beige', PALETTE.beige, { r: 0.8 });
const matGrayGreen = getMat('gg', PALETTE.graygreen, { r: 0.75 });
const matDark = getMat('dark', PALETTE.dark, { r: 0.7 });
const matColumbia = getMat('col', PALETTE.columbia, { r: 0.65 });
const matSmith = getMat('smith', PALETTE.smith, { r: 0.7 });
const matSmithRoof = getMat('smithRoof', PALETTE.smithRoof, { r: 0.6 });
const matPikeRoof = getMat('pikeRoof', PALETTE.pikeRoof, { r: 0.7 });
const matTrunk = getMat('trunk', PALETTE.trunk, { r: 0.9 });
const matFol1 = getMat('fol1', PALETTE.foliage1, { r: 0.85 });
const matFol2 = getMat('fol2', PALETTE.foliage2, { r: 0.85 });
const matNeedle = getMat('needle', PALETTE.needle, { r: 0.5, m: 0.2 });
const matNeedleDeck = getMat('needleDeck', PALETTE.needleDeck, { r: 0.5 });
const matGlass = new THREE.MeshStandardMaterial({ color: PALETTE.glass, transparent: true, opacity: 0.45, roughness: 0.2, metalness: 0.1 });
const matSpire = getMat('spire', 0x9aa098, { r: 0.3, m: 0.4 });
const matPier = getMat('pier', 0xb8b0a0, { r: 0.85 });
const matWarehouse = getMat('wh', 0xc4bca8, { r: 0.8 });
const matFerryHull = getMat('fh', 0xf4efe6, { r: 0.6 });
const matFerryGreen = getMat('fg', 0x4a7a5a, { r: 0.6 });
const matWindow = new THREE.MeshStandardMaterial({ color: 0xffd9a0, emissive: 0xffb060, emissiveIntensity: 0, roughness: 0.4 });

// ---------- Geometry helpers ----------
const occluders = [];
const windowMeshes = [];
function addMesh(mesh, occluder = true) { scene.add(mesh); if (occluder) occluders.push(mesh); return mesh; }
function box(w, h, d) { return new THREE.BoxGeometry(w, h, d); }

// ---------- Reserved footprints ----------
const reserved = []; // {type, x, z, ...}
function reserveRect(x, z, w, d) { reserved.push({ type: 'rect', x, z, w, d }); }
function reserveCircle(x, z, r) { reserved.push({ type: 'circle', x, z, r }); }
function isReserved(x, z, margin = 0) {
  for (const r of reserved) {
    if (r.type === 'rect') {
      if (Math.abs(x - r.x) < r.w / 2 + margin && Math.abs(z - r.z) < r.d / 2 + margin) return true;
    } else {
      if ((x - r.x) ** 2 + (z - r.z) ** 2 < (r.r + margin) ** 2) return true;
    }
  }
  return false;
}
function isWaterRegion(x, z) {
  // Elliott Bay west of shore
  if (x < -7.2) return true;
  return false;
}
function isLakeRegion(x, z) {
  // Lake Union north
  if (z > 8.5 && x > -3.5 && x < 5.5) return true;
  if (z > 9.5 && x > -4.5 && x < 6.5) return true;
  return false;
}

// ---------- Base & terrain ----------
const baseSlab = new THREE.Mesh(new THREE.BoxGeometry(26, 0.35, 22), matBase);
baseSlab.position.set(0, -0.175, 1.5);
baseSlab.receiveShadow = true;
addMesh(baseSlab, false);

const ground = new THREE.Mesh(new THREE.PlaneGeometry(24, 20), matGround);
ground.rotation.x = -Math.PI / 2;
ground.position.set(0, 0.001, 1.5);
ground.receiveShadow = true;
addMesh(ground, false);

// Water plane (Elliott Bay) - subdivided for gentle animation
const waterSegs = 40;
const waterGeo = new THREE.PlaneGeometry(16, 22, waterSegs, waterSegs);
const water = new THREE.Mesh(waterGeo, matWater);
water.rotation.x = -Math.PI / 2;
water.position.set(-15, -0.04, 1.5);
water.receiveShadow = true;
addMesh(water, false);
const waterBase = waterGeo.attributes.position.array.slice();

// Lake Union
const lakeGeo = new THREE.PlaneGeometry(7, 6, 20, 20);
const lake = new THREE.Mesh(lakeGeo, matLake);
lake.rotation.x = -Math.PI / 2;
lake.position.set(1.2, -0.03, 10);
lake.receiveShadow = true;
addMesh(lake, false);

// Shoreline: a thin strip to avoid z-fight
const shore = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.05, 22), matBeige);
shore.position.set(-7.05, 0.025, 1.5);
addMesh(shore, false);

// ---------- Roads ----------
function addRoad(x, z, w, d) {
  const r = new THREE.Mesh(new THREE.BoxGeometry(w, 0.02, d), matRoad);
  r.position.set(x, 0.011, z);
  r.receiveShadow = true;
  addMesh(r, false);
}
// grid roads (between building cells)
for (let i = -6; i <= 6; i++) {
  addRoad(0, (i + 0.5) * 1.25 + 1.5, 18, 0.18);
}
for (let i = -7; i <= 7; i++) {
  addRoad((i + 0.5) * 1.25, 1.5, 0.18, 20);
}

// ---------- Piers ----------
const pierPositions = [-2, 0.5, 3];
for (const pz of pierPositions) {
  const pier = new THREE.Mesh(new THREE.BoxGeometry(7, 0.12, 1.0), matPier);
  pier.position.set(-10.5, 0.06, pz);
  pier.receiveShadow = true; pier.castShadow = true;
  addMesh(pier);
  // warehouse
  const wh = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.9, 0.7), matWarehouse);
  wh.position.set(-9, 0.45 + 0.12, pz);
  wh.castShadow = true; wh.receiveShadow = true;
  addMesh(wh);
  const wh2 = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.7, 0.6), matWarehouse);
  wh2.position.set(-11.2, 0.35 + 0.12, pz);
  wh2.castShadow = true; wh2.receiveShadow = true;
  addMesh(wh2);
}

// ---------- Great Wheel ----------
function buildGreatWheel(x, z) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  const supportMat = matPier;
  const rimMat = getMat('rim', 0x8a9a8a, { r: 0.4, m: 0.3 });
  // supports
  const s1 = new THREE.Mesh(new THREE.BoxGeometry(0.12, 3.2, 0.12), supportMat);
  s1.position.set(-0.6, 1.6, 0); s1.castShadow = true; g.add(s1);
  const s2 = new THREE.Mesh(new THREE.BoxGeometry(0.12, 3.2, 0.12), supportMat);
  s2.position.set(0.6, 1.6, 0); s2.castShadow = true; g.add(s2);
  const base = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.15, 0.6), supportMat);
  base.position.set(0, 0.075, 0); base.castShadow = true; g.add(base);
  // rim
  const rim = new THREE.Mesh(new THREE.TorusGeometry(1.0, 0.06, 12, 48), rimMat);
  rim.position.set(0, 2.6, 0); rim.castShadow = true; g.add(rim);
  // spokes
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const sp = new THREE.Mesh(new THREE.BoxGeometry(0.03, 1.0, 0.03), rimMat);
    sp.position.set(Math.cos(a) * 0.5, 2.6 + Math.sin(a) * 0.5, 0);
    sp.rotation.z = a;
    sp.castShadow = true;
    g.add(sp);
  }
  // gondolas
  const gonMat = getMat('gon', 0xf4efe6, { r: 0.5 });
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const gx = Math.cos(a) * 1.0;
    const gy = 2.6 + Math.sin(a) * 1.0;
    const gon = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.14, 0.12), gonMat);
    gon.position.set(gx, gy, 0.08);
    gon.castShadow = true;
    g.add(gon);
  }
  scene.add(g);
  // register occluders (children meshes)
  g.traverse(o => { if (o.isMesh) occluders.push(o); });
}
buildGreatWheel(-9, -2);

// ---------- Ferry ----------
function buildFerry(x, z) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  const hull = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.25, 0.6), matFerryHull);
  hull.position.y = 0.125; hull.castShadow = true; g.add(hull);
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.35, 0.5), matFerryGreen);
  cabin.position.set(-0.1, 0.425, 0); cabin.castShadow = true; g.add(cabin);
  const cabin2 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.25, 0.45), matFerryHull);
  cabin2.position.set(0.5, 0.35, 0); cabin2.castShadow = true; g.add(cabin2);
  scene.add(g);
  g.traverse(o => { if (o.isMesh) occluders.push(o); });
}
buildFerry(-12, 3);

// ---------- Tree geometries (shared) ----------
const treeGeoTrunk = new THREE.CylinderGeometry(0.05, 0.07, 0.6, 6);
const treeGeoFolA = new THREE.ConeGeometry(0.35, 0.9, 7);
const treeGeoFolB = new THREE.ConeGeometry(0.25, 0.7, 7);

// ---------- Space Needle ----------
function buildSpaceNeedle(x, z) {
  reserveCircle(x, z, 1.5);
  const g = new THREE.Group();
  g.position.set(x, 0, z);

  // legs
  const legMat = matNeedle;
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2 + Math.PI / 6;
    const bottom = new THREE.Vector3(Math.cos(a) * 0.95, 0, Math.sin(a) * 0.95);
    const top = new THREE.Vector3(Math.cos(a) * 0.5, 4.0, Math.sin(a) * 0.5);
    const mid = bottom.clone().add(top).multiplyScalar(0.5);
    const dir = top.clone().sub(bottom).normalize();
    const len = bottom.distanceTo(top);
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.13, len, 8), legMat);
    leg.position.copy(mid);
    leg.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
    leg.castShadow = true;
    g.add(leg);
  }
  // core
  const core = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.16, 4.2, 12), getMat('core', 0xb0a898, { r: 0.5 }));
  core.position.y = 2.1; core.castShadow = true; g.add(core);
  // deck (saucer)
  const deck = new THREE.Mesh(new THREE.CylinderGeometry(1.35, 1.35, 0.22, 24), matNeedleDeck);
  deck.position.y = 4.1; deck.castShadow = true; deck.receiveShadow = true; g.add(deck);
  // underside
  const under = new THREE.Mesh(new THREE.CylinderGeometry(1.25, 1.35, 0.12, 24), getMat('under', 0xa8a090, { r: 0.6 }));
  under.position.y = 3.92; under.castShadow = true; g.add(under);
  // glazed band
  const glass = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 1.05, 0.35, 24), matGlass);
  glass.position.y = 4.35; glass.castShadow = true; g.add(glass);
  // top platform
  const topPlat = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.85, 0.12, 20), matNeedleDeck);
  topPlat.position.y = 4.68; topPlat.castShadow = true; g.add(topPlat);
  // spire
  const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.08, 1.3, 8), matSpire);
  spire.position.y = 5.35; spire.castShadow = true; g.add(spire);
  const spireTip = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.3, 8), matSpire);
  spireTip.position.y = 6.15; spireTip.castShadow = true; g.add(spireTip);

  // grounds (green circle)
  const grounds = new THREE.Mesh(new THREE.CircleGeometry(2.2, 24), matGround);
  grounds.rotation.x = -Math.PI / 2;
  grounds.position.y = 0.002; grounds.receiveShadow = true; g.add(grounds);

  // low cultural buildings
  const cb1 = new THREE.Mesh(box(0.9, 0.5, 0.7), matBeige);
  cb1.position.set(1.8, 0.25, 0.6); cb1.castShadow = true; cb1.receiveShadow = true; g.add(cb1);
  const cb2 = new THREE.Mesh(box(0.7, 0.4, 0.6), matIvory);
  cb2.position.set(-1.6, 0.2, -0.8); cb2.castShadow = true; cb2.receiveShadow = true; g.add(cb2);

  scene.add(g);
  g.traverse(o => { if (o.isMesh) occluders.push(o); });

  // trees around
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    makeTree(x + Math.cos(a) * 1.9, z + Math.sin(a) * 1.9, 0.9);
  }
}
buildSpaceNeedle(-4.5, 6.5);

// ---------- Columbia Center ----------
function buildColumbiaCenter(x, z) {
  reserveRect(x, z, 1.5, 1.5);
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  // tier 1
  const t1 = new THREE.Mesh(box(1.5, 2.6, 1.5), matColumbia);
  t1.position.y = 1.3; t1.castShadow = true; t1.receiveShadow = true; g.add(t1);
  // tier 2
  const t2 = new THREE.Mesh(box(1.2, 3.0, 1.2), matColumbia);
  t2.position.y = 2.6 + 1.5; t2.castShadow = true; t2.receiveShadow = true; g.add(t2);
  // tier 3
  const t3 = new THREE.Mesh(box(0.9, 2.8, 0.9), matColumbia);
  t3.position.y = 5.6 + 1.4; t3.castShadow = true; t3.receiveShadow = true; g.add(t3);
  // bands
  for (let y of [1.0, 2.4, 4.0, 5.6, 7.0, 8.4]) {
    const b = new THREE.Mesh(box(1.52, 0.06, 1.52), getMat('band', 0x2f3f38, { r: 0.6 }));
    b.position.y = y; g.add(b);
  }
  scene.add(g);
  g.traverse(o => { if (o.isMesh) occluders.push(o); });
  // windows (dusk)
  addWindowsToBuilding(g, 1.5, 8.4, 1.5, 6);
}
buildColumbiaCenter(1.5, 0);

// ---------- Smith Tower ----------
function buildSmithTower(x, z) {
  reserveRect(x, z, 1.2, 1.2);
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  const shaft = new THREE.Mesh(box(1.0, 4.2, 1.0), matSmith);
  shaft.position.y = 2.1; shaft.castShadow = true; shaft.receiveShadow = true; g.add(shaft);
  // setbacks top
  const top1 = new THREE.Mesh(box(0.8, 0.6, 0.8), matSmith);
  top1.position.y = 4.5; top1.castShadow = true; g.add(top1);
  const top2 = new THREE.Mesh(box(0.6, 0.5, 0.6), matSmith);
  top2.position.y = 5.3; top2.castShadow = true; g.add(top2);
  // green roof (pyramid)
  const roof = new THREE.Mesh(new THREE.ConeGeometry(0.55, 1.1, 4), matSmithRoof);
  roof.position.y = 6.1; roof.rotation.y = Math.PI / 4; roof.castShadow = true; g.add(roof);
  // bands
  for (let y of [1.0, 2.2, 3.4]) {
    const b = new THREE.Mesh(box(1.02, 0.05, 1.02), getMat('band2', 0xb0a898, { r: 0.6 }));
    b.position.y = y; g.add(b);
  }
  scene.add(g);
  g.traverse(o => { if (o.isMesh) occluders.push(o); });
}
buildSmithTower(0.5, -2.5);

// ---------- Pike Place Market ----------
function buildPikePlace(x, z) {
  reserveRect(x, z, 2.2, 1.5);
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  const main = new THREE.Mesh(box(2.0, 0.7, 1.3), matBeige);
  main.position.y = 0.35; main.castShadow = true; main.receiveShadow = true; g.add(main);
  const wing = new THREE.Mesh(box(1.2, 0.5, 0.9), matIvory);
  wing.position.set(0.6, 0.25, 0.9); wing.castShadow = true; wing.receiveShadow = true; g.add(wing);
  // warm roof accents
  const roof1 = new THREE.Mesh(box(2.05, 0.08, 1.35), matPikeRoof);
  roof1.position.y = 0.74; roof1.castShadow = true; g.add(roof1);
  const roof2 = new THREE.Mesh(box(1.25, 0.08, 0.95), matPikeRoof);
  roof2.position.set(0.6, 0.54, 0.9); roof2.castShadow = true; g.add(roof2);
  scene.add(g);
  g.traverse(o => { if (o.isMesh) occluders.push(o); });
}
buildPikePlace(-6.2, -1);

// ---------- Trees ----------
function makeTree(x, z, scale = 1.0) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  const trunk = new THREE.Mesh(treeGeoTrunk, matTrunk);
  trunk.position.y = 0.3; trunk.scale.setScalar(scale); trunk.castShadow = true; g.add(trunk);
  const fol1 = new THREE.Mesh(treeGeoFolA, Math.random() > 0.5 ? matFol1 : matFol2);
  fol1.position.y = 0.95 * scale; fol1.scale.setScalar(scale); fol1.castShadow = true; g.add(fol1);
  const fol2 = new THREE.Mesh(treeGeoFolB, Math.random() > 0.5 ? matFol1 : matFol2);
  fol2.position.y = 1.35 * scale; fol2.scale.setScalar(scale); fol2.castShadow = true; g.add(fol2);
  scene.add(g);
  g.traverse(o => { if (o.isMesh) occluders.push(o); });
  return g;
}

// tree clusters
const treeSpots = [
  [-4.5, 6.5], // around needle handled separately
];
// landscaped areas
const greenPatches = [
  { x: -4.5, z: 6.5, r: 2.4 },
  { x: 2, z: 4, r: 1.2 },
  { x: -1, z: -3, r: 1.0 },
];
for (const gp of greenPatches) {
  const disc = new THREE.Mesh(new THREE.CircleGeometry(gp.r, 20), matGround);
  disc.rotation.x = -Math.PI / 2;
  disc.position.set(gp.x, 0.002, gp.z);
  disc.receiveShadow = true;
  addMesh(disc, false);
}

// scatter trees
const treeLocations = [];
for (let i = 0; i < 60; i++) {
  const x = (Math.random() * 14 - 7);
  const z = (Math.random() * 13 - 5);
  if (isWaterRegion(x, z) || isLakeRegion(x, z)) continue;
  if (isReserved(x, z, 0.6)) continue;
  treeLocations.push([x, z]);
}
for (const [x, z] of treeLocations) makeTree(x, z, 0.8 + Math.random() * 0.5);

// ---------- Procedural buildings ----------
const buildingColors = [PALETTE.ivory, PALETTE.beige, PALETTE.graygreen, PALETTE.ivory, PALETTE.beige];
function placeBuildings() {
  const cell = 1.25;
  for (let gx = -6; gx <= 6; gx++) {
    for (let gz = -5; gz <= 7; gz++) {
      const x = gx * cell + (Math.random() - 0.5) * 0.15;
      const z = gz * cell + (Math.random() - 0.5) * 0.15 + 1.5; // center offset
      // bounds
      if (x < -6.8 || x > 7.2) continue;
      if (isWaterRegion(x, z) || isLakeRegion(x, z)) continue;
      if (isReserved(x, z, 0.85)) continue;
      // skip road centers
      // height zone
      let zone = 'edge';
      if (x > -2 && x < 4 && z > -1 && z < 4) zone = 'core';
      else if (x > -4 && x < 5.5 && z > -3 && z < 5.5) zone = 'mid';
      // distance falloff for height
      const dist = Math.sqrt(x * x + (z - 1.5) * (z - 1.5));
      let h;
      if (zone === 'core') h = 3.2 + Math.random() * 3.0;
      else if (zone === 'mid') h = 1.6 + Math.random() * 1.8;
      else h = 0.8 + Math.random() * 1.1;
      // step down edges
      if (dist > 6) h *= 0.7;
      const w = 0.7 + Math.random() * 0.35;
      const d = 0.7 + Math.random() * 0.35;
      const color = buildingColors[Math.floor(Math.random() * buildingColors.length)];
      const isDark = (zone === 'core' && Math.random() < 0.25);
      const matColor = isDark ? PALETTE.dark : color;

      const mesh = new THREE.Mesh(box(w, h, d), mat(matColor, { r: 0.75 }));
      mesh.position.set(x, h / 2, z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      addMesh(mesh);

      // bands for tall buildings
      if (h > 3.2) {
        const bandCount = 2 + Math.floor(Math.random() * 2);
        for (let b = 0; b < bandCount; b++) {
          const by = (h / (bandCount + 1)) * (b + 1);
          const band = new THREE.Mesh(box(w + 0.03, 0.05, d + 0.03), getMat('band3', 0x9aa098, { r: 0.6 }));
          band.position.set(x, by, z);
          addMesh(band);
        }
        // windows for a few
        if (Math.random() < 0.4) addWindowsToBuilding(mesh, w, h, d, 4);
      }
    }
  }
}
placeBuildings();

// ---------- Windows helper ----------
function addWindowsToBuilding(buildingMesh, w, h, d, count) {
  const wm = matWindow;
  // front face (z+)
  for (let i = 0; i < count; i++) {
    const wy = 0.6 + Math.random() * (h - 1.2);
    const wx = (Math.random() - 0.5) * (w - 0.3);
    const win = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.16, 0.02), wm);
    win.position.set(wx, wy - h / 2, d / 2 + 0.01);
    buildingMesh.add(win);
    windowMeshes.push(win);
  }
  // back face
  for (let i = 0; i < Math.floor(count / 2); i++) {
    const wy = 0.6 + Math.random() * (h - 1.2);
    const wx = (Math.random() - 0.5) * (w - 0.3);
    const win = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.16, 0.02), wm);
    win.position.set(wx, wy - h / 2, -d / 2 - 0.01);
    buildingMesh.add(win);
    windowMeshes.push(win);
  }
}

// ---------- Labels ----------
const labelsContainer = document.getElementById('labels');
const labelDefs = [
  { name: 'Space Needle', anchor: new THREE.Vector3(-4.5, 6.4, 6.5), priority: 3 },
  { name: 'Downtown', anchor: new THREE.Vector3(1.5, 8.5, 0), priority: 2 },
  { name: 'Elliott Bay', anchor: new THREE.Vector3(-10, 0.5, 1.5), priority: 1 },
  { name: 'Pike Place', anchor: new THREE.Vector3(-6.2, 1.0, -1), priority: 2 },
  { name: 'Lake Union', anchor: new THREE.Vector3(1.2, 0.5, 10), priority: 1 },
];
const labelEls = labelDefs.map(ld => {
  const el = document.createElement('div');
  el.className = 'label';
  el.textContent = ld.name;
  labelsContainer.appendChild(el);
  return { el, ...ld, screen: new THREE.Vector2() };
});

const raycaster = new THREE.Raycaster();

function updateLabels() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  // compute screen positions
  const positions = labelEls.map(l => {
    const v = l.anchor.clone().project(camera);
    const sx = (v.x * 0.5 + 0.5) * w;
    const sy = (-v.y * 0.5 + 0.5) * h;
    const inFront = v.z < 1 && v.z > -1;
    // occlusion test
    let occluded = false;
    if (inFront) {
      const dir = l.anchor.clone().sub(camera.position).normalize();
      const dist = l.anchor.distanceTo(camera.position);
      raycaster.set(camera.position, dir);
      const hits = raycaster.intersectObjects(occluders, true);
      if (hits.length && hits[0].distance < dist - 0.5) occluded = true;
    }
    return { l, sx, sy, inFront, occluded };
  });
  // crowding: hide if too close to a higher-priority visible label
  const visible = [];
  // sort by priority desc
  const order = positions.slice().sort((a, b) => b.l.priority - a.l.priority);
  for (const p of order) {
    if (!p.inFront || p.occluded) { p.l.el.classList.remove('visible'); continue; }
    let crowded = false;
    for (const v of visible) {
      const dx = p.sx - v.sx;
      const dy = p.sy - v.sy;
      if (Math.sqrt(dx * dx + dy * dy) < 90) { crowded = true; break; }
    }
    if (crowded) { p.l.el.classList.remove('visible'); }
    else {
      p.l.el.classList.add('visible');
      p.l.el.style.left = p.sx + 'px';
      p.l.el.style.top = p.sy + 'px';
      visible.push(p);
    }
  }
}

// ---------- Viewpoints ----------
const views = {
  city: { pos: new THREE.Vector3(13, 12, 13), target: new THREE.Vector3(0, 1, 0), zoom: 1.0, info: ['THE EMERALD CITY', 'Land, sea & skyline', 'Orbit a miniature Seattle, from the Space Needle to the piers of Elliott Bay.', '01 — CITY OVERVIEW'] },
  needle: { pos: new THREE.Vector3(-2, 6, 9), target: new THREE.Vector3(-4.5, 3, 6.5), zoom: 1.6, info: ['LANDMARK', 'Space Needle', 'Three tapered legs, a slender core, and a saucer deck above the city.', '02 — SPACE NEEDLE'] },
  waterfront: { pos: new THREE.Vector3(-12, 8, -1), target: new THREE.Vector3(-8, 1.5, -1), zoom: 1.3, info: ['WATERFRONT', 'Elliott Bay & piers', 'Piers, warehouses, the Great Wheel, and a ferry on the bay.', '03 — WATERFRONT'] },
  downtown: { pos: new THREE.Vector3(6, 9, -2), target: new THREE.Vector3(1.5, 3, 0), zoom: 1.4, info: ['SKYLINE', 'Downtown Seattle', 'Columbia Center, Smith Tower, and the stepped urban grid.', '04 — DOWNTOWN'] },
};

const infoEyebrow = document.querySelector('.ip-eyebrow');
const infoHeading = document.querySelector('.ip-heading');
const infoDesc = document.querySelector('.ip-desc');
const infoNum = document.querySelector('.ip-num');

function updateInfoPanel(v) {
  infoEyebrow.textContent = v.info[0];
  infoHeading.textContent = v.info[1];
  infoDesc.textContent = v.info[2];
  infoNum.textContent = v.info[3];
}

let currentView = 'city';
let transitioning = false;
let transitionAbort = false;
function easeInOutCubic(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }

function goToView(name) {
  if (!views[name]) return;
  currentView = name;
  // update buttons
  document.querySelectorAll('.vs-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.view === name);
  });
  const v = views[name];
  updateInfoPanel(v);
  const startPos = camera.position.clone();
  const startTarget = controls.target.clone();
  const startZoom = camera.zoom;
  const endPos = v.pos.clone();
  const endTarget = v.target.clone();
  const endZoom = v.zoom;
  const duration = reducedMotion ? 0 : 900;
  const t0 = performance.now();
  transitioning = true;
  controls.enabled = false;
  transitionAbort = false;
  function step(now) {
    if (transitionAbort) { transitioning = false; transitionAbort = false; controls.enabled = true; return; }
    const t = duration === 0 ? 1 : Math.min(1, (now - t0) / duration);
    const e = easeInOutCubic(t);
    camera.position.lerpVectors(startPos, endPos, e);
    controls.target.lerpVectors(startTarget, endTarget, e);
    camera.zoom = startZoom + (endZoom - startZoom) * e;
    camera.updateProjectionMatrix();
    if (t < 1) requestAnimationFrame(step);
    else { transitioning = false; controls.enabled = true; }
  }
  requestAnimationFrame(step);
}

// ---------- Day/Night ----------
let isDusk = false;
function setDusk(on) {
  isDusk = on;
  document.getElementById('btnDay').classList.toggle('active', on);
  document.getElementById('btnDay').textContent = on ? 'Day' : 'Dusk';
  if (on) {
    scene.background = new THREE.Color(0x2a3540);
    scene.fog = new THREE.Fog(0x2a3540, 30, 70);
    ambient.intensity = 0.25;
    ambient.color.set(0x6a7a90);
    hemi.intensity = 0.15;
    sun.intensity = 0.35;
    sun.color.set(0xffb080);
    fill.intensity = 0.15;
    // windows on
    for (const w of windowMeshes) {
      w.visible = true;
    }
    matWindow.emissiveIntensity = 1.2;
  } else {
    scene.background = new THREE.Color(0xe8ede4);
    scene.fog = new THREE.Fog(0xe8ede4, 40, 90);
    ambient.intensity = 0.55;
    ambient.color.set(0xf0ece4);
    hemi.intensity = 0.35;
    sun.intensity = 1.1;
    sun.color.set(0xfff3e0);
    fill.intensity = 0.25;
    matWindow.emissiveIntensity = 0;
    for (const w of windowMeshes) { w.visible = false; }
  }
}

// ---------- Auto orbit ----------
let autoOrbit = false;
function setAutoOrbit(on) {
  autoOrbit = on;
  document.getElementById('btnOrbit').classList.toggle('active', on);
  controls.autoRotate = on && !dragging;
}

let dragging = false;
controls.addEventListener('start', () => {
  dragging = true;
  transitionAbort = transitioning;
  if (autoOrbit) controls.autoRotate = false;
});
controls.addEventListener('end', () => {
  dragging = false;
  if (autoOrbit) controls.autoRotate = true;
});

// abort transition on manual interaction
renderer.domElement.addEventListener('mousedown', () => { if (transitioning) transitionAbort = true; });
renderer.domElement.addEventListener('touchstart', () => { if (transitioning) transitionAbort = true; }, { passive: true });
renderer.domElement.addEventListener('wheel', () => { if (transitioning) transitionAbort = true; }, { passive: true });

// ---------- UI wiring ----------
document.querySelectorAll('.vs-btn').forEach(b => {
  b.addEventListener('click', () => goToView(b.dataset.view));
});

document.getElementById('btnOrbit').addEventListener('click', () => setAutoOrbit(!autoOrbit));
document.getElementById('btnDay').addEventListener('click', () => setDusk(!isDusk));
document.getElementById('btnZoomIn').addEventListener('click', () => {
  camera.zoom = Math.min(controls.maxZoom, camera.zoom * 1.15);
  camera.updateProjectionMatrix();
});
document.getElementById('btnZoomOut').addEventListener('click', () => {
  camera.zoom = Math.max(controls.minZoom, camera.zoom / 1.15);
  camera.updateProjectionMatrix();
});
document.getElementById('btnReset').addEventListener('click', () => goToView('city'));

// ---------- Resize ----------
function onResize() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const a = w / h;
  camera.left = -frustumSize * a / 2;
  camera.right = frustumSize * a / 2;
  camera.top = frustumSize / 2;
  camera.bottom = -frustumSize / 2;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
  labelRenderer.setSize(w, h);
}
window.addEventListener('resize', onResize);

// ---------- Compass rotation ----------
const compassNeedle = document.querySelector('.compass-needle');
function updateCompass() {
  // rotate compass opposite to camera azimuth so N stays aligned
  const az = Math.atan2(camera.position.x - controls.target.x, camera.position.z - controls.target.z);
  if (compassNeedle) compassNeedle.style.transform = `rotate(${-az}rad)`;
}

// ---------- Animation loop ----------
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const dt = clock.getDelta();
  // water animation
  const arr = waterGeo.attributes.position.array;
  const t = performance.now() * 0.001;
  for (let i = 0; i < arr.length; i += 3) {
    const x = waterBase[i];
    const y = waterBase[i + 1];
    arr[i + 2] = Math.sin(x * 0.6 + t * 0.8) * 0.06 + Math.cos(y * 0.5 + t * 0.6) * 0.04;
  }
  waterGeo.attributes.position.needsUpdate = true;
  waterGeo.computeVertexNormals();

  if (!transitioning) controls.update();
  updateCompass();
  updateLabels();
  renderer.render(scene, camera);
  labelRenderer.render(scene, camera);
}
animate();

// initial view
goToView('city');
setDusk(false);
