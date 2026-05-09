// =============================================
// Game Atmosphere Lab — Screenshot Gallery
// =============================================

let topics = [];
let currentAudio = new Audio();
let currentIndex = 0;
let activeBgLayer = null;

// Gallery state
let galleryItems = [];   // array of {src, caption}
let activeThumbIndex = 0;
let lightboxIndex = 0;

// Lab state
let colorMode = 'off';
let currentStyle = 'none';

// Offscreen canvas for pixel effects
const offscreen = document.createElement('canvas');
const offCtx = offscreen.getContext('2d');

// =====================
// PALETTE DATA
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
  none:"Original", pixel:"Pixel Art", lowpoly:"Low Poly",
  horror:"Horror", neon:"Neon / Cyber", painterly:"Painterly",
  darkfantasy:"Dark Fantasy", openworld:"Open World",
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
    drawDefaultScene();
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

  // Restart card animation
  const infoBox = document.querySelector(".info-box");
  infoBox.style.animation = "none";
  infoBox.offsetHeight;
  infoBox.style.animation = "";

  document.querySelectorAll(".topic-btn").forEach(btn =>
    btn.classList.toggle("active", btn.dataset.id === topic.id));

  history.replaceState(null, "", "#" + topic.id);

  renderPalette(topic.id);
  buildGallery(topic);

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
  (PALETTES[topicId] || []).forEach(hex => {
    const s = document.createElement("div");
    s.className = "swatch";
    s.style.background = hex;
    s.setAttribute("data-hex", hex);
    container.appendChild(s);
  });
}

// =====================
// BACKGROUND
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
// SCREENSHOT GALLERY
// =====================
function buildGallery(topic) {
  const strip = document.getElementById("galleryStrip");
  const mainImg = document.getElementById("galleryMainImg");
  const caption = document.getElementById("galleryCaption");
  const galleryTitle = document.getElementById("galleryTitle");
  const galleryDisplay = document.getElementById("galleryDisplay");

  strip.innerHTML = "";
  galleryItems = [];

  galleryTitle.textContent = topic.title;

  // Build items from screenshots
  if (topic.screenshots && topic.screenshots.length) {
    topic.screenshots.forEach(s => {
      galleryItems.push({ src: s.src, caption: s.caption });
    });
  }

  if (galleryItems.length === 0) return;

  // Build thumbnail strip
  galleryItems.forEach((item, i) => {
    const thumb = document.createElement("div");
    thumb.className = "thumb" + (i === 0 ? " active" : "");
    thumb.dataset.index = i;

    const tImg = document.createElement("img");
    tImg.src = item.src;
    tImg.alt = item.caption;
    tImg.loading = "lazy";
    thumb.appendChild(tImg);

    // Number badge
    const badge = document.createElement("div");
    badge.className = "thumb-num";
    badge.textContent = i + 1 + " / " + galleryItems.length;
    thumb.appendChild(badge);

    thumb.addEventListener("click", () => selectGalleryItem(i));
    strip.appendChild(thumb);
  });

  // Show first item
  activeThumbIndex = 0;
  mainImg.src = galleryItems[0].src;
  mainImg.alt = galleryItems[0].caption;
  caption.textContent = galleryItems[0].caption;

  // Click main display → open lightbox
  galleryDisplay.onclick = () => openLightbox(activeThumbIndex);
}

function selectGalleryItem(index) {
  if (index < 0 || index >= galleryItems.length) return;
  activeThumbIndex = index;
  const item = galleryItems[index];

  // Crossfade main image
  const mainImg = document.getElementById("galleryMainImg");
  mainImg.style.opacity = "0";
  setTimeout(() => {
    mainImg.src = item.src;
    mainImg.alt = item.caption;
    mainImg.style.opacity = "1";
    mainImg.style.transition = "opacity 0.3s ease";
  }, 150);

  document.getElementById("galleryCaption").textContent = item.caption;

  // Update active thumbnail
  document.querySelectorAll(".thumb").forEach((t, i) =>
    t.classList.toggle("active", i === index));

  // Scroll into view
  const thumbEl = document.querySelector(`.thumb[data-index="${index}"]`);
  if (thumbEl) thumbEl.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
}

// =====================
// LIGHTBOX
// =====================
function openLightbox(index) {
  if (galleryItems.length === 0) return;
  lightboxIndex = index;
  updateLightbox();
  document.getElementById("lightbox").classList.add("open");
  document.body.style.overflow = "hidden";
  document.addEventListener("keydown", lightboxKeyHandler);
}

function updateLightbox() {
  const item = galleryItems[lightboxIndex];
  if (!item) return;

  const lbImg = document.getElementById("lightboxImg");
  const lbCap = document.getElementById("lightboxCaption");
  const lbCounter = document.getElementById("lightboxCounter");

  lbImg.style.opacity = "0";
  lbImg.style.transform = "scale(0.95)";
  setTimeout(() => {
    lbImg.src = item.src;
    lbImg.alt = item.caption;
    lbCap.textContent = item.caption;
    lbCounter.textContent = (lightboxIndex + 1) + " / " + galleryItems.length;
    lbImg.style.opacity = "1";
    lbImg.style.transform = "scale(1)";
    lbImg.style.transition = "opacity 0.22s ease, transform 0.22s ease";
  }, 80);

  // Prev/next button state
  document.getElementById("lightboxPrev").disabled = lightboxIndex === 0;
  document.getElementById("lightboxNext").disabled = lightboxIndex === galleryItems.length - 1;
}

function lightboxNav(direction, e) {
  if (e) e.stopPropagation();
  const next = lightboxIndex + direction;
  if (next >= 0 && next < galleryItems.length) {
    lightboxIndex = next;
    selectGalleryItem(next);
    updateLightbox();
  }
}

function closeLightbox() {
  document.getElementById("lightbox").classList.remove("open");
  document.body.style.overflow = "";
  document.removeEventListener("keydown", lightboxKeyHandler);
}

function lightboxKeyHandler(e) {
  if (e.key === "ArrowRight") lightboxNav(1, null);
  if (e.key === "ArrowLeft")  lightboxNav(-1, null);
  if (e.key === "Escape")     closeLightbox();
}

// =====================
// IMAGE UPLOAD
// =====================
document.getElementById("imageUpload").addEventListener("change", function(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(ev) {
    const img = new Image();
    img.onload = function() {
      offscreen.width = 640; offscreen.height = 360;
      offCtx.drawImage(img, 0, 0, 640, 360);
      const src = document.getElementById("sourceCanvas");
      const sCtx = src.getContext("2d");
      src.width = 640; src.height = 360;
      sCtx.drawImage(offscreen, 0, 0);
      applyEffects();
    };
    img.src = ev.target.result;
  };
  reader.readAsDataURL(file);
});

// =====================
// DEFAULT CANVAS SCENE
// =====================
function drawDefaultScene() {
  const src = document.getElementById("sourceCanvas");
  const ctx = src.getContext("2d");
  const W = src.width = 640, H = src.height = 360;

  const sky = ctx.createLinearGradient(0,0,0,H*.65);
  sky.addColorStop(0,"#4A7FA5"); sky.addColorStop(1,"#A8CEDD");
  ctx.fillStyle=sky; ctx.fillRect(0,0,W,H);

  ctx.fillStyle="rgba(255,255,255,0.7)";
  [[.1,.05],[.2,.12],[.35,.04],[.5,.09],[.65,.06],[.75,.14],[.85,.03],[.92,.1],[.42,.16],[.58,.02]].forEach(([sx,sy])=>{
    ctx.beginPath(); ctx.arc(sx*W,sy*H*.7,1.5,0,Math.PI*2); ctx.fill();
  });

  ctx.beginPath(); ctx.arc(W*.82,H*.16,24,0,Math.PI*2);
  ctx.fillStyle="#FFFDE7"; ctx.shadowColor="#FFFDE7"; ctx.shadowBlur=18;
  ctx.fill(); ctx.shadowBlur=0;

  ctx.beginPath(); ctx.moveTo(0,H*.55);
  ctx.bezierCurveTo(W*.15,H*.36,W*.35,H*.43,W*.5,H*.49);
  ctx.bezierCurveTo(W*.65,H*.55,W*.8,H*.39,W,H*.45);
  ctx.lineTo(W,H); ctx.lineTo(0,H); ctx.closePath();
  ctx.fillStyle="#3A6040"; ctx.fill();

  ctx.beginPath(); ctx.moveTo(0,H*.68);
  ctx.bezierCurveTo(W*.2,H*.56,W*.4,H*.62,W*.6,H*.60);
  ctx.bezierCurveTo(W*.75,H*.58,W*.88,H*.66,W,H*.62);
  ctx.lineTo(W,H); ctx.lineTo(0,H); ctx.closePath();
  ctx.fillStyle="#2E5030"; ctx.fill();

  const grd=ctx.createLinearGradient(0,H*.68,0,H);
  grd.addColorStop(0,"#4A7A35"); grd.addColorStop(1,"#2A4A20");
  ctx.fillStyle=grd; ctx.fillRect(0,H*.72,W,H*.28);

  [[.06,.28],[.14,.22],[.72,.25],[.80,.32],[.88,.20],[.94,.26]].forEach(([x,h])=>
    drawTree(ctx,x*W,H*.72,h*H,"#1E3820"));

  ctx.beginPath();
  ctx.moveTo(W*.42,H); ctx.bezierCurveTo(W*.44,H*.82,W*.48,H*.76,W*.5,H*.73);
  ctx.bezierCurveTo(W*.52,H*.76,W*.56,H*.82,W*.58,H);
  ctx.closePath(); ctx.fillStyle="#8B7355"; ctx.fill();

  offscreen.width=640; offscreen.height=360;
  offCtx.drawImage(src,0,0);
  const res=document.getElementById("resultCanvas");
  const rCtx=res.getContext("2d");
  res.width=640; res.height=360;
  rCtx.drawImage(src,0,0);
}

function drawTree(ctx,x,baseY,height,color) {
  ctx.fillStyle=blendHex(color,"#000000",0.35);
  ctx.fillRect(x-4,baseY-height*.25,8,height*.25);
  ctx.beginPath(); ctx.moveTo(x,baseY-height); ctx.lineTo(x-height*.35,baseY-height*.28); ctx.lineTo(x+height*.35,baseY-height*.28); ctx.closePath();
  ctx.fillStyle=color; ctx.fill();
  ctx.beginPath(); ctx.moveTo(x,baseY-height*.75); ctx.lineTo(x-height*.28,baseY-height*.15); ctx.lineTo(x+height*.28,baseY-height*.15); ctx.closePath();
  ctx.fillStyle=blendHex(color,"#ffffff",0.12); ctx.fill();
}

// =====================
// PIXEL EFFECTS PIPELINE
// =====================
function applyEffects() {
  const overlay = document.getElementById("processingOverlay");
  overlay.classList.add("visible");
  setTimeout(() => {
    try {
      const W=offscreen.width, H=offscreen.height;
      let imageData=offscreen.getContext("2d").getImageData(0,0,W,H);
      if (colorMode!=='off') imageData=remapColors(imageData,getActivePalette());
      if (currentStyle!=='none') imageData=applyArtStyle(imageData,currentStyle,W,H);
      const res=document.getElementById("resultCanvas");
      res.width=W; res.height=H;
      res.getContext("2d").putImageData(imageData,0,0);
      applyPostFilter(res);
      updateResultTag();
    } catch(e) { console.error("Effect error:",e); }
    overlay.classList.remove("visible");
  }, 30);
}

function getActivePalette() {
  if (colorMode==='random') {
    const all=Object.values(PALETTES);
    return all[Math.floor(Math.random()*all.length)];
  }
  return PALETTES[topics[currentIndex]?.id]||PALETTES["cozy-pixel-farming"];
}

function remapColors(imageData, palette) {
  const data=imageData.data, palRGB=palette.map(hexToRgbArr);
  for (let i=0;i<data.length;i+=4) {
    const r=data[i],g=data[i+1],b=data[i+2];
    let best=0,bestDist=Infinity;
    for (let p=0;p<palRGB.length;p++) {
      const d=(palRGB[p][0]-r)**2*.299+(palRGB[p][1]-g)**2*.587+(palRGB[p][2]-b)**2*.114;
      if(d<bestDist){bestDist=d;best=p;}
    }
    const lum=.299*r+.587*g+.114*b, pc=palRGB[best];
    const palLum=.299*pc[0]+.587*pc[1]+.114*pc[2];
    const ratio=palLum>0?lum/palLum:1;
    data[i]=clamp(pc[0]*ratio); data[i+1]=clamp(pc[1]*ratio); data[i+2]=clamp(pc[2]*ratio);
  }
  return imageData;
}

function applyArtStyle(imageData,style,W,H) {
  switch(style) {
    case 'pixel':       return effectPixel(imageData,W,H,8);
    case 'lowpoly':     return effectLowPoly(imageData,W,H);
    case 'horror':      return effectHorror(imageData,W,H);
    case 'neon':        return effectNeon(imageData,W,H);
    case 'painterly':   return effectPainterly(imageData,W,H);
    case 'darkfantasy': return effectDarkFantasy(imageData,W,H);
    case 'openworld':   return effectOpenWorld(imageData,W,H);
    default:            return imageData;
  }
}

function effectPixel(imageData,W,H,size) {
  const data=imageData.data;
  for(let y=0;y<H;y+=size) for(let x=0;x<W;x+=size) {
    const cx=Math.min(x+Math.floor(size/2),W-1),cy=Math.min(y+Math.floor(size/2),H-1);
    const idx=(cy*W+cx)*4,r=data[idx],g=data[idx+1],b=data[idx+2];
    for(let dy=0;dy<size&&y+dy<H;dy++) for(let dx=0;dx<size&&x+dx<W;dx++) {
      const i=((y+dy)*W+(x+dx))*4; data[i]=r;data[i+1]=g;data[i+2]=b;
    }
  }
  return imageData;
}

function effectLowPoly(imageData,W,H) {
  const tmp=document.createElement('canvas'); tmp.width=W;tmp.height=H;
  const ctx=tmp.getContext('2d'); ctx.putImageData(imageData,0,0);
  const cols=18,rows=10,pts=[];
  for(let r=0;r<=rows;r++) for(let c=0;c<=cols;c++) {
    const jx=r===0||r===rows?0:(Math.random()-.5)*(W/cols)*.7;
    const jy=c===0||c===cols?0:(Math.random()-.5)*(H/rows)*.7;
    pts.push([Math.max(0,Math.min(W,c/cols*W+jx)),Math.max(0,Math.min(H,r/rows*H+jy))]);
  }
  const orig=imageData.data;
  for(let r=0;r<rows;r++) for(let c=0;c<cols;c++) {
    const tl=pts[r*(cols+1)+c],tr=pts[r*(cols+1)+c+1],bl=pts[(r+1)*(cols+1)+c],br=pts[(r+1)*(cols+1)+c+1];
    [[tl,tr,bl],[tr,br,bl]].forEach(([a,b,c2])=>{
      const cx=Math.round((a[0]+b[0]+c2[0])/3),cy=Math.round((a[1]+b[1]+c2[1])/3);
      const si=(Math.max(0,Math.min(H-1,cy))*W+Math.max(0,Math.min(W-1,cx)))*4;
      ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.lineTo(c2[0],c2[1]);ctx.closePath();
      ctx.fillStyle=`rgb(${orig[si]},${orig[si+1]},${orig[si+2]})`;ctx.fill();
      ctx.strokeStyle="rgba(0,0,0,0.08)";ctx.lineWidth=0.5;ctx.stroke();
    });
  }
  return ctx.getImageData(0,0,W,H);
}

function effectHorror(imageData,W,H) {
  const data=imageData.data;
  for(let i=0;i<data.length;i+=4){
    const lum=.299*data[i]+.587*data[i+1]+.114*data[i+2];
    data[i]=clamp(data[i]*.2+lum*.8);data[i+1]=clamp(data[i+1]*.2+lum*.8);data[i+2]=clamp(data[i+2]*.2+lum*.8);
    data[i]=clamp(Math.pow(data[i]/255,1.6)*255);data[i+1]=clamp(Math.pow(data[i+1]/255,1.6)*255);data[i+2]=clamp(Math.pow(data[i+2]/255,1.6)*255);
    const br=(data[i]+data[i+1]+data[i+2])/3;
    if(br<80) data[i]=clamp(data[i]+20);
    const grain=(Math.random()-.5)*30;
    data[i]=clamp(data[i]+grain);data[i+1]=clamp(data[i+1]+grain);data[i+2]=clamp(data[i+2]+grain);
  }
  addVignette(data,W,H,0.7); return imageData;
}

function effectNeon(imageData,W,H) {
  const data=imageData.data;
  for(let i=0;i<data.length;i+=4){
    const lum=.299*data[i]+.587*data[i+1]+.114*data[i+2];
    data[i]=clamp(lum+(data[i]-lum)*3.5);data[i+1]=clamp(lum+(data[i+1]-lum)*3.5);data[i+2]=clamp(lum+(data[i+2]-lum)*3.5);
    const br=(data[i]+data[i+1]+data[i+2])/3;
    if(br<100){data[i]=clamp(data[i]*.3);data[i+1]=clamp(data[i+1]*.3);data[i+2]=clamp(data[i+2]*.3);}
  }
  for(let i=0;i<data.length;i+=4){
    data[i]=clamp((data[i]-128)*1.8+128);data[i+1]=clamp((data[i+1]-128)*1.8+128);data[i+2]=clamp((data[i+2]-128)*1.8+128);
  }
  return imageData;
}

function effectPainterly(imageData,W,H) {
  const data=imageData.data,tmp=new Uint8ClampedArray(data),r=3;
  for(let y=r;y<H-r;y++) for(let x=r;x<W-r;x++){
    let rv=0,gv=0,bv=0,count=0;
    for(let dy=-r;dy<=r;dy++) for(let dx=-r;dx<=r;dx++){const i=((y+dy)*W+(x+dx))*4;rv+=tmp[i];gv+=tmp[i+1];bv+=tmp[i+2];count++;}
    const idx=(y*W+x)*4;
    data[idx]=clamp(rv/count*.75+tmp[idx]*.25);data[idx+1]=clamp(gv/count*.75+tmp[idx+1]*.25);data[idx+2]=clamp(bv/count*.75+tmp[idx+2]*.25);
  }
  for(let i=0;i<data.length;i+=4){const t=(Math.random()-.5)*12;data[i]=clamp(data[i]+t);data[i+1]=clamp(data[i+1]+t);data[i+2]=clamp(data[i+2]+t);}
  return imageData;
}

function effectDarkFantasy(imageData,W,H) {
  const data=imageData.data;
  for(let i=0;i<data.length;i+=4){
    const r=data[i],g=data[i+1],b=data[i+2];
    data[i]=clamp(r*.393+g*.769+b*.189);data[i+1]=clamp(r*.349+g*.686+b*.168);data[i+2]=clamp(r*.272+g*.534+b*.131);
    data[i]=clamp(data[i]*.7);data[i+1]=clamp(data[i+1]*.65);data[i+2]=clamp(data[i+2]*.6);
    const br=(data[i]+data[i+1]+data[i+2])/3;
    if(br<80) data[i+2]=clamp(data[i+2]+15);
  }
  addVignette(data,W,H,0.85); return imageData;
}

function effectOpenWorld(imageData,W,H) {
  const data=imageData.data,tmp=new Uint8ClampedArray(data),r=1;
  for(let y=r;y<H-r;y++) for(let x=r;x<W-r;x++){
    let rv=0,gv=0,bv=0,count=0;
    for(let dy=-r;dy<=r;dy++) for(let dx=-r;dx<=r;dx++){const i=((y+dy)*W+(x+dx))*4;rv+=tmp[i];gv+=tmp[i+1];bv+=tmp[i+2];count++;}
    const idx=(y*W+x)*4;data[idx]=rv/count;data[idx+1]=gv/count;data[idx+2]=bv/count;
  }
  for(let i=0;i<data.length;i+=4){
    data[i]=clamp(data[i]*1.15);data[i+1]=clamp(data[i+1]*1.2);data[i+2]=clamp(data[i+2]*1.05);
    const br=(data[i]+data[i+1]+data[i+2])/3;
    if(br>150){data[i]=clamp(data[i]+15);data[i+1]=clamp(data[i+1]+10);}
    data[i]=clamp((data[i]-128)*.88+128);data[i+1]=clamp((data[i+1]-128)*.88+128);data[i+2]=clamp((data[i+2]-128)*.88+128);
  }
  return imageData;
}

function applyPostFilter(canvas) {
  const f={none:"",pixel:"contrast(1.1)",lowpoly:"contrast(1.05)",horror:"contrast(1.2)",
    neon:"brightness(1.1) contrast(1.1) saturate(1.3) drop-shadow(0 0 6px cyan)",
    painterly:"contrast(0.95) brightness(1.05)",darkfantasy:"contrast(1.15) brightness(0.9)",
    openworld:"contrast(0.95) brightness(1.1) saturate(1.15)"};
  canvas.style.filter=f[currentStyle]||"";
}

function addVignette(data,W,H,strength) {
  const cx=W/2,cy=H/2,maxD=Math.sqrt(cx*cx+cy*cy);
  for(let y=0;y<H;y++) for(let x=0;x<W;x++){
    const f=1-Math.pow(Math.sqrt((x-cx)**2+(y-cy)**2)/maxD,2)*strength;
    const i=(y*W+x)*4;data[i]=clamp(data[i]*f);data[i+1]=clamp(data[i+1]*f);data[i+2]=clamp(data[i+2]*f);
  }
}

// =====================
// LAB CONTROLS
// =====================
function setColor(mode) {
  colorMode=mode;
  ['Off','On','Random'].forEach(m=>document.getElementById('btnColor'+m)?.classList.toggle('active',mode===m.toLowerCase()));
  applyEffects();
}

function setStyle(style) {
  currentStyle=style;
  document.querySelectorAll('.style-btn').forEach(btn=>btn.classList.toggle('active',btn.dataset.style===style));
  applyEffects();
}

function matchCurrentAtmosphere() {
  const topic=topics[currentIndex]; if(!topic) return;
  colorMode='on';
  document.getElementById('btnColorOff').classList.remove('active');
  document.getElementById('btnColorOn').classList.add('active');
  document.getElementById('btnColorRandom').classList.remove('active');
  currentStyle=ATMO_STYLE_MAP[topic.id]||'none';
  document.querySelectorAll('.style-btn').forEach(btn=>btn.classList.toggle('active',btn.dataset.style===currentStyle));
  applyEffects();
}

function downloadResult() {
  const canvas=document.getElementById("resultCanvas");
  const link=document.createElement("a");
  link.download=`atmosphere-${topics[currentIndex]?.id||'result'}.png`;
  link.href=canvas.toDataURL("image/png");
  link.click();
}

function updateResultTag() {
  const tag=document.getElementById("resultTag"); if(!tag) return;
  const topic=topics[currentIndex];
  let label="";
  if(colorMode!=='off') label+=colorMode==='random'?"Random Palette":(topic?.title+" Palette"||"Palette");
  if(currentStyle!=='none'){if(label) label+=" + ";label+=STYLE_LABELS[currentStyle]||currentStyle;}
  tag.textContent=label||"Result";
}

// =====================
// AUDIO
// =====================
document.getElementById("audioBtn").addEventListener("click",()=>{
  if(currentAudio.paused){currentAudio.play();document.getElementById("audioBtn").textContent="Pause Atmosphere Sound";}
  else{currentAudio.pause();document.getElementById("audioBtn").textContent="Play Atmosphere Sound";}
});

// =====================
// HELPERS
// =====================
function clamp(v){return Math.max(0,Math.min(255,Math.round(v)));}
function hexToRgba(hex,alpha){const r=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);if(!r)return `rgba(0,0,0,${alpha})`;return `rgba(${parseInt(r[1],16)},${parseInt(r[2],16)},${parseInt(r[3],16)},${alpha})`;}
function hexToRgbArr(hex){const r=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);return r?[parseInt(r[1],16),parseInt(r[2],16),parseInt(r[3],16)]:[0,0,0];}
function blendHex(a,b,t){const av=hexToRgbArr(a),bv=hexToRgbArr(b);return `rgb(${Math.round(av[0]+(bv[0]-av[0])*t)},${Math.round(av[1]+(bv[1]-av[1])*t)},${Math.round(av[2]+(bv[2]-av[2])*t)})`;}
