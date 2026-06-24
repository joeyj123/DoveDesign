import * as THREE from 'three';
import type { WoodMember, EdgeTreatment } from '../types';

/** Local-space line segment for each of 12 box edges. */
export function getBoxEdgeSegment(
  member: WoodMember,
  edgeIndex: number
): [THREE.Vector3, THREE.Vector3] {
  const hl = member.length / 2;
  const ht = member.thickness / 2;
  const hw = member.width / 2;
  const edges: [THREE.Vector3, THREE.Vector3][] = [
    [new THREE.Vector3(-hl, -ht, -hw), new THREE.Vector3(hl, -ht, -hw)],
    [new THREE.Vector3(-hl, ht, -hw), new THREE.Vector3(hl, ht, -hw)],
    [new THREE.Vector3(-hl, -ht, hw), new THREE.Vector3(hl, -ht, hw)],
    [new THREE.Vector3(-hl, ht, hw), new THREE.Vector3(hl, ht, hw)],
    [new THREE.Vector3(-hl, -ht, -hw), new THREE.Vector3(-hl, ht, -hw)],
    [new THREE.Vector3(hl, -ht, -hw), new THREE.Vector3(hl, ht, -hw)],
    [new THREE.Vector3(-hl, -ht, hw), new THREE.Vector3(-hl, ht, hw)],
    [new THREE.Vector3(hl, -ht, hw), new THREE.Vector3(hl, ht, hw)],
    [new THREE.Vector3(-hl, -ht, -hw), new THREE.Vector3(-hl, -ht, hw)],
    [new THREE.Vector3(hl, -ht, -hw), new THREE.Vector3(hl, -ht, hw)],
    [new THREE.Vector3(-hl, ht, -hw), new THREE.Vector3(-hl, ht, hw)],
    [new THREE.Vector3(hl, ht, -hw), new THREE.Vector3(hl, ht, hw)],
  ];
  return edges[edgeIndex] ?? edges[0];
}

export function buildEdgeTreatmentSubtractions(
  member: WoodMember,
  treatments: EdgeTreatment[]
): { id: string; position: [number, number, number]; rotation: [number, number, number]; args: [number, number, number] }[] {
  const memberTreatments = treatments.filter((t) => t.memberId === member.id && t.type !== 'none');
  return memberTreatments.map((t) => {
    const [a, b] = getBoxEdgeSegment(member, t.edgeIndex);
    const mid = a.clone().add(b).multiplyScalar(0.5);
    const len = a.distanceTo(b);
    const depth = t.depth || t.radius || 0.125;
    const dir = b.clone().sub(a).normalize();
    const up = new THREE.Vector3(0, 1, 0);
    const quat = new THREE.Quaternion().setFromUnitVectors(up, dir);
    const e = new THREE.Euler().setFromQuaternion(quat);
    return {
      id: t.id,
      position: [mid.x, mid.y, mid.z],
      rotation: [e.x, e.y, e.z],
      args: [depth * 2, len, depth * 2] as [number, number, number],
    };
  });
}

/** Parallel edges share the same axis direction. */
export function getParallelEdgeIndices(edgeIndex: number): number[] {
  if (edgeIndex < 4) return [0, 1, 2, 3].filter((i) => (i < 2) === (edgeIndex < 2) || Math.floor(i / 2) === Math.floor(edgeIndex / 2));
  if (edgeIndex < 8) return [4, 5, 6, 7].filter((i) => i % 2 === edgeIndex % 2);
  return [8, 9, 10, 11].filter((i) => i % 2 === edgeIndex % 2);
}
