import { useAppStore } from '../store';
import { getFaceAlignedPlacement } from '../lib/mating';

export default function FastenerInfoPanel() {
  const selectedId = useAppStore((s) => s.ui.selectedFastenerId);
  const fastener = useAppStore((s) =>
    s.project.fasteners.find((f) => f.id === s.ui.selectedFastenerId)
  );
  const members = useAppStore((s) => s.project.members);
  const removeFastener = useAppStore((s) => s.removeFastener);
  const setSelectedFastenerId = useAppStore((s) => s.setSelectedFastenerId);

  if (!selectedId || !fastener) return null;

  // Derive live position fresh from the parent board's current transform
  // (CAD_MANIFESTO.md Law 1) rather than trusting a stored coordinate — falls
  // back to the legacy static position only for pre-Phase-19 fasteners.
  let livePosition: [number, number, number] | null = null;
  if (fastener.memberId && fastener.faceId && fastener.offset) {
    const member = members.find((m) => m.id === fastener.memberId);
    if (member) {
      const { position } = getFaceAlignedPlacement(member, fastener.faceId, fastener.offset);
      livePosition = [position.x, position.y, position.z];
    }
  } else if (fastener.position) {
    livePosition = fastener.position;
  }

  return (
    <div className="floating-panel absolute bottom-4 left-4 z-40 p-3 space-y-2 pointer-events-auto max-w-[200px]">
      <p className="text-sm font-semibold text-amber-200">Fastener</p>
      <p className="text-sm text-zinc-300">Type: {fastener.type}</p>
      {livePosition && (
        <p className="text-sm text-zinc-400 font-mono">
          ({livePosition.map((n) => n.toFixed(2)).join(', ')})
        </p>
      )}
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
