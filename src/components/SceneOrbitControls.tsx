import { useRef, useEffect } from 'react';
import { MOUSE } from 'three';
import { OrbitControls as DreiOrbitControls } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { useAppStore } from '../store';

const CAMERA_PRESETS: Record<string, { position: [number, number, number] }> = {
  top:    { position: [0, 120, 0.001] },
  bottom: { position: [0, -120, 0.001] },
  front:  { position: [0, 0, 120] },
  back:   { position: [0, 0, -120] },
  left:   { position: [-120, 0, 0] },
  right:  { position: [120, 0, 0] },
  'iso-front-top-right':  { position: [72, 54, 72] },
  'iso-front-top-left':   { position: [-72, 54, 72] },
  'iso-back-top-right':   { position: [72, 54, -72] },
  'iso-back-top-left':    { position: [-72, 54, -72] },
  home:   { position: [48, 36, 72] },
};

/**
 * Navigation. Model/Detail modes: left orbit, middle/right pan (Revit-style).
 * Assembly Mode (Phase 20): LEFT is reserved entirely for picking snap dots
 * and faces — RIGHT orbits and MIDDLE pans, always live, even mid-mate-pick,
 * so the user can rotate to see both boards' dots without losing an anchor.
 * OrbitControls only ever mutates the camera — never store state — so camera
 * input can never fire a state mutation during a mate sequence.
 */
export default function SceneOrbitControls() {
  const enabled = useAppStore((s) => s.ui.orbitControlsEnabled);
  const workspaceMode = useAppStore((s) => s.ui.workspaceMode);
  const cameraResetNonce = useAppStore((s) => s.ui.cameraResetNonce);
  const cameraPreset = useAppStore((s) => s.ui.cameraPreset);
  const setCameraPreset = useAppStore((s) => s.setCameraPreset);
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

  useEffect(() => {
    if (!cameraPreset) return;
    const preset = CAMERA_PRESETS[cameraPreset];
    if (!preset) return;
    camera.position.set(...preset.position);
    camera.lookAt(0, 0, 0);
    if (controlsRef.current) {
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
    }
    setCameraPreset(null);
  }, [cameraPreset, camera, setCameraPreset]);

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
      minDistance={0.5}
      maxDistance={500}
      screenSpacePanning
      mouseButtons={
        workspaceMode === 'assembly'
          ? {
              LEFT: undefined as unknown as MOUSE, // left = selection only
              MIDDLE: MOUSE.PAN,
              RIGHT: MOUSE.ROTATE,
            }
          : {
              LEFT: MOUSE.ROTATE,
              MIDDLE: MOUSE.PAN,
              RIGHT: MOUSE.PAN,
            }
      }
    />
  );
}
