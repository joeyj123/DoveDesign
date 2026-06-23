// ─── Wood Classification ───────────────────────────────────────────────────

export type WoodCategory =
  | 'Hardwood'
  | 'Softwood'
  | 'Engineered'
  | 'Construction';

export type NominalSize =
  | '1x2' | '1x3' | '1x4' | '1x6' | '1x8' | '1x10' | '1x12'
  | '2x2' | '2x4' | '2x6' | '2x8' | '2x10' | '2x12'
  | '4x4' | '4x6'
  | 'Custom';

export const NOMINAL_DIMENSIONS: Record<
  Exclude<NominalSize, 'Custom'>,
  { thickness: number; width: number }
> = {
  '1x2':  { thickness: 0.75, width: 1.5   },
  '1x3':  { thickness: 0.75, width: 2.5   },
  '1x4':  { thickness: 0.75, width: 3.5   },
  '1x6':  { thickness: 0.75, width: 5.5   },
  '1x8':  { thickness: 0.75, width: 7.25  },
  '1x10': { thickness: 0.75, width: 9.25  },
  '1x12': { thickness: 0.75, width: 11.25 },
  '2x2':  { thickness: 1.5,  width: 1.5   },
  '2x4':  { thickness: 1.5,  width: 3.5   },
  '2x6':  { thickness: 1.5,  width: 5.5   },
  '2x8':  { thickness: 1.5,  width: 7.25  },
  '2x10': { thickness: 1.5,  width: 9.25  },
  '2x12': { thickness: 1.5,  width: 11.25 },
  '4x4':  { thickness: 3.5,  width: 3.5   },
  '4x6':  { thickness: 3.5,  width: 5.5   },
};

// ─── Wood Member ───────────────────────────────────────────────────────────

export interface WoodMember {
  id: string;
  label: string;
  category: WoodCategory;
  species: string;
  nominalSize: NominalSize;
  thickness: number;              // inches (actual/surfaced)
  width: number;                  // inches
  length: number;                 // inches
  position: [number, number, number];
  rotation: [number, number, number];
  costPerBoardFoot: number;
  color: string;                  // hex wood tone
  isSelected: boolean;
}

// ─── Hardware & Fasteners ──────────────────────────────────────────────────

export type HardwareCategory =
  | 'Screw' | 'Nail' | 'Bolt' | 'Dowel'
  | 'Bracket' | 'Hinge' | 'Glue' | 'Other';

export interface HardwareItem {
  id: string;
  label: string;
  category: HardwareCategory;
  quantity: number;
  unitCost: number;
}

// ─── Surface Finishes ──────────────────────────────────────────────────────

export type FinishType =
  | 'Sanding' | 'Stain' | 'Paint'
  | 'Polyurethane' | 'Oil' | 'Wax' | 'Other';

export interface FinishItem {
  id: string;
  label: string;
  finishType: FinishType;
  sandingGrit?: number;           // populated when finishType === 'Sanding'
  coats: number;
  unitCost: number;
  quantity: number;
}

// ─── Physics Hook ─────────────────────────────────────────────────────────

export interface StructuralAnalysis {
  weightLoadCapacity?: number;    // lbs — placeholder for future physics engine
  isStructuralFailure?: boolean;  // true when load exceeds calculated capacity
  analysisRunAt?: string;         // ISO timestamp of last simulation
}

// ─── Project Root ──────────────────────────────────────────────────────────

export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  members: WoodMember[];
  hardware: HardwareItem[];
  finishes: FinishItem[];
  structural: StructuralAnalysis; // physics hook always present, fields optional
}

// ─── UI State (not persisted to disk) ─────────────────────────────────────

export type ActiveTool = 'select' | 'addBoard' | 'cut' | 'miter' | 'carve';

export interface UIState {
  activeTool: ActiveTool;
  selectedMemberId: string | null;
}
