import { useAppStore } from '../store';

function formatTimestamp(iso: string | null): string {
  if (!iso) return 'a previous session';
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return 'a previous session';
  }
}

export default function RecoveryBanner() {
  const recoveryAvailable = useAppStore((s) => s.recoveryAvailable);
  const recoveryTimestamp = useAppStore((s) => s.recoveryTimestamp);
  const recoverAutosave = useAppStore((s) => s.recoverAutosave);
  const dismissRecovery = useAppStore((s) => s.dismissRecovery);

  if (!recoveryAvailable) return null;

  return (
    <div className="shrink-0 bg-amber-900/40 border-b border-amber-700 px-4 py-2 flex items-center justify-between gap-3">
      <span className="text-base text-amber-200">
        Unsaved work found from {formatTimestamp(recoveryTimestamp)}. This is a background crash-recovery
        backup — it was not loaded automatically.
      </span>
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={recoverAutosave}
          className="text-base px-3 py-1 rounded bg-amber-600 hover:bg-amber-500 text-zinc-950 font-semibold transition-colors"
        >
          Recover
        </button>
        <button
          type="button"
          onClick={dismissRecovery}
          className="text-base px-3 py-1 rounded border border-amber-700 text-amber-200 hover:bg-amber-900/60 transition-colors"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
