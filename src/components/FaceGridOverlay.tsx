import { useMemo } from 'react';
import * as THREE from 'three';
import { Line } from '@react-three/drei';
import { useAppStore } from '../store';
import {
  getFaceCenter,
  getFaceTangentAxes,
  getFaceHalfExtents,
  snapToGrid,
} from '../lib/mating';

const GRID_STEP = 0.25;

function FaceGrid({ memberId, face }: { memberId: string; face: import('../types').FaceId }) {
  const member = useAppStore((s) => s.project.members.find((m) => m.id === memberId));
  if (!member) return null;

  const center = getFaceCenter(member, face);
  const { u, v, normal } = getFaceTangentAxes(member, face);
  const { halfU, halfV } = getFaceHalfExtents(member, face);
  const nudge = normal.clone().multiplyScalar(0.02);

  const lines = useMemo(() => {
    const segs: [THREE.Vector3, THREE.Vector3][] = [];
    for (let uu = -halfU; uu <= halfU + 0.001; uu += GRID_STEP) {
      const snapped = snapToGrid(uu);
      const start = center.clone()
        .add(u.clone().multiplyScalar(snapped))
        .add(v.clone().multiplyScalar(-halfV))
        .add(nudge);
      const end = center.clone()
        .add(u.clone().multiplyScalar(snapped))
        .add(v.clone().multiplyScalar(halfV))
        .add(nudge);
      segs.push([start, end]);
    }
    for (let vv = -halfV; vv <= halfV + 0.001; vv += GRID_STEP) {
      const snapped = snapToGrid(vv);
      const start = center.clone()
        .add(v.clone().multiplyScalar(snapped))
        .add(u.clone().multiplyScalar(-halfU))
        .add(nudge);
      const end = center.clone()
        .add(v.clone().multiplyScalar(snapped))
        .add(u.clone().multiplyScalar(halfU))
        .add(nudge);
      segs.push([start, end]);
    }
    return segs;
  }, [member, face, center, u, v, normal, halfU, halfV, nudge]);

  return (
    <group>
      {lines.map((pts, i) => (
        <Line key={i} points={pts} color="#fbbf24" lineWidth={1} transparent opacity={0.55} />
      ))}
    </group>
  );
}

export default function FaceGridOverlay() {
  const activeTool = useAppStore((s) => s.ui.activeTool);
  const mateHoverFace = useAppStore((s) => s.ui.mateHoverFace);
  const fastenerPlacementMode = useAppStore((s) => s.ui.fastenerPlacementMode);
  const fastenerPlacementMateId = useAppStore((s) => s.ui.fastenerPlacementMateId);
  const mates = useAppStore((s) => s.project.mates);

  if (activeTool === 'mate' && mateHoverFace) {
    return <FaceGrid memberId={mateHoverFace.memberId} face={mateHoverFace.face} />;
  }

  if (fastenerPlacementMode && fastenerPlacementMateId) {
    const mate = mates.find((m) => m.id === fastenerPlacementMateId);
    if (!mate) return null;
    return (
      <>
        <FaceGrid memberId={mate.memberAId} face={mate.faceA} />
        <FaceGrid memberId={mate.memberBId} face={mate.faceB} />
      </>
    );
  }

  return null;
}
