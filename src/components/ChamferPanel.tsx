import { useEffect, useState } from 'react';
import { useAppStore } from '../store';
import { formatFractionalInches, parseFractionalInches } from '../lib/fractionalInches';

const NUDGE_STEP = 1 / 16;
/** Same reasoning as BoardMesh.tsx's ChamferAxisHandle: past this fraction
 * of the board's own smaller cross-section dimension, the leftover sliver
 * of wood gets thin enough to z-fight (flicker depending on camera angle)
 * — confirmed live on a large drag. Kept in sync with the drag handle's
 * own clamp so typing a size can't exceed what dragging allows. */
const MAX_SIZE_FRACTION = 0.45;

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
  const setChamferEdge = useAppStore((s) => s.setChamferEdge);
  const resetChamferPick = useAppStore((s) => s.resetChamferPick);
  const removeChamfer = useAppStore((s) => s.removeChamfer);
  const updateMember = useAppStore((s) => s.updateMember);

  if (!chamferEdge) {
    // A board might already have chamfers from a prior pick — list them all
    // here (across every board) so there's a way back to editing one
    // besides re-finding and re-clicking the exact same edge in the 3D
    // viewport, which was the actual gap Joey ran into.
    const allChamfers = members.flatMap((m) => (m.chamfers ?? []).map((c) => ({ member: m, chamfer: c })));
    return (
      <div className="p-3 flex flex-col gap-2 text-charcoal-200">
        <p className="text-sm text-charcoal-400">
          Click an edge on a board to bevel it — the closest edge to your cursor highlights orange as you move.
        </p>
        {allChamfers.length > 0 && (
          <div className="flex flex-col gap-1 mt-2 pt-2 border-t border-charcoal-800">
            <div className="text-xs uppercase tracking-wider text-charcoal-500">Existing Chamfers</div>
            {allChamfers.map(({ member: m, chamfer: c }) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setChamferEdge({ memberId: m.id, edgeId: c.edgeId })}
                className="flex items-center justify-between rounded px-2 py-1.5 text-sm bg-charcoal-800/50 border border-charcoal-700 hover:border-orange-500 hover:text-white text-charcoal-300"
              >
                <span>{m.label} — {c.edgeId.replace('|', ' / ')}</span>
                <span className="text-charcoal-500">{formatFractionalInches(c.size)}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  const member = members.find((m) => m.id === chamferEdge.memberId);
  const chamfer = member?.chamfers?.find((c) => c.edgeId === chamferEdge.edgeId);
  const sizeA = chamfer?.size ?? 0.25;
  const sizeB = chamfer?.sizeB ?? sizeA;
  const [faceIdA, faceIdB] = chamferEdge.edgeId.split('|');
  const maxSize = member ? Math.min(member.width, member.thickness) * MAX_SIZE_FRACTION : 12;

  function setSize(which: 'A' | 'B', newSize: number) {
    if (!member) return;
    const clamped = Math.max(0, Math.min(newSize, maxSize));
    const existing = (member.chamfers ?? []).find((c) => c.edgeId === chamferEdge!.edgeId);
    const nextEntry = existing
      ? which === 'A'
        ? { ...existing, size: clamped }
        : { ...existing, sizeB: clamped }
      : which === 'A'
      ? { id: crypto.randomUUID(), edgeId: chamferEdge!.edgeId, size: clamped, sizeB }
      : { id: crypto.randomUUID(), edgeId: chamferEdge!.edgeId, size: sizeA, sizeB: clamped };
    const next = existing ? (member.chamfers ?? []).map((c) => (c === existing ? nextEntry : c)) : [...(member.chamfers ?? []), nextEntry];
    updateMember(member.id, { chamfers: next });
  }

  // Angle the bevel makes measured FROM Face A's own surface — atan2 keeps
  // this well-defined (0°-90°) across the whole size range, including the
  // symmetric 45° case when sizeA === sizeB.
  const angleFromA = (Math.atan2(sizeB, sizeA) * 180) / Math.PI;

  return (
    <div className="p-3 flex flex-col gap-3 text-charcoal-200">
      <p className="text-sm text-charcoal-400">
        Drag either orange arrow in the viewport, or type exact sizes below — one per adjacent face, independently.
        Equal sizes give a 45° bevel; uneven sizes tilt it toward whichever face has the smaller cut.
      </p>

      <div className="flex items-center gap-2 rounded border border-charcoal-700 bg-charcoal-800/50 px-2 py-1.5">
        <span className="w-3 h-3 rounded-sm shrink-0 bg-orange-500" />
        <div className="text-sm">
          <div className="font-semibold text-white">Edge</div>
          <div className="text-charcoal-300">{member?.label ?? 'Unknown board'}</div>
        </div>
      </div>

      <SizeField label={`Size (${faceIdA})`} value={sizeA} onChange={(v) => setSize('A', v)} />
      <SizeField label={`Size (${faceIdB})`} value={sizeB} onChange={(v) => setSize('B', v)} />
      <p className="text-xs text-charcoal-500">
        Angle from {faceIdA}: {angleFromA.toFixed(1)}° · max size {formatFractionalInches(maxSize)} for this board
      </p>

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
function SizeField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
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
      <span className="text-charcoal-400 w-24 shrink-0">{label}</span>
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
