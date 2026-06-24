import { useAppStore } from '../store';
import type { HardwareLibraryId } from '../types';

const LIBRARY: { id: HardwareLibraryId; label: string; cost: number; svg: JSX.Element }[] = [
  {
    id: 'drawer-slide',
    label: 'Drawer slide (full extension)',
    cost: 12,
    svg: (
      <svg viewBox="0 0 80 24" className="w-full h-8">
        <rect x="4" y="10" width="72" height="4" fill="#71717a" rx="1" />
        <rect x="8" y="8" width="64" height="8" fill="none" stroke="#a1a1aa" strokeWidth="1" />
      </svg>
    ),
  },
  {
    id: 'cabinet-hinge',
    label: 'Cabinet hinge (Euro cup)',
    cost: 4.5,
    svg: (
      <svg viewBox="0 0 40 40" className="w-10 h-10">
        <circle cx="14" cy="20" r="8" fill="#52525b" stroke="#a1a1aa" />
        <rect x="22" y="17" width="14" height="6" fill="#71717a" />
      </svg>
    ),
  },
  {
    id: 'drawer-pull',
    label: 'Drawer pull / handle',
    cost: 6,
    svg: (
      <svg viewBox="0 0 60 24" className="w-full h-8">
        <rect x="8" y="4" width="4" height="16" fill="#a1a1aa" />
        <rect x="48" y="4" width="4" height="16" fill="#a1a1aa" />
        <rect x="8" y="10" width="44" height="4" fill="#d4d4d8" rx="2" />
      </svg>
    ),
  },
  {
    id: 'shelf-pin',
    label: 'Shelf pin',
    cost: 0.25,
    svg: (
      <svg viewBox="0 0 16 16" className="w-6 h-6">
        <circle cx="8" cy="8" r="4" fill="#a1a1aa" />
      </svg>
    ),
  },
  {
    id: 'cam-lock',
    label: 'Cam lock connector',
    cost: 2,
    svg: (
      <svg viewBox="0 0 24 24" className="w-8 h-8">
        <circle cx="12" cy="12" r="8" fill="#71717a" />
        <line x1="12" y1="12" x2="18" y2="8" stroke="#27272a" strokeWidth="2" />
      </svg>
    ),
  },
  {
    id: 'corner-bracket',
    label: 'Corner bracket',
    cost: 3,
    svg: (
      <svg viewBox="0 0 32 32" className="w-8 h-8">
        <path d="M4 28 L4 12 L12 12 L12 4 L28 4 L28 12 L12 12 L12 28 Z" fill="#a1a1aa" />
      </svg>
    ),
  },
  {
    id: 'barrel-bolt',
    label: 'Barrel bolt',
    cost: 8,
    svg: (
      <svg viewBox="0 0 48 16" className="w-full h-6">
        <rect x="2" y="4" width="12" height="8" fill="#71717a" />
        <rect x="14" y="6" width="30" height="4" fill="#a1a1aa" rx="2" />
      </svg>
    ),
  },
];

export default function HardwarePanel() {
  const pick = useAppStore((s) => s.ui.hardwareLibraryPick);
  const setHardwareLibraryPick = useAppStore((s) => s.setHardwareLibraryPick);
  const placed = useAppStore((s) => s.project.placedHardware);
  const removePlacedHardware = useAppStore((s) => s.removePlacedHardware);

  return (
    <div className="space-y-4">
      <p className="text-base text-zinc-400">
        Browse hardware, click to arm placement, then click a board face in the viewport.
      </p>
      <ul className="space-y-3">
        {LIBRARY.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => setHardwareLibraryPick(pick === item.id ? null : item.id)}
              className={[
                'w-full text-left rounded-xl border-2 p-3 transition-colors',
                pick === item.id
                  ? 'border-amber-500 bg-amber-950/40'
                  : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-600',
              ].join(' ')}
            >
              <div className="flex items-center gap-3">
                {item.svg}
                <div>
                  <p className="text-base font-medium text-zinc-200">{item.label}</p>
                  <p className="text-base text-zinc-500">${item.cost.toFixed(2)} each</p>
                </div>
              </div>
            </button>
          </li>
        ))}
      </ul>
      {placed.length > 0 && (
        <section className="space-y-2">
          <h3 className="text-base font-semibold text-zinc-300">Placed hardware</h3>
          {placed.map((h) => (
            <div key={h.id} className="flex justify-between items-center text-base border border-zinc-800 rounded-lg px-3 py-2">
              <span className="text-zinc-300">{h.libraryId}</span>
              <button type="button" className="text-red-400 text-base" onClick={() => removePlacedHardware(h.id)}>
                Remove
              </button>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}

export { LIBRARY as HARDWARE_LIBRARY };
