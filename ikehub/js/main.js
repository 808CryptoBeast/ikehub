import * as THREE from "three";
import { OrbitControls }   from "three/addons/controls/OrbitControls.js";
import { EffectComposer }  from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass }      from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";

// ─────────────────────────────────────────────────────────────────────────────
// ASSET PATHS
// main.js lives in: ikehub/js/main.js
// images live in:  ikehub/assets/images/
// ─────────────────────────────────────────────────────────────────────────────
const IMAGE_BASE = new URL("../assets/images/", import.meta.url).href;

function img(file) {
  return `${IMAGE_BASE}${file}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// APP DATA
// ─────────────────────────────────────────────────────────────────────────────
const APPS = [
  {
    id: "culturalverse",
    title: "The Culturalverse",
    subtitle: "A living world of culture, story, memory, and identity.",
    description: "A narrative-first portal into cultural knowledge, story structures, and immersive heritage experiences across the Ikeverse ecosystem.",
    href: "https://808cryptobeast.github.io/culturalverse/",
    image: img("Culturalverse-icon.png"),
    color: 0xffb86b,
    status: "Story + Culture",
    tags: ["Immersive Story", "Culture Systems", "Memory Design", "Knowledge Access"]
  },
  {
    id: "living-knowledge",
    title: "The Living Knowledge Platform",
    subtitle: "Knowledge as a living, connected ecosystem.",
    description: "A platform for organizing, surfacing, and evolving knowledge through interlinked structures, editorial systems, and living archives.",
    href: "living-knowledge.html",
    image: img("thelivingknowledge.png"),
    color: 0x77f0b2,
    status: "Knowledge Engine",
    tags: ["Knowledge Graph", "Editorial System", "Learning Layer", "Living Archive"]
  },
  {
    id: "ikestar",
    title: "IkeStar",
    subtitle: "A celestial observatory rooted in navigation and sky knowledge.",
    description: "An interactive star experience inspired by Hawaiian wayfinding, celestial navigation, seasonal sky systems, and story-rich astronomical interpretation.",
    href: "https://808cryptobeast.github.io/Ikestar/",
    image: img("ikestar.png"),
    color: 0x67d9ff,
    status: "Sky Observatory",
    tags: ["Star Map", "Navigation", "Cultural Astronomy", "Seasonal Sky"]
  },
  {
    id: "cosmic-weave",
    title: "The Cosmic Weave",
    subtitle: "A connected field of myth, systems, and cosmic design.",
    description: "A visually rich exploratory layer connecting symbolic systems, narrative structures, worldbuilding, and the larger cosmology of the Ikeverse.",
    href: "https://808cryptobeast.github.io/Ikeverse/",
    image: img("KMicon.png"),
    color: 0xa88cff,
    status: "Cosmic Systems",
    tags: ["Worldbuilding", "Myth Systems", "Interconnection", "Cosmology"]
  }
];

const HUB_IMAGE  = img("ikehub.png");
const HUB_NAME   = "IkeHub";
const IDLE_DELAY = 7000;

// ─────────────────────────────────────────────────────────────────────────────
// DOM REFS
// ─────────────────────────────────────────────────────────────────────────────
const by         = (id) => document.getElementById(id);
const canvas     = by("scene");
const dockEl     = by("dock");
const liveEl     = by("live-region");
const elTitle    = by("detail-title");
const elSubtitle = by("detail-subtitle");
const elDesc     = by("detail-description");
const elTags     = by("detail-tags");
const elLaunch   = by("launch-link");
const elStatus   = by("status-text");
const elDot      = by("status-dot");
const elAppCount = by("meta-app-count");
const elMode     = by("meta-mode");
const btnReset   = by("reset-view-btn");
const btnNext    = by("focus-next-btn");

if (!canvas) {
  throw new Error("IkeHub could not find <canvas id=\"scene\">.");
}

elAppCount.textContent = String(APPS.length);

// ─────────────────────────────────────────────────────────────────────────────
// RENDERER
// ─────────────────────────────────────────────────────────────────────────────
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  powerPreference: "high-performance"
});

renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.02;

// ─────────────────────────────────────────────────────────────────────────────
// SCENE / CAMERA / COMPOSER
// ─────────────────────────────────────────────────────────────────────────────
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x02050c);
scene.fog = new THREE.FogExp2(0x030810, 0.014);

const camera = new THREE.PerspectiveCamera(
  46,
  window.innerWidth / window.innerHeight,
  0.1,
  500
);

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));

const bloom = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  0.13,
  0.30,
  0.76
);

composer.addPass(bloom);

// ─────────────────────────────────────────────────────────────────────────────
// CONTROLS
// ─────────────────────────────────────────────────────────────────────────────
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.055;
controls.enablePan = false;
controls.minDistance = 6;
controls.maxDistance = 28;
controls.minPolarAngle = 0.3;
controls.maxPolarAngle = 1.55;

// ─────────────────────────────────────────────────────────────────────────────
// GROUPS
// ─────────────────────────────────────────────────────────────────────────────
const world    = new THREE.Group();
const bgGroup  = new THREE.Group();
const envGroup = new THREE.Group();
const nodeRoot = new THREE.Group();
const connGrp  = new THREE.Group();

scene.add(world);
world.add(bgGroup, envGroup, nodeRoot, connGrp);

// ─────────────────────────────────────────────────────────────────────────────
// UTILS
// This wrapper keeps your older timer.update() / timer.getElapsed() loop working.
// THREE.Clock itself does not have update() or getElapsed().
// ─────────────────────────────────────────────────────────────────────────────
const timer = {
  clock: new THREE.Clock(),
  elapsed: 0,

  update() {
    this.elapsed = this.clock.getElapsedTime();
  },

  getElapsed() {
    return this.elapsed;
  }
};

const raycaster = new THREE.Raycaster();
const pointer   = new THREE.Vector2(10, 10);
const texCache  = new Map();
const texLoader = new THREE.TextureLoader();

function getTex(path) {
  if (!path) return null;
  if (texCache.has(path)) return texCache.get(path);

  const texture = texLoader.load(
    path,
    undefined,
    undefined,
    (err) => {
      console.warn("IkeHub texture failed to load:", path, err);
    }
  );

  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 8);
  texCache.set(path, texture);

  return texture;
}

// Deterministic per-app RNG
function seeded(s) {
  return () => {
    s = Math.imul(s ^ (s >>> 15), 0x2c1b3c6d);
    s = Math.imul(s ^ (s >>> 12), 0x297a2d39);
    s ^= s >>> 15;
    return (s >>> 0) / 0x100000000;
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// LAYOUT CONFIG
// ─────────────────────────────────────────────────────────────────────────────
function getLayout() {
  const w = window.innerWidth;

  if (w <= 680) {
    return {
      orbitR: 4.2,
      ellipseZ: 0.8,
      nodeScale: 0.78,
      camOvPos: new THREE.Vector3(0, 7.2, 14.6),
      camOvTgt: new THREE.Vector3(0, 1.0, 0),
      focusDist: 3.0,
      focusH: 2.8,
      mobile: true,
      tablet: false
    };
  }

  if (w <= 1080) {
    return {
      orbitR: 5.5,
      ellipseZ: 0.9,
      nodeScale: 0.87,
      camOvPos: new THREE.Vector3(0, 5.6, 15.0),
      camOvTgt: new THREE.Vector3(0, 1.2, 0),
      focusDist: 3.4,
      focusH: 2.1,
      mobile: false,
      tablet: true
    };
  }

  return {
    orbitR: 7.0,
    ellipseZ: 1.0,
    nodeScale: 0.96,
    camOvPos: new THREE.Vector3(0, 4.8, 15.8),
    camOvTgt: new THREE.Vector3(0, 1.25, 0),
    focusDist: 3.8,
    focusH: 1.65,
    mobile: false,
    tablet: false
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// STATE
// ─────────────────────────────────────────────────────────────────────────────
const state = {
  selected: null,
  hovered: null,
  spinning: true,
  lastInput: performance.now(),
  camTargetPos: new THREE.Vector3(),
  camTargetLook: new THREE.Vector3(),
  cfg: getLayout(),
  nodes: new Map(),
  pickable: [],
  dockBtns: new Map(),
  hub: {}
};

// ─────────────────────────────────────────────────────────────────────────────
// CANVAS HELPERS
// ─────────────────────────────────────────────────────────────────────────────
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function wrapText(ctx, text, x, y, maxW, lineH) {
  const words = text.split(" ");
  let line = "";
  let cy = y;

  words.forEach((word, i) => {
    const test = line + word + " ";

    if (ctx.measureText(test).width > maxW && i > 0) {
      ctx.fillText(line.trimEnd(), x, cy);
      line = word + " ";
      cy += lineH;
    } else {
      line = test;
    }
  });

  ctx.fillText(line.trimEnd(), x, cy);
}

function makeRadialTex(r, g, b, peak = 0.5, size = 256) {
  const c = document.createElement("canvas");
  c.width = c.height = size;

  const ctx = c.getContext("2d");
  const grd = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);

  grd.addColorStop(0, `rgba(${r},${g},${b},${peak})`);
  grd.addColorStop(0.42, `rgba(${r},${g},${b},${peak * 0.4})`);
  grd.addColorStop(1, `rgba(${r},${g},${b},0)`);

  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, size, size);

  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;

  return t;
}

// ─────────────────────────────────────────────────────────────────────────────
// PROCEDURAL PLANET TEXTURE
// ─────────────────────────────────────────────────────────────────────────────
function makePlanetTex(col, variant, size = 512) {
  const rng = seeded(variant * 137 + 91);
  const R = Math.round(col.r * 255);
  const G = Math.round(col.g * 255);
  const B = Math.round(col.b * 255);
  const lt = (v, d) => Math.min(v + d, 255);
  const dk = (v, d) => Math.max(v - d, 0);

  const c = document.createElement("canvas");
  c.width = c.height = size;

  const ctx = c.getContext("2d");

  const bg = ctx.createRadialGradient(size * 0.36, size * 0.32, 0, size / 2, size / 2, size * 0.56);
  bg.addColorStop(0.0, `rgb(${lt(R, 65)},${lt(G, 65)},${lt(B, 65)})`);
  bg.addColorStop(0.48, `rgb(${R},${G},${B})`);
  bg.addColorStop(1.0, `rgb(${dk(R, 55)},${dk(G, 55)},${dk(B, 55)})`);

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, size, size);

  if (variant === 0) {
    for (let i = 0; i < 8; i++) {
      ctx.save();
      ctx.translate(rng() * size, rng() * size);
      ctx.rotate(rng() * Math.PI);
      ctx.beginPath();
      ctx.ellipse(0, 0, 35 + rng() * 95, 22 + rng() * 65, 0, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${dk(R, 58)},${dk(G, 48)},${dk(B, 68)},${0.22 + rng() * 0.2})`;
      ctx.fill();
      ctx.restore();
    }

    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.arc(rng() * size, rng() * size, 8 + rng() * 30, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${lt(R, 58)},${lt(G, 42)},${lt(B, 18)},0.14)`;
      ctx.fill();
    }

    const haze = ctx.createLinearGradient(0, size * 0.7, 0, size);
    haze.addColorStop(0, `rgba(${lt(R, 38)},${lt(G, 18)},0,0)`);
    haze.addColorStop(1, `rgba(${lt(R, 38)},${lt(G, 18)},0,0.17)`);

    ctx.fillStyle = haze;
    ctx.fillRect(0, 0, size, size);
  } else if (variant === 1) {
    for (let i = 0; i < 6; i++) {
      const y0 = rng() * size;
      ctx.beginPath();
      ctx.moveTo(0, y0);

      for (let x = 0; x <= size; x += 22) {
        ctx.lineTo(x, y0 + Math.sin(x * 0.014 + rng() * 6) * 30 + Math.sin(x * 0.028 + i) * 14);
      }

      ctx.lineWidth = 12 + rng() * 26;
      ctx.strokeStyle = `rgba(${lt(R, 28)},${lt(G, 52)},${lt(B, 24)},0.13)`;
      ctx.stroke();
    }

    for (let i = 0; i < 22; i++) {
      ctx.beginPath();
      ctx.arc(rng() * size, rng() * size, 2 + rng() * 8, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${0.06 + rng() * 0.12})`;
      ctx.fill();
    }
  } else if (variant === 2) {
    for (let i = 0; i < 18; i++) {
      ctx.beginPath();
      ctx.moveTo(rng() * size, rng() * size);
      ctx.lineTo(rng() * size, rng() * size);
      ctx.strokeStyle = `rgba(255,255,255,${0.06 + rng() * 0.12})`;
      ctx.lineWidth = 0.5 + rng() * 1.5;
      ctx.stroke();
    }

    for (let i = 0; i < 42; i++) {
      ctx.beginPath();
      ctx.arc(rng() * size, rng() * size, 0.8 + rng() * 2.4, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${0.3 + rng() * 0.7})`;
      ctx.fill();
    }

    const cap = ctx.createRadialGradient(size / 2, size * 0.06, 0, size / 2, size * 0.1, size * 0.36);
    cap.addColorStop(0, "rgba(255,255,255,0.6)");
    cap.addColorStop(1, "rgba(255,255,255,0)");

    ctx.fillStyle = cap;
    ctx.fillRect(0, 0, size, size);
  } else {
    for (let i = 0; i < 6; i++) {
      const cx2 = size * (0.18 + rng() * 0.64);
      const cy2 = size * (0.18 + rng() * 0.64);
      const sg = ctx.createRadialGradient(cx2, cy2, 0, cx2, cy2, 58 + rng() * 130);

      sg.addColorStop(0, `rgba(${lt(R, 72)},${lt(G, 72)},${lt(B, 88)},0.3)`);
      sg.addColorStop(1, `rgba(${R},${G},${B},0)`);

      ctx.fillStyle = sg;
      ctx.fillRect(0, 0, size, size);
    }

    for (let i = 0; i < 26; i++) {
      ctx.beginPath();
      ctx.arc(rng() * size, rng() * size, 0.8 + rng() * 2.2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${0.28 + rng() * 0.72})`;
      ctx.fill();
    }
  }

  const spec = ctx.createRadialGradient(size * 0.31, size * 0.25, 0, size * 0.42, size * 0.36, size * 0.24);
  spec.addColorStop(0, "rgba(255,255,255,0.24)");
  spec.addColorStop(1, "rgba(255,255,255,0)");

  ctx.fillStyle = spec;
  ctx.fillRect(0, 0, size, size);

  const limb = ctx.createRadialGradient(size / 2, size / 2, size * 0.38, size / 2, size / 2, size * 0.53);
  limb.addColorStop(0, "rgba(0,0,0,0)");
  limb.addColorStop(1, "rgba(0,0,0,0.42)");

  ctx.fillStyle = limb;
  ctx.fillRect(0, 0, size, size);

  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;

  return t;
}

// ─────────────────────────────────────────────────────────────────────────────
// ORBIT TEXT RING
// ─────────────────────────────────────────────────────────────────────────────
function makeOrbitTextTex(text, accentHex, size = 1024) {
  const c = document.createElement("canvas");
  c.width = c.height = size;

  const ctx = c.getContext("2d");
  ctx.clearRect(0, 0, size, size);

  const cx = size / 2;
  const cy = size / 2;
  const rad = size * 0.418;

  const sep = "  ·  ";
  const unit = text + sep;
  const charPx = size * 0.036;
  const perimChar = Math.ceil((Math.PI * 2 * rad) / charPx);
  const fullText = unit.repeat(Math.ceil(perimChar / unit.length) + 2);
  const chars = fullText.split("").slice(0, perimChar + 2);

  ctx.font = `600 ${Math.round(size * 0.035)}px 'DM Sans', sans-serif`;
  ctx.fillStyle = accentHex;
  ctx.shadowColor = accentHex;
  ctx.shadowBlur = size * 0.02;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  chars.forEach((ch, i) => {
    const angle = ((i / chars.length) * Math.PI * 2) - Math.PI / 2;

    ctx.save();
    ctx.translate(cx + Math.cos(angle) * rad, cy + Math.sin(angle) * rad);
    ctx.rotate(angle + Math.PI / 2);
    ctx.fillText(ch, 0, 0);
    ctx.restore();
  });

  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;

  return t;
}

// ─────────────────────────────────────────────────────────────────────────────
// CARD INFO TEXTURE
// ─────────────────────────────────────────────────────────────────────────────
function makeCardInfoTex(app) {
  const W = 1024;
  const H = 360;

  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;

  const ctx = c.getContext("2d");
  ctx.clearRect(0, 0, W, H);

  const hex = "#" + new THREE.Color(app.color).getHexString();

  ctx.fillStyle = hex;
  ctx.fillRect(0, 0, W, 5);

  ctx.fillStyle = "rgba(212,174,90,0.9)";
  ctx.font = "600 24px 'DM Sans', sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText("IKEVERSE APP", 40, 32);

  ctx.fillStyle = "rgba(228,241,255,0.98)";
  ctx.font = "800 52px 'DM Sans', sans-serif";
  ctx.textBaseline = "alphabetic";
  wrapText(ctx, app.title, 40, 126, W - 80, 58);

  roundRect(ctx, 40, 208, 222, 42, 16);
  ctx.fillStyle = hex + "28";
  ctx.fill();
  ctx.strokeStyle = hex + "66";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = hex;
  ctx.font = "700 21px 'DM Sans', sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(app.status.toUpperCase(), 58, 229);

  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;

  return t;
}

// ─────────────────────────────────────────────────────────────────────────────
// HUB TITLE
// ─────────────────────────────────────────────────────────────────────────────
function makeHubTitleTex(text) {
  const W = 920;
  const H = 170;

  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;

  const ctx = c.getContext("2d");
  ctx.clearRect(0, 0, W, H);

  ctx.shadowColor = "rgba(84,198,238,0.65)";
  ctx.shadowBlur = 30;
  ctx.fillStyle = "rgba(212,174,90,0.97)";
  ctx.font = "900 76px 'Orbitron', monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, W / 2, H / 2);

  ctx.shadowBlur = 0;
  ctx.fillStyle = "rgba(84,198,238,0.48)";
  ctx.fillRect(W / 2 - 84, H / 2 + 44, 168, 2);

  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;

  return t;
}

// ─────────────────────────────────────────────────────────────────────────────
// LIGHTS
// ─────────────────────────────────────────────────────────────────────────────
function makeLights() {
  scene.add(new THREE.AmbientLight(0xbdd8ff, 0.50));
  scene.add(new THREE.HemisphereLight(0x78beff, 0x04070f, 0.70));

  const key = new THREE.DirectionalLight(0xf4dea8, 1.52);
  key.position.set(7, 12, 9);
  scene.add(key);

  const rim = new THREE.PointLight(0x7a60ff, 13, 44, 2);
  rim.position.set(-9, 7, -10);
  scene.add(rim);

  const fill = new THREE.PointLight(0x44b4ee, 15, 36, 2);
  fill.position.set(9, 3, 11);
  scene.add(fill);

  const hf = new THREE.PointLight(0x55d4ff, 5, 11, 2);
  hf.position.set(0, 4, 0);
  scene.add(hf);

  state.hub.fillLight = hf;
}

// ─────────────────────────────────────────────────────────────────────────────
// BACKGROUND
// ─────────────────────────────────────────────────────────────────────────────
function addStars(count, minR, maxR, size, opacity, colors) {
  const pos = new Float32Array(count * 3);
  const col = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const r = minR + Math.random() * (maxR - minR);
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(Math.random() * 2 - 1);

    pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    pos[i * 3 + 1] = r * Math.cos(phi) * 0.70;
    pos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);

    const cl = colors[Math.floor(Math.random() * colors.length)];

    col[i * 3] = cl.r;
    col[i * 3 + 1] = cl.g;
    col[i * 3 + 2] = cl.b;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("color", new THREE.BufferAttribute(col, 3));

  bgGroup.add(new THREE.Points(
    geo,
    new THREE.PointsMaterial({
      size,
      transparent: true,
      opacity,
      depthWrite: false,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true
    })
  ));
}

function buildGalaxy(starCount, arms, spreadFactor, maxR) {
  const pos = new Float32Array(starCount * 3);
  const col = new Float32Array(starCount * 3);

  for (let i = 0; i < starCount; i++) {
    const arm = i % arms;
    const r = Math.pow(Math.random(), 0.55) * maxR;
    const spin = r * 0.50;
    const branch = (arm / arms) * Math.PI * 2;
    const scatter = (Math.random() - 0.5) * Math.max(r * spreadFactor, 1.5);
    const angle = branch + spin;

    pos[i * 3] = Math.cos(angle) * r + Math.cos(angle + 1.5708) * scatter;
    pos[i * 3 + 1] = (Math.random() - 0.5) * Math.max(r * 0.05, 0.4);
    pos[i * 3 + 2] = Math.sin(angle) * r + Math.sin(angle + 1.5708) * scatter;

    const frac = r / maxR;

    col[i * 3] = THREE.MathUtils.lerp(1.0, 0.44, frac);
    col[i * 3 + 1] = THREE.MathUtils.lerp(0.88, 0.60, frac);
    col[i * 3 + 2] = THREE.MathUtils.lerp(0.52, 1.0, frac);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("color", new THREE.BufferAttribute(col, 3));

  return geo;
}

function makeBackground() {
  addStars(2800, 90, 170, 0.065, 0.88, [
    new THREE.Color(0x9ed8ff),
    new THREE.Color(0xffffff),
    new THREE.Color(0xc2e4ff)
  ]);

  addStars(1000, 52, 95, 0.105, 0.65, [
    new THREE.Color(0xf6e8cc),
    new THREE.Color(0xb48cff),
    new THREE.Color(0x88ccff)
  ]);

  const galGeo = buildGalaxy(8000, 2, 0.28, 48);
  const galPts = new THREE.Points(
    galGeo,
    new THREE.PointsMaterial({
      size: 0.13,
      vertexColors: true,
      transparent: true,
      opacity: 0.56,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true
    })
  );

  galPts.position.set(-34, -18, -82);
  galPts.rotation.x = Math.PI * 0.18;
  galPts.rotation.z = Math.PI * 0.07;
  bgGroup.add(galPts);

  const galCore = new THREE.Sprite(new THREE.SpriteMaterial({
    map: makeRadialTex(255, 205, 140, 0.48, 256),
    transparent: true,
    opacity: 0.72,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  }));

  galCore.position.set(-34, -18, -82);
  galCore.scale.set(18, 12, 1);
  bgGroup.add(galCore);

  const gal2Geo = buildGalaxy(2200, 1, 0.5, 22);
  const gal2Pts = new THREE.Points(
    gal2Geo,
    new THREE.PointsMaterial({
      size: 0.09,
      vertexColors: true,
      transparent: true,
      opacity: 0.38,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true
    })
  );

  gal2Pts.position.set(55, 10, -105);
  gal2Pts.rotation.x = Math.PI * 0.06;
  gal2Pts.rotation.y = Math.PI * 0.3;
  bgGroup.add(gal2Pts);

  const gal2Core = new THREE.Sprite(new THREE.SpriteMaterial({
    map: makeRadialTex(180, 160, 240, 0.35, 128),
    transparent: true,
    opacity: 0.5,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  }));

  gal2Core.position.set(55, 10, -105);
  gal2Core.scale.set(10, 7, 1);
  bgGroup.add(gal2Core);

  [
    { x: 0, y: -22, z: -60, w: 160, h: 28, r: 88,  g: 110, b: 200, a: 0.10 },
    { x: 0, y: -16, z: -58, w: 140, h: 18, r: 120, g: 90,  b: 200, a: 0.07 }
  ].forEach(({ x, y, z, w, h, r, g, b, a }) => {
    const spr = new THREE.Sprite(new THREE.SpriteMaterial({
      map: makeRadialTex(r, g, b, a, 512),
      transparent: true,
      opacity: 1,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    }));

    spr.position.set(x, y, z);
    spr.scale.set(w, h, 1);
    bgGroup.add(spr);
  });

  [
    { rgb: [44, 122, 230],  alpha: 0.18, pos: [-22, 15, -42], w: 42, h: 24 },
    { rgb: [152, 76, 244],  alpha: 0.15, pos: [28, 9, -48],   w: 36, h: 21 },
    { rgb: [48, 198, 168],  alpha: 0.11, pos: [6, -6, -34],    w: 48, h: 26 },
    { rgb: [220, 120, 60],  alpha: 0.08, pos: [-50, 5, -90],   w: 55, h: 30 }
  ].forEach(({ rgb: [r, g, b], alpha, pos, w, h }) => {
    const spr = new THREE.Sprite(new THREE.SpriteMaterial({
      map: makeRadialTex(r, g, b, alpha, 512),
      transparent: true,
      opacity: 1,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    }));

    spr.position.set(...pos);
    spr.scale.set(w, h, 1);
    bgGroup.add(spr);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// ENVIRONMENT
// ─────────────────────────────────────────────────────────────────────────────
function makeEnv() {
  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(12.5, 80),
    new THREE.MeshBasicMaterial({
      color: 0x0b172e,
      transparent: true,
      opacity: 0.44,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })
  );

  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.5;
  envGroup.add(floor);

  [5.8, 8.6, 11.2].forEach((r, i) => {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(r, 0.018, 16, 180),
      new THREE.MeshBasicMaterial({
        color: i === 1 ? 0x283e7a : 0x192e58,
        transparent: true,
        opacity: i === 1 ? 0.17 : 0.11
      })
    );

    ring.rotation.x = Math.PI / 2;
    ring.position.y = -0.44;
    envGroup.add(ring);
  });

  const dustCount = 520;
  const dPos = new Float32Array(dustCount * 3);

  for (let i = 0; i < dustCount; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = 5.0 + Math.random() * 5.2;

    dPos[i * 3] = Math.cos(a) * r;
    dPos[i * 3 + 1] = -0.2 + (Math.random() - 0.5) * 0.13;
    dPos[i * 3 + 2] = Math.sin(a) * r;
  }

  const dGeo = new THREE.BufferGeometry();
  dGeo.setAttribute("position", new THREE.BufferAttribute(dPos, 3));

  const dust = new THREE.Points(
    dGeo,
    new THREE.PointsMaterial({
      color: 0x52b4ff,
      size: 0.030,
      opacity: 0.17,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    })
  );

  envGroup.userData.dust = dust;
  envGroup.add(dust);
}

// ─────────────────────────────────────────────────────────────────────────────
// HUB
// ─────────────────────────────────────────────────────────────────────────────
function makeHub() {
  const grp = new THREE.Group();
  const hubTex = getTex(HUB_IMAGE);

  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(1.80, 2.20, 0.50, 56),
    new THREE.MeshStandardMaterial({
      color: 0x0c1724,
      metalness: 0.64,
      roughness: 0.32
    })
  );

  base.position.y = 0.12;

  const hubCol = new THREE.Color(0x4488bb);
  const hubPlanetTex = makePlanetTex(hubCol, 4, 512);

  const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(1.24, 64, 64),
    new THREE.MeshPhysicalMaterial({
      map: hubPlanetTex,
      emissive: 0x18476e,
      emissiveIntensity: 0.18,
      metalness: 0.02,
      roughness: 0.28
    })
  );

  sphere.position.y = 1.8;

  const hubDecal = new THREE.Mesh(
    new THREE.SphereGeometry(1.255, 48, 48),
    new THREE.MeshBasicMaterial({
      map: hubTex || null,
      transparent: true,
      opacity: hubTex ? 0.88 : 0,
      depthWrite: false
    })
  );

  hubDecal.position.y = 1.8;

  const ringA = new THREE.Mesh(
    new THREE.TorusGeometry(2.48, 0.026, 20, 180),
    new THREE.MeshBasicMaterial({
      color: 0x54c6ee,
      transparent: true,
      opacity: 0.18
    })
  );

  ringA.position.y = 1.8;
  ringA.rotation.x = Math.PI / 2;

  const ringB = new THREE.Mesh(
    new THREE.TorusGeometry(2.04, 0.018, 16, 160),
    new THREE.MeshBasicMaterial({
      color: 0xd4ae5a,
      transparent: true,
      opacity: 0.15
    })
  );

  ringB.position.y = 1.8;
  ringB.rotation.x = Math.PI / 2;
  ringB.rotation.z = THREE.MathUtils.degToRad(32);

  const ringC = new THREE.Mesh(
    new THREE.TorusGeometry(1.62, 0.014, 14, 140),
    new THREE.MeshBasicMaterial({
      color: 0x9272f5,
      transparent: true,
      opacity: 0.12
    })
  );

  ringC.position.y = 1.8;
  ringC.rotation.x = Math.PI / 2;
  ringC.rotation.z = THREE.MathUtils.degToRad(-38);

  const glow = new THREE.Sprite(new THREE.SpriteMaterial({
    map: makeRadialTex(84, 198, 238, 0.14, 256),
    transparent: true,
    opacity: 1,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  }));

  glow.position.y = 1.8;
  glow.scale.set(4.8, 4.8, 1);

  const title = new THREE.Sprite(new THREE.SpriteMaterial({
    map: makeHubTitleTex(HUB_NAME),
    transparent: true,
    opacity: 0.95,
    depthWrite: false
  }));

  title.position.set(0, 3.58, 0);
  title.scale.set(3.50, 0.64, 1);

  grp.add(base, glow, ringA, ringB, ringC, sphere, hubDecal, title);
  world.add(grp);

  Object.assign(state.hub, {
    group: grp,
    base,
    sphere,
    hubDecal,
    ringA,
    ringB,
    ringC,
    glow,
    title
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// APP NODES
// ─────────────────────────────────────────────────────────────────────────────
function makeNodes() {
  APPS.forEach((app, idx) => {
    const group = new THREE.Group();
    group.userData = {
      appId: app.id,
      angle: (idx / APPS.length) * Math.PI * 2
    };

    const col = new THREE.Color(app.color);
    const hex = "#" + col.getHexString();
    const appTex = getTex(app.image);
    const colR = Math.round(col.r * 255);
    const colG = Math.round(col.g * 255);
    const colB = Math.round(col.b * 255);

    const ped = new THREE.Mesh(
      new THREE.CylinderGeometry(0.82, 1.0, 0.45, 40),
      new THREE.MeshStandardMaterial({
        color: 0x0d1726,
        metalness: 0.70,
        roughness: 0.26
      })
    );

    const track = new THREE.Mesh(
      new THREE.TorusGeometry(1.48, 0.011, 14, 160),
      new THREE.MeshBasicMaterial({
        color: app.color,
        transparent: true,
        opacity: 0.09
      })
    );

    track.rotation.x = Math.PI / 2;
    track.position.y = 1.34;

    const selRing = new THREE.Mesh(
      new THREE.TorusGeometry(1.08, 0.010, 14, 120),
      new THREE.MeshBasicMaterial({
        color: app.color,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      })
    );

    selRing.rotation.x = Math.PI / 2;
    selRing.position.y = 0.02;

    const orbPivot = new THREE.Group();
    orbPivot.position.y = 1.34;

    const planetTex = makePlanetTex(col, idx, 512);

    const orb = new THREE.Mesh(
      new THREE.SphereGeometry(0.82, 64, 64),
      new THREE.MeshPhysicalMaterial({
        map: planetTex,
        emissive: col.clone().multiplyScalar(0.07),
        emissiveIntensity: 0.25,
        roughness: 0.40,
        metalness: 0.04
      })
    );

    const decal = new THREE.Mesh(
      new THREE.SphereGeometry(0.836, 48, 48),
      new THREE.MeshBasicMaterial({
        map: appTex || null,
        transparent: true,
        opacity: appTex ? 0.82 : 0,
        depthWrite: false
      })
    );

    const atm = new THREE.Sprite(new THREE.SpriteMaterial({
      map: makeRadialTex(colR, colG, colB, 0.22, 256),
      transparent: true,
      opacity: 0.38,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    }));

    atm.scale.set(2.48, 2.48, 1);

    const textBillboard = new THREE.Group();
    const textSpin = new THREE.Group();

    const textRing = new THREE.Mesh(
      new THREE.CircleGeometry(2.02, 128),
      new THREE.MeshBasicMaterial({
        map: makeOrbitTextTex(app.title, hex),
        transparent: true,
        opacity: 0.82,
        side: THREE.DoubleSide,
        depthWrite: false
      })
    );

    textSpin.add(textRing);
    textBillboard.add(textSpin);
    orbPivot.add(orb, decal, atm, textBillboard);

    const cardGrp = new THREE.Group();
    cardGrp.position.set(0, 2.72, 0);
    cardGrp.visible = false;

    const cardBg = new THREE.Mesh(
      new THREE.PlaneGeometry(2.52, 1.78),
      new THREE.MeshPhysicalMaterial({
        color: 0x060c1a,
        transparent: true,
        opacity: 0,
        roughness: 0.18,
        metalness: 0.02
      })
    );

    const cardBorder = new THREE.Mesh(
      new THREE.PlaneGeometry(2.56, 1.82),
      new THREE.MeshBasicMaterial({
        color: app.color,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      })
    );

    cardBorder.position.z = -0.002;

    const cardImg = new THREE.Mesh(
      new THREE.PlaneGeometry(1.92, 0.90),
      new THREE.MeshBasicMaterial({
        color: appTex ? 0xffffff : app.color,
        map: appTex || null,
        transparent: true,
        opacity: 0
      })
    );

    cardImg.position.y = 0.24;

    const cardInfo = new THREE.Mesh(
      new THREE.PlaneGeometry(2.32, 0.60),
      new THREE.MeshBasicMaterial({
        map: makeCardInfoTex(app),
        transparent: true,
        opacity: 0
      })
    );

    cardInfo.position.y = -0.52;

    cardGrp.add(cardBorder, cardBg, cardImg, cardInfo);
    group.add(ped, track, selRing, orbPivot, cardGrp);

    [orb, ped, decal, cardBg, cardImg, cardInfo].forEach((m) => {
      m.userData.appId = app.id;
      state.pickable.push(m);
    });

    state.nodes.set(app.id, {
      app,
      group,
      ped,
      track,
      selRing,
      orbPivot,
      orb,
      decal,
      atm,
      textBillboard,
      textSpin,
      textRing,
      cardGrp,
      cardBg,
      cardBorder,
      cardImg,
      cardInfo,
      accentColor: col
    });

    nodeRoot.add(group);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// PLACE NODES
// ─────────────────────────────────────────────────────────────────────────────
function placeNodes() {
  const cfg = state.cfg;

  APPS.forEach((app) => {
    const nd = state.nodes.get(app.id);
    if (!nd) return;

    const angle = nd.group.userData.angle;

    nd.group.position.x = Math.cos(angle) * cfg.orbitR;
    nd.group.position.z = Math.sin(angle) * cfg.orbitR * cfg.ellipseZ;

    const s = cfg.nodeScale;

    nd.orbPivot.scale.setScalar(s);
    nd.track.scale.setScalar(s);
    nd.selRing.scale.setScalar(s);
    nd.cardGrp.scale.setScalar(s * 0.93);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// CONNECTIONS
// ─────────────────────────────────────────────────────────────────────────────
function makeConnections() {
  while (connGrp.children.length) {
    const c = connGrp.children[0];

    c.geometry?.dispose();
    c.material?.dispose();

    connGrp.remove(c);
  }

  const hub = new THREE.Vector3(0, 1.8, 0);

  APPS.forEach((app) => {
    const nd = state.nodes.get(app.id);
    if (!nd) return;

    const end = nd.group.position.clone();
    end.y = 1.34;

    const curve = new THREE.CatmullRomCurve3([
      hub.clone(),
      new THREE.Vector3(
        hub.x * 0.3 + end.x * 0.32,
        2.48,
        hub.z * 0.3 + end.z * 0.32
      ),
      new THREE.Vector3(
        hub.x * 0.25 + end.x * 0.74,
        2.14,
        hub.z * 0.25 + end.z * 0.74
      ),
      end
    ]);

    const geo = new THREE.BufferGeometry().setFromPoints(curve.getPoints(48));
    const mat = new THREE.LineDashedMaterial({
      color: app.color,
      transparent: true,
      opacity: 0.17,
      dashSize: 0.16,
      gapSize: 0.10
    });

    const line = new THREE.Line(geo, mat);
    line.computeLineDistances();

    connGrp.add(line);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// DOCK / UI
// ─────────────────────────────────────────────────────────────────────────────
function buildDock() {
  dockEl.innerHTML = "";
  state.dockBtns.clear();

  const ov = document.createElement("button");
  ov.type = "button";
  ov.className = "dock-btn";
  ov.textContent = "Overview";
  ov.addEventListener("click", () => resetView(true));

  dockEl.appendChild(ov);
  state.dockBtns.set("overview", ov);

  APPS.forEach((app, i) => {
    const btn = document.createElement("button");

    btn.type = "button";
    btn.className = "dock-btn";
    btn.textContent = `${i + 1}. ${app.title}`;
    btn.addEventListener("click", () => selectApp(app.id, true));

    dockEl.appendChild(btn);
    state.dockBtns.set(app.id, btn);
  });

  syncDock();
}

function syncDock() {
  state.dockBtns.forEach((btn, key) => {
    btn.classList.toggle(
      "active",
      state.selected === null ? key === "overview" : key === state.selected
    );
  });
}

function setPanel(app) {
  if (!app) {
    elTitle.textContent = "IkeHub";
    elSubtitle.textContent = "The gateway into the Ikeverse ecosystem.";
    elDesc.textContent = "Select an app portal to focus the camera, inspect the experience, and launch.";
    elStatus.textContent = "Showcase Portal";
    elDot.style.color = "#54c6ee";
    elLaunch.href = "#";
    elLaunch.textContent = "Select a Portal";
    elTags.innerHTML = "";

    ["Three.js", "Portal Hub", "App Showcase", "Ikeverse"].forEach(addTag);

    elMode.textContent = "Overview";
  } else {
    elTitle.textContent = app.title;
    elSubtitle.textContent = app.subtitle;
    elDesc.textContent = app.description;
    elStatus.textContent = app.status;
    elDot.style.color = "#" + new THREE.Color(app.color).getHexString();
    elLaunch.href = app.href;
    elLaunch.textContent = `Launch ${app.title}`;
    elTags.innerHTML = "";

    app.tags.forEach(addTag);

    elMode.textContent = "Focused";
    liveEl.textContent = `${app.title} selected`;
  }
}

function addTag(tag) {
  const s = document.createElement("span");

  s.className = "tag";
  s.textContent = tag;

  elTags.appendChild(s);
}

// ─────────────────────────────────────────────────────────────────────────────
// CAMERA
// ─────────────────────────────────────────────────────────────────────────────
function resetView(userInput = false) {
  state.selected = null;
  state.spinning = true;

  state.camTargetPos.copy(state.cfg.camOvPos);
  state.camTargetLook.copy(state.cfg.camOvTgt);
  controls.target.copy(state.cfg.camOvTgt);

  setPanel(null);
  syncDock();

  if (userInput) markInput();
}

function selectApp(appId, userInput = false) {
  const nd = state.nodes.get(appId);
  if (!nd) return;

  state.selected = appId;
  state.spinning = false;

  const worldPos = new THREE.Vector3();
  nd.group.getWorldPosition(worldPos);
  worldPos.y = 1.8;

  const dirXZ = new THREE.Vector3(worldPos.x, 0, worldPos.z).normalize();
  const camY = state.cfg.focusH + (state.cfg.mobile ? 0.7 : state.cfg.tablet ? 0.35 : 0);

  state.camTargetLook.copy(worldPos);
  state.camTargetPos.set(
    worldPos.x + dirXZ.x * state.cfg.focusDist,
    camY,
    worldPos.z + dirXZ.z * state.cfg.focusDist
  );

  setPanel(nd.app);
  syncDock();

  if (userInput) markInput();
}

function focusNext() {
  if (state.selected === null) {
    selectApp(APPS[0].id, true);
    return;
  }

  const idx = APPS.findIndex((a) => a.id === state.selected);
  selectApp(APPS[(idx + 1) % APPS.length].id, true);
}

function markInput() {
  state.lastInput = performance.now();
}

// ─────────────────────────────────────────────────────────────────────────────
// EVENTS
// ─────────────────────────────────────────────────────────────────────────────
function attachEvents() {
  renderer.domElement.addEventListener("pointermove", (e) => {
    const b = renderer.domElement.getBoundingClientRect();

    pointer.x = ((e.clientX - b.left) / b.width) * 2 - 1;
    pointer.y = -((e.clientY - b.top) / b.height) * 2 + 1;
  });

  renderer.domElement.addEventListener("pointerdown", markInput);

  renderer.domElement.addEventListener("click", () => {
    raycaster.setFromCamera(pointer, camera);

    const hits = raycaster.intersectObjects(state.pickable, false);

    if (!hits.length) return;

    const appId = hits[0].object.userData.appId;

    if (!appId) return;

    if (state.selected === appId) {
      const app = APPS.find((a) => a.id === appId);

      if (app?.href) {
        window.location.href = app.href;
      }

      return;
    }

    selectApp(appId, true);
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      resetView(true);
      return;
    }

    const n = Number(e.key);

    if (Number.isInteger(n) && n >= 1 && n <= APPS.length) {
      selectApp(APPS[n - 1].id, true);
    }
  });

  window.addEventListener("resize", onResize);

  btnReset.addEventListener("click", () => resetView(true));
  btnNext.addEventListener("click", focusNext);
}

function onResize() {
  state.cfg = getLayout();

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  composer.setSize(window.innerWidth, window.innerHeight);
  bloom.setSize(window.innerWidth, window.innerHeight);

  placeNodes();
  makeConnections();

  if (state.selected) {
    selectApp(state.selected, false);
  } else {
    resetView(false);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ANIMATION
// ─────────────────────────────────────────────────────────────────────────────
function updateHover() {
  raycaster.setFromCamera(pointer, camera);

  const hits = raycaster.intersectObjects(state.pickable, false);

  state.hovered = hits.length ? (hits[0].object.userData.appId ?? null) : null;

  document.body.style.cursor = state.hovered ? "pointer" : "default";
}

function updateHub() {
  const h = state.hub;

  if (!h.group) return;

  h.group.rotation.y += 0.0011;
  h.sphere.rotation.y += 0.0019;
  h.ringA.rotation.y += 0.0024;
  h.ringB.rotation.y -= 0.0042;
  h.ringC.rotation.y += 0.0058;
}

function updateNodes(t) {
  APPS.forEach((app, idx) => {
    const nd = state.nodes.get(app.id);

    if (!nd) return;

    const sel = state.selected === app.id;
    const hov = state.hovered === app.id;

    nd.orbPivot.position.y = 1.34 + Math.sin(t * 0.80 + idx * 1.1) * 0.09;
    nd.orb.rotation.y += 0.0034;
    nd.track.rotation.z += 0.0024 + idx * 0.0005;

    nd.selRing.rotation.z += 0.007;
    nd.selRing.material.opacity = THREE.MathUtils.lerp(
      nd.selRing.material.opacity,
      sel ? 0.34 : 0,
      0.074
    );

    nd.orb.material.emissiveIntensity = THREE.MathUtils.lerp(
      nd.orb.material.emissiveIntensity,
      sel ? 0.42 : hov ? 0.32 : 0.18,
      0.1
    );

    nd.atm.material.opacity = THREE.MathUtils.lerp(
      nd.atm.material.opacity,
      sel ? 0.58 : hov ? 0.48 : 0.32,
      0.1
    );

    nd.track.material.opacity = THREE.MathUtils.lerp(
      nd.track.material.opacity,
      sel ? 0.17 : hov ? 0.13 : 0.09,
      0.1
    );

    nd.textBillboard.lookAt(camera.position);

    const crawl = sel ? 0.010 : hov ? 0.006 : 0.0022;
    nd.textSpin.rotation.z -= crawl;

    nd.textRing.material.opacity = THREE.MathUtils.lerp(
      nd.textRing.material.opacity,
      sel ? 0.0 : hov ? 1.0 : 0.76,
      0.1
    );

    const cardTarget = sel ? 1.0 : 0.0;
    const prev = nd.cardBg.material.opacity;
    const next = THREE.MathUtils.lerp(prev, cardTarget, 0.074);

    nd.cardBg.material.opacity = next;
    nd.cardBorder.material.opacity = next * 0.12;
    nd.cardImg.material.opacity = next;
    nd.cardInfo.material.opacity = next;
    nd.cardGrp.visible = next > 0.01;

    if (nd.cardGrp.visible) {
      nd.cardGrp.lookAt(camera.position);
    }
  });
}

function updateBackground(t) {
  bgGroup.rotation.y = Math.sin(t * 0.034) * 0.014;

  if (envGroup.userData.dust) {
    envGroup.userData.dust.rotation.z += 0.00024;
  }
}

function updateCamera() {
  camera.position.lerp(state.camTargetPos, 0.052);
  controls.target.lerp(state.camTargetLook, 0.068);
  controls.update();
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN LOOP
// ─────────────────────────────────────────────────────────────────────────────
function onFrame() {
  timer.update();

  const t = timer.getElapsed();

  if (!state.spinning && state.selected === null && performance.now() - state.lastInput > IDLE_DELAY) {
    state.spinning = true;
  }

  if (state.spinning) {
    nodeRoot.rotation.y += 0.00095;
    connGrp.rotation.y += 0.00095;
  }

  updateHover();
  updateHub();
  updateNodes(t);
  updateBackground(t);
  updateCamera();

  composer.render();
}

// ─────────────────────────────────────────────────────────────────────────────
// INIT
// ─────────────────────────────────────────────────────────────────────────────
function init() {
  console.log("IkeHub main.js loaded:", import.meta.url);
  console.log("IkeHub image base:", IMAGE_BASE);
  console.log("IkeHub hub image:", HUB_IMAGE);

  makeLights();
  makeBackground();
  makeEnv();
  makeHub();
  makeNodes();
  placeNodes();
  makeConnections();
  buildDock();
  setPanel(null);
  resetView(false);
  attachEvents();

  renderer.setAnimationLoop(onFrame);
}

if (document.fonts?.ready) {
  document.fonts.ready.then(init).catch(init);
} else {
  init();
}