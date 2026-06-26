import { useRef, useState } from 'react';
import * as THREE from 'three';
import { ThreeEvent } from '@react-three/fiber';
import { Line, Html } from '@react-three/drei';
import { useAppStore } from '../store';

const AMBER = '#F59E0B';
const FLOOR_Y = 0;

function snapToCardinalAngle(
  start: THREE.Vector3,
  end: THREE.Vector3,
  shiftKey: boolean
): THREE.Vector3 {
  if (shiftKey) return end.clone();
  const dx = end.x - start.x;
  const dz = end.z - start.z;
  const angleDeg = (Math.atan2(dz, dx) * 180) / Math.PI;
  const dist = Math.sqrt(dx * dx + dz * dz);

  const mod90 = ((angleDeg % 90) + 90) % 90;
  const nearZero = mod90 < 5 || mod90 > 85;

  if (nearZero) {
    const snappedAngle = Math.round(angleDeg / 90) * 90;
    const rad = (snappedAngle * Math.PI) / 180;
    return new THREE.Vector3(
      start.x + Math.cos(rad) * dist,
      FLOOR_Y,
      start.z + Math.sin(rad) * dist
    );
  }
  return end.clone();
}

function computeAngleDeg(start: THREE.Vector3, end: THREE.Vector3): number {
  const dx = end.x - start.x;
  const dz = end.z - start.z;
  return ((Math.atan2(dz, dx) * 180) / Math.PI + 360) % 360;
}

export default function MeasureTool() {
  const activeTool = useAppStore((s) => s.ui.activeTool);
  const measureStartPoint = useAppStore((s) => s.ui.measureStartPoint);
  const setMeasureStartPoint = useAppStore((s) => s.setMeasureStartPoint);
  const addDimensionLine = useAppStore((s) => s.addDimensionLine);
  const setActiveTool = useAppStore((s) => s.setActiveTool);

  const [cursorWorld, setCursorWorld] = useState<THREE.Vector3 | null>(null);
  const shiftRef = useRef(false);

  if (activeTool !== 'measure') return null;

  const startVec = measureStartPoint
    ? new THREE.Vector3(measureStartPoint.x, measureStartPoint.y, measureStartPoint.z)
    : null;

  const snappedCursor =
    startVec && cursorWorld
      ? snapToCardinalAngle(startVec, cursorWorld, shiftRef.current)
      : cursorWorld;

  const livePoints: [number, number, number][] = startVec && snappedCursor
    ? [
        [startVec.x, startVec.y + 0.05, startVec.z],
        [snappedCursor.x, snappedCursor.y + 0.05, snappedCursor.z],
      ]
    : [];

  const liveDist = startVec && snappedCursor ? startVec.distanceTo(snappedCursor) : 0;
  const liveAngle = startVec && snappedCursor ? computeAngleDeg(startVec, snappedCursor) : 0;
  const midPoint = startVec && snappedCursor
    ? new THREE.Vector3(
        (startVec.x + snappedCursor.x) / 2,
        0.1,
        (startVec.z + snappedCursor.z) / 2
      )
    : null;

  function handlePointerMove(e: ThreeEvent<PointerEvent>) {
    shiftRef.current = e.nativeEvent.shiftKey;
    setCursorWorld(e.point.clone().setY(FLOOR_Y));
    e.stopPropagation();
  }

  function handleClick(e: ThreeEvent<MouseEvent>) {
    const pt = e.point.clone().setY(FLOOR_Y);
    e.stopPropagation();

    if (!measureStartPoint) {
      setMeasureStartPoint({ x: pt.x, y: FLOOR_Y, z: pt.z });
    } else {
      const start = new THREE.Vector3(measureStartPoint.x, measureStartPoint.y, measureStartPoint.z);
      const end = snapToCardinalAngle(start, pt, e.nativeEvent.shiftKey);
      const angle = computeAngleDeg(start, end);

      addDimensionLine({
        id: crypto.randomUUID(),
        startPoint: { x: start.x, y: FLOOR_Y, z: start.z },
        endPoint: { x: end.x, y: FLOOR_Y, z: end.z },
        angleDegrees: Math.round(angle),
      });
      setMeasureStartPoint(null);
      setActiveTool('select');
    }
  }

  return (
    <>
      {/* Invisible floor plane to capture clicks/moves */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        onPointerMove={handlePointerMove}
        onClick={handleClick}
      >
        <planeGeometry args={[2000, 2000]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* Start point anchor dot */}
      {startVec && (
        <mesh position={[startVec.x, startVec.y + 0.05, startVec.z]}>
          <sphereGeometry args={[0.15, 8, 8]} />
          <meshBasicMaterial color={AMBER} />
        </mesh>
      )}

      {/* Live line from start to cursor */}
      {livePoints.length === 2 && (
        <Line
          points={livePoints}
          color={AMBER}
          lineWidth={2}
          dashed
          dashSize={0.4}
          gapSize={0.2}
        />
      )}

      {/* Cursor snap dot */}
      {snappedCursor && (
        <mesh position={[snappedCursor.x, 0.05, snappedCursor.z]}>
          <sphereGeometry args={[0.12, 8, 8]} />
          <meshBasicMaterial color={AMBER} transparent opacity={0.7} />
        </mesh>
      )}

      {/* Distance + angle labels at midpoint */}
      {midPoint && liveDist > 0.1 && (
        <>
          <Html position={[midPoint.x, 0.3, midPoint.z]} center>
            <div
              className="px-2 py-0.5 rounded-full text-xs font-semibold text-white pointer-events-none select-none whitespace-nowrap"
              style={{ background: 'rgba(24,24,27,0.92)', border: '1px solid #F59E0B' }}
            >
              {liveDist.toFixed(2)}&quot;
            </div>
          </Html>
          {snappedCursor && (
            <Html position={[snappedCursor.x, 0.3, snappedCursor.z]} center>
              <div
                className="px-2 py-0.5 rounded-full text-xs font-semibold pointer-events-none select-none whitespace-nowrap"
                style={{ background: 'rgba(9,9,11,0.92)', color: AMBER }}
              >
                {Math.round(liveAngle)}°
              </div>
            </Html>
          )}
        </>
      )}
    </>
  );
}
