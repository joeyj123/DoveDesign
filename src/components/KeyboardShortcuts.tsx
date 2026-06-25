import { useEffect, useRef } from 'react';
import { useAppStore } from '../store';

export default function KeyboardShortcuts() {
  const mousePos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', onMouseMove);
    return () => window.removeEventListener('mousemove', onMouseMove);
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      const store = useAppStore.getState();

      switch (e.key) {
        case ' ':
          e.preventDefault();
          if (store.ui.selectedMemberId) {
            const isOpen = store.ui.radialWheelOpen;
            store.setRadialWheelOpen(!isOpen);
            if (!isOpen) {
              useAppStore.setState((s) => ({
                ui: { ...s.ui, radialWheelAnchor: { x: mousePos.current.x, y: mousePos.current.y } },
              }));
            }
          }
          break;

        case 'Escape':
          store.resetToolState();
          break;

        case 'Delete':
        case 'Backspace':
          if (store.ui.selectedMemberId) {
            store.removeMember(store.ui.selectedMemberId);
          }
          break;

        case 'z':
        case 'Z':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            if (e.shiftKey) {
              store.redo();
            } else {
              store.undo();
            }
          }
          break;

        case 'y':
        case 'Y':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            store.redo();
          }
          break;

        case 'g':
        case 'G':
          store.setGridVisible(!store.ui.gridVisible);
          break;

        case 'd':
        case 'D':
          if (store.ui.selectedMemberId) {
            store.duplicateMember(store.ui.selectedMemberId);
          }
          break;

        case 'm':
        case 'M':
          // Stay on select tool (Rule 3: TransformGizmo only renders during 'select')
          store.setActiveTool('select');
          store.setTransformGizmoActive(true);
          store.setTransformMode('translate');
          break;

        case 'r':
        case 'R':
          if (!e.ctrlKey) {
            store.setActiveTool('rip');
          }
          break;

        case 'b':
        case 'B':
          store.setActiveTool('drawBoard');
          break;

        case 's':
        case 'S':
          if (!e.ctrlKey) {
            store.setActiveTool('select');
          }
          break;
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return null;
}
