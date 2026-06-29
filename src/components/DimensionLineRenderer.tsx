import { useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { Line, Html } from '@react-three/drei';
import { useThree, useFrame } from '@react-three/fiber';
import { useAppStore } from '../store';
import type { DimensionLine } from '../types';

const AMBER = '#F59E0B';
const AMBER_BRIGHT = '#FCD34D';
const GREEN = '#22c55e';
const FLOOR = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

function angleDeg(a: THREE.Vector3, b: THREE.Vector3) {
  return ((Math.atan2(b.z - a.z, b.x - a.x) * 180) / Math.PI + 360) % 360;
}

interface DragState {
  lineId: string;
  endpoint: 'start' | 'end';
  ndc: THREE.Vector2;
}

function DimensionLineItem({
  dl,
  isSelected,
  onSelect,
  onRemove,
  onStartDrag,
  members,
}: {
  dl: DimensionLine;
  isSelected: boolean;
  onSelect: (id: string | null) => void;
  onRemove: (id: string) => void;
  onStartDrag: (state: DragState) => void;
  members: { id: string; position: [number,number,number]; rotation: [number,number,number] }[];
}) {
  // If anchored to a board, transform local coords to world space
  let startWorld = new THREE.Vector3(dl.startPoint.x, dl.startPoint.y, dl.startPoint.z);
  let endWorld = new THREE.Vector3(dl.endPoint.x, dl.endPoint.y, dl.endPoint.z);

  if (dl.anchorMemberId && dl.localStart && dl.localEnd) {
    const anchor = members.find((m) => m.id === dl.anchorMemberId);
    if (anchor) {
      const mat = new THREE.Matrix4().compose(
        new THREE.Vector3(...anchor.position),
        new THREE.Quaternion().setFromEuler(new THREE.Euler(...anchor.rotation)),
        new THREE.Vector3(1, 1, 1)
      );
      startWorld = new THREE.Vector3(dl.localStart.x, dl.localStart.y, dl.localStart.z).applyMatrix4(mat);
      endWorld = new THREE.Vector3(dl.localEnd.x, dl.localEnd.y, dl.localEnd.z).applyMatrix4(mat);
    }
  }

  // Offset along face normal (if available) so line sits on surface, not z-fighting
  const normal = dl.faceNormal
    ? new THREE.Vector3(dl.faceNormal.x, dl.faceNormal.y, dl.faceNormal.z).normalize()
    : new THREE.Vector3(0, 1, 0);
  const OFFSET = 0.06;
  const start = startWorld.clone().addScaledVector(normal, OFFSET);
  const end = endWorld.clone().addScaledVector(normal, OFFSET);
  const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
  const dist = start.distanceTo(end);
  const isCardinal = dl.angleDegrees % 90 === 0;
  const lineColor = isSelected ? AMBER_BRIGHT : (isCardinal ? AMBER_BRIGHT : AMBER);
  const points: [number, number, number][] = [[start.x, start.y, start.z], [end.x, end.y, end.z]];

  return (
    <group key={dl.id}>
      <Line
        points={points}
        color={lineColor}
        lineWidth={isSelected ? 2.5 : 1.5}
        dashed
        dashSize={0.4}
        gapSize={0.2}
        onClick={(e) => { e.stopPropagation(); onSelect(isSelected ? null : dl.id); }}
      />

      {/* Start endpoint handle */}
      <group position={[start.x, start.y, start.z]}>
        <mesh
          onPointerDown={(e) => {
            e.stopPropagation();
            onSelect(dl.id);
            const rect = (e.nativeEvent.target as HTMLElement).closest('canvas')?.getBoundingClientRect();
            if (!rect) return;
            const ndc = new THREE.Vector2(
              ((e.nativeEvent.clientX - rect.left) / rect.width) * 2 - 1,
              -((e.nativeEvent.clientY - rect.top) / rect.height) * 2 + 1,
            );
            onStartDrag({ lineId: dl.id, endpoint: 'start', ndc });
          }}
        >
          <sphereGeometry args={[isSelected ? 0.28 : 0.18, 10, 10]} />
          <meshBasicMaterial color={isSelected ? GREEN : lineColor} />
        </mesh>
        {/* Invisible hitbox */}
        {!isSelected && (
          <mesh onPointerDown={(e) => {
            e.stopPropagation();
            onSelect(dl.id);
          }}>
            <sphereGeometry args={[0.38, 6, 6]} />
            <meshBasicMaterial transparent opacity={0} depthWrite={false} />
          </mesh>
        )}
      </group>

      {/* End endpoint handle */}
      <group position={[end.x, end.y, end.z]}>
        <mesh
          onPointerDown={(e) => {
            e.stopPropagation();
            onSelect(dl.id);
            const rect = (e.nativeEvent.target as HTMLElement).closest('canvas')?.getBoundingClientRect();
            if (!rect) return;
            const ndc = new THREE.Vector2(
              ((e.nativeEvent.clientX - rect.left) / rect.width) * 2 - 1,
              -((e.nativeEvent.clientY - rect.top) / rect.height) * 2 + 1,
            );
            onStartDrag({ lineId: dl.id, endpoint: 'end', ndc });
          }}
        >
          <sphereGeometry args={[isSelected ? 0.28 : 0.18, 10, 10]} />
          <meshBasicMaterial color={isSelected ? GREEN : lineColor} />
        </mesh>
        {!isSelected && (
          <mesh onPointerDown={(e) => {
            e.stopPropagation();
            onSelect(dl.id);
          }}>
            <sphereGeometry args={[0.38, 6, 6]} />
            <meshBasicMaterial transparent opacity={0} depthWrite={false} />
          </mesh>
        )}
      </group>

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
            onClick={() => { onRemove(dl.id); onSelect(null); }}
          >
            Delete Line
          </button>
        </Html>
      )}
    </group>
  );
}

export default function DimensionLineRenderer() {
  const dimensionLines = useAppStore((s) => s.project.dimensionLines ?? []);
  const dimensionLinesVisible = useAppStore((s) => s.ui.dimensionLinesVisible);
  const selectedId = useAppStore((s) => s.ui.selectedDimensionLineId);
  const selectDimensionLine = useAppStore((s) => s.selectDimensionLine);
  const removeDimensionLine = useAppStore((s) => s.removeDimensionLine);
  const updateDimensionLine = useAppStore((s) => s.updateDimensionLine);
  const setOrbitControlsEnabled = useAppStore((s) => s.setOrbitControlsEnabled);
  const members = useAppStore((s) =>
    s.project.members.map((m) => ({ id: m.id, position: m.position, rotation: m.rotation }))
  );

  const { camera, gl } = useThree();
  const dragRef = useRef<DragState | null>(null);
  const ndcRef = useRef(new THREE.Vector2());
  const rc = useRef(new THREE.Raycaster());
  const setDragLive = useState<{ lineId: string; endpoint: 'start' | 'end'; pt: THREE.Vector3 } | null>(null)[1];

  const startDrag = useCallback((state: DragState) => {
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
      if (!dragRef.current) return;
      const { lineId, endpoint } = dragRef.current;
      setDragLive((live) => {
        if (live && live.lineId === lineId && live.endpoint === endpoint) {
          const pt = live.pt;
          updateDimensionLine(lineId, {
            [endpoint === 'start' ? 'startPoint' : 'endPoint']: { x: pt.x, y: pt.y - 0.05, z: pt.z },
            // Clear anchor when manually dragging an endpoint
            anchorMemberId: undefined,
            localStart: undefined,
            localEnd: undefined,
          });
        }
        return null;
      });
      dragRef.current = null;
    };

    gl.domElement.addEventListener('pointermove', onMove);
    gl.domElement.addEventListener('pointerup', onUp);
  }, [gl, setOrbitControlsEnabled, updateDimensionLine]);

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

  return (
    <>
      {dimensionLines.map((dl) => (
        <DimensionLineItem
          key={dl.id}
          dl={dl}
          isSelected={selectedId === dl.id}
          onSelect={selectDimensionLine}
          onRemove={removeDimensionLine}
          onStartDrag={startDrag}
          members={members}
        />
      ))}
    </>
  );
}
