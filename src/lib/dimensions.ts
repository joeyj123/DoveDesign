import { NOMINAL_DIMENSIONS, type NominalSize } from '../types';

/** Format inches to 2 decimal places, trimming trailing zeros. */
export function fmtInches(n: number): string {
  const s = n.toFixed(2);
  return s.replace(/\.?0+$/, '') || '0';
}

/** Find nominal size label matching actual thickness × width. */
export function matchNominalSize(thickness: number, width: number): NominalSize | null {
  const tol = 0.06;
  for (const [key, dims] of Object.entries(NOMINAL_DIMENSIONS)) {
    if (
      Math.abs(dims.thickness - thickness) < tol &&
      Math.abs(dims.width - width) < tol
    ) {
      return key as NominalSize;
    }
  }
  return null;
}

export function nominalLabel(
  thickness: number,
  width: number,
  nominalSize: NominalSize
): string | null {
  if (nominalSize !== 'Custom') return nominalSize;
  return matchNominalSize(thickness, width);
}
