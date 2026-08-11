import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { useAppStore } from '../store';
import { getMemberFaces } from '../lib/boardFaceMath';

/**
 * Data Flow Pipeline: Cutout Camera Lock (New Order 11)
 *
 * INPUT: ui.cutoutFace (only reacts on a transition into/out of a face
 *   pick), project.members (to look up the picked member's CURRENT
 *   position/rotation and re-derive its Face list — never a cached copy).
 *
 * CALCULATION: on picking a face, the face's center (in board-LOCAL space)
 *   is computed from its own origin/uAxis/vAxis/extent, then transformed to
 *   WORLD space using the picked member's live position/rotation (Euler).
 *   The camera is placed at worldCenter + worldNormal * DISTANCE and pointed
 *   at worldCenter — a pure function of the board's current placement plus
 *   the picked face's own geometry, mirroring TemplateCameraLock.tsx's
 *   "origin + normal * distance" pattern but against a real board face
 *   instead of a fixed world plane. The camera's prior position/orbit-target
 *   are saved in a local ref (ephemeral view state, not board data) so
 *   leaving the face pick restores exactly where the user was.
 *
 * OUTPUT: nothing stored — this only moves the live Three.js camera/
 *   OrbitControls target object, the same category of side effect every
 *   other tool's camera lock already performs (never board/parameter
 *   state).
 *
 * FOLLOWS-BOARD CHECK: n/a for the camera pose itself (a one-time framing
 *   move on pick, not a continuous follow) — but the pose is computed FRESH
 *   from the member's CURRENT position/rotation/faces at the moment of pick,
 *   never a value carried over from an earlier render.
 */
const CUTOUT_CAMERA_DISTANCE = 30;

export default function CutoutCameraLock({ controlsRef }: { controlsRef: React.RefObject<OrbitControlsImpl | null> }) {
  const cutoutFace = useAppStore((s) => s.ui.cutoutFace);
  const members = useAppStore((s) => s.project.members);
  const { camera } = useThree();

  const savedView = useRef<{ position: THREE.Vector3; target: THREE.Vector3 } | null>(null);
  const prevKeyRef = useRef<string | null>(null);

  useEffect(() => {
    const key = cutoutFace ? `${cutoutFace.memberId}:${cutoutFace.face}` : null;
    if (prevKeyRef.current === key) return;
    const wasPicked = prevKeyRef.current !== null;
    prevKeyRef.current = key;

    if (key) {
      const member = members.find((m) => m.id === cutoutFace!.memberId);
      const face = member ? getMemberFaces(member).find((f) => f.id === cutoutFace!.face) : null;
      if (!member || !face) return;

      if (!wasPicked) {
        savedView.current = {
          position: camera.position.clone(),
          target: controlsRef.current ? controlsRef.current.target.clone() : new THREE.Vector3(),
        };
      }

      const localCenter = new THREE.Vector3(
        face.origin.x + face.uAxis.x * face.widthU * 0.5 + face.vAxis.x * face.heightV * 0.5,
        face.origin.y + face.uAxis.y * face.widthU * 0.5 + face.vAxis.y * face.heightV * 0.5,
        face.origin.z + face.uAxis.z * face.widthU * 0.5 + face.vAxis.z * face.heightV * 0.5
      );
      const localNormal = new THREE.Vector3(face.normal.x, face.normal.y, face.normal.z);
      const quat = new THREE.Quaternion().setFromEuler(new THREE.Euler(...member.rotation));
      const worldCenter = localCenter.clone().applyQuaternion(quat).add(new THREE.Vector3(...member.position));
      const worldNormal = localNormal.clone().applyQuaternion(quat).normalize();

      const lookFrom = worldCenter.clone().addScaledVector(worldNormal, CUTOUT_CAMERA_DISTANCE);
      // Same OrbitControls polar-angle singularity nudge TemplateCameraLock.tsx uses.
      lookFrom.x += 0.001;

      camera.position.copy(lookFrom);
      camera.lookAt(worldCenter);
      if (controlsRef.current) {
        controlsRef.current.target.copy(worldCenter);
        controlsRef.current.update();
      }
    } else if (wasPicked && savedView.current) {
      camera.position.copy(savedView.current.position);
      camera.lookAt(savedView.current.target);
      if (controlsRef.current) {
        controlsRef.current.target.copy(savedView.current.target);
        controlsRef.current.update();
      }
      savedView.current = null;
    }
  }, [cutoutFace, members, camera, controlsRef]);

  return null;
}
