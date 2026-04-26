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
    live: true,
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
    live: false,
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
    live: true,
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
    live: true,
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
// ─────────────────────────────────────────────────────────────────────────────
const timer = {
  clock:   new THREE.Clock(),
  elapsed: 0,
  update()     { this.elapsed = this.clock.getElapsedTime(); },
  getElapsed() { return this.elapsed; }
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
    (err) => { console.warn("IkeHub texture failed:", path, err); }
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
      orbitR: 4.2, ellipseZ: 0.8, nodeScale: 0.78,
      camOvPos:  new THREE.Vector3(0, 7.2, 14.6),
      camOvTgt:  new THREE.Vector3(0, 1.0, 0),
      focusDist: 3.0, focusH: 2.8,
      mobile: true, tablet: false
    };
  }

  if (w <= 1080) {
    return {
      orbitR: 5.5, ellipseZ: 0.9, nodeScale: 0.87,
      camOvPos:  new THREE.Vector3(0, 5.6, 15.0),
      camOvTgt:  new THREE.Vector3(0, 1.2, 0),
      focusDist: 3.4, focusH: 2.1,
      mobile: false, tablet: true
    };
  }

  return {
    orbitR: 7.0, ellipseZ: 1.0, nodeScale: 0.96,
    camOvPos:  new THREE.Vector3(0, 4.8, 15.8),
    camOvTgt:  new THREE.Vector3(0, 1.25, 0),
    focusDist: 3.8, focusH: 1.65,
    mobile: false, tablet: false
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// STATE
// ─────────────────────────────────────────────────────────────────────────────
const state = {
  selected:       null,
  hovered:        null,
  spinning:       true,
  lastInput:      performance.now(),
  camTargetPos:   new THREE.Vector3(),
  camTargetLook:  new THREE.Vector3(),
  cameraLerping:  false,
  introActive:    true,
  introStart:     0,
  cfg:            getLayout(),
  nodes:          new Map(),
  pickable:       [],
  dockBtns:       new Map(),
  hub:            {}
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
  let cy   = y;

  words.forEach((word, i) => {
    const test = line + word + " ";
    if (ctx.measureText(test).width > maxW && i > 0) {
      ctx.fillText(line.trimEnd(), x, cy);
      line = word + " ";
      cy  += lineH;
    } else {
      line = test;
    }
  });

  ctx.fillText(line.trimEnd(), x, cy);
}

// Simple radial glow / halo texture
function makeRadialTex(r, g, b, peak = 0.5, size = 256) {
  const c   = document.createElement("canvas");
  c.width   = c.height = size;
  const ctx = c.getContext("2d");
  const grd = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
  grd.addColorStop(0,    `rgba(${r},${g},${b},${peak})`);
  grd.addColorStop(0.42, `rgba(${r},${g},${b},${peak * 0.4})`);
  grd.addColorStop(1,    `rgba(${r},${g},${b},0)`);
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, size, size);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// Multi-layer organic vapor / smoke texture — used around galaxy core
function makeVaporTex(r, g, b, size = 512) {
  const c   = document.createElement("canvas");
  c.width   = c.height = size;
  const ctx = c.getContext("2d");

  // Five offset radials at different centers/sizes = organic smoked-glass look
  const layers = [
    { ox: 0.50, oy: 0.50, lr: 0.50, a: 0.14 },
    { ox: 0.42, oy: 0.46, lr: 0.34, a: 0.10 },
    { ox: 0.58, oy: 0.54, lr: 0.38, a: 0.09 },
    { ox: 0.36, oy: 0.60, lr: 0.28, a: 0.07 },
    { ox: 0.64, oy: 0.40, lr: 0.26, a: 0.07 }
  ];

  layers.forEach(({ ox, oy, lr, a }) => {
    const grd = ctx.createRadialGradient(ox*size, oy*size, 0, ox*size, oy*size, lr*size);
    grd.addColorStop(0,   `rgba(${r},${g},${b},${a})`);
    grd.addColorStop(0.5, `rgba(${r},${g},${b},${a * 0.5})`);
    grd.addColorStop(1.0, `rgba(${r},${g},${b},0)`);
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, size, size);
  });

  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// ─────────────────────────────────────────────────────────────────────────────
// PROCEDURAL PLANET TEXTURE
// ─────────────────────────────────────────────────────────────────────────────
function makePlanetTex(col, variant, size = 512) {
  const rng = seeded(variant * 137 + 91);
  const R   = Math.round(col.r * 255);
  const G   = Math.round(col.g * 255);
  const B   = Math.round(col.b * 255);
  const lt  = (v, d) => Math.min(v + d, 255);
  const dk  = (v, d) => Math.max(v - d, 0);

  const c   = document.createElement("canvas");
  c.width   = c.height = size;
  const ctx = c.getContext("2d");

  // Spherical base — offset light source gives 3-D depth
  const bg = ctx.createRadialGradient(
    size * 0.36, size * 0.32, 0,
    size / 2,    size / 2,    size * 0.56
  );
  bg.addColorStop(0.0,  `rgb(${lt(R,65)},${lt(G,65)},${lt(B,65)})`);
  bg.addColorStop(0.48, `rgb(${R},${G},${B})`);
  bg.addColorStop(1.0,  `rgb(${dk(R,55)},${dk(G,55)},${dk(B,55)})`);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, size, size);

  if (variant === 0) {
    // CULTURALVERSE — earthy terrain, landmasses
    for (let i = 0; i < 8; i++) {
      ctx.save();
      ctx.translate(rng() * size, rng() * size);
      ctx.rotate(rng() * Math.PI);
      ctx.beginPath();
      ctx.ellipse(0, 0, 35 + rng()*95, 22 + rng()*65, 0, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${dk(R,58)},${dk(G,48)},${dk(B,68)},${0.22 + rng()*0.2})`;
      ctx.fill();
      ctx.restore();
    }
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.arc(rng()*size, rng()*size, 8 + rng()*30, 0, Math.PI*2);
      ctx.fillStyle = `rgba(${lt(R,58)},${lt(G,42)},${lt(B,18)},0.14)`;
      ctx.fill();
    }
    const haze = ctx.createLinearGradient(0, size*0.7, 0, size);
    haze.addColorStop(0, `rgba(${lt(R,38)},${lt(G,18)},0,0)`);
    haze.addColorStop(1, `rgba(${lt(R,38)},${lt(G,18)},0,0.17)`);
    ctx.fillStyle = haze;
    ctx.fillRect(0, 0, size, size);

  } else if (variant === 1) {
    // LIVING KNOWLEDGE — flowing organic bands, bioluminescent dots
    for (let i = 0; i < 6; i++) {
      const y0 = rng() * size;
      ctx.beginPath();
      ctx.moveTo(0, y0);
      for (let x = 0; x <= size; x += 22) {
        ctx.lineTo(x, y0 + Math.sin(x*0.014 + rng()*6)*30 + Math.sin(x*0.028 + i)*14);
      }
      ctx.lineWidth   = 12 + rng() * 26;
      ctx.strokeStyle = `rgba(${lt(R,28)},${lt(G,52)},${lt(B,24)},0.13)`;
      ctx.stroke();
    }
    for (let i = 0; i < 22; i++) {
      ctx.beginPath();
      ctx.arc(rng()*size, rng()*size, 2 + rng()*8, 0, Math.PI*2);
      ctx.fillStyle = `rgba(255,255,255,${0.06 + rng()*0.12})`;
      ctx.fill();
    }

  } else if (variant === 2) {
    // IKESTAR — icy crystal, star pinpoints, polar cap
    for (let i = 0; i < 18; i++) {
      ctx.beginPath();
      ctx.moveTo(rng()*size, rng()*size);
      ctx.lineTo(rng()*size, rng()*size);
      ctx.strokeStyle = `rgba(255,255,255,${0.06 + rng()*0.12})`;
      ctx.lineWidth   = 0.5 + rng() * 1.5;
      ctx.stroke();
    }
    for (let i = 0; i < 42; i++) {
      ctx.beginPath();
      ctx.arc(rng()*size, rng()*size, 0.8 + rng()*2.4, 0, Math.PI*2);
      ctx.fillStyle = `rgba(255,255,255,${0.3 + rng()*0.7})`;
      ctx.fill();
    }
    const cap = ctx.createRadialGradient(size/2, size*0.06, 0, size/2, size*0.1, size*0.36);
    cap.addColorStop(0, "rgba(255,255,255,0.6)");
    cap.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = cap;
    ctx.fillRect(0, 0, size, size);

  } else {
    // COSMIC WEAVE / HUB — nebula swirls, star dust
    for (let i = 0; i < 6; i++) {
      const cx2 = size * (0.18 + rng()*0.64);
      const cy2 = size * (0.18 + rng()*0.64);
      const sg  = ctx.createRadialGradient(cx2, cy2, 0, cx2, cy2, 58 + rng()*130);
      sg.addColorStop(0, `rgba(${lt(R,72)},${lt(G,72)},${lt(B,88)},0.3)`);
      sg.addColorStop(1, `rgba(${R},${G},${B},0)`);
      ctx.fillStyle = sg;
      ctx.fillRect(0, 0, size, size);
    }
    for (let i = 0; i < 26; i++) {
      ctx.beginPath();
      ctx.arc(rng()*size, rng()*size, 0.8 + rng()*2.2, 0, Math.PI*2);
      ctx.fillStyle = `rgba(255,255,255,${0.28 + rng()*0.72})`;
      ctx.fill();
    }
  }

  // Specular highlight — top-left shimmer
  const spec = ctx.createRadialGradient(
    size*0.31, size*0.25, 0,
    size*0.42, size*0.36, size*0.24
  );
  spec.addColorStop(0, "rgba(255,255,255,0.24)");
  spec.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = spec;
  ctx.fillRect(0, 0, size, size);

  // Limb darkening — dark ring at edge for spherical look
  const limb = ctx.createRadialGradient(size/2, size/2, size*0.38, size/2, size/2, size*0.53);
  limb.addColorStop(0, "rgba(0,0,0,0)");
  limb.addColorStop(1, "rgba(0,0,0,0.42)");
  ctx.fillStyle = limb;
  ctx.fillRect(0, 0, size, size);

  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// ─────────────────────────────────────────────────────────────────────────────
// ORBIT TEXT RING — billboard disc, ticker-crawl animation
// textBillboard.lookAt(camera) each frame keeps text facing viewer.
// textSpin.rotation.z decrements for the crawl effect.
// ─────────────────────────────────────────────────────────────────────────────
function makeOrbitTextTex(text, accentHex, size = 1024) {
  const c   = document.createElement("canvas");
  c.width   = c.height = size;
  const ctx = c.getContext("2d");
  ctx.clearRect(0, 0, size, size);

  const cx  = size / 2;
  const cy  = size / 2;
  const rad = size * 0.418;

  const sep       = "  ·  ";
  const unit      = text + sep;
  const charPx    = size * 0.036;
  const perimChar = Math.ceil((Math.PI * 2 * rad) / charPx);
  const fullText  = unit.repeat(Math.ceil(perimChar / unit.length) + 2);
  const chars     = fullText.split("").slice(0, perimChar + 2);

  ctx.font         = `600 ${Math.round(size * 0.035)}px 'DM Sans', sans-serif`;
  ctx.fillStyle    = accentHex;
  ctx.shadowColor  = accentHex;
  ctx.shadowBlur   = size * 0.02;
  ctx.textAlign    = "center";
  ctx.textBaseline = "middle";

  chars.forEach((ch, i) => {
    const angle = ((i / chars.length) * Math.PI * 2) - Math.PI / 2;
    ctx.save();
    ctx.translate(cx + Math.cos(angle) * rad, cy + Math.sin(angle) * rad);
    ctx.rotate(angle + Math.PI / 2); // tangent direction
    ctx.fillText(ch, 0, 0);
    ctx.restore();
  });

  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// ─────────────────────────────────────────────────────────────────────────────
// CARD TEXTURE — fully composited single canvas
// One plane, one texture = zero z-fighting / zero flickering.
// Includes: dark glass bg, accent border, icon, title, description, tags, hint.
// ─────────────────────────────────────────────────────────────────────────────
function makeCardTex(app, appTex) {
  const W = 1024, H = 680;
  const c   = document.createElement("canvas");
  c.width   = W; c.height = H;
  const ctx = c.getContext("2d");
  ctx.clearRect(0, 0, W, H);

  const hex = "#" + new THREE.Color(app.color).getHexString();

  // Dark glass background
  roundRect(ctx, 0, 0, W, H, 40);
  ctx.fillStyle = "rgba(4,9,22,0.94)";
  ctx.fill();

  // Accent border
  roundRect(ctx, 2, 2, W-4, H-4, 38);
  ctx.strokeStyle = hex + "55";
  ctx.lineWidth   = 2.5;
  ctx.stroke();

  // Top accent stripe
  roundRect(ctx, 0, 0, W, 6, 40);
  ctx.fillStyle = hex;
  ctx.fill();

  // App icon — draw from loaded image, else tinted circle
  const iconSize = 118, iconX = 40, iconY = 28;
  if (appTex && appTex.image && appTex.image.complete && appTex.image.naturalWidth > 0) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(iconX + iconSize/2, iconY + iconSize/2, iconSize/2, 0, Math.PI*2);
    ctx.clip();
    ctx.drawImage(appTex.image, iconX, iconY, iconSize, iconSize);
    ctx.restore();
  } else {
    ctx.beginPath();
    ctx.arc(iconX + iconSize/2, iconY + iconSize/2, iconSize/2, 0, Math.PI*2);
    ctx.fillStyle   = hex + "33";
    ctx.fill();
    ctx.strokeStyle = hex + "88";
    ctx.lineWidth   = 2;
    ctx.stroke();
  }

  // Status badge
  const bx = iconX + iconSize + 20, by2 = 44;
  roundRect(ctx, bx, by2, 210, 38, 19);
  ctx.fillStyle   = hex + "22"; ctx.fill();
  ctx.strokeStyle = hex + "66"; ctx.lineWidth = 1.5; ctx.stroke();

  // Status dot
  ctx.beginPath();
  ctx.arc(bx + 18, by2 + 19, 5, 0, Math.PI*2);
  ctx.fillStyle = hex; ctx.fill();

  ctx.fillStyle    = hex;
  ctx.font         = "600 20px 'DM Sans', sans-serif";
  ctx.textAlign    = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(app.status.toUpperCase(), bx + 32, by2 + 19);

  // Eyebrow
  ctx.fillStyle    = "rgba(212,174,90,0.88)";
  ctx.font         = "600 22px 'DM Sans', sans-serif";
  ctx.textBaseline = "top";
  ctx.fillText("IKEVERSE  ·  APP PORTAL", bx, by2 + 52);

  // Title
  ctx.fillStyle    = "rgba(228,241,255,0.98)";
  ctx.font         = "800 52px 'DM Sans', sans-serif";
  ctx.textBaseline = "alphabetic";
  wrapText(ctx, app.title, 40, 222, W - 60, 60);

  // Divider
  ctx.fillStyle = hex + "33";
  ctx.fillRect(40, 288, W - 80, 1);

  // Description
  ctx.fillStyle    = "rgba(174,194,228,0.82)";
  ctx.font         = "400 26px 'DM Sans', sans-serif";
  ctx.textBaseline = "top";
  wrapText(ctx, app.description, 40, 306, W - 80, 38);

  // Tag pills
  ctx.font = "500 20px 'DM Sans', sans-serif";
  let tx = 40, ty = 534;
  app.tags.slice(0, 4).forEach((tag) => {
    const tw = ctx.measureText(tag).width + 30;
    roundRect(ctx, tx, ty, tw, 34, 17);
    ctx.fillStyle   = "rgba(255,255,255,0.06)"; ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.12)"; ctx.lineWidth = 1; ctx.stroke();
    ctx.fillStyle    = "rgba(210,228,255,0.72)";
    ctx.textBaseline = "middle";
    ctx.fillText(tag, tx + 15, ty + 17);
    tx += tw + 12;
    if (tx > W - 120) { tx = 40; ty += 44; }
  });

  // Coming Soon overlay for non-live portals
  if (!app.live) {
    roundRect(ctx, W/2 - 160, H/2 - 36, 320, 72, 24);
    ctx.fillStyle   = "rgba(255,165,40,0.14)"; ctx.fill();
    ctx.strokeStyle = "rgba(255,165,40,0.52)"; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle    = "rgba(255,190,80,0.96)";
    ctx.font         = "700 30px 'DM Sans', sans-serif";
    ctx.textAlign    = "center"; ctx.textBaseline = "middle";
    ctx.shadowColor  = "rgba(255,160,40,0.6)"; ctx.shadowBlur = 10;
    ctx.fillText("🚧  Coming Soon", W/2, H/2);
    ctx.shadowBlur = 0;
  }

  // Launch hint
  ctx.fillStyle    = "rgba(140,160,200,0.46)";
  ctx.font         = "400 20px 'DM Sans', sans-serif";
  ctx.textAlign    = "left"; ctx.textBaseline = "alphabetic";
  ctx.fillText(app.live ? "Click again to launch →" : "In development — check back soon", 40, H - 22);

  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// ─────────────────────────────────────────────────────────────────────────────
// HUB TITLE — Cinzel Decorative (Roman monumental, fully legible)
// Two layers: main name + thin subtitle in DM Sans
// ─────────────────────────────────────────────────────────────────────────────
function makeHubTitleTex(text) {
  const W = 1200, H = 260;
  const c   = document.createElement("canvas");
  c.width   = W; c.height = H;
  const ctx = c.getContext("2d");
  ctx.clearRect(0, 0, W, H);

  // ── MAIN NAME — Cinzel Decorative, large, gold ──────────────────────────
  // Pass 1: wide gold aura
  ctx.shadowColor  = "rgba(212,174,90,0.65)";
  ctx.shadowBlur   = 42;
  ctx.fillStyle    = "rgba(218,181,88,0)";
  ctx.font         = "900 92px 'Cinzel Decorative', serif";
  ctx.textAlign    = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text.toUpperCase(), W/2, H/2 - 12);

  // Pass 2: cyan inner halo
  ctx.shadowColor = "rgba(84,198,238,0.38)";
  ctx.shadowBlur  = 18;
  ctx.fillStyle   = "rgba(218,181,88,0)";
  ctx.fillText(text.toUpperCase(), W/2, H/2 - 12);

  // Pass 3: main crisp fill
  ctx.shadowBlur  = 6;
  ctx.fillStyle   = "rgba(222,185,88,0.98)";
  ctx.fillText(text.toUpperCase(), W/2, H/2 - 12);

  // ── SUBTITLE — thin letterspace label below ─────────────────────────────
  ctx.shadowBlur  = 0;
  ctx.font        = "400 18px 'DM Sans', sans-serif";
  ctx.fillStyle   = "rgba(84,198,238,0.62)";
  ctx.letterSpacing = "0.3em";
  ctx.fillText("THE  IKEVERSE  PORTAL  HUB", W/2, H/2 + 56);
  ctx.letterSpacing = "0";

  // ── ACCENT LINE ─────────────────────────────────────────────────────────
  const uw = 220;
  const ug = ctx.createLinearGradient(W/2 - uw, 0, W/2 + uw, 0);
  ug.addColorStop(0,   "rgba(84,198,238,0)");
  ug.addColorStop(0.5, "rgba(84,198,238,0.46)");
  ug.addColorStop(1,   "rgba(84,198,238,0)");
  ctx.fillStyle = ug;
  ctx.fillRect(W/2 - uw, H/2 + 38, uw * 2, 1.5);

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
// BACKGROUND — three star layers + spiral galaxies + vapor + nebulas
// ─────────────────────────────────────────────────────────────────────────────
function addStars(count, minR, maxR, size, opacity, colors) {
  const pos = new Float32Array(count * 3);
  const col = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const r     = minR + Math.random() * (maxR - minR);
    const theta = Math.random() * Math.PI * 2;
    const phi   = Math.acos(Math.random() * 2 - 1);

    pos[i*3]   = r * Math.sin(phi) * Math.cos(theta);
    pos[i*3+1] = r * Math.cos(phi) * 0.70;
    pos[i*3+2] = r * Math.sin(phi) * Math.sin(theta);

    const cl   = colors[Math.floor(Math.random() * colors.length)];
    col[i*3]   = cl.r;
    col[i*3+1] = cl.g;
    col[i*3+2] = cl.b;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("color",    new THREE.BufferAttribute(col, 3));

  bgGroup.add(new THREE.Points(geo, new THREE.PointsMaterial({
    size,
    transparent: true,
    opacity,
    depthWrite: false,
    vertexColors: true,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true
  })));
}

function buildGalaxy(starCount, arms, spreadFactor, maxR) {
  const pos = new Float32Array(starCount * 3);
  const col = new Float32Array(starCount * 3);

  for (let i = 0; i < starCount; i++) {
    const arm    = i % arms;
    const r      = Math.pow(Math.random(), 0.55) * maxR;
    const spin   = r * 0.50;
    const branch = (arm / arms) * Math.PI * 2;
    const scatter = (Math.random() - 0.5) * Math.max(r * spreadFactor, 1.5);
    const angle  = branch + spin;

    pos[i*3]   = Math.cos(angle) * r + Math.cos(angle + 1.5708) * scatter;
    pos[i*3+1] = (Math.random() - 0.5) * Math.max(r * 0.05, 0.4);
    pos[i*3+2] = Math.sin(angle) * r + Math.sin(angle + 1.5708) * scatter;

    const frac = r / maxR;
    col[i*3]   = THREE.MathUtils.lerp(1.0, 0.44, frac);
    col[i*3+1] = THREE.MathUtils.lerp(0.88, 0.60, frac);
    col[i*3+2] = THREE.MathUtils.lerp(0.52, 1.0,  frac);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("color",    new THREE.BufferAttribute(col, 3));
  return geo;
}

function makeBackground() {
  // Layer 1 — distant blue-white stars
  addStars(2800, 90, 170, 0.065, 0.88, [
    new THREE.Color(0x9ed8ff),
    new THREE.Color(0xffffff),
    new THREE.Color(0xc2e4ff)
  ]);

  // Layer 2 — mid-field warm/purple stars
  addStars(1000, 52, 95, 0.105, 0.65, [
    new THREE.Color(0xf6e8cc),
    new THREE.Color(0xb48cff),
    new THREE.Color(0x88ccff)
  ]);

  // Layer 3 — close sparkle pinpoints (brighter, higher contrast)
  addStars(340, 22, 52, 0.16, 0.72, [
    new THREE.Color(0xffffff),
    new THREE.Color(0xddf0ff),
    new THREE.Color(0xffe8cc)
  ]);

  // ── MAIN SPIRAL GALAXY ────────────────────────────────────────────────────
  const galGeo = buildGalaxy(8000, 2, 0.28, 48);
  const galPts = new THREE.Points(galGeo, new THREE.PointsMaterial({
    size: 0.13, vertexColors: true, transparent: true, opacity: 0.56,
    depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true
  }));
  galPts.position.set(-34, -18, -82);
  galPts.rotation.x = Math.PI * 0.18;
  galPts.rotation.z = Math.PI * 0.07;
  bgGroup.add(galPts);

  // Galaxy core glow
  const galCore = new THREE.Sprite(new THREE.SpriteMaterial({
    map: makeRadialTex(255, 205, 140, 0.52, 256),
    transparent: true, opacity: 0.78,
    depthWrite: false, blending: THREE.AdditiveBlending
  }));
  galCore.position.set(-34, -18, -82);
  galCore.scale.set(20, 13, 1);
  bgGroup.add(galCore);

  // ── GALAXY VAPOR / SMOKE CLOUDS — animated, layered ──────────────────────
  const vaporDefs = [
    { pos: [-34,-18,-82], sc: [58,30,1], r:120, g:100, b:200 },
    { pos: [-44,-22,-80], sc: [42,23,1], r:80,  g:60,  b:180 },
    { pos: [-26,-14,-85], sc: [40,21,1], r:160, g:130, b:80  },
    { pos: [-34,-10,-78], sc: [50,19,1], r:100, g:80,  b:220 },
    { pos: [-20,-24,-88], sc: [38,25,1], r:80,  g:120, b:200 },
    { pos: [-50,-18,-86], sc: [44,21,1], r:140, g:100, b:60  },
    { pos: [-30,-28,-84], sc: [36,18,1], r:60,  g:80,  b:160 }
  ];

  const vaporSprites = [];

  vaporDefs.forEach(({ pos, sc, r, g, b }, i) => {
    const spr = new THREE.Sprite(new THREE.SpriteMaterial({
      map: makeVaporTex(r, g, b, 512),
      transparent: true,
      opacity: 0.72 + (i % 3) * 0.08,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    }));
    spr.position.set(...pos);
    spr.scale.set(...sc);
    spr.userData.phase  = i * 1.37;
    spr.userData.baseOp = 0.62 + (i % 3) * 0.10;
    bgGroup.add(spr);
    vaporSprites.push(spr);
  });

  bgGroup.userData.vaporSprites = vaporSprites;

  // ── SECOND GALAXY (elliptical, distant) ───────────────────────────────────
  const gal2Geo = buildGalaxy(2200, 1, 0.5, 22);
  const gal2Pts = new THREE.Points(gal2Geo, new THREE.PointsMaterial({
    size: 0.09, vertexColors: true, transparent: true, opacity: 0.38,
    depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true
  }));
  gal2Pts.position.set(55, 10, -105);
  gal2Pts.rotation.x = Math.PI * 0.06;
  gal2Pts.rotation.y = Math.PI * 0.3;
  bgGroup.add(gal2Pts);

  const gal2Core = new THREE.Sprite(new THREE.SpriteMaterial({
    map: makeRadialTex(180, 160, 240, 0.35, 128),
    transparent: true, opacity: 0.50,
    depthWrite: false, blending: THREE.AdditiveBlending
  }));
  gal2Core.position.set(55, 10, -105);
  gal2Core.scale.set(10, 7, 1);
  bgGroup.add(gal2Core);

  // Vapor for galaxy 2
  const v2 = new THREE.Sprite(new THREE.SpriteMaterial({
    map: makeVaporTex(140, 100, 220, 512),
    transparent: true, opacity: 0.55,
    depthWrite: false, blending: THREE.AdditiveBlending
  }));
  v2.position.set(55, 10, -105);
  v2.scale.set(30, 17, 1);
  bgGroup.add(v2);

  // ── THIRD GALAXY (barred spiral, high) ───────────────────────────────────
  const gal3Geo = buildGalaxy(3500, 4, 0.35, 30);
  const gal3Pts = new THREE.Points(gal3Geo, new THREE.PointsMaterial({
    size: 0.08, vertexColors: true, transparent: true, opacity: 0.28,
    depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true
  }));
  gal3Pts.position.set(8, 30, -120);
  gal3Pts.rotation.x = Math.PI * 0.40;
  gal3Pts.rotation.y = Math.PI * 0.15;
  bgGroup.add(gal3Pts);

  const gal3Core = new THREE.Sprite(new THREE.SpriteMaterial({
    map: makeRadialTex(200, 220, 255, 0.25, 128),
    transparent: true, opacity: 0.42,
    depthWrite: false, blending: THREE.AdditiveBlending
  }));
  gal3Core.position.set(8, 30, -120);
  gal3Core.scale.set(8, 5, 1);
  bgGroup.add(gal3Core);

  // ── MILKY WAY BAND ────────────────────────────────────────────────────────
  [
    { x: 0, y:-22, z:-60, w:165, h:30, r:88,  g:110, b:200, a:0.10 },
    { x: 0, y:-16, z:-58, w:145, h:18, r:120, g:90,  b:200, a:0.07 },
    { x: 0, y:-19, z:-62, w:130, h:14, r:160, g:140, b:255, a:0.06 }
  ].forEach(({ x, y, z, w, h, r, g, b, a }) => {
    const spr = new THREE.Sprite(new THREE.SpriteMaterial({
      map: makeRadialTex(r, g, b, a, 512),
      transparent: true, opacity: 1,
      depthWrite: false, blending: THREE.AdditiveBlending
    }));
    spr.position.set(x, y, z);
    spr.scale.set(w, h, 1);
    bgGroup.add(spr);
  });

  // ── NEBULA CLOUDS ─────────────────────────────────────────────────────────
  [
    { rgb: [44,  122, 230], alpha: 0.18, pos: [-22, 15, -42], w: 42, h: 24 },
    { rgb: [152, 76,  244], alpha: 0.15, pos: [28,  9,  -48], w: 36, h: 21 },
    { rgb: [48,  198, 168], alpha: 0.11, pos: [6,   -6, -34], w: 48, h: 26 },
    { rgb: [220, 120, 60],  alpha: 0.08, pos: [-50, 5,  -90], w: 55, h: 30 },
    { rgb: [60,  100, 220], alpha: 0.09, pos: [18,  20, -55], w: 38, h: 20 },
    { rgb: [200, 80,  160], alpha: 0.07, pos: [-8, -10, -46], w: 44, h: 22 },
    { rgb: [80,  200, 220], alpha: 0.07, pos: [42,  -8, -72], w: 50, h: 24 },
    { rgb: [220, 160, 60],  alpha: 0.06, pos: [-14, 25, -65], w: 40, h: 20 }
  ].forEach(({ rgb: [r, g, b], alpha, pos, w, h }) => {
    const spr = new THREE.Sprite(new THREE.SpriteMaterial({
      map: makeRadialTex(r, g, b, alpha, 512),
      transparent: true, opacity: 1,
      depthWrite: false, blending: THREE.AdditiveBlending
    }));
    spr.position.set(...pos);
    spr.scale.set(w, h, 1);
    bgGroup.add(spr);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// ENVIRONMENT — floor, orbit guide rings, dust band
// ─────────────────────────────────────────────────────────────────────────────
function makeEnv() {
  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(12.5, 80),
    new THREE.MeshBasicMaterial({
      color: 0x0b172e, transparent: true, opacity: 0.44,
      blending: THREE.AdditiveBlending, depthWrite: false
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
    dPos[i*3]   = Math.cos(a) * r;
    dPos[i*3+1] = -0.2 + (Math.random() - 0.5) * 0.13;
    dPos[i*3+2] = Math.sin(a) * r;
  }

  const dGeo = new THREE.BufferGeometry();
  dGeo.setAttribute("position", new THREE.BufferAttribute(dPos, 3));

  const dust = new THREE.Points(dGeo, new THREE.PointsMaterial({
    color: 0x52b4ff, size: 0.030, opacity: 0.17, transparent: true,
    depthWrite: false, blending: THREE.AdditiveBlending
  }));

  envGroup.userData.dust = dust;
  envGroup.add(dust);
}

// ─────────────────────────────────────────────────────────────────────────────
// HUB — sphere (planet tex + icon decal) + 3 rings + Old English title
// ─────────────────────────────────────────────────────────────────────────────
function makeHub() {
  const grp    = new THREE.Group();
  const hubTex = getTex(HUB_IMAGE);

  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(1.80, 2.20, 0.50, 56),
    new THREE.MeshStandardMaterial({ color: 0x0c1724, metalness: 0.64, roughness: 0.32 })
  );
  base.position.y = 0.12;

  const hubCol       = new THREE.Color(0x4488bb);
  const hubPlanetTex = makePlanetTex(hubCol, 4, 512);

  const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(1.24, 64, 64),
    new THREE.MeshPhysicalMaterial({
      map: hubPlanetTex,
      emissive: 0x18476e, emissiveIntensity: 0.18,
      metalness: 0.02, roughness: 0.28
    })
  );
  sphere.position.y = 1.8;

  // Icon decal — slightly larger sphere wraps icon on top of planet texture
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
    new THREE.MeshBasicMaterial({ color: 0x54c6ee, transparent: true, opacity: 0.18 })
  );
  ringA.position.y = 1.8;
  ringA.rotation.x = Math.PI / 2;

  const ringB = new THREE.Mesh(
    new THREE.TorusGeometry(2.04, 0.018, 16, 160),
    new THREE.MeshBasicMaterial({ color: 0xd4ae5a, transparent: true, opacity: 0.15 })
  );
  ringB.position.y = 1.8;
  ringB.rotation.x = Math.PI / 2;
  ringB.rotation.z = THREE.MathUtils.degToRad(32);

  const ringC = new THREE.Mesh(
    new THREE.TorusGeometry(1.62, 0.014, 14, 140),
    new THREE.MeshBasicMaterial({ color: 0x9272f5, transparent: true, opacity: 0.12 })
  );
  ringC.position.y = 1.8;
  ringC.rotation.x = Math.PI / 2;
  ringC.rotation.z = THREE.MathUtils.degToRad(-38);

  const glow = new THREE.Sprite(new THREE.SpriteMaterial({
    map: makeRadialTex(84, 198, 238, 0.14, 256),
    transparent: true, opacity: 1,
    depthWrite: false, blending: THREE.AdditiveBlending
  }));
  glow.position.y = 1.8;
  glow.scale.set(4.8, 4.8, 1);

  // Title uses UnifrakturMaguntia via makeHubTitleTex — larger sprite
  const title = new THREE.Sprite(new THREE.SpriteMaterial({
    map: makeHubTitleTex(HUB_NAME),
    transparent: true, opacity: 0.96,
    depthWrite: false
  }));
  title.position.set(0, 3.90, 0);
  title.scale.set(5.40, 1.16, 1);

  grp.add(base, glow, ringA, ringB, ringC, sphere, hubDecal, title);
  world.add(grp);

  Object.assign(state.hub, {
    group: grp, base, sphere, hubDecal,
    ringA, ringB, ringC, glow, title
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// APP NODES
//
// Per-node structure:
//   group
//     ├─ ped              pedestal
//     ├─ track            orbit torus
//     ├─ selRing          selection ring (floor, fades in)
//     ├─ orbPivot         bobs vertically
//     │    ├─ orb         planet sphere (procedural tex)
//     │    ├─ decal       slightly-larger sphere, app icon overlay
//     │    ├─ atm         atmospheric halo sprite
//     │    └─ textBillboard  Group → lookAt(camera) each frame
//     │         └─ textSpin  Group → rotation.z ticker crawl
//     │              └─ textRing  CircleGeometry disc
//     └─ cardGrp          SINGLE plane, opacity reveal (NO bob, NO flicker)
// ─────────────────────────────────────────────────────────────────────────────
function makeNodes() {
  APPS.forEach((app, idx) => {
    const group = new THREE.Group();
    group.userData = { appId: app.id, angle: (idx / APPS.length) * Math.PI * 2 };

    const col  = new THREE.Color(app.color);
    const hex  = "#" + col.getHexString();
    const appTex = getTex(app.image);
    const colR = Math.round(col.r * 255);
    const colG = Math.round(col.g * 255);
    const colB = Math.round(col.b * 255);

    // Pedestal
    const ped = new THREE.Mesh(
      new THREE.CylinderGeometry(0.82, 1.0, 0.45, 40),
      new THREE.MeshStandardMaterial({ color: 0x0d1726, metalness: 0.70, roughness: 0.26 })
    );

    // Orbit track ring
    const track = new THREE.Mesh(
      new THREE.TorusGeometry(1.48, 0.011, 14, 160),
      new THREE.MeshBasicMaterial({ color: app.color, transparent: true, opacity: 0.09 })
    );
    track.rotation.x = Math.PI / 2;
    track.position.y = 1.34;

    // Selection ring (floor level, fades in on select)
    const selRing = new THREE.Mesh(
      new THREE.TorusGeometry(1.08, 0.010, 14, 120),
      new THREE.MeshBasicMaterial({
        color: app.color, transparent: true, opacity: 0,
        blending: THREE.AdditiveBlending, depthWrite: false
      })
    );
    selRing.rotation.x = Math.PI / 2;
    selRing.position.y = 0.02;

    // orbPivot — bobs up/down
    const orbPivot = new THREE.Group();
    orbPivot.position.y = 1.34;

    // Planet sphere — procedural surface texture
    const planetTex = makePlanetTex(col, idx, 512);
    const orb = new THREE.Mesh(
      new THREE.SphereGeometry(0.82, 64, 64),
      new THREE.MeshPhysicalMaterial({
        map: planetTex,
        emissive: col.clone().multiplyScalar(0.07),
        emissiveIntensity: 0.25,
        roughness: 0.40, metalness: 0.04
      })
    );

    // Icon decal — slightly-larger sphere composites the app icon on top
    const decal = new THREE.Mesh(
      new THREE.SphereGeometry(0.836, 48, 48),
      new THREE.MeshBasicMaterial({
        map: appTex || null,
        transparent: true,
        opacity: appTex ? 0.82 : 0,
        depthWrite: false
      })
    );

    // Live status badge sprite — green glow for live, amber for coming-soon
    const liveCol  = app.live ? new THREE.Color(0x44ff88) : new THREE.Color(0xffaa33);
    const liveBadge = new THREE.Sprite(new THREE.SpriteMaterial({
      map: makeRadialTex(
        Math.round(liveCol.r * 255),
        Math.round(liveCol.g * 255),
        Math.round(liveCol.b * 255),
        app.live ? 0.80 : 0.55, 128
      ),
      transparent: true, opacity: app.live ? 0.90 : 0.60,
      depthWrite: false, blending: THREE.AdditiveBlending
    }));
    liveBadge.position.set(0.68, 0.68, 0);
    liveBadge.scale.set(0.38, 0.38, 1);
    orbPivot.add(liveBadge);

    // Atmospheric halo
    const atm = new THREE.Sprite(new THREE.SpriteMaterial({
      map: makeRadialTex(colR, colG, colB, 0.22, 256),
      transparent: true, opacity: 0.38,
      depthWrite: false, blending: THREE.AdditiveBlending
    }));
    atm.scale.set(2.48, 2.48, 1);

    // Text ring: billboard (lookAt camera) + inner spin group (ticker crawl)
    const textBillboard = new THREE.Group();
    const textSpin      = new THREE.Group();
    const textRing      = new THREE.Mesh(
      new THREE.CircleGeometry(2.02, 128),
      new THREE.MeshBasicMaterial({
        map: makeOrbitTextTex(app.title, hex),
        transparent: true, opacity: 0.82,
        side: THREE.DoubleSide, depthWrite: false
      })
    );
    textSpin.add(textRing);
    textBillboard.add(textSpin);
    orbPivot.add(orb, decal, atm, textBillboard);

    // ── CARD — single composited plane, no z-fighting ─────────────────────
    // depthTest:false + depthWrite:false + renderOrder:10 = always draws clean
    const CARD_OFFSETS = {
      above: new THREE.Vector3(0,   3.10, 0),
      right: new THREE.Vector3(2.2, 1.80, 0),
      left:  new THREE.Vector3(-2.2, 1.80, 0)
    };
    const cardGrp = new THREE.Group();
    cardGrp.position.copy(CARD_OFFSETS.above);
    cardGrp.visible = false;

    const cardPanel = new THREE.Mesh(
      new THREE.PlaneGeometry(2.80, 1.86),
      new THREE.MeshBasicMaterial({
        map:        makeCardTex(app, appTex),
        transparent: true,
        opacity:     0,
        depthTest:   false,
        depthWrite:  false,
        side: THREE.FrontSide
      })
    );
    cardPanel.renderOrder    = 10;
    cardPanel.userData.appId = app.id;

    cardGrp.add(cardPanel);
    group.add(ped, track, selRing, orbPivot, cardGrp);

    // Pickable meshes (raycaster targets)
    [orb, ped, decal, cardPanel].forEach((m) => {
      m.userData.appId = app.id;
      state.pickable.push(m);
    });

    state.nodes.set(app.id, {
      app, group, ped, track, selRing,
      orbPivot, orb, decal, atm, liveBadge,
      textBillboard, textSpin, textRing,
      cardGrp, cardPanel,
      cardSide: 'above', CARD_OFFSETS,
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
    nd.cardGrp.scale.setScalar(s * 0.95);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// CONNECTIONS — dashed CatmullRom curves hub→node + ambient flow particles
// ─────────────────────────────────────────────────────────────────────────────
function makeFlowDotTex(r, g, b) {
  const c = document.createElement("canvas"); c.width = c.height = 32;
  const ctx = c.getContext("2d");
  const grd = ctx.createRadialGradient(16,16,0,16,16,16);
  grd.addColorStop(0,   `rgba(${r},${g},${b},1)`);
  grd.addColorStop(0.45,`rgba(${r},${g},${b},0.55)`);
  grd.addColorStop(1,   `rgba(${r},${g},${b},0)`);
  ctx.fillStyle = grd; ctx.fillRect(0,0,32,32);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

function makeConnections() {
  while (connGrp.children.length) {
    const c = connGrp.children[0];
    c.geometry?.dispose(); c.material?.dispose();
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
      new THREE.Vector3(hub.x*0.3 + end.x*0.32, 2.48, hub.z*0.3 + end.z*0.32),
      new THREE.Vector3(hub.x*0.25 + end.x*0.74, 2.14, hub.z*0.25 + end.z*0.74),
      end
    ]);

    // Store curve for flow particles (reused in updateNodes)
    nd.curve = curve;

    const geo  = new THREE.BufferGeometry().setFromPoints(curve.getPoints(48));
    const mat  = new THREE.LineDashedMaterial({
      color: app.color, transparent: true, opacity: 0.17,
      dashSize: 0.16, gapSize: 0.10
    });
    const line = new THREE.Line(geo, mat);
    line.computeLineDistances();
    connGrp.add(line);

    // ── Flow particles — 4 luminous dots traveling hub → node
    const col = new THREE.Color(app.color);
    const dotTex = makeFlowDotTex(
      Math.round(col.r * 255),
      Math.round(col.g * 255),
      Math.round(col.b * 255)
    );

    const FLOW_N = 4;
    const flowItems = [];
    for (let i = 0; i < FLOW_N; i++) {
      const spr = new THREE.Sprite(new THREE.SpriteMaterial({
        map: dotTex, transparent: true, opacity: 0,
        depthWrite: false, blending: THREE.AdditiveBlending
      }));
      spr.scale.set(0.13, 0.13, 1);
      spr.renderOrder = 6;
      connGrp.add(spr);
      flowItems.push({
        spr,
        t:     i / FLOW_N,
        speed: 0.0022 + Math.random() * 0.0014
      });
    }
    nd.flowItems = flowItems;
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// DOCK / UI
// ─────────────────────────────────────────────────────────────────────────────
function buildDock() {
  dockEl.innerHTML = "";
  state.dockBtns.clear();

  const ov = document.createElement("button");
  ov.type      = "button";
  ov.className = "dock-btn";
  ov.textContent = "Overview";
  ov.addEventListener("click", () => resetView(true));
  dockEl.appendChild(ov);
  state.dockBtns.set("overview", ov);

  APPS.forEach((app, i) => {
    const btn = document.createElement("button");
    btn.type      = "button";
    btn.className = "dock-btn";

    // Live status dot
    const dot = document.createElement("span");
    dot.className = `live-dot ${app.live ? "is-live" : "is-soon"}`;
    btn.appendChild(dot);
    btn.appendChild(document.createTextNode(`${i + 1}. ${app.title}`));

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
    elTitle.textContent    = "Ikeverse Portal Hub";
    elSubtitle.textContent = "4 interconnected worlds — one cinematic gateway.";
    elDesc.textContent     = "Orbit the hub, click any portal planet to focus, then click again to launch. Use keys 1–4 to jump, Esc to return.";
    elStatus.textContent   = "All Systems Active";
    elDot.style.color      = "#54c6ee";
    elLaunch.href          = "#";
    elLaunch.textContent   = "Explore the Hub";
    elTags.innerHTML       = "";

    // Show mini portal grid in overview
    const portalItems = [
      { label: "Culturalverse", color: "#ffb86b" },
      { label: "Living Knowledge", color: "#77f0b2" },
      { label: "IkeStar", color: "#67d9ff" },
      { label: "Cosmic Weave", color: "#a88cff" }
    ];
    portalItems.forEach((p) => {
      const s = document.createElement("span");
      s.className = "tag";
      s.style.borderColor = p.color + "55";
      s.style.color       = p.color;
      s.innerHTML = `<span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:${p.color};box-shadow:0 0 6px ${p.color};margin-right:6px;vertical-align:middle"></span>${p.label}`;
      elTags.appendChild(s);
    });

    elMode.textContent = "Overview";
  } else {
    elTitle.textContent    = app.title;
    elSubtitle.textContent = app.subtitle;
    elDesc.textContent     = app.description;
    elStatus.textContent   = app.status;
    elDot.style.color      = "#" + new THREE.Color(app.color).getHexString();
    elLaunch.href          = app.href;
    elLaunch.textContent   = `Launch ${app.title}`;
    elTags.innerHTML       = "";
    app.tags.forEach(addTag);
    elMode.textContent   = "Focused";
    liveEl.textContent   = `${app.title} selected`;
  }
}

function addTag(tag) {
  const s     = document.createElement("span");
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
  state.cameraLerping = true;

  state.camTargetPos.copy(state.cfg.camOvPos);
  state.camTargetLook.copy(state.cfg.camOvTgt);

  setPanel(null);
  syncDock();
  window.dispatchEvent(new Event("ikehub:selectionchange"));

  if (userInput) markInput();
}

function selectApp(appId, userInput = false) {
  const nd = state.nodes.get(appId);
  if (!nd) return;

  state.selected = appId;
  state.spinning = false;
  state.cameraLerping = true;

  // World position accounts for nodeRoot idle-spin rotation
  const worldPos = new THREE.Vector3();
  nd.group.getWorldPosition(worldPos);
  worldPos.y = 1.8;

  const dirXZ = new THREE.Vector3(worldPos.x, 0, worldPos.z).normalize();
  const camY  = state.cfg.focusH + (state.cfg.mobile ? 0.7 : state.cfg.tablet ? 0.35 : 0);

  state.camTargetLook.copy(worldPos);
  state.camTargetPos.set(
    worldPos.x + dirXZ.x * state.cfg.focusDist,
    camY,
    worldPos.z + dirXZ.z * state.cfg.focusDist
  );

  setPanel(nd.app);
  syncDock();
  saveSession(appId);
  window.dispatchEvent(new Event("ikehub:selectionchange"));

  if (userInput) markInput();
}

function focusNext() {
  if (state.selected === null) { selectApp(APPS[0].id, true); return; }
  const idx = APPS.findIndex((a) => a.id === state.selected);
  selectApp(APPS[(idx + 1) % APPS.length].id, true);
}

function focusPrev() {
  if (state.selected === null) { selectApp(APPS[APPS.length - 1].id, true); return; }
  const idx = APPS.findIndex((a) => a.id === state.selected);
  selectApp(APPS[(idx - 1 + APPS.length) % APPS.length].id, true);
}

function saveSession(appId) {
  try { sessionStorage.setItem("ikehub_last", appId || ""); } catch (_) {}
}

function loadSession() {
  try { return sessionStorage.getItem("ikehub_last") || null; } catch (_) { return null; }
}

function markInput() {
  state.lastInput = performance.now();
}

// ─────────────────────────────────────────────────────────────────────────────
// EVENTS
// ─────────────────────────────────────────────────────────────────────────────
function attachEvents() {
  renderer.domElement.addEventListener("pointermove", (e) => {
    const b   = renderer.domElement.getBoundingClientRect();
    pointer.x =  ((e.clientX - b.left) / b.width)  * 2 - 1;
    pointer.y = -((e.clientY - b.top)  / b.height) * 2 + 1;
  });

  renderer.domElement.addEventListener("pointerdown", (e) => {
    markInput();
    // Stop any in-progress camera lerp so the user can orbit freely right away
    if (state.cameraLerping) {
      state.cameraLerping = false;
      state.camTargetPos.copy(camera.position);
      state.camTargetLook.copy(controls.target);
    }
  });

  renderer.domElement.addEventListener("click", () => {
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(state.pickable, false);
    if (!hits.length) return;

    const appId = hits[0].object.userData.appId;
    if (!appId) return;

    if (state.selected === appId) {
      const app = APPS.find((a) => a.id === appId);
      if (app?.href) window.location.href = app.href;
      return;
    }

    selectApp(appId, true);
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      // Two-stage: first Esc collapses detail panel, second resets view
      const panel = document.querySelector(".detail-panel");
      if (panel && !panel.classList.contains("collapsed") && state.selected !== null) {
        panel.classList.add("collapsed");
        // Update toggle icon if present
        const ic = panel.querySelector(".tog-icon2");
        if (ic) ic.setAttribute("d", "M2 4l4 4 4-4");
      } else {
        resetView(true);
      }
      return;
    }
    const n = Number(e.key);
    if (Number.isInteger(n) && n >= 1 && n <= APPS.length) {
      selectApp(APPS[n - 1].id, true);
    }
  });

  // Touch swipe — left swipe = next portal, right swipe = previous
  let touchStartX = 0, touchStartY = 0;
  renderer.domElement.addEventListener("touchstart", (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  renderer.domElement.addEventListener("touchend", (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;
    // Only register as swipe if horizontal dominates and movement is >55px
    if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.4) {
      if (dx < 0) focusNext();
      else        focusPrev();
    }
  }, { passive: true });

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

  if (state.selected) selectApp(state.selected, false);
  else resetView(false);
}

// ─────────────────────────────────────────────────────────────────────────────
// ANIMATION
// ─────────────────────────────────────────────────────────────────────────────
function updateHover() {
  raycaster.setFromCamera(pointer, camera);
  const hits    = raycaster.intersectObjects(state.pickable, false);
  state.hovered = hits.length ? (hits[0].object.userData.appId ?? null) : null;
  document.body.style.cursor = state.hovered ? "pointer" : "default";

  // Drive hover tooltip
  const tip = window._ikeTip;
  if (tip) {
    if (state.hovered && state.selected !== state.hovered) {
      const app = APPS.find((a) => a.id === state.hovered);
      if (app) {
        const dot = app.live
          ? `<span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:#44ff88;box-shadow:0 0 5px #44ff88;margin-right:7px;vertical-align:middle"></span>`
          : `<span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:#ffaa33;margin-right:7px;vertical-align:middle"></span>`;
        tip.innerHTML = dot + app.title;
        tip.className = "visible";
      }
    } else {
      tip.className = "hidden";
    }
  }
}

function updateHub() {
  const h = state.hub;
  if (!h.group) return;
  h.group.rotation.y  += 0.0011;
  h.sphere.rotation.y += 0.0019;
  h.ringA.rotation.y  += 0.0024;
  h.ringB.rotation.y  -= 0.0042;
  h.ringC.rotation.y  += 0.0058;
}

function updateNodes(t) {
  APPS.forEach((app, idx) => {
    const nd  = state.nodes.get(app.id);
    if (!nd) return;

    const sel = state.selected === app.id;
    const hov = state.hovered  === app.id;

    // Bob orbPivot (orb + decal + atm + textBillboard all bob together)
    nd.orbPivot.position.y = 1.34 + Math.sin(t * 0.80 + idx * 1.1) * 0.09;

    // Planet self-rotation
    nd.orb.rotation.y += 0.0034;

    // Track ring slow rotation
    nd.track.rotation.z += 0.0024 + idx * 0.0005;

    // Selection ring — spin + fade
    nd.selRing.rotation.z += 0.007;
    nd.selRing.material.opacity = THREE.MathUtils.lerp(
      nd.selRing.material.opacity, sel ? 0.34 : 0, 0.074
    );

    // Orb emissive — brightens on hover/select
    nd.orb.material.emissiveIntensity = THREE.MathUtils.lerp(
      nd.orb.material.emissiveIntensity, sel ? 0.42 : hov ? 0.32 : 0.18, 0.1
    );

    // Atmospheric halo
    nd.atm.material.opacity = THREE.MathUtils.lerp(
      nd.atm.material.opacity, sel ? 0.58 : hov ? 0.48 : 0.32, 0.1
    );

    // Track opacity
    nd.track.material.opacity = THREE.MathUtils.lerp(
      nd.track.material.opacity, sel ? 0.17 : hov ? 0.13 : 0.09, 0.1
    );

    // Live badge — pulse for live portals, dim steady for coming-soon
    if (nd.liveBadge) {
      if (app.live) {
        nd.liveBadge.material.opacity = 0.72 + Math.sin(t * 2.8 + idx * 0.7) * 0.22;
      } else {
        nd.liveBadge.material.opacity = 0.38 + Math.sin(t * 1.2 + idx * 0.4) * 0.08;
      }
    }

    // Flow particles — travel along connection curve hub→planet
    if (nd.flowItems && nd.curve) {
      nd.flowItems.forEach(fp => {
        fp.t = (fp.t + fp.speed) % 1;
        const pt = nd.curve.getPoint(fp.t);
        fp.spr.position.copy(pt);
        // Fade in/out at endpoints
        const edge = fp.t < 0.08 ? fp.t / 0.08 : fp.t > 0.90 ? (1 - fp.t) / 0.10 : 1;
        fp.spr.material.opacity = 0.78 * edge;
      });
    }

    // Text ring — always faces camera; crawl speed varies by state
    nd.textBillboard.lookAt(camera.position);
    const crawl = sel ? 0.010 : hov ? 0.006 : 0.0022;
    nd.textSpin.rotation.z -= crawl;
    nd.textRing.material.opacity = THREE.MathUtils.lerp(
      nd.textRing.material.opacity, sel ? 0.0 : hov ? 1.0 : 0.76, 0.1
    );

    // Card — single plane, smooth opacity reveal
    const cardTarget = sel ? 1.0 : 0.0;
    const newOp = THREE.MathUtils.lerp(nd.cardPanel.material.opacity, cardTarget, 0.076);
    nd.cardPanel.material.opacity = newOp;
    nd.cardGrp.visible = newOp > 0.01;
    if (nd.cardGrp.visible) nd.cardGrp.lookAt(camera.position);
  });
}

function updateBackground(t) {
  bgGroup.rotation.y = Math.sin(t * 0.034) * 0.014;

  if (envGroup.userData.dust) {
    envGroup.userData.dust.rotation.z += 0.00024;
  }

  // Vapor sprites — gentle independent breathing opacity
  const vs = bgGroup.userData.vaporSprites;
  if (vs) {
    vs.forEach((spr) => {
      spr.material.opacity =
        spr.userData.baseOp + Math.sin(t * 0.18 + spr.userData.phase) * 0.10;
    });
  }

  // Twinkle sprites — staggered brief flashes like scintillating stars
  const tw = bgGroup.userData.twinkles;
  if (tw) {
    const now = performance.now();
    tw.forEach((spr) => {
      if (now >= spr.userData.nextFlash) {
        const age = now - spr.userData.nextFlash;
        if (age < 600) {
          spr.material.opacity = Math.sin((age / 600) * Math.PI) * 0.86;
        } else {
          spr.material.opacity  = 0;
          spr.userData.nextFlash = now + 2200 + Math.random() * 7500;
        }
      }
    });
  }
}

function updateCamera() {
  if (state.cameraLerping) {
    // Use a slower lerp for the cinematic intro flythrough
    const lerpAlpha = state.introActive ? 0.018 : 0.056;
    camera.position.lerp(state.camTargetPos, lerpAlpha);
    controls.target.lerp(state.camTargetLook, state.introActive ? 0.024 : 0.072);
    // Stop lerping once both are close enough
    if (
      camera.position.distanceTo(state.camTargetPos) < 0.04 &&
      controls.target.distanceTo(state.camTargetLook) < 0.04
    ) {
      camera.position.copy(state.camTargetPos);
      controls.target.copy(state.camTargetLook);
      state.cameraLerping = false;
      state.introActive   = false;
    }
  }
  controls.update();
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN LOOP
// ─────────────────────────────────────────────────────────────────────────────
function onFrame() {
  timer.update();
  const t = timer.getElapsed();

  if (!state.spinning && state.selected === null &&
      performance.now() - state.lastInput > IDLE_DELAY) {
    state.spinning = true;
  }

  if (state.spinning) {
    nodeRoot.rotation.y += 0.00095;
    connGrp.rotation.y  += 0.00095;
  }

  updateHover();
  updateHub();
  updateNodes(t);
  updateBackground(t);
  updateCamera();
  composer.render();
}

// ─────────────────────────────────────────────────────────────────────────────
// PRELOAD — warms browser image cache before Three.js TextureLoader runs
// This ensures appTex.image.complete === true when makeCardTex is called
// ─────────────────────────────────────────────────────────────────────────────
function preloadImages() {
  const urls = [...APPS.map(a => a.image), HUB_IMAGE].filter(Boolean);
  return Promise.allSettled(
    urls.map(url => new Promise((resolve) => {
      const el = new window.Image();
      el.crossOrigin = "anonymous";
      el.onload  = resolve;
      el.onerror = resolve; // resolve even on failure — don't block init
      el.src     = url;
    }))
  );
}

// Deferred card refresh — re-renders any card whose icon wasn't ready at init time
function refreshCardTextures() {
  state.nodes.forEach((nd) => {
    const t = texCache.get(nd.app.image);
    if (!t) return;
    // Only refresh if the image is now loaded
    if (t.image && t.image.complete && t.image.naturalWidth > 0) {
      if (nd.cardPanel.material.map) nd.cardPanel.material.map.dispose();
      nd.cardPanel.material.map        = makeCardTex(nd.app, t);
      nd.cardPanel.material.needsUpdate = true;
    }
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// HOVER TOOLTIP — follows cursor, shows app name when hovering planets
// ─────────────────────────────────────────────────────────────────────────────
function injectTooltip() {
  const tip = document.createElement("div");
  tip.id        = "ikehub-tooltip";
  tip.className = "hidden";
  document.body.appendChild(tip);
  window.addEventListener("mousemove", (e) => {
    tip.style.left = (e.clientX + 18) + "px";
    tip.style.top  = (e.clientY - 12) + "px";
  });
  window._ikeTip = tip;
}

// ─────────────────────────────────────────────────────────────────────────────
// TWINKLE SPRITES — random bright star flashes
// ─────────────────────────────────────────────────────────────────────────────
function makeTwinkles() {
  const twinkles = [];
  const baseTex  = makeRadialTex(255, 255, 255, 0.92, 64);

  for (let i = 0; i < 18; i++) {
    const spr = new THREE.Sprite(new THREE.SpriteMaterial({
      map: baseTex, transparent: true, opacity: 0,
      depthWrite: false, blending: THREE.AdditiveBlending
    }));
    const r = 32 + Math.random() * 88;
    const θ = Math.random() * Math.PI * 2;
    const φ = Math.acos(Math.random() * 2 - 1);
    spr.position.set(r*Math.sin(φ)*Math.cos(θ), r*Math.cos(φ)*0.62, r*Math.sin(φ)*Math.sin(θ));
    const s = 0.07 + Math.random() * 0.14;
    spr.scale.set(s, s, 1);
    spr.userData.nextFlash = Math.random() * 5000;
    spr.userData.phase     = Math.random() * Math.PI * 2;
    bgGroup.add(spr);
    twinkles.push(spr);
  }

  bgGroup.userData.twinkles = twinkles;
}

// ─────────────────────────────────────────────────────────────────────────────
// COLLAPSE TOGGLES — injected into brand-card and detail-panel
// ─────────────────────────────────────────────────────────────────────────────
function injectCollapseButtons() {
  // ── Brand card collapse ───────────────────────────────────────────────────
  const brandCard = document.querySelector(".brand-card");
  if (brandCard) {
    const tog = document.createElement("button");
    tog.type      = "button";
    tog.className = "collapse-btn";
    tog.setAttribute("aria-label", "Toggle panel");
    tog.innerHTML = `<svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path class="tog-icon" d="M2 4l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;
    brandCard.appendChild(tog);

    tog.addEventListener("click", () => {
      brandCard.classList.toggle("collapsed");
      const ic = tog.querySelector(".tog-icon");
      ic.setAttribute("d", brandCard.classList.contains("collapsed")
        ? "M2 8l4-4 4 4"   // chevron up = expand
        : "M2 4l4 4 4-4"); // chevron down = collapse
    });
  }

  // ── Detail panel collapse ─────────────────────────────────────────────────
  const detailPanel = document.querySelector(".detail-panel");
  if (detailPanel) {
    const tog2 = document.createElement("button");
    tog2.type      = "button";
    tog2.className = "collapse-btn panel-collapse-btn";
    tog2.setAttribute("aria-label", "Toggle detail panel");
    tog2.innerHTML = `<svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path class="tog-icon2" d="M2 8l4-4 4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;
    detailPanel.prepend(tog2);

    tog2.addEventListener("click", () => {
      detailPanel.classList.toggle("collapsed");
      const ic = tog2.querySelector(".tog-icon2");
      ic.setAttribute("d", detailPanel.classList.contains("collapsed")
        ? "M2 4l4 4 4-4"   // down = expand
        : "M2 8l4-4 4 4"); // up = collapse
    });
  }

  // ── Card position toggle — cycles card above/right/left of planet ──────────
  const detailPanel2 = document.querySelector(".detail-panel");
  const cardPosBtn   = document.createElement("button");
  cardPosBtn.id          = "card-pos-btn";
  cardPosBtn.type        = "button";
  cardPosBtn.className   = "btn btn-secondary";
  cardPosBtn.style.cssText = "margin-top:8px;width:100%;font-size:11.5px;opacity:0;pointer-events:none;transition:opacity 0.2s";
  cardPosBtn.innerHTML   = "⟺ Reposition Card";

  cardPosBtn.addEventListener("click", () => {
    const nd = state.nodes.get(state.selected);
    if (!nd) return;
    const sides  = ["above", "right", "left"];
    const labels = { above: "Above ↑", right: "Right →", left: "← Left" };
    nd.cardSide  = sides[(sides.indexOf(nd.cardSide) + 1) % 3];
    nd.cardGrp.position.copy(nd.CARD_OFFSETS[nd.cardSide]);
    cardPosBtn.textContent = `⟺ Card: ${labels[nd.cardSide]}`;
  });

  if (detailPanel2) {
    const hint = detailPanel2.querySelector(".hint");
    if (hint) hint.before(cardPosBtn);
    else detailPanel2.appendChild(cardPosBtn);
  }

  // Show/hide based on selection — patch syncDock to also update this button
  const _origSync = syncDock;
  window.addEventListener("ikehub:selectionchange", () => {
    const isSelected = state.selected !== null;
    cardPosBtn.style.opacity        = isSelected ? "1" : "0";
    cardPosBtn.style.pointerEvents  = isSelected ? "auto" : "none";
    if (!isSelected) cardPosBtn.textContent = "⟺ Reposition Card";
  });
}

function init() {
  console.log("IkeHub main.js loaded:", import.meta.url);
  console.log("IkeHub image base:", IMAGE_BASE);
  console.log("IkeHub hub image:", HUB_IMAGE);

  makeLights();
  makeBackground();
  makeTwinkles();
  makeEnv();
  makeHub();
  makeNodes();
  placeNodes();
  makeConnections();
  buildDock();
  setPanel(null);

  // ── Entry flythrough — camera starts in deep space, pulls into hub ─────────
  state.introStart = performance.now();
  state.introActive = true;
  camera.position.set(-22, 6, -42);   // dramatic far-angle start
  controls.target.set(0, 1.25, 0);
  controls.update();
  // resetView activates the lerp toward the overview position
  resetView(false);

  // ── Restore last selected portal from session ───────────────────────────────
  const last = loadSession();
  if (last && APPS.find((a) => a.id === last)) {
    setTimeout(() => selectApp(last, false), 3200); // after flythrough settles
  }

  attachEvents();
  renderer.setAnimationLoop(onFrame);
  injectCollapseButtons();
  injectTooltip();

  setTimeout(refreshCardTextures, 1500);
  setTimeout(refreshCardTextures, 4000);
}

async function boot() {
  await preloadImages();
  init();
}

if (document.fonts?.ready) {
  document.fonts.ready.then(boot).catch(init);
} else {
  boot();
}