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
import KeyboardShortcuts from './KeyboardShortcuts';
import MeasureTool from './MeasureTool';
import DimensionLineRenderer from './DimensionLineRenderer';
import RotationRing from './RotationRing';
import CrossCutPreviewLine from './CrossCutPreviewLine';
import RipCutPreviewLine from './RipCutPreviewLine';
import ScrapBox from './ScrapBox';
import ModeSwitcher from './ModeSwitcher';
import HintBar from './HintBar';
import CanvasErrorBoundary from './CanvasErrorBoundary';
import { consumeGizmoDragClickSuppress } from '../lib/gizmoDragGuard';

function ShadowFloor() {
  const clearSelection = useAppStore((s) => s.clearSelection);
  const setRadialWheelOpen = useAppStore((s) => s.setRadialWheelOpen);
  const selectDimensionLine = useAppStore((s) => s.selectDimensionLine);
  const setSelectedCenterlineId = useAppStore((s) => s.setSelectedCenterlineId);

  // The grid/floor is a real mesh, so onPointerMissed on <Canvas> never fires when
  // clicking it (the raycaster DOES hit something). Clicking the floor is the most
  // common "empty space" click, so it gets its own explicit deselect handler.
  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -0.05, 0]}
      receiveShadow
      onClick={(e) => {
        if (e.shiftKey) return;
        if (consumeGizmoDragClickSuppress()) return;
        // Phase 20: a floor click must never wipe a half-finished pick — a
        // mate anchor (mateFaceA) or pendingInteraction survives until the
        // user presses Escape or completes the pick. Only Select-tool floor
        // clicks deselect.
        const ui = useAppStore.getState().ui;
        if (ui.activeTool !== 'select' || ui.pendingInteraction) return;
        e.stopPropagation();
        clearSelection();
        setRadialWheelOpen(false);
        selectDimensionLine(null);
        setSelectedCenterlineId(null);
      }}
    >
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
  const allMembers   = useAppStore((s) => s.project.members);
  const members      = allMembers.filter((m) => !m.inScrapBox);
  const setBoxSelectPending = useAppStore((s) => s.setBoxSelectPending);
  const setOrbitControlsEnabled = useAppStore((s) => s.setOrbitControlsEnabled);
  const setRadialWheelOpen = useAppStore((s) => s.setRadialWheelOpen);
  const clearSelection = useAppStore((s) => s.clearSelection);
  const activeTool        = useAppStore((s) => s.ui.activeTool);
  const gridVisible       = useAppStore((s) => s.ui.gridVisible);
  const snapToGrid        = useAppStore((s) => s.ui.snapToGrid);
  const showWelcome  = members.length === 0;

  return (
    <div
      className="flex-1 relative bg-zinc-950 min-w-0"
      style={{ minHeight: 0 }}
      data-viewport-root
    >
      <KeyboardShortcuts />
      <ViewportContextMenu />
      {snapToGrid && (
        <div className="absolute top-3 right-3 z-20 px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-500/50 text-xs font-semibold text-amber-300 pointer-events-none select-none">
          ⊞ Snap to Grid ON
        </div>
      )}
      {/* Phase 20: per-tool floating hints replaced by the persistent HintBar below. */}
      {showWelcome && <ViewportWelcome />}
      <ModeSwitcher />
      <HintBar />
      <QuickDimensionsPanel />
      <RadialOrbitalSelector />
      <FastenerPlacementBar />
      <FastenerInfoPanel />
      <QuickJoinToolbar />
      <BoxSelectionHandler />
      <DesignSuggestionsBridge />
      <ScrapBox />
      <CanvasErrorBoundary>
      <Canvas
        style={{ width: '100%', height: '100%' }}
        shadows
        onCreated={({ gl }) => {
          gl.shadowMap.type = THREE.PCFSoftShadowMap;
          gl.setClearColor('#09090b');
        }}
        onPointerMissed={(e) => {
          // Phase 17 Part 1 fix: a gizmo (move/rotate/scale) drag that just
          // ended can cause this same native pointerup to also be seen by
          // R3F's own raycast as a "miss" (drei's TransformControls never
          // calls stopPropagation, and rotate-ring handles are frequently
          // released in empty space away from the board mesh). Ignore this
          // particular miss so a legitimate gizmo interaction never clears
          // the selection. See src/lib/gizmoDragGuard.ts.
          if (consumeGizmoDragClickSuppress()) return;
          const ui = useAppStore.getState().ui;
          if (ui.radialWheelOpen) {
            setRadialWheelOpen(false);
          }
          if (activeTool === 'select') {
            if (!ui.boxSelectRect && !e.shiftKey) {
              clearSelection();
            }
            if (ui.boxSelectRect) return;
            if (!e.shiftKey) return;
            setOrbitControlsEnabled(false);
            setBoxSelectPending({
              x: e.clientX,
              y: e.clientY,
              shiftKey: e.shiftKey,
            });
          }
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
            cellThickness={0.8}
            cellColor="#383838"
            sectionSize={12}
            sectionThickness={1.5}
            sectionColor="#555555"
            fadeDistance={400}
            fadeStrength={1.0}
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

        <MeasureTool />
        <DimensionLineRenderer />
        <RotationRing />
        <CrossCutPreviewLine />
        <RipCutPreviewLine />
        <SceneOrbitControls />
        <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
          <GizmoViewport labelColor="white" axisHeadScale={0.85} />
        </GizmoHelper>
      </Canvas>
      </CanvasErrorBoundary>
    </div>
  );
}
