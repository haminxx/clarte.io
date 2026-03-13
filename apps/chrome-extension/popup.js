// Popup script - runs when popup opens
// Aligns with VoiceCard: LANGUAGE_OPTIONS, VOICE_OPTIONS (voice-card.tsx)

const DEMO_URL = "https://clarte.io/demo";
const STORAGE_KEYS = { language: "clarte-popup-language", voice: "clarte-popup-voice" };

document.addEventListener("DOMContentLoaded", () => {
  const languageSelect = document.getElementById("language");
  const voiceSelect = document.getElementById("voice");
  const callBtn = document.getElementById("callBtn");
  const contextEl = document.getElementById("context");

  // Restore saved preferences
  chrome.storage.local.get([STORAGE_KEYS.language, STORAGE_KEYS.voice], (result) => {
    if (result[STORAGE_KEYS.language]) languageSelect.value = result[STORAGE_KEYS.language];
    if (result[STORAGE_KEYS.voice]) voiceSelect.value = result[STORAGE_KEYS.voice];
  });

  // Optional: show current tab host for context
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]?.url) {
      try {
        const u = new URL(tabs[0].url);
        contextEl.textContent = u.hostname || "clarte.io/demo";
      } catch {
        contextEl.textContent = "clarte.io/demo";
      }
    }
  });

  callBtn.addEventListener("click", () => {
    const language = languageSelect.value;
    const voice = voiceSelect.value;
    callBtn.classList.add("loading");
    callBtn.disabled = true;

    chrome.storage.local.set(
      { [STORAGE_KEYS.language]: language, [STORAGE_KEYS.voice]: voice },
      () => {
        // Short loading state with rotating dots before opening tab
        setTimeout(() => {
          const url = `${DEMO_URL}?language=${encodeURIComponent(language)}&voice=${encodeURIComponent(voice)}`;
          chrome.tabs.create({ url });
          window.close();
        }, 400);
      }
    );
  });
});
