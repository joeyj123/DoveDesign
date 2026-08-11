import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useAppStore } from '../store';
import type { ActiveTool } from '../types';
import Tooltip from './Tooltip';
import ChevronsIcon from './ChevronsIcon';
import LogoMark from './LogoMark';

/**
 * Data Flow Pipeline: Tool Rail (New Order 5, extended New Order 5.1)
 *
 * INPUT: ui.activeTool (which button/group is highlighted), ui.workspaceMode
 *   (the mode badge at the top). New Order 5.1 adds: a purely local
 *   `openGroupId` flyout-open flag (which group, if any, is currently flown
 *   out over the canvas) — this is ephemeral UI chrome, not board state, so
 *   it intentionally does NOT live in the Zustand store.
 *
 * CALCULATION: none — pure UI routing. Clicking a top-level tool button, or
 *   a tool button inside an expanded group's flyout, calls the SAME
 *   store.setActiveTool() every other tool trigger already used before this
 *   Order; no second tool-switching code path is introduced. Clicking a
 *   group's own button only toggles `openGroupId` — it never changes
 *   activeTool by itself.
 *
 * OUTPUT: ui.activeTool. Every tool component (SketchTool, MoveGizmo,
 *   RotateGizmo, InsertPanel via PropertiesPanel) already reads this same
 *   field to decide whether it renders — this rail is a new way to SET it,
 *   not a new consumer of a duplicate flag.
 *
 * FOLLOWS-BOARD CHECK: n/a — UI chrome, not board geometry.
 */

interface ToolDef {
  tool: ActiveTool;
  label: string;
  shortcut: string;
  description: string;
  icon: JSX.Element;
  /** Reserved for a future tool (e.g. Fillet, Freeform Cutout) — visible in
   * the flyout so the roadmap is discoverable, but inert until built,
   * same "real placeholder, not a fake final asset" pattern as the
   * disabled Pepe rail slot. */
  disabled?: boolean;
}

type RailItem =
  | ({ kind: 'tool' } & ToolDef)
  | { kind: 'group'; id: string; label: string; description: string; icon: JSX.Element; tools: ToolDef[] };

function IconSelect() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 3l5.5 15 2-6.3L19 9.5z" />
    </svg>
  );
}

function IconMove() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v18M3 12h18M12 3l-3 3M12 3l3 3M12 21l-3-3M12 21l3-3M3 12l3-3M3 12l3 3M21 12l-3-3M21 12l-3 3" />
    </svg>
  );
}

function IconRotate() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12a8 8 0 1 1 2.6 5.9" />
      <path d="M4 17v-4h4" />
    </svg>
  );
}

function IconSketch() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 20l1-4.2L15.8 5 19 8.2 8.2 19 4 20z" />
      <path d="M13.5 6.5l4 4" />
    </svg>
  );
}

function IconInsert() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M12 8v8M8 12h8" />
    </svg>
  );
}

function IconTransformGroup() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v6M12 16v6M2 12h6M16 12h6" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function IconCreateGroup() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function IconAnnotateGroup() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 17h16M4 17l2-3M20 17l-2-3M4 7h2M18 7h2M6 7h12" />
    </svg>
  );
}

function IconDimensionLine() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 8v8M20 8v8M4 12h16" />
      <path d="M7 9.5L4 12l3 2.5M17 9.5L20 12l-3 2.5" />
    </svg>
  );
}

function IconReferenceLine() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 20L20 4" />
      <path d="M4 4v4M4 4h4M18 16v4M18 20h2" />
    </svg>
  );
}

function IconTemplate() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 16l9-5 9 5-9 5-9-5z" />
      <path d="M12 11V4" />
      <path d="M9 6l3-3 3 3" />
    </svg>
  );
}

function IconMate() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="9" width="8" height="8" rx="1" />
      <rect x="13" y="7" width="8" height="8" rx="1" />
      <path d="M11 12h2" />
    </svg>
  );
}

function IconTrimExtend() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12h9" />
      <path d="M17 12h3" />
      <path d="M13 8l4 4-4 4" />
    </svg>
  );
}

function IconModifyGroup() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 20L16 8" />
      <path d="M16 8l2-2 2 2-2 2z" />
      <path d="M4 20l2-6 4 4z" />
    </svg>
  );
}

function IconChamfer() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 16V6a2 2 0 012-2h10" />
      <path d="M4 16l6 4h10V8l-4-4" />
    </svg>
  );
}

function IconFillet() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 16V10a6 6 0 016-6h10" />
      <path d="M4 16l6 4h10V6" />
    </svg>
  );
}

function IconCutout() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="4" width="16" height="16" rx="1" />
      <rect x="9" y="9" width="6" height="6" rx="0.5" strokeDasharray="2 2" />
    </svg>
  );
}

function IconRipCut() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="6" width="18" height="12" rx="1" />
      <path d="M9 6v12" strokeDasharray="2 2" />
    </svg>
  );
}

function IconPepe() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M9 10h.01M15 10h.01M8.5 15c1 1 2.2 1.5 3.5 1.5s2.5-.5 3.5-1.5" />
    </svg>
  );
}

const MOVE: ToolDef = { tool: 'move', label: 'Move', shortcut: 'M', description: 'Translate the selected board along an axis handle.', icon: <IconMove /> };
const ROTATE: ToolDef = { tool: 'rotate', label: 'Rotate', shortcut: 'R', description: 'Rotate the selected board around one axis at a time.', icon: <IconRotate /> };
const SKETCH: ToolDef = { tool: 'drawBoard', label: 'Sketch', shortcut: 'W', description: 'Draw a new board by dragging a length x width footprint.', icon: <IconSketch /> };
const INSERT: ToolDef = { tool: 'addBoard', label: 'Insert', shortcut: 'I', description: 'Add a new board by typing exact dimensions or picking a preset.', icon: <IconInsert /> };
const TEMPLATE: ToolDef = { tool: 'template', label: 'Template', shortcut: 'T', description: 'Enter a locked 2D sketch plane to draw a custom shape for extruding into a board.', icon: <IconTemplate /> };
const MATE: ToolDef = { tool: 'mate', label: 'Mate', shortcut: 'J', description: 'Click a face on one board, then a face on another, to join them flush.', icon: <IconMate /> };
const TRIM_EXTEND: ToolDef = { tool: 'trimExtend', label: 'Trim/Extend', shortcut: 'K', description: 'Click a boundary face, then another board — it snaps to trim or extend flush against that face.', icon: <IconTrimExtend /> };
const CHAMFER: ToolDef = { tool: 'chamfer', label: 'Chamfer', shortcut: 'C', description: 'Click an edge to bevel it — drag the arrow or type a size.', icon: <IconChamfer /> };
const FILLET: ToolDef = { tool: 'fillet', label: 'Fillet', shortcut: '', description: 'Round an edge instead of beveling it — coming soon.', icon: <IconFillet />, disabled: true };
const CUTOUT: ToolDef = { tool: 'cutout', label: 'Cutout', shortcut: '', description: 'Click a face, then sketch a closed profile on it (Line/Arc) — a preview outline only for now, no material is removed yet.', icon: <IconCutout /> };
const RIP_CUT: ToolDef = { tool: 'rip', label: 'Rip / Cross Cut', shortcut: '', description: 'Click a face, then pick a straight Reference Line on it to split the board into two — along the length (rip) or across it (cross cut), auto-detected from the line.', icon: <IconRipCut /> };
const DIMENSION: ToolDef = { tool: 'measure', label: 'Dimension', shortcut: 'D', description: 'Click point A, point B, then a third point to set the offset — a callout measuring the distance between two points on a board.', icon: <IconDimensionLine /> };
const REFERENCE: ToolDef = { tool: 'referenceLine', label: 'Reference', shortcut: 'X', description: 'Click a start and end point directly on a board face (snaps near an edge) to save a permanent reference line.', icon: <IconReferenceLine /> };

const RAIL_ITEMS: RailItem[] = [
  {
    kind: 'tool',
    tool: 'select',
    label: 'Select',
    shortcut: 'S',
    description: 'Click a board to select it for editing.',
    icon: <IconSelect />,
  },
  {
    kind: 'group',
    id: 'transform',
    label: 'Transform',
    description: 'Move or rotate the selected board.',
    icon: <IconTransformGroup />,
    tools: [MOVE, ROTATE],
  },
  {
    kind: 'group',
    id: 'create',
    label: 'Create',
    description: 'Draw a new board freehand, or insert one by exact size.',
    icon: <IconCreateGroup />,
    tools: [SKETCH, INSERT],
  },
  {
    kind: 'group',
    id: 'annotate',
    label: 'Annotate',
    description: 'Measure a distance or save a reference line directly on a board.',
    icon: <IconAnnotateGroup />,
    tools: [DIMENSION, REFERENCE],
  },
  {
    kind: 'tool',
    ...MATE,
  },
  {
    kind: 'group',
    id: 'modify',
    label: 'Modify',
    description: 'Trim/extend a board\'s length, bevel or round an edge, cut out a region, or split it with a rip/cross cut.',
    icon: <IconModifyGroup />,
    tools: [TRIM_EXTEND, CHAMFER, FILLET, CUTOUT, RIP_CUT],
  },
  {
    kind: 'tool',
    ...TEMPLATE,
  },
];

export default function ToolRail() {
  const activeTool = useAppStore((s) => s.ui.activeTool);
  const workspaceMode = useAppStore((s) => s.ui.workspaceMode);
  const setActiveTool = useAppStore((s) => s.setActiveTool);
  const setWorkspaceMode = useAppStore((s) => s.setWorkspaceMode);

  const [openGroupId, setOpenGroupId] = useState<string | null>(null);
  const railRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!openGroupId) return;
    function onPointerDown(e: MouseEvent) {
      if (railRef.current && !railRef.current.contains(e.target as Node)) {
        setOpenGroupId(null);
      }
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpenGroupId(null);
    }
    window.addEventListener('mousedown', onPointerDown);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [openGroupId]);

  // New Order 6.2 fix 3: the flyout defaults to opening rightward
  // (`left-full`, off the trigger's right edge) — fine while the rail sits
  // comfortably inside the viewport, but on a narrow window the flyout's own
  // width can push its right edge past the viewport edge and get clipped.
  // Measured against document.documentElement.clientWidth rather than
  // window.innerWidth — the two can disagree (scrollbar width, some
  // embedded/emulated viewports), and clientWidth is the one that actually
  // matches the rendered layout box this element is clipped against.
  // Measured after each open (useLayoutEffect runs before paint, so a flip
  // never flickers) and re-checked on resize; closing resets back to the
  // default so a later open on a wider window re-measures fresh rather than
  // inheriting a stale flip.
  const [flyoutSide, setFlyoutSide] = useState<'right' | 'left'>('right');
  const flyoutRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!openGroupId) {
      setFlyoutSide('right');
      return;
    }
    function measure() {
      const el = flyoutRef.current;
      if (!el) return;
      setFlyoutSide(el.getBoundingClientRect().right > document.documentElement.clientWidth ? 'left' : 'right');
    }
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [openGroupId]);

  function pickTool(tool: ActiveTool) {
    const active = activeTool === tool;
    // Template is a distinct workspace mode, not just a tool — 'select' is
    // legal in every mode (isToolLegalInMode's universal exception), so the
    // generic "toggle back to select" below would leave workspaceMode stuck
    // on 'template' with activeTool now 'select' (a mismatched state
    // PropertiesPanel/TemplatePanel don't expect). Clicking the
    // already-active Template button instead calls setWorkspaceMode
    // directly, the same obvious "click again to exit" affordance every
    // other toggle-able rail button already reads as.
    if (tool === 'template' && active) {
      setWorkspaceMode('model');
      setOpenGroupId(null);
      return;
    }
    setActiveTool(active && tool !== 'select' ? 'select' : tool);
    setOpenGroupId(null);
  }

  return (
    <div
      ref={railRef}
      className={`absolute top-14 left-3 bottom-3 w-20 flex flex-col items-stretch bg-charcoal-900 border rounded-xl shadow-xl overflow-visible transition-colors ${
        workspaceMode === 'template' ? 'border-orange-600/60' : 'border-charcoal-700'
      }`}
    >
      {/* Dove Design wordmark + mark. The mode-indicator concept is demoted
          to a small subtitle badge beneath the wordmark, reading
          ui.workspaceMode live. Part 5 #12: Template mode reads as its own
          distinct space — the whole rail's border picks up a thin orange
          (the app's one active/drafting accent) tint while it's active,
          built from existing tokens rather than a new color. */}
      <div
        className={`px-2 py-3 border-b flex flex-col items-center gap-1.5 shrink-0 transition-colors ${
          workspaceMode === 'template' ? 'border-orange-700/40' : 'border-charcoal-700'
        }`}
      >
        <LogoMark className="w-7 h-7 shrink-0" />
        <div className="leading-tight text-center">
          <div className="text-[11px] font-bold tracking-widest text-white">DOVE</div>
          <div className="text-[11px] font-semibold tracking-widest text-spruce-400 -mt-0.5">DESIGN</div>
        </div>
        <span
          className={`text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-full border capitalize ${
            workspaceMode === 'template' ? 'border-orange-600/60 text-orange-400' : 'border-charcoal-600 text-charcoal-300'
          }`}
        >
          {workspaceMode}
        </span>
      </div>

      {/* No overflow-y-auto here: with only 3 top-level rail items (Select,
          Transform, Create) everything fits the rail's height without
          scrolling, and CSS promotes overflow-x to `auto` whenever
          overflow-y isn't `visible` (spec behavior) — that was clipping
          each group's fly-out flyout into a horizontal scrollbar instead of
          letting it render over the canvas. If a future New Order adds
          enough top-level items to overflow the rail's height, switch this
          to a portal-based flyout (positioned via the trigger button's
          getBoundingClientRect(), rendered outside this container) rather
          than re-adding overflow-y-auto here. */}
      <div className="flex-1 flex flex-col gap-1 p-2">
        {RAIL_ITEMS.map((item) => {
          if (item.kind === 'tool') {
            const active = activeTool === item.tool;
            // Make the "click again to exit" affordance discoverable, not
            // just functional — the Template button's own tooltip spells it
            // out once it's the active tool.
            const description =
              item.tool === 'template' && active
                ? `${item.description} Click again to exit to Model space.`
                : item.description;
            return (
              <Tooltip key={item.tool} side="right" className="w-full" info={{ label: item.label, description, shortcut: item.shortcut }}>
                <RailButton active={active} onClick={() => pickTool(item.tool)} icon={item.icon} label={item.label} />
              </Tooltip>
            );
          }

          const groupActive = item.tools.some((t) => t.tool === activeTool);
          const isOpen = openGroupId === item.id;
          return (
            <div key={item.id} className="relative">
              {/* New Order 6.1 fix 5: the flyout renders to the right of this
                  whole wrapper (`left-full`) once open. A "right"-side
                  tooltip on the trigger button would render at that same
                  spot and sit directly on top of the flyout's own buttons.
                  Once the flyout is open, its buttons already carry their
                  own tooltips, so the trigger's hover tooltip (if shown at
                  all) renders above the rail instead of over the flyout. */}
              <Tooltip side={isOpen ? 'top' : 'right'} className="w-full" info={{ label: item.label, description: item.description }}>
                <RailButton
                  active={groupActive}
                  highlighted={isOpen}
                  onClick={() => setOpenGroupId(isOpen ? null : item.id)}
                  icon={item.icon}
                  label={item.label}
                  chevron
                />
              </Tooltip>

              {isOpen && (
                <div
                  ref={flyoutRef}
                  className={`absolute top-0 flex flex-row gap-1 bg-charcoal-900 border border-charcoal-700 rounded-lg p-2 z-50 shadow-xl animate-[flyoutIn_120ms_ease-out] ${
                    flyoutSide === 'left' ? 'right-full mr-2' : 'left-full ml-2'
                  }`}
                >
                  {item.tools.map((t) => (
                    <Tooltip key={t.tool} side="top" info={{ label: t.label, description: t.description, shortcut: t.shortcut || undefined }}>
                      <RailButton
                        active={activeTool === t.tool}
                        onClick={() => pickTool(t.tool)}
                        icon={t.icon}
                        label={t.label}
                        wide
                        disabled={t.disabled}
                      />
                    </Tooltip>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="p-2 border-t border-charcoal-700 shrink-0">
        <Tooltip side="right" info={{ label: 'Pepe', description: 'Your woodworking knowledge assistant — coming soon.' }}>
          <button
            type="button"
            disabled
            className="w-full flex flex-col items-center gap-1 rounded px-1 py-2 text-base border bg-charcoal-800/50 border-charcoal-800 text-charcoal-600 cursor-not-allowed"
          >
            <span className="w-5 h-5"><IconPepe /></span>
            <span className="text-xs leading-none">Pepe</span>
          </button>
        </Tooltip>
      </div>
    </div>
  );
}

function RailButton({
  active,
  highlighted,
  onClick,
  icon,
  label,
  wide,
  chevron,
  disabled,
}: {
  active: boolean;
  highlighted?: boolean;
  onClick: () => void;
  icon: JSX.Element;
  label: string;
  wide?: boolean;
  chevron?: boolean;
  disabled?: boolean;
}) {
  // New Order 5.3: `highlighted` (a group flyout currently open) now reads
  // as the spruce secondary-accent, distinct from `active` (orange, the
  // app's one selected/active signal) — previously both used the same
  // neutral charcoal tint and were only distinguishable by context.
  const stateClasses = disabled
    ? 'bg-charcoal-800/50 border-charcoal-800 text-charcoal-600 cursor-not-allowed'
    : active
    ? 'bg-orange-600 border-orange-500 text-white'
    : highlighted
    ? 'bg-spruce-800/70 border-spruce-600 text-white'
    : 'bg-charcoal-800 border-charcoal-700 text-charcoal-300 hover:bg-charcoal-700 hover:border-spruce-700/60 hover:-translate-y-px';

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={disabled ? undefined : onClick}
      className={`group relative flex flex-col items-center gap-1 rounded px-1 py-2 text-base border transition-all duration-150 ease-out active:scale-95 active:duration-75 ${wide ? 'w-16' : 'w-full'} ${stateClasses}`}
    >
      {/* New Order 6.1 fix 4: the icon is its own centered flex item, exactly
          matching Select's markup (no icon+chevron row) — previously the
          chevron shared this row and its extra width shifted the row's
          justify-center midpoint away from the button's true center, so
          Transform/Create's icons sat visibly left of Select's. The chevron
          is now an absolutely-positioned corner mark that doesn't affect the
          icon's layout at all, which also fixes it "crowding" the icon. */}
      <span className="w-5 h-5">{icon}</span>
      <span className="text-xs leading-none">{label}</span>
      {chevron && (
        <span
          className={`absolute top-1.5 right-1.5 w-3 h-3 transition-colors ${
            highlighted ? 'text-white' : 'text-charcoal-500 group-hover:text-spruce-400'
          }`}
        >
          <ChevronsIcon direction={highlighted ? 'down' : 'right'} />
        </span>
      )}
    </button>
  );
}
