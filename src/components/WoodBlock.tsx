import { useRef, useEffect, useMemo, useLayoutEffect } from 'react';
import * as THREE from 'three';
import { ThreeEvent } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import { Geometry, Base, Subtraction } from '@react-three/csg';
import { useAppStore } from '../store';
import type { WoodMember } from '../types';
import { getWoodGrainTexture, getRoughnessTexture } from '../lib/woodTexture';
import { buildCutSubtractions } from '../lib/joinery';
import { buildWoodJointSubtractions } from '../core/JointFeatures';
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
import SnapPointHandles from './SnapPointHandles';
import JointMarkerRenderer from './JointMarkerRenderer';
import CenterlineRenderer from './CenterlineRenderer';
import { BoardDimensionLines } from './DimensionLineRenderer';

interface Props {
  member: WoodMember;
}

export default function WoodBlock({ member }: Props) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const selectMember = useAppStore((s) => s.selectMember);
  const activeTool   = useAppStore((s) => s.ui.activeTool);
  const mateFaceA = useAppStore((s) => s.ui.mateFaceA);
  const setMateFaceA = useAppStore((s) => s.setMateFaceA);
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
  const selectedJointType = useAppStore((s) => s.ui.selectedJointType);
  const addJointMarker = useAppStore((s) => s.addJointMarker);
  const addCenterlineMarker = useAppStore((s) => s.addCenterlineMarker);
  const pendingInteraction = useAppStore((s) => s.ui.pendingInteraction);
  const setPendingInteraction = useAppStore((s) => s.setPendingInteraction);
  const applyTrimExtend = useAppStore((s) => s.applyTrimExtend);
  const applyWoodJoint = useAppStore((s) => s.applyWoodJoint);
  const applyFastenerToMember = useAppStore((s) => s.applyFastenerToMember);
  const isSelected   = selectedId === member.id || multiSelection.includes(member.id);
  const isHighlighted = suggestionHighlightIds.includes(member.id);
  const isHidden     = isolatedMemberId !== null && isolatedMemberId !== member.id;
  const isMateCandidate =
    activeTool === 'mate' &&
    mateFaceA !== null &&
    mateFaceA.memberId !== member.id;
  const edgeToolActive = activeTool === 'edge' && edgeToolMemberId === member.id;

  const grainTex = getWoodGrainTexture(member.color);
  const roughTex = getRoughnessTexture();

  const woodJoints = useAppStore((s) => s.project.woodJoints);

  const subtractions = useMemo(
    () => [
      ...buildCutSubtractions(member, allMembers),
      // Phase 20: real joinery — derived fresh from joint parameters + both
      // boards' CURRENT placements every recompute (never baked).
      ...buildWoodJointSubtractions(member, woodJoints ?? [], allMembers),
      ...buildEdgeTreatmentSubtractions(member, edgeTreatments).map((e) => ({
        id: e.id,
        position: e.position,
        rotation: e.rotation,
        geometry: 'box' as const,
        args: e.args,
      })),
    ],
    [member, allMembers, edgeTreatments, woodJoints]
  );

  const effectiveDims = useMemo(() => {
    let width = member.width;
    for (const cut of member.cuts) {
      if (cut.type === 'ripCut' && cut.targetWidth) {
        width = cut.targetWidth;
      }
    }
    return { ...member, width };
  }, [member]);

  const baseGeo = useMemo(() => createMemberBaseGeometry(effectiveDims), [effectiveDims]);

  useEffect(() => {
    if (!meshRef.current) return;
    meshRef.current.userData.memberId = member.id;
    // Only set if store values actually differ from current mesh state (avoids
    // snapping the mesh back during an in-progress gizmo drag)
    const m = meshRef.current;
    const [px, py, pz] = member.position;
    const [rx, ry, rz] = member.rotation;
    if (m.position.x !== px || m.position.y !== py || m.position.z !== pz) {
      m.position.set(px, py, pz);
    }
    if (m.rotation.x !== rx || m.rotation.y !== ry || m.rotation.z !== rz) {
      m.rotation.set(rx, ry, rz);
    }
    m.scale.set(1, 1, 1);
  }, [member.id, member.position[0], member.position[1], member.position[2], member.rotation[0], member.rotation[1], member.rotation[2]]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleFaceFromEvent(e: ThreeEvent<MouseEvent>) {
    if (!e.face) return null;
    // Use the parent mesh matrixWorld, not e.object (which may be a CSG child with wrong transform)
    const matrix = meshRef.current?.matrixWorld ?? e.object.matrixWorld;
    const worldNormal = e.face.normal.clone().transformDirection(matrix).normalize();
    const face = pickFaceFromWorldNormal(member, worldNormal);
    console.log('[Mate] face detected:', face, 'worldNormal:', worldNormal);
    return face;
  }

  function handleClick(e: ThreeEvent<MouseEvent>) {
    e.stopPropagation();

    if (consumeBoxSelectClickSuppress()) return;

    const ui = useAppStore.getState().ui;
    if (ui.boxSelectRect || ui.boxSelectPending) return;
    if (activeTool === 'drawBoard') return;

    if (activeTool === 'centerline' && e.face) {
      e.stopPropagation();
      const matrix = meshRef.current?.matrixWorld ?? e.object.matrixWorld;
      const worldNormal = e.face.normal.clone().transformDirection(matrix).normalize();
      const face = pickFaceFromWorldNormal(member, worldNormal);
      const faceIndexMap: Record<string, number> = {
        xMin: 0, xMax: 1, yMin: 2, yMax: 3, zMin: 4, zMax: 5,
      };
      const fi = faceIndexMap[face ?? 'yMax'] ?? 3;
      // Determine centerline axis: the longest dimension on this face
      const faceAxes: Record<number, 'x' | 'y' | 'z'> = {
        0: member.width >= member.thickness ? 'z' : 'y', // xMin/xMax face
        1: member.width >= member.thickness ? 'z' : 'y',
        2: member.length >= member.width ? 'x' : 'z',   // yMin/yMax face
        3: member.length >= member.width ? 'x' : 'z',
        4: member.length >= member.thickness ? 'x' : 'y', // zMin/zMax face
        5: member.length >= member.thickness ? 'x' : 'y',
      };
      const fn: [number, number, number] = [worldNormal.x, worldNormal.y, worldNormal.z];
      addCenterlineMarker(member.id, {
        id: crypto.randomUUID(),
        faceIndex: fi,
        axis: faceAxes[fi] ?? 'x',
        faceNormal: fn,
      });
      return;
    }

    if (activeTool === 'joint' && selectedJointType && e.face) {
      e.stopPropagation();
      const matrix = meshRef.current?.matrixWorld ?? e.object.matrixWorld;
      const worldNormal = e.face.normal.clone().transformDirection(matrix).normalize();
      const face = pickFaceFromWorldNormal(member, worldNormal);
      // Map FaceId → faceIndex number
      const faceIndexMap: Record<string, number> = {
        xMin:0, xMax:1, yMin:2, yMax:3, zMin:4, zMax:5,
      };
      const faceIndex = faceIndexMap[face ?? 'yMax'] ?? 3;

      // Convert world hit point to board local space
      const invMatrix = new THREE.Matrix4().copy(matrix).invert();
      const localHit = e.point.clone().applyMatrix4(invMatrix);

      addJointMarker(member.id, {
        type: selectedJointType,
        position: { x: localHit.x, y: localHit.y, z: localHit.z },
        faceIndex,
      });
      return;
    }

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

    // Phase 20 — strict 2-click Trim/Extend: click 1 = target face (this
    // board stays), click 2 = the board whose length changes.
    if (activeTool === 'trimExtend' && e.face) {
      e.stopPropagation();
      const face = handleFaceFromEvent(e)!;
      const p = useAppStore.getState().ui.pendingInteraction;
      if (!p || p.kind !== 'trimExtend' || p.targetMemberId === member.id) {
        setPendingInteraction({
          kind: 'trimExtend',
          step: 'pickBoardToAdjust',
          targetMemberId: member.id,
          targetFaceId: face,
        });
      } else {
        applyTrimExtend(member.id);
      }
      return;
    }

    // Phase 20 — Connections palette (Detail Mode): real joinery + fasteners
    // share one pick flow, driven entirely by the pendingInteraction machine.
    if (activeTool === 'connection' && e.face) {
      const p = useAppStore.getState().ui.pendingInteraction;
      if (!p) return; // nothing chosen in the palette yet — hint bar guides
      e.stopPropagation();
      const face = handleFaceFromEvent(e)!;
      if (p.kind === 'joinery') {
        if (p.step === 'pickFaceA') {
          const offset = worldPointToFaceOffset(member, face, e.point.clone());
          setPendingInteraction({
            kind: 'joinery',
            step: 'pickFaceB',
            jointType: p.jointType,
            memberAId: member.id,
            faceAId: face,
            offsetA: offset,
          });
        } else if (member.id !== p.memberAId) {
          applyWoodJoint(member.id, face);
        }
        return;
      }
      if (p.kind === 'fastener') {
        applyFastenerToMember(member.id);
        return;
      }
      return;
    }

    if (activeTool === 'mate' && e.face) {
      const face = handleFaceFromEvent(e)!;
      const offset = worldPointToFaceOffset(member, face, e.point.clone());
      setMateGridOffset({ memberId: member.id, face, offset });
      const sel = { memberId: member.id, face, offset };

      const currentFaceA = useAppStore.getState().ui.mateFaceA;

      if (!currentFaceA) {
        setMateFaceA(sel);
        return;
      }
      if (currentFaceA.memberId === member.id && currentFaceA.face === face) return;
      if (currentFaceA.memberId === member.id) {
        setMateFaceA(sel);
        return;
      }
      // Set faceB directly in store then immediately call applyMate to avoid stale state
      useAppStore.setState((s) => ({ ui: { ...s.ui, mateFaceB: sel } }));
      applyMate();
      return;
    }

    if (activeTool === 'select' && e.shiftKey) {
      toggleMultiSelectionMember(member.id);
      return;
    }

    if (activeTool === 'select') {
      // Don't call selectMember if already selected — it would reset transformGizmoActive
      const currentSelectedId = useAppStore.getState().ui.selectedMemberId;
      if (currentSelectedId !== member.id) {
        selectMember(member.id, { openWheel: false });
      }
      return;
    }

    selectMember(member.id, { openWheel: false });
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
        {(() => {
          const finish = member.finish;
          const ft = finish?.type ?? 'none';
          const sheenRoughness = finish?.sheen === 'gloss' ? 0.05 : finish?.sheen === 'satin' ? 0.4 : 0.9;
          const isPendingTarget =
            (pendingInteraction?.kind === 'trimExtend' &&
              pendingInteraction.targetMemberId === member.id) ||
            (pendingInteraction?.kind === 'joinery' &&
              pendingInteraction.step === 'pickFaceB' &&
              pendingInteraction.memberAId === member.id);
          const emissiveColor =
            isPendingTarget ? '#14b8a6' :
            isSelected || isHighlighted ? '#ffaa00' :
            isMateCandidate ? '#0066ff' : '#000000';
          const emissiveInt =
            isPendingTarget ? 0.3 :
            isSelected ? 0.28 : isHighlighted ? 0.22 : isMateCandidate ? 0.15 : 0;

          if (ft === 'paint' && finish?.color) {
            return (
              <meshStandardMaterial
                color={finish.color}
                roughness={sheenRoughness}
                metalness={0}
                wireframe={wireframe}
                transparent={xray}
                opacity={xray ? 0.3 : 1}
                depthWrite={!xray}
                emissive={emissiveColor}
                emissiveIntensity={emissiveInt}
              />
            );
          }
          if (ft === 'clear_coat') {
            return (
              <meshStandardMaterial
                map={wireframe || xray ? undefined : grainTex}
                roughnessMap={wireframe ? undefined : roughTex}
                roughness={sheenRoughness}
                metalness={0.05}
                envMapIntensity={1.4}
                wireframe={wireframe}
                transparent={xray}
                opacity={xray ? 0.3 : 1}
                depthWrite={!xray}
                emissive={emissiveColor}
                emissiveIntensity={emissiveInt}
              />
            );
          }
          if (ft === 'oil') {
            return (
              <meshStandardMaterial
                map={wireframe || xray ? undefined : grainTex}
                roughnessMap={wireframe ? undefined : roughTex}
                color="#c8884a"
                roughness={0.4}
                metalness={0}
                wireframe={wireframe}
                transparent={xray}
                opacity={xray ? 0.3 : 1}
                depthWrite={!xray}
                emissive={emissiveColor}
                emissiveIntensity={emissiveInt}
              />
            );
          }
          // default / stain
          const stainColor = (ft === 'stain' && finish?.color) ? finish.color : member.color;
          return (
            <meshStandardMaterial
              map={wireframe || xray ? undefined : grainTex}
              roughnessMap={wireframe ? undefined : roughTex}
              color={stainColor}
              roughness={ft === 'stain' ? (sheenRoughness * 0.85) : 0.82}
              metalness={0}
              wireframe={wireframe}
              transparent={xray}
              opacity={xray ? 0.3 : 1}
              depthWrite={!xray}
              emissive={emissiveColor}
              emissiveIntensity={emissiveInt}
            />
          );
        })()}

        <Geometry>
          <Base>
            {(member.shapeType ?? 'box') === 'box' && (
              <boxGeometry args={[effectiveDims.length, effectiveDims.thickness, effectiveDims.width]} />
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
              {sub.geometry === 'box' && (
                <boxGeometry args={sub.args as [number, number, number]} />
              )}
              {sub.geometry === 'cylinder' && (
                <cylinderGeometry args={sub.args as [number, number, number, number]} />
              )}
              {sub.geometry === 'taperPrism' && (
                <TaperPrismGeometry args={sub.args as [number, number, number, number]} />
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

        {/* CenterlineRenderer and BoardDimensionLines are children of the mesh so their local coords auto-follow the board */}
        <CenterlineRenderer member={member} />
        <BoardDimensionLines member={member} />

        {/* Phase 20: picked target face highlight (trim/extend + joinery step 1).
            A mesh child, so it follows the board automatically. */}
        {pendingInteraction?.kind === 'trimExtend' &&
          pendingInteraction.targetMemberId === member.id && (
            <TargetFaceHighlight member={member} face={pendingInteraction.targetFaceId} color="#14b8a6" />
          )}
        {pendingInteraction?.kind === 'joinery' &&
          pendingInteraction.step === 'pickFaceB' &&
          pendingInteraction.memberAId === member.id && (
            <TargetFaceHighlight member={member} face={pendingInteraction.faceAId} color="#f59e0b" />
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
      <SnapPointHandles member={member} meshRef={meshRef} forMate />
      <JointMarkerRenderer member={member} />
    </>
  );
}

function getWorldQuaternion(member: WoodMember): THREE.Quaternion {
  const e = new THREE.Euler(...member.rotation);
  return new THREE.Quaternion().setFromEuler(e);
}

/**
 * Phase 20: translucent overlay marking the picked target face during a
 * 2-click flow. Rendered as a child of the board mesh in LOCAL coordinates
 * derived from the FaceId + current dimensions — follows the board for free.
 */
function TargetFaceHighlight({
  member,
  face,
  color,
}: {
  member: WoodMember;
  face: import('../types').FaceId;
  color: string;
}) {
  const hL = member.length / 2, hT = member.thickness / 2, hW = member.width / 2;
  const LIFT = 0.04;
  let position: [number, number, number];
  let rotation: [number, number, number];
  let size: [number, number];
  switch (face) {
    case 'xMin': position = [-hL - LIFT, 0, 0]; rotation = [0, -Math.PI / 2, 0]; size = [member.width, member.thickness]; break;
    case 'xMax': position = [hL + LIFT, 0, 0]; rotation = [0, Math.PI / 2, 0]; size = [member.width, member.thickness]; break;
    case 'yMin': position = [0, -hT - LIFT, 0]; rotation = [Math.PI / 2, 0, 0]; size = [member.length, member.width]; break;
    case 'yMax': position = [0, hT + LIFT, 0]; rotation = [-Math.PI / 2, 0, 0]; size = [member.length, member.width]; break;
    case 'zMin': position = [0, 0, -hW - LIFT]; rotation = [0, Math.PI, 0]; size = [member.length, member.thickness]; break;
    case 'zMax': position = [0, 0, hW + LIFT]; rotation = [0, 0, 0]; size = [member.length, member.thickness]; break;
  }
  return (
    <mesh position={position} rotation={rotation} raycast={() => null}>
      <planeGeometry args={size} />
      <meshBasicMaterial color={color} transparent opacity={0.3} side={THREE.DoubleSide} depthWrite={false} />
    </mesh>
  );
}

/**
 * Phase 20: trapezoid-cross-section prism for real dovetail geometry.
 * args = [depth, extrude, wOuter, wInner]. Local +X = outward (outer width at
 * x=0, inner at x=-depth), Y = layout width, Z pre-rotation = extrusion; the
 * geometry is rotated so extrusion runs along local Z of the subtraction
 * frame set by JointFeatures/joinery (which orient via the rotation prop).
 */
function TaperPrismGeometry({ args }: { args: [number, number, number, number] }) {
  const [depth, extrude, wOuter, wInner] = args;
  const geo = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, -wOuter / 2);
    shape.lineTo(0, wOuter / 2);
    shape.lineTo(-depth, wInner / 2);
    shape.lineTo(-depth, -wInner / 2);
    shape.closePath();
    const g = new THREE.ExtrudeGeometry(shape, { depth: extrude, bevelEnabled: false });
    // Center the extrusion on the prism's local Z axis.
    g.translate(0, 0, -extrude / 2);
    g.computeVertexNormals();
    return g;
  }, [depth, extrude, wOuter, wInner]);
  return <primitive object={geo} attach="geometry" />;
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
