import { useEffect, useState } from 'react';
import { useAppStore } from '../store';
import type { WoodMember } from '../types';
import { formatFractionalInches, parseFractionalInches } from '../lib/fractionalInches';
import EditableLabel from './EditableLabel';
import Tooltip from './Tooltip';
import SpeciesSelect from './SpeciesSelect';
import { getMaterialByName } from '../lib/materials';

/**
 * Data Flow Pipeline: Board Edit Panel (New Order 1.2/1.3, restructured New Order 5)
 *
 * INPUT: the selected WoodMember (now passed in by PropertiesPanel, which
 *   owns the single ui.selectedMemberId lookup for the whole contextual
 *   panel rather than this component re-deriving it independently), and
 *   fractional-inch text typed into each field (e.g. "24 1/2").
 *
 * CALCULATION: typed text is parsed via parseFractionalInches to a decimal
 *   inch number, then clamped to a sane positive minimum. When thickness
 *   changes, position[1] (vertical center) is recalculated as newThickness / 2
 *   in the same patch, since a board always rests on the ground plane — this
 *   is a derived placement value, never an independent fact a user edits
 *   directly.
 *
 * OUTPUT: updateMember(id, patch) — a parameter patch, never a mesh/vertex
 *   edit. The store only ever holds decimal inches; formatFractionalInches/
 *   parseFractionalInches is a display/input-layer wrapper only.
 *
 * FOLLOWS-BOARD CHECK: yes, automatically — BoardMesh.tsx's geometry useMemo
 *   depends on member.length/thickness/width, so it re-derives fresh on the
 *   very next render once updateMember commits the patch.
 *
 * New Order 6.3: added a Species dropdown (reusing the same SpeciesSelect
 * component/WOOD_SPECIES_LIST every other species picker in the app uses —
 * CAD_MANIFESTO.md Law 3, no second list). Calls
 * updateMember(id, { species, color }) with BOTH fields in one patch —
 * migrateMember's `color: m.color ?? mat?.color ?? '#d4a96a'` only fills in
 * a MISSING color (its job is migrating old saves that predate the color
 * field), so on an already-placed board it would otherwise keep the OLD
 * color forever once one is set (confirmed live: swapping species alone
 * left the board visually unchanged). Setting `color` explicitly here
 * matches the existing convention every other species picker already
 * follows (store.ts's setDrawMaterial sets species + color together too).
 * BoardMesh.tsx's grain-texture useMemo keys off member.color, so once
 * color actually changes the swap is live with no re-placement needed.
 */
export default function BoardEditPanel({ member }: { member: WoodMember }) {
  const updateMember = useAppStore((s) => s.updateMember);
  const mirrorMember = useAppStore((s) => s.mirrorMember);

  function handleCommit(field: 'length' | 'width' | 'thickness', value: number) {
    const clamped = Math.max(0.25, value);
    if (field === 'thickness') {
      updateMember(member.id, {
        thickness: clamped,
        position: [member.position[0], clamped / 2, member.position[2]],
      });
    } else {
      updateMember(member.id, { [field]: clamped });
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <EditableLabel
        value={member.label}
        onCommit={(v) => updateMember(member.id, { label: v })}
        className="font-semibold text-white"
        showEditIcon
      />

      <Tooltip side="left" info={{ label: 'Species', description: 'Wood species — changes color and grain instantly, no need to re-place the board.' }}>
        <label className="flex items-center justify-between gap-2 w-full">
          <span>Species</span>
          <SpeciesSelect
            value={member.species}
            onChange={(species) =>
              updateMember(member.id, { species, color: getMaterialByName(species)?.color ?? member.color })
            }
            className="w-36 bg-charcoal-800 border border-charcoal-600 rounded px-2 py-1 text-base text-white"
          />
        </label>
      </Tooltip>

      {member.shapeType === 'customPolygon' ? (
        <p className="text-xs text-charcoal-500">
          Length/Width shown here are just this custom shape's bounding-box
          size — its real footprint came from the Template sketch it was
          extruded from and isn't edited here.
        </p>
      ) : (
        <>
          <Tooltip side="left" info={{ label: 'Length', description: 'Board length, measured along its long axis.' }}>
            <label className="flex items-center justify-between gap-2 w-full">
              <span>Length</span>
              <FractionalInput value={member.length} onCommit={(v) => handleCommit('length', v)} />
            </label>
          </Tooltip>

          <Tooltip side="left" info={{ label: 'Width', description: 'Board width, measured across its face.' }}>
            <label className="flex items-center justify-between gap-2 w-full">
              <span>Width</span>
              <FractionalInput value={member.width} onCommit={(v) => handleCommit('width', v)} />
            </label>
          </Tooltip>
        </>
      )}

      <Tooltip side="left" info={{ label: 'Thickness', description: 'Board thickness — also recenters it on the ground plane.' }}>
        <label className="flex items-center justify-between gap-2 w-full">
          <span>Thickness</span>
          <FractionalInput value={member.thickness} onCommit={(v) => handleCommit('thickness', v)} />
        </label>
      </Tooltip>

      <Tooltip side="left" info={{ label: 'Mirror', description: 'Add a mirrored copy of this board, flipped across the world origin on the chosen axis.' }}>
        <div className="flex items-center justify-between gap-2 w-full">
          <span>Mirror</span>
          <div className="flex gap-1">
            {(['x', 'y', 'z'] as const).map((axis) => (
              <button
                key={axis}
                type="button"
                onClick={() => mirrorMember(member.id, axis)}
                className="w-8 px-1 py-1 rounded text-base border bg-charcoal-800 border-charcoal-700 text-charcoal-200 hover:bg-charcoal-700 hover:border-spruce-700/60"
              >
                {axis.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </Tooltip>
    </div>
  );
}

/** Fractional-inch text input: displays formatted while idle, parses on commit. */
function FractionalInput({
  value,
  onCommit,
}: {
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
    <input
      type="text"
      inputMode="decimal"
      value={text}
      onChange={(e) => setText(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
      }}
      className="w-24 bg-charcoal-800 border border-charcoal-600 rounded px-2 py-1 text-base text-white"
    />
  );
}
