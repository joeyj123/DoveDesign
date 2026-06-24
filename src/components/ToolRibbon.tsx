import { useAppStore } from '../store';
import type { ActiveTool } from '../types';

const TOOLS: { id: ActiveTool; short: string; label: string }[] = [
  { id: 'select',     short: 'Sel',  label: 'Select' },
  { id: 'drawBoard',  short: 'Draw', label: 'Draw' },
  { id: 'addBoard',   short: 'Add',  label: 'Add' },
  { id: 'cut',        short: 'XCut', label: 'Cross' },
  { id: 'rip',        short: 'Rip',  label: 'Rip' },
  { id: 'miter',      short: 'Mtr',  label: 'Miter' },
  { id: 'joinery',    short: 'Join', label: 'Join' },
  { id: 'trimExtend', short: 'Trim', label: 'Trim' },
  { id: 'mate',      short: 'Mate', label: 'Mate' },
];

export default function ToolRibbon() {
  const activeTool = useAppStore((s) => s.ui.activeTool);
  const setActiveTool = useAppStore((s) => s.setActiveTool);
  const setRightPanelTab = useAppStore((s) => s.setRightPanelTab);

  function pickTool(id: ActiveTool) {
    setActiveTool(id);
    if (id !== 'select') {
      setRightPanelTab('inspector');
    }
  }

  return (
    <nav
      className="w-16 shrink-0 flex flex-col items-stretch bg-zinc-950 border-r border-zinc-800 py-2 gap-0.5"
      aria-label="Shop tools"
    >
      {TOOLS.map((t) => (
        <button
          key={t.id}
          type="button"
          title={t.label}
          onClick={() => pickTool(t.id)}
          className={[
            'flex flex-col items-center justify-center py-2 px-1 mx-1 rounded-lg transition-colors',
            'text-[10px] font-semibold leading-tight tracking-wide',
            activeTool === t.id
              ? 'bg-amber-500/90 text-zinc-900 border-2 border-amber-400/80'
              : 'text-zinc-400 border-2 border-transparent hover:bg-zinc-900 hover:text-zinc-200',
          ].join(' ')}
        >
          <span className="text-[11px] font-bold">{t.short}</span>
          <span className="text-[9px] font-medium opacity-80 mt-0.5">{t.label}</span>
        </button>
      ))}
    </nav>
  );
}
