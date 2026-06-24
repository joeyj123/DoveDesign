import * as THREE from 'three';
import type { WoodMember, FaceId, MemberMate } from '../types';
import {
  ALL_FACES,
  getFaceCenter,
  getFaceNormal,
  computeMateTransform,
} from './mating';

const FACE_TOLERANCE = 0.1;

export interface FacePairCandidate {
  memberAId: string;
  faceA: FaceId;
  memberBId: string;
  faceB: FaceId;
  gap: number;
}

/** Find face pairs within tolerance for selected members. */
export function findCloseFacePairs(
  members: WoodMember[],
  selectedIds: string[]
): FacePairCandidate[] {
  const selected = members.filter((m) => selectedIds.includes(m.id));
  const pairs: FacePairCandidate[] = [];

  for (let i = 0; i < selected.length; i++) {
    for (let j = i + 1; j < selected.length; j++) {
      const a = selected[i];
      const b = selected[j];
      for (const faceA of ALL_FACES) {
        const cA = getFaceCenter(a, faceA);
        const nA = getFaceNormal(a, faceA);
        for (const faceB of ALL_FACES) {
          const cB = getFaceCenter(b, faceB);
          const nB = getFaceNormal(b, faceB);
          const gap = Math.abs(cA.clone().sub(cB).dot(nA));
          const opposing = nA.dot(nB) < -0.85;
          if (opposing && gap <= FACE_TOLERANCE) {
            pairs.push({
              memberAId: a.id,
              faceA,
              memberBId: b.id,
              faceB,
              gap,
            });
          }
        }
      }
    }
  }

  pairs.sort((x, y) => x.gap - y.gap);
  const seen = new Set<string>();
  return pairs.filter((p) => {
    const key = [p.memberAId, p.faceA, p.memberBId, p.faceB].join('|');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function buildMateFromPair(
  members: WoodMember[],
  pair: FacePairCandidate
): { mate: MemberMate; memberBPatch: Partial<WoodMember> } | null {
  const a = members.find((m) => m.id === pair.memberAId);
  const b = members.find((m) => m.id === pair.memberBId);
  if (!a || !b) return null;
  const patch = computeMateTransform(a, pair.faceA, b, pair.faceB);
  const mate: MemberMate = {
    id: crypto.randomUUID(),
    memberAId: a.id,
    memberBId: b.id,
    faceA: pair.faceA,
    faceB: pair.faceB,
    joinMethod: 'Unset',
  };
  return { mate, memberBPatch: patch };
}

/** Offset member B slightly for a lap joint overlap along face normal. */
export function lapJointPatch(
  memberA: WoodMember,
  faceA: FaceId,
  memberB: WoodMember,
  faceB: FaceId,
  overlapIn = 0.75
): Partial<WoodMember> {
  const base = computeMateTransform(memberA, faceA, memberB, faceB);
  const n = getFaceNormal(memberA, faceA);
  const pos = new THREE.Vector3(...(base.position ?? memberB.position));
  pos.add(n.clone().multiplyScalar(-overlapIn));
  return { ...base, position: [pos.x, pos.y, pos.z] };
}
