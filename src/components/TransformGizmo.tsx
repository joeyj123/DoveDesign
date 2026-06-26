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
  const allMembers = useAppStore((s) => s.project.members);
  const viewportMode = useAppStore((s) => s.ui.viewportMode);
  const controls = useThree((s) => s.controls) as { enabled?: boolean } | null;
  const tcRef = useRef<{ addEventListener: (e: string, h: (v: { value: boolean }) => void) => void; removeEventListener: (e: string, h: (v: { value: boolean }) => void) => void } | null>(null);
  const [attached, setAttached] = useState(false);

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
      }
    };
    tc.addEventListener('dragging-changed', handler);
    return () => tc.removeEventListener('dragging-changed', handler);
  }, [controls, member, objectRef, transformMode, allMembers, updateMember, angleSnapEnabled, angleSnapIncrement, viewportMode, setOrbitControlsEnabled, snapToGrid]);

  if (activeTool !== 'select' || !transformGizmoActive || !attached || !objectRef.current) return null;

  return (
    <TransformControls ref={tcRef as never} object={objectRef.current} mode={transformMode} size={0.75} />
  );
}
