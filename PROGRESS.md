# DoveDesign — Progress Tracker

> Drop this file in C:\Projects\wood-cad-app\ alongside CLAUDE.md, CAD_MANIFESTO.md, and the reference/ folder.
> Per CLAUDE.md's onboarding rules, this file is read automatically at the start of every session.

---

## Current Status

**Last completed phase:** Phase 17 ✅ — built, not yet committed/pushed (Joey reviews diff first per this phase's instructions)
**Next:** Joey reviews the Phase 17 changes, commits/pushes, then stress tests mate rotation + cross-axis dimension lines in the browser

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
| 17 | ✅ built, awaiting commit | — | Fixed mate-rotation deselect bug (root cause: drei's TransformControls never calls stopPropagation, so R3F's onPointerMissed could fire on the same pointerup that ends a rotate-ring drag — fixed with a short suppression guard, src/lib/gizmoDragGuard.ts). Fixed cross-axis dimension lines not following (root cause: MeasureTool's snap system could relocate a click onto a different face than the stale raycast-captured work-plane normal — fixed by tagging snap candidates with their real face normal). Full Part 3 audit of 14 other tools/features completed — all verified working, no regressions found, save/load and undo/redo confirmed to already correctly persist mateConstraints and (u,v) dimension line fields. |
| 18 | ⬜ | — | TBD — Joey to stress test Phase 17 fixes, report back |

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

## Phase 17 — What Was Actually Fixed/Verified

- PART 1 (FIXED): Rotating a mated board was deselecting the group. NOT a constraint-solver
  bug — `solveMateConstraints` was already wired correctly for rotate (same as translate).
  Real cause: drei's TransformControls attaches raw DOM pointer listeners to the canvas and
  never calls `stopPropagation()`, so R3F's own native pointerup raycast can also fire
  `onPointerMissed` in the same event cycle. Translate's arrow handles sit against the
  board mesh so this rarely triggered; rotate's ring handles are frequently released in
  empty space, so it triggered often. Fixed with a short (250ms) suppression guard
  (`src/lib/gizmoDragGuard.ts`) armed the instant a gizmo drag ends, consumed by
  `Viewport.tsx`'s `onPointerMissed` and the floor mesh's deselect `onClick`.
- PART 2 (FIXED): Cross-axis (width) dimension lines weren't following the board. NOT a
  face-topology or projection-math bug — `Engine.ts`'s `uAxis`/`vAxis` were already
  correctly defined for all 6 faces, and the forward/inverse `(u,v)` projection was already
  correct. Real cause: `MeasureTool.tsx`'s snap system could relocate a click onto a
  corner/edge belonging to a different face than the stale raycast-derived work-plane
  normal (very likely for a narrow width measurement, since the snap radius easily reaches
  an edge), silently anchoring the line's `(faceId, u, v)` data to the wrong face. Fixed by
  tagging every snap candidate with the real local-space normal of the face it belongs to,
  and updating the work-plane normal from that tag when a snap overrides the click.
- PART 3 (AUDIT COMPLETE): All 14 other tools/features verified — no regressions found.
  Save/load (`src/lib/wcad.ts` + `migrateProject`) and undo/redo (`commitProject`'s
  full-object `past`/`future` snapshots) both already correctly persist/restore
  `mateConstraints` and the `(u,v)` dimension line fields, since both systems snapshot
  the entire `Project` object rather than touching individual fields.

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
