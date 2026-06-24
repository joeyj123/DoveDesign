import { useEffect, useRef, useState } from 'react';
import { useAppStore } from '../store';

const SEGMENTS = [
  { id: 'dimensions', label: 'Dims', title: 'Quick Dimensions' },
  { id: 'mate', label: 'Mate', title: 'Mate faces' },
  { id: 'edge', label: 'Edge', title: 'Edge treatment' },
  { id: 'flip', label: 'Flip', title: 'Flip across longest axis' },
  { id: 'delete', label: 'Delete', title: 'Delete board' },
] as const;

const ARC_OFFSETS = [-28, -14, 0, 14, 28];

export default function RadialOrbitalSelector() {
  const open = useAppStore((s) => s.ui.radialWheelOpen);
  const collapsed = useAppStore((s) => s.ui.radialWheelCollapsed);
  const bounds = useAppStore((s) => s.ui.memberScreenBounds);
  const selectedId = useAppStore((s) => s.ui.selectedMemberId);
  const members = useAppStore((s) => s.project.members);

  const setRadialWheelOpen = useAppStore((s) => s.setRadialWheelOpen);
  const setRadialWheelCollapsed = useAppStore((s) => s.setRadialWheelCollapsed);
  const setQuickDimensionsOpen = useAppStore((s) => s.setQuickDimensionsOpen);
  const setEdgeToolMemberId = useAppStore((s) => s.setEdgeToolMemberId);
  const setActiveTool = useAppStore((s) => s.setActiveTool);
  const setMatePickTarget = useAppStore((s) => s.setMatePickTarget);
  const setMateFaceA = useAppStore((s) => s.setMateFaceA);
  const updateMember = useAppStore((s) => s.updateMember);
  const removeMember = useAppStore((s) => s.removeMember);
  const selectMember = useAppStore((s) => s.selectMember);

  const [deleteArmed, setDeleteArmed] = useState(false);
  const wheelRef = useRef<HTMLDivElement>(null);
  const deleteTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!open) setDeleteArmed(false);
  }, [open, selectedId]);

  useEffect(() => {
    if (!open || collapsed) return;
    function onClickOutside(e: MouseEvent) {
      if (wheelRef.current && !wheelRef.current.contains(e.target as Node)) {
        setDeleteArmed(false);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [open, collapsed]);

  if (!open || !bounds || !selectedId) return null;

  const anchorLeft = Math.max(8, bounds.left + 4);
  const anchorTop = Math.max(8, bounds.top + 4);

  function flipLongestAxis(memberId: string) {
    const m = members.find((mem) => mem.id === memberId);
    if (!m) return;
    const dims = [
      { rotIdx: 0, size: m.length },
      { rotIdx: 1, size: m.thickness },
      { rotIdx: 2, size: m.width },
    ];
    const longest = dims.reduce((a, b) => (b.size > a.size ? b : a));
    const newRot: [number, number, number] = [...m.rotation];
    newRot[longest.rotIdx] += Math.PI;
    updateMember(memberId, { rotation: newRot });
  }

  function armDelete() {
    setDeleteArmed(true);
    if (deleteTimerRef.current) clearTimeout(deleteTimerRef.current);
    deleteTimerRef.current = setTimeout(() => setDeleteArmed(false), 4000);
  }

  function handleSegment(segId: (typeof SEGMENTS)[number]['id']) {
    switch (segId) {
      case 'dimensions':
        setQuickDimensionsOpen(true);
        setRadialWheelCollapsed(true);
        break;
      case 'mate':
        setActiveTool('mate');
        setMatePickTarget('A');
        setMateFaceA(null);
        setRadialWheelCollapsed(true);
        break;
      case 'edge':
        setActiveTool('edge');
        setEdgeToolMemberId(selectedId!);
        setRadialWheelCollapsed(true);
        break;
      case 'flip':
        flipLongestAxis(selectedId!);
        setRadialWheelCollapsed(true);
        break;
      case 'delete':
        if (!deleteArmed) {
          armDelete();
          return;
        }
        if (deleteTimerRef.current) clearTimeout(deleteTimerRef.current);
        removeMember(selectedId!);
        selectMember(null);
        setRadialWheelOpen(false);
        setDeleteArmed(false);
        break;
    }
  }

  if (collapsed) {
    return (
      <div
        className="absolute z-40 pointer-events-auto"
        style={{ left: anchorLeft, top: anchorTop }}
      >
        <button
          type="button"
          title="Show action wheel"
          onClick={() => setRadialWheelCollapsed(false)}
          className="text-xs px-2.5 py-1 rounded-full border border-zinc-600 bg-zinc-950/60 text-zinc-300 font-semibold"
        >
          •••
        </button>
      </div>
    );
  }

  return (
    <div
      ref={wheelRef}
      className="absolute z-40 pointer-events-none"
      style={{ left: anchorLeft, top: anchorTop, maxWidth: 200 }}
    >
      <div
        className="flex items-start gap-0.5 pointer-events-auto origin-top-left"
        style={{ animation: 'wheelIn 120ms ease-out' }}
      >
        <button
          type="button"
          title="Hide action wheel"
          onClick={() => setRadialWheelCollapsed(true)}
          className="text-xs px-2.5 py-1 rounded-full border border-zinc-600 bg-zinc-950/60 text-zinc-300 shrink-0 self-start"
        >
          •••
        </button>

        <div className="flex flex-wrap items-center gap-0.5 max-w-[168px] p-1 rounded bg-zinc-950/60 border border-zinc-700/60 backdrop-blur-sm">
          {SEGMENTS.map((seg, i) => (
            <button
              key={seg.id}
              type="button"
              title={seg.id === 'delete' && deleteArmed ? 'Click again to confirm' : seg.title}
              onClick={() => handleSegment(seg.id)}
              className={[
                'text-xs rounded-full border font-medium whitespace-nowrap transition-colors',
                seg.id === 'delete' && deleteArmed
                  ? 'px-2.5 py-1 border-red-500 bg-red-950/70 text-red-100'
                  : 'px-[10px] py-1 border-amber-500/50 text-amber-100 hover:bg-amber-950/50 hover:border-amber-400',
              ].join(' ')}
              style={{ transform: `translateY(${ARC_OFFSETS[i] * 0.15}px)` }}
            >
              {seg.id === 'delete' && deleteArmed ? 'Confirm?' : seg.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
