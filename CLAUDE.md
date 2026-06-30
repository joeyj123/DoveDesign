# DoveDesign — Claude Code Session Reference

⚠️ STOP — Read this entire file FIRST before touching any file or writing any code.
Do not make a single edit until you have read every section below.
Confirm you have read it by summarizing the 5 broken things listed in the "5 Most Broken Things" section before doing anything else.

---

## What This App Is

A woodworking CAD app. Stack: React + Vite + TypeScript + React Three Fiber, Zustand, Tailwind CSS.
Audience: older hobbyist woodworkers. It must feel simple and reliable.

---

## The Real Data Model

The core entity is `WoodMember` (not "Board") defined in `src/types.ts`.

```ts
interface WoodMember {
  id: string;
  label: string;
  position: [number, number, number];  // world XYZ in inches
  rotation: [number, number, number];  // Euler radians
  length: number;   // X axis in 3D space
  thickness: number; // Y axis (height)
  width: number;    // Z axis
  cuts: CutOperation[];
  // ... species, color, materialKind, etc.
}
```

**Board geometry in 3D = `[length, thickness, width]` — NOT `[width, height, depth]`.**
Do NOT change this axis mapping. It is used throughout the codebase.

Members live in `store.project.members[]`.
`structural` on Project must NEVER be made nullable.

---

## The Real Store Shape

State lives in `src/store.ts` via Zustand with `persist` middleware.

Key UI state fields:
- `activeTool: ActiveTool` — current tool ('select', 'addBoard', 'drawBoard', 'mate', 'rip', 'cut', etc.)
- `selectedMemberId: string | null`
- `multiSelection: string[]`
- `radialWheelOpen: boolean`
- `radialWheelAnchor: {x,y} | null` — screen position where wheel opens
- `orbitControlsEnabled: boolean` — MUST be false during any drag tool
- `transformMode: 'translate' | 'rotate' | 'scale'`

Key actions:
- `selectMember(id, opts)` — also controls radial wheel visibility
- `setMultiSelection(ids[])` — multi-select; wheel only opens for single selection
- `setOrbitControlsEnabled(bool)` — must be called by tools that need pointer control
- `resetToolState()` — resets everything back to select tool + deselects

---

## Architecture Rules (Do Not Break These)

### Rule 1 — WoodMember is passive data
`WoodMember` objects are plain data in the store. They do NOT own behavior or listen to events.

### Rule 2 — WoodBlock.tsx handles all mesh interaction
`src/components/WoodBlock.tsx` renders each member as a mesh and handles pointer events on it.
It already dispatches correctly to the store based on `activeTool`.
Do NOT add new pointer event handlers directly to meshes outside WoodBlock.

### Rule 3 — TransformGizmo only appears during 'select' tool
`src/components/TransformGizmo.tsx` already has this guard:
```ts
if (activeTool !== 'select' || !attached || !objectRef.current) return null;
```
Do NOT remove this guard. The TransformControls (move/rotate arrows) must NOT appear for any other tool.

### Rule 4 — OrbitControls must be disabled during drag tools
`src/components/SceneOrbitControls.tsx` reads `ui.orbitControlsEnabled`.
Any tool that captures pointer drag (drawBoard, boxSelect, etc.) MUST call:
```ts
setOrbitControlsEnabled(false)
```
...on drag start, and restore it on drag end or cancel.

### Rule 5 — Radial wheel visibility rules
The radial wheel (`RadialOrbitalSelector`) opens ONLY when:
- A single member is selected (`selectedMemberId !== null`)
- AND `radialWheelOpen === true` (set by `selectMember()`)

It must close when:
- User clicks empty space (`onPointerMissed` in Viewport.tsx already does this)
- User presses Escape (`resetToolState()`)
- A tool other than 'select' becomes active
- Multi-selection has more than 1 member

The wheel is currently **always opening on any click** because `selectMember()` defaults
`openWheel: true`. To fix wheel-always-in-the-way: only pass `openWheel: true` when
the user clicked directly on a member in select tool mode.

### Rule 6 — Box select requires Shift key
Box select already requires `e.shiftKey` in `Viewport.tsx onPointerMissed`.
Non-shift left-drag = orbit camera. Do NOT change this.

### Rule 7 — Do not rewrite working logic, only extend it
Existing working systems: cut optimizer, Pepe knowledge base, undo/redo, assembly mode,
mate/attachment system, CSG cuts in WoodBlock, estimating, engineering panel.
Do NOT refactor these unless fixing a specific bug in them.

---

## The 5 Most Broken Things (Fix These First)

As of Phase 15 (2026-06-29), no critical known broken items remain.
All Phase 15 features pass `npm run build` with zero TypeScript errors.

**Currently watch-out items (not critical, but worth a future pass):**

### 1. None known — build is clean
No TypeScript errors. All Phase 11 features pass `npm run build`.

### 2. Placeholder
**Fix:** 
- In `selectMember()`, only open wheel if `opts.openWheel` is explicitly true
- Add `useEffect` in `RadialOrbitalSelector` that watches `activeTool` and closes wheel when tool changes away from 'select'
- Wheel should auto-collapse (not close) when user starts dragging a member

### 3. Boards can't attach to each other (mate tool broken)
**Root cause:** The mate tool flow requires clicking face A then face B.
The `applyMate()` function calls `computeMateTransform()` from `src/lib/mating.ts`
to move member B so its face aligns with member A's face.

**What's likely broken:** Face normals aren't being correctly picked from the raycast,
OR `computeMateTransform()` is computing wrong offsets because member position/rotation
isn't being applied to the face center calculation.

**Fix approach:** In `WoodBlock.tsx handleClick`, when `activeTool === 'mate'`:
- Log `mateFaceA`, `mateFaceB`, and the result of `computeMateTransform()` to console
- Verify the face normal `worldNormal` is correct after `transformDirection(matrixWorld)`
- Verify `pickFaceFromWorldNormal()` returns the correct FaceId

### 4. Draw mode adds unintended boards
**Root cause:** `DrawBoardTool.tsx` commits a board on pointer-up, but also possibly
on pointer-down or on short clicks that weren't intentional drags.

**Fix:** In `DrawBoardTool`, only commit the board if drag distance exceeds a minimum
threshold (e.g. 2 inches = about 8px at default zoom). If pointer-up happens at nearly
the same position as pointer-down, cancel the draw.

### 5. Camera orbit conflicts with drag select
**Root cause:** Both `OrbitControls` and `BoxSelectionHandler` listen to pointer events.
`setOrbitControlsEnabled(false)` is called in `onPointerMissed` only when `shiftKey` is held,
but orbit controls still intercept the event first.

**Fix:** In `BoxSelectionHandler`, call `setOrbitControlsEnabled(false)` immediately on
pointer-down when shift is held, before OrbitControls can capture the drag.
Restore on pointer-up.

---

## Rip Cut — How It Should Actually Work

The data model already supports rip cuts via `CutOperation` in `src/types.ts`:
```ts
{
  type: 'ripCut',
  targetWidth: number,  // final board width in inches
  ripKeepEdge: 'start' | 'end'  // which side to keep
}
```

`buildCutSubtractions()` in `src/lib/joinery.ts` already handles this CSG operation.

**The UI flow that's missing:**
1. User selects a board → radial wheel appears
2. User picks "Rip" from wheel or presses R
3. A small input overlay appears near the board: "Cut width: ___ in"
4. User types a number (e.g. 3.5) — a red preview line shows on the board
5. User presses Enter → `addCut(memberId, { type: 'ripCut', targetWidth: 3.5, ripKeepEdge: 'start' })` is called
6. The CSG system in WoodBlock handles the rest — no need to split into two members

---

## Keyboard Shortcuts — How to Add Them

Use Drei's `KeyboardControls` (already in the stack, no new install needed).

```tsx
// In App.tsx, wrap Canvas with:
import { KeyboardControls } from '@react-three/drei'

const keyMap = [
  { name: 'escape', keys: ['Escape'] },
  { name: 'delete', keys: ['Delete', 'Backspace'] },
  { name: 'undo',   keys: ['KeyZ'] }, // with ctrl check in handler
]

<KeyboardControls map={keyMap}>
  <Viewport />
</KeyboardControls>
```

Then in a component inside Canvas:
```tsx
import { useKeyboardControls } from '@react-three/drei'
const [, get] = useKeyboardControls()
// check get().escape etc in useFrame or useEffect
```

**Recommended shortcuts:**
| Key | Action |
|---|---|
| Escape | `resetToolState()` — cancel tool, deselect, close wheel |
| Delete / Backspace | `removeMember(selectedMemberId)` |
| Ctrl+Z | `undo()` |
| Ctrl+Y | `redo()` |
| G | `setGridVisible(!gridVisible)` |

---

## Things That Must Never Change

- `Project.structural` must NEVER be nullable
- Always import Three.js as `import * as THREE from 'three'`
- Board geometry args order is `[length, thickness, width]` — do NOT change
- `text-base` minimum font size everywhere (except radial wheel which uses `text-sm`)
- All UI controls must have visible text labels
- Run `npm run build` before every commit — not just `tsc --noEmit`
- Never `git add .` — use `git add src/` to avoid committing node_modules

---

## File Map (What Does What)

| File | Role |
|---|---|
| `src/store.ts` | All app state + actions |
| `src/types.ts` | All TypeScript types |
| `src/components/Viewport.tsx` | Canvas root, lighting, camera, pointer-missed handler |
| `src/components/WoodBlock.tsx` | Renders each member, handles click/pointer events |
| `src/components/TransformGizmo.tsx` | Move/rotate/scale arrows (only in select tool) |
| `src/components/RadialOrbitalSelector.tsx` | The circular tool wheel |
| `src/components/DrawBoardTool.tsx` | Draw-drag tool to place new boards |
| `src/components/SceneOrbitControls.tsx` | Camera orbit (reads orbitControlsEnabled) |
| `src/components/BoxSelectionHandler.tsx` | Shift+drag rubber-band select |
| `src/lib/mating.ts` | Face mate math (computeMateTransform) |
| `src/lib/joinery.ts` | CSG cut operations (buildCutSubtractions) |
| `src/lib/bounds.ts` | Snap-to-position logic |


---

## End of Session — Always Do This Last

After every session, once the build passes and all changes are complete:

1. Run `npm run build` one final time to confirm clean build
2. Run these git commands:
```
git add src/
git commit -m "brief description of what was changed"
git push origin main
```
3. Confirm the push succeeded — you should see `main -> main` in the output
4. Tell Joey the push is done and what commit message was used

Never end a session without pushing. Vercel deploys automatically after every push to main.

---

## Standard Practice — Every Session Must Do This

After fixing or adding any tool, behavior, or feature, ALWAYS update these two things
before ending the session. This is not optional.

### 1. Update TutorialPanel.tsx

`src/components/TutorialPanel.tsx` is the in-app help guide users read.
Any time a tool is fixed, added, or its behavior changes:
- Update the relevant Section to describe the new behavior accurately
- If it's a new tool or feature, add a new Section for it
- Always include an "Ask Pepe:" line at the bottom of each Section with 2-3 example questions
- Keep language plain and simple — audience is older hobbyist woodworkers, not developers
- Minimum font size is `text-base` everywhere

### 2. Update Pepe knowledge base

The primary knowledge file is `src/lib/pepeKnowledge.ts`.
Any time a tool is fixed, added, or its behavior changes, add entries like:
```ts
{ q: "how do i use [tool name]", a: "Step by step plain language answer." },
{ q: "what does [tool name] do",  a: "Plain language explanation." },
```
Rules for Pepe entries:
- Write answers in plain conversational English, like explaining to a grandparent
- Keep answers under 3 sentences
- Always include the keyboard shortcut if one exists
- Add at least 2 entries per new/fixed feature (how-to + what-is)

### Current Keyboard Shortcuts (keep this list updated as new ones are added)

| Key | Action |
|---|---|
| `Space` | Open / close radial wheel on selected board |
| `Escape` | Cancel tool, deselect all, close wheel |
| `S` | Select tool |
| `B` | Open / close Bill of Materials panel |
| `W` | Draw board tool |
| `M` | Activate move arrows on selected board |
| `R` | Rip cut tool |
| `D` | Measure tool (dimension lines) |
| `G` | Toggle grid |
| `Delete` | Delete selected board |
| `Ctrl+Z` | Undo |
| `Ctrl+Y` | Redo |
| `J` | Mate tool (join boards) |
| `F` | Toggle Finishing panel (stain/paint/clear coat/oil) |
| `C` | Centerline tool (click board face to add CL marker) |
| `U` | Unmate most recent connection on selected board |
| `Shift+drag` | Box select multiple boards |
| `Shift+Delete` | Clear all boards (with confirm dialog) |
| `Ctrl+S` | Save project to .wcad file |
| `Ctrl+O` | Open a .wcad file |

When adding new shortcuts, update this table AND add them to:
1. `src/components/KeyboardShortcuts.tsx`
2. The Keyboard Shortcuts section in `TutorialPanel.tsx`
3. Pepe knowledge in `src/lib/pepeKnowledge.ts`
