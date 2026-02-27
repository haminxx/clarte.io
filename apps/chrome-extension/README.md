# Clarte Chrome Extension

Gemini-style Chrome extension for Clarte Voice AI. Opens in a side panel from any tab.

## Features

- **Side panel**: Click the Clarte icon to open the voice UI in Chrome's side panel
- **Keyboard shortcut**: `Ctrl+Shift+C` (Windows/Linux) or `Command+Shift+C` (Mac) to open Clarte
- **Voice, screen share, camera**: Full support when the agent requests them

## Development

1. Load the extension in Chrome:
   - Open `chrome://extensions`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `apps/chrome-extension` folder (or `dist/` after running `npm run build`)

2. Log in to clarte.io in a normal tab first. The extension iframe shares the session.

3. Click the Clarte icon or press `Ctrl+Shift+C` to open the side panel.

## Build

```bash
npm run build
```

Copies files to `dist/` for distribution. Load `dist/` as unpacked for testing.

## Local Development

For local testing, edit `sidepanel.html` and change the iframe `src` to `http://localhost:3000/voice?embed=1` (when running `npm run dev` in the main app).

## Publishing

To publish to Chrome Web Store:

1. Create a zip of the extension:
   ```bash
   cd dist && zip -r ../clarte-extension.zip . && cd ..
   ```

2. Upload to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)

3. Add icons (16, 48, 128px PNG) to the `icons/` folder and update manifest before publishing.

## Permissions

- `sidePanel`: Show Clarte UI in side panel
- `storage`: Save user preferences
- `activeTab`: Access current tab when needed
- `host_permissions`: clarte.io, *.onrender.com, wss://*.livekit.cloud
