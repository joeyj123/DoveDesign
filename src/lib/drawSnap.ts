import * as THREE from 'three';
import type { WoodMember, FaceId } from '../types';
import { getMemberWorldCorners } from './screenProjection';
import { worldPointToFaceOffset } from './mating';

export type SnapKind = 'corner' | 'edge-mid' | 'edge';

export interface DrawSnapResult {
  point: [number, number];
  kind: SnapKind;
  memberId: string;
  face: FaceId;
  offset: [number, number, number];
}

const SNAP_RADIUS = 0.5;

function distXZ(a: [number, number], b: [number, number]): number {
  return Math.hypot(a[0] - b[0], a[1] - b[1]);
}

function closestOnSegment(
  p: [number, number],
  a: [number, number],
  b: [number, number]
): [number, number] {
  const ax = a[0];
  const az = a[1];
  const bx = b[0];
  const bz = b[1];
  const dx = bx - ax;
  const dz = bz - az;
  const len2 = dx * dx + dz * dz;
  if (len2 < 1e-8) return a;
  let t = ((p[0] - ax) * dx + (p[1] - az) * dz) / len2;
  t = Math.max(0, Math.min(1, t));
  return [ax + t * dx, az + t * dz];
}

/** Bottom-footprint snap targets for edge chaining (corner > edge-mid > edge). */
export function findDrawSnapPoint(
  member: WoodMember,
  xz: [number, number],
  radius = SNAP_RADIUS
): DrawSnapResult | null {
  const corners3 = getMemberWorldCorners(member);
  const bottom = corners3
    .filter((c) => Math.abs(c.y - member.position[1] + member.thickness / 2) < 0.15)
    .map((c) => [c.x, c.z] as [number, number]);

  const uniqueCorners: [number, number][] = [];
  for (const c of bottom.length >= 4 ? bottom : corners3.map((c) => [c.x, c.z] as [number, number])) {
    if (!uniqueCorners.some((u) => distXZ(u, c) < 0.05)) uniqueCorners.push(c);
  }
  if (uniqueCorners.length < 3) {
    uniqueCorners.length = 0;
    for (const c of corners3) {
      const p: [number, number] = [c.x, c.z];
      if (!uniqueCorners.some((u) => distXZ(u, p) < 0.05)) uniqueCorners.push(p);
    }
  }

  let best: DrawSnapResult | null = null;
  let bestDist = radius;

  for (const corner of uniqueCorners) {
    const d = distXZ(xz, corner);
    if (d < bestDist) {
      bestDist = d;
      const face = pickNearestFace(member, corner);
      const offset = worldPointToFaceOffset(
        member,
        face,
        new THREE.Vector3(corner[0], member.position[1], corner[1])
      );
      best = {
        point: corner,
        kind: 'corner',
        memberId: member.id,
        face,
        offset,
      };
    }
  }

  const edges: [number, number][][] = [];
  for (let i = 0; i < uniqueCorners.length; i++) {
    const a = uniqueCorners[i];
    const b = uniqueCorners[(i + 1) % uniqueCorners.length];
    edges.push([a, b]);
  }

  for (const [a, b] of edges) {
    const mid: [number, number] = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    const dm = distXZ(xz, mid);
    if (dm < bestDist) {
      bestDist = dm;
      const face = pickNearestFace(member, mid);
      const offset = worldPointToFaceOffset(
        member,
        face,
        new THREE.Vector3(mid[0], member.position[1], mid[1])
      );
      best = { point: mid, kind: 'edge-mid', memberId: member.id, face, offset };
    }
  }

  for (const [a, b] of edges) {
    const closest = closestOnSegment(xz, a, b);
    const de = distXZ(xz, closest);
    if (de < bestDist) {
      bestDist = de;
      const face = pickNearestFace(member, closest);
      const offset = worldPointToFaceOffset(
        member,
        face,
        new THREE.Vector3(closest[0], member.position[1], closest[1])
      );
      best = { point: closest, kind: 'edge', memberId: member.id, face, offset };
    }
  }

  return best;
}

function pickNearestFace(member: WoodMember, xz: [number, number]): FaceId {
  const pos = new THREE.Vector3(...member.position);
  const local = new THREE.Vector3(xz[0], pos.y, xz[1]).sub(pos);
  const inv = getWorldQuaternion(member).invert();
  local.applyQuaternion(inv);
  const ax = Math.abs(local.x);
  const ay = Math.abs(local.y);
  const az = Math.abs(local.z);
  if (ax >= ay && ax >= az) return local.x >= 0 ? 'xMax' : 'xMin';
  if (ay >= ax && ay >= az) return local.y >= 0 ? 'yMax' : 'yMin';
  return local.z >= 0 ? 'zMax' : 'zMin';
}

function getWorldQuaternion(member: WoodMember): THREE.Quaternion {
  return new THREE.Quaternion().setFromEuler(new THREE.Euler(...member.rotation));
}
