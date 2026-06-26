import * as THREE from 'three';
import { Line } from '@react-three/drei';
import { useAppStore } from '../store';

export default function RipCutPreviewLine() {
  const activeTool = useAppStore((s) => s.ui.activeTool);
  const selectedId = useAppStore((s) => s.ui.selectedMemberId);
  const member = useAppStore((s) =>
    s.project.members.find((m) => m.id === s.ui.selectedMemberId)
  );
  const targetWidth = useAppStore((s) => s.ui.ripCutPreviewPosition);

  if (activeTool !== 'rip' || !selectedId || !member || targetWidth === null) return null;

  const { length: L, thickness: T, width: W, position, rotation } = member;
  const hL = L / 2;
  const hT = T / 2;

  // Local Z offset from board center: start edge is at -W/2, preview line at -W/2 + targetWidth
  const localZ = -W / 2 + targetWidth;

  // Four corners of the cut plane in local space (spans full length and thickness)
  const localPts: [number, number, number][] = [
    [-hL, -hT, localZ],
    [ hL, -hT, localZ],
    [ hL,  hT, localZ],
    [-hL,  hT, localZ],
    [-hL, -hT, localZ], // close the loop
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
