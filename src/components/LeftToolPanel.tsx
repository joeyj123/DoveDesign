import { useState } from 'react';
import { useAppStore } from '../store';
import type { ActiveTool } from '../types';
import { PepeEmbedded } from './PepeAssistant';

type ToolTab = 'model' | 'modify' | 'joinery' | 'shapes';

const TAB_WIDTH = 36;
const PANEL_WIDTH = 180;

const TABS: { id: ToolTab; short: string; label: string }[] = [
  { id: 'model', short: 'M', label: 'Model' },
  { id: 'modify', short: 'D', label: 'Modify' },
  { id: 'joinery', short: 'J', label: 'Joinery' },
  { id: 'shapes', short: 'S', label: 'Shapes' },
];

const MODEL_TOOLS: { id: ActiveTool; label: string }[] = [
  { id: 'select', label: 'Select' },
  { id: 'drawBoard', label: 'Draw' },
  { id: 'addBoard', label: 'Add' },
];

const MODIFY_TOOLS: { id: ActiveTool; label: string }[] = [
  { id: 'cut', label: 'Cross Cut' },
  { id: 'rip', label: 'Rip Cut' },
  { id: 'miter', label: 'Miter' },
  { id: 'trimExtend', label: 'Trim' },
  { id: 'joinery', label: 'Join' },
];

const JOINERY_TOOLS: { id: ActiveTool; label: string; action?: 'mate' | 'edge' | 'attach' }[] = [
  { id: 'mate', label: 'Mate', action: 'mate' },
  { id: 'edge', label: 'Edge Treatment', action: 'edge' },
  { id: 'select', label: 'Attach Point', action: 'attach' },
];

const SHAPE_TOOLS: { id: ActiveTool; label: string }[] = [
  { id: 'shapeCylinder', label: 'Cylinder' },
  { id: 'shapeSphere', label: 'Sphere' },
  { id: 'shapeCone', label: 'Cone' },
  { id: 'shapeTriPrism', label: 'Triangle' },
  { id: 'shapeHexPrism', label: 'Hexagon' },
];

export default function LeftToolPanel() {
  const [collapsed, setCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<ToolTab>('model');
  const activeTool = useAppStore((s) => s.ui.activeTool);
  const selectedId = useAppStore((s) => s.ui.selectedMemberId);
  const setActiveTool = useAppStore((s) => s.setActiveTool);
  const setRightPanelTab = useAppStore((s) => s.setRightPanelTab);
  const addMember = useAppStore((s) => s.addMember);
  const setMatePickTarget = useAppStore((s) => s.setMatePickTarget);
  const setMateFaceA = useAppStore((s) => s.setMateFaceA);
  const setMateFaceB = useAppStore((s) => s.setMateFaceB);
  const setEdgeToolMemberId = useAppStore((s) => s.setEdgeToolMemberId);
  const setAttachmentPointPickA = useAppStore((s) => s.setAttachmentPointPickA);

  function pickTool(id: ActiveTool) {
    setActiveTool(id);
    if (id !== 'select') setRightPanelTab('inspector');
  }

  function activateJoineryTool(tool: (typeof JOINERY_TOOLS)[number]) {
    if (tool.action === 'mate') {
      pickTool('mate');
      setMatePickTarget('A');
      setMateFaceA(null);
      setMateFaceB(null);
      return;
    }
    if (tool.action === 'edge') {
      pickTool('edge');
      if (selectedId) setEdgeToolMemberId(selectedId);
      return;
    }
    if (tool.action === 'attach') {
      pickTool('mate');
      setMateFaceA(null);
      setMateFaceB(null);
      setAttachmentPointPickA(null);
      return;
    }
    pickTool(tool.id);
  }

  function addShape(tool: ActiveTool) {
    const base = {
      label: tool.replace('shape', ''),
      category: 'Softwood' as const,
      species: 'Southern Yellow Pine',
      nominalSize: 'Custom' as const,
      thickness: 1.5,
      width: 6,
      length: 12,
      position: [0, 0.75, 0] as [number, number, number],
      rotation: [0, 0, 0] as [number, number, number],
      costPerBoardFoot: 3.5,
      color: '#d4a96a',
      isSelected: false,
      cuts: [],
      orientation: 'flat' as const,
      loadLbs: 0,
      materialKind: 'dimensional' as const,
      radius: 3,
    };
    const shapeMap: Partial<Record<ActiveTool, import('../types').WoodShapeType>> = {
      shapeCylinder: 'cylinder',
      shapeSphere: 'sphere',
      shapeCone: 'cone',
      shapeTriPrism: 'triangularPrism',
      shapeHexPrism: 'hexagonalPrism',
    };
    const id = crypto.randomUUID();
    addMember({ ...base, id, shapeType: shapeMap[tool] ?? 'box' });
    setActiveTool('select');
  }

  const toolsForTab = (() => {
    switch (activeTab) {
      case 'model':
        return MODEL_TOOLS.map((t) => (
          <ToolButton
            key={t.id}
            label={t.label}
            active={activeTool === t.id}
            onClick={() => pickTool(t.id)}
          />
        ));
      case 'modify':
        return MODIFY_TOOLS.map((t) => (
          <ToolButton
            key={t.id}
            label={t.label}
            active={activeTool === t.id}
            onClick={() => pickTool(t.id)}
          />
        ));
      case 'joinery':
        return JOINERY_TOOLS.map((t) => (
          <ToolButton
            key={t.label}
            label={t.label}
            active={
              t.action === 'attach'
                ? activeTool === 'mate'
                : activeTool === t.id
            }
            onClick={() => activateJoineryTool(t)}
          />
        ));
      case 'shapes':
        return SHAPE_TOOLS.map((t) => (
          <ToolButton
            key={t.id}
            label={t.label}
            active={activeTool === t.id}
            onClick={() => addShape(t.id)}
          />
        ));
    }
  })();

  return (
    <aside
      className="shrink-0 flex bg-zinc-950 border-r border-zinc-800 min-h-0"
      style={{ width: collapsed ? TAB_WIDTH : PANEL_WIDTH }}
      aria-label="Shop tools"
    >
      <nav className="shrink-0 flex flex-col border-r border-zinc-800" style={{ width: TAB_WIDTH }}>
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          className="h-8 text-sm text-zinc-400 hover:text-amber-300 hover:bg-zinc-900 border-b border-zinc-800"
          title={collapsed ? 'Expand tool panel' : 'Collapse tool panel'}
          aria-label={collapsed ? 'Expand tool panel' : 'Collapse tool panel'}
        >
          {collapsed ? '»' : '«'}
        </button>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              setActiveTab(tab.id);
              if (collapsed) setCollapsed(false);
            }}
            title={tab.label}
            className={[
              'h-10 flex flex-col items-center justify-center text-xs border-l-2 transition-colors',
              activeTab === tab.id
                ? 'font-bold text-amber-200 border-l-amber-500 bg-zinc-900/60'
                : 'font-medium text-zinc-500 border-l-transparent hover:text-zinc-200 hover:bg-zinc-900/40',
            ].join(' ')}
          >
            <span className="text-sm font-bold leading-none">{tab.short}</span>
            {!collapsed && (
              <span className="text-[9px] mt-0.5 leading-none truncate max-w-full px-0.5">
                {tab.label.slice(0, 4)}
              </span>
            )}
          </button>
        ))}
      </nav>

      {!collapsed && (
        <div className="flex-1 flex flex-col min-w-0 min-h-0">
          <div className="flex-1 min-h-0 overflow-y-auto sidebar-scroll py-1">
            {toolsForTab}
          </div>
          <div className="shrink-0 border-t border-zinc-800 p-2">
            <PepeEmbedded />
          </div>
        </div>
      )}
    </aside>
  );
}

function ToolButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'w-full h-10 flex items-center px-2 text-base text-left transition-colors',
        active
          ? 'bg-amber-500/25 text-amber-100 border border-amber-500/70'
          : 'text-zinc-300 border border-transparent hover:bg-zinc-900 hover:text-zinc-100',
      ].join(' ')}
    >
      <span className="truncate">{label}</span>
    </button>
  );
}
