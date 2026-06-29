import * as THREE from 'three';
import { Line, Html } from '@react-three/drei';
import type { WoodMember, CenterlineMarker } from '../types';

const CYAN = '#22d3ee';
const OFFSET = 0.025; // sit above surface

function getCenterlineWorldPoints(
  member: WoodMember,
  marker: CenterlineMarker
): { start: THREE.Vector3; end: THREE.Vector3; mid: THREE.Vector3 } | null {
  const hL = member.length / 2;
  const hT = member.thickness / 2;
  const hW = member.width / 2;

  // faceIndex: 0=xMin 1=xMax 2=yMin 3=yMax 4=zMin 5=zMax
  let localStart: THREE.Vector3;
  let localEnd: THREE.Vector3;
  const normal = new THREE.Vector3(...(marker.faceNormal as [number, number, number]));

  switch (marker.axis) {
    case 'x':
      localStart = new THREE.Vector3(-hL, 0, 0);
      localEnd   = new THREE.Vector3( hL, 0, 0);
      break;
    case 'y':
      localStart = new THREE.Vector3(0, -hT, 0);
      localEnd   = new THREE.Vector3(0,  hT, 0);
      break;
    case 'z':
    default:
      localStart = new THREE.Vector3(0, 0, -hW);
      localEnd   = new THREE.Vector3(0, 0,  hW);
      break;
  }

  // Project onto the face plane (keep on face surface)
  // We center the line in the face center, offset by normal
  const faceNormals: Record<number, THREE.Vector3> = {
    0: new THREE.Vector3(-1, 0, 0),
    1: new THREE.Vector3( 1, 0, 0),
    2: new THREE.Vector3( 0,-1, 0),
    3: new THREE.Vector3( 0, 1, 0),
    4: new THREE.Vector3( 0, 0,-1),
    5: new THREE.Vector3( 0, 0, 1),
  };
  const faceCenters: Record<number, THREE.Vector3> = {
    0: new THREE.Vector3(-hL, 0, 0),
    1: new THREE.Vector3( hL, 0, 0),
    2: new THREE.Vector3(0, -hT, 0),
    3: new THREE.Vector3(0,  hT, 0),
    4: new THREE.Vector3(0, 0, -hW),
    5: new THREE.Vector3(0, 0,  hW),
  };

  const faceNorm = faceNormals[marker.faceIndex] ?? normal;
  const faceCenter = faceCenters[marker.faceIndex] ?? new THREE.Vector3();

  // Compute the line endpoints on the face plane
  // The line runs through faceCenter along the chosen axis, constrained to face extent
  let start3: THREE.Vector3;
  let end3: THREE.Vector3;

  switch (marker.faceIndex) {
    case 0: case 1: // X faces — line runs along Z or Y
      if (marker.axis === 'z') {
        start3 = new THREE.Vector3(faceCenter.x, 0, -hW);
        end3   = new THREE.Vector3(faceCenter.x, 0,  hW);
      } else {
        start3 = new THREE.Vector3(faceCenter.x, -hT, 0);
        end3   = new THREE.Vector3(faceCenter.x,  hT, 0);
      }
      break;
    case 2: case 3: // Y faces — line runs along X or Z
      if (marker.axis === 'x') {
        start3 = new THREE.Vector3(-hL, faceCenter.y, 0);
        end3   = new THREE.Vector3( hL, faceCenter.y, 0);
      } else {
        start3 = new THREE.Vector3(0, faceCenter.y, -hW);
        end3   = new THREE.Vector3(0, faceCenter.y,  hW);
      }
      break;
    case 4: case 5: // Z faces — line runs along X or Y
      if (marker.axis === 'x') {
        start3 = new THREE.Vector3(-hL, 0, faceCenter.z);
        end3   = new THREE.Vector3( hL, 0, faceCenter.z);
      } else {
        start3 = new THREE.Vector3(0, -hT, faceCenter.z);
        end3   = new THREE.Vector3(0,  hT, faceCenter.z);
      }
      break;
    default:
      start3 = localStart;
      end3   = localEnd;
  }

  const mat = new THREE.Matrix4().compose(
    new THREE.Vector3(...(member.position as [number, number, number])),
    new THREE.Quaternion().setFromEuler(new THREE.Euler(...(member.rotation as [number, number, number]))),
    new THREE.Vector3(1, 1, 1)
  );

  const ws = start3.clone().addScaledVector(faceNorm, OFFSET).applyMatrix4(mat);
  const we = end3.clone().addScaledVector(faceNorm, OFFSET).applyMatrix4(mat);
  const wm = new THREE.Vector3().addVectors(ws, we).multiplyScalar(0.5);

  return { start: ws, end: we, mid: wm };
}

interface Props {
  member: WoodMember;
}

export default function CenterlineRenderer({ member }: Props) {
  const markers = member.centerlineMarkers ?? [];
  if (markers.length === 0) return null;

  return (
    <>
      {markers.map((marker) => {
        const pts = getCenterlineWorldPoints(member, marker);
        if (!pts) return null;
        const { start, end, mid } = pts;
        const points: [number, number, number][] = [
          [start.x, start.y, start.z],
          [end.x, end.y, end.z],
        ];
        return (
          <group key={marker.id}>
            <Line
              points={points}
              color={CYAN}
              lineWidth={1.5}
              dashed
              dashSize={0.5}
              gapSize={0.25}
            />
            <Html position={[mid.x, mid.y + 0.15, mid.z]} center zIndexRange={[0, 10]}>
              <div
                className="px-1.5 py-0.5 rounded text-xs font-bold pointer-events-none select-none"
                style={{
                  background: 'rgba(9,9,11,0.88)',
                  color: CYAN,
                  border: `1px solid ${CYAN}`,
                }}
              >
                CL
              </div>
            </Html>
          </group>
        );
      })}
    </>
  );
}
