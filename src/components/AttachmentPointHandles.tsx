import { useRef } from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import { ThreeEvent, useThree } from '@react-three/fiber';
import { useAppStore } from '../store';
import type { AttachmentPoint } from '../types';
import {
  getFacePointWorld,
  worldPointToFaceOffset,
  getFaceTangentAxes,
} from '../lib/mating';

/** Labeled, draggable attachment point handles constrained to their face plane. */
export default function AttachmentPointHandles() {
  const points = useAppStore((s) => s.project.attachmentPoints);
  const members = useAppStore((s) => s.project.members);
  const updateAttachmentPoint = useAppStore((s) => s.updateAttachmentPoint);
  const removeAttachmentPoint = useAppStore((s) => s.removeAttachmentPoint);
  const connectAttachmentPoints = useAppStore((s) => s.connectAttachmentPoints);
  const commitCurrentProject = useAppStore((s) => s.commitCurrentProject);
  const { gl } = useThree();

  const dragId = useRef<string | null>(null);

  function onDrag(pt: AttachmentPoint, e: ThreeEvent<PointerEvent>) {
    const member = members.find((m) => m.id === pt.memberId);
    if (!member) return;

    const { normal } = getFaceTangentAxes(member, pt.faceIndex);
    const plane = new THREE.Plane().setFromNormalAndCoplanarPoint(
      normal,
      getFacePointWorld(member, pt.faceIndex, [0, 0, 0])
    );
    const hit = new THREE.Vector3();
    e.ray.intersectPlane(plane, hit);
    if (!hit) return;

    const offset = worldPointToFaceOffset(member, pt.faceIndex, hit);
    updateAttachmentPoint(pt.id, { offset }, true);
  }

  return (
    <group>
      {points.map((pt) => {
        const member = members.find((m) => m.id === pt.memberId);
        if (!member) return null;
        const pos = getFacePointWorld(member, pt.faceIndex, pt.offset);
        return (
          <group key={pt.id} position={[pos.x, pos.y, pos.z]}>
            <mesh
              onPointerDown={(e) => {
                e.stopPropagation();
                dragId.current = pt.id;
                gl.domElement.setPointerCapture(e.pointerId);
              }}
              onPointerMove={(e) => {
                if (dragId.current !== pt.id) return;
                e.stopPropagation();
                onDrag(pt, e);
              }}
              onPointerUp={(e) => {
                if (dragId.current !== pt.id) return;
                dragId.current = null;
                if (gl.domElement.hasPointerCapture(e.pointerId)) {
                  gl.domElement.releasePointerCapture(e.pointerId);
                }
                if (pt.connectedToId) {
                  connectAttachmentPoints(pt.id, pt.connectedToId);
                } else {
                  commitCurrentProject();
                }
              }}
              onContextMenu={(e) => {
                e.stopPropagation();
                const action = window.prompt('Rename, Disconnect, or Delete?', 'Rename');
                if (action?.toLowerCase().startsWith('rename')) {
                  const name = window.prompt('New name', pt.name);
                  if (name) updateAttachmentPoint(pt.id, { name });
                } else if (action?.toLowerCase().startsWith('disconnect')) {
                  updateAttachmentPoint(pt.id, { connectedToId: undefined });
                  if (pt.connectedToId) {
                    updateAttachmentPoint(pt.connectedToId, { connectedToId: undefined });
                  }
                } else if (action?.toLowerCase().startsWith('delete')) {
                  if (pt.connectedToId) {
                    updateAttachmentPoint(pt.connectedToId, { connectedToId: undefined });
                  }
                  removeAttachmentPoint(pt.id);
                }
              }}
            >
              <sphereGeometry args={[0.22, 10, 10]} />
              <meshStandardMaterial color="#22d3ee" emissive="#0891b2" emissiveIntensity={0.5} />
            </mesh>
            <Html distanceFactor={12} style={{ pointerEvents: 'none' }}>
              <span className="text-base font-medium text-cyan-100 bg-zinc-900/90 px-2 py-0.5 rounded border border-cyan-600 whitespace-nowrap">
                {pt.name}
              </span>
            </Html>
          </group>
        );
      })}
    </group>
  );
}
