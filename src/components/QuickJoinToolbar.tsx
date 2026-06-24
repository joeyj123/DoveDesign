import { useAppStore } from '../store';

export default function QuickJoinToolbar() {
  const multiSelection = useAppStore((s) => s.ui.multiSelection);
  const bounds = useAppStore((s) => s.ui.combinedSelectionBounds);
  const miterAxis = useAppStore((s) => s.ui.quickJoinMiterAxis);
  const autoDetectJoints = useAppStore((s) => s.autoDetectJoints);
  const applyButtJoints = useAppStore((s) => s.applyButtJoints);
  const applyLapJoints = useAppStore((s) => s.applyLapJoints);
  const applyMiterJoints = useAppStore((s) => s.applyMiterJoints);
  const setQuickJoinMiterAxis = useAppStore((s) => s.setQuickJoinMiterAxis);
  const setRadialWheelOpen = useAppStore((s) => s.setRadialWheelOpen);
  const selectMember = useAppStore((s) => s.selectMember);

  if (multiSelection.length < 2 || !bounds) return null;

  const centerX = (bounds.left + bounds.right) / 2;
  const top = Math.max(8, bounds.top - 56);

  return (
    <div
      className="absolute z-40 pointer-events-auto flex flex-wrap items-center gap-2 px-3 py-2 rounded-xl border-2 border-blue-500/70 bg-zinc-950/90 shadow-lg max-w-[min(520px,90vw)]"
      style={{
        left: centerX,
        top,
        transform: 'translateX(-50%)',
      }}
    >
      <span className="text-base font-semibold text-blue-200 w-full sm:w-auto">
        Join {multiSelection.length} boards
      </span>

      {miterAxis ? (
        <div className="flex flex-wrap gap-2 items-center w-full">
          <span className="text-base text-zinc-300">Miter axis:</span>
          {(['x', 'y', 'z'] as const).map((axis) => (
            <button
              key={axis}
              type="button"
              className="text-base px-3 py-1.5 rounded-lg border-2 border-zinc-600 hover:border-amber-500 text-zinc-200"
              onClick={() => applyMiterJoints(axis)}
            >
              {axis.toUpperCase()}
            </button>
          ))}
          <button
            type="button"
            className="text-base px-3 py-1.5 rounded-lg border-2 border-zinc-700 text-zinc-400"
            onClick={() => setQuickJoinMiterAxis(null)}
          >
            Cancel
          </button>
        </div>
      ) : (
        <>
          <button
            type="button"
            className="text-base px-3 py-1.5 rounded-lg border-2 border-blue-600 bg-blue-950/40 text-blue-100"
            onClick={() => autoDetectJoints()}
          >
            Auto-Detect Joints
          </button>
          <button
            type="button"
            className="text-base px-3 py-1.5 rounded-lg border-2 border-zinc-600 text-zinc-200 hover:border-amber-500"
            onClick={() => setQuickJoinMiterAxis('x')}
          >
            Miter
          </button>
          <button
            type="button"
            className="text-base px-3 py-1.5 rounded-lg border-2 border-zinc-600 text-zinc-200 hover:border-amber-500"
            onClick={() => applyButtJoints()}
          >
            Butt Joint
          </button>
          <button
            type="button"
            className="text-base px-3 py-1.5 rounded-lg border-2 border-zinc-600 text-zinc-200 hover:border-amber-500"
            onClick={() => applyLapJoints()}
          >
            Lap Joint
          </button>
          <button
            type="button"
            className="text-base px-3 py-1.5 rounded-lg border-2 border-zinc-600 text-zinc-200 hover:border-amber-500"
            onClick={() => {
              selectMember(multiSelection[0]);
              setRadialWheelOpen(true, 'full');
            }}
          >
            Open Radial Wheel
          </button>
        </>
      )}
    </div>
  );
}
