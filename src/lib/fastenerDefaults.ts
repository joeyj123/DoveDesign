import * as THREE from 'three';
import type { Fastener, JoinMethod, MemberMate, WoodMember } from '../types';
import {
  getFaceHalfExtents,
  getFaceNormal,
  getFacePointWorld,
  snapToGrid,
} from './mating';

const NO_VISUAL: JoinMethod[] = ['Unset', 'Glue', 'Mortise & Tenon'];

/** Place two default fasteners along the mated face after a join method is chosen. */
export function createDefaultFastenersForMate(
  mate: MemberMate,
  memberA: WoodMember,
  method: JoinMethod
): Fastener[] {
  if (NO_VISUAL.includes(method)) return [];

  const face = mate.faceA;
  const { halfU } = getFaceHalfExtents(memberA, face);
  const offsets: [number, number, number][] = [
    [snapToGrid(-halfU * 0.33), 0, 0],
    [snapToGrid(halfU * 0.33), 0, 0],
  ];

  return offsets.map((offset) => {
    const world = getFacePointWorld(memberA, face, offset);
    const normal = getFaceNormal(memberA, face);
    const quat = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      normal
    );
    const euler = new THREE.Euler().setFromQuaternion(quat);
    return {
      id: crypto.randomUUID(),
      mateId: mate.id,
      position: [world.x, world.y, world.z] as [number, number, number],
      rotation: [euler.x, euler.y, euler.z] as [number, number, number],
      type: method,
    };
  });
}
