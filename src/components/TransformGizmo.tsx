import { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { TransformControls } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { useAppStore } from '../store';
import type { WoodMember } from '../types';
import { snapMemberPosition } from '../lib/bounds';
import { snapToGrid } from '../lib/mating';

function snapAssemblyPos(pos: [number, number, number]): [number, number, number] {
  return [snapToGrid(pos[0]), Math.max(pos[1], 0.25), snapToGrid(pos[2])];
}
import { snapEuler } from '../lib/angles';

interface Props {
  member: WoodMember;
  objectRef: React.RefObject<THREE.Object3D>;
}

export default function TransformGizmo({ member, objectRef }: Props) {
  const transformMode = useAppStore((s) => s.ui.transformMode);
  const transformGizmoActive = useAppStore((s) => s.ui.transformGizmoActive);
  const activeTool = useAppStore((s) => s.ui.activeTool);
  const setOrbitControlsEnabled = useAppStore((s) => s.setOrbitControlsEnabled);
  const angleSnapEnabled = useAppStore((s) => s.ui.angleSnapEnabled);
  const angleSnapIncrement = useAppStore((s) => s.ui.angleSnapIncrement);
  const snapToGrid = useAppStore((s) => s.ui.snapToGrid);
  const updateMember = useAppStore((s) => s.updateMember);
  const moveMateGroup = useAppStore((s) => s.moveMateGroup);
  const allMembers = useAppStore((s) => s.project.members);
  const viewportMode = useAppStore((s) => s.ui.viewportMode);
  const controls = useThree((s) => s.controls) as { enabled?: boolean } | null;
  const tcRef = useRef<{
    addEventListener: (e: string, h: (v: { value: boolean }) => void) => void;
    removeEventListener: (e: string, h: (v: { value: boolean }) => void) => void;
  } | null>(null);
  const [attached, setAttached] = useState(false);
  const draggingRef = useRef(false);
  const lastDragPosRef = useRef<THREE.Vector3 | null>(null);

  const baseDims = useRef({ length: member.length, thickness: member.thickness, width: member.width });
  useEffect(() => {
    baseDims.current = { length: member.length, thickness: member.thickness, width: member.width };
  }, [member.length, member.thickness, member.width]);

  useEffect(() => {
    if (objectRef.current) setAttached(true);
  }, [objectRef, member.id]);

  useEffect(() => {
    const tc = tcRef.current;
    if (!tc) return;
    const handler = (e: { value: boolean }) => {
      if (controls) controls.enabled = !e.value;
      setOrbitControlsEnabled(!e.value);

      if (e.value && objectRef.current) {
        // Drag start: begin tracking incremental position for real-time mate-group movement
        draggingRef.current = true;
        lastDragPosRef.current = objectRef.current.position.clone();
      }

      if (!e.value && objectRef.current) {
        const obj = objectRef.current;
        let pos: [number, number, number] = [obj.position.x, obj.position.y, obj.position.z];
        let rot: [number, number, number] = [obj.rotation.x, obj.rotation.y, obj.rotation.z];

        if (transformMode === 'translate') {
          if (viewportMode === 'assembly') {
            pos = snapAssemblyPos(pos);
          } else {
            pos = snapMemberPosition(
              member,
              pos,
              allMembers.filter((m) => m.id !== member.id)
            );
          }
          if (snapToGrid) {
            pos = [Math.round(pos[0]), pos[1], Math.round(pos[2])];
          }
          obj.position.set(pos[0], pos[1], pos[2]);
          // The mate group was already moved in real time on every 'change' event
          // during the drag; only apply the final snap correction here, and commit
          // it (with history) as the last step of the drag.
          const lastLive = lastDragPosRef.current;
          if (lastLive) {
            const correction: [number, number, number] = [
              pos[0] - lastLive.x,
              pos[1] - lastLive.y,
              pos[2] - lastLive.z,
            ];
            moveMateGroup(member.id, correction);
          }
        }

        if (transformMode === 'rotate' && angleSnapEnabled) {
          rot = snapEuler(rot, angleSnapIncrement);
          obj.rotation.set(rot[0], rot[1], rot[2]);
        }

        const patch: Partial<WoodMember> = { position: pos, rotation: rot };

        if (transformMode === 'scale') {
          patch.length = Math.max(1, baseDims.current.length * obj.scale.x);
          patch.thickness = Math.max(0.25, baseDims.current.thickness * obj.scale.y);
          patch.width = Math.max(0.25, baseDims.current.width * obj.scale.z);
          obj.scale.set(1, 1, 1);
        }

        updateMember(member.id, patch);
        draggingRef.current = false;
        lastDragPosRef.current = null;
      }
    };

    // Fires continuously while dragging — used to move the rest of the mate group
    // in real time instead of waiting for drag-end (dragging-changed only fires
    // at start/end).
    const changeHandler = () => {
      if (!draggingRef.current || transformMode !== 'translate' || !objectRef.current) return;
      const obj = objectRef.current;
      const last = lastDragPosRef.current;
      if (!last) return;
      const delta: [number, number, number] = [
        obj.position.x - last.x,
        obj.position.y - last.y,
        obj.position.z - last.z,
      ];
      if (delta[0] !== 0 || delta[1] !== 0 || delta[2] !== 0) {
        moveMateGroup(member.id, delta, true);
        lastDragPosRef.current = obj.position.clone();
      }
    };

    tc.addEventListener('dragging-changed', handler);
    (tc as unknown as { addEventListener: (e: string, h: () => void) => void }).addEventListener('change', changeHandler);
    return () => {
      tc.removeEventListener('dragging-changed', handler);
      (tc as unknown as { removeEventListener: (e: string, h: () => void) => void }).removeEventListener('change', changeHandler);
    };
  }, [controls, member, objectRef, transformMode, allMembers, updateMember, moveMateGroup, angleSnapEnabled, angleSnapIncrement, viewportMode, setOrbitControlsEnabled, snapToGrid, transformGizmoActive]);

  if (activeTool !== 'select' || !transformGizmoActive || !attached || !objectRef.current) return null;

  const gridSnap = snapToGrid ? 1 : undefined;

  return (
    <TransformControls
      ref={tcRef as never}
      object={objectRef.current}
      mode={transformMode}
      size={0.75}
      translationSnap={gridSnap}
    />
  );
}
