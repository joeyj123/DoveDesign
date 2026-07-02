import type { CutOperation, WoodMember } from '../types';

/** CSG subtraction descriptor for react-three-csg rendering. */
export interface CSGSubtraction {
  id: string;
  /** Local position [x, y, z] relative to board center. */
  position: [number, number, number];
  /** Local rotation [rx, ry, rz] in radians. */
  rotation: [number, number, number];
  /**
   * Geometry type and args.
   * box: [x, y, z] extents.
   * cylinder: [rTop, rBottom, height, segments].
   * taperPrism (Phase 20): [depth, extrude, wOuter, wInner] — a trapezoid
   * cross-section prism. Local +X = outward (wide/narrow end at x=0,
   * tapering to x=-depth), Y = layout width, Z = extrusion. This is what
   * makes a dovetail render as a real dovetail instead of a slanted box.
   */
  geometry: 'box' | 'cylinder' | 'taperPrism';
  args: number[];
}

const BLADE_KERF = 0.125;

/** Board local axes: X = length, Y = thickness, Z = width. Center at origin. */
export function buildCutSubtractions(
  member: WoodMember,
  allMembers: WoodMember[]
): CSGSubtraction[] {
  const subs: CSGSubtraction[] = [];
  const { length: L, thickness: T, width: W } = member;
  const halfL = L / 2;
  const halfT = T / 2;
  const halfW = W / 2;

  for (const cut of member.cuts) {
    switch (cut.type) {
      case 'crossCut': {
        const pos = cut.position ?? halfL;
        const kerf = cut.width ?? BLADE_KERF;
        const x = -halfL + pos;
        subs.push({
          id: cut.id,
          position: [x + kerf / 2, 0, 0],
          rotation: [0, 0, 0],
          geometry: 'box',
          args: [kerf + 0.05, T + 0.2, W + 0.2],
        });
        if (pos < halfL) {
          subs.push({
            id: `${cut.id}-waste`,
            position: [x + kerf / 2 + (halfL - pos) / 2, 0, 0],
            rotation: [0, 0, 0],
            geometry: 'box',
            args: [halfL - pos, T + 0.2, W + 0.2],
          });
        }
        break;
      }

      case 'ripCut': {
        const kerf = cut.width ?? BLADE_KERF;
        const keepEdge = cut.ripKeepEdge ?? 'start';
        const targetW = Math.min(
          cut.targetWidth ?? W * 0.75,
          W - kerf
        );
        const wasteW = W - targetW - kerf;

        if (wasteW <= 0.01) break;

        if (keepEdge === 'start') {
          const cutZ = -halfW + targetW;
          subs.push({
            id: `${cut.id}-kerf`,
            position: [0, 0, cutZ + kerf / 2],
            rotation: [0, 0, 0],
            geometry: 'box',
            args: [L + 0.2, T + 0.2, kerf + 0.05],
          });
          const wasteCenterZ = cutZ + kerf + wasteW / 2;
          subs.push({
            id: `${cut.id}-waste`,
            position: [0, 0, wasteCenterZ],
            rotation: [0, 0, 0],
            geometry: 'box',
            args: [L + 0.2, T + 0.2, wasteW + 0.05],
          });
        } else {
          const cutZ = halfW - targetW;
          subs.push({
            id: `${cut.id}-kerf`,
            position: [0, 0, cutZ - kerf / 2],
            rotation: [0, 0, 0],
            geometry: 'box',
            args: [L + 0.2, T + 0.2, kerf + 0.05],
          });
          const wasteCenterZ = -halfW + wasteW / 2;
          subs.push({
            id: `${cut.id}-waste`,
            position: [0, 0, wasteCenterZ],
            rotation: [0, 0, 0],
            geometry: 'box',
            args: [L + 0.2, T + 0.2, wasteW + 0.05],
          });
        }
        break;
      }

      case 'miterCut':
      case 'bevelCut': {
        const end = cut.end ?? 'end';
        const angleDeg = cut.angle ?? 45;
        const angleRad = (angleDeg * Math.PI) / 180;
        const endX = end === 'end' ? halfL : -halfL;
        const cutDepth = Math.max(T, W) * 1.5;
        subs.push({
          id: cut.id,
          position: [endX, 0, 0],
          rotation: [0, 0, end === 'end' ? angleRad : -angleRad],
          geometry: 'box',
          args: [cutDepth, T + 0.3, W + 0.3],
        });
        break;
      }

      case 'pocketHole': {
        const end = cut.end ?? 'end';
        const endX = end === 'end' ? halfL - 1.5 : -halfL + 1.5;
        const dia = cut.diameter ?? 0.5;
        const depth = cut.depth ?? 2.5;
        subs.push({
          id: cut.id,
          position: [endX, -halfT + depth / 2, 0],
          rotation: [Math.PI / 2, 0, Math.PI / 4],
          geometry: 'cylinder',
          args: [dia / 2, dia / 2, depth, 12],
        });
        break;
      }

      case 'fingerJoint':
      case 'boxJoint': {
        const fingers = cut.fingerCount ?? 5;
        const fingerW = W / (fingers * 2);
        const end = cut.end ?? 'end';
        const endX = end === 'end' ? halfL : -halfL;
        for (let i = 0; i < fingers; i++) {
          if (i % 2 === 0) {
            const z = -halfW + fingerW * (2 * i + 1);
            subs.push({
              id: `${cut.id}-f${i}`,
              position: [endX, 0, z],
              rotation: [0, 0, 0],
              geometry: 'box',
              args: [fingerW * 1.2, T + 0.1, fingerW],
            });
          }
        }
        break;
      }

      case 'dovetail': {
        // Phase 20 fix: real trapezoid waste sockets between tails (narrow at
        // the board end, wide at the base) — previously rendered as Y-rotated
        // boxes, which looked like a slanted finger joint, not a dovetail.
        const tails = cut.fingerCount ?? 4;
        const slot = W / (tails * 2 + 1);
        const depth = slot * 1.2;
        const flare = depth * Math.tan((14 * Math.PI) / 180);
        const end = cut.end ?? 'end';
        const endX = end === 'end' ? halfL : -halfL;
        for (let i = 0; i <= tails; i++) {
          const z = -halfW + slot * (2 * i + 0.5);
          subs.push({
            id: `${cut.id}-d${i}`,
            position: [endX, 0, z],
            // taperPrism local: +X outward, Y layout, Z extrude. Map layout →
            // board Z (across width) and extrude → board Y (through thickness);
            // at the start face also flip outward to -X.
            rotation: end === 'end' ? [Math.PI / 2, 0, 0] : [-Math.PI / 2, 0, Math.PI],
            geometry: 'taperPrism',
            args: [depth, T + 0.1, Math.max(0.05, slot - 2 * flare), slot],
          });
        }
        break;
      }
    }
  }

  // Dual-sided joinery: receiving cuts from partner boards
  for (const other of allMembers) {
    if (other.id === member.id) continue;
    for (const cut of other.cuts) {
      if (cut.partnerMemberId !== member.id) continue;
      subs.push(...buildReceivingJoinery(member, other, cut));
    }
  }

  return subs;
}

/** Inverted CSG cuts on the receiving (partner) board. */
function buildReceivingJoinery(
  receiver: WoodMember,
  _source: WoodMember,
  cut: CutOperation
): CSGSubtraction[] {
  const subs: CSGSubtraction[] = [];
  const { length: L, thickness: T, width: W } = receiver;
  const halfL = L / 2;
  const halfW = W / 2;

  switch (cut.type) {
    case 'pocketHole': {
      const dia = cut.diameter ?? 0.5;
      const depth = cut.depth ?? 2.5;
      subs.push({
        id: `${cut.id}-recv-ph`,
        position: [halfL - 1.5, 0, 0],
        rotation: [0, 0, 0],
        geometry: 'cylinder',
        args: [dia / 2 + 0.05, dia / 2 + 0.05, depth, 12],
      });
      subs.push({
        id: `${cut.id}-recv-cb`,
        position: [halfL - 0.25, T / 2 - 0.1, 0],
        rotation: [Math.PI / 2, 0, 0],
        geometry: 'cylinder',
        args: [dia, dia, T * 0.4, 12],
      });
      break;
    }
    case 'fingerJoint':
    case 'boxJoint': {
      const fingers = cut.fingerCount ?? 5;
      const fingerW = W / (fingers * 2);
      for (let i = 0; i < fingers; i++) {
        if (i % 2 !== 0) {
          const z = -halfW + fingerW * (2 * i + 1);
          subs.push({
            id: `${cut.id}-recv-f${i}`,
            position: [-halfL, 0, z],
            rotation: [0, 0, 0],
            geometry: 'box',
            args: [fingerW * 1.2, T + 0.1, fingerW],
          });
        }
      }
      break;
    }
    case 'dovetail': {
      // Phase 20: receiving sockets are the tails' trapezoid complement —
      // wide at the mating end so the flared tails seat into them.
      const tails = cut.fingerCount ?? 4;
      const slot = W / (tails * 2 + 1);
      const depth = slot * 1.2;
      const flare = depth * Math.tan((14 * Math.PI) / 180);
      for (let i = 0; i < tails; i++) {
        const z = -halfW + slot * (2 * i + 1.5);
        subs.push({
          id: `${cut.id}-recv-d${i}`,
          position: [-halfL, 0, z],
          rotation: [-Math.PI / 2, 0, Math.PI],
          geometry: 'taperPrism',
          args: [depth, T + 0.1, slot + 2 * flare, slot],
        });
      }
      break;
    }
  }

  return subs;
}

export function createCutOperation(
  type: CutOperation['type'],
  overrides: Partial<Omit<CutOperation, 'id' | 'type'>> = {}
): CutOperation {
  return {
    id: crypto.randomUUID(),
    type,
    ...defaultsForType(type),
    ...overrides,
  };
}

function defaultsForType(type: CutOperation['type']): Partial<CutOperation> {
  switch (type) {
    case 'crossCut':
      return { position: 48, width: BLADE_KERF };
    case 'ripCut':
      return { targetWidth: 2.75, width: BLADE_KERF, ripKeepEdge: 'start' };
    case 'miterCut':
      return { end: 'end', angle: 45 };
    case 'bevelCut':
      return { end: 'end', angle: 30 };
    case 'pocketHole':
      return { end: 'end', diameter: 0.5, depth: 2.5, angle: 15 };
    case 'fingerJoint':
    case 'boxJoint':
      return { end: 'end', fingerCount: 5 };
    case 'dovetail':
      return { end: 'end', fingerCount: 4 };
    default:
      return {};
  }
}

export const JOINERY_TYPES: { type: CutOperation['type']; label: string }[] = [
  { type: 'pocketHole', label: 'Pocket Hole' },
  { type: 'fingerJoint', label: 'Finger Joint' },
  { type: 'boxJoint', label: 'Box Joint' },
  { type: 'dovetail', label: 'Dovetail' },
];

export const CUT_TYPES: { type: CutOperation['type']; label: string }[] = [
  { type: 'crossCut', label: 'Cross-Cut / Chop' },
  { type: 'ripCut', label: 'Rip Cut' },
  { type: 'miterCut', label: 'Miter Cut' },
  { type: 'bevelCut', label: 'Bevel Cut' },
];
