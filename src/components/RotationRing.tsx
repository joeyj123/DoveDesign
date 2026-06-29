import { Html } from '@react-three/drei';
import { useAppStore } from '../store';
import { radToDeg } from '../lib/angles';

export default function RotationRing() {
  const transformGizmoActive = useAppStore((s) => s.ui.transformGizmoActive);
  const transformMode = useAppStore((s) => s.ui.transformMode);
  const selectedId = useAppStore((s) => s.ui.selectedMemberId);
  const rotationAxis = useAppStore((s) => s.ui.rotationAxis);
  const member = useAppStore((s) =>
    s.project.members.find((m) => m.id === s.ui.selectedMemberId)
  );

  if (!transformGizmoActive || transformMode !== 'rotate' || !selectedId || !member) return null;

  const [px, py, pz] = member.position;
  const axisIdx = rotationAxis === 'x' ? 0 : rotationAxis === 'y' ? 1 : 2;
  const rotDeg = Math.round(((radToDeg(member.rotation[axisIdx]) % 360) + 360) % 360);
  const ringColor = rotationAxis === 'x' ? '#ef4444' : rotationAxis === 'y' ? '#22c55e' : '#3b82f6';

  return (
    <group position={[px, py + member.thickness / 2 + 0.6, pz]}>
      <Html center zIndexRange={[0, 10]}>
        <div
          className="px-2 py-0.5 rounded-full text-sm font-bold pointer-events-none select-none whitespace-nowrap"
          style={{ background: 'rgba(9,9,11,0.92)', color: ringColor, border: `1px solid ${ringColor}` }}
        >
          {rotationAxis.toUpperCase()}: {rotDeg}°
        </div>
      </Html>
    </group>
  );
}
