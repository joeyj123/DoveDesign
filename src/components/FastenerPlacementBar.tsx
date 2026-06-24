import { useAppStore } from '../store';

export default function FastenerPlacementBar() {
  const active = useAppStore((s) => s.ui.fastenerPlacementMode);
  const mateId = useAppStore((s) => s.ui.fastenerPlacementMateId);
  const mates = useAppStore((s) => s.project.mates);
  const setFastenerPlacementMode = useAppStore((s) => s.setFastenerPlacementMode);

  if (!active || !mateId) return null;
  const mate = mates.find((m) => m.id === mateId);

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 bg-zinc-950/95 border-2 border-amber-500/60 rounded-xl px-4 py-3 pointer-events-auto">
      <p className="text-base text-amber-100">
        Placing {mate?.joinMethod ?? 'fasteners'} — click joint face on ¼&quot; grid
      </p>
      <button
        type="button"
        className="btn-primary text-base py-2 px-4"
        onClick={() => setFastenerPlacementMode(false, null)}
      >
        Done Placing
      </button>
    </div>
  );
}
