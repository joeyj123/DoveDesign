# DoveDesign — Progress Tracker

> Drop this file in C:\Projects\wood-cad-app\ alongside CLAUDE.md and DOVEDESIGN_ROADMAP.md.
> Claude reads this at the start of every new chat to restore full context instantly.

---

## Current Status

**Last completed phase:** Phase 15 ✅ — pending push, Vercel will deploy after push
**Next:** Stress test → report findings → Phase 16

---

## Workflow (follow every session)

1. Joey gives fix ideas / stress test results
2. Claude writes phase prompt (fixes + roadmap features) + updates PROGRESS.md → presents both for download
3. Joey drops PHASE_N_PROMPT.md into project root, runs Claude Code in auto mode
4. Claude Code outputs summary → Joey pastes it here
5. Claude reads output → writes stress test checklist
6. Joey stress tests → reports findings → back to step 1

---

## Phase Log

| Phase | Status | Commit | Summary |
|-------|--------|--------|---------|
| 1–9 | ✅ | various | Core build through joinery visualization — see commit history |
| 10 | ✅ | `efd5d29` | Clear Landscape, dim line edit, measure state machine, rotation axis lock, Save/Load, Templates |
| 11 | ✅ | `3ffc482` | Snap-to-grid live, zoom 0.5-500, Ctrl+Y redo, dim anchoring attempt, click-to-deselect attempt, BOM panel |
| 12 | ✅ | `f376ab1` | Grid levels, face normal offset, mate step UI attempt, centerline tool, material picker, finishing planner |
| 13 | ✅ | `224c829` | Work plane projection, rotation ring → TransformControls, mate groups scaffold, nav cube removed |
| 14 | ✅ | `b413b7a` | AUDIT FIXES: non-recursive raycasting (CSG child mesh bug), centerline mounted as mesh child (FIXED — confirmed working), transformGizmoActive added to useEffect deps for mate groups |
| 15 | ✅ | (pending) | Dim line edge/corner snap on both points, face boundary clamping, dim line render-as-child (anchored lines mounted in WoodBlock like centerlines), mate real-time grouping via TransformControls 'change' event + tool stays active for chaining, deselect via grid mesh onClick, board spawn placement (Shapes panel + quick-add form), orbit no longer disabled by measure-tool activation, centerline click-to-select + delete |
| 16 | ⬜ | — | TBD based on Phase 15 stress test results |

---

## Phase 14 — Confirmed Wins

- **Centerlines fully fixed** — first system to work correctly after 5+ phases. Root cause: was a sibling of the mesh computing world-space positions manually; fixed by converting to local-space coords and mounting INSIDE the board's mesh group so Three.js auto-propagates the transform.
- Dimension line vertical face raycasting fixed (was recursing into CSG child meshes lacking userData.memberId)
- Mate group useEffect deps bug found and fixed (transformGizmoActive missing from deps array)

## Phase 14 — Still Broken (carried to Phase 15)

- Dimension lines: edge/corner snap only works on start point, not end point
- Dimension lines: cursor flies off board onto grid when measuring past board edge
- Dimension lines: still do not move with board (the manual matrix math approach is fragile — Phase 15 applies the same render-as-child pattern that fixed centerlines)
- Mate: works but unclear trigger/workflow; positional only — one board lags during drag instead of true real-time grouping
- Click-to-deselect: still broken on 3rd attempt
- NEW: boards spawn overlapping at same origin position
- NEW: zoom/pan still disabled while a tool (measure/centerline/mate) is active — orbit disable likely tied to activeTool instead of actual drag state
- NEW: Convert to Cross Cut / Rip Cut button never appears, even though anchorMemberId was expected to be fixed
- NEW: centerline markers cannot be selected, edited, or deleted once placed
- NEW: dimension lines cannot be selected, edited, or deleted once placed (may be a regression from Phase 13/14 changes)

---

## Phase 15 — What Was Actually Fixed

- Dimension line snap: unified into a single snap check that runs every frame (first click, preview, and second click all go through it) — corners/edges now snap on both ends, not just the start.
- Dimension line preview no longer falls through to the grid floor past the board edge — once a work plane exists it's clamped to the clicked face's bounding rectangle instead.
- Dimension lines anchored to a board are now rendered as children of that board's `<mesh>` (`BoardDimensionLines` in `DimensionLineRenderer.tsx`, mounted from `WoodBlock.tsx`), using `localStart`/`localEnd` directly — same pattern that fixed centerlines in Phase 14. Free-floating (unanchored) lines still render globally in world space.
- Mate tool stays active (`activeTool: 'mate'`) after a successful mate instead of bouncing back to 'select', so multiple boards can be chained without re-pressing J.
- Mate groups now move in real time during a drag: `TransformGizmo` listens to TransformControls' `change` event (fires every frame) and calls `moveMateGroup(..., skipHistory=true)` incrementally; the final `dragging-changed` event applies only the snap correction and commits one undo step.
- Click-to-deselect: the grid/shadow floor mesh got an explicit `onClick` handler (since it's a real mesh, `onPointerMissed` on `<Canvas>` never fired for it).
- New boards from the Shapes panel and the quick-add board form now use `findOpenSpawnPosition` (AABB overlap walk in `lib/bounds.ts`) instead of always spawning at the origin.
- Removed the `setOrbitControlsEnabled(false)` call that fired when activating the measure tool via `D` — orbit/zoom/pan now stay enabled the whole time a tool is merely active; it's only disabled during an actual drag (gizmo, box-select, dimension-line endpoint drag).
- Centerline markers can now be clicked to select (highlight + hitbox line), deleted via a ToolPanel-style "Delete Centerline" button, and via the Delete key (new `ui.selectedCenterlineId` field).

## Phase 15 — Approach

**Key learning carried forward: when a system involving board-local positioning breaks repeatedly, the fix that works is mounting the renderer AS A CHILD of the board's mesh group using local coordinates — not maintaining separate world-space state with manual matrix reconstruction.** This worked for centerlines in Phase 14. Phase 15 applies the identical pattern to dimension lines.

- Dim line Bug A: unify snap-check logic into one function used for both start and end point clicks
- Dim line Bug B: clamp preview point to face boundary rectangle, don't let raycast fall through to grid
- Dim line Bug C: move dimension line rendering to be mounted per-board inside WoodBlock.tsx (mirroring centerline fix), using local coords directly, no manual matrixWorld math
- Mate Problem A: explicit mate tool activation with visible step 1/2 banner in ToolPanel
- Mate Problem B: call moveMateGroup on TransformControls 'change' event (continuous) not just 'dragging-changed' (start/end only)
- Deselect: add onClick handler directly on grid plane mesh (onPointerMissed alone insufficient since grid is a mesh that intercepts the raycast)
- New: spawn position finder using AABB overlap check to avoid stacking new boards at origin
- System 4: audit every orbitControlsEnabled=false call site; orbit must only disable during actual drag, never just because a tool is active
- System 5: full chain audit of Convert to Cross Cut button — verify anchorMemberId populated, verify ToolPanel condition, verify splitByCrossCut actually called
- System 6: add click-to-select + Delete-to-remove for centerline markers (selectedCenterlineId in UIState); verify dimension line select/edit/delete still works after render-as-child refactor

---

## Pepe Knowledge Base

- Estimated after Phase 14: ~1,553+ (no new entries added in Phase 14 — audit-only)
- Phase 15 added: 6 → estimated ~1,559+
- Target: 2,000–2,500

---

## Standing Technical Rules

- npm run build before every push
- git add src/ only
- Never touch Project.structural or make it nullable
- Always import * as THREE from 'three' inside R3F components
- Never rewrite working logic — only extend it
- Minimum text-base font everywhere
- Update TutorialPanel.tsx and pepeKnowledge.ts every phase
- **NEW RULE (learned Phase 14):** for any feature requiring an overlay/marker to follow a board's position/rotation, mount the renderer as a child of that board's mesh group and use LOCAL coordinates. Do not maintain separate world-space state with manual matrixWorld reconstruction — this pattern has repeatedly failed.

---

## Key Info

- Project root: C:\Projects\wood-cad-app\
- Claude Code: C:\Users\Joeyj\.local\bin\claude.exe
- Deployed: dovedesign.vercel.app
- Repo: joeyj123/DoveDesign (main branch)
- Stack: React + Vite + TypeScript + React Three Fiber + Zustand + Tailwind

## Starting a New Session

1. PowerShell → cd C:\Projects\wood-cad-app
2. C:\Users\Joeyj\.local\bin\claude.exe
3. Drop PHASE_N_PROMPT.md in project root → Claude Code runs automatically
