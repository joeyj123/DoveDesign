import { useEffect, useState } from 'react';
import { useAppStore } from '../store';
import { formatFractionalInches, parseFractionalInches } from '../lib/fractionalInches';

/**
 * Data Flow Pipeline: Board Edit Panel (New Order 1.2/1.3)
 *
 * INPUT: ui.selectedMemberId, the matching WoodMember's current
 *   length/width/thickness/position, and fractional-inch text typed into
 *   each input (e.g. "24 1/2").
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
 */
export default function BoardEditPanel() {
  const selectedMemberId = useAppStore((s) => s.ui.selectedMemberId);
  const member = useAppStore((s) =>
    s.project.members.find((m) => m.id === s.ui.selectedMemberId)
  );
  const updateMember = useAppStore((s) => s.updateMember);

  if (!selectedMemberId || !member) return null;

  function handleCommit(field: 'length' | 'width' | 'thickness', value: number) {
    const clamped = Math.max(0.25, value);
    if (field === 'thickness') {
      updateMember(member!.id, {
        thickness: clamped,
        position: [member!.position[0], clamped / 2, member!.position[2]],
      });
    } else {
      updateMember(member!.id, { [field]: clamped });
    }
  }

  return (
    <div className="absolute top-4 right-4 bg-zinc-900 border border-zinc-700 rounded p-3 flex flex-col gap-2 text-base text-zinc-200 w-56">
      <div className="font-semibold text-white">{member.label}</div>

      <label className="flex items-center justify-between gap-2">
        <span>Length</span>
        <FractionalInput value={member.length} onCommit={(v) => handleCommit('length', v)} />
      </label>

      <label className="flex items-center justify-between gap-2">
        <span>Width</span>
        <FractionalInput value={member.width} onCommit={(v) => handleCommit('width', v)} />
      </label>

      <label className="flex items-center justify-between gap-2">
        <span>Thickness</span>
        <FractionalInput value={member.thickness} onCommit={(v) => handleCommit('thickness', v)} />
      </label>
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
      className="w-24 bg-zinc-800 border border-zinc-600 rounded px-2 py-1 text-base text-white"
    />
  );
}
