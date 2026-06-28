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
          store.setMeasureStartPoint(null);
          break;

        case 'x':
        case 'X':
          if (e.shiftKey && store.ui.selectedMemberId) {
            store.sendToScrapBox(store.ui.selectedMemberId);
          }
          break;

        case 'v':
        case 'V':
          store.setActiveTool('joint');
          break;

        case 'Delete':
        case 'Backspace':
          if (e.shiftKey) {
            store.clearAllMembers();
          } else if (store.ui.selectedDimensionLineId) {
            store.removeDimensionLine(store.ui.selectedDimensionLineId);
            store.selectDimensionLine(null);
          } else if (store.ui.selectedMemberId) {
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
          {
            const newSnap = !store.ui.snapToGrid;
            store.setSnapToGrid(newSnap);
            // Ensure grid is visible when snap is enabled
            if (newSnap && !store.ui.gridVisible) store.setGridVisible(true);
          }
          break;

        case 'd':
        case 'D':
          if (store.ui.activeTool === 'measure') {
            store.setActiveTool('select');
            store.setMeasureStartPoint(null);
            store.setOrbitControlsEnabled(true);
          } else {
            store.setActiveTool('measure');
            store.setOrbitControlsEnabled(false);
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
          store.setBomPanelOpen(!store.ui.bomPanelOpen);
          break;

        case 'w':
        case 'W':
          store.setActiveTool('drawBoard');
          break;

        case 's':
        case 'S':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            store.saveProjectToFile();
          } else {
            store.setActiveTool('select');
          }
          break;

        case 'o':
        case 'O':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            // Trigger the hidden file input in SystemRibbon via a custom event
            document.dispatchEvent(new CustomEvent('dovedesign:open-file'));
          }
          break;

        case 'j':
        case 'J':
          store.setActiveTool('mate');
          store.setRadialWheelOpen(false);
          break;

        case 'f':
        case 'F':
          if (store.ui.selectedMemberId) {
            const m = store.project.members.find((mem) => mem.id === store.ui.selectedMemberId);
            if (m) {
              const currentRy = m.rotation[1];
              const normalized = ((currentRy % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
              const isFlipped = normalized > 0.1 && Math.abs(normalized - Math.PI) < 0.5;
              store.updateMember(store.ui.selectedMemberId, {
                rotation: [m.rotation[0], isFlipped ? 0 : Math.PI, m.rotation[2]],
              });
            }
          }
          break;

        case 'c':
        case 'C':
          if (!e.ctrlKey) {
            store.setActiveTool('cut');
          }
          break;

        case 'u':
        case 'U':
          if (store.ui.selectedMemberId) {
            const memberId = store.ui.selectedMemberId;
            const mates = store.project.mates.filter(
              (m) => m.memberAId === memberId || m.memberBId === memberId
            );
            if (mates.length > 0) {
              store.removeMate(mates[mates.length - 1].id);
            }
          }
          break;

        case 'Tab':
          e.preventDefault();
          if (store.ui.selectedMemberId && store.ui.transformGizmoActive) {
            const modes = ['translate', 'rotate', 'scale'] as const;
            const current = store.ui.transformMode;
            const nextIdx = (modes.indexOf(current) + 1) % modes.length;
            store.setTransformMode(modes[nextIdx]);
          }
          break;
      }
    };

    window.addEventListener('keydown', onKeyDown, { capture: true });
    return () => window.removeEventListener('keydown', onKeyDown, { capture: true });
  }, []);

  return null;
}
