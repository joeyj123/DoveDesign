import { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../store';
import { NOMINAL_DIMENSIONS } from '../types';
import type { NominalSize, WoodCategory } from '../types';
import { radToDeg } from '../lib/angles';
import { createCutOperation, CUT_TYPES, JOINERY_TYPES } from '../lib/joinery';
import { MATERIAL_CATALOG, inferMaterialKind } from '../lib/materials';
import { ALL_FACES, FACE_LABELS } from '../lib/mating';
import type { FaceId } from '../types';

const NOMINAL_SIZES: NominalSize[] = [
  '1x2','1x3','1x4','1x6','1x8','1x10','1x12',
  '2x2','2x4','2x6','2x8','2x10','2x12',
  '4x4','4x6','Custom',
];

interface FormState {
  label: string;
  category: WoodCategory;
  species: string;
  nominalSize: NominalSize;
  thickness: string;
  width: string;
  length: string;
  costPerBoardFoot: string;
}

const DEFAULTS: FormState = {
  label: '',
  category: 'Softwood',
  species: 'Southern Yellow Pine',
  nominalSize: '2x4',
  thickness: '1.5',
  width: '3.5',
  length: '96',
  costPerBoardFoot: '3.50',
};

export default function ToolPanel() {
  const activeTool = useAppStore((s) => s.ui.activeTool);
  const selectedId = useAppStore((s) => s.ui.selectedMemberId);
  const selectedMember = useAppStore((s) =>
    s.project.members.find((m) => m.id === s.ui.selectedMemberId)
  );
  const addMember = useAppStore((s) => s.addMember);
  const addCut = useAppStore((s) => s.addCut);
  const splitMemberByCrossCut = useAppStore((s) => s.splitMemberByCrossCut);
  const splitMemberByRipCut = useAppStore((s) => s.splitMemberByRipCut);
  const setCrossCutPreviewPosition = useAppStore((s) => s.setCrossCutPreviewPosition);
  const setRipCutPreviewPosition  = useAppStore((s) => s.setRipCutPreviewPosition);
  const selectedJointType         = useAppStore((s) => s.ui.selectedJointType);
  const setSelectedJointType      = useAppStore((s) => s.setSelectedJointType);
  const clearJointMarkers         = useAppStore((s) => s.clearJointMarkers);
  const removeCut = useAppStore((s) => s.removeCut);
  const updateCut = useAppStore((s) => s.updateCut);
  const allMembers = useAppStore((s) => s.project.members);
  const mateFaceA = useAppStore((s) => s.ui.mateFaceA);
  const mateFaceB = useAppStore((s) => s.ui.mateFaceB);
  const setMateFaceA = useAppStore((s) => s.setMateFaceA);
  const setMateFaceB = useAppStore((s) => s.setMateFaceB);
  const setMatePickTarget = useAppStore((s) => s.setMatePickTarget);
  const matePickTarget = useAppStore((s) => s.ui.matePickTarget);
  const applyMate = useAppStore((s) => s.applyMate);

  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [ripTargetWidth, setRipTargetWidth] = useState('2.75');
  const [crossCutPosition, setCrossCutPosition] = useState('12');
  const crossCutPositionRef = useRef('12'); // always-current value for stale-closure-free reads
  const [joineryPartnerId, setJoineryPartnerId] = useState('');

  useEffect(() => {
    if (selectedMember && activeTool === 'joinery') {
      setJoineryPartnerId('');
    }
    if (activeTool !== 'cut') {
      setCrossCutPreviewPosition(null);
    }
    if (activeTool !== 'rip') {
      setRipCutPreviewPosition(null);
    }
  }, [selectedMember?.id, activeTool, setCrossCutPreviewPosition, setRipCutPreviewPosition]);

  useEffect(() => {
    if (selectedMember && activeTool === 'rip') {
      setRipTargetWidth(String(Math.max(0.25, selectedMember.width - 0.75)));
    }
  }, [selectedMember?.id, selectedMember?.width, activeTool]);

  const transformGizmoActive = useAppStore((s) => s.ui.transformGizmoActive);
  const transformMode = useAppStore((s) => s.ui.transformMode);
  const rotationAxis = useAppStore((s) => s.ui.rotationAxis);
  const setRotationAxis = useAppStore((s) => s.setRotationAxis);
  const updateMember = useAppStore((s) => s.updateMember);
  const selectedDimensionLineId = useAppStore((s) => s.ui.selectedDimensionLineId);
  const dimensionLines = useAppStore((s) => s.project.dimensionLines ?? []);
  const removeDimensionLine = useAppStore((s) => s.removeDimensionLine);
  const selectDimensionLine = useAppStore((s) => s.selectDimensionLine);
  const mateGroups = useAppStore((s) => s.project.mateGroups ?? []);
  const unmateAll = useAppStore((s) => s.unmateAll);
  const unmateBoard = useAppStore((s) => s.unmateBoard);
  const selectedDrawMaterial = useAppStore((s) => s.ui.selectedDrawMaterial);
  const setDrawMaterial = useAppStore((s) => s.setDrawMaterial);
  const setFinishPanelOpen = useAppStore((s) => s.setFinishPanelOpen);
  const finishPanelOpen = useAppStore((s) => s.ui.finishPanelOpen);
  const updateMemberFinish = useAppStore((s) => s.updateMemberFinish);
  const [degInput, setDegInput] = useState('');

  const showRotationPanel =
    activeTool === 'select' && transformGizmoActive && transformMode === 'rotate' && !!selectedMember;

  const selectedMateGroup = selectedId
    ? mateGroups.find((g) => g.memberIds.includes(selectedId))
    : null;

  // Dim-to-cut panel: selected dimension line anchored to a board
  const selectedDimLine = selectedDimensionLineId
    ? dimensionLines.find((l) => l.id === selectedDimensionLineId)
    : null;
  const dimLineAnchorMember = selectedDimLine?.anchorMemberId
    ? allMembers.find((m) => m.id === selectedDimLine.anchorMemberId)
    : null;

  if ((activeTool === 'select' || activeTool === 'measure') && !showRotationPanel && !selectedDimLine && !finishPanelOpen && !selectedMateGroup) return null;

  if (showRotationPanel) {
    const axisIdx = rotationAxis === 'x' ? 0 : rotationAxis === 'y' ? 1 : 2;
    const currentDeg = Math.round(((radToDeg(selectedMember!.rotation[axisIdx]) % 360) + 360) % 360);

    function applyDeg() {
      const val = parseFloat(degInput);
      if (isNaN(val) || !selectedMember) return;
      const axIdx = rotationAxis === 'x' ? 0 : rotationAxis === 'y' ? 1 : 2;
      const newRot = [...selectedMember.rotation] as [number, number, number];
      newRot[axIdx] = (val * Math.PI) / 180;
      updateMember(selectedMember.id, { rotation: newRot });
      setDegInput('');
    }

    const axisColors: Record<string, string> = { x: 'border-red-500 text-red-400', y: 'border-amber-500 text-amber-400', z: 'border-blue-500 text-blue-400' };
    const axisBg: Record<string, string> = { x: 'bg-red-500/20', y: 'bg-amber-500/20', z: 'bg-blue-500/20' };

    return (
      <div className="mb-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-3 space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-amber-500/90">Rotation</p>

        <div>
          <p className="text-xs text-zinc-500 mb-1">Axis</p>
          <div className="flex gap-1">
            {(['x', 'y', 'z'] as const).map((ax) => (
              <button
                key={ax}
                type="button"
                onClick={() => setRotationAxis(ax)}
                className={`flex-1 py-1 rounded border text-sm font-bold transition-all ${rotationAxis === ax ? `${axisBg[ax]} ${axisColors[ax]}` : 'border-zinc-700 text-zinc-400 hover:border-zinc-500'}`}
              >
                {ax.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs text-zinc-500 mb-1">Current: {currentDeg}°</p>
          <div className="flex gap-2">
            <input
              type="number"
              step="1"
              placeholder={String(currentDeg)}
              className="input-field mono-num flex-1"
              value={degInput}
              onChange={(e) => setDegInput(e.target.value)}
              onKeyDown={(e) => {
                e.stopPropagation();
                if (e.key === 'Enter') applyDeg();
                if (e.key === 'Escape') setDegInput('');
              }}
            />
            <button type="button" onClick={applyDeg} className="btn-secondary text-sm px-3">
              Set
            </button>
          </div>
          <p className="text-xs text-zinc-500 mt-1">Type degrees, press Enter or Set</p>
        </div>

        <div className="flex flex-wrap gap-1">
          {[0, 45, 90, 135, 180].map((deg) => (
            <button
              key={deg}
              type="button"
              onClick={() => {
                if (!selectedMember) return;
                const axIdx = rotationAxis === 'x' ? 0 : rotationAxis === 'y' ? 1 : 2;
                const newRot = [...selectedMember.rotation] as [number, number, number];
                newRot[axIdx] = (deg * Math.PI) / 180;
                updateMember(selectedMember.id, { rotation: newRot });
              }}
              className="px-2 py-0.5 rounded border border-zinc-700 text-xs text-zinc-300 hover:border-amber-500 hover:text-amber-400 transition-all"
            >
              {deg}°
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Mate group panel
  if (selectedMateGroup && selectedMember && activeTool === 'select' && !showRotationPanel) {
    return (
      <div className="mb-4 rounded-xl border border-zinc-700 bg-zinc-900/50 p-3 space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-amber-500/90">Mated Group</p>
        <p className="text-sm text-zinc-400">
          This board is grouped with {selectedMateGroup.memberIds.length - 1} other board{selectedMateGroup.memberIds.length !== 2 ? 's' : ''}. Moving it will move the whole group.
        </p>
        <button
          type="button"
          className="btn-secondary w-full text-sm"
          onClick={() => {
            if (selectedId) unmateBoard(selectedId);
          }}
        >
          Unmate This Board
        </button>
        <button
          type="button"
          className="btn-secondary w-full text-sm border-red-700/50 text-red-400 hover:border-red-500"
          onClick={() => unmateAll(selectedMateGroup.id)}
        >
          Unmate All ({selectedMateGroup.memberIds.length} boards)
        </button>
      </div>
    );
  }

  // Dim-to-cut: convert selected dimension line into a cross cut or rip cut
  if (selectedDimLine && dimLineAnchorMember) {
    const ls = selectedDimLine.localStart;
    const le = selectedDimLine.localEnd;
    if (ls && le) {
      const dx = Math.abs(le.x - ls.x);
      const dz = Math.abs(le.z - ls.z);
      const isCrosswise = dx > dz; // line runs along X axis = perpendicular to board length = cross cut
      const isRipwise = dz > dx;   // line runs along Z axis = along board width = rip cut
      const midX = (ls.x + le.x) / 2;
      const midZ = (ls.z + le.z) / 2;
      // Convert local coords to position from board start
      const cutPos = midX + dimLineAnchorMember.length / 2; // local x=0 is center
      const ripWidth = midZ + dimLineAnchorMember.width / 2;

      return (
        <div className="mb-4 rounded-xl border border-amber-700/50 bg-zinc-900/50 p-3 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-500/90">Dimension Line → Cut</p>
          <p className="text-sm text-zinc-300">
            Board: <strong>{dimLineAnchorMember.label}</strong>
          </p>
          {isCrosswise && cutPos > 0 && cutPos < dimLineAnchorMember.length && (
            <button
              type="button"
              className="btn-primary w-full text-sm"
              onClick={() => {
                splitMemberByCrossCut(dimLineAnchorMember.id, cutPos);
                removeDimensionLine(selectedDimLine.id);
                selectDimensionLine(null);
              }}
            >
              Convert to Cross Cut at {cutPos.toFixed(2)}&quot;
            </button>
          )}
          {isRipwise && ripWidth > 0 && ripWidth < dimLineAnchorMember.width && (
            <button
              type="button"
              className="btn-secondary w-full text-sm"
              onClick={() => {
                splitMemberByRipCut(dimLineAnchorMember.id, ripWidth);
                removeDimensionLine(selectedDimLine.id);
                selectDimensionLine(null);
              }}
            >
              Convert to Rip Cut at {ripWidth.toFixed(2)}&quot;
            </button>
          )}
          {!isCrosswise && !isRipwise && (
            <p className="text-xs text-zinc-500">Line is diagonal — align it with the board axis to convert to a cut.</p>
          )}
          <button
            type="button"
            className="text-xs text-zinc-500 hover:text-zinc-300 w-full text-center"
            onClick={() => selectDimensionLine(null)}
          >
            Dismiss
          </button>
        </div>
      );
    }
  }

  // Finishing panel
  if (finishPanelOpen && selectedMember) {
    const finish = selectedMember.finish ?? { type: 'none' as const };
    const STAIN_COLORS = [
      { label: 'Natural', color: '#c4a265' },
      { label: 'Golden Oak', color: '#b5813b' },
      { label: 'Early American', color: '#8b5e3c' },
      { label: 'Dark Walnut', color: '#5c3a1e' },
      { label: 'Ebony', color: '#2a1a0e' },
      { label: 'Provincial', color: '#7a4f2e' },
      { label: 'Red Mahogany', color: '#7b2d1c' },
    ];
    const PAINT_COLORS = [
      { label: 'White', color: '#f5f5f5' },
      { label: 'Black', color: '#1c1c1c' },
      { label: 'Gray', color: '#6b7280' },
      { label: 'Navy', color: '#1e3a5f' },
      { label: 'Green', color: '#2d6a4f' },
      { label: 'Red', color: '#9b2335' },
    ];
    const swatchList = finish.type === 'stain' ? STAIN_COLORS : finish.type === 'paint' ? PAINT_COLORS : [];

    return (
      <div className="mb-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-3 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-500/90">Finishing</p>
          <button type="button" className="text-xs text-zinc-500 hover:text-zinc-300" onClick={() => setFinishPanelOpen(false)}>✕</button>
        </div>
        <p className="text-sm text-zinc-400">{selectedMember.label}</p>

        <div>
          <p className="text-xs text-zinc-500 mb-1">Finish Type</p>
          <div className="grid grid-cols-2 gap-1">
            {(['none', 'stain', 'paint', 'clear_coat', 'oil'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => updateMemberFinish(selectedMember.id, { ...finish, type: t })}
                className={[
                  'text-sm py-1.5 rounded border capitalize transition-colors',
                  finish.type === t
                    ? 'border-amber-500 bg-amber-500/20 text-amber-200'
                    : 'border-zinc-700 text-zinc-400 hover:border-zinc-500',
                ].join(' ')}
              >
                {t === 'clear_coat' ? 'Clear Coat' : t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {swatchList.length > 0 && (
          <div>
            <p className="text-xs text-zinc-500 mb-1">Color</p>
            <div className="flex flex-wrap gap-1.5">
              {swatchList.map((sw) => (
                <button
                  key={sw.label}
                  type="button"
                  title={sw.label}
                  onClick={() => updateMemberFinish(selectedMember.id, { ...finish, color: sw.color })}
                  className={[
                    'w-7 h-7 rounded-full border-2 transition-all',
                    finish.color === sw.color ? 'border-amber-400 scale-110' : 'border-zinc-600',
                  ].join(' ')}
                  style={{ background: sw.color }}
                />
              ))}
            </div>
          </div>
        )}

        {(finish.type === 'stain' || finish.type === 'paint' || finish.type === 'clear_coat') && (
          <div>
            <p className="text-xs text-zinc-500 mb-1">Sheen</p>
            <div className="flex gap-1">
              {(['matte', 'satin', 'gloss'] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => updateMemberFinish(selectedMember.id, { ...finish, sheen: s })}
                  className={[
                    'flex-1 text-sm py-1 rounded border capitalize transition-colors',
                    finish.sheen === s
                      ? 'border-amber-500 bg-amber-500/20 text-amber-200'
                      : 'border-zinc-700 text-zinc-400 hover:border-zinc-500',
                  ].join(' ')}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        <button
          type="button"
          className="btn-secondary w-full text-sm"
          onClick={() => {
            allMembers.forEach((m) => updateMemberFinish(m.id, { ...finish }));
          }}
        >
          Apply to All Boards
        </button>
      </div>
    );
  }

  function handleSpeciesChange(species: string) {
    const mat = MATERIAL_CATALOG.find((m) => m.name === species);
    setForm((f) => ({
      ...f,
      species,
      category: mat?.category ?? f.category,
      costPerBoardFoot: String(mat?.defaultPrice ?? f.costPerBoardFoot),
    }));
  }

  function handleNominalChange(size: NominalSize) {
    if (size !== 'Custom') {
      const dims = NOMINAL_DIMENSIONS[size];
      setForm((f) => ({
        ...f,
        nominalSize: size,
        thickness: String(dims.thickness),
        width: String(dims.width),
      }));
    } else {
      setForm((f) => ({ ...f, nominalSize: size }));
    }
  }

  function handleAdd() {
    const thickness = parseFloat(form.thickness);
    const width = parseFloat(form.width);
    const length = parseFloat(form.length);
    const cost = parseFloat(form.costPerBoardFoot);
    if (!form.label.trim() || isNaN(thickness) || isNaN(width) || isNaN(length) || isNaN(cost)) return;

    const mat = MATERIAL_CATALOG.find((m) => m.name === form.species);
    addMember({
      id: crypto.randomUUID(),
      label: form.label.trim(),
      category: form.category,
      species: form.species,
      nominalSize: form.nominalSize,
      thickness,
      width,
      length,
      position: [0, thickness / 2, 0],
      rotation: [0, 0, 0],
      costPerBoardFoot: cost,
      color: mat?.color ?? '#d4a96a',
      isSelected: false,
      cuts: [],
      orientation: 'flat',
      loadLbs: 0,
      materialKind: inferMaterialKind(form.species, form.category),
    });
    setForm(DEFAULTS);
  }

  function handleAddCut(type: Parameters<typeof createCutOperation>[0], partnerId?: string) {
    if (!selectedId) return;
    addCut(selectedId, createCutOperation(type, { partnerMemberId: partnerId }));
  }

  function handleJoineryAdd(type: Parameters<typeof createCutOperation>[0]) {
    if (!selectedId) return;
    if (allMembers.length > 1 && !joineryPartnerId) return;
    handleAddCut(type, joineryPartnerId || undefined);
  }

  function handleAddRipCut() {
    if (!selectedId || !selectedMember) return;
    const tw = parseFloat(ripTargetWidth);
    if (isNaN(tw) || tw <= 0 || tw >= selectedMember.width) return;
    splitMemberByRipCut(selectedId, tw);
  }

  function handleAddCrossCut() {
    if (!selectedId || !selectedMember) return;
    // Use ref for always-current value — avoids stale closure on first click
    const pos = parseFloat(crossCutPositionRef.current);
    if (isNaN(pos) || pos <= 0 || pos >= selectedMember.length) return;
    setCrossCutPreviewPosition(null);
    splitMemberByCrossCut(selectedId, pos);
  }

  return (
    <div className="mb-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-3 space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-amber-500/90">
        Active Tool
      </p>

      {activeTool === 'drawBoard' && (
        <div className="space-y-3">
          <p className="text-sm text-zinc-400">
            Click and drag on the grid to draw a board footprint.
          </p>
          <div>
            <p className="text-xs text-zinc-500 mb-2">Material</p>
            <div className="grid grid-cols-2 gap-1.5">
              {MATERIAL_CATALOG.slice(0, 8).map((mat) => (
                <button
                  key={mat.id}
                  type="button"
                  onClick={() => setDrawMaterial(mat.name)}
                  className={[
                    'flex items-center gap-2 text-sm py-1.5 px-2 rounded border transition-colors text-left',
                    selectedDrawMaterial === mat.name
                      ? 'border-amber-500 bg-amber-500/10 text-amber-200'
                      : 'border-zinc-700 text-zinc-300 hover:border-zinc-500',
                  ].join(' ')}
                >
                  <span
                    className="w-4 h-4 rounded-sm flex-shrink-0 border border-zinc-600"
                    style={{ background: mat.color }}
                  />
                  <span className="truncate text-xs">{mat.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTool === 'addBoard' && (
        <div className="flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-sm">
            Label
            <input className="input-field" value={form.label} onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))} placeholder="e.g. Leg A" />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Material
            <select className="input-field" value={form.species} onChange={(e) => handleSpeciesChange(e.target.value)}>
              {MATERIAL_CATALOG.map((m) => <option key={m.id} value={m.name}>{m.name}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Nominal Size
            <select className="input-field" value={form.nominalSize} onChange={(e) => handleNominalChange(e.target.value as NominalSize)}>
              {NOMINAL_SIZES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['thickness', 'width', 'length'] as const).map((field, i) => (
              <label key={field} className="flex flex-col gap-1 text-sm min-w-0">
                <span className="text-zinc-500 text-xs">{['T', 'W', 'L'][i]}</span>
                <input type="number" step="0.25" className="input-field mono-num" value={form[field]} onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))} />
              </label>
            ))}
          </div>
          <button type="button" onClick={handleAdd} className="btn-primary w-full text-sm">Add Board</button>
        </div>
      )}

      {(activeTool === 'cut' || activeTool === 'rip' || activeTool === 'miter' || activeTool === 'joinery' || activeTool === 'trimExtend') && !selectedMember && (
        <p className="text-sm text-zinc-500">Select a board first.</p>
      )}

      {selectedMember && activeTool === 'cut' && (
        <div className="space-y-2">
          <label className="flex flex-col gap-1 text-sm">
            Cut Position (in)
            <input
              type="number"
              step="0.125"
              min="0.125"
              max={selectedMember.length - 0.125}
              className="input-field mono-num"
              value={crossCutPosition}
              onChange={(e) => {
                setCrossCutPosition(e.target.value);
                crossCutPositionRef.current = e.target.value;
                const n = parseFloat(e.target.value);
                if (!isNaN(n) && n > 0 && n < selectedMember.length) {
                  setCrossCutPreviewPosition(n);
                }
              }}
              onKeyDown={(e) => e.stopPropagation()}
            />
          </label>
          <p className="text-xs text-zinc-500">
            Board length: <span className="mono-num">{selectedMember.length}"</span>
            {' · '}Distance from start end
          </p>
          <button type="button" className="btn-secondary w-full text-sm" onClick={handleAddCrossCut}>
            Apply Cross Cut
          </button>
        </div>
      )}
      {selectedMember && activeTool === 'rip' && (
        <div className="space-y-2">
          <label className="flex flex-col gap-1 text-sm">
            Target Width (in)
            <input
              type="number"
              step="0.0625"
              min="0.25"
              max={selectedMember.width - 0.25}
              className="input-field mono-num"
              value={ripTargetWidth}
              onChange={(e) => {
                setRipTargetWidth(e.target.value);
                const n = parseFloat(e.target.value);
                if (!isNaN(n) && n > 0 && n < selectedMember.width) {
                  setRipCutPreviewPosition(n);
                }
              }}
              onKeyDown={(e) => e.stopPropagation()}
            />
          </label>
          <p className="text-xs text-zinc-500">
            Board width: <span className="mono-num">{selectedMember.width}"</span>
            {' · '}Waste:{' '}
            <span className="mono-num">
              {Math.max(0, selectedMember.width - (parseFloat(ripTargetWidth) || 0)).toFixed(3)}"
            </span>
          </p>
          <button type="button" className="btn-secondary w-full text-sm" onClick={handleAddRipCut}>
            Apply Rip Cut
          </button>
        </div>
      )}
      {selectedMember && activeTool === 'miter' && (
        <div className="space-y-2">
          <button type="button" className="btn-secondary w-full text-sm" onClick={() => handleAddCut('miterCut')}>Miter 45°</button>
          <button type="button" className="btn-secondary w-full text-sm" onClick={() => handleAddCut('bevelCut')}>Bevel 30°</button>
        </div>
      )}
      {selectedMember && activeTool === 'joinery' && (
        <div className="space-y-2">
          {allMembers.length > 1 && (
            <label className="flex flex-col gap-1 text-sm">
              Partner board (dual-sided CSG)
              <select
                className="input-field text-sm"
                value={joineryPartnerId}
                onChange={(e) => setJoineryPartnerId(e.target.value)}
              >
                <option value="">Select partner…</option>
                {allMembers.filter((m) => m.id !== selectedMember.id).map((m) => (
                  <option key={m.id} value={m.id}>{m.label}</option>
                ))}
              </select>
            </label>
          )}
          {allMembers.length > 1 && !joineryPartnerId && (
            <p className="text-xs text-amber-500/90">Select a partner board for complementary receiving cuts.</p>
          )}
          {JOINERY_TYPES.map((j) => (
            <button
              key={j.type}
              type="button"
              disabled={allMembers.length > 1 && !joineryPartnerId}
              className="btn-secondary w-full text-sm disabled:opacity-40"
              onClick={() => handleJoineryAdd(j.type)}
            >
              Add {j.label}
            </button>
          ))}
        </div>
      )}

      {selectedMember && selectedMember.cuts.length > 0 && (activeTool === 'cut' || activeTool === 'rip' || activeTool === 'miter' || activeTool === 'joinery') && (
        <ul className="space-y-2 pt-2 border-t border-zinc-800">
          {selectedMember.cuts.map((cut) => (
            <li key={cut.id} className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-2 py-2 space-y-1.5">
              <div className="flex justify-between items-center text-xs text-zinc-400">
                <span>
                  {CUT_TYPES.find((c) => c.type === cut.type)?.label ??
                    JOINERY_TYPES.find((j) => j.type === cut.type)?.label ??
                    cut.type}
                  {cut.partnerMemberId && (
                    <span className="text-zinc-500">
                      {' → '}
                      {allMembers.find((m) => m.id === cut.partnerMemberId)?.label ?? 'partner'}
                    </span>
                  )}
                </span>
                <button type="button" className="text-red-400" onClick={() => removeCut(selectedMember.id, cut.id)}>
                  Remove
                </button>
              </div>
              {cut.type === 'ripCut' && (
                <label className="flex flex-col gap-1 text-xs">
                  Target width (in)
                  <input
                    type="number"
                    step="0.125"
                    min="0.25"
                    max={selectedMember.width - 0.125}
                    className="input-field mono-num text-sm"
                    value={cut.targetWidth ?? selectedMember.width * 0.75}
                    onChange={(e) => {
                      const tw = parseFloat(e.target.value);
                      if (!isNaN(tw) && tw > 0 && tw < selectedMember.width) {
                        updateCut(selectedMember.id, cut.id, { targetWidth: tw });
                      }
                    }}
                  />
                </label>
              )}
            </li>
          ))}
        </ul>
      )}

      {activeTool === 'trimExtend' && selectedMember && allMembers.length > 1 && (
        <TrimExtendPanel memberId={selectedMember.id} />
      )}

      {activeTool === 'joint' && (
        <div className="space-y-3">
          {!selectedMember && (
            <p className="text-sm text-zinc-500">Select a board, then click a face to place a joint marker.</p>
          )}
          <p className="text-sm text-zinc-400">Joint type to place:</p>
          <div className="grid grid-cols-2 gap-1.5">
            {([
              { id: 'pocket_hole', label: 'Pocket Hole' },
              { id: 'mortise',     label: 'Mortise' },
              { id: 'tenon',       label: 'Tenon' },
              { id: 'dovetail',    label: 'Dovetail' },
              { id: 'biscuit',     label: 'Biscuit' },
            ] as const).map((jt) => (
              <button
                key={jt.id}
                type="button"
                onClick={() => setSelectedJointType(selectedJointType === jt.id ? null : jt.id)}
                className={[
                  'text-sm py-2 rounded-lg border font-medium transition-colors',
                  selectedJointType === jt.id
                    ? 'bg-amber-500 text-zinc-900 border-amber-300'
                    : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700',
                ].join(' ')}
              >
                {jt.label}
              </button>
            ))}
          </div>
          {selectedMember && selectedJointType && (
            <p className="text-xs text-amber-400/80">
              Click a face on the board in the viewport to place a{' '}
              <strong>{selectedJointType.replace('_', ' ')}</strong> marker.
            </p>
          )}
          {selectedMember && (selectedMember.jointMarkers ?? []).length > 0 && (
            <button
              type="button"
              className="btn-secondary w-full text-sm"
              onClick={() => clearJointMarkers(selectedMember.id)}
            >
              Clear All Markers on This Board
            </button>
          )}
        </div>
      )}

      {activeTool === 'mate' && (
        <MatePanel
          allMembers={allMembers}
          mateFaceA={mateFaceA}
          mateFaceB={mateFaceB}
          matePickTarget={matePickTarget}
          setMateFaceA={setMateFaceA}
          setMateFaceB={setMateFaceB}
          setMatePickTarget={setMatePickTarget}
          applyMate={applyMate}
        />
      )}
    </div>
  );
}

function MatePanel({
  allMembers,
  mateFaceA,
  mateFaceB,
  matePickTarget,
  setMateFaceA,
  setMateFaceB,
  setMatePickTarget,
  applyMate,
}: {
  allMembers: ReturnType<typeof useAppStore.getState>['project']['members'];
  mateFaceA: { memberId: string; face: FaceId } | null;
  mateFaceB: { memberId: string; face: FaceId } | null;
  matePickTarget: 'A' | 'B';
  setMateFaceA: (sel: { memberId: string; face: FaceId } | null) => void;
  setMateFaceB: (sel: { memberId: string; face: FaceId } | null) => void;
  setMatePickTarget: (target: 'A' | 'B') => void;
  applyMate: () => void;
}) {
  function faceSelect(
    which: 'A' | 'B',
    memberId: string,
    face: FaceId
  ) {
    const sel = { memberId, face };
    if (which === 'A') setMateFaceA(sel);
    else setMateFaceB(sel);
  }

  return (
    <div className="space-y-3">
      {!mateFaceA ? (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-2.5 text-sm text-amber-200">
          <span className="font-bold">Step 1:</span> Click a face dot on the <strong>first board</strong> — it stays still.
        </div>
      ) : !mateFaceB ? (
        <div className="rounded-lg border border-green-500/40 bg-green-500/5 p-2.5 text-sm text-green-200">
          <span className="font-bold">Step 2:</span> Click a face dot on the <strong>second board</strong> — it moves to snap flush.
        </div>
      ) : (
        <div className="rounded-lg border border-zinc-700 p-2.5 text-sm text-zinc-300">
          Both faces selected — click <strong>Apply Mate</strong> to snap them together.
        </div>
      )}
      <p className="text-xs text-zinc-500">
        Click a face on a board in the 3D viewport, or use the dropdowns below.
      </p>
      <div className="grid grid-cols-2 gap-2">
        {(['A', 'B'] as const).map((slot) => (
          <button
            key={slot}
            type="button"
            onClick={() => setMatePickTarget(slot)}
            className={[
              'text-sm py-2 rounded-lg border transition-colors',
              matePickTarget === slot
                ? 'border-amber-500 bg-amber-950/40 text-amber-200'
                : 'border-zinc-700 text-zinc-400 hover:border-zinc-600',
            ].join(' ')}
          >
            Pick face {slot}
          </button>
        ))}
      </div>
      <label className="flex flex-col gap-1 text-sm">
        Board A
        <select
          className="input-field text-sm"
          value={mateFaceA?.memberId ?? ''}
          onChange={(e) => {
            const id = e.target.value;
            if (id) faceSelect('A', id, mateFaceA?.face ?? 'yMax');
            else setMateFaceA(null);
          }}
        >
          <option value="">Select board…</option>
          {allMembers.map((m) => (
            <option key={m.id} value={m.id}>{m.label}</option>
          ))}
        </select>
        {mateFaceA && (
          <select
            className="input-field text-sm"
            value={mateFaceA.face}
            onChange={(e) => setMateFaceA({ ...mateFaceA, face: e.target.value as FaceId })}
          >
            {ALL_FACES.map((f) => (
              <option key={f} value={f}>{FACE_LABELS[f]}</option>
            ))}
          </select>
        )}
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Board B (moves to mate)
        <select
          className="input-field text-sm"
          value={mateFaceB?.memberId ?? ''}
          onChange={(e) => {
            const id = e.target.value;
            if (id) faceSelect('B', id, mateFaceB?.face ?? 'yMin');
            else setMateFaceB(null);
          }}
        >
          <option value="">Select board…</option>
          {allMembers.filter((m) => m.id !== mateFaceA?.memberId).map((m) => (
            <option key={m.id} value={m.id}>{m.label}</option>
          ))}
        </select>
        {mateFaceB && (
          <select
            className="input-field text-sm"
            value={mateFaceB.face}
            onChange={(e) => setMateFaceB({ ...mateFaceB, face: e.target.value as FaceId })}
          >
            {ALL_FACES.map((f) => (
              <option key={f} value={f}>{FACE_LABELS[f]}</option>
            ))}
          </select>
        )}
      </label>
      <button
        type="button"
        disabled={!mateFaceA || !mateFaceB}
        className="btn-primary w-full text-sm disabled:opacity-40"
        onClick={applyMate}
      >
        Apply Mate
      </button>
    </div>
  );
}

function TrimExtendPanel({ memberId }: { memberId: string }) {
  const trimBoundaryId = useAppStore((s) => s.ui.trimBoundaryId);
  const setTrimBoundary = useAppStore((s) => s.setTrimBoundary);
  const trimMember = useAppStore((s) => s.trimMember);
  const extendMember = useAppStore((s) => s.extendMember);
  const allMembers = useAppStore((s) => s.project.members);

  return (
    <div className="space-y-2">
      <label className="flex flex-col gap-1 text-sm">
        Boundary board
        <select className="input-field text-sm" value={trimBoundaryId ?? ''} onChange={(e) => setTrimBoundary(e.target.value || null)}>
          <option value="">Select…</option>
          {allMembers.filter((m) => m.id !== memberId).map((m) => (
            <option key={m.id} value={m.id}>{m.label}</option>
          ))}
        </select>
      </label>
      <div className="grid grid-cols-2 gap-2">
        <button type="button" disabled={!trimBoundaryId} className="btn-secondary text-sm py-2 disabled:opacity-40" onClick={() => trimMember(memberId, trimBoundaryId!)}>Trim</button>
        <button type="button" disabled={!trimBoundaryId} className="btn-secondary text-sm py-2 disabled:opacity-40" onClick={() => extendMember(memberId, trimBoundaryId!)}>Extend</button>
      </div>
    </div>
  );
}
