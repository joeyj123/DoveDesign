import { useState } from 'react';
import { useAppStore } from '../store';
import type { ActiveTool, WorkspaceMode } from '../types';
import { PepeEmbedded } from './PepeAssistant';
import { findOpenSpawnPosition } from '../lib/bounds';

const TAB_WIDTH = 48;
const PANEL_WIDTH = 220;

interface ToolEntry {
  id: ActiveTool;
  label: string;
  action?: 'tool' | 'shape' | 'mate' | 'edge' | 'connections';
}

interface ToolSection {
  heading: string;
  tools: ToolEntry[];
}

/**
 * Phase 20: the Left Toolbar renders ONLY the current workspace mode's tools
 * (single source of truth: lib/workspaceModes.ts MODE_TOOLS — this layout is
 * the presentational grouping of exactly that list).
 */
const MODE_SECTIONS: Record<WorkspaceMode, ToolSection[]> = {
  model: [
    {
      heading: 'Boards',
      tools: [
        { id: 'select', label: 'Select' },
        { id: 'drawBoard', label: 'Draw Board' },
        { id: 'addBoard', label: 'Add Board' },
      ],
    },
    {
      heading: 'Shaping',
      tools: [
        { id: 'trimExtend', label: 'Trim / Extend' },
        { id: 'cut', label: 'Cross Cut' },
        { id: 'rip', label: 'Rip Cut' },
        { id: 'miter', label: 'Miter' },
      ],
    },
    {
      heading: 'Layout',
      tools: [
        { id: 'measure', label: 'Measure' },
        { id: 'centerline', label: 'Centerline' },
      ],
    },
    {
      heading: 'Shapes',
      tools: [
        { id: 'shapeCylinder', label: 'Cylinder', action: 'shape' },
        { id: 'shapeSphere', label: 'Sphere', action: 'shape' },
        { id: 'shapeCone', label: 'Cone', action: 'shape' },
        { id: 'shapeTriPrism', label: 'Triangle', action: 'shape' },
        { id: 'shapeHexPrism', label: 'Hexagon', action: 'shape' },
      ],
    },
  ],
  assembly: [
    {
      heading: 'Joining',
      tools: [
        { id: 'select', label: 'Select' },
        { id: 'mate', label: 'Mate (Join Boards)', action: 'mate' },
        { id: 'measure', label: 'Measure' },
      ],
    },
  ],
  detail: [
    {
      heading: 'Connections',
      tools: [
        { id: 'select', label: 'Select' },
        { id: 'connection', label: 'Connections', action: 'connections' },
        { id: 'edge', label: 'Edge Treatment', action: 'edge' },
        { id: 'measure', label: 'Measure' },
      ],
    },
  ],
};

export default function LeftToolPanel() {
  const [collapsed, setCollapsed] = useState(false);
  const activeTool = useAppStore((s) => s.ui.activeTool);
  const workspaceMode = useAppStore((s) => s.ui.workspaceMode);
  const selectedId = useAppStore((s) => s.ui.selectedMemberId);
  const setActiveTool = useAppStore((s) => s.setActiveTool);
  const setRightPanelTab = useAppStore((s) => s.setRightPanelTab);
  const addMember = useAppStore((s) => s.addMember);
  const existingMembers = useAppStore((s) => s.project.members);
  const setMatePickTarget = useAppStore((s) => s.setMatePickTarget);
  const setMateFaceA = useAppStore((s) => s.setMateFaceA);
  const setMateFaceB = useAppStore((s) => s.setMateFaceB);
  const setEdgeToolMemberId = useAppStore((s) => s.setEdgeToolMemberId);

  function pickTool(id: ActiveTool) {
    setActiveTool(id);
    if (id !== 'select' && id !== 'connection') setRightPanelTab('inspector');
  }

  function activate(entry: ToolEntry) {
    switch (entry.action) {
      case 'mate':
        pickTool('mate');
        setMatePickTarget('A');
        setMateFaceA(null);
        setMateFaceB(null);
        return;
      case 'edge':
        pickTool('edge');
        if (selectedId) setEdgeToolMemberId(selectedId);
        return;
      case 'connections':
        setActiveTool('connection');
        setRightPanelTab('connections');
        return;
      case 'shape':
        addShape(entry.id);
        return;
      default:
        pickTool(entry.id);
    }
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
    const position = findOpenSpawnPosition(existingMembers, [base.length, base.thickness, base.width]);
    addMember({ ...base, id, position, shapeType: shapeMap[tool] ?? 'box' });
    setActiveTool('select');
  }

  const sections = MODE_SECTIONS[workspaceMode];

  return (
    <aside
      className="shrink-0 flex bg-zinc-950 border-r border-neutral-800 min-h-0"
      style={{ width: collapsed ? TAB_WIDTH : PANEL_WIDTH }}
      aria-label="Shop tools"
    >
      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          className="h-8 shrink-0 text-sm text-zinc-400 hover:text-amber-300 hover:bg-zinc-900 border-b border-zinc-800"
          title={collapsed ? 'Expand tool panel' : 'Collapse tool panel'}
          aria-label={collapsed ? 'Expand tool panel' : 'Collapse tool panel'}
        >
          {collapsed ? '»' : '«'}
        </button>

        {!collapsed && (
          <>
            <div className="flex-1 min-h-0 overflow-y-auto sidebar-scroll py-1 px-1.5">
              {sections.map((section) => (
                <div key={section.heading} className="mb-2">
                  <div className="px-2 pt-2 pb-1 text-xs uppercase tracking-wider text-zinc-500 font-semibold">
                    {section.heading}
                  </div>
                  {section.tools.map((t) => (
                    <ToolButton
                      key={`${t.id}-${t.label}`}
                      label={t.label}
                      active={activeTool === t.id && t.action !== 'shape'}
                      onClick={() => activate(t)}
                    />
                  ))}
                </div>
              ))}
            </div>
            <div className="shrink-0 border-t border-zinc-800 p-2">
              <PepeEmbedded />
            </div>
          </>
        )}
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
        'w-full min-h-10 flex items-center my-0.5 px-2.5 py-1.5 rounded text-base text-left transition-colors',
        active
          ? 'bg-amber-500/25 text-amber-100 border border-amber-500/70'
          : 'text-zinc-300 border border-transparent hover:bg-zinc-900 hover:text-zinc-100',
      ].join(' ')}
    >
      <span className="whitespace-normal leading-snug">{label}</span>
    </button>
  );
}
