import * as THREE from 'three';
import type { WoodMember } from '../types';

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
        const shape = new THREE.Shape();
        member.polygonPoints.forEach(([x, z], i) => {
          if (i === 0) shape.moveTo(x, z);
          else shape.lineTo(x, z);
        });
        shape.closePath();
        return new THREE.ExtrudeGeometry(shape, { depth: member.thickness, bevelEnabled: false });
      }
      return new THREE.BoxGeometry(member.length, member.thickness, member.width);
    }
    default:
      return new THREE.BoxGeometry(member.length, member.thickness, member.width);
  }
}
