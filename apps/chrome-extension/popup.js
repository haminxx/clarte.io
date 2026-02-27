// Popup script - runs when popup opens
document.addEventListener("DOMContentLoaded", () => {
  // Optional: load saved state from storage
  chrome.storage.local.get(["lastOpened"], (result) => {
    if (result.lastOpened) {
      console.log("Last opened:", result.lastOpened);
    }
  });
});
