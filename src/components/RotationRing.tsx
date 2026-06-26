import { Html } from '@react-three/drei';
import { useAppStore } from '../store';
import { radToDeg } from '../lib/angles';

const TICK_COUNT = 24; // 360 / 15 = 24 ticks
const RING_RADIUS = 3.5;
const BOLD_TICKS = new Set([0, 3, 6, 9, 12, 15, 18, 21]); // every 45° (every 3 ticks)

export default function RotationRing() {
  const transformGizmoActive = useAppStore((s) => s.ui.transformGizmoActive);
  const transformMode = useAppStore((s) => s.ui.transformMode);
  const selectedId = useAppStore((s) => s.ui.selectedMemberId);
  const member = useAppStore((s) =>
    s.project.members.find((m) => m.id === s.ui.selectedMemberId)
  );

  if (!transformGizmoActive || transformMode !== 'rotate' || !selectedId || !member) return null;

  const [px, py, pz] = member.position;
  const rotYDeg = Math.round(radToDeg(member.rotation[1]));
  const normalizedDeg = ((rotYDeg % 360) + 360) % 360;

  return (
    <group position={[px, py, pz]}>
      {/* Flat ring (torus geometry) in XZ plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[RING_RADIUS, 0.04, 8, 64]} />
        <meshBasicMaterial color="#F59E0B" transparent opacity={0.35} />
      </mesh>

      {/* Tick marks at every 15° */}
      {Array.from({ length: TICK_COUNT }, (_, i) => {
        const angleDeg = i * 15;
        const angleRad = (angleDeg * Math.PI) / 180;
        const isBold = BOLD_TICKS.has(i);
        const tickLen = isBold ? 0.45 : 0.25;
        const tickWidth = isBold ? 0.07 : 0.04;
        const innerR = RING_RADIUS - tickLen / 2;

        return (
          <mesh
            key={i}
            position={[
              Math.cos(angleRad) * innerR,
              0,
              Math.sin(angleRad) * innerR,
            ]}
            rotation={[0, -angleRad, 0]}
          >
            <boxGeometry args={[tickWidth, 0.06, tickLen]} />
            <meshBasicMaterial color={isBold ? '#FCD34D' : '#F59E0B'} transparent opacity={isBold ? 0.9 : 0.6} />
          </mesh>
        );
      })}

      {/* Live rotation label */}
      <Html position={[0, member.thickness / 2 + 0.5, 0]} center>
        <div
          className="px-2 py-0.5 rounded-full text-sm font-bold pointer-events-none select-none whitespace-nowrap"
          style={{ background: 'rgba(9,9,11,0.92)', color: '#F59E0B', border: '1px solid #F59E0B' }}
        >
          {normalizedDeg}°
        </div>
      </Html>
    </group>
  );
}
