import type { ReactNode } from 'react';
import ChevronsIcon from './ChevronsIcon';

/**
 * Shared collapsible section header/body — the chevron expand/collapse
 * pattern used throughout the right panel (Board Properties, Entities, and
 * Template mode's grouped sections). Extracted from PropertiesPanel.tsx so
 * every collapsible section in the app shares one implementation instead of
 * each panel re-implementing the same toggle/chevron markup.
 */
export default function CollapsibleSection({
  title,
  open,
  onToggle,
  children,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <div className="border-b border-charcoal-800">
      <button
        onClick={onToggle}
        className="group w-full flex items-center justify-between px-3 py-2 text-left text-charcoal-300 hover:text-white"
      >
        <span className="text-xs uppercase tracking-wider pb-1 border-b border-spruce-700/50">{title}</span>
        <span className="text-charcoal-400 group-hover:text-spruce-400 transition-colors">
          <ChevronsIcon direction={open ? 'down' : 'right'} className="w-4 h-4" />
        </span>
      </button>
      {open && <div className="px-3 pb-3">{children}</div>}
    </div>
  );
}
