import { useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { Line, Html } from '@react-three/drei';
import { useThree, useFrame } from '@react-three/fiber';
import { useAppStore } from '../store';
import type { DimensionLine, WoodMember } from '../types';
import { registerDimDragHandler, type DimDragState } from '../lib/dimDragManager';
import { CADGeometryEngine, migrateWoodMemberToSolidBoard } from '../core/Engine';

const AMBER = '#F59E0B';
const AMBER_BRIGHT = '#FCD34D';
const GREEN = '#22c55e';
const FLOOR = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

function angleDeg(a: THREE.Vector3, b: THREE.Vector3) {
  return ((Math.atan2(b.z - a.z, b.x - a.x) * 180) / Math.PI + 360) % 360;
}

/**
 * Pure presentational item. `start`/`end`/`normal` are already in whatever coordinate
 * space the parent renders in (world for free-floating lines, LOCAL board space when
 * mounted as a child of the board mesh — same pattern as CenterlineRenderer).
 */
function DimensionLineVisual({
  id,
  start,
  end,
  normal,
  angleDegrees,
  isSelected,
  onSelect,
  onRemove,
  onStartDrag,
}: {
  id: string;
  start: THREE.Vector3;
  end: THREE.Vector3;
  normal: THREE.Vector3;
  angleDegrees: number;
  isSelected: boolean;
  onSelect: (id: string | null) => void;
  onRemove: (id: string) => void;
  onStartDrag: (state: DimDragState) => void;
}) {
  const OFFSET = 0.06;
  const s = start.clone().addScaledVector(normal, OFFSET);
  const e = end.clone().addScaledVector(normal, OFFSET);
  const mid = new THREE.Vector3().addVectors(s, e).multiplyScalar(0.5);
  const dist = s.distanceTo(e);
  const isCardinal = angleDegrees % 90 === 0;
  const lineColor = isSelected ? AMBER_BRIGHT : (isCardinal ? AMBER_BRIGHT : AMBER);
  const points: [number, number, number][] = [[s.x, s.y, s.z], [e.x, e.y, e.z]];

  const makeHandle = (pos: THREE.Vector3, endpoint: 'start' | 'end') => (
    <group position={[pos.x, pos.y, pos.z]}>
      <mesh
        onPointerDown={(ev) => {
          ev.stopPropagation();
          onSelect(id);
          const rect = (ev.nativeEvent.target as HTMLElement).closest('canvas')?.getBoundingClientRect();
          if (!rect) return;
          const ndc = new THREE.Vector2(
            ((ev.nativeEvent.clientX - rect.left) / rect.width) * 2 - 1,
            -((ev.nativeEvent.clientY - rect.top) / rect.height) * 2 + 1,
          );
          onStartDrag({ lineId: id, endpoint, ndc });
        }}
      >
        <sphereGeometry args={[isSelected ? 0.28 : 0.18, 10, 10]} />
        <meshBasicMaterial color={isSelected ? GREEN : lineColor} />
      </mesh>
      {!isSelected && (
        <mesh onPointerDown={(ev) => { ev.stopPropagation(); onSelect(id); }}>
          <sphereGeometry args={[0.38, 6, 6]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      )}
    </group>
  );

  return (
    <group>
      <Line
        points={points}
        color={lineColor}
        lineWidth={isSelected ? 2.5 : 1.5}
        dashed
        dashSize={0.4}
        gapSize={0.2}
        onClick={(ev) => { ev.stopPropagation(); onSelect(isSelected ? null : id); }}
      />

      {makeHandle(s, 'start')}
      {makeHandle(e, 'end')}

      {dist > 0.1 && (
        <Html position={[mid.x, mid.y + 0.2, mid.z]} center zIndexRange={[0, 10]}>
          <div
            className="px-2 py-0.5 rounded-full text-xs font-semibold text-white pointer-events-none select-none whitespace-nowrap"
            style={{
              background: 'rgba(24,24,27,0.92)',
              border: `1px solid ${isSelected ? AMBER_BRIGHT : '#52525b'}`,
            }}
          >
            {dist.toFixed(2)}&quot;
          </div>
        </Html>
      )}

      {isSelected && (
        <Html position={[mid.x, mid.y + 0.7, mid.z]} center zIndexRange={[0, 10]}>
          <button
            className="px-2 py-0.5 rounded text-xs font-semibold text-red-400 border border-red-500/50 bg-zinc-900/90 hover:bg-red-500/20 transition-colors"
            onClick={() => { onRemove(id); onSelect(null); }}
          >
            Delete Line
          </button>
        </Html>
      )}
    </group>
  );
}

/**
 * Renders dimension lines anchored to a specific board. Mounted INSIDE that board's
 * <mesh> (see WoodBlock.tsx) so it inherits the board's transform automatically via
 * Three.js parent-child hierarchy — identical pattern to CenterlineRenderer. Uses
 * localStart/localEnd/localFaceNormal directly as local coordinates; no manual
 * matrixWorld math, so it can never get out of sync with the board.
 */
export function BoardDimensionLines({ member }: { member: WoodMember }) {
  const dimensionLines = useAppStore((s) => s.project.dimensionLines ?? []);
  const dimensionLinesVisible = useAppStore((s) => s.ui.dimensionLinesVisible);
  const selectedId = useAppStore((s) => s.ui.selectedDimensionLineId);
  const selectDimensionLine = useAppStore((s) => s.selectDimensionLine);
  const removeDimensionLine = useAppStore((s) => s.removeDimensionLine);

  if (!dimensionLinesVisible) return null;

  const anchored = dimensionLines.filter(
    (dl) => dl.anchorMemberId === member.id && dl.localStart && dl.localEnd
  );
  if (anchored.length === 0) return null;

  // Per CAD_MANIFESTO.md Law 1: when (faceId, u, v) is present, that is the
  // source of truth — derive the local-space render points fresh from it via
  // inverse projection every render, rather than trusting stored localStart/
  // localEnd. Boards mounted as a Three.js mesh child then carry this local
  // point to world space automatically as the board moves/rotates.
  const board = (dl: { anchorFaceId?: string; startUV?: { u: number; v: number }; endUV?: { u: number; v: number } }) =>
    dl.anchorFaceId && dl.startUV && dl.endUV
      ? migrateWoodMemberToSolidBoard({
          id: member.id, label: member.label, species: member.species,
          length: member.length, thickness: member.thickness, width: member.width,
          position: member.position, rotation: member.rotation,
        })
      : null;

  return (
    <>
      {anchored.map((dl) => {
        let start: THREE.Vector3;
        let end: THREE.Vector3;
        let normal: THREE.Vector3;
        const b = board(dl);
        const face = b?.faces.find((f) => f.id === dl.anchorFaceId);
        if (b && face && dl.startUV && dl.endUV) {
          const sLocal = CADGeometryEngine.projectUVToLocal(face, dl.startUV.u, dl.startUV.v);
          const eLocal = CADGeometryEngine.projectUVToLocal(face, dl.endUV.u, dl.endUV.v);
          start = new THREE.Vector3(sLocal.x, sLocal.y, sLocal.z);
          end = new THREE.Vector3(eLocal.x, eLocal.y, eLocal.z);
          normal = new THREE.Vector3(face.normal.x, face.normal.y, face.normal.z);
        } else {
          start = new THREE.Vector3(dl.localStart!.x, dl.localStart!.y, dl.localStart!.z);
          end = new THREE.Vector3(dl.localEnd!.x, dl.localEnd!.y, dl.localEnd!.z);
          normal = dl.localFaceNormal
            ? new THREE.Vector3(dl.localFaceNormal.x, dl.localFaceNormal.y, dl.localFaceNormal.z)
            : new THREE.Vector3(0, 1, 0);
        }
        return (
          <DimensionLineVisual
            key={dl.id}
            id={dl.id}
            start={start}
            end={end}
            normal={normal}
            angleDegrees={dl.angleDegrees}
            isSelected={selectedId === dl.id}
            onSelect={selectDimensionLine}
            onRemove={removeDimensionLine}
            onStartDrag={(s) => registerDimDragHandler.start(s)}
          />
        );
      })}
    </>
  );
}

/**
 * Global renderer for free-floating dimension lines (not anchored to any board), plus
 * the shared drag manager used by both this renderer and BoardDimensionLines.
 */
export default function DimensionLineRenderer() {
  const dimensionLines = useAppStore((s) => s.project.dimensionLines ?? []);
  const dimensionLinesVisible = useAppStore((s) => s.ui.dimensionLinesVisible);
  const selectedId = useAppStore((s) => s.ui.selectedDimensionLineId);
  const selectDimensionLine = useAppStore((s) => s.selectDimensionLine);
  const removeDimensionLine = useAppStore((s) => s.removeDimensionLine);
  const updateDimensionLine = useAppStore((s) => s.updateDimensionLine);
  const setOrbitControlsEnabled = useAppStore((s) => s.setOrbitControlsEnabled);

  const { camera, gl } = useThree();
  const dragRef = useRef<DimDragState | null>(null);
  const ndcRef = useRef(new THREE.Vector2());
  const rc = useRef(new THREE.Raycaster());
  const setDragLive = useState<{ lineId: string; endpoint: 'start' | 'end'; pt: THREE.Vector3 } | null>(null)[1];

  const startDrag = useCallback((state: DimDragState) => {
    dragRef.current = state;
    ndcRef.current.copy(state.ndc);
    setOrbitControlsEnabled(false);

    const onMove = (e: PointerEvent) => {
      const rect = gl.domElement.getBoundingClientRect();
      ndcRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      ndcRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    };

    const onUp = () => {
      gl.domElement.removeEventListener('pointermove', onMove);
      gl.domElement.removeEventListener('pointerup', onUp);
      setOrbitControlsEnabled(true);
      setDragLive(null);
      dragRef.current = null;
    };

    gl.domElement.addEventListener('pointermove', onMove);
    gl.domElement.addEventListener('pointerup', onUp);
  }, [gl, setOrbitControlsEnabled]);

  // Let board-anchored line handles (rendered deep inside WoodBlock) start a drag too.
  registerDimDragHandler.set(startDrag);

  useFrame(() => {
    if (!dragRef.current) return;
    rc.current.setFromCamera(ndcRef.current, camera);
    const fp = new THREE.Vector3();
    if (rc.current.ray.intersectPlane(FLOOR, fp)) {
      const { lineId, endpoint } = dragRef.current;
      const pt = fp.clone();
      pt.y += 0.05;
      setDragLive({ lineId, endpoint, pt });

      updateDimensionLine(lineId, {
        [endpoint === 'start' ? 'startPoint' : 'endPoint']: { x: fp.x, y: fp.y, z: fp.z },
        anchorMemberId: undefined,
        localStart: undefined,
        localEnd: undefined,
      });

      const dl = useAppStore.getState().project.dimensionLines.find((l) => l.id === lineId);
      if (dl) {
        const s = new THREE.Vector3(dl.startPoint.x, 0, dl.startPoint.z);
        const en = new THREE.Vector3(dl.endPoint.x, 0, dl.endPoint.z);
        if (endpoint === 'start') s.set(fp.x, 0, fp.z);
        else en.set(fp.x, 0, fp.z);
        updateDimensionLine(lineId, { angleDegrees: Math.round(angleDeg(s, en)) });
      }
    }
  });

  if (!dimensionLinesVisible || dimensionLines.length === 0) return null;

  const freeLines = dimensionLines.filter((dl) => !dl.anchorMemberId || !dl.localStart || !dl.localEnd);

  return (
    <>
      {freeLines.map((dl) => {
        const start = new THREE.Vector3(dl.startPoint.x, dl.startPoint.y, dl.startPoint.z);
        const end = new THREE.Vector3(dl.endPoint.x, dl.endPoint.y, dl.endPoint.z);
        const normal = dl.faceNormal
          ? new THREE.Vector3(dl.faceNormal.x, dl.faceNormal.y, dl.faceNormal.z)
          : new THREE.Vector3(0, 1, 0);
        return (
          <DimensionLineVisual
            key={dl.id}
            id={dl.id}
            start={start}
            end={end}
            normal={normal}
            angleDegrees={dl.angleDegrees}
            isSelected={selectedId === dl.id}
            onSelect={selectDimensionLine}
            onRemove={removeDimensionLine}
            onStartDrag={startDrag}
          />
        );
      })}
    </>
  );
}

export type { DimensionLine };
