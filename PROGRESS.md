# DoveDesign — Progress Tracker

> Drop this file in C:\Projects\wood-cad-app\ alongside CLAUDE.md, CAD_MANIFESTO.md, and the reference/ folder.
> Per CLAUDE.md's onboarding rules, this file is read automatically at the start of every session.

---

## Current Status

**Last completed phase:** Phase 16 ✅ (scoped — see "Phase 16 status" note in CLAUDE.md and below)
**MAJOR PROJECT SHIFT:** After Phase 15, the project adopted CAD_MANIFESTO.md — a permanent set of architectural laws — after 15 phases of recurring bugs (dimension lines, centerlines, mate joints not following boards) caused by storing world-space coordinates as source of truth instead of deriving positions from parameters.
**Phase 16:** ✅ Complete (scoped). Built `src/core/Engine.ts` (`DoveDesignEngine` + `CADGeometryEngine`, no stub methods, zero three.js dependency). Re-wired mate to real `MateConstraint` solving (real-time during drag, translate + rotate). Re-wired dimension lines to store `(faceId, u, v)` alongside the legacy local-space fields, rendered via fresh inverse projection. Centerlines were left alone — already parametric, already compliant. Did NOT route all ~80 store actions through a single `updateWorkspaceState()` call (too large a blast radius for one phase); the engine's pure functions are called directly at the points that needed them instead.
**Next after Phase 16:** Joey stress-tests mate (drag two mated boards, rotate one, unmate) and the measure tool (place a free-placement dimension line, move/rotate the board, edit drag, delete) → report findings → Phase 17 plan

---

## Workflow (still applies, now with manifesto compliance added)

1. Joey gives fix ideas / stress test results (plain language + screenshots, per Law 5)
2. Claude writes phase prompt — now must open by directing Claude Code to read CAD_MANIFESTO.md, PROGRESS.md, reference/CAD_ENGINE_BLUEPRINT.ts (enforced automatically via CLAUDE.md's runtime rules)
3. Joey drops PHASE_N_PROMPT.md into project root, runs Claude Code in auto mode
4. Claude Code outputs a summary — PLAIN ENGLISH FIRST per Law 5 — Joey pastes it here
5. Claude reads output → writes stress test checklist
6. Joey stress tests → reports findings → back to step 1

---

## Required Project Files (read these every session)

| File | Purpose |
|---|---|
| `CLAUDE.md` | Session rules, onboarding criteria, architecture rules, file map |
| `CAD_MANIFESTO.md` | The 5 governing laws — Parameter Primacy, Topological Integrity, Self-Documentation, Developer Workflow, Claude Owns Architecture |
| `reference/CAD_ENGINE_BLUEPRINT.ts` | Concrete TypeScript shape: SolidBoard, Face, CADFeature, MateConstraint, DoveDesignEngine |
| `reference/VECTOR_PROJECTION_MATH.md` | Mandatory (u,v) ↔ local ↔ world coordinate math |
| `reference/RESOURCE_REFERENCES.md` | External CAD pattern references (SolveSpace, STEP, DXF) |
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
| 14 | ✅ | `b413b7a` | AUDIT FIXES: non-recursive raycasting fix, centerline mounted as mesh child (FIRST FULL FIX), mate useEffect deps fix |
| 15 | ✅ | (pending — see note) | Dim line edge/corner snap both points, face boundary clamp, dim line render-as-child, mate real-time grouping, deselect via grid click, board spawn placement, zoom/pan always-on audit, dim-to-cut fix, centerline/dim line edit+delete |
| **PIVOT** | — | — | **CAD_MANIFESTO.md adopted.** 15 phases of incremental patching on world-space coordinates produced recurring breakage. New approach: parametric, topological, constraint-based architecture per the manifesto's 5 laws. |
| 16 | ✅ | (pending — see note) | **ARCHITECTURE MIGRATION (scoped).** Built `src/core/Engine.ts` (DoveDesignEngine + CADGeometryEngine, real math, no stubs). `migrateWoodMemberToSolidBoard()` for on-demand conversion. Mate rewired onto real `MateConstraint` graph solved every drag frame (translate + rotate), replacing the old delta-copy approach. Dimension lines now store `(anchorFaceId, startUV, endUV)`, rendered via fresh inverse projection. Centerlines left as-is (already compliant). Full `updateWorkspaceState()` centralization across all store actions deferred — not done this phase. |
| 17 | ⬜ | — | TBD based on Phase 16 stress-test results (mate drag/rotate/unmate, dimension line free-placement/edit/delete) |

---

## Phase 15 Note

Phase 15's Claude Code output was not yet pasted back into this chat before the architectural pivot occurred. If Phase 15 was run and pushed, record its actual commit hash here once confirmed. If Phase 16 supersedes unfinished Phase 15 work (e.g., dimension line fixes), that's expected — Phase 16 rebuilds these systems from scratch on the new foundation rather than patching the old one.

---

## Why The Pivot Happened (context for future sessions)

Across Phases 9–15, three systems were repeatedly "fixed" and repeatedly broke again:
1. Dimension lines not following their board when moved
2. Centerline markers not following their board when moved (fixed once in Phase 14 by accident — mounting as a mesh child — but not formalized into a general pattern)
3. Mate/join not creating boards that move together as a real group

Root cause identified: every one of these stored a **world-space coordinate** as the source of truth, then tried to manually re-patch that coordinate whenever the board moved. This is fundamentally fragile — exactly the failure mode real CAD systems avoid by using parametric, face-relative, constraint-solved architecture instead of raw coordinates.

`CAD_MANIFESTO.md` was adopted to permanently prevent this failure mode. Its 5 laws:
1. **Primacy of the Parameter** — nothing is ever stored as a raw output; everything is derived fresh from parameters
2. **Topological Integrity** — solids are Faces/Wires/Edges, not vertex soup; features and joints are declarative data evaluated onto topology, never baked into a mesh directly
3. **Self-Documentation** — every new tool requires a written Data Flow Pipeline before code, including an explicit "does this follow the board automatically" check
4. **Developer Workflow** — Vector Isolation Rule, Breaking-Change Audit, One-and-Done Protocol (no recursive quick-patch looping)
5. **Claude Owns Architecture** — Joey is a non-technical owner; Claude/Claude Code own 100% of implementation decisions; summaries must lead with plain English

---

## Phase 16 — What's Being Built

- `src/core/Engine.ts` — full implementation of `DoveDesignEngine` + `CADGeometryEngine`, no stub methods
- Migration path from `WoodMember` (old) to `SolidBoard` (new), without breaking existing `.wcad` save format yet
- Dimension lines rebuilt on `FaceAnnotation { parentSolidId, parentFaceId, startUV, endUV }` — zero world-space storage
- Centerlines rebuilt on the same `FaceAnnotation` pattern (formalizing what worked accidentally in Phase 14)
- Mate/join rebuilt as `MateConstraint` records, solved fresh every `updateWorkspaceState()` pass — this is what should finally make mated boards move together in real time, by construction rather than by special-cased delta-propagation code
- Free placement (any point on any face, not snap-only) for dimension lines, with soft-snap as an assist layer only
- Explicit verification step for all three systems before the phase is considered done

---

## Persistent Watch List (carried from pre-pivot phases — may be resolved by Phase 16's rebuild)

- Radial wheel opens on every click (CLAUDE.md item 2 — not yet fixed, lower priority)
- Draw mode adds unintended boards on short clicks (CLAUDE.md item 4 — not yet fixed, lower priority)
- Camera orbit conflicts with box select (CLAUDE.md item 5 — not yet fixed, lower priority)

---

## Pepe Knowledge Base

- Estimated as of Phase 14: ~1,553+
- Phase 15/16: no new entries planned until the rebuilt systems are verified and worth documenting accurately (no point documenting behavior that's about to be rebuilt)
- Target: 2,000–2,500

---

## Standing Technical Rules

- npm run build before every push
- git add src/ only
- Never touch Project.structural or make it nullable
- Always import * as THREE from 'three' inside R3F components
- Never rewrite working logic — only extend it (EXCEPT systems explicitly being migrated per CAD_MANIFESTO.md — see CLAUDE.md Rule 7 exception)
- Minimum text-base font everywhere
- Update TutorialPanel.tsx and pepeKnowledge.ts every phase (once rebuilt systems are stable)
- ALL CAD_MANIFESTO.md laws apply to every future phase, no exceptions

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
3. Per CLAUDE.md's runtime rules, Claude Code will automatically read CAD_MANIFESTO.md, PROGRESS.md, and reference/CAD_ENGINE_BLUEPRINT.ts before doing anything else
4. Drop PHASE_N_PROMPT.md in project root → Claude Code runs
