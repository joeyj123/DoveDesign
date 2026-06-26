import * as THREE from 'three';
import { Line, Html } from '@react-three/drei';
import { useAppStore } from '../store';

const AMBER = '#F59E0B';
const AMBER_BRIGHT = '#FCD34D';

export default function DimensionLineRenderer() {
  const dimensionLines = useAppStore((s) => s.project.dimensionLines ?? []);
  const dimensionLinesVisible = useAppStore((s) => s.ui.dimensionLinesVisible);
  const selectedId = useAppStore((s) => s.ui.selectedDimensionLineId);
  const selectDimensionLine = useAppStore((s) => s.selectDimensionLine);
  const removeDimensionLine = useAppStore((s) => s.removeDimensionLine);

  if (!dimensionLinesVisible || dimensionLines.length === 0) return null;

  return (
    <>
      {dimensionLines.map((dl) => {
        const start = new THREE.Vector3(dl.startPoint.x, dl.startPoint.y + 0.05, dl.startPoint.z);
        const end = new THREE.Vector3(dl.endPoint.x, dl.endPoint.y + 0.05, dl.endPoint.z);
        const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
        const dist = start.distanceTo(end);
        const isSelected = selectedId === dl.id;

        // Snapped lines (0°/90°/180°/270°) render brighter
        const isCardinal = dl.angleDegrees % 90 === 0;
        const lineColor = isCardinal ? AMBER_BRIGHT : AMBER;

        const points: [number, number, number][] = [
          [start.x, start.y, start.z],
          [end.x, end.y, end.z],
        ];

        return (
          <group key={dl.id}>
            {/* Line */}
            <Line
              points={points}
              color={lineColor}
              lineWidth={isSelected ? 2.5 : 1.5}
              dashed
              dashSize={0.4}
              gapSize={0.2}
              onClick={(e) => {
                e.stopPropagation();
                selectDimensionLine(isSelected ? null : dl.id);
              }}
            />

            {/* Start anchor dot */}
            <mesh position={[start.x, start.y, start.z]}>
              <sphereGeometry args={[0.12, 8, 8]} />
              <meshBasicMaterial color={lineColor} />
            </mesh>

            {/* End anchor dot */}
            <mesh position={[end.x, end.y, end.z]}>
              <sphereGeometry args={[0.12, 8, 8]} />
              <meshBasicMaterial color={lineColor} />
            </mesh>

            {/* Distance label at midpoint */}
            {dist > 0.1 && (
              <Html position={[mid.x, mid.y + 0.2, mid.z]} center>
                <div
                  className="px-2 py-0.5 rounded-full text-xs font-semibold text-white pointer-events-none select-none whitespace-nowrap"
                  style={{
                    background: 'rgba(24,24,27,0.92)',
                    border: `1px solid ${isSelected ? AMBER_BRIGHT : '#52525b'}`,
                  }}
                  onClick={() => selectDimensionLine(isSelected ? null : dl.id)}
                >
                  {dist.toFixed(2)}&quot;
                </div>
              </Html>
            )}

            {/* Angle label near end point */}
            <Html position={[end.x, end.y + 0.35, end.z]} center>
              <div
                className="px-1.5 py-0.5 rounded-full text-xs font-semibold pointer-events-none select-none whitespace-nowrap"
                style={{ background: 'rgba(9,9,11,0.92)', color: lineColor }}
              >
                {dl.angleDegrees}°
              </div>
            </Html>

            {/* Delete button when selected */}
            {isSelected && (
              <Html position={[mid.x, mid.y + 0.7, mid.z]} center>
                <button
                  className="px-2 py-0.5 rounded text-xs font-semibold text-red-400 border border-red-500/50 bg-zinc-900/90 hover:bg-red-500/20 transition-colors"
                  onClick={() => {
                    removeDimensionLine(dl.id);
                    selectDimensionLine(null);
                  }}
                >
                  Delete
                </button>
              </Html>
            )}
          </group>
        );
      })}
    </>
  );
}
