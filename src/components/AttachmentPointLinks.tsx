import * as THREE from 'three';
import { Line } from '@react-three/drei';
import { useAppStore } from '../store';
import { getFacePointWorld } from '../lib/mating';
import { snapToGrid } from '../lib/mating';
import { computePolygonBBox, computePolygonCentroid } from '../lib/memberGeometry';

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
  const drawChainLinks = useAppStore((s) => s.ui.drawChainLinks);

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

  for (const link of drawChainLinks) {
    const ptA = points.find((p) => p.id === link.fromApId);
    const ptB = points.find((p) => p.id === link.toApId);
    if (!ptA || !ptB) continue;
    const ma = members.find((m) => m.id === ptA.memberId);
    const mb = members.find((m) => m.id === ptB.memberId);
    if (!ma || !mb) continue;
    pairs.push({
      a: getFacePointWorld(ma, ptA.faceIndex, ptA.offset),
      b: getFacePointWorld(mb, ptB.faceIndex, ptB.offset),
      color: '#f59e0b',
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
  const drawDefaults = useAppStore((s) => s.ui.drawDefaults);
  const setPolygonDrawPoints = useAppStore((s) => s.setPolygonDrawPoints);
  const addMember = useAppStore((s) => s.addMember);
  const selectMember = useAppStore((s) => s.selectMember);

  if (activeTool !== 'shapePolygon') return null;

  function snap(v: number) {
    return snapToGrid(v);
  }

  function finishPolygon(verts: [number, number][]) {
    const height = drawDefaults.thickness;
    const [cx, cz] = computePolygonCentroid(verts);
    const { length, width } = computePolygonBBox(verts);
    const id = crypto.randomUUID();
    addMember({
      id,
      label: 'Custom polygon',
      category: drawDefaults.category,
      species: drawDefaults.species,
      nominalSize: 'Custom',
      thickness: height,
      width,
      length,
      position: [cx, height / 2, cz],
      rotation: [0, 0, 0],
      costPerBoardFoot: 3.5,
      color: drawDefaults.color,
      isSelected: false,
      cuts: [],
      orientation: 'flat',
      loadLbs: 0,
      materialKind: 'dimensional',
      shapeType: 'customPolygon',
      polygonPoints: verts,
    });
    setPolygonDrawPoints([]);
    useAppStore.getState().setActiveTool('select');
    selectMember(id);
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
            finishPolygon(next.slice(0, -1));
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
      {points.length >= 2 && (
        <Line
          points={points.map(([x, z]) => new THREE.Vector3(x, 0.2, z))}
          color="#fbbf24"
          lineWidth={2}
        />
      )}
      {points.map(([x, z], i) => (
        <mesh key={i} position={[x, 0.2, z]}>
          <sphereGeometry args={[0.15, 8, 8]} />
          <meshBasicMaterial color="#fbbf24" />
        </mesh>
      ))}
    </group>
  );
}
