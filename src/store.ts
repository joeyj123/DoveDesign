import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Project, WoodMember, HardwareItem, FinishItem,
  UIState, ActiveTool, StructuralAnalysis, CutOperation,
  EstimatingSettings, MaterialPriceEntry, TransformMode,
  MemberMate, AttachmentPoint, Fastener, JoinMethod,
  DesignSuggestion, EdgeTreatment, PlacedHardwareItem, AssemblyStep,
  HardwareLibraryId, DisplayMode, ViewportMode, DimensionLine,
  JointMarker, JointMarkerType, MateGroup,
  WorkspaceMode, PendingInteraction, WoodJoint, FaceId, NominalSize,
  TemplateDrawTool, TemplateEdge, TemplateShape,
  ReferenceLine, ReferenceLinePoint,
} from './types';
import { NOMINAL_DIMENSIONS } from './types';
import { trimToBoundary, extendToBoundary, snapLengthToFacePlane } from './lib/trimExtend';
import { inferMaterialKind, getMaterialByName } from './lib/materials';
import { computeMateTransform, computePointMateTransform, getFaceNormal } from './lib/mating';
import { isToolLegalInMode, modeForTool, fixPanelTab } from './lib/workspaceModes';
import { jointSeatDepth } from './core/JointFeatures';
import { createDefaultFastenersForMate } from './lib/fastenerDefaults';
import { findCloseFacePairs, buildMateFromPair, lapJointPatch } from './lib/quickJoin';
import { createCutOperation } from './lib/joinery';
import { serializeWcad, parseWcad } from './lib/wcad';
import { splitByCrossCut, splitByRipCut } from './lib/memberSplit';
import { CADGeometryEngine, migrateWoodMemberToSolidBoard, type MateConstraint as EngineMateConstraint } from './core/Engine';
import { buildLoopPolygon, computePerpOffset, clampOffsetMagnitude } from './lib/templateSketchMath';

const DEFAULT_ESTIMATING: EstimatingSettings = {
  taxRatePercent: 8.25,
  wasteBufferEnabled: false,
  wasteBufferPercent: 10,
  materialPrices: {},
};

const DEFAULT_PROJECT: Project = {
  id: crypto.randomUUID(),
  name: 'Untitled Project',
  description: '',
  createdAt: new Date().toISOString(),
  members: [],
  hardware: [],
  finishes: [],
  structural: {},
  estimating: DEFAULT_ESTIMATING,
  mates: [],
  attachmentPoints: [],
  fasteners: [],
  edgeTreatments: [],
  placedHardware: [],
  assemblySteps: [],
  dimensionLines: [],
  referenceLines: [],
  mateGroups: [],
  mateConstraints: [],
  woodJoints: [],
};

const DEFAULT_UI: UIState = {
  activeTool: 'select',
  selectedMemberId: null,
  rightPanelTab: 'inspector',
  transformMode: 'translate',
  transformGizmoActive: false,
  trimBoundaryId: null,
  isolatedMemberId: null,
  orbitControlsEnabled: true,
  cameraResetNonce: 0,
  cameraPreset: null,
  angleSnapEnabled: true,
  angleSnapIncrement: 15,
  annotationSnapEnabled: true,
  activeAnnotationEndpoint: null,
  chamferEdge: null,
  chamferHoverEdge: null,
  contextMenu: { open: false, x: 0, y: 0, memberId: null },
  drawBoardCancelNonce: 0,
  gridVisible: true,
  orthographic: false,
  mateFaceA: null,
  mateFaceB: null,
  matePickTarget: 'A',
  memberScreenBounds: null,
  quickDimensionsOpen: false,
  radialWheelOpen: false,
  radialWheelMode: 'full',
  radialWheelAnchor: null,
  mateHoverFace: null,
  trimHoverFace: null,
  mateGridOffset: null,
  fastenerPlacementMode: false,
  fastenerPlacementMateId: null,
  selectedFastenerId: null,
  selectedMateId: null,
  pepePanelOpen: false,
  pepeTab: 'suggestions',
  pepeExpression: 'neutral',
  missedQueries: [],
  designSuggestions: [],
  suggestionHighlightIds: [],
  dimensionEditPending: false,
  attachmentPointPickA: null,
  edgeToolMemberId: null,
  edgeHoverIndex: null,
  edgeSelectedIndex: null,
  viewportMode: 'design',
  displayMode: 'shaded',
  hardwareLibraryPick: null,
  polygonDrawPoints: [],
  assemblyGuideOpen: false,
  assemblyDesignSnapshot: null,
  multiSelection: [],
  combinedSelectionBounds: null,
  boxSelectRect: null,
  boxSelectPending: null,
  radialWheelCollapsed: false,
  lastPlacedMemberId: null,
  drawChainLinks: [],
  drawSnapIndicator: null,
  quickJoinMiterAxis: null,
  measureStartPoint: null,
  selectedDimensionLineId: null,
  selectedReferenceLineId: null,
  dimensionDraft: null,
  referenceDraft: null,
  selectedCenterlineId: null,
  dimensionLinesVisible: true,
  crossCutPreviewPosition: null,
  ripCutPreviewPosition: null,
  snapToGrid: false,
  scrapBoxOpen: false,
  selectedJointType: null,
  selectedJointMarkerId: null,
  rotationAxis: 'y',
  templatePickerOpen: false,
  bomPanelOpen: false,
  selectedDrawMaterial: 'Pine',
  finishPanelOpen: false,
  saveNameModalOpen: false,
  workspaceMode: 'model',
  pendingInteraction: null,
  moveDragActive: false,
  templatePlane: { kind: 'ground', origin: [0, 0, 0], normal: [0, 1, 0] },
  templateMaterial: 'Pine',
  templateDrawTool: null,
  templateEdges: [],
  templateShapes: [],
  selectedTemplateShapeId: null,
  templateExtrudeThickness: 0.75,
  templateArcStage: 'start',
  templateArcFlipped: false,
  drawDefaults: {
    species: 'Pine',
    thickness: 1.5,
    width: 3.5,
    nominalSize: '2x4',
    category: 'Softwood',
    color: '#d4a96a',
  },
};

const MAX_HISTORY = 100;

/**
 * A history entry snapshots BOTH the board project and the in-progress
 * Template sketch together, so undo/redo (which already walk past/future)
 * restore whichever one actually changed without needing a second,
 * independently-advancing history stack — the existing Move/Rotate/Insert
 * mechanism, extended, not duplicated.
 */
interface HistoryEntry {
  project: Project;
  templateEdges: TemplateEdge[];
  /** Closed-loop shapes snapshot alongside templateEdges — a shape close/species-swap/extrude must be undoable too. */
  templateShapes: TemplateShape[];
}

function migrateMember(m: WoodMember): WoodMember {
  const mat = getMaterialByName(m.species);
  return {
    ...m,
    cuts: m.cuts ?? [],
    orientation: m.orientation ?? 'flat',
    loadLbs: m.loadLbs ?? 0,
    materialKind: m.materialKind ?? inferMaterialKind(m.species, m.category),
    color: m.color ?? mat?.color ?? '#d4a96a',
    shapeType: m.shapeType ?? 'box',
    inScrapBox: m.inScrapBox ?? false,
    jointMarkers: m.jointMarkers ?? [],
  };
}

/**
 * Phase 20: the ONE migration path for every project restore — File → Open,
 * crash recovery, and templates all go through this. Every field written by
 * serializeWcad gets an explicit default here so a .wcad from any prior phase
 * (or a hand-edited one missing fields) deserializes into a complete Project
 * instead of crashing downstream code. Project.structural is never nullable.
 */
function migrateProject(p: Project): Project {
  return {
    ...p,
    id: p.id ?? crypto.randomUUID(),
    name: p.name ?? 'Untitled Project',
    description: p.description ?? '',
    createdAt: p.createdAt ?? new Date().toISOString(),
    hardware: p.hardware ?? [],
    finishes: p.finishes ?? [],
    structural: p.structural ?? {},
    estimating: {
      ...DEFAULT_ESTIMATING,
      ...(p.estimating ?? {}),
      materialPrices: p.estimating?.materialPrices ?? {},
    },
    mates: (p.mates ?? []).map(migrateMate),
    attachmentPoints: p.attachmentPoints ?? [],
    fasteners: p.fasteners ?? [],
    edgeTreatments: p.edgeTreatments ?? [],
    placedHardware: p.placedHardware ?? [],
    assemblySteps: p.assemblySteps ?? [],
    dimensionLines: p.dimensionLines ?? [],
    referenceLines: p.referenceLines ?? [],
    mateGroups: p.mateGroups ?? [],
    mateConstraints: p.mateConstraints ?? [],
    woodJoints: p.woodJoints ?? [],
    members: (p.members ?? []).map(migrateMember),
  };
}

function migrateMate(m: MemberMate): MemberMate {
  return { ...m, joinMethod: m.joinMethod ?? 'Unset' };
}

interface AppStore {
  project: Project;
  ui: UIState;
  past: HistoryEntry[];
  future: HistoryEntry[];

  // Phase 18: crash-recovery banner state. The autosave in localStorage is
  // NEVER auto-loaded into `project` on startup (see persist `merge` below) —
  // this is only the metadata needed to offer a dismissible recovery prompt.
  recoveryAvailable: boolean;
  recoveryTimestamp: string | null;
  recoverableProjectSnapshot: Project | null;
  dismissRecovery: () => void;
  recoverAutosave: () => void;

  /** Phase 18: last 3 saved .wcad filenames + dates — metadata only, not project data. */
  recentFiles: { name: string; savedAt: string }[];
  addRecentFile: (name: string) => void;

  // History
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  // Member actions
  addMember:     (member: WoodMember) => void;
  updateMember:  (id: string, patch: Partial<WoodMember>, skipHistory?: boolean) => void;
  /** New Order 2 (Move tool): atomically repositions multiple members as ONE
   * undo step — used for group drags, so undo restores the whole group at
   * once rather than one board at a time. */
  moveMembers:   (updates: { id: string; position: [number, number, number] }[], skipHistory?: boolean) => void;
  removeMember:  (id: string) => void;
  /** Batched delete (New Order — multi-select Delete key): same per-member
   * cleanup as removeMember, but folded into ONE commitProject call so a
   * multi-board delete is one undo step, matching moveMembers' precedent
   * for group operations. */
  removeMembers: (ids: string[]) => void;
  duplicateMember: (id: string) => void;
  mirrorMember:  (id: string, axis: 'x' | 'y' | 'z') => void;
  trimMember:    (targetId: string, boundaryId: string) => void;
  extendMember:  (targetId: string, boundaryId: string) => void;

  // Cut / joinery actions
  addCut:        (memberId: string, cut: CutOperation) => void;
  removeCut:     (memberId: string, cutId: string) => void;
  updateCut:     (memberId: string, cutId: string, patch: Partial<CutOperation>) => void;

  // Hardware / Finish actions
  addHardware:   (item: HardwareItem) => void;
  removeHardware:(id: string) => void;
  addFinish:     (item: FinishItem) => void;
  removeFinish:  (id: string) => void;

  // Estimating
  updateEstimating: (patch: Partial<EstimatingSettings>) => void;
  setMaterialPrice: (groupKey: string, entry: MaterialPriceEntry) => void;

  // Physics hook
  updateStructural: (patch: Partial<StructuralAnalysis>) => void;

  // UI actions
  selectMember: (
    id: string | null,
    opts?: { openWheel?: boolean; wheelAnchor?: { x: number; y: number } }
  ) => void;
  setActiveTool:    (tool: ActiveTool) => void;
  setTransformMode: (mode: TransformMode) => void;
  setTransformGizmoActive: (active: boolean) => void;
  setTrimBoundary:  (id: string | null) => void;
  setOrbitControlsEnabled: (enabled: boolean) => void;
  /** New Order 2 (Move tool): true only while a left-drag board move is active. */
  setMoveDragActive: (active: boolean) => void;
  resetCamera: () => void;
  setCameraPreset: (preset: string | null) => void;
  setAngleSnapEnabled: (enabled: boolean) => void;
  setAnnotationSnapEnabled: (enabled: boolean) => void;
  nudgeDimensionLine: (id: string, du: number, dv: number, end?: 'start' | 'end') => void;
  nudgeReferenceLine: (id: string, du: number, dv: number, end?: 'start' | 'end') => void;
  setActiveAnnotationEndpoint: (target: UIState['activeAnnotationEndpoint']) => void;
  toggleDimensionEndpointLock: (id: string, end: 'start' | 'end') => void;
  toggleReferenceEndpointLock: (id: string, end: 'start' | 'end') => void;
  setChamferEdge: (target: UIState['chamferEdge']) => void;
  setChamferHoverEdge: (target: UIState['chamferHoverEdge']) => void;
  resetChamferPick: () => void;
  removeChamfer: (memberId: string, edgeId: string) => void;
  setAngleSnapIncrement: (deg: UIState['angleSnapIncrement']) => void;
  openContextMenu: (x: number, y: number, memberId: string | null) => void;
  closeContextMenu: () => void;
  setIsolatedMember: (id: string | null) => void;
  resetToolState: () => void;
  setGridVisible: (visible: boolean) => void;
  setOrthographic: (ortho: boolean) => void;
  setMateFaceA: (sel: UIState['mateFaceA']) => void;
  setMateFaceB: (sel: UIState['mateFaceB']) => void;
  setMatePickTarget: (target: UIState['matePickTarget']) => void;
  /** Click-to-pick a face for the Mate tool (New Order — Mate/Align UI):
   * fills whichever of mateFaceA/mateFaceB is still empty (self-healing
   * against a stale matePickTarget), ignores a click on the SAME board
   * already picked as Face A, and re-picking Face B once both are set just
   * replaces B. */
  pickMateFace: (memberId: string, face: FaceId) => void;
  resetMatePicks: () => void;
  applyMate: () => string | null;
  setMemberScreenBounds: (bounds: UIState['memberScreenBounds']) => void;
  setQuickDimensionsOpen: (open: boolean) => void;
  setRadialWheelOpen: (open: boolean, mode?: UIState['radialWheelMode']) => void;
  setMateHoverFace: (face: UIState['mateHoverFace']) => void;
  setTrimHoverFace: (face: UIState['trimHoverFace']) => void;
  setMateGridOffset: (offset: UIState['mateGridOffset']) => void;
  setMateJoinMethod: (mateId: string, method: JoinMethod) => void;
  addAttachmentPoint: (point: AttachmentPoint) => void;
  updateAttachmentPoint: (id: string, patch: Partial<AttachmentPoint>, skipHistory?: boolean) => void;
  removeAttachmentPoint: (id: string) => void;
  connectAttachmentPoints: (idA: string, idB: string) => void;
  setAttachmentPointPickA: (id: string | null) => void;
  addFastener: (fastener: Fastener) => void;
  removeFastener: (id: string) => void;
  setFastenerPlacementMode: (active: boolean, mateId?: string | null) => void;
  setSelectedFastenerId: (id: string | null) => void;
  setSelectedMateId: (id: string | null) => void;
  setPepePanelOpen: (open: boolean) => void;
  setPepeTab: (tab: UIState['pepeTab']) => void;
  setPepeExpression: (expr: UIState['pepeExpression']) => void;
  addPepeMissedQuery: (query: string) => void;
  setDesignSuggestions: (suggestions: DesignSuggestion[]) => void;
  setSuggestionHighlightIds: (ids: string[]) => void;
  setDimensionEditPending: (pending: boolean) => void;
  commitDimensionEdit: () => void;
  commitCurrentProject: () => void;
  addEdgeTreatment: (t: EdgeTreatment) => void;
  removeEdgeTreatment: (id: string) => void;
  setEdgeToolMemberId: (id: string | null) => void;
  setEdgeHoverIndex: (idx: number | null) => void;
  setEdgeSelectedIndex: (idx: number | null) => void;
  setViewportMode: (mode: ViewportMode) => void;
  setDisplayMode: (mode: DisplayMode) => void;
  setHardwareLibraryPick: (id: HardwareLibraryId | null) => void;
  addPlacedHardware: (item: PlacedHardwareItem) => void;
  removePlacedHardware: (id: string) => void;
  updatePlacedHardware: (id: string, patch: Partial<PlacedHardwareItem>) => void;
  addAssemblyStep: (step: AssemblyStep) => void;
  resetAssemblyLayout: () => void;
  setAssemblyGuideOpen: (open: boolean) => void;
  setPolygonDrawPoints: (pts: [number, number][]) => void;
  setMultiSelection: (ids: string[]) => void;
  splitMemberByCrossCut: (memberId: string, position: number) => void;
  splitMemberByRipCut: (memberId: string, targetWidth: number) => void;
  toggleMultiSelectionMember: (id: string) => void;
  setCombinedSelectionBounds: (bounds: UIState['combinedSelectionBounds']) => void;
  setBoxSelectRect: (rect: UIState['boxSelectRect']) => void;
  setBoxSelectPending: (pending: UIState['boxSelectPending']) => void;
  setRadialWheelCollapsed: (collapsed: boolean) => void;
  setLastPlacedMemberId: (id: string | null) => void;
  addDrawChainLink: (fromApId: string, toApId: string) => void;
  setDrawSnapIndicator: (pt: UIState['drawSnapIndicator']) => void;
  cancelDrawBoard: () => void;
  setQuickJoinMiterAxis: (axis: UIState['quickJoinMiterAxis']) => void;
  autoDetectJoints: () => string[];
  applyButtJoints: () => void;
  applyLapJoints: () => void;
  applyMiterJoints: (axis: 'x' | 'y' | 'z') => void;
  removeMate: (mateId: string) => void;
  newProject: () => void;
  setRightPanelTab: (tab: UIState['rightPanelTab']) => void;
  updateProjectMeta:(patch: { name?: string; description?: string }) => void;

  // Dimension lines (New Order 8 — 3-click Revit-style callout)
  addDimensionLine: (line: DimensionLine) => void;
  removeDimensionLine: (id: string) => void;
  selectDimensionLine: (id: string | null) => void;
  setSelectedCenterlineId: (id: string | null) => void;
  setDimensionLinesVisible: (visible: boolean) => void;
  setMeasureStartPoint: (pt: UIState['measureStartPoint']) => void;
  /** Advances the in-progress Dimension Line click sequence (A -> B -> offset), or edits an existing one when a draft's editingId is set. */
  handleDimensionLineClick: (memberId: string, faceId: string, u: number, v: number) => void;
  cancelDimensionDraft: () => void;
  startEditDimensionLine: (id: string) => void;
  setDimensionLineVisibility: (id: string, visible: boolean | undefined) => void;

  // Reference/measuring lines (New Order 8)
  handleReferenceLineClick: (memberId: string, faceId: string, u: number, v: number, snapped: boolean) => void;
  cancelReferenceDraft: () => void;
  startEditReferenceLine: (id: string) => void;
  setReferenceLineVisibility: (id: string, visible: boolean | undefined) => void;
  selectReferenceLine: (id: string | null) => void;
  removeReferenceLine: (id: string) => void;

  // Cut previews
  setCrossCutPreviewPosition: (pos: number | null) => void;
  setRipCutPreviewPosition: (pos: number | null) => void;

  // Snap to grid
  setSnapToGrid: (enabled: boolean) => void;

  // Joint markers
  addJointMarker: (memberId: string, marker: Omit<JointMarker, 'id'>) => void;
  removeJointMarker: (memberId: string, markerId: string) => void;
  clearJointMarkers: (memberId: string) => void;
  setSelectedJointType: (t: JointMarkerType | null) => void;
  setSelectedJointMarkerId: (id: string | null) => void;

  // Scrap box
  sendToScrapBox: (id: string) => void;
  retrieveFromScrapBox: (id: string) => void;
  clearScrapBox: () => void;
  setScrapBoxOpen: (open: boolean) => void;

  // Clear all
  clearAllMembers: () => void;

  // Dimension line update
  updateDimensionLine: (id: string, patch: Partial<import('./types').DimensionLine>) => void;

  // Rotation axis
  setRotationAxis: (axis: 'x' | 'y' | 'z') => void;

  // Template picker
  setTemplatePickerOpen: (open: boolean) => void;

  // BOM panel
  setBomPanelOpen: (open: boolean) => void;

  // Clear all selections (FIX 5)
  clearSelection: () => void;

  // Centerline markers
  addCenterlineMarker: (memberId: string, marker: import('./types').CenterlineMarker) => void;
  removeCenterlineMarker: (memberId: string, markerId: string) => void;
  clearCenterlineMarkers: (memberId: string) => void;

  // Draw material picker
  setDrawMaterial: (species: string) => void;
  setDrawNominalSize: (size: NominalSize) => void;

  // Template mode
  setTemplateMaterial: (species: string) => void;
  // Template draw tools
  setTemplateDrawTool: (tool: TemplateDrawTool | null) => void;
  addTemplateEdge: (edge: TemplateEdge) => void;
  // Template closed-loop shapes
  addTemplateShape: (shape: TemplateShape) => void;
  updateTemplateShapeSpecies: (id: string, species: string) => void;
  setSelectedTemplateShapeId: (id: string | null) => void;
  setTemplateExtrudeThickness: (value: number) => void;
  /** New Order 7.1 Feature 10: staged hint state for the 3-point Arc flow (TemplatePanel reads this to show which click is next). */
  setTemplateArcStage: (stage: UIState['templateArcStage']) => void;
  setTemplateArcFlipped: (flipped: boolean) => void;
  /** New Order 7 Part 4: extrudes a closed Template shape into a real Model-space board (customPolygon WoodMember), removes the shape/its edges from Template state, and exits to Model space with the new board selected. Returns the new member id, or null if the shape/polygon isn't valid. */
  extrudeTemplateShape: (shapeId: string, thicknessIn: number) => string | null;

  // Finishing panel
  setFinishPanelOpen: (open: boolean) => void;
  updateMemberFinish: (memberId: string, finish: import('./types').BoardFinish | undefined) => void;

  // Mate groups
  moveMateGroup: (anchorMemberId: string, delta: [number, number, number], skipHistory?: boolean) => void;
  unmateAll: (groupId: string) => void;
  unmateBoard: (memberId: string) => void;
  getMateGroupForMember: (memberId: string) => MateGroup | undefined;

  /**
   * Phase 16 — CAD_MANIFESTO.md Law 1 compliant mate movement. Given the
   * board currently being dragged (with its LIVE position/rotation, which
   * may not be committed to the store yet), solves every MateConstraint
   * reachable from it via CADGeometryEngine.solveConstraints and writes
   * the solved placements onto the other boards. This replaces the old
   * "copy a remembered delta onto the group" approach — placements are
   * derived fresh from the constraint graph every call, not nudged.
   */
  solveMateConstraints: (
    movedMemberId: string,
    livePosition: [number, number, number],
    liveRotation: [number, number, number],
    skipHistory?: boolean
  ) => void;

  // Load project from template / object
  loadProjectData: (members: import('./types').WoodMember[], name: string) => void;

  // Persistence
  saveProjectToFile:   () => void;
  loadProjectFromFile: (file: File) => Promise<void>;
  setSaveNameModalOpen: (open: boolean) => void;
  saveProjectAs: (name: string) => void;

  /**
   * Phase 20: the ONE restore path — used by both File → Open and the crash
   * recovery banner so a downloaded .wcad loads identically to a recovery.
   */
  restoreProject: (raw: Project) => void;

  // Phase 20 — 3-Mode workspace system
  setWorkspaceMode: (mode: WorkspaceMode) => void;
  setPendingInteraction: (p: PendingInteraction | null) => void;
  /** Esc rule: cancel the current action/tool WITHOUT deselecting the board. */
  cancelActiveAction: () => void;
  /** 2-click Trim/Extend: applies the pending target face to the clicked board. */
  applyTrimExtend: (adjustMemberId: string) => void;
  /** Real joinery: completes a pending joint pick on the clicked board face. */
  applyWoodJoint: (memberBId: string, faceBId: FaceId) => void;
  removeWoodJoint: (jointId: string) => void;
  /** Connections palette hardware flow: apply pending fastener type via the clicked board's mate. */
  applyFastenerToMember: (memberId: string) => void;
}

/**
 * Template is a distinct 2D sketch space, not another filtered view of the
 * same board set the way model/assembly/detail are (those intentionally
 * keep selection alive across a mode switch — see setWorkspaceMode below).
 * Selection must not leak between Model space and Template space in either
 * direction. Scoped narrowly to transitions that actually touch 'template'
 * so the existing model/assembly/detail behavior is untouched
 * (CAD_MANIFESTO.md Law 4 Breaking-Change Audit).
 */
function templateTransitionPatch(fromMode: WorkspaceMode, toMode: WorkspaceMode): Partial<UIState> {
  if (fromMode === toMode) return {};
  if (fromMode !== 'template' && toMode !== 'template') return {};
  // selectedTemplateShapeId is Template-space selection, exactly like
  // selectedMemberId is Model-space selection — cleared on the same
  // transitions, for the same reason (never leak selection across spaces).
  return { selectedMemberId: null, multiSelection: [], selectedTemplateShapeId: null };
}

function downloadWcadFile(project: Project) {
  const payload = serializeWcad(project);
  const blob = new Blob([payload], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${project.name.replace(/\s+/g, '_')}.wcad`;
  a.click();
  URL.revokeObjectURL(url);
}

function commitProject(
  set: (partial: Partial<AppStore> | ((s: AppStore) => Partial<AppStore>)) => void,
  get: () => AppStore,
  next: Project,
  nextTemplateEdges?: TemplateEdge[],
  nextTemplateShapes?: TemplateShape[]
) {
  const { project, past, ui } = get();
  const uiPatch: Partial<UIState> = {};
  if (nextTemplateEdges !== undefined) uiPatch.templateEdges = nextTemplateEdges;
  if (nextTemplateShapes !== undefined) uiPatch.templateShapes = nextTemplateShapes;
  set({
    past: [...past, { project, templateEdges: ui.templateEdges, templateShapes: ui.templateShapes }].slice(-MAX_HISTORY),
    project: next,
    future: [],
    ...(Object.keys(uiPatch).length > 0 ? { ui: { ...ui, ...uiPatch } } : {}),
  });
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
  project: DEFAULT_PROJECT,
  ui: DEFAULT_UI,
  past: [],
  future: [],

  recoveryAvailable: false,
  recoveryTimestamp: null,
  recoverableProjectSnapshot: null,
  recentFiles: [],

  dismissRecovery: () =>
    set({ recoveryAvailable: false, recoveryTimestamp: null, recoverableProjectSnapshot: null }),

  recoverAutosave: () => {
    const snap = get().recoverableProjectSnapshot;
    if (!snap) return;
    // Phase 20: recovery and File → Open share the exact same restore path.
    get().restoreProject(snap);
    set({
      recoveryAvailable: false,
      recoveryTimestamp: null,
      recoverableProjectSnapshot: null,
    });
  },

  undo: () => {
    const { past, project, future, ui } = get();
    if (past.length === 0) return;
    const prev = past[past.length - 1];
    set({
      past: past.slice(0, -1),
      project: prev.project,
      ui: { ...ui, templateEdges: prev.templateEdges, templateShapes: prev.templateShapes },
      future: [{ project, templateEdges: ui.templateEdges, templateShapes: ui.templateShapes }, ...future],
    });
  },

  redo: () => {
    const { past, project, future, ui } = get();
    if (future.length === 0) return;
    const next = future[0];
    set({
      past: [...past, { project, templateEdges: ui.templateEdges, templateShapes: ui.templateShapes }],
      project: next.project,
      ui: { ...ui, templateEdges: next.templateEdges, templateShapes: next.templateShapes },
      future: future.slice(1),
    });
  },

  canUndo: () => get().past.length > 0,
  canRedo: () => get().future.length > 0,

  addMember: (member) => {
    const migrated = migrateMember(member);
    commitProject(set, get, {
      ...get().project,
      members: [...get().project.members, migrated],
    });
  },

  updateMember: (id, patch, skipHistory) => {
    const next = {
      ...get().project,
      members: get().project.members.map((m) =>
        m.id === id ? migrateMember({ ...m, ...patch }) : m
      ),
    };
    if (skipHistory) {
      set({ project: next });
    } else {
      commitProject(set, get, next);
    }
  },

  moveMembers: (updates, skipHistory) => {
    const next = {
      ...get().project,
      members: get().project.members.map((m) => {
        const u = updates.find((x) => x.id === m.id);
        return u ? migrateMember({ ...m, position: u.position }) : m;
      }),
    };
    if (skipHistory) {
      set({ project: next });
    } else {
      commitProject(set, get, next);
    }
  },

  removeMember: (id) => {
    const p = get().project;
    const removedMateIds = p.mates
      .filter((m) => m.memberAId === id || m.memberBId === id)
      .map((m) => m.id);
    const removedApIds = new Set(
      p.attachmentPoints.filter((ap) => ap.memberId === id).map((ap) => ap.id)
    );

    commitProject(set, get, {
      ...p,
      members: p.members.filter((m) => m.id !== id),
      mates: p.mates.filter((m) => m.memberAId !== id && m.memberBId !== id),
      fasteners: p.fasteners.filter((f) => !removedMateIds.includes(f.mateId)),
      attachmentPoints: p.attachmentPoints
        .filter((ap) => ap.memberId !== id)
        .map((ap) =>
          ap.connectedToId && removedApIds.has(ap.connectedToId)
            ? { ...ap, connectedToId: undefined }
            : ap
        ),
      edgeTreatments: p.edgeTreatments.filter((e) => e.memberId !== id),
      placedHardware: p.placedHardware.filter((h) => h.memberId !== id),
      // Phase 19 FIX 2: mirror unmateBoard's cleanup pattern here too — deleting a
      // board must prune its mateGroups/mateConstraints/dimensionLines the same
      // way unmating it already does, or these records orphan silently in project
      // state and every .wcad save from that point forward (AUDIT_PHASE18_ROLLUP.md
      // "Cross-Cutting Pattern").
      mateGroups: (p.mateGroups ?? [])
        .map((g) => ({ ...g, memberIds: g.memberIds.filter((mid) => mid !== id) }))
        .filter((g) => g.memberIds.length > 1),
      mateConstraints: (p.mateConstraints ?? []).filter(
        (c) => c.solidAId !== id && c.solidBId !== id
      ),
      dimensionLines: (p.dimensionLines ?? []).filter((l) => l.anchorMemberId !== id),
      referenceLines: (p.referenceLines ?? []).filter((l) => l.anchorMemberId !== id),
      woodJoints: (p.woodJoints ?? []).filter(
        (j) => j.memberAId !== id && j.memberBId !== id
      ),
    });
    set((s) => ({
      ui: {
        ...s.ui,
        selectedMemberId: s.ui.selectedMemberId === id ? null : s.ui.selectedMemberId,
        trimBoundaryId: s.ui.trimBoundaryId === id ? null : s.ui.trimBoundaryId,
        isolatedMemberId: s.ui.isolatedMemberId === id ? null : s.ui.isolatedMemberId,
        edgeToolMemberId: s.ui.edgeToolMemberId === id ? null : s.ui.edgeToolMemberId,
      },
    }));
  },

  removeMembers: (ids) => {
    if (ids.length === 0) return;
    if (ids.length === 1) { get().removeMember(ids[0]); return; }
    const idSet = new Set(ids);
    const p = get().project;
    const removedMateIds = new Set(
      p.mates.filter((m) => idSet.has(m.memberAId) || idSet.has(m.memberBId)).map((m) => m.id)
    );
    const removedApIds = new Set(
      p.attachmentPoints.filter((ap) => idSet.has(ap.memberId)).map((ap) => ap.id)
    );

    commitProject(set, get, {
      ...p,
      members: p.members.filter((m) => !idSet.has(m.id)),
      mates: p.mates.filter((m) => !idSet.has(m.memberAId) && !idSet.has(m.memberBId)),
      fasteners: p.fasteners.filter((f) => !removedMateIds.has(f.mateId)),
      attachmentPoints: p.attachmentPoints
        .filter((ap) => !idSet.has(ap.memberId))
        .map((ap) =>
          ap.connectedToId && removedApIds.has(ap.connectedToId)
            ? { ...ap, connectedToId: undefined }
            : ap
        ),
      edgeTreatments: p.edgeTreatments.filter((e) => !idSet.has(e.memberId)),
      placedHardware: p.placedHardware.filter((h) => !idSet.has(h.memberId)),
      mateGroups: (p.mateGroups ?? [])
        .map((g) => ({ ...g, memberIds: g.memberIds.filter((mid) => !idSet.has(mid)) }))
        .filter((g) => g.memberIds.length > 1),
      mateConstraints: (p.mateConstraints ?? []).filter(
        (c) => !idSet.has(c.solidAId) && !idSet.has(c.solidBId)
      ),
      dimensionLines: (p.dimensionLines ?? []).filter((l) => !idSet.has(l.anchorMemberId)),
      referenceLines: (p.referenceLines ?? []).filter((l) => !idSet.has(l.anchorMemberId)),
      woodJoints: (p.woodJoints ?? []).filter(
        (j) => !idSet.has(j.memberAId) && !idSet.has(j.memberBId)
      ),
    });
    set((s) => ({
      ui: {
        ...s.ui,
        selectedMemberId: s.ui.selectedMemberId && idSet.has(s.ui.selectedMemberId) ? null : s.ui.selectedMemberId,
        multiSelection: s.ui.multiSelection.filter((mid) => !idSet.has(mid)),
        trimBoundaryId: s.ui.trimBoundaryId && idSet.has(s.ui.trimBoundaryId) ? null : s.ui.trimBoundaryId,
        isolatedMemberId: s.ui.isolatedMemberId && idSet.has(s.ui.isolatedMemberId) ? null : s.ui.isolatedMemberId,
        edgeToolMemberId: s.ui.edgeToolMemberId && idSet.has(s.ui.edgeToolMemberId) ? null : s.ui.edgeToolMemberId,
      },
    }));
  },

  duplicateMember: (id) => {
    const m = get().project.members.find((mem) => mem.id === id);
    if (!m) return;
    const newId = crypto.randomUUID();
    // Side-by-side, not diagonal (New Order 3.2): offset along Z only (the
    // board's width axis per bounds.ts's length/thickness/width BoxGeometry
    // convention), by width + 2" of clearance, so repeated duplicates line
    // up next to each other instead of stringing out on a diagonal.
    get().addMember({
      ...m,
      id: newId,
      label: `${m.label} (copy)`,
      position: [m.position[0], m.position[1], m.position[2] + m.width + 2],
      cuts: [...m.cuts.map((c) => ({ ...c, id: crypto.randomUUID() }))],
    });
    get().selectMember(newId);
    get().setLastPlacedMemberId(newId);
  },

  mirrorMember: (id, axis) => {
    const m = get().project.members.find((mem) => mem.id === id);
    if (!m) return;
    const axisIdx = axis === 'x' ? 0 : axis === 'y' ? 1 : 2;
    const rotIdx = axis === 'x' ? 1 : axis === 'y' ? 0 : 2;
    const newPos: [number, number, number] = [...m.position];
    newPos[axisIdx] = -newPos[axisIdx];
    const newRot: [number, number, number] = [...m.rotation];
    newRot[rotIdx] = -newRot[rotIdx];

    get().addMember({
      ...m,
      id: crypto.randomUUID(),
      label: `${m.label} (mirror ${axis.toUpperCase()})`,
      position: newPos,
      rotation: newRot,
      cuts: [],
    });
  },

  trimMember: (targetId, boundaryId) => {
    const target = get().project.members.find((m) => m.id === targetId);
    const boundary = get().project.members.find((m) => m.id === boundaryId);
    if (!target || !boundary) return;
    const patch = trimToBoundary(target, boundary);
    if (patch) get().updateMember(targetId, patch);
  },

  extendMember: (targetId, boundaryId) => {
    const target = get().project.members.find((m) => m.id === targetId);
    const boundary = get().project.members.find((m) => m.id === boundaryId);
    if (!target || !boundary) return;
    const patch = extendToBoundary(target, boundary);
    if (patch) get().updateMember(targetId, patch);
  },

  addCut: (memberId, cut) => {
    commitProject(set, get, {
      ...get().project,
      members: get().project.members.map((m) =>
        m.id === memberId ? { ...m, cuts: [...m.cuts, cut] } : m
      ),
    });
  },

  removeCut: (memberId, cutId) => {
    commitProject(set, get, {
      ...get().project,
      members: get().project.members.map((m) =>
        m.id === memberId
          ? { ...m, cuts: m.cuts.filter((c) => c.id !== cutId) }
          : m
      ),
    });
  },

  updateCut: (memberId, cutId, patch) => {
    commitProject(set, get, {
      ...get().project,
      members: get().project.members.map((m) =>
        m.id === memberId
          ? { ...m, cuts: m.cuts.map((c) => (c.id === cutId ? { ...c, ...patch } : c)) }
          : m
      ),
    });
  },

  addHardware: (item) =>
    commitProject(set, get, {
      ...get().project,
      hardware: [...get().project.hardware, item],
    }),

  removeHardware: (id) =>
    commitProject(set, get, {
      ...get().project,
      hardware: get().project.hardware.filter((h) => h.id !== id),
    }),

  addFinish: (item) =>
    commitProject(set, get, {
      ...get().project,
      finishes: [...get().project.finishes, item],
    }),

  removeFinish: (id) =>
    commitProject(set, get, {
      ...get().project,
      finishes: get().project.finishes.filter((f) => f.id !== id),
    }),

  updateEstimating: (patch) =>
    commitProject(set, get, {
      ...get().project,
      estimating: { ...get().project.estimating, ...patch },
    }),

  setMaterialPrice: (groupKey, entry) =>
    commitProject(set, get, {
      ...get().project,
      estimating: {
        ...get().project.estimating,
        materialPrices: {
          ...get().project.estimating.materialPrices,
          [groupKey]: entry,
        },
      },
    }),

  updateStructural: (patch) =>
    set((s) => ({
      project: {
        ...s.project,
        structural: { ...s.project.structural, ...patch },
      },
    })),

  selectMember: (id, opts) => {
    const { ui } = get();
    if (ui.dimensionEditPending && ui.selectedMemberId) {
      get().commitDimensionEdit();
    }
    const openWheel = opts?.openWheel ?? false;
    set((s) => {
      let anchor: { x: number; y: number } | null = null;
      if (id !== null) {
        if (opts?.wheelAnchor) {
          anchor = opts.wheelAnchor;
        } else if (openWheel) {
          anchor = s.ui.radialWheelAnchor;
        }
      }
      return {
        ui: {
          ...s.ui,
          selectedMemberId: id,
          multiSelection: id ? [id] : [],
          quickDimensionsOpen: false,
          transformGizmoActive: false,
          radialWheelOpen: id !== null && openWheel,
          radialWheelMode: 'full',
          radialWheelCollapsed: false,
          radialWheelAnchor: anchor,
          quickJoinMiterAxis: null,
          suggestionHighlightIds: [],
          ...(id === null
            ? {
                quickDimensionsOpen: false,
                radialWheelOpen: false,
                radialWheelAnchor: null,
                mateHoverFace: null,
                combinedSelectionBounds: null,
              }
            : {}),
        },
      };
    });
  },

  setMultiSelection: (ids) => {
    set((s) => ({
      ui: {
        ...s.ui,
        multiSelection: ids,
        selectedMemberId: ids[0] ?? null,
        quickDimensionsOpen: false,
        radialWheelOpen: false,
        radialWheelCollapsed: false,
        radialWheelAnchor: null,
        quickJoinMiterAxis: null,
        ...(ids.length === 0
          ? {
              quickDimensionsOpen: false,
              radialWheelOpen: false,
              radialWheelAnchor: null,
              combinedSelectionBounds: null,
            }
          : {}),
      },
    }));
  },

  toggleMultiSelectionMember: (id) => {
    const { multiSelection } = get().ui;
    const next = multiSelection.includes(id)
      ? multiSelection.filter((x) => x !== id)
      : [...multiSelection, id];
    get().setMultiSelection(next);
  },

  setActiveTool: (tool) =>
    set((s) => {
      // Phase 20: mode follows tool. Picking/shortcutting a tool that lives in
      // another workspace mode switches to that mode in the same action — one
      // keystroke, predictable result, no dead keys.
      const nextMode = isToolLegalInMode(tool, s.ui.workspaceMode)
        ? s.ui.workspaceMode
        : modeForTool(tool);
      return {
        ui: {
          ...s.ui,
          activeTool: tool,
          workspaceMode: nextMode,
          rightPanelTab: fixPanelTab(s.ui.rightPanelTab, nextMode),
          ...(tool !== s.ui.activeTool ? { pendingInteraction: null } : {}),
          ...(tool !== 'drawBoard' ? { lastPlacedMemberId: null, drawSnapIndicator: null } : {}),
          ...(tool !== 'measure' ? { dimensionDraft: null } : {}),
          ...(tool !== 'referenceLine' ? { referenceDraft: null } : {}),
          ...(tool !== 'mate' ? { mateFaceA: null, mateFaceB: null, matePickTarget: 'A' as const, mateHoverFace: null } : {}),
          ...(tool !== 'trimExtend' ? { trimHoverFace: null } : {}),
          ...(tool !== 'chamfer' ? { chamferEdge: null, chamferHoverEdge: null } : {}),
          ...templateTransitionPatch(s.ui.workspaceMode, nextMode),
        },
      };
    }),

  setTransformMode: (mode) =>
    set((s) => ({ ui: { ...s.ui, transformMode: mode } })),

  setTransformGizmoActive: (active) =>
    set((s) => ({ ui: { ...s.ui, transformGizmoActive: active } })),

  setTrimBoundary: (id) =>
    set((s) => ({ ui: { ...s.ui, trimBoundaryId: id } })),

  setOrbitControlsEnabled: (enabled) =>
    set((s) => ({ ui: { ...s.ui, orbitControlsEnabled: enabled } })),

  setMoveDragActive: (active) =>
    set((s) => ({ ui: { ...s.ui, moveDragActive: active } })),

  resetCamera: () =>
    set((s) => ({ ui: { ...s.ui, cameraResetNonce: s.ui.cameraResetNonce + 1 } })),

  setCameraPreset: (preset) =>
    set((s) => ({ ui: { ...s.ui, cameraPreset: preset } })),

  setAngleSnapEnabled: (enabled) =>
    set((s) => ({ ui: { ...s.ui, angleSnapEnabled: enabled } })),

  setAnnotationSnapEnabled: (enabled) =>
    set((s) => ({ ui: { ...s.ui, annotationSnapEnabled: enabled } })),

  setAngleSnapIncrement: (deg) =>
    set((s) => ({ ui: { ...s.ui, angleSnapIncrement: deg } })),

  openContextMenu: (x, y, memberId) =>
    set((s) => ({
      ui: {
        ...s.ui,
        contextMenu: { open: true, x, y, memberId },
        selectedMemberId: memberId ?? s.ui.selectedMemberId,
      },
    })),

  closeContextMenu: () =>
    set((s) => ({
      ui: { ...s.ui, contextMenu: { ...s.ui.contextMenu, open: false } },
    })),

  setIsolatedMember: (id) =>
    set((s) => ({ ui: { ...s.ui, isolatedMemberId: id } })),

  resetToolState: () =>
    set((s) => ({
      ui: {
        ...s.ui,
        activeTool: 'select',
        orbitControlsEnabled: true,
        moveDragActive: false,
        trimBoundaryId: null,
        mateFaceA: null,
        mateFaceB: null,
        matePickTarget: 'A',
        mateHoverFace: null,
        trimHoverFace: null,
        chamferEdge: null,
        chamferHoverEdge: null,
        mateGridOffset: null,
        fastenerPlacementMode: false,
        fastenerPlacementMateId: null,
        radialWheelOpen: false,
        radialWheelCollapsed: false,
        radialWheelAnchor: null,
        attachmentPointPickA: null,
        lastPlacedMemberId: null,
        drawChainLinks: [],
        drawSnapIndicator: null,
        boxSelectRect: null,
        boxSelectPending: null,
        quickJoinMiterAxis: null,
        measureStartPoint: null,
        selectedDimensionLineId: null,
        selectedReferenceLineId: null,
        dimensionDraft: null,
        referenceDraft: null,
        crossCutPreviewPosition: null,
        ripCutPreviewPosition: null,
        multiSelection: [],
        selectedMemberId: null,
        transformGizmoActive: false,
        pendingInteraction: null,
        drawBoardCancelNonce: s.ui.drawBoardCancelNonce + 1,
        contextMenu: { ...s.ui.contextMenu, open: false },
      },
    })),

  setGridVisible: (visible) =>
    set((s) => ({ ui: { ...s.ui, gridVisible: visible } })),

  setOrthographic: (ortho) =>
    set((s) => ({ ui: { ...s.ui, orthographic: ortho } })),

  setMateFaceA: (sel) =>
    set((s) => ({ ui: { ...s.ui, mateFaceA: sel } })),

  setMateFaceB: (sel) =>
    set((s) => ({ ui: { ...s.ui, mateFaceB: sel } })),

  setMatePickTarget: (target) =>
    set((s) => ({ ui: { ...s.ui, matePickTarget: target } })),

  pickMateFace: (memberId, face) => {
    const { mateFaceA } = get().ui;
    if (!mateFaceA) {
      set((s) => ({ ui: { ...s.ui, mateFaceA: { memberId, face, offset: [0, 0, 0] }, matePickTarget: 'B' } }));
      return;
    }
    if (mateFaceA.memberId === memberId) return; // Face B must be a different board than Face A
    set((s) => ({ ui: { ...s.ui, mateFaceB: { memberId, face, offset: [0, 0, 0] } } }));
  },

  resetMatePicks: () =>
    set((s) => ({ ui: { ...s.ui, mateFaceA: null, mateFaceB: null, matePickTarget: 'A', mateHoverFace: null } })),

  setChamferEdge: (target) => set((s) => ({ ui: { ...s.ui, chamferEdge: target } })),
  setChamferHoverEdge: (target) => set((s) => ({ ui: { ...s.ui, chamferHoverEdge: target } })),
  resetChamferPick: () => set((s) => ({ ui: { ...s.ui, chamferEdge: null, chamferHoverEdge: null } })),

  removeChamfer: (memberId, edgeId) => {
    const member = get().project.members.find((m) => m.id === memberId);
    if (!member) return;
    commitProject(set, get, {
      ...get().project,
      members: get().project.members.map((m) =>
        m.id === memberId ? { ...m, chamfers: (m.chamfers ?? []).filter((c) => c.edgeId !== edgeId) } : m
      ),
    });
    if (get().ui.chamferEdge?.memberId === memberId && get().ui.chamferEdge?.edgeId === edgeId) {
      set((s) => ({ ui: { ...s.ui, chamferEdge: null } }));
    }
  },

  applyMate: () => {
    const { mateFaceA, mateFaceB } = get().ui;
    if (!mateFaceA || !mateFaceB) return null;
    const a = get().project.members.find((m) => m.id === mateFaceA.memberId);
    const b = get().project.members.find((m) => m.id === mateFaceB.memberId);
    if (!a || !b) return null;

    const patch = computeMateTransform(
      a,
      mateFaceA.face,
      b,
      mateFaceB.face,
      mateFaceA.offset ?? [0, 0, 0],
      mateFaceB.offset ?? [0, 0, 0]
    );
    const offsetA = mateFaceA.offset;
    const offsetB = mateFaceB.offset;

    const mate: MemberMate = {
      id: crypto.randomUUID(),
      memberAId: a.id,
      memberBId: b.id,
      faceA: mateFaceA.face,
      faceB: mateFaceB.face,
      joinMethod: 'Unset',
      offsetA,
      offsetB,
    };

    const newConstraint: EngineMateConstraint = {
      id: mate.id,
      solidAId: a.id,
      faceAId: mateFaceA.face,
      solidBId: b.id,
      faceBId: mateFaceB.face,
      type: 'flush',
      offset: offsetB ? { x: offsetB[0], y: offsetB[1], z: 0 } : undefined,
    };

    const steps = get().project.assemblySteps;
    // Update mate groups: merge A and B into one group
    const existingGroups = get().project.mateGroups ?? [];
    const groupA = existingGroups.find((g) => g.memberIds.includes(a.id));
    const groupB = existingGroups.find((g) => g.memberIds.includes(b.id));
    let newGroups: MateGroup[];
    if (groupA && groupB && groupA.id !== groupB.id) {
      // Merge two groups
      const merged: MateGroup = {
        id: groupA.id,
        memberIds: [...new Set([...groupA.memberIds, ...groupB.memberIds])],
      };
      newGroups = existingGroups
        .filter((g) => g.id !== groupA.id && g.id !== groupB.id)
        .concat(merged);
    } else if (groupA) {
      // Add B to A's group
      newGroups = existingGroups.map((g) =>
        g.id === groupA.id ? { ...g, memberIds: [...new Set([...g.memberIds, b.id])] } : g
      );
    } else if (groupB) {
      // Add A to B's group
      newGroups = existingGroups.map((g) =>
        g.id === groupB.id ? { ...g, memberIds: [...new Set([...g.memberIds, a.id])] } : g
      );
    } else {
      // New group
      newGroups = [...existingGroups, { id: crypto.randomUUID(), memberIds: [a.id, b.id] }];
    }

    const nextProject = {
      ...get().project,
      members: get().project.members.map((m) =>
        m.id === b.id ? migrateMember({ ...m, ...patch }) : m
      ),
      mates: [...get().project.mates, mate],
      mateGroups: newGroups,
      mateConstraints: [...(get().project.mateConstraints ?? []), newConstraint],
      ...(get().ui.viewportMode === 'assembly'
        ? {
            assemblySteps: [
              ...steps,
              {
                stepIndex: steps.length + 1,
                mateId: mate.id,
                description: `Mate ${b.label} to ${a.label} (${mate.faceA} ↔ ${mate.faceB})`,
              },
            ],
          }
        : {}),
    };

    commitProject(set, get, nextProject);
    set((s) => ({
      ui: {
        ...s.ui,
        mateFaceA: null,
        mateFaceB: null,
        matePickTarget: 'A',
        mateGridOffset: null,
        mateHoverFace: null,
        // Stay on the mate tool so the user can chain more mates without re-pressing J
        activeTool: 'mate',
        radialWheelOpen: false,
        selectedMateId: mate.id,
      },
    }));

    return mate.id;
  },

  moveMateGroup: (anchorMemberId, delta, skipHistory) => {
    const group = get().project.mateGroups?.find((g) => g.memberIds.includes(anchorMemberId));
    if (!group) return;
    const otherIds = group.memberIds.filter((id) => id !== anchorMemberId);
    if (otherIds.length === 0) return;
    const nextProject = {
      ...get().project,
      members: get().project.members.map((m) => {
        if (!otherIds.includes(m.id)) return m;
        return migrateMember({
          ...m,
          position: [
            m.position[0] + delta[0],
            m.position[1] + delta[1],
            m.position[2] + delta[2],
          ] as [number, number, number],
        });
      }),
    };
    // During a live drag, skip pushing each incremental frame onto the undo stack —
    // the final updateMember() call at drag-end commits the whole project (including
    // the already-moved partner board) as a single undo step.
    if (skipHistory) {
      set({ project: nextProject });
    } else {
      commitProject(set, get, nextProject);
    }
  },

  unmateAll: (groupId) => {
    const group = get().project.mateGroups?.find((g) => g.id === groupId);
    const memberIds = new Set(group?.memberIds ?? []);
    // Any legacy MemberMate/Fastener record fully inside this group must be
    // dropped alongside the constraint, or its marker (MateMarkers /
    // FastenerMeshes) keeps rendering a "connection" that no longer exists —
    // it would still derive a live world position every frame (Law 1), just
    // for a relationship that was supposed to have been severed (Law 2).
    const removedMateIds = new Set(
      get().project.mates
        .filter((m) => memberIds.has(m.memberAId) && memberIds.has(m.memberBId))
        .map((m) => m.id)
    );
    commitProject(set, get, {
      ...get().project,
      mateGroups: (get().project.mateGroups ?? []).filter((g) => g.id !== groupId),
      mateConstraints: (get().project.mateConstraints ?? []).filter(
        (c) => !memberIds.has(c.solidAId) || !memberIds.has(c.solidBId)
      ),
      mates: get().project.mates.filter(
        (m) => !(memberIds.has(m.memberAId) && memberIds.has(m.memberBId))
      ),
      fasteners: get().project.fasteners.filter((f) => !removedMateIds.has(f.mateId)),
      woodJoints: (get().project.woodJoints ?? []).filter(
        (j) => !(memberIds.has(j.memberAId) && memberIds.has(j.memberBId))
      ),
    });
  },

  unmateBoard: (memberId) => {
    const groups = get().project.mateGroups ?? [];
    const newGroups = groups
      .map((g) => ({ ...g, memberIds: g.memberIds.filter((id) => id !== memberId) }))
      .filter((g) => g.memberIds.length > 1);
    const removedMateIds = new Set(
      get().project.mates
        .filter((m) => m.memberAId === memberId || m.memberBId === memberId)
        .map((m) => m.id)
    );
    commitProject(set, get, {
      ...get().project,
      mateGroups: newGroups,
      mateConstraints: (get().project.mateConstraints ?? []).filter(
        (c) => c.solidAId !== memberId && c.solidBId !== memberId
      ),
      mates: get().project.mates.filter(
        (m) => m.memberAId !== memberId && m.memberBId !== memberId
      ),
      fasteners: get().project.fasteners.filter((f) => !removedMateIds.has(f.mateId)),
      woodJoints: (get().project.woodJoints ?? []).filter(
        (j) => j.memberAId !== memberId && j.memberBId !== memberId
      ),
    });
  },

  getMateGroupForMember: (memberId) =>
    get().project.mateGroups?.find((g) => g.memberIds.includes(memberId)),

  solveMateConstraints: (movedMemberId, livePosition, liveRotation, skipHistory) => {
    const { project } = get();
    const constraints = project.mateConstraints ?? [];
    if (constraints.length === 0) return;

    const boards = project.members.map((m) =>
      m.id === movedMemberId
        ? migrateWoodMemberToSolidBoard({ ...m, position: livePosition, rotation: liveRotation })
        : migrateWoodMemberToSolidBoard(m)
    );

    const solved = CADGeometryEngine.solveConstraints(boards, constraints, movedMemberId);
    if (solved.size === 0) return;

    const nextMembers = project.members.map((m) => {
      const s = solved.get(m.id);
      if (!s) return m;
      return migrateMember({
        ...m,
        position: [s.position.x, s.position.y, s.position.z],
        rotation: [s.rotation.x, s.rotation.y, s.rotation.z],
      });
    });

    const next = { ...project, members: nextMembers };
    if (skipHistory) {
      set({ project: next });
    } else {
      commitProject(set, get, next);
    }
  },

  setMemberScreenBounds: (bounds) =>
    set((s) => ({ ui: { ...s.ui, memberScreenBounds: bounds } })),

  setQuickDimensionsOpen: (open) =>
    set((s) => ({ ui: { ...s.ui, quickDimensionsOpen: open } })),

  setRadialWheelOpen: (open, mode) =>
    set((s) => ({
      ui: {
        ...s.ui,
        radialWheelOpen: open,
        radialWheelMode: mode ?? s.ui.radialWheelMode,
        ...(open ? {} : { radialWheelAnchor: null }),
      },
    })),

  setMateHoverFace: (face) =>
    set((s) => ({ ui: { ...s.ui, mateHoverFace: face } })),

  setTrimHoverFace: (face) =>
    set((s) => ({ ui: { ...s.ui, trimHoverFace: face } })),

  setMateGridOffset: (offset) =>
    set((s) => ({ ui: { ...s.ui, mateGridOffset: offset } })),

  setMateJoinMethod: (mateId, method) => {
    const mate = get().project.mates.find((m) => m.id === mateId);
    const memberA = mate
      ? get().project.members.find((m) => m.id === mate.memberAId)
      : undefined;
    const updatedMate = mate ? { ...mate, joinMethod: method } : null;
    const newFasteners =
      updatedMate && memberA
        ? createDefaultFastenersForMate(updatedMate, memberA, method)
        : [];

    commitProject(set, get, {
      ...get().project,
      mates: get().project.mates.map((m) =>
        m.id === mateId ? { ...m, joinMethod: method } : m
      ),
      fasteners: [...get().project.fasteners, ...newFasteners],
    });

    if (method !== 'Unset' && method !== 'Glue' && method !== 'Mortise & Tenon') {
      set((s) => ({
        ui: {
          ...s.ui,
          fastenerPlacementMode: true,
          fastenerPlacementMateId: mateId,
          radialWheelOpen: false,
        },
      }));
    } else {
      set((s) => ({
        ui: { ...s.ui, radialWheelOpen: false, fastenerPlacementMode: false, fastenerPlacementMateId: null },
      }));
    }
  },

  removeMate: (mateId) =>
    commitProject(set, get, {
      ...get().project,
      mates: get().project.mates.filter((m) => m.id !== mateId),
      fasteners: get().project.fasteners.filter((f) => f.mateId !== mateId),
      mateConstraints: (get().project.mateConstraints ?? []).filter((c) => c.id !== mateId),
      // Wood joints share their id with the mate they created (Phase 20).
      woodJoints: (get().project.woodJoints ?? []).filter((j) => j.id !== mateId),
    }),

  addAttachmentPoint: (point) =>
    commitProject(set, get, {
      ...get().project,
      attachmentPoints: [...get().project.attachmentPoints, point],
    }),

  updateAttachmentPoint: (id, patch, skipHistory) => {
    const next = {
      ...get().project,
      attachmentPoints: get().project.attachmentPoints.map((p) =>
        p.id === id ? { ...p, ...patch } : p
      ),
    };
    if (skipHistory) {
      set({ project: next });
    } else {
      commitProject(set, get, next);
    }
  },

  removeAttachmentPoint: (id) =>
    commitProject(set, get, {
      ...get().project,
      attachmentPoints: get().project.attachmentPoints.filter((p) => p.id !== id),
    }),

  connectAttachmentPoints: (idA, idB) => {
    const pts = get().project.attachmentPoints;
    const ptA = pts.find((p) => p.id === idA);
    const ptB = pts.find((p) => p.id === idB);
    if (!ptA || !ptB) return;
    const memberA = get().project.members.find((m) => m.id === ptA.memberId);
    const memberB = get().project.members.find((m) => m.id === ptB.memberId);
    if (!memberA || !memberB) return;

    const patch = computePointMateTransform(memberA, ptA, memberB, ptB);

    commitProject(set, get, {
      ...get().project,
      members: get().project.members.map((m) =>
        m.id === memberB.id ? migrateMember({ ...m, ...patch }) : m
      ),
      attachmentPoints: pts.map((p) => {
        if (p.id === idA) return { ...p, connectedToId: idB };
        if (p.id === idB) return { ...p, connectedToId: idA };
        return p;
      }),
    });
  },

  setAttachmentPointPickA: (id) =>
    set((s) => ({ ui: { ...s.ui, attachmentPointPickA: id } })),

  addFastener: (fastener) =>
    commitProject(set, get, {
      ...get().project,
      fasteners: [...get().project.fasteners, fastener],
    }),

  removeFastener: (id) =>
    commitProject(set, get, {
      ...get().project,
      fasteners: get().project.fasteners.filter((f) => f.id !== id),
    }),

  setFastenerPlacementMode: (active, mateId) =>
    set((s) => ({
      ui: {
        ...s.ui,
        fastenerPlacementMode: active,
        fastenerPlacementMateId: mateId ?? null,
      },
    })),

  setSelectedFastenerId: (id) =>
    set((s) => ({ ui: { ...s.ui, selectedFastenerId: id } })),

  setSelectedMateId: (id) =>
    set((s) => ({ ui: { ...s.ui, selectedMateId: id } })),

  setPepePanelOpen: (open) =>
    set((s) => ({ ui: { ...s.ui, pepePanelOpen: open } })),

  setPepeTab: (tab) =>
    set((s) => ({ ui: { ...s.ui, pepeTab: tab } })),

  setPepeExpression: (expr) =>
    set((s) => ({ ui: { ...s.ui, pepeExpression: expr } })),

  addPepeMissedQuery: (query) =>
    set((s) => {
      const q = query.trim();
      if (!q || s.ui.missedQueries.includes(q)) return s;
      return { ui: { ...s.ui, missedQueries: [...s.ui.missedQueries, q] } };
    }),

  setDesignSuggestions: (suggestions) =>
    set((s) => ({ ui: { ...s.ui, designSuggestions: suggestions } })),

  setSuggestionHighlightIds: (ids) =>
    set((s) => ({ ui: { ...s.ui, suggestionHighlightIds: ids } })),

  setDimensionEditPending: (pending) =>
    set((s) => ({ ui: { ...s.ui, dimensionEditPending: pending } })),

  commitDimensionEdit: () => {
    const { ui, project } = get();
    if (!ui.dimensionEditPending || !ui.selectedMemberId) return;
    const member = project.members.find((m) => m.id === ui.selectedMemberId);
    if (!member) return;
    commitProject(set, get, { ...project });
    set((s) => ({ ui: { ...s.ui, dimensionEditPending: false } }));
  },

  commitCurrentProject: () => {
    commitProject(set, get, { ...get().project });
  },

  addEdgeTreatment: (t) =>
    commitProject(set, get, {
      ...get().project,
      edgeTreatments: [...get().project.edgeTreatments, t],
    }),

  removeEdgeTreatment: (id) =>
    commitProject(set, get, {
      ...get().project,
      edgeTreatments: get().project.edgeTreatments.filter((e) => e.id !== id),
    }),

  setEdgeToolMemberId: (id) =>
    set((s) => ({ ui: { ...s.ui, edgeToolMemberId: id, edgeSelectedIndex: null } })),

  setEdgeHoverIndex: (idx) =>
    set((s) => ({ ui: { ...s.ui, edgeHoverIndex: idx } })),

  setEdgeSelectedIndex: (idx) =>
    set((s) => ({ ui: { ...s.ui, edgeSelectedIndex: idx } })),

  setViewportMode: (mode) => {
    const { project, ui } = get();
    const { members } = project;
    if (mode === 'assembly' && ui.viewportMode !== 'assembly') {
      const snapshot = members.map((m) => ({
        memberId: m.id,
        position: [...m.position] as [number, number, number],
        rotation: [...m.rotation] as [number, number, number],
      }));
      const spacing = 8;
      const updated = members.map((m, i) => ({
        ...m,
        position: [i * spacing, m.thickness / 2, 0] as [number, number, number],
        rotation: [0, 0, 0] as [number, number, number],
      }));
      commitProject(set, get, { ...get().project, members: updated });
      set((s) => ({
        ui: {
          ...s.ui,
          viewportMode: mode,
          assemblyGuideOpen: true,
          assemblyDesignSnapshot: snapshot,
        },
      }));
      return;
    }

    if (mode === 'design' && ui.viewportMode === 'assembly' && ui.assemblyDesignSnapshot) {
      const snapMap = new Map(ui.assemblyDesignSnapshot.map((s) => [s.memberId, s]));
      const restored = members.map((m) => {
        const saved = snapMap.get(m.id);
        if (!saved) return m;
        return {
          ...m,
          position: saved.position,
          rotation: saved.rotation,
        };
      });
      commitProject(set, get, { ...get().project, members: restored });
      set((s) => ({
        ui: {
          ...s.ui,
          viewportMode: mode,
          assemblyGuideOpen: false,
          assemblyDesignSnapshot: null,
        },
      }));
      return;
    }

    set((s) => ({
      ui: {
        ...s.ui,
        viewportMode: mode,
        assemblyGuideOpen: mode === 'assembly',
      },
    }));
  },

  setDisplayMode: (mode) =>
    set((s) => ({ ui: { ...s.ui, displayMode: mode } })),

  setHardwareLibraryPick: (id) =>
    set((s) => ({
      ui: { ...s.ui, hardwareLibraryPick: id, activeTool: id ? 'placeHardware' : s.ui.activeTool },
    })),

  addPlacedHardware: (item) =>
    commitProject(set, get, {
      ...get().project,
      placedHardware: [...get().project.placedHardware, item],
    }),

  removePlacedHardware: (id) =>
    commitProject(set, get, {
      ...get().project,
      placedHardware: get().project.placedHardware.filter((h) => h.id !== id),
    }),

  updatePlacedHardware: (id, patch) =>
    commitProject(set, get, {
      ...get().project,
      placedHardware: get().project.placedHardware.map((h) =>
        h.id === id ? { ...h, ...patch } : h
      ),
    }),

  addAssemblyStep: (step) =>
    commitProject(set, get, {
      ...get().project,
      assemblySteps: [...get().project.assemblySteps, step],
    }),

  resetAssemblyLayout: () => {
    const { members } = get().project;
    const spacing = 8;
    commitProject(set, get, {
      ...get().project,
      members: members.map((m, i) => ({
        ...m,
        position: [i * spacing, m.thickness / 2, 0] as [number, number, number],
        rotation: [0, 0, 0] as [number, number, number],
      })),
      assemblySteps: [],
    });
  },

  setAssemblyGuideOpen: (open) =>
    set((s) => ({ ui: { ...s.ui, assemblyGuideOpen: open } })),

  setCombinedSelectionBounds: (bounds) =>
    set((s) => ({ ui: { ...s.ui, combinedSelectionBounds: bounds } })),

  setBoxSelectRect: (rect) =>
    set((s) => ({ ui: { ...s.ui, boxSelectRect: rect } })),

  setBoxSelectPending: (pending) =>
    set((s) => ({ ui: { ...s.ui, boxSelectPending: pending } })),

  setRadialWheelCollapsed: (collapsed) =>
    set((s) => ({ ui: { ...s.ui, radialWheelCollapsed: collapsed } })),

  setLastPlacedMemberId: (id) =>
    set((s) => ({ ui: { ...s.ui, lastPlacedMemberId: id } })),

  addDrawChainLink: (fromApId, toApId) =>
    set((s) => ({
      ui: {
        ...s.ui,
        drawChainLinks: [...s.ui.drawChainLinks, { fromApId, toApId }],
      },
    })),

  setDrawSnapIndicator: (pt) =>
    set((s) => ({ ui: { ...s.ui, drawSnapIndicator: pt } })),

  cancelDrawBoard: () =>
    set((s) => ({
      ui: {
        ...s.ui,
        drawBoardCancelNonce: s.ui.drawBoardCancelNonce + 1,
        drawSnapIndicator: null,
        orbitControlsEnabled: true,
      },
    })),

  setQuickJoinMiterAxis: (axis) =>
    set((s) => ({ ui: { ...s.ui, quickJoinMiterAxis: axis } })),

  autoDetectJoints: () => {
    const { members, mates } = get().project;
    const ids = get().ui.multiSelection;
    if (ids.length < 2) return [];
    const pairs = findCloseFacePairs(members, ids);
    const newMateIds: string[] = [];
    let nextMembers = [...members];
    let nextMates = [...mates];

    for (const pair of pairs) {
      const built = buildMateFromPair(nextMembers, pair);
      if (!built) continue;
      const exists = nextMates.some(
        (m) =>
          (m.memberAId === pair.memberAId && m.memberBId === pair.memberBId) ||
          (m.memberAId === pair.memberBId && m.memberBId === pair.memberAId)
      );
      if (exists) continue;
      nextMembers = nextMembers.map((m) =>
        m.id === pair.memberBId ? migrateMember({ ...m, ...built.memberBPatch }) : m
      );
      nextMates = [...nextMates, built.mate];
      newMateIds.push(built.mate.id);
    }

    if (newMateIds.length > 0) {
      commitProject(set, get, { ...get().project, members: nextMembers, mates: nextMates });
      set((s) => ({
        ui: {
          ...s.ui,
          radialWheelOpen: false,
          selectedMateId: newMateIds[0],
        },
      }));
    }
    return newMateIds;
  },

  applyButtJoints: () => {
    get().autoDetectJoints();
  },

  applyLapJoints: () => {
    const { members, mates } = get().project;
    const ids = get().ui.multiSelection;
    if (ids.length < 2) return;
    const pairs = findCloseFacePairs(members, ids);
    let nextMembers = [...members];
    let nextMates = [...mates];

    for (const pair of pairs) {
      const a = nextMembers.find((m) => m.id === pair.memberAId);
      const b = nextMembers.find((m) => m.id === pair.memberBId);
      if (!a || !b) continue;
      const patch = lapJointPatch(a, pair.faceA, b, pair.faceB);
      const mate: MemberMate = {
        id: crypto.randomUUID(),
        memberAId: a.id,
        memberBId: b.id,
        faceA: pair.faceA,
        faceB: pair.faceB,
        joinMethod: 'Unset',
      };
      nextMembers = nextMembers.map((m) =>
        m.id === b.id ? migrateMember({ ...m, ...patch }) : m
      );
      nextMates = [...nextMates, mate];
    }

    commitProject(set, get, { ...get().project, members: nextMembers, mates: nextMates });
  },

  applyMiterJoints: (_axis) => {
    const { members, mates } = get().project;
    const ids = get().ui.multiSelection;
    if (ids.length < 2) return;
    const pairs = findCloseFacePairs(members, ids);
    let nextMembers = [...members];
    let nextMates = [...mates];

    for (const pair of pairs) {
      const built = buildMateFromPair(nextMembers, pair);
      if (!built) continue;
      const a = nextMembers.find((m) => m.id === pair.memberAId);
      const b = nextMembers.find((m) => m.id === pair.memberBId);
      if (!a || !b) continue;

      const cutA = createCutOperation('miterCut', { end: pair.faceA.includes('Max') ? 'end' : 'start', angle: 45 });
      const cutB = createCutOperation('miterCut', { end: pair.faceB.includes('Max') ? 'end' : 'start', angle: 45 });

      nextMembers = nextMembers.map((m) => {
        if (m.id === a.id) return migrateMember({ ...m, cuts: [...m.cuts, cutA] });
        if (m.id === b.id) return migrateMember({ ...m, ...built.memberBPatch, cuts: [...m.cuts, cutB] });
        return m;
      });
      nextMates = [...nextMates, built.mate];
    }

    commitProject(set, get, { ...get().project, members: nextMembers, mates: nextMates });
    set((s) => ({ ui: { ...s.ui, quickJoinMiterAxis: null } }));
  },

  splitMemberByCrossCut: (memberId, position) => {
    const member = get().project.members.find((m) => m.id === memberId);
    if (!member) return;
    const [board1, board2] = splitByCrossCut(member, position);
    const p = get().project;
    commitProject(set, get, {
      ...p,
      members: [
        ...p.members.filter((m) => m.id !== memberId).map(migrateMember),
        migrateMember(board1),
        migrateMember(board2),
      ],
      mates: p.mates.filter((m) => m.memberAId !== memberId && m.memberBId !== memberId),
      fasteners: p.fasteners.filter((f) => {
        const mate = p.mates.find((m) => m.id === f.mateId);
        return mate && mate.memberAId !== memberId && mate.memberBId !== memberId;
      }),
      // Phase 19 FIX 2: the original memberId ceases to exist post-split — any
      // mateGroups/mateConstraints/dimensionLines still referencing it would
      // otherwise orphan silently (AUDIT_PHASE18_ROLLUP.md finding #2).
      mateGroups: (p.mateGroups ?? [])
        .map((g) => ({ ...g, memberIds: g.memberIds.filter((mid) => mid !== memberId) }))
        .filter((g) => g.memberIds.length > 1),
      mateConstraints: (p.mateConstraints ?? []).filter(
        (c) => c.solidAId !== memberId && c.solidBId !== memberId
      ),
      dimensionLines: (p.dimensionLines ?? []).filter((l) => l.anchorMemberId !== memberId),
      referenceLines: (p.referenceLines ?? []).filter((l) => l.anchorMemberId !== memberId),
      woodJoints: (p.woodJoints ?? []).filter(
        (j) => j.memberAId !== memberId && j.memberBId !== memberId
      ),
    });
    set((s) => ({
      ui: {
        ...s.ui,
        selectedMemberId: board1.id,
        multiSelection: [board1.id],
        activeTool: 'select',
      },
    }));
  },

  splitMemberByRipCut: (memberId, targetWidth) => {
    const member = get().project.members.find((m) => m.id === memberId);
    if (!member) return;
    const [board1, board2] = splitByRipCut(member, targetWidth);
    const p = get().project;
    commitProject(set, get, {
      ...p,
      members: [
        ...p.members.filter((m) => m.id !== memberId).map(migrateMember),
        migrateMember(board1),
        migrateMember(board2),
      ],
      mates: p.mates.filter((m) => m.memberAId !== memberId && m.memberBId !== memberId),
      fasteners: p.fasteners.filter((f) => {
        const mate = p.mates.find((m) => m.id === f.mateId);
        return mate && mate.memberAId !== memberId && mate.memberBId !== memberId;
      }),
      // Phase 19 FIX 2 — see splitMemberByCrossCut above for rationale.
      mateGroups: (p.mateGroups ?? [])
        .map((g) => ({ ...g, memberIds: g.memberIds.filter((mid) => mid !== memberId) }))
        .filter((g) => g.memberIds.length > 1),
      mateConstraints: (p.mateConstraints ?? []).filter(
        (c) => c.solidAId !== memberId && c.solidBId !== memberId
      ),
      dimensionLines: (p.dimensionLines ?? []).filter((l) => l.anchorMemberId !== memberId),
      referenceLines: (p.referenceLines ?? []).filter((l) => l.anchorMemberId !== memberId),
      woodJoints: (p.woodJoints ?? []).filter(
        (j) => j.memberAId !== memberId && j.memberBId !== memberId
      ),
    });
    set((s) => ({
      ui: {
        ...s.ui,
        selectedMemberId: board1.id,
        multiSelection: [board1.id],
        activeTool: 'select',
      },
    }));
  },

  setPolygonDrawPoints: (pts) =>
    set((s) => ({ ui: { ...s.ui, polygonDrawPoints: pts } })),

  addJointMarker: (memberId, marker) =>
    commitProject(set, get, {
      ...get().project,
      members: get().project.members.map((m) =>
        m.id === memberId
          ? { ...m, jointMarkers: [...(m.jointMarkers ?? []), { ...marker, id: crypto.randomUUID() }] }
          : m
      ),
    }),

  removeJointMarker: (memberId, markerId) =>
    commitProject(set, get, {
      ...get().project,
      members: get().project.members.map((m) =>
        m.id === memberId
          ? { ...m, jointMarkers: (m.jointMarkers ?? []).filter((j) => j.id !== markerId) }
          : m
      ),
    }),

  clearJointMarkers: (memberId) =>
    commitProject(set, get, {
      ...get().project,
      members: get().project.members.map((m) =>
        m.id === memberId ? { ...m, jointMarkers: [] } : m
      ),
    }),

  setSelectedJointType: (t) =>
    set((s) => ({ ui: { ...s.ui, selectedJointType: t } })),

  setSelectedJointMarkerId: (id) =>
    set((s) => ({ ui: { ...s.ui, selectedJointMarkerId: id } })),

  setCrossCutPreviewPosition: (pos) =>
    set((s) => ({ ui: { ...s.ui, crossCutPreviewPosition: pos } })),

  setRipCutPreviewPosition: (pos) =>
    set((s) => ({ ui: { ...s.ui, ripCutPreviewPosition: pos } })),

  setSnapToGrid: (enabled) =>
    set((s) => ({ ui: { ...s.ui, snapToGrid: enabled } })),

  sendToScrapBox: (id) => {
    commitProject(set, get, {
      ...get().project,
      members: get().project.members.map((m) =>
        m.id === id ? { ...m, inScrapBox: true } : m
      ),
    });
    set((s) => ({
      ui: {
        ...s.ui,
        selectedMemberId: s.ui.selectedMemberId === id ? null : s.ui.selectedMemberId,
        multiSelection: s.ui.multiSelection.filter((x) => x !== id),
        radialWheelOpen: false,
      },
    }));
  },

  retrieveFromScrapBox: (id) => {
    const member = get().project.members.find((m) => m.id === id);
    if (!member) return;
    const xs = get().project.members
      .filter((m) => !m.inScrapBox && m.id !== id)
      .map((m) => m.position[0]);
    const maxX = xs.length > 0 ? Math.max(...xs) : 0;
    commitProject(set, get, {
      ...get().project,
      members: get().project.members.map((m) =>
        m.id === id
          ? { ...m, inScrapBox: false, position: [maxX + member.length + 4, m.position[1], m.position[2]] }
          : m
      ),
    });
  },

  clearScrapBox: () =>
    commitProject(set, get, {
      ...get().project,
      members: get().project.members.filter((m) => !m.inScrapBox),
      mates: get().project.mates.filter((mate) => {
        const a = get().project.members.find((m) => m.id === mate.memberAId);
        const b = get().project.members.find((m) => m.id === mate.memberBId);
        return !a?.inScrapBox && !b?.inScrapBox;
      }),
    }),

  setScrapBoxOpen: (open) =>
    set((s) => ({ ui: { ...s.ui, scrapBoxOpen: open } })),

  clearAllMembers: () => {
    if (!window.confirm('Clear all boards? This can be undone with Ctrl+Z.')) return;
    const { project, ui } = get();
    commitProject(set, get, {
      ...project,
      members: [],
      dimensionLines: [],
      mates: [],
      fasteners: [],
      attachmentPoints: [],
      edgeTreatments: [],
      placedHardware: [],
      // Phase 20: these previously survived Clear All and orphaned silently.
      mateGroups: [],
      mateConstraints: [],
      woodJoints: [],
      assemblySteps: [],
    });
    set((s) => ({
      ui: {
        ...s.ui,
        selectedMemberId: null,
        mateFaceA: null,
        mateFaceB: null,
        selectedDimensionLineId: null,
        selectedJointMarkerId: null,
        activeTool: 'select',
        radialWheelOpen: false,
      },
    }));
    void ui; // suppress unused var
  },

  updateDimensionLine: (id, patch) =>
    commitProject(set, get, {
      ...get().project,
      dimensionLines: (get().project.dimensionLines ?? []).map((l) =>
        l.id === id ? { ...l, ...patch } : l
      ),
    }),

  setRotationAxis: (axis) =>
    set((s) => ({ ui: { ...s.ui, rotationAxis: axis } })),

  setTemplatePickerOpen: (open) =>
    set((s) => ({ ui: { ...s.ui, templatePickerOpen: open } })),

  setBomPanelOpen: (open) =>
    set((s) => ({ ui: { ...s.ui, bomPanelOpen: open } })),

  clearSelection: () =>
    set((s) => ({
      ui: {
        ...s.ui,
        selectedMemberId: null,
        multiSelection: [],
        selectedDimensionLineId: null,
        selectedJointMarkerId: null,
        mateFaceA: null,
        radialWheelOpen: false,
        radialWheelAnchor: null,
      },
    })),

  loadProjectData: (members, name) => {
    set({
      project: {
        ...DEFAULT_PROJECT,
        id: crypto.randomUUID(),
        name,
        createdAt: new Date().toISOString(),
        members: members.map(migrateMember),
      },
      past: [],
      future: [],
      ui: { ...get().ui, selectedMemberId: null, activeTool: 'select', templatePickerOpen: false },
    });
  },

  addDimensionLine: (line) =>
    commitProject(set, get, {
      ...get().project,
      dimensionLines: [...(get().project.dimensionLines ?? []), line],
    }),

  removeDimensionLine: (id) =>
    commitProject(set, get, {
      ...get().project,
      dimensionLines: (get().project.dimensionLines ?? []).filter((l) => l.id !== id),
    }),

  /** Translates one or both endpoints in the anchor face's own (u,v) plane —
   * offsetUV (the perpendicular offset distance from the A-B segment) is
   * untouched since it's relative to the segment, not a standalone point.
   * When `end` is omitted, both endpoints move together, but a LOCKED
   * endpoint is always skipped even in that whole-line case. */
  nudgeDimensionLine: (id, du, dv, end) =>
    commitProject(set, get, {
      ...get().project,
      dimensionLines: (get().project.dimensionLines ?? []).map((l) => {
        if (l.id !== id) return l;
        const moveStart = end ? end === 'start' : !l.startLocked;
        const moveEnd = end ? end === 'end' : !l.endLocked;
        if (end === 'start' && l.startLocked) return l;
        if (end === 'end' && l.endLocked) return l;
        return {
          ...l,
          startUV: moveStart ? { u: l.startUV.u + du, v: l.startUV.v + dv } : l.startUV,
          endUV: moveEnd ? { u: l.endUV.u + du, v: l.endUV.v + dv } : l.endUV,
        };
      }),
    }),

  setActiveAnnotationEndpoint: (target) =>
    set((s) => ({ ui: { ...s.ui, activeAnnotationEndpoint: target } })),

  toggleDimensionEndpointLock: (id, end) =>
    commitProject(set, get, {
      ...get().project,
      dimensionLines: (get().project.dimensionLines ?? []).map((l) =>
        l.id === id
          ? end === 'start'
            ? { ...l, startLocked: !l.startLocked }
            : { ...l, endLocked: !l.endLocked }
          : l
      ),
    }),

  selectDimensionLine: (id) =>
    set((s) => ({ ui: { ...s.ui, selectedDimensionLineId: id, activeAnnotationEndpoint: null } })),

  setSelectedCenterlineId: (id) =>
    set((s) => ({ ui: { ...s.ui, selectedCenterlineId: id } })),

  setDimensionLinesVisible: (visible) =>
    set((s) => ({ ui: { ...s.ui, dimensionLinesVisible: visible } })),

  setMeasureStartPoint: (pt) =>
    set((s) => ({ ui: { ...s.ui, measureStartPoint: pt } })),

  handleDimensionLineClick: (memberId, faceId, u, v) => {
    const draft = get().ui.dimensionDraft;
    if (!draft || draft.memberId !== memberId || draft.faceId !== faceId) {
      set((s) => ({ ui: { ...s.ui, dimensionDraft: { memberId, faceId, startUV: { u, v } } } }));
      return;
    }
    if (!draft.endUV) {
      set((s) => ({ ui: { ...s.ui, dimensionDraft: { ...draft, endUV: { u, v } } } }));
      return;
    }
    // 3rd click: sets the offset side/distance and commits (or, with an
    // editingId set, overwrites the existing line instead of adding a new one
    // — the "re-drag its points/offset" edit flow the Order requires).
    // New Order 8.4 Fix 1: floor the offset's magnitude so a click landing
    // close to the measured segment (much easier to do on a short
    // cross/width measurement than a long length one) never persists as a
    // dimension line that visually sits on top of its own segment.
    const offsetUV = clampOffsetMagnitude(computePerpOffset(draft.startUV, draft.endUV, { u, v }));
    const endUV = draft.endUV;
    if (draft.editingId) {
      const id = draft.editingId;
      commitProject(set, get, {
        ...get().project,
        dimensionLines: get().project.dimensionLines.map((l) =>
          l.id === id
            ? { ...l, anchorMemberId: memberId, anchorFaceId: faceId, startUV: draft.startUV, endUV, offsetUV }
            : l
        ),
      });
      set((s) => ({ ui: { ...s.ui, dimensionDraft: null, selectedDimensionLineId: id } }));
    } else {
      const id = crypto.randomUUID();
      const line: DimensionLine = { id, anchorMemberId: memberId, anchorFaceId: faceId, startUV: draft.startUV, endUV, offsetUV };
      commitProject(set, get, { ...get().project, dimensionLines: [...get().project.dimensionLines, line] });
      set((s) => ({ ui: { ...s.ui, dimensionDraft: null, selectedDimensionLineId: id } }));
    }
  },

  cancelDimensionDraft: () => set((s) => ({ ui: { ...s.ui, dimensionDraft: null } })),

  startEditDimensionLine: (id) => {
    const line = get().project.dimensionLines.find((l) => l.id === id);
    if (!line) return;
    set((s) => ({
      ui: {
        ...s.ui,
        activeTool: 'measure',
        selectedDimensionLineId: id,
        dimensionDraft: { memberId: line.anchorMemberId, faceId: line.anchorFaceId, startUV: line.startUV, editingId: id },
      },
    }));
  },

  setDimensionLineVisibility: (id, visible) =>
    commitProject(set, get, {
      ...get().project,
      dimensionLines: get().project.dimensionLines.map((l) => (l.id === id ? { ...l, visible } : l)),
    }),

  handleReferenceLineClick: (memberId, faceId, u, v, snapped) => {
    const draft = get().ui.referenceDraft;
    if (!draft || draft.memberId !== memberId || draft.faceId !== faceId) {
      set((s) => ({ ui: { ...s.ui, referenceDraft: { memberId, faceId, start: { u, v, snapped } } } }));
      return;
    }
    // 2nd click commits (or overwrites, when editing).
    const end: ReferenceLinePoint = { u, v, snapped };
    if (draft.editingId) {
      const id = draft.editingId;
      commitProject(set, get, {
        ...get().project,
        referenceLines: get().project.referenceLines.map((l) =>
          l.id === id ? { ...l, anchorMemberId: memberId, anchorFaceId: faceId, start: draft.start, end } : l
        ),
      });
      set((s) => ({ ui: { ...s.ui, referenceDraft: null, selectedReferenceLineId: id } }));
    } else {
      const id = crypto.randomUUID();
      const line: ReferenceLine = { id, anchorMemberId: memberId, anchorFaceId: faceId, start: draft.start, end };
      commitProject(set, get, { ...get().project, referenceLines: [...get().project.referenceLines, line] });
      set((s) => ({ ui: { ...s.ui, referenceDraft: null, selectedReferenceLineId: id } }));
    }
  },

  cancelReferenceDraft: () => set((s) => ({ ui: { ...s.ui, referenceDraft: null } })),

  startEditReferenceLine: (id) => {
    const line = get().project.referenceLines.find((l) => l.id === id);
    if (!line) return;
    set((s) => ({
      ui: {
        ...s.ui,
        activeTool: 'referenceLine',
        selectedReferenceLineId: id,
        referenceDraft: { memberId: line.anchorMemberId, faceId: line.anchorFaceId, start: line.start, editingId: id },
      },
    }));
  },

  setReferenceLineVisibility: (id, visible) =>
    commitProject(set, get, {
      ...get().project,
      referenceLines: get().project.referenceLines.map((l) => (l.id === id ? { ...l, visible } : l)),
    }),

  selectReferenceLine: (id) => set((s) => ({ ui: { ...s.ui, selectedReferenceLineId: id, activeAnnotationEndpoint: null } })),

  removeReferenceLine: (id) => {
    commitProject(set, get, {
      ...get().project,
      referenceLines: get().project.referenceLines.filter((l) => l.id !== id),
    });
    if (get().ui.selectedReferenceLineId === id) {
      set((s) => ({ ui: { ...s.ui, selectedReferenceLineId: null } }));
    }
  },

  /** Translates one or both endpoints in the anchor face's own (u,v) plane.
   * `snapped` is cleared on any point actually moved — a manual nudge
   * deliberately moves it off whatever edge it was previously resolved
   * onto, so the marker should read as a free point again, not a stale
   * edge-snap. A LOCKED endpoint is always skipped, even in the
   * whole-line (`end` omitted) case. */
  nudgeReferenceLine: (id, du, dv, end) =>
    commitProject(set, get, {
      ...get().project,
      referenceLines: get().project.referenceLines.map((l) => {
        if (l.id !== id) return l;
        if (end === 'start' && l.start.locked) return l;
        if (end === 'end' && l.end.locked) return l;
        const moveStart = end ? end === 'start' : !l.start.locked;
        const moveEnd = end ? end === 'end' : !l.end.locked;
        return {
          ...l,
          start: moveStart ? { ...l.start, u: l.start.u + du, v: l.start.v + dv, snapped: false } : l.start,
          end: moveEnd ? { ...l.end, u: l.end.u + du, v: l.end.v + dv, snapped: false } : l.end,
        };
      }),
    }),

  toggleReferenceEndpointLock: (id, end) =>
    commitProject(set, get, {
      ...get().project,
      referenceLines: get().project.referenceLines.map((l) =>
        l.id === id
          ? end === 'start'
            ? { ...l, start: { ...l.start, locked: !l.start.locked } }
            : { ...l, end: { ...l.end, locked: !l.end.locked } }
          : l
      ),
    }),

  newProject: () => {
    set({
      project: {
        ...DEFAULT_PROJECT,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      },
      past: [],
      future: [],
      ui: {
        ...get().ui,
        selectedMemberId: null,
        isolatedMemberId: null,
        trimBoundaryId: null,
        mateFaceA: null,
        mateFaceB: null,
        mateHoverFace: null,
        mateGridOffset: null,
        quickDimensionsOpen: false,
        radialWheelOpen: false,
        fastenerPlacementMode: false,
        attachmentPointPickA: null,
        activeTool: 'select',
      },
    });
  },

  setRightPanelTab: (tab) =>
    set((s) => ({ ui: { ...s.ui, rightPanelTab: tab } })),

  updateProjectMeta: (patch) =>
    commitProject(set, get, { ...get().project, ...patch }),

  // Phase 18 FIX 3: Ctrl+S only downloads directly if the project already has
  // a real name. An unnamed project opens the name-prompt modal instead — the
  // modal calls saveProjectAs() once the user submits a name, which both
  // renames the project AND performs the download in one step.
  saveProjectToFile: () => {
    const { project } = get();
    if (!project.name.trim() || project.name === DEFAULT_PROJECT.name) {
      set((s) => ({ ui: { ...s.ui, saveNameModalOpen: true } }));
      return;
    }
    downloadWcadFile(project);
    get().addRecentFile(project.name);
  },

  saveProjectAs: (name) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const next = { ...get().project, name: trimmed };
    commitProject(set, get, next);
    downloadWcadFile(next);
    get().addRecentFile(trimmed);
    set((s) => ({ ui: { ...s.ui, saveNameModalOpen: false } }));
  },

  setSaveNameModalOpen: (open) =>
    set((s) => ({ ui: { ...s.ui, saveNameModalOpen: open } })),

  // ─── Phase 20: 3-Mode workspace system ────────────────────────────────

  setWorkspaceMode: (mode) =>
    set((s) => {
      if (s.ui.workspaceMode === mode) return s;
      return {
        ui: {
          ...s.ui,
          workspaceMode: mode,
          // Orphan-cleanup sequence: every half-finished pick is cleared, but
          // the SELECTION survives the mode switch (consistent-Esc rule).
          activeTool: isToolLegalInMode(s.ui.activeTool, mode) ? s.ui.activeTool : 'select',
          rightPanelTab: fixPanelTab(s.ui.rightPanelTab, mode),
          pendingInteraction: null,
          mateFaceA: null,
          mateFaceB: null,
          matePickTarget: 'A',
          mateHoverFace: null,
          mateGridOffset: null,
          measureStartPoint: null,
          trimBoundaryId: null,
          orbitControlsEnabled: true,
          radialWheelOpen: false,
          radialWheelAnchor: null,
          fastenerPlacementMode: false,
          fastenerPlacementMateId: null,
          boxSelectRect: null,
          boxSelectPending: null,
          crossCutPreviewPosition: null,
          ripCutPreviewPosition: null,
          ...templateTransitionPatch(s.ui.workspaceMode, mode),
        },
      };
    }),

  setPendingInteraction: (p) =>
    set((s) => ({ ui: { ...s.ui, pendingInteraction: p } })),

  cancelActiveAction: () =>
    set((s) => ({
      ui: {
        ...s.ui,
        activeTool: 'select',
        pendingInteraction: null,
        transformGizmoActive: false,
        orbitControlsEnabled: true,
        trimBoundaryId: null,
        mateFaceA: null,
        mateFaceB: null,
        matePickTarget: 'A',
        mateHoverFace: null,
        mateGridOffset: null,
        measureStartPoint: null,
        fastenerPlacementMode: false,
        fastenerPlacementMateId: null,
        radialWheelOpen: false,
        radialWheelAnchor: null,
        attachmentPointPickA: null,
        boxSelectRect: null,
        boxSelectPending: null,
        quickJoinMiterAxis: null,
        crossCutPreviewPosition: null,
        ripCutPreviewPosition: null,
        drawBoardCancelNonce: s.ui.drawBoardCancelNonce + 1,
        contextMenu: { ...s.ui.contextMenu, open: false },
      },
    })),

  applyTrimExtend: (adjustMemberId) => {
    const { ui, project } = get();
    const p = ui.pendingInteraction;
    if (!p || p.kind !== 'trimExtend') return;
    if (adjustMemberId === p.targetMemberId) return;
    const target = project.members.find((m) => m.id === p.targetMemberId);
    const adjust = project.members.find((m) => m.id === adjustMemberId);
    if (!target || !adjust) {
      set((s) => ({ ui: { ...s.ui, pendingInteraction: null } }));
      return;
    }
    const patch = snapLengthToFacePlane(adjust, target, p.targetFaceId);
    // Clear the pending pick either way so the user can start a fresh pair.
    set((s) => ({ ui: { ...s.ui, pendingInteraction: null } }));
    if (patch) {
      // Single atomic commitProject → one undo step.
      get().updateMember(adjustMemberId, patch);
    }
  },

  applyWoodJoint: (memberBId, faceBId) => {
    const { ui, project } = get();
    const p = ui.pendingInteraction;
    if (!p || p.kind !== 'joinery' || p.step !== 'pickFaceB') return;
    if (memberBId === p.memberAId) return;
    const a = project.members.find((m) => m.id === p.memberAId);
    const b = project.members.find((m) => m.id === memberBId);
    if (!a || !b) {
      set((s) => ({ ui: { ...s.ui, pendingInteraction: null } }));
      return;
    }

    const joint: WoodJoint = {
      id: crypto.randomUUID(),
      type: p.jointType,
      memberAId: a.id,
      faceAId: p.faceAId,
      memberBId: b.id,
      faceBId,
      offsetA: p.offsetA,
      params: {},
    };
    const seat = jointSeatDepth(joint, a);

    // Seat board B: flush mate on the picked faces, then embed by the seat
    // depth along faceA's inward normal so tails/tenon/end actually enter A.
    const flushPatch = computeMateTransform(a, p.faceAId, b, faceBId, p.offsetA, [0, 0, 0]);
    const nA = getFaceNormal(a, p.faceAId);
    const seatedPos: [number, number, number] = [
      (flushPatch.position as [number, number, number])[0] - nA.x * seat,
      (flushPatch.position as [number, number, number])[1] - nA.y * seat,
      (flushPatch.position as [number, number, number])[2] - nA.z * seat,
    ];

    // Legacy mate bookkeeping (join method, assembly steps, markers) + the
    // real standing constraint — same pattern as applyMate, one atomic commit.
    const mate: MemberMate = {
      id: joint.id,
      memberAId: a.id,
      memberBId: b.id,
      faceA: p.faceAId,
      faceB: faceBId,
      joinMethod: p.jointType === 'mortiseTenon' ? 'Mortise & Tenon' : 'Glue',
      offsetA: p.offsetA,
    };
    const newConstraint: EngineMateConstraint = {
      id: joint.id,
      solidAId: a.id,
      faceAId: p.faceAId,
      solidBId: b.id,
      faceBId,
      type: 'offset',
      // z < 0 embeds B into A along faceA's normal (Engine.faceWorldCenter).
      offset: { x: p.offsetA[0], y: p.offsetA[1], z: -seat },
    };

    // Merge mate groups exactly like applyMate does.
    const existingGroups = project.mateGroups ?? [];
    const groupA = existingGroups.find((g) => g.memberIds.includes(a.id));
    const groupB = existingGroups.find((g) => g.memberIds.includes(b.id));
    let newGroups: MateGroup[];
    if (groupA && groupB && groupA.id !== groupB.id) {
      const merged: MateGroup = {
        id: groupA.id,
        memberIds: [...new Set([...groupA.memberIds, ...groupB.memberIds])],
      };
      newGroups = existingGroups
        .filter((g) => g.id !== groupA.id && g.id !== groupB.id)
        .concat(merged);
    } else if (groupA) {
      newGroups = existingGroups.map((g) =>
        g.id === groupA.id ? { ...g, memberIds: [...new Set([...g.memberIds, b.id])] } : g
      );
    } else if (groupB) {
      newGroups = existingGroups.map((g) =>
        g.id === groupB.id ? { ...g, memberIds: [...new Set([...g.memberIds, a.id])] } : g
      );
    } else {
      newGroups = [...existingGroups, { id: crypto.randomUUID(), memberIds: [a.id, b.id] }];
    }

    commitProject(set, get, {
      ...project,
      members: project.members.map((m) =>
        m.id === b.id
          ? migrateMember({ ...m, position: seatedPos, rotation: flushPatch.rotation as [number, number, number] })
          : m
      ),
      mates: [...project.mates, mate],
      mateGroups: newGroups,
      mateConstraints: [...(project.mateConstraints ?? []), newConstraint],
      woodJoints: [...(project.woodJoints ?? []), joint],
    });
    set((s) => ({
      ui: {
        ...s.ui,
        // Back to step 1 of the same joint type so the user can chain joints.
        pendingInteraction: { kind: 'joinery', step: 'pickFaceA', jointType: p.jointType },
        selectedMateId: mate.id,
      },
    }));
  },

  removeWoodJoint: (jointId) => {
    const p = get().project;
    commitProject(set, get, {
      ...p,
      woodJoints: (p.woodJoints ?? []).filter((j) => j.id !== jointId),
      mates: p.mates.filter((m) => m.id !== jointId),
      mateConstraints: (p.mateConstraints ?? []).filter((c) => c.id !== jointId),
      fasteners: p.fasteners.filter((f) => f.mateId !== jointId),
    });
  },

  applyFastenerToMember: (memberId) => {
    const { ui, project } = get();
    const p = ui.pendingInteraction;
    if (!p || p.kind !== 'fastener') return;
    // Fasteners decorate an existing joint: find a mate involving this board.
    const mate =
      project.mates.find((m) => m.id === ui.selectedMateId &&
        (m.memberAId === memberId || m.memberBId === memberId)) ??
      project.mates.find((m) => m.memberAId === memberId || m.memberBId === memberId);
    if (!mate) return; // hint bar explains boards must be joined first
    set((s) => ({ ui: { ...s.ui, pendingInteraction: null } }));
    get().setMateJoinMethod(mate.id, p.fastenerType);
  },

  addRecentFile: (name) => {
    const entry = { name, savedAt: new Date().toISOString() };
    const rest = get().recentFiles.filter((f) => f.name !== name);
    set({ recentFiles: [entry, ...rest].slice(0, 3) });
  },

  restoreProject: (raw) => {
    const project = migrateProject(raw);
    set((s) => ({
      project,
      past: [],
      future: [],
      ui: {
        ...s.ui,
        // Fully reset interaction state — a freshly-opened project must never
        // inherit a selection, half-picked mate, or preview from the old one.
        selectedMemberId: null,
        multiSelection: [],
        activeTool: 'select',
        pendingInteraction: null,
        transformGizmoActive: false,
        isolatedMemberId: null,
        trimBoundaryId: null,
        mateFaceA: null,
        mateFaceB: null,
        matePickTarget: 'A',
        mateHoverFace: null,
        mateGridOffset: null,
        fastenerPlacementMode: false,
        fastenerPlacementMateId: null,
        selectedFastenerId: null,
        selectedMateId: null,
        selectedDimensionLineId: null,
        selectedCenterlineId: null,
        selectedJointMarkerId: null,
        measureStartPoint: null,
        crossCutPreviewPosition: null,
        ripCutPreviewPosition: null,
        radialWheelOpen: false,
        radialWheelAnchor: null,
        attachmentPointPickA: null,
        edgeToolMemberId: null,
        orbitControlsEnabled: true,
        boxSelectRect: null,
        boxSelectPending: null,
      },
    }));
  },

  loadProjectFromFile: async (file) => {
    try {
      const text = await file.text();
      const parsed = parseWcad(text);
      get().restoreProject(parsed);
    } catch (err) {
      console.error('[Open] failed to load .wcad file:', err);
      window.alert(
        "Sorry — that file couldn't be opened. It may not be a DoveDesign project file (.wcad), or it may be damaged."
      );
    }
  },

  addCenterlineMarker: (memberId, marker) =>
    commitProject(set, get, {
      ...get().project,
      members: get().project.members.map((m) =>
        m.id === memberId
          ? { ...m, centerlineMarkers: [...(m.centerlineMarkers ?? []), marker] }
          : m
      ),
    }),

  removeCenterlineMarker: (memberId, markerId) =>
    commitProject(set, get, {
      ...get().project,
      members: get().project.members.map((m) =>
        m.id === memberId
          ? { ...m, centerlineMarkers: (m.centerlineMarkers ?? []).filter((c) => c.id !== markerId) }
          : m
      ),
    }),

  clearCenterlineMarkers: (memberId) =>
    commitProject(set, get, {
      ...get().project,
      members: get().project.members.map((m) =>
        m.id === memberId ? { ...m, centerlineMarkers: [] } : m
      ),
    }),

  setDrawMaterial: (species) => {
    const mat = getMaterialByName(species);
    set((s) => ({
      ui: {
        ...s.ui,
        selectedDrawMaterial: species,
        drawDefaults: {
          ...s.ui.drawDefaults,
          species,
          category: mat?.category ?? s.ui.drawDefaults.category,
          color: mat?.color ?? s.ui.drawDefaults.color,
        },
      },
    }));
  },

  setDrawNominalSize: (size) => {
    const dims = size === 'Custom' ? null : NOMINAL_DIMENSIONS[size];
    set((s) => ({
      ui: {
        ...s.ui,
        drawDefaults: {
          ...s.ui.drawDefaults,
          nominalSize: size,
          thickness: dims?.thickness ?? s.ui.drawDefaults.thickness,
          width: dims?.width ?? s.ui.drawDefaults.width,
        },
      },
    }));
  },

  setTemplateMaterial: (species) =>
    set((s) => ({ ui: { ...s.ui, templateMaterial: species } })),

  setTemplateDrawTool: (tool) =>
    // Switching draw tools resets the Arc-specific staged-click state (Fix 10)
    // so a half-placed via point from a previous Arc segment never leaks into
    // Line/Freehand or a freshly re-armed Arc.
    set((s) => ({ ui: { ...s.ui, templateDrawTool: tool, templateArcStage: 'start', templateArcFlipped: false } })),

  addTemplateEdge: (edge) => {
    // Routed through commitProject (same past/future stack Move/Rotate/
    // Insert already use) instead of a bare set() — this is what makes a
    // committed point/segment an undo step at all.
    commitProject(set, get, get().project, [...get().ui.templateEdges, edge]);
  },

  addTemplateShape: (shape) => {
    // Same commitProject-backed history pattern as addTemplateEdge —
    // closing a loop is one undo step, alongside whatever edge commit(s) it
    // bundles with (TemplateDrawTools.tsx commits the closing edge and the
    // shape as two calls in the same user action — undo just walks back one
    // step further to also remove the closing edge).
    commitProject(set, get, get().project, undefined, [...get().ui.templateShapes, shape]);
  },

  updateTemplateShapeSpecies: (id, species) => {
    const nextShapes = get().ui.templateShapes.map((s) => (s.id === id ? { ...s, species } : s));
    commitProject(set, get, get().project, undefined, nextShapes);
  },

  setSelectedTemplateShapeId: (id) =>
    set((s) => ({ ui: { ...s.ui, selectedTemplateShapeId: id } })),

  setTemplateExtrudeThickness: (value) =>
    set((s) => ({ ui: { ...s.ui, templateExtrudeThickness: value } })),

  setTemplateArcStage: (stage) =>
    set((s) => ({ ui: { ...s.ui, templateArcStage: stage } })),

  setTemplateArcFlipped: (flipped) =>
    set((s) => ({ ui: { ...s.ui, templateArcFlipped: flipped } })),

  /**
   * Data Flow Pipeline: Extrude Template Shape -> Model Board (New Order 7 Part 4)
   *
   * INPUT: a closed TemplateShape (edgeIds + species) and a user-entered
   *   thickness (inches).
   *
   * CALCULATION: buildLoopPolygon (templateSketchMath.ts, pure) re-derives the
   *   shape's current (u,v) boundary fresh from ui.templateEdges — never a
   *   cached copy. The polygon's centroid becomes the new board's placement
   *   (u,v map directly to world x,z on the ground plane), and every point is
   *   re-expressed relative to that centroid as the board's LOCAL footprint
   *   (WoodMember.polygonPoints) — CAD_MANIFESTO.md Law 1: the board is these
   *   parameters, never a stored mesh.
   *
   * OUTPUT: one new WoodMember (shapeType: 'customPolygon') via the existing
   *   addMember-equivalent commit path (bundled into one history entry with
   *   removing the consumed shape/edges from Template state), so extruding is
   *   a single undo step.
   *
   * RENDER: BoardMesh.tsx's existing geometry pipeline (Engine.ts) builds a
   *   proper extruded-prism Face/Wire/Edge topology from polygonPoints +
   *   thickness, then the SAME lit meshStandardMaterial every other board
   *   already uses — the unlit-to-lit switch the Order asks for falls out of
   *   this board now being an ordinary WoodMember, no special-case code.
   *
   * FOLLOWS-BOARD CHECK: yes — once placed, this board is indistinguishable
   *   from an Insert-created one; Move/Rotate/Select all read member.position/
   *   rotation exactly as they already do for every other board.
   */
  extrudeTemplateShape: (shapeId, thicknessIn) => {
    const { ui, project } = get();
    const shape = ui.templateShapes.find((s) => s.id === shapeId);
    if (!shape) return null;
    const polygon = buildLoopPolygon(shape.edgeIds, ui.templateEdges);
    if (polygon.length < 3) return null;

    const thickness = Math.max(0.0625, thicknessIn);
    const centroidU = polygon.reduce((sum, p) => sum + p.u, 0) / polygon.length;
    const centroidV = polygon.reduce((sum, p) => sum + p.v, 0) / polygon.length;
    const polygonPoints: [number, number][] = polygon.map((p) => [p.u - centroidU, p.v - centroidV]);
    const us = polygon.map((p) => p.u);
    const vs = polygon.map((p) => p.v);
    const boundsLength = Math.max(0.25, Math.max(...us) - Math.min(...us));
    const boundsWidth = Math.max(0.25, Math.max(...vs) - Math.min(...vs));

    const mat = getMaterialByName(shape.species);
    const id = crypto.randomUUID();
    const newMember: WoodMember = {
      id,
      label: `Template ${Date.now().toString(36).slice(-4)}`,
      category: mat?.category ?? 'Softwood',
      species: shape.species,
      nominalSize: 'Custom',
      thickness,
      width: boundsWidth,
      length: boundsLength,
      position: [centroidU, thickness / 2, centroidV],
      rotation: [0, 0, 0],
      costPerBoardFoot: mat?.defaultPrice ?? 3.5,
      color: mat?.color ?? '#d4a96a',
      isSelected: false,
      cuts: [],
      orientation: 'flat',
      loadLbs: 0,
      materialKind: mat?.kind ?? 'dimensional',
      shapeType: 'customPolygon',
      polygonPoints,
    };

    const nextTemplateEdges = ui.templateEdges.filter((e) => !shape.edgeIds.includes(e.id));
    const nextTemplateShapes = ui.templateShapes.filter((s) => s.id !== shapeId);
    const nextProject = { ...project, members: [...project.members, migrateMember(newMember)] };
    commitProject(set, get, nextProject, nextTemplateEdges, nextTemplateShapes);

    get().setWorkspaceMode('model');
    get().selectMember(id);
    return id;
  },

  setFinishPanelOpen: (open) =>
    set((s) => ({ ui: { ...s.ui, finishPanelOpen: open } })),

  updateMemberFinish: (memberId, finish) =>
    commitProject(set, get, {
      ...get().project,
      members: get().project.members.map((m) =>
        m.id === memberId ? { ...m, finish } : m
      ),
    }),
    }),
    {
      name: 'dovedesign-autosave-v1',
      // Phase 18 FIX 3: `project` + `savedAt` are still written to localStorage
      // on every change — this keeps working purely as a crash-recovery
      // backup. It is deliberately NOT restored into `project` on startup
      // (see `merge` below) — the app must always open to a blank canvas.
      partialize: (state) => ({
        project: state.project,
        savedAt: new Date().toISOString(),
        recentFiles: state.recentFiles,
      }),
      merge: (persisted, current) => {
        const p = persisted as
          | { project?: Project; savedAt?: string; recentFiles?: { name: string; savedAt: string }[] }
          | undefined;
        const hasWork = !!p?.project && Array.isArray(p.project.members) && p.project.members.length > 0;
        return {
          ...current,
          project: current.project,
          recoveryAvailable: hasWork,
          recoveryTimestamp: hasWork ? (p!.savedAt ?? null) : null,
          recoverableProjectSnapshot: hasWork ? migrateProject(p!.project as Project) : null,
          recentFiles: p?.recentFiles ?? current.recentFiles,
        };
      },
    }
  )
);
