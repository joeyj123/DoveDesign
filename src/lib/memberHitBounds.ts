import type { WoodMember } from '../types';

/** Axis-aligned member dimensions for invisible pick meshes (inches). */
export function getMemberHitSize(member: WoodMember): [number, number, number] {
  const shape = member.shapeType ?? 'box';
  switch (shape) {
    case 'sphere': {
      const d = (member.radius ?? member.width / 2) * 2;
      return [d, d, d];
    }
    case 'cylinder':
    case 'cone':
    case 'triangularPrism':
    case 'hexagonalPrism':
      return [member.width, member.length, member.width];
    default:
      return [member.length, member.thickness, member.width];
  }
}
