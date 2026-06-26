import { useAppStore } from '../store';
import { calcBoardFeet } from '../lib/boardFeet';
import { getDensityFromCatalog } from '../lib/materials';
import type { WoodMember } from '../types';
import { radToDeg, degToRad, ANGLE_SNAP_OPTIONS, ROTATION_PRESETS } from '../lib/angles';

export default function MemberInspector() {
  const selectedMember = useAppStore((s) =>
    s.project.members.find((m) => m.id === s.ui.selectedMemberId)
  );
  const updateMember = useAppStore((s) => s.updateMember);
  const removeMember = useAppStore((s) => s.removeMember);
  const mirrorMember = useAppStore((s) => s.mirrorMember);
  const transformMode = useAppStore((s) => s.ui.transformMode);
  const setTransformMode = useAppStore((s) => s.setTransformMode);
  const angleSnapEnabled = useAppStore((s) => s.ui.angleSnapEnabled);
  const angleSnapIncrement = useAppStore((s) => s.ui.angleSnapIncrement);
  const setAngleSnapEnabled = useAppStore((s) => s.setAngleSnapEnabled);
  const setAngleSnapIncrement = useAppStore((s) => s.setAngleSnapIncrement);
  const isolatedMemberId = useAppStore((s) => s.ui.isolatedMemberId);
  const setIsolatedMember = useAppStore((s) => s.setIsolatedMember);
  const mates = useAppStore((s) => s.project.mates);
  const members = useAppStore((s) => s.project.members);
  const removeMate = useAppStore((s) => s.removeMate);
  const sendToScrapBox = useAppStore((s) => s.sendToScrapBox);

  if (!selectedMember) {
    return (
      <p className="text-base text-zinc-400">
        Select a board in the viewport to inspect and modify it.
      </p>
    );
  }

  function patchDim(field: keyof Pick<WoodMember, 'thickness' | 'width' | 'length'>, val: string) {
    const n = parseFloat(val);
    if (!isNaN(n) && n > 0) {
      const patch: Partial<WoodMember> = { [field]: n };
      if (field === 'thickness') {
        patch.position = [
          selectedMember!.position[0],
          n / 2,
          selectedMember!.position[2],
        ];
      }
      updateMember(selectedMember!.id, patch);
    }
  }

  function patchRotation(axis: 0 | 1 | 2, degrees: string) {
    const d = parseFloat(degrees);
    if (isNaN(d)) return;
    const rot: [number, number, number] = [...selectedMember!.rotation];
    rot[axis] = degToRad(d);
    updateMember(selectedMember!.id, { rotation: rot });
  }

  function patchPosition(axis: 0 | 1 | 2, val: string) {
    const n = parseFloat(val);
    if (isNaN(n)) return;
    const pos: [number, number, number] = [...selectedMember!.position];
    pos[axis] = n;
    updateMember(selectedMember!.id, { position: pos });
  }

  function applyPreset(rotation: [number, number, number]) {
    updateMember(selectedMember!.id, { rotation });
  }

  const bf = calcBoardFeet(selectedMember.thickness, selectedMember.width, selectedMember.length);
  const weightLbs = (bf * 12 * getDensityFromCatalog(selectedMember.species)) / 12;

  const transformModes = [
    { id: 'translate' as const, label: 'Move' },
    { id: 'rotate' as const, label: 'Rotate' },
    { id: 'scale' as const, label: 'Scale' },
  ];

  const rotLabels = ['Rx', 'Ry', 'Rz'] as const;

  return (
    <div className="space-y-4">
      {isolatedMemberId && (
        <div className="rounded-lg border border-amber-500/40 bg-amber-950/30 px-3 py-2 flex justify-between items-center">
          <span className="text-sm text-amber-200">Isolation active</span>
          <button type="button" className="text-sm text-amber-400 underline" onClick={() => setIsolatedMember(null)}>
            Show all
          </button>
        </div>
      )}

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-3">
        <label className="flex flex-col gap-1 text-sm">
          Label
          <input
            type="text"
            className="input-field text-base font-semibold"
            value={selectedMember.label}
            onChange={(e) =>
              updateMember(selectedMember.id, { label: e.target.value }, true)
            }
            onKeyDown={(e) => {
              e.stopPropagation();
              if (e.key === 'Enter') e.currentTarget.blur();
            }}
            placeholder="Board name"
          />
        </label>
        <p className="text-sm text-zinc-500">
          {selectedMember.species} · {selectedMember.category} · {selectedMember.nominalSize}
        </p>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">
            Position (in)
          </p>
          <div className="grid grid-cols-3 gap-2 mb-3">
            {(['X', 'Y', 'Z'] as const).map((label, i) => (
              <label key={label} className="flex flex-col gap-1 text-sm min-w-0">
                <span className="text-zinc-400 text-xs">{label}</span>
                <input
                  type="number"
                  step="0.125"
                  className="input-field mono-num text-sm"
                  value={selectedMember.position[i as 0 | 1 | 2].toFixed(3)}
                  onChange={(e) => patchPosition(i as 0 | 1 | 2, e.target.value)}
                />
              </label>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">
            Dimensions (in)
          </p>
          <div className="grid grid-cols-3 gap-2">
            {(['thickness', 'width', 'length'] as const).map((field) => (
              <label key={field} className="flex flex-col gap-1 text-sm min-w-0">
                <span className="text-zinc-400 uppercase text-xs">
                  {field === 'thickness' ? 'T' : field === 'width' ? 'W' : 'L'}
                </span>
                <input
                  type="number"
                  step="0.25"
                  min="0.25"
                  className="input-field mono-num text-sm"
                  value={selectedMember[field]}
                  onChange={(e) => patchDim(field, e.target.value)}
                />
              </label>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">
            Rotation (°)
          </p>
          <div className="grid grid-cols-3 gap-2 mb-2">
            {rotLabels.map((label, i) => (
              <label key={label} className="flex flex-col gap-1 text-sm min-w-0">
                <span className="text-zinc-400 text-xs">{label}</span>
                <input
                  type="number"
                  step="1"
                  className="input-field mono-num text-sm"
                  value={Math.round(radToDeg(selectedMember.rotation[i as 0 | 1 | 2]))}
                  onChange={(e) => patchRotation(i as 0 | 1 | 2, e.target.value)}
                />
              </label>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {ROTATION_PRESETS.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => applyPreset(p.rotation)}
                className="text-xs px-2 py-1 rounded border border-zinc-700 text-zinc-400 hover:bg-zinc-800"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="font-mono text-sm text-zinc-400 space-y-0.5 pt-1 border-t border-zinc-800">
          <p>{bf.toFixed(2)} BF · ~{weightLbs.toFixed(1)} lbs</p>
          <p>{selectedMember.cuts.length} cut{selectedMember.cuts.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Transform Gizmo
        </p>
        <div className="grid grid-cols-3 gap-1.5">
          {transformModes.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setTransformMode(m.id)}
              className={[
                'text-sm py-2 rounded-lg font-medium transition-colors',
                transformMode === m.id
                  ? 'bg-amber-500 text-zinc-900 border-2 border-amber-300'
                  : 'bg-zinc-800 text-zinc-300 border-2 border-transparent hover:bg-zinc-700',
              ].join(' ')}
            >
              {m.label}
            </button>
          ))}
        </div>

        {transformMode === 'rotate' && (
          <div className="pt-2 space-y-2 border-t border-zinc-800">
            <label className="flex items-center justify-between text-sm">
              <span className="text-zinc-400">Angle snap</span>
              <input
                type="checkbox"
                checked={angleSnapEnabled}
                onChange={(e) => setAngleSnapEnabled(e.target.checked)}
                className="w-5 h-5"
              />
            </label>
            {angleSnapEnabled && (
              <label className="flex flex-col gap-1 text-sm">
                Snap increment
                <select
                  className="input-field text-sm"
                  value={angleSnapIncrement}
                  onChange={(e) => setAngleSnapIncrement(Number(e.target.value) as typeof angleSnapIncrement)}
                >
                  {ANGLE_SNAP_OPTIONS.map((deg) => (
                    <option key={deg} value={deg}>{deg}°</option>
                  ))}
                </select>
              </label>
            )}
          </div>
        )}
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Mirror Duplicate
        </p>
        <div className="grid grid-cols-3 gap-1.5">
          {(['x', 'y', 'z'] as const).map((axis) => (
            <button
              key={axis}
              type="button"
              onClick={() => mirrorMember(selectedMember.id, axis)}
              className="btn-secondary text-sm py-2"
            >
              {axis.toUpperCase()} Axis
            </button>
          ))}
        </div>
      </div>

      {(() => {
        const myMates = mates.filter(
          (m) => m.memberAId === selectedMember.id || m.memberBId === selectedMember.id
        );
        if (myMates.length === 0) return null;
        return (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Connections
            </p>
            {myMates.map((mate) => {
              const otherId = mate.memberAId === selectedMember.id ? mate.memberBId : mate.memberAId;
              const other = members.find((m) => m.id === otherId);
              return (
                <div key={mate.id} className="flex items-center justify-between py-1">
                  <span className="text-base text-zinc-300">→ {other?.label ?? 'Unknown'}</span>
                  <button
                    type="button"
                    className="text-sm text-red-400 hover:text-red-300 border border-red-800 rounded px-2 py-0.5"
                    onClick={() => removeMate(mate.id)}
                  >
                    Unmate
                  </button>
                </div>
              );
            })}
          </div>
        );
      })()}

      {!selectedMember.inScrapBox && (
        <button
          type="button"
          onClick={() => sendToScrapBox(selectedMember.id)}
          className="w-full bg-zinc-800/80 hover:bg-zinc-700/80 text-amber-300 font-semibold text-base py-2.5 rounded-xl border-2 border-amber-700/40 transition-colors"
          title="Shift+X"
        >
          Send to Scrap Box
        </button>
      )}

      <button
        type="button"
        onClick={() => removeMember(selectedMember.id)}
        className="w-full bg-red-900/60 hover:bg-red-800/60 text-red-200 font-semibold text-base py-2.5 rounded-xl border-2 border-red-500/50 transition-colors"
      >
        Remove Board
      </button>
    </div>
  );
}
