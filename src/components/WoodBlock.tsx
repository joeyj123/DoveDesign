import { useRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { ThreeEvent } from '@react-three/fiber';
import { Geometry, Base, Subtraction } from '@react-three/csg';
import { useAppStore } from '../store';
import type { WoodMember } from '../types';
import { getWoodGrainTexture, getRoughnessTexture } from '../lib/woodTexture';
import { buildCutSubtractions } from '../lib/joinery';
import { pickFaceFromWorldNormal } from '../lib/mating';
import TransformGizmo from './TransformGizmo';

interface Props {
  member: WoodMember;
}

export default function WoodBlock({ member }: Props) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const selectMember = useAppStore((s) => s.selectMember);
  const activeTool   = useAppStore((s) => s.ui.activeTool);
  const matePickTarget = useAppStore((s) => s.ui.matePickTarget);
  const setMateFaceA = useAppStore((s) => s.setMateFaceA);
  const setMateFaceB = useAppStore((s) => s.setMateFaceB);
  const allMembers   = useAppStore((s) => s.project.members);
  const selectedId   = useAppStore((s) => s.ui.selectedMemberId);
  const isolatedMemberId = useAppStore((s) => s.ui.isolatedMemberId);
  const isSelected   = selectedId === member.id;
  const isHidden     = isolatedMemberId !== null && isolatedMemberId !== member.id;

  const grainTex = getWoodGrainTexture(member.color);
  const roughTex = getRoughnessTexture();

  const subtractions = useMemo(
    () => buildCutSubtractions(member, allMembers),
    [member, allMembers]
  );

  const edgeGeo = useMemo(
    () => new THREE.BoxGeometry(member.length, member.thickness, member.width),
    [member.length, member.thickness, member.width]
  );

  useEffect(() => {
    if (!meshRef.current) return;
    meshRef.current.userData.memberId = member.id;
    meshRef.current.position.set(...member.position);
    meshRef.current.rotation.set(...member.rotation);
    meshRef.current.scale.set(1, 1, 1);
  }, [member.id, member.position, member.rotation]);

  function handleClick(e: ThreeEvent<MouseEvent>) {
    e.stopPropagation();

    if (activeTool === 'mate' && e.face) {
      const worldNormal = e.face.normal.clone().transformDirection(e.object.matrixWorld).normalize();
      const face = pickFaceFromWorldNormal(member, worldNormal);
      const sel = { memberId: member.id, face };
      if (matePickTarget === 'A') setMateFaceA(sel);
      else setMateFaceB(sel);
      return;
    }

    selectMember(member.id);
  }

  if (isHidden) return null;

  return (
    <>
      <mesh
        ref={meshRef}
        position={member.position}
        rotation={member.rotation}
        onClick={handleClick}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          map={grainTex}
          roughnessMap={roughTex}
          roughness={0.82}
          metalness={0}
          emissive={isSelected ? '#ffaa00' : '#000000'}
          emissiveIntensity={isSelected ? 0.28 : 0}
        />

        <Geometry>
          <Base>
            <boxGeometry args={[member.length, member.thickness, member.width]} />
          </Base>

          {subtractions.map((sub) => (
            <Subtraction key={sub.id} position={sub.position} rotation={sub.rotation}>
              {sub.geometry === 'box' ? (
                <boxGeometry args={sub.args as [number, number, number]} />
              ) : (
                <cylinderGeometry args={sub.args as [number, number, number, number]} />
              )}
            </Subtraction>
          ))}
        </Geometry>

        {isSelected && (
          <lineSegments>
            <edgesGeometry args={[edgeGeo]} />
            <lineBasicMaterial color="#ff8800" linewidth={2} />
          </lineSegments>
        )}
      </mesh>

      {isSelected && <TransformGizmo member={member} objectRef={meshRef} />}
    </>
  );
}
