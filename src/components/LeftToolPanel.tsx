import { useState } from 'react';
import { useAppStore } from '../store';
import type { ActiveTool } from '../types';
import { PepeEmbedded } from './PepeAssistant';

type ToolTab = 'model' | 'modify' | 'joinery' | 'shapes';

const TABS: { id: ToolTab; label: string }[] = [
  { id: 'model', label: 'Model' },
  { id: 'modify', label: 'Modify' },
  { id: 'joinery', label: 'Joinery' },
  { id: 'shapes', label: 'Shapes' },
];

const MODEL_TOOLS: { id: ActiveTool; label: string }[] = [
  { id: 'select', label: 'Select' },
  { id: 'drawBoard', label: 'Draw' },
  { id: 'addBoard', label: 'Add' },
];

const MODIFY_TOOLS: { id: ActiveTool; label: string }[] = [
  { id: 'cut', label: 'Cross Cut (XCut)' },
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
  { id: 'shapeTriPrism', label: 'Triangle Prism' },
  { id: 'shapeHexPrism', label: 'Hexagon Prism' },
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

  function activateJoineryTool(
    tool: (typeof JOINERY_TOOLS)[number]
  ) {
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

  if (collapsed) {
    return (
      <button
        type="button"
        onClick={() => setCollapsed(false)}
        className="shrink-0 w-6 flex items-center justify-center bg-zinc-950 border-r border-zinc-800 text-zinc-400 hover:text-amber-300 hover:bg-zinc-900 text-base font-bold"
        title="Expand tool panel"
        aria-label="Expand tool panel"
      >
        »
      </button>
    );
  }

  return (
    <aside
      className="shrink-0 w-[180px] flex flex-col bg-zinc-950 border-r border-zinc-800 min-h-0"
      aria-label="Shop tools"
    >
      <button
        type="button"
        onClick={() => setCollapsed(true)}
        className="shrink-0 w-full h-8 text-base text-zinc-400 hover:text-amber-300 hover:bg-zinc-900 border-b border-zinc-800 text-left px-3"
        title="Collapse tool panel"
        aria-label="Collapse tool panel"
      >
        «
      </button>

      <nav className="shrink-0 flex flex-col border-b border-zinc-800">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={[
              'text-base text-left px-3 py-2 border-l-2 transition-colors',
              activeTab === tab.id
                ? 'font-bold text-amber-200 border-l-amber-500 border-b-2 border-b-amber-500/80 bg-zinc-900/60'
                : 'font-medium text-zinc-400 border-l-transparent hover:text-zinc-200 hover:bg-zinc-900/40',
            ].join(' ')}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <div className="flex-1 min-h-0 overflow-y-auto sidebar-scroll py-1">
        {toolsForTab}
      </div>

      <div className="shrink-0 border-t border-zinc-800 p-2">
        <PepeEmbedded />
      </div>
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
        'w-full h-10 flex items-center gap-2 px-2 text-base text-left transition-colors',
        active
          ? 'bg-amber-500/25 text-amber-100 border-y border-amber-500/60'
          : 'text-zinc-300 border-y border-transparent hover:bg-zinc-900 hover:text-zinc-100',
      ].join(' ')}
    >
      <span className="w-5 h-5 shrink-0 rounded bg-zinc-800 border border-zinc-700" aria-hidden />
      <span className="truncate">{label}</span>
    </button>
  );
}
