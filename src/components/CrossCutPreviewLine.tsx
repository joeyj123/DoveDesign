import * as THREE from 'three';
import { Line } from '@react-three/drei';
import { useAppStore } from '../store';

export default function CrossCutPreviewLine() {
  const activeTool = useAppStore((s) => s.ui.activeTool);
  const selectedId = useAppStore((s) => s.ui.selectedMemberId);
  const member = useAppStore((s) =>
    s.project.members.find((m) => m.id === s.ui.selectedMemberId)
  );
  const cutPos = useAppStore((s) => s.ui.crossCutPreviewPosition);

  if (activeTool !== 'cut' || !selectedId || !member || cutPos === null) return null;

  const { length: L, thickness: T, width: W, position, rotation } = member;
  const hT = T / 2;
  const hW = W / 2;

  // Local x offset from board center: -L/2 + cutPos
  const localX = -L / 2 + cutPos;

  // Four corners of the cut plane in local space (spans full height and width)
  const localPts: [number, number, number][] = [
    [localX, -hT, -hW],
    [localX,  hT, -hW],
    [localX,  hT,  hW],
    [localX, -hT,  hW],
    [localX, -hT, -hW], // close the loop
  ];

  // Transform to world space
  const euler = new THREE.Euler(...rotation);
  const q = new THREE.Quaternion().setFromEuler(euler);
  const pos = new THREE.Vector3(...position);

  const worldPts = localPts.map((p) =>
    new THREE.Vector3(p[0], p[1], p[2]).applyQuaternion(q).add(pos)
  );

  const points: [number, number, number][] = worldPts.map((v) => [v.x, v.y + 0.01, v.z]);

  return (
    <Line
      points={points}
      color="#f59e0b"
      lineWidth={2}
      dashed
      dashSize={0.25}
      gapSize={0.15}
    />
  );
}
