import { useEffect, useRef, useState } from 'react';
import { useAppStore } from '../store';

const SEGMENTS = [
  { id: 'dimensions', label: 'Dims', title: 'Quick Dimensions' },
  { id: 'mate', label: 'Mate', title: 'Mate faces' },
  { id: 'edge', label: 'Edge', title: 'Edge treatment' },
  { id: 'flip', label: 'Flip', title: 'Flip across longest axis' },
  { id: 'delete', label: 'Delete', title: 'Delete board' },
] as const;

type SegId = (typeof SEGMENTS)[number]['id'];

const WHEEL_SIZE = 240;
const CENTER = WHEEL_SIZE / 2;
const OUTER_R = 118;
const INNER_R = 34;
const SEG_COUNT = 5;
const SEG_ANGLE = 360 / SEG_COUNT;

function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function segmentPath(i: number) {
  const start = i * SEG_ANGLE;
  const end = start + SEG_ANGLE;
  const p1 = polar(CENTER, CENTER, OUTER_R, start);
  const p2 = polar(CENTER, CENTER, OUTER_R, end);
  const p3 = polar(CENTER, CENTER, INNER_R, end);
  const p4 = polar(CENTER, CENTER, INNER_R, start);
  return `M ${p1.x} ${p1.y} A ${OUTER_R} ${OUTER_R} 0 0 1 ${p2.x} ${p2.y} L ${p3.x} ${p3.y} A ${INNER_R} ${INNER_R} 0 0 0 ${p4.x} ${p4.y} Z`;
}

function segmentMidAngle(i: number) {
  return i * SEG_ANGLE + SEG_ANGLE / 2;
}

function SegmentIcon({ id }: { id: SegId }) {
  const props = {
    width: 20,
    height: 20,
    viewBox: '0 0 20 20',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.5,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  switch (id) {
    case 'dimensions':
      return (
        <svg {...props}>
          <path d="M3 16 L17 16" />
          <path d="M3 16 L3 13" />
          <path d="M7 16 L7 14" />
          <path d="M11 16 L11 13" />
          <path d="M15 16 L15 14" />
          <path d="M17 16 L17 13" />
        </svg>
      );
    case 'mate':
      return (
        <svg {...props}>
          <rect x="2" y="5" width="7" height="10" rx="0.5" />
          <rect x="11" y="5" width="7" height="10" rx="0.5" />
          <path d="M9 10 L11 10" />
        </svg>
      );
    case 'edge':
      return (
        <svg {...props}>
          <path d="M4 16 L16 4" />
          <path d="M4 16 L4 12" />
          <path d="M16 4 L12 4" />
        </svg>
      );
    case 'flip':
      return (
        <svg {...props}>
          <path d="M4 10 L10 4 L10 8 L16 8 L16 12 L10 12 L10 16 Z" />
          <path d="M14 6 L17 6" />
          <path d="M14 14 L17 14" />
        </svg>
      );
    case 'delete':
      return (
        <svg {...props}>
          <path d="M5 6 L15 6" />
          <path d="M8 6 L8 4 L12 4 L12 6" />
          <path d="M6 6 L7 16 L13 16 L14 6" />
          <path d="M8.5 9 L9 14" />
          <path d="M11.5 9 L11 14" />
        </svg>
      );
  }
}

function clampWheelPosition(cx: number, cy: number) {
  const half = WHEEL_SIZE / 2;
  const margin = 12;
  const maxW = typeof window !== 'undefined' ? window.innerWidth : 1920;
  const maxH = typeof window !== 'undefined' ? window.innerHeight : 1080;
  return {
    left: Math.max(margin, Math.min(maxW - WHEEL_SIZE - margin, cx - half)),
    top: Math.max(margin, Math.min(maxH - WHEEL_SIZE - margin, cy - half - 48)),
  };
}

export default function RadialOrbitalSelector() {
  const open = useAppStore((s) => s.ui.radialWheelOpen);
  const bounds = useAppStore((s) => s.ui.memberScreenBounds);
  const selectedId = useAppStore((s) => s.ui.selectedMemberId);
  const members = useAppStore((s) => s.project.members);

  const setRadialWheelOpen = useAppStore((s) => s.setRadialWheelOpen);
  const setQuickDimensionsOpen = useAppStore((s) => s.setQuickDimensionsOpen);
  const setEdgeToolMemberId = useAppStore((s) => s.setEdgeToolMemberId);
  const setActiveTool = useAppStore((s) => s.setActiveTool);
  const setMatePickTarget = useAppStore((s) => s.setMatePickTarget);
  const setMateFaceA = useAppStore((s) => s.setMateFaceA);
  const updateMember = useAppStore((s) => s.updateMember);
  const removeMember = useAppStore((s) => s.removeMember);
  const selectMember = useAppStore((s) => s.selectMember);

  const [hovered, setHovered] = useState<SegId | null>(null);
  const [deleteArmed, setDeleteArmed] = useState(false);
  const wheelRef = useRef<HTMLDivElement>(null);
  const deleteTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const selectedMember = members.find((m) => m.id === selectedId);

  useEffect(() => {
    if (!open) {
      setDeleteArmed(false);
      setHovered(null);
    }
  }, [open, selectedId]);

  useEffect(() => {
    if (!open) return;
    function onClickOutside(e: MouseEvent) {
      if (wheelRef.current && !wheelRef.current.contains(e.target as Node)) {
        setDeleteArmed(false);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [open]);

  if (!open || !bounds || !selectedId) return null;

  const cx = (bounds.left + bounds.right) / 2;
  const cy = (bounds.top + bounds.bottom) / 2;
  const pos = clampWheelPosition(cx, cy);

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

  function handleSegment(segId: SegId) {
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
      case 'edge':
        setActiveTool('edge');
        setEdgeToolMemberId(selectedId!);
        setRadialWheelOpen(false);
        break;
      case 'flip':
        flipLongestAxis(selectedId!);
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

  const centerLabel = selectedMember?.label ?? 'Board';

  return (
    <div
      ref={wheelRef}
      className="absolute z-40 pointer-events-auto"
      style={{ left: pos.left, top: pos.top, width: WHEEL_SIZE, height: WHEEL_SIZE }}
    >
      <svg
        width={WHEEL_SIZE}
        height={WHEEL_SIZE}
        viewBox={`0 0 ${WHEEL_SIZE} ${WHEEL_SIZE}`}
        className="wheel-scale-in"
        role="menu"
        aria-label="Member actions"
      >
        <circle
          cx={CENTER}
          cy={CENTER}
          r={OUTER_R + 1}
          fill="rgba(9,9,11,0.72)"
          stroke="#f59e0b"
          strokeWidth={2}
          className="wheel-ring-pulse"
        />

        {SEGMENTS.map((seg, i) => {
          const isHov = hovered === seg.id;
          const isDelArmed = seg.id === 'delete' && deleteArmed;
          const mid = segmentMidAngle(i);
          const iconPos = polar(CENTER, CENTER, (INNER_R + OUTER_R) / 2 - 6, mid);
          const labelPos = polar(CENTER, CENTER, OUTER_R - 18, mid);

          return (
            <g key={seg.id}>
              <path
                d={segmentPath(i)}
                fill={
                  isDelArmed
                    ? 'rgba(220,38,38,0.45)'
                    : isHov
                      ? 'rgba(245,158,11,0.3)'
                      : 'rgba(24,24,27,0.55)'
                }
                stroke="rgba(63,63,70,0.8)"
                strokeWidth={1}
                className="cursor-pointer"
                onMouseEnter={() => setHovered(seg.id)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => handleSegment(seg.id)}
              />
              <foreignObject
                x={iconPos.x - 10}
                y={iconPos.y - 14}
                width={20}
                height={20}
                className="pointer-events-none"
              >
                <div
                  className={[
                    'flex items-center justify-center w-5 h-5',
                    isHov || isDelArmed ? 'text-white' : 'text-zinc-300',
                  ].join(' ')}
                >
                  <SegmentIcon id={seg.id} />
                </div>
              </foreignObject>
              <text
                x={labelPos.x}
                y={labelPos.y + 16}
                textAnchor="middle"
                className={[
                  'text-[10px] font-semibold select-none pointer-events-none',
                  isDelArmed ? 'fill-red-200' : isHov ? 'fill-amber-100' : 'fill-zinc-300',
                ].join(' ')}
              >
                {seg.id === 'delete' && deleteArmed ? 'Confirm?' : seg.label}
              </text>
            </g>
          );
        })}

        <circle cx={CENTER} cy={CENTER} r={INNER_R - 2} fill="rgba(9,9,11,0.9)" stroke="rgba(63,63,70,0.9)" strokeWidth={1} />
        <text
          x={CENTER}
          y={CENTER + 3}
          textAnchor="middle"
          className="fill-zinc-400 text-[8px] font-medium select-none pointer-events-none"
        >
          {centerLabel.length > 14 ? `${centerLabel.slice(0, 12)}…` : centerLabel}
        </text>
      </svg>
    </div>
  );
}
