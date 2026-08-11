# DoveDesign — Progress

## 2026-07-31 — Workflow change
Joey started working directly with Claude (chat) in-session to implement
changes, instead of writing NEW_ORDER_N_PROMPT.md files for a separate
Claude Code run — consolidating the two modes into one working session.
Standing rules for this mode: quality code, token conservation, minimal
output (bare minimum to understand session state), status updates every
~5 min on longer tasks, report and pivot rather than grind on stuck issues.
First changes made this way: exposed the pre-existing (never wired up since
the Samson reset) Save/Open/New project-file actions and crash-recovery
banner from `store.ts`, via a new top-center `TopMenuBar.tsx` "File" menu
(Windows-style menu bar, distinct from the left tool rail — these are
project-level actions, not tools). `npm run build` clean, 0 TypeScript
errors; verified live via the Browser preview (File menu opens, New
clears cleanly, no console errors) — Save/Open trigger native browser
dialogs (name prompt, file picker) unverifiable by headless click, needs
Joey's real-mouse pass.

Follow-up same day, per Joey's feedback that the floating rail/panel with
gaps against the window edges looked disconnected once the File menu was
added: `TopMenuBar.tsx` changed from a floating centered pill to a
full-width bar flush against the top edge; `ToolRail.tsx`/
`PropertiesPanel.tsx` changed from floating rounded cards (`top-4 left-4
bottom-4` etc.) to flush-docked panels starting just below the bar, no
gaps against any window edge. Confirmed via `getBoundingClientRect()` in
the Browser preview (screenshot capture unavailable in this environment,
same longstanding limitation) — bar spans the full window width, rail
sits flush left/bottom, panel flush right/bottom, all starting at y=40
just below the bar.

Also added: Delete/Backspace as a Model-space keyboard shortcut to remove
the selected board(s) — this was the last unbuilt item from the roadmap's
"Remaining" list's original Select/Delete pair. New `removeMembers(ids)`
store action (mirrors `removeMember`'s full cleanup — mates, fasteners,
attachment points, mateGroups/mateConstraints, dimension/reference lines,
wood joints — but batches all ids into ONE `commitProject` call) so
deleting a multi-selection is one undo step, not N, matching the
`moveMembers` precedent for group operations. Verified live: placed a
board via Insert (auto-selected), pressed Delete (Entities count 1 -> 0,
no console errors), Ctrl+Z restored it (Entities back to 1), a second
Ctrl+Z removed the test board again to leave a clean canvas.

Third feature same day: **Mate/Align tool**, built on `store.ts`'s
pre-existing `applyMate` engine (full constraint solver + mateGroups
bookkeeping, pre-reset code preserved through the Samson Option, never
given a UI). New rail tool (shortcut J, matching a shortcut letter already
referenced in a preserved code comment from the old app) — click a face on
one board (orange highlight), then a face on a different board (spruce
highlight), then "Create Mate" in the new `MatePanel.tsx`. Face-picking
reuses `boardFaceMath.ts`'s existing `getMemberFaces`/`resolveFaceClick`
(same math Dimension/Reference Line already use) plus a newly-exported
`faceCorners3D` driving a new `FaceHighlight` quad component in
`BoardMesh.tsx`. Scoped to rectangular box faces only — matches the
existing `StandardFaceId` type, which never covered Template-extruded
custom-polygon faces. `setActiveTool` now clears mate picks when leaving
the tool, same pattern as measure/referenceLine drafts. Verified via a
temporary `window.__store` debug hook (removed before the final build):
two boards placed 20" apart, picked Face A (zMax)/Face B (zMin),
`applyMate()` moved board B to sit exactly flush (z 20 -> 3.5, the sum of
both boards' half-widths — correct), one Ctrl+Z fully undid it, and
`removeMembers` cleaned up both test boards. `npm run build` clean, 0
TypeScript errors. Real-mouse click-on-face verification is still needed
(same longstanding synthetic-pointer-event limitation as every other
click/drag tool in this project).

Also noted in passing: `store.ts` already has a working `mirrorMember(id,
axis)` action with no UI — likely the next quick "wire up an existing
engine" win, same shape as Save/Load, Delete, and Mate.

Fourth feature same day: **Mirror**, wiring up that exact `mirrorMember`
action. Added an X/Y/Z button row to `BoardEditPanel.tsx`'s Board
Properties section — mirrors the selected board across the world origin
on the chosen axis, adding a new labeled copy (the original is untouched).
Verified live: Insert -> Mirror X -> Entities count 1 -> 2, mirrored copy
appears in the list, Ctrl+Z reverts to 1, no console errors. `npm run
build` clean, 0 TypeScript errors.

Fifth feature same day: **Group**, via the existing mate system rather
than a new standalone feature — `applyMate` already creates/merges a
`MateGroup` per mated pair, and an unused `moveMateGroup` action already
signaled the intent. New shared `src/lib/mateGroups.ts` exports
`expandWithMateGroups(ids)`, called from both `MoveGizmo.tsx`'s drag-start
and `App.tsx`'s arrow-key nudge — it folds every OTHER board in a
selected board's mate group into the SAME `dragOriginals`/`moveMembers`
set those two paths already build from, so a mated assembly moves
together with zero new commit/undo/floor-clamp logic (one code path, not
two). Verified via a temporary `window.__store` debug hook (removed
before the final build): mated two boards via the store, selected only
one, dispatched a real ArrowRight keydown through the actual DOM (not a
synthetic store call) — both boards' X moved 0 -> 1 together, and one
Ctrl+Z reverted both in one step. `npm run build` clean, 0 TypeScript
errors. Rotate is intentionally NOT extended to grouped assemblies this
pass — the roadmap already flagged that as separate, harder (shared-pivot)
follow-up work once Group existed.

Sixth feature same day: **Cut/Trim** (Trim/Extend tool), the last of the
day's "wire up an existing engine" wins — `store.ts`'s Phase-20-era
`pendingInteraction`/`applyTrimExtend`/`snapLengthToFacePlane` system was
complete and unused. New rail tool (K): click a board face to set the
boundary plane (orange highlight, hover preview via a new `trimHoverFace`
field mirroring Mate's `mateHoverFace`), then click any other board — its
near end snaps flush to that plane, growing or shrinking as needed. New
`TrimPanel.tsx`. Scoped to rectangular box faces only, same as Mate.
Verified via a temporary `window.__store` debug hook (removed before the
final build): boundary board A (length 36 @ x=0) + board B (length 10 @
x=30, clear of A's xMax face at x=18) — applying trim/extend grew B to
length 17 @ x=26.5, matching a hand-calculated expectation exactly. One
Ctrl+Z fully reverted it. `npm run build` clean, 0 TypeScript errors.

Joey raised extending this to also clip Template-extruded custom-polygon
boards (real 2D polygon-vs-plane clipping) as a future idea — noted in the
roadmap, deliberately NOT built this session; it's a materially bigger job
than the box-board wire-up above.

## Status
Reset executed (Samson Option, "Phase 0"): all `src/components/*` and old
`App.tsx` deleted. Preserved: `store.ts`, `types.ts`, all `lib/` math/data
files, all Pepe knowledge files, `CAD_ENGINE_BLUEPRINT.ts`,
`VECTOR_PROJECTION_MATH.md`, root markdown docs. Backup at
`wood-cad-app - BASE`.

Bones in place:
- `src/cad_bones/interaction_state_machine.json`
- `src/cad_bones/feature_tree_schema.json`
- CLAUDE.md updated with one-way pipeline: Kernel Math -> Tessellated
  Arrays -> Viewport (viewport never talks back to kernel)

Old `PHASE_N_PROMPT.md` files are retired (archived in BASE copy only).

**Important — nothing below has been committed yet.** `git log` on `main`
shows the latest real commit is still `f922c31` ("PROGRESS.md: record
Phase 20 commit hash"), which belongs to the OLD pre-reset app (the one
with RadialOrbitalSelector, WoodBlock.tsx, TransformGizmo.tsx, etc. — all
deleted in the working tree per `git status`). The entire Samson Option
reset and all 13 New Order prompts below exist only as uncommitted
working-tree changes. Nothing described in this file is on `main` or
deployed to dovedesign.vercel.app yet. `npm run build` was re-run during
this catch-up pass and completes clean (0 TypeScript errors).

**Note on CLAUDE.md staleness:** CLAUDE.md's "File Map" and most of its
narrative content (WoodMember cuts/CSG system, RadialOrbitalSelector, Pepe,
BomPanel, TutorialPanel, etc.) describe the OLD pre-reset app. The current
`src/components/` directory contains 11 files, all built fresh via the New
Order prompts below: `SketchTool.tsx`, `MoveGizmo.tsx`, `RotateGizmo.tsx`,
`InsertPanel.tsx`, `BoardMesh.tsx`, `BoardEditPanel.tsx`, `Viewport.tsx`,
`SpeciesSelect.tsx`, `SketchMaterialPanel.tsx`, and (New Order 5)
`ToolRail.tsx`, `PropertiesPanel.tsx`. As of New Order 5, `InsertPanel.tsx`,
`SketchMaterialPanel.tsx`, and `BoardEditPanel.tsx` are content-only
components (no self-positioning wrapper, no independent open/close state)
mounted by `PropertiesPanel.tsx` — see that New Order's entry below before
editing any of the three. CLAUDE.md has not been rewritten yet to match
this rebuild — treat its File Map / broken-things list as historical, not
current, until that cleanup happens.

## Workflow (current)
Tools are built before the UI shell. Prompts are now "New Order" prompts:
`NEW_ORDER_N_PROMPT.md`, dropped in project root, one per session.

Every New Order prompt must:
1. Direct Claude Code to read CLAUDE.md, CAD_MANIFESTO.md, PROGRESS.md,
   CAD_ENGINE_BLUEPRINT.ts first
2. Include a Data Flow Pipeline block (Manifesto Law 3) before any code
3. Comply with CAD_MANIFESTO.md Laws 1-4 (parametric, topological,
   self-documenting, no patch-and-hope fixes)
4. Build ONLY the named tool/feature — no bundled scope
5. End with `npm run build` clean, zero TypeScript errors
6. End the session with the local dev server command for Joey to test in
   browser — NOT an auto commit/push. Joey pushes manually once satisfied.

## Completed New Orders
- New Order 1: Built the initial Sketch tool from scratch — minimal
  viewport (Canvas/camera/orbit/lighting) plus click-drag-click board
  creation through the engine pipeline; no other tools/panels.
- New Order 1.1: Added a nominal-size selector (2x4, 1x4, etc.) to Sketch
  and fixed drag so the start point stays fixed while dragging only sets
  length.
- New Order 1.2: Replaced click-drag-length with corner-drag (defines a
  rectangular length x width footprint) and added post-placement editing
  of length/width/thickness.
- New Order 1.3: Removed nominal-size buttons, added the shared
  fractional-inch format/parse utility, a live drag readout, board-edge/
  corner snapping, and Shift+D duplicate.
- New Order 1.4: Extended fractional precision to 1/64, attempted a snap-
  reliability fix, fixed Shift+D duplicate, and moved the live readout to
  per-edge labels. (Snap-reliability fix is unverifiable now — see below.)
- New Order 1.5: Removed board-edge/corner snapping entirely, added
  right-click/Escape cancel mid-drag, added numeric-override typing during
  drag, and ran a full audit of Sketch behavior.
- New Order 2: Built the initial Move tool — raw left-drag repositioning,
  Shift-for-Y-lock, arrow-key nudge, live readout, cancel/undo. (Fully
  replaced by New Order 2.1 — no longer in the codebase.)
- New Order 2.1: Reworked Move onto a TransformControls axis-handle gizmo
  (replacing raw drag), fixed nudge persistence, fixed all-12-edge
  highlight, added camera lock during drag, and fixed a grid/drag
  stretch-to-~250" bug.
- New Order 2.2: Fixed right-click cancel detaching the gizmo from the
  board, attempted a grid-glitch-on-orbit fix, increased selection-
  highlight contrast, added a Move toolbar button. (Grid-glitch attempt
  was later reverted by 2.4 — see below.)
- New Order 2.3: Swapped to an "infinite" camera-following grid, made Move
  an explicit tool distinct from Select (no more auto-gizmo-on-select),
  fixed a multi-select regression, attempted another right-click camera-
  swing fix. (Infinite-grid change was later reverted by 2.4.)
- New Order 2.4: Reverted to a fixed-size (300x300) grid used as a floor-
  collision plane, fixed multi-select persistence across repeated moves,
  changed highlight color to lime/safety-yellow, defaulted toolbar to
  Select, and re-fixed the right-click camera swing.
- New Order 3: Built the Insert tool — numeric length/width/thickness
  panel, preset buttons, Place button, origin-collision offset, post-
  insert Select (not Move), sticky last-used defaults.
- New Order 3.1: Changed Insert's default length 96"->36", fixed origin-
  collision offset (was stacking boards at the same spot), converted
  preset buttons to a dropdown (added OSB), added a species dropdown
  shared between Insert and Sketch.
- New Order 3.2: Reconnected wood grain rendering — `BoardMesh.tsx` now
  passes `getWoodGrainTexture(member.color)` / `getRoughnessTexture()`
  (from `woodTexture.ts`) as `map`/`roughnessMap` on the board's
  `meshStandardMaterial`, instead of a flat `color` fill only (material
  `color` is now white so it doesn't double-tint the texture's baked-in
  color). Also fixed diagonal placement offsets: `duplicateMember` in
  `store.ts` offset both X and Z (+6/+6, a true diagonal) — changed to
  Z-only, gap = board width + 2". `findOpenSpawnPosition` in `bounds.ts`
  already walked a single axis but used a flat 6" step on X — changed to
  walk Z (the board's width axis) with step = width + 2", so it and
  duplicate now place boards on the same side-by-side convention.
- New Order 5: UI reorg + bug fixes.
  - **Texture fix**: root cause was NOT anything Rotate-specific — it was
    that `CADGeometryEngine.buildRenderMesh` (`src/core/Engine.ts`) never
    emitted UV coordinates, and `BoardMesh.tsx`'s `BufferGeometry` only ever
    set `position`/`normal` attributes, never `uv`. Without a `uv`
    attribute, `meshStandardMaterial`'s `map`/`roughnessMap` had nothing to
    sample against, so every board rendered as a flat, grain-less color
    (confirmed live in-browser before the fix: an inserted board showed flat
    tan, no grain lines, no knot). Fixed at the pure-math layer per Manifesto
    Law 4 (Vector Isolation Rule): `buildRenderMesh` now also returns a
    `uvs: Float32Array` (a plain 0..1 parameterization of each face's own
    (u,v) extent, reusing the Face's existing widthU/heightV — not a second
    UV scheme), and `BoardMesh.tsx` sets it as the geometry's `uv`
    attribute. Verified in-browser: grain now renders on Insert, and
    persists correctly through a Rotate drag (the specific regression Joey
    reported).
  - **Panel-closes-on-tool-switch fix**: root cause was architectural, not a
    missed event handler — Insert used a standalone `insertPanelOpen`
    boolean in `App.tsx` that never read `ui.activeTool` at all, and
    `BoardEditPanel` rendered independently of any tool ("visible whenever a
    board is selected", regardless of tool). Confirmed live in-browser:
    Insert a board -> press M (Move) -> press R (Rotate) left the Insert
    form AND the Board Properties panel both stacked on screen at once.
    Fixed structurally (see UI reorg below) rather than patched: Insert is
    now a real `ActiveTool` value (`'addBoard'` — already reserved in
    `types.ts`/`workspaceModes.ts`, unused since the Samson reset deleted
    its old consumers, so no new type surface), and there is now exactly one
    panel element whose content is an exhaustive switch on `activeTool`, so
    a stale section can never stay mounted alongside a new one.
  - **UI reorg**: replaced the flat top-left toolbar + separate floating
    panels (`InsertPanel`, `SketchMaterialPanel`, `BoardEditPanel` each
    self-positioning with `absolute`) with:
    - `src/components/ToolRail.tsx` — new file. Persistent left-side icon
      rail (Select/Move/Rotate/Sketch/Insert), each button icon + text
      label (CLAUDE.md's "all UI controls must have visible text labels"
      rule overrides a literal icon-only Blender rail — adapted, not
      copied), plus a "Space" badge reading `ui.workspaceMode` live (always
      "Model" today; ready for a future Profile/sketch mode with no rail
      changes needed).
    - `src/components/PropertiesPanel.tsx` — new file. Single right-side
      contextual panel: a non-collapsible section for whichever tool is
      active (Insert's form + Place button, Sketch's species picker,
      Rotate's X/Y/Z axis row), a collapsible "Board Properties" section
      (the old BoardEditPanel content, now passed the selected member as a
      prop instead of doing its own store lookup), and a collapsible
      "Entities" section listing every board with a visibility toggle
      (reuses the existing `sendToScrapBox`/`retrieveFromScrapBox` actions
      — no new hide/show mechanism) and edit/remove icon buttons per row.
    - `InsertPanel.tsx`, `SketchMaterialPanel.tsx`, `BoardEditPanel.tsx`:
      stripped of their `absolute`-positioned wrapper divs and (for Insert)
      its `open`/`onClose` props — same field logic/state/store calls as
      before, now rendered as content inside PropertiesPanel. Tool
      functionality itself (Sketch/Move/Insert/Rotate behavior) is
      unchanged — this was a structural/layout change only, per the Order.
  - Verified in-browser (fresh dev server, clean console): Insert -> auto-
    switch to Select with grain visible -> Move (gizmo + Board Properties
    show, Insert form gone) -> Rotate (axis rows show, grain persists
    through drag) -> Sketch (species picker shows, prior sections gone);
    Entities list visibility toggle, edit icon (re-selects + switches to
    Select), and remove icon all confirmed working via real click events.
    Sketch's free-hand drag-to-draw itself is unchanged code and wasn't
    independently re-verified this session (synthetic pointer-drag in the
    headless preview tool gets intercepted by OrbitControls instead of the
    draw-plane, a known limitation of dispatched PointerEvents vs. real
    mouse input, not a code regression) — needs Joey's real-mouse pass.
- New Order 5.1: UI polish pass — editable board names, Board Properties
  auto-expand, app-wide hover tooltips, a reserved Pepe rail slot, and
  grouped rail tools with a fly-out flyout.
  - **Editable board name**: new `src/components/EditableLabel.tsx` —
    click the board name text (or a pencil icon, shown in the Board
    Properties header) to edit inline, Enter commits, Escape reverts, blur
    commits. Wired into both `BoardEditPanel.tsx`'s header and
    `PropertiesPanel.tsx`'s Entities row, both calling the same
    `updateMember(id, { label })` — verified live: renaming from either
    location updates the other immediately (same store field).
  - **Board Properties auto-expand**: `PropertiesPanel.tsx` now has a
    `useEffect` keyed on `ui.selectedMemberId` that force-sets
    `propertiesOpen = true` whenever a new board is selected (via 3D click
    or the Entities list). Verified live: collapsed Board Properties,
    deleted the board (selection -> null), inserted a new one (selection
    -> new id) — Board Properties auto-opened with no extra click.
  - **Tooltip system**: new `src/components/Tooltip.tsx` — a reusable
    hover-wrapper reading a plain `{ label, description, shortcut? }`
    object per call site (never hardcoded per instance), so it's ready to
    back a future in-app tutorial without a rewrite. Applied to every rail
    button (top-level and inside group flyouts), every Insert/Sketch/Board
    Properties field, and every Entities row icon (show/hide, select,
    remove). Verified live: hovering the Select rail button and the Create
    group button both rendered the expected label/description/shortcut
    bubble with no console errors.
  - **Board hover tooltip (3D viewport)**: `BoardMesh.tsx` now tracks local
    `hovered` state via `onPointerOver`/`onPointerOut` on the mesh, and
    renders a drei `<Html>` node (species + formatted length/width/
    thickness) anchored to the board as a mesh child — same
    "re-derived every render, never a stored world point" pattern as every
    other board-relative overlay. Suppressed while `ui.moveDragActive` to
    avoid flicker mid-drag. **Unverified live** — same documented headless-
    preview limitation as Sketch's drag-to-draw (synthetic pointer events
    dispatched at the `<canvas>` don't reliably reach React Three Fiber's
    internal raycaster the way a real mouse does); the click-based
    selection path on the same mesh element (`onClick`) was verified
    working live this session, and this hover handler follows the
    identical event-registration pattern, but needs Joey's real-mouse pass
    to fully confirm the tooltip actually appears on hover. New Order 5.2
    fixed a separate, confirmed-in-code bug on this same tooltip: it was
    shrinking with camera distance/zoom (see New Order 5.2 entry below) —
    whether it now appears on hover at all is still the open item.
  - **Reserved Pepe rail slot**: `ToolRail.tsx` — a disabled placeholder
    button pinned to the bottom of the rail (icon + "Pepe" label + a
    "coming soon" tooltip), structurally ready for the future knowledge
    panel with no other wiring yet.
  - **Grouped rail tools with fly-out**: `ToolRail.tsx` was restructured
    from a flat `TOOLS` array into `RAIL_ITEMS` (`{ kind: 'tool' }` or
    `{ kind: 'group', tools: [...] }`). Move+Rotate are grouped under
    "Transform", Sketch+Insert under "Create"; clicking a group button
    toggles a local `openGroupId` (ephemeral UI state, intentionally not in
    the Zustand store) and flies that group's tools out to the right, over
    the canvas, per the Order's preferred approach (not the scrollable-
    rail fallback — with only 3 top-level items the rail doesn't need to
    scroll). Closes on picking a tool, clicking outside the rail, or
    Escape. **Bug found and fixed during verification**: the tool-list
    container originally had `overflow-y-auto`, and CSS promotes
    `overflow-x` to `auto` whenever `overflow-y` isn't `visible` — this
    clipped each flyout into a horizontal scrollbar instead of letting it
    render over the canvas. Fixed by dropping `overflow-y-auto` (unneeded
    at the current item count); left a comment noting a portal-based
    flyout as the fix if a future Order adds enough top-level items to
    need scrolling again. Verified live: opening "Create" flies out
    Sketch/Insert correctly, picking Insert closes the flyout and switches
    the tool, Board Properties/Entities behave normally afterward.
  - `npm run build`: clean, 0 TypeScript errors.
- New Order 4: Built the Rotate tool — `src/components/RotateGizmo.tsx`,
  a `TransformControls` (`mode="rotate"`, `space="local"`) attached to a
  free-floating anchor (never the board mesh directly, same pattern as
  `MoveGizmo.tsx`). Only one axis ring renders/is interactive at a time
  (`showX`/`showY`/`showZ` gated by `ui.rotationAxis`, the store field
  already reserved for this) — independent per-axis rotation, not one
  combined gizmo. Tab key (App.tsx) and a toolbar X/Y/Z button group both
  cycle/set the active axis. Default snap is 15° (`rotationSnap` on
  `TransformControls`); holding Shift during the drag switches to free
  rotation (no snap). Single-board scope only, per this Order. Undo/redo:
  one `updateMember(..., skipHistory=false)` commit on drag-end, mirroring
  `MoveGizmo.tsx`'s moveMembers-on-release pattern — verified in-browser
  that a single Ctrl+Z after a rotate restores the board's prior rotation
  (not a 2-step revert, and not accidentally removing the board — see the
  "Unverified" note below for how a test artifact briefly looked like a
  real bug here). Selection persists through the drag (same
  `armGizmoDragClickSuppress()` fix `MoveGizmo.tsx` already uses for its
  own post-drag stray-click problem). Escape cancels an in-progress rotate
  drag (restoring original rotation) via a new `src/lib/rotateDragState.ts`,
  same registration pattern as `moveDragState.ts`.
- New Order 5.2: Flyout + Tooltip Polish — four presentational fixes, no
  geometry/parameter state touched (Manifesto Law 1/2 non-applicable,
  confirmed by Data Flow Pipeline block in the session prompt).
  - **Flyout group button sizing**: root cause was a CSS stretch chain
    break, not inconsistent Tailwind classes at the call site. Top-level
    tool buttons (Select) are direct flex children of the rail's
    `flex-col` container, so they stretch to fill its width by default.
    Group buttons (Transform, Create) are nested one level deeper inside
    an extra `.relative` wrapper div (needed for the flyout's absolute
    positioning), and `Tooltip.tsx`'s own wrapper span is `inline-flex`
    (shrink-to-fit) — since that span was no longer a *direct* flex child
    of the stretching container, it shrank to its button's intrinsic
    content size instead of filling the available 64px, so `RailButton`'s
    `w-full` resolved against an auto-sized parent and the whole button
    shrank (and differed between "Transform" and "Create" by label-text
    width). Fixed by passing `className="w-full"` into `Tooltip` at both
    the top-level-tool and group call sites in `ToolRail.tsx`, so sizing
    no longer depends on implicit stretch inheritance through an extra
    wrapper. Verified live: `Select`/`Transform`/`Create` all measured
    62.4x53.6px via `getBoundingClientRect()` in-browser (previously
    Transform/Create would have shrunk to content size); flyout leaf
    buttons (Sketch/Insert, which use an explicit `w-16` and were never
    affected by this bug) measured 64x53.6px, matching. A small
    right-pointing chevron (`IconFlyoutChevron`, absolute-positioned top
    right corner, `currentColor` so it inherits the button's
    active/highlighted/idle text color) was added to `RailButton` via a
    new `chevron` prop, passed only for group buttons (Transform,
    Create) — Select and the flyout's own leaf tool buttons don't get
    one. Verified live via screenshot: both group buttons show the
    corner chevron, Select does not.
  - **3D board hover tooltip fixed screen size**: `BoardMesh.tsx`'s drei
    `<Html>` node had `distanceFactor={30}`, which is drei's
    inverse-distance perspective-scaling mode — exactly what was making
    the tooltip shrink when zoomed out/far from the board. Removed the
    prop; without it, `<Html>` uses its default screen-space mode, which
    keeps a fixed CSS pixel size regardless of camera distance or zoom.
    The tooltip is still a child of the board's `<mesh>`, so it still
    inherits the board's live position every render (FOLLOWS-BOARD CHECK
    unaffected — only on-screen *size* behavior changed, not the anchor).
    **Unverified live**: same documented headless-preview limitation as
    New Order 5.1's original hover-tooltip work (synthetic pointer events
    don't reliably trigger React Three Fiber's internal raycaster the way
    a real mouse does) — the code change is a single, well-understood
    prop removal, but needs Joey's real-mouse pass to confirm the on-screen
    size is now fixed across zoom levels.
  - **Board Properties initial state bug**: `PropertiesPanel.tsx` had
    `propertiesOpen` initialized to `true` and an effect that only ever
    set it to `true` (`if (selectedMemberId) setPropertiesOpen(true)`),
    so it never collapsed on fresh load (nothing selected yet) or after a
    board was deselected (id -> null hit no branch). Fixed by defaulting
    `propertiesOpen` to `false` and making the effect unconditional
    (`setPropertiesOpen(!!selectedMemberId)`), so it collapses on null and
    expands on a real id symmetrically. Verified live: fresh load shows
    Board Properties collapsed (confirmed via accessibility snapshot — no
    "Select a board..." text present); placing a board via Insert
    auto-selected it and Board Properties auto-expanded (Length/Width/
    Thickness fields visible); removing that board via the Entities list
    (deselecting it) collapsed Board Properties again with no manual
    click.
  - **Manual expand/collapse control**: `PropertiesPanel.tsx`'s
    `CollapsibleSection` swapped its single rotating `›` character for a
    new `IconChevronsToggle` (two stacked chevrons, rotates -90° when
    closed) on both Board Properties and Entities headers — the existing
    whole-header click-to-toggle behavior is unchanged, this only makes
    the manual override affordance visually explicit. Verified live:
    clicking the "Board Properties" header while no board was selected
    toggled it open (paragraph "Select a board to edit its dimensions."
    became visible), confirming the manual toggle works independently of
    the auto-expand/collapse effect above.
  - `npm run build`: clean, 0 TypeScript errors.
- New Order 5.3: Visual redesign — presentational/layout only (Manifesto
  Law 1/2 non-applicable, confirmed by this session's Data Flow Pipeline
  block; no geometry/parameter/board data touched).
  - **Color palette overhaul**: added `charcoal` (dark warm-grey chrome)
    and `spruce` (muted sage-green secondary accent) scales to
    `tailwind.config.js`, matching the default zinc scale's 9-step
    lightness convention so every existing `zinc-NNN` class mapped 1:1 to
    `charcoal-NNN` (mechanical rename across `App.tsx`, `ToolRail.tsx`,
    `PropertiesPanel.tsx`, `InsertPanel.tsx`, `SketchMaterialPanel.tsx`,
    `BoardEditPanel.tsx`, `BoardMesh.tsx`, `RotateGizmo.tsx`,
    `MoveGizmo.tsx`, `EditableLabel.tsx`, `Tooltip.tsx`,
    `SpeciesSelect.tsx`). Spruce applied as an accent only, not a base
    surface: the rail's open-flyout "highlighted" state (previously plain
    charcoal, indistinguishable in intent from a hover), section-header
    underlines (Board Properties/Entities/Insert/Sketch Material section
    titles), and hover tints on rail buttons and section chevrons.
  - **New `src/lib/theme.ts`**: consolidates the color values Tailwind
    classes can't reach (Three.js scene colors) — `viewportBackground`,
    `gridCell`, `gridSection` (mirroring charcoal-600/500/300), and
    `selectionOrange` (mirroring orange-500). Previously `BoardMesh.tsx`
    and `SketchTool.tsx` each hardcoded their own, different, "active"
    color inline; both now import `THEME.selectionOrange` from one place.
  - **Selection-color audit (per the Order's explicit ask)**: found and
    unified two inconsistent indicators onto the app's one orange active/
    selected signal — `BoardMesh.tsx`'s selection outline (was lime-400
    `#a3e635`) and `SketchTool.tsx`'s draw-in-progress preview box (was
    amber-500 `#f59e0b`). Also added an orange left-accent highlight to
    the Entities list's selected-row state (`PropertiesPanel.tsx` —
    previously an unstyled plain charcoal background, the one selection
    indicator in the app not using orange at all).
  - **Viewport background + grid**: `Viewport.tsx` now sets an explicit
    `<color attach="background">` (previously Canvas had none, which
    reads as solid black) to `THEME.viewportBackground`, a warm mid-dark
    grey; grid `cellColor`/`sectionColor` re-tinted warm and lightened a
    step past the background (`THEME.gridCell`/`gridSection`) so lines
    stay readable without glowing.
  - **Chevron consistency**: new shared `src/components/ChevronsIcon.tsx`
    (`direction: 'down'|'up'|'left'|'right'`) replaces two previously
    divergent implementations — `PropertiesPanel.tsx`'s local
    `IconChevronsToggle` (Board Properties/Entities, already using a
    double-chevron) and `ToolRail.tsx`'s `IconFlyoutChevron` (Transform/
    Create flyout triggers, a single small arrow in a corner badge).
    `ToolRail.tsx`'s `RailButton` was restructured for `chevron`-flagged
    (group) buttons: icon and chevron now sit in one middle-aligned row
    separated by a thin vertical divider, with the chevron turning spruce
    on hover to signal it's clickable — previously a static, low-contrast
    corner glyph with no hover state.
  - **Collapsible right panel**: `PropertiesPanel.tsx` gained a local
    `panelCollapsed` boolean (ephemeral UI chrome, same precedent as
    `ToolRail.tsx`'s existing `openGroupId` — intentionally not in the
    Zustand store) that swaps the full 72-wide panel for a 10-wide edge
    strip with a single re-expand chevron and a vertical "Properties"
    label, mirroring the rail's own bg/border treatment. A collapse
    chevron was added to the panel's header. Collapsing/re-expanding
    never touches `activeTool`, `selectedMemberId`, or any section's own
    open/closed state.
  - **Dove Design branding**: `ToolRail.tsx`'s old bare "Space / Model"
    text block replaced with a wordmark ("DOVE" / "DESIGN", the second
    line in spruce), a reserved icon slot (an empty dashed-border box —
    deliberately not a generated logo, same "real placeholder, not a fake
    final asset" pattern as the disabled Pepe rail slot), and the
    mode indicator demoted to a small pill badge beneath the wordmark
    (still reads `ui.workspaceMode` live, ready for a future Profile-mode
    badge with no structural change).
  - Verified live (fresh dev server, real click events via
    `document.querySelectorAll` + `.click()` — not synthetic pointer
    drags, so this is a solid confirmation, not the usual headless-drag
    caveat): Create flyout opens with the spruce highlight + rotated
    chevron + divider; Insert → Place shows the new warm-grey viewport/
    grid, wood grain against it, and an orange (not lime) selection
    outline; the newly-placed board's Entities row shows the orange
    left-accent highlight; Board Properties auto-expanded with the new
    chevron in its down/open orientation (confirmed via
    `getAttribute('class')` showing `rotate-0`, not just visually);
    panel collapse → thin edge strip → re-expand round-tripped with all
    prior section-open state intact. Left-over test board was removed
    before ending the session.
  - **Not independently re-verified live** (same documented headless-
    preview limitation as every prior Order's drag-based tools —
    synthetic pointer events don't reliably reach React Three Fiber's
    raycaster/OrbitControls the way a real mouse does): Sketch's draw-
    preview color (code change is a single hardcoded-hex swap, same
    pattern as the Order's other hex-to-THEME swaps, but the preview only
    renders during an active drag). Needs Joey's real-mouse pass.
  - `npm run build`: clean, 0 TypeScript errors.
- New Order 5.4: Redesign follow-up — four presentational fixes on top of
  5.3, no geometry/parameter/board data touched (Manifesto Law 1/2
  non-applicable, confirmed by this session's Data Flow Pipeline block).
  - **Viewport background vignette**: root cause was NOT the `<color
    attach="background">` layer itself (a flat fill has no gradient by
    construction) — it was drei's `Grid` component applying its default
    distance-from-camera fade (`fadeStrength=1`) to cell/section line
    opacity. Since the grid visually dominates the viewport at most camera
    angles, lines fading out radially from wherever the camera is looking
    read as a vignette darkening toward the screen corners. Fixed at the
    prop level (`Viewport.tsx`): added `fadeStrength={0}` to the existing
    `<Grid>`, so it renders at a uniform color across its full fixed
    300x300 extent regardless of camera distance/position — no new token
    needed since this isn't a color value, just a fade toggle. Verified
    live: fresh reload shows an evenly-lit grid/background at both close
    and far camera distances, no corner darkening.
  - **Dove Design logo mark**: new `src/components/LogoMark.tsx` — the
    exact SVG paths/colors from the Order (two dovetail-pin trapezoids,
    orange `#d9772e` right / spruce `#7a8b6f` left, small center dot),
    viewBox cropped to `280 60 120 120` (just the mark itself, not the
    original 680x260 scratch canvas). Swapped into `ToolRail.tsx` in place
    of the New Order 5.3 dashed-border placeholder box, same `w-7 h-7`
    slot size. Verified live via screenshot: the mark renders correctly
    above the wordmark, distinct from and unrelated to the still-placeholder
    disabled Pepe button below it.
  - **Right panel collapse — edge tab**: `PropertiesPanel.tsx`'s old
    chevron-in-header collapse button replaced with a new `PanelEdgeTab`
    component — a small pill positioned `absolute` at the panel's
    vertical center, offset `-left-2.5` so it straddles the panel/canvas
    boundary (half over each), same interaction (click toggles
    `panelCollapsed`) and same directional chevron convention (right to
    collapse, left to expand) as before, placement only. Required
    splitting the expanded-panel markup into an outer non-clipping
    wrapper (so the tab's negative-offset position isn't clipped) and an
    inner `overflow-hidden` div for the actual rounded-corner card content
    — the tab renders as a sibling of the inner card, not a header child.
    Verified live: collapse round-trip (expand -> collapse -> expand)
    correctly restores prior section-open state (Board Properties/
    Entities), and `getBoundingClientRect()` confirmed the tab's x-position
    sits left of the panel's left edge, over the canvas.
  - **Flyout divider removal**: `ToolRail.tsx`'s `RailButton` — removed
    the `w-px self-stretch bg-charcoal-600` divider span between the icon
    and chevron on `chevron`-flagged (Transform/Create) buttons; the
    chevron itself and its hover-to-spruce color are unchanged. Verified
    live via `outerHTML` inspection: the rendered button now has exactly
    two child spans (icon, chevron) with no divider element between them.
  - `npm run build`: clean, 0 TypeScript errors.
- New Order 6: Profile tool — mode infrastructure only (2D draw tools and
  extrude are New Order 6.1/6.2, per DOVEDESIGN_ROADMAP.md's split).
  - **Profile mode + rail entry**: `WorkspaceMode` (types.ts) extended with
    a fourth value, `'profile'`, alongside model/assembly/detail.
    `ActiveTool` gained a matching `'profile'` value. `ToolRail.tsx` gained
    a fourth top-level button (icon + "Profile" label, shortcut P) next to
    Select/Transform/Create, calling the same `setActiveTool()` every other
    rail button already uses — no second tool-switching path. The Space
    badge under the wordmark needed zero code changes: it already rendered
    `ui.workspaceMode` as live text with existing styling (New Order 5.3's
    comment predicted exactly this), so it now shows "Profile" for free.
    Verified live via accessibility snapshot: clicking Profile flips the
    badge from "Model" to "Profile" and swaps the right panel's content to
    a new "Profile Sketch" section.
  - **workspaceModes.ts**: `MODE_LABELS`/`MODE_ORDER`/`MODE_TOOLS`/
    `MODE_PANEL_TABS`/`TOOL_LABELS` all extended with a `profile` entry
    (`MODE_TOOLS.profile = ['profile']` — nothing from Model space is legal
    inside it) so the existing mode-follows-tool/tool-follows-mode
    machinery in store.ts's `setActiveTool`/`setWorkspaceMode` handles
    Profile the same way it already handles the other three modes, no new
    parallel system.
  - **Nothing leaks between spaces**: existing tool components
    (MoveGizmo/RotateGizmo/SketchTool) already early-return unless their
    own `activeTool` matches, so entering Profile hides them with zero new
    gating code — confirmed by reading each file's existing guard, not a
    new assumption. `BoardMesh.tsx`'s click handler already gates on
    `activeTool === 'select' || 'move'`, so boards are inert (unselectable)
    while Profile is active without touching that file at all. New:
    `store.ts` gained a small `profileTransitionPatch()` helper, called
    from both `setActiveTool` and `setWorkspaceMode`, that clears
    `selectedMemberId`/`multiSelection` on any transition into or out of
    `'profile'` specifically — scoped narrowly so it does NOT touch the
    existing, intentional "selection survives a model/assembly/detail mode
    switch" behavior documented inline above `setWorkspaceMode`.
  - **Two clean exits**: a new "Exit to Model" button in the Profile panel
    and the Escape key (App.tsx, checked after the existing rotate/move
    drag-cancel checks) both call the existing `setWorkspaceMode('model')`
    action — no separate exit code path. Verified live: entered Profile via
    the rail button, confirmed the badge/panel switched, clicked "Exit to
    Model" and separately (on a second pass) dispatched Escape — both
    correctly returned the badge to "Model" and the panel to "Select" with
    no leftover Profile state.
  - **Species selector**: new `src/components/ProfilePanel.tsx` (mounted by
    `PropertiesPanel.tsx` while `activeTool === 'profile'`, same
    content-only convention as InsertPanel/SketchMaterialPanel/
    BoardEditPanel) renders the existing `SpeciesSelect` component against
    a new `ui.profileMaterial` field (default `'Pine'`) and
    `store.setProfileMaterial()` — reuses `WOOD_SPECIES_LIST`/
    `materials.ts` exactly like Insert/Sketch already do, no second species
    list. This is set dressing for New Order 6.2's extrude step; nothing
    reads `profileMaterial` yet. Verified live: dropdown shows "Pine"
    selected on entry (the default).
  - **Plane lock parameter**: new `ui.profilePlane: { kind: 'ground',
    origin: [0,0,0], normal: [0,1,0] }` (types.ts's new `ProfilePlane`
    type) — a stored parameter object per CAD_MANIFESTO.md Law 1, not
    hardcoded camera math. Only `'ground'` is implemented; a future Order
    adds a `'face'` variant (faceId + derived origin/normal) per the
    Order's "later, allow picking a face" note, without reshaping this
    field. The Profile panel shows a static "Plane: Ground" label this
    Order (no picker UI yet, since there's nothing else to pick).
  - **Camera lock**: new `src/components/ProfileCameraLock.tsx`, mounted
    inside `Viewport.tsx`'s `<Canvas>`. On a transition into `'profile'` it
    saves the current camera position + OrbitControls target to a local
    ref (ephemeral view state, not board data), then points the camera at
    `profilePlane.origin + profilePlane.normal * 60` looking at the
    origin — a pure function of the stored plane parameters, so a ground
    plane (normal `[0,1,0]`) always resolves to a straight top-down view.
    On leaving `'profile'` it restores the saved position/target exactly.
    `Viewport.tsx`'s `<OrbitControls>` gained a ref (for the camera-lock
    component to read/write the orbit target) and
    `enableRotate={workspaceMode !== 'profile'}` — pan and zoom stay on,
    only rotation is locked, so Profile reads as a genuinely 2D sketch
    plane rather than just a camera reset. **Not independently verified
    live**: the preview tooling's screenshot capture timed out repeatedly
    this session (confirmed unrelated to app health — the page stayed
    fully responsive to click/eval/accessibility-snapshot calls throughout,
    and zero console errors/warnings were logged across multiple
    enter/exit cycles), and there's no exposed handle to read Three.js
    camera state headlessly in this app (no devtools bridge wired up). The
    code path is a small, ordinary imperative camera set + OrbitControls
    target set — same category of side effect MoveGizmo/RotateGizmo
    already perform — but the actual on-screen top-down framing needs
    Joey's real-browser pass to confirm.
  - **Grid horizon fade** (carried-over fix #1): `Viewport.tsx`'s `<Grid>`
    — New Order 5.4 set `fadeStrength={0}` to kill a vignette, which also
    made the grid stop dead at its fixed 300×300 edge (a "wall," per this
    Order). Root cause of 5.4's vignette was never the fade *existing*, it
    was drei's default `fadeDistance={100}` being smaller than how close
    the camera normally frames a board layout, so the fade radius sat
    inside the visible viewport. Fixed by re-enabling the fade
    (`fadeStrength={1}`, back to drei's default falloff curve) with a
    larger `fadeDistance={140}` — big enough that normal framing stays
    crisp (the fade radius sits outside what's usually visible) while the
    grid still fades to the background color before its physical edge at
    long camera distances or low, horizon-facing angles. Confirmed via
    reading drei's `Grid.js` source directly that its fade is a world-space
    distance from the camera's ground-projected point (not a screen-space
    vignette) and that the shader never reads `THREE.Scene.fog` at all — so
    a plain `<fog>` node would have done nothing for the grid; only the
    Grid component's own `fadeDistance`/`fadeStrength` uniforms could fix
    this. **Not independently verified live** (screenshot tooling
    unavailable this session, see above) — needs Joey's real-browser pass
    at both normal and zoomed-far-out camera distances.
  - **Edge tab reposition** (carried-over fix #2): `PropertiesPanel.tsx`'s
    `PanelEdgeTab` wrapper changed from `top-1/2 -translate-y-1/2` (dead
    center of the panel) to `top-3` (fixed offset near the top). Verified
    live via `getBoundingClientRect()`: the tab's vertical center now sits
    at y≈52px against the header text's y≈28.8–52.8px band — directly
    adjacent to "Select" — versus the panel's actual vertical center, which
    is hundreds of pixels further down. Confirmed unchanged behavior on
    round-trip: collapse → thin edge strip → re-expand still restores
    Board Properties/Entities open-state exactly as before.
  - `npm run build`: clean, 0 TypeScript errors.
- New Order 6.1: Profile tool draw tools (Line/Arc/Freehand) + 4
  presentational fixes carried over from New Order 6's stress-test pass.
  - **Line/Arc/Freehand point-entry tools**: new `src/lib/profileSketchMath.ts`
    (pure functions only, per CAD_MANIFESTO.md Law 4's Vector Isolation Rule)
    and `src/components/ProfileDrawTools.tsx` (mounted in `Viewport.tsx`,
    same always-mounted/early-return-if-inactive pattern as SketchTool/
    MoveGizmo/RotateGizmo). Every click point is converted from world space
    to the Profile plane's own (u,v) parameterization via `worldToPlaneUV`
    and stored that way on a new `ProfileEdge` (types.ts) — never a raw
    world coordinate, same convention `FaceAnnotation` already uses (Law
    1/2). Committed edges live in a new `ui.profileEdges` array
    (`store.ts`'s `addProfileEdge`), the parameter source of truth a future
    New Order 6.2 extrude step will read. Interaction is click-to-place-
    start, then click again to commit the endpoint and continue the chain
    automatically from there (no third click needed to re-arm); Freehand is
    the one true click-and-drag gesture of the three, sampling the cursor
    path into one edge's `points` array on release. Right-click or Escape
    ends the current chain (a new `src/lib/profileDrawState.ts`, same
    singleton-registration pattern as `moveDragState.ts`/`rotateDragState.ts`,
    wired into `App.tsx`'s existing Escape chain before the profile-exit
    check) without deleting already-committed edges — verified live: drew a
    Line segment, switched to Arc mid-chain (continued from the same point,
    no re-click needed), Escape ended the chain (arc preview and reference
    stubs disappeared, "1 segment drawn" persisted), a second Escape then
    exited to Model space as before. Re-entering Profile afterward showed
    the same committed segment still there (profileEdges is `ui` state,
    intentionally not cleared by the existing profile-transition-clears-
    selection patch — only selection is scoped to clear there).
  - **Live length + tangent-relative angle overlay**: while dragging toward
    the next point, a floating label (reusing the shared
    `formatFractionalInches`) shows the live chord length and the signed
    angle relative to the PREVIOUS segment's end tangent (`edgeEndTangent`),
    not an absolute world angle — defaults to the plane's u-axis for the
    first segment of a fresh chain. Two short reference stubs render off
    that same tangent (0°/straight-continuation, 90°/right-angle) so the
    user can see when they're lining up. Verified live via synthetic pointer
    events on the canvas (dispatched with real yields between events, since
    a fully synchronous dispatch sequence in one script batches React state
    updates and reads stale closures — a testing-harness quirk, not an app
    bug): the live label tracked cursor movement correctly (e.g. "7 15/16"
    · -105.0° from last"), and switching to Arc mid-drag rendered a dashed
    orange arc that stayed tangent-continuous with the prior Line segment's
    end direction, confirming `computeTangentArcBulge`/`sampleEdgePoints`'s
    shared tangent-chord-angle math is internally consistent.
  - **15° angle snap**: `snapAngleDeg` (same 15° increment as RotateGizmo's
    `rotationSnap`) snaps the live angle when within 4° of a multiple of 15,
    rebuilding the effective cursor point from the snapped angle so the snap
    changes what gets drawn/committed, not just the on-screen readout —
    optional per the Order, implemented since the math was already in place.
  - **Fix 3 — dedicated Profile exit + inert Model shortcuts**: root cause
    was that `'select'` is legal in every workspace mode (`isToolLegalInMode`'s
    universal exception for select/measure), so clicking the already-active
    Profile rail button — which called `setActiveTool('select')` via the
    generic toggle-to-select logic every other rail button uses — left
    `workspaceMode` stuck on `'profile'` while `activeTool` silently became
    `'select'`, a mismatched state `ProfilePanel`/`PropertiesPanel` don't
    expect. `ToolRail.tsx`'s `pickTool` now special-cases the Profile button:
    clicking it while already active calls `setWorkspaceMode('model')`
    directly (an obvious, working "click again to exit" toggle at the same
    rail location — no new button needed), and its tooltip description
    appends "Click again to exit to Model space." while active so the
    affordance is discoverable, not just functional. Separately, `App.tsx`'s
    W/M/R/S/I tool shortcuts are now no-ops while `workspaceMode === 'profile'`
    (guarded by an added `else if` branch ahead of the real handlers) instead
    of silently kicking the user back to Model space as a confusing partial
    exit. Verified live: pressed 'm' while in Profile — badge stayed
    "Profile" and the panel stayed on "Profile Sketch" (previously this
    would have shown a mismatched "Select" panel while the badge still read
    "Profile"); clicking the Profile rail button a second time correctly
    flipped the badge/panel back to Model/Select.
  - **Fix 4 — Transform button icon centering/chevron crowding**: root cause
    was that the chevron shared one flex row with the icon
    (`justify-center` on `icon+chevron`), so the row's extra chevron width
    shifted its centered midpoint away from the button's true center —
    Transform/Create's icons sat visibly left of Select's (which has no
    chevron and centers on its own). Fixed by making the icon its own
    top-level flex child (byte-for-byte the same position Select's icon
    already uses) and moving the chevron to an absolutely-positioned corner
    mark (`RailButton` in `ToolRail.tsx`) that no longer participates in the
    icon's layout at all — fixes both the off-center icon and the chevron
    "crowding" it. Verified live via screenshot: Select/Transform/Create/
    Profile icons now visually align in one column.
  - **Fix 5 — tooltip covering flyout**: root cause was that the group
    trigger button's hover tooltip and its open flyout both position
    themselves at `left-full` off the same wrapper div, landing in the same
    screen area. `ToolRail.tsx` now passes `side={isOpen ? 'top' : 'right'}`
    to the trigger's `Tooltip`, so once the flyout is open the trigger's own
    tooltip (if still shown at all) renders above the rail button instead of
    over the flyout's Move/Rotate buttons. Verified live via screenshot:
    opened the Transform flyout, then dispatched a hover on the trigger —
    the tooltip rendered above the rail, clear of the flyout.
  - `npm run build`: clean, 0 TypeScript errors.
- New Order 6.2: Profile draw tool fixes + polish (no new tools, per the
  Order's scope).
  - **Fix 1 — undo/redo did nothing for Profile draw actions**: root cause
    was that `addProfileEdge` wrote `ui.profileEdges` via a bare `set()`,
    never through `commitProject` — so no history entry was ever pushed for
    a committed point/segment, and `past`/`future` (which undo/redo swap)
    had nothing Profile-related to restore. Verified this was Profile-
    specific, not a shared regression, by re-testing Model mode live first
    (Insert a board, Ctrl+Z removed it, Ctrl+Shift+Z restored it — unchanged
    and correct). Fixed by broadening every history entry from a bare
    `Project` to `{ project, profileEdges }` (new `HistoryEntry` type,
    `store.ts`) — `commitProject`/`undo`/`redo` now capture and restore both
    together, and `addProfileEdge` calls `commitProject` like every other
    committing action instead of inventing a second stack. Verified live:
    fresh page, armed Line, drew one segment ("1 segment drawn"), Ctrl+Z
    ("0 segments drawn"), Ctrl+Shift+Z ("1 segment drawn" again) — a real
    commit/undo/redo cycle, not just a code read-through.
  - **Fix 2 — Model-space shortcuts leaking into Profile**: New Order 6.1's
    gate already correctly covered W/M/R/S/I in testing this session (live
    re-verification: pressing each while in Profile left the badge/panel on
    "Profile" and the rail's Profile button active, every time) — but it
    relied on two independently-maintained key lists (the gate's condition
    and the dispatch's own five branches) that could silently drift apart if
    a future shortcut were added to one and not the other, and Shift+D
    (duplicate) was only *accidentally* inert in Profile (via an unrelated
    side effect of `setActiveTool` clearing `lastPlacedMemberId`), not
    actually guarded. `App.tsx` now uses one `MODEL_TOOL_SHORTCUTS` key-to-
    tool map read by both the inert-check and the dispatch, and Shift+D got
    its own explicit `workspaceMode !== 'profile'` guard rather than relying
    on incidental clearing. Verified live post-refactor: W/M/R/S/I and
    Shift+D all confirmed inert while in Profile (badge stayed "Profile"
    throughout).
  - **Fix 3 — Transform/Create flyout overflow**: `ToolRail.tsx`'s flyout
    defaulted to opening rightward (`left-full`) unconditionally; on a
    narrow viewport its own width could push past the screen edge and clip.
    Fixed with a `useLayoutEffect` that measures the flyout's
    `getBoundingClientRect()` against `document.documentElement.clientWidth`
    (not `window.innerWidth` — the two disagreed in this session's preview
    tooling, and clientWidth is the one that actually matches what the
    element is laid out/clipped against) after each open, flipping to
    `right-full` if it would overflow; resets to the rightward default on
    close so a later open re-measures fresh. Verified live at two widths:
    380px (flyout fits, stays `left-full`, measured rect fully on-screen)
    and 180px (flyout would have overflowed, correctly flipped to
    `right-full`).
  - **Fixes 4-9 — draw tool polish** (`ProfileDrawTools.tsx`, new pure
    helpers in `profileSketchMath.ts`; all presentational, re-derived fresh
    every render from `ui.profileEdges`/`ui.profilePlane`/local drag state —
    Manifesto Law 1/2 non-applicable, no new stored parameters):
    - Small marker dot at every chain joint (`collectChainVertices` dedupes
      each edge's start/end into a vertex list, rendered as a flat circle
      mesh) — confirmed rendering live via screenshot.
    - Closing-loop hollow-square indicator: a new `chainStartRef` captures
      the CURRENT chain's very first point (distinct from
      `chainPrevEdgeIdRef`'s "last" point) when a fresh chain begins; shown
      when the live effective end comes within 4" of that start point.
    - Equal-length/parallel alignment guides: while dragging, the live
      segment's chord length/direction is compared against every committed
      edge's (`edgeChordLength`/`edgeChordDir`, new pure exports); a match
      highlights that edge with a dashed cyan overlay. Purely additive to
      rendering — `resolveEffectiveEnd` (the actual committed-geometry math)
      is untouched, so this can never force a snap, only cue one visually,
      per the Order's explicit constraint.
    - Live readout smoothing: Line/Arc cursor tracking now coalesces
      pointermove events into one `setCursorUV` per animation frame (a
      `requestAnimationFrame`-scheduled flush, canceled on unmount).
      Freehand's raw per-event sampling is deliberately untouched — its
      fidelity is the drawn stroke itself, not just a readout.
    - Readout label repositioned off to the side of the dragged endpoint
      (offset along the plane's normal via new `offsetAlongNormal`, not a
      hardcoded world-up offset — stays correct for a future non-ground
      plane) instead of sitting on the segment's midpoint; padding tightened
      (`px-1.5 py-0.5`) for a visually smaller label while keeping
      `text-base` font size (CLAUDE.md's minimum-font-size rule applies to
      this overlay too — confirmed SketchTool's own live readout already
      follows the same rule, so this isn't a new exception).
    - Arc readout: appends a radius reading (`arcEdgeRadius`, reusing
      `sampleEdgePoints`'s own radius formula) when dragging an arc with a
      finite, reasonably-bounded radius.
    - Verified live via screenshot: vertex dot and repositioned label both
      visible and correctly placed on a real committed segment + live drag.
      The alignment-guide and closing-loop indicators are conditional (need
      a length/direction match or proximity to a chain's start respectively)
      and weren't independently triggered this session — same category as
      New Order 6.1's arc-preview note, code-reviewed and consistent with
      the rest of the file's patterns but needs Joey's real-mouse pass to
      see them trigger on-screen.
  - `npm run build`: clean, 0 TypeScript errors.
- New Order 6.3: Profile Polish Round 2 + Closed Loop + Species Fill.
  - **Fix 1 — right-panel tooltip clipping**: root cause was NOT just the
    preferred side overflowing the viewport (the New Order 6.2 flyout fix's
    scenario) — it was that `Tooltip.tsx`'s bubble was an absolutely-
    positioned DESCENDANT of `PropertiesPanel.tsx`'s scrollable,
    `overflow-hidden`/`overflow-y-auto` content area, so even a bubble that
    stayed fully inside the viewport could still get clipped by that
    ANCESTOR's overflow. `Tooltip.tsx` now renders its bubble through
    `createPortal` straight to `document.body` (`position: fixed`, measured
    against the trigger's own `getBoundingClientRect()` in a
    `useLayoutEffect`), so no ancestor's overflow can ever clip it — plus
    the same measure-and-flip edge-awareness `ToolRail.tsx`'s Transform/
    Create flyout already used (New Order 6.2), so it also never overflows
    the viewport itself. This is a single shared component, so the fix
    applies everywhere Tooltip is used, not just the Profile panel. Verified
    live: hovering the Freehand button (rightmost of the three, closest to
    the panel's inner edge) now shows its full "Click and drag to draw a
    hand-drawn stroke, release to commit it." bubble unclipped.
  - **Fix 2 — vertex dots too large**: `VERTEX_DOT_RADIUS` in
    `ProfileDrawTools.tsx` shrunk 0.9" → 0.3". Verified live via screenshot
    on a drawn chain.
  - **Fix 3 — live readout blocking the endpoint**: root cause was NOT the
    offset direction alone — New Order 6.2's `offsetAlongNormal` moved the
    label along the plane's normal, which is the SAME axis
    `ProfileCameraLock.tsx` locks the top-down Profile camera to. Moving a
    point along the axis the camera is staring straight down barely shifts
    it on screen at all, which is why the label still visually sat on the
    dragged point despite the 6.2 fix. Fixed by offsetting the label
    WITHIN the sketch plane instead — perpendicular to the live segment's
    own direction (`perp2D` of the live chord, real (u,v) inches, not a
    screen-space pixel hack) — which the top-down camera renders as an
    actual lateral shift. Padding tightened; CLAUDE.md's text-base minimum
    font size rule was kept (not violated) — "reduce its size" was achieved
    via tighter padding/shorter text, not a smaller font. Verified live:
    the readout now floats clearly beside the dragged point instead of on
    top of it.
  - **Fix 4/6 — alignment guide real behavior + single-best-match**:
    replaced the New Order 6.2 "highlight every matching edge" behavior
    with a single sticky best match (`resolveAlignmentMatch` in
    `ProfileDrawTools.tsx`) plus a new dashed connector `<Line>` drawn
    directly between the live segment's midpoint and the matched edge's
    midpoint (`edgeMidpoint`, new pure export in `profileSketchMath.ts`) —
    visually confirming the equal-length/parallel relationship instead of
    just tinting an edge. Resistance/hysteresis: once a match is "stuck"
    (tracked in a `stickyMatchIdRef`), it only releases once the live drag
    exceeds a WIDER release tolerance (0.25" / 6°) than the tolerance that
    triggered it (1/16" / 2°) — small jitter right at the boundary no
    longer flickers the guide on/off. Never touches `resolveEffectiveEnd`
    (the actual committed geometry), so it remains visual-only per the
    Order's explicit constraint. Verified live via screenshot during a
    real drawing sequence.
  - **Fix 5 — closing-loop square too large**: `SNAP_SQUARE_HALF` shrunk
    1.2" → 0.5". Verified live via screenshot.
  - **Fix 7 — arc mid-drag blowup**: investigated directly per the Order
    (not patched blind). Root cause: `computeTangentArcBulge` in
    `profileSketchMath.ts` computes `bulge = tan(angle/2)` where `angle` is
    the signed angle between the previous segment's tangent and the live
    chord. When the live cursor point lands directly behind the start
    point — anti-parallel to the tangent, i.e. dragging back through the
    segment's own anchor (the point that sits at the midpoint of the
    0-degree reference stub drawn through it, matching Joey's "dragged from
    its own midpoint" description) — that angle hits exactly +/-180
    degrees, and `Math.tan(Math.PI/2)` evaluates to a huge but FINITE float
    (~1.6e16, not Infinity/NaN, since floating-point `Math.PI/2` isn't the
    true mathematical pi/2). That huge-but-finite bulge then blows up the
    arc's computed radius/center in `sampleEdgePoints` (`sin(theta/2)`
    collapses to ~0), producing an astronomically distant arc that
    corrupts the preview. Fixed at the pure math source (Manifesto Law 4's
    Vector Isolation Rule, not a renderer patch): the tangent-chord angle
    is now clamped to +/-179.5 degrees before computing the bulge, so the
    radius stays large-but-bounded instead of blowing up. Verified live:
    dragging an Arc segment's cursor back past the start point along the
    reference-stub line no longer breaks the preview.
  - **Features 8/9 — snap-to-origin loop closing + species-filled auto-fill**:
    new `types.ts` `ProfileShape` (`{ id, edgeIds, species }` — references
    committed edges by id, never a duplicated copy of their geometry, per
    CAD_MANIFESTO.md Law 1). `store.ts` gained `ui.profileShapes` +
    `ui.selectedProfileShapeId`, `addProfileShape`/
    `updateProfileShapeSpecies`/`setSelectedProfileShapeId` actions, and
    `HistoryEntry`/`commitProject`/`undo`/`redo` were extended to snapshot
    `profileShapes` alongside `profileEdges` (same New Order 6.2 pattern,
    extended not duplicated) — closing a loop or swapping a shape's species
    is a real undo step. `ProfileDrawTools.tsx`'s Line/Arc/Freehand commit
    paths now share one `commitEdgeAndContinue` helper: if the current
    chain already has >= 2 committed edges (3 total including the closing
    edge — rejects closing with fewer than 3 points, per the Order) AND the
    live end lands within the existing closing-snap threshold (4") of the
    chain's own start point, the edge's end is snapped EXACTLY to that
    start point (not just left near it) and a `ProfileShape` is created
    from every edge in the chain. New pure exports in
    `profileSketchMath.ts`: `buildLoopPolygon` (walks a shape's ordered
    edge ids, sampling + deduping shared vertices into one closed polygon,
    re-derived fresh every render — never cached) and `triangulatePolygon`
    (plain ear-clipping triangulation, deliberately three.js-free to keep
    the kernel math pure per CLAUDE.md's One-Way Pipeline). A new
    `ProfileShapeFill` component builds a raw `THREE.BufferGeometry`
    directly from world-space positions (via `planeUVToWorld`, same
    pattern `BoardMesh.tsx` uses for its own engine-derived geometry) and
    renders it with `getWoodGrainTexture`/`getRoughnessTexture` keyed off
    the shape's own species (`materials.ts` — same catalog every other
    species picker uses, no second list). Verified live end-to-end: drew a
    3-segment triangle chain in the actual dev server, dragged back near
    the start point (the shrunk hollow-square indicator appeared exactly
    at the start point), committed the closing edge — the loop closed
    ("3 segments drawn") and immediately rendered as a solid
    Pine-grain-textured filled triangle.
  - **Feature 10 — instant species swap (Model + Profile)**: added a
    Species dropdown to `BoardEditPanel.tsx` (Model's Board Properties,
    previously had no species field at all) and made `ProfilePanel.tsx`'s
    Species control context-aware — with a Profile shape selected, it edits
    that shape's own species live (`updateProfileShapeSpecies`); with
    nothing selected, it falls back to setting `ui.profileMaterial` (the
    default for the NEXT shape closed), same as before. Profile shapes
    already re-derive their fill color fresh from `shape.species` every
    render (`ProfileShapeFill`'s `getMaterialByName` call), so that half
    needed no extra plumbing. **Bug found and fixed during live
    verification, not just code review**: `BoardEditPanel.tsx`'s species
    dropdown initially called `updateMember(id, { species })` alone and
    the board's grain color visibly did NOT change in the browser —
    `store.ts`'s `migrateMember` only derives `color` from species when
    `color` is MISSING (`m.color ?? mat?.color ?? '#d4a96a'` — its actual
    job is filling in a color field absent from old saves), so on an
    already-placed board the OLD color silently won every subsequent
    species change forever. Fixed by passing `color` explicitly in the same
    patch (`updateMember(id, { species, color: getMaterialByName(species)
    ?.color })`), matching the convention every other species picker in the
    app already follows (`store.ts`'s `setDrawMaterial` sets species+color
    together too) — never touched `migrateMember` itself, since its
    fill-in-if-missing behavior is still correct for legacy-save migration.
    Verified live: selected the test board, switched Species Pine ->
    Walnut -> Cherry in the dropdown — the board's wood grain color updated
    instantly in the viewport both times, with no re-placement.
  - **Feature 11 — right panel collapse, compact corner tab**:
    `PropertiesPanel.tsx`'s `PanelEdgeTab` redesigned from the New Order
    5.4 edge-straddling pill handle to a small square tab flush with the
    panel's top-right corner, showing a literal '«' (collapse) / '»'
    (expand) glyph instead of the shared `ChevronsIcon`, per the Order's
    reference screenshots. The collapsed strip's tab sits at its own top
    edge, reading as one slim '»' strip. Verified live via screenshot:
    corner tab visible top-right of the expanded panel; clicking it
    collapses to the thin strip with the '»' tab and vertical "PROPERTIES"
    label; expand round-trips correctly.
  - **Not independently verified live (documented pre-existing harness
    limitation, not a code concern)**: clicking a filled Profile shape to
    select it (`ProfileShapeFill`'s `onClick`). Confirmed this is the SAME
    known limitation every prior New Order has hit for 3D-canvas `onClick`
    interactions specifically (as opposed to `onPointerDown`/
    `onPointerMove`, which DO work headlessly — the entire triangle-drawing
    sequence above was verified this way) — tested directly this session by
    also trying to click-select/deselect the EXISTING BoardMesh (Model
    mode, unrelated to this Order's changes) via the same synthetic
    dispatch approach, and it failed identically, confirming the gap is in
    the preview tooling's synthetic-click pipeline (@react-three/fiber's
    `onClick` requires a real browser `click` event whose target matches
    the object hit on a genuine prior `pointerdown` — synthetic
    `dispatchEvent` calls don't reliably reproduce that chain), not in this
    session's new `ProfileShapeFill` code. Needs Joey's real-mouse pass.
  - `npm run build`: clean, 0 TypeScript errors.
- New Order 7: Template Mode — full rebuild + rename (supersedes New Orders
  6-6.3's "Profile" mode entirely; also completes what was tracked as
  6.4/Extrude).
  - **Rename**: "Profile" -> "Template" everywhere — `WorkspaceMode`/
    `ActiveTool` enum value, every `ui.*` field (`templatePlane`/
    `templateMaterial`/`templateDrawTool`/`templateEdges`/`templateShapes`/
    `selectedTemplateShapeId`), every store action
    (`setTemplateMaterial`/`setTemplateDrawTool`/`addTemplateEdge`/
    `addTemplateShape`/`updateTemplateShapeSpecies`/
    `setSelectedTemplateShapeId`), and the files themselves
    (`ProfileDrawTools.tsx` -> `TemplateDrawTools.tsx`, `ProfilePanel.tsx` ->
    `TemplatePanel.tsx`, `ProfileCameraLock.tsx` -> `TemplateCameraLock.tsx`,
    `profileSketchMath.ts` -> `templateSketchMath.ts`, `profileDrawState.ts`
    -> `templateDrawState.ts`). Rail shortcut changed P -> T (matching the
    new label); Line/Arc/Freehand gained their own L/A/F shortcuts
    (`TEMPLATE_DRAW_SHORTCUTS` in `App.tsx`, only live while
    `workspaceMode === 'template'`). Verified live: rail button reads
    "Template", mode badge reads "Template", pressing T enters/exits it.
  - **Teardown (Part 1)**: removed the persistent all-edges vertex-dot
    rendering (`collectChainVertices` is now called ONLY on the current
    in-progress chain's edges, and only rendered while a chain is actively
    being drawn — closing a chain or leaving the tool clears it, nothing
    lingers), removed the old closing-square/alignment-guide implementation
    in favor of the rebuilt versions below, and removed the lit
    `meshStandardMaterial` shape fill in favor of an unlit one. Confirmed
    surviving unchanged: the plane-lock/camera setup, the (u,v) edge data
    model, and the New Order 6.3 Model+Template species live-swap fix
    (re-verified live after the fill-rendering change).
  - **Drawing & snap system rebuild (Part 2, Revit-informed)**: new pure
    helpers in `templateSketchMath.ts` — `findOpenChainTips`/
    `walkChainToTip`/`findNearestOpenTip` (resume-after-Escape),
    `buildDimensionLine` (offset line + witness ticks), `buildAngleArc`,
    `findAxisAlignmentGuides` (general position guides, distinct from the
    kept equal-length/parallel sticky-match guide), `isAxisAlignedDeg` (the
    "X" precise-snap indicator).
    1. Live connection markers only while a chain is being drawn — verified
       live: drawing a chain shows joint dots, ending/closing it clears them.
    2. Distinct "X" (angle-snapped exactly onto the 0°/90° reference)
       vs. hollow-square (loop-closing) indicators, both small.
    3. Pixel-exact loop closing unchanged/reconfirmed: the closing edge's
       end is substituted with the chain's stored start point, never the raw
       cursor position — verified live (see extrude test below).
    4. Resume-after-Escape: `findOpenChainTips` treats any edge endpoint no
       other unshaped edge continues from as an open tip; hovering one (no
       draw action in progress) highlights it with an orange ring, clicking
       it calls `walkChainToTip` to rebuild the chain's edge-id list/root
       point and continues drawing from there — verified the underlying
       pure functions by hand-tracing a 3-edge open chain (root -> A -> B ->
       tip), and partially via live browser (drawing, Escape, and resuming
       to close a 4-edge shape all worked in one continuous test run) — a
       mid-session dev-server HMR reconnect reset in-memory UI state between
       later, separate test steps (not an app bug — zero real console
       errors the whole session), so a final confirm needs Joey's real-mouse
       pass; noted in DOVEDESIGN_ROADMAP.md's Up Next.
    5. Offset Revit-style dimension line: a line parallel to and offset from
       the live segment, with perpendicular witness ticks at each end and
       thin witness lines back to the actual endpoints, replacing the old
       on-segment/near-endpoint label.
    6. Angle arc: sweeps from the reference tangent to the live segment
       direction when the segment isn't orthogonal to it, labeled with the
       angle value on the arc.
    7. Persistent low-emphasis dashed horizontal/vertical reference axes
       through the plane origin, always on while sketching.
    8. General position-alignment guides (`findAxisAlignmentGuides`): dashed
       lines from the live endpoint to the origin or another committed
       vertex sharing its U or V coordinate, at most one per axis — visually
       distinct (neutral gray) from the equal-length/parallel guide (cyan).
    9. Equal-length/parallel guide: kept the New Order 6.3 single-
       sticky-match + hysteresis + connector-line behavior, renamed/
       reorganized in the new file.
    - Verified live end-to-end in one continuous test run: drew a 3-segment
      triangle chain via real pointer events, it closed correctly ("Segments
      drawn: 3", "Shapes closed: 1") and rendered filled. Separately
      confirmed closing is REJECTED with only 1 prior edge (tried to close a
      2-point chain — result: "Segments drawn: 2, Shapes closed: 0", i.e. it
      just added a normal continuing edge instead of forming an invalid
      shape).
  - **Rendering (Part 3)**: `TemplateShapeFill` now uses
    `meshBasicMaterial` (unlit) instead of `meshStandardMaterial` — verified
    live via screenshot: the closed triangle rendered as flat, evenly-lit
    true Pine color/grain with no lighting gradient, confirming it reads as
    real wood color rather than washed out. Extruding (below) hands off to
    the ordinary `BoardMesh.tsx` lit material path with zero special-case
    code, since the result is just a normal `WoodMember`.
  - **Extrude & hand-off (Part 4)**: new `store.ts` action
    `extrudeTemplateShape(shapeId, thicknessIn)` — re-derives the shape's
    polygon fresh via `buildLoopPolygon` (never a cached copy), computes its
    centroid as the new board's placement and every point relative to that
    centroid as `WoodMember.polygonPoints` (the pre-existing but previously
    unused `shapeType: 'customPolygon'`/`polygonPoints` fields in
    `types.ts`), removes the consumed shape + its edges from Template state,
    and commits the whole thing as ONE history entry (one undo step) before
    calling `setWorkspaceMode('model')` + `selectMember`. Required extending
    `CADGeometryEngine` (`src/core/Engine.ts`) — Manifesto Law 2 compliant,
    not a vertex-soup shortcut: `generateExtrudedPolygonPrimitive` builds a
    real Face/Wire/Edge topology (an N-gon top face, an N-gon bottom face,
    and one rectangular side face per polygon edge, the side faces reusing
    the EXACT existing `makeFace` box-face path), and `buildRenderMesh` was
    generalized to ear-clip triangulate any face with other than 4 boundary
    edges while every 4-edge face (every box face, and every extruded
    board's side faces) still takes the exact same hardcoded quad-fan path
    as before this change — a deliberate Breaking-Change-Audit-driven
    choice so no existing board's rendered output changes. `Face.id` widened
    from the box-only `StandardFaceId` union to `string` to allow
    `'top'`/`'bottom'`/`'side-N'` ids (mate constraints/annotations keep
    their own stricter `FaceId` typing — mates aren't defined for custom
    shapes). `BoardMesh.tsx` branches on `member.shapeType` to pick the
    right primitive generator; `BoardEditPanel.tsx` hides the now-derived-
    only Length/Width fields for a `customPolygon` board (Thickness and
    Species stay editable — Thickness genuinely drives the extrusion depth).
    Verified live: extruded a closed triangle, watched it exit to Model
    space fully lit and selected; opened Transform -> Move and nudged it
    with an arrow key (moved correctly); opened Transform -> Rotate and
    confirmed the Y-axis ring attached and rendered correctly on the custom
    shape — Select/Move/Rotate all worked with zero board-type-specific code
    in any of those three files, exactly as required.
  - **UI shell + panel (Part 5)**: new shared `CollapsibleSection.tsx`
    (extracted from `PropertiesPanel.tsx`'s previously-local implementation,
    now imported by both) backs `TemplatePanel.tsx`'s four grouped sections
    (Shape: species; Geometry: read-only segment count/closed-open status;
    Origin: read-only plane/offset; Extrude: thickness input + button).
    `ToolRail.tsx` picks up a thin orange border (the app's one active/
    drafting accent, existing token, not a new color) around the whole rail
    and its wordmark divider while Template mode is active — verified live
    via screenshot. Tooltips on Line/Arc/Freehand now include their L/A/F
    keyboard shortcut.
  - **Polish (Part 6)**: dimension-line styling used everywhere a length
    displays in Template mode (the one length readout there); orange
    reserved strictly for the live/drafting state (preview segment,
    dimension line, angle arc, rail accent) — no new colors introduced
    anywhere in this Order.
  - `npm run build`: clean, 0 TypeScript errors.
- New Order 7.1: Template Mode — precision, extrude, and Arc fixes (fixes/
  polish pass on New Order 7's rebuild, no bundled scope).
  - **Fix 1 — exact-match length snap**: new `snappedLength()` pure export
    in `templateSketchMath.ts` — when the live segment's length matches a
    committed edge within the existing alignment guide's own tolerance band
    (`LENGTH_RELEASE_TOL`), the committed length is substituted with the
    matched edge's EXACT chord length, same "substitute the exact value"
    pattern the pre-existing loop-closing snap already used (chainStart
    replacing the raw click point). New shared `applyLengthMatch()` helper
    in `TemplateDrawTools.tsx` applies this identically to both the live
    preview (so what's shown as "matched" is exactly what commits) and the
    actual commit path, for both Line and Arc. Previously a "matched"
    segment could commit anywhere within the guide's own tolerance window
    (Joey's observed 17-15/16" to 18-1/4" range against an 18" reference).
  - **Fix 2 — numeric length override during placement**: a digit keypress
    while a Line/Arc segment is mid-placement (start clicked, not yet
    committed) opens a pre-focused inline `<input>` overlay (reusing the
    dimension-line label's position), seeded with that digit; typing
    (digits/backspace/space/`/`/`"`/`'`/Shift) is native `<input>` text
    entry, no custom filtering needed. The live cursor keeps updating the
    direction underneath (the overlay plane's `pointermove` handler isn't
    blocked by the small input's own `pointerEvents: 'auto'` region). Enter
    commits at the typed length along whatever direction the cursor is
    currently pointing (Line: the existing tangent-relative angle-snap
    direction; Arc: the live chord direction, feeding the same 3-point bulge
    math as a normal click) through the SAME `commitEdgeAndContinue` path a
    click uses — tool stays armed for the next segment either way. Escape
    while editing cancels the whole in-progress chain (matching
    `SketchTool.tsx`'s established Tab-triggered-field precedent, where
    Escape-while-editing already meant "cancel the draw," not just "cancel
    the field").
  - **Fix 3 — vertex/origin dots removed**: the `circleGeometry` chain-joint
    dot mesh in `TemplateDrawTools.tsx` was deleted outright (not resized) —
    committed vertices now render as plain line joints only, even mid-draw.
    The global `axesHelper` origin marker (`Viewport.tsx`) is now hidden
    while `workspaceMode === 'template'` (it was the one remaining "dot"-
    like marker at the plane origin when viewed top-down/zoomed in, and
    Template already has its own low-emphasis dashed reference-axis
    crosshair through the same origin from New Order 7, so hiding the
    global marker there is "no marker, the existing crosshair takes over,"
    not a net loss of the reference).
  - **Fix 4 — distinct "aligned with opposite" indicator**: the axis-snap
    "X" marker is now unambiguously scoped to Line's own tangent/reference-
    axis intersection (0°/90° relative to the previous segment) and is no
    longer the only marker anywhere near a matched-edge relationship. A new
    cyan diamond marker (`buildDiamond()`, higher-contrast solid line, not
    dashed) renders at the live endpoint specifically when the live segment
    is PRECISELY parallel/antiparallel to the matched edge
    (`PRECISE_ALIGN_TOLERANCE_DEG = 0.15°`, much tighter than the loose
    2°/6° enter/release band that drives the existing cyan dashed
    highlight+connector guide) — the two cyan elements and the white X are
    now three visually distinct signals for three distinct facts (loosely
    matched vs. precisely aligned vs. on-axis).
  - **Fixes 5/6 — N-gon extrude + translucency, root-caused together**:
    two separate real bugs in `Engine.ts`, found by reading the pipeline
    (not patched blind, per Manifesto Law 4's One-and-Done Protocol):
    1. `buildRenderMesh`'s box-quad-vs-N-gon dispatch checked
       `face.outerWire.edges.length === 4`, which collided with any
       4-point (rectangle/quadrilateral) extruded footprint — its top/
       bottom face ALSO has exactly 4 boundary edges, so it was wrongly
       reconstructed via the box-rectangle formula (bounding-box corners
       via uAxis/vAxis/widthU/heightV) instead of the polygon's actual
       vertex positions. Fixed by dispatching on face IDENTITY
       (`face.id === 'top' || 'bottom'`, ids only `makePolygonFace` ever
       assigns) instead of incidental edge count — every polygon vertex
       count (3, 4, 5+) now shares one N-gon code path, no triangle-only
       special case plus a broken quad fallback.
    2. The real root cause of "renders translucent": a hand-drawn
       footprint's click order (CW vs. CCW) was never normalized anywhere,
       and `earClipTriangulate` preserves whatever winding it's given
       rather than normalizing it — so roughly half of all possible
       drawing orders produced backward-wound, backface-culled top/bottom
       faces (invisible from the expected viewing side — literally
       "translucent," you'd see through to whatever's behind). This also
       explains why a triangle "worked" in New Order 7's one live test: it
       depended on which way that specific triangle happened to be
       clicked, not on vertex count. Fixed by normalizing the footprint's
       winding once, at the pure math source
       (`generateExtrudedPolygonPrimitive`), via a new `polygonSignedArea`
       helper — reversing the input when its signed area indicates the
       wrong orientation, verified by direct cross-product derivation
       (`cross(edge1, edge2).y == -2 * polygonSignedArea(footprint)`).
       Also hardened `earClipTriangulate`'s ear-clipping loop with a fan-
       triangulation fallback for any vertices left over when clipping
       stalls (near-collinear/numerically-tricky hand-drawn points) — a
       stall previously silently dropped triangles, leaving a real hole
       (another way to render "translucent").
       **Verified numerically, not just by code reading**: a standalone
       Node script replicating the exact algorithm confirmed (a) WITHOUT
       the winding fix, triangle/rectangle/skewed-quad/pentagon/concave-
       hexagon footprints ALL produced fully backward (0% outward-facing)
       top+bottom triangles in their "as-clicked" winding, and only
       happened to work in the reversed order — reproducing the reported
       bug exactly, including that triangles are not actually special; (b)
       WITH the fix, every shape's every triangle is outward-facing in
       BOTH click orders. Live in-browser: extruded a real board via the
       Extrude button after this fix with zero console errors (see below).
  - **Fix 7 — redo determinism**: investigated directly rather than
    patched — `BoardMesh.tsx`'s geometry `useMemo` has exactly ONE code
    path (`CADGeometryEngine.generateExtrudedPolygonPrimitive` +
    `buildRenderMesh`) with no special-casing between a fresh mount and a
    redo-triggered remount, and Zustand's `undo`/`redo` restore the exact
    captured `project`/`templateEdges`/`templateShapes` object references
    with no re-derivation step in between. FOLLOWS-BOARD CHECK: yes,
    automatically — once that one pure pipeline is deterministically
    correct (Fixes 5/6), redo (which re-mounts through the identical
    pipeline from the identical stored parameters) is correct as a direct
    consequence, not a separate fix. The "distorted optical-illusion"
    symptom Joey observed is consistent with the SAME backward-winding bug
    Fix 6 root-caused, just made more visually obvious by a full remount
    forcing a fresh `BufferGeometry` build.
  - **Fix 8 — Model-only panel sections removed from Template**:
    `PropertiesPanel.tsx`'s "Board Properties" and "Entities" sections are
    now gated `activeTool !== 'template'` — Template's own Shape/Geometry/
    Origin/Extrude sections (`TemplatePanel.tsx`) are the only sections
    shown while in Template mode. Verified live via accessibility snapshot:
    entering Template shows exactly Shape/Geometry/Origin/Extrude, no
    Board Properties/Entities.
  - **Fix 9 — honest dimension readout for customPolygon boards**:
    `BoardMesh.tsx`'s 3D hover tooltip now reads
    "Bounding: W × D × T" for a `shapeType === 'customPolygon'` board
    instead of the same "L × W × T" format every rectangular board uses
    (which implied the shape itself was that rectangle). `BoardEditPanel.tsx`
    already hid the derived-only Length/Width fields for this shape type
    from an earlier Order — this fix was specifically the one remaining
    unconditional readout.
  - **Feature 10 — Arc tool reworked to a standard 3-point definition**:
    the old tangent-continuity bulge derivation (`computeTangentArcBulge`)
    is deleted entirely, replaced by a new pure `arcBulgeFrom3Points()`
    (fits a circle through start/via/end via the standard 2D circumcenter
    formula, derives the signed DXF-style bulge by sweeping from start's
    angle toward end's angle in whichever direction actually passes through
    via's angle first) and `mirrorPointAcrossChord()` for the flip control.
    Interaction: click 1 places the start (may resume an open chain tip,
    same as Line); click 2 places a point ON the arc (defines the bulge,
    does not commit); click 3 places the end and commits — reusing the
    existing `commitEdgeAndContinue` path (including loop-closing) exactly
    like Line's second click. New `ui.templateArcStage`
    ('start'/'via'/'end') and `ui.templateArcFlipped` store fields (reset
    on every tool switch via `setTemplateDrawTool`, and on chain-end via
    `endChain()`) drive a staged inline hint in `TemplatePanel.tsx`
    ("Place start point → place a point on the arc → place end point",
    updating per click) and a Tab-key-or-button Flip control (visible only
    once the via point is placed, mirrors the bulge to the opposite side of
    the live chord) — both the on-canvas button and the panel's button call
    the same store action, so there's one source of truth for the flip
    state. The old tangent-relative reference stubs/angle-arc/axis-snap-X
    overlays are now Line-only (that concept doesn't map onto a 3-point
    arc's independent via/end clicks); Arc's via-placement stage instead
    shows a plain straight guide line + length readout, and its end-
    placement stage shows the true live 3-point arc curve plus a thin
    dashed start→via→cursor construction guide (no dot at the via point,
    per Fix 3). **Verified live end-to-end via real pointer events on the
    actual running app** (not just code review): placed all 3 clicks of an
    Arc segment, confirmed the panel hint progressed
    start→via→end→(back to via, tool re-armed) exactly as designed, "Flip
    (Tab)" button appeared on-canvas + in-panel only once the via point was
    placed, "Segments drawn" incremented on the 3rd click, zero console
    errors throughout. Fix 2's numeric override was separately verified
    live the same way on Line: a digit keypress opened the inline field
    pre-seeded with that digit, typing further digits worked, Enter
    committed and incremented the segment count.
  - `npm run build`: clean, 0 TypeScript errors.
- New Order 7.2: Arc rework / numeric override for Arc / auto-close intent
  fix — a fixes pass on New Order 7/7.1's rebuild, no bundled scope.
  - **Fix 1 — auto-close was triggering unintentionally near sharp/acute
    vertices**: read the actual closing-detection code before touching
    anything (CAD_MANIFESTO.md Law 4's Vector Isolation Rule/investigate-
    before-patching) and confirmed the live bug report's stated root cause
    ("it's matching proximity to any prior vertex") was NOT what the code
    did — `commitEdgeAndContinue`'s `canClose` check only ever compared the
    live end against `chainStartRef.current` (the current chain's own start
    point), never any other committed vertex. The real problem was that the
    single threshold (`CLOSE_LOOP_THRESHOLD`, 4") that both showed the
    indicator AND armed the actual commit was too generous relative to
    segment lengths in a tight/acute shape — drawing a normal sharp interior
    angle can legitimately bring the live cursor back within 4" of the
    chain's own start point without the user ever intending to close there.
    Fixed (`src/components/TemplateDrawTools.tsx`) by splitting one radius
    into two: `CLOSE_LOOP_SHOW_THRESHOLD` (unchanged at 4", drives a dim,
    thin, `opacity: 0.4` preview of the hollow square so the user can see a
    close becoming possible) and a much tighter `CLOSE_LOOP_ARM_THRESHOLD`
    (0.75") that is the ONLY radius `commitEdgeAndContinue` checks when
    deciding whether a click actually closes the loop — `computeEndPlacement
    Overlays` now returns a `closingLoopArmed` boolean (true only inside the
    arm radius) alongside the existing `closingLoopCenter`, and the square's
    `<Line>` render intensifies (opaque, `lineWidth={3}`) only when armed,
    staying dim/thin otherwise — so the visual state always matches what a
    click will actually do, per the Order's explicit "no surprise on click"
    ask. The substitution mechanism itself (chainStart replacing the raw end
    point on an armed close) was left untouched, per the Order's
    instruction — only the trigger condition changed.
  - **Fixes 2/3 — Arc numeric override and 3-point rework**: investigated
    directly against the current codebase before writing any code (same Law
    4 gate) rather than assuming the Order's framing was still accurate, and
    found both were already fully implemented by New Order 7.1: `commit
    LengthOverride` in `TemplateDrawTools.tsx` already has a
    `templateDrawTool === 'arc'` branch (commits the typed length along the
    live chord direction into the same `buildArcFields`/`commitEdgeAndContinue`
    path a click uses), the digit-keydown-arm effect already allows arming
    while `templateDrawTool === 'arc' && arcViaPoint !== null` (i.e. during
    the end/3rd click, exactly where a typed length makes sense — Arc's via
    click isn't a length and is correctly excluded), and the Arc tool is
    already a true 3-point definition (`arcBulgeFrom3Points` in
    `templateSketchMath.ts`, wired through `handlePointerDown`'s 3-click
    state machine and `TemplatePanel.tsx`'s staged hint/Flip control) — not
    the tangent-continuity/radius-drag behavior the Order's live report
    described. Also confirmed explicitly (not assumed) that Arc chaining
    from an in-progress Line segment already works: `chainPrevEdgeIdRef`/
    `chainStartRef` are only reset by `endChain()`/a fresh disconnected
    click, never by the tool-switch effect (which only clears the local
    `arcViaPoint`), so finishing a Line segment then switching to Arc mid-
    chain continues from the same last-committed point with no extra code
    needed. No redundant rewrite was made — re-implementing already-correct
    code would have violated the Order's own "investigate first" framing as
    much as skipping the investigation would have. The live report's
    "wrestle the bulge into position" description is most likely explained
    by Fix 1's auto-close bug interrupting Arc chains near a shape's start
    point during testing, and/or by testing against a build that predated
    7.1's Feature 10 landing in the working tree — not a separate, still-
    open code defect found this session.
  - **Not independently verified live this session**: this session's
    headless preview tooling could not drive the 3D canvas at all — the
    R3F `<canvas>` element measured a default, un-resized 300x150 CSS box
    (`canvasWH: [300,150]`) rather than filling its container, so no
    synthetic pointer coordinate could be mapped to a meaningful plane
    (u,v) point (a different failure mode than prior sessions' "click
    events don't reach R3F's raycaster" limitation — this time even
    pointermove-based dragging, which worked in several earlier Orders, had
    no usable canvas to target). Confirmed unrelated to app health: `npm
    run build` is clean, zero console errors/warnings on load or during
    Template-mode navigation, and the surrounding UI (rail buttons, panel
    sections, dropdowns) all responded correctly to real click events via
    the accessibility tree the whole session. Fix 1's threshold-split logic
    and Fixes 2/3's already-existing-code conclusion are both grounded in
    direct source reading (including the store wiring for
    `templateArcStage`/`templateArcFlipped`/`setTemplateDrawTool`), not
    guesswork, but the actual on-screen feel needs Joey's real-mouse pass —
    see Up Next.
  - `npm run build`: clean, 0 TypeScript errors.

- New Order 8: Dimension Lines + Reference/Measuring Lines — two new
  board-face-attached entity types, real selectable entities per
  CAD_MANIFESTO.md Law 1/2 (delete explicitly out of scope this Order per
  the prompt; hide/edit built, schema doesn't preclude delete later).
  - **Data model**: `types.ts`'s existing (dormant since the Samson reset —
    no rendering component ever consumed it) `DimensionLine` interface was
    redefined to the parametric shape the Manifesto requires: `anchorMemberId`
    + `anchorFaceId` (string — widened rather than the stricter `FaceId`
    union so a customPolygon extruded board's `'top'`/`'bottom'`/`'side-N'`
    face ids fit the same field without a parallel type) + `startUV`/`endUV`
    (face-local (u,v), never world coordinates) + a new `offsetUV` (signed
    perpendicular distance — the 3rd click) + a `visible` tri-state
    (`undefined`/`true`/`false`) for the Entities list toggle. New
    `ReferenceLine`/`ReferenceLinePoint` types store two endpoints, each a
    face-local (u,v) point plus a `snapped` boolean — exactly what New Order
    9's future cut-plane tool needs to consume, with no schema growth
    expected. `Project.referenceLines: ReferenceLine[]` added alongside the
    existing `dimensionLines` array; both are pruned on `removeMember`/
    `splitMemberByCrossCut`/`splitMemberByRipCut` the same way
    `dimensionLines` already was (Phase 19's cross-cutting-pattern fix,
    extended not duplicated).
  - **Click-to-face-UV resolution**: new `src/lib/boardFaceMath.ts` (pure,
    zero three.js dependency beyond Engine.ts's own Vector3D shape) —
    `getMemberFaces()` reuses the EXACT box-vs-extruded-polygon Face-list
    dispatch `BoardMesh.tsx` already uses for its own geometry (never a
    second derivation that could disagree), `resolveFaceClick()` matches a
    raycast hit's board-LOCAL point + board-LOCAL face normal (both spaces
    three.js's Raycaster already reports in, before any world transform)
    against that Face list by nearest-normal, then projects onto the
    winning face's (u,v) via Engine.ts's existing `projectLocalToUV`/
    `clampUV` (no new projection math). `snapUVToEdge()` (Reference Line
    only) pins (u,v) exactly onto the nearest face boundary when within a
    tight threshold, else returns it unchanged with `snapped: false`.
  - **Click routing**: `BoardMesh.tsx`'s existing click handler gained a
    branch ahead of its Select/Move gate — while `activeTool` is `'measure'`
    (Dimension Line) or `'referenceLine'` (Reference Line, new `ActiveTool`
    value), a click resolves via the above instead of selecting the board,
    and dispatches to new store actions (`handleDimensionLineClick`/
    `handleReferenceLineClick`) that advance a click-sequence draft living in
    `ui.dimensionDraft`/`ui.referenceDraft` (plain `{memberId, faceId, uv...}`
    parameter objects, same "never a world-space point" convention
    `PendingInteraction` already established for other multi-click tools) —
    click A, click B, click 3 sets the offset (`computePerpOffset`, a new
    generic export in `templateSketchMath.ts`) and commits; Reference Line
    commits on its 2nd click. A draft with an `editingId` set (from the
    Entities list's Edit button) UPDATES that existing line instead of
    creating a new one — the "re-drag its points/offset" edit flow, without
    a separate drag-handle system this Order's scope didn't call for.
    Escape (App.tsx) cancels an in-progress draft first, same "undoes the
    pending point, never deletes committed lines" precedent as Template's
    own chain cancel — checked directly against `ui.dimensionDraft`/
    `referenceDraft` rather than a singleton-registration file, since this
    draft lives in the store (not a local component ref).
  - **Rendering — parented, live-recomputing**: new
    `src/components/BoardAnnotations.tsx`, mounted once in `Viewport.tsx`
    alongside the other always-mounted tool components. Renders one
    `<group position={member.position} rotation={member.rotation}>` per
    board containing that board's own dimension/reference lines (plus any
    in-progress draft belonging to it) — every (u,v) point converts to
    board-LOCAL 3D via `projectUVToLocal`, and Three.js's own scenegraph
    recomputes world position from the group's live position/rotation props
    every frame, so a moved/rotated board carries its annotations with it
    with zero manual matrix code (FOLLOWS-BOARD CHECK: yes, automatically).
    A Dimension Line's offset-line + witness-tick geometry reuses
    `templateSketchMath.ts`'s existing `buildDimensionLine` — the exact
    function Template mode's own live segment readout already uses (New
    Order 7) — per the Order's explicit "reuse, don't rebuild" instruction;
    the measured length billboards via a drei `<Html>` label the same way
    Template's readout does. A Reference Line's snapped end renders a small
    white "X"; its free end renders a single diagonal tick — visually
    distinct per the Order.
  - **Default-view visibility rule**: new `isEntityLineVisible()` in
    `boardFaceMath.ts`, shared by `BoardAnnotations.tsx` (the renderer) and
    `PropertiesPanel.tsx`'s Entities list (the hide/show toggle) so both
    always agree — a line shows only while its own board is selected,
    UNLESS its `visible` field has been explicitly toggled `true` (always
    shown) or `false` (always hidden) via the Entities list.
  - **Entities list integration**: `PropertiesPanel.tsx`'s existing
    `EntitiesSection` (previously boards only) now also lists every
    dimension line ("Dimension: 24" (Board Name)", live length via
    `formatFractionalInches`) and reference line ("Reference (Board Name)"),
    each with a Hide/Show eye toggle (`setDimensionLineVisibility`/
    `setReferenceLineVisibility`), an Edit button (`startEditDimensionLine`/
    `startEditReferenceLine` — arms the matching tool with an `editingId`
    draft seeded from the existing line), and a Select button (highlights it
    orange via `selectedDimensionLineId`/`selectedReferenceLineId`) — no
    Remove/delete button, per the Order's explicit scope. The header count
    (`Entities (N)`) now sums boards + dimension lines + reference lines.
  - **Rail + shortcuts**: `ToolRail.tsx` gained a new "Annotate" flyout group
    (Dimension + Reference), same group pattern as Transform/Create.
    `App.tsx`'s `MODEL_TOOL_SHORTCUTS` map gained `d` -> `'measure'`
    (Reference has no letter shortcut yet — R/M/etc. are already taken).
    `workspaceModes.ts`'s `MODE_TOOLS.model` gained `'referenceLine'`
    (`'measure'` was already present but dormant), `TOOL_LABELS` updated
    (`measure` relabeled "Dimension Line", `referenceLine` added), and
    `getHintText` (itself currently unwired/dormant — no consumer renders
    it yet, pre-existing before this Order) got real Dimension/Reference
    Line cases instead of the old `measureStartPoint`-based stub.
  - `npm run build`: clean, 0 TypeScript errors.
  - **Not independently verified live**: this session's headless preview
    tooling could not drive the 3D canvas at all — `document.querySelector
    ('canvas').getBoundingClientRect()` measured a default, un-resized
    300x150 CSS box, the SAME symptom New Order 7.2's session hit (a
    pre-existing tooling limitation, confirmed unrelated to this Order's
    code — `npm run build` is clean and the surrounding UI responded
    correctly to real click events via the accessibility tree the whole
    session: the new "Annotate" rail group opens showing Dimension/
    Reference buttons, picking either correctly switches the panel header
    label and shows the new hint text, Entities count summed boards
    correctly). The actual click-to-face-UV resolution, the 3-click
    Dimension Line flow, edge-snapping on Reference Line, and the
    board-parented live-follow rendering all need Joey's real-mouse pass —
    see Up Next.
- New Order 8.1: Dimension/Reference Line fixes pass on New Order 8's
  implementation — same investigate-first approach as prior fixes passes
  (CAD_MANIFESTO.md Law 4), not blind patches.
  - **Root cause, Fixes 2 + 3 together**: read the actual click-handling
    code before touching anything. `BoardMesh.tsx`'s click handler was
    re-resolving EVERY click of a multi-click sequence via a fresh raycast
    hit against the bounded board mesh, and `store.ts`'s
    `handleDimensionLineClick`/`handleReferenceLineClick` treat a changed
    `faceId` between clicks as "the user started a brand-new line,"
    silently discarding whatever was already placed. Clicking near an edge
    or clearly off to the side of a segment (exactly what edge-snapping and
    setting a dimension's offset both require) very easily raycasts onto a
    DIFFERENT adjacent face of the same box — verified numerically with a
    standalone Node script (not just read-and-assume): simulating a click 3
    inches above a 1.5"-thick board's front face resolved to the TOP face,
    not the front face the user was actually measuring on, which is exactly
    what would silently reset the draft and explain both "the 3rd click
    does nothing" (Fix 2) and "no reference line ever finishes, so no
    marker ever appears" (Fix 3 — the SAME underlying defect, as the Order
    predicted it might be). Root-caused, not patched: past the first click,
    every further click must resolve against the SAME already-established
    face, never re-derive one. New `ContinuationPlane` component in
    `BoardAnnotations.tsx` — built directly from the established `Face`'s
    own `origin`/`uAxis`/`vAxis`/`normal` (already board-local per
    CAD_MANIFESTO.md Law 1/2, no new coordinate system), an invisible plane
    (same "meshBasicMaterial transparent opacity 0" catcher-plane pattern
    `TemplateDrawTools.tsx` already uses) sized generously past the board's
    actual edges so a large intentional offset or a point near a long
    board's far end both work. `BoardMesh.tsx`'s own click handler now only
    ever handles the FIRST click of a sequence (guarded by `!dimensionDraft`
    / `!referenceDraft`); the ContinuationPlane handles everything after.
    Re-ran the same standalone Node script against the NEW locked-plane
    projection math: the 3-inches-above click now correctly stays on the
    original face and produces a real nonzero perpendicular offset,
    confirming the fix numerically, not just by code reading.
  - **Fix 1 (no edge-snap on either tool)**: `BoardMesh.tsx`'s Dimension
    Line click branch never called `snapUVToEdge` at all — Reference Line
    did call it, but at the New Order 8 threshold (0.75"), which live
    testing/re-reading confirmed is too tight for a real click at normal
    camera distance to reliably trigger. Fixed: Dimension Line's first
    click (and, via the ContinuationPlane above, its 2nd click) now also
    calls `snapUVToEdge`; the threshold moved to a single shared
    `EDGE_SNAP_THRESHOLD = 2` export in `boardFaceMath.ts` (used by both
    tools and both click stages), in the same spirit as Template mode's own
    generous click-precision tolerances (e.g. `RESUME_THRESHOLD = 3`) while
    staying well under half a typical board's width so it never fires near
    the middle of a face.
  - **Fix 4 (Entities list selection had no deselect)**: read how board
    selection already deselects — clicking empty viewport space
    (`Viewport.tsx`'s `onPointerMissed`) or Escape (`resetToolState`,
    which already cleared `selectedDimensionLineId`/`selectedReferenceLineId`
    since New Order 8). `onPointerMissed` now also calls
    `selectDimensionLine(null)`/`selectReferenceLine(null)`, the exact same
    pattern already used there for `selectMember(null)` and
    `setSelectedTemplateShapeId(null)` — no new selection/deselect system.
  - **Verified unaffected (re-confirmed by reading, not assumed)**: the
    per-board `<group position rotation>` parenting (BoardAnnotations.tsx)
    that keeps lines attached through Move/Rotate was not touched by any of
    these fixes; the Entities list's Hide/Show toggle (`isEntityLineVisible`)
    is independent of the click-routing changes above.
  - `npm run build`: clean, 0 TypeScript errors.
  - **Not independently verified live via real clicks**: same pre-existing
    headless-canvas limitation as New Order 8's own session —
    `document.querySelector('canvas').getBoundingClientRect()` still
    measured a stuck default 300x150 box this session too, confirmed
    unrelated to this fixes pass (fresh page load, zero console errors).
    In place of live 3D interaction, the root cause and fix for Fixes 2/3
    were verified with a standalone Node script (`node` reimplementation of
    `resolveFaceClick`/the locked-plane projection/`computePerpOffset`,
    same precedent as New Order 7.1's Fix 5/6 numeric verification) showing
    the OLD code resolving to the wrong face and the NEW code staying
    locked to the right one with a real nonzero offset. Fixes 1 and 4 are
    small, direct, well-understood changes (a threshold constant, wiring an
    existing snap call, wiring two existing deselect actions into an
    existing empty-click handler) verified by reading the modified code
    paths end-to-end. Joey's real-mouse pass is still the final word — see
    Up Next.
- New Order 8.2: Dimension/Reference Line live preview, off-board offset,
  snap re-verification.
  - **Root cause, Fixes 1 + 3 + 4 together**: re-read New Order 8/8.1's
    actual `BoardMesh.tsx`/`BoardAnnotations.tsx` code before touching
    anything (Law 4). Neither tool's `ContinuationPlane` (New Order 8.1) nor
    `BoardMesh.tsx` ever had an `onPointerMove` handler — only `onClick`. So
    between clicks there was literally NO state tracking the cursor at all;
    the only thing that ever changed was `ui.dimensionDraft`/`referenceDraft`
    themselves, and only on an actual click. This fully explains "no live
    rendering during placement" (Fix 3) and is the same underlying gap
    behind "edge snapping seems to do nothing" (Fix 4 — with no preview
    reflecting it, a working snap and a broken one look identical) — and is
    the most likely explanation for Fix 1's "only renders after switching
    tools" report: with zero cursor-driven feedback the whole time a line was
    being placed, a completed line's actual appearance was easy to miss/
    attribute to the next unrelated action, since nothing visibly happened up
    to that point. Fixed by giving `ContinuationPlane` a real
    `onPointerMove` handler (rAF-coalesced, same pattern as
    `TemplateDrawTools.tsx`'s `pendingCursorUVRef`/`cursorRafIdRef`/
    `flushCursorUV`) that updates NEW local component state
    (`dimCursorUV`/`refCursorPoint` in `BoardAnnotationGroup` — local, not
    pushed into the Zustand store, same "ephemeral drag state stays local"
    precedent Template's own `cursorUV` already set) on every frame, and two
    new live-preview renderers reading that state:
    - `LiveDimensionPreview`: before point B, a dashed segment from point A
      to the live cursor with a live length label; after point B (awaiting
      the offset), rebuilds the SAME `buildDimensionLine` geometry the
      committed line uses, fed a live `computePerpOffset(start, end,
      liveCursorUV)` every frame — the offset line, witness ticks, and label
      all visibly track the cursor before the 3rd click.
    - `LiveReferencePreview`: dashed segment from the committed start point
      to the live cursor, with the live endpoint's marker switching between
      the snapped ("X") and free (diagonal tick) style AS THE CURSOR MOVES
      (reusing the existing `EndpointMarker`), not just decided at commit.
    - Confirmed (Fix 4's "investigate the detection logic directly" ask):
      re-read `snapUVToEdge` and the click/hover clamp+snap wiring end to
      end — the underlying edge-proximity math itself was already correct
      (New Order 8.1's Node-script verification still holds); the missing
      piece really was the render feedback loop, not a second detection bug.
  - **Fix 2 (offset must work off the board)**: `CONTINUATION_PLANE_HALF`
    widened from 75 to 150 (matching the fixed grid's own half-extent) so a
    Revit-style offset click well past the board's physical edge always has
    room; points 1/2 are UNCHANGED — still clamped to the actual face
    bounds + edge-snapped in both the click-commit AND the new hover-preview
    callbacks, per the Order's explicit "points 1 and 2 still require an
    on-board/on-edge click" instruction. Only the offset (3rd) click/hover
    stays raw/unclamped, exactly as New Order 8.1 already established.
  - **Verified unaffected (re-confirmed by reading, not assumed)**: the
    offset commit math (`computePerpOffset`) and edge-snap detection
    (`snapUVToEdge`) themselves are untouched — only reused for live preview,
    not reimplemented; Entities-list deselect (`onPointerMissed`) and the
    per-board `<group position rotation>` parenting are both outside the
    files touched by this Order.
  - `npm run build`: clean, 0 TypeScript errors.
  - **Not independently verified live via real clicks**: same pre-existing
    headless-canvas limitation as New Orders 8/8.1 — the preview's 3D canvas
    is still stuck at a default 300x150 box this session too (confirmed via
    a fresh page load, zero console errors). The live-preview render logic
    was verified by direct code reading (the same `buildDimensionLine`/
    `computePerpOffset`/`snapUVToEdge` functions New Order 8.1's Node script
    already validated, now fed from a per-frame cursor state instead of only
    a click), not by watching it move on screen. Joey's real-mouse pass is
    the first real confirmation this session couldn't provide — see Up Next.
- New Order 8.3: Cursor Snap Marker + Full-Edge Snap Targets.
  - **Fix 1 (corner-to-corner diagonal instead of a straight edge
    measurement)**: read `snapUVToEdge` (`src/lib/boardFaceMath.ts`) before
    touching anything (Law 4). It already snapped a point to the nearest
    point ALONG an edge (not just an edge's two endpoints) — but only ever
    checked the 4 boundary lines of whichever single Face the click had
    already resolved onto. Near a corner, two of those 4 lines can be nearly
    equidistant from the cursor; since a Dimension/Reference Line's two
    points each independently re-run this same check, one point could win
    against a different boundary line than the other, so two clicks meant
    to run along ONE edge could silently resolve onto two DIFFERENT edges —
    producing the reported diagonal. Root-caused and fixed by generalizing
    the candidate set from "this face's 4 lines" to the BOARD's full 12-edge
    set: new `getBoardEdges3D` (`boardFaceMath.ts`) derives every edge of the
    board in 3D solid-local space by walking each Face's own 4 corners and
    de-duplicating the edges two adjacent faces share (every edge borders
    exactly 2 faces, so this can never diverge from the Face topology
    BoardMesh.tsx's own geometry already uses); new
    `nearestPointOnBoardEdges` finds the true nearest point among ALL 12,
    via real point-to-segment-in-3D math, not 4 independent per-axis
    distances. `snapUVToEdge`'s signature grew a `faces: Face[]` parameter
    (both call sites — `BoardMesh.tsx`'s first-click handler and
    `BoardAnnotations.tsx`'s `ContinuationPlane` callbacks — already had this
    list on hand) but its behavior for a point already near one of the
    current face's own edges is unchanged; the fix only changes outcomes
    where the true nearest edge wasn't one of that single face's 4. The
    winning 3D point is re-projected back onto the CURRENT face's own (u,v)
    via forward projection (VECTOR_PROJECTION_MATH.md section 2), which is
    valid regardless of which face the winning edge is normally associated
    with, since it's just a dot product against that face's own basis.
  - **Fix 2 (no live cursor marker, only the raw system cursor)**: before
    this Order, nothing tracked the cursor at all before a line's FIRST
    click — `BoardMesh.tsx` only had `onClick`, no `onPointerMove`, so there
    was no feedback distinguishing "where the mouse is" from "where a click
    would actually land" (post edge-snap) until AFTER the first point was
    already committed and `BoardAnnotations.tsx`'s per-draft preview state
    (New Order 8.2) took over. Fixed by adding a real, rAF-coalesced
    `onPointerMove` handler directly to `BoardMesh.tsx`'s mesh (same
    coalescing pattern `ContinuationPlane` already uses), computing the
    exact same resolved-face + snapped-(u,v) hit the click handler commits
    (factored into one shared `resolveMeasureHit`, so the marker and the
    eventual commit can never disagree) — active only while the matching
    tool (`measure`/`referenceLine`) is selected AND no draft exists yet for
    it (once a draft exists, `ContinuationPlane` already owns every further
    click/hover, per New Order 8.1's face-locking fix). The marker itself
    reuses `BoardAnnotations.tsx`'s existing `EndpointMarker` (exported, not
    duplicated) — the same small "X" (snapped) / diagonal-tick (free) glyph
    already used for every later point of the same draw and for Reference
    Line's own live end (New Order 8.2) — so there is exactly one marker
    visual language across the whole draw, first click included. Rendered
    as a child of the board's own mesh, so it inherits the board's live
    position/rotation automatically, same as every other board-relative
    overlay in this file. Dimension Line's `LiveDimensionPreview` (New Order
    8.2) also gained this same marker at the point-2 stage (the point a
    click would commit right now, reusing `EndpointMarker` instead of just a
    dashed line + label) and at the offset stage (marking the raw cursor
    position that determines the perpendicular offset — always a free/tick
    glyph, since offset clicks are never edge-snapped, per New Order 8.2).
  - **Verified unaffected (re-confirmed by reading, not assumed)**: the
    offset click's widened `CONTINUATION_PLANE_HALF` working area (New Order
    8.2) and the commit-time math (`computePerpOffset`, `buildDimensionLine`)
    are untouched — only the snap CANDIDATE SET changed, not the offset or
    commit pipeline; Reference Line's existing X/tick switch-on-commit logic
    is unchanged, now simply fed by the corrected snap.
  - `npm run build`: clean, 0 TypeScript errors.
  - **Not independently verified live via real clicks**: same pre-existing
    headless-canvas limitation as every New Order 8.x session — the preview
    tooling's 3D canvas is still stuck at a default 300x150 box. The 12-edge
    snap math and the marker's render wiring were verified by direct,
    end-to-end code reading against the existing `snapUVToEdge`/projection
    functions New Order 8.1's standalone Node script already numerically
    validated (this session did not re-run that script, since the change is
    a candidate-set generalization over the same already-verified
    projection primitives, not new projection math), not by watching a real
    drag on screen. Joey's real-mouse pass is the first real confirmation —
    see Up Next.
- New Order 8.4: Cross-Dimension Offset, Free Placement, Shortcuts.
  - **Fix 1 investigation (offset direction)**: read `computePerpOffset`/
    `buildDimensionLine` (`templateSketchMath.ts`) end-to-end before touching
    anything (Law 4) — both are already fully general: the offset direction
    is `perp2D` of the LIVE, freshly-computed A-B chord (not a hardcoded
    axis), which is a correct 90-degree in-plane rotation for ANY chord
    angle because `face.uAxis`/`face.vAxis` are always unit-length and
    mutually orthogonal by construction (`Engine.ts`'s `makeFace`/
    `makePolygonFace`, confirmed by reading every face definition in
    `generateBasePrimitive`/`generateExtrudedPolygonPrimitive`). Verified
    numerically, not just by reading: a standalone Node script
    (`dim_repro.js`, reimplementing the exact formulas) computed a
    length-direction dimension (segment along a face's U axis) AND a
    cross/width-direction dimension (segment along V, including an offset
    click on the opposite side) — both produced correct, oppositely-signed,
    non-degenerate offsets. This was re-confirmed live through the real
    store this session (`handleDimensionLineClick` called directly with a
    width-direction A/B and a small offset click): the persisted
    `offsetUV` came back correctly signed and non-zero. So the direction
    formula itself was not the defect the Order hypothesized — it was
    already general as of New Order 8.2's rewrite. What live testing DID
    surface as a real, verifiable gap: a click landing very close to the
    measured segment (much easier to do on a short ~3.5" width measurement
    than a 30"+ length one, simply because there's less on-screen room)
    persists as a technically-correct but visually negligible offset that
    reads as "sitting on the edge." Fixed with a new
    `clampOffsetMagnitude`/`MIN_DIMENSION_OFFSET` (1", comfortably larger
    than `DIM_TICK_HALF`'s 0.35") in `templateSketchMath.ts` — floors the
    offset's magnitude while preserving its sign/side, applied at commit
    (`store.ts`'s `handleDimensionLineClick`) AND in the live preview
    (`BoardAnnotations.tsx`'s `LiveDimensionPreview`, so what previews
    live is exactly what commits, same precedent New Order 8.2 established
    for the offset/snap functions). Verified live via the real store: an
    offset click only 0.1" off the line committed as exactly -1" (the
    floor, sign preserved); a genuinely far offset click (3") committed
    unchanged at 3", confirming the floor only engages when needed.
  - **Fix 2 investigation (Dimension Line free placement)**: read
    `BoardMesh.tsx`'s click/hover handlers and `BoardAnnotations.tsx`'s
    `ContinuationPlane` end-to-end. Found Dimension Line and Reference Line
    already share the exact same free-placement pipeline at every stage:
    the first click of EITHER tool resolves through the same
    `resolveMeasureHit` (`resolveFaceClick` + `clampUV` + `snapUVToEdge`,
    `EDGE_SNAP_THRESHOLD = 2`), and every click after that goes through the
    same `ContinuationPlane.onPick`, which applies the identical
    `clampUV`+`snapUVToEdge` pattern for non-offset points on BOTH tools
    (`BoardAnnotations.tsx` lines ~183-236) — a click within 2" of an edge
    snaps, otherwise it is used raw/free, clamped only to the face's own
    extent, for both tools identically. This parity was already established
    by New Order 8.1's Fix 1 (which explicitly unified the two tools onto
    one shared `EDGE_SNAP_THRESHOLD` and gave Dimension Line's first click
    the same `snapUVToEdge` call Reference Line already had). No code
    change was needed or made for Fix 2 — per Law 4, patching already-
    correct code to "look busy" would be exactly the anti-pattern the
    Manifesto forbids. If Joey still sees Dimension Line's points refusing
    free placement after this session, it points at something outside this
    code path (e.g. a stale dev-server bundle) rather than the click-
    resolution logic itself.
  - **Fix 3 (keyboard shortcuts)**: audited `App.tsx`'s
    `MODEL_TOOL_SHORTCUTS` and found Dimension Line already had `d` (added
    silently as part of New Order 8's own work — `ToolRail.tsx`'s
    `DIMENSION` tool def already advertised `shortcut: 'D'`). Only
    Reference Line was missing one (`ToolRail.tsx`'s `REFERENCE` def had
    `shortcut: ''`). Added `x` (matching AutoCAD's `XLINE`/`XL` convention
    for a construction/reference line — a real, recognizable mnemonic, not
    an arbitrary letter), confirmed unused across every existing binding
    (Model tools, Template's L/A/F, Shift+D, Ctrl+Z/Y). Scoped identically
    to every other `MODEL_TOOL_SHORTCUTS` entry (`if (inTemplate) return;`
    before dispatch) — Reference Line is a Model-space-only tool per
    `workspaceModes.ts`'s `MODE_TOOLS.model`, so this already matches the
    Order's "active only in the workspace/mode where these tools apply"
    requirement without any new gating code. Verified live via the real
    browser: hovering the Reference flyout button now shows "Reference (X)"
    in its tooltip, and dispatching a real `x` keydown against the running
    app set `ui.activeTool` to `'referenceLine'` (confirmed by reading the
    live store state, not just the panel's header text) — re-confirmed `d`
    (Dimension) and `s` (Select) still work correctly alongside it, no
    regression.
  - `npm run build`: clean, 0 TypeScript errors.
  - **Verified live this session** (via the Browser preview's JS console
    driving the real Zustand store directly — the 3D canvas itself is still
    stuck at a default 300x150 box in this environment, same limitation
    every prior 8.x session hit, so raycast/click-on-mesh interaction
    couldn't be exercised through real mouse events): Fix 1's offset-
    flooring behavior end-to-end through `handleDimensionLineClick`, and
    Fix 3's shortcut wiring end-to-end through real `KeyboardEvent`
    dispatch. Fix 2 required no code change (see above). Joey's real-mouse
    pass in an actual browser is still the first confirmation of the full
    click-to-raycast interaction path — see Up Next.
- New Order 10: Ribbon Skeleton (Replaces Left Rail) — Part 1 of a 3-part UI
  overhaul (10 / 10.1 / 10.2, deliberately split per the project's own
  lesson about bundling too much per session). This Order relocates
  existing triggers only; no tool's click behavior changed.
  - **New `src/components/Ribbon.tsx`** replaces `src/components/
    ToolRail.tsx` (deleted — fully superseded, nothing else imported it).
    `ToolRail.tsx`'s old `RAIL_ITEMS` (Select as a lone top-level item,
    Transform/Create/Annotate as groups, Template as a lone top-level item)
    map directly onto 6 ribbon tabs (`RIBBON_TABS`): Select/Modify,
    Transform, Create, Annotate, Template, and a new Help tab (reserved
    placeholder only, per this Order's explicit scope — New Order 10.2
    builds its content). `pickTool` — the function that actually calls
    `setActiveTool`/`setWorkspaceMode`, including Template's click-again-
    to-exit special case — is copied verbatim from `ToolRail.tsx`, so every
    tool fires exactly the same way it did before. Icon components are
    also copied verbatim (same SVGs), plus one new `IconHelp`.
  - **Tab/panel model**: a horizontal tab strip (wordmark + mode badge,
    then the 6 tabs) with the currently-open tab's button row revealed as a
    second strip directly beneath it, Revit-style, with a small caption
    (`panelLabel`, e.g. "Transform", "Geometry", "Annotations") under the
    row. A lone-tool tab (Select/Modify, Template — `tools.length === 1`)
    fires its tool immediately on click, same as the old top-level rail
    button; a group tab (Transform/Create/Annotate) or Help only reveals
    its panel row, same as the old flyout trigger, and a specific tool
    fires only when its own button inside that row is clicked. Local
    `openTabId` (ephemeral UI state, same "not board state, stays out of
    the Zustand store" precedent as the old `openGroupId`) tracks which
    panel is shown; a `useEffect` keeps it in sync with `ui.activeTool`/
    `ui.workspaceMode` (`tabIdForActiveState`), so a keyboard shortcut
    opens the correct tab exactly like a click would. Unlike the old
    rail's flyout (which had to close on outside-click because it floated
    OVER the canvas), the ribbon's panel row lives in normal document flow
    beneath the tabs — there is no "closed" state, exactly one tab is
    always open, so the old click-outside/Escape-closes-flyout listener
    was dropped as a legitimate simplification, not a scope violation.
  - **Layout reflow**: `App.tsx`'s outer container changed from a plain
    `relative` div (Viewport/ToolRail/PropertiesPanel all siblings, the
    rail floating `absolute` OVER the full-bleed canvas) to `flex flex-col`
    with `<Ribbon />` first (normal flow, pushes content down) and a new
    `flex-1 relative min-h-0` wrapper around `<Viewport />` +
    `<PropertiesPanel />` (unchanged sibling relationship between those
    two, just nested one level deeper so `PropertiesPanel`'s existing
    `absolute top-4 right-4 bottom-4` classes resolve against the space
    below the ribbon instead of the full screen). No renderer-side code
    touched — R3F's `<Canvas>` already sizes itself to its parent DOM node
    via `ResizeObserver`, so the 3D viewport reflows to fill the full
    width below the ribbon automatically. Verified live: the canvas's
    immediate parent `<div>` measured `x:0, y:134.2, width:1280,
    height:585.8` (full remaining width/height below the ribbon) via
    `getBoundingClientRect()` — confirming the reflow itself works; the
    innermost `<canvas>` element's own reported size is still stuck at a
    fixed 300x150 in this environment, the SAME pre-existing tooling
    limitation (unrelated to this Order) every New Order 8.x session hit.
  - **Pepe extracted to standalone `src/components/PepeButton.tsx`**: Pepe's
    disabled placeholder button previously lived nested inside
    `ToolRail.tsx`'s own bottom section (`p-2 border-t`, positioned only by
    being last in that column). Since the rail container it lived inside no
    longer exists, and the Order requires "same trigger, same position,"
    it's now its own `absolute bottom-4 left-4` floating element in
    `App.tsx` — identical icon/tooltip/disabled markup, same bottom-left
    corner of the screen. Verified live: `getBoundingClientRect()` on the
    Pepe button measured `left: 16, top: 650.4, bottom: 704` against a
    720px-tall viewport (bottom-left corner), `disabled: true` unchanged.
  - `npm run build`: clean, 0 TypeScript errors.
  - **Verified live this session** (Browser preview, real click/keyboard
    events — this Order's changes are pure DOM layout/routing, none of it
    behind the 3D canvas, so unlike every Dimension/Reference Line session
    this was fully click-testable): all 6 tabs render and open correctly;
    clicking Transform only revealed Move/Rotate without changing the
    active tool (Board Properties header stayed "Select"); clicking Move
    inside that panel fired it correctly (header changed to "Move");
    pressing `d` auto-opened the Annotate tab AND switched the right panel
    to the Dimension Line form; pressing `t` entered Template mode (mode
    badge -> "Template", Template tab shown open/active, full Template
    Sketch panel rendered on the right); pressing `m` while in Template
    was correctly inert (mode badge stayed "Template", confirming New
    Order 6.2's `MODEL_TOOL_SHORTCUTS` guard is unaffected by the rail ->
    ribbon move); clicking the Template tab again while active correctly
    exited to Model space; the Help tab shows its reserved placeholder
    text and does not change the active tool; a full Insert -> Place
    round-trip through the new Create tab placed a real board, auto-
    switched to Select, and populated Board Properties/Entities exactly as
    before. Test board removed via `localStorage.clear()` + reload before
    ending the session (this store uses `persist` middleware, so a
    leftover test board would otherwise survive into Joey's next session).
- New Order 10.1: Contextual Board Properties/Entities Panel — Part 2 of
  the 3-part UI overhaul. Changes ONLY the right panel's whole-panel
  expand/collapse behavior; every form field, Entities row action, and the
  ribbon (New Order 10) are untouched.
  - **Automatic collapse driven by selection, with a regression caught and
    fixed before shipping**: the literal ask — "nothing selected -> collapse
    to the existing thin strip, a selection -> auto-expand, deselect ->
    auto-collapse" — was straightforward for the Select/Move case, but a
    naive `panelExpanded = hasSelection` implementation (tried first, then
    caught live before finishing the session) would have also auto-collapsed
    the panel the instant nothing was selected while Insert/Sketch/Template/
    Dimension/Reference/Rotate was the active tool — hiding those tools' own
    always-relevant Section content (the Insert form, Rotation Axis picker,
    etc.), which previously rendered regardless of selection and is
    explicitly required to keep working ("every existing action inside the
    panel still work[s] identically once expanded"). Caught this live: after
    the first pass, switching to Insert with nothing selected left the panel
    collapsed with no way to see the Insert form at all. Root-caused per
    Manifesto Law 4 rather than patched around — the real distinction isn't
    "is something selected," it's "does the active tool have its own
    content besides Board Properties." Fixed with `toolHasOwnContent =
    activeTool !== 'select' && activeTool !== 'move'` (`PropertiesPanel.tsx`)
    — those two tools are the only ones whose panel content is JUST Board
    Properties/Entities; every other tool keeps its panel always-expanded
    exactly as before this Order, and only Select/Move follow the new
    selection-driven auto-collapse. Re-verified live after the fix: Insert
    (nothing selected) shows its form again; Rotate (nothing selected)
    shows the Rotation Axis picker again; Template (nothing selected) shows
    the full Template Sketch panel again — all three previously-broken by
    the first pass, now confirmed correct.
  - **Manual override, layered on top**: `manualOverride: boolean | null`
    (`null` = defer to automatic). Clicking the edge tab sets an explicit
    `true`/`false` that wins over the automatic value until the next REAL
    selection change — a `useEffect` keyed on `selectedMemberId`/
    `selectedDimensionLineId`/`selectedReferenceLineId` resets it to `null`
    (only fires on an actual id change, never on an unrelated re-render, so
    the override can't be "instantly undone by the next render" per the
    Order's explicit requirement). Verified live via the real store: select
    a board (auto-expands) -> manually collapse (`«`) -> unrelated
    `updateMember` call on the same board does NOT re-expand it (override
    holds) -> selecting a DIFFERENT board resets the override and
    auto-expands again for the new selection. Also verified the reverse:
    deselect (auto-collapses) -> manually expand (`»`) while nothing is
    selected, confirming Entities stays reachable -> select something ->
    override resets -> deselect again -> correctly auto-collapses (proving
    the override was really cleared, not just coincidentally still showing
    the right state).
  - **Entities-list visibility decision (per the Order's explicit ask to
    document this)**: Entities stays inside the SAME card as Board
    Properties — its own `entitiesOpen` CollapsibleSection is completely
    untouched (still manual-only, defaults open) — rather than becoming
    independently visible regardless of the whole-panel collapse. Reason:
    the panel's structure is a single strip-or-card binary with no middle
    ground (the collapsed thin strip renders NOTHING but the edge tab + a
    vertical "Properties" label — it has no room for a boards list), so
    "auto-collapse the whole panel when nothing is selected" and "keep
    Entities always visible" are directly in tension; building a genuine
    third visual state (e.g. a narrower strip that still lists boards) would
    be a bigger structural change than "expand/collapse behavior only," out
    of this Order's explicit scope. Resolved by making the manual-expand
    override cheap and obvious (one click on the edge tab, and it stays
    expanded exactly as long as the user wants — see above), so Joey is
    never more than one click from the Entities list even with nothing
    selected. **If this doesn't feel right in practice, the fix would be
    New Order 10.1's stated fallback**: split Entities into its own
    independently-positioned card that never collapses, separate from Board
    Properties' card — a real structural change, deliberately not attempted
    this session per scope.
  - `npm run build`: clean, 0 TypeScript errors.
  - **Verified live this session** (Browser preview, real clicks/keyboard
    events plus direct store calls for selection-state edge cases not
    reachable via a single click): fresh load with 0 boards shows the panel
    collapsed by default; Insert -> Place -> auto-expands showing the new
    board's Board Properties + Entities; Escape deselects -> auto-collapses;
    manual override in both directions (see above) confirmed to actually
    reset on a real selection change, not just look right by coincidence;
    Rotate/Template with nothing selected confirmed to stay expanded after
    the `toolHasOwnContent` fix. Ribbon tabs/shortcuts re-confirmed
    unaffected (Move/Rotate/Template all switch tools and open the correct
    ribbon tab exactly as New Order 10 left them). Test members and
    localStorage cleared before ending the session.
- New Order 10.2: Board Properties as Contextual Ribbon Tab — inserted
  between 10.1 and the original 10.2 (Help tab content, renumbered 10.3).
  Removes `PropertiesPanel.tsx` (the separate right-side panel) entirely;
  10.1's whole-panel collapse/expand mechanism (`manualOverride`/
  `panelExpanded`/`propertiesOpen`/`panelCollapsed`/`PanelEdgeTab`) is fully
  retired along with it — confirmed no leftover references anywhere.
  - **Scope had to widen beyond "Board Properties/Entities" to stay
    internally consistent**: the Order says both "this Order ONLY moves
    Board Properties/Entities into a contextual ribbon tab" AND "removes
    the separate right-side panel entirely" / "No right-side panel at all"
    when nothing's selected. Read literally, `PropertiesPanel.tsx` ALSO
    held every tool's own content (Insert's form, Sketch's species picker,
    Template's full sketch panel, Dimension/Reference's hint text,
    Rotate's Axis picker) — none of which has anything to do with
    selection. Deleting that file wholesale without giving those sections
    a new home would have broken Insert/Sketch/Template/Rotate/Dimension/
    Reference outright (e.g. Insert would have no fields to type into).
    Resolved by mechanically relocating each section's existing render
    call into its own ribbon tab's panel row (zero internal logic/state/
    store-call changes — same components, same hooks, same handlers) —
    "every other ribbon tab... don't change" is read as "their button/
    tab-switching behavior doesn't change," which it doesn't; only Board
    Properties (per the Order's explicit ask) was actually reformatted
    (see below).
  - **Contextual tab**: a new tab appears after the fixed tabs (with a
    spruce accent divider, distinct from the fixed tabs' orange active
    indicator, per the Revit-pattern "green/accent separator" requirement)
    only while `selectedMemberId`/`selectedDimensionLineId`/
    `selectedReferenceLineId` is non-null, labeled `Modify | <board label>`
    or `Modify | Dimension`/`Modify | Reference`. Board content is
    `BoardEditPanel.tsx`, reformatted from a vertical stack (`w-full
    justify-between` fields, tuned for the old narrow right panel) into a
    horizontal row of compact caption-over-input blocks — every field's
    state hook/commit handler/`updateMember` call is byte-for-byte
    unchanged, only the JSX arrangement/classes changed (this is the ONE
    component this Order explicitly asks to look different). A dimension/
    reference line's content is new (there wasn't a prior form for these)
    but calls the exact same actions the Entities list already exposed for
    them (`setDimensionLineVisibility`, `startEditDimensionLine`, etc.) —
    relocated/mirrored, not reimplemented.
  - **Two real bugs found and fixed live, before shipping** (per Manifesto
    Law 4 — caught by actually exercising the selection-change sequences
    the Order's examples describe, not just reading the code):
    1. *Deselecting always reverted to 'Select/Modify' instead of the tab
       the user was actually browsing.* First implementation used a
       `manualTabOverride` reset on every selection-id change (mirroring
       10.1's exact pattern) — but the Order explicitly warns to track
       "previously active fixed tab" as its OWN dedicated state, not infer
       it, and the reset-on-every-selection-change approach silently threw
       that memory away every time. Fixed with `lastFixedTabIdRef` — a ref
       (not React state) continuously updated whenever `openTabId` lands on
       anything besides `'contextual'`, from any cause, read only at the
       moment a selection clears. Verified live: selected a board -> Modify
       auto-opened -> manually clicked Entities (still selected) -> an
       UNRELATED `updateMember` call did not bounce back to Modify
       (override holds) -> deselected -> correctly returned to Entities,
       not Select/Modify.
    2. *A transition that changes a tool AND a selection in the same store
       update resolved inconsistently.* Entering Template clears
       `selectedMemberId` in the same `setWorkspaceMode` call; the Entities
       list's own "Select" button calls `setActiveTool('select')` +
       `selectMember(id)` together. Two independent effects (one per
       concern) would resolve these unpredictably depending on which
       effect happened to fire last. Fixed by combining into ONE effect
       keyed on all five relevant values (`activeTool`, `workspaceMode`,
       and the three selection ids) that recomputes `openTabId` holistically
       from the CURRENT combined state every time. Verified live: selected
       a board (Modify open) -> `setActiveTool('template')` -> correctly
       landed on the Template tab (not stuck on a stale Entities/Select
       guess), full Template Sketch panel rendered.
    3. *(a third, smaller fix)* Selecting a dimension/reference line while
       its OWN matching tool (`measure`/`referenceLine`) was still armed
       showed the Annotate tool-picker instead of the Modify tab — because
       the initial `toolHasOwnContent` rule (Select/Move only) treated
       Dimension/Reference as "has its own content" unconditionally, same
       as Insert/Sketch/Rotate. Narrowed with two extra exceptions
       (`activeTool === 'measure' && selectedDimensionLineId` /
       `activeTool === 'referenceLine' && selectedReferenceLineId`) so
       selecting the line you just drew shows its properties immediately,
       while a BOARD selected during Dimension/Reference still correctly
       keeps the tool's own hint text (unchanged). Verified live: drew a
       dimension line (tool stays armed) -> selected it via
       `selectDimensionLine` -> Modify tab correctly showed Length/Board/
       Show/Edit -> clicked Show -> `visible` flipped to `true` live ->
       clicked Edit -> `dimensionDraft` armed with the correct `editingId`,
       identical to the pre-Order Entities-list Edit flow.
  - **Entities-list placement decision (per the Order's explicit ask to
    document this)**: given its own fixed tab (next to Help), NOT folded
    into the contextual tab. Reasoning: the Order requires zero right-side
    panel with nothing selected, but Joey uses Entities specifically to
    browse ALL boards including when nothing is selected — tying it to a
    selection-dependent contextual tab would remove exactly that capability.
    A dedicated always-present tab satisfies both constraints at once
    (no right panel, Entities always reachable) without inventing a new UI
    location. The old `CollapsibleSection` wrapper around the list was
    dropped (redundant now that the list already lives behind its own
    dedicated tab — a nested expand/collapse inside an already-toggleable
    tab was two clicks for one concept); every row's hide/show/select/
    remove/edit action still calls the exact same store function as before.
    **Fallback if this doesn't feel right in practice**: fold Entities into
    the contextual tab (loses no-selection browsing) or add a third,
    genuinely independent always-visible surface — a bigger structural
    change, deliberately not attempted this session.
  - `npm run build`: clean, 0 TypeScript errors.
  - **Verified live this session**, real clicks/keyboard events for the
    core flows (this Order's changes are pure DOM state/layout, not behind
    the 3D-canvas limitation) plus direct store calls for the harder
    combined-transition edge cases above: Insert -> Place -> Modify tab
    auto-opens showing the new board's horizontal properties row; editing
    Length via a real click+type+blur committed correctly (48" persisted
    in `project.members[0].length`); Escape deselected and correctly
    restored the Create tab (where the user actually was before selecting,
    not a hardcoded default); Entities tab lists the board and its Remove
    button deletes it (confirmed `ENTITIES (0)` + empty-state text
    afterward); Rotate/Template with nothing selected still show their own
    panel content (10.1's regression-prevention carried forward correctly).
    A stray React error logged against a stale HMR module timestamp during
    active editing was confirmed NOT reproducible on a fresh tab/fresh
    server restart with zero console errors — not a real bug, a dev-server
    artifact from mid-edit hot-reloads. Test members and localStorage
    cleared before ending the session.
- New Order 10.2.1: Template Panel Layout Regression Fix — pure regression
  fix on New Order 10.2, no new features, no other tab's behavior touched.
  - **Fix 1 (Template crushing the viewport)**: Template's content (draw-
    tool instructions, Line/Arc/Freehand, 4 collapsible sections, an
    extrude action) is a full sidebar's worth of material that never fit
    the horizontal ribbon-row layout Transform/Create/Annotate's few
    buttons use — 10.2 bounded it only with a generic `max-h-[55vh]` on
    the WHOLE ribbon panel row, which still crushed the viewport to
    roughly half the screen and clipped Template's own bottom content
    ("Status: Open"). Restored as a genuine structural exception: new
    `src/components/TemplateSidebar.tsx`, an absolutely-positioned vertical
    sidebar (`top-4 left-4 bottom-4 w-72`, own `overflow-y-auto`) mounted
    in `App.tsx` alongside `<Viewport />`, self-gating on
    `workspaceMode === 'template'` exactly like every other always-mounted
    tool component in this app (SketchTool, MoveGizmo, etc.). `TemplatePanel`
    itself is completely unchanged internally — only its mount point moved,
    again (this is its third home: PropertiesPanel.tsx pre-10.2, Ribbon.tsx's
    panel row in 10.2, now its own sidebar). `Ribbon.tsx`'s panel row no
    longer renders `<TemplatePanel />` at all — the Template tab's row now
    shows just the plain "Template" tile, same minimal treatment Select/
    Modify's row already has. Verified live: ribbon height measured 135px
    (down from crushing ~half the screen, matching every other tab's normal
    height); sidebar measured 553px tall, `top-4`-below-ribbon, `bottom-4`-
    above-screen-edge; sidebar's `scrollHeight` (679px) exceeds its
    `clientHeight` (551px) so it genuinely scrolls internally rather than
    clipping — confirmed "Status" and "Open" both present in the DOM
    (previously the visually-clipped text) and reachable via that scroll.
  - **Fix 2 (two tabs highlighted at once) — two distinct bugs found under
    this one symptom, both fixed**:
    1. `activeTool` and `workspaceMode` were checked independently for
       highlight purposes. Root cause: `workspaceModes.ts`'s
       `isToolLegalInMode` treats `'select'`/`'measure'` as universally
       legal in every mode — so clicking Select/Modify (or Dimension) while
       in Template mode changes `activeTool` via `setActiveTool`'s mode-
       follows-tool logic WITHOUT that logic exiting Template
       (`workspaceMode` stays `'template'`, since the newly-picked tool is
       "legal" there), leaving the two fields genuinely, persistently out of
       sync — a real, easily-reachable pre-existing bug in the store, not
       new this session, just newly made VISIBLE by the ribbon showing two
       independent indicators. Rather than touch that deeper store logic
       (out of this pure regression fix's scope — flagged below for a
       possible future Order instead), `workspaceMode` now exclusively owns
       the active/open state for every tab while it's `'template'`: only
       the Template tab can read as active or open, full stop, applied
       consistently to the tab strip's highlight AND the panel row's
       content (`effectiveOpenTabId = workspaceMode === 'template' ?
       'template' : openTabId`, threaded through every remaining
       `openTabId` comparison in the render). Verified live via direct
       store calls reproducing the desync (`setActiveTool('select')` while
       `workspaceMode` stayed `'template'`): exactly one tab (Template)
       read as active in the DOM.
    2. A second, distinct instance of the same symptom: TemplatePanel's own
       "Exit to Model" button calls ONLY `setWorkspaceMode('model')` — it
       has no knowledge of the ribbon's local `openTabId` state (different
       component entirely). That action's own logic auto-resets
       `activeTool` to `'select'` in the SAME store update (since
       `'template'` isn't legal in `'model'`), and the ribbon's combined
       effect fell back to `lastFixedTabIdRef.current` for the new
       "no contextual, tool has no own content" case — but that ref still
       held `'template'` (recorded when Template was entered, before this
       Order's fix nothing excluded it from tracking), so the ribbon stayed
       stuck showing Template's tab/panel (spruce "open" indicator) even
       after `workspaceMode` genuinely became `'model'` and Select/Modify
       correctly showed active (orange) underneath it — reached via the
       ordinary "Exit to Model" button, not an edge-case exploit. Fixed by
       excluding `'template'` from `lastFixedTabIdRef` tracking, the same
       way `'contextual'` already was. Verified live via the REAL click
       path (dispatched clicks on the actual Template tab, then the actual
       "Exit to Model" button — not raw store calls): exactly one tab
       (Select/Modify) read as active afterward, panel row correctly showed
       Select's content. Also verified the ref now generalizes correctly —
       browsed to Create, entered Template, exited: correctly restored to
       Create (not a hardcoded Select default), confirming the fix didn't
       just special-case the simplest scenario.
  - **Fix 3 (Pepe clipped)**: confirmed resolved naturally by Fix 1 — Pepe's
    `getBoundingClientRect()` measured fully within the viewport
    (`top: 650, bottom: 704` against a 720px-tall window) once the ribbon
    stopped overflowing. No separate positioning fix was needed.
  - **Flagged, not fixed (out of this Order's scope)**: the underlying
    `activeTool`/`workspaceMode` desync itself (Fix 2's root cause #1) is a
    real, pre-existing gap in `setActiveTool`'s mode-follows-tool logic
    (`store.ts`) — clicking a universally-legal tool (Select, Dimension)
    while in Template mode changes `activeTool` without exiting
    `workspaceMode`. This session's fix fully masks the visual symptom (the
    ribbon is never confusing regardless of this desync), but the
    underlying mismatch itself still exists in the store and could
    theoretically surprise a future feature that reads `activeTool` and
    `workspaceMode` independently expecting them to always agree. Worth a
    dedicated future Order if anything else surfaces this.
  - `npm run build`: clean, 0 TypeScript errors.
  - **Verified live this session**, real clicks/keyboard events plus direct
    store calls for the exact desync reproductions (see above for each fix's
    specific verification) — this Order's changes are pure DOM layout/
    display logic, fully click-testable, not behind the 3D-canvas
    limitation. Also re-confirmed unaffected: Insert -> Place round-trip,
    contextual "Modify" tab for a selected board, Rotate's axis picker with
    a board selected in the background, Entities tab. Test members and
    localStorage cleared before ending the session.
- New Order 10.3: Help Tab — How-To Guide & Keyboard Shortcuts. This closes
  out the 3-part ribbon overhaul (10 / 10.1 / 10.2 / 10.2.1 / 10.3).
  - **Premise check found the Order's core assumption was wrong — no
    existing Tutorial/How-To component to relocate**: the Order's "Read
    First" list assumed one existed "wherever it currently lives." A
    thorough search (grepping every "Tutorial"/"tutorial" hit in `src/`,
    every consumer of `ui.rightPanelTab`) found: `types.ts`'s
    `RightPanelTab` union still lists `'tutorial'` as a possible value, and
    `workspaceModes.ts`'s `MODE_PANEL_TABS` still lists it per mode, but
    `rightPanelTab` itself has ZERO rendering consumers anywhere in the
    current codebase (only `store.ts` sets it and `types.ts` types it) —
    it's dormant leftover state from the pre-Samson-reset app, never wired
    to any UI in the rebuild. The only other "Tutorial" hit in the entire
    codebase is a stale Pepe knowledge-base FAQ answer
    (`pepeKnowledgeMasterG`-family file) describing the OLD app's "six
    right-sidebar tabs including Tutorial (the full in-app guide)" — a UI
    that was deleted entirely by the Samson Option and never rebuilt.
    Rather than silently invent a fictional "relocation," or block the
    session on this mismatch, built the How-To content fresh — new
    `src/components/HowToPanel.tsx`, a deliberately simple static reference
    (no search/filter, since the Order explicitly forbids inventing new
    search logic and none exists to preserve) covering all 8 current tools
    in plain language, matching CLAUDE.md's "hobbyist, plain-language" UI
    rule. This is clearly documented as newly-authored, not relocated, in
    both this entry and the component's own doc comment, so nobody is
    misled into thinking prior content was reused.
  - **Centralized shortcut/tooltip registry — new `src/lib/shortcuts.ts`**:
    before this Order, the same facts were hand-typed in THREE separate
    places that could silently drift: `App.tsx`'s own
    `MODEL_TOOL_SHORTCUTS`/`TEMPLATE_DRAW_SHORTCUTS` maps (the actual key
    dispatch), `Ribbon.tsx`'s `SELECT`/`MOVE`/`ROTATE`/etc. `ToolDef`
    constants (each hardcoding its own `shortcut` letter for Tooltip.tsx),
    and `TemplatePanel.tsx`'s own `DRAW_TOOLS` array (Line/Arc/Freehand's
    label/description/shortcut, a second copy of facts App.tsx's
    `TEMPLATE_DRAW_SHORTCUTS` also encoded). Now: `TOOL_SHORTCUT_ENTRIES` /
    `TEMPLATE_TOOL_SHORTCUT` / `TEMPLATE_DRAW_SHORTCUT_ENTRIES` hold each
    fact exactly once; `MODEL_TOOL_SHORTCUTS`/`TEMPLATE_DRAW_SHORTCUTS`
    (the dispatch maps `App.tsx` imports directly, replacing its own local
    consts) are DERIVED from those entries via `Object.fromEntries`, never
    hand-typed separately; `Ribbon.tsx`'s `ToolDef` constants now call a
    `toolDefFrom(tool, icon)` helper that pulls label/description/shortcut
    from the registry (only `icon` stays local, since icons aren't
    shortcut/tooltip metadata); `TemplatePanel.tsx`'s `DRAW_TOOLS` is now
    `TEMPLATE_DRAW_SHORTCUT_ENTRIES.map(...)` instead of a hand-typed
    array. Template's `'t'` shortcut is deliberately kept OUT of the
    generic `MODEL_TOOL_SHORTCUTS`-derived dispatch map (own
    `TEMPLATE_TOOL_SHORTCUT` constant instead) — folding it in would have
    changed real behavior: App.tsx dispatches `'t'` through its own
    `else if` branch with no `inTemplate` guard specifically so pressing it
    again while already in Template re-syncs `activeTool` (New Order
    10.2.1's Fix 2 relies on this), whereas every other entry in the
    generic map is a no-op in Template mode.
  - **Confirmed the actual current shortcut set directly from `App.tsx`'s
    handler (per the Order's explicit instruction), found a real
    mismatch**: the Order's own draft list (W/M/R/S/I/D/X, T, L/A/F, Tab)
    omitted four real, currently-dispatched shortcuts — Escape (cancel/
    deselect/exit, context-dependent), Ctrl+Z/Ctrl+Shift+Z/Ctrl+Y
    (undo/redo), Shift+D (duplicate), and Arrow keys (nudge while Move is
    active). All four included in `shortcuts.ts`'s `MISC_SHORTCUTS` and the
    new Shortcuts panel, grouped by context (`'model'`/`'template'`/
    `'global'`) alongside the tool-switch entries, for a genuinely complete
    reference rather than reproducing the Order's incomplete draft.
  - **Help tab structure**: two button tiles (How-To, Shortcuts) — the
    Order's own second suggested pattern ("two buttons that each open their
    own content area"), matching Transform/Create/Annotate's exact
    button-tile visual language. Local `helpSection` state (ephemeral UI,
    same precedent as every other local flag in `Ribbon.tsx`) toggles
    between `<HowToPanel/>` and `<ShortcutsPanel/>` in the content area
    below. `RIBBON_TABS`' `'help'` entry now special-cases its panel-row
    content directly (`effectiveOpenTabId === 'help' ? <HelpPanelContent/>
    : ...`), the same pattern `'entities'`/`'contextual'` already
    established — this also made the OLD generic `openTab.tools.length ===
    0` placeholder branch unreachable dead code (both `tools:[]` tabs are
    now explicitly special-cased), so it was removed rather than left
    behind.
  - `npm run build`: clean, 0 TypeScript errors.
  - **Verified live this session**: Help tab shows both How-To (all 8
    tools, live shortcut letters) and Shortcuts (all 3 groups, all entries
    including the 4 the Order's draft omitted) sections correctly; cross-
    checked the registry actually connects both consumers — focused
    Insert's ribbon button and confirmed its tooltip reads "Insert (I)"
    (matching the Shortcuts panel's own "I → Insert" row, same source);
    same cross-check for Dimension ("D") and Template's own Line draw-tool
    button ("L"), the latter confirming `TemplatePanel.tsx`'s derived
    `DRAW_TOOLS` still renders correctly. Re-confirmed unaffected: pressing
    `W` still real-dispatches to Sketch (the derived `MODEL_TOOL_SHORTCUTS`
    map works identically to the old hand-typed one); exiting Template
    correctly restored the Annotate tab (10.2.1's tab-restoration fix
    unaffected); every other tab (Select/Modify, Transform, Create,
    Annotate, Template, Entities) rendered correctly throughout. Pepe
    unaffected — untouched this session. Test state and localStorage
    cleared before ending the session.
- **New Order 10-ROLLBACK: the entire ribbon UI experiment (New Order 10,
  10.1, 10.2, 10.2.1, 10.3) has been undone and is explicitly ABANDONED per
  Joey's decision.** The app is restored to the left icon rail + right
  Board Properties panel layout exactly as it stood at the end of New
  Order 8.4 — the last confirmed-stable UI state before the ribbon detour.
  If any future session references "the ribbon," "Ribbon.tsx," or New
  Orders 10 through 10.3 as current/live UI, that is stale — treat this
  entry as authoritative. This was a one-shot, no-follow-up rollback per
  Joey's explicit priority note; Step 3's full verification pass (below)
  was completed exhaustively in this same session, not deferred.
  - **Step 1 investigation, reported before acting (per the Order's
    explicit requirement)**: `git status`/`git log --oneline -30` showed
    the branch `up to date with origin/main` at commit `1eedf22`
    ("Samson Option reset + New Orders 1-3.2") with EVERYTHING since —
    every New Order from 4 through 10.3, the entire ribbon experiment
    included — sitting as uncommitted working-tree changes/untracked
    files. `git log origin/main --oneline -10` confirmed the remote is
    identical to local `main` — **no ribbon-era state was ever pushed**,
    contrary to the Order's stated concern that Joey might have already
    pushed 10.1/10.2.1. `git log --all --oneline -- "**/ToolRail.tsx"` (and
    the same for `PropertiesPanel.tsx`/`CollapsibleSection.tsx`) returned
    NOTHING — these three files have ZERO git history on any branch,
    local or remote, because they were all built fresh in New Order 5,
    entirely after the last commit, and never committed. Confirmed via
    `git show 1eedf22:src/App.tsx` that the one commit touching `App.tsx`
    contains the New-Order-3-era pre-ToolRail/pre-PropertiesPanel
    structure (standalone `InsertPanel`/`BoardEditPanel`, a local
    `insertPanelOpen` boolean) — explicitly NOT usable as 8.4-era source.
    **Conclusion: git-based restore (the Order's preferred path) was not
    possible for any of the three deleted files** — there is no commit
    containing their 8.4-era content to restore from.
  - **Restoration source actually used, given git had nothing**: this same
    conversation's own history. `ToolRail.tsx` was read in full,
    verbatim, immediately before being deleted at the start of New Order
    10 — that capture is byte-for-byte the end-of-8.4 file (nothing
    between 8.4 and 10 touched it; there was no New Order 9). Restored
    directly from that capture, unmodified. `PropertiesPanel.tsx`,
    `BoardEditPanel.tsx`, and `TemplatePanel.tsx` had each been read in
    full immediately before the specific ribbon-era session that first
    edited them (10.1, 10.2, and 10.3 respectively); reconstructed by
    reversing exactly those sessions' own recorded changes back to each
    file's pre-edit state (e.g. `PropertiesPanel.tsx`'s 10.1-added
    `manualOverride`/`panelExpanded`/`hasSelection`/`toolHasOwnContent`
    logic replaced with the original simple `propertiesOpen`/
    `panelCollapsed` mechanism; `BoardEditPanel.tsx`'s 10.2 horizontal-row
    reformat replaced with the original vertical `flex-col` stack;
    `TemplatePanel.tsx`'s 10.3 registry-derived `DRAW_TOOLS` replaced with
    the original hardcoded array). `CollapsibleSection.tsx` was never
    touched by any ribbon-era session (confirmed by reviewing every prior
    session's file list) — it was still present on disk, untouched, so it
    needed no restoration.
  - **Files removed** (no pre-ribbon equivalent): `Ribbon.tsx`,
    `TemplateSidebar.tsx`, `ShortcutsPanel.tsx`, `HowToPanel.tsx`,
    `PepeButton.tsx` (Pepe's button is back inside `ToolRail.tsx` itself,
    disabled, exactly where it lived pre-New-Order-10), and
    `src/lib/shortcuts.ts` (the centralized registry — removed per the
    Order's conditional instruction, since the restored `ToolRail.tsx`
    hardcodes its own shortcut letters directly, as it always did, and has
    no use for a registry that only existed to serve the ribbon's
    Tooltip/Shortcuts-panel consumers). `App.tsx` restored to the 8.4-era
    `relative` (not `flex flex-col`) layout — `<Viewport/>`, `<ToolRail/>`,
    `<PropertiesPanel/>` as plain siblings — with `MODEL_TOOL_SHORTCUTS`/
    `TEMPLATE_DRAW_SHORTCUTS` back to local hardcoded consts (not imported
    from a registry). `store.ts`/`types.ts`/`workspaceModes.ts` needed no
    changes — reviewing every ribbon-era session's own file list confirmed
    none of them ever touched these files (all ribbon work was pure
    UI-layer relocation, by design/scope in every one of those Orders).
  - **`npm run build`: clean, 0 TypeScript errors on the first attempt**
    after the full restoration — a strong structural correctness signal
    (a mismatched prop, missing import, or interface drift between the
    reconstructed files would have surfaced here).
  - **Step 3 exhaustive live verification — every item, all confirmed
    working, via real clicks and direct store/keyboard dispatch** (not
    deferred, not partial): Select/Transform(Move+Rotate)/Create(Sketch+
    Insert)/Annotate(Dimension+Reference)/Template rail buttons and
    flyouts all fire correctly by click; ALL keyboard shortcuts fire
    correctly — W→drawBoard, M→move, R→rotate, S→select, I→addBoard,
    D→measure, X→referenceLine, T→template (both entry and the
    already-in-Template resync), L→line/A→arc/F→freehand (Template-only),
    Tab→cycles rotationAxis (verified y→z live), Escape→deselect (verified
    clears both `activeTool` and `selectedMemberId`), Shift+D→duplicate
    (verified member count 1→2), Ctrl+Z→undo (2→1) and Ctrl+Shift+Z→redo
    (1→2), Arrow-Right→nudge (position.x 0→1, Move tool + selection only).
    Board Properties: placed a board via Insert, edited Length via a real
    triple-click+type+blur (committed 36"→48", confirmed in
    `project.members[0].length`), Species dropdown present and wired.
    Entities list: Hide correctly set `inScrapBox: true`, Remove correctly
    deleted the member (count 1→0), inline rename wired (component
    reused unchanged). Template: entered via `T`, built a real 4-edge
    closed square shape via the store (mirroring what Line/Arc/Freehand
    produce), selected it (panel correctly showed "Segments: 4, Status:
    Closed"), clicked the real "Extrude to Board" button — produced an
    actual `customPolygon` board (`polygonPoints` a 12"x12" square,
    correct species/thickness) and auto-returned to Model space,
    confirming the full sketch-to-board pipeline (Engine.ts/store.ts —
    never touched by any ribbon session) still connects correctly through
    the restored `TemplatePanel.tsx`. Confirmed the Template panel renders
    inside `PropertiesPanel.tsx`'s own `absolute ... right-4` flow (found
    via `document.querySelector('.right-4')`), NOT a left sidebar —
    10.2.1's `TemplateSidebar.tsx` detour is fully gone. Both "Exit to
    Model" (the panel button) and clicking the already-active Template
    rail button again were independently verified to return
    `workspaceMode` to `'model'`. Dimension Line and Reference Line: full
    3-click and 2-click commit sequences both verified through the real
    store actions (`handleDimensionLineClick`/`handleReferenceLineClick`)
    — committed with a real non-degenerate offset (2.2", confirming New
    Order 8.4's minimum-offset fix in `templateSketchMath.ts`/`store.ts`
    is intact and untouched), both lines correctly appeared in the
    Entities list with the exact same formatting New Order 8 established
    ("Dimension: 29 1/2\" (Dim Test)", "Reference (Dim Test)"). Right
    panel's manual collapse/expand (the "«"/"»" edge tab) verified working
    in both directions. Zero console errors across the entire pass,
    including a fresh page load partway through. Test members/lines and
    localStorage cleared before ending the session; the temporary
    `window.__store` debug hook used for precise state verification during
    this pass was removed from `store.ts` before the final build.

## Current Tool States (verified against source, 2026-07-06)

### Sketch tool — `src/components/SketchTool.tsx`
- Corner-drag creation: first click fixes the start corner, drag defines
  a rectangular length x width footprint (`resolveFootprint`).
- Fractional inches to 1/64 precision (`src/lib/fractionalInches.ts`,
  `DEFAULT_DENOMINATOR = 64`, explicitly capped there).
- No snapping — confirmed removed, not just disabled. No active
  snap-point logic remains in the component; `src/lib/bounds.ts` still has
  a leftover `snapMemberPosition()` function but it is dead code, called
  nowhere in `src/`.
- Numeric override typeable while dragging (Tab-triggered field entry,
  `<Html>` input overlays).
- Cancel via right-click or Escape, both confirmed wired (right-click
  during active drag, Escape via `ui.drawBoardCancelNonce`).

### Move tool — `src/components/MoveGizmo.tsx`
- Gizmo-based: drei `TransformControls` (`mode="translate"`) attached to
  a free-floating anchor object, never the board mesh directly.
- Fixed 300x300 grid (`Viewport.tsx`) used as a floor-collision plane via
  `clampFloorY` in `src/lib/bounds.ts` — the camera-following "infinite
  grid" tried in 2.3 was reverted.
- Multi-select persists across moves: `armGizmoDragClickSuppress()` /
  `consumeGizmoDragClickSuppress()` swallow the stray post-drag click that
  would otherwise collapse a multi-select down to one board.
- Highlight color is lime (`#a3e635`), via drei's `<Edges>` (all 12 box
  edges, any camera angle) — history was amber -> blue-700 -> lime-400.
- Move is an explicit tool, separate from Select (gizmo only renders when
  `activeTool === 'move'`); toolbar defaults to Select.
- Undo: one `commitProject`-backed history entry per completed move
  (drag itself uses `skipHistory=true` to avoid per-frame spam).

### Insert tool — `src/components/InsertPanel.tsx`
- Presets dropdown (not buttons) including OSB/sheet goods
  (`plywood34`, `plywood12`, `osb34`, `osb716`).
- 36" default length (previously 96", changed in 3.1).
- Origin-collision offset is real: `findOpenSpawnPosition()` in
  `src/lib/bounds.ts` walks +X from origin in 6" steps, AABB-testing
  against existing members, until it finds a non-overlapping spot.
- Species dropdown (`SpeciesSelect.tsx`, backed by `materials.ts`) is
  genuinely shared — both `InsertPanel.tsx` and
  `SketchMaterialPanel.tsx` render the same component and call the same
  `store.setDrawMaterial()` action. No duplicate species list.

### Rotate tool — `src/components/RotateGizmo.tsx`
- Single-board scope only (per New Order 4 — multi-board rotation is
  explicitly out of scope for now).
- Per-axis ring gizmo: only the active axis's ring renders/is draggable
  (`ui.rotationAxis`), never a combined 3-ring gizmo.
- Axis switching: Tab key (App.tsx, only while `activeTool === 'rotate'`)
  and a toolbar X/Y/Z button group next to the Rotate button, both call
  the same `setRotationAxis`.
- Default 15° snap; holding Shift mid-drag switches to free rotation.
- Undo/redo confirmed correct in-browser (see PROGRESS entry above for
  New Order 4): a completed rotate is exactly one history entry, and
  Ctrl+Z restores the pre-rotate orientation without removing the board.
- Escape or right-click mid-drag cancels and restores the original
  rotation (`src/lib/rotateDragState.ts`), same pattern as Move's
  `moveDragState.ts`.

### Template tool — `src/components/TemplateDrawTools.tsx` + `TemplatePanel.tsx` (New Order 6, rebuilt/renamed by New Order 7 — see that entry above for the full rebuild detail)
- Entry: rail button (`ToolRail.tsx`, shortcut T) or `setActiveTool
  ('template')` from anywhere, same call every other tool button uses.
  Exiting again from the rail: clicking the Template button while already
  active calls `setWorkspaceMode('model')` directly (previously fell
  through to a generic toggle-to-select that left `workspaceMode` stuck on
  `'template'`).
- Locked to `ui.templatePlane` (`{ kind: 'ground', origin, normal }`,
  types.ts) — ground only this Order; a future Order adds a `'face'`
  variant without reshaping the field.
- Camera: `src/components/TemplateCameraLock.tsx` snaps to a top-down view
  of the plane on entry, restores the prior Model-space camera on exit;
  `Viewport.tsx`'s OrbitControls has `enableRotate={workspaceMode !==
  'template'}` so only rotation is locked (pan/zoom still work). Verified
  live this session: top-down framing confirmed via screenshot while
  testing the draw tools.
- Exit: Escape key or the panel's "Exit to Model" button, both call
  `setWorkspaceMode('model')` — verified live, both round-trip the mode
  badge and panel back to Model/Select cleanly. Escape checks
  `cancelActiveTemplateDraw()` first, so an in-progress chain point is
  ended (not deleted) by the first Escape and only a second Escape (with
  nothing pending) exits to Model.
- Selection: cleared on any transition into/out of `'template'`
  (`templateTransitionPatch()` in store.ts) — does not affect the existing
  model/assembly/detail selection-survives behavior.
- Model-space tool shortcuts (W/M/R/S/I in `App.tsx`) are inert while
  `workspaceMode === 'template'` — previously they silently exited the mode
  as an incidental side effect of `setActiveTool`'s mode-follows-tool logic.
  Template's own Line/Arc/Freehand shortcuts (L/A/F) are the inverse: only
  live while `workspaceMode === 'template'`.
- Draw tools: Line/Arc/Freehand, selected via `ui.templateDrawTool`
  (`TemplatePanel.tsx` buttons). Click-click chains a Line/Arc segment
  (start point placed by the first click, every subsequent click both
  commits the current segment's endpoint AND starts the next one from
  there); Freehand is click-and-drag, committed on release. Starting a
  fresh chain first checks whether the click lands near an already-drawn-
  but-unclosed chain's open tip (New Order 7's resume-after-Escape) and, if
  so, continues that chain instead of starting a disconnected new one.
  Committed edges (`ui.templateEdges`, a `TemplateEdge[]`) store plane-local
  (u,v) endpoints — Line: straight; Arc: a signed `bulge` (DXF-style
  tan(includedAngle/4)) solved so the curve is tangent-continuous with the
  previous segment's end direction (`src/lib/templateSketchMath.ts`);
  Freehand: a sampled `points` array. Live overlays while dragging (New
  Order 7 rebuild): an offset Revit-style dimension line with witness ticks
  (length), an angle arc (when not orthogonal to the reference tangent), a
  distinct "X" marker exactly on a precise axis snap vs. a hollow square
  specifically for loop-closing, persistent low-emphasis reference axes
  through the plane origin, general position-alignment guides (distinct
  color from the equal-length/parallel sticky-match guide), and live-only
  chain-joint markers that never persist once a chain ends. Right-click/
  Escape ends the current chain without deleting committed edges
  (`src/lib/templateDrawState.ts`, same cancel-registration singleton
  pattern as `moveDragState.ts`/`rotateDragState.ts`). `templateEdges`
  lives in `ui` state (like `templatePlane`/`templateMaterial`) so it
  persists across a Model<->Template round-trip within the session, and
  fully participates in undo/redo — every history entry snapshots
  `{ project, templateEdges, templateShapes }` together.
  Closed-loop detection: committing a Line/Arc/Freehand segment whose end
  lands within the closing threshold of the CURRENT chain's own start point
  (with >= 3 total edges) snaps the end exactly onto that start point and
  creates a `TemplateShape` (`ui.templateShapes`) instead of continuing the
  chain — closing with fewer than 3 total edges is rejected (verified live:
  attempting to close a 1-edge chain just added a normal second edge,
  "Segments drawn: 2, Shapes closed: 0"). Each shape stores only its
  constituent edge ids + a species string, never a duplicated copy of
  geometry; its fill polygon is rebuilt fresh every render from the live
  edges (`buildLoopPolygon`/`triangulatePolygon` in `templateSketchMath.ts`
  + `TemplateShapeFill` in `TemplateDrawTools.tsx`), rendered UNLIT (New
  Order 7 Part 3) so it reads as true wood color/grain regardless of scene
  lighting — verified live via screenshot (flat, evenly-lit Pine grain, no
  lighting gradient). Clicking a filled shape while no draw tool is armed
  selects it (`ui.selectedTemplateShapeId`) for an orange outline + live
  species editing in `TemplatePanel.tsx`; clicking empty Template-space
  ground (`Viewport.tsx`'s `onPointerMissed`) deselects it — verified live
  (selecting the closed triangle swapped the panel to "Shape Species" and
  "Status: Closed").
  Extrude (New Order 7 Part 4, completing what was tracked as 6.4):
  `TemplatePanel.tsx`'s Extrude section (thickness input + button, enabled
  only with a shape selected) calls `store.extrudeTemplateShape` — turns
  the closed shape into a real Model-space `WoodMember`
  (`shapeType: 'customPolygon'`), exits to Model space, and selects it.
  Verified live end-to-end: extruded a closed triangle, it appeared in
  Model space fully lit and selected; Move (arrow-key nudge) and Rotate
  (Y-axis ring) both worked on it with zero board-type-specific code in
  either gizmo — Select/Move/Rotate treat it exactly like an Insert-created
  board, per the Order's explicit requirement.

## Unverified / Cannot Confirm From Code Alone
- **New Order 6's camera lock and grid horizon fade** — the preview
  tooling's screenshot capture failed (timed out) every attempt this
  session; confirmed unrelated to app health (the page stayed fully
  responsive to click/eval/accessibility-snapshot the whole time, zero
  console errors/warnings across repeated Profile enter/exit cycles), and
  there's no headless-accessible handle to Three.js camera state in this
  app. Both fixes are small, ordinary, well-understood code changes (an
  imperative camera position/lookAt set, and two drei Grid uniform
  values), but the actual on-screen result — does Profile really look
  top-down, does the grid really fade instead of hard-cutting — needs
  Joey's real-browser pass.
- **New Order 1.4's "snap reliability" fix** — the snapping system it
  patched was entirely removed one prompt later (1.5), so whether that
  fix was ever actually correct can no longer be checked.
- **New Order 2.2 / 2.3's grid-glitch-on-orbit fixes** — both were
  intermediate attempts explicitly reverted by 2.4 because they caused
  worse regressions. Only 2.4's end state (fixed grid) is present/
  verifiable in current code.
- **Right-click "camera swing" fix (2.3, re-fixed in 2.4)** — the
  code-level fix (capture-phase listeners, deferred orbit re-enable in
  `MoveGizmo.tsx`) is present and internally consistent, but this is a
  runtime/interactive claim that static reading can't fully confirm —
  would need to be driven in a live browser to be 100% sure. It's also
  currently backed only by that file's own in-code comment, not by an
  independent confirmation elsewhere.
- **New Order 2's original undo claim** — the raw-drag Move tool it
  applied to was fully replaced by 2.1's gizmo rewrite and no longer
  exists in the codebase, so that specific historical behavior can't be
  re-checked. The *current* (2.1+) undo behavior is confirmed correct.
- **Shift+D duplicate-last-drawn (Sketch)** — required by 1.3/1.4/1.5,
  but the code is NOT in `SketchTool.tsx` itself — it must live in
  App.tsx or a keyboard-shortcuts file, neither of which has been opened
  to confirm the shortcut actually exists and works.
- **Species dropdown on Sketch tool** — required by 3.1 item 4; likely
  lives in `SketchMaterialPanel.tsx`, and the shared-component wiring
  itself IS confirmed (both Insert and Sketch import `SpeciesSelect` and
  call `setDrawMaterial`), but the actual enumerated species list
  (Oak/Pine/Walnut/Maple/Cherry/Cedar/Poplar/Plywood, per the prompt) has
  not been read out of `src/lib/materials.ts` to confirm it's complete.
- **Move toolbar button + default-to-Select on load, all-12-edge
  highlight styling, grid sub-line contrast/origin marker** — all
  required by 2.1-2.4, plausible given the surrounding code, but the
  specific toolbar/highlight-material JSX has not been directly opened
  to confirm pixel-level behavior — a quick browser pass would settle
  these.

## Up Next
- **The ribbon UI experiment (New Order 10 / 10.1 / 10.2 / 10.2.1 / 10.3) is
  rolled back and abandoned per Joey's explicit decision — see the
  New Order 10-ROLLBACK entry above.** The app is back to the left icon
  rail + right Board Properties panel, exactly as it stood at the end of
  New Order 8.4. Every ribbon-specific "Up Next" item that previously lived
  in this section (Help tab content, contextual-tab tab-restoration edge
  cases, Template sidebar sizing, Entities-tab-vs-contextual placement,
  6-tabs-at-narrow-widths, etc.) is moot and has been removed — none of
  that code exists anymore. Do not resurrect it without a fresh, explicit
  decision from Joey to rebuild a ribbon-style UI from scratch.
- Joey to do a final real-browser confirmation pass on the rollback itself:
  every rail button/flyout, every keyboard shortcut, Board Properties edit,
  Entities hide/edit/remove, Template draw/extrude/exit, Dimension/
  Reference Line placement, and Insert. This session verified all of the
  above exhaustively via real clicks and direct store/keyboard dispatch
  (see the New Order 10-ROLLBACK entry above for the full list) — a
  real-mouse pass is the first genuine 3D-canvas-click confirmation, since
  this environment's screenshot/synthetic-pointer-drag limitation (present
  throughout this project's history) still applies.
- Joey to stress-test New Order 8.4 (Cross-Dimension Offset, Free Placement,
  Shortcuts) in the browser with a real mouse: draw a Dimension Line across a
  board's WIDTH (not its length) and confirm the offset line/witness ticks
  now visibly stand off to the side regardless of how close the 3rd
  (offset) click lands — it should never look like it's sitting on the
  measured segment; place Dimension Line points at a free (non-edge, non-
  corner) spot on a face and confirm they land there instead of being
  forced onto an edge (should already work — this session found no code gap
  between Dimension and Reference Line's placement logic, so if this still
  fails it points at something this session couldn't see, not the click-
  resolution code); press `d` to arm Dimension Line and `x` to arm
  Reference Line from Model space with nothing selected, confirm both work
  and confirm both are inert (no tool switch) while in Template mode. Could
  not be driven live this session (same stuck 300x150 headless canvas as
  every prior 8.x session) — Fix 1 and Fix 3 were verified end-to-end
  through the real Zustand store/keyboard events instead (see the New Order
  8.4 entry above for exactly what was and wasn't exercised that way).
- Joey to stress-test New Order 8.3 (Cursor Snap Marker + Full-Edge Snap
  Targets) in the browser with a real mouse: near a board's corner, try
  drawing a Dimension Line straight along one edge (place both points close
  to that same edge, near the corner) and confirm it now stays a straight
  line along that edge instead of the previously-reported diagonal; before
  ANY click (both tools), move the mouse over a board and confirm a small
  marker appears at the point a click would actually commit — switching
  between a white "X" (near an edge, within snap range) and a diagonal tick
  (free/interior) as the cursor moves, even before the first point is
  placed; confirm this marker continues correctly through point 2 and the
  Dimension Line's offset stage (marker still visible, always a tick there
  since offsets aren't edge-snapped); re-confirm 8.1/8.2's offset click
  still works well past the board's edge and Reference Line's committed
  X/tick markers still switch correctly. Could not be driven live this
  session (same stuck 300x150 headless canvas as every prior 8.x session).
- Joey to stress-test New Order 8.2 (Dimension/Reference Line live preview)
  in the browser with a real mouse: place point A for a Dimension Line and
  move the mouse WITHOUT clicking — confirm a dashed segment with a live
  length label follows the cursor continuously (not just after clicking);
  place point B and move the mouse again — confirm the offset dimension
  line (with witness ticks + label) now visibly tracks the cursor live,
  including when the cursor moves clearly PAST the board's own edge (this
  was Fix 2 — previously off-board clicks didn't register at all); click
  the 3rd point and confirm the committed line matches exactly where the
  live preview was; do the same for Reference Line — move the cursor near
  an edge before clicking and confirm the live preview's endpoint marker
  switches to a white "X" as it crosses the snap threshold, then away from
  any edge and confirm it switches back to a diagonal tick, all BEFORE
  clicking; confirm the previously-reported "doesn't render until switching
  tools" symptom is gone — the in-progress line/labels should now be
  visible continuously throughout placement, no tool switch needed; re-
  confirm from 8.1 (should be unaffected): Entities-list deselect via empty
  click, and Move/Rotate parenting for both committed line types. Could not
  be driven live this session (same stuck 300x150 headless canvas as every
  prior Dimension/Reference Line session) — the live-preview code reuses
  the exact same offset/snap functions New Order 8.1 already numerically
  verified, just fed from a new per-frame cursor state instead of only
  clicks, but the actual on-screen feel needs a real mouse.
- Joey to stress-test New Order 8.1 (Dimension/Reference Line fixes) in the
  browser with a real mouse: insert a board, pick Dimension, click point A
  and point B on the same face, then click a THIRD point clearly off to the
  side (including past the board's physical edge, e.g. above a thin board)
  and confirm the offset line + witness ticks + label now visibly move away
  from the segment to match (this was Fix 2 — previously did nothing);
  click near (not exactly on) an edge for point A or B on either tool and
  confirm it visibly snaps onto the edge (Fix 1); switch to Reference, place
  a start point near an edge and confirm a white "X" appears, then place a
  free end point away from any edge and confirm a diagonal tick appears
  (Fix 3 — previously neither marker ever showed); in the Entities list,
  click a dimension or reference line's Select button to highlight it, then
  click empty viewport space and confirm the highlight clears (Fix 4 —
  previously stuck highlighted with no way to clear it); re-confirm from
  New Order 8 (should be unaffected): both tools' geometry still stays
  correctly parented through board Move/Rotate, Hide/Show in the Entities
  list still works, and drawing multiple lines of both types on one board
  is still stable. Could not be driven live this session either — the
  headless preview's 3D canvas is still stuck at a default 300x150 box (see
  PROGRESS's New Order 8.1 entry); the root cause behind Fixes 2/3 was
  instead confirmed with a standalone Node script reproducing the exact
  face-resolution math.
- Joey to stress-test New Order 7.2 (auto-close precision fix; Arc numeric
  override + 3-point rework confirmed already-implemented) in the browser
  with a real mouse: draw a chain with at least one sharp/acute interior
  angle (e.g. a thin spike shape) and confirm the loop no longer closes by
  surprise when the drawing path merely passes near the chain's own start
  point mid-shape; watch for a dim, thin hollow square appearing well
  before you're actually close enough to close, then confirm it visibly
  intensifies (brighter/thicker, fully opaque) only once a click would
  really close the loop; try committing a click while only the dim version
  shows and confirm it just adds a normal segment, not a close; separately
  re-confirm the Arc tool's numeric override specifically on the END click
  (start → via → type a digit → Enter) commits at the typed length through
  the same 3-point bulge math a normal 3rd click would use; re-confirm
  finishing a Line segment then switching to Arc (or vice versa) mid-chain
  continues from the same last point with no extra click needed.
- Joey to stress-test New Order 7.1 (Template precision/extrude/Arc fixes)
  in the browser with a real mouse: draw two segments of matching length
  and confirm the committed second segment's readout is bit-exact to the
  first (not just close) once the cyan match guide shows; mid-placement,
  type a digit and confirm an editable field opens pre-seeded with that
  digit, type a full fractional length (e.g. "24 1/2"), confirm the cursor
  angle keeps updating live underneath while typing, press Enter and
  confirm it commits at exactly that length along wherever the cursor was
  pointing and the tool stays armed; confirm no dot/disk renders at any
  vertex (committed or mid-draw) and confirm a shape smaller than the old
  dot's footprint can now be drawn accurately; draw a segment exactly
  parallel to a committed edge and confirm a new higher-contrast cyan
  diamond marker appears distinct from the white axis-snap X (they should
  never look like the same thing); draw and close a 4-point rectangle and
  a 5+ point irregular polygon (not just a triangle) and Extrude both —
  confirm each becomes a fully opaque, correctly-shaped, normally-lit board
  from every camera angle (this was the core Fix 5/6 bug — previously a
  rectangle would corrupt and an irregular polygon could render see-
  through); Ctrl+Z the extrude away then Ctrl+Shift+Z it back and confirm
  the redone board is visually identical to the original, not distorted;
  confirm Template mode's right panel shows only Shape/Geometry/Origin/
  Extrude (no Board Properties/Entities); select a customPolygon board in
  Model space and hover it — confirm the tooltip reads
  "Bounding: W × D × T" not "L × W × T"; try the reworked Arc tool: click a
  start point, click a point on the arc (confirm the panel hint updates to
  "place end point"), click an end point and confirm a real curved arc
  commits (not the old broken math) — try again but this time press Tab
  (or click the on-canvas "Flip" button) after placing the via point and
  confirm the bulge mirrors to the other side of the chord before you
  commit; re-verify resume-after-Escape (draw 2+ segments, Escape, hover
  the open loose end with no draw action in progress, confirm it
  highlights, click it, confirm the chain resumes) — this was flagged as
  not fully re-confirmed in New Order 7 due to a dev-server HMR hiccup, not
  independently touched by 7.1's changes but still owed a clean pass.
- Joey to stress-test New Order 7 (Template Mode rebuild) in the browser
  with a real mouse: draw a multi-segment Line/Arc/Freehand chain and
  confirm live-only markers (nothing left behind once the chain
  ends/closes); confirm the distinct "X" marker appears exactly on a 0°/90°
  axis snap and the hollow square appears only near the chain's own start
  point; confirm the offset dimension line (with witness ticks, off to the
  side of the segment) and the angle arc (when not orthogonal) both render
  clearly without overlapping the segment; confirm the persistent faint
  reference axes through the origin are always visible while sketching;
  draw two segments of matching length/direction and confirm the cyan
  connector guide, then separately drag near the origin/another vertex and
  confirm a different-colored general alignment guide appears — the two
  should never look like the same thing; draw 2+ segments, hit Escape, then
  hover the open loose end with no draw action in progress and confirm it
  highlights, then click it and confirm the chain resumes from there rather
  than starting a new disconnected one (this specific hover/resume
  interaction could not be fully re-confirmed in this session's headless
  browser tooling — a mid-session dev-server HMR reconnect reset in-memory
  UI state between later test steps, not an app bug, see PROGRESS's New
  Order 7 entry above); try closing a chain with only 1-2 segments and
  confirm it's rejected (adds a normal segment instead of a shape — this WAS
  confirmed live); close a 3+ segment shape and confirm it fills unlit/flat
  (true wood color, no lighting gradient — confirmed live); select a closed
  shape, set a thickness, click "Extrude to Board" and confirm it becomes a
  real, lit, selectable/movable/rotatable board in Model space (confirmed
  live this session, including a Move nudge and a Rotate ring drag); check
  the Template rail button/badge for the new subtle orange accent while
  active; hover Line/Arc/Freehand and confirm their tooltips show the L/A/F
  shortcuts.
- Joey to stress-test New Order 6.3 in the browser with a real mouse: draw
  a 3+ segment Line/Arc chain and drag back near the start point — confirm
  the (now smaller) hollow-square indicator appears, and committing there
  closes the loop and fills it with the current species (verified live this
  session in the dev server); confirm closing is REJECTED (adds a normal
  segment instead) with only 1-2 prior segments; with no draw tool armed,
  click a filled shape — confirm it highlights orange and the right panel's
  Species dropdown swaps to "Shape Species" and edits that shape live (this
  specific click-to-select interaction could NOT be verified headlessly
  this session — see the New Order 6.3 PROGRESS entry above for why — needs
  a real click); click empty ground to confirm the shape deselects; hover
  the Line/Arc/Freehand buttons and confirm their tooltips are no longer
  clipped by the panel edge; drag an Arc segment's cursor back through its
  own start point (along the 0° reference stub, past the anchor) and
  confirm it no longer breaks/goes haywire; draw two segments of the same
  length or parallel direction and confirm a single dashed connector line
  appears between them (not a highlight on every match) and that it takes
  a beat of movement to release once matched (not an instant flicker);
  confirm the live length/angle label floats clearly beside the dragged
  point, not on top of it; select a board in Model mode and swap its
  Species dropdown — confirm the grain color updates instantly (verified
  live this session); click the new "«" corner tab to collapse the right
  panel and confirm it becomes a slim "»" strip, then expand it back.
- Joey to stress-test New Order 6.2 in the browser with a real mouse: draw
  a segment and Ctrl+Z it away, then Ctrl+Shift+Z/Ctrl+Y it back (confirmed
  live this session via synthetic events, but a real-mouse pass is still the
  final word); try undoing/redoing across a MIX of board actions and
  profile edges in the same session to confirm they unwind in true
  chronological order; confirm W/M/R/S/I and Shift+D all do nothing while in
  Profile; open the Transform/Create flyout at a normal window width (should
  open rightward as before) and, if easy to test, a narrowed browser window
  (should flip to open leftward instead of clipping); draw a multi-segment
  chain and look for a small dot at each joint; drag back near a chain's
  start point and look for a hollow white square snap indicator; draw a
  segment matching an earlier one's length or direction and look for a
  dashed cyan highlight on the matching segment (should NOT force the
  drawn segment to snap, only highlight); confirm the live length/angle
  label now floats beside the dragged point rather than on top of it, and
  feels smoother than 6.1's version; check an Arc segment's label for a
  "R ..." radius reading.
- Joey to stress-test New Order 6.1 in the browser with a real mouse: draw
  a multi-segment chain mixing Line and Arc (confirm the Arc curve stays
  tangent to whatever was drawn before it, and that switching tools
  mid-chain doesn't break the continuation); try the 15° angle snap by
  dragging near straight-continuation (0°) and a right-angle turn (90°)
  off the reference stubs; try Freehand for a hand-drawn stroke; right-click
  and Escape mid-drag to confirm the chain ends without deleting what's
  already drawn, then Escape again to confirm a clean exit to Model space;
  confirm W/M/R/S/I do nothing while in Profile; click the Profile rail
  button a second time to confirm it exits directly (no need to pick
  another tool first); hover the Transform/Create rail buttons to confirm
  the icons look centered like Select's and the chevron no longer crowds
  the icon; open the Transform or Create flyout and hover the trigger
  button to confirm its tooltip no longer overlaps the flyout's own
  buttons. (New Order 6.2 has since fixed/polished this tool further — see
  the entry above and the New Order 6.2 stress-test item above this one.)
  New Order 6.3 (closed-loop detection + species fill) has since built on
  this tool further — see that entry above. Extrude-to-solid (turning a
  closed, filled shape into a real 3D board with a thickness input) is
  still the next Profile candidate after that.
- Joey to stress-test New Order 6 in the browser with a real mouse: click
  Profile (rail button or P) and confirm the camera snaps to a straight
  top-down view with orbit/tilt disabled but pan and zoom still working;
  confirm the grid genuinely fades near its edge now instead of stopping
  at a hard line, and — just as important — that it does NOT reintroduce
  the 5.4 vignette at normal zoomed-in distances; confirm Escape and the
  panel's "Exit to Model" button both return the camera to wherever it was
  before entering Profile (not just to some default angle); confirm
  clicking Move/Rotate/Sketch/Insert while in Profile correctly bails back
  to Model space (the existing mode-follows-tool behavior, not new code,
  but worth confirming it feels right from Profile specifically); spot-
  check the right panel's edge tab sitting near "Select" instead of the
  panel's vertical middle in every tool's panel, not just Profile's.
  Next candidate after Joey's pass: New Order 6.1 (Profile draw tools).
- Joey to stress-test New Order 5.4 in the browser with a real mouse:
  confirm the grid/viewport looks evenly lit at various zoom levels and
  orbit angles (not just the fixed test-camera angle checked this
  session); click the new edge tab handle to collapse/expand the right
  panel a few times in a row; spot-check the logo mark rendering crisply
  at the rail's actual on-screen size; confirm the Transform/Create
  flyout buttons still feel like one clickable zone without the divider.
- Joey to stress-test New Order 5.3 in the browser with a real mouse:
  the Sketch draw-preview color while actively dragging (should be orange,
  not amber — this was a code-only hex swap, not independently confirmed
  live this session, same headless-drag limitation as every prior Order);
  general color/contrast check across the whole app in real lighting
  conditions (a screenshot can't fully substitute for eyes on a real
  monitor); Rotate's per-axis ring gizmo and Move's axis-handle gizmo,
  which weren't touched by this Order but sit inside the now-restyled
  viewport, to confirm nothing about the color change made handles harder
  to see against the new warm-grey background.
- Joey to stress-test New Order 5.2 in the browser with a real mouse:
  hover a board and confirm the tooltip's on-screen size no longer
  shrinks when zoomed out or orbited far away (the one New Order 5.2 fix
  that couldn't be driven live this session — see that entry above);
  also spot-check the Transform/Create flyout button sizing and corner
  chevrons, Board Properties starting collapsed on a fresh page load,
  and the double-chevron manual toggle on Board Properties/Entities.
- Joey to stress-test New Order 5.1 in the browser with a real mouse:
  hovering a board in the 3D viewport should show a small floating label
  (name, species, dimensions) — this is the one New Order 5.1 feature that
  could not be driven live this session (see the New Order 5.1 entry
  above for why); also spot-check the Transform/Create rail flyouts,
  inline board rename from both locations, and that Board Properties
  auto-expands on every fresh selection, not just the first one.
- Joey to stress-test New Order 5 in the browser: wood grain rendering on
  every tool (especially after a Rotate drag), tool-switch panel behavior
  (Insert -> M -> R -> W and confirm only one section ever shows), the
  Entities list (visibility toggle, edit, remove) with multiple boards, and
  general feel of the new tool rail + properties panel layout.
- Joey to stress-test Sketch's free-hand drag-to-draw specifically with a
  real mouse — this session's headless browser tooling could drive it via
  button clicks (Insert) but not a reliable synthetic drag gesture on the
  3D canvas (OrbitControls intercepted the synthetic pointer events instead
  of the draw plane), so Sketch's own drag behavior is unverified live this
  session even though its code is unchanged from New Order 1.5.
- Joey to stress-test Rotate (New Order 4) in the browser: per-axis ring
  drag on a real board via mouse, Tab-cycling axis, Shift-held free
  rotation, Escape/right-click cancel mid-drag, and multiple undo/redo
  cycles across a rotate + a move + an insert in the same session.
- Next New Order candidate: Profile/Extrude (Fusion-style 2D sketch mode)
  per DOVEDESIGN_ROADMAP.md.
- Verify Shift+D duplicate (New Order 3.2's Z-offset fix) in the browser —
  confirmed only via Insert's repeated-Place-click path in this session
  (browser-tested: 4 boards placed via real clicks, each on its own
  render tick, lined up correctly side-by-side with distinct wood-grain
  texture per species). The keyboard-triggered duplicate path itself
  wasn't separately re-tested live.
- CLAUDE.md's File Map / "5 Most Broken Things" sections still describe
  the pre-reset app and should be rewritten to match the New Order
  rebuild whenever there's a natural pause.

## 2026-08-10 — UI polish pass + Chamfer drag z-fighting fix
Cosmetic-only pass, no tool logic touched except the Chamfer fix noted below:
- `TopMenuBar.tsx`: added a centered project name + board count display
  ("Untitled Project · 0 boards"), balanced against the File button's width
  so it stays visually centered.
- `App.tsx`: added a subtle screen-space radial-gradient vignette over the
  Viewport (CSS overlay, `pointer-events-none` — not a Three.js scene
  change, doesn't touch the frozen R3F pipeline). Tuned down once per
  Joey's feedback that the first pass was too strong.
- `PropertiesPanel.tsx`: replaced bare "No boards yet" / "Select a board..."
  text with a small dashed-icon `EmptyHint` component.
- Floating rounded-card redesign (Joey wanted to mirror Figma's UI chrome
  style): `TopMenuBar.tsx`, `ToolRail.tsx`, and `PropertiesPanel.tsx`
  (including its collapsed strip) all changed from flush/edge-docked panels
  to `rounded-xl border shadow-xl` cards with a `top-3/left-3/right-3/
  bottom-3` gap against the window edges, floating over the canvas.
  `PanelEdgeTab`'s collapse/expand button repositioned from a corner-flush
  tab to an inset `top-2 right-2` button to match the now-rounded corner.
- Button hover/press polish: `ToolRail.tsx`'s `RailButton` and its group
  flyout, `TopMenuBar.tsx`'s File button/menu items, `PropertiesPanel.tsx`'s
  rotation-axis buttons and `PanelEdgeTab`, and `CollapsibleSection.tsx`'s
  header all got consistent `transition-all duration-150` plus
  `active:scale-95`-style press feedback. Flyouts/dropdowns now animate in
  via a new shared `flyoutIn` keyframe in `index.css`.
- Verified live via the Browser preview + Joey's own screenshots after
  every step; `npm run build` clean, 0 TypeScript errors throughout.

**Chamfer drag z-fighting fix** (Joey reported: dragging a chamfer handle
out shows jagged/z-fighting edges mid-drag, on top of the earlier committed
`49dbf17` large-size sliver fix). Root cause found via an Explore-agent
investigation of the live-drag path: `Engine.ts`'s CHAMFER feature case only
skips building a bevel face at exactly `size <= 0` — a drag naturally sweeps
through near-zero on its way out, and any strictly-positive-but-tiny size
(e.g. 0.005") still builds a real, nearly-coplanar bevel face that z-fights
its neighbor, the same failure shape as the large-size sliver bug just at
the opposite end of the range. Fix: added a `MIN_SIZE = 0.03"` snap-to-zero
threshold, mirrored in both `BoardMesh.tsx`'s live-drag `commit()` and
`ChamferPanel.tsx`'s numeric-input `setSize()`, alongside the existing
`maxSize`/`MAX_SIZE_FRACTION` upper-bound guard. `npm run build` clean, 0
TypeScript errors. **Not yet verified live with a real mouse drag** — Joey
said he'd test later; needs confirmation the jaggedness is actually gone
before considering this closed.

**Chamfer Distance & Angle mode** (Joey: typing two independent yMax/zMin
sizes was confusing — wanted to think in terms of an actual bevel angle
instead). `ChamferPanel.tsx` now has a local `mode` toggle ("Two Sizes",
the original two independent SizeFields, vs. "Distance & Angle", a single
distance-along-Face-A field plus a new `AngleField` in degrees). Both modes
write through one new shared `commitSizes(sizeA, sizeB)` — `setSize`
(Two Sizes), `setAngle`, and `setDistanceKeepingAngle` (Distance & Angle)
are now thin wrappers around it, so the MIN_SIZE/MAX_SIZE clamp from the
z-fighting fix above only lives in one place. Angle mode derives the other
face's size as `distance * tan(angleDeg)`, mirroring Fusion 360's own
"Distance and Angle" chamfer type; clamped 1°-89° to stay off the
degenerate flat-face ends. `ChamferPanel`'s body was split into an outer
component (owns the "no edge picked yet" list) and a new `ChamferEdgePanel`
(keyed on `memberId:edgeId` so the mode toggle's local state resets
whenever a different edge is picked, instead of carrying a stale mode over).
Verified live: switched to Distance & Angle on an existing 45°/1/4" chamfer
(correctly showed Distance 1/4", Angle 45.0°), typed Angle 30°, switched
back to Two Sizes and confirmed Size (yMax) stayed 1/4" while Size (zMin)
recomputed to 9/64" (== 0.25 × tan(30°), correct). `npm run build` clean, 0
TypeScript errors.

**Board hover tooltip restricted to Select tool** (Joey: the dimension
tooltip that appears on hover was covering the Chamfer drag arrows, making
them hard to grab even though the tooltip is `pointer-events: none` —
visually occluding the handle is enough to make it hard to work with).
`BoardMesh.tsx`'s hover `<Html>` overlay now only renders while
`activeTool === 'select'` — every other tool (Chamfer, Mate, Trim/Extend,
Dimension, Reference) already has its own in-viewport handles/highlights
that this was covering. `npm run build` clean, 0 TypeScript errors.

Discussed but scoped as its OWN future New Order sequence, not started:
Joey wants a real Cutout tool (already stubbed disabled in ToolRail.tsx) —
sketch an arbitrary profile directly on an existing board face, then
push/pull that region in or out to cut pockets/grooves/holes or add raised
bosses; described as the eventual general-purpose cut/joinery tool. This is
a real CSG/boolean-geometry feature (the project already has
`@react-three/csg` installed but unused) that breaks the current Engine's
"6 flat rectangular faces" Solid model (CAD_MANIFESTO.md Law 2) — needs a
proper Data Flow Pipeline + likely multiple New Orders (sketch-on-face
picking first, the actual cut math second), not an in-session improvisation.
Also separately discussed: a simpler length-only Push/Pull (drag either end
face to grow/shrink length, reusing the same math Insert's Length field
already uses) as a smaller possible first step — not started either.

## 2026-08-10 — New Order 11: Cutout Part 1 of 2 — Sketch a Profile on a Board Face
Part 1 of (at least) 2, per the discussion above and the Order's own scope
discipline: this session builds ONLY the sketch-on-face half (pick a face,
draw a closed Line/Arc profile, store it, render its outline). No cut,
extrude, push/pull, boolean subtraction, or `@react-three/csg` usage — a
committed profile is inert data that renders as an outline and changes
nothing about the board's actual solid shape. New Order 11.1 is next: give
the stored profile a depth and an actual material-removal (or boss) result.

- **Data model**: new `CutoutProfile` type (`types.ts`) — `{ id, faceId,
  points: {u,v}[] }`, a single closed 2D point loop stored in the picked
  FACE's own (u,v) space (never world coordinates — CAD_MANIFESTO.md Law
  1/2). New `member.cutoutProfiles?: CutoutProfile[]` field on `WoodMember`.
  Arcs are sampled into straight points at commit time (reusing Template's
  existing `arcBulgeFrom3Points`/`sampleEdgePoints` math unchanged), so a
  `CutoutProfile` itself never retains curve parameters — just the point
  loop the Order's spec calls for.
- **Tool entry + face pick**: enabled the previously-disabled `CUTOUT` rail
  button (`ToolRail.tsx`). Clicking it then a board face reuses the exact
  face-resolution math Mate/Trim/Chamfer already share
  (`boardFaceMath.ts`'s `resolveFaceClick`, wired into `BoardMesh.tsx`'s
  existing hover/click handlers the same way Chamfer's edge-pick and Mate's
  face-pick already work) and writes `ui.cutoutFace` (new UI state, mirrors
  `chamferEdge`/`mateFaceA`'s shape). `cutout` added to
  `MODE_TOOLS.model` (`workspaceModes.ts`) next to `chamfer` — Cutout stays
  a Model-space tool, not a separate workspace mode like Template.
- **Camera lock onto the picked face**: new `CutoutCameraLock.tsx`, mounted
  unconditionally in `Viewport.tsx` like `TemplateCameraLock.tsx`. On a face
  pick, computes that face's center + normal in board-LOCAL space, then
  transforms both to WORLD space using the picked member's CURRENT
  position/rotation (Euler), and frames the camera looking straight at that
  world point from along the world normal — same "origin + normal *
  distance" shape as Template's own camera lock, just against a live board
  face's transform instead of a fixed world plane. Restores the prior
  camera pose on leaving the pick, same as Template.
- **Draw a closed profile**: new `CutoutDrawTools.tsx`, mounted
  unconditionally in `Viewport.tsx`. Renders an invisible capture mesh built
  from the picked Face's own 4 corners (`boardFaceMath.ts`'s
  `faceCorners3D`, the same corners `FaceHighlight` already draws) inside a
  `<group position={member.position} rotation={member.rotation}>`, so every
  click naturally resolves to board-local space via `worldToLocal` and then
  to the Face's own (u,v) via the existing
  `CADGeometryEngine.projectLocalToUV`/`clampUV` (no second projection
  formula). Line commits a segment per pair of clicks; Arc reuses Template's
  unmodified 3-point arc math (`arcBulgeFrom3Points` + `sampleEdgePoints`
  from `templateSketchMath.ts`) to sample the curve into straight points.
  Clicking within a small threshold of the sketch's own first point (3+
  points already placed) closes the loop and commits instead of continuing
  — mirrors Template's own closing-loop rule, deliberately simplified (no
  alignment guides/snapping/Freehand — out of scope per the Order's "don't
  chase feature parity" note). Right-click/Escape cancels the in-progress
  sketch only (new `cutoutDrawState.ts`, same singleton-registration pattern
  as `templateDrawState.ts`, wired into `App.tsx`'s existing Escape chain) —
  never deletes already-committed profiles.
- **Commit + panel**: new `CutoutPanel.tsx` (mirrors `ChamferPanel.tsx`'s
  structure) shows the picked face, the Line/Arc tool picker, and an
  "Existing Cutout Profiles" list across every board (same precedent as
  Chamfer's "Existing Chamfers" list) with a Remove action per profile. A
  committed profile calls the new `store.addCutoutProfile(memberId,
  profile)`, which writes through the EXISTING `updateMember` action — the
  same history/commit pipeline every other board-parameter edit already
  uses, so undo/redo needed no new mechanism. Per the Order's explicit
  single-profile-per-pick scope, committing a profile automatically returns
  to the "pick a face" step (`resetCutoutPick`) rather than staying armed
  for a second profile on the same face in the same session.
- **Visual feedback, no geometry change**: new `CutoutProfileOutline`
  component in `BoardMesh.tsx` renders each committed profile as a closed
  orange outline (`Line`), re-derived fresh every render from
  `(faceId, u, v)` via `CADGeometryEngine.projectUVToLocal` against the
  board's current Face list, rendered as a CHILD of the board's own mesh —
  the same FOLLOWS-BOARD pattern `FaceHighlight`/`EdgeHighlight` already
  use, so it inherits `member.position`/`member.rotation` automatically with
  no manual re-sync step. Nothing about `Engine.ts`'s Solid/Face/Wire/Edge
  topology or the board's rendered geometry changes — confirmed by reading
  `buildRenderMesh`'s inputs (unchanged: length/width/thickness/species/
  chamfers only) rather than assumed.
- `npm run build`: clean, 0 TypeScript errors.
- **Not verified live this session** (no browser preview available in this
  environment, same longstanding limitation as every prior New Order's
  click/drag-based tools): picking a face, drawing/closing a Line and Arc
  profile, confirming the outline renders with no change to the board's
  solid shape, confirming two profiles on different faces of the same board
  both show in `CutoutPanel.tsx`'s list, undo/redo after a commit, and the
  FOLLOWS-BOARD check (profile outline correctly following a Move/Rotate).
  The code paths reuse existing, already-verified face-pick
  (Mate/Trim/Chamfer), draw (Template Line/Arc), and history (`updateMember`)
  machinery rather than inventing new versions of any of them, which lowers
  risk, but every interactive path above still needs Joey's real-mouse pass.

## 2026-08-10 — New Order 11.1: Cutout sketch — snapping, undo-point, visual clarity fix pass

Same-day follow-up to New Order 11 Part 1 above, after Joey's first
real-mouse test produced a jagged, disorganized zigzag outline with no way
to correct a mis-click short of restarting the whole sketch, and no visual
distinction between committed/in-progress/closed sketch geometry.
Presentational/interaction polish only — no CSG, no `CutoutProfile`
data-model change, no change to face-picking or how a profile commits
(same scope category as 5.2/5.3/5.4/6.2's prior presentational fixes).

- **Point snapping while sketching**: new `src/lib/cutoutSnap.ts` (pure
  function, Manifesto Law 4 Vector Isolation Rule) — `snapCutoutCursor`
  first checks the live cursor against every already-placed point in the
  CURRENT chain (tight tolerance, so clicking back near the chain's own
  start closes the loop exactly, and clicking near any earlier vertex
  corrects a misclick onto it instead of a near-miss), then falls back to
  `boardFaceMath.ts`'s existing `snapUVToEdge` (reused, not duplicated) to
  snap onto the picked Face's own boundary/corners. Wired into both
  `handlePointerMove` (live preview) and `handlePointerDown` (commit) in
  `CutoutDrawTools.tsx`, so what's previewed is exactly what gets placed.
- **Undo last point (Backspace)**: new keydown handler in
  `CutoutDrawTools.tsx` — Backspace removes only the most recently placed
  point (or, if an Arc's via point is staged but uncommitted, that via
  point first), alongside the pre-existing Escape-cancels-whole-chain
  behavior in `cutoutDrawState.ts` (unchanged, still the "start over"
  action).
- **Visual clarity**: committed segments now render as a slightly heavier
  solid line (`lineWidth` 2 -> 2.5); a small vertex dot renders at each
  committed point (the chain's own start point brighter/larger, since it's
  the closing target) so a zigzag reads as distinct placed points instead
  of ambiguous mess; the live in-progress segment's existing dashed/orange
  styling is unchanged and remains the visual "this isn't committed yet"
  signal. Once a profile closes, `BoardMesh.tsx`'s pre-existing
  `CutoutProfileOutline` (untouched this pass) already renders it as one
  continuous solid outline, distinct from the in-progress sketch styling
  above.
- **Not touched**: face-picking, `CutoutProfile` type/store fields,
  `CutoutPanel.tsx`'s structure, profile commit logic.
- `npm run build` clean, 0 TypeScript errors.
- **Not verified live this session** (same longstanding no-browser-preview
  limitation as every prior New Order's click/drag tools): snapping onto a
  face corner/boundary, snapping back onto the chain's own start point to
  close cleanly, Backspace removing a single misclicked point without
  losing the rest of the chain, and the vertex-dot/solid-vs-dashed visual
  distinction reading correctly on a real board face. Needs Joey's
  real-mouse pass — specifically, try sketching a rectangle and confirm it
  now snaps closed cleanly onto the corners instead of zigzagging.

## 2026-08-10 — Cutout follow-up fix: clicks placing points off from the cursor

Joey's real-mouse test of the Cutout sketch tool (New Order 11) found
placed points visibly not lining up with where he actually clicked —
confirmed with a real mouse, not a testing-tool artifact.

**Root cause**: traced the full round-trip (screen click -> raycast ->
`e.object.worldToLocal` -> `projectLocalToUV` -> `clampUV` ->
`snapCutoutCursor` -> stored (u,v) -> `projectUVToLocal` for rendering) in
`CutoutDrawTools.tsx`, `boardFaceMath.ts`, and `Engine.ts`. That math is
internally consistent — a click's world hit point always resolves to the
correct (u,v) on the picked Face's own basis, and renders back to the same
3D point. The actual bug was NOT in that math; it was that
`CutoutCameraLock.tsx` frames the camera straight at the picked face (a
locked-plane precision view, same purpose as `TemplateCameraLock.tsx`'s
locked top-down Template view), but `Viewport.tsx`'s `<OrbitControls>` only
disabled `enableRotate` for Template mode — Cutout's face-picked state
never disabled rotate. A real mouse click almost always has a small amount
of down-to-up drift; with rotate still enabled, that drift orbits the
camera slightly off the locked framing during the click. Once orbited even
a little, the board's other faces can become partly visible at the angle
being clicked, so the ray for that pixel passes through/behind a NEARER
face before reaching the picked face's invisible capture plane. The click
still resolves against the capture plane (the math is correct), but that
resolved point no longer corresponds to what's actually rendered under the
cursor — which is exactly the "point doesn't land where I clicked" symptom.

**Fix**: `Viewport.tsx` — `<OrbitControls enableRotate={...}>` now also
checks `!cutoutFace` (`ui.cutoutFace` from the store), so rotate is
disabled for the same reason and in the same targeted way Template already
disables it, only while a face is picked and armed for sketching (not
during the earlier "pick a face" hover step). Pan/zoom stay on, same as
Template.
- Files touched: `src/components/Viewport.tsx` only.
- Not touched: `CutoutDrawTools.tsx`, `CutoutCameraLock.tsx`,
  `boardFaceMath.ts`, `cutoutSnap.ts`, `Engine.ts` — all read and traced,
  confirmed mathematically correct, left unmodified per scope (fix only the
  confirmed bug, no speculative changes to working code).
- `npm run build` clean, 0 TypeScript errors.
- **Not verified live this session** (no browser preview in this pass) —
  needs Joey's real-mouse retest: sketch a rectangle/profile on a board
  face and confirm each click now lands exactly where clicked, including
  after slight camera movement attempts (which should no longer be
  possible once a face is picked — pan/zoom should still work).

## 2026-08-10 — New Order 11.1 Part 2: Cutout — push/pull a profile to Cut

Closes out the two-part New Order 11/11.1 Cutout feature. Part 1 (above)
captured a profile as inert outline data with no shape change; this session
gives it depth and an actual material-removal result — the "second half" of
Cutout Joey's been waiting on.

**Plain-English summary**: a committed cutout profile now actually carves a
pocket into the board — type a depth number or drag the new orange handle
on the board itself to push it deeper or pull it shallower, and the board's
3D shape updates immediately, with real interior walls and a floor you can
see, not just a flat outline sitting on the surface.

- **Law 2 topology decision (the hard part of this Order)**: the existing
  `Face` type has exactly one boundary (`outerWire`) — there's no
  "innerWire"/hole concept, and adding one would be a structural change to
  `CAD_ENGINE_BLUEPRINT.ts`'s core types (the Order's own STOP condition).
  Instead of doing that, `Engine.ts` uses the standard B-Rep "keyhole"
  technique: the picked face's outer rectangle boundary and the cutout
  profile's hole boundary are stitched into ONE ordered, closed loop (walk
  the outer rectangle, bridge to the nearest hole vertex, walk the whole
  hole loop, bridge back) — still a single `outerWire: Wire`, still an
  ordered `Edge[]` forming a closed loop, no type change at all. The
  pocket's interior walls and floor are each ordinary new `Face` entries
  appended to the Solid's existing `faces` array (same "extend the list"
  precedent Chamfer's bevel face already set). No STOP was hit — the
  existing topology genuinely extends to cover this.
- **The CSG itself**: new `CADFeature` variant `CUTOUT` (`Engine.ts`) —
  `evaluateFeatures`'s new case extrudes the profile along the picked
  face's normal by `depth`: replaces that face with the keyhole-stitched
  polygon (reuses `makePolygonFace`, unmodified, the same helper New Order
  7's extruded-polygon top/bottom faces already use), builds one rectangular
  wall `Face` per profile edge via the existing `makeFace` helper (own local
  u/v basis per wall — edge direction + into-the-board depth direction — not
  reusing the top face's own axes, which don't span a wall's plane), and one
  floor `Face` parallel to the original at `depth`. Wall/floor winding is
  derived explicitly (centroid-facing test for walls, opposite-of-hole for
  the floor) so normals and triangle winding agree — verified by re-reading
  `buildRenderMesh`'s quad-path assumption (`uAxis × vAxis == normal`
  determines outward direction) against every new face built. `direction:
  'add'` (raised boss) is explicitly descoped — `evaluateFeatures` no-ops it,
  `CutoutPanel.tsx` shows a plain-language note when picked. Depth is
  clamped to the board's own extent along the face's normal (derived from
  the opposite face, minus a small floor-gap) so a cut can deepen into a
  true through-hole-adjacent pocket but never fully sever the board — no
  dual-face through-hole topology attempted, matching the Order's own
  "full severing is out of scope" line.
- **Depth/direction input**: `CutoutProfile` (`types.ts`) gained optional
  `depth`/`direction` fields. `store.addCutoutProfile` now seeds a real
  default (0.5", Cut) on every fresh commit and immediately arms it for
  editing (`ui.cutoutEditProfile`, new UI state) so the push/pull handle is
  available the instant a sketch closes — no extra click needed.
  `CutoutPanel.tsx`'s existing-profile list is now clickable (mirrors
  ChamferPanel's edge list) and opens a new `CutoutProfileEditor` (Cut/Add
  toggle + a fractional-inch Depth field, same `SizeField`/nudge-button
  pattern as Chamfer/BoardEditPanel). New `CutoutDepthHandle`
  (`BoardMesh.tsx`) is a single-axis drag handle (along the face normal,
  same "raycast an invisible plane, extract one scalar via dot product"
  technique as `ChamferAxisHandle`) offering the in-viewport push/pull the
  Order asked for. Both write paths converge on the same
  `updateMember(id, { cutoutProfiles })` call — one source of truth, same
  history/undo pipeline as every other board-parameter edit (no second undo
  stack).
- **FOLLOWS-BOARD / re-derivation check**: `BoardMesh.tsx`'s render-geometry
  `useMemo` now also depends on `member.cutoutProfiles` (alongside the
  existing `member.chamfers` dependency) and builds a fresh `CUTOUT`
  `CADFeature` list from it every render, merged with the chamfer features
  into one `evaluateFeatures` call — read through explicitly: resizing
  Length/Width/Thickness after a cut exists re-derives the pocket correctly
  because the profile is stored as face-relative (u,v), never a cached
  world/local point, and the face/board-extent clamp above is recomputed
  from the CURRENT base topology every call, not a stored value. This was
  the specific "baked geometry" trap the Order warned about — confirmed by
  reading the dependency array and the clamp's own inputs rather than
  assumed.
- **Interop check (reasoning-level, not live)**: Mate/Trim/`FaceHighlight`
  and Chamfer's own edge-picking all read from `boardFaceMath.ts`'s
  `getMemberFaces` — a SEPARATE, deliberately untouched derivation from the
  one `BoardMesh.tsx`'s render-geometry `useMemo` now feeds `CUTOUT`
  features into. A board's outer faces stay flat rectangles for every
  picking/interaction purpose (Mate/Trim/Chamfer keep working against them
  exactly as before); only the actual rendered mesh gets the topological
  modification. Chamfer's own `evaluateFeatures` case and the new `CUTOUT`
  case both read/write `faces` sequentially in the same reduce loop,
  same as any two chamfers already coexisting — not independently
  re-verified live, but the code path is the same "each case reads the
  current fold-so-far and returns a new one" shape every existing feature
  case already uses.
- **Explicitly descoped this Order** (per the Order's own scope discipline):
  Add direction (raised boss) — stored, UI-visible, not evaluated;
  multiple/overlapping cutouts or a cutout intersecting a chamfer on the
  same face — `evaluateFeatures`'s `CUTOUT` case explicitly skips a face
  that's already been reshaped (`outerWire.edges.length !== 4` guard) rather
  than stacking cuts, so a second profile on an already-cut face silently
  does nothing yet (noted, not fixed, this pass); wood grain texture
  mapping on the new interior wall/floor faces is whatever `buildRenderMesh`
  already produces for a generic quad/polygon face (reasonable, not
  hand-tuned for a cut cavity specifically) — follow-up if it looks off in
  practice; cuts on a `customPolygon` (Template-extruded) board — scoped out
  the same as Chamfer/Mate already are.
- `npm run build`: clean, 0 TypeScript errors.
- **Not verified live this session** (no browser preview available in this
  environment, same longstanding limitation as every prior New Order's
  click/drag-based tools): cutting a rectangular pocket and confirming
  visible depth/interior wall+floor shading with no z-fighting or inverted
  normals, dragging the new depth handle, resizing a board after a cut
  exists and confirming the pocket recomputes rather than going stale,
  Chamfer-elsewhere-on-a-cut-board coexisting correctly, and undo/redo
  after a depth edit. All were traced through the code/math by hand (see
  the FOLLOWS-BOARD and interop checks above) rather than assumed, but every
  interactive/visual path needs Joey's real-mouse pass.

## 2026-08-10 — Cutout follow-up bugfix: Cut profile showed a flat outline, no real depth
Joey's real-mouse pass on New Order 11.1 Part 2 found the exact gap the
prior session flagged as unverified: committing a rectangular Cut profile
showed "Cut 1/2"" correctly in the CutoutPanel list, but the board itself
only showed the flat sketch outline — no pocket, no walls, no floor. It
looked like New Order 11's original inert preview, as if the 11.1 CSG work
never reached the mesh.

**Plain-English root cause**: it did reach the mesh — the bug wasn't in the
wiring (store -> BoardMesh's feature list -> Engine.ts's CUTOUT case all
checked out correctly on inspection), it was in the last step,
`buildRenderMesh`, which decides HOW to turn a Face's boundary loop into
triangles. That function has two paths: a fast "quad" path for an ordinary
rectangular box face, and a general "N-gon" path for an arbitrary polygon
loop. It picked between them by asking two questions: does this face's id
say 'top'/'bottom' (customPolygon board faces), and does its loop have
exactly 4 vertices? The CUTOUT case's new FLOOR face (the bottom of the
pocket) is built as an arbitrary polygon loop via `makePolygonFace` — but
for the everyday case of a rectangular cutout, that floor loop also happens
to have exactly 4 vertices, and its id is neither 'top' nor 'bottom'. So
the floor face was silently misrouted into the quad-reconstruction path,
which doesn't use the floor's actual vertex positions at all — it
recomputes a rectangle from the face's origin/uAxis/vAxis assuming a
specific corner order the floor loop never promised. The result was a
corrupted/misplaced floor quad, which rendered wrong (effectively
invisible/degenerate against the top face), so all Joey could see was the
sketch outline overlay sitting on an otherwise-uncut-looking board. The
walls and the stitched top face were unaffected (walls are always built via
the safe rectangle path; the stitched top face always has far more than 4
vertices once a hole is stitched into it, so it never hit this
misrouting).

**Fix** (`src/core/Engine.ts`): added an explicit `isPolygonBoundary?:
boolean` field to `Face`, set `true` only by `makePolygonFace` (never by
`makeFace`). `buildRenderMesh`'s dispatch now checks that flag instead of
guessing from `face.id` or coincidental edge count — any
`makePolygonFace`-built loop (customPolygon top/bottom, CUTOUT's stitched
top face, CUTOUT's floor face) always takes the general N-gon path
regardless of how many vertices it happens to have; only genuine
`makeFace` rectangles take the fast quad path. This is a plumbing/dispatch
fix, not a topology or math change — no violation of the frozen
Solid->Face->Wire->Edge structure, and the keyhole-stitch math from the
prior session was confirmed correct as-is (walls and the stitched top face
were already rendering via the right path; only the floor face was
mis-dispatched).
- `npm run build`: clean, 0 TypeScript errors.
- **Not verified live this session** (no browser preview available in this
  environment): Joey still needs to confirm in-browser that a rectangular
  Cut now shows a real pocket with visible walls/floor, that the depth
  handle drag still works, and that a triangular/pentagon (non-4-vertex)
  cutout profile — which was never affected by this bug — still renders
  correctly too (regression check on the fix).

## 2026-08-11 — Cutout follow-up bugfix #2: still flat/no-depth, root cause was the keyhole bridge itself
The prior session's fix (isPolygonBoundary dispatch) was necessary but not
sufficient — Joey's real-mouse pass still showed a rectangular Cut on a
board's top face as a flat 2D shape (described as "turned into a sort of
triangle") with no visible pocket depth.

**Plain-English root cause**: `evaluateFeatures`'s CUTOUT case builds the
board's cut top face via the standard B-Rep "keyhole" technique — stitching
the face's outer rectangle and the hole (the cut profile) into one closed
loop via a thin zero-width bridge, then triangulating that loop. The bridge
picked its two connection points by nearest raw 3D distance between any
outer corner and any hole vertex. That has no guarantee the straight bridge
segment stays inside the rectangle-minus-hole region — for anything but a
perfectly centered hole, the "nearest" pair can sit such that the bridge
line cuts back across the hole itself, producing a self-intersecting loop.
The generic ear-clip triangulator (`earClipTriangulate`) can't make
progress on a self-intersecting polygon, stalls, and silently falls back to
a plain vertex fan from one corner — exactly what reads on screen as "a
flat triangle," since a fan from a single point covers only a fraction of
the true shape and ignores the hole entirely (walls/floor were unaffected
by this specific bug, but a broken/degenerate top face reads as "no depth"
overall since it's what draws over everything else from a top-down view).

**Fix** (`src/core/Engine.ts`): replaced the nearest-vertex 3D bridge
(`buildKeyholeLoop`/`findNearestVertexPair`, deleted) with a new
`buildKeyholeLoopUV`, operating directly in the face's own (u,v) space
where the outer boundary is always the simple axis-aligned rectangle
(0,0)-(widthU,heightV). It bridges from the hole's rightmost vertex (max
u) via a horizontal ray straight out to a new point split into the
rectangle's own right edge at the same v. This is provably
non-self-intersecting: since that hole vertex has the maximum u of the
whole hole loop, every other hole edge is a straight segment between two
points whose u is also <= that max (a convex combination can't exceed the
max of its endpoints), so nothing else on the hole boundary can lie between
the bridge vertex and the rectangle edge for the ray to cross — and CUTOUT
only ever runs against a still-simple 4-edge rectangular face (existing
guard, unchanged), so there's nothing else in the face's plane to cross
either. Separately, `earClipTriangulate`'s `pointInTriangle` test was
patched to stop treating a point that exactly coincides with one of a
candidate ear's own 3 vertices as "inside" it — the keyhole loop
deliberately repeats its two bridge vertices at different list indices (the
zero-width seam), and without this guard those duplicates were themselves
blocking valid ears near the seam, an independent stall source the fresh
bridge geometry alone wouldn't have fixed.
- `npm run build`: clean, 0 TypeScript errors.
- **Verified this session**: not via real-mouse click/drag (still the
  documented headless limitation), but via two more direct checks. (1) A
  standalone re-implementation of both changed functions run under plain
  Node against three cases — an off-center rectangular hole (the exact
  reported scenario), a centered rectangular hole, and a triangular hole —
  confirmed zero triangulation stalls and the resulting mesh area exactly
  equals outer-rectangle-area-minus-hole-area in all three (148, 144, 154
  sq units respectively, hand-verified). (2) Live in the actual running
  dev server, via a temporary `window.__store` debug hook (same pattern
  PROGRESS.md documents from earlier sessions, removed before this build):
  committed a real board + an off-center rectangular CUTOUT feature through
  the real `addMember`/`addCutoutProfile` store actions (the same path the
  UI's CutoutProfileEditor uses) and confirmed it renders as a solid,
  visibly-grained wood mesh with no console errors and no crash across
  repeated dimension/position edits — screenshot-level pixel confirmation
  of the pocket's walls/floor from a top-down angle was not reachable in
  this environment (camera orbit/zoom via synthetic scroll/drag did not
  move the OrbitControls camera, a new instance of the same
  synthetic-input limitation prior sessions hit with pointer drags). Joey's
  real-mouse pass is still the final confirmation needed for the visual
  result, but the underlying math is now verified correct and non-stalling
  independent of that.

## 2026-08-11 — New feature: Preset Shape tool (regular shapes + joinery-pocket presets)
Data Flow Pipeline: catalog params (`src/lib/presetShapes.ts`, pure — shape
id + a single live "size" number + a placement center) -> generated
`{u,v}[]` point loop (same shape `CutoutProfile.points` already is) ->
`store.addCutoutProfile` (the exact existing commit path a hand-sketched
Line/Arc profile already uses) -> Engine.ts's unmodified CUTOUT
evaluation/render pipeline. No engine changes, no new geometry
representation — this is a new INPUT method for the same Cutout tool,
not a new tool.

- **Catalog** (`src/lib/presetShapes.ts`): 15 shapes across 4 categories —
  Regular (Circle, Square, Rectangle, Triangle, Hexagon, Octagon), Joinery
  Simple (Bore Hole, Square Socket, Rectangular Slot), Joinery Intermediate
  (Mortise, Blind Dado, Hex Socket), Joinery Advanced (Dovetail Socket at
  1:4/1:6/1:8 — the standard woodworking flare ratios). Every shape is a
  pure `(size) -> {u,v}[]` unit template (regular N-gons via one shared
  `regularPolygon` helper, rectangles via `rectangleTemplate`, dovetail
  sockets via `dovetailSocketTemplate`), scaled by ONE live size number and
  translated to a placement center — matches Joey's "drag or type the
  radius/dimension, then drag it into place" spec with a single degree of
  freedom per shape, not independent per-axis dragging.
  **Scope call, stated explicitly in-panel and in this entry**: every
  preset is an INTERIOR pocket (a blind cut fully inside the face), not an
  edge-crossing through-cut — the Cutout engine's keyhole bridge
  (Engine.ts's `buildKeyholeLoopUV`, fixed earlier today) only guarantees
  correct geometry for a hole entirely inside a still-simple rectangular
  face. A true edge-touching Rabbet was left out rather than shipped
  broken; it would need a real edge-crossing-cut engine capability, a
  separate future Order.
- **Tool integration**: `cutoutDrawTool` (types.ts) gained a third value,
  `'preset'`, alongside the existing `'line'`/`'arc'` — CutoutPanel.tsx's
  tool-picker row now has 3 buttons, and picking Preset reveals a new
  `PresetShapePicker` grid (grouped by category, matching
  `SHAPE_CATEGORY_ORDER`). New `ui.cutoutPresetShapeId` (store.ts) holds
  which catalog shape is armed, reset everywhere `cutoutDrawTool`/
  `cutoutFace` already reset (leaving the Cutout tool, switching which
  shape is armed, `resetCutoutPick`) — no new parallel reset path.
- **Viewport interaction** (`CutoutDrawTools.tsx`, extended rather than a
  new sibling component — reuses the SAME capture-plane mesh, face
  resolution, and `<group position/rotation={member...}>` FOLLOWS-BOARD
  wrapper the existing Line/Arc sketch already has): a 3-phase local state
  machine — `placing` (waiting for the first click to set the shape's
  center) -> `sizing` (shape renders at the armed default size, growing
  live as the cursor moves away from center — a hover-move-then-click
  sequence, not a held-button drag, matching this app's existing Line/Arc
  click-move-click convention rather than inventing a second gesture style)
  -> `positioning` (size locked, shape now follows the cursor until a click
  drops it in place, which calls the same `commitProfile`/
  `addCutoutProfile` path Line/Arc already use, then `resetCutoutPick()`,
  matching the existing "one profile per face pick" scope). Typing a size
  instead of dragging: Tab opens a numeric field centered on the shape
  (same "Tab opens, Enter/Tab submits, Escape cancels" convention as
  SketchTool.tsx's length/width override), submitting it locks the size and
  advances straight to `positioning` — satisfying "type the radius in and
  then drag it where it needs to go" exactly. Right-click/Escape at any
  phase cancels back to `placing` via the existing shared
  `cutoutDrawState.ts` cancel hook (extended, not duplicated) — Line/Arc's
  own in-progress-sketch cancel already routed through the same hook.
  Placement is clamped by the shape's own current bounding radius (not just
  its center point) so the whole footprint always stays inside the face,
  preserving the interior-hole guarantee the keyhole bridge fix relies on.
- `npm run build`: clean, 0 TypeScript errors.
- **Verified this session**: a standalone re-implementation of every shape
  template run under plain Node confirmed all 15 produce simple
  (non-self-intersecting) polygons — the property the keyhole bridge fix
  above depends on. Live in the running dev server, via the same temporary
  `window.__store` debug hook pattern (removed before this build): armed a
  hexagon preset's generated points through the real `addCutoutProfile`
  store action end-to-end (the same call CutoutDrawTools.tsx's `commitPreset`
  makes) and confirmed it committed with no console errors. The actual
  click-move-click viewport gesture and the numeric Tab-to-type field are
  **not verified live** (same documented synthetic-pointer-event and
  camera-control limitation as every prior session's drag-based tools) —
  needs Joey's real-mouse pass, specifically: placing each shape category,
  the Tab-to-type numeric override actually opening/submitting, and
  right-click/Escape correctly canceling mid-placement without leaving a
  stray armed state.

## 2026-08-11 — New engine capability: edge-crossing Cutout (real rabbets/edge notches)
Joey asked for the edge-crossing cut engine explicitly deferred in the
Preset Shape session above. Data Flow Pipeline: same `CutoutProfile.points`
input as every other Cutout profile — no new feature type, no panel/UI
change, no new user-facing concept. `evaluateFeatures`'s existing CUTOUT
case (Engine.ts) now inspects the profile's own bounding box against the
picked face's 4 boundary edges before doing anything else, and branches:
0 edges touched -> unchanged existing interior-pocket path
(`buildKeyholeLoopUV`); exactly 1 edge touched -> new
`buildEdgeNotchFeature` path; 2+ edges touched (a corner notch) -> safe
no-op, explicitly out of scope this Order.

- **Why a rabbet needs 2 faces, not 1**: a cut that reaches a face's own
  edge removes material that also belongs to the ADJACENT face sharing
  that edge (e.g. a notch cut into the "top" face right at its edge with
  the "side" face physically removes a corner of the side face too, not
  just the top). `buildEdgeNotchFeature` looks up that neighbor via a new
  `EDGE_ADJACENCY` table (Engine.ts) — built once, at module load, by
  reversing the EXISTING `CHAMFER_EDGE_KINDS` table Chamfer already trusts
  for box-edge topology (which face touches which edge how) rather than a
  second hand-derived source of truth for the same 12 box edges.
- **The math** (`buildEdgeNotchOuterUV`, `edgeNotchFloorRect`,
  `edgeNotchEndWall`, all Engine.ts, all pure functions): the notch's
  in-plane reach comes from the profile's OWN drawn/placed extent (the
  sketch decides shape, same as the interior case always has), while the
  existing `depth` field does double duty by design — it's how far the
  picked face's floor sits below its surface AND, symmetrically, how far
  the NEIGHBOR face's own boundary shrinks, since the two faces meet at 90
  degrees and the physically-removed block has exactly those 2
  perpendicular dimensions, one driving each face's shrink-vs-floor-depth
  role the opposite way round. The neighbor's own along-edge coordinate
  range is found by reprojecting the notch's edge-endpoint 3D positions
  through the neighbor's own (u,v) (`projectLocalToUV`) rather than
  hand-deriving a sign per face-pair combination — robust regardless of
  which direction each face's own axes happen to run along the shared edge.
  Up to 2 small end-cap walls close off the notch where its along-edge
  extent falls short of the full edge length (none needed if it runs the
  whole edge, e.g. a plain full-width rabbet).
- **Winding safety**: every new face this builds gets its winding verified
  (and reversed if needed) against an explicitly-reasoned-through desired
  normal via a new `orientPolygon` helper, rather than trusting a
  hand-derived vertex order per case — an inside-out face doesn't error,
  it just silently vanishes under the board's default FrontSide material,
  which is a much worse failure mode to ship than getting caught by a
  build error.
- **Preset Shape tool integration**: `CutoutDrawTools.tsx`'s
  `clampPresetCenter` (added in the Preset Shape session above) previously
  forced every placed shape to stay strictly interior — updated to allow
  crossing exactly ONE face edge (reaching this new engine path) while
  still preventing crossing two at once, which would silently no-op
  against the engine's own out-of-scope guard. Hand-sketched Line/Arc
  profiles needed no change — `CADGeometryEngine.clampUV` already allowed
  points to reach exactly the face boundary.
- `npm run build`: clean, 0 TypeScript errors.
- **Verified this session**: a standalone Node re-implementation of every
  new function, run against a real 2-face adjacency (xMax/yMax sharing a
  20x8x1.5 board's corner edge, matching `generateBasePrimitive`'s actual
  face conventions exactly, not a simplified stand-in) confirmed: both
  floors land correctly inset INTO the remaining material (not out into
  open air), the neighbor face's along-edge range reprojects to sane
  values, exactly 2 end-cap walls are produced for an interior-both-ends
  notch, every wall's actual cross-product-derived winding matches its own
  declared normal (orientPolygon working as intended), and there are no
  NaNs anywhere in the output. Live in the running dev server (temporary
  `window.__store` hook, removed before this build): committed a real
  edge-touching CUTOUT profile through the actual store action end-to-end
  and confirmed no console/render errors and no React error boundary,
  though the exact StandardFaceId <-> visible "top/side" mapping wasn't
  independently confirmed this way. **Not verified live**: the actual
  visual result in the browser (a real rabbet with correct walls/floor on
  both faces, viewed from multiple angles) — same documented
  camera-control/synthetic-pointer limitation as every prior session —
  needs Joey's real-mouse pass. Also unverified: behavior when the
  adjacent face has ALREADY been reshaped by an earlier Chamfer or Cutout
  on a different edge (the `outerWire.edges.length !== 4` guard should
  make this a safe no-op rather than build on stale geometry, matching the
  same guard's existing behavior elsewhere in this file, but wasn't
  exercised this session).

## 2026-08-11 — New feature: Camera Lock toggle
Prompted directly by the previous session's own testing pass — orbit kept
fighting attempted verification (part of that was Cutout's existing
intentional `enableRotate={!cutoutFace}` precision lock while sketching,
part was this environment's own synthetic-drag limitation, documented
across many prior sessions). Joey asked for a user-facing lock/unlock
toggle rather than the camera only ever being locked automatically by a
tool.

- **New `ui.cameraLocked`** (types.ts/store.ts): a plain boolean, default
  `false`, toggled by the one new `toggleCameraLocked` action. Deliberately
  NOT included in any of the existing tool-switch/resetToolState reset
  spreads — it is a persistent user choice, not a per-tool transient like
  `orbitControlsEnabled` (which Draw-board/Move/Rotate already drive
  automatically for the duration of a drag) or Template/Cutout's own
  narrower `enableRotate`-only locks. All three mechanisms are independent
  and layer cleanly: `Viewport.tsx`'s `<OrbitControls>` now reads
  `enabled={orbitControlsEnabled && !cameraLocked}`, so the user's manual
  lock freezes rotate/pan/zoom completely without touching or being reset
  by anything tool-driven.
- **New `CameraLockToggle.tsx`**: a small floating icon button (open/closed
  padlock, orange when locked) — positioned `top-16 left-28`, a corner of
  the canvas that stays clear of both the TopMenuBar and ToolRail
  regardless of the right PropertiesPanel's expanded/collapsed width (avoids
  a first attempt at `top-3 right-3`, which sat directly under the
  PropertiesPanel and never rendered visibly). Reuses the existing
  `Tooltip` component for its label/description, same convention as every
  other icon control in the app.
- **'L' keyboard shortcut** (App.tsx): Model-space only by design — Template
  already claims 'l' for its own Line draw tool, and that branch in the
  keydown handler is checked first (only matches while
  `workspaceMode === 'template'`), so the new camera-lock branch is only
  ever reached outside Template, where 'l' was unclaimed. No conflict, no
  shared-key ambiguity — each space's meaning for 'l' is unambiguous on its
  own.
- `npm run build`: clean, 0 TypeScript errors.
- **Verified live** in the running dev server: clicking the button toggles
  it between open/closed padlock with the correct tooltip copy and
  `aria-pressed` state; the 'L' shortcut confirmed via
  `aria-pressed` reading `false` after a keypress that followed a click-to-
  lock (i.e. the keyboard path and the click path both drive the same
  state correctly) — a screenshot taken immediately after the keypress
  looked stale/unchanged (a known compositing-lag quirk of this
  environment's screenshot tool, not an app bug; the DOM-level check is the
  reliable source of truth here, same lesson learned during the Preset
  Shape tool's own verification pass). **Not verified live**: that a real
  mouse drag actually fails to orbit/pan/zoom while locked and succeeds
  once unlocked — this environment's synthetic pointer-drag limitation
  (documented across many prior sessions) means a locked-vs-unlocked drag
  comparison can't be meaningfully tested here even with the toggle itself
  working; needs Joey's real-mouse pass.

## 2026-08-11 — New feature: Reference Line snapping for the Cutout tool (Preset Shape + Line/Arc)
Joey's actual ask behind the Preset Shape tool: place a shape (a circle for
a dowel hole, say) precisely against Reference Lines drawn first as
planning guides — not just eyeball a click. That precision layer hadn't
been built; this session adds it.

- **New pure module `src/lib/referenceLineSnap.ts`**: resolves a cursor
  (u,v) against every `ReferenceLine` already anchored to the SAME
  board+face (`linesForFace` — reference lines are face-scoped, their
  endpoints already live in that face's own (u,v) space, exactly like
  `CutoutProfile.points` — confirmed by reading `types.ts` before writing
  any snap math, not assumed). Priority mirrors standard CAD object-snap
  convention: two lines' segment-vs-segment **intersection** (only where
  they actually cross as drawn, not an infinite-line extension) wins first,
  then a line's own **endpoint/midpoint**, then the loosest "**slide along
  this line**" projection — each its own tolerance, checked in that order,
  so a deliberate crossing or named point always beats an incidental
  nearby point on a longer line. `pointAtDistanceAlongLine` is the inverse:
  given a line and a typed distance from its start, the exact (u,v) point
  there (clamped to the line's own real length).
- **Preset Shape integration** (`CutoutDrawTools.tsx`): the shape's center
  resolves through a reference-line snap first, THEN through the existing
  edge-crossing-safety clamp (so a reference point near a face corner still
  can't produce an unsupported 2-edge notch) — applied at both the initial
  placing click and every 'positioning'-phase pointer move. When snapped
  onto anything with a defined distance-from-start (endpoint/midpoint/
  on-line — everything except a bare intersection, which has no single
  line to measure "along"), a SECOND Tab-openable field appears (distinct
  from the existing size field, gated by `presetPhase` so Tab always opens
  whichever ONE field is relevant right now) — type an exact distance and
  the shape jumps to that precise point along the line, still in
  'positioning' phase so the result is visible before the final click
  commits it. This is the literal "plan 3 dowel holes 2 inches apart along
  this line" workflow Joey described.
- **Line/Arc got the same snap for free**, layered as a fallback: the
  sketch chain's own point-snap (closing a loop, unchanged, still highest
  priority) is tried first; only if that misses does a reference-line snap
  get tried; only if THAT misses does the existing face-edge/corner snap
  apply. Hand-sketched cutout profiles are strictly more precise than
  before, nothing about the existing behavior changed when no reference
  lines are present on the face.
- **Visual feedback**: a shared `renderRefSnapHighlight` helper (both
  Preset and Line/Arc call it) highlights the actual line(s) involved in
  `THEME.spruceAccent` — the app's one documented "clearly distinct from
  orange" secondary accent color, since orange is already this exact
  sketch's own live-preview color — plus a small diamond marker at the
  precise snap point, and a plain-language label ("Reference Line
  intersection," "3 1/4\" from line start," etc.) so it's never ambiguous
  why a shape jumped somewhere.
- `npm run build`: clean, 0 TypeScript errors.
- **Verified this session, rigorously**: a standalone Node test suite for
  every function in `referenceLineSnap.ts` (10 scenarios, 20 assertions,
  all passing) — X-crossing intersections, parallel lines correctly never
  producing a false intersection, segments that would only cross if
  extended correctly returning no snap, correct priority ordering
  (intersection beats a coincident midpoint; endpoint/midpoint beat
  online; nearest-of-several-close-lines picks the right one), and
  `pointAtDistanceAlongLine`'s round-trip + clamping in both directions.
  Live in the running dev server: created two real reference lines
  crossing at (5,4) through the ACTUAL store action a real Annotate-tool
  click would call (`handleReferenceLineClick`, twice, not a hand-built
  mock), pulled that live data back out and re-ran the intersection math
  against it (confirming the real runtime field names/shapes match exactly
  what the new code expects — not just my own test fixtures), then
  committed a circle centered exactly on that verified intersection
  through the real `addCutoutProfile` action and confirmed it renders
  through Engine.ts's full evaluate/build pipeline with zero console
  errors. **Not verified live**: the actual click-drag-type interaction
  sequence with a real mouse — this session's browser tooling additionally
  lost the ability to render screenshots partway through (a pane-display
  issue on top of the already-documented synthetic-pointer-event
  limitation), so beyond the store-level integration check above, the
  in-viewport feel (does the highlight/label appear at the right moment,
  does Tab open the right field, does clicking the label work) needs
  Joey's real-mouse pass — same category of gap as every prior session's
  drag-based tools, just compounded this time by a tooling outage rather
  than resolved by extra effort.

## 2026-08-11 — New tool: Rip / Cross Cut (splits a board into two along a Reference Line)
Joey asked for this explicitly, referencing the classic rip-cut-vs-cross-cut
diagram — a tool that actually SPLITS one board into two along a straight
line, not a pocket/notch like Cutout. Scoped up front via 3 clarifying
questions before building: straight cuts only (no taper — Joey confirmed),
reuse Reference Lines as the cut path (not a second line-drawing tool), and
a typed-per-cut kerf defaulting to 1/8" (a standard table saw blade).

**Found existing, unwired engine before writing anything new** — the exact
"wire up an existing engine" pattern this project's history keeps repeating
(Mate, Mirror, Group). `src/lib/memberSplit.ts`'s `splitByCrossCut`/
`splitByRipCut` and `store.ts`'s `splitMemberByCrossCut`/
`splitMemberByRipCut` actions already existed, complete with full cleanup
of mates/fasteners/mateGroups/mateConstraints/dimensionLines/
referenceLines/woodJoints on the removed original board — correct,
thorough, and completely unused by any component. This session extends
that existing engine (kerf support) and gives it a UI, rather than writing
a third copy of that cleanup logic.

- **Critical verification before trusting the existing engine**:
  `memberSplit.ts` splits "width" along local Z, which looked backwards
  against `Engine.ts`'s `generateBasePrimitive` (which uses local Y for
  its own `width` parameter) — until reading `migrateWoodMemberToSolidBoard`
  turned up that it deliberately SWAPS `member.width`/`member.thickness`
  when building `BoardParameters` for the primitive. So a board's local Z
  really is its WIDTH and local Y its THICKNESS — `memberSplit.ts` was
  correct all along, just following an indirect axis convention. Confirmed
  by hand-verified math AND a live split against a real rotated, off-origin
  board (see below) before trusting it, rather than assuming a stale
  pre-reset file matched the current convention.
- **New `src/lib/ripCutSplit.ts`** (`resolveRipCutLine`, pure): determines
  whether a Reference Line qualifies as a rip/cross cut path — straight,
  axis-aligned (constant u or v), and reaching both opposite edges of the
  face (real cuts go all the way through) — and if so, which existing split
  function applies (`cross` maps to `splitMemberByCrossCut`, `rip` to
  `splitMemberByRipCut`) and the exact position/targetWidth value those
  already expect. A line that would split THICKNESS (a resaw) is
  recognized but explicitly rejected with a clear reason — the existing
  engine only ever supported length/width splits, and this Order only
  wires up what already works, per CAD_MANIFESTO.md Law 4.
- **Kerf support added to the existing engine** (`memberSplit.ts`,
  extended not rewritten): both split functions gained an optional `kerf`
  parameter (default 0 — every pre-existing call site, and any future one
  that doesn't care, is unaffected), removing that much material evenly
  (kerf/2) from each resulting piece's edge at the cut, so the two pieces
  end up with a real physical gap between them instead of touching —
  matching an actual saw kerf.
- **New store action `splitMemberAlongLine(memberId, lineId, kerf)`**:
  resolves the line, then calls whichever existing split action applies —
  returns `{ok:true}` or `{ok:false, reason}` so the panel can show
  exactly why a line doesn't qualify rather than silently doing nothing.
- **Face-picking**: `activeTool: 'rip'` (a value already reserved in the
  `ActiveTool` union pre-Samson-reset, never removed, now finally used —
  no new union member needed) gets the same hover-then-click face-picking
  BoardMesh.tsx already gives Cutout/Chamfer/Mate/Trim, rendered in
  `THEME.spruceAccent` instead of orange — a deliberate visual cue this is
  a different KIND of operation (splits the board) from Cutout's orange
  pocket/notch highlight.
- **New `RipCutPanel.tsx`**: once a face is picked, lists every Reference
  Line already on it (`referenceLineSnap.ts`'s existing `linesForFace` —
  reused, not reimplemented) with a live "Rip Cut"/"Cross Cut"/rejection-
  reason label per line (from `resolveRipCutLine`), pick one, type a kerf,
  Split. Rail entry: Modify > Rip / Cross Cut (reused the 'rip' tool id's
  pre-existing "Rip Cut" label, renamed to "Rip / Cross Cut" since one tool
  now auto-detects which kind from the line's own orientation, rather than
  needing two separate rail buttons for what's the same operation).
- `npm run build`: clean, 0 TypeScript errors.
- **Verified rigorously, live, with real UI clicks — not just store calls
  this time**: (1) a standalone Node test suite (18 assertions) against
  the REAL board-primitive face conventions (including the width/thickness
  swap, not a simplified stand-in) covering cross-cut and rip-cut
  resolution from two different faces, edge-to-edge rejection, diagonal
  rejection, near-edge sliver rejection, kerf math (pieces + kerf sum back
  to the original dimension, physical gap between pieces equals the kerf
  exactly), zero-kerf backward compatibility, and oversized-kerf clamping
  — all passing. (2) Live in the dev server: split a real board via the
  actual `splitMemberAlongLine` store action and confirmed the resulting
  two members' lengths/positions matched hand-calculated values exactly;
  repeated on a ROTATED, off-origin board (rotation.y = 0.3 rad, position
  [5,2,-3]) and hand-verified the resulting positions account for that
  rotation correctly (not just an axis-aligned world offset) — this is
  what actually proved `memberSplit.ts`'s reused rotation math still holds
  for the kerf-extended case; a diagonal (invalid) line correctly returned
  `{ok:false}` with no mutation. (3) **This time also verified through the
  real UI**, not just the store: opened Modify > Rip / Cross Cut, picked a
  face, clicked a listed Reference Line row (real DOM click), confirmed
  the Kerf field and "Split Board — Cross Cut" button appeared, clicked
  Split, and confirmed via the actual rendered page text that the board
  list changed from 1 board to "PanelTest (1 of 2)" / "PanelTest (2 of 2)"
  — a real interaction sequence end to end, not a synthetic pointer-drag
  (which is what's been unreliable in this environment; a sequence of
  discrete button clicks worked fine). Zero console errors across all of
  it. **Not verified live**: the in-viewport face-hover highlight
  actually appearing on real mouse movement (BoardMesh.tsx's
  `resolveMeasureHit`-driven hover, same category of gesture every prior
  session flagged as unverifiable here) — the CLICK-based face pick itself
  is now proven to work via the DOM-click test above, just not the
  hover-preview polish on top of it.

## Standing Technical Rules
- npm run build before every push
- git add src/ only
- Never touch Project.structural or make it nullable
- Always import * as THREE from 'three' inside R3F components
- Never rewrite working logic — only extend it
- Minimum text-base font everywhere
- ALL CAD_MANIFESTO.md laws apply to every New Order, no exceptions
- Claude (chat) cannot remotely trigger Claude Code — Joey runs prompts
  manually

## Key Info
- Project root: C:\Projects\wood-cad-app\
- Backup: C:\Projects\wood-cad-app - BASE
- Claude Code: C:\Users\Joeyj\.local\bin\claude.exe
- Deployed: dovedesign.vercel.app
- Repo: joeyj123/DoveDesign (main branch)
- Stack: React + Vite + TypeScript + React Three Fiber + Zustand + Tailwind

## Starting a New Session
1. PowerShell -> cd C:\Projects\wood-cad-app
2. C:\Users\Joeyj\.local\bin\claude.exe
3. Claude Code reads CLAUDE.md, CAD_MANIFESTO.md, PROGRESS.md,
   CAD_ENGINE_BLUEPRINT.ts first
4. Drop NEW_ORDER_N_PROMPT.md in project root -> Claude Code runs
