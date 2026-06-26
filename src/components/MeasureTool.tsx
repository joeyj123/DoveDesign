import { useRef, useState } from 'react';
import * as THREE from 'three';
import { ThreeEvent } from '@react-three/fiber';
import { Line, Html } from '@react-three/drei';
import { useAppStore } from '../store';

const AMBER = '#F59E0B';
const AMBER_BRIGHT = '#FCD34D';
const SNAP_RADIUS = 0.5; // units = inches

// Snap angles: 0°, 45°, 90°, 135°, 180°, 225°, 270°, 315°
const SNAP_ANGLES_DEG = [0, 45, 90, 135, 180, 225, 270, 315];
const SNAP_THRESHOLD_DEG = 5;

function getSnapAngledEnd(
  start: THREE.Vector3,
  end: THREE.Vector3,
  shiftKey: boolean
): { point: THREE.Vector3; snapped: boolean } {
  if (shiftKey) return { point: end.clone(), snapped: false };

  const dx = end.x - start.x;
  const dz = end.z - start.z;
  const rawDeg = ((Math.atan2(dz, dx) * 180) / Math.PI + 360) % 360;
  const dist = Math.sqrt(dx * dx + dz * dz);

  for (const snapDeg of SNAP_ANGLES_DEG) {
    let diff = Math.abs(rawDeg - snapDeg);
    if (diff > 180) diff = 360 - diff;
    if (diff < SNAP_THRESHOLD_DEG) {
      const rad = (snapDeg * Math.PI) / 180;
      return {
        point: new THREE.Vector3(start.x + Math.cos(rad) * dist, start.y, start.z + Math.sin(rad) * dist),
        snapped: true,
      };
    }
  }
  return { point: end.clone(), snapped: false };
}

function getAngleDeg(start: THREE.Vector3, end: THREE.Vector3): number {
  return ((Math.atan2(end.z - start.z, end.x - start.x) * 180) / Math.PI + 360) % 360;
}

/** Find the nearest snap point across all visible boards. */
function findNearestSnapPoint(
  worldPt: THREE.Vector3,
  members: { id: string; position: [number, number, number]; rotation: [number, number, number]; length: number; thickness: number; width: number; cuts: { type: string; targetWidth?: number }[]; inScrapBox?: boolean }[]
): THREE.Vector3 | null {
  let best: THREE.Vector3 | null = null;
  let bestDist = SNAP_RADIUS;

  for (const m of members) {
    if ((m as { inScrapBox?: boolean }).inScrapBox) continue;

    let width = m.width;
    for (const c of m.cuts) {
      if (c.type === 'ripCut' && c.targetWidth) width = c.targetWidth;
    }
    const hL = m.length / 2, hT = m.thickness / 2, hW = width / 2;

    const localPts: [number, number, number][] = [
      [-hL, -hT, -hW], [-hL, -hT, hW], [-hL, hT, -hW], [-hL, hT, hW],
      [ hL, -hT, -hW], [ hL, -hT, hW], [ hL, hT, -hW], [ hL, hT, hW],
      [-hL, 0, 0], [hL, 0, 0], [0, -hT, 0], [0, hT, 0], [0, 0, -hW], [0, 0, hW],
      [0, 0, 0],
    ];

    const euler = new THREE.Euler(...(m.rotation as [number, number, number]));
    const q = new THREE.Quaternion().setFromEuler(euler);
    const pos = new THREE.Vector3(...m.position);

    for (const lp of localPts) {
      const wp = new THREE.Vector3(lp[0], lp[1], lp[2]).applyQuaternion(q).add(pos);
      const d = wp.distanceTo(worldPt);
      if (d < bestDist) {
        bestDist = d;
        best = wp;
      }
    }
  }

  return best;
}

export default function MeasureTool() {
  const activeTool = useAppStore((s) => s.ui.activeTool);
  const measureStartPoint = useAppStore((s) => s.ui.measureStartPoint);
  const setMeasureStartPoint = useAppStore((s) => s.setMeasureStartPoint);
  const addDimensionLine = useAppStore((s) => s.addDimensionLine);
  const members = useAppStore((s) => s.project.members);

  const [cursorWorld, setCursorWorld] = useState<THREE.Vector3 | null>(null);
  const [cursorSnapped, setCursorSnapped] = useState(false);
  const shiftRef = useRef(false);

  if (activeTool !== 'measure') return null;

  const startVec = measureStartPoint
    ? new THREE.Vector3(measureStartPoint.x, measureStartPoint.y, measureStartPoint.z)
    : null;

  const { point: snappedCursor, snapped: endSnapped } =
    startVec && cursorWorld
      ? getSnapAngledEnd(startVec, cursorWorld, shiftRef.current)
      : { point: cursorWorld ?? null, snapped: false };

  const livePoints: [number, number, number][] =
    startVec && snappedCursor
      ? [
          [startVec.x, startVec.y + 0.05, startVec.z],
          [snappedCursor.x, snappedCursor.y + 0.05, snappedCursor.z],
        ]
      : [];

  const liveDist = startVec && snappedCursor ? startVec.distanceTo(snappedCursor) : 0;
  const liveAngle = startVec && snappedCursor ? getAngleDeg(startVec, snappedCursor) : 0;
  const midPoint =
    startVec && snappedCursor
      ? new THREE.Vector3(
          (startVec.x + snappedCursor.x) / 2,
          Math.max(startVec.y, snappedCursor.y) + 0.2,
          (startVec.z + snappedCursor.z) / 2
        )
      : null;

  function resolveHitPoint(e: ThreeEvent<PointerEvent | MouseEvent>): THREE.Vector3 {
    // The invisible floor plane's hit point gives us world coords
    const raw = e.point.clone();
    const snap = findNearestSnapPoint(raw, members);
    if (snap) return snap;
    // Fall back to floor plane Y=0
    return raw.setY(0);
  }

  function handlePointerMove(e: ThreeEvent<PointerEvent>) {
    shiftRef.current = e.nativeEvent.shiftKey;
    const pt = resolveHitPoint(e);
    const snapPt = findNearestSnapPoint(e.point, members);
    setCursorSnapped(!!snapPt);
    setCursorWorld(pt);
    e.stopPropagation();
  }

  function handleClick(e: ThreeEvent<MouseEvent>) {
    const pt = resolveHitPoint(e);
    e.stopPropagation();

    if (!measureStartPoint) {
      setMeasureStartPoint({ x: pt.x, y: pt.y, z: pt.z });
    } else {
      const start = new THREE.Vector3(measureStartPoint.x, measureStartPoint.y, measureStartPoint.z);
      const { point: end } = getSnapAngledEnd(start, pt, e.nativeEvent.shiftKey);
      const angle = getAngleDeg(start, end);

      addDimensionLine({
        id: crypto.randomUUID(),
        startPoint: { x: start.x, y: start.y, z: start.z },
        endPoint: { x: end.x, y: end.y, z: end.z },
        angleDegrees: Math.round(angle),
      });
      setMeasureStartPoint(null);
      // Stay in measure mode so user can draw another line immediately
    }
  }

  const lineColor = endSnapped ? AMBER_BRIGHT : AMBER;

  return (
    <>
      {/* Large invisible floor plane to capture pointer events */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        onPointerMove={handlePointerMove}
        onClick={handleClick}
      >
        <planeGeometry args={[2000, 2000]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* Start point anchor */}
      {startVec && (
        <mesh position={[startVec.x, startVec.y + 0.06, startVec.z]}>
          <sphereGeometry args={[0.15, 10, 10]} />
          <meshBasicMaterial color={AMBER} />
        </mesh>
      )}

      {/* Live line */}
      {livePoints.length === 2 && (
        <Line
          points={livePoints}
          color={lineColor}
          lineWidth={2}
          dashed
          dashSize={0.35}
          gapSize={0.18}
        />
      )}

      {/* Cursor dot (brighter when snapping to a board point) */}
      {snappedCursor && (
        <mesh position={[snappedCursor.x, snappedCursor.y + 0.06, snappedCursor.z]}>
          <sphereGeometry args={[cursorSnapped ? 0.18 : 0.12, 10, 10]} />
          <meshBasicMaterial color={cursorSnapped ? AMBER_BRIGHT : AMBER} transparent opacity={0.85} />
        </mesh>
      )}

      {/* Distance label */}
      {midPoint && liveDist > 0.05 && (
        <Html position={[midPoint.x, midPoint.y, midPoint.z]} center>
          <div
            className="px-2 py-0.5 rounded-full text-xs font-semibold text-white pointer-events-none select-none whitespace-nowrap"
            style={{ background: 'rgba(24,24,27,0.92)', border: `1px solid ${lineColor}` }}
          >
            {liveDist.toFixed(2)}&quot;
          </div>
        </Html>
      )}

      {/* Angle label near end */}
      {snappedCursor && liveDist > 0.05 && (
        <Html position={[snappedCursor.x, snappedCursor.y + 0.45, snappedCursor.z]} center>
          <div
            className="px-1.5 py-0.5 rounded-full text-xs font-semibold pointer-events-none select-none whitespace-nowrap"
            style={{ background: 'rgba(9,9,11,0.92)', color: lineColor }}
          >
            {Math.round(liveAngle)}°
          </div>
        </Html>
      )}
    </>
  );
}
