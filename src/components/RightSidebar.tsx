import { useAppStore } from '../store';
import ToolPanel from './ToolPanel';
import CutListPanel from './CutListPanel';
import EstimatingPanel from './EstimatingPanel';
import MemberInspector from './MemberInspector';
import TutorialPanel from './TutorialPanel';
import EngineeringPanel from './EngineeringPanel';
import type { RightPanelTab } from '../types';

const TABS: { id: RightPanelTab; label: string }[] = [
  { id: 'inspector', label: 'Inspector' },
  { id: 'estimating', label: 'Estimating' },
  { id: 'cutlist', label: 'Cut List' },
  { id: 'engineering', label: 'Engineering' },
  { id: 'tutorial', label: 'Tutorial' },
];

export default function RightSidebar() {
  const project = useAppStore((s) => s.project);
  const activeTab = useAppStore((s) => s.ui.rightPanelTab);
  const setRightPanelTab = useAppStore((s) => s.setRightPanelTab);
  const updateProjectMeta = useAppStore((s) => s.updateProjectMeta);

  return (
    <aside className="w-96 min-w-[24rem] bg-zinc-950 border-l border-zinc-800 flex flex-col shrink-0">
      <div className="px-4 py-2 border-b border-zinc-800 shrink-0 space-y-2">
        <label className="flex flex-col gap-0.5 text-sm">
          <span className="text-xs text-zinc-500 uppercase tracking-wider">Project</span>
          <input
            className="input-field text-sm"
            value={project.name}
            onChange={(e) => updateProjectMeta({ name: e.target.value })}
          />
        </label>
      </div>

      <div className="flex border-b border-zinc-800 shrink-0">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setRightPanelTab(tab.id)}
            className={[
              'flex-1 min-w-0 px-1 py-2 text-xs font-medium whitespace-nowrap transition-colors',
              activeTab === tab.id
                ? 'text-amber-400 border-b-2 border-amber-500 bg-zinc-900'
                : 'text-zinc-500 hover:text-zinc-300 border-b-2 border-transparent',
            ].join(' ')}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="sidebar-scroll flex-1 p-4">
        {activeTab === 'inspector' && (
          <>
            <ToolPanel />
            <MemberInspector />
          </>
        )}
        {activeTab === 'estimating' && <EstimatingPanel />}
        {activeTab === 'cutlist' && <CutListPanel />}
        {activeTab === 'engineering' && <EngineeringPanel />}
        {activeTab === 'tutorial' && <TutorialPanel />}
      </div>
    </aside>
  );
}
