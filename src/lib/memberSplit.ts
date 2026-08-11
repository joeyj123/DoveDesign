import type { WoodMember } from '../types';

/** Rotate a local-space vector by Euler XYZ angles and add to world position. */
function rotateAndAddToPosition(
  local: [number, number, number],
  rotation: [number, number, number],
  position: [number, number, number]
): [number, number, number] {
  let [x, y, z] = local;
  const [rx, ry, rz] = rotation;

  // Rotate by X
  const cx = Math.cos(rx), sx = Math.sin(rx);
  [y, z] = [cx * y - sx * z, sx * y + cx * z];

  // Rotate by Y
  const cy = Math.cos(ry), sy = Math.sin(ry);
  [x, z] = [cy * x + sy * z, -sy * x + cy * z];

  // Rotate by Z
  const cz = Math.cos(rz), sz = Math.sin(rz);
  [x, y] = [cz * x - sz * y, sz * x + cz * y];

  return [position[0] + x, position[1] + y, position[2] + z];
}

/** Split a board by cross cut at `pos` inches from the start (local -X
 * end). `kerf` (default 0, backward compatible with every existing caller)
 * is the blade width removed AT the cut — split evenly (kerf/2) off each
 * resulting piece's edge, so the two pieces no longer touch, matching a
 * real saw cut rather than a mathematically perfect zero-width split. */
export function splitByCrossCut(
  member: WoodMember,
  pos: number,
  kerf = 0
): [WoodMember, WoodMember] {
  const { length: L, thickness: T, width: W, position, rotation } = member;
  const label = member.label.replace(/(\s*\(\d+ of \d+\))+$/gi, '');
  const clampedPos = Math.max(0.25, Math.min(pos, L - 0.25));
  const kerfHalf = Math.max(0, kerf) / 2;

  // Board 1 (keep piece): length = clampedPos - kerf/2
  // Local center offset: x = -L/2 + (clampedPos - kerf/2)/2
  const len1 = Math.max(0.25, clampedPos - kerfHalf);
  const off1: [number, number, number] = [-L / 2 + len1 / 2, 0, 0];
  const pos1 = rotateAndAddToPosition(off1, rotation, position);

  // Board 2 (waste piece): length = (L - clampedPos) - kerf/2
  // Local center offset: x = clampedPos + kerf/2 + len2/2 - L/2
  const waste = Math.max(0.25, L - clampedPos - kerfHalf);
  const off2: [number, number, number] = [clampedPos + kerfHalf + waste / 2 - L / 2, 0, 0];
  const pos2 = rotateAndAddToPosition(off2, rotation, position);

  const base = { ...member, cuts: [], rotation };

  const board1: WoodMember = {
    ...base,
    id: crypto.randomUUID(),
    label: `${label} (1 of 2)`,
    length: len1,
    thickness: T,
    width: W,
    position: pos1,
  };

  const board2: WoodMember = {
    ...base,
    id: crypto.randomUUID(),
    label: `${label} (2 of 2)`,
    length: waste,
    thickness: T,
    width: W,
    position: pos2,
  };

  return [board1, board2];
}

/** Split a board by rip cut. Keeps `targetWidth` from the start (local -Z)
 * edge. `kerf` (default 0, backward compatible) is the blade width removed
 * AT the cut, same convention as `splitByCrossCut`'s own kerf param. */
export function splitByRipCut(
  member: WoodMember,
  targetWidth: number,
  kerf = 0
): [WoodMember, WoodMember] {
  const { length: L, thickness: T, width: W, position, rotation } = member;
  const label = member.label.replace(/(\s*\(\d+ of \d+\))+$/gi, '');
  const clampedTW = Math.max(0.25, Math.min(targetWidth, W - 0.25));
  const kerfHalf = Math.max(0, kerf) / 2;
  const keepW = Math.max(0.25, clampedTW - kerfHalf);
  const wasteW = Math.max(0.25, W - clampedTW - kerfHalf);

  // Board 1 (keep piece): width = keepW
  // Local center offset: z = -W/2 + keepW/2
  const off1: [number, number, number] = [0, 0, -W / 2 + keepW / 2];
  const pos1 = rotateAndAddToPosition(off1, rotation, position);

  // Board 2 (waste strip): width = wasteW
  // Local center offset: z = clampedTW + kerf/2 + wasteW/2 - W/2
  const off2: [number, number, number] = [0, 0, clampedTW + kerfHalf + wasteW / 2 - W / 2];
  const pos2 = rotateAndAddToPosition(off2, rotation, position);

  const base = { ...member, cuts: [], rotation };

  const board1: WoodMember = {
    ...base,
    id: crypto.randomUUID(),
    label: `${label} (1 of 2)`,
    length: L,
    thickness: T,
    width: keepW,
    position: pos1,
  };

  const board2: WoodMember = {
    ...base,
    id: crypto.randomUUID(),
    label: `${label} (2 of 2)`,
    length: L,
    thickness: T,
    width: wasteW,
    position: pos2,
  };

  return [board1, board2];
}
