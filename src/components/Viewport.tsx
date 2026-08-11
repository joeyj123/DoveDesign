import { useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { useAppStore } from '../store';
import BoardMesh from './BoardMesh';
import BoardAnnotations from './BoardAnnotations';
import SketchTool from './SketchTool';
import MoveGizmo from './MoveGizmo';
import RotateGizmo from './RotateGizmo';
import TemplateCameraLock from './TemplateCameraLock';
import TemplateDrawTools from './TemplateDrawTools';
import CutoutCameraLock from './CutoutCameraLock';
import CutoutDrawTools from './CutoutDrawTools';
import { THEME } from '../lib/theme';

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
  const cameraLocked = useAppStore((s) => s.ui.cameraLocked);
  const activeTool = useAppStore((s) => s.ui.activeTool);
  const workspaceMode = useAppStore((s) => s.ui.workspaceMode);
  const cutoutFace = useAppStore((s) => s.ui.cutoutFace);
  const selectMember = useAppStore((s) => s.selectMember);
  const setSelectedTemplateShapeId = useAppStore((s) => s.setSelectedTemplateShapeId);
  const selectDimensionLine = useAppStore((s) => s.selectDimensionLine);
  const selectReferenceLine = useAppStore((s) => s.selectReferenceLine);
  const controlsRef = useRef<OrbitControlsImpl | null>(null);

  return (
    <Canvas
      shadows
      camera={{ position: [40, 30, 40], fov: 45, near: 0.1, far: 2000 }}
      onPointerMissed={() => {
        if (activeTool === 'select') selectMember(null);
        // Clicking empty Template-space ground (missing every mesh,
        // including every shape fill) deselects the currently-selected
        // shape, mirroring Select's deselect-on-empty-click behavior above.
        if (workspaceMode === 'template') setSelectedTemplateShapeId(null);
        // New Order 8.1 Fix 4: the Entities list's dimension/reference line
        // highlight had no deselect affordance at all — same "click empty
        // space to clear the highlight" pattern board selection already
        // uses above, applied to the same two selection fields.
        selectDimensionLine(null);
        selectReferenceLine(null);
      }}
    >
      {/* New Order 5.3: viewport background off pure black (Canvas has no
          scene background by default, which reads as solid black) onto the
          same muted warm-grey chrome family as the rest of the app —
          THEME.viewportBackground mirrors tailwind's charcoal-600, so the
          3D viewport and the surrounding panels read as one palette. */}
      <color attach="background" args={[THEME.viewportBackground]} />

      {/* New Order 6: horizon fog. Drei's Grid uses a fully custom shader
          (see node_modules/@react-three/drei/core/Grid.js) that never reads
          THREE.Scene.fog — a <fog> node here would only affect standard
          materials (board meshes), not the grid, so it can't be the fix for
          "grid stops at a hard line." The grid's OWN fade is driven by its
          fadeDistance/fadeStrength uniforms below (fadeStrength was set to 0
          in New Order 5.4 to kill a *vignette* — that bug was fadeDistance
          being small enough that the fade radius sat inside the visible
          viewport at normal zoom, reading as darkened corners centered on
          the camera. Re-enabling it with a fadeDistance comfortably larger
          than any normal framing distance, but still well inside the grid's
          fixed 300x300 extent, fades the grid out before its physical edge
          without reintroducing that near-camera vignette. */}

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
          fix: "finer sub-grid lines... currently too faint"). New Order 5.3:
          re-tinted warm (THEME.gridCell/gridSection, mirroring charcoal-500/
          charcoal-300) to match the new warm-grey viewport background —
          cell lines a step lighter than the background, section lines
          lighter still, so both stay clearly readable without glowing.
          New Order 5.4: drei's Grid applies a distance-from-camera fade to
          both cell and section line opacity by default (fadeStrength=1),
          which reads as a vignette centered on wherever the camera is
          looking — the grid (which visually dominates the viewport at most
          camera angles) fades toward the flat background color outward from
          screen center, darkening the corners relative to the middle.
          `fadeStrength={0}` below turned that off, so the grid rendered at a
          uniform color across its full fixed extent regardless of camera
          distance or screen position — matching the Order's "flat, even
          grey, no gradient falloff" requirement.
        FOLLOWS-BOARD CHECK: n/a — static world geometry, not board- or
          camera-relative.

        Data Flow Pipeline: Horizon fog (New Order 6)
        INPUT: none — same static grid mesh, no board/camera state read into
          the geometry itself.
        CALCULATION: drei's GridMaterial fades cell/section opacity by
          `pow(1 - dist/fadeDistance, fadeStrength)`, where `dist` is the
          world-space distance from the point on the grid plane directly
          under the camera (see Grid.js) — a real world-space radius, not a
          screen-space vignette. 5.4's uniform-flat fix avoided a vignette
          that was really this radius being too small (drei's default
          fadeDistance=100) for how close the camera typically frames a
          board layout. Restoring the fade with a larger fadeDistance keeps
          normal-framing views crisp (the fade radius sits outside what's
          usually visible) while letting the grid fade to the background
          color well before its physical 300x300 edge when the camera is
          pulled back or angled toward the horizon.
        OUTPUT: fadeDistance=140, fadeStrength=1 (drei's default falloff
          curve — only the radius changed, not the curve shape).
        FOLLOWS-BOARD CHECK: n/a — static world geometry, camera-relative
          only in the sense every prior grid fade attempt already was.

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
        cellColor={THEME.gridCell}
        sectionColor={THEME.gridSection}
        fadeStrength={1}
        fadeDistance={140}
      />

      {/* Fixed world-origin reference marker (New Order 2.3 fix 6) — a small,
          static RGB axes indicator at (0,0,0), independent of any board or
          camera state, so there's always a stable point of reference distinct
          from the per-board floating offset readout in MoveGizmo.tsx. Always
          inside the grid's fixed bounds by construction (grid is centered on
          the same origin this marker sits at). New Order 7.1 Fix 3: hidden
          while in Template mode — viewed top-down and zoomed in for precise
          sketching, its three intersecting axis lines read as a dot/blob
          that blocked placing small shapes; TemplateDrawTools.tsx already
          renders its own low-emphasis dashed reference axes through the same
          plane origin, which serves as Template's crosshair instead. */}
      {workspaceMode !== 'template' && <axesHelper args={[6]} />}

      {members.filter((m) => !m.inScrapBox).map((m) => (
        <BoardMesh key={m.id} member={m} />
      ))}

      {/* New Order 8: Dimension Line + Reference Line rendering, parented
          per-board (see BoardAnnotations.tsx's Data Flow Pipeline block) —
          mounted unconditionally like every other tool component here, since
          committed lines render regardless of which tool is currently
          active (only the click-to-create interaction in BoardMesh.tsx is
          tool-gated). */}
      <BoardAnnotations />

      <SketchTool />
      <MoveGizmo />
      <RotateGizmo />
      {/* Purely a camera/OrbitControls-target side effect on workspaceMode
          transitions — see TemplateCameraLock.tsx's own Data Flow Pipeline
          block. Rendered unconditionally (like every other tool component
          here) so it can observe the transition itself, not just the
          entered state. */}
      <TemplateCameraLock controlsRef={controlsRef} />

      {/* Line/Arc/Freehand draw tools, only interactive while
          workspaceMode === 'template' (component gates itself, same
          always-mounted/early-return pattern as SketchTool/MoveGizmo/
          RotateGizmo above). */}
      <TemplateDrawTools />

      {/* New Order 11: camera lock onto a picked board face's plane (Cutout
          tool) — same always-mounted/self-gating pattern as
          TemplateCameraLock above, just keyed on ui.cutoutFace instead of
          workspaceMode. */}
      <CutoutCameraLock controlsRef={controlsRef} />
      <CutoutDrawTools />

      {/* Template is a locked 2D plane, not a freely-orbitable view —
          enableRotate is the only OrbitControls behavior change; pan/zoom
          stay on so the user can still frame the sketch. New Order 11
          follow-up fix (2026-08-10): Cutout's sketch capture plane is the
          SAME kind of locked-plane precision surface once a face is picked
          (CutoutCameraLock.tsx frames the camera straight at it) — but
          nothing was disabling rotate for it, so a real mouse's natural
          down-to-up drift while clicking would orbit the camera off that
          locked framing. Once orbited even slightly, a click's ray could
          pass through/behind a nearer, now-visible face of the same board
          before reaching the picked face's capture plane — the point still
          resolves against the capture plane (correct math), but it no
          longer corresponds to what's rendered under the cursor, which
          reads as "the point doesn't land where I clicked." Disabling
          rotate while cutoutFace is armed (sketching in progress) closes
          that gap, same precision requirement as Template, only pan/zoom
          stay on. */}
      {/* cameraLocked (CameraLockToggle.tsx / 'L' shortcut) is a full,
          user-driven freeze layered on top of orbitControlsEnabled (which
          tools already drive automatically per-drag) — combined here rather
          than as a second <OrbitControls>, so every other lock reason
          (draw-board drag, Move/Rotate gizmo drag) keeps working exactly as
          before whether or not the user has also locked the camera. */}
      <OrbitControls
        ref={controlsRef}
        enabled={orbitControlsEnabled && !cameraLocked}
        enableRotate={workspaceMode !== 'template' && !cutoutFace}
        makeDefault
      />
    </Canvas>
  );
}
