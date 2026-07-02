import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useThree, useFrame } from '@react-three/fiber';
import { Line, Html } from '@react-three/drei';
import { useAppStore } from '../store';
import { CADGeometryEngine, migrateWoodMemberToSolidBoard } from '../core/Engine';
import type { FaceId } from '../types';

const AMBER = '#F59E0B';
const AMBER_BRIGHT = '#FCD34D';
const GREEN = '#22c55e';
const BLUE = '#3b82f6';
const YELLOW_BRIGHT = '#FDE047';
const GRAY = '#9ca3af';
// Per Phase 18 FIX 2 (VECTOR_PROJECTION_MATH.md section 5 recommends
// 1.0-1.5 world units) — 0.5" was too tight to reliably land on an edge,
// especially the narrower width edges, forcing users to zoom in and eyeball it.
const SNAP_RADIUS = 1.0;
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

// Clamp a point to the bounding rectangle of the given face of `anchor`, so the
// preview/end point never wanders off the board onto the grid.
function clampToFaceBounds(
  point: THREE.Vector3,
  anchor: MemberSnap,
  worldNormal: THREE.Vector3
): THREE.Vector3 {
  const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(...anchor.rotation));
  const invQ = q.clone().invert();
  const pos = new THREE.Vector3(...anchor.position);
  const local = point.clone().sub(pos).applyQuaternion(invQ);

  const hL = anchor.length / 2, hT = anchor.thickness / 2;
  let w = anchor.width;
  for (const c of anchor.cuts) { if (c.type === 'ripCut' && c.targetWidth) w = c.targetWidth; }
  const hW = w / 2;

  const localN = worldNormal.clone().applyQuaternion(invQ).normalize();
  const ax = Math.abs(localN.x), ay = Math.abs(localN.y), az = Math.abs(localN.z);

  if (ax >= ay && ax >= az) {
    local.y = THREE.MathUtils.clamp(local.y, -hT, hT);
    local.z = THREE.MathUtils.clamp(local.z, -hW, hW);
  } else if (ay >= ax && ay >= az) {
    local.x = THREE.MathUtils.clamp(local.x, -hL, hL);
    local.z = THREE.MathUtils.clamp(local.z, -hW, hW);
  } else {
    local.x = THREE.MathUtils.clamp(local.x, -hL, hL);
    local.y = THREE.MathUtils.clamp(local.y, -hT, hT);
  }

  return local.applyQuaternion(q).add(pos);
}

type MemberSnap = {
  id: string;
  position: [number, number, number];
  rotation: [number, number, number];
  length: number; thickness: number; width: number;
  cuts: { type: string; targetWidth?: number }[];
};

type SnapKind = 'corner' | 'face' | 'edge' | 'grid';

// Each candidate snap point (corner/edge-mid/face-center) is tagged with the
// LOCAL-space normal of the face it actually lives on, so that overriding the
// raw raycast hit point with a snapped point can also correctly override the
// face normal used for the measurement's work plane. Per CAD_MANIFESTO.md Law
// 4 (Vector Isolation Rule) — this is the actual root cause of Phase 17 Part
// 2's "cross-axis dimension lines don't follow / are awkward to place" bug:
// previously the work-plane normal was captured ONLY from the raw raycast hit
// and never updated when the snap system relocated the click point, so a
// click that snapped to a corner or edge (very common when measuring a
// board's narrow width, since the snap radius easily reaches an edge) could
// silently anchor the dimension line's face-relative (u,v) data to the WRONG
// face — wrong uAxis/vAxis, so the line doesn't track the board correctly.
// Phase 20 rewrite (from-scratch trace of the cross-axis snap bug): the old
// system only offered 26 DISCRETE candidates — corners, edge MIDPOINTS, and
// face centers. Measuring a board's width at any station along its length
// means clicking a long edge far from that edge's midpoint, so width clicks
// had NO candidate within the snap radius and never snapped — while length
// measurements worked because the board-end corners are candidates. Edges are
// now true SEGMENTS: the candidate is the closest point anywhere along each
// of the 12 edges, so a width measurement snaps to both long edges at any
// station. Corners take priority within their own tighter radius (a corner
// always lies on three edges, so edges would otherwise always shadow them).
function nearestSnapPoint(
  worldPt: THREE.Vector3,
  members: MemberSnap[]
): { point: THREE.Vector3; kind: SnapKind; memberId?: string; localNormal?: THREE.Vector3 } | null {
  const CORNER_RADIUS = 0.75;

  let bestCorner: { point: THREE.Vector3; d: number; memberId: string; n: THREE.Vector3 } | null = null;
  let bestEdge: { point: THREE.Vector3; d: number; memberId: string; n: THREE.Vector3 } | null = null;
  let bestFace: { point: THREE.Vector3; d: number; memberId: string; n: THREE.Vector3 } | null = null;

  const tmp = new THREE.Vector3();

  for (const m of members) {
    let w = m.width;
    for (const c of m.cuts) { if (c.type === 'ripCut' && c.targetWidth) w = c.targetWidth; }
    const hL = m.length / 2, hT = m.thickness / 2, hW = w / 2;

    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(...(m.rotation as [number, number, number])));
    const pos = new THREE.Vector3(...m.position);
    const toWorld = (x: number, y: number, z: number) =>
      new THREE.Vector3(x, y, z).applyQuaternion(q).add(pos);

    // 8 corners — tagged with the top/bottom face by default; onClick
    // re-derives the best face against the work plane once known.
    for (const sx of [-1, 1]) for (const sy of [-1, 1]) for (const sz of [-1, 1]) {
      const wp = toWorld(sx * hL, sy * hT, sz * hW);
      const d = wp.distanceTo(worldPt);
      if (d < CORNER_RADIUS && (!bestCorner || d < bestCorner.d)) {
        bestCorner = { point: wp, d, memberId: m.id, n: new THREE.Vector3(0, sy, 0) };
      }
    }

    // 12 edges as SEGMENTS — closest point on each segment. Each edge is
    // tagged with a representative adjacent face normal (local space).
    const edges: { a: [number, number, number]; b: [number, number, number]; n: [number, number, number] }[] = [
      // 4 length-running edges (top/bottom long edges) — tag top/bottom face
      { a: [-hL, -hT, -hW], b: [hL, -hT, -hW], n: [0, -1, 0] },
      { a: [-hL, -hT, hW], b: [hL, -hT, hW], n: [0, -1, 0] },
      { a: [-hL, hT, -hW], b: [hL, hT, -hW], n: [0, 1, 0] },
      { a: [-hL, hT, hW], b: [hL, hT, hW], n: [0, 1, 0] },
      // 4 width-running edges (board ends) — tag top/bottom face
      { a: [-hL, -hT, -hW], b: [-hL, -hT, hW], n: [0, -1, 0] },
      { a: [-hL, hT, -hW], b: [-hL, hT, hW], n: [0, 1, 0] },
      { a: [hL, -hT, -hW], b: [hL, -hT, hW], n: [0, -1, 0] },
      { a: [hL, hT, -hW], b: [hL, hT, hW], n: [0, 1, 0] },
      // 4 thickness-running edges (vertical at board ends) — tag end face
      { a: [-hL, -hT, -hW], b: [-hL, hT, -hW], n: [-1, 0, 0] },
      { a: [-hL, -hT, hW], b: [-hL, hT, hW], n: [-1, 0, 0] },
      { a: [hL, -hT, -hW], b: [hL, hT, -hW], n: [1, 0, 0] },
      { a: [hL, -hT, hW], b: [hL, hT, hW], n: [1, 0, 0] },
    ];
    for (const edge of edges) {
      const A = toWorld(edge.a[0], edge.a[1], edge.a[2]);
      const B = toWorld(edge.b[0], edge.b[1], edge.b[2]);
      const seg = tmp.copy(B).sub(A);
      const len2 = seg.lengthSq();
      if (len2 < 1e-8) continue;
      const t = THREE.MathUtils.clamp(worldPt.clone().sub(A).dot(seg) / len2, 0, 1);
      const cp = A.clone().addScaledVector(seg, t);
      const d = cp.distanceTo(worldPt);
      if (d < SNAP_RADIUS && (!bestEdge || d < bestEdge.d)) {
        bestEdge = { point: cp, d, memberId: m.id, n: new THREE.Vector3(edge.n[0], edge.n[1], edge.n[2]) };
      }
    }

    // 6 face centers (+ board center) — unambiguous, one face each
    const faceCenters: { lp: [number, number, number]; n: [number, number, number] }[] = [
      { lp: [-hL, 0, 0], n: [-1, 0, 0] },
      { lp: [hL, 0, 0], n: [1, 0, 0] },
      { lp: [0, -hT, 0], n: [0, -1, 0] },
      { lp: [0, hT, 0], n: [0, 1, 0] },
      { lp: [0, 0, -hW], n: [0, 0, -1] },
      { lp: [0, 0, hW], n: [0, 0, 1] },
      { lp: [0, 0, 0], n: [0, 1, 0] },
    ];
    for (const fc of faceCenters) {
      const wp = toWorld(fc.lp[0], fc.lp[1], fc.lp[2]);
      const d = wp.distanceTo(worldPt);
      if (d < SNAP_RADIUS && (!bestFace || d < bestFace.d)) {
        bestFace = { point: wp, d, memberId: m.id, n: new THREE.Vector3(fc.n[0], fc.n[1], fc.n[2]) };
      }
    }
  }

  // Priority: corner (tight radius) > face center > edge. Face centers beat
  // edges when both are in range because a face-center candidate is also
  // always near two edge segments on narrow faces.
  const pick = bestCorner ?? (bestFace && (!bestEdge || bestFace.d <= bestEdge.d) ? bestFace : bestEdge) ?? bestFace;
  if (!pick) return null;
  const kind: SnapKind = pick === bestCorner ? 'corner' : pick === bestFace ? 'face' : 'edge';
  return { point: pick.point, kind, memberId: pick.memberId, localNormal: pick.n };
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
        let anchorFaceId: FaceId | undefined;
        let startUV: { u: number; v: number } | undefined;
        let endUV: { u: number; v: number } | undefined;

        if (anchorId) {
          const anchorMember = members.find((m) => m.id === anchorId);
          if (anchorMember) {
            anchorMemberId = anchorId;
            const mat = new THREE.Matrix4().compose(
              new THREE.Vector3(...anchorMember.position),
              new THREE.Quaternion().setFromEuler(new THREE.Euler(...anchorMember.rotation)),
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

            // Per VECTOR_PROJECTION_MATH.md Rule B: forward-project the raw hit
            // points into (faceId, u, v) IMMEDIATELY, before storing anything.
            const board = migrateWoodMemberToSolidBoard({
              id: anchorMember.id,
              label: anchorMember.id,
              species: 'n/a',
              length: anchorMember.length,
              thickness: anchorMember.thickness,
              width: anchorMember.width,
              position: anchorMember.position,
              rotation: anchorMember.rotation,
            });
            let bestFace = board.faces[0];
            let bestDot = -Infinity;
            for (const f of board.faces) {
              const d = f.normal.x * localN.x + f.normal.y * localN.y + f.normal.z * localN.z;
              if (d > bestDot) { bestDot = d; bestFace = f; }
            }
            anchorFaceId = bestFace.id as FaceId;
            const rawStartUV = CADGeometryEngine.projectLocalToUV(bestFace, { x: ls.x, y: ls.y, z: ls.z });
            const rawEndUV = CADGeometryEngine.projectLocalToUV(bestFace, { x: le.x, y: le.y, z: le.z });
            startUV = CADGeometryEngine.clampUV(bestFace, rawStartUV.u, rawStartUV.v);
            endUV = CADGeometryEngine.clampUV(bestFace, rawEndUV.u, rawEndUV.v);
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
          anchorFaceId,
          startUV,
          endUV,
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

    const onWorkPlane = !!(workPlaneOriginRef.current && measureStartPoint);
    const workPlane = onWorkPlane
      ? new THREE.Plane().setFromNormalAndCoplanarPoint(
          workPlaneNormalRef.current,
          workPlaneOriginRef.current!
        )
      : null;

    // Non-recursive: only test the parent board meshes, not CSG child objects
    const hits = rc.current.intersectObjects(boardMeshesRef.current, false);
    if (hits.length > 0) {
      hitPt = hits[0].point.clone();
      if (hits[0].face) {
        const normalMatrix = new THREE.Matrix3().getNormalMatrix(hits[0].object.matrixWorld);
        const worldNormal = hits[0].face.normal.clone().applyMatrix3(normalMatrix).normalize();
        cursorFaceNormalRef.current = worldNormal;
      } else {
        cursorFaceNormalRef.current = undefined;
      }
      cursorMemberIdRef.current = hits[0].object.userData.memberId as string | undefined;
    } else {
      cursorFaceNormalRef.current = undefined;
      cursorMemberIdRef.current = undefined;
      const fp = new THREE.Vector3();
      // Once a work plane is set, never fall through to the grid floor — stay on the plane
      if (workPlane) {
        if (rc.current.ray.intersectPlane(workPlane, fp)) hitPt = fp;
      } else if (rc.current.ray.intersectPlane(FLOOR, fp)) {
        hitPt = fp;
      }
    }

    // If work plane is established (first click done), project cursor onto it
    if (hitPt && workPlane) {
      hitPt = projectOntoPlane(hitPt, workPlaneOriginRef.current!, workPlaneNormalRef.current);
    }

    // Same snap check runs for both the first click and the second click (and every preview frame)
    if (hitPt) {
      const snap = nearestSnapPoint(hitPt, members);
      if (snap) {
        hitPt = snap.point;
        snapKind = snap.kind;
        snapMemberId = snap.memberId;
        // Phase 17 Part 2 fix: before the work plane is established (i.e. this
        // is the FIRST click), the snap point can relocate the click onto a
        // corner/edge that belongs to a different face than whatever the raw
        // raycast last hit (especially likely for a board's narrow width,
        // where the snap radius easily reaches an edge). Re-derive the work
        // plane normal from the snap's own tagged local-space face normal so
        // it always matches the point that actually gets stored, instead of
        // a stale raycast normal from a different face. This keeps the
        // forward-projection (faceId, u, v) correct at the source per
        // CAD_MANIFESTO.md Law 4 / VECTOR_PROJECTION_MATH.md Rule B.
        if (!onWorkPlane && snap.localNormal && snapMemberId) {
          const snapMember = members.find((m) => m.id === snapMemberId);
          if (snapMember) {
            const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(...snapMember.rotation));
            cursorFaceNormalRef.current = snap.localNormal.clone().applyQuaternion(q).normalize();
          }
        }
      } else if (onWorkPlane && startMemberIdRef.current) {
        // No snap target — clamp the preview to the clicked face's bounds instead of
        // letting it wander onto the grid or off the board entirely
        const anchor = members.find((m) => m.id === startMemberIdRef.current);
        if (anchor) {
          hitPt = clampToFaceBounds(hitPt, anchor, workPlaneNormalRef.current);
        }
      }
    }

    cursorRef.current = hitPt;
    cursorKindRef.current = snapKind;
    // Phase 20 FOLLOW-BUG FIX: this line previously overwrote the raycast-
    // derived member id with `undefined` whenever the cursor wasn't snapped —
    // so every free-placement first click stored NO anchor member, producing
    // a world-static dimension line with no (faceId, u, v) data. Width
    // measurements almost never snapped (see nearestSnapPoint note above), so
    // cross-axis lines were the ones that silently "didn't follow the board."
    // Keep the raycast member unless a snap moved the point to a DIFFERENT board.
    if (!measureStartPoint && snapMemberId) cursorMemberIdRef.current = snapMemberId;

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

  // Per Phase 18 FIX 2: identical color coding for BOTH the start and end
  // point, regardless of which face/edge it's on — face-center=green,
  // edge-midpoint=blue, corner=bright yellow, no snap (free placement)=gray.
  const cursorColor =
    cursorKind === 'corner' ? YELLOW_BRIGHT :
    cursorKind === 'edge' ? BLUE :
    cursorKind === 'face' ? GREEN :
    GRAY;

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
