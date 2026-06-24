# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Product

**DoveDesign** — client-side woodworking CAD for layout, estimating, cut lists, and shop documentation.

## Commands

```bash
npm install          # install all dependencies (run once after cloning)
npm run dev          # start Vite dev server at http://localhost:5173
npm run build        # type-check + production build → dist/
npm run preview      # serve the production build locally
npx tsc --noEmit     # type-check without building (fastest correctness gate)
```

No test runner is configured. TypeScript strict mode (`npx tsc --noEmit`) is the primary correctness gate.

## Architecture

Fully client-side React + Vite + TypeScript app. No backend, no API calls, no auth. Hosts as static files.

### State: single Zustand store (`src/store.ts`)

All application state lives in one `useAppStore` hook:

- **`project`** — serializable data tree (members, hardware, finishes, estimating, structural, mates). Written to disk on save and restored from autosave.
- **`ui`** — ephemeral UI state (active tool, selected member, viewport toggles). Never persisted to disk.
- **`past` / `future`** — undo/redo history stacks (project snapshots only).

**Persistence:** Zustand `persist` middleware saves `project` to `localStorage` key `dovedesign-autosave-v1`. Survives refresh/crash; `ui` and history are not autosaved.

**File I/O:**
- `saveProjectToFile()` — serializes via `serializeWcad()` → browser download as `<name>.wcad`
- `loadProjectFromFile(file)` — parses `.wcad` (or legacy `.woodproject` JSON) via `parseWcad()`
- `newProject()` — clears members and resets selection

### Data models (`src/types.ts`)

`Project` is the canonical save format. Key rules:

- `WoodMember` dimensions are always **actual inches** (not nominal). `NOMINAL_DIMENSIONS` maps nominal sizes (e.g. `'2x4'`) to real surfaced dims.
- `WoodMember.cuts[]` — CSG cut/joinery operations (crossCut, ripCut with `targetWidth`, pocketHole with `partnerMemberId`, etc.)
- `Project.mates[]` — permanent face-mate links between boards
- `Project.estimating` — commercial ledger settings (tax, waste buffer, unit prices)
- `Project.structural` — always present; physics placeholder — do not remove or make nullable
- `FinishItem.sandingGrit` is optional — only populate when `finishType === 'Sanding'`

### Layout shell (`src/App.tsx`)

```
SystemRibbon (h-9, File / View / Help)
├── ToolRibbon (w-16 vertical tool dock)
├── Viewport (R3F canvas)
└── RightSidebar (w-96 tabbed: Inspector | Estimating | Cut List | Engineering | Tutorial)
```

### 3D Viewport (`src/components/Viewport.tsx`, `WoodBlock.tsx`)

Uses `@react-three/fiber` + `@react-three/drei`. Scene unit = **1 inch**.

- **OrbitControls** (`SceneOrbitControls.tsx`): left-drag orbit, middle-drag pan, shift+left pan, scroll zoom
- **DrawBoardTool** — disables orbit on pointer-down while drawing footprints
- **TransformGizmo** — translate/rotate/scale with 15°/45°/90° angle snap on rotate
- **WoodBlock** — `@react-three/csg` base prism + cut subtractions; dual-sided joinery via `buildReceivingJoinery()`
- **Context menu** — right-click raycast → Delete, Duplicate, Mirror, Joinery, Isolate

When using Three.js classes inside R3F, always `import * as THREE from 'three'`.

Selection: amber emissive + edge overlay — not color alone (UX constraint).

### Computational libs (`src/lib/`)

| Module | Purpose |
|--------|---------|
| `joinery.ts` | CSG subtraction geometry; `createCutOperation()` |
| `mating.ts` | Face normals, `computeMateTransform()`, viewport face picking |
| `nesting.ts` | 1D lumber bin-packing (8/10/12 ft, 1/8" kerf) |
| `sheetNesting.ts` | 2D sheet bin-packing on 48×96 sheets |
| `estimating.ts` | LF/BF/SF ledger, tax, waste buffer |
| `engineering.ts` | Beam deflection analysis |
| `wcad.ts` | `.wcad` JSON envelope serialize/parse |
| `brand.ts` | DoveDesign product strings |
| `boardFeet.ts` | Board feet and member cost |

### File structure

```
src/
  App.tsx
  main.tsx
  index.css
  store.ts
  types.ts
  components/
    SystemRibbon.tsx       ← top ribbon (File/View/Help, Undo/Redo)
    ToolRibbon.tsx         ← left vertical tool dock
    Viewport.tsx
    ViewportWelcome.tsx
    SceneOrbitControls.tsx
    DrawBoardTool.tsx
    WoodBlock.tsx
    TransformGizmo.tsx
    RightSidebar.tsx
    ToolPanel.tsx
    MemberInspector.tsx
    EstimatingPanel.tsx
    CutListPanel.tsx
    EngineeringPanel.tsx
    TutorialPanel.tsx
    SystemInfoModal.tsx
    BrandLogo.tsx
  lib/
    joinery.ts, mating.ts, nesting.ts, sheetNesting.ts, ...
```

### UX constraints

Targets older hobbyist woodworkers:

- Minimum `text-base` (16px) font size everywhere
- All interactive controls must have visible text labels — no icon-only buttons
- Selected/active state communicated by both color AND a visible border/outline
- Large touch targets; prefer dropdowns over raw number inputs where practical
