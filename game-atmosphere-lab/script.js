// Game Atmosphere Lab JavaScript

let topics = [];
let currentAudio = new Audio();

// Load topic data from JSON
fetch("data.json")
  .then(response => response.json())
  .then(data => {
    topics = data.topics;
    createTopicMenu();
    showTopic(0, false); // show first topic, but do not autoplay at page load
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
      showTopic(index, true); // autoplay sound when user clicks a topic
    });

    topicMenu.appendChild(button);
  });
}

// Show selected topic
function showTopic(index, autoPlaySound) {
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

  // Stop old sound before starting new sound
  currentAudio.pause();
  currentAudio.currentTime = 0;

  // Load new topic sound
  currentAudio = new Audio(topic.audio);
  currentAudio.loop = true; // atmosphere sound keeps playing until another topic is clicked

  // Reset button when audio ends, just in case loop is turned off later
  currentAudio.addEventListener("ended", () => {
    document.getElementById("audioBtn").textContent = "Play Atmosphere Sound";
  });

  // Autoplay only after user clicks a topic button
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

// Play / pause atmosphere sound button
document.getElementById("audioBtn").addEventListener("click", () => {
  if (currentAudio.paused) {
    currentAudio.play();
    document.getElementById("audioBtn").textContent = "Pause Atmosphere Sound";
  } else {
    currentAudio.pause();
    document.getElementById("audioBtn").textContent = "Play Atmosphere Sound";
  }
});
