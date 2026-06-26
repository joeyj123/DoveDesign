import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useThree, useFrame } from '@react-three/fiber';
import { Line, Html } from '@react-three/drei';
import { useAppStore } from '../store';

const AMBER = '#F59E0B';
const AMBER_BRIGHT = '#FCD34D';
const SNAP_RADIUS = 0.5;
const SNAP_ANGLES_DEG = [0, 45, 90, 135, 180, 225, 270, 315];
const SNAP_THRESHOLD_DEG = 5;

function snapAngle(
  start: THREE.Vector3,
  end: THREE.Vector3,
  shift: boolean
): { point: THREE.Vector3; snapped: boolean } {
  if (shift) return { point: end.clone(), snapped: false };
  const dx = end.x - start.x;
  const dz = end.z - start.z;
  const rawDeg = ((Math.atan2(dz, dx) * 180) / Math.PI + 360) % 360;
  const dist = Math.sqrt(dx * dx + dz * dz);
  for (const sd of SNAP_ANGLES_DEG) {
    let diff = Math.abs(rawDeg - sd);
    if (diff > 180) diff = 360 - diff;
    if (diff < SNAP_THRESHOLD_DEG) {
      const rad = (sd * Math.PI) / 180;
      return {
        point: new THREE.Vector3(start.x + Math.cos(rad) * dist, start.y, start.z + Math.sin(rad) * dist),
        snapped: true,
      };
    }
  }
  return { point: end.clone(), snapped: false };
}

function angleDeg(a: THREE.Vector3, b: THREE.Vector3) {
  return ((Math.atan2(b.z - a.z, b.x - a.x) * 180) / Math.PI + 360) % 360;
}

type MemberSnap = {
  id: string;
  position: [number, number, number];
  rotation: [number, number, number];
  length: number; thickness: number; width: number;
  cuts: { type: string; targetWidth?: number }[];
};

function nearestSnapPoint(worldPt: THREE.Vector3, members: MemberSnap[]): THREE.Vector3 | null {
  let best: THREE.Vector3 | null = null;
  let bestD = SNAP_RADIUS;
  for (const m of members) {
    let w = m.width;
    for (const c of m.cuts) { if (c.type === 'ripCut' && c.targetWidth) w = c.targetWidth; }
    const hL = m.length / 2, hT = m.thickness / 2, hW = w / 2;
    const lps: [number, number, number][] = [
      [-hL,-hT,-hW],[-hL,-hT,hW],[-hL,hT,-hW],[-hL,hT,hW],
      [hL,-hT,-hW],[hL,-hT,hW],[hL,hT,-hW],[hL,hT,hW],
      [-hL,0,0],[hL,0,0],[0,-hT,0],[0,hT,0],[0,0,-hW],[0,0,hW],[0,0,0],
    ];
    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(...(m.rotation as [number,number,number])));
    const pos = new THREE.Vector3(...m.position);
    for (const lp of lps) {
      const wp = new THREE.Vector3(lp[0],lp[1],lp[2]).applyQuaternion(q).add(pos);
      const d = wp.distanceTo(worldPt);
      if (d < bestD) { bestD = d; best = wp; }
    }
  }
  return best;
}

const FLOOR = new THREE.Plane(new THREE.Vector3(0,1,0), 0);

export default function MeasureTool() {
  const activeTool        = useAppStore((s) => s.ui.activeTool);
  const measureStartPoint = useAppStore((s) => s.ui.measureStartPoint);
  const setMeasureStartPoint = useAppStore((s) => s.setMeasureStartPoint);
  const addDimensionLine  = useAppStore((s) => s.addDimensionLine);
  const members = useAppStore((s) =>
    s.project.members.filter((m) => !m.inScrapBox) as MemberSnap[]
  );

  const { camera, gl, scene } = useThree();

  // Track mouse in NDC coordinates via native listener
  const ndc    = useRef(new THREE.Vector2());
  const shiftRef = useRef(false);
  const rc     = useRef(new THREE.Raycaster());

  // Live cursor world position (updated in useFrame)
  const [cursor, setCursor] = useState<THREE.Vector3 | null>(null);
  const [cursorSnapped, setCursorSnapped] = useState(false);
  const cursorRef = useRef<THREE.Vector3 | null>(null);
  const cursorSnappedRef = useRef(false);

  // Collect board meshes from scene
  const boardMeshesRef = useRef<THREE.Mesh[]>([]);

  useEffect(() => {
    if (activeTool !== 'measure') return;

    function onMove(e: PointerEvent) {
      const rect = gl.domElement.getBoundingClientRect();
      ndc.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      ndc.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      shiftRef.current = e.shiftKey;
    }

    function onClick(e: MouseEvent) {
      if (e.button !== 0) return;
      const pt = cursorRef.current;
      if (!pt) return;

      const start = useAppStore.getState().ui.measureStartPoint;
      if (!start) {
        setMeasureStartPoint({ x: pt.x, y: pt.y, z: pt.z });
      } else {
        const sv = new THREE.Vector3(start.x, start.y, start.z);
        const { point: end } = snapAngle(sv, pt, e.shiftKey);
        addDimensionLine({
          id: crypto.randomUUID(),
          startPoint: { x: sv.x, y: sv.y, z: sv.z },
          endPoint:   { x: end.x, y: end.y, z: end.z },
          angleDegrees: Math.round(angleDeg(sv, end)),
        });
        setMeasureStartPoint(null);
        // stay in measure mode for next line
      }
    }

    const canvas = gl.domElement;
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('click', onClick);
    return () => {
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('click', onClick);
    };
  }, [activeTool, gl, setMeasureStartPoint, addDimensionLine]);

  useFrame(() => {
    if (activeTool !== 'measure') return;

    // Collect board meshes every frame (handles additions/removals)
    boardMeshesRef.current = [];
    scene.traverse((obj) => {
      if (obj instanceof THREE.Mesh && obj.userData.memberId) {
        boardMeshesRef.current.push(obj);
      }
    });

    rc.current.setFromCamera(ndc.current, camera);

    let hitPt: THREE.Vector3 | null = null;
    let snapped = false;

    // 1. Try board mesh intersection
    const hits = rc.current.intersectObjects(boardMeshesRef.current, false);
    if (hits.length > 0) {
      hitPt = hits[0].point.clone();
    } else {
      // 2. Fall back to floor plane
      const fp = new THREE.Vector3();
      if (rc.current.ray.intersectPlane(FLOOR, fp)) hitPt = fp;
    }

    if (hitPt) {
      // Snap to nearest board point
      const snap = nearestSnapPoint(hitPt, members);
      if (snap) { hitPt = snap; snapped = true; }
    }

    cursorRef.current = hitPt;
    cursorSnappedRef.current = snapped;

    // Only update React state if something changed (avoids excessive re-renders)
    const prev = cursorRef.current;
    if (!prev || !hitPt || prev.distanceTo(hitPt) > 0.001 || snapped !== cursorSnappedRef.current) {
      setCursor(hitPt ? hitPt.clone() : null);
      setCursorSnapped(snapped);
    }
  });

  if (activeTool !== 'measure') return null;

  const startVec = measureStartPoint
    ? new THREE.Vector3(measureStartPoint.x, measureStartPoint.y, measureStartPoint.z)
    : null;

  const { point: snappedCursor, snapped: lineSnapped } =
    startVec && cursor
      ? snapAngle(startVec, cursor, shiftRef.current)
      : { point: cursor, snapped: false };

  const livePoints: [number, number, number][] = startVec && snappedCursor
    ? [[startVec.x, startVec.y + 0.05, startVec.z],
       [snappedCursor.x, snappedCursor.y + 0.05, snappedCursor.z]]
    : [];

  const liveDist  = startVec && snappedCursor ? startVec.distanceTo(snappedCursor) : 0;
  const liveAngle = startVec && snappedCursor ? angleDeg(startVec, snappedCursor) : 0;
  const midPt     = startVec && snappedCursor
    ? new THREE.Vector3(
        (startVec.x + snappedCursor.x) / 2,
        Math.max(startVec.y, snappedCursor.y) + 0.25,
        (startVec.z + snappedCursor.z) / 2
      )
    : null;

  const lineColor = lineSnapped ? AMBER_BRIGHT : AMBER;

  return (
    <>
      {/* Start anchor */}
      {startVec && (
        <mesh position={[startVec.x, startVec.y + 0.06, startVec.z]}>
          <sphereGeometry args={[0.15, 10, 10]} />
          <meshBasicMaterial color={AMBER} />
        </mesh>
      )}

      {/* Live line */}
      {livePoints.length === 2 && (
        <Line points={livePoints} color={lineColor} lineWidth={2} dashed dashSize={0.35} gapSize={0.18} />
      )}

      {/* Cursor dot */}
      {cursor && (
        <mesh position={[cursor.x, cursor.y + 0.06, cursor.z]}>
          <sphereGeometry args={[cursorSnapped ? 0.18 : 0.11, 10, 10]} />
          <meshBasicMaterial color={cursorSnapped ? AMBER_BRIGHT : AMBER} transparent opacity={0.85} />
        </mesh>
      )}

      {/* Distance label */}
      {midPt && liveDist > 0.05 && (
        <Html position={[midPt.x, midPt.y, midPt.z]} center>
          <div className="px-2 py-0.5 rounded-full text-xs font-semibold text-white pointer-events-none select-none whitespace-nowrap"
            style={{ background:'rgba(24,24,27,0.92)', border:`1px solid ${lineColor}` }}>
            {liveDist.toFixed(2)}&quot;
          </div>
        </Html>
      )}

      {/* Angle label */}
      {snappedCursor && liveDist > 0.05 && (
        <Html position={[snappedCursor.x, snappedCursor.y + 0.45, snappedCursor.z]} center>
          <div className="px-1.5 py-0.5 rounded-full text-xs font-semibold pointer-events-none select-none whitespace-nowrap"
            style={{ background:'rgba(9,9,11,0.92)', color: lineColor }}>
            {Math.round(liveAngle)}°
          </div>
        </Html>
      )}
    </>
  );
}
