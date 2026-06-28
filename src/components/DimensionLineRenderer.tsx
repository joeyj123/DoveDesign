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
}: {
  dl: DimensionLine;
  isSelected: boolean;
  onSelect: (id: string | null) => void;
  onRemove: (id: string) => void;
  onStartDrag: (state: DragState) => void;
}) {
  const start = new THREE.Vector3(dl.startPoint.x, dl.startPoint.y + 0.05, dl.startPoint.z);
  const end = new THREE.Vector3(dl.endPoint.x, dl.endPoint.y + 0.05, dl.endPoint.z);
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
      <mesh
        position={[start.x, start.y, start.z]}
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
        <sphereGeometry args={[isSelected ? 0.2 : 0.12, 10, 10]} />
        <meshBasicMaterial color={isSelected ? GREEN : lineColor} />
      </mesh>

      {/* End endpoint handle */}
      <mesh
        position={[end.x, end.y, end.z]}
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
        <sphereGeometry args={[isSelected ? 0.2 : 0.12, 10, 10]} />
        <meshBasicMaterial color={isSelected ? GREEN : lineColor} />
      </mesh>

      {dist > 0.1 && (
        <Html position={[mid.x, mid.y + 0.2, mid.z]} center>
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

      <Html position={[end.x, end.y + 0.35, end.z]} center>
        <div
          className="px-1.5 py-0.5 rounded-full text-xs font-semibold pointer-events-none select-none whitespace-nowrap"
          style={{ background: 'rgba(9,9,11,0.92)', color: lineColor }}
        >
          {dl.angleDegrees}°
        </div>
      </Html>

      {isSelected && (
        <Html position={[mid.x, mid.y + 0.7, mid.z]} center>
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
      // commit final position from live drag
      setDragLive((live) => {
        if (live && live.lineId === lineId && live.endpoint === endpoint) {
          const pt = live.pt;
          updateDimensionLine(lineId, {
            [endpoint === 'start' ? 'startPoint' : 'endPoint']: { x: pt.x, y: pt.y - 0.05, z: pt.z },
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

      // Also commit on every frame to store for real-time update (skipHistory)
      updateDimensionLine(lineId, {
        [endpoint === 'start' ? 'startPoint' : 'endPoint']: { x: fp.x, y: fp.y, z: fp.z },
      });

      // Update angleDegrees
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
        />
      ))}
    </>
  );
}
