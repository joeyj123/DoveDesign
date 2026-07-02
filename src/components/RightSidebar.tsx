import { useAppStore } from '../store';
import ToolPanel from './ToolPanel';
import CutListPanel from './CutListPanel';
import EstimatingPanel from './EstimatingPanel';
import MemberInspector from './MemberInspector';
import TutorialPanel from './TutorialPanel';
import EngineeringPanel from './EngineeringPanel';
import HardwarePanel from './HardwarePanel';
import CutOptimizerPanel from './CutOptimizerPanel';
import ConnectionsPanel from './ConnectionsPanel';
import { MODE_PANEL_TABS } from '../lib/workspaceModes';
import type { RightPanelTab } from '../types';

const TAB_LABELS: Record<RightPanelTab, string> = {
  inspector: 'Inspector',
  estimating: 'Estimating',
  cutlist: 'Cut List',
  optimizer: 'Optimizer',
  engineering: 'Engineering',
  hardware: 'Hardware',
  tutorial: 'Tutorial',
  connections: 'Connections',
};

export default function RightSidebar() {
  const project = useAppStore((s) => s.project);
  const activeTab = useAppStore((s) => s.ui.rightPanelTab);
  const workspaceMode = useAppStore((s) => s.ui.workspaceMode);
  const setRightPanelTab = useAppStore((s) => s.setRightPanelTab);
  const updateProjectMeta = useAppStore((s) => s.updateProjectMeta);

  // Phase 20: tabs are filtered by the current workspace mode.
  const tabs = MODE_PANEL_TABS[workspaceMode].map((id) => ({ id, label: TAB_LABELS[id] }));

  return (
    <aside className="w-96 min-w-[24rem] bg-zinc-950 border-l border-neutral-800 flex flex-col shrink-0">
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

      <div className="flex flex-nowrap border-b border-zinc-800 shrink-0">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setRightPanelTab(tab.id)}
            title={tab.label}
            aria-label={tab.label}
            className={[
              'flex-1 min-w-0 px-1.5 py-2 text-xs font-semibold truncate transition-colors border-b-2',
              activeTab === tab.id
                ? 'text-amber-400 border-amber-500'
                : 'text-zinc-500 hover:text-zinc-300 border-transparent',
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
        {activeTab === 'optimizer' && <CutOptimizerPanel />}
        {activeTab === 'engineering' && <EngineeringPanel />}
        {activeTab === 'hardware' && <HardwarePanel />}
        {activeTab === 'tutorial' && <TutorialPanel />}
        {activeTab === 'connections' && <ConnectionsPanel />}
      </div>
    </aside>
  );
}
