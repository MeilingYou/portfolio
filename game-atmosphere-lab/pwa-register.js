(function () {
  if (!("serviceWorker" in navigator)) {
    console.log("Service workers are not supported in this browser.");
    return;
  }

  window.addEventListener("load", function () {
    navigator.serviceWorker.register("/portfolio/game-atmosphere-lab/service-worker.js", {
      scope: "/portfolio/game-atmosphere-lab/"
    })
    .then(function (registration) {
      console.log("Service worker registered successfully:", registration.scope);

      if (registration.active) {
        console.log("Service worker is active.");
      }

      if (registration.installing) {
        console.log("Service worker is installing.");
      }

      if (registration.waiting) {
        console.log("Service worker is waiting.");
      }
    })
    .catch(function (error) {
      console.error("Service worker registration failed:", error);
    });
  });
})();
