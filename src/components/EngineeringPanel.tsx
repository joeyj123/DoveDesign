import { useMemo } from 'react';
import { useAppStore } from '../store';
import { analyzeProjectDeflection, DEFLECTION_LIMIT_RATIO } from '../lib/engineering';

export default function EngineeringPanel() {
  const members = useAppStore((s) => s.project.members);
  const updateMember = useAppStore((s) => s.updateMember);

  const results = useMemo(() => analyzeProjectDeflection(members), [members]);
  const failures = results.filter((r) => r.exceedsLimit);

  if (members.length === 0) {
    return (
      <p className="text-base text-zinc-400">
        Add boards to run structural deflection analysis.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-zinc-400">
        Uniform load beam deflection · Limit L/{DEFLECTION_LIMIT_RATIO}
      </p>

      {failures.length > 0 && (
        <div className="rounded-xl border-2 border-red-500/60 bg-red-950/40 px-3 py-2">
          <p className="text-base font-semibold text-red-300">
            {failures.length} board{failures.length > 1 ? 's' : ''} exceed deflection limit
          </p>
        </div>
      )}

      {members.map((member) => {
        const result = results.find((r) => r.memberId === member.id)!;
        return (
          <div
            key={member.id}
            className={[
              'rounded-xl border p-3 space-y-2',
              result.exceedsLimit
                ? 'border-red-500/50 bg-red-950/20'
                : 'border-zinc-800/80 bg-zinc-900/60',
            ].join(' ')}
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-base font-semibold text-zinc-100">{member.label}</p>
              {result.exceedsLimit && (
                <span className="shrink-0 rounded-lg border-2 border-red-400 bg-red-900/60 px-2 py-0.5 text-sm font-semibold text-red-200">
                  Sag Warning
                </span>
              )}
            </div>

            <label className="flex flex-col gap-1 text-base">
              Uniform Load (lbs)
              <input
                type="number"
                min="0"
                step="10"
                className="input-field"
                value={member.loadLbs}
                onChange={(e) =>
                  updateMember(member.id, { loadLbs: parseFloat(e.target.value) || 0 })
                }
              />
            </label>

            <label className="flex flex-col gap-1 text-base">
              Orientation
              <select
                className="input-field"
                value={member.orientation}
                onChange={(e) =>
                  updateMember(member.id, {
                    orientation: e.target.value as 'flat' | 'onEdge',
                  })
                }
              >
                <option value="flat">Flat (face up)</option>
                <option value="onEdge">On Edge</option>
              </select>
            </label>

            <div className="font-mono text-sm text-zinc-400 space-y-0.5 pt-1">
              <p>Span: <span className="mono-num">{result.spanIn}</span>" · {result.species}</p>
              <p>
                δ <span className="mono-num">{result.deflectionIn.toFixed(4)}</span>"
                · limit <span className="mono-num">{result.limitIn.toFixed(4)}</span>"
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
