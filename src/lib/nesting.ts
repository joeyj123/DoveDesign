import type { WoodMember, NestingPlan, NestingGroup, NestingStock } from '../types';

export const STANDARD_STOCK_LENGTHS = [96, 120, 144] as const; // 8ft, 10ft, 12ft
export const SAW_KERF_INCHES = 0.125;

interface PartEntry {
  memberId: string;
  label: string;
  length: number;
}

function groupKey(m: WoodMember): string {
  return `${m.species}|${m.nominalSize}|${m.thickness}|${m.width}`;
}

/** First-fit decreasing 1D bin packing with kerf per cut. */
function packParts(
  parts: PartEntry[],
  stockLength: number,
  kerf: number
): NestingStock[] {
  const sorted = [...parts].sort((a, b) => b.length - a.length);
  const stocks: NestingStock[] = [];

  for (const part of sorted) {
    let placed = false;
    for (const stock of stocks) {
      const used = stock.parts.reduce((s, p) => s + p.length + kerf, 0) - kerf;
      const remaining = stockLength - used;
      const needed = part.length + (stock.parts.length > 0 ? kerf : 0);
      if (needed <= remaining) {
        stock.parts.push({ memberId: part.memberId, label: part.label, length: part.length });
        placed = true;
        break;
      }
    }
    if (!placed) {
      stocks.push({
        stockLength,
        parts: [{ memberId: part.memberId, label: part.label, length: part.length }],
        waste: 0,
      });
    }
  }

  for (const stock of stocks) {
    const used = stock.parts.reduce((s, p) => s + p.length + kerf, 0) - kerf;
    stock.waste = Math.max(0, stockLength - used);
  }

  return stocks;
}

/** Pick stock length that minimizes total waste for a group. */
function bestStockForGroup(parts: PartEntry[], kerf: number): NestingStock[] {
  let best: NestingStock[] | null = null;
  let bestWaste = Infinity;

  for (const stockLen of STANDARD_STOCK_LENGTHS) {
    const maxPart = Math.max(...parts.map((p) => p.length), 0);
    if (maxPart > stockLen) continue;
    const packed = packParts(parts, stockLen, kerf);
    const waste = packed.reduce((s, st) => s + st.waste, 0);
    if (waste < bestWaste) {
      bestWaste = waste;
      best = packed;
    }
  }

  if (!best) {
    const longest = Math.max(...parts.map((p) => p.length), 96);
    return packParts(parts, longest, kerf);
  }
  return best;
}

export function optimizeCutList(members: WoodMember[], kerf = SAW_KERF_INCHES): NestingPlan {
  const buckets = new Map<string, { meta: WoodMember; parts: PartEntry[] }>();

  for (const m of members) {
    const key = groupKey(m);
    if (!buckets.has(key)) {
      buckets.set(key, { meta: m, parts: [] });
    }
    buckets.get(key)!.parts.push({
      memberId: m.id,
      label: m.label,
      length: m.length,
    });
  }

  const groups: NestingGroup[] = [];

  for (const [, { meta, parts }] of buckets) {
    const stocks = bestStockForGroup(parts, kerf);
    const totalWaste = stocks.reduce((s, st) => s + st.waste, 0);
    groups.push({
      key: groupKey(meta),
      species: meta.species,
      nominalSize: meta.nominalSize,
      thickness: meta.thickness,
      width: meta.width,
      stocks,
      totalWaste,
      totalStockUsed: stocks.length,
    });
  }

  return { groups, kerfInches: kerf };
}

export interface ManualCutPart {
  label: string;
  length: number;
  memberId?: string;
}

/** 1D bin packing with user-supplied stock lengths (first-fit decreasing). */
export function optimizeManualLumber(
  parts: ManualCutPart[],
  stockLengths: number[],
  kerf = SAW_KERF_INCHES
): NestingStock[] {
  if (parts.length === 0 || stockLengths.length === 0) return [];

  const sortedStock = [...stockLengths].sort((a, b) => a - b);
  const entries: PartEntry[] = parts.map((p) => ({
    memberId: p.memberId ?? p.label,
    label: p.label,
    length: p.length,
  }));

  const sorted = [...entries].sort((a, b) => b.length - a.length);
  const stocks: NestingStock[] = [];

  for (const part of sorted) {
    let placed = false;
    for (const stock of stocks) {
      const used =
        stock.parts.reduce((s, p) => s + p.length + kerf, 0) - (stock.parts.length > 0 ? kerf : 0);
      const needed = part.length + (stock.parts.length > 0 ? kerf : 0);
      if (needed <= stock.stockLength - used) {
        stock.parts.push({ memberId: part.memberId, label: part.label, length: part.length });
        placed = true;
        break;
      }
    }
    if (!placed) {
      const fitting = sortedStock.filter((len) => len >= part.length);
      const stockLength = fitting[0] ?? Math.max(part.length, ...sortedStock);
      stocks.push({
        stockLength,
        parts: [{ memberId: part.memberId, label: part.label, length: part.length }],
        waste: 0,
      });
    }
  }

  for (const stock of stocks) {
    const used =
      stock.parts.reduce((s, p) => s + p.length + kerf, 0) - (stock.parts.length > 0 ? kerf : 0);
    stock.waste = Math.max(0, stock.stockLength - used);
  }

  return stocks;
}

export function formatStockLength(inches: number): string {
  const feet = inches / 12;
  return `${feet}ft (${inches}")`;
}
