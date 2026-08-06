import { useEffect, useState } from 'react';
import { useAppStore } from '../store';
import { formatFractionalInches, parseFractionalInches } from '../lib/fractionalInches';

const NUDGE_STEP = 1 / 16;

/**
 * Data Flow Pipeline: Chamfer Tool Panel
 *
 * INPUT: ui.chamferEdge (set by clicking an edge in BoardMesh.tsx while
 *   activeTool === 'chamfer'), the picked member's own chamfers array (for
 *   this edge's current size, display + edit only).
 *
 * CALCULATION: none here — the actual bevel geometry (shrinkFaceBoundary/
 *   buildChamferFace) lives entirely in Engine.ts's evaluateFeatures. This
 *   panel only writes the `size` number, the same field the in-viewport
 *   drag handle (BoardMesh.tsx's ChamferDragHandle) writes — one field,
 *   two input methods, never two competing sources of truth.
 *
 * OUTPUT: updateMember(id, { chamfers }) — no new store action beyond the
 *   pre-existing updateMember.
 */
export default function ChamferPanel() {
  const members = useAppStore((s) => s.project.members);
  const chamferEdge = useAppStore((s) => s.ui.chamferEdge);
  const resetChamferPick = useAppStore((s) => s.resetChamferPick);
  const removeChamfer = useAppStore((s) => s.removeChamfer);
  const updateMember = useAppStore((s) => s.updateMember);

  if (!chamferEdge) {
    return (
      <div className="p-3 flex flex-col gap-2 text-charcoal-200">
        <p className="text-sm text-charcoal-400">
          Click an edge on a board to bevel it — the closest edge to your cursor highlights orange as you move.
        </p>
      </div>
    );
  }

  const member = members.find((m) => m.id === chamferEdge.memberId);
  const chamfer = member?.chamfers?.find((c) => c.edgeId === chamferEdge.edgeId);
  const size = chamfer?.size ?? 0.25;

  function setSize(newSize: number) {
    if (!member) return;
    const clamped = Math.max(0, newSize);
    const next = (member.chamfers ?? []).some((c) => c.edgeId === chamferEdge!.edgeId)
      ? (member.chamfers ?? []).map((c) => (c.edgeId === chamferEdge!.edgeId ? { ...c, size: clamped } : c))
      : [...(member.chamfers ?? []), { id: crypto.randomUUID(), edgeId: chamferEdge!.edgeId, size: clamped }];
    updateMember(member.id, { chamfers: next });
  }

  return (
    <div className="p-3 flex flex-col gap-3 text-charcoal-200">
      <p className="text-sm text-charcoal-400">
        Drag the orange arrow in the viewport, or type an exact size below. Click a different edge to switch, or
        Reset to pick again.
      </p>

      <div className="flex items-center gap-2 rounded border border-charcoal-700 bg-charcoal-800/50 px-2 py-1.5">
        <span className="w-3 h-3 rounded-sm shrink-0 bg-orange-500" />
        <div className="text-sm">
          <div className="font-semibold text-white">Edge</div>
          <div className="text-charcoal-300">{member?.label ?? 'Unknown board'}</div>
        </div>
      </div>

      <SizeField value={size} onChange={setSize} />

      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={() => removeChamfer(chamferEdge.memberId, chamferEdge.edgeId)}
          disabled={!chamfer}
          className="flex-1 rounded px-3 py-1.5 bg-charcoal-800 hover:bg-red-900/40 hover:text-red-300 disabled:text-charcoal-600 disabled:cursor-not-allowed text-charcoal-300 border border-charcoal-700"
        >
          Remove Chamfer
        </button>
        <button
          type="button"
          onClick={resetChamferPick}
          className="rounded px-3 py-1.5 bg-charcoal-800 hover:bg-charcoal-700 text-charcoal-300 border border-charcoal-700"
        >
          Reset
        </button>
      </div>
    </div>
  );
}

/** Same fractional-inch text pattern as BoardEditPanel's FractionalInput
 * (local text state, commit on blur/Enter) plus 1/16" nudge buttons, same
 * shape as MatePanel's offset fields — one convention for every "type or
 * nudge a distance" field in the app. */
function SizeField({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [text, setText] = useState(formatFractionalInches(value));

  useEffect(() => {
    setText(formatFractionalInches(value));
  }, [value]);

  function commit() {
    const parsed = parseFractionalInches(text);
    if (parsed !== null && parsed >= 0) {
      onChange(parsed);
    } else {
      setText(formatFractionalInches(value));
    }
  }

  return (
    <div className="flex items-center gap-1.5 text-sm">
      <span className="text-charcoal-400 w-16 shrink-0">Size</span>
      <button
        type="button"
        onClick={() => onChange(Math.max(0, value - NUDGE_STEP))}
        className="w-6 h-6 shrink-0 rounded bg-charcoal-800 hover:bg-charcoal-700 text-charcoal-300 border border-charcoal-700"
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
        className="w-20 rounded bg-charcoal-800 border border-charcoal-700 px-2 py-1 text-center text-charcoal-100"
      />
      <button
        type="button"
        onClick={() => onChange(value + NUDGE_STEP)}
        className="w-6 h-6 shrink-0 rounded bg-charcoal-800 hover:bg-charcoal-700 text-charcoal-300 border border-charcoal-700"
      >
        +
      </button>
    </div>
  );
}
