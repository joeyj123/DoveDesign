import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useThree, useFrame } from '@react-three/fiber';
import { Line, Html } from '@react-three/drei';
import { useAppStore } from '../store';

const AMBER = '#F59E0B';
const AMBER_BRIGHT = '#FCD34D';
const GREEN = '#22c55e';
const GREEN_BRIGHT = '#4ade80';
const BLUE = '#3b82f6';
const SNAP_RADIUS = 0.5;
const SNAP_THRESHOLD_DEG = 8;

function projectOntoPlane(P: THREE.Vector3, O: THREE.Vector3, N: THREE.Vector3): THREE.Vector3 {
  const d = P.clone().sub(O).dot(N);
  return P.clone().sub(N.clone().multiplyScalar(d));
}

// Snap end point to cardinal axes of the work plane
function snapOnPlane(
  start: THREE.Vector3,
  end: THREE.Vector3,
  normal: THREE.Vector3,
  shift: boolean
): { point: THREE.Vector3; snapped: boolean } {
  if (shift) return { point: end.clone(), snapped: false };

  const up = new THREE.Vector3(0, 1, 0);
  const isHorizontal = Math.abs(normal.dot(up)) > 0.85;

  if (isHorizontal) {
    // Horizontal face: snap to world X or Z
    const dx = end.x - start.x;
    const dz = end.z - start.z;
    const rawDeg = ((Math.atan2(dz, dx) * 180) / Math.PI + 360) % 360;
    const dist = Math.sqrt(dx * dx + dz * dz);
    for (const sd of [0, 90, 180, 270]) {
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

  // Vertical face: snap to face-local horizontal (faceRight) or vertical (faceUp)
  const faceRight = new THREE.Vector3().crossVectors(normal, up).normalize();
  const faceUp = new THREE.Vector3().crossVectors(faceRight, normal).normalize();

  const dir = end.clone().sub(start);
  const dist = dir.length();
  if (dist < 0.001) return { point: end.clone(), snapped: false };
  const dirN = dir.clone().normalize();

  const angleToRight = Math.acos(Math.min(1, Math.abs(dirN.dot(faceRight)))) * 180 / Math.PI;
  const angleToUp = Math.acos(Math.min(1, Math.abs(dirN.dot(faceUp)))) * 180 / Math.PI;

  if (angleToRight < SNAP_THRESHOLD_DEG) {
    const s = dirN.dot(faceRight) >= 0 ? 1 : -1;
    return { point: start.clone().addScaledVector(faceRight, s * dist), snapped: true };
  }
  if (angleToUp < SNAP_THRESHOLD_DEG) {
    const s = dirN.dot(faceUp) >= 0 ? 1 : -1;
    return { point: start.clone().addScaledVector(faceUp, s * dist), snapped: true };
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

type SnapKind = 'corner' | 'face' | 'edge' | 'grid';

function nearestSnapPoint(
  worldPt: THREE.Vector3,
  members: MemberSnap[]
): { point: THREE.Vector3; kind: SnapKind; memberId?: string } | null {
  let best: THREE.Vector3 | null = null;
  let bestD = SNAP_RADIUS;
  let bestKind: SnapKind = 'grid';
  let bestMemberId: string | undefined;

  for (const m of members) {
    let w = m.width;
    for (const c of m.cuts) { if (c.type === 'ripCut' && c.targetWidth) w = c.targetWidth; }
    const hL = m.length / 2, hT = m.thickness / 2, hW = w / 2;

    const corners: [number, number, number][] = [
      [-hL,-hT,-hW],[-hL,-hT,hW],[-hL,hT,-hW],[-hL,hT,hW],
      [hL,-hT,-hW],[hL,-hT,hW],[hL,hT,-hW],[hL,hT,hW],
    ];
    const faceCenters: [number, number, number][] = [
      [-hL,0,0],[hL,0,0],[0,-hT,0],[0,hT,0],[0,0,-hW],[0,0,hW],
    ];
    const edgeMids: [number, number, number][] = [
      [0,-hT,-hW],[0,-hT,hW],[0,hT,-hW],[0,hT,hW],
      [-hL,0,-hW],[-hL,0,hW],[hL,0,-hW],[hL,0,hW],
      [-hL,-hT,0],[-hL,hT,0],[hL,-hT,0],[hL,hT,0],
    ];

    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(...(m.rotation as [number,number,number])));
    const pos = new THREE.Vector3(...m.position);

    const check = (lp: [number,number,number], kind: SnapKind) => {
      const wp = new THREE.Vector3(lp[0],lp[1],lp[2]).applyQuaternion(q).add(pos);
      const d = wp.distanceTo(worldPt);
      if (d < bestD) { bestD = d; best = wp; bestKind = kind; bestMemberId = m.id; }
    };

    for (const c of corners) check(c, 'corner');
    for (const f of faceCenters) check(f, 'face');
    for (const e of edgeMids) check(e, 'edge');
    check([0,0,0], 'face');
  }
  return best ? { point: best, kind: bestKind, memberId: bestMemberId } : null;
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

  const ndc    = useRef(new THREE.Vector2());
  const shiftRef = useRef(false);
  const rc     = useRef(new THREE.Raycaster());
  const startMemberIdRef = useRef<string | undefined>(undefined);
  const startFaceNormalRef = useRef<THREE.Vector3 | undefined>(undefined);
  const cursorFaceNormalRef = useRef<THREE.Vector3 | undefined>(undefined);

  // Work plane: set on first click, used to project second click
  const workPlaneNormalRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 1, 0));
  const workPlaneOriginRef = useRef<THREE.Vector3 | null>(null);

  const [cursor, setCursor] = useState<THREE.Vector3 | null>(null);
  const [cursorKind, setCursorKind] = useState<SnapKind>('grid');
  const cursorRef = useRef<THREE.Vector3 | null>(null);
  const cursorKindRef = useRef<SnapKind>('grid');
  const cursorMemberIdRef = useRef<string | undefined>(undefined);

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
        // First click — set work plane from face normal
        const faceNorm = cursorFaceNormalRef.current?.clone() ?? new THREE.Vector3(0, 1, 0);
        workPlaneNormalRef.current = faceNorm;
        workPlaneOriginRef.current = pt.clone();
        setMeasureStartPoint({ x: pt.x, y: pt.y, z: pt.z });
        startMemberIdRef.current = cursorMemberIdRef.current;
        startFaceNormalRef.current = faceNorm.clone();
      } else {
        const sv = new THREE.Vector3(start.x, start.y, start.z);
        const wn = workPlaneNormalRef.current;
        const { point: end } = snapOnPlane(sv, pt, wn, e.shiftKey);

        // Always anchor to the first-clicked board (if it was a board hit)
        const anchorId = startMemberIdRef.current;
        let anchorMemberId: string | undefined;
        let localStart: { x: number; y: number; z: number } | undefined;
        let localEnd: { x: number; y: number; z: number } | undefined;
        let localFaceNormal: { x: number; y: number; z: number } | undefined;

        if (anchorId) {
          const anchor = members.find((m) => m.id === anchorId);
          if (anchor) {
            anchorMemberId = anchorId;
            const mat = new THREE.Matrix4().compose(
              new THREE.Vector3(...anchor.position),
              new THREE.Quaternion().setFromEuler(new THREE.Euler(...anchor.rotation)),
              new THREE.Vector3(1, 1, 1)
            );
            const inv = mat.clone().invert();
            const ls = sv.clone().applyMatrix4(inv);
            const le = end.clone().applyMatrix4(inv);
            localStart = { x: ls.x, y: ls.y, z: ls.z };
            localEnd = { x: le.x, y: le.y, z: le.z };
            // Transform face normal to local space
            const localN = wn.clone().transformDirection(inv);
            localFaceNormal = { x: localN.x, y: localN.y, z: localN.z };
          }
        }

        addDimensionLine({
          id: crypto.randomUUID(),
          startPoint: { x: sv.x, y: sv.y, z: sv.z },
          endPoint:   { x: end.x, y: end.y, z: end.z },
          angleDegrees: Math.round(angleDeg(sv, end)),
          anchorMemberId,
          localStart,
          localEnd,
          faceNormal: { x: wn.x, y: wn.y, z: wn.z },
          localFaceNormal,
        });
        setMeasureStartPoint(null);
        startMemberIdRef.current = undefined;
        startFaceNormalRef.current = undefined;
        workPlaneOriginRef.current = null;
      }
    }

    const canvas = gl.domElement;
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('click', onClick);
    return () => {
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('click', onClick);
    };
  }, [activeTool, gl, setMeasureStartPoint, addDimensionLine, members]);

  useFrame(() => {
    if (activeTool !== 'measure') return;

    boardMeshesRef.current = [];
    scene.traverse((obj) => {
      if (obj instanceof THREE.Mesh && obj.userData.memberId) {
        boardMeshesRef.current.push(obj);
      }
    });

    rc.current.setFromCamera(ndc.current, camera);

    let hitPt: THREE.Vector3 | null = null;
    let snapKind: SnapKind = 'grid';
    let snapMemberId: string | undefined;

    const hits = rc.current.intersectObjects(boardMeshesRef.current, true);
    if (hits.length > 0) {
      hitPt = hits[0].point.clone();
      if (hits[0].face) {
        const worldNormal = hits[0].face.normal.clone()
          .transformDirection(hits[0].object.matrixWorld)
          .normalize();
        cursorFaceNormalRef.current = worldNormal;
      } else {
        cursorFaceNormalRef.current = undefined;
      }
      // For move meshes (hit by member id), track which member
      const meshMemberId = hits[0].object.userData.memberId as string | undefined;
      if (!cursorMemberIdRef.current || meshMemberId) {
        cursorMemberIdRef.current = meshMemberId;
      }
    } else {
      cursorFaceNormalRef.current = undefined;
      const fp = new THREE.Vector3();
      if (rc.current.ray.intersectPlane(FLOOR, fp)) hitPt = fp;
      cursorMemberIdRef.current = undefined;
    }

    // If work plane is established (first click done), project cursor onto it
    if (hitPt && workPlaneOriginRef.current && measureStartPoint) {
      hitPt = projectOntoPlane(hitPt, workPlaneOriginRef.current, workPlaneNormalRef.current);
    }

    if (hitPt) {
      const snap = nearestSnapPoint(hitPt, members);
      if (snap) {
        hitPt = snap.point;
        snapKind = snap.kind;
        if (!measureStartPoint) snapMemberId = snap.memberId;
      }
    }

    cursorRef.current = hitPt;
    cursorKindRef.current = snapKind;
    if (!measureStartPoint) cursorMemberIdRef.current = snapMemberId;

    setCursor(hitPt ? hitPt.clone() : null);
    setCursorKind(snapKind);
  });

  if (activeTool !== 'measure') return null;

  const startVec = measureStartPoint
    ? new THREE.Vector3(measureStartPoint.x, measureStartPoint.y, measureStartPoint.z)
    : null;

  const wn = workPlaneNormalRef.current;
  const { point: snappedCursor, snapped: lineSnapped } =
    startVec && cursor
      ? snapOnPlane(startVec, cursor, wn, shiftRef.current)
      : { point: cursor, snapped: false };

  // Offset along face normal for the live preview line
  const OFFSET = 0.05;
  const livePoints: [number, number, number][] = startVec && snappedCursor
    ? [
        [startVec.x + wn.x * OFFSET, startVec.y + wn.y * OFFSET, startVec.z + wn.z * OFFSET],
        [snappedCursor.x + wn.x * OFFSET, snappedCursor.y + wn.y * OFFSET, snappedCursor.z + wn.z * OFFSET],
      ]
    : [];

  const liveDist  = startVec && snappedCursor ? startVec.distanceTo(snappedCursor) : 0;
  const midPt     = startVec && snappedCursor
    ? new THREE.Vector3(
        (startVec.x + snappedCursor.x) / 2 + wn.x * 0.25,
        (startVec.y + snappedCursor.y) / 2 + wn.y * 0.25,
        (startVec.z + snappedCursor.z) / 2 + wn.z * 0.25
      )
    : null;

  const lineColor = lineSnapped ? AMBER_BRIGHT : AMBER;

  const cursorColor =
    cursorKind === 'edge' || cursorKind === 'corner' ? BLUE :
    startVec ? (cursorKind !== 'grid' ? AMBER_BRIGHT : AMBER) :
    (cursorKind !== 'grid' ? GREEN_BRIGHT : GREEN);

  return (
    <>
      {startVec && (
        <mesh position={[startVec.x + wn.x * OFFSET, startVec.y + wn.y * OFFSET, startVec.z + wn.z * OFFSET]}>
          <sphereGeometry args={[0.18, 12, 12]} />
          <meshBasicMaterial color={GREEN} />
        </mesh>
      )}

      {livePoints.length === 2 && (
        <Line points={livePoints} color={lineColor} lineWidth={2} dashed dashSize={0.35} gapSize={0.18} />
      )}

      {cursor && (
        <mesh position={[cursor.x, cursor.y, cursor.z]}>
          <sphereGeometry args={[cursorKind !== 'grid' ? 0.18 : 0.11, 10, 10]} />
          <meshBasicMaterial color={cursorColor} transparent opacity={0.85} />
        </mesh>
      )}

      {midPt && liveDist > 0.05 && (
        <Html position={[midPt.x, midPt.y, midPt.z]} center zIndexRange={[0, 10]}>
          <div className="px-2 py-0.5 rounded-full text-xs font-semibold text-white pointer-events-none select-none whitespace-nowrap"
            style={{ background:'rgba(24,24,27,0.92)', border:`1px solid ${lineColor}` }}>
            {liveDist.toFixed(2)}&quot;
          </div>
        </Html>
      )}
    </>
  );
}
