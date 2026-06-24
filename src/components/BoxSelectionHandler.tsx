import { useEffect, useRef } from 'react';
import { useAppStore } from '../store';
import { getMemberScreenBounds } from '../lib/screenProjection';

const DRAG_THRESHOLD = 6;

/** Rubber-band multi-select on empty viewport drag (select tool only). */
export default function BoxSelectionHandler() {
  const activeTool = useAppStore((s) => s.ui.activeTool);
  const boxSelectRect = useAppStore((s) => s.ui.boxSelectRect);
  const boxSelectPending = useAppStore((s) => s.ui.boxSelectPending);
  const setBoxSelectRect = useAppStore((s) => s.setBoxSelectRect);
  const setBoxSelectPending = useAppStore((s) => s.setBoxSelectPending);
  const setMultiSelection = useAppStore((s) => s.setMultiSelection);
  const selectMember = useAppStore((s) => s.selectMember);
  const setOrbitControlsEnabled = useAppStore((s) => s.setOrbitControlsEnabled);
  const members = useAppStore((s) => s.project.members);

  const pendingRef = useRef(boxSelectPending);
  pendingRef.current = boxSelectPending;

  useEffect(() => {
    if (activeTool !== 'select') return;

    function onPointerMove(e: PointerEvent) {
      const d = pendingRef.current;
      if (!d) return;
      const dx = e.clientX - d.x;
      const dy = e.clientY - d.y;
      if (Math.hypot(dx, dy) < DRAG_THRESHOLD) return;

      setOrbitControlsEnabled(false);
      const left = Math.min(d.x, e.clientX);
      const top = Math.min(d.y, e.clientY);
      const right = Math.max(d.x, e.clientX);
      const bottom = Math.max(d.y, e.clientY);
      setBoxSelectRect({ left, top, right, bottom });
    }

    function onPointerUp(e: PointerEvent) {
      const d = pendingRef.current;
      if (!d) return;
      setBoxSelectPending(null);
      setOrbitControlsEnabled(true);

      const rect = useAppStore.getState().ui.boxSelectRect;
      setBoxSelectRect(null);

      if (!rect || Math.hypot(e.clientX - d.x, e.clientY - d.y) < DRAG_THRESHOLD) {
        if (!d.shiftKey) selectMember(null);
        return;
      }

      const canvas = document.querySelector('canvas');
      const camera = (window as unknown as { __doveCamera?: import('three').Camera }).__doveCamera;
      if (!canvas || !camera) return;

      const canvasRect = canvas.getBoundingClientRect();
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      const selLeft = rect.left - canvasRect.left;
      const selTop = rect.top - canvasRect.top;
      const selRight = rect.right - canvasRect.left;
      const selBottom = rect.bottom - canvasRect.top;

      const hits: string[] = [];
      for (const m of members) {
        const mb = getMemberScreenBounds(m, camera, w, h);
        if (
          mb.right >= selLeft &&
          mb.left <= selRight &&
          mb.bottom >= selTop &&
          mb.top <= selBottom
        ) {
          hits.push(m.id);
        }
      }

      if (d.shiftKey) {
        const prev = useAppStore.getState().ui.multiSelection;
        setMultiSelection([...new Set([...prev, ...hits])]);
      } else {
        setMultiSelection(hits);
      }
    }

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };
  }, [
    activeTool,
    members,
    setBoxSelectRect,
    setBoxSelectPending,
    setMultiSelection,
    selectMember,
    setOrbitControlsEnabled,
  ]);

  if (!boxSelectRect) return null;

  return (
    <div
      className="fixed z-30 pointer-events-none border-2 border-dashed border-amber-400 bg-amber-500/10"
      style={{
        left: boxSelectRect.left,
        top: boxSelectRect.top,
        width: boxSelectRect.right - boxSelectRect.left,
        height: boxSelectRect.bottom - boxSelectRect.top,
      }}
      aria-hidden
    />
  );
}

export function exposeCameraForSelection(camera: import('three').Camera) {
  (window as unknown as { __doveCamera?: import('three').Camera }).__doveCamera = camera;
}
