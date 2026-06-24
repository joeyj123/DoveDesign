import type { WoodMember } from '../types';

export const SHEET_WIDTH = 48;
export const SHEET_HEIGHT = 96;
export const SHEET_KERF = 0.125;

export interface SheetPart {
  memberId: string;
  label: string;
  w: number;
  h: number;
}

export interface PlacedPart extends SheetPart {
  x: number;
  y: number;
  rotated: boolean;
}

export interface SheetLayout {
  sheetIndex: number;
  parts: PlacedPart[];
  wasteArea: number;
}

export interface SheetNestingPlan {
  sheets: SheetLayout[];
  kerf: number;
  sheetW: number;
  sheetH: number;
}

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Simple shelf first-fit 2D bin packing on 48×96 sheets. */
export function optimizeSheetNesting(members: WoodMember[], kerf = SHEET_KERF): SheetNestingPlan {
  const parts: SheetPart[] = members
    .filter((m) => m.materialKind === 'sheet')
    .map((m) => ({
      memberId: m.id,
      label: m.label,
      w: Math.min(m.length, m.width),
      h: Math.max(m.length, m.width),
    }))
    .sort((a, b) => b.h * b.w - a.h * a.w);

  const sheets: SheetLayout[] = [];
  let sheetIndex = 0;
  let shelves: Rect[] = [];
  let currentParts: PlacedPart[] = [];

  function newSheet() {
    if (currentParts.length > 0) {
      sheets.push(finishSheet(sheetIndex++, currentParts));
    }
    shelves = [];
    currentParts = [];
  }

  function finishSheet(idx: number, placed: PlacedPart[]): SheetLayout {
    const used = placed.reduce((s, p) => s + p.w * p.h, 0);
    return {
      sheetIndex: idx,
      parts: placed,
      wasteArea: SHEET_WIDTH * SHEET_HEIGHT - used,
    };
  }

  newSheet();

  for (const part of parts) {
    const orientations: [number, number][] = [
      [part.w, part.h],
      [part.h, part.w],
    ];

    let placed = false;
    for (const [pw, ph] of orientations) {
      if (pw > SHEET_WIDTH || ph > SHEET_HEIGHT) continue;

      for (const shelf of shelves) {
        if (shelf.y + ph + kerf <= SHEET_HEIGHT && shelf.x + pw + kerf <= SHEET_WIDTH) {
          currentParts.push({
            ...part,
            x: shelf.x,
            y: shelf.y,
            w: pw,
            h: ph,
            rotated: pw !== part.w,
          });
          shelf.x += pw + kerf;
          placed = true;
          break;
        }
      }

      if (!placed) {
        const shelfY = shelves.length === 0 ? 0 : Math.max(...shelves.map((s) => s.y + s.h)) + kerf;
        if (shelfY + ph <= SHEET_HEIGHT) {
          currentParts.push({
            ...part,
            x: 0,
            y: shelfY,
            w: pw,
            h: ph,
            rotated: pw !== part.w,
          });
          shelves.push({ x: pw + kerf, y: shelfY, w: SHEET_WIDTH - pw - kerf, h: ph });
          placed = true;
          break;
        }
      }
      if (placed) break;
    }

    if (!placed) {
      newSheet();
      const [pw, ph] = orientations[0];
      if (pw <= SHEET_WIDTH && ph <= SHEET_HEIGHT) {
        currentParts.push({ ...part, x: 0, y: 0, w: pw, h: ph, rotated: false });
        shelves.push({ x: pw + kerf, y: 0, w: SHEET_WIDTH - pw - kerf, h: ph });
      }
    }
  }

  if (currentParts.length > 0) {
    sheets.push(finishSheet(sheetIndex, currentParts));
  }

  return { sheets, kerf, sheetW: SHEET_WIDTH, sheetH: SHEET_HEIGHT };
}

export interface ManualSheetPartInput {
  label: string;
  w: number;
  h: number;
  /** When true, grain runs along height — no rotation allowed. */
  grainLocked?: boolean;
}

/** 2D shelf first-fit with custom sheet size and optional grain lock per part. */
export function optimizeManualSheetNesting(
  parts: ManualSheetPartInput[],
  sheetW = SHEET_WIDTH,
  sheetH = SHEET_HEIGHT,
  kerf = SHEET_KERF
): SheetNestingPlan {
  const expanded: (SheetPart & { grainLocked?: boolean })[] = parts
    .map((p) => ({
      memberId: p.label,
      label: p.label,
      w: Math.min(p.w, p.h),
      h: Math.max(p.w, p.h),
      grainLocked: p.grainLocked,
    }))
    .sort((a, b) => b.h * b.w - a.h * a.w);

  const sheets: SheetLayout[] = [];
  let sheetIndex = 0;
  let shelves: Rect[] = [];
  let currentParts: PlacedPart[] = [];

  function finishSheet(idx: number, placed: PlacedPart[]): SheetLayout {
    const used = placed.reduce((s, p) => s + p.w * p.h, 0);
    return {
      sheetIndex: idx,
      parts: placed,
      wasteArea: sheetW * sheetH - used,
    };
  }

  function newSheet() {
    if (currentParts.length > 0) {
      sheets.push(finishSheet(sheetIndex++, currentParts));
    }
    shelves = [];
    currentParts = [];
  }

  newSheet();

  for (const part of expanded) {
    const orientations: [number, number][] = part.grainLocked
      ? [[part.w, part.h]]
      : [
          [part.w, part.h],
          [part.h, part.w],
        ];

    let placed = false;
    for (const [pw, ph] of orientations) {
      if (pw > sheetW || ph > sheetH) continue;

      for (const shelf of shelves) {
        if (shelf.y + ph + kerf <= sheetH && shelf.x + pw + kerf <= sheetW) {
          currentParts.push({
            memberId: part.memberId,
            label: part.label,
            x: shelf.x,
            y: shelf.y,
            w: pw,
            h: ph,
            rotated: pw !== part.w,
          });
          shelf.x += pw + kerf;
          placed = true;
          break;
        }
      }

      if (!placed) {
        const shelfY = shelves.length === 0 ? 0 : Math.max(...shelves.map((s) => s.y + s.h)) + kerf;
        if (shelfY + ph <= sheetH) {
          currentParts.push({
            memberId: part.memberId,
            label: part.label,
            x: 0,
            y: shelfY,
            w: pw,
            h: ph,
            rotated: pw !== part.w,
          });
          shelves.push({ x: pw + kerf, y: shelfY, w: sheetW - pw - kerf, h: ph });
          placed = true;
          break;
        }
      }
      if (placed) break;
    }

    if (!placed) {
      newSheet();
      const [pw, ph] = orientations[0] ?? [part.w, part.h];
      if (pw <= sheetW && ph <= sheetH) {
        currentParts.push({
          memberId: part.memberId,
          label: part.label,
          x: 0,
          y: 0,
          w: pw,
          h: ph,
          rotated: false,
        });
        shelves.push({ x: pw + kerf, y: 0, w: sheetW - pw - kerf, h: ph });
      }
    }
  }

  if (currentParts.length > 0) {
    sheets.push(finishSheet(sheetIndex, currentParts));
  }

  return { sheets, kerf, sheetW, sheetH };
}
