import { useEffect } from 'react';
import { useAppStore } from '../store';

export function UndoRedoListener() {
  const undo = useAppStore((s) => s.undo);
  const redo = useAppStore((s) => s.redo);
  const resetToolState = useAppStore((s) => s.resetToolState);
  const closeContextMenu = useAppStore((s) => s.closeContextMenu);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        resetToolState();
        closeContextMenu();
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
  }, [undo, redo, resetToolState, closeContextMenu]);

  return null;
}
