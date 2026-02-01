/**
 * Writes public/backend-config.json from NEXT_PUBLIC_PIPECAT_BACKEND_URL
 * so the deployed site can use the backend URL at runtime (avoids build-only env issues).
 * Run before next build (see package.json "build" script).
 */
const fs = require("fs");
const path = require("path");

const backendUrl =
  process.env.NEXT_PUBLIC_PIPECAT_BACKEND_URL || "http://localhost:8000";

const publicDir = path.join(__dirname, "..", "public");
const outPath = path.join(publicDir, "backend-config.json");

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

fs.writeFileSync(
  outPath,
  JSON.stringify({ backendUrl }, null, 2),
  "utf8"
);

console.log(
  "wrote backend-config.json: backendUrl =",
  backendUrl.startsWith("http://localhost") ? "(localhost)" : backendUrl
);
