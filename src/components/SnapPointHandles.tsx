import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useAppStore } from '../store';
import type { WoodMember } from '../types';

function getLocalSnapPoints(member: WoodMember): THREE.Vector3[] {
  let width = member.width;
  for (const cut of member.cuts) {
    if (cut.type === 'ripCut' && cut.targetWidth) {
      width = cut.targetWidth;
    }
  }
  const L = member.length;
  const T = member.thickness;
  const W = width;
  const hL = L / 2, hT = T / 2, hW = W / 2;

  const pts: [number, number, number][] = [
    // 8 corners
    [-hL, -hT, -hW], [-hL, -hT, hW], [-hL, hT, -hW], [-hL, hT, hW],
    [ hL, -hT, -hW], [ hL, -hT, hW], [ hL, hT, -hW], [ hL, hT, hW],
    // 6 face centers
    [-hL, 0, 0], [hL, 0, 0],
    [0, -hT, 0], [0, hT, 0],
    [0, 0, -hW], [0, 0, hW],
    // center
    [0, 0, 0],
  ];

  return pts.map((p) => new THREE.Vector3(p[0], p[1], p[2]));
}

interface Props {
  member: WoodMember;
  meshRef: React.RefObject<THREE.Mesh>;
  forMate?: boolean;
}

export default function SnapPointHandles({ member, meshRef, forMate }: Props) {
  const selectedId = useAppStore((s) => s.ui.selectedMemberId);
  const activeTool = useAppStore((s) => s.ui.activeTool);

  const isSelected = selectedId === member.id;
  const isMateMode = activeTool === 'mate';
  const show = isSelected || (forMate && isMateMode);

  const localPoints = useMemo(
    () => getLocalSnapPoints(member),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [member.length, member.thickness, member.width, member.cuts]
  );

  const dotRefs = useRef<(THREE.Mesh | null)[]>([]);

  const color = isMateMode ? '#fbbf24' : '#ffffff';
  const emissive = isMateMode ? '#d97706' : '#cccccc';

  // Update dot positions every frame from the live matrixWorld — zero lag
  useFrame(() => {
    if (!show || !meshRef.current) return;
    const mat = meshRef.current.matrixWorld;
    localPoints.forEach((lp, i) => {
      const dot = dotRefs.current[i];
      if (!dot) return;
      const wp = lp.clone().applyMatrix4(mat);
      dot.position.copy(wp);
    });
  });

  if (!show) return null;

  return (
    <>
      {localPoints.map((_, i) => (
        <mesh
          key={i}
          ref={(el) => { dotRefs.current[i] = el; }}
          position={[0, 0, 0]}
        >
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
