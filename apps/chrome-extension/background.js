// Service worker for Clarte Chrome extension
// Runs in the background when the extension is installed

chrome.runtime.onInstalled.addListener(() => {
  console.log("Clarte extension installed");
});

// Open side panel when extension icon is clicked
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(() => {
  // Fallback for older Chrome versions
});

// Open side panel when keyboard shortcut is pressed
chrome.commands.onCommand.addListener(async (command) => {
  if (command === "open-clarte") {
    try {
      const win = await chrome.windows.getCurrent();
      if (win?.id) await chrome.sidePanel.open({ windowId: win.id });
    } catch (e) {
      console.warn("[Clarte] Failed to open side panel:", e);
    }
  }
});
