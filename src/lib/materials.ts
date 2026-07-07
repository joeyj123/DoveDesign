import type { WoodCategory } from '../types';

export type MaterialKind = 'dimensional' | 'sheet';

/**
 * Mirrors the WoodSpecies union in CAD_ENGINE_BLUEPRINT.ts (root reference
 * file — not imported directly since it sits outside tsconfig's `src`
 * include). This is the one canonical species list; Insert and Sketch both
 * render it from here via SpeciesSelect.tsx rather than each keeping their
 * own copy.
 */
export type WoodSpecies = 'Oak' | 'Pine' | 'Walnut' | 'Maple' | 'Cherry' | 'Cedar' | 'Poplar' | 'Plywood';

export const WOOD_SPECIES_LIST: WoodSpecies[] = [
  'Oak', 'Pine', 'Walnut', 'Maple', 'Cherry', 'Cedar', 'Poplar', 'Plywood',
];

export interface MaterialProfile {
  id: string;
  name: string;
  category: WoodCategory;
  kind: MaterialKind;
  color: string;
  /** Density in lbs per cubic foot. */
  density: number;
  /** Modulus of Elasticity in psi. */
  E: number;
  /** Default cost per board foot (dimensional) or per SF (sheet). */
  defaultPrice: number;
}

export const MATERIAL_CATALOG: MaterialProfile[] = [
  // Softwoods
  { id: 'syp', name: 'Southern Yellow Pine', category: 'Softwood', kind: 'dimensional', color: '#d4a96a', density: 35, E: 1_800_000, defaultPrice: 3.50 },
  { id: 'df',  name: 'Douglas Fir',          category: 'Softwood', kind: 'dimensional', color: '#c4956a', density: 33, E: 1_900_000, defaultPrice: 4.00 },
  { id: 'pine', name: 'Pine (generic)',      category: 'Softwood', kind: 'dimensional', color: '#d4a96a', density: 28, E: 1_500_000, defaultPrice: 3.00 },
  { id: 'erc', name: 'Eastern Red Cedar',    category: 'Softwood', kind: 'dimensional', color: '#a67c52', density: 23, E: 1_100_000, defaultPrice: 6.50 },
  // Hardwoods
  { id: 'hard-maple', name: 'Hard Maple',     category: 'Hardwood', kind: 'dimensional', color: '#e8c98a', density: 44, E: 1_830_000, defaultPrice: 8.50 },
  { id: 'cherry',     name: 'Cherry',         category: 'Hardwood', kind: 'dimensional', color: '#9b4f2a', density: 35, E: 1_490_000, defaultPrice: 9.00 },
  { id: 'white-oak',  name: 'White Oak',      category: 'Hardwood', kind: 'dimensional', color: '#b5813e', density: 47, E: 1_780_000, defaultPrice: 8.00 },
  { id: 'red-oak',    name: 'Red Oak',        category: 'Hardwood', kind: 'dimensional', color: '#b07840', density: 44, E: 1_760_000, defaultPrice: 7.50 },
  { id: 'walnut',     name: 'Black Walnut',   category: 'Hardwood', kind: 'dimensional', color: '#5c3a1e', density: 38, E: 1_680_000, defaultPrice: 12.00 },
  { id: 'mahogany',   name: 'Mahogany',       category: 'Hardwood', kind: 'dimensional', color: '#8b4513', density: 37, E: 1_550_000, defaultPrice: 14.00 },
  { id: 'teak',       name: 'Teak',           category: 'Hardwood', kind: 'dimensional', color: '#9a7b4f', density: 41, E: 1_780_000, defaultPrice: 22.00 },
  // Sheet goods
  { id: 'cdx',    name: 'CDX Plywood',         category: 'Engineered', kind: 'sheet', color: '#c9aa71', density: 36, E: 1_400_000, defaultPrice: 1.25 },
  { id: 'osb',    name: 'OSB',                 category: 'Engineered', kind: 'sheet', color: '#b8956a', density: 38, E: 1_200_000, defaultPrice: 0.85 },
  { id: 'birch',  name: 'Baltic Birch Plywood', category: 'Engineered', kind: 'sheet', color: '#dcc99a', density: 40, E: 1_600_000, defaultPrice: 2.50 },

  // Insert/Sketch species dropdown (New Order 3.1) — one canonical entry per
  // WOOD_SPECIES_LIST name so getMaterialByName(species) always resolves a
  // color/category/kind for every dropdown option. Additive only — existing
  // entries above (e.g. 'Hard Maple', 'White Oak') are untouched.
  { id: 'oak-generic',    name: 'Oak',     category: 'Hardwood',  kind: 'dimensional', color: '#b5813e', density: 45, E: 1_770_000, defaultPrice: 7.75 },
  { id: 'pine-generic',   name: 'Pine',    category: 'Softwood',  kind: 'dimensional', color: '#d4a96a', density: 30, E: 1_600_000, defaultPrice: 3.25 },
  { id: 'walnut-generic', name: 'Walnut',  category: 'Hardwood',  kind: 'dimensional', color: '#5c3a1e', density: 38, E: 1_680_000, defaultPrice: 12.00 },
  { id: 'maple-generic',  name: 'Maple',   category: 'Hardwood',  kind: 'dimensional', color: '#e8c98a', density: 44, E: 1_830_000, defaultPrice: 8.50 },
  { id: 'cedar-generic',  name: 'Cedar',   category: 'Softwood',  kind: 'dimensional', color: '#a67c52', density: 23, E: 1_100_000, defaultPrice: 6.50 },
  { id: 'poplar',         name: 'Poplar',  category: 'Hardwood',  kind: 'dimensional', color: '#c9c2a0', density: 29, E: 1_580_000, defaultPrice: 4.25 },
  { id: 'plywood-generic', name: 'Plywood', category: 'Engineered', kind: 'sheet',     color: '#c9aa71', density: 36, E: 1_400_000, defaultPrice: 1.75 },
];

export function getMaterialByName(name: string): MaterialProfile | undefined {
  return MATERIAL_CATALOG.find(
    (m) => m.name.toLowerCase() === name.toLowerCase()
  );
}

export function getMaterialById(id: string): MaterialProfile | undefined {
  return MATERIAL_CATALOG.find((m) => m.id === id);
}

export function inferMaterialKind(species: string, category: WoodCategory): MaterialKind {
  const mat = getMaterialByName(species);
  if (mat) return mat.kind;
  if (category === 'Engineered') return 'sheet';
  return 'dimensional';
}

export function getModulusFromCatalog(species: string): number {
  return getMaterialByName(species)?.E ?? 1_500_000;
}

export function getDensityFromCatalog(species: string): number {
  return getMaterialByName(species)?.density ?? 30;
}
