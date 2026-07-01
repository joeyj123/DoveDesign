import { useEffect } from 'react';
import { useAppStore } from '../store';

/**
 * Phase 18 FIX 3: standard browser "leave page?" confirmation whenever the
 * project has boards in it. This is the safety net now that the app no
 * longer auto-restores the previous session on startup — closing the tab
 * with unsaved boards must not be silent.
 */
export default function UnsavedChangesGuard() {
  const hasBoards = useAppStore((s) => s.project.members.some((m) => !m.inScrapBox));

  useEffect(() => {
    function onBeforeUnload(e: BeforeUnloadEvent) {
      if (!hasBoards) return;
      e.preventDefault();
      e.returnValue = '';
    }
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [hasBoards]);

  return null;
}
