import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useAppStore } from '../store';
import type { WoodMember } from '../types';
import type { FaceId } from '../types';

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
    // 8 corners (indices 0-7)
    [-hL, -hT, -hW], [-hL, -hT, hW], [-hL, hT, -hW], [-hL, hT, hW],
    [ hL, -hT, -hW], [ hL, -hT, hW], [ hL, hT, -hW], [ hL, hT, hW],
    // 6 face centers (indices 8-13) — these map cleanly to FaceIds
    [-hL, 0, 0], [hL, 0, 0],   // 8=xMin, 9=xMax
    [0, -hT, 0], [0, hT, 0],   // 10=yMin, 11=yMax
    [0, 0, -hW], [0, 0, hW],   // 12=zMin, 13=zMax
    // center (index 14)
    [0, 0, 0],
  ];

  return pts.map((p) => new THREE.Vector3(p[0], p[1], p[2]));
}

// Map face-center snap index → FaceId (only for indices 8-13)
const FACE_CENTER_MAP: Record<number, FaceId> = {
  8:  'xMin',
  9:  'xMax',
  10: 'yMin',
  11: 'yMax',
  12: 'zMin',
  13: 'zMax',
};

interface Props {
  member: WoodMember;
  meshRef: React.RefObject<THREE.Mesh>;
  forMate?: boolean;
}

export default function SnapPointHandles({ member, meshRef, forMate }: Props) {
  const selectedId    = useAppStore((s) => s.ui.selectedMemberId);
  const activeTool    = useAppStore((s) => s.ui.activeTool);
  const setMateFaceA  = useAppStore((s) => s.setMateFaceA);
  const applyMate     = useAppStore((s) => s.applyMate);
  const setMateGridOffset = useAppStore((s) => s.setMateGridOffset);

  const isSelected = selectedId === member.id;
  const isMateMode = activeTool === 'mate';
  const show = isSelected || (forMate && isMateMode);

  const localPoints = useMemo(
    () => getLocalSnapPoints(member),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [member.length, member.thickness, member.width, member.cuts]
  );

  const dotRefs = useRef<(THREE.Group | null)[]>([]);

  const color    = isMateMode ? '#fbbf24' : '#ffffff';
  const emissive = isMateMode ? '#d97706' : '#cccccc';

  useFrame(() => {
    if (!show || !meshRef.current) return;
    const mat = meshRef.current.matrixWorld;
    localPoints.forEach((lp, i) => {
      const grp = dotRefs.current[i];
      if (!grp) return;
      const wp = lp.clone().applyMatrix4(mat);
      grp.position.copy(wp);
      grp.updateMatrixWorld(true);
    });
  });

  if (!show) return null;

  function handleDotClick(i: number) {
    if (activeTool !== 'mate') return;
    const face = FACE_CENTER_MAP[i];
    if (!face) return;

    const sel = { memberId: member.id, face, offset: [0, 0, 0] as [number, number, number] };
    setMateGridOffset({ memberId: member.id, face, offset: [0, 0, 0] });

    const currentFaceA = useAppStore.getState().ui.mateFaceA;
    if (!currentFaceA) {
      setMateFaceA(sel);
      return;
    }
    if (currentFaceA.memberId === member.id) {
      setMateFaceA(sel);
      return;
    }
    useAppStore.setState((s) => ({ ui: { ...s.ui, mateFaceB: sel } }));
    applyMate();
  }

  return (
    <>
      {localPoints.map((_, i) => {
        const clickable = isMateMode && !!FACE_CENTER_MAP[i];
        return (
          <group key={i} ref={(el) => { dotRefs.current[i] = el; }} position={[0, 0, 0]}>
            {/* Visible dot */}
            <mesh>
              <sphereGeometry args={[0.18, 8, 8]} />
              <meshStandardMaterial
                color={color}
                emissive={emissive}
                emissiveIntensity={0.5}
                transparent
                opacity={0.8}
              />
            </mesh>
            {/* Invisible hitbox for easier clicking */}
            {clickable && (
              <mesh onClick={(e) => { e.stopPropagation(); handleDotClick(i); }}>
                <sphereGeometry args={[0.32, 6, 6]} />
                <meshBasicMaterial transparent opacity={0} depthWrite={false} />
              </mesh>
            )}
          </group>
        );
      })}
    </>
  );
}
