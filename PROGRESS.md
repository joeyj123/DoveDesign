# DoveDesign — Progress Tracker

> Drop this file in C:\Projects\wood-cad-app\ alongside CLAUDE.md, CAD_MANIFESTO.md, and the reference/ folder.
> Per CLAUDE.md's onboarding rules, this file is read automatically at the start of every session.

---

## Current Status

**Last completed phase:** Phase 18 ✅ — commit `08625dd` pushed, Vercel deploys automatically
**Next:** Joey stress tests Phase 18 (snap dots after unmate, dimension-line edge snapping on all faces, blank-canvas startup + save/recovery flow) → report findings → Phase 19 prompt

---

## Workflow

1. Joey gives fix ideas / stress test results (plain language + screenshots, per CAD_MANIFESTO.md Law 5)
2. Claude writes phase prompt — opens by directing Claude Code to read CAD_MANIFESTO.md, PROGRESS.md, reference/CAD_ENGINE_BLUEPRINT.ts (enforced via CLAUDE.md's runtime rules)
3. Joey drops PHASE_N_PROMPT.md into project root, runs Claude Code in auto mode
4. Claude Code outputs a summary — plain English first — Joey pastes it here
5. Claude reads output → writes stress test checklist
6. Joey stress tests → reports findings → back to step 1

---

## Required Project Files (read these every session)

| File | Purpose |
|---|---|
| `CLAUDE.md` | Session rules, onboarding criteria, architecture rules, file map |
| `CAD_MANIFESTO.md` | The 5 governing laws |
| `reference/CAD_ENGINE_BLUEPRINT.ts` | SolidBoard, Face, CADFeature, MateConstraint, DoveDesignEngine |
| `reference/VECTOR_PROJECTION_MATH.md` | Mandatory (u,v) ↔ local ↔ world coordinate math |
| `reference/RESOURCE_REFERENCES.md` | External CAD pattern references |
| `PROGRESS.md` | This file |
| `DOVEDESIGN_ROADMAP.md` | Long-term feature roadmap |

---

## Phase Log

| Phase | Status | Commit | Summary |
|-------|--------|--------|---------|
| 1–9 | ✅ | various | Core build through joinery visualization |
| 10 | ✅ | `efd5d29` | Clear Landscape, dim line edit, measure state machine, rotation axis lock, Save/Load, Templates |
| 11 | ✅ | `3ffc482` | Snap-to-grid live, zoom 0.5-500, Ctrl+Y redo, dim anchoring attempt, click-to-deselect attempt, BOM panel |
| 12 | ✅ | `f376ab1` | Grid levels, face normal offset, mate step UI attempt, centerline tool, material picker, finishing planner |
| 13 | ✅ | `224c829` | Work plane projection, rotation ring → TransformControls, mate groups scaffold, nav cube removed |
| 14 | ✅ | `b413b7a` | AUDIT FIXES: non-recursive raycasting fix, centerline mounted as mesh child, mate useEffect deps fix |
| 15 | ✅ | (unconfirmed hash) | Dim line edge/corner snap, face boundary clamp, dim line render-as-child, mate real-time grouping attempt, deselect via grid click, board spawn placement, zoom/pan audit, dim-to-cut fix, centerline/dim line edit+delete |
| **PIVOT** | — | — | CAD_MANIFESTO.md adopted after 15 phases of recurring breakage from world-space coordinate storage. New parametric/topological/constraint-based architecture established. |
| 16 | ✅ | `e9b4604` | Built `src/core/Engine.ts` (DoveDesignEngine + CADGeometryEngine). Wired `solveMateConstraints` into mate (translate) — boards now follow in real time, chains correctly. Wired dimension lines to face-relative `(u,v)` storage — length-wise lines confirmed following board correctly. Scoped DOWN from full 80-action rewrite to surgical fix at the two broken points; centerlines left untouched (already storing relationships correctly). |
| 17 | ✅ | `13e10ae` | Fixed mate-rotation deselect bug (gizmo drag-guard, not the constraint solver). Fixed cross-axis dimension line anchoring (snap point face-normal tagging). Full manifesto-compliance audit across existing tools. |
| 18 | ✅ | `08625dd` | FIX 1: `unmateBoard`/`unmateAll` were pruning `mateGroups`/`mateConstraints` but never `project.mates`/`project.fasteners` — left ghost `MateMarkers` (purple join-method spheres) and fastener icons rendering a severed connection after unmate. `SnapPointHandles.tsx` itself was already Law-1 compliant (fresh `useFrame`/`matrixWorld` derivation) — no change needed there. FIX 2: `MeasureTool.tsx`'s 26-candidate snap system (8 corners+12 edges+6 faces, shared for start/end) was already computing correctly for all faces post-Phase-17 — bumped `SNAP_RADIUS` 0.5"→1.0" (was below the VECTOR_PROJECTION_MATH.md-recommended range) and rewrote cursor color coding to the spec (green=face, blue=edge, bright yellow=corner, gray=free placement — corner previously shared blue with edge, no distinct free-placement color). FIX 3: persist `merge` no longer restores `project` into live state on startup (always blank `DEFAULT_PROJECT`) while `partialize` still writes `{project, savedAt, recentFiles}` in the background for crash recovery; added `RecoveryBanner.tsx` (Recover/Dismiss), `SaveNameModal.tsx` (Ctrl+S prompts for a name on first save via `saveProjectAs`, silent after), `UnsavedChangesGuard.tsx` (`beforeunload` when boards exist), and a Recent Projects list (last 3, in File menu) that opens the normal file picker. |

---

## Phase 16 Stress Test Results (informed Phase 17 scope)

**Confirmed working:**
- Mate translation following works correctly in real time, including chaining a third board
- Dimension lines parallel to board length follow correctly on move

**Confirmed broken:**
- Rotating a mated board deselects the entire group/entity instead of solving the constraint
- Dimension lines perpendicular to board length (cross-axis, e.g. width measurements) do NOT follow the board, and are also awkward to place

---

## Why The Pivot Happened (context for future sessions)

Across Phases 9–15, three systems were repeatedly "fixed" and repeatedly broke again: dimension lines, centerlines, and mate/join not following or grouping boards correctly. Root cause: storing world-space coordinates as source of truth and manually re-patching them on every board move — fundamentally fragile.

`CAD_MANIFESTO.md` was adopted to fix this permanently via 5 laws: Primacy of the Parameter, Topological Integrity, Self-Documentation, Developer Workflow (Vector Isolation / Breaking-Change Audit / One-and-Done), and Claude Owns Architecture (Joey is non-technical owner, Claude/Claude Code own all implementation, plain-English summaries always lead).

---

## Phase 16 — What Was Actually Built (scoped down from original plan)

- `src/core/Engine.ts` created with real `DoveDesignEngine` class
- `mateConstraints` added to project state; `solveMateConstraints` action replaces the old delta-copy `moveMateGroup` approach for translate
- `applyMate`, `removeMate`, `unmateAll`, `unmateBoard` updated to create/remove constraint records instead of one-time coordinate copies
- `TransformGizmo.tsx` wired to call `solveMateConstraints` on translate (rotate wiring incomplete/broken — Phase 17 Part 1)
- Dimension lines: measure tool and renderer updated to store/render via face-relative `(u,v)` — confirmed working for length-wise placement, broken for cross-axis (Phase 17 Part 2)
- Centerlines: left untouched, Phase 16 claimed they already store relationships correctly — Phase 17 Part 3 re-verifies this claim directly rather than taking it at face value
- **Deliberately NOT done:** full rewrite of all ~80 store actions through one central recalculation pipeline — scoped down as too risky for one session; engine called directly at the two points that needed it instead

---

## Phase 17 — What's Being Fixed/Verified (prompt written, not yet executed)

- PART 1: Trace and fix why rotating a mated board deselects instead of solving the constraint (likely: rotate handler never calls solveMateConstraints, or a stale deselect guard fires)
- PART 2: Trace and fix why cross-axis dimension lines don't follow (likely: face uAxis/vAxis only correctly defined for the length direction)
- PART 3: Full audit pass (not rewrite) across 14 other tools/features to catch any Phase 16 regressions — explicit focus on undo/redo and Save/Load correctly handling the new `mateConstraints` and `(u,v)` dimension line data, since pre-Phase-16 code may not know these fields exist

---

## Persistent Watch List (lower priority, untouched since pre-pivot, explicitly OUT OF SCOPE for Phase 17 unless found to be a Phase 16 regression)

- Radial wheel opens on every click
- Draw mode adds unintended boards on short clicks
- Camera orbit conflicts with box select

---

## Pepe Knowledge Base

- Estimated as of Phase 14: ~1,553+
- Phases 15–17: no new entries planned until rebuilt systems are fully verified stable
- Target: 2,000–2,500

---

## Standing Technical Rules

- npm run build before every push
- git add src/ only
- Never touch Project.structural or make it nullable
- Always import * as THREE from 'three' inside R3F components
- Never rewrite working logic — only extend it (except systems explicitly being migrated per CAD_MANIFESTO.md)
- Minimum text-base font everywhere
- Update TutorialPanel.tsx and pepeKnowledge.ts every phase (once rebuilt systems are stable)
- ALL CAD_MANIFESTO.md laws apply to every future phase, no exceptions
- IMPORTANT: Claude (chat) cannot remotely trigger or schedule Claude Code runs — Joey always runs phase prompts manually when ready

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
3. Per CLAUDE.md's runtime rules, Claude Code automatically reads CAD_MANIFESTO.md, PROGRESS.md, reference/CAD_ENGINE_BLUEPRINT.ts first
4. Drop PHASE_N_PROMPT.md in project root → Claude Code runs

---

## Phase 17 Stress Test Results (informed Phase 18 scope)

**Confirmed working:**
- 3-board rotation chain works — moving AND rotating any link in the chain moves the whole group correctly
- Unmate works, undo/redo of mate/unmate actions works
- Mated Group panel in Inspector shows correctly ("grouped with 2 other boards")
- Unmate This Board / Unmate All buttons work

**Confirmed broken (Phase 18 targets):**
- Snap dots (white spheres used to initiate mates) float behind at old position after unmating + moving a board — world-space storage bug, same category as the old dimension line bug
- Cross-axis (width) dimension lines still don't snap to edges — only way to measure a width precisely is to zoom in and eyeball it; both start and end point snap need to work on all faces/edges

**Save/Load UX rework (Phase 18):**
- Auto-restore from localStorage on startup is confusing — users expect a fresh start
- Better flow: blank canvas on open, before-unload prompt when closing with unsaved work, named save on Ctrl+S, recovery banner for crash protection only

## Phase 18 — What's Being Fixed

- FIX 1: Snap dots — rewrite position calculation to derive fresh from board's current world matrix every frame, using face-center (u,v) coordinates per VECTOR_PROJECTION_MATH.md. Never cache world-space position.
- FIX 2: Dimension line edge snapping — 26 snap candidates (8 corners + 12 edge midpoints + 6 face centers) computed every frame for every hovered board; shared snap function for start AND end point; color-coded feedback (green=face center, blue=edge midpoint, yellow=corner); free placement still works between snap candidates
- FIX 3: Save/load UX — blank canvas on startup; before-unload browser dialog when closing with unsaved work; named Ctrl+S save; crash-recovery banner (not auto-restore) for localStorage backup

## Phase 18 — What Was Actually Found &amp; Built

- FIX 1 root cause was NOT in `SnapPointHandles.tsx` (the interactive white mate dots) — that
  file already derived dot position fresh every frame from `meshRef.current.matrixWorld`, fully
  Law-1 compliant since Phase 12. The actual "leftover connection" bug traced to `store.ts`:
  `unmateBoard`/`unmateAll` (used by the ToolPanel "Unmate This Board"/"Unmate All" buttons)
  correctly pruned `mateGroups` and `mateConstraints`, but never pruned the legacy
  `project.mates` array or `project.fasteners` — so `MateMarkers()` (the purple join-method
  sphere in `FastenerMeshes.tsx`) and any placed screw/nail/dowel icons kept rendering a
  connection that had already been severed. Fixed by mirroring `removeMate()`'s existing
  cleanup pattern into both functions.
- FIX 2: the 26-candidate snap system in `MeasureTool.tsx` (corners/edges/faces, shared
  function for start+end, per-face local-normal tagging from the Phase 17 fix) was already
  structurally correct for every face including width edges. What was actually missing:
  `SNAP_RADIUS` was 0.5" (below `VECTOR_PROJECTION_MATH.md`'s recommended 1.0–1.5" range),
  making it easy to miss an edge; bumped to 1.0". Color feedback didn't match the requested
  spec — corners shared blue with edges and there was no distinct "not snapped" color;
  rewrote to green=face / blue=edge / bright yellow=corner / gray=free placement, identical
  for both the start and end point.
- FIX 3: `persist`'s `merge` in `store.ts` now always returns `DEFAULT_PROJECT` for live state
  on startup instead of applying the persisted blob — `partialize` still writes
  `{project, savedAt, recentFiles}` to localStorage on every change, so the crash-recovery
  backup keeps working in the background. Added `RecoveryBanner.tsx`, `SaveNameModal.tsx`
  (wired through new `saveProjectAs(name)` store action), `UnsavedChangesGuard.tsx`
  (`beforeunload`), and a `recentFiles` list (last 3, deduped by name) surfaced in
  SystemRibbon's File menu.
- `npm run build` clean, zero TypeScript errors.
