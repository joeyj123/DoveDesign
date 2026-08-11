import { useEffect, useState } from 'react';
import { useAppStore } from '../store';
import { getMemberFaces } from '../lib/boardFaceMath';
import { resolveRipCutLine } from '../lib/ripCutSplit';
import { formatFractionalInches, parseFractionalInches } from '../lib/fractionalInches';
import { linesForFace } from '../lib/referenceLineSnap';

/**
 * Data Flow Pipeline: Rip / Cross Cut panel
 *
 * INPUT: ui.ripCutFace (set by clicking a board face in BoardMesh.tsx while
 *   activeTool === 'rip'), that face's own Reference Lines
 *   (project.referenceLines, filtered via referenceLineSnap.ts's
 *   linesForFace — the SAME filter the Cutout tool's snap system already
 *   uses, one function, not a second copy), ui.ripCutLineId (which one is
 *   picked), ui.ripCutKerf (typed blade width).
 *
 * CALCULATION: none here — resolveRipCutLine (ripCutSplit.ts) is called
 *   PURELY for display (is this line a valid cut path, and is it a rip or
 *   a cross cut) so the list can show a real answer per line rather than a
 *   guess; the actual split math lives entirely in memberSplit.ts's
 *   existing splitByCrossCut/splitByRipCut, invoked through
 *   store.splitMemberAlongLine on commit.
 *
 * OUTPUT: store.splitMemberAlongLine(memberId, lineId, kerf) — removes the
 *   original board and adds two new ones (see store.ts's own doc comment
 *   on that action for the full mates/fasteners/reference-line cleanup it
 *   already does).
 *
 * FOLLOWS-BOARD CHECK: n/a — UI chrome only; the actual split is a one-shot
 *   transform, not a live relationship (see ripCutSplit.ts).
 */
export default function RipCutPanel() {
  const members = useAppStore((s) => s.project.members);
  const referenceLines = useAppStore((s) => s.project.referenceLines);
  const ripCutFace = useAppStore((s) => s.ui.ripCutFace);
  const ripCutLineId = useAppStore((s) => s.ui.ripCutLineId);
  const ripCutKerf = useAppStore((s) => s.ui.ripCutKerf);
  const setRipCutLineId = useAppStore((s) => s.setRipCutLineId);
  const setRipCutKerf = useAppStore((s) => s.setRipCutKerf);
  const resetRipCutPick = useAppStore((s) => s.resetRipCutPick);
  const splitMemberAlongLine = useAppStore((s) => s.splitMemberAlongLine);

  const [kerfText, setKerfText] = useState(formatFractionalInches(ripCutKerf));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setKerfText(formatFractionalInches(ripCutKerf));
  }, [ripCutKerf]);

  if (!ripCutFace) {
    return (
      <div className="p-3 flex flex-col gap-2 text-charcoal-200">
        <p className="text-sm text-charcoal-400">
          Click a face on a board, then pick a straight Reference Line already drawn on it to split the board along
          that line.
        </p>
        <p className="text-xs text-charcoal-600">
          Only a straight line that reaches both opposite edges of the face qualifies — draw one first with
          Annotate &gt; Reference Line. Whether it's a rip cut (splits the width) or a cross cut (splits the length)
          is detected automatically from which way the line runs.
        </p>
      </div>
    );
  }

  const member = members.find((m) => m.id === ripCutFace.memberId);
  if (!member) {
    return (
      <div className="p-3 text-sm text-charcoal-400">
        That board no longer exists.
        <button type="button" onClick={resetRipCutPick} className="block mt-2 text-orange-400 hover:text-orange-300">
          Pick a different face
        </button>
      </div>
    );
  }

  const faces = getMemberFaces(member);
  const face = faces.find((f) => f.id === ripCutFace.face);
  const faceLines = face ? linesForFace(referenceLines, member.id, face.id) : [];

  const rows = faceLines.map((line) => {
    const resolution = face ? resolveRipCutLine(line, face, member) : { ok: false as const, reason: 'face not found' };
    return { line, resolution };
  });

  const pickedRow = rows.find((r) => r.line.id === ripCutLineId);
  const pickedValid = pickedRow && !('ok' in pickedRow.resolution) ? pickedRow.resolution : null;

  function commitKerf() {
    const parsed = parseFractionalInches(kerfText);
    if (parsed !== null && parsed >= 0) {
      setRipCutKerf(parsed);
    } else {
      setKerfText(formatFractionalInches(ripCutKerf));
    }
  }

  function handleSplit() {
    if (!ripCutLineId) return;
    const result = splitMemberAlongLine(member!.id, ripCutLineId, ripCutKerf);
    if (!result.ok) {
      setError(result.reason);
      return;
    }
    setError(null);
    // splitMemberAlongLine already reselects the new "1 of 2" piece and
    // resets activeTool to 'select' (see store.ts's splitMemberByCrossCut/
    // splitMemberByRipCut) — no separate resetRipCutPick needed, the whole
    // ui.ripCutFace/ripCutLineId slate is moot once the tool itself switches.
  }

  return (
    <div className="p-3 flex flex-col gap-3 text-charcoal-200">
      <div className="flex items-center gap-2 rounded border border-charcoal-700 bg-charcoal-800/50 px-2 py-1.5">
        <span className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: '#7a8b6f' }} />
        <div className="text-sm">
          <div className="font-semibold text-white">Face</div>
          <div className="text-charcoal-300">
            {member.label} — {ripCutFace.face}
          </div>
        </div>
      </div>

      {faceLines.length === 0 ? (
        <p className="text-sm text-charcoal-400">
          No Reference Lines on this face yet. Switch to Annotate &gt; Reference Line, draw one straight across the
          face (touching both opposite edges), then come back here.
        </p>
      ) : (
        <div className="flex flex-col gap-1.5">
          <div className="text-xs uppercase tracking-wider text-charcoal-500">Reference Lines on This Face</div>
          {rows.map(({ line, resolution }) => {
            const valid = !('ok' in resolution);
            const isPicked = ripCutLineId === line.id;
            return (
              <button
                key={line.id}
                type="button"
                disabled={!valid}
                onClick={() => setRipCutLineId(line.id)}
                className={`flex items-center justify-between rounded px-2 py-1.5 text-sm border text-left ${
                  isPicked
                    ? 'bg-orange-600 border-orange-500 text-white'
                    : valid
                      ? 'bg-charcoal-800 border-charcoal-700 text-charcoal-200 hover:border-orange-500 hover:text-white'
                      : 'bg-charcoal-900 border-charcoal-800 text-charcoal-600 cursor-not-allowed'
                }`}
              >
                <span>
                  ({formatFractionalInches(line.start.u)}, {formatFractionalInches(line.start.v)}) → (
                  {formatFractionalInches(line.end.u)}, {formatFractionalInches(line.end.v)})
                </span>
                <span className="text-xs">{valid ? (resolution.kind === 'rip' ? 'Rip Cut' : 'Cross Cut') : resolution.reason}</span>
              </button>
            );
          })}
        </div>
      )}

      {pickedValid && (
        <>
          <div className="flex items-center gap-1.5 text-sm">
            <span className="text-charcoal-400 w-24 shrink-0">Kerf</span>
            <input
              type="text"
              inputMode="decimal"
              value={kerfText}
              onChange={(e) => setKerfText(e.target.value)}
              onBlur={commitKerf}
              onKeyDown={(e) => {
                if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
              }}
              className="w-20 rounded bg-charcoal-800 border border-charcoal-700 px-2 py-1 text-center text-charcoal-100"
            />
            <span className="text-xs text-charcoal-500">blade width removed at the cut (1/8" = standard saw)</span>
          </div>

          <button
            type="button"
            onClick={handleSplit}
            className="rounded px-3 py-2 bg-orange-600 hover:bg-orange-500 text-white font-medium"
          >
            Split Board — {pickedValid.kind === 'rip' ? 'Rip Cut' : 'Cross Cut'}
          </button>
        </>
      )}

      {error && (
        <p className="text-sm text-red-400 border border-red-900/60 bg-red-950/30 rounded px-2 py-1.5">{error}</p>
      )}

      <button
        type="button"
        onClick={resetRipCutPick}
        className="rounded px-3 py-1.5 bg-charcoal-800 hover:bg-charcoal-700 text-charcoal-300 border border-charcoal-700"
      >
        Cancel / Pick a Different Face
      </button>
    </div>
  );
}
