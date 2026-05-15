// Game Atmosphere Lab

var topics = [];
var currentAudio = new Audio();
var currentIndex = 0;
var activeBgLayer = null;
var galleryItems = [];
var activeThumbIndex = 0;
var lightboxIndex = 0;
var colorMode = 'off';
var currentStyle = 'none';

var offscreen = document.createElement('canvas');
var offCtx = offscreen.getContext('2d');

var PALETTES = {
  'cozy-pixel-farming':  ['#F3E7C9','#7AA35A','#4B3425','#E8C07A','#A8C88A','#C9956A','#F7D08A','#6B9B4A'],
  'neon-cyberpunk-city': ['#0D0B1F','#00E5FF','#FF00A0','#7B2FFF','#00FF9F','#1A0A3A','#FF6600','#E0E0FF'],
  'low-poly-horror':     ['#1C1F26','#7A1F1F','#D9D9D9','#3D0000','#8B0000','#2E2E3A','#4A0A0A','#AAAAAA'],
  'dark-cute-cartoon':   ['#2A0F16','#D9C27A','#F5EBD8','#8B2252','#C86464','#3D1A22','#F0A0A0','#7A3060'],
  'retro-arcade':        ['#000000','#FFD93D','#FFFFFF','#FF4444','#44AAFF','#44FF44','#FF8800','#AA00FF'],
  'dark-fantasy':        ['#2B2B2B','#B08D57','#E8DFC8','#1A0A00','#6B3F1F','#4A3728','#D4A96A','#3D2B1A'],
  'open-world-fantasy':  ['#BFE7F2','#F4C542','#244B3C','#7EC8E3','#A8E6CF','#FFE066','#3A8A5C','#E8F4F8'],
  'voxel-sandbox':       ['#87C77B','#5A8F3D','#2E2218','#6BB8FF','#F4A460','#8B6914','#4A7A2C','#D4884A']
};

var ATMO_STYLE_MAP = {
  'cozy-pixel-farming':'pixel','neon-cyberpunk-city':'neon','low-poly-horror':'horror',
  'dark-cute-cartoon':'painterly','retro-arcade':'pixel','dark-fantasy':'darkfantasy',
  'open-world-fantasy':'openworld','voxel-sandbox':'pixel'
};

var STYLE_LABELS = {
  none:'Original',pixel:'Pixel Art',lowpoly:'Low Poly',horror:'Horror',
  neon:'Neon / Cyber',painterly:'Painterly',darkfantasy:'Dark Fantasy',openworld:'Open World'
};

// Inline topic data — used as fallback if data.json fails to load
var TOPICS_DATA = [
  {id:'cozy-pixel-farming',title:'Cozy Pixel Farming',gameExamples:['Stardew Valley','Sun Haven','Coral Island'],artStyle:'Pixel art farming and life-sim style',mood:'Peaceful, warm, relaxing',description:'Cozy pixel farming games use warm colors, soft light, small pixel details, and nature-based objects to create a calm and welcoming mood.',backgroundColor:'#F3E7C9',accentColor:'#7AA35A',textColor:'#4B3425',fontClass:'pixel',image:'screenshots/cozy-pixel-farming-1.jpg',imageAlt:'Cozy pixel farming',audio:'audio/cozy-pixel-farming.mp3',screenshots:[{src:'screenshots/cozy-pixel-farming-1.jpg',caption:'Stardew Valley — Farm at sunrise'},{src:'screenshots/cozy-pixel-farming-2.jpg',caption:'Sun Haven — Town square'},{src:'screenshots/cozy-pixel-farming-3.jpg',caption:'Coral Island — Tropical farm life'}]},
  {id:'neon-cyberpunk-city',title:'Neon Cyberpunk City',gameExamples:['Cyberpunk 2077','Ghostrunner','Observer'],artStyle:'Neon sci-fi and futuristic city style',mood:'Futuristic, energetic, high-tech',description:'Cyberpunk games often use dark city backgrounds, glowing neon lights, rain reflections, and futuristic technology.',backgroundColor:'#0D0B1F',accentColor:'#00E5FF',textColor:'#EAFBFF',fontClass:'cyberpunk',image:'screenshots/neon-cyberpunk-city-1.jpg',imageAlt:'Neon cyberpunk city',audio:'audio/neon-cyberpunk-city.mp3',screenshots:[{src:'screenshots/neon-cyberpunk-city-1.jpg',caption:'Cyberpunk 2077 — Night City streets'},{src:'screenshots/neon-cyberpunk-city-2.jpg',caption:'Ghostrunner — Neon rooftop chase'},{src:'screenshots/neon-cyberpunk-city-3.jpg',caption:'Observer — Dark apartment corridor'}]},
  {id:'low-poly-horror',title:'Low-Poly Horror',gameExamples:['Fears to Fathom','Dagon','The Shore'],artStyle:'Low-poly 3D horror style',mood:'Tense, eerie, unsettling',description:'Low-poly horror games use simple 3D shapes, dim lighting, empty rooms, and quiet spaces to create fear.',backgroundColor:'#1C1F26',accentColor:'#7A1F1F',textColor:'#D9D9D9',fontClass:'low-poly-horror',image:'screenshots/low-poly-horror-1.jpg',imageAlt:'Low poly horror',audio:'audio/low-poly-horror.mp3',screenshots:[{src:'screenshots/low-poly-horror-1.jpg',caption:'Fears to Fathom — Empty hallway'},{src:'screenshots/low-poly-horror-2.jpg',caption:'Dagon — Coastal village at night'},{src:'screenshots/low-poly-horror-3.jpg',caption:'The Shore — Foggy coastline'}]},
  {id:'dark-cute-cartoon',title:'Dark Cute Cartoon',gameExamples:['Cult of the Lamb','Hollow Knight','Little Nightmares'],artStyle:'Hand-drawn dark cartoon style',mood:'Dark cute, creepy, playful',description:'Dark cute cartoon games mix adorable character designs with creepy themes, strange symbols, and darker colors.',backgroundColor:'#2A0F16',accentColor:'#D9C27A',textColor:'#F5EBD8',fontClass:'dark-cute',image:'screenshots/dark-cute-cartoon-1.jpg',imageAlt:'Dark cute cartoon',audio:'audio/dark-cute-cartoon.mp3',screenshots:[{src:'screenshots/dark-cute-cartoon-1.jpg',caption:'Cult of the Lamb — Cult ritual'},{src:'screenshots/dark-cute-cartoon-2.jpg',caption:'Hollow Knight — Forgotten crossroads'},{src:'screenshots/dark-cute-cartoon-3.jpg',caption:'Little Nightmares — The kitchen'}]},
  {id:'retro-arcade',title:'Retro Arcade',gameExamples:['Pac-Man','Space Invaders','Galaga'],artStyle:'Simple retro arcade style',mood:'Nostalgic, playful, fast-paced',description:'Retro arcade games use simple shapes, bright colors, and clear visual rules.',backgroundColor:'#000000',accentColor:'#FFD93D',textColor:'#FFFFFF',fontClass:'retro-arcade',image:'screenshots/retro-arcade-2.jpg',imageAlt:'Retro arcade',audio:'audio/retro-arcade.mp3',screenshots:[{src:'screenshots/retro-arcade-2.jpg',caption:'Space Invaders — Alien waves'}]},
  {id:'dark-fantasy',title:'Dark Fantasy',gameExamples:['Elden Ring','Dark Souls','Blasphemous'],artStyle:'Dark fantasy and gothic adventure style',mood:'Epic, dangerous, mysterious',description:'Dark fantasy games combine magical worlds with ruins, monsters, fog, and dramatic landscapes.',backgroundColor:'#2B2B2B',accentColor:'#B08D57',textColor:'#E8DFC8',fontClass:'dark-fantasy',image:'screenshots/dark-fantasy-1.jpg',imageAlt:'Dark fantasy',audio:'audio/dark-fantasy.mp3',screenshots:[{src:'screenshots/dark-fantasy-1.jpg',caption:'Elden Ring — The Lands Between'},{src:'screenshots/dark-fantasy-2.jpg',caption:'Dark Souls — Anor Londo'},{src:'screenshots/dark-fantasy-3.jpg',caption:'Blasphemous — Cathedral'}]},
  {id:'open-world-fantasy',title:'Open-World Fantasy',gameExamples:['Zelda: Breath of the Wild','Genshin Impact','Immortals Fenyx Rising'],artStyle:'Bright open-world fantasy adventure style',mood:'Open, peaceful, heroic',description:'Open-world fantasy games use bright skies, wide landscapes, soft colors, and natural environments.',backgroundColor:'#BFE7F2',accentColor:'#F4C542',textColor:'#244B3C',fontClass:'open-world-fantasy',image:'screenshots/open-world-fantasy-1.jpg',imageAlt:'Open world fantasy',audio:'audio/open-world-fantasy.mp3',screenshots:[{src:'screenshots/open-world-fantasy-1.jpg',caption:'Breath of the Wild — Hyrule fields'},{src:'screenshots/open-world-fantasy-2.jpg',caption:'Genshin Impact — Mondstadt overlook'},{src:'screenshots/open-world-fantasy-3.jpg',caption:'Immortals Fenyx Rising — Golden Isle'}]},
  {id:'voxel-sandbox',title:'Voxel Sandbox',gameExamples:['Minecraft','Hytale','Creativerse'],artStyle:'Blocky voxel sandbox style',mood:'Creative, open, playful',description:'Voxel sandbox games use block-shaped worlds and simple textures.',backgroundColor:'#87C77B',accentColor:'#5A8F3D',textColor:'#2E2218',fontClass:'voxel-sandbox',image:'images/voxel-sandbox.png',imageAlt:'Voxel sandbox',audio:'audio/voxel-sandbox.mp3',screenshots:[]}
];

// Overlay
var bgOverlay = document.createElement('div');
bgOverlay.className = 'bg-overlay';
document.body.prepend(bgOverlay);

// =====================
// INIT — try data.json, fall back to inline data
// =====================
fetch('data.json?v=' + Date.now(), { cache: 'no-store' })
  .then(function(r) {
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return r.json();
  })
  .then(function(data) {
    console.log('[APP] Loaded data.json, topics:', data.topics.length);
    init(data.topics);
  })
  .catch(function(err) {
    console.log('[APP] data.json failed (' + err.message + '), using inline data');
    init(TOPICS_DATA);
  });

function init(topicList) {
  topics = topicList;
  buildMenu();
  var hash = window.location.hash.replace('#', '');
  var hi = hash ? topics.findIndex(function(t) { return t.id === hash; }) : -1;
  showTopic(hi !== -1 ? hi : 0, false);
  drawDefaultScene();
}

// =====================
// MENU
// =====================
function buildMenu() {
  var menu = document.getElementById('topicMenu');
  menu.innerHTML = '';
  topics.forEach(function(topic, i) {
    var btn = document.createElement('button');
    btn.textContent = topic.title;
    btn.className = 'topic-btn';
    btn.dataset.id = topic.id;
    btn.addEventListener('click', function() { showTopic(i, true); });
    menu.appendChild(btn);
  });
}

// =====================
// SHOW TOPIC
// =====================
function showTopic(index, autoPlay) {
  currentIndex = index;
  var t = topics[index];

  document.getElementById('topicTitle').textContent = t.title;
  document.getElementById('gameExamples').textContent = 'Inspired by: ' + t.gameExamples.join(', ');
  document.getElementById('artStyle').textContent = t.artStyle;
  document.getElementById('mood').textContent = t.mood;
  document.getElementById('description').textContent = t.description;
  document.getElementById('topicImage').src = t.image || '';
  document.getElementById('topicImage').alt = t.imageAlt || t.title;

  switchBg(t.image);

  document.documentElement.style.setProperty('--accent-color', t.accentColor);
  document.documentElement.style.setProperty('--text-color', t.textColor);
  document.documentElement.style.setProperty('--card-color', rgba(t.backgroundColor, 0.22));
  bgOverlay.style.background = 'linear-gradient(135deg,' + rgba(t.backgroundColor, 0.55) + ' 0%,rgba(0,0,0,0.5) 100%)';

  var mt = document.querySelector('meta[name="theme-color"]');
  if (mt) mt.setAttribute('content', t.backgroundColor);

  document.body.className = t.fontClass || '';

  var box = document.querySelector('.info-box');
  if (box) { box.style.animation = 'none'; box.offsetHeight; box.style.animation = ''; }

  document.querySelectorAll('.topic-btn').forEach(function(b) {
    b.classList.toggle('active', b.dataset.id === t.id);
  });

  history.replaceState(null, '', '#' + t.id);
  renderPalette(t.id);
  buildGallery(t);

  if (colorMode !== 'off') applyEffects();

  currentAudio.pause();
  currentAudio.currentTime = 0;
  currentAudio.src = t.audio || '';
  currentAudio.loop = true;
  currentAudio.load();

  if (autoPlay) {
    currentAudio.play()
      .then(function() { document.getElementById('audioBtn').textContent = 'Pause Atmosphere Sound'; })
      .catch(function() { document.getElementById('audioBtn').textContent = 'Play Atmosphere Sound'; });
  } else {
    document.getElementById('audioBtn').textContent = 'Play Atmosphere Sound';
  }
}

// =====================
// PALETTE
// =====================
function renderPalette(id) {
  var c = document.getElementById('paletteSwatches');
  c.innerHTML = '';
  (PALETTES[id] || []).forEach(function(hex) {
    var s = document.createElement('div');
    s.className = 'swatch';
    s.style.background = hex;
    s.setAttribute('data-hex', hex);
    c.appendChild(s);
  });
}

// =====================
// BACKGROUND
// =====================
function switchBg(url) {
  if (!url) return;
  if (activeBgLayer) {
    var old = activeBgLayer;
    old.classList.remove('active');
    old.classList.add('leaving');
    setTimeout(function() { old.remove(); }, 600);
  }
  var layer = document.createElement('div');
  layer.className = 'bg-layer';
  layer.style.backgroundImage = "url('" + url + "')";
  document.body.prepend(layer);
  requestAnimationFrame(function() {
    requestAnimationFrame(function() { layer.classList.add('active'); });
  });
  activeBgLayer = layer;
}

// =====================
// GALLERY
// =====================
function buildGallery(topic) {
  var strip   = document.getElementById('galleryStrip');
  var mainImg = document.getElementById('galleryMainImg');
  var caption = document.getElementById('galleryCaption');
  var title   = document.getElementById('galleryTitle');
  var display = document.getElementById('galleryDisplay');

  strip.innerHTML = '';
  galleryItems = [];
  activeThumbIndex = 0;
  lightboxIndex = 0;
  title.textContent = topic.title;

  if (topic.screenshots && topic.screenshots.length > 0) {
    topic.screenshots.forEach(function(s) {
      galleryItems.push({ src: s.src, caption: s.caption });
    });
  }

  if (galleryItems.length === 0) {
    mainImg.src = '';
    caption.textContent = '';
    strip.innerHTML = '<div class="gallery-empty">Screenshots coming soon.</div>';
    display.onclick = null;
    return;
  }

  // Show first item immediately
  mainImg.src = galleryItems[0].src;
  mainImg.alt = galleryItems[0].caption;
  caption.textContent = galleryItems[0].caption;

  // Build thumbnails
  galleryItems.forEach(function(item, i) {
    var thumb = document.createElement('div');
    thumb.className = 'thumb' + (i === 0 ? ' active' : '');
    thumb.dataset.index = i;

    var img = document.createElement('img');
    img.src = item.src;
    img.alt = item.caption;
    img.loading = 'lazy';
    thumb.appendChild(img);

    var num = document.createElement('div');
    num.className = 'thumb-num';
    num.textContent = (i + 1) + ' / ' + galleryItems.length;
    thumb.appendChild(num);

    thumb.addEventListener('click', function(e) {
      e.stopPropagation();
      selectThumb(i);
    });
    strip.appendChild(thumb);
  });

  display.onclick = function() { openLightbox(activeThumbIndex); };
}

function selectThumb(index) {
  if (index < 0 || index >= galleryItems.length) return;
  activeThumbIndex = index;
  var item = galleryItems[index];
  var mainImg = document.getElementById('galleryMainImg');

  mainImg.style.opacity = '0';
  setTimeout(function() {
    mainImg.src = item.src;
    mainImg.alt = item.caption;
    mainImg.style.opacity = '1';
    mainImg.style.transition = 'opacity 0.3s ease';
  }, 150);

  document.getElementById('galleryCaption').textContent = item.caption;
  document.querySelectorAll('.thumb').forEach(function(t, i) {
    t.classList.toggle('active', i === index);
  });
  var el = document.querySelector('.thumb[data-index="' + index + '"]');
  if (el) el.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
}

// =====================
// LIGHTBOX
// =====================
function openLightbox(index) {
  if (!galleryItems.length) return;
  lightboxIndex = index;
  updateLightbox();
  document.getElementById('lightbox').classList.add('open');
  document.body.style.overflow = 'hidden';
  document.addEventListener('keydown', lbKey);
}

function updateLightbox() {
  var item = galleryItems[lightboxIndex];
  if (!item) return;
  document.getElementById('lightboxImg').src = item.src;
  document.getElementById('lightboxImg').alt = item.caption;
  document.getElementById('lightboxCaption').textContent = item.caption;
  document.getElementById('lightboxCounter').textContent = (lightboxIndex + 1) + ' / ' + galleryItems.length;
  document.getElementById('lightboxPrev').disabled = lightboxIndex === 0;
  document.getElementById('lightboxNext').disabled = lightboxIndex === galleryItems.length - 1;
}

function lightboxNav(dir, e) {
  if (e) e.stopPropagation();
  var n = lightboxIndex + dir;
  if (n >= 0 && n < galleryItems.length) {
    lightboxIndex = n;
    selectThumb(n);
    updateLightbox();
  }
}

function closeLightbox() {
  document.getElementById('lightbox').classList.remove('open');
  document.body.style.overflow = '';
  document.removeEventListener('keydown', lbKey);
}

function lbKey(e) {
  if (e.key === 'ArrowRight') lightboxNav(1, null);
  if (e.key === 'ArrowLeft')  lightboxNav(-1, null);
  if (e.key === 'Escape')     closeLightbox();
}

// =====================
// IMAGE UPLOAD
// =====================
document.getElementById('imageUpload').addEventListener('change', function(e) {
  var file = e.target.files[0];
  if (!file) return;
  var reader = new FileReader();
  reader.onload = function(ev) {
    var img = new Image();
    img.onload = function() {
      offscreen.width = 640; offscreen.height = 360;
      offCtx.drawImage(img, 0, 0, 640, 360);
      var src = document.getElementById('sourceCanvas');
      src.width = 640; src.height = 360;
      src.getContext('2d').drawImage(offscreen, 0, 0);
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
  var src = document.getElementById('sourceCanvas');
  var ctx = src.getContext('2d');
  var W = src.width = 640, H = src.height = 360;
  var sky = ctx.createLinearGradient(0,0,0,H*.65);
  sky.addColorStop(0,'#4A7FA5'); sky.addColorStop(1,'#A8CEDD');
  ctx.fillStyle=sky; ctx.fillRect(0,0,W,H);
  ctx.fillStyle='rgba(255,255,255,0.7)';
  [[.1,.05],[.2,.12],[.35,.04],[.5,.09],[.65,.06],[.75,.14],[.85,.03],[.92,.1]].forEach(function(p){
    ctx.beginPath();ctx.arc(p[0]*W,p[1]*H*.7,1.5,0,Math.PI*2);ctx.fill();
  });
  ctx.beginPath();ctx.arc(W*.82,H*.16,24,0,Math.PI*2);
  ctx.fillStyle='#FFFDE7';ctx.shadowColor='#FFFDE7';ctx.shadowBlur=18;ctx.fill();ctx.shadowBlur=0;
  ctx.beginPath();ctx.moveTo(0,H*.55);
  ctx.bezierCurveTo(W*.15,H*.36,W*.35,H*.43,W*.5,H*.49);
  ctx.bezierCurveTo(W*.65,H*.55,W*.8,H*.39,W,H*.45);
  ctx.lineTo(W,H);ctx.lineTo(0,H);ctx.closePath();ctx.fillStyle='#3A6040';ctx.fill();
  ctx.beginPath();ctx.moveTo(0,H*.68);
  ctx.bezierCurveTo(W*.2,H*.56,W*.4,H*.62,W*.6,H*.60);
  ctx.bezierCurveTo(W*.75,H*.58,W*.88,H*.66,W,H*.62);
  ctx.lineTo(W,H);ctx.lineTo(0,H);ctx.closePath();ctx.fillStyle='#2E5030';ctx.fill();
  var grd=ctx.createLinearGradient(0,H*.68,0,H);
  grd.addColorStop(0,'#4A7A35');grd.addColorStop(1,'#2A4A20');
  ctx.fillStyle=grd;ctx.fillRect(0,H*.72,W,H*.28);
  [[.06,.28],[.14,.22],[.72,.25],[.80,.32],[.88,.20],[.94,.26]].forEach(function(p){
    dTree(ctx,p[0]*W,H*.72,p[1]*H,'#1E3820');
  });
  ctx.beginPath();
  ctx.moveTo(W*.42,H);ctx.bezierCurveTo(W*.44,H*.82,W*.48,H*.76,W*.5,H*.73);
  ctx.bezierCurveTo(W*.52,H*.76,W*.56,H*.82,W*.58,H);
  ctx.closePath();ctx.fillStyle='#8B7355';ctx.fill();
  offscreen.width=640;offscreen.height=360;offCtx.drawImage(src,0,0);
  var res=document.getElementById('resultCanvas');
  res.width=640;res.height=360;res.getContext('2d').drawImage(src,0,0);
}

function dTree(ctx,x,baseY,h,color) {
  ctx.fillStyle=bHex(color,'#000000',0.35);ctx.fillRect(x-4,baseY-h*.25,8,h*.25);
  ctx.beginPath();ctx.moveTo(x,baseY-h);ctx.lineTo(x-h*.35,baseY-h*.28);ctx.lineTo(x+h*.35,baseY-h*.28);ctx.closePath();ctx.fillStyle=color;ctx.fill();
  ctx.beginPath();ctx.moveTo(x,baseY-h*.75);ctx.lineTo(x-h*.28,baseY-h*.15);ctx.lineTo(x+h*.28,baseY-h*.15);ctx.closePath();ctx.fillStyle=bHex(color,'#ffffff',0.12);ctx.fill();
}

// =====================
// EFFECTS PIPELINE
// =====================
function applyEffects() {
  var ov=document.getElementById('processingOverlay');ov.classList.add('visible');
  setTimeout(function(){
    try {
      var W=offscreen.width,H=offscreen.height;
      var id=offscreen.getContext('2d').getImageData(0,0,W,H);
      if(colorMode!=='off') id=remapColors(id,getPalette());
      if(currentStyle!=='none') id=applyStyle(id,currentStyle,W,H);
      var res=document.getElementById('resultCanvas');
      res.width=W;res.height=H;res.getContext('2d').putImageData(id,0,0);
      postFilter(res);updateResultTag();
    }catch(e){console.error(e);}
    ov.classList.remove('visible');
  },30);
}

function getPalette(){
  if(colorMode==='random'){var a=Object.values(PALETTES);return a[Math.floor(Math.random()*a.length)];}
  var t=topics[currentIndex];return(t&&PALETTES[t.id])||PALETTES['cozy-pixel-farming'];
}

function remapColors(id,palette){
  var d=id.data,pal=palette.map(hArr);
  for(var i=0;i<d.length;i+=4){
    var r=d[i],g=d[i+1],b=d[i+2],best=0,bd=Infinity;
    for(var p=0;p<pal.length;p++){var dist=(pal[p][0]-r)*(pal[p][0]-r)*.299+(pal[p][1]-g)*(pal[p][1]-g)*.587+(pal[p][2]-b)*(pal[p][2]-b)*.114;if(dist<bd){bd=dist;best=p;}}
    var lum=.299*r+.587*g+.114*b,pc=pal[best],pl=.299*pc[0]+.587*pc[1]+.114*pc[2],ratio=pl>0?lum/pl:1;
    d[i]=cl(pc[0]*ratio);d[i+1]=cl(pc[1]*ratio);d[i+2]=cl(pc[2]*ratio);
  }
  return id;
}

function applyStyle(id,style,W,H){
  switch(style){
    case'pixel':return fxPixel(id,W,H,8);
    case'lowpoly':return fxLowPoly(id,W,H);
    case'horror':return fxHorror(id,W,H);
    case'neon':return fxNeon(id,W,H);
    case'painterly':return fxPainterly(id,W,H);
    case'darkfantasy':return fxDark(id,W,H);
    case'openworld':return fxOpen(id,W,H);
    default:return id;
  }
}

function fxPixel(id,W,H,sz){
  var d=id.data;
  for(var y=0;y<H;y+=sz)for(var x=0;x<W;x+=sz){
    var cx=Math.min(x+Math.floor(sz/2),W-1),cy=Math.min(y+Math.floor(sz/2),H-1);
    var idx=(cy*W+cx)*4,r=d[idx],g=d[idx+1],b=d[idx+2];
    for(var dy=0;dy<sz&&y+dy<H;dy++)for(var dx=0;dx<sz&&x+dx<W;dx++){var i=((y+dy)*W+(x+dx))*4;d[i]=r;d[i+1]=g;d[i+2]=b;}
  }
  return id;
}

function fxLowPoly(id,W,H){
  var tmp=document.createElement('canvas');tmp.width=W;tmp.height=H;
  var ctx=tmp.getContext('2d');ctx.putImageData(id,0,0);
  var cols=18,rows=10,pts=[];
  for(var r=0;r<=rows;r++)for(var c=0;c<=cols;c++){
    pts.push([Math.max(0,Math.min(W,c/cols*W+(r===0||r===rows?0:(Math.random()-.5)*(W/cols)*.7))),Math.max(0,Math.min(H,r/rows*H+(c===0||c===cols?0:(Math.random()-.5)*(H/rows)*.7)))]);
  }
  var orig=id.data;
  for(var ri=0;ri<rows;ri++)for(var ci=0;ci<cols;ci++){
    var tl=pts[ri*(cols+1)+ci],tr=pts[ri*(cols+1)+ci+1],bl=pts[(ri+1)*(cols+1)+ci],br=pts[(ri+1)*(cols+1)+ci+1];
    [[tl,tr,bl],[tr,br,bl]].forEach(function(t){
      var cx=Math.round((t[0][0]+t[1][0]+t[2][0])/3),cy=Math.round((t[0][1]+t[1][1]+t[2][1])/3);
      var si=(Math.max(0,Math.min(H-1,cy))*W+Math.max(0,Math.min(W-1,cx)))*4;
      ctx.beginPath();ctx.moveTo(t[0][0],t[0][1]);ctx.lineTo(t[1][0],t[1][1]);ctx.lineTo(t[2][0],t[2][1]);ctx.closePath();
      ctx.fillStyle='rgb('+orig[si]+','+orig[si+1]+','+orig[si+2]+')';ctx.fill();
      ctx.strokeStyle='rgba(0,0,0,0.08)';ctx.lineWidth=0.5;ctx.stroke();
    });
  }
  return ctx.getImageData(0,0,W,H);
}

function fxHorror(id,W,H){
  var d=id.data;
  for(var i=0;i<d.length;i+=4){
    var lum=.299*d[i]+.587*d[i+1]+.114*d[i+2];
    d[i]=cl(d[i]*.2+lum*.8);d[i+1]=cl(d[i+1]*.2+lum*.8);d[i+2]=cl(d[i+2]*.2+lum*.8);
    d[i]=cl(Math.pow(d[i]/255,1.6)*255);d[i+1]=cl(Math.pow(d[i+1]/255,1.6)*255);d[i+2]=cl(Math.pow(d[i+2]/255,1.6)*255);
    if((d[i]+d[i+1]+d[i+2])/3<80)d[i]=cl(d[i]+20);
    var g=(Math.random()-.5)*30;d[i]=cl(d[i]+g);d[i+1]=cl(d[i+1]+g);d[i+2]=cl(d[i+2]+g);
  }
  vig(d,W,H,0.7);return id;
}

function fxNeon(id,W,H){
  var d=id.data;
  for(var i=0;i<d.length;i+=4){
    var lum=.299*d[i]+.587*d[i+1]+.114*d[i+2];
    d[i]=cl(lum+(d[i]-lum)*3.5);d[i+1]=cl(lum+(d[i+1]-lum)*3.5);d[i+2]=cl(lum+(d[i+2]-lum)*3.5);
    if((d[i]+d[i+1]+d[i+2])/3<100){d[i]=cl(d[i]*.3);d[i+1]=cl(d[i+1]*.3);d[i+2]=cl(d[i+2]*.3);}
  }
  for(var j=0;j<d.length;j+=4){d[j]=cl((d[j]-128)*1.8+128);d[j+1]=cl((d[j+1]-128)*1.8+128);d[j+2]=cl((d[j+2]-128)*1.8+128);}
  return id;
}

function fxPainterly(id,W,H){
  var d=id.data,tmp=new Uint8ClampedArray(d),r=3;
  for(var y=r;y<H-r;y++)for(var x=r;x<W-r;x++){
    var rv=0,gv=0,bv=0,cnt=0;
    for(var dy=-r;dy<=r;dy++)for(var dx=-r;dx<=r;dx++){var i=((y+dy)*W+(x+dx))*4;rv+=tmp[i];gv+=tmp[i+1];bv+=tmp[i+2];cnt++;}
    var idx=(y*W+x)*4;d[idx]=cl(rv/cnt*.75+tmp[idx]*.25);d[idx+1]=cl(gv/cnt*.75+tmp[idx+1]*.25);d[idx+2]=cl(bv/cnt*.75+tmp[idx+2]*.25);
  }
  for(var k=0;k<d.length;k+=4){var t=(Math.random()-.5)*12;d[k]=cl(d[k]+t);d[k+1]=cl(d[k+1]+t);d[k+2]=cl(d[k+2]+t);}
  return id;
}

function fxDark(id,W,H){
  var d=id.data;
  for(var i=0;i<d.length;i+=4){
    var r=d[i],g=d[i+1],b=d[i+2];
    d[i]=cl((r*.393+g*.769+b*.189)*.7);d[i+1]=cl((r*.349+g*.686+b*.168)*.65);d[i+2]=cl((r*.272+g*.534+b*.131)*.6);
    if((d[i]+d[i+1]+d[i+2])/3<80)d[i+2]=cl(d[i+2]+15);
  }
  vig(d,W,H,0.85);return id;
}

function fxOpen(id,W,H){
  var d=id.data,tmp=new Uint8ClampedArray(d),r=1;
  for(var y=r;y<H-r;y++)for(var x=r;x<W-r;x++){
    var rv=0,gv=0,bv=0,cnt=0;
    for(var dy=-r;dy<=r;dy++)for(var dx=-r;dx<=r;dx++){var i=((y+dy)*W+(x+dx))*4;rv+=tmp[i];gv+=tmp[i+1];bv+=tmp[i+2];cnt++;}
    var idx=(y*W+x)*4;d[idx]=rv/cnt;d[idx+1]=gv/cnt;d[idx+2]=bv/cnt;
  }
  for(var k=0;k<d.length;k+=4){
    d[k]=cl(d[k]*1.15);d[k+1]=cl(d[k+1]*1.2);d[k+2]=cl(d[k+2]*1.05);
    if((d[k]+d[k+1]+d[k+2])/3>150){d[k]=cl(d[k]+15);d[k+1]=cl(d[k+1]+10);}
    d[k]=cl((d[k]-128)*.88+128);d[k+1]=cl((d[k+1]-128)*.88+128);d[k+2]=cl((d[k+2]-128)*.88+128);
  }
  return id;
}

function postFilter(canvas){
  var f={none:'',pixel:'contrast(1.1)',lowpoly:'contrast(1.05)',horror:'contrast(1.2)',neon:'brightness(1.1) contrast(1.1) saturate(1.3) drop-shadow(0 0 6px cyan)',painterly:'contrast(0.95) brightness(1.05)',darkfantasy:'contrast(1.15) brightness(0.9)',openworld:'contrast(0.95) brightness(1.1) saturate(1.15)'};
  canvas.style.filter=f[currentStyle]||'';
}

function vig(d,W,H,str){
  var cx=W/2,cy=H/2,mx=Math.sqrt(cx*cx+cy*cy);
  for(var y=0;y<H;y++)for(var x=0;x<W;x++){
    var f=1-Math.pow(Math.sqrt((x-cx)*(x-cx)+(y-cy)*(y-cy))/mx,2)*str;
    var i=(y*W+x)*4;d[i]=cl(d[i]*f);d[i+1]=cl(d[i+1]*f);d[i+2]=cl(d[i+2]*f);
  }
}

// =====================
// LAB CONTROLS
// =====================
function setColor(m){
  colorMode=m;
  document.getElementById('btnColorOff').classList.toggle('active',m==='off');
  document.getElementById('btnColorOn').classList.toggle('active',m==='on');
  document.getElementById('btnColorRandom').classList.toggle('active',m==='random');
  applyEffects();
}

function setStyle(s){
  currentStyle=s;
  document.querySelectorAll('.style-btn').forEach(function(b){b.classList.toggle('active',b.dataset.style===s);});
  applyEffects();
}

function matchCurrentAtmosphere(){
  var t=topics[currentIndex];if(!t)return;
  colorMode='on';
  document.getElementById('btnColorOff').classList.remove('active');
  document.getElementById('btnColorOn').classList.add('active');
  document.getElementById('btnColorRandom').classList.remove('active');
  currentStyle=ATMO_STYLE_MAP[t.id]||'none';
  document.querySelectorAll('.style-btn').forEach(function(b){b.classList.toggle('active',b.dataset.style===currentStyle);});
  applyEffects();
}

function downloadResult(){
  var c=document.getElementById('resultCanvas');
  var a=document.createElement('a');
  a.download='atmosphere-'+(topics[currentIndex]?topics[currentIndex].id:'result')+'.png';
  a.href=c.toDataURL('image/png');a.click();
}

function updateResultTag(){
  var tag=document.getElementById('resultTag');if(!tag)return;
  var t=topics[currentIndex],label='';
  if(colorMode!=='off')label+=colorMode==='random'?'Random Palette':((t?t.title:'')+' Palette');
  if(currentStyle!=='none'){if(label)label+=' + ';label+=STYLE_LABELS[currentStyle]||currentStyle;}
  tag.textContent=label||'Result';
}

// =====================
// AUDIO
// =====================
document.getElementById('audioBtn').addEventListener('click',function(){
  if(currentAudio.paused){currentAudio.play();document.getElementById('audioBtn').textContent='Pause Atmosphere Sound';}
  else{currentAudio.pause();document.getElementById('audioBtn').textContent='Play Atmosphere Sound';}
});

// =====================
// HELPERS
// =====================
function cl(v){return Math.max(0,Math.min(255,Math.round(v)));}
function rgba(hex,a){var r=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);if(!r)return'rgba(0,0,0,'+a+')';return'rgba('+parseInt(r[1],16)+','+parseInt(r[2],16)+','+parseInt(r[3],16)+','+a+')';}
function hArr(hex){var r=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);return r?[parseInt(r[1],16),parseInt(r[2],16),parseInt(r[3],16)]:[0,0,0];}
function bHex(a,b,t){var av=hArr(a),bv=hArr(b);return'rgb('+Math.round(av[0]+(bv[0]-av[0])*t)+','+Math.round(av[1]+(bv[1]-av[1])*t)+','+Math.round(av[2]+(bv[2]-av[2])*t)+')';}
