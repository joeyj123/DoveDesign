import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { useAppStore } from '../store';

/**
 * Data Flow Pipeline: Template Camera Lock
 *
 * INPUT: ui.workspaceMode (only reacts on a transition into/out of
 *   'template'), ui.templatePlane (origin + normal — the only plane
 *   parameters this component is allowed to read; it never hardcodes a world
 *   position).
 *
 * CALCULATION: on entering Template mode, the camera is placed at
 *   origin + normal * DISTANCE and pointed at origin, so a ground-plane
 *   template (normal [0,1,0]) is always a straight top-down view — a pure
 *   function of the stored plane parameters, not a one-off camera pose. The
 *   camera's prior position/orbit-target are saved in a local ref (ephemeral
 *   view state, not board data) so leaving Template mode restores exactly
 *   where the user was in Model space.
 *
 * OUTPUT: nothing stored — this only moves the live Three.js camera/
 *   OrbitControls target object, the same category of side effect every
 *   other tool's gizmo already performs (never board/parameter state).
 *
 * FOLLOWS-BOARD CHECK: n/a — camera framing is UI chrome, not board
 *   geometry; no Solid/Face is read or written here.
 */
const TEMPLATE_CAMERA_DISTANCE = 60;

export default function TemplateCameraLock({
  controlsRef,
}: {
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
}) {
  const workspaceMode = useAppStore((s) => s.ui.workspaceMode);
  const templatePlane = useAppStore((s) => s.ui.templatePlane);
  const { camera } = useThree();

  const savedView = useRef<{ position: THREE.Vector3; target: THREE.Vector3 } | null>(null);
  const prevMode = useRef(workspaceMode);

  useEffect(() => {
    if (prevMode.current === workspaceMode) return;
    const enteringTemplate = workspaceMode === 'template';
    const leavingTemplate = prevMode.current === 'template';
    prevMode.current = workspaceMode;

    if (enteringTemplate) {
      savedView.current = {
        position: camera.position.clone(),
        target: controlsRef.current ? controlsRef.current.target.clone() : new THREE.Vector3(),
      };

      const origin = new THREE.Vector3(...templatePlane.origin);
      const normal = new THREE.Vector3(...templatePlane.normal).normalize();
      const lookFrom = origin.clone().addScaledVector(normal, TEMPLATE_CAMERA_DISTANCE);
      // Nudge off the exact vertical axis so a straight-down view doesn't hit
      // OrbitControls' polar-angle singularity (camera direction parallel to
      // its up vector).
      lookFrom.x += 0.001;

      camera.position.copy(lookFrom);
      camera.lookAt(origin);
      if (controlsRef.current) {
        controlsRef.current.target.copy(origin);
        controlsRef.current.update();
      }
    } else if (leavingTemplate && savedView.current) {
      camera.position.copy(savedView.current.position);
      camera.lookAt(savedView.current.target);
      if (controlsRef.current) {
        controlsRef.current.target.copy(savedView.current.target);
        controlsRef.current.update();
      }
      savedView.current = null;
    }
  }, [workspaceMode, templatePlane, camera, controlsRef]);

  return null;
}
