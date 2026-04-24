function speak(textToSay) {
  window.speechSynthesis.cancel();
  const msg = new SpeechSynthesisUtterance(textToSay);
  msg.pitch = 1.2;
  msg.rate = 1.0;
  window.speechSynthesis.speak(msg);
}

function onWordChange() {
  const menu = document.getElementById("wordSelect");
  const box = document.getElementById("sentenceBox");

  // Gatekeeper: index 0 is "-- Select --"
  if (menu.selectedIndex > 0) {
    const selectedOption = menu.options[menu.selectedIndex];

    // display sentence
    box.value = selectedOption.dataset.sentence;

    // speak word automatically when selected (required)
    speak(selectedOption.value);
  } else {
    box.value = "";
  }
}

function speakWord() {
  const menu = document.getElementById("wordSelect");
  if (menu.selectedIndex > 0) {
    const selectedOption = menu.options[menu.selectedIndex];
    speak(selectedOption.value);
  }
}

function speakSentence() {
  const box = document.getElementById("sentenceBox");
  if (box.value.trim() !== "") {
    speak(box.value);
  }
}
