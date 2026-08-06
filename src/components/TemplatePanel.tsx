import { useEffect, useState } from 'react';
import { useAppStore } from '../store';
import SpeciesSelect from './SpeciesSelect';
import Tooltip from './Tooltip';
import CollapsibleSection from './CollapsibleSection';
import { formatFractionalInches, parseFractionalInches } from '../lib/fractionalInches';
import type { TemplateDrawTool } from '../types';

/**
 * Data Flow Pipeline: Template Panel content (New Order 7 Part 5 — grouped,
 * collapsible sections replacing the old flat panel)
 *
 * INPUT: ui.templateMaterial (species for the NEXT shape closed),
 *   ui.templatePlane (display only — always 'ground' this Order),
 *   ui.templateDrawTool (which of the three draw tools is armed),
 *   ui.templateEdges/templateShapes (read-only geometry info),
 *   ui.selectedTemplateShapeId (context-aware Species/Geometry), and
 *   ui.templateExtrudeThickness (sticky last-used extrude thickness).
 *
 * CALCULATION: none of its own. Species selection calls the existing
 *   store.setTemplateMaterial(species) or store.updateTemplateShapeSpecies,
 *   reading from the same WOOD_SPECIES_LIST/materials.ts catalog every other
 *   species dropdown in the app uses via SpeciesSelect — no second species
 *   list (CAD_MANIFESTO.md Law 3). Draw-tool buttons call the existing
 *   store.setTemplateDrawTool(tool) — the actual point-entry/drag logic
 *   lives in TemplateDrawTools.tsx, this is just the selector. Extrude calls
 *   store.extrudeTemplateShape(shapeId, thickness) — see store.ts for the
 *   full extrude Data Flow Pipeline. Exit calls the existing
 *   store.setWorkspaceMode('model').
 *
 * OUTPUT: ui.templateMaterial / a shape's species / ui.templateDrawTool /
 *   ui.templateExtrudeThickness, plus (via extrudeTemplateShape) a new
 *   Model-space WoodMember.
 *
 * FOLLOWS-BOARD CHECK: n/a — no board/geometry state is touched directly by
 *   this component; extrudeTemplateShape (store.ts) owns that hand-off.
 *
 * Mounted by PropertiesPanel while ui.activeTool === 'template' — renders its
 * own header-less grouped sections (Part 5 #13) rather than the single
 * non-collapsible Section wrapper Insert/Sketch use, since Template has
 * enough distinct concerns (shape, geometry, origin, extrude) to warrant
 * separate collapsible groups using the same chevron pattern as Board
 * Properties/Entities (CollapsibleSection, shared, not a new pattern).
 */
const DRAW_TOOLS: { tool: TemplateDrawTool; label: string; shortcut: string; description: string }[] = [
  { tool: 'line', label: 'Line', shortcut: 'L', description: 'Click to place a start point, click again to place the end point and continue the chain.' },
  // New Order 7.1 Feature 10: Arc rebuilt as a standard 3-point arc (the old tangent-continuity math was confirmed broken).
  { tool: 'arc', label: 'Arc', shortcut: 'A', description: 'Click a start point, click a point on the arc to set its bulge, click an end point. Tab flips the bulge to the other side.' },
  { tool: 'freehand', label: 'Freehand', shortcut: 'F', description: 'Click and drag to draw a hand-drawn stroke, release to commit it.' },
];

/** New Order 7.1 Feature 10: staged inline hint for the 3-point Arc flow, matching the existing per-tool description pattern above but live-updating as the user progresses through the 3 clicks. */
const ARC_STAGE_HINTS: Record<'start' | 'via' | 'end', string> = {
  start: 'Place start point → place a point on the arc → place end point.',
  via: 'Place a point on the arc (defines the bulge) → place end point.',
  end: 'Place end point to commit the arc. Tab (or the on-canvas Flip button) mirrors the bulge to the other side.',
};

export default function TemplatePanel() {
  const templateMaterial = useAppStore((s) => s.ui.templateMaterial);
  const setTemplateMaterial = useAppStore((s) => s.setTemplateMaterial);
  const templateDrawTool = useAppStore((s) => s.ui.templateDrawTool);
  const setTemplateDrawTool = useAppStore((s) => s.setTemplateDrawTool);
  const templateArcStage = useAppStore((s) => s.ui.templateArcStage);
  const templateArcFlipped = useAppStore((s) => s.ui.templateArcFlipped);
  const setTemplateArcFlipped = useAppStore((s) => s.setTemplateArcFlipped);
  const edgeCount = useAppStore((s) => s.ui.templateEdges.length);
  const setWorkspaceMode = useAppStore((s) => s.setWorkspaceMode);
  const templatePlane = useAppStore((s) => s.ui.templatePlane);
  const selectedShape = useAppStore((s) =>
    s.ui.templateShapes.find((shape) => shape.id === s.ui.selectedTemplateShapeId)
  );
  const shapeCount = useAppStore((s) => s.ui.templateShapes.length);
  const updateTemplateShapeSpecies = useAppStore((s) => s.updateTemplateShapeSpecies);
  const extrudeThickness = useAppStore((s) => s.ui.templateExtrudeThickness);
  const setTemplateExtrudeThickness = useAppStore((s) => s.setTemplateExtrudeThickness);
  const extrudeTemplateShape = useAppStore((s) => s.extrudeTemplateShape);

  const [shapeOpen, setShapeOpen] = useState(true);
  const [geometryOpen, setGeometryOpen] = useState(true);
  const [originOpen, setOriginOpen] = useState(false);
  const [extrudeOpen, setExtrudeOpen] = useState(true);

  const [thicknessText, setThicknessText] = useState(formatFractionalInches(extrudeThickness));
  useEffect(() => setThicknessText(formatFractionalInches(extrudeThickness)), [extrudeThickness]);

  function commitThickness() {
    const parsed = parseFractionalInches(thicknessText);
    if (parsed !== null && parsed > 0) setTemplateExtrudeThickness(parsed);
    else setThicknessText(formatFractionalInches(extrudeThickness));
  }

  function handleExtrude() {
    if (!selectedShape) return;
    extrudeTemplateShape(selectedShape.id, extrudeThickness);
  }

  return (
    <div className="flex flex-col">
      <div className="px-3 py-3 border-b border-charcoal-800">
        <p className="text-xs text-charcoal-500 mb-3">
          Sketch a custom shape on a locked 2D plane, then extrude it into a
          real board. Camera orbit is disabled — pan and zoom stay on the plane.
        </p>

        <div className="flex gap-2">
          {DRAW_TOOLS.map(({ tool, label, shortcut, description }) => (
            <Tooltip key={tool} side="left" info={{ label, description, shortcut }} className="flex-1">
              <button
                type="button"
                onClick={() => setTemplateDrawTool(templateDrawTool === tool ? null : tool)}
                className={`w-full px-2 py-1.5 rounded text-base border ${
                  templateDrawTool === tool
                    ? 'bg-orange-600 border-orange-500 text-white'
                    : 'bg-charcoal-800 border-charcoal-700 text-charcoal-200 hover:bg-charcoal-700'
                }`}
              >
                {label}
              </button>
            </Tooltip>
          ))}
        </div>
        {/* New Order 7.1 Feature 10: Arc's own staged hint (which of the 3
            clicks is next), matching the existing per-tool description
            pattern above but live-updating as the chain progresses. */}
        {templateDrawTool === 'arc' && (
          <p className="text-xs text-orange-400 mt-2">{ARC_STAGE_HINTS[templateArcStage]}</p>
        )}
        {templateDrawTool === 'arc' && templateArcStage === 'end' && (
          <button
            type="button"
            onClick={() => setTemplateArcFlipped(!templateArcFlipped)}
            className={`mt-2 w-full px-2 py-1 rounded text-xs border ${
              templateArcFlipped
                ? 'bg-orange-600 border-orange-500 text-white'
                : 'bg-charcoal-800 border-charcoal-700 text-charcoal-200 hover:bg-charcoal-700'
            }`}
          >
            Flip arc bulge (Tab)
          </button>
        )}
        <p className="text-xs text-charcoal-500 mt-2">
          Click to place a point, click again to place the next and keep
          chaining. Drag back near the chain's start point (3+ segments) and
          commit to close the loop. Hover a chain's loose end (no tool
          dragging) to resume it. Right-click or Esc ends the current chain
          without deleting what's already drawn.
        </p>
      </div>

      <CollapsibleSection title="Shape" open={shapeOpen} onToggle={() => setShapeOpen((v) => !v)}>
        <Tooltip
          side="left"
          info={
            selectedShape
              ? { label: 'Shape Species', description: 'Species for the selected filled shape — swaps its color and grain instantly.' }
              : { label: 'Species', description: 'Wood species applied to the next shape you close, and later carried into the extruded board.' }
          }
        >
          <label className="flex items-center justify-between gap-2 w-full">
            <span>{selectedShape ? 'Shape Species' : 'Species'}</span>
            <SpeciesSelect
              value={selectedShape ? selectedShape.species : templateMaterial}
              onChange={(species) =>
                selectedShape ? updateTemplateShapeSpecies(selectedShape.id, species) : setTemplateMaterial(species)
              }
              className="w-36 bg-charcoal-800 border border-charcoal-600 rounded px-2 py-1 text-base text-white"
            />
          </label>
        </Tooltip>
        {selectedShape ? (
          <p className="text-xs text-charcoal-500 mt-2">
            Editing the selected shape's species. Click empty space to deselect and set the default for new shapes instead.
          </p>
        ) : (
          shapeCount > 0 && (
            <p className="text-xs text-charcoal-500 mt-2">
              Click a filled shape in the viewport to select it and edit its species.
            </p>
          )
        )}
      </CollapsibleSection>

      <CollapsibleSection title="Geometry" open={geometryOpen} onToggle={() => setGeometryOpen((v) => !v)}>
        <div className="flex flex-col gap-1 text-xs text-charcoal-400">
          {selectedShape ? (
            <>
              <div className="flex justify-between"><span>Segments</span><span className="text-charcoal-200">{selectedShape.edgeIds.length}</span></div>
              <div className="flex justify-between"><span>Status</span><span className="text-charcoal-200">Closed</span></div>
            </>
          ) : (
            <>
              <div className="flex justify-between"><span>Segments drawn</span><span className="text-charcoal-200">{edgeCount}</span></div>
              <div className="flex justify-between"><span>Shapes closed</span><span className="text-charcoal-200">{shapeCount}</span></div>
              <div className="flex justify-between"><span>Status</span><span className="text-charcoal-200">Open</span></div>
            </>
          )}
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Origin" open={originOpen} onToggle={() => setOriginOpen((v) => !v)}>
        <div className="flex flex-col gap-1 text-xs text-charcoal-400">
          <div className="flex justify-between"><span>Plane</span><span className="text-charcoal-200 capitalize">{templatePlane.kind}</span></div>
          <div className="flex justify-between"><span>Offset</span><span className="text-charcoal-200">{templatePlane.origin.map((n) => n.toFixed(0)).join(', ')}</span></div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Extrude" open={extrudeOpen} onToggle={() => setExtrudeOpen((v) => !v)}>
        <Tooltip side="left" info={{ label: 'Thickness', description: 'How thick the extruded board is, along the plane\'s normal.' }}>
          <label className="flex items-center justify-between gap-2 w-full">
            <span>Thickness</span>
            <input
              type="text"
              inputMode="decimal"
              value={thicknessText}
              onChange={(e) => setThicknessText(e.target.value)}
              onBlur={commitThickness}
              onKeyDown={(e) => {
                if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
              }}
              className="w-24 bg-charcoal-800 border border-charcoal-600 rounded px-2 py-1 text-base text-white"
            />
          </label>
        </Tooltip>
        <Tooltip
          side="left"
          info={{
            label: 'Extrude to Board',
            description: selectedShape
              ? 'Turn the selected closed shape into a real, movable board and return to Model space.'
              : 'Select a closed shape in the viewport first.',
          }}
        >
          <button
            type="button"
            disabled={!selectedShape}
            onClick={handleExtrude}
            className="mt-2 w-full px-3 py-1.5 rounded text-base border bg-orange-600 border-orange-500 text-white hover:bg-orange-500 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-orange-600"
          >
            Extrude to Board
          </button>
        </Tooltip>
        {!selectedShape && shapeCount > 0 && (
          <p className="text-xs text-charcoal-500 mt-2">Select a closed shape above to extrude it.</p>
        )}
      </CollapsibleSection>

      <div className="px-3 py-3">
        <Tooltip side="left" info={{ label: 'Exit Template', description: 'Leave the sketch plane and return to Model space without saving a shape.' }}>
          <button
            type="button"
            onClick={() => setWorkspaceMode('model')}
            className="w-full px-2 py-1.5 rounded text-base border bg-charcoal-800 border-charcoal-600 text-charcoal-200 hover:bg-charcoal-700 hover:border-spruce-700/60"
          >
            Exit to Model
          </button>
        </Tooltip>
      </div>
    </div>
  );
}
