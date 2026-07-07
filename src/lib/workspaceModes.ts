import type { ActiveTool, UIState, WorkspaceMode, WoodJointType, FaceId, RightPanelTab } from '../types';
import { FACE_LABELS } from './mating';

/** Display labels for the top-center Mode Switcher. */
export const MODE_LABELS: Record<WorkspaceMode, { label: string; blurb: string }> = {
  model:    { label: 'Model',    blurb: 'Shape and lay out boards' },
  assembly: { label: 'Assembly', blurb: 'Join boards together' },
  detail:   { label: 'Detail',   blurb: 'Joinery & hardware' },
};

export const MODE_ORDER: WorkspaceMode[] = ['model', 'assembly', 'detail'];

/**
 * Single source of truth for which tools are legal in each mode. Consumed by
 * the Left Toolbar (what renders), setActiveTool (mode follows tool), and
 * setWorkspaceMode (tool resets to select if illegal in the new mode).
 * 'select' and 'measure' are legal everywhere — switching modes never yanks
 * them out of the user's hand.
 */
export const MODE_TOOLS: Record<WorkspaceMode, ActiveTool[]> = {
  model: [
    'select', 'move', 'drawBoard', 'addBoard', 'trimExtend',
    'cut', 'rip', 'miter',
    'shapeCylinder', 'shapeSphere', 'shapeCone', 'shapeTriPrism', 'shapeHexPrism', 'shapePolygon',
    'measure', 'centerline',
  ],
  assembly: ['select', 'mate', 'measure'],
  detail: ['select', 'connection', 'joinery', 'joint', 'placeHardware', 'edge', 'measure'],
};

/** Right-sidebar tabs available per mode (first entry = default on switch). */
export const MODE_PANEL_TABS: Record<WorkspaceMode, RightPanelTab[]> = {
  model:    ['inspector', 'cutlist', 'optimizer', 'estimating', 'tutorial'],
  assembly: ['inspector', 'engineering', 'tutorial'],
  detail:   ['connections', 'inspector', 'hardware', 'estimating', 'tutorial'],
};

/** Keep the current tab if it exists in the new mode; otherwise the mode default. */
export function fixPanelTab(tab: RightPanelTab, mode: WorkspaceMode): RightPanelTab {
  return MODE_PANEL_TABS[mode].includes(tab) ? tab : MODE_PANEL_TABS[mode][0];
}

/** Which mode owns a tool (first mode whose list contains it). */
export function modeForTool(tool: ActiveTool): WorkspaceMode {
  for (const mode of MODE_ORDER) {
    if (MODE_TOOLS[mode].includes(tool)) return mode;
  }
  return 'model';
}

export function isToolLegalInMode(tool: ActiveTool, mode: WorkspaceMode): boolean {
  // select/measure are universal by design.
  if (tool === 'select' || tool === 'measure') return true;
  return MODE_TOOLS[mode].includes(tool);
}

export const JOINT_TYPE_LABELS: Record<WoodJointType, string> = {
  dovetail: 'Dovetail',
  mortiseTenon: 'Mortise & Tenon',
  dado: 'Dado',
  lap: 'Lap Joint',
};

const TOOL_LABELS: Partial<Record<ActiveTool, string>> = {
  select: 'Select',
  move: 'Move',
  drawBoard: 'Draw Board',
  addBoard: 'Add Board',
  trimExtend: 'Trim / Extend',
  cut: 'Cross Cut',
  rip: 'Rip Cut',
  miter: 'Miter',
  measure: 'Measure',
  centerline: 'Centerline',
  mate: 'Mate (Join Boards)',
  connection: 'Connections',
  joinery: 'Joinery Cuts',
  joint: 'Joint Markers',
  placeHardware: 'Place Hardware',
  edge: 'Edge Treatment',
};

function faceLabel(face: FaceId): string {
  return FACE_LABELS[face] ?? face;
}

/**
 * Pure function of UI state → the single-line hint bar text. Reads the
 * current mode, active tool, and any half-finished pick so the user always
 * knows what state they're in and what to do next.
 */
export function getHintText(
  ui: Pick<UIState, 'workspaceMode' | 'activeTool' | 'pendingInteraction' | 'mateFaceA' | 'measureStartPoint' | 'selectedMemberId'>,
  memberLabelById: (id: string) => string
): string {
  const modeName = `${MODE_LABELS[ui.workspaceMode].label} Mode`;
  const toolName = TOOL_LABELS[ui.activeTool] ?? 'Select';
  const prefix = `${modeName} · ${toolName}`;

  const p = ui.pendingInteraction;
  if (p) {
    if (p.kind === 'trimExtend') {
      return `${prefix} · Target: ${memberLabelById(p.targetMemberId)} — ${faceLabel(p.targetFaceId)}. Now click the board to trim or extend to that face.`;
    }
    if (p.kind === 'joinery') {
      if (p.step === 'pickFaceA') {
        return `${prefix} · ${JOINT_TYPE_LABELS[p.jointType]}: click the face that will RECEIVE the joint (the socket side).`;
      }
      return `${prefix} · ${JOINT_TYPE_LABELS[p.jointType]}: receiving face set on ${memberLabelById(p.memberAId)}. Now click a face on the SECOND board (the tail/tenon side).`;
    }
    if (p.kind === 'fastener') {
      return `${prefix} · ${p.fastenerType}: click a board at a joint to place this fastener.`;
    }
  }

  switch (ui.activeTool) {
    case 'mate':
      return ui.mateFaceA
        ? `${prefix} · First face picked (green dot). Now click a snap dot on the second board — right/middle mouse orbits freely without losing your pick.`
        : `${prefix} · Click a snap dot on the first board (it stays still, the second board moves to it).`;
    case 'measure':
      return ui.measureStartPoint
        ? `${prefix} · Move to your end point and click to finish the measurement.`
        : `${prefix} · Click any point on a board to start a measurement.`;
    case 'centerline':
      return `${prefix} · Click any face of a board to add a centerline marker.`;
    case 'trimExtend':
      return `${prefix} · Click 1: the face to trim/extend TO. Click 2: the board to change.`;
    case 'drawBoard':
      return `${prefix} · Click and drag on the floor to draw a new board.`;
    case 'connection':
      return `${prefix} · Pick a joint or fastener type from the Connections panel on the right.`;
    case 'select':
      return ui.selectedMemberId
        ? `${modeName} · Select · Press M for the Move tool, Esc to deselect.`
        : `${modeName} · Select · Click a board to select it. Shift-click to select more.`;
    case 'move':
      return ui.selectedMemberId
        ? `${modeName} · Move · Drag an axis arrow, or arrow-keys to nudge. Esc returns to Select.`
        : `${modeName} · Move · Click a board (Shift-click for more) to move it.`;
    default:
      return prefix;
  }
}
