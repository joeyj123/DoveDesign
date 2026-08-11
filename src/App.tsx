import { useEffect } from 'react';
import Viewport from './components/Viewport';
import CameraLockToggle from './components/CameraLockToggle';
import ToolRail from './components/ToolRail';
import PropertiesPanel from './components/PropertiesPanel';
import TopMenuBar from './components/TopMenuBar';
import { useAppStore } from './store';
import { cancelActiveMoveDrag } from './lib/moveDragState';
import { cancelActiveRotateDrag } from './lib/rotateDragState';
import { cancelActiveTemplateDraw } from './lib/templateDrawState';
import { cancelActiveCutoutDraw } from './lib/cutoutDrawState';
import { expandWithMateGroups } from './lib/mateGroups';
import type { ActiveTool, TemplateDrawTool } from './types';

/** Move tool (New Order 2): arrow-key nudge increment, in inches. */
const NUDGE_IN = 1;
/** Dimension/Reference Line arrow-key nudge increment — finer than a whole
 * board's, since these are placement points on a face, not a board move. */
const ANNOTATION_NUDGE_IN = 1 / 16;

/**
 * New Order 6.2 fix 2: single source of truth for every Model-space
 * tool-switch shortcut. New Order 6.1 gated these by hand-listing the same
 * five keys a SECOND time in a separate condition ahead of the real
 * handlers below — two lists that had to be kept in sync by hand is exactly
 * the kind of thing that drifts. Now there's one map, and the Template
 * inert-check and the dispatch both read it, so they can't disagree.
 */
const MODEL_TOOL_SHORTCUTS: Record<string, ActiveTool> = {
  w: 'drawBoard',
  m: 'move',
  r: 'rotate',
  s: 'select',
  i: 'addBoard',
  d: 'measure',
  // New Order 8.4 Fix 3: Reference Line had no letter shortcut yet (New
  // Order 8 already gave Dimension Line 'd'). 'x' matches the well-known
  // AutoCAD convention (XLINE, invoked "XL") for a construction/reference
  // line, and was otherwise unused across Model, Template, and the
  // Ctrl/Shift-modified shortcuts above.
  x: 'referenceLine',
  // Mate tool: 'j' matches the shortcut this app used pre-reset (see
  // store.ts's applyMate comment, preserved from that era) — not a new
  // convention invented here.
  j: 'mate',
  // Trim/Extend: 'k' — unused elsewhere, adjacent to 'j' (Mate) on the
  // keyboard for the two face-picking tools.
  k: 'trimExtend',
  // Modify > Chamfer: 'c' matches Fusion 360's own Chamfer shortcut, which
  // Joey already knows from prior Fusion use.
  c: 'chamfer',
};

/** Template mode's own draw-tool shortcuts — only dispatched while workspaceMode === 'template' (see the keydown handler below). */
const TEMPLATE_DRAW_SHORTCUTS: Record<string, TemplateDrawTool> = {
  l: 'line',
  a: 'arc',
  f: 'freehand',
};

export default function App() {
  const setActiveTool = useAppStore((s) => s.setActiveTool);
  const resetToolState = useAppStore((s) => s.resetToolState);
  const duplicateMember = useAppStore((s) => s.duplicateMember);
  const moveMembers = useAppStore((s) => s.moveMembers);
  const undo = useAppStore((s) => s.undo);
  const redo = useAppStore((s) => s.redo);
  const setRotationAxis = useAppStore((s) => s.setRotationAxis);
  const setWorkspaceMode = useAppStore((s) => s.setWorkspaceMode);
  const recoveryAvailable = useAppStore((s) => s.recoveryAvailable);
  const recoverAutosave = useAppStore((s) => s.recoverAutosave);
  const dismissRecovery = useAppStore((s) => s.dismissRecovery);
  const removeMembers = useAppStore((s) => s.removeMembers);
  const toggleCameraLocked = useAppStore((s) => s.toggleCameraLocked);
  const nudgeDimensionLine = useAppStore((s) => s.nudgeDimensionLine);
  const nudgeReferenceLine = useAppStore((s) => s.nudgeReferenceLine);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      // Single-character keys are compared lowercase (Shift+letter reports an
      // uppercase e.key) — multi-char keys (Escape/Tab/ArrowUp/...) pass
      // through unchanged.
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      const inTemplate = useAppStore.getState().ui.workspaceMode === 'template';

      if ((e.ctrlKey || e.metaKey) && key === 'z') {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      } else if ((e.ctrlKey || e.metaKey) && key === 'y') {
        e.preventDefault();
        redo();
      } else if (e.shiftKey && key === 'd') {
        // Explicit workspaceMode guard — duplicate is a Model-space board
        // action and belongs in the same inert-in-Template bucket as every
        // other one below.
        if (inTemplate) return;
        e.preventDefault();
        const ui = useAppStore.getState().ui;
        const targetId = ui.selectedMemberId ?? ui.lastPlacedMemberId;
        if (targetId) duplicateMember(targetId);
      } else if (inTemplate && key in TEMPLATE_DRAW_SHORTCUTS) {
        // Template's own draw-tool shortcuts (Line/Arc/Freehand) — only live
        // while Template mode is active, same toggle-off-if-already-armed
        // behavior as clicking the tool's own button in TemplatePanel.
        e.preventDefault();
        const current = useAppStore.getState().ui.templateDrawTool;
        const tool = TEMPLATE_DRAW_SHORTCUTS[key];
        useAppStore.getState().setTemplateDrawTool(current === tool ? null : tool);
      } else if (key in MODEL_TOOL_SHORTCUTS) {
        // Template is its own 2D sketch space, not a filtered view of
        // Model's tools (MODE_TOOLS.template only allows 'template' itself)
        // — these Model-space tool shortcuts have no job here. Letting one
        // through would silently kick the user back to Model space as a
        // confusing side effect of setActiveTool's mode-follows-tool logic.
        // The only ways out of Template are the rail button (click Template
        // again), the panel's "Exit to Model" button, or Esc.
        if (inTemplate) return;
        // Insert is a real ActiveTool ('addBoard') — this is what makes the
        // Insert panel close automatically when another tool is picked.
        setActiveTool(MODEL_TOOL_SHORTCUTS[key]);
      } else if (key === 't') {
        // Same one-keystroke pattern as every other tool shortcut above —
        // setActiveTool('template') switches workspaceMode to 'template'
        // automatically via the existing mode-follows-tool logic in store.ts.
        setActiveTool('template');
      } else if (key === 'l') {
        // Camera lock (CameraLockToggle.tsx): Model-space only — Template
        // already claims 'l' for its own Line draw tool (branch above,
        // which always wins first while inTemplate), so this branch is only
        // ever reached outside Template, where 'l' is otherwise unclaimed.
        toggleCameraLocked();
      } else if (e.key === 'Tab') {
        // Rotate tool (New Order 4): Tab cycles which axis's ring is active,
        // same cycle pattern as prior tools' axis-lock affordances.
        if (useAppStore.getState().ui.activeTool !== 'rotate') return;
        e.preventDefault();
        const order: Array<'x' | 'y' | 'z'> = ['x', 'y', 'z'];
        const current = useAppStore.getState().ui.rotationAxis;
        const next = order[(order.indexOf(current) + 1) % order.length];
        setRotationAxis(next);
      } else if (e.key === 'Escape') {
        // A drag actively in progress takes priority: Escape cancels the move
        // or rotate (restoring position/rotation) rather than the usual
        // deselect-everything.
        if (cancelActiveRotateDrag()) return;
        if (cancelActiveMoveDrag()) return;
        // An in-progress Template chain point (pending click or an active
        // freehand stroke) is canceled first — this only ends the pending
        // point/chain, it never deletes already-committed edges. If nothing
        // was pending, Escape falls through to the plain exit below.
        if (cancelActiveTemplateDraw()) return;
        // New Order 11: an in-progress Cutout sketch point, same "un-does the
        // pending point, never deletes already-placed points" precedent as
        // Template's chain cancel above.
        if (cancelActiveCutoutDraw()) return;
        // New Order 8: an in-progress Dimension/Reference Line click sequence
        // (draft lives in ui state, not a local component ref, so it's just a
        // direct check-and-clear rather than a singleton-registration
        // cancel like the drag tools above) is canceled first, same
        // "un-does the pending point, never deletes committed lines"
        // precedent as Template's chain cancel.
        if (useAppStore.getState().ui.dimensionDraft) {
          useAppStore.getState().cancelDimensionDraft();
          return;
        }
        if (useAppStore.getState().ui.referenceDraft) {
          useAppStore.getState().cancelReferenceDraft();
          return;
        }
        // Escape is a clean exit back to Model space, same setWorkspaceMode
        // action the panel's "Exit to Model" button uses, not a second exit
        // code path.
        if (useAppStore.getState().ui.workspaceMode === 'template') {
          setWorkspaceMode('model');
          return;
        }
        resetToolState();
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        // Model-space board deletion — same inert-in-Template convention as
        // every other board action above (selectedMemberId/multiSelection
        // are already cleared on entry into Template, so this is a no-op
        // there anyway, but the explicit guard keeps the pattern consistent
        // and self-documenting).
        if (inTemplate) return;
        const ui = useAppStore.getState().ui;
        const ids = ui.multiSelection.length ? ui.multiSelection : (ui.selectedMemberId ? [ui.selectedMemberId] : []);
        if (!ids.length) return;
        e.preventDefault();
        removeMembers(ids);
      } else if (
        e.key === 'ArrowUp' || e.key === 'ArrowDown' ||
        e.key === 'ArrowLeft' || e.key === 'ArrowRight'
      ) {
        const ui = useAppStore.getState().ui;
        // Dimension/Reference Line nudge: takes priority over board-move
        // nudge whenever one of these is selected, since a selected line and
        // a selected board are independent pieces of ui state that could
        // both be non-null — the line is almost always what the user just
        // clicked (Select button in the Entities list), so it wins.
        if ((ui.activeTool === 'measure' || ui.activeTool === 'referenceLine') &&
            (ui.selectedDimensionLineId || ui.selectedReferenceLineId)) {
          e.preventDefault();
          const du = e.key === 'ArrowLeft' ? -ANNOTATION_NUDGE_IN : e.key === 'ArrowRight' ? ANNOTATION_NUDGE_IN : 0;
          const dv = e.key === 'ArrowUp' ? ANNOTATION_NUDGE_IN : e.key === 'ArrowDown' ? -ANNOTATION_NUDGE_IN : 0;
          // A clicked endpoint marker (ui.activeAnnotationEndpoint) narrows
          // the nudge to just that end; otherwise both (unlocked) ends move
          // together, same as before this feature existed.
          const active = ui.activeAnnotationEndpoint;
          if (ui.selectedDimensionLineId) {
            const end = active?.kind === 'dimension' && active.lineId === ui.selectedDimensionLineId ? active.end : undefined;
            nudgeDimensionLine(ui.selectedDimensionLineId, du, dv, end);
          }
          if (ui.selectedReferenceLineId) {
            const end = active?.kind === 'reference' && active.lineId === ui.selectedReferenceLineId ? active.end : undefined;
            nudgeReferenceLine(ui.selectedReferenceLineId, du, dv, end);
          }
          return;
        }
        if (ui.activeTool !== 'move') return;
        const selectedIds = ui.multiSelection.length ? ui.multiSelection : (ui.selectedMemberId ? [ui.selectedMemberId] : []);
        if (!selectedIds.length) return;
        const ids = expandWithMateGroups(selectedIds);
        e.preventDefault();
        const dx = e.key === 'ArrowLeft' ? -NUDGE_IN : e.key === 'ArrowRight' ? NUDGE_IN : 0;
        const dz = e.key === 'ArrowUp' ? -NUDGE_IN : e.key === 'ArrowDown' ? NUDGE_IN : 0;
        const members = useAppStore.getState().project.members;
        const updates = ids
          .map((id) => members.find((m) => m.id === id))
          .filter((m): m is NonNullable<typeof m> => !!m)
          .map((m) => ({
            id: m.id,
            position: [m.position[0] + dx, m.position[1], m.position[2] + dz] as [number, number, number],
          }));
        moveMembers(updates);
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [setActiveTool, resetToolState, duplicateMember, moveMembers, undo, redo, setRotationAxis, setWorkspaceMode, removeMembers, nudgeDimensionLine, nudgeReferenceLine, toggleCameraLocked]);

  return (
    <div className="w-full h-full bg-charcoal-950 text-white font-sans tracking-wide relative">
      <Viewport />
      <CameraLockToggle />
      {/* Subtle vignette over the 3D viewport — a plain CSS radial-gradient
          overlay, not a Three.js scene change (drei's Grid fade already owns
          the world-space depth cue; this is a screen-space one on top, same
          "don't touch the frozen pipeline for a cosmetic tweak" approach).
          pointer-events-none so it never intercepts orbit/drag input. */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center, transparent 65%, rgba(0,0,0,0.16) 100%)' }}
      />
      <ToolRail />
      <PropertiesPanel />
      <TopMenuBar />
      {recoveryAvailable && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-charcoal-900 border border-orange-600/60 rounded-lg px-4 py-2 shadow-xl text-base">
          <span>Unsaved work from a previous session was found. Recover it?</span>
          <button
            type="button"
            onClick={recoverAutosave}
            className="rounded px-3 py-1 bg-orange-600 hover:bg-orange-500 text-white border border-orange-500"
          >
            Recover
          </button>
          <button
            type="button"
            onClick={dismissRecovery}
            className="rounded px-3 py-1 bg-charcoal-800 hover:bg-charcoal-700 text-charcoal-300 border border-charcoal-700"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}
