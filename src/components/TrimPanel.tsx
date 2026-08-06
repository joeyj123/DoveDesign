import { useAppStore } from '../store';

/**
 * Data Flow Pipeline: Trim/Extend Tool Panel
 *
 * INPUT: ui.pendingInteraction (kind 'trimExtend') — set by clicking a face
 *   in BoardMesh.tsx; project.members (for the picked board's label, display
 *   only).
 *
 * CALCULATION: none here — the actual math (snapLengthToFacePlane, in
 *   src/lib/trimExtend.ts) and the commit (store.ts's applyTrimExtend) are
 *   pre-existing, preserved from before the Samson reset. This panel is
 *   status display + a way to cancel a half-made pick, nothing else.
 *
 * OUTPUT: none new.
 *
 * FOLLOWS-BOARD CHECK: n/a — UI chrome. The resulting length/position patch
 *   is a one-time parametric edit (see trimExtend.ts), not a standing
 *   annotation, so there's nothing to go stale afterward.
 */
export default function TrimPanel() {
  const members = useAppStore((s) => s.project.members);
  const pendingInteraction = useAppStore((s) => s.ui.pendingInteraction);
  const setPendingInteraction = useAppStore((s) => s.setPendingInteraction);
  const trimPick = pendingInteraction?.kind === 'trimExtend' ? pendingInteraction : null;

  const boundaryLabel = trimPick ? members.find((m) => m.id === trimPick.targetMemberId)?.label ?? 'Unknown board' : null;

  return (
    <div className="p-3 flex flex-col gap-3 text-charcoal-200">
      <p className="text-sm text-charcoal-400">
        {trimPick
          ? 'Boundary set. Now click any OTHER board (its body, not a specific face) — its nearest end will snap flush to the boundary face, shrinking (trim) or growing (extend) to reach it.'
          : 'Click a face on a board to use as the boundary, then click any other board — its nearest end snaps flush to that face, shrinking (trim) or growing (extend) to reach it.'}
      </p>

      <div className="flex items-center gap-2 rounded border border-charcoal-700 bg-charcoal-800/50 px-2 py-1.5">
        <span className="w-3 h-3 rounded-sm shrink-0 bg-orange-500" />
        <div className="text-sm">
          <div className="font-semibold text-white">Boundary face</div>
          {trimPick ? (
            <div className="text-charcoal-300">{boundaryLabel} — {trimPick.targetFaceId}</div>
          ) : (
            <div className="text-charcoal-500">Not picked yet</div>
          )}
        </div>
      </div>

      {trimPick && (
        <button
          type="button"
          onClick={() => setPendingInteraction(null)}
          className="rounded px-3 py-1.5 bg-charcoal-800 hover:bg-charcoal-700 text-charcoal-300 border border-charcoal-700"
        >
          Reset
        </button>
      )}
    </div>
  );
}
