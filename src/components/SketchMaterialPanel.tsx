import { useAppStore } from '../store';
import SpeciesSelect from './SpeciesSelect';

/**
 * Data Flow Pipeline: Sketch Species Selector (New Order 3.1, Fix 5)
 *
 * INPUT: ui.drawDefaults.species — the same shared default Insert reads/
 *   writes (see InsertPanel.tsx and store.setDrawMaterial()).
 *
 * CALCULATION: none in this file — picking a species calls the existing
 *   store.setDrawMaterial(species), which looks up MATERIAL_CATALOG
 *   (src/lib/materials.ts) and writes species+category+color into
 *   ui.drawDefaults. This is the exact same call InsertPanel makes; no
 *   second species list or lookup lives here (CAD_MANIFESTO.md Law 3).
 *
 * OUTPUT: ui.drawDefaults.{species, category, color} — read by
 *   SketchTool.tsx's finalizeBoard() the next time a board is placed.
 *
 * FOLLOWS-BOARD CHECK: n/a — sets defaults for the next board to be drawn,
 *   not a live board's parameters.
 */
export default function SketchMaterialPanel() {
  const activeTool = useAppStore((s) => s.ui.activeTool);
  const drawDefaults = useAppStore((s) => s.ui.drawDefaults);
  const setDrawMaterial = useAppStore((s) => s.setDrawMaterial);

  if (activeTool !== 'drawBoard') return null;

  return (
    <div className="absolute top-16 right-4 bg-zinc-900 border border-zinc-700 rounded p-3 flex flex-col gap-2 text-base text-zinc-200 w-56 z-10">
      <div className="font-semibold text-white">Sketch Material</div>
      <label className="flex items-center justify-between gap-2">
        <span>Species</span>
        <SpeciesSelect
          value={drawDefaults.species}
          onChange={setDrawMaterial}
          className="w-36 bg-zinc-800 border border-zinc-600 rounded px-2 py-1 text-base text-white"
        />
      </label>
    </div>
  );
}
