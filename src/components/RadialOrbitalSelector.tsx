import { useEffect, useRef, useState } from 'react';
import { useAppStore } from '../store';
import type { JoinMethod } from '../types';

const SEGMENTS = [
  { id: 'dimensions', label: 'Quick Dimensions', angle: 0 },
  { id: 'mate', label: 'Mate', angle: 45 },
  { id: 'join', label: 'Join Method', angle: 90 },
  { id: 'edge', label: 'Chamfer / Edge', angle: 135 },
  { id: 'duplicate', label: 'Duplicate', angle: 180 },
  { id: 'mirror', label: 'Mirror', angle: 225 },
  { id: 'isolate', label: 'Isolate', angle: 270 },
  { id: 'delete', label: 'Delete', angle: 315 },
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

const WHEEL_R = 110;
const INNER_R = 52;

function polarToXY(angleDeg: number, radius: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: Math.cos(rad) * radius, y: Math.sin(rad) * radius };
}

export default function RadialOrbitalSelector() {
  const open = useAppStore((s) => s.ui.radialWheelOpen);
  const mode = useAppStore((s) => s.ui.radialWheelMode);
  const bounds = useAppStore((s) => s.ui.memberScreenBounds);
  const selectedId = useAppStore((s) => s.ui.selectedMemberId);
  const selectedMateId = useAppStore((s) => s.ui.selectedMateId);
  const mates = useAppStore((s) => s.project.mates);
  const isolatedMemberId = useAppStore((s) => s.ui.isolatedMemberId);

  const setRadialWheelOpen = useAppStore((s) => s.setRadialWheelOpen);
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
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setRadialWheelOpen(false);
        setShowJoinSub(false);
      }
    }
    function onClickOutside(e: MouseEvent) {
      if (wheelRef.current && !wheelRef.current.contains(e.target as Node)) {
        setRadialWheelOpen(false);
        setShowJoinSub(false);
      }
    }
    window.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClickOutside);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClickOutside);
    };
  }, [open, setRadialWheelOpen]);

  if (!open || !bounds || !selectedId) return null;

  const cx = (bounds.left + bounds.right) / 2;
  const cy = (bounds.top + bounds.bottom) / 2 - WHEEL_R - 40;
  const size = (WHEEL_R + 24) * 2;

  function isDisabled(segId: string): boolean {
    if (segId === 'join' && !hasMate) return true;
    if (segId === 'edge') return false;
    return false;
  }

  function handleSegment(segId: string) {
    if (isDisabled(segId)) return;
    switch (segId) {
      case 'dimensions':
        setQuickDimensionsOpen(true);
        setRadialWheelOpen(false);
        break;
      case 'mate':
        setActiveTool('mate');
        setMatePickTarget('A');
        setMateFaceA(null);
        setRadialWheelOpen(false);
        break;
      case 'join':
        setShowJoinSub(true);
        break;
      case 'edge':
        setActiveTool('edge');
        setEdgeToolMemberId(selectedId!);
        setRadialWheelOpen(false);
        break;
      case 'duplicate':
        duplicateMember(selectedId!);
        setRadialWheelOpen(false);
        break;
      case 'mirror':
        mirrorMember(selectedId!, 'x');
        setRadialWheelOpen(false);
        break;
      case 'isolate':
        setIsolatedMember(isolatedMemberId === selectedId ? null : selectedId);
        setRadialWheelOpen(false);
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
    setRadialWheelOpen(false);
  }

  const showJoin = showJoinSub || mode === 'joinOnly';

  return (
    <div
      ref={wheelRef}
      className="absolute z-40"
      style={{ left: cx - WHEEL_R - 24, top: cy - WHEEL_R - 24, width: size, height: size, pointerEvents: 'none' }}
    >
      {!showJoin && (
        <div
          className="absolute inset-0 flex items-center justify-center origin-center scale-0 animate-[wheelIn_150ms_ease-out_forwards]"
          style={{ pointerEvents: 'auto' }}
        >
          <svg width={size} height={size} className="overflow-visible">
            <circle
              cx={WHEEL_R + 24}
              cy={WHEEL_R + 24}
              r={WHEEL_R}
              fill="rgba(9,9,11,0.78)"
              stroke="#52525b"
              strokeWidth={2}
            />
            {SEGMENTS.map((seg) => {
              const disabled = isDisabled(seg.id);
              const { x, y } = polarToXY(seg.angle, (WHEEL_R + INNER_R) / 2);
              const lx = WHEEL_R + 24 + x;
              const ly = WHEEL_R + 24 + y;
              const startAngle = seg.angle - 22.5;
              const endAngle = seg.angle + 22.5;
              const toRad = (d: number) => ((d - 90) * Math.PI) / 180;
              const x1 = WHEEL_R + 24 + Math.cos(toRad(startAngle)) * INNER_R;
              const y1 = WHEEL_R + 24 + Math.sin(toRad(startAngle)) * INNER_R;
              const x2 = WHEEL_R + 24 + Math.cos(toRad(endAngle)) * INNER_R;
              const y2 = WHEEL_R + 24 + Math.sin(toRad(endAngle)) * INNER_R;
              const x3 = WHEEL_R + 24 + Math.cos(toRad(endAngle)) * WHEEL_R;
              const y3 = WHEEL_R + 24 + Math.sin(toRad(endAngle)) * WHEEL_R;
              const x4 = WHEEL_R + 24 + Math.cos(toRad(startAngle)) * WHEEL_R;
              const y4 = WHEEL_R + 24 + Math.sin(toRad(startAngle)) * WHEEL_R;
              return (
                <g
                  key={seg.id}
                  style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}
                  onClick={() => handleSegment(seg.id)}
                >
                  <path
                    d={`M ${x1} ${y1} A ${INNER_R} ${INNER_R} 0 0 1 ${x2} ${y2} L ${x3} ${y3} A ${WHEEL_R} ${WHEEL_R} 0 0 0 ${x4} ${y4} Z`}
                    fill={disabled ? 'rgba(63,63,70,0.5)' : 'rgba(251,191,36,0.18)'}
                    stroke="#71717a"
                    strokeWidth={1}
                  />
                  <text
                    x={lx}
                    y={ly}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill={disabled ? '#71717a' : '#fafafa'}
                    fontSize={16}
                    style={{ pointerEvents: 'none' }}
                  >
                    {seg.label.split(' ').map((w, i) => (
                      <tspan key={i} x={lx} dy={i === 0 ? 0 : 12}>{w}</tspan>
                    ))}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      )}

      {showJoin && (
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-zinc-950/95 border-2 border-violet-600 rounded-xl p-3 space-y-1 min-w-[220px] max-h-[320px] overflow-y-auto"
          style={{ pointerEvents: 'auto' }}
        >
          <p className="text-base font-semibold text-violet-200 mb-2">Join Method</p>
          {JOIN_METHODS.map((method) => (
            <button
              key={method}
              type="button"
              className="block w-full text-left text-base px-3 py-2 rounded-lg border border-zinc-700 hover:border-violet-500 hover:bg-violet-950/40 text-zinc-200"
              onClick={() => handleJoinMethod(method)}
            >
              {method}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
