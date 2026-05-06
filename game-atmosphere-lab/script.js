// Game Atmosphere Lab JavaScript

let topics = [];
let currentAudio = new Audio();

// Load topic data from JSON
fetch("data.json")
  .then(response => response.json())
  .then(data => {
    topics = data.topics;
    createTopicMenu();
    showTopic(0); // show first topic when page loads
  })
  .catch(error => {
    console.log("Error loading JSON:", error);
  });

// Create buttons from JSON topics
function createTopicMenu() {
  const topicMenu = document.getElementById("topicMenu");

  topics.forEach((topic, index) => {
    const button = document.createElement("button");
    button.textContent = topic.title;
    button.classList.add("topic-btn");

    button.addEventListener("click", () => {
      showTopic(index);
    });

    topicMenu.appendChild(button);
  });
}

// Show selected topic
function showTopic(index) {
  const topic = topics[index];

  document.getElementById("topicTitle").textContent = topic.title;
  document.getElementById("gameExample").textContent = "Inspired by: " + topic.gameExample;
  document.getElementById("artStyle").textContent = topic.artStyle;
  document.getElementById("mood").textContent = topic.mood;
  document.getElementById("description").textContent = topic.description;

  const topicImage = document.getElementById("topicImage");
  topicImage.src = topic.image;
  topicImage.alt = topic.title + " illustration";

  // Change theme colors
  document.documentElement.style.setProperty("--bg-color", topic.backgroundColor);
  document.documentElement.style.setProperty("--accent-color", topic.accentColor);
  document.documentElement.style.setProperty("--text-color", topic.textColor);

  // Change font style
  document.body.className = "";
  document.body.classList.add(topic.fontClass);

  // Prepare audio
  currentAudio.pause();
  currentAudio.currentTime = 0;
  currentAudio = new Audio(topic.audio);
}

// Play / pause atmosphere sound
document.getElementById("audioBtn").addEventListener("click", () => {
  if (currentAudio.paused) {
    currentAudio.play();
    document.getElementById("audioBtn").textContent = "Pause Atmosphere Sound";
  } else {
    currentAudio.pause();
    document.getElementById("audioBtn").textContent = "Play Atmosphere Sound";
  }
});

// Reset button text when audio ends
currentAudio.addEventListener("ended", () => {
  document.getElementById("audioBtn").textContent = "Play Atmosphere Sound";
});
