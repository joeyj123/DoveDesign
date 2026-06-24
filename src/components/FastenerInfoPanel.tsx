import { useAppStore } from '../store';

export default function FastenerInfoPanel() {
  const selectedId = useAppStore((s) => s.ui.selectedFastenerId);
  const fastener = useAppStore((s) =>
    s.project.fasteners.find((f) => f.id === s.ui.selectedFastenerId)
  );
  const removeFastener = useAppStore((s) => s.removeFastener);
  const setSelectedFastenerId = useAppStore((s) => s.setSelectedFastenerId);

  if (!selectedId || !fastener) return null;

  return (
    <div className="absolute bottom-4 left-4 z-40 bg-zinc-950/95 border-2 border-amber-500/50 rounded-xl p-4 space-y-2 pointer-events-auto min-w-[220px]">
      <p className="text-base font-semibold text-amber-200">Fastener</p>
      <p className="text-base text-zinc-300">Type: {fastener.type}</p>
      <p className="text-base text-zinc-400 font-mono text-sm">
        ({fastener.position.map((n) => n.toFixed(2)).join(', ')})
      </p>
      <button
        type="button"
        className="btn-secondary w-full text-base py-2"
        onClick={() => {
          removeFastener(fastener.id);
          setSelectedFastenerId(null);
        }}
      >
        Remove
      </button>
    </div>
  );
}
