import { useAppStore } from '../store';

export default function ScrapBox() {
  const scraps = useAppStore((s) =>
    s.project.members.filter((m) => m.inScrapBox)
  );
  const open = useAppStore((s) => s.ui.scrapBoxOpen);
  const setScrapBoxOpen = useAppStore((s) => s.setScrapBoxOpen);
  const retrieveFromScrapBox = useAppStore((s) => s.retrieveFromScrapBox);
  const removeMember = useAppStore((s) => s.removeMember);
  const clearScrapBox = useAppStore((s) => s.clearScrapBox);

  const count = scraps.length;

  return (
    <div className="absolute bottom-4 left-4 z-20 select-none">
      {/* Collapsed badge */}
      <button
        type="button"
        title={open ? 'Collapse Scrap Box' : 'Open Scrap Box'}
        onClick={() => setScrapBoxOpen(!open)}
        className={[
          'flex items-center gap-2 px-3 py-2 rounded-xl border transition-colors text-base font-semibold',
          count > 0
            ? 'border-amber-500/60 bg-zinc-900/90 text-amber-300 hover:bg-zinc-800'
            : 'border-zinc-700 bg-zinc-900/80 text-zinc-500 hover:bg-zinc-800',
        ].join(' ')}
      >
        <span className="text-lg">🗑</span>
        <span>Scrap Box</span>
        {count > 0 && (
          <span className="ml-1 px-1.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
            {count}
          </span>
        )}
      </button>

      {/* Expanded panel */}
      {open && (
        <div className="absolute bottom-full mb-2 left-0 w-72 rounded-xl border border-zinc-700 bg-zinc-950/95 shadow-2xl overflow-hidden">
          <div className="px-3 py-2 border-b border-zinc-800 flex items-center justify-between">
            <span className="text-sm font-semibold text-amber-400">Scrap Box</span>
            {count > 0 && (
              <button
                type="button"
                onClick={clearScrapBox}
                className="text-xs text-red-400 hover:text-red-300 border border-red-800/60 rounded px-2 py-0.5"
              >
                Clear All
              </button>
            )}
          </div>

          {count === 0 ? (
            <p className="text-base text-zinc-500 px-3 py-4 text-center">
              No pieces in scrap box.
            </p>
          ) : (
            <ul className="max-h-72 overflow-y-auto divide-y divide-zinc-800">
              {scraps.map((m) => (
                <li key={m.id} className="px-3 py-2.5 flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-base font-medium text-zinc-200 truncate">{m.label}</p>
                    <p className="text-xs text-zinc-500 font-mono">
                      {m.length.toFixed(2)}&quot; × {m.width.toFixed(2)}&quot; × {m.thickness.toFixed(2)}&quot;
                    </p>
                  </div>
                  <div className="flex gap-1.5 shrink-0 mt-0.5">
                    <button
                      type="button"
                      onClick={() => retrieveFromScrapBox(m.id)}
                      className="text-xs px-2 py-1 rounded border border-amber-600/50 text-amber-300 hover:bg-amber-500/10 transition-colors"
                    >
                      Retrieve
                    </button>
                    <button
                      type="button"
                      onClick={() => removeMember(m.id)}
                      className="text-xs px-2 py-1 rounded border border-red-800/50 text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
