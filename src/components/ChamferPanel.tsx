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
// Mirrors BoardMesh.tsx's own MIN_SIZE — below this a chamfer bevel is
// nearly coplanar with its unshrunk neighbor face and z-fights.
const MIN_SIZE = 0.03;

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

  return <ChamferEdgePanel key={`${chamferEdge.memberId}:${chamferEdge.edgeId}`} chamferEdge={chamferEdge} />;
}

/** Split out so the mode toggle's local state resets cleanly whenever a
 * different edge is picked (via the `key` above) instead of carrying a
 * stale "Angle" mode over onto an unrelated edge. */
function ChamferEdgePanel({ chamferEdge }: { chamferEdge: { memberId: string; edgeId: string } }) {
  const members = useAppStore((s) => s.project.members);
  const resetChamferPick = useAppStore((s) => s.resetChamferPick);
  const removeChamfer = useAppStore((s) => s.removeChamfer);
  const updateMember = useAppStore((s) => s.updateMember);
  const [mode, setMode] = useState<'sizes' | 'angle'>('sizes');

  const member = members.find((m) => m.id === chamferEdge.memberId);
  const chamfer = member?.chamfers?.find((c) => c.edgeId === chamferEdge.edgeId);
  const sizeA = chamfer?.size ?? 0.25;
  const sizeB = chamfer?.sizeB ?? sizeA;
  const [faceIdA, faceIdB] = chamferEdge.edgeId.split('|');
  const maxSize = member ? Math.min(member.width, member.thickness) * MAX_SIZE_FRACTION : 12;

  // Single write path — every field (both Size inputs, the drag handle via
  // BoardMesh.tsx's own mirrored clamp, and now the Angle field below) ends
  // up here so there is one source of truth for the clamp + store write,
  // never two independently-clamped paths that could disagree.
  function commitSizes(newSizeA: number, newSizeB: number) {
    if (!member) return;
    const clamp = (raw: number) => {
      const bounded = Math.max(0, Math.min(raw, maxSize));
      return bounded < MIN_SIZE ? 0 : bounded;
    };
    const clampedA = clamp(newSizeA);
    const clampedB = clamp(newSizeB);
    const existing = (member.chamfers ?? []).find((c) => c.edgeId === chamferEdge!.edgeId);
    const nextEntry = existing
      ? { ...existing, size: clampedA, sizeB: clampedB }
      : { id: crypto.randomUUID(), edgeId: chamferEdge!.edgeId, size: clampedA, sizeB: clampedB };
    const next = existing ? (member.chamfers ?? []).map((c) => (c === existing ? nextEntry : c)) : [...(member.chamfers ?? []), nextEntry];
    updateMember(member.id, { chamfers: next });
  }

  function setSize(which: 'A' | 'B', newSize: number) {
    commitSizes(which === 'A' ? newSize : sizeA, which === 'B' ? newSize : sizeB);
  }

  // Angle the bevel makes measured FROM Face A's own surface — atan2 keeps
  // this well-defined (0°-90°) across the whole size range, including the
  // symmetric 45° case when sizeA === sizeB.
  const angleFromA = (Math.atan2(sizeB, sizeA) * 180) / Math.PI;

  // Angle-mode edits: distance along Face A stays put and Face B's distance
  // is re-derived to match the requested angle, mirroring Fusion 360's
  // "Distance and Angle" chamfer type (vs. this panel's default "Two
  // Distances" mode) — same two stored numbers either way, just a different
  // pair of fields for typing them.
  function setAngle(newAngleDeg: number) {
    const clampedDeg = Math.max(1, Math.min(89, newAngleDeg));
    const baseA = sizeA > 0 ? sizeA : 0.25;
    commitSizes(baseA, baseA * Math.tan((clampedDeg * Math.PI) / 180));
  }

  function setDistanceKeepingAngle(newSizeA: number) {
    const angleRad = (angleFromA * Math.PI) / 180;
    commitSizes(newSizeA, newSizeA * Math.tan(angleRad));
  }

  return (
    <div className="p-3 flex flex-col gap-3 text-charcoal-200">
      <div className="flex items-center gap-2 rounded border border-charcoal-700 bg-charcoal-800/50 px-2 py-1.5">
        <span className="w-3 h-3 rounded-sm shrink-0 bg-orange-500" />
        <div className="text-sm">
          <div className="font-semibold text-white">Edge</div>
          <div className="text-charcoal-300">{member?.label ?? 'Unknown board'}</div>
        </div>
      </div>

      {/* Two input modes for the same underlying size/sizeB pair — "Two
          Sizes" (the original yMax/zMax fields, useful once you already know
          both cut depths) and "Distance & Angle" (one depth + the bevel's
          actual angle, which is what most hobbyist woodworkers think in
          terms of — 45°, 30°, etc — rather than two independent axis
          distances). Purely a local view toggle, same ephemeral-UI-chrome
          precedent as ToolRail's openGroupId; never written to the store. */}
      <div className="flex rounded border border-charcoal-700 overflow-hidden text-sm">
        <button
          type="button"
          onClick={() => setMode('sizes')}
          className={`flex-1 px-2 py-1.5 transition-colors ${
            mode === 'sizes' ? 'bg-orange-600 text-white' : 'bg-charcoal-800 text-charcoal-300 hover:bg-charcoal-700'
          }`}
        >
          Two Sizes
        </button>
        <button
          type="button"
          onClick={() => setMode('angle')}
          className={`flex-1 px-2 py-1.5 transition-colors ${
            mode === 'angle' ? 'bg-orange-600 text-white' : 'bg-charcoal-800 text-charcoal-300 hover:bg-charcoal-700'
          }`}
        >
          Distance &amp; Angle
        </button>
      </div>

      {mode === 'sizes' ? (
        <>
          <p className="text-sm text-charcoal-400">
            Type the cut depth for each adjacent face independently. Equal sizes give a 45° bevel; uneven sizes tilt
            it toward whichever face has the smaller cut.
          </p>
          <SizeField label={`Size (${faceIdA})`} value={sizeA} onChange={(v) => setSize('A', v)} />
          <SizeField label={`Size (${faceIdB})`} value={sizeB} onChange={(v) => setSize('B', v)} />
        </>
      ) : (
        <>
          <p className="text-sm text-charcoal-400">
            Type the cut depth along the {faceIdA} face and the angle the bevel should make — 45° is the classic
            even chamfer, lower angles lean the cut toward {faceIdA}, higher angles toward {faceIdB}.
          </p>
          <SizeField label={`Distance (${faceIdA})`} value={sizeA} onChange={setDistanceKeepingAngle} />
          <AngleField label="Angle" value={angleFromA} onChange={setAngle} />
        </>
      )}

      <p className="text-xs text-charcoal-500">
        Or drag either orange arrow directly in the viewport. Angle from {faceIdA}: {angleFromA.toFixed(1)}° · max
        size {formatFractionalInches(maxSize)} for this board
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

/** Degree-based counterpart to SizeField, same local-text/commit-on-blur
 * shape — for the Distance & Angle mode's Angle field. Whole-degree nudge
 * step (1°) since a hobbyist reading a bevel angle off this panel has no
 * use for fractional degrees the way board dimensions need fractional
 * inches. Clamped 1°-89° (setAngle above enforces the same range) so the
 * field can never be typed into the degenerate flat-face (0°) or the
 * other face's own degenerate (90°) case. */
function AngleField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  const [text, setText] = useState(value.toFixed(1));

  useEffect(() => {
    setText(value.toFixed(1));
  }, [value]);

  function commit() {
    const parsed = Number(text);
    if (Number.isFinite(parsed)) {
      onChange(parsed);
    } else {
      setText(value.toFixed(1));
    }
  }

  return (
    <div className="flex items-center gap-1.5 text-sm">
      <span className="text-charcoal-400 w-24 shrink-0">{label}</span>
      <button
        type="button"
        onClick={() => onChange(value - 1)}
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
        onClick={() => onChange(value + 1)}
        className="w-6 h-6 shrink-0 rounded bg-charcoal-800 hover:bg-charcoal-700 text-charcoal-300 border border-charcoal-700"
      >
        +
      </button>
      <span className="text-charcoal-500">°</span>
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
