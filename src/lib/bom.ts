import type { WoodMember } from '../types';

export interface BomLineItem {
  key: string;
  species: string;
  nominalSize: string;
  lengthFt: number;
  quantity: number;
  boardFeetEach: number;
  totalBoardFeet: number;
  pricePerBoardFoot: number;
  estimatedCostEach: number;
  estimatedCostTotal: number;
}

export interface BomHardwareItem {
  id: string;
  description: string;
  quantity: number;
  unitCost: number;
}

export const DEFAULT_PRICES: Record<string, number> = {
  Pine:    3.50,
  Oak:     8.00,
  Maple:   7.50,
  Walnut: 14.00,
  Cherry: 12.00,
  Cedar:   5.00,
  Poplar:  4.50,
  Plywood: 2.50,
};

const STANDARD_LENGTHS_FT = [6, 8, 10, 12, 14, 16];

function roundUpToStandardLength(lengthIn: number): number {
  const lengthFt = lengthIn / 12;
  for (const sl of STANDARD_LENGTHS_FT) {
    if (lengthFt <= sl) return sl;
  }
  return Math.ceil(lengthFt / 2) * 2; // round up to next even foot beyond 16
}

function deriveNominalSize(thickness: number, width: number): string {
  // Thickness → nominal
  let nomT: number;
  if (thickness <= 1.0) nomT = 1;
  else if (thickness <= 2.0) nomT = 2;
  else if (thickness <= 3.5) nomT = 4;
  else nomT = Math.ceil(thickness);

  // Width → nearest standard width
  const stdWidths = [2, 3, 4, 6, 8, 10, 12];
  let nomW = stdWidths[stdWidths.length - 1];
  for (const sw of stdWidths) {
    if (width <= sw + 0.5) { nomW = sw; break; }
  }

  return `${nomT}x${nomW}`;
}

function boardFeet(thickness: number, width: number, lengthIn: number): number {
  return (thickness * width * lengthIn) / 144;
}

export function calculateBom(
  members: WoodMember[],
  priceOverrides: Record<string, number> = {}
): BomLineItem[] {
  const active = members.filter((m) => !m.inScrapBox);

  // Group by species + nominalSize
  const groups: Map<string, {
    species: string;
    nominalSize: string;
    thickness: number;
    width: number;
    members: WoodMember[];
  }> = new Map();

  for (const m of active) {
    const nomSize = deriveNominalSize(m.thickness, m.width);
    const key = `${m.species}|${nomSize}`;
    if (!groups.has(key)) {
      groups.set(key, { species: m.species, nominalSize: nomSize, thickness: m.thickness, width: m.width, members: [] });
    }
    groups.get(key)!.members.push(m);
  }

  const lines: BomLineItem[] = [];
  for (const [key, grp] of groups) {
    const maxLength = Math.max(...grp.members.map((m) => m.length));
    const lengthFt = roundUpToStandardLength(maxLength);
    const quantity = grp.members.length;
    const bf = boardFeet(grp.thickness, grp.width, lengthFt * 12);
    const price = priceOverrides[grp.species] ?? DEFAULT_PRICES[grp.species] ?? 4.0;

    lines.push({
      key,
      species: grp.species,
      nominalSize: grp.nominalSize,
      lengthFt,
      quantity,
      boardFeetEach: parseFloat(bf.toFixed(2)),
      totalBoardFeet: parseFloat((bf * quantity).toFixed(2)),
      pricePerBoardFoot: price,
      estimatedCostEach: parseFloat((bf * price).toFixed(2)),
      estimatedCostTotal: parseFloat((bf * price * quantity).toFixed(2)),
    });
  }

  return lines.sort((a, b) => a.species.localeCompare(b.species) || a.nominalSize.localeCompare(b.nominalSize));
}

export function exportBomCsv(lines: BomLineItem[], hardware: BomHardwareItem[], projectName: string): void {
  const rows: string[] = [
    'Species,Nominal Size,Length (ft),Quantity,Board Ft Each,Total Board Ft,Price/BF,Total Cost',
    ...lines.map((l) =>
      `${l.species},${l.nominalSize},${l.lengthFt},${l.quantity},${l.boardFeetEach},${l.totalBoardFeet},$${l.pricePerBoardFoot.toFixed(2)},$${l.estimatedCostTotal.toFixed(2)}`
    ),
    '',
    'Hardware,,,Quantity,,Unit Cost,Total',
    ...hardware.map((h) =>
      `${h.description},,,${h.quantity},,,${(h.quantity * h.unitCost).toFixed(2)}`
    ),
  ];

  const totalLumber = lines.reduce((s, l) => s + l.estimatedCostTotal, 0);
  const totalHardware = hardware.reduce((s, h) => s + h.quantity * h.unitCost, 0);
  rows.push('', `Total Estimated Cost,,,,,,$${(totalLumber + totalHardware).toFixed(2)}`);

  const csv = rows.join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${projectName.replace(/\s+/g, '_')}_BOM.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
