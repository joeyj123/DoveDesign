import type { WoodMember, DeflectionResult } from '../types';
import { getModulusFromCatalog } from './materials';

/** Architectural deflection limit ratio (L/240). */
export const DEFLECTION_LIMIT_RATIO = 240;

export function getModulus(species: string): number {
  return getModulusFromCatalog(species);
}

/** Moment of inertia for rectangular section (in⁴). b = width, h = depth. */
export function calcMomentOfInertia(b: number, h: number): number {
  return (b * Math.pow(h, 3)) / 12;
}

/**
 * Uniform-load beam deflection: δ = (5 × w × L⁴) / (384 × E × I)
 * w = load per unit length (lbs/in), L = span (in), E = psi, I = in⁴
 */
export function calcUniformDeflection(
  loadLbs: number,
  spanIn: number,
  E: number,
  I: number
): number {
  if (spanIn <= 0 || E <= 0 || I <= 0) return 0;
  const w = loadLbs / spanIn;
  return (5 * w * Math.pow(spanIn, 4)) / (384 * E * I);
}

export function calcMemberDeflection(member: WoodMember): DeflectionResult {
  const E = getModulus(member.species);
  const spanIn = member.length;

  const b = member.orientation === 'flat' ? member.width : member.thickness;
  const h = member.orientation === 'flat' ? member.thickness : member.width;
  const I = calcMomentOfInertia(b, h);

  const deflectionIn = calcUniformDeflection(member.loadLbs, spanIn, E, I);
  const limitIn = spanIn / DEFLECTION_LIMIT_RATIO;

  return {
    memberId: member.id,
    label: member.label,
    deflectionIn,
    limitIn,
    exceedsLimit: deflectionIn > limitIn,
    spanIn,
    species: member.species,
  };
}

export function analyzeProjectDeflection(members: WoodMember[]): DeflectionResult[] {
  return members.map(calcMemberDeflection);
}

// Re-export species list for EngineeringPanel dropdown
export { MATERIAL_CATALOG as WOOD_SPECIES } from './materials';
