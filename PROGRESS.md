# DoveDesign — Progress Tracker

> Drop this file in C:\Projects\wood-cad-app\ alongside CLAUDE.md and DOVEDESIGN_ROADMAP.md.
> Claude reads this at the start of every new chat to know exactly where we are.

---

## Current Status

**Last completed phase:** Phase 10 ✅ — commit pending, see below
**Next action:** Stress test Phase 10 in browser → Phase 11 (Bill of Materials)

---

## Phase Log

| Phase | Status | Notes |
|-------|--------|-------|
| 1–6 | ✅ Complete | |
| 7 | ✅ Complete | Nav cube gone, tutorial search working |
| 8 | ✅ Complete | Snap dots, cross cut preview, scrap box panel |
| 9 | ✅ Complete | Joinery visualization, measure tool rebuild |
| 10 | ✅ Complete | Clear landscape, dim line edit, measure polish, rotation axis lock, Ctrl+S/O, templates |
| 11 | ⬜ Not started | Bill of Materials + Shopping List |
| 11 | ⬜ Not started | Bill of Materials + Shopping List |
| 12 | ⬜ Not started | Finishing Planner + 3D Nav Cube |
| 13 | ⬜ Not started | Assembly Mode Polish |
| 14 | ⬜ Not started | Sharing + Export |
| 15 | ⬜ Not started | Polish + Accessibility + Performance |

---

## Phase 9 Stress Test Checklist

**FIX 1 — Cut label suffix**
Cut same board 4 times → labels must never show "(1 of 2) (1 of 2)"

**FIX 2 — Rip cut step**
Rip cut input should move in 1/16" increments (0.0625)

**FIX 3 — Rip cut preview line**
With rip cut active on a board → dashed amber line should cross the board lengthwise at current target width

**FIX 4 — Snap dots clickable**
In Join mode (J) → hover snap dot should highlight → click should initiate join/mate

**FIX 5 — Snap to grid**
Press G → move a board → releases to nearest 1" grid position. Amber "Snap to Grid ON" chip visible in viewport top-right

**FIX 6 — Measure tool**
Press D → click board surface → move mouse → dashed line with distance label follows. Line appears ON the board, not on the floor grid. Click again to finalize

**FIX 7 — Scrap Box**
Shift+X sends selected board to scrap box. "Send to Scrap Box" button in Inspector only shows when board is NOT already in scrap box. Retrieve button works

**JOINT — Joinery Visualization**
Press V → joint tool activates → inspector shows 5 joint type buttons (Mortise, Tenon, Pocket Hole, Dovetail, Biscuit). Click a board face → marker appears. Click marker → "Remove Marker" button shows. Clear All removes all markers from board

---

## Phase 9 — What Was Shipped (commit 1e8fb41)

- FIX 1: Label suffix greedy regex with `gi` flags
- FIX 2: Rip cut step = 0.0625 (1/16")
- FIX 3: RipCutPreviewLine.tsx — live dotted line along board width at cut position
- FIX 4: Snap dots call updateMatrixWorld each frame; face-center onClick handlers wired for Join
- FIX 5: Snap-to-grid amber chip in viewport; View menu toggles for grid snap + dimension lines
- FIX 6: MeasureTool.tsx fully rewritten — native pointer events + useFrame + board-mesh raycast first, floor fallback
- FIX 7: Shift+X shortcut for scrap box; Inspector button guarded by !inScrapBox; Delete key for dimension lines
- JOINT 1-4: JointMarker type, addJointMarker/removeJointMarker/clearJointMarkers store actions, V key, ToolPanel joint UI, JointMarkerRenderer.tsx, 12 Pepe entries, Tutorial section

---

## Standing Rules (never forget)

- `npm run build` before every push — not just `tsc --noEmit`
- `git add src/` only — never `git add .`
- Never touch `Project.structural`
- Always `import * as THREE from 'three'`
- Minimum `text-base` font everywhere (except radial wheel: `text-sm` approved)
- Don't rewrite working logic — only extend it
- Every phase prompt starts with: ⚠️ STOP — Read CLAUDE.md first
- After every fix: update TutorialPanel.tsx + pepeKnowledge.ts

---

## Pepe Knowledge Base

- Current: ~1,486+ entries + 12 joinery entries added in Phase 9
- Target: ~2,000–2,500 entries

---

*Last updated: Phase 9 shipped — awaiting stress test*
