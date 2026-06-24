import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Project, WoodMember, HardwareItem, FinishItem,
  UIState, ActiveTool, StructuralAnalysis, CutOperation,
  EstimatingSettings, MaterialPriceEntry, TransformMode,
  MemberMate, AttachmentPoint, Fastener, JoinMethod,
  DesignSuggestion, EdgeTreatment, PlacedHardwareItem, AssemblyStep,
  HardwareLibraryId, DisplayMode, ViewportMode,
} from './types';
import { trimToBoundary, extendToBoundary } from './lib/trimExtend';
import { inferMaterialKind, getMaterialByName } from './lib/materials';
import { computeMateTransform, computePointMateTransform } from './lib/mating';
import { serializeWcad, parseWcad } from './lib/wcad';

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
};

const DEFAULT_UI: UIState = {
  activeTool: 'select',
  selectedMemberId: null,
  rightPanelTab: 'inspector',
  transformMode: 'translate',
  trimBoundaryId: null,
  isolatedMemberId: null,
  orbitControlsEnabled: true,
  cameraResetNonce: 0,
  angleSnapEnabled: true,
  angleSnapIncrement: 15,
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
  mateHoverFace: null,
  mateGridOffset: null,
  fastenerPlacementMode: false,
  fastenerPlacementMateId: null,
  selectedFastenerId: null,
  selectedMateId: null,
  pepePanelOpen: false,
  pepeTab: 'suggestions',
  pepeExpression: 'neutral',
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
  drawDefaults: {
    species: 'Southern Yellow Pine',
    thickness: 1.5,
    category: 'Softwood',
    color: '#d4a96a',
  },
};

const MAX_HISTORY = 100;

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
  };
}

function migrateProject(p: Project): Project {
  return {
    ...p,
    estimating: p.estimating ?? { ...DEFAULT_ESTIMATING },
    mates: (p.mates ?? []).map(migrateMate),
    attachmentPoints: p.attachmentPoints ?? [],
    fasteners: p.fasteners ?? [],
    edgeTreatments: p.edgeTreatments ?? [],
    placedHardware: p.placedHardware ?? [],
    assemblySteps: p.assemblySteps ?? [],
    members: p.members.map(migrateMember),
  };
}

function migrateMate(m: MemberMate): MemberMate {
  return { ...m, joinMethod: m.joinMethod ?? 'Unset' };
}

interface AppStore {
  project: Project;
  ui: UIState;
  past: Project[];
  future: Project[];

  // History
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  // Member actions
  addMember:     (member: WoodMember) => void;
  updateMember:  (id: string, patch: Partial<WoodMember>, skipHistory?: boolean) => void;
  removeMember:  (id: string) => void;
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
  selectMember:     (id: string | null) => void;
  setActiveTool:    (tool: ActiveTool) => void;
  setTransformMode: (mode: TransformMode) => void;
  setTrimBoundary:  (id: string | null) => void;
  setOrbitControlsEnabled: (enabled: boolean) => void;
  resetCamera: () => void;
  setAngleSnapEnabled: (enabled: boolean) => void;
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
  applyMate: () => string | null;
  setMemberScreenBounds: (bounds: UIState['memberScreenBounds']) => void;
  setQuickDimensionsOpen: (open: boolean) => void;
  setRadialWheelOpen: (open: boolean, mode?: UIState['radialWheelMode']) => void;
  setMateHoverFace: (face: UIState['mateHoverFace']) => void;
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
  newProject: () => void;
  setRightPanelTab: (tab: UIState['rightPanelTab']) => void;
  updateProjectMeta:(patch: { name?: string; description?: string }) => void;

  // Persistence
  saveProjectToFile:   () => void;
  loadProjectFromFile: (file: File) => Promise<void>;
}

function commitProject(
  set: (partial: Partial<AppStore> | ((s: AppStore) => Partial<AppStore>)) => void,
  get: () => AppStore,
  next: Project
) {
  const { project, past } = get();
  set({
    past: [...past, project].slice(-MAX_HISTORY),
    project: next,
    future: [],
  });
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
  project: DEFAULT_PROJECT,
  ui: DEFAULT_UI,
  past: [],
  future: [],

  undo: () => {
    const { past, project, future } = get();
    if (past.length === 0) return;
    const prev = past[past.length - 1];
    set({
      past: past.slice(0, -1),
      project: prev,
      future: [project, ...future],
    });
  },

  redo: () => {
    const { past, project, future } = get();
    if (future.length === 0) return;
    const next = future[0];
    set({
      past: [...past, project],
      project: next,
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

  duplicateMember: (id) => {
    const m = get().project.members.find((mem) => mem.id === id);
    if (!m) return;
    get().addMember({
      ...m,
      id: crypto.randomUUID(),
      label: `${m.label} (copy)`,
      position: [m.position[0] + 6, m.position[1], m.position[2] + 6],
      cuts: [...m.cuts.map((c) => ({ ...c, id: crypto.randomUUID() }))],
    });
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

  selectMember: (id) => {
    const { ui } = get();
    if (ui.dimensionEditPending && ui.selectedMemberId) {
      get().commitDimensionEdit();
    }
    set((s) => ({
      ui: {
        ...s.ui,
        selectedMemberId: id,
        quickDimensionsOpen: id !== null,
        radialWheelOpen: id !== null,
        radialWheelMode: 'full',
        suggestionHighlightIds: [],
        ...(id === null
          ? {
              quickDimensionsOpen: false,
              radialWheelOpen: false,
              mateHoverFace: null,
            }
          : {}),
      },
    }));
  },

  setActiveTool: (tool) =>
    set((s) => ({ ui: { ...s.ui, activeTool: tool } })),

  setTransformMode: (mode) =>
    set((s) => ({ ui: { ...s.ui, transformMode: mode } })),

  setTrimBoundary: (id) =>
    set((s) => ({ ui: { ...s.ui, trimBoundaryId: id } })),

  setOrbitControlsEnabled: (enabled) =>
    set((s) => ({ ui: { ...s.ui, orbitControlsEnabled: enabled } })),

  resetCamera: () =>
    set((s) => ({ ui: { ...s.ui, cameraResetNonce: s.ui.cameraResetNonce + 1 } })),

  setAngleSnapEnabled: (enabled) =>
    set((s) => ({ ui: { ...s.ui, angleSnapEnabled: enabled } })),

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
        trimBoundaryId: null,
        mateFaceA: null,
        mateFaceB: null,
        matePickTarget: 'A',
        mateHoverFace: null,
        mateGridOffset: null,
        fastenerPlacementMode: false,
        fastenerPlacementMateId: null,
        radialWheelOpen: false,
        attachmentPointPickA: null,
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

    commitProject(set, get, {
      ...get().project,
      members: get().project.members.map((m) =>
        m.id === b.id ? migrateMember({ ...m, ...patch }) : m
      ),
      mates: [...get().project.mates, mate],
    });
    set((s) => ({
      ui: {
        ...s.ui,
        mateFaceA: null,
        mateFaceB: null,
        mateGridOffset: null,
        mateHoverFace: null,
        activeTool: 'select',
        radialWheelOpen: true,
        radialWheelMode: 'joinOnly',
        selectedMateId: mate.id,
      },
    }));

    if (get().ui.viewportMode === 'assembly') {
      const labelA = a.label;
      const labelB = b.label;
      const steps = get().project.assemblySteps;
      commitProject(set, get, {
        ...get().project,
        assemblySteps: [
          ...steps,
          {
            stepIndex: steps.length + 1,
            mateId: mate.id,
            description: `Mate ${labelB} to ${labelA} (${mate.faceA} ↔ ${mate.faceB})`,
          },
        ],
      });
    }

    return mate.id;
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
      },
    })),

  setMateHoverFace: (face) =>
    set((s) => ({ ui: { ...s.ui, mateHoverFace: face } })),

  setMateGridOffset: (offset) =>
    set((s) => ({ ui: { ...s.ui, mateGridOffset: offset } })),

  setMateJoinMethod: (mateId, method) => {
    commitProject(set, get, {
      ...get().project,
      mates: get().project.mates.map((m) =>
        m.id === mateId ? { ...m, joinMethod: method } : m
      ),
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
        ui: { ...s.ui, radialWheelOpen: false },
      }));
    }
  },

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
    if (mode === 'assembly') {
      const { members } = get().project;
      const spacing = 8;
      const updated = members.map((m, i) => ({
        ...m,
        position: [i * spacing, m.thickness / 2, 0] as [number, number, number],
        rotation: [0, 0, 0] as [number, number, number],
      }));
      commitProject(set, get, { ...get().project, members: updated });
    }
    set((s) => ({ ui: { ...s.ui, viewportMode: mode, assemblyGuideOpen: mode === 'assembly' } }));
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

  setPolygonDrawPoints: (pts) =>
    set((s) => ({ ui: { ...s.ui, polygonDrawPoints: pts } })),

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

  saveProjectToFile: () => {
    const { project } = get();
    const payload = serializeWcad(project);
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name.replace(/\s+/g, '_')}.wcad`;
    a.click();
    URL.revokeObjectURL(url);
  },

  loadProjectFromFile: async (file) => {
    const text = await file.text();
    const parsed = parseWcad(text);
    set({
      project: migrateProject(parsed),
      past: [],
      future: [],
    });
  },
    }),
    {
      name: 'dovedesign-autosave-v1',
      partialize: (state) => ({ project: state.project }),
      merge: (persisted, current) => ({
        ...current,
        project: migrateProject(
          (persisted as { project?: Project })?.project ?? current.project
        ),
      }),
    }
  )
);
