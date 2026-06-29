import { useRef } from 'react';
import { useAppStore } from '../store';

// 2D projection for an isometric-style nav cube
// Each face label and its position on a simple SVG-based cube illustration
const CUBE_SIZE = 88;
const C = CUBE_SIZE / 2;

// Simple isometric cube face paths
function topPath() {
  const r = 28;
  // diamond-ish top
  return `M ${C} ${C - r} L ${C + r * 0.87} ${C - r * 0.5} L ${C} ${C} L ${C - r * 0.87} ${C - r * 0.5} Z`;
}
function frontPath() {
  const r = 28;
  return `M ${C} ${C} L ${C + r * 0.87} ${C - r * 0.5} L ${C + r * 0.87} ${C + r * 0.5} L ${C} ${C + r} Z`;
}
function rightPath() {
  const r = 28;
  return `M ${C} ${C} L ${C} ${C + r} L ${C - r * 0.87} ${C + r * 0.5} L ${C - r * 0.87} ${C - r * 0.5} Z`;
}

export default function NavCube() {
  const setCameraPreset = useAppStore((s) => s.setCameraPreset);
  const svgRef = useRef<SVGSVGElement>(null);

  function clickFace(preset: string) {
    setCameraPreset(preset);
  }

  return (
    <div
      className="absolute top-3 right-16 z-20 pointer-events-auto"
      style={{ width: CUBE_SIZE, height: CUBE_SIZE }}
    >
      <svg
        ref={svgRef}
        width={CUBE_SIZE}
        height={CUBE_SIZE}
        viewBox={`0 0 ${CUBE_SIZE} ${CUBE_SIZE}`}
        style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.5))' }}
      >
        {/* Top face */}
        <path
          d={topPath()}
          fill="rgba(63,63,70,0.85)"
          stroke="#71717a"
          strokeWidth={1}
          className="cursor-pointer hover:fill-amber-500/60 transition-colors"
          onClick={() => clickFace('top')}
        />
        <text
          x={C}
          y={C - 16}
          textAnchor="middle"
          fontSize={7}
          fontWeight="bold"
          fill="#d4d4d8"
          className="pointer-events-none select-none"
        >
          TOP
        </text>

        {/* Front face */}
        <path
          d={frontPath()}
          fill="rgba(50,50,57,0.85)"
          stroke="#71717a"
          strokeWidth={1}
          className="cursor-pointer hover:fill-amber-500/60 transition-colors"
          onClick={() => clickFace('front')}
        />
        <text
          x={C + 20}
          y={C + 12}
          textAnchor="middle"
          fontSize={7}
          fontWeight="bold"
          fill="#d4d4d8"
          className="pointer-events-none select-none"
        >
          FRONT
        </text>

        {/* Right/Side face */}
        <path
          d={rightPath()}
          fill="rgba(40,40,46,0.85)"
          stroke="#71717a"
          strokeWidth={1}
          className="cursor-pointer hover:fill-amber-500/60 transition-colors"
          onClick={() => clickFace('right')}
        />
        <text
          x={C - 20}
          y={C + 12}
          textAnchor="middle"
          fontSize={7}
          fontWeight="bold"
          fill="#a1a1aa"
          className="pointer-events-none select-none"
        >
          RIGHT
        </text>

        {/* Corner dots for additional views */}
        {([
          { label: 'L', preset: 'left',   cx: C + 28 * 0.87, cy: C - 28 * 0.5 },
          { label: 'B', preset: 'back',   cx: C,             cy: C + 28 },
          { label: '↓', preset: 'bottom', cx: C - 28 * 0.87, cy: C + 28 * 0.5 },
        ] as const).map((dot) => (
          <g key={dot.preset}>
            <circle
              cx={dot.cx}
              cy={dot.cy}
              r={6}
              fill="rgba(63,63,70,0.9)"
              stroke="#71717a"
              strokeWidth={1}
              className="cursor-pointer hover:fill-amber-500/80 transition-colors"
              onClick={() => clickFace(dot.preset)}
            />
            <text
              x={dot.cx}
              y={dot.cy + 3}
              textAnchor="middle"
              fontSize={6}
              fill="#d4d4d8"
              className="pointer-events-none select-none"
            >
              {dot.label}
            </text>
          </g>
        ))}
      </svg>
      <div className="text-center mt-0.5">
        <span className="text-[9px] text-zinc-500 select-none">Click to set view</span>
      </div>
    </div>
  );
}
