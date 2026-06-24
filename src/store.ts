import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Project, WoodMember, HardwareItem, FinishItem,
  UIState, ActiveTool, StructuralAnalysis, CutOperation,
  EstimatingSettings, MaterialPriceEntry, TransformMode,
  MemberMate,
} from './types';
import { trimToBoundary, extendToBoundary } from './lib/trimExtend';
import { inferMaterialKind, getMaterialByName } from './lib/materials';
import { computeMateTransform } from './lib/mating';
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
  };
}

function migrateProject(p: Project): Project {
  return {
    ...p,
    estimating: p.estimating ?? { ...DEFAULT_ESTIMATING },
    mates: p.mates ?? [],
    members: p.members.map(migrateMember),
  };
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
  applyMate: () => void;
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
    commitProject(set, get, {
      ...get().project,
      members: get().project.members.filter((m) => m.id !== id),
    });
    set((s) => ({
      ui: {
        ...s.ui,
        selectedMemberId: s.ui.selectedMemberId === id ? null : s.ui.selectedMemberId,
        trimBoundaryId: s.ui.trimBoundaryId === id ? null : s.ui.trimBoundaryId,
        isolatedMemberId: s.ui.isolatedMemberId === id ? null : s.ui.isolatedMemberId,
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

  selectMember: (id) =>
    set((s) => ({ ui: { ...s.ui, selectedMemberId: id } })),

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
    if (!mateFaceA || !mateFaceB) return;
    const a = get().project.members.find((m) => m.id === mateFaceA.memberId);
    const b = get().project.members.find((m) => m.id === mateFaceB.memberId);
    if (!a || !b) return;

    const patch = computeMateTransform(a, mateFaceA.face, b, mateFaceB.face);
    const mate: MemberMate = {
      id: crypto.randomUUID(),
      memberAId: a.id,
      memberBId: b.id,
      faceA: mateFaceA.face,
      faceB: mateFaceB.face,
    };

    commitProject(set, get, {
      ...get().project,
      members: get().project.members.map((m) =>
        m.id === b.id ? migrateMember({ ...m, ...patch }) : m
      ),
      mates: [...get().project.mates, mate],
    });
    set((s) => ({
      ui: { ...s.ui, mateFaceA: null, mateFaceB: null, activeTool: 'select' },
    }));
  },

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
