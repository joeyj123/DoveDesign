import { useAppStore } from '../store';
import { MODE_LABELS, MODE_ORDER } from '../lib/workspaceModes';

/**
 * Phase 20: top-center Mode Switcher — Model / Assembly / Detail. Pure
 * subscriber: reads ui.workspaceMode, calls setWorkspaceMode. The mode
 * filters the Left Toolbar and Right Inspector everywhere else.
 */
export default function ModeSwitcher() {
  const workspaceMode = useAppStore((s) => s.ui.workspaceMode);
  const setWorkspaceMode = useAppStore((s) => s.setWorkspaceMode);

  return (
    <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 flex rounded-lg overflow-hidden border border-neutral-700 bg-zinc-900/95 shadow-lg">
      {MODE_ORDER.map((mode) => {
        const active = workspaceMode === mode;
        return (
          <button
            key={mode}
            type="button"
            onClick={() => setWorkspaceMode(mode)}
            title={MODE_LABELS[mode].blurb}
            aria-pressed={active}
            className={[
              'px-5 py-2 text-base font-semibold transition-colors border-r border-neutral-700 last:border-r-0',
              active
                ? 'bg-amber-500/25 text-amber-200'
                : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800',
            ].join(' ')}
          >
            {MODE_LABELS[mode].label}
          </button>
        );
      })}
    </div>
  );
}
