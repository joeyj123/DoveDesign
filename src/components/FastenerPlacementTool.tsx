import { ThreeEvent } from '@react-three/fiber';
import { useAppStore } from '../store';
import { pickFaceFromWorldNormal, worldPointToFaceOffset } from '../lib/mating';
import { getMemberHitSize } from '../lib/memberHitBounds';

/** Invisible face hit targets for fastener placement clicks. */
export default function FastenerPlacementTool() {
  const members = useAppStore((s) => s.project.members);
  const fastenerPlacementMode = useAppStore((s) => s.ui.fastenerPlacementMode);
  const fastenerPlacementMateId = useAppStore((s) => s.ui.fastenerPlacementMateId);
  const mates = useAppStore((s) => s.project.mates);
  const addFastener = useAppStore((s) => s.addFastener);

  if (!fastenerPlacementMode || !fastenerPlacementMateId) return null;

  const mate = mates.find((m) => m.id === fastenerPlacementMateId);
  if (!mate || mate.joinMethod === 'Unset') return null;

  function handleFaceClick(
    e: ThreeEvent<MouseEvent>,
    memberId: string
  ) {
    e.stopPropagation();
    if (!e.face || !mate) return;
    const member = members.find((m) => m.id === memberId);
    if (!member) return;

    const worldNormal = e.face.normal.clone().transformDirection(e.object.matrixWorld).normalize();
    const face = pickFaceFromWorldNormal(member, worldNormal);
    const offset = worldPointToFaceOffset(member, face, e.point.clone());

    // Store face-relative (memberId, faceId, offset) only — never a baked world
    // position. FastenerMeshes.tsx re-derives world position/rotation fresh every
    // render via getFaceAlignedPlacement, so the icon follows the board automatically
    // (CAD_MANIFESTO.md Law 1 / VECTOR_PROJECTION_MATH.md).
    addFastener({
      id: crypto.randomUUID(),
      mateId: mate.id,
      memberId,
      faceId: face,
      offset,
      type: mate.joinMethod,
    });
  }

  const involved = [mate.memberAId, mate.memberBId];

  return (
    <group>
      {members
        .filter((m) => involved.includes(m.id))
        .map((m) => {
          const [w, h, d] = getMemberHitSize(m);
          return (
            <mesh
              key={m.id}
              position={m.position}
              rotation={m.rotation}
              onClick={(e) => handleFaceClick(e, m.id)}
            >
              <boxGeometry args={[w, h, d]} />
              <meshBasicMaterial visible={false} />
            </mesh>
          );
        })}
    </group>
  );
}
