import { useAppStore } from '../store';
import { getHintText } from '../lib/workspaceModes';

/**
 * Phase 20: persistent single-line contextual hint strip at the bottom of
 * the viewport — current mode · active tool · next expected action. Pure
 * subscriber of (workspaceMode, activeTool, pendingInteraction, mate picks).
 */
export default function HintBar() {
  const ui = useAppStore((s) => s.ui);
  const members = useAppStore((s) => s.project.members);

  const text = getHintText(ui, (id) => members.find((m) => m.id === id)?.label ?? 'board');

  return (
    <div className="absolute bottom-0 left-0 right-0 z-30 px-4 py-2 bg-zinc-900/90 border-t border-neutral-800 text-base text-zinc-200 pointer-events-none select-none truncate">
      {text}
    </div>
  );
}
