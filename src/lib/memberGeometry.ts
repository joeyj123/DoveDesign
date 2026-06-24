import * as THREE from 'three';
import type { WoodMember } from '../types';

/** Build a centered footprint shape from world XZ polygon vertices. */
export function buildCustomPolygonShape(points: [number, number][]): THREE.Shape {
  const [cx, cz] = computePolygonCentroid(points);
  const shape = new THREE.Shape();
  points.forEach(([x, z], i) => {
    const sx = x - cx;
    const sz = z - cz;
    if (i === 0) shape.moveTo(sx, sz);
    else shape.lineTo(sx, sz);
  });
  shape.closePath();
  return shape;
}

export function computePolygonCentroid(points: [number, number][]): [number, number] {
  const cx = points.reduce((s, p) => s + p[0], 0) / points.length;
  const cz = points.reduce((s, p) => s + p[1], 0) / points.length;
  return [cx, cz];
}

export function computePolygonBBox(points: [number, number][]): { length: number; width: number } {
  let minX = Infinity;
  let maxX = -Infinity;
  let minZ = Infinity;
  let maxZ = -Infinity;
  for (const [x, z] of points) {
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minZ = Math.min(minZ, z);
    maxZ = Math.max(maxZ, z);
  }
  return { length: Math.max(maxX - minX, 0.5), width: Math.max(maxZ - minZ, 0.5) };
}

function finalizeExtrudedFootprint(geo: THREE.ExtrudeGeometry, thickness: number): THREE.BufferGeometry {
  geo.rotateX(-Math.PI / 2);
  geo.translate(0, -thickness / 2, 0);
  geo.computeVertexNormals();
  return geo;
}

export function createMemberBaseGeometry(member: WoodMember): THREE.BufferGeometry {
  const shapeType = member.shapeType ?? 'box';
  switch (shapeType) {
    case 'cylinder': {
      const r = member.radius ?? member.width / 2;
      return new THREE.CylinderGeometry(r, r, member.length, 24);
    }
    case 'sphere':
      return new THREE.SphereGeometry(member.radius ?? member.width / 2, 24, 16);
    case 'cone': {
      const r = member.radius ?? member.width / 2;
      return new THREE.CylinderGeometry(0, r, member.length, 24);
    }
    case 'triangularPrism':
      return new THREE.CylinderGeometry(member.width / 2, member.width / 2, member.length, 3);
    case 'hexagonalPrism':
      return new THREE.CylinderGeometry(member.width / 2, member.width / 2, member.length, 6);
    case 'customPolygon': {
      if (member.polygonPoints && member.polygonPoints.length >= 3) {
        const shape = buildCustomPolygonShape(member.polygonPoints);
        return finalizeExtrudedFootprint(
          new THREE.ExtrudeGeometry(shape, { depth: member.thickness, bevelEnabled: false }),
          member.thickness
        );
      }
      return new THREE.BoxGeometry(member.length, member.thickness, member.width);
    }
    default:
      return new THREE.BoxGeometry(member.length, member.thickness, member.width);
  }
}
