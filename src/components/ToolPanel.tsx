import { useState, useEffect } from 'react';
import { useAppStore } from '../store';
import { NOMINAL_DIMENSIONS } from '../types';
import type { NominalSize, WoodCategory } from '../types';
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
  const [joineryPartnerId, setJoineryPartnerId] = useState('');

  useEffect(() => {
    if (selectedMember && activeTool === 'joinery') {
      setJoineryPartnerId('');
    }
  }, [selectedMember?.id, activeTool]);

  useEffect(() => {
    if (selectedMember && activeTool === 'rip') {
      setRipTargetWidth(String(Math.max(0.25, selectedMember.width - 0.75)));
    }
  }, [selectedMember?.id, selectedMember?.width, activeTool]);

  if (activeTool === 'select') return null;

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
    const pos = parseFloat(crossCutPosition);
    if (isNaN(pos) || pos <= 0 || pos >= selectedMember.length) return;
    splitMemberByCrossCut(selectedId, pos);
  }

  return (
    <div className="mb-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-3 space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-amber-500/90">
        Active Tool
      </p>

      {activeTool === 'drawBoard' && (
        <p className="text-sm text-zinc-400">
          Click and drag on the grid to draw a board footprint. Camera locks while dragging.
        </p>
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
              onChange={(e) => setCrossCutPosition(e.target.value)}
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
              step="0.125"
              min="0.25"
              max={selectedMember.width - 0.125}
              className="input-field mono-num"
              value={ripTargetWidth}
              onChange={(e) => setRipTargetWidth(e.target.value)}
            />
          </label>
          <p className="text-xs text-zinc-500">
            Current width: <span className="mono-num">{selectedMember.width}"</span>
            {' · '}Waste:{' '}
            <span className="mono-num">
              {(selectedMember.width - (parseFloat(ripTargetWidth) || 0) - 0.125).toFixed(3)}"
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
      <p className="text-sm text-zinc-400">
        Click a board face in the viewport or use the dropdowns below, then Apply Mate to snap flush.
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
