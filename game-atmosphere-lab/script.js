// Game Atmosphere Lab JavaScript

let topics = [];
let currentAudio = new Audio();
let currentIndex = 0;

fetch("data.json")
  .then(response => response.json())
  .then(data => {
    topics = data.topics;
    createTopicMenu();
    showTopic(0, false);

    // Support URL hash navigation (e.g. #neon-cyberpunk-city)
    const hash = window.location.hash.replace("#", "");
    if (hash) {
      const hashIndex = topics.findIndex(t => t.id === hash);
      if (hashIndex !== -1) showTopic(hashIndex, false);
    }
  })
  .catch(error => {
    console.log("Error loading JSON:", error);
  });

function createTopicMenu() {
  const topicMenu = document.getElementById("topicMenu");
  topics.forEach((topic, index) => {
    const button = document.createElement("button");
    button.textContent = topic.title;
    button.classList.add("topic-btn");
    button.dataset.id = topic.id;
    button.addEventListener("click", () => {
      showTopic(index, true);
    });
    topicMenu.appendChild(button);
  });
}

function showTopic(index, autoPlaySound) {
  currentIndex = index;
  const topic = topics[index];

  // Update text content
  document.getElementById("topicTitle").textContent = topic.title;
  document.getElementById("gameExamples").textContent =
    "Inspired by: " + topic.gameExamples.join(", ");
  document.getElementById("artStyle").textContent = topic.artStyle;
  document.getElementById("mood").textContent = topic.mood;
  document.getElementById("description").textContent = topic.description;

  // Update image using imageAlt from JSON
  const topicImage = document.getElementById("topicImage");
  topicImage.src = topic.image;
  topicImage.alt = topic.imageAlt || topic.title + " illustration";

  // Update CSS theme variables
  document.documentElement.style.setProperty("--bg-color", topic.backgroundColor);
  document.documentElement.style.setProperty("--accent-color", topic.accentColor);
  document.documentElement.style.setProperty("--text-color", topic.textColor);

  // Update card overlay color based on brightness of background
  // Dark themes get a dark card; light themes get a light card
  document.documentElement.style.setProperty(
    "--card-color",
    hexToRgba(topic.backgroundColor, 0.55)
  );

  // Update meta theme-color for PWA mobile chrome
  const metaTheme = document.querySelector("meta[name='theme-color']");
  if (metaTheme) metaTheme.setAttribute("content", topic.backgroundColor);

  // Update font class on body
  document.body.className = "";
  document.body.classList.add(topic.fontClass);

  // Update active state on menu buttons
  document.querySelectorAll(".topic-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.id === topic.id);
  });

  // Update URL hash without reloading page
  history.replaceState(null, "", "#" + topic.id);

  // Reuse audio element instead of creating a new one (avoids memory leaks)
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
      .catch(error => {
        console.log("Audio could not autoplay:", error);
        document.getElementById("audioBtn").textContent = "Play Atmosphere Sound";
      });
  } else {
    document.getElementById("audioBtn").textContent = "Play Atmosphere Sound";
  }
}

document.getElementById("audioBtn").addEventListener("click", () => {
  if (currentAudio.paused) {
    currentAudio.play();
    document.getElementById("audioBtn").textContent = "Pause Atmosphere Sound";
  } else {
    currentAudio.pause();
    document.getElementById("audioBtn").textContent = "Play Atmosphere Sound";
  }
});

// Helper: convert hex color to rgba string
function hexToRgba(hex, alpha) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return `rgba(255,255,255,${alpha})`;
  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);
  return `rgba(${r},${g},${b},${alpha})`;
}
