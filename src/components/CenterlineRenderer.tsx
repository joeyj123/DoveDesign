import { Line, Html } from '@react-three/drei';
import type { WoodMember, CenterlineMarker } from '../types';

const CYAN = '#22d3ee';
const OFFSET = 0.025; // sit above surface

// Returns LOCAL-space (board-relative) coordinates so this can be mounted as a child of the board mesh.
function getCenterlineLocalPoints(
  member: WoodMember,
  marker: CenterlineMarker
): { start: [number,number,number]; end: [number,number,number]; mid: [number,number,number] } | null {
  const hL = member.length / 2;
  const hT = member.thickness / 2;
  const hW = member.width / 2;

  // Local-space face normals (board center = origin)
  const faceNormals: Record<number, [number,number,number]> = {
    0: [-1, 0, 0],
    1: [ 1, 0, 0],
    2: [ 0,-1, 0],
    3: [ 0, 1, 0],
    4: [ 0, 0,-1],
    5: [ 0, 0, 1],
  };
  const faceCenters: Record<number, [number,number,number]> = {
    0: [-hL, 0, 0],
    1: [ hL, 0, 0],
    2: [0, -hT, 0],
    3: [0,  hT, 0],
    4: [0, 0, -hW],
    5: [0, 0,  hW],
  };

  const fn = faceNormals[marker.faceIndex] ?? [0, 1, 0];
  const fc = faceCenters[marker.faceIndex] ?? [0, 0, 0];

  let s: [number,number,number];
  let e: [number,number,number];

  switch (marker.faceIndex) {
    case 0: case 1: // X faces
      if (marker.axis === 'z') {
        s = [fc[0], 0, -hW];
        e = [fc[0], 0,  hW];
      } else {
        s = [fc[0], -hT, 0];
        e = [fc[0],  hT, 0];
      }
      break;
    case 2: case 3: // Y faces
      if (marker.axis === 'x') {
        s = [-hL, fc[1], 0];
        e = [ hL, fc[1], 0];
      } else {
        s = [0, fc[1], -hW];
        e = [0, fc[1],  hW];
      }
      break;
    case 4: case 5: // Z faces
      if (marker.axis === 'x') {
        s = [-hL, 0, fc[2]];
        e = [ hL, 0, fc[2]];
      } else {
        s = [0, -hT, fc[2]];
        e = [0,  hT, fc[2]];
      }
      break;
    default:
      s = [-hL, 0, 0];
      e = [ hL, 0, 0];
  }

  // Offset along face normal so line sits on the surface
  const ls: [number,number,number] = [s[0] + fn[0] * OFFSET, s[1] + fn[1] * OFFSET, s[2] + fn[2] * OFFSET];
  const le: [number,number,number] = [e[0] + fn[0] * OFFSET, e[1] + fn[1] * OFFSET, e[2] + fn[2] * OFFSET];
  const lm: [number,number,number] = [(ls[0]+le[0])/2, (ls[1]+le[1])/2, (ls[2]+le[2])/2];

  return { start: ls, end: le, mid: lm };
}

interface Props {
  member: WoodMember;
}

// Must be rendered as a child of the board <mesh> so local coords follow the board automatically.
export default function CenterlineRenderer({ member }: Props) {
  const markers = member.centerlineMarkers ?? [];
  if (markers.length === 0) return null;

  return (
    <>
      {markers.map((marker) => {
        const pts = getCenterlineLocalPoints(member, marker);
        if (!pts) return null;
        const { start, end, mid } = pts;
        return (
          <group key={marker.id}>
            <Line
              points={[start, end]}
              color={CYAN}
              lineWidth={1.5}
              dashed
              dashSize={0.5}
              gapSize={0.25}
              raycast={() => null}
            />
            <Html position={[mid[0], mid[1] + 0.15, mid[2]]} center zIndexRange={[0, 10]}>
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
