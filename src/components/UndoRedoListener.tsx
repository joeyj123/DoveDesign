import { useEffect } from 'react';
import { useAppStore } from '../store';

export function UndoRedoListener() {
  const undo = useAppStore((s) => s.undo);
  const redo = useAppStore((s) => s.redo);
  const resetToolState = useAppStore((s) => s.resetToolState);
  const closeContextMenu = useAppStore((s) => s.closeContextMenu);
  const selectMember = useAppStore((s) => s.selectMember);
  const setRadialWheelOpen = useAppStore((s) => s.setRadialWheelOpen);
  const setQuickDimensionsOpen = useAppStore((s) => s.setQuickDimensionsOpen);
  const setFastenerPlacementMode = useAppStore((s) => s.setFastenerPlacementMode);
  const cancelDrawBoard = useAppStore((s) => s.cancelDrawBoard);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        const ui = useAppStore.getState().ui;

        if (ui.contextMenu.open) {
          closeContextMenu();
          return;
        }

        if (ui.fastenerPlacementMode) {
          setFastenerPlacementMode(false, null);
          return;
        }

        if (ui.activeTool === 'drawBoard') {
          cancelDrawBoard();
          return;
        }

        if (ui.quickDimensionsOpen) {
          setQuickDimensionsOpen(false);
          return;
        }

        if (ui.radialWheelOpen) {
          setRadialWheelOpen(false);
          return;
        }

        if (ui.selectedMemberId || ui.multiSelection.length > 0) {
          selectMember(null);
          return;
        }

        resetToolState();
        return;
      }

      const mod = e.ctrlKey || e.metaKey;
      if (!mod) return;
      if (e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if (e.key === 'y' || (e.key === 'z' && e.shiftKey)) {
        e.preventDefault();
        redo();
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    undo,
    redo,
    resetToolState,
    closeContextMenu,
    selectMember,
    setRadialWheelOpen,
    setQuickDimensionsOpen,
    setFastenerPlacementMode,
    cancelDrawBoard,
  ]);

  return null;
}
