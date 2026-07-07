import { useEffect, useState } from 'react';
import { useAppStore } from '../store';
import { formatFractionalInches, parseFractionalInches } from '../lib/fractionalInches';
import { findOpenSpawnPosition } from '../lib/bounds';
import { inferMaterialKind } from '../lib/materials';
import SpeciesSelect from './SpeciesSelect';
import { NOMINAL_DIMENSIONS } from '../types';
import type { NominalSize } from '../types';

/**
 * Data Flow Pipeline: Insert Tool (New Order 3, updated New Order 3.1 —
 * dropdown presets + species selector)
 *
 * INPUT: length/width/thickness typed as fractional-inch text (or filled by a
 *   preset picked from the size dropdown), ui.drawDefaults.species/category/
 *   color (the same board-material defaults Sketch reads/writes, kept in
 *   sync solely by the existing store.setDrawMaterial() lookup — no second
 *   species list or color-inference copy lives in this file), and the
 *   current project.members list (for collision-aware placement).
 *
 * CALCULATION: typed text -> parseFractionalInches -> decimal inches, clamped
 *   to a sane positive minimum on commit. Placement is derived, never typed
 *   by the user: findOpenSpawnPosition(members, [length, thickness, width])
 *   (existing lib/bounds.ts helper) walks +X from the origin in fixed steps,
 *   testing an AABB overlap (getMemberWorldBox) against every existing
 *   member, and returns the first non-overlapping [x, thickness/2, z] — so a
 *   board already sitting at the origin (or any prior Insert/Sketch board)
 *   is naturally stepped around, never clipped into. Size-preset picks only
 *   overwrite the three pending numeric fields (never species/category);
 *   species picks flow through store.setDrawMaterial(), which looks up
 *   MATERIAL_CATALOG and writes species+category+color together, so a board's
 *   wood-family label always matches its chosen species instead of whatever
 *   size preset happened to be picked last. Placing still goes through the
 *   exact same commit path as a fully hand-typed entry.
 *
 * OUTPUT: a single WoodMember (parameters only: length/width/thickness,
 *   category/species/color, position/rotation) via the existing addMember()
 *   action — identical shape to what Sketch's finalizeBoard() already
 *   writes. No mesh/vertex/texture data is created here.
 *
 * RENDER: BoardMesh.tsx derives geometry fresh from length/thickness/width
 *   via CADGeometryEngine on the very next render, and woodTexture.ts derives
 *   the grain texture fresh from member.color every render — same as every
 *   other board.
 *
 * FOLLOWS-BOARD CHECK: n/a for placement — this creates exactly one new,
 *   independent board and does not track anything relative to another
 *   board's live transform.
 */

interface Preset {
  key: string;
  label: string;
  length: number;
  width: number;
  thickness: number;
  nominalSize: NominalSize;
}

const PRESETS: Preset[] = [
  { key: '1x4', label: '1x4', length: 96, thickness: NOMINAL_DIMENSIONS['1x4'].thickness, width: NOMINAL_DIMENSIONS['1x4'].width, nominalSize: '1x4' },
  { key: '1x6', label: '1x6', length: 96, thickness: NOMINAL_DIMENSIONS['1x6'].thickness, width: NOMINAL_DIMENSIONS['1x6'].width, nominalSize: '1x6' },
  { key: '1x8', label: '1x8', length: 96, thickness: NOMINAL_DIMENSIONS['1x8'].thickness, width: NOMINAL_DIMENSIONS['1x8'].width, nominalSize: '1x8' },
  { key: '2x4', label: '2x4', length: 96, thickness: NOMINAL_DIMENSIONS['2x4'].thickness, width: NOMINAL_DIMENSIONS['2x4'].width, nominalSize: '2x4' },
  { key: '2x6', label: '2x6', length: 96, thickness: NOMINAL_DIMENSIONS['2x6'].thickness, width: NOMINAL_DIMENSIONS['2x6'].width, nominalSize: '2x6' },
  { key: '4x4', label: '4x4', length: 96, thickness: NOMINAL_DIMENSIONS['4x4'].thickness, width: NOMINAL_DIMENSIONS['4x4'].width, nominalSize: '4x4' },
  { key: 'plywood34', label: '3/4" Plywood Sheet', length: 96, width: 48, thickness: 0.75, nominalSize: 'Custom' },
  { key: 'plywood12', label: '1/2" Plywood Sheet', length: 96, width: 48, thickness: 0.5, nominalSize: 'Custom' },
  { key: 'osb34', label: '3/4" OSB Sheet', length: 96, width: 48, thickness: 0.75, nominalSize: 'Custom' },
  { key: 'osb716', label: '7/16" OSB Sheet', length: 96, width: 48, thickness: 0.4375, nominalSize: 'Custom' },
];

export default function InsertPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const members = useAppStore((s) => s.project.members);
  const drawDefaults = useAppStore((s) => s.ui.drawDefaults);
  const addMember = useAppStore((s) => s.addMember);
  const selectMember = useAppStore((s) => s.selectMember);
  const setActiveTool = useAppStore((s) => s.setActiveTool);
  const setLastPlacedMemberId = useAppStore((s) => s.setLastPlacedMemberId);
  const setDrawMaterial = useAppStore((s) => s.setDrawMaterial);

  // Requirement 6: inputs stay populated with the last-used dimensions after
  // each insert — plain component state that simply never gets reset on
  // place, no history dropdown yet. Fix 1: default Length is now 36" (was 96").
  const [length, setLength] = useState(36);
  const [width, setWidth] = useState(3.5);
  const [thickness, setThickness] = useState(1.5);
  const [nominalSize, setNominalSize] = useState<NominalSize>('2x4');
  const [presetKey, setPresetKey] = useState('2x4');

  if (!open) return null;

  function applyPreset(p: Preset) {
    setLength(p.length);
    setWidth(p.width);
    setThickness(p.thickness);
    setNominalSize(p.nominalSize);
    setPresetKey(p.key);
  }

  function handlePlace() {
    const species = drawDefaults.species;
    // Fix 4: category is derived solely from the chosen species (via
    // ui.drawDefaults.category, kept in sync by store.setDrawMaterial) —
    // never from the size preset, so a board's wood-family label always
    // matches its species regardless of which size preset was picked.
    const category = drawDefaults.category;
    const kind = inferMaterialKind(species, category);
    const position = findOpenSpawnPosition(members, [length, thickness, width]);
    const id = crypto.randomUUID();

    addMember({
      id,
      label: `Board ${Date.now().toString(36).slice(-4)}`,
      category,
      species,
      nominalSize,
      thickness,
      width,
      length,
      position,
      rotation: [0, 0, 0],
      costPerBoardFoot: 3.5,
      color: drawDefaults.color,
      isSelected: false,
      cuts: [],
      orientation: 'flat',
      loadLbs: 0,
      materialKind: kind,
    });

    // Requirement 5: new board is selected under Select, never auto-switched to Move.
    setActiveTool('select');
    selectMember(id);
    setLastPlacedMemberId(id);
  }

  return (
    <div className="absolute top-16 left-4 bg-zinc-900 border border-zinc-700 rounded p-3 flex flex-col gap-2 text-base text-zinc-200 w-64 z-10">
      <div className="flex items-center justify-between">
        <div className="font-semibold text-white">Insert Board</div>
        <button onClick={onClose} className="text-zinc-400 hover:text-white text-base px-1">
          ✕
        </button>
      </div>

      <label className="flex items-center justify-between gap-2">
        <span>Preset</span>
        <select
          value={presetKey}
          onChange={(e) => {
            const p = PRESETS.find((x) => x.key === e.target.value);
            if (p) applyPreset(p);
          }}
          className="w-40 bg-zinc-800 border border-zinc-600 rounded px-2 py-1 text-base text-white"
        >
          {PRESETS.map((p) => (
            <option key={p.key} value={p.key}>
              {p.label}
            </option>
          ))}
        </select>
      </label>

      <label className="flex items-center justify-between gap-2">
        <span>Species</span>
        <SpeciesSelect
          value={drawDefaults.species}
          onChange={setDrawMaterial}
          className="w-40 bg-zinc-800 border border-zinc-600 rounded px-2 py-1 text-base text-white"
        />
      </label>

      <FractionalField label="Length" value={length} onCommit={setLength} />
      <FractionalField label="Width" value={width} onCommit={setWidth} />
      <FractionalField label="Thickness" value={thickness} onCommit={setThickness} />

      <button
        onClick={handlePlace}
        className="mt-1 px-3 py-1.5 rounded text-base border bg-orange-600 border-orange-500 text-white hover:bg-orange-500"
      >
        Place
      </button>
    </div>
  );
}

/** Fractional-inch text input: displays formatted while idle, parses on commit. */
function FractionalField({
  label,
  value,
  onCommit,
}: {
  label: string;
  value: number;
  onCommit: (value: number) => void;
}) {
  const [text, setText] = useState(formatFractionalInches(value));

  useEffect(() => {
    setText(formatFractionalInches(value));
  }, [value]);

  function commit() {
    const parsed = parseFractionalInches(text);
    if (parsed !== null && parsed > 0) {
      onCommit(parsed);
    } else {
      setText(formatFractionalInches(value));
    }
  }

  return (
    <label className="flex items-center justify-between gap-2">
      <span>{label}</span>
      <input
        type="text"
        inputMode="decimal"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
        }}
        className="w-24 bg-zinc-800 border border-zinc-600 rounded px-2 py-1 text-base text-white"
      />
    </label>
  );
}
