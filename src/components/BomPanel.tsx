import { useState, useMemo } from 'react';
import { useAppStore } from '../store';
import { calculateBom, exportBomCsv, DEFAULT_PRICES } from '../lib/bom';
import type { BomHardwareItem } from '../lib/bom';

export default function BomPanel() {
  const open = useAppStore((s) => s.ui.bomPanelOpen);
  const setBomPanelOpen = useAppStore((s) => s.setBomPanelOpen);
  const members = useAppStore((s) => s.project.members);
  const projectName = useAppStore((s) => s.project.name);

  const [priceOverrides, setPriceOverrides] = useState<Record<string, number>>({});
  const [hardware, setHardware] = useState<BomHardwareItem[]>([]);

  const lines = useMemo(
    () => calculateBom(members, priceOverrides),
    [members, priceOverrides]
  );

  const totalLumber = lines.reduce((s, l) => s + l.estimatedCostTotal, 0);
  const totalHardware = hardware.reduce((s, h) => s + h.quantity * h.unitCost, 0);
  const grandTotal = totalLumber + totalHardware;

  function setPrice(species: string, val: string) {
    const n = parseFloat(val);
    if (!isNaN(n) && n >= 0) {
      setPriceOverrides((p) => ({ ...p, [species]: n }));
    }
  }

  function addHardwareItem() {
    setHardware((h) => [...h, { id: crypto.randomUUID(), description: '', quantity: 1, unitCost: 0 }]);
  }

  function updateHardware(id: string, patch: Partial<BomHardwareItem>) {
    setHardware((h) => h.map((item) => item.id === id ? { ...item, ...patch } : item));
  }

  function removeHardware(id: string) {
    setHardware((h) => h.filter((item) => item.id !== id));
  }

  if (!open) return null;

  return (
    <div className="fixed right-0 top-0 h-full w-[420px] bg-zinc-900 border-l border-zinc-700 z-[500] flex flex-col shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 shrink-0">
        <h2 className="text-base font-bold text-zinc-100">Bill of Materials</h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => exportBomCsv(lines, hardware, projectName)}
            className="px-3 py-1 rounded text-sm font-semibold bg-amber-500/20 border border-amber-500/50 text-amber-300 hover:bg-amber-500/30 transition-colors"
          >
            Export CSV
          </button>
          <button
            type="button"
            onClick={() => setBomPanelOpen(false)}
            className="text-zinc-500 hover:text-zinc-200 transition-colors text-xl leading-none px-1"
          >
            ×
          </button>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Lumber table */}
        <section>
          <h3 className="text-sm font-semibold text-zinc-400 mb-2 uppercase tracking-wide">Lumber</h3>
          {lines.length === 0 ? (
            <p className="text-sm text-zinc-500 italic">Add some boards to your project to generate a materials list.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-zinc-300 border-collapse">
                <thead>
                  <tr className="text-zinc-500 border-b border-zinc-700">
                    <th className="text-left py-1 pr-2">Species</th>
                    <th className="text-left py-1 pr-2">Size</th>
                    <th className="text-right py-1 pr-2">Len (ft)</th>
                    <th className="text-right py-1 pr-2">Qty</th>
                    <th className="text-right py-1 pr-2">BF</th>
                    <th className="text-right py-1 pr-2">$/BF</th>
                    <th className="text-right py-1">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {lines.map((l) => (
                    <tr key={l.key} className="border-b border-zinc-800 hover:bg-zinc-800/40">
                      <td className="py-1 pr-2">{l.species}</td>
                      <td className="py-1 pr-2">{l.nominalSize}</td>
                      <td className="text-right py-1 pr-2">{l.lengthFt}</td>
                      <td className="text-right py-1 pr-2">{l.quantity}</td>
                      <td className="text-right py-1 pr-2">{l.totalBoardFeet.toFixed(1)}</td>
                      <td className="text-right py-1 pr-2">
                        <input
                          type="number"
                          min="0"
                          step="0.25"
                          className="w-14 bg-zinc-800 border border-zinc-700 rounded px-1 text-right text-xs text-amber-300 focus:outline-none focus:border-amber-500"
                          value={priceOverrides[l.species] ?? DEFAULT_PRICES[l.species] ?? 4}
                          onChange={(e) => setPrice(l.species, e.target.value)}
                        />
                      </td>
                      <td className="text-right py-1 font-semibold text-amber-400">
                        ${l.estimatedCostTotal.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Hardware section */}
        <section>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide">Hardware</h3>
            <button
              type="button"
              onClick={addHardwareItem}
              className="text-xs px-2 py-0.5 rounded border border-zinc-600 text-zinc-400 hover:text-zinc-200 hover:border-zinc-400 transition-colors"
            >
              + Add item
            </button>
          </div>

          {hardware.length === 0 ? (
            <p className="text-xs text-zinc-600 italic">No hardware items yet. Click "Add item" to add screws, brackets, etc.</p>
          ) : (
            <div className="space-y-1">
              {hardware.map((h) => (
                <div key={h.id} className="flex items-center gap-1">
                  <input
                    type="text"
                    placeholder="Description"
                    className="flex-1 bg-zinc-800 border border-zinc-700 rounded px-2 py-0.5 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
                    value={h.description}
                    onChange={(e) => updateHardware(h.id, { description: e.target.value })}
                  />
                  <input
                    type="number"
                    min="1"
                    className="w-10 bg-zinc-800 border border-zinc-700 rounded px-1 text-center text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
                    value={h.quantity}
                    onChange={(e) => updateHardware(h.id, { quantity: Math.max(1, parseInt(e.target.value) || 1) })}
                  />
                  <span className="text-zinc-600 text-xs">×</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="$0.00"
                    className="w-16 bg-zinc-800 border border-zinc-700 rounded px-1 text-right text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
                    value={h.unitCost || ''}
                    onChange={(e) => updateHardware(h.id, { unitCost: parseFloat(e.target.value) || 0 })}
                  />
                  <span className="text-amber-400 text-xs w-16 text-right">
                    ${(h.quantity * h.unitCost).toFixed(2)}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeHardware(h.id)}
                    className="text-zinc-600 hover:text-red-400 transition-colors text-xs px-1"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Footer total */}
      <div className="shrink-0 border-t border-zinc-700 px-4 py-3 flex items-center justify-between">
        <span className="text-sm text-zinc-400">Estimated Total</span>
        <span className="text-lg font-bold text-amber-400">${grandTotal.toFixed(2)}</span>
      </div>
    </div>
  );
}
