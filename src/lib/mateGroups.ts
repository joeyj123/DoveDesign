import { useAppStore } from '../store';

/**
 * Expands a set of selected board ids with every OTHER board mated into the
 * same mateGroup (store.ts's applyMate creates/merges these — see
 * MatePanel.tsx) — shared by MoveGizmo.tsx's drag and App.tsx's arrow-key
 * nudge, so a mated assembly moves together through EITHER path, not just
 * one. A non-reactive getState() read is correct here since this only runs
 * once per drag-start/keypress, never on every render.
 */
export function expandWithMateGroups(ids: string[]): string[] {
  const { getMateGroupForMember } = useAppStore.getState();
  const expanded = new Set(ids);
  for (const id of ids) {
    const group = getMateGroupForMember(id);
    group?.memberIds.forEach((m) => expanded.add(m));
  }
  return Array.from(expanded);
}
