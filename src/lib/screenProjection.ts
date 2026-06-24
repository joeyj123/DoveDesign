import * as THREE from 'three';
import type { WoodMember } from '../types';

export interface ScreenBounds {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

/** World-space axis-aligned bounding box corners for a member OBB. */
export function getMemberWorldCorners(member: WoodMember): THREE.Vector3[] {
  const halfL = member.length / 2;
  const halfT = member.thickness / 2;
  const halfW = member.width / 2;
  const locals = [
    new THREE.Vector3(-halfL, -halfT, -halfW),
    new THREE.Vector3(halfL, -halfT, -halfW),
    new THREE.Vector3(-halfL, halfT, -halfW),
    new THREE.Vector3(halfL, halfT, -halfW),
    new THREE.Vector3(-halfL, -halfT, halfW),
    new THREE.Vector3(halfL, -halfT, halfW),
    new THREE.Vector3(-halfL, halfT, halfW),
    new THREE.Vector3(halfL, halfT, halfW),
  ];
  const e = new THREE.Euler(...member.rotation);
  const q = new THREE.Quaternion().setFromEuler(e);
  const pos = new THREE.Vector3(...member.position);
  return locals.map((v) => v.applyQuaternion(q).add(pos));
}

export function projectPointToScreen(
  point: THREE.Vector3,
  camera: THREE.Camera,
  width: number,
  height: number
): { x: number; y: number } {
  const v = point.clone().project(camera);
  return {
    x: ((v.x + 1) / 2) * width,
    y: ((-v.y + 1) / 2) * height,
  };
}

export function getMemberScreenBounds(
  member: WoodMember,
  camera: THREE.Camera,
  width: number,
  height: number
): ScreenBounds {
  const corners = getMemberWorldCorners(member);
  let left = Infinity;
  let top = Infinity;
  let right = -Infinity;
  let bottom = -Infinity;

  for (const c of corners) {
    const { x, y } = projectPointToScreen(c, camera, width, height);
    left = Math.min(left, x);
    top = Math.min(top, y);
    right = Math.max(right, x);
    bottom = Math.max(bottom, y);
  }

  return { left, top, right, bottom };
}
