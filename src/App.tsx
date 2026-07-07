import { useEffect, useState } from 'react';
import Viewport from './components/Viewport';
import BoardEditPanel from './components/BoardEditPanel';
import InsertPanel from './components/InsertPanel';
import SketchMaterialPanel from './components/SketchMaterialPanel';
import { useAppStore } from './store';
import { cancelActiveMoveDrag } from './lib/moveDragState';

/** Move tool (New Order 2): arrow-key nudge increment, in inches. */
const NUDGE_IN = 1;

export default function App() {
  const activeTool = useAppStore((s) => s.ui.activeTool);
  const setActiveTool = useAppStore((s) => s.setActiveTool);
  const resetToolState = useAppStore((s) => s.resetToolState);
  const duplicateMember = useAppStore((s) => s.duplicateMember);
  const moveMembers = useAppStore((s) => s.moveMembers);
  const undo = useAppStore((s) => s.undo);
  const redo = useAppStore((s) => s.redo);

  // New Order 3 (Insert tool): purely a floating-panel toggle, not an
  // ActiveTool/viewport drag state — Insert never captures pointer/orbit, so
  // it doesn't belong in the select/move/drawBoard exclusive-tool state.
  const [insertPanelOpen, setInsertPanelOpen] = useState(false);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z')) {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || e.key === 'Y')) {
        e.preventDefault();
        redo();
      } else if (e.shiftKey && (e.key === 'D' || e.key === 'd')) {
        e.preventDefault();
        const ui = useAppStore.getState().ui;
        const targetId = ui.selectedMemberId ?? ui.lastPlacedMemberId;
        if (targetId) duplicateMember(targetId);
      } else if (e.key === 'w' || e.key === 'W') {
        setActiveTool('drawBoard');
      } else if (e.key === 'm' || e.key === 'M') {
        setActiveTool('move');
      } else if (e.key === 's' || e.key === 'S') {
        setActiveTool('select');
      } else if (e.key === 'i' || e.key === 'I') {
        setInsertPanelOpen((v) => !v);
      } else if (e.key === 'Escape') {
        // A drag actively in progress takes priority: Escape cancels the move
        // (restoring position) rather than the usual deselect-everything.
        if (cancelActiveMoveDrag()) return;
        if (insertPanelOpen) {
          setInsertPanelOpen(false);
          return;
        }
        resetToolState();
      } else if (
        e.key === 'ArrowUp' || e.key === 'ArrowDown' ||
        e.key === 'ArrowLeft' || e.key === 'ArrowRight'
      ) {
        const ui = useAppStore.getState().ui;
        if (ui.activeTool !== 'move') return;
        const ids = ui.multiSelection.length ? ui.multiSelection : (ui.selectedMemberId ? [ui.selectedMemberId] : []);
        if (!ids.length) return;
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
  }, [setActiveTool, resetToolState, duplicateMember, moveMembers, undo, redo, insertPanelOpen]);

  return (
    <div className="w-full h-full bg-zinc-950 text-white font-sans tracking-wide relative">
      <Viewport />

      <div className="absolute top-4 left-4 flex gap-2">
        {/* New Order 2.3: three explicit, mutually-exclusive tool states —
            Select (default: camera + selecting only, no gizmo), Move (gizmo
            active on the current selection), Sketch (draw new boards). Move
            is no longer implied by merely selecting a board; it only turns
            on via this button or the M key (see MoveGizmo.tsx). */}
        <button
          className={`px-3 py-1.5 rounded text-base border ${
            activeTool === 'select'
              ? 'bg-orange-600 border-orange-500 text-white'
              : 'bg-zinc-900 border-zinc-700 text-zinc-200'
          }`}
          onClick={() => setActiveTool('select')}
        >
          Select (S)
        </button>
        <button
          className={`px-3 py-1.5 rounded text-base border ${
            activeTool === 'move'
              ? 'bg-orange-600 border-orange-500 text-white'
              : 'bg-zinc-900 border-zinc-700 text-zinc-200'
          }`}
          onClick={() => setActiveTool('move')}
        >
          Move (M)
        </button>
        <button
          className={`px-3 py-1.5 rounded text-base border ${
            activeTool === 'drawBoard'
              ? 'bg-orange-600 border-orange-500 text-white'
              : 'bg-zinc-900 border-zinc-700 text-zinc-200'
          }`}
          onClick={() => setActiveTool(activeTool === 'drawBoard' ? 'select' : 'drawBoard')}
        >
          Sketch (W)
        </button>
        <button
          className={`px-3 py-1.5 rounded text-base border ${
            insertPanelOpen
              ? 'bg-orange-600 border-orange-500 text-white'
              : 'bg-zinc-900 border-zinc-700 text-zinc-200'
          }`}
          onClick={() => setInsertPanelOpen((v) => !v)}
        >
          Insert (I)
        </button>
      </div>

      <InsertPanel open={insertPanelOpen} onClose={() => setInsertPanelOpen(false)} />
      <SketchMaterialPanel />
      <BoardEditPanel />
    </div>
  );
}
