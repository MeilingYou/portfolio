// =============================================
// Game Atmosphere Lab — Color & Style Lab
// =============================================

let topics = [];
let currentAudio = new Audio();
let currentIndex = 0;
let activeBgLayer = null;

// Demo lab state
let colorMode = 'off';       // 'off' | 'on' | 'random'
let currentStyle = 'none';   // art style key

// Extended palette data per topic id
const PALETTES = {
  "cozy-pixel-farming":   ["#F3E7C9","#7AA35A","#4B3425","#E8C07A","#A8C88A","#C9956A"],
  "neon-cyberpunk-city":  ["#0D0B1F","#00E5FF","#EAFBFF","#FF00A0","#7B2FFF","#00FF9F"],
  "low-poly-horror":      ["#1C1F26","#7A1F1F","#D9D9D9","#3D0000","#8B0000","#2E2E3A"],
  "dark-cute-cartoon":    ["#2A0F16","#D9C27A","#F5EBD8","#8B2252","#C86464","#3D1A22"],
  "retro-arcade":         ["#000000","#FFD93D","#FFFFFF","#FF4444","#44AAFF","#44FF44"],
  "dark-fantasy":         ["#2B2B2B","#B08D57","#E8DFC8","#1A0A00","#6B3F1F","#4A3728"],
  "open-world-fantasy":   ["#BFE7F2","#F4C542","#244B3C","#7EC8E3","#A8E6CF","#FFE066"],
  "voxel-sandbox":        ["#87C77B","#5A8F3D","#2E2218","#6BB8FF","#F4A460","#8B6914"],
};

// Art style preset → CSS filter string applied to canvas
const STYLE_FILTERS = {
  none:       "",
  pixel:      "contrast(1.4) saturate(1.2) brightness(1.05)",
  lowpoly:    "contrast(1.6) saturate(0.7) brightness(0.9) blur(0.5px)",
  horror:     "grayscale(0.8) contrast(1.8) brightness(0.65) sepia(0.3)",
  neon:       "saturate(3) contrast(1.5) brightness(1.1) hue-rotate(10deg)",
  watercolor: "saturate(0.9) contrast(0.85) brightness(1.1) blur(0.8px)",
  dark:       "sepia(0.4) contrast(1.5) brightness(0.6) saturate(0.8)",
  bright:     "saturate(1.4) contrast(0.9) brightness(1.25)",
};

// Art style that best matches each atmosphere id
const ATMO_STYLE_MAP = {
  "cozy-pixel-farming":   "pixel",
  "neon-cyberpunk-city":  "neon",
  "low-poly-horror":      "lowpoly",
  "dark-cute-cartoon":    "horror",
  "retro-arcade":         "pixel",
  "dark-fantasy":         "dark",
  "open-world-fantasy":   "bright",
  "voxel-sandbox":        "pixel",
};

// Canvas badge labels per style
const STYLE_LABELS = {
  none:       "Original",
  pixel:      "Pixel Art",
  lowpoly:    "Low Poly",
  horror:     "Horror",
  neon:       "Neon / Cyber",
  watercolor: "Painterly",
  dark:       "Dark Fantasy",
  bright:     "Open World",
};

// Create overlay div
const bgOverlay = document.createElement("div");
bgOverlay.className = "bg-overlay";
document.body.prepend(bgOverlay);

// =====================
// LOAD DATA
// =====================
fetch("data.json")
  .then(r => r.json())
  .then(data => {
    topics = data.topics;
    createTopicMenu();
    const hash = window.location.hash.replace("#", "");
    const hi = hash ? topics.findIndex(t => t.id === hash) : -1;
    showTopic(hi !== -1 ? hi : 0, false);
    drawScene(); // draw canvas on load
  })
  .catch(err => console.log("Error loading JSON:", err));

// =====================
// MENU
// =====================
function createTopicMenu() {
  const menu = document.getElementById("topicMenu");
  topics.forEach((topic, index) => {
    const btn = document.createElement("button");
    btn.textContent = topic.title;
    btn.classList.add("topic-btn");
    btn.dataset.id = topic.id;
    btn.addEventListener("click", () => showTopic(index, true));
    menu.appendChild(btn);
  });
}

// =====================
// SHOW TOPIC
// =====================
function showTopic(index, autoPlaySound) {
  currentIndex = index;
  const topic = topics[index];

  // Text
  document.getElementById("topicTitle").textContent = topic.title;
  document.getElementById("gameExamples").textContent =
    "Inspired by: " + topic.gameExamples.join(", ");
  document.getElementById("artStyle").textContent = topic.artStyle;
  document.getElementById("mood").textContent = topic.mood;
  document.getElementById("description").textContent = topic.description;

  // Hidden image (for reference)
  const img = document.getElementById("topicImage");
  img.src = topic.image;
  img.alt = topic.imageAlt || topic.title;

  // Background
  switchBackground(topic.image);

  // CSS vars
  document.documentElement.style.setProperty("--accent-color", topic.accentColor);
  document.documentElement.style.setProperty("--text-color", topic.textColor);
  document.documentElement.style.setProperty("--card-color", hexToRgba(topic.backgroundColor, 0.22));

  bgOverlay.style.background = `linear-gradient(135deg, ${hexToRgba(topic.backgroundColor, 0.55)} 0%, rgba(0,0,0,0.5) 100%)`;

  // Theme color meta
  const metaTheme = document.querySelector("meta[name='theme-color']");
  if (metaTheme) metaTheme.setAttribute("content", topic.backgroundColor);

  // Font class
  document.body.className = "";
  document.body.classList.add(topic.fontClass);

  // Restart card animation
  const infoBox = document.querySelector(".info-box");
  infoBox.style.animation = "none";
  infoBox.offsetHeight;
  infoBox.style.animation = "";

  // Active button
  document.querySelectorAll(".topic-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.id === topic.id);
  });

  // URL hash
  history.replaceState(null, "", "#" + topic.id);

  // Palette swatches
  renderPalette(topic.id, topic.accentColor);

  // Redraw canvas with current settings
  drawScene();

  // Audio
  currentAudio.pause();
  currentAudio.currentTime = 0;
  currentAudio.src = topic.audio;
  currentAudio.loop = true;
  currentAudio.load();

  if (autoPlaySound) {
    currentAudio.play()
      .then(() => { document.getElementById("audioBtn").textContent = "Pause Atmosphere Sound"; })
      .catch(() => { document.getElementById("audioBtn").textContent = "Play Atmosphere Sound"; });
  } else {
    document.getElementById("audioBtn").textContent = "Play Atmosphere Sound";
  }
}

// =====================
// PALETTE SWATCHES
// =====================
function renderPalette(topicId, fallbackAccent) {
  const container = document.getElementById("paletteSwatches");
  container.innerHTML = "";
  const colors = PALETTES[topicId] || [fallbackAccent];
  colors.forEach(hex => {
    const s = document.createElement("div");
    s.className = "swatch";
    s.style.background = hex;
    s.setAttribute("data-hex", hex);
    s.title = hex;
    container.appendChild(s);
  });
}

// =====================
// BACKGROUND SYSTEM
// =====================
function switchBackground(imageUrl) {
  if (activeBgLayer) {
    const old = activeBgLayer;
    old.classList.remove("active");
    old.classList.add("leaving");
    setTimeout(() => old.remove(), 600);
  }
  const layer = document.createElement("div");
  layer.className = "bg-layer";
  layer.style.backgroundImage = `url('${imageUrl}')`;
  document.body.prepend(layer);
  requestAnimationFrame(() => requestAnimationFrame(() => layer.classList.add("active")));
  activeBgLayer = layer;
}

// =====================
// CANVAS SCENE
// Draw a neutral landscape scene procedurally
// =====================
function drawScene() {
  const canvas = document.getElementById("sceneCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const W = canvas.width;
  const H = canvas.height;

  ctx.clearRect(0, 0, W, H);

  // --- Determine colors ---
  const topic = topics[currentIndex];
  let skyTop, skyBot, groundColor, hillColor, treeColor, moonColor;

  if (colorMode === 'off') {
    // Neutral greyscale-ish natural palette
    skyTop    = "#6BA3BE";
    skyBot    = "#B8D9EA";
    groundColor = "#5C7A3E";
    hillColor   = "#4A6630";
    treeColor   = "#2E4020";
    moonColor   = "#FFFDE7";
  } else if (colorMode === 'on' && topic) {
    const palette = PALETTES[topic.id] || [];
    skyTop    = palette[0] || topic.backgroundColor;
    skyBot    = blendHex(palette[0] || topic.backgroundColor, "#ffffff", 0.3);
    groundColor = palette[1] || topic.accentColor;
    hillColor   = blendHex(palette[1] || topic.accentColor, "#000000", 0.25);
    treeColor   = palette[2] || topic.textColor;
    moonColor   = palette[3] || "#ffffff";
  } else {
    // Random — pick random colors from palette
    const allPalettes = Object.values(PALETTES);
    const rp = allPalettes[Math.floor(Math.random() * allPalettes.length)];
    const shuffle = [...rp].sort(() => Math.random() - 0.5);
    skyTop    = shuffle[0];
    skyBot    = blendHex(shuffle[0], "#ffffff", 0.35);
    groundColor = shuffle[1];
    hillColor   = blendHex(shuffle[1], "#000000", 0.2);
    treeColor   = shuffle[2];
    moonColor   = shuffle[3] || "#ffffff";
  }

  // --- Sky gradient ---
  const skyGrad = ctx.createLinearGradient(0, 0, 0, H * 0.65);
  skyGrad.addColorStop(0, skyTop);
  skyGrad.addColorStop(1, skyBot);
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, W, H);

  // --- Stars (small dots in upper sky) ---
  ctx.fillStyle = "rgba(255,255,255,0.6)";
  const starSeeds = [
    [0.1,0.05],[0.2,0.12],[0.35,0.04],[0.5,0.09],[0.65,0.06],
    [0.75,0.14],[0.85,0.03],[0.92,0.1],[0.08,0.18],[0.42,0.16],
    [0.58,0.02],[0.78,0.07],[0.15,0.08],[0.55,0.18],[0.9,0.18],
  ];
  starSeeds.forEach(([sx, sy]) => {
    ctx.beginPath();
    ctx.arc(sx * W, sy * H * 0.7, 1.5, 0, Math.PI * 2);
    ctx.fill();
  });

  // --- Moon / sun ---
  ctx.beginPath();
  ctx.arc(W * 0.82, H * 0.15, 26, 0, Math.PI * 2);
  ctx.fillStyle = moonColor;
  ctx.shadowColor = moonColor;
  ctx.shadowBlur = 20;
  ctx.fill();
  ctx.shadowBlur = 0;

  // --- Background hill (far) ---
  ctx.beginPath();
  ctx.moveTo(0, H * 0.55);
  ctx.bezierCurveTo(W * 0.15, H * 0.35, W * 0.35, H * 0.42, W * 0.5, H * 0.48);
  ctx.bezierCurveTo(W * 0.65, H * 0.54, W * 0.8, H * 0.38, W, H * 0.44);
  ctx.lineTo(W, H);
  ctx.lineTo(0, H);
  ctx.closePath();
  ctx.fillStyle = blendHex(skyTop, hillColor, 0.7);
  ctx.fill();

  // --- Foreground hill ---
  ctx.beginPath();
  ctx.moveTo(0, H * 0.68);
  ctx.bezierCurveTo(W * 0.2, H * 0.55, W * 0.4, H * 0.62, W * 0.6, H * 0.6);
  ctx.bezierCurveTo(W * 0.75, H * 0.58, W * 0.88, H * 0.66, W, H * 0.62);
  ctx.lineTo(W, H);
  ctx.lineTo(0, H);
  ctx.closePath();
  ctx.fillStyle = hillColor;
  ctx.fill();

  // --- Ground ---
  const groundGrad = ctx.createLinearGradient(0, H * 0.68, 0, H);
  groundGrad.addColorStop(0, groundColor);
  groundGrad.addColorStop(1, blendHex(groundColor, "#000000", 0.3));
  ctx.fillStyle = groundGrad;
  ctx.fillRect(0, H * 0.72, W, H * 0.28);

  // --- Trees ---
  const treeDefs = [
    { x: 0.06, h: 0.28 }, { x: 0.14, h: 0.22 },
    { x: 0.72, h: 0.25 }, { x: 0.80, h: 0.32 }, { x: 0.88, h: 0.20 },
    { x: 0.94, h: 0.26 },
  ];
  treeDefs.forEach(({ x, h }) => drawTree(ctx, x * W, H * 0.72, h * H, treeColor));

  // --- Foreground path ---
  ctx.beginPath();
  ctx.moveTo(W * 0.42, H);
  ctx.bezierCurveTo(W * 0.44, H * 0.82, W * 0.48, H * 0.76, W * 0.5, H * 0.73);
  ctx.bezierCurveTo(W * 0.52, H * 0.76, W * 0.56, H * 0.82, W * 0.58, H);
  ctx.closePath();
  ctx.fillStyle = blendHex(groundColor, "#d4b483", 0.5);
  ctx.fill();

  // --- Apply art style filter to canvas element ---
  const filterStr = STYLE_FILTERS[currentStyle] || "";
  canvas.style.filter = filterStr;

  // Pixel art effect — redraw at low res
  if (currentStyle === 'pixel') {
    applyPixelEffect(ctx, W, H, 5);
  }

  // Update badge
  updateBadge();
}

function drawTree(ctx, x, baseY, height, color) {
  // Trunk
  ctx.fillStyle = blendHex(color, "#000000", 0.4);
  ctx.fillRect(x - 4, baseY - height * 0.25, 8, height * 0.25);
  // Canopy (triangle)
  ctx.beginPath();
  ctx.moveTo(x, baseY - height);
  ctx.lineTo(x - height * 0.35, baseY - height * 0.28);
  ctx.lineTo(x + height * 0.35, baseY - height * 0.28);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  // Mid layer
  ctx.beginPath();
  ctx.moveTo(x, baseY - height * 0.75);
  ctx.lineTo(x - height * 0.28, baseY - height * 0.15);
  ctx.lineTo(x + height * 0.28, baseY - height * 0.15);
  ctx.closePath();
  ctx.fillStyle = blendHex(color, "#ffffff", 0.1);
  ctx.fill();
}

function applyPixelEffect(ctx, W, H, size) {
  const imageData = ctx.getImageData(0, 0, W, H);
  const pixels = imageData.data;
  // Sample each block and fill with average color
  for (let y = 0; y < H; y += size) {
    for (let x = 0; x < W; x += size) {
      const idx = (y * W + x) * 4;
      const r = pixels[idx], g = pixels[idx+1], b = pixels[idx+2];
      for (let dy = 0; dy < size && y + dy < H; dy++) {
        for (let dx = 0; dx < size && x + dx < W; dx++) {
          const i = ((y + dy) * W + (x + dx)) * 4;
          pixels[i]   = r;
          pixels[i+1] = g;
          pixels[i+2] = b;
        }
      }
    }
  }
  ctx.putImageData(imageData, 0, 0);
}

// =====================
// DEMO LAB CONTROLS
// =====================
function setColor(mode) {
  colorMode = mode;
  // Update button states
  ['Off','On','Random'].forEach(m => {
    const btn = document.getElementById('btnColor' + m);
    if (btn) btn.classList.toggle('active', mode === m.toLowerCase());
  });
  drawScene();
}

function setStyle(style) {
  currentStyle = style;
  // Update style button states
  document.querySelectorAll('.style-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.style === style);
  });
  drawScene();
}

function matchCurrentAtmosphere() {
  const topic = topics[currentIndex];
  if (!topic) return;
  // Apply palette color
  colorMode = 'on';
  document.getElementById('btnColorOff').classList.remove('active');
  document.getElementById('btnColorOn').classList.add('active');
  document.getElementById('btnColorRandom').classList.remove('active');
  // Apply matching art style
  const matchedStyle = ATMO_STYLE_MAP[topic.id] || 'none';
  currentStyle = matchedStyle;
  document.querySelectorAll('.style-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.style === matchedStyle);
  });
  drawScene();
}

function updateBadge() {
  const badge = document.getElementById("canvasBadge");
  if (!badge) return;
  const topic = topics[currentIndex];
  let label = "";
  if (colorMode !== 'off') {
    label += colorMode === 'random' ? "Random Colors" : (topic ? topic.title + " Colors" : "Palette");
  }
  if (currentStyle !== 'none') {
    if (label) label += " + ";
    label += STYLE_LABELS[currentStyle] || currentStyle;
  }
  badge.textContent = label || "Original";
}

// =====================
// AUDIO
// =====================
document.getElementById("audioBtn").addEventListener("click", () => {
  if (currentAudio.paused) {
    currentAudio.play();
    document.getElementById("audioBtn").textContent = "Pause Atmosphere Sound";
  } else {
    currentAudio.pause();
    document.getElementById("audioBtn").textContent = "Play Atmosphere Sound";
  }
});

// =====================
// HELPERS
// =====================

function hexToRgba(hex, alpha) {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!r) return `rgba(0,0,0,${alpha})`;
  return `rgba(${parseInt(r[1],16)},${parseInt(r[2],16)},${parseInt(r[3],16)},${alpha})`;
}

function hexToRgb(hex) {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return r ? { r: parseInt(r[1],16), g: parseInt(r[2],16), b: parseInt(r[3],16) } : { r:0,g:0,b:0 };
}

// Blend two hex colors: 0 = full a, 1 = full b
function blendHex(hexA, hexB, t) {
  const a = hexToRgb(hexA);
  const b = hexToRgb(hexB);
  const r = Math.round(a.r + (b.r - a.r) * t);
  const g = Math.round(a.g + (b.g - a.g) * t);
  const bl = Math.round(a.b + (b.b - a.b) * t);
  return `rgb(${r},${g},${bl})`;
}
