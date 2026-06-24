import type { WoodMember, EstimatingSettings, MaterialLedgerGroup, Project } from '../types';
import { calcBoardFeet } from './boardFeet';
import { inferMaterialKind } from './materials';
import { HARDWARE_LIBRARY_COSTS } from './hardwareLibrary';

export function materialGroupKey(m: WoodMember): string {
  const kind = m.materialKind ?? inferMaterialKind(m.species, m.category);
  return `${kind}|${m.species}|${m.nominalSize}|${m.thickness}|${m.width}`;
}

export function buildMaterialLedger(
  members: WoodMember[],
  settings: EstimatingSettings
): MaterialLedgerGroup[] {
  const buckets = new Map<string, MaterialLedgerGroup>();

  for (const m of members) {
    const key = materialGroupKey(m);
    const kind = m.materialKind ?? inferMaterialKind(m.species, m.category);

    if (!buckets.has(key)) {
      const priceEntry = settings.materialPrices[key];
      buckets.set(key, {
        key,
        species: m.species,
        nominalSize: m.nominalSize,
        thickness: m.thickness,
        width: m.width,
        materialKind: kind,
        memberCount: 0,
        totalLinearFeet: 0,
        totalBoardFeet: 0,
        totalSquareFeet: 0,
        priceUnit: priceEntry?.unit ?? (kind === 'sheet' ? 'SF' : 'LF'),
        pricePerUnit: priceEntry?.pricePerUnit ?? m.costPerBoardFoot,
        subtotal: 0,
      });
    }

    const group = buckets.get(key)!;
    group.memberCount += 1;

    if (kind === 'sheet') {
      const sf = (m.length * m.width) / 144;
      group.totalSquareFeet += sf;
    } else {
      group.totalLinearFeet += m.length / 12;
      group.totalBoardFeet += calcBoardFeet(m.thickness, m.width, m.length);
    }
  }

  const groups = Array.from(buckets.values());

  for (const g of groups) {
    const qty =
      g.materialKind === 'sheet'
        ? g.totalSquareFeet
        : g.priceUnit === 'BF'
          ? g.totalBoardFeet
          : g.totalLinearFeet;
    g.subtotal = qty * g.pricePerUnit;
  }

  return groups.sort((a, b) => a.species.localeCompare(b.species));
}

export interface EstimateTotals {
  materialSubtotal: number;
  hardwareSubtotal: number;
  finishSubtotal: number;
  wasteAmount: number;
  subtotalBeforeTax: number;
  taxAmount: number;
  grandTotal: number;
}

export function calcEstimateTotals(
  project: Project,
  settings: EstimatingSettings
): EstimateTotals {
  const groups = buildMaterialLedger(project.members, settings);
  const materialSubtotal = groups.reduce((s, g) => s + g.subtotal, 0);
  const hardwareSubtotal =
    project.hardware.reduce((s, h) => s + h.quantity * h.unitCost, 0) +
    project.placedHardware.reduce(
      (s, h) => s + (HARDWARE_LIBRARY_COSTS[h.libraryId] ?? 0),
      0
    );
  const finishSubtotal = project.finishes.reduce(
    (s, f) => s + f.quantity * f.unitCost, 0
  );

  const base = materialSubtotal + hardwareSubtotal + finishSubtotal;
  const wasteAmount = settings.wasteBufferEnabled
    ? base * (settings.wasteBufferPercent / 100)
    : 0;
  const subtotalBeforeTax = base + wasteAmount;
  const taxAmount = subtotalBeforeTax * (settings.taxRatePercent / 100);
  const grandTotal = subtotalBeforeTax + taxAmount;

  return {
    materialSubtotal,
    hardwareSubtotal,
    finishSubtotal,
    wasteAmount,
    subtotalBeforeTax,
    taxAmount,
    grandTotal,
  };
}
