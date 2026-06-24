import { useState, useMemo, useCallback } from 'react';
import { useAppStore } from '../store';
import {
  optimizeManualLumber,
  formatStockLength,
  SAW_KERF_INCHES,
  type ManualCutPart,
} from '../lib/nesting';
import {
  optimizeManualSheetNesting,
  SHEET_WIDTH,
  SHEET_HEIGHT,
  type ManualSheetPartInput,
  type SheetNestingPlan,
} from '../lib/sheetNesting';
import type { NestingStock } from '../types';

type OptimizerMode = 'lumber' | 'sheet';

interface LumberCutRow {
  id: string;
  label: string;
  length: number;
  qty: number;
}

interface SheetPanelRow {
  id: string;
  label: string;
  w: number;
  h: number;
  qty: number;
  grainLocked: boolean;
}

interface StockRow {
  id: string;
  lengthIn: number;
}

let rowId = 0;
function nextId() {
  rowId += 1;
  return `row-${rowId}`;
}

function colorForLabel(label: string): string {
  let h = 0;
  for (let i = 0; i < label.length; i++) h = (h * 31 + label.charCodeAt(i)) % 360;
  return `hsl(${h}, 60%, 42%)`;
}

function expandLumberCuts(rows: LumberCutRow[]): ManualCutPart[] {
  const out: ManualCutPart[] = [];
  for (const row of rows) {
    const n = Math.max(1, Math.round(row.qty));
    for (let i = 0; i < n; i++) {
      out.push({
        label: n > 1 ? `${row.label} (${i + 1})` : row.label,
        length: row.length,
        memberId: row.id,
      });
    }
  }
  return out;
}

function expandSheetParts(rows: SheetPanelRow[]): ManualSheetPartInput[] {
  const out: ManualSheetPartInput[] = [];
  for (const row of rows) {
    const n = Math.max(1, Math.round(row.qty));
    for (let i = 0; i < n; i++) {
      out.push({
        label: n > 1 ? `${row.label} (${i + 1})` : row.label,
        w: row.w,
        h: row.h,
        grainLocked: row.grainLocked,
      });
    }
  }
  return out;
}

function LumberBoardSvg({
  stocks,
  kerf,
}: {
  stocks: NestingStock[];
  kerf: number;
}) {
  const maxLen = Math.max(...stocks.map((s) => s.stockLength), 1);
  const rowH = 36;
  const pad = 8;
  const barW = 320;
  const totalH = pad * 2 + stocks.length * (rowH + 6);

  return (
    <svg
      viewBox={`0 0 ${barW + pad * 2} ${totalH}`}
      className="w-full rounded-lg border-2 border-zinc-700 bg-zinc-900"
      role="img"
      aria-label="Lumber cut layout diagram"
    >
      {stocks.map((stock, si) => {
        const y = pad + si * (rowH + 6);
        const scale = barW / maxLen;
        let x = pad;
        return (
          <g key={si}>
            <text x={pad} y={y - 2} fill="#a1a1aa" fontSize="10" fontFamily="monospace">
              Board {si + 1} — {formatStockLength(stock.stockLength)}
            </text>
            <rect x={pad} y={y + 4} width={stock.stockLength * scale} height={rowH - 8} fill="#3f3f46" stroke="#71717a" />
            {stock.parts.map((part, pi) => {
              const w = part.length * scale;
              const px = x;
              x += w + kerf * scale;
              return (
                <g key={pi}>
                  <rect x={px} y={y + 4} width={w} height={rowH - 8} fill={colorForLabel(part.label)} stroke="#27272a" />
                  <text
                    x={px + 3}
                    y={y + rowH / 2 + 2}
                    fill="#fafafa"
                    fontSize="9"
                    fontFamily="sans-serif"
                  >
                    {part.label.length > 14 ? `${part.label.slice(0, 12)}…` : part.label} ({part.length}&quot;)
                  </text>
                </g>
              );
            })}
            {stock.waste > 0 && (
              <rect
                x={x}
                y={y + 4}
                width={Math.max(0, stock.waste * scale)}
                height={rowH - 8}
                fill="#52525b"
                stroke="#71717a"
                strokeDasharray="3 2"
              />
            )}
          </g>
        );
      })}
    </svg>
  );
}

function SheetLayoutSvg({ plan }: { plan: SheetNestingPlan }) {
  const pad = 10;
  const gap = 12;
  const drawW = 300;
  const scale = drawW / plan.sheetW;
  const drawH = plan.sheetH * scale;
  const totalH = pad * 2 + plan.sheets.length * drawH + Math.max(0, plan.sheets.length - 1) * gap;

  return (
    <svg
      viewBox={`0 0 ${drawW + pad * 2} ${totalH}`}
      className="w-full rounded-lg border-2 border-zinc-700 bg-zinc-900"
      role="img"
      aria-label="Sheet layout diagram"
    >
      {plan.sheets.map((sheet, si) => {
        const oy = pad + si * (drawH + gap);

        return (
          <g key={si}>
            <text x={pad} y={oy - 3} fill="#a1a1aa" fontSize="10" fontFamily="monospace">
              Sheet {si + 1}
            </text>
            <rect x={pad} y={oy} width={drawW} height={drawH} fill="#3f3f46" stroke="#71717a" />
            {sheet.parts.map((part, pi) => (
              <g key={pi}>
                <rect
                  x={pad + part.x * scale}
                  y={oy + part.y * scale}
                  width={part.w * scale}
                  height={part.h * scale}
                  fill={colorForLabel(part.label)}
                  stroke="#27272a"
                />
                <text
                  x={pad + part.x * scale + 3}
                  y={oy + part.y * scale + 11}
                  fill="#fafafa"
                  fontSize="8"
                  fontFamily="sans-serif"
                >
                  {part.label.slice(0, 10)}
                </text>
              </g>
            ))}
            {/* waste hint: sheet minus union — simplified as label */}
            <text x={pad + drawW - 4} y={oy + drawH - 4} fill="#71717a" fontSize="8" textAnchor="end">
              waste {sheet.wasteArea.toFixed(0)} sq in
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default function CutOptimizerPanel() {
  const members = useAppStore((s) => s.project.members);

  const [mode, setMode] = useState<OptimizerMode>('lumber');
  const [stockRows, setStockRows] = useState<StockRow[]>([
    { id: nextId(), lengthIn: 96 },
    { id: nextId(), lengthIn: 120 },
    { id: nextId(), lengthIn: 144 },
  ]);
  const [lumberCuts, setLumberCuts] = useState<LumberCutRow[]>([]);
  const [sheetPanels, setSheetPanels] = useState<SheetPanelRow[]>([]);
  const [kerf, setKerf] = useState(SAW_KERF_INCHES);
  const [sheetW, setSheetW] = useState(SHEET_WIDTH);
  const [sheetH, setSheetH] = useState(SHEET_HEIGHT);
  const [lumberResult, setLumberResult] = useState<NestingStock[] | null>(null);
  const [sheetResult, setSheetResult] = useState<SheetNestingPlan | null>(null);
  const [useProjectCuts, setUseProjectCuts] = useState(true);

  const projectLumberCuts = useMemo((): LumberCutRow[] => {
    return members
      .filter((m) => m.materialKind === 'dimensional')
      .map((m) => ({
        id: m.id,
        label: m.label,
        length: m.length,
        qty: 1,
      }));
  }, [members]);

  const projectSheetPanels = useMemo((): SheetPanelRow[] => {
    return members
      .filter((m) => m.materialKind === 'sheet')
      .map((m) => ({
        id: m.id,
        label: m.label,
        w: m.width,
        h: m.length,
        qty: 1,
        grainLocked: false,
      }));
  }, [members]);

  const activeLumberCuts = useProjectCuts ? projectLumberCuts : lumberCuts;
  const activeSheetPanels = useProjectCuts ? projectSheetPanels : sheetPanels;

  const loadFromProject = useCallback(() => {
    setUseProjectCuts(true);
    setLumberResult(null);
    setSheetResult(null);
  }, []);

  const runLumberOptimize = useCallback(() => {
    const lengths = stockRows.map((r) => r.lengthIn).filter((l) => l > 0);
    const parts = expandLumberCuts(activeLumberCuts);
    setLumberResult(optimizeManualLumber(parts, lengths, kerf));
    setSheetResult(null);
  }, [stockRows, activeLumberCuts, kerf]);

  const runSheetOptimize = useCallback(() => {
    const parts = expandSheetParts(activeSheetPanels);
    setSheetResult(optimizeManualSheetNesting(parts, sheetW, sheetH, kerf));
    setLumberResult(null);
  }, [activeSheetPanels, sheetW, sheetH, kerf]);

  const lumberStats = useMemo(() => {
    if (!lumberResult || lumberResult.length === 0) return null;
    const totalWaste = lumberResult.reduce((s, st) => s + st.waste, 0);
    const totalStock = lumberResult.reduce((s, st) => s + st.stockLength, 0);
    const pct = totalStock > 0 ? (totalWaste / totalStock) * 100 : 0;
    return { boards: lumberResult.length, totalWaste, pct };
  }, [lumberResult]);

  const sheetStats = useMemo(() => {
    if (!sheetResult || sheetResult.sheets.length === 0) return null;
    const sheetArea = sheetResult.sheetW * sheetResult.sheetH;
    const totalWaste = sheetResult.sheets.reduce((s, sh) => s + sh.wasteArea, 0);
    const totalArea = sheetResult.sheets.length * sheetArea;
    const pct = totalArea > 0 ? (totalWaste / totalArea) * 100 : 0;
    return { sheets: sheetResult.sheets.length, totalWaste, pct };
  }, [sheetResult]);

  const copyLumberList = useCallback(() => {
    if (!lumberResult) return;
    const lines: string[] = ['LUMBER CUT OPTIMIZER', `Kerf: ${kerf}"`, ''];
    lumberResult.forEach((stock, i) => {
      lines.push(`Board ${i + 1} (${formatStockLength(stock.stockLength)}):`);
      stock.parts.forEach((p) => lines.push(`  ${p.label} — ${p.length}"`));
      lines.push(`  Waste: ${stock.waste.toFixed(2)}"`);
      lines.push('');
    });
    if (lumberStats) {
      lines.push(`Total boards: ${lumberStats.boards}`);
      lines.push(`Total waste: ${lumberStats.totalWaste.toFixed(2)}" (${lumberStats.pct.toFixed(1)}%)`);
    }
    void navigator.clipboard.writeText(lines.join('\n'));
  }, [lumberResult, kerf, lumberStats]);

  const copySheetLayout = useCallback(() => {
    if (!sheetResult) return;
    const lines: string[] = [
      'SHEET CUT OPTIMIZER',
      `Sheet: ${sheetResult.sheetW}" × ${sheetResult.sheetH}"`,
      `Kerf: ${sheetResult.kerf}"`,
      '',
    ];
    sheetResult.sheets.forEach((sheet) => {
      lines.push(`Sheet ${sheet.sheetIndex + 1}:`);
      sheet.parts.forEach((p) => {
        lines.push(
          `  ${p.label} — ${p.w}" × ${p.h}" at (${p.x}, ${p.y})${p.rotated ? ' [rotated]' : ''}`
        );
      });
      lines.push(`  Waste area: ${sheet.wasteArea.toFixed(1)} sq in`);
      lines.push('');
    });
    if (sheetStats) {
      lines.push(`Total sheets: ${sheetStats.sheets}`);
      lines.push(`Total waste: ${sheetStats.totalWaste.toFixed(1)} sq in (${sheetStats.pct.toFixed(1)}%)`);
    }
    void navigator.clipboard.writeText(lines.join('\n'));
  }, [sheetResult, sheetStats]);

  return (
    <div className="space-y-4 text-base">
      <div>
        <h2 className="text-base font-bold text-amber-300 mb-1">Cut Optimizer</h2>
        <p className="text-sm text-zinc-400">
          Pack lumber lengths or sheet panels to minimize waste. Results update when you click Run.
        </p>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setMode('lumber')}
          className={[
            'flex-1 text-base px-2 py-2 rounded-lg border-2 font-medium',
            mode === 'lumber'
              ? 'border-amber-500 bg-amber-950/40 text-amber-200'
              : 'border-zinc-700 text-zinc-400 hover:border-zinc-600',
          ].join(' ')}
        >
          Lumber (1D)
        </button>
        <button
          type="button"
          onClick={() => setMode('sheet')}
          className={[
            'flex-1 text-base px-2 py-2 rounded-lg border-2 font-medium',
            mode === 'sheet'
              ? 'border-amber-500 bg-amber-950/40 text-amber-200'
              : 'border-zinc-700 text-zinc-400 hover:border-zinc-600',
          ].join(' ')}
        >
          Sheet (2D)
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <button type="button" className="btn-secondary text-base" onClick={loadFromProject}>
          Load from project
        </button>
        <button
          type="button"
          className="btn-secondary text-base"
          onClick={() => {
            setUseProjectCuts(false);
            setLumberResult(null);
            setSheetResult(null);
          }}
        >
          Manual entry
        </button>
      </div>

      <label className="flex flex-col gap-1 text-base text-zinc-300">
        Kerf (inches)
        <input
          type="number"
          step="0.0625"
          min="0"
          className="input-field text-base"
          value={kerf}
          onChange={(e) => setKerf(Number(e.target.value) || 0)}
        />
      </label>

      {mode === 'lumber' && (
        <>
          <div>
            <p className="text-base font-semibold text-zinc-200 mb-2">Available stock lengths</p>
            <ul className="space-y-2">
              {stockRows.map((row) => (
                <li key={row.id} className="flex gap-2 items-center">
                  <label className="flex-1 flex flex-col gap-0.5 text-sm text-zinc-400">
                    Length (inches)
                    <input
                      type="number"
                      min="1"
                      className="input-field text-base"
                      value={row.lengthIn}
                      onChange={(e) =>
                        setStockRows((rows) =>
                          rows.map((r) =>
                            r.id === row.id ? { ...r, lengthIn: Number(e.target.value) || 0 } : r
                          )
                        )
                      }
                    />
                  </label>
                  <button
                    type="button"
                    className="text-base text-red-400 border-2 border-red-800 px-2 py-1 rounded-lg mt-5"
                    onClick={() => setStockRows((rows) => rows.filter((r) => r.id !== row.id))}
                    aria-label="Remove stock length"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
            <button
              type="button"
              className="mt-2 text-base text-amber-400 underline"
              onClick={() => setStockRows((rows) => [...rows, { id: nextId(), lengthIn: 96 }])}
            >
              Add stock length
            </button>
          </div>

          {!useProjectCuts && (
            <div>
              <p className="text-base font-semibold text-zinc-200 mb-2">Manual cuts</p>
              <ul className="space-y-2">
                {lumberCuts.map((row) => (
                  <li key={row.id} className="grid grid-cols-2 gap-2 border-2 border-zinc-800 p-2 rounded-lg">
                    <label className="col-span-2 flex flex-col gap-0.5 text-sm text-zinc-400">
                      Label
                      <input
                        className="input-field text-base"
                        value={row.label}
                        onChange={(e) =>
                          setLumberCuts((rows) =>
                            rows.map((r) => (r.id === row.id ? { ...r, label: e.target.value } : r))
                          )
                        }
                      />
                    </label>
                    <label className="flex flex-col gap-0.5 text-sm text-zinc-400">
                      Length (in)
                      <input
                        type="number"
                        min="0.125"
                        className="input-field text-base"
                        value={row.length}
                        onChange={(e) =>
                          setLumberCuts((rows) =>
                            rows.map((r) =>
                              r.id === row.id ? { ...r, length: Number(e.target.value) || 0 } : r
                            )
                          )
                        }
                      />
                    </label>
                    <label className="flex flex-col gap-0.5 text-sm text-zinc-400">
                      Qty
                      <input
                        type="number"
                        min="1"
                        className="input-field text-base"
                        value={row.qty}
                        onChange={(e) =>
                          setLumberCuts((rows) =>
                            rows.map((r) =>
                              r.id === row.id ? { ...r, qty: Number(e.target.value) || 1 } : r
                            )
                          )
                        }
                      />
                    </label>
                    <button
                      type="button"
                      className="col-span-2 text-base text-red-400"
                      onClick={() => setLumberCuts((rows) => rows.filter((r) => r.id !== row.id))}
                    >
                      Remove cut
                    </button>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                className="mt-2 text-base text-amber-400 underline"
                onClick={() =>
                  setLumberCuts((rows) => [
                    ...rows,
                    { id: nextId(), label: 'Part', length: 24, qty: 1 },
                  ])
                }
              >
                Add cut
              </button>
            </div>
          )}

          {useProjectCuts && activeLumberCuts.length === 0 && (
            <p className="text-base text-zinc-400">No dimensional lumber in the project. Add boards or switch to manual entry.</p>
          )}

          <button type="button" className="btn-primary w-full text-base" onClick={runLumberOptimize}>
            Optimize Cuts
          </button>

          {lumberResult && lumberResult.length > 0 && (
            <div className="space-y-3">
              {lumberStats && (
                <p className="text-base text-zinc-200">
                  <span className="font-semibold">{lumberStats.boards}</span> boards needed ·{' '}
                  <span className="font-semibold">{lumberStats.totalWaste.toFixed(1)}&quot;</span> total waste ·{' '}
                  <span className="font-semibold">{lumberStats.pct.toFixed(1)}%</span> waste
                </p>
              )}
              <LumberBoardSvg stocks={lumberResult} kerf={kerf} />
              <button type="button" className="btn-secondary w-full text-base" onClick={copyLumberList}>
                Copy Cut List
              </button>
            </div>
          )}
        </>
      )}

      {mode === 'sheet' && (
        <>
          <div className="grid grid-cols-2 gap-2">
            <label className="flex flex-col gap-1 text-base text-zinc-300">
              Sheet width (in)
              <input
                type="number"
                min="1"
                className="input-field text-base"
                value={sheetW}
                onChange={(e) => setSheetW(Number(e.target.value) || SHEET_WIDTH)}
              />
            </label>
            <label className="flex flex-col gap-1 text-base text-zinc-300">
              Sheet height (in)
              <input
                type="number"
                min="1"
                className="input-field text-base"
                value={sheetH}
                onChange={(e) => setSheetH(Number(e.target.value) || SHEET_HEIGHT)}
              />
            </label>
          </div>

          {!useProjectCuts && (
            <div>
              <p className="text-base font-semibold text-zinc-200 mb-2">Manual panels</p>
              <ul className="space-y-2">
                {sheetPanels.map((row) => (
                  <li key={row.id} className="grid grid-cols-2 gap-2 border-2 border-zinc-800 p-2 rounded-lg">
                    <label className="col-span-2 flex flex-col gap-0.5 text-sm text-zinc-400">
                      Label
                      <input
                        className="input-field text-base"
                        value={row.label}
                        onChange={(e) =>
                          setSheetPanels((rows) =>
                            rows.map((r) => (r.id === row.id ? { ...r, label: e.target.value } : r))
                          )
                        }
                      />
                    </label>
                    <label className="flex flex-col gap-0.5 text-sm text-zinc-400">
                      Width (in)
                      <input
                        type="number"
                        min="0.125"
                        className="input-field text-base"
                        value={row.w}
                        onChange={(e) =>
                          setSheetPanels((rows) =>
                            rows.map((r) =>
                              r.id === row.id ? { ...r, w: Number(e.target.value) || 0 } : r
                            )
                          )
                        }
                      />
                    </label>
                    <label className="flex flex-col gap-0.5 text-sm text-zinc-400">
                      Height (in)
                      <input
                        type="number"
                        min="0.125"
                        className="input-field text-base"
                        value={row.h}
                        onChange={(e) =>
                          setSheetPanels((rows) =>
                            rows.map((r) =>
                              r.id === row.id ? { ...r, h: Number(e.target.value) || 0 } : r
                            )
                          )
                        }
                      />
                    </label>
                    <label className="flex flex-col gap-0.5 text-sm text-zinc-400">
                      Qty
                      <input
                        type="number"
                        min="1"
                        className="input-field text-base"
                        value={row.qty}
                        onChange={(e) =>
                          setSheetPanels((rows) =>
                            rows.map((r) =>
                              r.id === row.id ? { ...r, qty: Number(e.target.value) || 1 } : r
                            )
                          )
                        }
                      />
                    </label>
                    <label className="flex items-center gap-2 text-base text-zinc-300 col-span-2">
                      <input
                        type="checkbox"
                        checked={row.grainLocked}
                        onChange={(e) =>
                          setSheetPanels((rows) =>
                            rows.map((r) =>
                              r.id === row.id ? { ...r, grainLocked: e.target.checked } : r
                            )
                          )
                        }
                      />
                      Lock grain direction (no rotation)
                    </label>
                    <button
                      type="button"
                      className="col-span-2 text-base text-red-400"
                      onClick={() => setSheetPanels((rows) => rows.filter((r) => r.id !== row.id))}
                    >
                      Remove panel
                    </button>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                className="mt-2 text-base text-amber-400 underline"
                onClick={() =>
                  setSheetPanels((rows) => [
                    ...rows,
                    { id: nextId(), label: 'Panel', w: 12, h: 24, qty: 1, grainLocked: false },
                  ])
                }
              >
                Add panel
              </button>
            </div>
          )}

          {useProjectCuts && activeSheetPanels.length === 0 && (
            <p className="text-base text-zinc-400">No sheet goods in the project. Add sheet boards or use manual entry.</p>
          )}

          <button type="button" className="btn-primary w-full text-base" onClick={runSheetOptimize}>
            Optimize Sheets
          </button>

          {sheetResult && sheetResult.sheets.length > 0 && (
            <div className="space-y-3">
              {sheetStats && (
                <p className="text-base text-zinc-200">
                  <span className="font-semibold">{sheetStats.sheets}</span> sheets needed ·{' '}
                  <span className="font-semibold">{sheetStats.totalWaste.toFixed(0)}</span> sq in waste ·{' '}
                  <span className="font-semibold">{sheetStats.pct.toFixed(1)}%</span> waste
                </p>
              )}
              <SheetLayoutSvg plan={sheetResult} />
              <button type="button" className="btn-secondary w-full text-base" onClick={copySheetLayout}>
                Copy Layout
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
