import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useAppStore } from '../store';
import InsertPanel from './InsertPanel';
import SketchMaterialPanel from './SketchMaterialPanel';
import BoardEditPanel from './BoardEditPanel';
import TemplatePanel from './TemplatePanel';
import MatePanel from './MatePanel';
import TrimPanel from './TrimPanel';
import ChamferPanel from './ChamferPanel';
import EditableLabel from './EditableLabel';
import Tooltip from './Tooltip';
import CollapsibleSection from './CollapsibleSection';
import { isEntityLineVisible } from '../lib/boardFaceMath';
import { length2D, sub2D } from '../lib/templateSketchMath';
import { formatFractionalInches } from '../lib/fractionalInches';

/**
 * Data Flow Pipeline: Properties Panel — Single Contextual Panel (New Order 5)
 *
 * INPUT: ui.activeTool (which tool section to show), ui.selectedMemberId +
 *   project.members (the selected board, for the Board Properties section),
 *   ui.rotationAxis (which axis row is highlighted while Rotate is active),
 *   and project.members again for the Entities list at the bottom.
 *
 * CALCULATION: none of its own — this component is pure routing/composition.
 *   It replaces the old per-tool floating panels (InsertPanel, SketchMaterial
 *   Panel, BoardEditPanel each used to self-position with `absolute` and,
 *   for InsertPanel, its own independent open/close boolean that never
 *   listened to activeTool at all) with ONE panel whose visible section is
 *   selected by a single switch on ui.activeTool. Every prior tool's actual
 *   field logic (state, validation, store calls) is unchanged — only where
 *   it renders moved.
 *
 * OUTPUT: none stored here — child sections (InsertPanel, SketchMaterialPanel,
 *   BoardEditPanel) call the same store actions they always did.
 *
 * FOLLOWS-BOARD CHECK: n/a — UI chrome. The bug this replaces (a previous
 *   tool's panel staying open after switching tools) is fixed structurally:
 *   there is exactly one panel element, and its content is an exhaustive
 *   switch on activeTool, so a tool switch can never leave a stale section
 *   mounted alongside the new one.
 *
 * New Order 5.1: Board Properties now force-expands whenever
 *   ui.selectedMemberId changes to a non-null id (a new board picked, via
 *   click or the Entities list), so its fields are visible with no extra
 *   click — a plain useEffect keyed on the id, not a duplicate selection
 *   read (selectedMember below already owns the lookup).
 *
 * New Order 5.2: the 5.1 effect only ever set propertiesOpen to true (a
 *   one-way `if (id) setTrue` guard) and the initial state was `true`, so
 *   Board Properties stayed expanded both on fresh load (no selection yet)
 *   and after a deselect (id -> null never re-collapsed it). Fixed by
 *   defaulting propertiesOpen to false and making the effect unconditional
 *   (`setPropertiesOpen(!!selectedMemberId)`), so it collapses on null and
 *   expands on a real id, symmetrically. A manual double-chevron toggle
 *   (still just the existing onToggle) lets Joey override this auto state
 *   per-selection without touching the auto behavior itself.
 *
 * New Order 5.3: added `panelCollapsed`, a purely local boolean (same
 *   ephemeral-UI-chrome precedent as ToolRail's `openGroupId` — not board
 *   state, so it intentionally does not live in the Zustand store) that
 *   swaps the whole panel for a thin edge strip with a single re-expand
 *   control. Collapsing never touches activeTool, selectedMemberId, or any
 *   section's own open/closed state — re-expanding restores the panel
 *   exactly as it was.
 *
 * New Order 5.4: the collapse/expand control itself moved from a chevron
 *   button inside the panel header to `PanelEdgeTab` below — a small pill
 *   positioned half over the panel's left edge and half over the canvas,
 *   like a grab-handle, instead of living inside the header row. Same
 *   `panelCollapsed` toggle, same click target's behavior — presentation
 *   and placement only.
 */
export default function PropertiesPanel() {
  const activeTool = useAppStore((s) => s.ui.activeTool);
  const rotationAxis = useAppStore((s) => s.ui.rotationAxis);
  const setRotationAxis = useAppStore((s) => s.setRotationAxis);
  const selectedMemberId = useAppStore((s) => s.ui.selectedMemberId);
  const selectedMember = useAppStore((s) =>
    s.project.members.find((m) => m.id === s.ui.selectedMemberId)
  );

  const [entitiesOpen, setEntitiesOpen] = useState(true);
  const [propertiesOpen, setPropertiesOpen] = useState(false);
  const [panelCollapsed, setPanelCollapsed] = useState(false);

  useEffect(() => {
    setPropertiesOpen(!!selectedMemberId);
  }, [selectedMemberId]);

  const toolLabel =
    activeTool === 'select' ? 'Select' :
    activeTool === 'move' ? 'Move' :
    activeTool === 'rotate' ? 'Rotate' :
    activeTool === 'drawBoard' ? 'Sketch' :
    activeTool === 'addBoard' ? 'Insert' :
    activeTool === 'template' ? 'Template' :
    activeTool === 'measure' ? 'Dimension' :
    activeTool === 'referenceLine' ? 'Reference' :
    activeTool === 'mate' ? 'Mate' :
    activeTool === 'trimExtend' ? 'Trim/Extend' :
    activeTool === 'chamfer' ? 'Chamfer' :
    'Select';

  if (panelCollapsed) {
    return (
      <div className="absolute top-10 right-0 bottom-0 w-10 bg-charcoal-900 border-l border-charcoal-700 flex flex-col items-center py-3 gap-3">
        <PanelEdgeTab collapsed onClick={() => setPanelCollapsed(false)} />
        <span
          className="text-[10px] uppercase tracking-wider text-charcoal-500 mt-4"
          style={{ writingMode: 'vertical-rl' }}
        >
          Properties
        </span>
      </div>
    );
  }

  return (
    <div className="absolute top-10 right-0 bottom-0 w-72 flex flex-col text-base text-charcoal-200">
      <PanelEdgeTab collapsed={false} onClick={() => setPanelCollapsed(true)} />
      <div className="flex-1 flex flex-col min-h-0 bg-charcoal-900 border-l border-charcoal-700 overflow-hidden">
        <div className="px-3 py-3 border-b border-charcoal-700 shrink-0">
          <div className="font-semibold text-white">{toolLabel}</div>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0">
          {activeTool === 'addBoard' && (
            <Section title="Insert Board">
              <InsertPanel />
            </Section>
          )}

          {activeTool === 'drawBoard' && (
            <Section title="Sketch Material">
              <SketchMaterialPanel />
            </Section>
          )}

          {activeTool === 'template' && <TemplatePanel />}

          {activeTool === 'measure' && (
            <Section title="Dimension Line">
              <p className="text-xs text-charcoal-500">
                Click point A, then point B on the same board face, then a third point to set the
                offset side/distance. Esc cancels the current click without deleting anything
                already placed.
              </p>
              <SnapToggle />
              <p className="text-xs text-charcoal-500 mt-2">
                Select a placed line, then use the arrow keys to nudge it 1/16" at a time.
              </p>
            </Section>
          )}

          {activeTool === 'referenceLine' && (
            <Section title="Reference Line">
              <p className="text-xs text-charcoal-500">
                Click a start point and an end point directly on a board face — near an edge/end
                to snap onto it (X marker), or anywhere else on the face for a free point
                (diagonal tick).
              </p>
              <SnapToggle />
              <p className="text-xs text-charcoal-500 mt-2">
                Select a placed line, then use the arrow keys to nudge it 1/16" at a time.
              </p>
            </Section>
          )}

          {activeTool === 'mate' && <MatePanel />}

          {activeTool === 'trimExtend' && <TrimPanel />}

          {activeTool === 'chamfer' && <ChamferPanel />}

          {activeTool === 'rotate' && (
            <Section title="Rotation Axis">
              <div className="flex gap-2">
                {(['x', 'y', 'z'] as const).map((axis) => (
                  <button
                    key={axis}
                    onClick={() => setRotationAxis(axis)}
                    className={`flex-1 px-2 py-1.5 rounded text-base border ${
                      rotationAxis === axis
                        ? 'bg-orange-600 border-orange-500 text-white'
                        : 'bg-charcoal-800 border-charcoal-700 text-charcoal-200 hover:bg-charcoal-700'
                    }`}
                  >
                    {axis.toUpperCase()}
                  </button>
                ))}
              </div>
              <p className="text-xs text-charcoal-500 mt-2">
                Tab cycles the axis. Drag the ring to rotate (15° snap — hold Shift for free rotation).
              </p>
            </Section>
          )}

          {/* New Order 7.1 Fix 8: Board Properties/Entities are Model-space
              concerns (they read/edit project.members) — Template mode has
              its own Shape/Geometry/Origin/Extrude sections (TemplatePanel)
              and previously showed both sets stacked at once. */}
          {activeTool !== 'template' && (
            <>
              <CollapsibleSection
                title="Board Properties"
                open={propertiesOpen}
                onToggle={() => setPropertiesOpen((v) => !v)}
              >
                {selectedMember ? (
                  <BoardEditPanel member={selectedMember} />
                ) : (
                  <p className="text-xs text-charcoal-500">Select a board to edit its dimensions.</p>
                )}
              </CollapsibleSection>

              <EntitiesSection open={entitiesOpen} onToggle={() => setEntitiesOpen((v) => !v)} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Compact corner collapse/expand tab (New Order 6.3, replacing New Order
 * 5.4's edge-straddling pill handle per the Order's reference screenshots):
 * a small square tab flush with the panel's top-right corner, showing a
 * literal '«' (collapse) / '»' (expand) glyph rather than the shared
 * ChevronsIcon — the collapsed state's entire thin strip effectively reads
 * as one slim '»' tab down its top edge. Rendered as a plain
 * absolutely-positioned wrapper (not passing position classes into
 * Tooltip's own className) so it positions relative to the panel container
 * above it — both the expanded panel's outer wrapper and the collapsed
 * strip div use `absolute` positioning themselves, which is enough to be a
 * valid containing block for this tab without an extra `relative` class.
 */
function PanelEdgeTab({ collapsed, onClick }: { collapsed: boolean; onClick: () => void }) {
  return (
    <div className="absolute -top-px -right-px z-10">
      <Tooltip
        side="left"
        info={
          collapsed
            ? { label: 'Expand panel', description: 'Show board properties and entities again.' }
            : { label: 'Collapse panel', description: 'Hide this panel down to a thin edge strip.' }
        }
      >
        <button
          onClick={onClick}
          aria-label={collapsed ? 'Expand panel' : 'Collapse panel'}
          className="w-6 h-6 rounded-tr-lg rounded-bl-md bg-charcoal-800 border border-charcoal-700 flex items-center justify-center text-charcoal-400 hover:text-spruce-400 hover:bg-charcoal-700 transition-colors text-base leading-none"
        >
          {collapsed ? '»' : '«'}
        </button>
      </Tooltip>
    </div>
  );
}

/** Non-collapsible tool-section wrapper — used for the single active tool's own controls. */
function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="px-3 py-3 border-b border-charcoal-800">
      {/* Spruce underline sits under the label text only (inline-block), not
          the full section width — an accent detail, not a base divider
          (the charcoal-800 border below still owns the actual section
          separator). */}
      <div className="text-xs uppercase tracking-wider text-charcoal-500 mb-2 pb-1 border-b border-spruce-700/50 inline-block">
        {title}
      </div>
      {children}
    </div>
  );
}

function EntitiesSection({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  const members = useAppStore((s) => s.project.members);
  const dimensionLines = useAppStore((s) => s.project.dimensionLines);
  const referenceLines = useAppStore((s) => s.project.referenceLines);
  const selectedMemberId = useAppStore((s) => s.ui.selectedMemberId);
  const selectedDimensionLineId = useAppStore((s) => s.ui.selectedDimensionLineId);
  const selectedReferenceLineId = useAppStore((s) => s.ui.selectedReferenceLineId);
  const selectMember = useAppStore((s) => s.selectMember);
  const setActiveTool = useAppStore((s) => s.setActiveTool);
  const removeMember = useAppStore((s) => s.removeMember);
  const updateMember = useAppStore((s) => s.updateMember);
  const sendToScrapBox = useAppStore((s) => s.sendToScrapBox);
  const retrieveFromScrapBox = useAppStore((s) => s.retrieveFromScrapBox);
  const selectDimensionLine = useAppStore((s) => s.selectDimensionLine);
  const setDimensionLineVisibility = useAppStore((s) => s.setDimensionLineVisibility);
  const startEditDimensionLine = useAppStore((s) => s.startEditDimensionLine);
  const selectReferenceLine = useAppStore((s) => s.selectReferenceLine);
  const setReferenceLineVisibility = useAppStore((s) => s.setReferenceLineVisibility);
  const startEditReferenceLine = useAppStore((s) => s.startEditReferenceLine);
  const removeReferenceLine = useAppStore((s) => s.removeReferenceLine);
  const removeDimensionLine = useAppStore((s) => s.removeDimensionLine);

  const memberLabel = (id: string) => members.find((m) => m.id === id)?.label ?? 'Unknown board';
  const totalCount = members.length + dimensionLines.length + referenceLines.length;

  return (
    <CollapsibleSection title={`Entities (${totalCount})`} open={open} onToggle={onToggle}>
      {members.length === 0 ? (
        <p className="text-xs text-charcoal-500">No boards yet — use Sketch or Insert to add one.</p>
      ) : (
        <ul className="flex flex-col gap-1">
          {members.map((m) => (
            <li
              key={m.id}
              className={`flex items-center gap-1 rounded px-1.5 py-1 text-base border-l-2 ${
                selectedMemberId === m.id
                  ? 'bg-orange-500/10 border-orange-500'
                  : 'border-transparent'
              }`}
            >
              <Tooltip
                side="top"
                info={{
                  label: m.inScrapBox ? 'Show' : 'Hide',
                  description: m.inScrapBox
                    ? 'Bring this board back into the viewport.'
                    : 'Stash this board out of the viewport without deleting it.',
                }}
              >
                <button
                  onClick={() => (m.inScrapBox ? retrieveFromScrapBox(m.id) : sendToScrapBox(m.id))}
                  className="text-charcoal-400 hover:text-white w-5 shrink-0"
                >
                  {m.inScrapBox ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                      <path d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8M9.5 5.2A9.9 9.9 0 0112 5c5 0 9 4 10.5 7-.5 1-1.3 2.2-2.4 3.3M6.6 6.6C4.5 8 3 10 1.5 12c1.5 3 5.5 7 10.5 7 1.5 0 2.9-.3 4.2-.9" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                      <path d="M1.5 12S5.5 5 12 5s10.5 7 10.5 7-4 7-10.5 7S1.5 12 1.5 12z" />
                      <circle cx="12" cy="12" r="2.5" />
                    </svg>
                  )}
                </button>
              </Tooltip>
              <EditableLabel
                value={m.label}
                onCommit={(v) => updateMember(m.id, { label: v })}
                className="flex-1 min-w-0"
              />
              <Tooltip side="top" info={{ label: 'Select', description: 'Select this board and switch to the Select tool.' }}>
                <button
                  onClick={() => {
                    setActiveTool('select');
                    selectMember(m.id);
                  }}
                  className="text-charcoal-400 hover:text-white w-5 shrink-0"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                    <path d="M4 20l1-4.2L15.8 5 19 8.2 8.2 19 4 20z" />
                  </svg>
                </button>
              </Tooltip>
              <Tooltip side="top" info={{ label: 'Remove', description: 'Permanently delete this board from the project.' }}>
                <button
                  onClick={() => removeMember(m.id)}
                  className="text-charcoal-400 hover:text-red-400 w-5 shrink-0"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                    <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" />
                  </svg>
                </button>
              </Tooltip>
            </li>
          ))}
        </ul>
      )}

      {dimensionLines.length > 0 && (
        <ul className="flex flex-col gap-1 mt-2 pt-2 border-t border-charcoal-800">
          {dimensionLines.map((dl) => {
            const visibleNow = isEntityLineVisible(dl.visible, dl.anchorMemberId, selectedMemberId);
            const lengthIn = length2D(sub2D(dl.endUV, dl.startUV));
            return (
              <li
                key={dl.id}
                className={`flex items-center gap-1 rounded px-1.5 py-1 text-base border-l-2 ${
                  selectedDimensionLineId === dl.id ? 'bg-orange-500/10 border-orange-500' : 'border-transparent'
                }`}
              >
                <Tooltip side="top" info={{ label: visibleNow ? 'Hide' : 'Show', description: visibleNow ? 'Hide this dimension line.' : 'Show this dimension line regardless of board selection.' }}>
                  <button onClick={() => setDimensionLineVisibility(dl.id, !visibleNow)} className="text-charcoal-400 hover:text-white w-5 shrink-0">
                    <EyeIcon open={visibleNow} />
                  </button>
                </Tooltip>
                <span
                  onClick={() => selectDimensionLine(dl.id)}
                  className="flex-1 min-w-0 truncate cursor-pointer hover:text-white"
                >
                  Dimension: {formatFractionalInches(lengthIn)} ({memberLabel(dl.anchorMemberId)})
                </span>
                <Tooltip side="top" info={{ label: 'Edit', description: 'Re-drag this dimension line\'s points and offset.' }}>
                  <button onClick={() => startEditDimensionLine(dl.id)} className="text-charcoal-400 hover:text-white w-5 shrink-0">
                    <EditIcon />
                  </button>
                </Tooltip>
                <Tooltip side="top" info={{ label: 'Select', description: 'Highlight this dimension line.' }}>
                  <button onClick={() => selectDimensionLine(dl.id)} className="text-charcoal-400 hover:text-white w-5 shrink-0">
                    <SelectIcon />
                  </button>
                </Tooltip>
                <Tooltip side="top" info={{ label: 'Remove', description: 'Permanently delete this dimension line.' }}>
                  <button onClick={() => removeDimensionLine(dl.id)} className="text-charcoal-400 hover:text-red-400 w-5 shrink-0">
                    <RemoveIcon />
                  </button>
                </Tooltip>
              </li>
            );
          })}
        </ul>
      )}

      {referenceLines.length > 0 && (
        <ul className="flex flex-col gap-1 mt-2 pt-2 border-t border-charcoal-800">
          {referenceLines.map((rl) => {
            const visibleNow = isEntityLineVisible(rl.visible, rl.anchorMemberId, selectedMemberId);
            return (
              <li
                key={rl.id}
                className={`flex items-center gap-1 rounded px-1.5 py-1 text-base border-l-2 ${
                  selectedReferenceLineId === rl.id ? 'bg-orange-500/10 border-orange-500' : 'border-transparent'
                }`}
              >
                <Tooltip side="top" info={{ label: visibleNow ? 'Hide' : 'Show', description: visibleNow ? 'Hide this reference line.' : 'Show this reference line regardless of board selection.' }}>
                  <button onClick={() => setReferenceLineVisibility(rl.id, !visibleNow)} className="text-charcoal-400 hover:text-white w-5 shrink-0">
                    <EyeIcon open={visibleNow} />
                  </button>
                </Tooltip>
                <span
                  onClick={() => selectReferenceLine(rl.id)}
                  className="flex-1 min-w-0 truncate cursor-pointer hover:text-white"
                >
                  Reference ({memberLabel(rl.anchorMemberId)})
                </span>
                <Tooltip side="top" info={{ label: 'Edit', description: 'Re-drag this reference line\'s points.' }}>
                  <button onClick={() => startEditReferenceLine(rl.id)} className="text-charcoal-400 hover:text-white w-5 shrink-0">
                    <EditIcon />
                  </button>
                </Tooltip>
                <Tooltip side="top" info={{ label: 'Select', description: 'Highlight this reference line.' }}>
                  <button onClick={() => selectReferenceLine(rl.id)} className="text-charcoal-400 hover:text-white w-5 shrink-0">
                    <SelectIcon />
                  </button>
                </Tooltip>
                <Tooltip side="top" info={{ label: 'Remove', description: 'Permanently delete this reference line.' }}>
                  <button onClick={() => removeReferenceLine(rl.id)} className="text-charcoal-400 hover:text-red-400 w-5 shrink-0">
                    <RemoveIcon />
                  </button>
                </Tooltip>
              </li>
            );
          })}
        </ul>
      )}
    </CollapsibleSection>
  );
}

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M1.5 12S5.5 5 12 5s10.5 7 10.5 7-4 7-10.5 7S1.5 12 1.5 12z" />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8M9.5 5.2A9.9 9.9 0 0112 5c5 0 9 4 10.5 7-.5 1-1.3 2.2-2.4 3.3M6.6 6.6C4.5 8 3 10 1.5 12c1.5 3 5.5 7 10.5 7 1.5 0 2.9-.3 4.2-.9" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M4 20l1-4.2L15.8 5 19 8.2 8.2 19 4 20z" />
      <path d="M13.5 6.5l4 4" />
    </svg>
  );
}

function SelectIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <circle cx="12" cy="12" r="7" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
    </svg>
  );
}

/** Shared by Dimension and Reference Line panels — one flag in the store
 * (ui.annotationSnapEnabled), read by both BoardMesh.tsx's first-click
 * handler and BoardAnnotations.tsx's ContinuationPlane for every click after
 * the first, so toggling it here affects the whole placement sequence. */
function SnapToggle() {
  const annotationSnapEnabled = useAppStore((s) => s.ui.annotationSnapEnabled);
  const setAnnotationSnapEnabled = useAppStore((s) => s.setAnnotationSnapEnabled);
  return (
    <label className="flex items-center gap-2 mt-2 text-xs text-charcoal-300 cursor-pointer">
      <input
        type="checkbox"
        checked={annotationSnapEnabled}
        onChange={(e) => setAnnotationSnapEnabled(e.target.checked)}
        className="accent-orange-500"
      />
      Snap to edges/ends (off = fully free placement)
    </label>
  );
}

function RemoveIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" />
    </svg>
  );
}
