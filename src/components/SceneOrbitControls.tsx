import { useRef, useEffect } from 'react';
import { MOUSE } from 'three';
import { OrbitControls as DreiOrbitControls } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { useAppStore } from '../store';

/** Revit-style navigation: left orbit, middle pan, shift+left pan, scroll zoom. */
export default function SceneOrbitControls() {
  const enabled = useAppStore((s) => s.ui.orbitControlsEnabled);
  const cameraResetNonce = useAppStore((s) => s.ui.cameraResetNonce);
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const { camera } = useThree();

  useEffect(() => {
    if (controlsRef.current) controlsRef.current.enabled = enabled;
  }, [enabled]);

  useEffect(() => {
    if (cameraResetNonce === 0) return;
    camera.position.set(48, 36, 72);
    camera.lookAt(0, 0, 0);
    if (controlsRef.current) {
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
    }
  }, [cameraResetNonce, camera]);

  return (
    <DreiOrbitControls
      ref={controlsRef}
      makeDefault
      enableDamping
      dampingFactor={0.08}
      enablePan
      enableRotate
      enableZoom
      panSpeed={1.65}
      rotateSpeed={0.85}
      zoomSpeed={1.1}
      screenSpacePanning
      mouseButtons={{
        LEFT: MOUSE.ROTATE,
        MIDDLE: MOUSE.PAN,
        RIGHT: MOUSE.PAN,
      }}
    />
  );
}
