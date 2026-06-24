import * as THREE from 'three';
import { Line } from '@react-three/drei';
import { useAppStore } from '../store';
import { getFacePointWorld } from '../lib/mating';
import { snapToGrid } from '../lib/mating';

const JOIN_COLORS: Record<string, string> = {
  Screws: '#fbbf24',
  Nails: '#a1a1aa',
  Glue: '#fde68a',
  'Pocket Holes': '#f97316',
  Biscuit: '#d4a96a',
  Dowel: '#c4a574',
  'Bracket / Hardware': '#71717a',
  'Mortise & Tenon': '#a855f7',
  Unset: '#52525b',
};

export default function AttachmentPointLinks() {
  const points = useAppStore((s) => s.project.attachmentPoints);
  const members = useAppStore((s) => s.project.members);
  const mates = useAppStore((s) => s.project.mates);

  const pairs: { a: THREE.Vector3; b: THREE.Vector3; color: string }[] = [];
  const seen = new Set<string>();

  for (const pt of points) {
    if (!pt.connectedToId || seen.has(pt.id)) continue;
    const other = points.find((p) => p.id === pt.connectedToId);
    if (!other) continue;
    seen.add(pt.id);
    seen.add(other.id);
    const ma = members.find((m) => m.id === pt.memberId);
    const mb = members.find((m) => m.id === other.memberId);
    if (!ma || !mb) continue;
    const pa = getFacePointWorld(ma, pt.faceIndex, pt.offset);
    const pb = getFacePointWorld(mb, other.faceIndex, other.offset);
    const mate = mates.find(
      (m) =>
        (m.memberAId === ma.id && m.memberBId === mb.id) ||
        (m.memberAId === mb.id && m.memberBId === ma.id)
    );
    pairs.push({
      a: pa,
      b: pb,
      color: JOIN_COLORS[mate?.joinMethod ?? 'Unset'] ?? '#52525b',
    });
  }

  return (
    <group>
      {pairs.map((p, i) => (
        <Line key={i} points={[p.a, p.b]} color={p.color} lineWidth={2} dashed dashSize={0.5} gapSize={0.25} />
      ))}
    </group>
  );
}

export function PolygonDrawTool() {
  const activeTool = useAppStore((s) => s.ui.activeTool);
  const points = useAppStore((s) => s.ui.polygonDrawPoints);
  const setPolygonDrawPoints = useAppStore((s) => s.setPolygonDrawPoints);
  const addMember = useAppStore((s) => s.addMember);

  if (activeTool !== 'shapePolygon') return null;

  function snap(v: number) {
    return snapToGrid(v);
  }

  return (
    <group
      onClick={(e) => {
        e.stopPropagation();
        const p = e.point;
        const nx = snap(p.x);
        const nz = snap(p.z);
        const next = [...points, [nx, nz] as [number, number]];
        if (next.length >= 3) {
          const first = next[0];
          const last = next[next.length - 1];
          if (
            next.length > 3 &&
            Math.hypot(first[0] - last[0], first[1] - last[1]) < 0.3
          ) {
            const height = parseFloat(window.prompt('Extrusion height (inches)', '1.5') ?? '1.5');
            if (!isNaN(height) && height > 0) {
              addMember({
                id: crypto.randomUUID(),
                label: 'Custom polygon',
                category: 'Softwood',
                species: 'Southern Yellow Pine',
                nominalSize: 'Custom',
                thickness: height,
                width: 12,
                length: 12,
                position: [0, height / 2, 0],
                rotation: [0, 0, 0],
                costPerBoardFoot: 3.5,
                color: '#d4a96a',
                isSelected: false,
                cuts: [],
                orientation: 'flat',
                loadLbs: 0,
                materialKind: 'dimensional',
                shapeType: 'customPolygon',
                polygonPoints: next.slice(0, -1),
              });
            }
            setPolygonDrawPoints([]);
            useAppStore.getState().setActiveTool('select');
            return;
          }
        }
        setPolygonDrawPoints(next);
      }}
    >
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <planeGeometry args={[500, 500]} />
        <meshBasicMaterial visible={false} />
      </mesh>
      {points.map(([x, z], i) => (
        <mesh key={i} position={[x, 0.2, z]}>
          <sphereGeometry args={[0.15, 8, 8]} />
          <meshBasicMaterial color="#fbbf24" />
        </mesh>
      ))}
    </group>
  );
}
