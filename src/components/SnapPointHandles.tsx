import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useAppStore } from '../store';
import type { WoodMember } from '../types';
import type { FaceId } from '../types';

function getLocalSnapPoints(member: WoodMember): THREE.Vector3[] {
  // Phase 20 fix: snap dots must cover the board's FULL actual geometry.
  // A rip cut keeps the 'start' or 'end' edge — the kept region is NOT
  // centered on the board origin, so the old "shrink width around center"
  // math floated dots over the removed waste and left the far edge of the
  // real wood without dots (confirmed in the Phase 19 stress test).
  let zMin = -member.width / 2;
  let zMax = member.width / 2;
  for (const cut of member.cuts) {
    if (cut.type === 'ripCut' && cut.targetWidth) {
      if ((cut.ripKeepEdge ?? 'start') === 'start') {
        zMax = zMin + cut.targetWidth;
      } else {
        zMin = zMax - cut.targetWidth;
      }
    }
  }
  const hL = member.length / 2;
  const hT = member.thickness / 2;
  const zC = (zMin + zMax) / 2;

  const pts: [number, number, number][] = [
    // 8 corners (indices 0-7)
    [-hL, -hT, zMin], [-hL, -hT, zMax], [-hL, hT, zMin], [-hL, hT, zMax],
    [ hL, -hT, zMin], [ hL, -hT, zMax], [ hL, hT, zMin], [ hL, hT, zMax],
    // 6 face centers (indices 8-13) — these map cleanly to FaceIds
    [-hL, 0, zC], [hL, 0, zC],   // 8=xMin, 9=xMax
    [0, -hT, zC], [0, hT, zC],   // 10=yMin, 11=yMax
    [0, 0, zMin], [0, 0, zMax],  // 12=zMin, 13=zMax
    // center (index 14)
    [0, 0, zC],
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

  const mateFaceA = useAppStore((s) => s.ui.mateFaceA);
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
  const mateFaceAFace = mateFaceA?.memberId === member.id ? mateFaceA.face : null;

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
            {/* Visible dot — green if this face is mateFaceA */}
            {(() => {
              const thisFace = FACE_CENTER_MAP[i];
              const isFirst = mateFaceAFace !== null && thisFace === mateFaceAFace;
              const dotColor = isFirst ? '#22c55e' : color;
              const dotEmissive = isFirst ? '#16a34a' : emissive;
              const dotScale = isFirst ? 0.22 : 0.18;
              return (
                <mesh>
                  <sphereGeometry args={[dotScale, 8, 8]} />
                  <meshStandardMaterial
                    color={dotColor}
                    emissive={dotEmissive}
                    emissiveIntensity={isFirst ? 0.8 : 0.5}
                    transparent
                    opacity={0.9}
                  />
                </mesh>
              );
            })()}
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
