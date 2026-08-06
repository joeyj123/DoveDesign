import { useAppStore } from '../store';
import SpeciesSelect from './SpeciesSelect';
import Tooltip from './Tooltip';

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
/**
 * New Order 5: content-only — PropertiesPanel mounts this while
 * ui.activeTool === 'drawBoard' instead of it self-guarding on activeTool
 * and floating independently, so it can never stay visible after a tool
 * switch the way the old standalone floating panel could.
 */
export default function SketchMaterialPanel() {
  const drawDefaults = useAppStore((s) => s.ui.drawDefaults);
  const setDrawMaterial = useAppStore((s) => s.setDrawMaterial);

  return (
    <div className="flex flex-col gap-2">
      <Tooltip side="left" info={{ label: 'Species', description: 'Wood species — sets the new board\'s color and grain texture.' }}>
        <label className="flex items-center justify-between gap-2 w-full">
          <span>Species</span>
          <SpeciesSelect
            value={drawDefaults.species}
            onChange={setDrawMaterial}
            className="w-36 bg-charcoal-800 border border-charcoal-600 rounded px-2 py-1 text-base text-white"
          />
        </label>
      </Tooltip>
      <p className="text-xs text-charcoal-500">Click and drag on the floor to draw a new board.</p>
    </div>
  );
}
