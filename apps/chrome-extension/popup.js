// Popup script - runs when popup opens
// Aligns with VoiceCard: LANGUAGE_OPTIONS, VOICE_OPTIONS (voice-card.tsx)

const DEMO_URL = "https://clarte.io/demo";
const STORAGE_KEYS = { language: "clarte-popup-language", voice: "clarte-popup-voice" };

document.addEventListener("DOMContentLoaded", () => {
  const languageSelect = document.getElementById("language");
  const voiceSelect = document.getElementById("voice");
  const callBtn = document.getElementById("callBtn");

  // Restore saved preferences
  chrome.storage.local.get([STORAGE_KEYS.language, STORAGE_KEYS.voice], (result) => {
    if (result[STORAGE_KEYS.language]) languageSelect.value = result[STORAGE_KEYS.language];
    if (result[STORAGE_KEYS.voice]) voiceSelect.value = result[STORAGE_KEYS.voice];
  });

  callBtn.addEventListener("click", () => {
    const language = languageSelect.value;
    const voice = voiceSelect.value;
    chrome.storage.local.set(
      { [STORAGE_KEYS.language]: language, [STORAGE_KEYS.voice]: voice },
      () => {
        const url = `${DEMO_URL}?language=${encodeURIComponent(language)}&voice=${encodeURIComponent(voice)}`;
        chrome.tabs.create({ url });
        window.close();
      }
    );
  });
});
