import { useEffect, useState } from 'react';
import { useAppStore } from '../store';
import { formatFractionalInches, parseFractionalInches } from '../lib/fractionalInches';

/**
 * Data Flow Pipeline: Mate Tool Panel
 *
 * INPUT: ui.mateFaceA / ui.mateFaceB (set by clicking a board face in
 *   BoardMesh.tsx while activeTool === 'mate' — see pickMateFace in
 *   store.ts), project.members (for the picked board's label, display only).
 *
 * CALCULATION: none here — this panel only reads pick state and reports it;
 *   the actual constraint math (computeMateTransform) and the mate/
 *   mateGroup/mateConstraint bookkeeping already live entirely in store.ts's
 *   applyMate (pre-reset code, preserved through the Samson Option, never
 *   given a UI trigger until now).
 *
 * OUTPUT: none new — this panel calls the existing applyMate()/
 *   resetMatePicks() actions, it doesn't introduce a second mate-creation
 *   path.
 *
 * FOLLOWS-BOARD CHECK: n/a — UI chrome only; the resulting mate constraint's
 *   own FOLLOWS-BOARD guarantee is documented in store.ts (solveMateConstraints
 *   re-solves from the live constraint + board parameters every time either
 *   board moves).
 */
const NUDGE_STEP = 1 / 16;

export default function MatePanel() {
  const members = useAppStore((s) => s.project.members);
  const mateFaceA = useAppStore((s) => s.ui.mateFaceA);
  const mateFaceB = useAppStore((s) => s.ui.mateFaceB);
  const setMateFaceA = useAppStore((s) => s.setMateFaceA);
  const setMateFaceB = useAppStore((s) => s.setMateFaceB);
  const applyMate = useAppStore((s) => s.applyMate);
  const resetMatePicks = useAppStore((s) => s.resetMatePicks);

  const labelFor = (memberId: string) => members.find((m) => m.id === memberId)?.label ?? 'Unknown board';

  return (
    <div className="p-3 flex flex-col gap-3 text-charcoal-200">
      <p className="text-sm text-charcoal-400">
        Click a face on a board to pick Face A, then click a face on a DIFFERENT board to pick Face B. Face B's board
        moves to sit flush against Face A.
      </p>

      <PickSlot label="Face A" color="bg-orange-500" pick={mateFaceA} labelFor={labelFor} />
      {mateFaceA && (
        <OffsetControls
          offset={mateFaceA.offset ?? [0, 0, 0]}
          onChange={(offset) => setMateFaceA({ ...mateFaceA, offset })}
        />
      )}

      <PickSlot label="Face B" color="bg-spruce-600" pick={mateFaceB} labelFor={labelFor} />
      {mateFaceB && (
        <OffsetControls
          offset={mateFaceB.offset ?? [0, 0, 0]}
          onChange={(offset) => setMateFaceB({ ...mateFaceB, offset })}
        />
      )}

      <div className="flex gap-2 pt-1">
        <button
          type="button"
          disabled={!mateFaceA || !mateFaceB}
          onClick={() => applyMate()}
          className="flex-1 rounded px-3 py-1.5 bg-orange-600 hover:bg-orange-500 disabled:bg-charcoal-800 disabled:text-charcoal-500 disabled:cursor-not-allowed text-white border border-orange-500 disabled:border-charcoal-700"
        >
          Create Mate
        </button>
        <button
          type="button"
          onClick={resetMatePicks}
          disabled={!mateFaceA && !mateFaceB}
          className="rounded px-3 py-1.5 bg-charcoal-800 hover:bg-charcoal-700 disabled:text-charcoal-600 disabled:cursor-not-allowed text-charcoal-300 border border-charcoal-700"
        >
          Reset
        </button>
      </div>
    </div>
  );
}

/**
 * Data Flow Pipeline: Mate Offset Controls
 *
 * INPUT: this pick's own offset tuple ([u, v, 0] inches from the face's
 *   CENTER along its two in-plane axes — see mating.ts's getFacePointWorld).
 *   [0, 0, 0] is already dead-center; this UI is for the OFF-center case
 *   (e.g. "1 inch in from the edge").
 *
 * CALCULATION: none beyond parsing typed inches / adding a fixed 1/16"
 *   nudge step — the actual face-to-face transform math is unchanged,
 *   still entirely in computeMateTransform (mating.ts).
 *
 * OUTPUT: onChange(offset) — writes straight back into ui.mateFaceA/B via
 *   the existing setMateFaceA/setMateFaceB actions, no new store field.
 */
function OffsetControls({
  offset,
  onChange,
}: {
  offset: [number, number, number];
  onChange: (offset: [number, number, number]) => void;
}) {
  const setAxis = (axis: 0 | 1, value: number) => {
    const next: [number, number, number] = [...offset];
    next[axis] = value;
    onChange(next);
  };

  return (
    <div className="flex flex-col gap-1.5 -mt-1 pl-1">
      <OffsetAxisRow label="Along face length (U)" value={offset[0]} onChange={(v) => setAxis(0, v)} />
      <OffsetAxisRow label="Along face width (V)" value={offset[1]} onChange={(v) => setAxis(1, v)} />
      {(offset[0] !== 0 || offset[1] !== 0) && (
        <button
          type="button"
          onClick={() => onChange([0, 0, 0])}
          className="self-start text-xs text-charcoal-400 hover:text-white underline"
        >
          Center (reset offset)
        </button>
      )}
    </div>
  );
}

/** Fractional-inch text input for an offset: displays formatted while idle,
 * parses on commit (blur/Enter) — same pattern as BoardEditPanel.tsx's
 * FractionalInput, but allows negative/zero values since an offset can go
 * either direction from a face's center, unlike a board dimension. */
function OffsetAxisRow({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  const [text, setText] = useState(formatFractionalInches(value));

  useEffect(() => {
    setText(formatFractionalInches(value));
  }, [value]);

  function commit() {
    const parsed = parseFractionalInches(text);
    if (parsed !== null) {
      onChange(parsed);
    } else {
      setText(formatFractionalInches(value));
    }
  }

  return (
    <div className="flex items-center gap-1.5 text-xs">
      <span className="text-charcoal-500 w-32 shrink-0">{label}</span>
      <button
        type="button"
        onClick={() => onChange(value - NUDGE_STEP)}
        className="w-5 h-5 shrink-0 rounded bg-charcoal-800 hover:bg-charcoal-700 text-charcoal-300 border border-charcoal-700"
      >
        −
      </button>
      <input
        type="text"
        inputMode="decimal"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
        }}
        className="w-16 rounded bg-charcoal-800 border border-charcoal-700 px-1.5 py-0.5 text-center text-charcoal-100"
      />
      <button
        type="button"
        onClick={() => onChange(value + NUDGE_STEP)}
        className="w-5 h-5 shrink-0 rounded bg-charcoal-800 hover:bg-charcoal-700 text-charcoal-300 border border-charcoal-700"
      >
        +
      </button>
    </div>
  );
}

function PickSlot({
  label,
  color,
  pick,
  labelFor,
}: {
  label: string;
  color: string;
  pick: { memberId: string; face: string } | null;
  labelFor: (id: string) => string;
}) {
  return (
    <div className="flex items-center gap-2 rounded border border-charcoal-700 bg-charcoal-800/50 px-2 py-1.5">
      <span className={`w-3 h-3 rounded-sm shrink-0 ${color}`} />
      <div className="text-sm">
        <div className="font-semibold text-white">{label}</div>
        {pick ? (
          <div className="text-charcoal-300">{labelFor(pick.memberId)} — {pick.face}</div>
        ) : (
          <div className="text-charcoal-500">Not picked yet</div>
        )}
      </div>
    </div>
  );
}
