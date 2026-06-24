import { useMemo } from 'react';
import { useAppStore } from '../store';
import { buildMaterialLedger, calcEstimateTotals } from '../lib/estimating';
import type { PriceUnit } from '../types';

function fmt(n: number, dec = 2): string {
  return n.toFixed(dec);
}

function fmtMoney(n: number): string {
  return `$${n.toFixed(2)}`;
}

export default function EstimatingPanel() {
  const project = useAppStore((s) => s.project);
  const updateEstimating = useAppStore((s) => s.updateEstimating);
  const setMaterialPrice = useAppStore((s) => s.setMaterialPrice);
  const settings = project.estimating;

  const groups = useMemo(
    () => buildMaterialLedger(project.members, settings),
    [project.members, settings]
  );

  const totals = useMemo(
    () => calcEstimateTotals(project, settings),
    [project, settings]
  );

  const dimensional = groups.filter((g) => g.materialKind === 'dimensional');
  const sheet = groups.filter((g) => g.materialKind === 'sheet');

  function handlePriceChange(key: string, unit: PriceUnit, value: number) {
    setMaterialPrice(key, { unit, pricePerUnit: value });
  }

  function handleUnitChange(key: string, unit: PriceUnit, currentPrice: number) {
    setMaterialPrice(key, { unit, pricePerUnit: currentPrice });
  }

  if (project.members.length === 0) {
    return (
      <p className="text-base text-zinc-400">
        Add boards to the scene to build a material cost ledger.
      </p>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 mb-1">
          Estimating &amp; Takeoff
        </h2>
        <p className="text-sm text-zinc-400">
          Live material ledger — pricing updates propagate instantly.
        </p>
      </div>

      {dimensional.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Dimensional Lumber
          </h3>
          {dimensional.map((g) => (
            <LedgerRow
              key={g.key}
              group={g}
              onPriceChange={handlePriceChange}
              onUnitChange={handleUnitChange}
            />
          ))}
        </section>
      )}

      {sheet.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Sheet Goods
          </h3>
          {sheet.map((g) => (
            <LedgerRow
              key={g.key}
              group={g}
              onPriceChange={handlePriceChange}
              onUnitChange={handleUnitChange}
            />
          ))}
        </section>
      )}

      {/* Global estimate controls */}
      <section className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-4 space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Estimate Controls
        </h3>

        <label className="flex items-center justify-between gap-3 text-base">
          <span className="text-zinc-300">Waste buffer (+{settings.wasteBufferPercent}%)</span>
          <input
            type="checkbox"
            checked={settings.wasteBufferEnabled}
            onChange={(e) => updateEstimating({ wasteBufferEnabled: e.target.checked })}
            className="w-5 h-5 rounded border-zinc-600"
          />
        </label>

        {settings.wasteBufferEnabled && (
          <label className="flex flex-col gap-1 text-base">
            Waste %
            <input
              type="number"
              min="0"
              max="50"
              step="1"
              className="input-field mono-num"
              value={settings.wasteBufferPercent}
              onChange={(e) =>
                updateEstimating({ wasteBufferPercent: parseFloat(e.target.value) || 0 })
              }
            />
          </label>
        )}

        <label className="flex flex-col gap-1 text-base">
          Tax Rate (%)
          <input
            type="number"
            min="0"
            max="20"
            step="0.01"
            className="input-field mono-num"
            value={settings.taxRatePercent}
            onChange={(e) =>
              updateEstimating({ taxRatePercent: parseFloat(e.target.value) || 0 })
            }
          />
        </label>
      </section>

      {/* Totals */}
      <section className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 space-y-2 font-mono text-sm">
        <TotalRow label="Material subtotal" value={fmtMoney(totals.materialSubtotal)} />
        {totals.hardwareSubtotal > 0 && (
          <TotalRow label="Hardware" value={fmtMoney(totals.hardwareSubtotal)} />
        )}
        {totals.finishSubtotal > 0 && (
          <TotalRow label="Finishes" value={fmtMoney(totals.finishSubtotal)} />
        )}
        {settings.wasteBufferEnabled && totals.wasteAmount > 0 && (
          <TotalRow
            label={`Waste (+${settings.wasteBufferPercent}%)`}
            value={fmtMoney(totals.wasteAmount)}
          />
        )}
        <TotalRow label="Subtotal" value={fmtMoney(totals.subtotalBeforeTax)} />
        <TotalRow label={`Tax (${fmt(settings.taxRatePercent, 2)}%)`} value={fmtMoney(totals.taxAmount)} />
        <div className="flex justify-between pt-2 mt-2 border-t-2 border-amber-500/50 text-amber-400 text-base font-bold">
          <span>Grand Total</span>
          <span>{fmtMoney(totals.grandTotal)}</span>
        </div>
      </section>
    </div>
  );
}

function TotalRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-zinc-400">
      <span>{label}</span>
      <span className="text-zinc-200">{value}</span>
    </div>
  );
}

interface LedgerRowProps {
  group: ReturnType<typeof buildMaterialLedger>[0];
  onPriceChange: (key: string, unit: PriceUnit, price: number) => void;
  onUnitChange: (key: string, unit: PriceUnit, price: number) => void;
}

function LedgerRow({ group, onPriceChange, onUnitChange }: LedgerRowProps) {
  const qtyLabel =
    group.materialKind === 'sheet'
      ? `${group.totalSquareFeet.toFixed(1)} SF`
      : group.priceUnit === 'BF'
        ? `${group.totalBoardFeet.toFixed(2)} BF`
        : `${group.totalLinearFeet.toFixed(1)} LF`;

  const unitOptions: PriceUnit[] =
    group.materialKind === 'sheet' ? ['SF'] : ['LF', 'BF'];

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 space-y-2">
      <div className="flex justify-between items-start gap-2">
        <div>
          <p className="text-base font-medium text-zinc-100">{group.species}</p>
          <p className="text-xs text-zinc-500">
            {group.nominalSize} · {group.thickness}" × {group.width}" · {group.memberCount} pc
          </p>
        </div>
        <span className="mono-num text-sm text-zinc-300 whitespace-nowrap">{qtyLabel}</span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {group.materialKind !== 'sheet' && (
          <label className="flex flex-col gap-1 text-sm">
            Unit
            <select
              className="input-field text-sm"
              value={group.priceUnit}
              onChange={(e) =>
                onUnitChange(group.key, e.target.value as PriceUnit, group.pricePerUnit)
              }
            >
              {unitOptions.map((u) => (
                <option key={u} value={u}>
                  {u === 'LF' ? '$/LF' : u === 'BF' ? '$/BF' : '$/SF'}
                </option>
              ))}
            </select>
          </label>
        )}
        <label className={`flex flex-col gap-1 text-sm ${group.materialKind === 'sheet' ? 'col-span-2' : ''}`}>
          Price / {group.materialKind === 'sheet' ? 'SF' : group.priceUnit}
          <input
            type="number"
            min="0"
            step="0.01"
            className="input-field mono-num text-sm"
            value={group.pricePerUnit}
            onChange={(e) =>
              onPriceChange(group.key, group.priceUnit, parseFloat(e.target.value) || 0)
            }
          />
        </label>
      </div>

      <div className="flex justify-between text-sm font-mono pt-1 border-t border-zinc-800">
        <span className="text-zinc-500">Subtotal</span>
        <span className="text-zinc-200">${group.subtotal.toFixed(2)}</span>
      </div>
    </div>
  );
}
