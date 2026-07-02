# DoveDesign — Progress Tracker

> Drop this file in C:\Projects\wood-cad-app\ alongside CLAUDE.md, CAD_MANIFESTO.md, and the reference/ folder.
> Per CLAUDE.md's onboarding rules, this file is read automatically at the start of every session.

---

## Current Status

**Last completed phase:** Phase 20 ✅ — 3-Mode UX overhaul (Model/Assembly/Detail) + real geometric joinery + File→Open fix + cross-axis dimension snap fix + Pepe confidence gating
**Next:** Joey stress tests Phase 20 → report findings → Phase 21 prompt

---

## Standalone Upgrades (not tied to phase numbering)

### UI Polish — Right Sidebar + Left Toolbar (2026-07-01)

Pure visual pass, no reference image available — worked from a written current-state
description instead. CSS/className/JSX-attribute changes only across
`RightSidebar.tsx`, `LeftToolPanel.tsx`, and `SystemRibbon.tsx`. Zero state, hooks,
Three.js/canvas, click-handler, or store logic touched (confirmed via `git diff` before
committing — every changed line is a `className` string, plus two new `title`/
`aria-label` attributes).

- **Right sidebar tabs:** the 7 tabs (Inspector/Estimating/Cut List/Optimizer/
  Engineering/Hardware/Tutorial) previously wrapped onto 2 rows inside the 384px-wide
  sidebar. Changed the row to `flex-nowrap` with `truncate` labels so all 7 now fit on
  one row — long labels (e.g. "Engineering") ellipsis-truncate visually but keep their
  full name accessible via a new `title` tooltip and `aria-label` (screen readers still
  announce "Engineering", not "Engin…"). Active-tab styling changed from a background
  fill + underline combo to text-color + underline only, per the "orange as indicator
  only" ask; text bumped from `font-medium` to `font-semibold` at the existing `text-xs`
  (this `text-xs` on tab labels was an explicitly pre-approved exception to the
  project's `text-base` minimum, same category as the radial wheel).
- **Left tool menu:** the selected tool button (e.g. "Select") was a flat, square-cornered
  orange fill block. Added `rounded` (4px) plus tightened/evened padding (`px-2.5 py-1.5`,
  `my-0.5` between buttons, `px-1.5` inset on the list container) so it reads as a docked
  button rather than a raw highlight — no change to which element renders as "active"
  or how selection is triggered.
- **Panel/viewport separation:** the three borders that separate the left tool panel,
  right sidebar, and top ribbon from the 3D viewport were switched from `border-zinc-800`
  to `border-neutral-800` for a crisper edge, exactly as requested. Left everything else
  (internal tab dividers, section borders within each panel) on the existing `zinc`
  palette — only the panel/viewport seams changed, to avoid introducing a second gray
  palette throughout the app.
- Verified in the running dev server: tab bar now fits in one row down to 1100px wide,
  clicking each right-sidebar tab still switches panels correctly, clicking each left
  tool button still switches tools and still auto-flips the right sidebar to Inspector
  (pre-existing `pickTool()` behavior, unaffected by this pass) — confirmed via
  screenshot and accessibility snapshot, not just visual inspection.
- `npm run build` clean, zero TypeScript errors. No functional/state impact.

### Pepe Pillars — Deep Content Audit & Expansion v2 (2026-07-01)

Content-only pass per `PEPE_PILLARS_PROMPT_V2.md` covering four woodworking
knowledge pillars (wood science, cut dynamics, surface prep, joinery/fasteners).
No geometry/solver/topology code touched. Confirmed real schema first
(`KnowledgeEntry { id, keywords, topic, answer }` in `src/lib/pepeKnowledge.ts`
— the prompt's own attached draft used a different, incompatible
`keywords/category/title/content` shape and was not usable as-is).

**Audit finding:** the real knowledge base was already far deeper than the
prompt's draft assumed. Direct reads (not just ID/keyword matching) confirmed
Janka hardness, wood movement math, blade kerf cumulative-loss math, crosscut
vs. rip tooth geometry (ATB/FTG), and kickback/riving-knife mechanics were all
already SOLID, mechanism-level entries — not missing or shallow as the
prompt's audit table claimed. Copying the draft's duplicate content for those
topics would have bloated the KB with near-identical answers, so it was
skipped in favor of only filling genuine gaps, found by direct-reading actual
entry content rather than trusting ID/file existence:
- Grain orientation had only a thin 2-sentence entry with no link to why
  certain joints (mortise/tenon, dovetails) are chosen over butt joints —
  deepened `grain-direction` in `pepeKnowledge.ts` in place.
- The jointer→edge-jointer→planer→table-saw squaring sequence already existed
  (`mq-measure-squaring-stock`) but didn't explain *why* the order matters
  (each step depends on the flat/square reference the previous step made) —
  enriched that entry in place rather than adding a duplicate.
- Genuinely missing: the roller spring-back mechanism explaining why a planer
  alone can't fix a warped/cupped board; chisel bevel-down (chopping) vs
  bevel-up (paring) wedge mechanics and grain-reading to avoid splitting;
  fastener embedment-depth scaling balanced against splitting risk (advisory
  "commonly cited" framing, not a hard formula); and a single side-by-side
  PVA/epoxy/hide-glue chemistry comparison (polymer film vs. thermoset
  reaction vs. reversible collagen bond) — added as 4 new entries to
  `src/lib/pepeKnowledgeMasterW.ts`.
- Applied the prompt's precision-number fix throughout: no invented exact
  coefficients (e.g. no fabricated tangential-expansion decimal) — ballpark/
  rule-of-thumb framing only for anything not independently verifiable.
- Net +5 entries (one draft duplicate was caught and removed after a broader
  re-check, then merged into the existing entry instead). Total entry count:
  1,884 (was ~1,879).
- Verified in the running dev server (not just `npm run build`): confirmed
  the new adhesive-comparison entry surfaces correctly for a realistic query,
  and confirmed via the built bundle that all 4 new entries' text ships in
  `dist/assets/pepeKnowledge-*.js`. Two test queries for the new chisel entry
  hit an unrelated existing entry instead — this is the same lexical
  keyword-overlap ranking behavior already noted as a known limitation in the
  FlexSearch Expansion Pack entry below, not a defect introduced by this pass.
- `npm run build` clean, zero TypeScript errors.

### Pepe Expansion Pack — FlexSearch matching + Personal Notebook (2026-07-01)

Two independent, cleanly-separable upgrades to Pepe, built per
`PEPE_EXPANSION_PACK_PROMPT.md`. UI + local-storage + search-indexing only —
no geometry/solver/topology code touched.

**Part A — FlexSearch concept matching (`src/lib/pepeSearch.ts`):**
Replaced the Fuse.js-based matcher in `PepeAssistant.tsx` with a FlexSearch
`Index` per field (keywords/topic/answer), plus a hand-rolled Levenshtein
typo-correction pass over the KB's own vocabulary (no prior Levenshtein logic
existed to preserve — this is new). 100% client-side, `fuse.js` dependency
removed. Filler words (how/what/is/the/a/...) are stripped before matching.
**Bug found and fixed during verification:** joining all cleaned query words
into a single FlexSearch query string returns zero results the moment any one
word isn't present in a candidate document, because FlexSearch treats a
multi-word query as requiring ALL words (AND), not a ranked union — the
opposite of Fuse's old behavior. Fixed by searching each word individually
and summing rank-weighted scores across words and fields, with a small bonus
for a full contiguous-phrase match on top. Verified in the running dev
server: realistic loose queries ("what's the point of a push stick anyway",
"whats a good glue for outdoor stuff") return the right entry or a
same-topic near-miss; this is honestly still lexical/keyword overlap, not
comprehension — it does not invent answers or reason across entries.

**Part B — Personal Notebook (`src/lib/pepeNotebookDb.ts`, IndexedDB):**
New "Notebook" tab in Pepe's Workshop panel (`pepeTab` type extended to
include `'notebook'` in `src/types.ts`). `+ Add Custom Note` saves free text
instantly to IndexedDB (db `dovedesign-pepe-notebook`). When Pepe answers a
question, `findRelevantNotes()` blends in any note whose words overlap the
query or the matched entry's topic/keywords, rendered in a separate
"📓 From your notebook" block — never merged into or mutating the core KB
entry itself. If no core KB match exists but a note is relevant, the note is
shown instead of the flat "not sure" message. **Data-safety requirement
(not optional):** Export Notebook downloads all notes as
`pepe-notebook-YYYY-MM-DD.json` (same Blob/anchor pattern as `.wcad` saves);
Import Notebook merges a previously exported file back in, skipping any note
whose text already exists (case-insensitive, trimmed compare) so importing
the same backup twice is safe. UI text next to the Teach control states
plainly that notes are saved locally in the browser only and are not backed
up anywhere.

Verified end-to-end in the running dev server (not just `npm run build`):
loose/typo-tolerant query test, teach-a-note-then-search-immediately test,
and a full export→re-import→mixed-import round trip (confirmed
added/skipped counts and no duplicate notes). `npm run build` clean, zero
TypeScript errors.

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
| 20 | ✅ | (pending push) | 3-MODE UX OVERHAUL + Phase 19 stress-test fixes. (1) Workspace consolidated into Model/Assembly/Detail modes: top-center `ModeSwitcher.tsx`, one legality map (`lib/workspaceModes.ts` MODE_TOOLS/MODE_PANEL_TABS) filters `LeftToolPanel` + `RightSidebar`; mode-follows-tool in `setActiveTool` (pressing J anywhere jumps to Assembly+Mate); keys 1/2/3 switch modes; persistent bottom `HintBar.tsx` (mode · tool · next action) replaces the three per-tool floating hints; new `PendingInteraction` union in ui state stores every half-finished multi-click pick as memberId+faceId+(u,v) — Law 1, orbit/board-move can never stale it; `cancelActiveAction` implements the ONE Esc rule (first Esc cancels action keeping selection, second deselects); `CanvasErrorBoundary.tsx` gives a recoverable "Reset view" panel instead of a blank canvas. (2) REAL JOINERY: new `WoodJoint` project entity + pure `src/core/JointFeatures.ts` (three-free) — B-side forming cuts (waste-between-tails/tenon shoulders) in B-local space, A-side receiving cuts = the B-occupied solids transformed into A-local via qA⁻¹·qB derived fresh from both boards' CURRENT placements every render; new `taperPrism` CSG geometry renders true trapezoid dovetail tails (old rotated-box "dovetail" in joinery.ts also fixed); `applyWoodJoint` seats board B via computeMateTransform + embed and creates WoodJoint+MemberMate+MateConstraint+group in ONE commitProject (verified: single undo reverts all five record types + position atomically); `Engine.ts` faceWorldCenter extended so constraint offset.z embeds along the face normal (pre-existing constraints stored z:0 — unchanged); Connections palette (`ConnectionsPanel.tsx`, Detail mode) unifies wood joinery + hardware fasteners in one pick flow; unmate/delete/split/clearAll all prune woodJoints (and clearAllMembers now also clears mateGroups/mateConstraints/assemblySteps — pre-existing orphan gap). (3) FILE→OPEN FIX: one shared `restoreProject()` used by BOTH File→Open and the recovery banner — hardened `migrateProject` defaults every serialized field, full UI-state reset, try/catch with plain-English alert; verified Test.wcad loads end-to-end (note: its boards were saved ~60" above the origin, off-camera — part of why it looked like "nothing loaded"). (4) CROSS-AXIS DIMENSION SNAP root causes found by trace: snap candidates were 26 DISCRETE points (edge MIDPOINTS only — a width click along a 96" board's long edge had no candidate in radius), and MeasureTool.tsx overwrote the raycast-derived anchor member with `undefined` on every non-snapped click → free-placement lines stored NO anchor → world-static. Fixed: edges are now true segments (closest-point-on-edge, corners win inside 0.75"), and the anchor member survives free placement. (5) TRIM/EXTEND strict 2-click flow: click target face (teal highlight + hint-bar label) → click board to adjust; new pure `snapLengthToFacePlane()` intersects the board's length axis with the face plane (trims OR extends in one op, one undo step). (6) ASSEMBLY CAMERA: right=orbit/middle=pan always live in Assembly mode, LEFT reserved for picking; floor-click + context-menu guards so a mid-mate anchor survives everything except Esc/completion; snap dots now computed from the rip-cut KEPT region (old math assumed centered, floating dots over removed waste). (7) PEPE GATING: `searchKnowledgeGated` — confidence requires min score + exact-vocabulary coverage of non-generic query words ("what toothpaste should i use" and garbage now decline with a fixed fallback; verified 13 query spectrum in dev server); all "Phase N" prefixes removed from user-facing KB answers; +8 new entries (modes, trim/extend, connections, dovetail, Esc rule, assembly camera). TutorialPanel: new 3-Modes / Trim-Extend / Connections sections, shortcuts updated. NOTE for future phase: SystemRibbon's old "Mode: Design/Assembly" dropdown is the separate explode-view feature — consider renaming to avoid confusion with workspace modes. Lap joint is v1-simplified (half-depth seat, footprint = inserted board's cross-section). |
| 19 | ✅ | `d4babc5` | Sourced from the read-only `AUDIT_PHASE18_ROLLUP.md` rolling audit (Phase 18's own browser stress test was never run before this phase started). FIX 1 (high priority): `FastenerPlacementTool.tsx` baked a world-space `position`/`rotation` onto every screw/nail/dowel/biscuit/bracket icon at placement time — moving or rotating either mated board afterward left the icon frozen in its old spot (Law 1 violation, same bug class already fixed for mate markers in Phase 18 and dimension lines in Phase 16-17, but never applied to this component). Fixed by changing `Fastener` (`types.ts`) to store `memberId`/`faceId`/`offset` instead, added `getFaceAlignedPlacement()` to `mating.ts` (pure, derives position+rotation fresh from the member's CURRENT transform), and updated `FastenerMeshes.tsx` + `FastenerInfoPanel.tsx` to call it every render instead of trusting a stored value. Legacy `position`/`rotation` kept as optional fallback fields for fasteners saved before this migration (same precedent as `DimensionLine`'s `localStart`/`localEnd` fallback). FIX 2 (medium priority): `removeMember`/`splitMemberByCrossCut`/`splitMemberByRipCut` already pruned `mates`/`fasteners` but never `mateConstraints`/`mateGroups`/`dimensionLines` — mirrored Phase 18's `unmateBoard` cleanup pattern into all three. Verified via an isolated pure-function test (`getFaceAlignedPlacement` recomputes correctly when a member's position/rotation changes) and via a temporary debug hook exercising the real store in the running dev server (set up a mate+constraint+group+fastener+dimension-line scenario, confirmed `removeMember` and `splitMemberByCrossCut` prune all five record types, confirmed `undo` restores all five atomically); debug hook removed before commit. Confirmed Phase 18's `unmateBoard` cleanup still holds (now also correctly handles Phase-19-shaped fasteners). Phase 18 Fixes 2/3 (dimension snap/colors, save-load UX) untouched this phase — different files, unaffected. |

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
- Baseline before Mastery Expansion pass (2026-07-01): 1,621 entries (confirmed by count)
- **Mastery Expansion pass (2026-07-01):** +256 entries → **1,877 total**. Added 9 new
  files (`pepeKnowledgeMasterO.ts` through `pepeKnowledgeMasterW.ts`), same
  `KnowledgeEntry { id, topic, keywords, answer }` schema as existing master files,
  wired into `PEPE_KNOWLEDGE` in `pepeKnowledge.ts`. Content-only pass — no changes to
  `src/core`, geometry, or the search/fuzzy-matching layer itself.
  - Real-world woodworking fundamentals: ~25 wood species (hardwoods, softwoods,
    figured/specialty like curly/quilted maple, spalted wood, burl), sheet goods
    (Baltic birch, MDF, particleboard, OSB, veneer), joinery types (mortise & tenon,
    dovetail, box joint, biscuit, pocket screw, dowel, lap, dado, rabbet, groove,
    spline, floating tenon/Domino), fasteners & glue (PVA, epoxy, hide glue, hinges,
    drawer slides, threaded inserts, cam locks), finishing (stain, poly, lacquer,
    shellac, oil finishes, food-safe, dye vs pigment, gel stain, toner/glaze, French
    polish, milk/chalk paint), measuring/layout (board feet, kerf, squaring stock,
    story sticks/poles, nominal vs actual lumber), safety (kickback, push sticks,
    dust/respiratory, router/bandsaw/jointer-planer specifics, oily rag combustion,
    electrical), tool basics (hand tools, sharpening, chisel/saw/plane types, router/
    bandsaw/jointer/planer/drill press/sander basics), wood movement (why it happens,
    breadboard ends, slotted holes, floating panels, acclimation), and project-type/
    shop-setup guidance (tabletops, chairs, cabinets, drawers, shelving, cutting
    boards, bent lamination, veneering, workbench/dust collection/shop layout).
  - DoveDesign-specific tool depth: cross-reference entries connecting Draw → Mate →
    Fastener → BOM workflows, Mate/Unmate/Snap Points internals, Measure tool snap
    colors, Save/Load/Recovery UX (Phase 18), Engineering/Estimating panel meaning,
    Quick-Join toolbar, Workbench Blueprint, Hardware Library specifics (casters,
    shelf pins, table legs).
  - Category C (concept mapping): plain-English "why it works this way" entries
    tying Mate→clamping, Dimension Line→tape measure, Cut Optimizer→cut-list planning,
    Centerline→marking gauge, parametric/constraint architecture→plain English.
  - Verified end-to-end in the running dev server (not just `npm run build`): opened
    Pepe's Ask tab, confirmed a brand-new entry (`mo-species-wenge`) surfaces correctly
    for a real query.
  - Thinnest areas flagged for a future pass: hardware library depth beyond the few
    items covered, and B-category coverage for Assembly Mode / Edge Treatments / Shapes
    tools specifically (existing baseline coverage there was already adequate so this
    pass prioritized breadth elsewhere per the phase prompt's instruction).
- Target: 2,000–2,500 (now at 1,877; ~123–623 entries short depending on which end of
  the range — worth another expansion pass before calling this fully done)
- **Pillars v2 pass (2026-07-01):** +5 net entries (deepened 2 existing entries
  in place, added 4 new to `pepeKnowledgeMasterW.ts`, caught and removed 1
  duplicate found during a broader re-check) → **1,884 total**. Content-only,
  scoped to wood science / cut dynamics / surface prep / joinery pillars — see
  Standalone Upgrades section above for detail. Still short of the 2,000–2,500
  target; a future pass could push further into router-bit, hand-plane, and
  finishing-chemistry depth without duplicating the already-solid coverage.
- **Phase 19:** +1 entry (`fasteners-follow-board`, documenting the fastener-follows-
  the-board fix) → **1,885 total**.

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
