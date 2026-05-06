// Game Atmosphere Lab JavaScript

let topics = [];
let currentAudio = new Audio();

fetch("data.json")
  .then(response => response.json())
  .then(data => {
    topics = data.topics;
    createTopicMenu();
    showTopic(0, false);
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

    button.addEventListener("click", () => {
      showTopic(index, true);
    });

    topicMenu.appendChild(button);
  });
}

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

  document.documentElement.style.setProperty("--bg-color", topic.backgroundColor);
  document.documentElement.style.setProperty("--accent-color", topic.accentColor);
  document.documentElement.style.setProperty("--text-color", topic.textColor);

  document.body.className = "";
  document.body.classList.add(topic.fontClass);

  currentAudio.pause();
  currentAudio.currentTime = 0;

  currentAudio = new Audio(topic.audio);
  currentAudio.loop = true;

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
