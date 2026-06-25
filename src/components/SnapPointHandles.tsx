import { useMemo } from 'react';
import * as THREE from 'three';
import { useAppStore } from '../store';
import type { WoodMember } from '../types';

function getSnapPoints(member: WoodMember): THREE.Vector3[] {
  // Use effectiveDims (accounting for rip cuts)
  let width = member.width;
  for (const cut of member.cuts) {
    if (cut.type === 'ripCut' && cut.targetWidth) {
      width = cut.targetWidth;
    }
  }
  const L = member.length;
  const T = member.thickness;
  const W = width;

  const hL = L / 2;
  const hT = T / 2;
  const hW = W / 2;

  // 8 corners
  const corners: [number, number, number][] = [
    [-hL, -hT, -hW], [-hL, -hT, hW], [-hL, hT, -hW], [-hL, hT, hW],
    [ hL, -hT, -hW], [ hL, -hT, hW], [ hL, hT, -hW], [ hL, hT, hW],
  ];

  // 6 face centers
  const faces: [number, number, number][] = [
    [-hL, 0, 0], [hL, 0, 0],   // left/right length faces
    [0, -hT, 0], [0, hT, 0],   // bottom/top thickness faces
    [0, 0, -hW], [0, 0, hW],   // front/back width faces
  ];

  // 3 axis midpoints along center
  const mids: [number, number, number][] = [
    [0, 0, 0], // center
  ];

  const localPts = [...corners, ...faces, ...mids];

  // Transform from local to world space
  const euler = new THREE.Euler(...member.rotation);
  const q = new THREE.Quaternion().setFromEuler(euler);
  const pos = new THREE.Vector3(...member.position);

  return localPts.map((p) =>
    new THREE.Vector3(p[0], p[1], p[2]).applyQuaternion(q).add(pos)
  );
}

interface Props {
  member: WoodMember;
  forMate?: boolean; // show on all boards when in mate mode
}

export default function SnapPointHandles({ member, forMate }: Props) {
  const selectedId = useAppStore((s) => s.ui.selectedMemberId);
  const activeTool = useAppStore((s) => s.ui.activeTool);

  const isSelected = selectedId === member.id;
  const isMateMode = activeTool === 'mate';

  const show = isSelected || (forMate && isMateMode);
  if (!show) return null;

  const points = useMemo(() => getSnapPoints(member), [member]);

  const color = isMateMode ? '#fbbf24' : '#ffffff';
  const emissive = isMateMode ? '#d97706' : '#cccccc';

  return (
    <>
      {points.map((pt, i) => (
        <mesh key={i} position={[pt.x, pt.y, pt.z]}>
          <sphereGeometry args={[0.12, 6, 6]} />
          <meshStandardMaterial
            color={color}
            emissive={emissive}
            emissiveIntensity={0.5}
            transparent
            opacity={0.8}
          />
        </mesh>
      ))}
    </>
  );
}
