import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import { useAppStore } from '../store';
import BoardMesh from './BoardMesh';
import SketchTool from './SketchTool';
import MoveGizmo from './MoveGizmo';

/**
 * Minimal viewport shell: camera, orbit controls, lighting, grid, and board
 * rendering only. No panels, other tools — those are future New Orders. Per
 * CLAUDE.md Rule 4, orbit is disabled only during an active drag (SketchTool
 * and MoveGizmo call setOrbitControlsEnabled themselves), never just because
 * a tool is armed.
 *
 * New Order 2.1: the old moveDragActive-driven `mouseButtons` LEFT-button
 * remap (a partial camera lock, kept for New Order 2's raw left-drag so the
 * left mouse button could mean either "orbit" or "move board" depending on
 * context) is gone now that Move uses a dedicated axis-handle gizmo
 * (MoveGizmo.tsx). Dragging a gizmo handle no longer competes with a plain
 * left-drag orbit at all — different targets, not different meanings of the
 * same button — so the fix is a full, ordinary setOrbitControlsEnabled(false)
 * for the duration of the drag, same as every other drag tool in this app.
 */
export default function Viewport() {
  const members = useAppStore((s) => s.project.members);
  const orbitControlsEnabled = useAppStore((s) => s.ui.orbitControlsEnabled);
  const activeTool = useAppStore((s) => s.ui.activeTool);
  const selectMember = useAppStore((s) => s.selectMember);

  return (
    <Canvas
      shadows
      camera={{ position: [40, 30, 40], fov: 45, near: 0.1, far: 2000 }}
      onPointerMissed={() => {
        if (activeTool === 'select') selectMember(null);
      }}
    >
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[30, 50, 20]}
        intensity={1.1}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />

      {/*
        Data Flow Pipeline: Grid stability (New Order 2.2/2.3, reverted 2.4)
        INPUT: none — the grid is a plain, static mesh centered at the world
          origin. No camera or board state feeds its geometry at all.
        CALCULATION: 2.3's `followCamera` + `infiniteGrid` combination
          recentered the (visually infinite) grid under the camera every
          frame — this fixed 2.2's "grid disappears far from origin" bug,
          but introduced a worse one: because the grid no longer had a fixed
          world position, nothing about it corresponded to a stable floor
          plane any more, and at large camera/board distances the constant
          per-frame re-shift of a huge shader-stretched mesh produced visible
          origin-marker and orbit instability. A fixed-size, non-shader-
          stretched, non-camera-following plane has none of these failure
          modes: it is just an ordinary mesh sitting at y=0, args=[300,300]
          (150 world units in every direction from origin — comfortably
          larger than any board layout this app expects), with plain
          (non-`infiniteGrid`) vertex coordinates, so there is no huge
          multiplier and no precision loss at any viewing angle either.
          The tradeoff — the grid now has a visible edge at +/-150 units —
          is intentional per this Order: "a real floor/measuring reference,"
          not an illusion of infinity.
        OUTPUT: a static mesh at the origin; sub-grid (cell) and major
          (section) line colors brightened from 2.3's grays (New Order 2.4
          fix: "finer sub-grid lines... currently too faint").
        FOLLOWS-BOARD CHECK: n/a — static world geometry, not board- or
          camera-relative.

        Data Flow Pipeline: Grid-as-floor collision (New Order 2.4)
        INPUT: a board's stored Y position + thickness (see MoveGizmo.tsx).
        CALCULATION: src/lib/bounds.ts's clampFloorY(y, thickness) enforces
          y >= thickness/2, i.e. the board's bottom face can never go below
          this grid's fixed y=0 plane.
        OUTPUT: MoveGizmo.tsx applies the clamped Y to every intermediate
          drag frame and the final commit, so the constraint holds during
          the live drag, not just after release.
        FOLLOWS-BOARD CHECK: yes — re-applied fresh every drag frame from
          the board's current thickness, never a one-time snap.
      */}
      <Grid
        args={[300, 300]}
        cellSize={1}
        cellThickness={0.6}
        sectionSize={12}
        sectionThickness={1.2}
        cellColor="#71717a"
        sectionColor="#d4d4d8"
      />

      {/* Fixed world-origin reference marker (New Order 2.3 fix 6) — a small,
          static RGB axes indicator at (0,0,0), independent of any board or
          camera state, so there's always a stable point of reference distinct
          from the per-board floating offset readout in MoveGizmo.tsx. Always
          inside the grid's fixed bounds by construction (grid is centered on
          the same origin this marker sits at). */}
      <axesHelper args={[6]} />

      {members.filter((m) => !m.inScrapBox).map((m) => (
        <BoardMesh key={m.id} member={m} />
      ))}

      <SketchTool />
      <MoveGizmo />

      <OrbitControls enabled={orbitControlsEnabled} makeDefault />
    </Canvas>
  );
}
