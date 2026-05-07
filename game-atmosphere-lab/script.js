// Game Atmosphere Lab — Immersive Background Edition

let topics = [];
let currentAudio = new Audio();
let currentIndex = 0;

// Two background layers for crossfade effect
let activeBgLayer = null;

// Create the persistent overlay div
const bgOverlay = document.createElement("div");
bgOverlay.className = "bg-overlay";
document.body.prepend(bgOverlay);

fetch("data.json")
  .then(response => response.json())
  .then(data => {
    topics = data.topics;
    createTopicMenu();

    // Check URL hash for deep linking
    const hash = window.location.hash.replace("#", "");
    const hashIndex = hash ? topics.findIndex(t => t.id === hash) : -1;
    showTopic(hashIndex !== -1 ? hashIndex : 0, false);
  })
  .catch(error => console.log("Error loading JSON:", error));

function createTopicMenu() {
  const topicMenu = document.getElementById("topicMenu");
  topics.forEach((topic, index) => {
    const button = document.createElement("button");
    button.textContent = topic.title;
    button.classList.add("topic-btn");
    button.dataset.id = topic.id;
    button.addEventListener("click", () => showTopic(index, true));
    topicMenu.appendChild(button);
  });
}

function showTopic(index, autoPlaySound) {
  currentIndex = index;
  const topic = topics[index];

  // --- Update text content ---
  document.getElementById("topicTitle").textContent = topic.title;
  document.getElementById("gameExamples").textContent =
    "Inspired by: " + topic.gameExamples.join(", ");
  document.getElementById("artStyle").textContent = topic.artStyle;
  document.getElementById("mood").textContent = topic.mood;
  document.getElementById("description").textContent = topic.description;

  // Keep topicImage updated (hidden but still in DOM for accessibility)
  const topicImage = document.getElementById("topicImage");
  topicImage.src = topic.image;
  topicImage.alt = topic.imageAlt || topic.title + " illustration";

  // --- Cinematic background transition ---
  switchBackground(topic.image);

  // --- CSS variable updates ---
  document.documentElement.style.setProperty("--accent-color", topic.accentColor);
  document.documentElement.style.setProperty("--text-color", topic.textColor);

  // Card color: semi-transparent tint using background color
  document.documentElement.style.setProperty(
    "--card-color",
    hexToRgba(topic.backgroundColor, 0.22)
  );

  // Overlay: dark tint using background color for atmosphere cohesion
  document.documentElement.style.setProperty(
    "--overlay-color",
    hexToRgba(topic.backgroundColor, 0.35)
  );
  bgOverlay.style.background = `linear-gradient(
    135deg,
    ${hexToRgba(topic.backgroundColor, 0.55)} 0%,
    rgba(0,0,0,0.5) 100%
  )`;

  // --- Theme color meta for PWA ---
  const metaTheme = document.querySelector("meta[name='theme-color']");
  if (metaTheme) metaTheme.setAttribute("content", topic.backgroundColor);

  // --- Font class on body ---
  document.body.className = "";
  document.body.classList.add(topic.fontClass);

  // --- Restart card animation ---
  const infoBox = document.querySelector(".info-box");
  infoBox.style.animation = "none";
  infoBox.offsetHeight; // force reflow
  infoBox.style.animation = "";

  // --- Active button state ---
  document.querySelectorAll(".topic-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.id === topic.id);
  });

  // --- URL hash ---
  history.replaceState(null, "", "#" + topic.id);

  // --- Audio ---
  currentAudio.pause();
  currentAudio.currentTime = 0;
  currentAudio.src = topic.audio;
  currentAudio.loop = true;
  currentAudio.load();

  if (autoPlaySound) {
    currentAudio.play()
      .then(() => {
        document.getElementById("audioBtn").textContent = "Pause Atmosphere Sound";
      })
      .catch(() => {
        document.getElementById("audioBtn").textContent = "Play Atmosphere Sound";
      });
  } else {
    document.getElementById("audioBtn").textContent = "Play Atmosphere Sound";
  }
}

function switchBackground(imageUrl) {
  // Mark old layer as leaving
  if (activeBgLayer) {
    const oldLayer = activeBgLayer;
    oldLayer.classList.remove("active");
    oldLayer.classList.add("leaving");
    // Remove old layer after fade out
    setTimeout(() => oldLayer.remove(), 600);
  }

  // Create new background layer
  const newLayer = document.createElement("div");
  newLayer.className = "bg-layer";
  newLayer.style.backgroundImage = `url('${imageUrl}')`;
  document.body.prepend(newLayer);

  // Trigger animation on next frame
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      newLayer.classList.add("active");
    });
  });

  activeBgLayer = newLayer;
}

// Audio button toggle
document.getElementById("audioBtn").addEventListener("click", () => {
  if (currentAudio.paused) {
    currentAudio.play();
    document.getElementById("audioBtn").textContent = "Pause Atmosphere Sound";
  } else {
    currentAudio.pause();
    document.getElementById("audioBtn").textContent = "Play Atmosphere Sound";
  }
});

// Helper: hex to rgba
function hexToRgba(hex, alpha) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return `rgba(0,0,0,${alpha})`;
  return `rgba(${parseInt(result[1],16)},${parseInt(result[2],16)},${parseInt(result[3],16)},${alpha})`;
}
