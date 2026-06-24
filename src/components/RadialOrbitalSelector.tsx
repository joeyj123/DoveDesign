import { useEffect, useRef, useState } from 'react';
import { useAppStore } from '../store';
import type { JoinMethod } from '../types';

const SEGMENTS = [
  { id: 'dimensions', label: 'Dims', title: 'Quick Dimensions' },
  { id: 'mate', label: 'Mate', title: 'Mate' },
  { id: 'join', label: 'Join', title: 'Join Method' },
  { id: 'edge', label: 'Edge', title: 'Chamfer / Edge' },
  { id: 'duplicate', label: 'Copy', title: 'Duplicate' },
  { id: 'mirror', label: 'Mirror', title: 'Mirror' },
  { id: 'isolate', label: 'Solo', title: 'Isolate' },
  { id: 'delete', label: 'Delete', title: 'Delete' },
] as const;

const JOIN_METHODS: JoinMethod[] = [
  'Screws',
  'Nails',
  'Glue',
  'Pocket Holes',
  'Biscuit',
  'Dowel',
  'Bracket / Hardware',
  'Mortise & Tenon',
];

const ARC_ANGLES = [-50, -25, 0, 25, 50, 75, 100, 125];

export default function RadialOrbitalSelector() {
  const open = useAppStore((s) => s.ui.radialWheelOpen);
  const collapsed = useAppStore((s) => s.ui.radialWheelCollapsed);
  const mode = useAppStore((s) => s.ui.radialWheelMode);
  const bounds = useAppStore((s) => s.ui.memberScreenBounds);
  const selectedId = useAppStore((s) => s.ui.selectedMemberId);
  const selectedMateId = useAppStore((s) => s.ui.selectedMateId);
  const mates = useAppStore((s) => s.project.mates);
  const isolatedMemberId = useAppStore((s) => s.ui.isolatedMemberId);

  const setRadialWheelOpen = useAppStore((s) => s.setRadialWheelOpen);
  const setRadialWheelCollapsed = useAppStore((s) => s.setRadialWheelCollapsed);
  const setQuickDimensionsOpen = useAppStore((s) => s.setQuickDimensionsOpen);
  const setEdgeToolMemberId = useAppStore((s) => s.setEdgeToolMemberId);
  const setActiveTool = useAppStore((s) => s.setActiveTool);
  const setMatePickTarget = useAppStore((s) => s.setMatePickTarget);
  const setMateFaceA = useAppStore((s) => s.setMateFaceA);
  const duplicateMember = useAppStore((s) => s.duplicateMember);
  const mirrorMember = useAppStore((s) => s.mirrorMember);
  const setIsolatedMember = useAppStore((s) => s.setIsolatedMember);
  const removeMember = useAppStore((s) => s.removeMember);
  const setMateJoinMethod = useAppStore((s) => s.setMateJoinMethod);
  const selectMember = useAppStore((s) => s.selectMember);

  const [showJoinSub, setShowJoinSub] = useState(false);
  const wheelRef = useRef<HTMLDivElement>(null);

  const memberMates = selectedId
    ? mates.filter((m) => m.memberAId === selectedId || m.memberBId === selectedId)
    : [];
  const hasMate = memberMates.length > 0;
  const activeMateId = selectedMateId ?? memberMates[0]?.id;

  useEffect(() => {
    if (!open) setShowJoinSub(false);
    if (open && mode === 'joinOnly') setShowJoinSub(true);
  }, [open, mode]);

  useEffect(() => {
    if (!open || collapsed) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setRadialWheelOpen(false);
        setShowJoinSub(false);
      }
    }
    function onClickOutside(e: MouseEvent) {
      if (wheelRef.current && !wheelRef.current.contains(e.target as Node)) {
        setShowJoinSub(false);
      }
    }
    window.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClickOutside);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClickOutside);
    };
  }, [open, collapsed, setRadialWheelOpen]);

  if (!open || !bounds || !selectedId) return null;

  const anchorLeft = bounds.left + 4;
  const anchorTop = bounds.top + 4;

  function isDisabled(segId: string): boolean {
    return segId === 'join' && !hasMate;
  }

  function handleSegment(segId: string) {
    if (isDisabled(segId)) return;
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
      case 'join':
        setShowJoinSub(true);
        break;
      case 'edge':
        setActiveTool('edge');
        setEdgeToolMemberId(selectedId!);
        setRadialWheelCollapsed(true);
        break;
      case 'duplicate':
        duplicateMember(selectedId!);
        setRadialWheelCollapsed(true);
        break;
      case 'mirror':
        mirrorMember(selectedId!, 'x');
        setRadialWheelCollapsed(true);
        break;
      case 'isolate':
        setIsolatedMember(isolatedMemberId === selectedId ? null : selectedId);
        setRadialWheelCollapsed(true);
        break;
      case 'delete':
        if (window.confirm('Remove this board from the project?')) {
          removeMember(selectedId!);
          selectMember(null);
        }
        setRadialWheelOpen(false);
        break;
    }
  }

  function handleJoinMethod(method: JoinMethod) {
    if (!activeMateId) return;
    setMateJoinMethod(activeMateId, method);
    setShowJoinSub(false);
    setRadialWheelCollapsed(true);
  }

  const showJoin = showJoinSub || mode === 'joinOnly';

  if (collapsed && !showJoin) {
    return (
      <div
        className="absolute z-40 pointer-events-auto"
        style={{ left: anchorLeft, top: anchorTop }}
      >
        <button
          type="button"
          title="Show action wheel"
          onClick={() => setRadialWheelCollapsed(false)}
          className="text-sm px-2 py-1 rounded-full border-2 border-amber-500/70 bg-zinc-950/60 text-amber-200 font-semibold"
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
      style={{ left: anchorLeft, top: anchorTop }}
    >
      <div className="flex items-start gap-1 pointer-events-auto">
        <button
          type="button"
          title="Hide action wheel"
          onClick={() => setRadialWheelCollapsed(true)}
          className="text-sm px-2 py-1 rounded-full border border-zinc-600 bg-zinc-950/60 text-zinc-300 shrink-0"
        >
          •••
        </button>

        {!showJoin && (
          <div className="flex flex-wrap gap-1 max-w-[200px] p-1.5 rounded-xl bg-zinc-950/60 border border-zinc-700/80 backdrop-blur-sm">
            {SEGMENTS.map((seg, i) => {
              const disabled = isDisabled(seg.id);
              return (
                <button
                  key={seg.id}
                  type="button"
                  title={seg.title}
                  disabled={disabled}
                  onClick={() => handleSegment(seg.id)}
                  className={[
                    'text-sm px-2.5 py-1 rounded-full border font-medium whitespace-nowrap',
                    disabled
                      ? 'border-zinc-700 text-zinc-600 cursor-not-allowed'
                      : 'border-amber-500/50 text-amber-100 hover:bg-amber-950/50 hover:border-amber-400',
                  ].join(' ')}
                  style={{
                    transform: `rotate(${ARC_ANGLES[i] * 0.05}deg)`,
                  }}
                >
                  {seg.label}
                </button>
              );
            })}
          </div>
        )}

        {showJoin && (
          <div className="bg-zinc-950/60 border border-violet-600/70 rounded-xl p-2 space-y-1 min-w-[200px] max-h-[280px] overflow-y-auto backdrop-blur-sm">
            <p className="text-base font-semibold text-violet-200 mb-1 px-1">Join Method</p>
            {JOIN_METHODS.map((method) => (
              <button
                key={method}
                type="button"
                className="block w-full text-left text-base px-3 py-1.5 rounded-lg border border-zinc-700 hover:border-violet-500 hover:bg-violet-950/40 text-zinc-200"
                onClick={() => handleJoinMethod(method)}
              >
                {method}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
