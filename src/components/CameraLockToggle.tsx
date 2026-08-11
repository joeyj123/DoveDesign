import { useAppStore } from '../store';
import Tooltip from './Tooltip';

/**
 * Data Flow Pipeline: Camera Lock toggle
 *
 * INPUT: ui.cameraLocked (store.ts) — a plain boolean, not tool- or
 *   mode-scoped, so it reads the same regardless of which tool is active.
 *
 * CALCULATION: none — a pure display of the current boolean plus a click/
 *   'L' keydown (App.tsx) handler that flips it via the one existing
 *   `toggleCameraLocked` action. No independent lock/unlock state of its
 *   own to drift out of sync with the store.
 *
 * OUTPUT: store.toggleCameraLocked() — Viewport.tsx is the only consumer of
 *   the resulting boolean (folded into OrbitControls' `enabled` prop).
 *
 * FOLLOWS-BOARD CHECK: n/a — UI chrome only, floats over the viewport,
 *   independent of any board/camera transform.
 */
export default function CameraLockToggle() {
  const cameraLocked = useAppStore((s) => s.ui.cameraLocked);
  const toggleCameraLocked = useAppStore((s) => s.toggleCameraLocked);

  return (
    // top-16/left-28: clears TopMenuBar (h-10 + top-3) and ToolRail (w-20 +
    // left-3) regardless of the right PropertiesPanel's expanded/collapsed
    // width, so this never overlaps either — same safe-canvas-area corner
    // the recovery banner (App.tsx, top-16) already anchors to.
    <div className="absolute top-16 left-28 z-30">
      <Tooltip
        side="right"
        info={{
          label: cameraLocked ? 'Camera Locked' : 'Camera Unlocked',
          description: cameraLocked
            ? 'Orbit, pan, and zoom are frozen — click to unlock.'
            : 'Freeze the 3D view (orbit/pan/zoom) so a click can\'t nudge the camera mid-task.',
          shortcut: 'L',
        }}
      >
        <button
          type="button"
          onClick={toggleCameraLocked}
          aria-pressed={cameraLocked}
          className={`flex items-center justify-center w-9 h-9 rounded border transition-colors ${
            cameraLocked
              ? 'bg-orange-600 border-orange-500 text-white'
              : 'bg-charcoal-900/90 border-charcoal-700 text-charcoal-300 hover:bg-charcoal-800'
          }`}
        >
          <LockIcon locked={cameraLocked} className="w-4 h-4" />
        </button>
      </Tooltip>
    </div>
  );
}

function LockIcon({ locked, className }: { locked: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="5" y="11" width="14" height="9" rx="1.5" />
      {locked ? (
        <path d="M8 11V7a4 4 0 0 1 8 0v4" />
      ) : (
        <path d="M8 11V7a4 4 0 0 1 7.4-2" />
      )}
    </svg>
  );
}
