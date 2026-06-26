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

/** Split a board by cross cut at `pos` inches from the start (local -X end). */
export function splitByCrossCut(
  member: WoodMember,
  pos: number
): [WoodMember, WoodMember] {
  const { length: L, thickness: T, width: W, position, rotation } = member;
  const label = member.label.replace(/(\s*\(\d+ of \d+\))+$/gi, '');
  const clampedPos = Math.max(0.25, Math.min(pos, L - 0.25));

  // Board 1 (keep piece): length = clampedPos
  // Local center offset: x = -L/2 + clampedPos/2
  const off1: [number, number, number] = [-L / 2 + clampedPos / 2, 0, 0];
  const pos1 = rotateAndAddToPosition(off1, rotation, position);

  // Board 2 (waste piece): length = L - clampedPos
  // Local center offset: x = clampedPos/2  (= -L/2 + clampedPos + (L-clampedPos)/2)
  const waste = L - clampedPos;
  const off2: [number, number, number] = [clampedPos / 2, 0, 0];
  const pos2 = rotateAndAddToPosition(off2, rotation, position);

  const base = { ...member, cuts: [], rotation };

  const board1: WoodMember = {
    ...base,
    id: crypto.randomUUID(),
    label: `${label} (1 of 2)`,
    length: clampedPos,
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

/** Split a board by rip cut. Keeps `targetWidth` from the start (local -Z) edge. */
export function splitByRipCut(
  member: WoodMember,
  targetWidth: number
): [WoodMember, WoodMember] {
  const { length: L, thickness: T, width: W, position, rotation } = member;
  const label = member.label.replace(/(\s*\(\d+ of \d+\))+$/gi, '');
  const clampedTW = Math.max(0.25, Math.min(targetWidth, W - 0.25));
  const wasteW = W - clampedTW;

  // Board 1 (keep piece): width = clampedTW
  // Local center offset: z = -W/2 + clampedTW/2
  const off1: [number, number, number] = [0, 0, -W / 2 + clampedTW / 2];
  const pos1 = rotateAndAddToPosition(off1, rotation, position);

  // Board 2 (waste strip): width = wasteW
  // Local center offset: z = -W/2 + clampedTW + wasteW/2 = W/2 - wasteW/2
  const off2: [number, number, number] = [0, 0, W / 2 - wasteW / 2];
  const pos2 = rotateAndAddToPosition(off2, rotation, position);

  const base = { ...member, cuts: [], rotation };

  const board1: WoodMember = {
    ...base,
    id: crypto.randomUUID(),
    label: `${label} (1 of 2)`,
    length: L,
    thickness: T,
    width: clampedTW,
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
