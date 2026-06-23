import { create } from 'zustand';
import type {
  Project, WoodMember, HardwareItem, FinishItem,
  UIState, ActiveTool, StructuralAnalysis,
} from './types';

// ─── Default project loaded on first launch ────────────────────────────────

const DEFAULT_PROJECT: Project = {
  id: crypto.randomUUID(),
  name: 'Untitled Project',
  description: '',
  createdAt: new Date().toISOString(),
  members: [],
  hardware: [],
  finishes: [],
  structural: {},
};

// ─── Store shape ───────────────────────────────────────────────────────────

interface AppStore {
  project: Project;
  ui: UIState;

  // Member actions
  addMember:     (member: WoodMember) => void;
  updateMember:  (id: string, patch: Partial<WoodMember>) => void;
  removeMember:  (id: string) => void;

  // Hardware / Finish actions
  addHardware:   (item: HardwareItem) => void;
  removeHardware:(id: string) => void;
  addFinish:     (item: FinishItem) => void;
  removeFinish:  (id: string) => void;

  // Physics hook
  updateStructural: (patch: Partial<StructuralAnalysis>) => void;

  // UI actions
  selectMember:     (id: string | null) => void;
  setActiveTool:    (tool: ActiveTool) => void;
  updateProjectMeta:(patch: { name?: string; description?: string }) => void;

  // Persistence: local JSON file save/load
  saveProjectToFile:   () => void;
  loadProjectFromFile: (file: File) => Promise<void>;
}

// ─── Store implementation ──────────────────────────────────────────────────

export const useAppStore = create<AppStore>((set, get) => ({
  project: DEFAULT_PROJECT,
  ui: {
    activeTool: 'select',
    selectedMemberId: null,
  },

  // ── Members ──────────────────────────────────────────────────────────────
  addMember: (member) =>
    set((s) => ({
      project: { ...s.project, members: [...s.project.members, member] },
    })),

  updateMember: (id, patch) =>
    set((s) => ({
      project: {
        ...s.project,
        members: s.project.members.map((m) => (m.id === id ? { ...m, ...patch } : m)),
      },
    })),

  removeMember: (id) =>
    set((s) => ({
      project: {
        ...s.project,
        members: s.project.members.filter((m) => m.id !== id),
      },
      ui: {
        ...s.ui,
        selectedMemberId: s.ui.selectedMemberId === id ? null : s.ui.selectedMemberId,
      },
    })),

  // ── Hardware ─────────────────────────────────────────────────────────────
  addHardware: (item) =>
    set((s) => ({
      project: { ...s.project, hardware: [...s.project.hardware, item] },
    })),

  removeHardware: (id) =>
    set((s) => ({
      project: {
        ...s.project,
        hardware: s.project.hardware.filter((h) => h.id !== id),
      },
    })),

  // ── Finishes ─────────────────────────────────────────────────────────────
  addFinish: (item) =>
    set((s) => ({
      project: { ...s.project, finishes: [...s.project.finishes, item] },
    })),

  removeFinish: (id) =>
    set((s) => ({
      project: {
        ...s.project,
        finishes: s.project.finishes.filter((f) => f.id !== id),
      },
    })),

  // ── Physics ───────────────────────────────────────────────────────────────
  updateStructural: (patch) =>
    set((s) => ({
      project: {
        ...s.project,
        structural: { ...s.project.structural, ...patch },
      },
    })),

  // ── UI ────────────────────────────────────────────────────────────────────
  selectMember:  (id)   => set((s) => ({ ui: { ...s.ui, selectedMemberId: id } })),
  setActiveTool: (tool) => set((s) => ({ ui: { ...s.ui, activeTool: tool } })),
  updateProjectMeta: (patch) =>
    set((s) => ({ project: { ...s.project, ...patch } })),

  // ── Persistence ───────────────────────────────────────────────────────────

  saveProjectToFile: () => {
    const { project } = get();
    const payload = JSON.stringify(project, null, 2);
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name.replace(/\s+/g, '_')}.woodproject`;
    a.click();
    URL.revokeObjectURL(url);
  },

  loadProjectFromFile: async (file) => {
    const text = await file.text();
    const parsed: Project = JSON.parse(text);
    if (!parsed.id || !Array.isArray(parsed.members)) {
      throw new Error('Invalid .woodproject file format.');
    }
    set({ project: parsed });
  },
}));
