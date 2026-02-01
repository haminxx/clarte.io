/**
 * Writes public/backend-config.json from NEXT_PUBLIC_PIPECAT_BACKEND_URL.
 * Loads .env and .env.local from project root so the URL is correct when you
 * run "npm run build" locally (Node does not load .env files by default).
 * Run before next build (see package.json "build" script).
 */
const fs = require("fs");
const path = require("path");

const projectRoot = path.resolve(__dirname, "..");

function loadEnvFile(fileName) {
  const filePath = path.join(projectRoot, fileName);
  if (!fs.existsSync(filePath)) return false;
  try {
    let content = fs.readFileSync(filePath, "utf8");
    content = content.replace(/^\uFEFF/, ""); // strip BOM
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq <= 0) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim().replace(/\r$/, ""); // trim and strip \r (Windows)
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1).trim();
      }
      if (key) process.env[key] = value;
    }
    return true;
  } catch (e) {
    console.warn("write-backend-config: could not read", fileName, e.message);
    return false;
  }
}

// Load .env first, then .env.local (local overrides)
const loadedEnv = loadEnvFile(".env");
const loadedLocal = loadEnvFile(".env.local");

let backendUrl =
  (process.env.NEXT_PUBLIC_PIPECAT_BACKEND_URL || "").trim().replace(/\/$/, "") ||
  "http://localhost:8000";

const publicDir = path.join(projectRoot, "public");
const outPath = path.join(publicDir, "backend-config.json");

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

fs.writeFileSync(
  outPath,
  JSON.stringify({ backendUrl }, null, 2),
  "utf8"
);

const isLocalhost =
  backendUrl.startsWith("http://localhost") ||
  backendUrl.startsWith("http://127.0.0.1");
console.log(
  "write-backend-config: backendUrl =",
  isLocalhost ? "(localhost)" : backendUrl,
  loadedLocal ? "(from .env.local)" : loadedEnv ? "(from .env)" : "(from env)"
);
if (isLocalhost) {
  console.warn(
    "write-backend-config: Set NEXT_PUBLIC_PIPECAT_BACKEND_URL in .env.local (project root) or in CI secrets. Voice will show 'not configured' on production until then."
  );
}
