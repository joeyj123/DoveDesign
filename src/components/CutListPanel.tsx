import { useEffect, useRef } from 'react';
import { useAppStore } from '../store';
import { optimizeCutList } from '../lib/nesting';
import { optimizeSheetNesting } from '../lib/sheetNesting';

function SheetCanvas({ plan }: { plan: ReturnType<typeof optimizeSheetNesting> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = 480;
    const padding = 10;
    const gap = 16;
    const scaleX = (W - padding * 2) / plan.sheetW;
    const scaleY = 240 / plan.sheetH;
    const scale = Math.min(scaleX, scaleY);
    const sheetDrawH = plan.sheetH * scale;
    const totalH = padding * 2 + plan.sheets.length * sheetDrawH + Math.max(0, plan.sheets.length - 1) * gap;

    canvas.width = W;
    canvas.height = Math.max(240, totalH);

    ctx.fillStyle = '#18181b';
    ctx.fillRect(0, 0, W, totalH);

    plan.sheets.forEach((sheet, si) => {
      const ox = padding;
      const oy = padding + si * (sheetDrawH + gap);

      ctx.strokeStyle = '#52525b';
      ctx.lineWidth = 1;
      ctx.strokeRect(ox, oy, plan.sheetW * scale, sheetDrawH);
      ctx.fillStyle = '#27272a';
      ctx.fillRect(ox, oy, plan.sheetW * scale, sheetDrawH);

      for (const part of sheet.parts) {
        ctx.fillStyle = '#d97706';
        ctx.fillRect(
          ox + part.x * scale,
          oy + part.y * scale,
          part.w * scale,
          part.h * scale
        );
        ctx.strokeStyle = '#78350f';
        ctx.strokeRect(
          ox + part.x * scale,
          oy + part.y * scale,
          part.w * scale,
          part.h * scale
        );
        ctx.fillStyle = '#fef3c7';
        ctx.font = '9px monospace';
        ctx.fillText(
          part.label.slice(0, 10),
          ox + part.x * scale + 2,
          oy + part.y * scale + 10
        );
      }

      ctx.fillStyle = '#71717a';
      ctx.font = '10px monospace';
      ctx.fillText(`Sheet ${si + 1}`, ox, oy - 4);
    });
  }, [plan]);

  const padding = 10;
  const gap = 16;
  const scale = Math.min((480 - padding * 2) / plan.sheetW, 240 / plan.sheetH);
  const sheetDrawH = plan.sheetH * scale;
  const canvasHeight = padding * 2 + plan.sheets.length * sheetDrawH + Math.max(0, plan.sheets.length - 1) * gap;

  return (
    <canvas
      ref={canvasRef}
      className="w-full rounded-lg border border-zinc-800"
      style={{ height: Math.max(120, canvasHeight) }}
    />
  );
}

export default function CutListPanel() {
  const members = useAppStore((s) => s.project.members);
  const fasteners = useAppStore((s) => s.project.fasteners);
  const edgeTreatments = useAppStore((s) => s.project.edgeTreatments);
  const lumberPlan = optimizeCutList(members);
  const sheetPlan = optimizeSheetNesting(members);

  const fastenerCounts = fasteners.reduce<Record<string, number>>((acc, f) => {
    acc[f.type] = (acc[f.type] ?? 0) + 1;
    return acc;
  }, {});

  if (members.length === 0) {
    return (
      <p className="text-base text-zinc-400">
        Add boards to generate cut lists and sheet nesting layouts.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Dimensional Lumber Nesting
        </h3>
        <p className="text-sm text-zinc-400">
          Kerf: {lumberPlan.kerfInches}" · Stock: 8ft / 10ft / 12ft
        </p>
        {lumberPlan.groups.map((group) => (
          <div key={group.key} className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 space-y-2">
            <p className="text-sm font-medium text-zinc-200">
              {group.species} · {group.nominalSize} ({group.totalStockUsed} sticks)
            </p>
            {group.stocks.map((stock, si) => (
              <div key={si} className="space-y-1">
                <p className="text-xs text-zinc-500">Stick #{si + 1} — {stock.stockLength / 12}ft</p>
                <div className="relative h-5 rounded bg-zinc-800 overflow-hidden">
                  {(() => {
                    let offset = 0;
                    return stock.parts.map((part) => {
                      const pct = (part.length / stock.stockLength) * 100;
                      const left = (offset / stock.stockLength) * 100;
                      offset += part.length + lumberPlan.kerfInches;
                      return (
                        <div
                          key={part.memberId}
                          className="absolute top-0 h-full bg-amber-600/70 border-r border-zinc-900"
                          style={{ left: `${left}%`, width: `${pct}%` }}
                          title={`${part.label}: ${part.length}"`}
                        />
                      );
                    });
                  })()}
                </div>
              </div>
            ))}
          </div>
        ))}
      </section>

      {sheetPlan.sheets.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Sheet Goods Nesting (48" × 96")
          </h3>
          <p className="text-sm text-zinc-400">
            Kerf spacing: {sheetPlan.kerf}" · {sheetPlan.sheets.length} sheet(s) required
          </p>
          <SheetCanvas plan={sheetPlan} />
          {sheetPlan.sheets.map((sheet) => (
            <ul key={sheet.sheetIndex} className="text-xs text-zinc-500 space-y-0.5">
              {sheet.parts.map((p) => (
                <li key={p.memberId}>
                  {p.label}: {p.w.toFixed(1)}" × {p.h.toFixed(1)}"
                  {p.rotated ? ' (rotated)' : ''}
                </li>
              ))}
            </ul>
          ))}
        </section>
      )}

      {edgeTreatments.length > 0 && (
        <section className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Edge Treatments
          </h3>
          <ul className="text-base text-zinc-300 space-y-1">
            {edgeTreatments.map((e) => {
              const m = members.find((mem) => mem.id === e.memberId);
              return (
                <li key={e.id}>
                  {m?.label ?? 'Board'} — edge {e.edgeIndex + 1}: {e.type}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {Object.keys(fastenerCounts).length > 0 && (
        <section className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Fasteners
          </h3>
          <ul className="text-base text-zinc-300 space-y-1">
            {Object.entries(fastenerCounts).map(([type, count]) => (
              <li key={type}>
                {type} × {count}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
