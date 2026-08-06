/**
 * Shared color tokens for contexts Tailwind classes can't reach — Three.js
 * scene colors (Canvas background, Grid lines, selection outlines, draw
 * previews). Mirrors the `charcoal`/`spruce`/orange values in
 * tailwind.config.js so the DOM chrome and the 3D viewport draw from one
 * palette instead of independently-guessed hex values per component
 * (New Order 5.3 consolidation — previously BoardMesh.tsx and
 * SketchTool.tsx each hardcoded their own, different, "active" color).
 */
export const THEME = {
  viewportBackground: '#4d4740', // = tailwind charcoal-600
  gridCell: '#6b645c', // = tailwind charcoal-500
  gridSection: '#b3aba0', // = tailwind charcoal-300
  // The app's single active/selected signal (CLAUDE.md New Order 5.3):
  // board selection outlines, draw-tool previews, and the active-tool rail
  // highlight all read from this one value. = tailwind orange-500.
  selectionOrange: '#f97316',
  // The app's one secondary accent (LogoMark's dovetail-pin spruce, = tailwind
  // spruce-400ish) — used where a second, clearly-distinct-from-orange signal
  // is needed (e.g. the Mate tool's Face A vs Face B highlight).
  spruceAccent: '#7a8b6f',
} as const;
