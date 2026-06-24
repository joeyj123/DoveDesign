import * as THREE from 'three';
import type { WoodMember } from '../types';
import { getMemberWorldBox, getBoxFaces } from './bounds';

/**
 * Trim target member so its nearest end aligns to the closest face of the boundary member.
 */
export function trimToBoundary(
  target: WoodMember,
  boundary: WoodMember
): Partial<WoodMember> | null {
  const boundaryBox = getMemberWorldBox(boundary);
  const boundaryFaces = getBoxFaces(boundaryBox);

  const targetCenter = new THREE.Vector3(...target.position);
  let closestFace = boundaryFaces[0];
  let closestDist = Infinity;

  for (const face of boundaryFaces) {
    const dist = Math.abs(
      face.axis === 'x'
        ? targetCenter.x - face.value
        : face.axis === 'y'
          ? targetCenter.y - face.value
          : targetCenter.z - face.value
    );
    if (dist < closestDist) {
      closestDist = dist;
      closestFace = face;
    }
  }

  // Trim along length axis (local X → world via rotation)
  const euler = new THREE.Euler(...target.rotation);
  const lengthAxis = new THREE.Vector3(1, 0, 0).applyEuler(euler);
  const halfLen = target.length / 2;

  const endPos = targetCenter.clone().add(lengthAxis.clone().multiplyScalar(halfLen));
  const startPos = targetCenter.clone().add(lengthAxis.clone().multiplyScalar(-halfLen));

  const faceNormal = closestFace.normal;
  const facePoint = new THREE.Vector3();
  if (closestFace.axis === 'x') facePoint.set(closestFace.value, 0, 0);
  else if (closestFace.axis === 'y') facePoint.set(0, closestFace.value, 0);
  else facePoint.set(0, 0, closestFace.value);

  const endDist = Math.abs(endPos.dot(faceNormal) - facePoint.dot(faceNormal));
  const startDist = Math.abs(startPos.dot(faceNormal) - facePoint.dot(faceNormal));
  const trimFromEnd = endDist < startDist;

  const trimAmount = Math.min(trimFromEnd ? endDist : startDist, target.length - 1);
  if (trimAmount <= 0) return null;

  const newLength = target.length - trimAmount;
  const shift = lengthAxis.clone().multiplyScalar(trimAmount / 2 * (trimFromEnd ? -1 : 1));
  const newPos = targetCenter.add(shift);

  return {
    length: Math.max(1, newLength),
    position: [newPos.x, newPos.y, newPos.z],
  };
}

/**
 * Extend target member so its nearest end reaches the closest face of the boundary member.
 */
export function extendToBoundary(
  target: WoodMember,
  boundary: WoodMember
): Partial<WoodMember> | null {
  const boundaryBox = getMemberWorldBox(boundary);
  const boundaryFaces = getBoxFaces(boundaryBox);

  const targetCenter = new THREE.Vector3(...target.position);
  const euler = new THREE.Euler(...target.rotation);
  const lengthAxis = new THREE.Vector3(1, 0, 0).applyEuler(euler);
  const halfLen = target.length / 2;

  const endPos = targetCenter.clone().add(lengthAxis.clone().multiplyScalar(halfLen));
  const startPos = targetCenter.clone().add(lengthAxis.clone().multiplyScalar(-halfLen));

  let bestExtend = 0;
  let extendFromEnd = true;

  for (const face of boundaryFaces) {
    const faceVal = face.value;

    for (const [fromEnd, point] of [[true, endPos], [false, startPos]] as const) {
      const axisIdx = face.axis === 'x' ? 0 : face.axis === 'y' ? 1 : 2;
      const gap = fromEnd
        ? faceVal - point.getComponent(axisIdx)
        : point.getComponent(axisIdx) - faceVal;

      if (gap > 0.25 && gap > bestExtend) {
        bestExtend = gap;
        extendFromEnd = fromEnd;
      }
    }
  }

  if (bestExtend <= 0) return null;

  const newLength = target.length + bestExtend;
  const shift = lengthAxis.clone().multiplyScalar(bestExtend / 2 * (extendFromEnd ? 1 : -1));
  const newPos = targetCenter.add(shift);

  return {
    length: newLength,
    position: [newPos.x, newPos.y, newPos.z],
  };
}
