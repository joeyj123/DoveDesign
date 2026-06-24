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
    <div className="floating-panel absolute bottom-4 left-4 z-40 p-3 space-y-2 pointer-events-auto max-w-[200px]">
      <p className="text-sm font-semibold text-amber-200">Fastener</p>
      <p className="text-sm text-zinc-300">Type: {fastener.type}</p>
      <p className="text-sm text-zinc-400 font-mono">
        ({fastener.position.map((n) => n.toFixed(2)).join(', ')})
      </p>
      <button
        type="button"
        className="btn-secondary w-full text-sm py-1.5"
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
