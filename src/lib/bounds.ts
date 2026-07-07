import * as THREE from 'three';
import type { WoodMember } from '../types';

const _box = new THREE.Box3();
const _mesh = new THREE.Mesh();

/** World-space axis-aligned bounding box for a member. */
export function getMemberWorldBox(member: WoodMember): THREE.Box3 {
  const geo = new THREE.BoxGeometry(member.length, member.thickness, member.width);
  _mesh.geometry = geo;
  _mesh.position.set(member.position[0], member.position[1], member.position[2]);
  _mesh.rotation.set(member.rotation[0], member.rotation[1], member.rotation[2]);
  _mesh.updateMatrixWorld(true);
  _box.setFromObject(_mesh);
  geo.dispose();
  return _box.clone();
}

export interface FacePlane {
  axis: 'x' | 'y' | 'z';
  value: number;
  normal: THREE.Vector3;
}

export function getBoxFaces(box: THREE.Box3): FacePlane[] {
  return [
    { axis: 'x', value: box.min.x, normal: new THREE.Vector3(-1, 0, 0) },
    { axis: 'x', value: box.max.x, normal: new THREE.Vector3(1, 0, 0) },
    { axis: 'y', value: box.min.y, normal: new THREE.Vector3(0, -1, 0) },
    { axis: 'y', value: box.max.y, normal: new THREE.Vector3(0, 1, 0) },
    { axis: 'z', value: box.min.z, normal: new THREE.Vector3(0, 0, -1) },
    { axis: 'z', value: box.max.z, normal: new THREE.Vector3(0, 0, 1) },
  ];
}

/**
 * Finds an open spot near the origin for a newly-created board so it doesn't spawn
 * stacked on top of existing boards. Walks outward along +X in fixed steps and uses
 * an AABB overlap check against existing members.
 */
export function findOpenSpawnPosition(
  existingMembers: WoodMember[],
  newBoardSize: [number, number, number]
): [number, number, number] {
  const GRID_STEP = 6;
  const maxAttempts = 50;
  const [length, thickness, width] = newBoardSize;
  const candidateMember = (x: number): WoodMember =>
    ({
      position: [x, thickness / 2, 0],
      rotation: [0, 0, 0],
      length,
      thickness,
      width,
    }) as WoodMember;

  let offset = 0;
  for (let i = 0; i < maxAttempts; i++) {
    const box = getMemberWorldBox(candidateMember(offset));
    const overlaps = existingMembers.some((m) => box.intersectsBox(getMemberWorldBox(m)));
    if (!overlaps) return [offset, thickness / 2, 0];
    offset += GRID_STEP;
  }
  return [offset, thickness / 2, 0];
}

/**
 * Data Flow Pipeline: Grid-as-floor collision (New Order 2.4)
 * INPUT: a candidate Y position for a member's center, and that member's
 *   thickness (the only two numbers that determine where its bottom face
 *   sits — length/width/rotation-about-Y don't affect vertical extent for
 *   the flat orientation this app currently supports).
 * CALCULATION: the board's bottom face is at (y - thickness / 2). The grid
 *   floor is the fixed world plane y = 0 (Viewport.tsx's <Grid>, centered on
 *   the origin, never moves). The board may never be dragged so its bottom
 *   passes below that plane, so the minimum legal center height is
 *   thickness / 2 — a plain clamp, not a physics/CSG collision.
 * OUTPUT: a Y value >= thickness / 2, otherwise passed through unchanged
 *   (a board can still be lifted arbitrarily far above the floor).
 * FOLLOWS-BOARD CHECK: n/a — this is a pure function of the two inputs
 *   above; callers (MoveGizmo.tsx) re-apply it fresh on every drag frame
 *   and on commit, so it can never be "worked around" by any caller.
 */
export function clampFloorY(y: number, thickness: number): number {
  return Math.max(y, thickness / 2);
}

const SNAP_THRESHOLD = 0.5;

/**
 * Snap position so member faces align flush with nearest neighbor within threshold.
 */
export function snapMemberPosition(
  member: WoodMember,
  position: [number, number, number],
  others: WoodMember[]
): [number, number, number] {
  const pos = new THREE.Vector3(...position);
  const myBox = getMemberWorldBox({ ...member, position });
  const mySize = myBox.getSize(new THREE.Vector3());
  const half = mySize.clone().multiplyScalar(0.5);
  const myCenter = pos.clone();

  let bestDelta = new THREE.Vector3();
  let bestDist = SNAP_THRESHOLD;

  for (const other of others) {
    if (other.id === member.id) continue;
    const otherBox = getMemberWorldBox(other);
    const otherFaces = getBoxFaces(otherBox);

    const myFaces = [
      { axis: 0, sign: -1, myVal: myCenter.x - half.x, otherIdx: [1] },
      { axis: 0, sign: 1,  myVal: myCenter.x + half.x, otherIdx: [0] },
      { axis: 1, sign: -1, myVal: myCenter.y - half.y, otherIdx: [3] },
      { axis: 1, sign: 1,  myVal: myCenter.y + half.y, otherIdx: [2] },
      { axis: 2, sign: -1, myVal: myCenter.z - half.z, otherIdx: [5] },
      { axis: 2, sign: 1,  myVal: myCenter.z + half.z, otherIdx: [4] },
    ] as const;

    for (const mf of myFaces) {
      for (const oi of mf.otherIdx) {
        const of = otherFaces[oi];
        const axisKey = ['x', 'y', 'z'][mf.axis] as 'x' | 'y' | 'z';
        if (of.axis !== axisKey) continue;
        const gap = of.value - mf.myVal;
        if (Math.abs(gap) < bestDist) {
          bestDist = Math.abs(gap);
          bestDelta.set(0, 0, 0);
          bestDelta.setComponent(mf.axis, gap);
        }
      }
    }
  }

  if (bestDist < SNAP_THRESHOLD) {
    pos.add(bestDelta);
  }
  return [pos.x, pos.y, pos.z];
}
