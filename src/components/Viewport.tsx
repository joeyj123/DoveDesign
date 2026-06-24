import { Canvas } from '@react-three/fiber';
import { Grid, GizmoHelper, GizmoViewport, PerspectiveCamera, OrthographicCamera } from '@react-three/drei';
import * as THREE from 'three';
import { useAppStore } from '../store';
import WoodBlock from './WoodBlock';
import DrawBoardTool from './DrawBoardTool';
import SceneOrbitControls from './SceneOrbitControls';
import ContextMenuHandler from './ContextMenuHandler';
import ViewportContextMenu from './ViewportContextMenu';
import ViewportWelcome from './ViewportWelcome';
import MemberScreenBoundsTracker from './MemberScreenBoundsTracker';
import FaceGridOverlay from './FaceGridOverlay';
import FastenerMeshes, { MateMarkers } from './FastenerMeshes';
import FastenerPlacementTool from './FastenerPlacementTool';
import QuickDimensionsPanel from './QuickDimensionsPanel';
import RadialOrbitalSelector from './RadialOrbitalSelector';
import FastenerPlacementBar from './FastenerPlacementBar';
import FastenerInfoPanel from './FastenerInfoPanel';
import QuickJoinToolbar from './QuickJoinToolbar';
import BoxSelectionHandler, { SelectBoxPlane } from './BoxSelectionHandler';
import DesignSuggestionsBridge from './DesignSuggestionsBridge';
import PlacedHardwareMeshes from './PlacedHardwareMeshes';
import AttachmentPointLinks, { PolygonDrawTool } from './AttachmentPointLinks';
import AttachmentPointHandles from './AttachmentPointHandles';

function ShadowFloor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
      <planeGeometry args={[2000, 2000]} />
      <shadowMaterial opacity={0.18} />
    </mesh>
  );
}

function AdaptiveCamera() {
  const orthographic = useAppStore((s) => s.ui.orthographic);
  if (orthographic) {
    return (
      <OrthographicCamera
        makeDefault
        position={[48, 36, 72]}
        zoom={10}
        near={0.1}
        far={10000}
      />
    );
  }
  return (
    <PerspectiveCamera makeDefault position={[48, 36, 72]} fov={45} near={0.1} far={10000} />
  );
}

export default function Viewport() {
  const members      = useAppStore((s) => s.project.members);
  const setBoxSelectPending = useAppStore((s) => s.setBoxSelectPending);
  const setOrbitControlsEnabled = useAppStore((s) => s.setOrbitControlsEnabled);
  const setRadialWheelOpen = useAppStore((s) => s.setRadialWheelOpen);
  const activeTool   = useAppStore((s) => s.ui.activeTool);
  const gridVisible  = useAppStore((s) => s.ui.gridVisible);
  const showWelcome  = members.length === 0;

  return (
    <div
      className="flex-1 relative bg-zinc-950 min-w-0"
      style={{ minHeight: 0 }}
      data-viewport-root
    >
      <ViewportContextMenu />
      {showWelcome && <ViewportWelcome />}
      <QuickDimensionsPanel />
      <RadialOrbitalSelector />
      <FastenerPlacementBar />
      <FastenerInfoPanel />
      <QuickJoinToolbar />
      <BoxSelectionHandler />
      <DesignSuggestionsBridge />
      <Canvas
        style={{ width: '100%', height: '100%' }}
        shadows
        onCreated={({ gl }) => {
          gl.shadowMap.type = THREE.PCFSoftShadowMap;
          gl.setClearColor('#09090b');
        }}
        onPointerMissed={(e) => {
          const ui = useAppStore.getState().ui;
          if (ui.radialWheelOpen) {
            setRadialWheelOpen(false);
          }
          if (activeTool !== 'select') return;
          if (ui.boxSelectRect) return;
          setOrbitControlsEnabled(false);
          setBoxSelectPending({
            x: e.clientX,
            y: e.clientY,
            shiftKey: e.shiftKey,
          });
        }}
      >
        <AdaptiveCamera />
        <MemberScreenBoundsTracker />
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[100, 180, 80]}
          intensity={1.35}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          shadow-camera-near={1}
          shadow-camera-far={600}
          shadow-camera-left={-200}
          shadow-camera-right={200}
          shadow-camera-top={200}
          shadow-camera-bottom={-200}
          shadow-bias={-0.0004}
        />
        <directionalLight position={[-80, 60, -60]} intensity={0.3} />
        <pointLight position={[0, -30, 60]} intensity={0.15} color="#fff8e7" />

        {gridVisible && (
          <Grid
            cellSize={1}
            cellThickness={0.6}
            cellColor="#27272a"
            sectionSize={12}
            sectionThickness={1}
            sectionColor="#3f3f46"
            fadeDistance={350}
            fadeStrength={1.2}
            followCamera={false}
            infiniteGrid
          />
        )}

        <ShadowFloor />
        <SelectBoxPlane />
        <DrawBoardTool />
        <ContextMenuHandler />
        <FaceGridOverlay />
        <FastenerPlacementTool />
        <PolygonDrawTool />
        <AttachmentPointLinks />

        {members.map((m) => (
          <WoodBlock key={m.id} member={m} />
        ))}

        <AttachmentPointHandles />
        <FastenerMeshes />
        <MateMarkers />
        <PlacedHardwareMeshes />

        <SceneOrbitControls />
        <GizmoHelper alignment="bottom-right" margin={[60, 60]}>
          <GizmoViewport labelColor="white" axisHeadScale={0.85} />
        </GizmoHelper>
      </Canvas>
    </div>
  );
}
