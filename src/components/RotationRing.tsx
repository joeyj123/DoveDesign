import { useState } from 'react';
import { Html } from '@react-three/drei';
import { useAppStore } from '../store';
import { radToDeg } from '../lib/angles';

const TICK_COUNT = 24; // 360 / 15 = 24 ticks
const RING_RADIUS = 3.5;
const BOLD_TICKS = new Set([0, 3, 6, 9, 12, 15, 18, 21]); // every 45°

export default function RotationRing() {
  const transformGizmoActive = useAppStore((s) => s.ui.transformGizmoActive);
  const transformMode = useAppStore((s) => s.ui.transformMode);
  const selectedId = useAppStore((s) => s.ui.selectedMemberId);
  const rotationAxis = useAppStore((s) => s.ui.rotationAxis);
  const member = useAppStore((s) =>
    s.project.members.find((m) => m.id === s.ui.selectedMemberId)
  );
  const updateMember = useAppStore((s) => s.updateMember);
  const [hoveredTick, setHoveredTick] = useState<number | null>(null);

  if (!transformGizmoActive || transformMode !== 'rotate' || !selectedId || !member) return null;

  const [px, py, pz] = member.position;
  const axisIdx = rotationAxis === 'x' ? 0 : rotationAxis === 'y' ? 1 : 2;
  const rotDeg = Math.round(radToDeg(member.rotation[axisIdx]));
  const normalizedDeg = ((rotDeg % 360) + 360) % 360;

  function snapToTickDeg(deg: number) {
    const newRot = [...member!.rotation] as [number, number, number];
    newRot[axisIdx] = (deg * Math.PI) / 180;
    updateMember(member!.id, { rotation: newRot });
  }

  // Ring orientation: Y-axis ring is in XZ plane (rotate -90° around X)
  // X-axis ring is in YZ plane (rotate 0 around Z)
  // Z-axis ring is in XY plane (rotate 90° around X)
  const ringRotation: [number, number, number] =
    rotationAxis === 'y' ? [-Math.PI / 2, 0, 0] :
    rotationAxis === 'x' ? [0, 0, Math.PI / 2] :
    [Math.PI / 2, 0, 0];

  const ringColor = rotationAxis === 'x' ? '#ef4444' : rotationAxis === 'y' ? '#F59E0B' : '#3b82f6';

  return (
    <group position={[px, py, pz]}>
      {/* Ring torus */}
      <mesh rotation={ringRotation}>
        <torusGeometry args={[RING_RADIUS, 0.04, 8, 64]} />
        <meshBasicMaterial color={ringColor} transparent opacity={0.35} />
      </mesh>

      {/* Tick marks */}
      {Array.from({ length: TICK_COUNT }, (_, i) => {
        const angleDeg = i * 15;
        const angleRad = (angleDeg * Math.PI) / 180;
        const isBold = BOLD_TICKS.has(i);
        const isHovered = hoveredTick === i;
        const tickLen = isBold ? 0.45 : 0.25;
        const tickWidth = isBold ? 0.07 : 0.04;
        const innerR = RING_RADIUS - tickLen / 2;

        // Position ticks in XZ plane (Y-axis rotation)
        const tickPos: [number, number, number] =
          rotationAxis === 'y'
            ? [Math.cos(angleRad) * innerR, 0, Math.sin(angleRad) * innerR]
            : rotationAxis === 'x'
            ? [0, Math.cos(angleRad) * innerR, Math.sin(angleRad) * innerR]
            : [Math.cos(angleRad) * innerR, Math.sin(angleRad) * innerR, 0];

        const tickRot: [number, number, number] =
          rotationAxis === 'y' ? [0, -angleRad, 0] :
          rotationAxis === 'x' ? [0, 0, -angleRad] :
          [-angleRad, 0, 0];

        return (
          <group key={i}>
            <mesh
              position={tickPos}
              rotation={tickRot}
              onPointerEnter={() => setHoveredTick(i)}
              onPointerLeave={() => setHoveredTick(null)}
              onPointerDown={(e) => { e.stopPropagation(); snapToTickDeg(angleDeg); }}
            >
              <boxGeometry args={[tickWidth, 0.06, tickLen]} />
              <meshBasicMaterial
                color={isHovered ? '#ffffff' : isBold ? '#FCD34D' : ringColor}
                transparent
                opacity={isHovered ? 1 : isBold ? 0.9 : 0.6}
              />
            </mesh>

            {isHovered && isBold && (
              <Html
                position={[
                  tickPos[0] * 1.25,
                  tickPos[1] * 1.25 + 0.3,
                  tickPos[2] * 1.25,
                ]}
                center
              >
                <div
                  className="px-1.5 py-0.5 rounded text-xs font-bold pointer-events-none select-none whitespace-nowrap"
                  style={{ background: 'rgba(9,9,11,0.92)', color: '#FCD34D', border: '1px solid #F59E0B' }}
                >
                  {angleDeg}°
                </div>
              </Html>
            )}
          </group>
        );
      })}

      {/* Live rotation label */}
      <Html position={[0, member.thickness / 2 + 0.5, 0]} center>
        <div
          className="px-2 py-0.5 rounded-full text-sm font-bold pointer-events-none select-none whitespace-nowrap"
          style={{ background: 'rgba(9,9,11,0.92)', color: ringColor, border: `1px solid ${ringColor}` }}
        >
          {rotationAxis.toUpperCase()} {normalizedDeg}°
        </div>
      </Html>
    </group>
  );
}
