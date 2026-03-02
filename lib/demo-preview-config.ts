/**
 * Config for the demo preview section (half-cut card that expands on scroll).
 * Set NEXT_PUBLIC_DEMO_PREVIEW_SRC and NEXT_PUBLIC_DEMO_PREVIEW_TYPE in .env.local
 * to use a custom video or GIF. Paths are relative to public/ (e.g. /demo-preview.mp4).
 */
export const DEMO_PREVIEW_SRC =
  (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_DEMO_PREVIEW_SRC) ||
  "/demo-preview.gif"

export const DEMO_PREVIEW_TYPE =
  (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_DEMO_PREVIEW_TYPE) ||
  "gif"

export type DemoPreviewMediaType = "video" | "gif"
