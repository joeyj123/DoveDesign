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
  { id: 'mate',       short: 'Mate', label: 'Mate' },
  { id: 'edge',       short: 'Edge', label: 'Edge' },
];

const SHAPES: { id: ActiveTool; short: string; label: string }[] = [
  { id: 'shapeCylinder', short: 'Cyl', label: 'Cylinder' },
  { id: 'shapeSphere', short: 'Sph', label: 'Sphere' },
  { id: 'shapeCone', short: 'Con', label: 'Cone' },
  { id: 'shapeTriPrism', short: 'Tri', label: 'Triangle' },
  { id: 'shapeHexPrism', short: 'Hex', label: 'Hexagon' },
  { id: 'shapePolygon', short: 'Poly', label: 'Polygon' },
];

export default function ToolRibbon() {
  const activeTool = useAppStore((s) => s.ui.activeTool);
  const setActiveTool = useAppStore((s) => s.setActiveTool);
  const setRightPanelTab = useAppStore((s) => s.setRightPanelTab);
  const addMember = useAppStore((s) => s.addMember);
  const selectMember = useAppStore((s) => s.selectMember);

  function pickTool(id: ActiveTool) {
    setActiveTool(id);
    if (id !== 'select') setRightPanelTab('inspector');
  }

  function addShape(tool: ActiveTool) {
    pickTool(tool);
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
      shapePolygon: 'customPolygon',
    };
    if (tool === 'shapePolygon') {
      setActiveTool('shapePolygon');
      return;
    }
    const id = crypto.randomUUID();
    addMember({ ...base, id, shapeType: shapeMap[tool] ?? 'box' });
    selectMember(id);
    setActiveTool('select');
  }

  return (
    <nav
      className="w-16 shrink-0 flex flex-col items-stretch bg-zinc-950 border-r border-zinc-800 py-2 gap-0.5 overflow-y-auto"
      aria-label="Shop tools"
    >
      {TOOLS.map((t) => (
        <ToolButton key={t.id} tool={t} active={activeTool === t.id} onClick={() => pickTool(t.id)} />
      ))}
      <p className="text-[9px] text-zinc-600 text-center uppercase tracking-wider mt-2 mb-1 px-1">Shapes</p>
      {SHAPES.map((t) => (
        <ToolButton key={t.id} tool={t} active={activeTool === t.id} onClick={() => addShape(t.id)} />
      ))}
    </nav>
  );
}

function ToolButton({
  tool,
  active,
  onClick,
}: {
  tool: { short: string; label: string };
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={tool.label}
      onClick={onClick}
      className={[
        'flex flex-col items-center justify-center py-2 px-1 mx-1 rounded-lg transition-colors',
        'text-[10px] font-semibold leading-tight tracking-wide',
        active
          ? 'bg-amber-500/90 text-zinc-900 border-2 border-amber-400/80'
          : 'text-zinc-400 border-2 border-transparent hover:bg-zinc-900 hover:text-zinc-200',
      ].join(' ')}
    >
      <span className="text-[11px] font-bold">{tool.short}</span>
      <span className="text-[9px] font-medium opacity-80 mt-0.5">{tool.label}</span>
    </button>
  );
}
