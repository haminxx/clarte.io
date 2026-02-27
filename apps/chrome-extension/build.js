#!/usr/bin/env node
/**
 * Build script for Clarte Chrome extension.
 * Copies files to dist/ for loading as unpacked extension.
 */
const fs = require("fs");
const path = require("path");

const distDir = path.join(__dirname, "dist");
const files = ["manifest.json", "popup.html", "popup.js", "sidepanel.html", "background.js"];

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

for (const file of files) {
  const src = path.join(__dirname, file);
  const dest = path.join(distDir, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`Copied ${file}`);
  }
}

console.log("Build complete. Load dist/ as unpacked extension in Chrome.");
