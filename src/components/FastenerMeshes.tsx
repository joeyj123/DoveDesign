import { useMemo } from 'react';
import { Html } from '@react-three/drei';
import { useAppStore } from '../store';
import type { Fastener, JoinMethod, WoodMember } from '../types';
import { getFaceCenter, getFaceAlignedPlacement } from '../lib/mating';

/**
 * Derives world position/rotation for a fastener icon fresh from its parent
 * board's CURRENT transform (CAD_MANIFESTO.md Law 1). Falls back to the legacy
 * baked position/rotation only for fasteners placed before the Phase 19 migration
 * that never got memberId/faceId/offset.
 */
function resolveFastenerPlacement(
  fastener: Fastener,
  members: WoodMember[]
): { position: [number, number, number]; rotation: [number, number, number] } | null {
  if (fastener.memberId && fastener.faceId && fastener.offset) {
    const member = members.find((m) => m.id === fastener.memberId);
    if (!member) return null; // parent board no longer exists — don't render orphaned icon
    const { position, rotation } = getFaceAlignedPlacement(member, fastener.faceId, fastener.offset);
    return { position: [position.x, position.y, position.z], rotation };
  }
  if (fastener.position && fastener.rotation) {
    return { position: fastener.position, rotation: fastener.rotation };
  }
  return null;
}

function ScrewMesh({ rotation }: { rotation: [number, number, number] }) {
  return (
    <group rotation={rotation}>
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.082, 0.082, 0.3, 8]} />
        <meshStandardMaterial color="#a1a1aa" metalness={0.6} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.32, 0]}>
        <coneGeometry args={[0.12, 0.1, 8]} />
        <meshStandardMaterial color="#71717a" metalness={0.7} roughness={0.3} />
      </mesh>
    </group>
  );
}

function NailMesh({ rotation }: { rotation: [number, number, number] }) {
  return (
    <group rotation={rotation}>
      <mesh>
        <cylinderGeometry args={[0.04, 0.04, 0.5, 6]} />
        <meshStandardMaterial color="#a1a1aa" metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.28, 0]}>
        <cylinderGeometry args={[0.07, 0.07, 0.04, 8]} />
        <meshStandardMaterial color="#71717a" metalness={0.6} roughness={0.35} />
      </mesh>
    </group>
  );
}

function DowelMesh({ rotation, diameter }: { rotation: [number, number, number]; diameter: number }) {
  return (
    <mesh rotation={rotation}>
      <cylinderGeometry args={[diameter / 2, diameter / 2, 0.75, 12]} />
      <meshStandardMaterial color="#c4a574" roughness={0.75} />
    </mesh>
  );
}

function BiscuitMesh({ rotation }: { rotation: [number, number, number] }) {
  return (
    <mesh rotation={rotation} scale={[1, 0.15, 0.5]}>
      <cylinderGeometry args={[0.35, 0.35, 0.08, 16]} />
      <meshStandardMaterial color="#d4a96a" roughness={0.8} />
    </mesh>
  );
}

function BracketMesh({ rotation }: { rotation: [number, number, number] }) {
  return (
    <group rotation={rotation}>
      <mesh position={[0.3, 0, 0]}>
        <boxGeometry args={[0.6, 0.06, 0.4]} />
        <meshStandardMaterial color="#a1a1aa" metalness={0.5} />
      </mesh>
      <mesh position={[0, 0, 0.3]}>
        <boxGeometry args={[0.4, 0.06, 0.6]} />
        <meshStandardMaterial color="#a1a1aa" metalness={0.5} />
      </mesh>
    </group>
  );
}

function PocketHoleMesh({ rotation }: { rotation: [number, number, number] }) {
  return (
    <group rotation={rotation}>
      <mesh rotation={[Math.PI / 4, 0, 0]} position={[0, -0.1, 0]}>
        <cylinderGeometry args={[0.35, 0.35, 0.5, 12]} />
        <meshStandardMaterial color="#3f3f46" roughness={0.9} />
      </mesh>
      <ScrewMesh rotation={[Math.PI / 4, 0, 0]} />
    </group>
  );
}

function FastenerGeometry({
  type,
  rotation,
  memberThickness,
}: {
  type: JoinMethod;
  rotation: [number, number, number];
  memberThickness: number;
}) {
  switch (type) {
    case 'Screws':
      return <ScrewMesh rotation={rotation} />;
    case 'Nails':
      return <NailMesh rotation={rotation} />;
    case 'Dowel':
      return (
        <DowelMesh
          rotation={rotation}
          diameter={memberThickness <= 1 ? 0.375 : 0.5}
        />
      );
    case 'Biscuit':
      return <BiscuitMesh rotation={rotation} />;
    case 'Bracket / Hardware':
      return <BracketMesh rotation={rotation} />;
    case 'Pocket Holes':
      return <PocketHoleMesh rotation={rotation} />;
    default:
      return null;
  }
}

export default function FastenerMeshes() {
  const fasteners = useAppStore((s) => s.project.fasteners);
  const members = useAppStore((s) => s.project.members);
  const mates = useAppStore((s) => s.project.mates);
  const selectedFastenerId = useAppStore((s) => s.ui.selectedFastenerId);
  const setSelectedFastenerId = useAppStore((s) => s.setSelectedFastenerId);

  const thicknessByMate = useMemo(() => {
    const map = new Map<string, number>();
    for (const f of fasteners) {
      // Prefer the fastener's own member (Phase 19) — falls back to mate's
      // member A for legacy fasteners that predate memberId being stored.
      const directMember = f.memberId ? members.find((m) => m.id === f.memberId) : undefined;
      const mate = mates.find((m) => m.id === f.mateId);
      const member = directMember ?? members.find((m) => m.id === mate?.memberAId);
      map.set(f.id, member?.thickness ?? 1.5);
    }
    return map;
  }, [fasteners, mates, members]);

  return (
    <group>
      {fasteners.map((f) => {
        const isSelected = selectedFastenerId === f.id;
        const placement = resolveFastenerPlacement(f, members);
        if (!placement) return null;
        return (
          <group
            key={f.id}
            position={placement.position}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedFastenerId(f.id);
            }}
          >
            <FastenerGeometry
              type={f.type}
              rotation={placement.rotation}
              memberThickness={thicknessByMate.get(f.id) ?? 1.5}
            />
            {isSelected && (
              <mesh>
                <sphereGeometry args={[0.35, 8, 8]} />
                <meshBasicMaterial color="#fbbf24" wireframe />
              </mesh>
            )}
          </group>
        );
      })}
    </group>
  );
}

export function MateMarkers() {
  const mates = useAppStore((s) => s.project.mates);
  const members = useAppStore((s) => s.project.members);
  const setRadialWheelOpen = useAppStore((s) => s.setRadialWheelOpen);
  const setSelectedMateId = useAppStore((s) => s.setSelectedMateId);

  return (
    <group>
      {mates.map((mate) => {
        const a = members.find((m) => m.id === mate.memberAId);
        const b = members.find((m) => m.id === mate.memberBId);
        if (!a || !b) return null;
        const cA = getFaceCenter(a, mate.faceA);
        const cB = getFaceCenter(b, mate.faceB);
        const mid = cA.clone().add(cB).multiplyScalar(0.5);
        return (
          <group
            key={mate.id}
            position={[mid.x, mid.y, mid.z]}
            onContextMenu={(e) => {
              e.stopPropagation();
              setSelectedMateId(mate.id);
              setRadialWheelOpen(true, 'joinOnly');
            }}
          >
            <mesh>
              <sphereGeometry args={[0.25, 10, 10]} />
              <meshStandardMaterial color="#a855f7" emissive="#7c3aed" emissiveIntensity={0.35} />
            </mesh>
            {mate.joinMethod !== 'Unset' && (
              <Html distanceFactor={14} style={{ pointerEvents: 'none' }}>
                <span className="text-base text-violet-100 bg-zinc-900/90 px-2 py-0.5 rounded border border-violet-600">
                  {mate.joinMethod}
                </span>
              </Html>
            )}
          </group>
        );
      })}
    </group>
  );
}
