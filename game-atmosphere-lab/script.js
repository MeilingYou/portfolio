// =============================================
// Game Atmosphere Lab — Complete Script
// =============================================

var topics = [];
var currentAudio = new Audio();
var currentIndex = 0;
var activeBgLayer = null;
var galleryItems = [];
var activeThumbIndex = 0;
var lightboxIndex = 0;
var colorMode = "off";
var currentStyle = "none";

var offscreen = document.createElement("canvas");
var offCtx = offscreen.getContext("2d");

var LOCAL_DATA = {
  topics: [
    {
      id: "cozy-pixel-farming",
      title: "Cozy Pixel Farming",
      gameExamples: ["Stardew Valley", "Sun Haven", "Coral Island"],
      artStyle: "Pixel art farming and life-sim style",
      mood: "Peaceful, warm, relaxing",
      description: "Cozy pixel farming games use warm colors, soft light, small pixel details, and nature-based objects to create a calm and welcoming mood. This type of atmosphere makes the player feel safe, relaxed, and connected to a peaceful daily routine.",
      backgroundColor: "#F3E7C9",
      accentColor: "#7AA35A",
      textColor: "#4B3425",
      fontClass: "pixel",
      image: "screenshots/cozy-pixel-farming-1.jpg",
      imageAlt: "A warm pixel art farm scene with crops, animals, and golden sunlight",
      audio: "audio/cozy-pixel-farming.mp3",
      screenshots: [
        { src: "screenshots/cozy-pixel-farming-1.jpg", caption: "Cozy Pixel Farming screenshot 1" },
        { src: "screenshots/cozy-pixel-farming-2.jpg", caption: "Cozy Pixel Farming screenshot 2" },
        { src: "screenshots/cozy-pixel-farming-3.jpg", caption: "Cozy Pixel Farming screenshot 3" }
      ]
    },
    {
      id: "neon-cyberpunk-city",
      title: "Neon Cyberpunk City",
      gameExamples: ["Cyberpunk 2077", "Ghostrunner", "Observer"],
      artStyle: "Neon sci-fi and futuristic city style",
      mood: "Futuristic, energetic, high-tech",
      description: "Cyberpunk games often use dark city backgrounds, glowing neon lights, rain reflections, and futuristic technology. The strong contrast between black shadows and bright neon colors creates a world that feels advanced, busy, and intense.",
      backgroundColor: "#0D0B1F",
      accentColor: "#00E5FF",
      textColor: "#EAFBFF",
      fontClass: "cyberpunk",
      image: "screenshots/neon-cyberpunk-city-1.jpg",
      imageAlt: "A rain-soaked futuristic city at night lit by glowing neon signs",
      audio: "audio/neon-cyberpunk-city.mp3",
      screenshots: [
        { src: "screenshots/neon-cyberpunk-city-1.jpg", caption: "Neon Cyberpunk City screenshot 1" },
        { src: "screenshots/neon-cyberpunk-city-2.jpg", caption: "Neon Cyberpunk City screenshot 2" },
        { src: "screenshots/neon-cyberpunk-city-3.jpg", caption: "Neon Cyberpunk City screenshot 3" }
      ]
    },
    {
      id: "low-poly-horror",
      title: "Low-Poly Horror",
      gameExamples: ["Fears to Fathom", "Dagon", "The Shore"],
      artStyle: "Low-poly 3D horror style",
      mood: "Tense, eerie, unsettling",
      description: "Low-poly horror games use simple 3D shapes, dim lighting, empty rooms, and quiet spaces to create fear. Because the visuals are simple, the player's imagination fills in the missing details, making the atmosphere feel more uncomfortable.",
      backgroundColor: "#1C1F26",
      accentColor: "#7A1F1F",
      textColor: "#D9D9D9",
      fontClass: "low-poly-horror",
      image: "screenshots/low-poly-horror-1.jpg",
      imageAlt: "A dark, empty low-poly room with dim red lighting and eerie shadows",
      audio: "audio/low-poly-horror.mp3",
      screenshots: [
        { src: "screenshots/low-poly-horror-1.jpg", caption: "Low-Poly Horror screenshot 1" },
        { src: "screenshots/low-poly-horror-2.jpg", caption: "Low-Poly Horror screenshot 2" },
        { src: "screenshots/low-poly-horror-3.jpg", caption: "Low-Poly Horror screenshot 3" }
      ]
    },
    {
      id: "dark-cute-cartoon",
      title: "Dark Cute Cartoon",
      gameExamples: ["Cult of the Lamb", "Hollow Knight", "Little Nightmares"],
      artStyle: "Hand-drawn dark cartoon style",
      mood: "Dark cute, creepy, playful",
      description: "Dark cute cartoon games mix adorable character designs with creepy themes, strange symbols, and darker colors. This contrast creates a mood that feels charming and unsettling at the same time.",
      backgroundColor: "#2A0F16",
      accentColor: "#D9C27A",
      textColor: "#F5EBD8",
      fontClass: "dark-cute",
      image: "screenshots/dark-cute-cartoon-1.jpg",
      imageAlt: "A cute cartoon lamb character surrounded by dark cult symbols and candles",
      audio: "audio/dark-cute-cartoon.mp3",
      screenshots: [
        { src: "screenshots/dark-cute-cartoon-1.jpg", caption: "Dark Cute Cartoon screenshot 1" },
        { src: "screenshots/dark-cute-cartoon-2.jpg", caption: "Dark Cute Cartoon screenshot 2" },
        { src: "screenshots/dark-cute-cartoon-3.jpg", caption: "Dark Cute Cartoon screenshot 3" }
      ]
    },
    {
      id: "retro-arcade",
      title: "Retro Arcade",
      gameExamples: ["Pac-Man", "Space Invaders", "Galaga"],
      artStyle: "Simple retro arcade style",
      mood: "Nostalgic, playful, fast-paced",
      description: "Retro arcade games use simple shapes, bright colors, and clear visual rules. The style is easy to understand quickly, which helps players focus on movement, score, and reaction time.",
      backgroundColor: "#000000",
      accentColor: "#FFD93D",
      textColor: "#FFFFFF",
      fontClass: "retro-arcade",
      image: "screenshots/retro-arcade-1.jpg",
      imageAlt: "A classic arcade screen with bright pixel characters on a black background",
      audio: "audio/retro-arcade.mp3",
      screenshots: [
        { src: "screenshots/retro-arcade-1.jpg", caption: "Retro Arcade screenshot 1" },
        { src: "screenshots/retro-arcade-2.jpg", caption: "Retro Arcade screenshot 2" },
        { src: "screenshots/retro-arcade-3.jpg", caption: "Retro Arcade screenshot 3" }
      ]
    },
    {
      id: "dark-fantasy",
      title: "Dark Fantasy",
      gameExamples: ["Elden Ring", "Dark Souls", "Blasphemous"],
      artStyle: "Dark fantasy and gothic adventure style",
      mood: "Epic, dangerous, mysterious",
      description: "Dark fantasy games combine magical worlds with ruins, monsters, fog, and dramatic landscapes. This style often makes the player feel small inside a huge and dangerous world.",
      backgroundColor: "#2B2B2B",
      accentColor: "#B08D57",
      textColor: "#E8DFC8",
      fontClass: "dark-fantasy",
      image: "screenshots/dark-fantasy-1.jpg",
      imageAlt: "A foggy gothic landscape with crumbling ruins and a dramatic stormy sky",
      audio: "audio/dark-fantasy.mp3",
      screenshots: [
        { src: "screenshots/dark-fantasy-1.jpg", caption: "Dark Fantasy screenshot 1" },
        { src: "screenshots/dark-fantasy-2.jpg", caption: "Dark Fantasy screenshot 2" },
        { src: "screenshots/dark-fantasy-3.jpg", caption: "Dark Fantasy screenshot 3" }
      ]
    },
    {
      id: "open-world-fantasy",
      title: "Open-World Fantasy",
      gameExamples: ["Zelda: Breath of the Wild", "Genshin Impact", "Immortals Fenyx Rising"],
      artStyle: "Bright open-world fantasy adventure style",
      mood: "Open, peaceful, heroic",
      description: "Open-world fantasy games use bright skies, wide landscapes, soft colors, and natural environments to make players want to explore. This atmosphere creates a feeling of freedom, curiosity, and adventure.",
      backgroundColor: "#BFE7F2",
      accentColor: "#F4C542",
      textColor: "#244B3C",
      fontClass: "open-world-fantasy",
      image: "screenshots/open-world-fantasy-1.jpg",
      imageAlt: "A vast open landscape with bright skies, rolling hills, and a distant mountain",
      audio: "audio/open-world-fantasy.mp3",
      screenshots: [
        { src: "screenshots/open-world-fantasy-1.jpg", caption: "Open-World Fantasy screenshot 1" },
        { src: "screenshots/open-world-fantasy-2.jpg", caption: "Open-World Fantasy screenshot 2" },
        { src: "screenshots/open-world-fantasy-3.jpg", caption: "Open-World Fantasy screenshot 3" }
      ]
    },
    {
      id: "voxel-sandbox",
      title: "Voxel Sandbox",
      gameExamples: ["Minecraft", "Hytale", "Creativerse"],
      artStyle: "Blocky voxel sandbox style",
      mood: "Creative, open, playful",
      description: "Voxel sandbox games use block-shaped worlds and simple textures. The blocky style helps players see the world as something they can shape, destroy, and rebuild creatively.",
      backgroundColor: "#87C77B",
      accentColor: "#5A8F3D",
      textColor: "#2E2218",
      fontClass: "voxel-sandbox",
      image: "screenshots/voxel-sandbox-1.jpg",
      imageAlt: "A colorful blocky voxel world with trees, grass, and a clear blue sky",
      audio: "audio/voxel-sandbox.mp3",
      screenshots: [
        { src: "screenshots/voxel-sandbox-1.jpg", caption: "Voxel Sandbox screenshot 1" },
        { src: "screenshots/voxel-sandbox-2.jpg", caption: "Voxel Sandbox screenshot 2" },
        { src: "screenshots/voxel-sandbox-3.jpg", caption: "Voxel Sandbox screenshot 3" }
      ]
    }
  ]
};

var PALETTES = {
  "cozy-pixel-farming": ["#F3E7C9", "#7AA35A", "#4B3425", "#E8C07A", "#A8C88A", "#C9956A", "#F7D08A", "#6B9B4A"],
  "neon-cyberpunk-city": ["#0D0B1F", "#00E5FF", "#FF00A0", "#7B2FFF", "#00FF9F", "#1A0A3A", "#FF6600", "#E0E0FF"],
  "low-poly-horror": ["#1C1F26", "#7A1F1F", "#D9D9D9", "#3D0000", "#8B0000", "#2E2E3A", "#4A0A0A", "#AAAAAA"],
  "dark-cute-cartoon": ["#2A0F16", "#D9C27A", "#F5EBD8", "#8B2252", "#C86464", "#3D1A22", "#F0A0A0", "#7A3060"],
  "retro-arcade": ["#000000", "#FFD93D", "#FFFFFF", "#FF4444", "#44AAFF", "#44FF44", "#FF8800", "#AA00FF"],
  "dark-fantasy": ["#2B2B2B", "#B08D57", "#E8DFC8", "#1A0A00", "#6B3F1F", "#4A3728", "#D4A96A", "#3D2B1A"],
  "open-world-fantasy": ["#BFE7F2", "#F4C542", "#244B3C", "#7EC8E3", "#A8E6CF", "#FFE066", "#3A8A5C", "#E8F4F8"],
  "voxel-sandbox": ["#87C77B", "#5A8F3D", "#2E2218", "#6BB8FF", "#F4A460", "#8B6914", "#4A7A2C", "#D4884A"]
};

var ATMO_STYLE_MAP = {
  "cozy-pixel-farming": "pixel",
  "neon-cyberpunk-city": "neon",
  "low-poly-horror": "horror",
  "dark-cute-cartoon": "painterly",
  "retro-arcade": "pixel",
  "dark-fantasy": "darkfantasy",
  "open-world-fantasy": "openworld",
  "voxel-sandbox": "pixel"
};

var STYLE_LABELS = {
  none: "Original",
  pixel: "Pixel Art",
  lowpoly: "Low Poly",
  horror: "Horror",
  neon: "Neon / Cyber",
  painterly: "Painterly",
  darkfantasy: "Dark Fantasy",
  openworld: "Open World"
};

var bgOverlay = document.createElement("div");
bgOverlay.className = "bg-overlay";
document.body.prepend(bgOverlay);

// =====================
// LOAD DATA
// =====================
fetch("data.json?cachebust=" + Date.now(), { cache: "no-store" })
  .then(function(response) {
    if (!response.ok) {
      throw new Error("data.json failed to load");
    }
    return response.json();
  })
  .then(function(data) {
    startApp(data);
  })
  .catch(function(error) {
    console.log("Using backup data because data.json did not load:", error);
    startApp(LOCAL_DATA);
  });

function startApp(data) {
  topics = data.topics;

  buildMenu();

  var hash = window.location.hash.replace("#", "");
  var hashIndex = hash ? topics.findIndex(function(topic) {
    return topic.id === hash;
  }) : -1;

  if (hashIndex !== -1) {
    showTopic(hashIndex, false);
  } else {
    showTopic(0, false);
  }

  drawDefaultScene();
}

// =====================
// MENU
// =====================
function buildMenu() {
  var menu = document.getElementById("topicMenu");
  menu.innerHTML = "";

  topics.forEach(function(topic, index) {
    var btn = document.createElement("button");
    btn.textContent = topic.title;
    btn.className = "topic-btn";
    btn.dataset.id = topic.id;

    btn.addEventListener("click", function() {
      showTopic(index, true);
    });

    menu.appendChild(btn);
  });
}

// =====================
// SHOW TOPIC
// =====================
function showTopic(index, autoPlay) {
  currentIndex = index;
  var topic = topics[index];

  var mainTopicImage = topic.image;

  if (!mainTopicImage && topic.screenshots && topic.screenshots.length > 0) {
    mainTopicImage = topic.screenshots[0].src;
  }

  document.getElementById("topicTitle").textContent = topic.title;
  document.getElementById("gameExamples").textContent = "Inspired by: " + topic.gameExamples.join(", ");
  document.getElementById("artStyle").textContent = topic.artStyle;
  document.getElementById("mood").textContent = topic.mood;
  document.getElementById("description").textContent = topic.description;

  document.getElementById("topicImage").src = mainTopicImage;
  document.getElementById("topicImage").alt = topic.imageAlt || topic.title;

  switchBg(mainTopicImage);

  document.documentElement.style.setProperty("--accent-color", topic.accentColor);
  document.documentElement.style.setProperty("--text-color", topic.textColor);
  document.documentElement.style.setProperty("--card-color", hexRgba(topic.backgroundColor, 0.22));

  bgOverlay.style.background =
    "linear-gradient(135deg," +
    hexRgba(topic.backgroundColor, 0.55) +
    " 0%, rgba(0,0,0,0.5) 100%)";

  var metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) {
    metaTheme.setAttribute("content", topic.backgroundColor);
  }

  document.body.className = topic.fontClass;

  var box = document.querySelector(".info-box");
  if (box) {
    box.style.animation = "none";
    box.offsetHeight;
    box.style.animation = "";
  }

  document.querySelectorAll(".topic-btn").forEach(function(button) {
    button.classList.toggle("active", button.dataset.id === topic.id);
  });

  history.replaceState(null, "", "#" + topic.id);

  renderPalette(topic.id);
  buildGallery(topic);

  if (colorMode !== "off") {
    applyEffects();
  }

  currentAudio.pause();
  currentAudio.currentTime = 0;
  currentAudio.src = topic.audio;
  currentAudio.loop = true;
  currentAudio.load();

  if (autoPlay) {
    currentAudio.play()
      .then(function() {
        document.getElementById("audioBtn").textContent = "Pause Atmosphere Sound";
      })
      .catch(function() {
        document.getElementById("audioBtn").textContent = "Play Atmosphere Sound";
      });
  } else {
    document.getElementById("audioBtn").textContent = "Play Atmosphere Sound";
  }
}

// =====================
// PALETTE
// =====================
function renderPalette(id) {
  var container = document.getElementById("paletteSwatches");
  container.innerHTML = "";

  var colors = PALETTES[id] || [];

  colors.forEach(function(hex) {
    var swatch = document.createElement("div");
    swatch.className = "swatch";
    swatch.style.background = hex;
    swatch.setAttribute("data-hex", hex);
    container.appendChild(swatch);
  });
}

// =====================
// BACKGROUND
// =====================
function switchBg(url) {
  if (!url) {
    return;
  }

  if (activeBgLayer) {
    var oldLayer = activeBgLayer;
    oldLayer.classList.remove("active");
    oldLayer.classList.add("leaving");

    setTimeout(function() {
      oldLayer.remove();
    }, 600);
  }

  var layer = document.createElement("div");
  layer.className = "bg-layer";
  layer.style.backgroundImage = "url('" + url + "')";
  document.body.prepend(layer);

  requestAnimationFrame(function() {
    requestAnimationFrame(function() {
      layer.classList.add("active");
    });
  });

  activeBgLayer = layer;
}

// =====================
// GALLERY
// =====================
function buildGallery(topic) {
  var strip = document.getElementById("galleryStrip");
  var mainImg = document.getElementById("galleryMainImg");
  var caption = document.getElementById("galleryCaption");
  var title = document.getElementById("galleryTitle");
  var display = document.getElementById("galleryDisplay");

  strip.innerHTML = "";
  galleryItems = [];
  activeThumbIndex = 0;
  lightboxIndex = 0;

  title.textContent = topic.title;

  if (topic.screenshots && topic.screenshots.length > 0) {
    topic.screenshots.forEach(function(screenshot) {
      galleryItems.push({
        src: screenshot.src,
        caption: screenshot.caption
      });
    });
  }

  if (galleryItems.length === 0) {
    mainImg.src = "";
    caption.textContent = "";
    strip.innerHTML = '<div class="gallery-empty">No screenshots available for this atmosphere yet.</div>';
    display.onclick = null;
    return;
  }

  mainImg.onerror = function() {
    caption.textContent = "Image not found: " + mainImg.getAttribute("src");
  };

  mainImg.src = galleryItems[0].src;
  mainImg.alt = galleryItems[0].caption;
  caption.textContent = galleryItems[0].caption;

  galleryItems.forEach(function(item, index) {
    var thumb = document.createElement("div");
    thumb.className = "thumb";

    if (index === 0) {
      thumb.classList.add("active");
    }

    thumb.dataset.index = index;

    var img = document.createElement("img");
    img.src = item.src;
    img.alt = item.caption;
    img.loading = "lazy";

    img.onerror = function() {
      thumb.classList.add("broken");
      thumb.innerHTML = '<div class="thumb-error">Missing<br>' + item.src + "</div>";
    };

    var num = document.createElement("div");
    num.className = "thumb-num";
    num.textContent = index + 1 + " / " + galleryItems.length;

    thumb.appendChild(img);
    thumb.appendChild(num);

    thumb.addEventListener("click", function(event) {
      event.stopPropagation();
      selectThumb(index);
    });

    strip.appendChild(thumb);
  });

  display.onclick = function() {
    openLightbox(activeThumbIndex);
  };
}

function selectThumb(index) {
  if (index < 0 || index >= galleryItems.length) {
    return;
  }

  activeThumbIndex = index;

  var item = galleryItems[index];
  var mainImg = document.getElementById("galleryMainImg");
  var caption = document.getElementById("galleryCaption");

  mainImg.style.opacity = "0";

  setTimeout(function() {
    mainImg.src = item.src;
    mainImg.alt = item.caption;
    mainImg.style.opacity = "1";
  }, 150);

  caption.textContent = item.caption;

  document.querySelectorAll(".thumb").forEach(function(thumb, i) {
    thumb.classList.toggle("active", i === index);
  });

  var activeThumb = document.querySelector('.thumb[data-index="' + index + '"]');
  if (activeThumb) {
    activeThumb.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest"
    });
  }
}

// =====================
// LIGHTBOX
// =====================
function openLightbox(index) {
  if (!galleryItems.length) {
    return;
  }

  lightboxIndex = index;
  updateLightbox();

  document.getElementById("lightbox").classList.add("open");
  document.body.style.overflow = "hidden";
  document.addEventListener("keydown", lightboxKey);
}

function updateLightbox() {
  var item = galleryItems[lightboxIndex];

  if (!item) {
    return;
  }

  var img = document.getElementById("lightboxImg");
  var cap = document.getElementById("lightboxCaption");
  var counter = document.getElementById("lightboxCounter");

  img.src = item.src;
  img.alt = item.caption;
  cap.textContent = item.caption;
  counter.textContent = lightboxIndex + 1 + " / " + galleryItems.length;

  var prev = document.getElementById("lightboxPrev");
  var next = document.getElementById("lightboxNext");

  prev.disabled = lightboxIndex === 0;
  next.disabled = lightboxIndex === galleryItems.length - 1;
}

function lightboxNav(direction, event) {
  if (event) {
    event.stopPropagation();
  }

  var nextIndex = lightboxIndex + direction;

  if (nextIndex >= 0 && nextIndex < galleryItems.length) {
    lightboxIndex = nextIndex;
    selectThumb(nextIndex);
    updateLightbox();
  }
}

function closeLightbox() {
  document.getElementById("lightbox").classList.remove("open");
  document.body.style.overflow = "";
  document.removeEventListener("keydown", lightboxKey);
}

function lightboxKey(event) {
  if (event.key === "ArrowRight") {
    lightboxNav(1, null);
  }

  if (event.key === "ArrowLeft") {
    lightboxNav(-1, null);
  }

  if (event.key === "Escape") {
    closeLightbox();
  }
}

// =====================
// IMAGE UPLOAD
// =====================
document.getElementById("imageUpload").addEventListener("change", function(event) {
  var file = event.target.files[0];

  if (!file) {
    return;
  }

  var reader = new FileReader();

  reader.onload = function(readerEvent) {
    var img = new Image();

    img.onload = function() {
      offscreen.width = 640;
      offscreen.height = 360;

      offCtx.drawImage(img, 0, 0, 640, 360);

      var sourceCanvas = document.getElementById("sourceCanvas");
      sourceCanvas.width = 640;
      sourceCanvas.height = 360;

      sourceCanvas.getContext("2d").drawImage(offscreen, 0, 0);

      applyEffects();
    };

    img.src = readerEvent.target.result;
  };

  reader.readAsDataURL(file);
});

// =====================
// DEFAULT CANVAS SCENE
// =====================
function drawDefaultScene() {
  var sourceCanvas = document.getElementById("sourceCanvas");
  var ctx = sourceCanvas.getContext("2d");

  var W = sourceCanvas.width = 640;
  var H = sourceCanvas.height = 360;

  var sky = ctx.createLinearGradient(0, 0, 0, H * 0.65);
  sky.addColorStop(0, "#4A7FA5");
  sky.addColorStop(1, "#A8CEDD");

  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = "rgba(255,255,255,0.7)";

  [[0.1, 0.05], [0.2, 0.12], [0.35, 0.04], [0.5, 0.09], [0.65, 0.06], [0.75, 0.14], [0.85, 0.03], [0.92, 0.1]].forEach(function(point) {
    ctx.beginPath();
    ctx.arc(point[0] * W, point[1] * H * 0.7, 1.5, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.beginPath();
  ctx.arc(W * 0.82, H * 0.16, 24, 0, Math.PI * 2);
  ctx.fillStyle = "#FFFDE7";
  ctx.shadowColor = "#FFFDE7";
  ctx.shadowBlur = 18;
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.beginPath();
  ctx.moveTo(0, H * 0.55);
  ctx.bezierCurveTo(W * 0.15, H * 0.36, W * 0.35, H * 0.43, W * 0.5, H * 0.49);
  ctx.bezierCurveTo(W * 0.65, H * 0.55, W * 0.8, H * 0.39, W, H * 0.45);
  ctx.lineTo(W, H);
  ctx.lineTo(0, H);
  ctx.closePath();
  ctx.fillStyle = "#3A6040";
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(0, H * 0.68);
  ctx.bezierCurveTo(W * 0.2, H * 0.56, W * 0.4, H * 0.62, W * 0.6, H * 0.60);
  ctx.bezierCurveTo(W * 0.75, H * 0.58, W * 0.88, H * 0.66, W, H * 0.62);
  ctx.lineTo(W, H);
  ctx.lineTo(0, H);
  ctx.closePath();
  ctx.fillStyle = "#2E5030";
  ctx.fill();

  var grass = ctx.createLinearGradient(0, H * 0.68, 0, H);
  grass.addColorStop(0, "#4A7A35");
  grass.addColorStop(1, "#2A4A20");

  ctx.fillStyle = grass;
  ctx.fillRect(0, H * 0.72, W, H * 0.28);

  [[0.06, 0.28], [0.14, 0.22], [0.72, 0.25], [0.80, 0.32], [0.88, 0.20], [0.94, 0.26]].forEach(function(point) {
    drawTree(ctx, point[0] * W, H * 0.72, point[1] * H, "#1E3820");
  });

  ctx.beginPath();
  ctx.moveTo(W * 0.42, H);
  ctx.bezierCurveTo(W * 0.44, H * 0.82, W * 0.48, H * 0.76, W * 0.5, H * 0.73);
  ctx.bezierCurveTo(W * 0.52, H * 0.76, W * 0.56, H * 0.82, W * 0.58, H);
  ctx.closePath();
  ctx.fillStyle = "#8B7355";
  ctx.fill();

  offscreen.width = 640;
  offscreen.height = 360;
  offCtx.drawImage(sourceCanvas, 0, 0);

  var resultCanvas = document.getElementById("resultCanvas");
  resultCanvas.width = 640;
  resultCanvas.height = 360;
  resultCanvas.getContext("2d").drawImage(sourceCanvas, 0, 0);
}

function drawTree(ctx, x, baseY, h, color) {
  ctx.fillStyle = blendHex(color, "#000000", 0.35);
  ctx.fillRect(x - 4, baseY - h * 0.25, 8, h * 0.25);

  ctx.beginPath();
  ctx.moveTo(x, baseY - h);
  ctx.lineTo(x - h * 0.35, baseY - h * 0.28);
  ctx.lineTo(x + h * 0.35, baseY - h * 0.28);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(x, baseY - h * 0.75);
  ctx.lineTo(x - h * 0.28, baseY - h * 0.15);
  ctx.lineTo(x + h * 0.28, baseY - h * 0.15);
  ctx.closePath();
  ctx.fillStyle = blendHex(color, "#ffffff", 0.12);
  ctx.fill();
}

// =====================
// PIXEL EFFECTS
// =====================
function applyEffects() {
  var overlay = document.getElementById("processingOverlay");
  overlay.classList.add("visible");

  setTimeout(function() {
    try {
      var W = offscreen.width;
      var H = offscreen.height;

      var imageData = offscreen.getContext("2d").getImageData(0, 0, W, H);

      if (colorMode !== "off") {
        imageData = remapColors(imageData, getPalette());
      }

      if (currentStyle !== "none") {
        imageData = applyStyle(imageData, currentStyle, W, H);
      }

      var resultCanvas = document.getElementById("resultCanvas");
      resultCanvas.width = W;
      resultCanvas.height = H;
      resultCanvas.getContext("2d").putImageData(imageData, 0, 0);

      postFilter(resultCanvas);
      updateResultTag();
    } catch (error) {
      console.error(error);
    }

    overlay.classList.remove("visible");
  }, 30);
}

function getPalette() {
  if (colorMode === "random") {
    var allPalettes = Object.values(PALETTES);
    return allPalettes[Math.floor(Math.random() * allPalettes.length)];
  }

  var topic = topics[currentIndex];

  if (topic && PALETTES[topic.id]) {
    return PALETTES[topic.id];
  }

  return PALETTES["cozy-pixel-farming"];
}

function remapColors(imageData, palette) {
  var data = imageData.data;
  var pal = palette.map(hexArr);

  for (var i = 0; i < data.length; i += 4) {
    var r = data[i];
    var g = data[i + 1];
    var b = data[i + 2];

    var best = 0;
    var bestDistance = Infinity;

    for (var p = 0; p < pal.length; p++) {
      var distance =
        (pal[p][0] - r) * (pal[p][0] - r) * 0.299 +
        (pal[p][1] - g) * (pal[p][1] - g) * 0.587 +
        (pal[p][2] - b) * (pal[p][2] - b) * 0.114;

      if (distance < bestDistance) {
        bestDistance = distance;
        best = p;
      }
    }

    var lum = 0.299 * r + 0.587 * g + 0.114 * b;
    var pc = pal[best];
    var paletteLum = 0.299 * pc[0] + 0.587 * pc[1] + 0.114 * pc[2];
    var ratio = paletteLum > 0 ? lum / paletteLum : 1;

    data[i] = cl(pc[0] * ratio);
    data[i + 1] = cl(pc[1] * ratio);
    data[i + 2] = cl(pc[2] * ratio);
  }

  return imageData;
}

function applyStyle(imageData, style, W, H) {
  switch (style) {
    case "pixel":
      return fxPixel(imageData, W, H, 8);
    case "lowpoly":
      return fxLowPoly(imageData, W, H);
    case "horror":
      return fxHorror(imageData, W, H);
    case "neon":
      return fxNeon(imageData, W, H);
    case "painterly":
      return fxPainterly(imageData, W, H);
    case "darkfantasy":
      return fxDarkFantasy(imageData, W, H);
    case "openworld":
      return fxOpenWorld(imageData, W, H);
    default:
      return imageData;
  }
}

function fxPixel(imageData, W, H, size) {
  var data = imageData.data;

  for (var y = 0; y < H; y += size) {
    for (var x = 0; x < W; x += size) {
      var cx = Math.min(x + Math.floor(size / 2), W - 1);
      var cy = Math.min(y + Math.floor(size / 2), H - 1);

      var index = (cy * W + cx) * 4;

      var r = data[index];
      var g = data[index + 1];
      var b = data[index + 2];

      for (var dy = 0; dy < size && y + dy < H; dy++) {
        for (var dx = 0; dx < size && x + dx < W; dx++) {
          var i = ((y + dy) * W + (x + dx)) * 4;

          data[i] = r;
          data[i + 1] = g;
          data[i + 2] = b;
        }
      }
    }
  }

  return imageData;
}

function fxLowPoly(imageData, W, H) {
  return imageData;
}

function fxHorror(imageData, W, H) {
  var data = imageData.data;

  for (var i = 0; i < data.length; i += 4) {
    var lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];

    data[i] = cl(data[i] * 0.2 + lum * 0.8);
    data[i + 1] = cl(data[i + 1] * 0.2 + lum * 0.8);
    data[i + 2] = cl(data[i + 2] * 0.2 + lum * 0.8);

    var grain = (Math.random() - 0.5) * 30;

    data[i] = cl(data[i] + grain);
    data[i + 1] = cl(data[i + 1] + grain);
    data[i + 2] = cl(data[i + 2] + grain);
  }

  vignette(data, W, H, 0.7);
  return imageData;
}

function fxNeon(imageData, W, H) {
  var data = imageData.data;

  for (var i = 0; i < data.length; i += 4) {
    var lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];

    data[i] = cl(lum + (data[i] - lum) * 3.5);
    data[i + 1] = cl(lum + (data[i + 1] - lum) * 3.5);
    data[i + 2] = cl(lum + (data[i + 2] - lum) * 3.5);
  }

  return imageData;
}

function fxPainterly(imageData, W, H) {
  var data = imageData.data;

  for (var i = 0; i < data.length; i += 4) {
    var tone = (Math.random() - 0.5) * 12;

    data[i] = cl(data[i] + tone);
    data[i + 1] = cl(data[i + 1] + tone);
    data[i + 2] = cl(data[i + 2] + tone);
  }

  return imageData;
}

function fxDarkFantasy(imageData, W, H) {
  var data = imageData.data;

  for (var i = 0; i < data.length; i += 4) {
    var r = data[i];
    var g = data[i + 1];
    var b = data[i + 2];

    data[i] = cl((r * 0.393 + g * 0.769 + b * 0.189) * 0.7);
    data[i + 1] = cl((r * 0.349 + g * 0.686 + b * 0.168) * 0.65);
    data[i + 2] = cl((r * 0.272 + g * 0.534 + b * 0.131) * 0.6);
  }

  vignette(data, W, H, 0.85);
  return imageData;
}

function fxOpenWorld(imageData, W, H) {
  var data = imageData.data;

  for (var i = 0; i < data.length; i += 4) {
    data[i] = cl(data[i] * 1.15);
    data[i + 1] = cl(data[i + 1] * 1.2);
    data[i + 2] = cl(data[i + 2] * 1.05);
  }

  return imageData;
}

function postFilter(canvas) {
  var filters = {
    none: "",
    pixel: "contrast(1.1)",
    lowpoly: "contrast(1.05)",
    horror: "contrast(1.2)",
    neon: "brightness(1.1) contrast(1.1) saturate(1.3) drop-shadow(0 0 6px cyan)",
    painterly: "contrast(0.95) brightness(1.05)",
    darkfantasy: "contrast(1.15) brightness(0.9)",
    openworld: "contrast(0.95) brightness(1.1) saturate(1.15)"
  };

  canvas.style.filter = filters[currentStyle] || "";
}

function vignette(data, W, H, strength) {
  var cx = W / 2;
  var cy = H / 2;
  var maxDistance = Math.sqrt(cx * cx + cy * cy);

  for (var y = 0; y < H; y++) {
    for (var x = 0; x < W; x++) {
      var distance = Math.sqrt((x - cx) * (x - cx) + (y - cy) * (y - cy));
      var factor = 1 - Math.pow(distance / maxDistance, 2) * strength;

      var index = (y * W + x) * 4;

      data[index] = cl(data[index] * factor);
      data[index + 1] = cl(data[index + 1] * factor);
      data[index + 2] = cl(data[index + 2] * factor);
    }
  }
}

// =====================
// LAB CONTROLS
// =====================
function setColor(mode) {
  colorMode = mode;

  document.getElementById("btnColorOff").classList.toggle("active", mode === "off");
  document.getElementById("btnColorOn").classList.toggle("active", mode === "on");
  document.getElementById("btnColorRandom").classList.toggle("active", mode === "random");

  applyEffects();
}

function setStyle(style) {
  currentStyle = style;

  document.querySelectorAll(".style-btn").forEach(function(button) {
    button.classList.toggle("active", button.dataset.style === style);
  });

  applyEffects();
}

function matchCurrentAtmosphere() {
  var topic = topics[currentIndex];

  if (!topic) {
    return;
  }

  colorMode = "on";

  document.getElementById("btnColorOff").classList.remove("active");
  document.getElementById("btnColorOn").classList.add("active");
  document.getElementById("btnColorRandom").classList.remove("active");

  currentStyle = ATMO_STYLE_MAP[topic.id] || "none";

  document.querySelectorAll(".style-btn").forEach(function(button) {
    button.classList.toggle("active", button.dataset.style === currentStyle);
  });

  applyEffects();
}

function downloadResult() {
  var canvas = document.getElementById("resultCanvas");
  var link = document.createElement("a");

  link.download = "atmosphere-" + (topics[currentIndex] ? topics[currentIndex].id : "result") + ".png";
  link.href = canvas.toDataURL("image/png");
  link.click();
}

function updateResultTag() {
  var tag = document.getElementById("resultTag");

  if (!tag) {
    return;
  }

  var topic = topics[currentIndex];
  var label = "";

  if (colorMode !== "off") {
    label += colorMode === "random" ? "Random Palette" : (topic ? topic.title : "") + " Palette";
  }

  if (currentStyle !== "none") {
    if (label) {
      label += " + ";
    }

    label += STYLE_LABELS[currentStyle] || currentStyle;
  }

  tag.textContent = label || "Result";
}

// =====================
// AUDIO
// =====================
document.getElementById("audioBtn").addEventListener("click", function() {
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
function cl(value) {
  return Math.max(0, Math.min(255, Math.round(value)));
}

function hexRgba(hex, alpha) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

  if (!result) {
    return "rgba(0,0,0," + alpha + ")";
  }

  return "rgba(" +
    parseInt(result[1], 16) + "," +
    parseInt(result[2], 16) + "," +
    parseInt(result[3], 16) + "," +
    alpha +
    ")";
}

function hexArr(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

  if (!result) {
    return [0, 0, 0];
  }

  return [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16)
  ];
}

function blendHex(a, b, t) {
  var av = hexArr(a);
  var bv = hexArr(b);

  return "rgb(" +
    Math.round(av[0] + (bv[0] - av[0]) * t) + "," +
    Math.round(av[1] + (bv[1] - av[1]) * t) + "," +
    Math.round(av[2] + (bv[2] - av[2]) * t) +
    ")";
}
