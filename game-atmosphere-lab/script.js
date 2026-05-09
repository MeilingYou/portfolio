// =============================================
// Game Atmosphere Lab — Pixel Lab Engine
// =============================================

let topics = [];
let currentAudio = new Audio();
let currentIndex = 0;
let activeBgLayer = null;

// Lab state
let colorMode = 'off';      // 'off' | 'on' | 'random'
let currentStyle = 'none';  // art style key
let userImageLoaded = false; // true once user uploads

// Off-screen canvas for the source image (drawn once, reused)
const offscreen = document.createElement('canvas');
const offCtx = offscreen.getContext('2d');

// =====================
// PALETTE DATA
// Each atmosphere has 6-8 carefully chosen hex colors
// =====================
const PALETTES = {
  "cozy-pixel-farming":  ["#F3E7C9","#7AA35A","#4B3425","#E8C07A","#A8C88A","#C9956A","#F7D08A","#6B9B4A"],
  "neon-cyberpunk-city": ["#0D0B1F","#00E5FF","#FF00A0","#7B2FFF","#00FF9F","#1A0A3A","#FF6600","#E0E0FF"],
  "low-poly-horror":     ["#1C1F26","#7A1F1F","#D9D9D9","#3D0000","#8B0000","#2E2E3A","#4A0A0A","#AAAAAA"],
  "dark-cute-cartoon":   ["#2A0F16","#D9C27A","#F5EBD8","#8B2252","#C86464","#3D1A22","#F0A0A0","#7A3060"],
  "retro-arcade":        ["#000000","#FFD93D","#FFFFFF","#FF4444","#44AAFF","#44FF44","#FF8800","#AA00FF"],
  "dark-fantasy":        ["#2B2B2B","#B08D57","#E8DFC8","#1A0A00","#6B3F1F","#4A3728","#D4A96A","#3D2B1A"],
  "open-world-fantasy":  ["#BFE7F2","#F4C542","#244B3C","#7EC8E3","#A8E6CF","#FFE066","#3A8A5C","#E8F4F8"],
  "voxel-sandbox":       ["#87C77B","#5A8F3D","#2E2218","#6BB8FF","#F4A460","#8B6914","#4A7A2C","#D4884A"],
};

// Best-matched art style per atmosphere
const ATMO_STYLE_MAP = {
  "cozy-pixel-farming":  "pixel",
  "neon-cyberpunk-city": "neon",
  "low-poly-horror":     "horror",
  "dark-cute-cartoon":   "painterly",
  "retro-arcade":        "pixel",
  "dark-fantasy":        "darkfantasy",
  "open-world-fantasy":  "openworld",
  "voxel-sandbox":       "pixel",
};

const STYLE_LABELS = {
  none:        "Original",
  pixel:       "Pixel Art",
  lowpoly:     "Low Poly",
  horror:      "Horror",
  neon:        "Neon / Cyber",
  painterly:   "Painterly",
  darkfantasy: "Dark Fantasy",
  openworld:   "Open World",
};

// =====================
// INIT
// =====================
const bgOverlay = document.createElement("div");
bgOverlay.className = "bg-overlay";
document.body.prepend(bgOverlay);

fetch("data.json")
  .then(r => r.json())
  .then(data => {
    topics = data.topics;
    createTopicMenu();
    const hash = window.location.hash.replace("#", "");
    const hi = hash ? topics.findIndex(t => t.id === hash) : -1;
    showTopic(hi !== -1 ? hi : 0, false);
    drawDefaultScene(); // draw landscape fallback
  })
  .catch(err => console.log("Error loading JSON:", err));

// =====================
// IMAGE UPLOAD
// =====================
document.getElementById("imageUpload").addEventListener("change", function (e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function (ev) {
    const img = new Image();
    img.onload = function () {
      // Draw to offscreen canvas at fixed output size
      offscreen.width = 640;
      offscreen.height = 360;
      offCtx.drawImage(img, 0, 0, 640, 360);

      // Copy to source canvas for display
      const src = document.getElementById("sourceCanvas");
      const sCtx = src.getContext("2d");
      src.width = 640; src.height = 360;
      sCtx.drawImage(offscreen, 0, 0);

      userImageLoaded = true;
      applyEffects();
    };
    img.src = ev.target.result;
  };
  reader.readAsDataURL(file);
});

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

  document.getElementById("topicTitle").textContent = topic.title;
  document.getElementById("gameExamples").textContent =
    "Inspired by: " + topic.gameExamples.join(", ");
  document.getElementById("artStyle").textContent = topic.artStyle;
  document.getElementById("mood").textContent = topic.mood;
  document.getElementById("description").textContent = topic.description;

  const img = document.getElementById("topicImage");
  img.src = topic.image;
  img.alt = topic.imageAlt || topic.title;

  switchBackground(topic.image);

  document.documentElement.style.setProperty("--accent-color", topic.accentColor);
  document.documentElement.style.setProperty("--text-color", topic.textColor);
  document.documentElement.style.setProperty("--card-color", hexToRgba(topic.backgroundColor, 0.22));

  bgOverlay.style.background = `linear-gradient(135deg,
    ${hexToRgba(topic.backgroundColor, 0.55)} 0%,
    rgba(0,0,0,0.5) 100%)`;

  const metaTheme = document.querySelector("meta[name='theme-color']");
  if (metaTheme) metaTheme.setAttribute("content", topic.backgroundColor);

  document.body.className = "";
  document.body.classList.add(topic.fontClass);

  const infoBox = document.querySelector(".info-box");
  infoBox.style.animation = "none";
  infoBox.offsetHeight;
  infoBox.style.animation = "";

  document.querySelectorAll(".topic-btn").forEach(btn =>
    btn.classList.toggle("active", btn.dataset.id === topic.id));

  history.replaceState(null, "", "#" + topic.id);

  renderPalette(topic.id);

  // Re-apply effects with new palette when atmosphere changes
  if (colorMode !== 'off') applyEffects();

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
function renderPalette(topicId) {
  const container = document.getElementById("paletteSwatches");
  container.innerHTML = "";
  const colors = PALETTES[topicId] || [];
  colors.forEach(hex => {
    const s = document.createElement("div");
    s.className = "swatch";
    s.style.background = hex;
    s.setAttribute("data-hex", hex);
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
// DEFAULT LANDSCAPE SCENE (canvas fallback)
// =====================
function drawDefaultScene() {
  const src = document.getElementById("sourceCanvas");
  const ctx = src.getContext("2d");
  const W = src.width = 640;
  const H = src.height = 360;

  // Sky
  const sky = ctx.createLinearGradient(0, 0, 0, H * 0.65);
  sky.addColorStop(0, "#4A7FA5");
  sky.addColorStop(1, "#A8CEDD");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);

  // Stars
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  [[.1,.05],[.2,.12],[.35,.04],[.5,.09],[.65,.06],[.75,.14],[.85,.03],[.92,.1],[.42,.16],[.58,.02]].forEach(([sx,sy]) => {
    ctx.beginPath();
    ctx.arc(sx*W, sy*H*0.7, 1.5, 0, Math.PI*2);
    ctx.fill();
  });

  // Moon
  ctx.beginPath();
  ctx.arc(W*0.82, H*0.16, 24, 0, Math.PI*2);
  ctx.fillStyle = "#FFFDE7";
  ctx.shadowColor = "#FFFDE7"; ctx.shadowBlur = 18;
  ctx.fill(); ctx.shadowBlur = 0;

  // Far hill
  ctx.beginPath();
  ctx.moveTo(0, H*0.55);
  ctx.bezierCurveTo(W*.15, H*.36, W*.35, H*.43, W*.5, H*.49);
  ctx.bezierCurveTo(W*.65, H*.55, W*.8, H*.39, W, H*.45);
  ctx.lineTo(W, H); ctx.lineTo(0, H);
  ctx.closePath();
  ctx.fillStyle = "#3A6040";
  ctx.fill();

  // Near hill
  ctx.beginPath();
  ctx.moveTo(0, H*0.68);
  ctx.bezierCurveTo(W*.2, H*.56, W*.4, H*.62, W*.6, H*.60);
  ctx.bezierCurveTo(W*.75, H*.58, W*.88, H*.66, W, H*.62);
  ctx.lineTo(W, H); ctx.lineTo(0, H);
  ctx.closePath();
  ctx.fillStyle = "#2E5030";
  ctx.fill();

  // Ground
  const grd = ctx.createLinearGradient(0, H*0.68, 0, H);
  grd.addColorStop(0, "#4A7A35");
  grd.addColorStop(1, "#2A4A20");
  ctx.fillStyle = grd;
  ctx.fillRect(0, H*0.72, W, H*0.28);

  // Trees
  [[.06,.28],[.14,.22],[.72,.25],[.80,.32],[.88,.20],[.94,.26]].forEach(([x,h]) =>
    drawTree(ctx, x*W, H*0.72, h*H, "#1E3820"));

  // Path
  ctx.beginPath();
  ctx.moveTo(W*.42, H);
  ctx.bezierCurveTo(W*.44, H*.82, W*.48, H*.76, W*.5, H*.73);
  ctx.bezierCurveTo(W*.52, H*.76, W*.56, H*.82, W*.58, H);
  ctx.closePath();
  ctx.fillStyle = "#8B7355";
  ctx.fill();

  // Copy to offscreen for reuse
  offscreen.width = 640; offscreen.height = 360;
  offCtx.drawImage(src, 0, 0);
  userImageLoaded = false;

  // Reset result canvas
  const res = document.getElementById("resultCanvas");
  const rCtx = res.getContext("2d");
  res.width = 640; res.height = 360;
  rCtx.drawImage(src, 0, 0);
}

function drawTree(ctx, x, baseY, height, color) {
  ctx.fillStyle = blendHex(color, "#000000", 0.35);
  ctx.fillRect(x-4, baseY-height*.25, 8, height*.25);
  ctx.beginPath();
  ctx.moveTo(x, baseY-height);
  ctx.lineTo(x-height*.35, baseY-height*.28);
  ctx.lineTo(x+height*.35, baseY-height*.28);
  ctx.closePath();
  ctx.fillStyle = color; ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x, baseY-height*.75);
  ctx.lineTo(x-height*.28, baseY-height*.15);
  ctx.lineTo(x+height*.28, baseY-height*.15);
  ctx.closePath();
  ctx.fillStyle = blendHex(color, "#ffffff", 0.12); ctx.fill();
}

// =====================
// APPLY EFFECTS (main pipeline)
// Runs: color remap → art style → write to result canvas
// =====================
function applyEffects() {
  const overlay = document.getElementById("processingOverlay");
  overlay.classList.add("visible");

  // Use setTimeout so the UI can repaint to show spinner before heavy work
  setTimeout(() => {
    try {
      // 1. Get source pixels
      const src = offscreen;
      const srcCtx = offscreen.getContext("2d");
      const W = src.width, H = src.height;
      let imageData = srcCtx.getImageData(0, 0, W, H);

      // 2. Color palette remap
      if (colorMode !== 'off') {
        const palette = getActivePalette();
        imageData = remapColors(imageData, palette);
      }

      // 3. Art style pixel effects
      if (currentStyle !== 'none') {
        imageData = applyArtStyle(imageData, currentStyle, W, H);
      }

      // 4. Write to result canvas
      const res = document.getElementById("resultCanvas");
      res.width = W; res.height = H;
      const rCtx = res.getContext("2d");
      rCtx.putImageData(imageData, 0, 0);

      // 5. Post-process CSS filters for glow/blur effects
      applyPostFilter(res);

      // Update result label
      updateResultTag();
    } catch(e) {
      console.error("Effect error:", e);
    }

    overlay.classList.remove("visible");
  }, 30);
}

// =====================
// COLOR PALETTE REMAP
// Per-pixel: find closest palette color by perceptual distance
// =====================
function remapColors(imageData, palette) {
  const data = imageData.data;
  // Pre-parse palette to RGB arrays
  const palRGB = palette.map(hexToRgbArr);

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i+1], b = data[i+2];
    // Find closest palette color (weighted Euclidean in RGB)
    let best = 0, bestDist = Infinity;
    for (let p = 0; p < palRGB.length; p++) {
      const pr = palRGB[p][0], pg = palRGB[p][1], pb = palRGB[p][2];
      // Perceptual weighting: human eye is more sensitive to green
      const dist = (pr-r)**2 * 0.299 + (pg-g)**2 * 0.587 + (pb-b)**2 * 0.114;
      if (dist < bestDist) { bestDist = dist; best = p; }
    }
    // Preserve original luminance to keep shadows/highlights readable
    const origLum = 0.299*r + 0.587*g + 0.114*b;
    const palColor = palRGB[best];
    const palLum = 0.299*palColor[0] + 0.587*palColor[1] + 0.114*palColor[2];
    const lumRatio = palLum > 0 ? origLum / palLum : 1;

    data[i]   = Math.min(255, Math.round(palColor[0] * lumRatio));
    data[i+1] = Math.min(255, Math.round(palColor[1] * lumRatio));
    data[i+2] = Math.min(255, Math.round(palColor[2] * lumRatio));
  }
  return imageData;
}

function getActivePalette() {
  const topic = topics[currentIndex];
  if (colorMode === 'random') {
    const all = Object.values(PALETTES);
    return all[Math.floor(Math.random() * all.length)];
  }
  return PALETTES[topic?.id] || PALETTES["cozy-pixel-farming"];
}

// =====================
// ART STYLE PIXEL EFFECTS
// =====================
function applyArtStyle(imageData, style, W, H) {
  switch(style) {
    case 'pixel':      return effectPixel(imageData, W, H, 8);
    case 'lowpoly':    return effectLowPoly(imageData, W, H);
    case 'horror':     return effectHorror(imageData, W, H);
    case 'neon':       return effectNeon(imageData, W, H);
    case 'painterly':  return effectPainterly(imageData, W, H);
    case 'darkfantasy':return effectDarkFantasy(imageData, W, H);
    case 'openworld':  return effectOpenWorld(imageData, W, H);
    default:           return imageData;
  }
}

// PIXEL ART — downsample to grid blocks
function effectPixel(imageData, W, H, blockSize) {
  const data = imageData.data;
  for (let y = 0; y < H; y += blockSize) {
    for (let x = 0; x < W; x += blockSize) {
      // Sample center of block
      const cx = Math.min(x + Math.floor(blockSize/2), W-1);
      const cy = Math.min(y + Math.floor(blockSize/2), H-1);
      const idx = (cy * W + cx) * 4;
      const r = data[idx], g = data[idx+1], b = data[idx+2];
      // Fill entire block with that color
      for (let dy = 0; dy < blockSize && y+dy < H; dy++) {
        for (let dx = 0; dx < blockSize && x+dx < W; dx++) {
          const i = ((y+dy) * W + (x+dx)) * 4;
          data[i]=r; data[i+1]=g; data[i+2]=b;
        }
      }
    }
  }
  return imageData;
}

// LOW POLY — sample random triangles and fill with average color
function effectLowPoly(imageData, W, H) {
  // Draw triangles on a temp canvas
  const tmp = document.createElement('canvas');
  tmp.width = W; tmp.height = H;
  const ctx = tmp.getContext('2d');

  // First put original blurred as base
  ctx.putImageData(imageData, 0, 0);

  // Generate grid of points with jitter
  const cols = 18, rows = 10;
  const pts = [];
  for (let r = 0; r <= rows; r++) {
    for (let c = 0; c <= cols; c++) {
      const jx = r === 0 || r === rows ? 0 : (Math.random()-0.5) * (W/cols) * 0.7;
      const jy = c === 0 || c === cols ? 0 : (Math.random()-0.5) * (H/rows) * 0.7;
      pts.push([
        Math.max(0, Math.min(W, c/cols*W + jx)),
        Math.max(0, Math.min(H, r/rows*H + jy))
      ]);
    }
  }

  // Draw triangles
  const origData = imageData.data;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const tl = pts[r*(cols+1)+c];
      const tr = pts[r*(cols+1)+c+1];
      const bl = pts[(r+1)*(cols+1)+c];
      const br = pts[(r+1)*(cols+1)+c+1];

      // Sample color at centroid
      [[tl,tr,bl],[tr,br,bl]].forEach(([a,b2,c2]) => {
        const cx = Math.round((a[0]+b2[0]+c2[0])/3);
        const cy = Math.round((a[1]+b2[1]+c2[1])/3);
        const si = (Math.max(0,Math.min(H-1,cy))*W + Math.max(0,Math.min(W-1,cx)))*4;
        ctx.beginPath();
        ctx.moveTo(a[0],a[1]); ctx.lineTo(b2[0],b2[1]); ctx.lineTo(c2[0],c2[1]);
        ctx.closePath();
        ctx.fillStyle = `rgb(${origData[si]},${origData[si+1]},${origData[si+2]})`;
        ctx.fill();
        // Thin edge line for poly look
        ctx.strokeStyle = `rgba(0,0,0,0.08)`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      });
    }
  }

  return ctx.getImageData(0, 0, W, H);
}

// HORROR — desaturate + crush blacks + add film grain + vignette
function effectHorror(imageData, W, H) {
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    // Desaturate 80%
    const lum = 0.299*data[i] + 0.587*data[i+1] + 0.114*data[i+2];
    data[i]   = Math.round(data[i]*0.2   + lum*0.8);
    data[i+1] = Math.round(data[i+1]*0.2 + lum*0.8);
    data[i+2] = Math.round(data[i+2]*0.2 + lum*0.8);
    // Crush blacks (gamma)
    data[i]   = Math.round(Math.pow(data[i]/255, 1.6) * 255);
    data[i+1] = Math.round(Math.pow(data[i+1]/255, 1.6) * 255);
    data[i+2] = Math.round(Math.pow(data[i+2]/255, 1.6) * 255);
    // Add slight red tint in shadows
    const brightness = (data[i]+data[i+1]+data[i+2])/3;
    if (brightness < 80) {
      data[i] = Math.min(255, data[i] + 20);
    }
    // Film grain
    const grain = (Math.random()-0.5)*30;
    data[i]   = clamp(data[i]+grain);
    data[i+1] = clamp(data[i+1]+grain);
    data[i+2] = clamp(data[i+2]+grain);
  }
  // Vignette
  addVignette(data, W, H, 0.7);
  return imageData;
}

// NEON / CYBER — edge detection + boost saturation + neon glow simulation
function effectNeon(imageData, W, H) {
  const data = imageData.data;
  // 1. Hyper-saturate
  for (let i = 0; i < data.length; i += 4) {
    const lum = 0.299*data[i] + 0.587*data[i+1] + 0.114*data[i+2];
    data[i]   = clamp(lum + (data[i]-lum)*3.5);
    data[i+1] = clamp(lum + (data[i+1]-lum)*3.5);
    data[i+2] = clamp(lum + (data[i+2]-lum)*3.5);
    // Darken non-bright pixels (like a black background city)
    const br = (data[i]+data[i+1]+data[i+2])/3;
    if (br < 100) {
      data[i]   = Math.round(data[i]*0.3);
      data[i+1] = Math.round(data[i+1]*0.3);
      data[i+2] = Math.round(data[i+2]*0.3);
    }
  }
  // 2. Boost contrast
  for (let i = 0; i < data.length; i += 4) {
    data[i]   = clamp((data[i]-128)*1.8+128);
    data[i+1] = clamp((data[i+1]-128)*1.8+128);
    data[i+2] = clamp((data[i+2]-128)*1.8+128);
  }
  return imageData;
}

// PAINTERLY — box blur (simulate oil paint smoothing)
function effectPainterly(imageData, W, H) {
  const data = imageData.data;
  const radius = 3;
  const tmp = new Uint8ClampedArray(data);

  for (let y = radius; y < H-radius; y++) {
    for (let x = radius; x < W-radius; x++) {
      let r=0,g=0,b=0,count=0;
      for (let dy=-radius; dy<=radius; dy++) {
        for (let dx=-radius; dx<=radius; dx++) {
          const i = ((y+dy)*W+(x+dx))*4;
          r+=tmp[i]; g+=tmp[i+1]; b+=tmp[i+2]; count++;
        }
      }
      const idx=(y*W+x)*4;
      // Blend 70% blurred + 30% original for painted texture
      data[idx]   = clamp(r/count*0.75 + tmp[idx]*0.25);
      data[idx+1] = clamp(g/count*0.75 + tmp[idx+1]*0.25);
      data[idx+2] = clamp(b/count*0.75 + tmp[idx+2]*0.25);
    }
  }
  // Add subtle canvas texture noise
  for (let i=0; i<data.length; i+=4) {
    const t = (Math.random()-0.5)*12;
    data[i]   = clamp(data[i]+t);
    data[i+1] = clamp(data[i+1]+t);
    data[i+2] = clamp(data[i+2]+t);
  }
  return imageData;
}

// DARK FANTASY — sepia + heavy vignette + reduce highlights + fog
function effectDarkFantasy(imageData, W, H) {
  const data = imageData.data;
  for (let i=0; i<data.length; i+=4) {
    const r=data[i], g=data[i+1], b=data[i+2];
    // Sepia transform
    data[i]   = clamp(r*.393+g*.769+b*.189);
    data[i+1] = clamp(r*.349+g*.686+b*.168);
    data[i+2] = clamp(r*.272+g*.534+b*.131);
    // Push toward darker tones
    data[i]   = clamp(data[i]   * 0.7);
    data[i+1] = clamp(data[i+1] * 0.65);
    data[i+2] = clamp(data[i+2] * 0.6);
    // Slight cool shadow in dark areas
    const br=(data[i]+data[i+1]+data[i+2])/3;
    if(br<80){ data[i+2]=clamp(data[i+2]+15); }
  }
  addVignette(data, W, H, 0.85);
  return imageData;
}

// OPEN WORLD — brighten + boost greens + warm highlights + soften
function effectOpenWorld(imageData, W, H) {
  const data = imageData.data;
  const tmp = new Uint8ClampedArray(data);
  const radius = 1;
  // Slight blur first
  for (let y=radius; y<H-radius; y++) {
    for (let x=radius; x<W-radius; x++) {
      let r=0,g=0,b=0,count=0;
      for (let dy=-radius; dy<=radius; dy++) {
        for (let dx=-radius; dx<=radius; dx++) {
          const i=((y+dy)*W+(x+dx))*4;
          r+=tmp[i]; g+=tmp[i+1]; b+=tmp[i+2]; count++;
        }
      }
      const idx=(y*W+x)*4;
      data[idx]=r/count; data[idx+1]=g/count; data[idx+2]=b/count;
    }
  }
  // Color grade
  for (let i=0; i<data.length; i+=4) {
    // Brighten
    data[i]   = clamp(data[i]*1.15);
    data[i+1] = clamp(data[i+1]*1.2);  // boost green
    data[i+2] = clamp(data[i+2]*1.05);
    // Warm highlights
    const br=(data[i]+data[i+1]+data[i+2])/3;
    if(br>150){
      data[i]   = clamp(data[i]+15);    // more red/warm
      data[i+1] = clamp(data[i+1]+10);
    }
    // Reduce contrast slightly
    data[i]   = clamp((data[i]-128)*0.88+128);
    data[i+1] = clamp((data[i+1]-128)*0.88+128);
    data[i+2] = clamp((data[i+2]-128)*0.88+128);
  }
  return imageData;
}

// =====================
// POST-PROCESS CSS FILTER
// Applied to the canvas element itself for glow effects
// =====================
function applyPostFilter(canvas) {
  const filters = {
    none:        "",
    pixel:       "contrast(1.1)",
    lowpoly:     "contrast(1.05)",
    horror:      "contrast(1.2)",
    neon:        "brightness(1.1) contrast(1.1) saturate(1.3) drop-shadow(0 0 6px cyan)",
    painterly:   "contrast(0.95) brightness(1.05)",
    darkfantasy: "contrast(1.15) brightness(0.9)",
    openworld:   "contrast(0.95) brightness(1.1) saturate(1.15)",
  };
  canvas.style.filter = filters[currentStyle] || "";
}

// =====================
// VIGNETTE HELPER
// =====================
function addVignette(data, W, H, strength) {
  const cx = W/2, cy = H/2;
  const maxDist = Math.sqrt(cx*cx+cy*cy);
  for (let y=0; y<H; y++) {
    for (let x=0; x<W; x++) {
      const dx=x-cx, dy=y-cy;
      const dist=Math.sqrt(dx*dx+dy*dy)/maxDist;
      const factor = 1 - Math.pow(dist,2)*strength;
      const i=(y*W+x)*4;
      data[i]   = clamp(data[i]*factor);
      data[i+1] = clamp(data[i+1]*factor);
      data[i+2] = clamp(data[i+2]*factor);
    }
  }
}

// =====================
// CONTROLS
// =====================
function setColor(mode) {
  colorMode = mode;
  ['Off','On','Random'].forEach(m => {
    document.getElementById('btnColor'+m)?.classList.toggle('active', mode===m.toLowerCase());
  });
  applyEffects();
}

function setStyle(style) {
  currentStyle = style;
  document.querySelectorAll('.style-btn').forEach(btn =>
    btn.classList.toggle('active', btn.dataset.style===style));
  applyEffects();
}

function matchCurrentAtmosphere() {
  const topic = topics[currentIndex];
  if (!topic) return;
  colorMode = 'on';
  document.getElementById('btnColorOff').classList.remove('active');
  document.getElementById('btnColorOn').classList.add('active');
  document.getElementById('btnColorRandom').classList.remove('active');
  currentStyle = ATMO_STYLE_MAP[topic.id] || 'none';
  document.querySelectorAll('.style-btn').forEach(btn =>
    btn.classList.toggle('active', btn.dataset.style===currentStyle));
  applyEffects();
}

function downloadResult() {
  const canvas = document.getElementById("resultCanvas");
  const link = document.createElement("a");
  link.download = `atmosphere-${topics[currentIndex]?.id || 'result'}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

function updateResultTag() {
  const tag = document.getElementById("resultTag");
  if (!tag) return;
  const topic = topics[currentIndex];
  let label = "";
  if (colorMode !== 'off') label += colorMode==='random' ? "Random Palette" : (topic?.title+" Palette" || "Palette");
  if (currentStyle !== 'none') { if(label) label+=" + "; label+=STYLE_LABELS[currentStyle]||currentStyle; }
  tag.textContent = label || "Result";
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
function clamp(v) { return Math.max(0,Math.min(255,Math.round(v))); }

function hexToRgba(hex, alpha) {
  const r=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if(!r) return `rgba(0,0,0,${alpha})`;
  return `rgba(${parseInt(r[1],16)},${parseInt(r[2],16)},${parseInt(r[3],16)},${alpha})`;
}

function hexToRgbArr(hex) {
  const r=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return r ? [parseInt(r[1],16),parseInt(r[2],16),parseInt(r[3],16)] : [0,0,0];
}

function blendHex(hexA, hexB, t) {
  const a=hexToRgbArr(hexA), b=hexToRgbArr(hexB);
  return `rgb(${Math.round(a[0]+(b[0]-a[0])*t)},${Math.round(a[1]+(b[1]-a[1])*t)},${Math.round(a[2]+(b[2]-a[2])*t)})`;
}
