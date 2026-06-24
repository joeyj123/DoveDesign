import { useRef, useEffect, useMemo, useLayoutEffect } from 'react';
import * as THREE from 'three';
import { ThreeEvent } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import { Geometry, Base, Subtraction } from '@react-three/csg';
import { useAppStore } from '../store';
import type { WoodMember } from '../types';
import { getWoodGrainTexture, getRoughnessTexture } from '../lib/woodTexture';
import { buildCutSubtractions } from '../lib/joinery';
import {
  pickFaceFromWorldNormal,
  worldPointToFaceOffset,
  getFacePointWorld,
  getFaceNormal,
} from '../lib/mating';
import { buildEdgeTreatmentSubtractions, getBoxEdgeSegment } from '../lib/edgeTreatments';
import { buildCustomPolygonShape, createMemberBaseGeometry } from '../lib/memberGeometry';
import { consumeBoxSelectClickSuppress } from '../lib/boxSelectGuard';
import TransformGizmo from './TransformGizmo';

interface Props {
  member: WoodMember;
}

export default function WoodBlock({ member }: Props) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const selectMember = useAppStore((s) => s.selectMember);
  const activeTool   = useAppStore((s) => s.ui.activeTool);
  const mateFaceA = useAppStore((s) => s.ui.mateFaceA);
  const setMateFaceA = useAppStore((s) => s.setMateFaceA);
  const setMateFaceB = useAppStore((s) => s.setMateFaceB);
  const setMateHoverFace = useAppStore((s) => s.setMateHoverFace);
  const setMateGridOffset = useAppStore((s) => s.setMateGridOffset);
  const applyMate = useAppStore((s) => s.applyMate);
  const addAttachmentPoint = useAppStore((s) => s.addAttachmentPoint);
  const attachmentPointPickA = useAppStore((s) => s.ui.attachmentPointPickA);
  const connectAttachmentPoints = useAppStore((s) => s.connectAttachmentPoints);
  const setAttachmentPointPickA = useAppStore((s) => s.setAttachmentPointPickA);
  const allMembers   = useAppStore((s) => s.project.members);
  const edgeTreatments = useAppStore((s) => s.project.edgeTreatments);
  const selectedId   = useAppStore((s) => s.ui.selectedMemberId);
  const multiSelection = useAppStore((s) => s.ui.multiSelection);
  const toggleMultiSelectionMember = useAppStore((s) => s.toggleMultiSelectionMember);
  const isolatedMemberId = useAppStore((s) => s.ui.isolatedMemberId);
  const suggestionHighlightIds = useAppStore((s) => s.ui.suggestionHighlightIds);
  const mateGridOffset = useAppStore((s) => s.ui.mateGridOffset);
  const displayMode = useAppStore((s) => s.ui.displayMode);
  const edgeToolMemberId = useAppStore((s) => s.ui.edgeToolMemberId);
  const edgeHoverIndex = useAppStore((s) => s.ui.edgeHoverIndex);
  const edgeSelectedIndex = useAppStore((s) => s.ui.edgeSelectedIndex);
  const setEdgeHoverIndex = useAppStore((s) => s.setEdgeHoverIndex);
  const setEdgeSelectedIndex = useAppStore((s) => s.setEdgeSelectedIndex);
  const hardwareLibraryPick = useAppStore((s) => s.ui.hardwareLibraryPick);
  const addPlacedHardware = useAppStore((s) => s.addPlacedHardware);
  const viewportMode = useAppStore((s) => s.ui.viewportMode);
  const isSelected   = selectedId === member.id || multiSelection.includes(member.id);
  const isHighlighted = suggestionHighlightIds.includes(member.id);
  const isHidden     = isolatedMemberId !== null && isolatedMemberId !== member.id;
  const edgeToolActive = activeTool === 'edge' && edgeToolMemberId === member.id;

  const grainTex = getWoodGrainTexture(member.color);
  const roughTex = getRoughnessTexture();

  const subtractions = useMemo(
    () => [
      ...buildCutSubtractions(member, allMembers),
      ...buildEdgeTreatmentSubtractions(member, edgeTreatments).map((e) => ({
        id: e.id,
        position: e.position,
        rotation: e.rotation,
        geometry: 'box' as const,
        args: e.args,
      })),
    ],
    [member, allMembers, edgeTreatments]
  );

  const baseGeo = useMemo(() => createMemberBaseGeometry(member), [member]);

  useEffect(() => {
    if (!meshRef.current) return;
    meshRef.current.userData.memberId = member.id;
    meshRef.current.position.set(...member.position);
    meshRef.current.rotation.set(...member.rotation);
    meshRef.current.scale.set(1, 1, 1);
  }, [member.id, member.position, member.rotation]);

  function handleFaceFromEvent(e: ThreeEvent<MouseEvent>) {
    if (!e.face) return null;
    const worldNormal = e.face.normal.clone().transformDirection(e.object.matrixWorld).normalize();
    return pickFaceFromWorldNormal(member, worldNormal);
  }

  function handleClick(e: ThreeEvent<MouseEvent>) {
    e.stopPropagation();

    if (consumeBoxSelectClickSuppress()) return;

    const ui = useAppStore.getState().ui;
    if (ui.boxSelectRect || ui.boxSelectPending) return;
    if (activeTool === 'drawBoard') return;

    if (activeTool === 'placeHardware' && hardwareLibraryPick && e.face) {
      const face = handleFaceFromEvent(e)!;
      const offset = worldPointToFaceOffset(member, face, e.point.clone());
      const snapped = getFacePointWorld(member, face, offset);
      const normal = getFaceNormal(member, face);
      const quat = new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        normal
      );
      const euler = new THREE.Euler().setFromQuaternion(quat);
      addPlacedHardware({
        id: crypto.randomUUID(),
        libraryId: hardwareLibraryPick,
        memberId: member.id,
        position: [snapped.x, snapped.y, snapped.z],
        rotation: [euler.x, euler.y, euler.z],
        scale: 1,
      });
      return;
    }

    if (activeTool === 'mate' && e.face) {
      const face = handleFaceFromEvent(e)!;
      const offset = worldPointToFaceOffset(member, face, e.point.clone());
      setMateGridOffset({ memberId: member.id, face, offset });
      const sel = { memberId: member.id, face, offset };
      if (!mateFaceA) {
        setMateFaceA(sel);
        return;
      }
      if (mateFaceA.memberId === member.id && mateFaceA.face === face) return;
      if (mateFaceA.memberId === member.id) {
        setMateFaceA(sel);
        return;
      }
      setMateFaceB(sel);
      applyMate();
      return;
    }

    if (activeTool === 'select' && e.shiftKey) {
      toggleMultiSelectionMember(member.id);
      return;
    }

    if (activeTool === 'select') {
      if (selectedId === member.id && multiSelection.length === 1) {
        return;
      }
      selectMember(member.id);
      return;
    }

    selectMember(member.id);
  }

  function handlePointerDown(e: ThreeEvent<PointerEvent>) {
    if (e.button !== 0) return;
    if (activeTool === 'drawBoard') return;
    const ui = useAppStore.getState().ui;
    if (ui.boxSelectRect) {
      e.stopPropagation();
    }
  }

  function handlePointerMove(e: ThreeEvent<PointerEvent>) {
    if (activeTool === 'mate' && e.face) {
      const face = handleFaceFromEvent(e);
      if (face) setMateHoverFace({ memberId: member.id, face });
    }
    if (edgeToolActive && e.point) {
      let bestIdx = 0;
      let bestDist = Infinity;
      for (let i = 0; i < 12; i++) {
        const [a, b] = getBoxEdgeSegment(member, i);
        const q = getWorldQuaternion(member);
        const pos = new THREE.Vector3(...member.position);
        a.applyQuaternion(q).add(pos);
        b.applyQuaternion(q).add(pos);
        const closest = new THREE.Vector3();
        new THREE.Line3(a, b).closestPointToPoint(e.point, true, closest);
        const d = closest.distanceTo(e.point);
        if (d < bestDist) {
          bestDist = d;
          bestIdx = i;
        }
      }
      if (bestDist < 2) setEdgeHoverIndex(bestIdx);
    }
  }

  function handlePointerOut() {
    if (activeTool === 'mate') setMateHoverFace(null);
    if (edgeToolActive) setEdgeHoverIndex(null);
  }

  function handleDoubleClick(e: ThreeEvent<MouseEvent>) {
    if (activeTool !== 'mate' || !e.face) return;
    e.stopPropagation();
    const face = handleFaceFromEvent(e)!;
    const offset = worldPointToFaceOffset(member, face, e.point.clone());
    const id = crypto.randomUUID();
    addAttachmentPoint({
      id,
      memberId: member.id,
      faceIndex: face,
      offset,
      name: `Point ${useAppStore.getState().project.attachmentPoints.length + 1}`,
    });
    if (attachmentPointPickA) {
      connectAttachmentPoints(attachmentPointPickA, id);
      setAttachmentPointPickA(null);
    } else {
      setAttachmentPointPickA(id);
    }
  }

  if (isHidden) return null;

  const showGridMarker =
    activeTool === 'mate' &&
    ((mateFaceA?.memberId === member.id && mateFaceA.offset) ||
      (mateGridOffset?.memberId === member.id));
  const markerFace = mateFaceA?.memberId === member.id ? mateFaceA.face : mateGridOffset?.face;
  const markerOffset = mateFaceA?.memberId === member.id ? mateFaceA.offset : mateGridOffset?.offset;
  const markerPos =
    showGridMarker && markerFace && markerOffset
      ? getFacePointWorld(member, markerFace, markerOffset)
      : null;

  const wireframe = displayMode === 'wireframe';
  const xray = displayMode === 'xray';
  const showEdges = displayMode === 'shadedEdges' || isSelected;

  const edgeLines = edgeToolActive
    ? Array.from({ length: 12 }, (_, i) => {
        const [a, b] = getBoxEdgeSegment(member, i);
        const q = getWorldQuaternion(member);
        const pos = new THREE.Vector3(...member.position);
        return [
          a.clone().applyQuaternion(q).add(pos),
          b.clone().applyQuaternion(q).add(pos),
        ] as [THREE.Vector3, THREE.Vector3];
      })
    : [];

  return (
    <>
      <mesh
        ref={meshRef}
        position={member.position}
        rotation={member.rotation}
        onClick={handleClick}
        onPointerDown={handlePointerDown}
        onDoubleClick={handleDoubleClick}
        onPointerMove={handlePointerMove}
        onPointerOut={handlePointerOut}
        castShadow={viewportMode === 'assembly' || viewportMode === 'design'}
        receiveShadow
      >
        <meshStandardMaterial
          map={wireframe || xray ? undefined : grainTex}
          roughnessMap={wireframe ? undefined : roughTex}
          roughness={0.82}
          metalness={0}
          wireframe={wireframe}
          transparent={xray}
          opacity={xray ? 0.3 : 1}
          depthWrite={!xray}
          emissive={isSelected || isHighlighted ? '#ffaa00' : '#000000'}
          emissiveIntensity={isSelected ? 0.28 : isHighlighted ? 0.22 : 0}
        />

        <Geometry>
          <Base>
            {(member.shapeType ?? 'box') === 'box' && (
              <boxGeometry args={[member.length, member.thickness, member.width]} />
            )}
            {(member.shapeType ?? 'box') === 'cylinder' && (
              <cylinderGeometry args={[member.radius ?? member.width / 2, member.radius ?? member.width / 2, member.length, 24]} />
            )}
            {(member.shapeType ?? 'box') === 'sphere' && (
              <sphereGeometry args={[member.radius ?? member.width / 2, 24, 16]} />
            )}
            {(member.shapeType ?? 'box') === 'cone' && (
              <cylinderGeometry args={[0, member.radius ?? member.width / 2, member.length, 24]} />
            )}
            {(member.shapeType ?? 'box') === 'triangularPrism' && (
              <cylinderGeometry args={[member.width / 2, member.width / 2, member.length, 3]} />
            )}
            {(member.shapeType ?? 'box') === 'hexagonalPrism' && (
              <cylinderGeometry args={[member.width / 2, member.width / 2, member.length, 6]} />
            )}
            {(member.shapeType ?? 'box') === 'customPolygon' &&
              member.polygonPoints &&
              member.polygonPoints.length >= 3 && (
                <CustomPolygonExtrude member={member} />
              )}
            {(member.shapeType ?? 'box') === 'customPolygon' &&
              (!member.polygonPoints || member.polygonPoints.length < 3) && (
              <boxGeometry args={[member.length, member.thickness, member.width]} />
            )}
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

        {showEdges && !wireframe && (
          <lineSegments>
            <edgesGeometry args={[baseGeo]} />
            <lineBasicMaterial color="#ff8800" />
          </lineSegments>
        )}
      </mesh>

      {edgeToolActive &&
        edgeLines.map((pts, i) => (
          <Line
            key={i}
            points={pts}
            color={edgeHoverIndex === i || edgeSelectedIndex === i ? '#fbbf24' : '#52525b'}
            lineWidth={edgeHoverIndex === i ? 3 : 1}
          />
        ))}

      {edgeToolActive && edgeHoverIndex !== null && (() => {
        const pts = edgeLines[edgeHoverIndex];
        const mid = pts[0].clone().lerp(pts[1], 0.5);
        return (
          <mesh
            position={mid}
            onClick={(e) => {
              e.stopPropagation();
              setEdgeSelectedIndex(edgeHoverIndex);
            }}
          >
            <sphereGeometry args={[0.4, 8, 8]} />
            <meshBasicMaterial visible={false} />
          </mesh>
        );
      })()}

      {markerPos && (
        <mesh position={[markerPos.x, markerPos.y, markerPos.z]}>
          <sphereGeometry args={[0.18, 10, 10]} />
          <meshStandardMaterial color="#fbbf24" emissive="#d97706" emissiveIntensity={0.5} />
        </mesh>
      )}

      {isSelected && <TransformGizmo member={member} objectRef={meshRef} />}
    </>
  );
}

function getWorldQuaternion(member: WoodMember): THREE.Quaternion {
  const e = new THREE.Euler(...member.rotation);
  return new THREE.Quaternion().setFromEuler(e);
}

/** CSG base primitive for custom polygon footprints (extruded along Y). */
function CustomPolygonExtrude({ member }: { member: WoodMember }) {
  const geoRef = useRef<THREE.ExtrudeGeometry>(null!);
  const shape = useMemo(
    () => buildCustomPolygonShape(member.polygonPoints!),
    [member.polygonPoints]
  );
  const depth = member.thickness;
  const config = useMemo(
    () => ({ depth, bevelEnabled: false as const }),
    [depth]
  );

  useLayoutEffect(() => {
    if (!geoRef.current) return;
    geoRef.current.rotateX(-Math.PI / 2);
    geoRef.current.translate(0, -depth / 2, 0);
    geoRef.current.computeVertexNormals();
  }, [shape, depth]);

  return <extrudeGeometry ref={geoRef} args={[shape, config]} />;
}
