import { useAppStore } from '../store';
import type { EdgeTreatmentType } from '../types';
import { getParallelEdgeIndices } from '../lib/edgeTreatments';
import { useState } from 'react';

export default function EdgeTreatmentPanel() {
  const memberId = useAppStore((s) => s.ui.edgeToolMemberId);
  const edgeIndex = useAppStore((s) => s.ui.edgeSelectedIndex);
  const member = useAppStore((s) =>
    s.project.members.find((m) => m.id === s.ui.edgeToolMemberId)
  );
  const addEdgeTreatment = useAppStore((s) => s.addEdgeTreatment);
  const setEdgeToolMemberId = useAppStore((s) => s.setEdgeToolMemberId);
  const setEdgeSelectedIndex = useAppStore((s) => s.setEdgeSelectedIndex);
  const setActiveTool = useAppStore((s) => s.setActiveTool);

  const [type, setType] = useState<EdgeTreatmentType>('chamfer');
  const [depth, setDepth] = useState('0.125');
  const [radius, setRadius] = useState('0.25');
  const [applyParallel, setApplyParallel] = useState(false);

  if (!memberId || edgeIndex === null || !member) return null;
  const idx = edgeIndex;

  function apply() {
    const d = parseFloat(depth);
    const r = parseFloat(radius);
    const indices = applyParallel ? getParallelEdgeIndices(idx) : [idx];
    for (const i of indices) {
      addEdgeTreatment({
        id: crypto.randomUUID(),
        memberId: member!.id,
        edgeIndex: i,
        type,
        depth: isNaN(d) ? 0.125 : d,
        radius: isNaN(r) ? 0.25 : r,
      });
    }
    setEdgeSelectedIndex(null);
    setEdgeToolMemberId(null);
    setActiveTool('select');
  }

  return (
    <div className="absolute top-20 left-1/2 -translate-x-1/2 z-40 bg-zinc-950/95 border-2 border-amber-500/60 rounded-xl p-4 space-y-3 pointer-events-auto min-w-[280px]">
      <p className="text-base font-semibold text-amber-200">Edge Treatment — {member.label}</p>
      <label className="flex flex-col gap-1 text-base text-zinc-300">
        Treatment type
        <select className="input-field text-base" value={type} onChange={(e) => setType(e.target.value as EdgeTreatmentType)}>
          <option value="none">No treatment</option>
          <option value="chamfer">Chamfer</option>
          <option value="fillet">Fillet / Round-over</option>
          <option value="cove">Cove</option>
          <option value="ogee">Ogee</option>
          <option value="rabbet">Rabbet</option>
          <option value="beading">Beading</option>
        </select>
      </label>
      <label className="flex flex-col gap-1 text-base text-zinc-300">
        Depth (inches)
        <input type="text" className="input-field text-base" value={depth} onChange={(e) => setDepth(e.target.value)} />
      </label>
      <label className="flex flex-col gap-1 text-base text-zinc-300">
        Radius (inches)
        <input type="text" className="input-field text-base" value={radius} onChange={(e) => setRadius(e.target.value)} />
      </label>
      <label className="flex items-center gap-2 text-base text-zinc-300">
        <input type="checkbox" checked={applyParallel} onChange={(e) => setApplyParallel(e.target.checked)} className="w-4 h-4" />
        Apply to all parallel edges
      </label>
      <button type="button" className="btn-primary w-full text-base" onClick={apply}>
        Apply
      </button>
    </div>
  );
}
