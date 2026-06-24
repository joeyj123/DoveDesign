import { useEffect, useRef, useState, useCallback } from 'react';
import { useAppStore } from '../store';
import { fmtInches, nominalLabel } from '../lib/dimensions';

export default function QuickDimensionsPanel() {
  const selectedMember = useAppStore((s) =>
    s.project.members.find((m) => m.id === s.ui.selectedMemberId)
  );
  const bounds = useAppStore((s) => s.ui.memberScreenBounds);
  const quickOpen = useAppStore((s) => s.ui.quickDimensionsOpen);
  const updateMember = useAppStore((s) => s.updateMember);
  const commitDimensionEdit = useAppStore((s) => s.commitDimensionEdit);
  const setDimensionEditPending = useAppStore((s) => s.setDimensionEditPending);
  const panelRef = useRef<HTMLDivElement>(null);

  const [length, setLength] = useState('');
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [focused, setFocused] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedMember) return;
    setLength(fmtInches(selectedMember.length));
    setWidth(fmtInches(selectedMember.width));
    setHeight(fmtInches(selectedMember.thickness));
  }, [selectedMember?.id, selectedMember?.length, selectedMember?.width, selectedMember?.thickness]);

  const applyField = useCallback(
    (field: 'length' | 'width' | 'thickness', val: string) => {
      if (!selectedMember) return;
      const n = parseFloat(val);
      if (isNaN(n) || n <= 0) return;
      const patch: Partial<typeof selectedMember> = { [field]: n };
      if (field === 'thickness') {
        patch.position = [
          selectedMember.position[0],
          n / 2,
          selectedMember.position[2],
        ];
      }
      setDimensionEditPending(true);
      updateMember(selectedMember.id, patch, true);
    },
    [selectedMember, updateMember, setDimensionEditPending]
  );

  useEffect(() => {
    if (!quickOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        commitDimensionEdit();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [quickOpen, commitDimensionEdit]);

  if (!selectedMember || !bounds || !quickOpen) return null;

  const nom = nominalLabel(
    selectedMember.thickness,
    selectedMember.width,
    selectedMember.nominalSize
  );

  const panelW = 220;
  const left = Math.min(bounds.right - panelW, bounds.right + 8);
  const top = Math.max(8, bounds.top);

  const inputCls = (field: string) =>
    [
      'w-full rounded border px-2 text-sm bg-zinc-900 text-zinc-100 h-8',
      focused === field
        ? 'border-amber-500 ring-2 ring-amber-500/40'
        : 'border-zinc-600',
    ].join(' ');

  return (
    <div
      ref={panelRef}
      className="floating-panel absolute z-30 pointer-events-auto p-3 space-y-2 max-w-[220px]"
      style={{ left, top, width: panelW }}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <p className="text-sm font-semibold text-amber-200">Quick Dimensions</p>
      {nom && (
        <p className="text-sm text-zinc-400">Nominal: {nom}</p>
      )}
      <label className="flex flex-col gap-1 text-sm text-zinc-300">
        L (length)
        <input
          type="text"
          className={inputCls('length')}
          value={length}
          onChange={(e) => {
            setLength(e.target.value);
            applyField('length', e.target.value);
          }}
          onFocus={() => setFocused('length')}
          onBlur={() => {
            setFocused(null);
            commitDimensionEdit();
          }}
        />
      </label>
      <label className="flex flex-col gap-1 text-sm text-zinc-300">
        W (width)
        <input
          type="text"
          className={inputCls('width')}
          value={width}
          onChange={(e) => {
            setWidth(e.target.value);
            applyField('width', e.target.value);
          }}
          onFocus={() => setFocused('width')}
          onBlur={() => {
            setFocused(null);
            commitDimensionEdit();
          }}
        />
      </label>
      <label className="flex flex-col gap-1 text-sm text-zinc-300">
        H (thickness)
        <input
          type="text"
          className={inputCls('height')}
          value={height}
          onChange={(e) => {
            setHeight(e.target.value);
            applyField('thickness', e.target.value);
          }}
          onFocus={() => setFocused('height')}
          onBlur={() => {
            setFocused(null);
            commitDimensionEdit();
          }}
        />
      </label>
    </div>
  );
}
