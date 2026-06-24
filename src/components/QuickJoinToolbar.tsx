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

  if (multiSelection.length < 2 || !bounds) return null;

  const centerX = (bounds.left + bounds.right) / 2;
  const top = Math.max(8, bounds.top - 44);

  if (miterAxis) {
    return (
      <div
        className="floating-panel absolute z-40 pointer-events-auto flex flex-nowrap items-center gap-1.5 px-2 py-1 text-sm max-w-[min(520px,90vw)]"
        style={{
          left: centerX,
          top,
          transform: 'translateX(-50%)',
        }}
      >
        <span className="text-sm text-zinc-300 whitespace-nowrap">Miter axis:</span>
        {(['x', 'y', 'z'] as const).map((axis) => (
          <button
            key={axis}
            type="button"
            className="text-sm py-1 px-2 rounded border border-zinc-600 hover:border-amber-500 text-zinc-200 whitespace-nowrap"
            onClick={() => applyMiterJoints(axis)}
          >
            {axis.toUpperCase()}
          </button>
        ))}
        <button
          type="button"
          className="text-sm px-2 py-1 rounded border border-zinc-700 text-zinc-400 whitespace-nowrap"
          onClick={() => setQuickJoinMiterAxis(null)}
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div
      className="floating-panel absolute z-40 pointer-events-auto flex flex-nowrap items-center gap-1.5 px-2 py-1 text-sm max-w-[min(520px,90vw)] overflow-x-auto"
      style={{
        left: centerX,
        top,
        transform: 'translateX(-50%)',
      }}
    >
      <span className="text-sm font-semibold text-blue-200 whitespace-nowrap">
        Join {multiSelection.length} boards
      </span>
      <button
        type="button"
        className="text-sm py-1 px-2 rounded border border-blue-600/80 bg-blue-950/40 text-blue-100 whitespace-nowrap"
        onClick={() => autoDetectJoints()}
      >
        Auto-Detect
      </button>
      <button
        type="button"
        className="text-sm px-2 py-1 rounded border border-zinc-600 text-zinc-200 hover:border-amber-500 whitespace-nowrap"
        onClick={() => setQuickJoinMiterAxis('x')}
      >
        Miter
      </button>
      <button
        type="button"
        className="text-sm px-2 py-1 rounded border border-zinc-600 text-zinc-200 hover:border-amber-500 whitespace-nowrap"
        onClick={() => applyButtJoints()}
      >
        Butt Joint
      </button>
      <button
        type="button"
        className="text-sm px-2 py-1 rounded border border-zinc-600 text-zinc-200 hover:border-amber-500 whitespace-nowrap"
        onClick={() => applyLapJoints()}
      >
        Lap Joint
      </button>
    </div>
  );
}
