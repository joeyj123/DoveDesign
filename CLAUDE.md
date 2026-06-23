# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install          # install all dependencies (run once after cloning)
npm run dev          # start Vite dev server at http://localhost:5173
npm run build        # type-check + production build → dist/
npm run preview      # serve the production build locally
```

No test runner is configured yet. There are no lint scripts defined; TypeScript strict mode serves as the primary correctness gate (`tsc --noEmit` via the build command).

## Architecture

This is a fully client-side React + Vite + TypeScript app. It has no backend, no API calls, and no auth. Everything runs in the browser and can be hosted as static files.

### State: single Zustand store (`src/store.ts`)

All application state lives in one `useAppStore` hook. The store is split into two slices:

- **`project`** — the serializable data tree (members, hardware, finishes, structural). This is the exact object written to disk on save and read back on load.
- **`ui`** — ephemeral UI state (active tool, selected member ID). Never persisted.

The store owns the two file I/O actions:
- `saveProjectToFile()` — serializes `project` to JSON and triggers a browser download as `<name>.woodproject`
- `loadProjectFromFile(file)` — reads the File, parses JSON, validates shape, replaces `project` in the store

### Data models (`src/types.ts`)

The `Project` type is the canonical save format. Key relationships:

- `WoodMember` — a single board. Dimensions are always stored in **actual inches** (not nominal). `NOMINAL_DIMENSIONS` maps nominal sizes (e.g. `'2x4'`) to their real surfaced dimensions and is used to auto-fill thickness/width when the user picks a nominal size.
- `FinishItem.sandingGrit` is optional and should only be populated when `finishType === 'Sanding'`.
- `Project.structural` is always present but all its fields are optional — it is a placeholder for a future physics engine. Do not remove it or make it nullable.

### 3D Viewport (planned: `src/components/Viewport.tsx`, `WoodBlock.tsx`)

The scene uses `@react-three/fiber` (React renderer for Three.js) and `@react-three/drei` (helpers: OrbitControls, Grid, GizmoHelper). Each `WoodMember` in the store maps to a `WoodBlock` component rendered as a `BoxGeometry` scaled to actual inch dimensions. The scene coordinate unit is **1 unit = 1 inch**.

### Cost calculations (planned: `src/lib/boardFeet.ts`)

Board feet formula: `(thickness × width × length) / 144` — all inputs in inches. Member cost = board feet × `costPerBoardFoot`. Project totals sum lumber + hardware + finishes.

### UX constraints

This app targets older hobbyist woodworkers. Enforce these in all UI work:
- Minimum `text-base` (16px) font size everywhere
- All interactive controls must have visible text labels — no icon-only buttons
- Selected/active state must be communicated by both color AND a visible border/outline (never color alone)
- Large touch targets; prefer sliders and dropdowns over raw number inputs where practical

## Planned file structure (Phase 2+, not yet built)

```
src/
  App.tsx                 ← three-column flex layout shell
  main.tsx                ← Vite entry point
  index.css               ← Tailwind base imports
  components/
    LeftSidebar.tsx        ← Add board form + Shop Tools (Cut, Miter, Carve)
    Viewport.tsx           ← R3F canvas + lighting + grid floor
    WoodBlock.tsx          ← per-member 3D mesh, click-to-select
    RightSidebar.tsx       ← Live Takeoff panel + Save/Load buttons
  lib/
    boardFeet.ts           ← pure calculation utilities
```
