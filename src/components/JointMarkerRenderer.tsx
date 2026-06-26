import * as THREE from 'three';
import { Html, Line } from '@react-three/drei';
import { useAppStore } from '../store';
import type { WoodMember, JointMarker } from '../types';

const AMBER = '#F59E0B';

// Map faceIndex → face normal in local space
const FACE_NORMALS: THREE.Vector3[] = [
  new THREE.Vector3(-1, 0, 0), // 0=xMin
  new THREE.Vector3( 1, 0, 0), // 1=xMax
  new THREE.Vector3( 0,-1, 0), // 2=yMin
  new THREE.Vector3( 0, 1, 0), // 3=yMax
  new THREE.Vector3( 0, 0,-1), // 4=zMin
  new THREE.Vector3( 0, 0, 1), // 5=zMax
];

function worldPos(local: THREE.Vector3, member: WoodMember): THREE.Vector3 {
  const euler = new THREE.Euler(...member.rotation);
  const q = new THREE.Quaternion().setFromEuler(euler);
  return local.clone().applyQuaternion(q).add(new THREE.Vector3(...member.position));
}

function MarkerOverlay({ marker, member, isSelected, onClick }: {
  marker: JointMarker;
  member: WoodMember;
  isSelected: boolean;
  onClick: () => void;
}) {
  const localCenter = new THREE.Vector3(marker.position.x, marker.position.y, marker.position.z);
  const faceNormal  = FACE_NORMALS[marker.faceIndex] ?? new THREE.Vector3(0, 1, 0);
  const euler = new THREE.Euler(...member.rotation);
  const q = new THREE.Quaternion().setFromEuler(euler);

  // World-space center of the marker
  const wCenter = worldPos(localCenter, member);
  // Offset slightly above the face surface
  const surfaceOffset = faceNormal.clone().applyQuaternion(q).multiplyScalar(0.04);
  const displayCenter = wCenter.clone().add(surfaceOffset);

  const color = isSelected ? '#FCD34D' : AMBER;

  // Build an orthonormal frame on the face for drawing shapes
  const normal = faceNormal.clone().applyQuaternion(q).normalize();
  // tangent: try cross with up, fallback to cross with forward
  let tangent = new THREE.Vector3(0, 1, 0).cross(normal).normalize();
  if (tangent.lengthSq() < 0.01) tangent = new THREE.Vector3(1, 0, 0).cross(normal).normalize();
  const bitangent = normal.clone().cross(tangent).normalize();

  function faceRect(hw: number, hh: number, pts: number): [number,number,number][] {
    const result: [number,number,number][] = [];
    for (let i = 0; i <= pts; i++) {
      const t = (i / pts) * 2 * Math.PI;
      // Approximate rectangle with parametric corners
      const cx = hw * Math.cos(t);
      const cy = hh * Math.sin(t);
      const p = displayCenter.clone()
        .addScaledVector(tangent, cx)
        .addScaledVector(bitangent, cy);
      result.push([p.x, p.y, p.z]);
    }
    return result;
  }

  function rect(hw: number, hh: number): [number,number,number][] {
    const corners = [
      displayCenter.clone().addScaledVector(tangent, -hw).addScaledVector(bitangent, -hh),
      displayCenter.clone().addScaledVector(tangent,  hw).addScaledVector(bitangent, -hh),
      displayCenter.clone().addScaledVector(tangent,  hw).addScaledVector(bitangent,  hh),
      displayCenter.clone().addScaledVector(tangent, -hw).addScaledVector(bitangent,  hh),
    ];
    return [...corners.map((c): [number,number,number] => [c.x, c.y, c.z]), [corners[0].x, corners[0].y, corners[0].z]];
  }

  const labelPos = displayCenter.clone().addScaledVector(normal, 0.5);

  if (marker.type === 'pocket_hole') {
    // Small circle + drill line inward
    const circlePoints = faceRect(0.2, 0.2, 24);
    const drillEnd = displayCenter.clone().addScaledVector(normal, -0.4).addScaledVector(bitangent, 0.25);
    return (
      <group onClick={(e) => { e.stopPropagation(); onClick(); }}>
        <Line points={circlePoints} color={color} lineWidth={1.5} dashed dashSize={0.08} gapSize={0.04} />
        <Line
          points={[[displayCenter.x, displayCenter.y, displayCenter.z], [drillEnd.x, drillEnd.y, drillEnd.z]]}
          color={color} lineWidth={1.5}
        />
        <Html position={[labelPos.x, labelPos.y, labelPos.z]} center>
          <div className="text-xs font-bold px-1 rounded pointer-events-none select-none"
            style={{ color, background:'rgba(9,9,11,0.7)' }}>PH</div>
        </Html>
      </group>
    );
  }

  if (marker.type === 'mortise') {
    return (
      <group onClick={(e) => { e.stopPropagation(); onClick(); }}>
        <Line points={rect(0.75, 0.375)} color={color} lineWidth={1.5} dashed dashSize={0.1} gapSize={0.05} />
        <Html position={[labelPos.x, labelPos.y, labelPos.z]} center>
          <div className="text-xs font-bold px-1 rounded pointer-events-none select-none"
            style={{ color, background:'rgba(9,9,11,0.7)' }}>M</div>
        </Html>
      </group>
    );
  }

  if (marker.type === 'tenon') {
    return (
      <group onClick={(e) => { e.stopPropagation(); onClick(); }}>
        <Line points={rect(0.75, 0.375)} color={color} lineWidth={2} />
        <Html position={[labelPos.x, labelPos.y, labelPos.z]} center>
          <div className="text-xs font-bold px-1 rounded pointer-events-none select-none"
            style={{ color, background:'rgba(9,9,11,0.7)' }}>T</div>
        </Html>
      </group>
    );
  }

  if (marker.type === 'dovetail') {
    // Trapezoid: wider at tip (outer face), narrower at base (inward)
    const outer = 0.7, inner = 0.4, depth = 0.6;
    const corners = [
      displayCenter.clone().addScaledVector(tangent, -outer).addScaledVector(bitangent, -depth / 2),
      displayCenter.clone().addScaledVector(tangent,  outer).addScaledVector(bitangent, -depth / 2),
      displayCenter.clone().addScaledVector(tangent,  inner).addScaledVector(bitangent,  depth / 2),
      displayCenter.clone().addScaledVector(tangent, -inner).addScaledVector(bitangent,  depth / 2),
    ];
    const pts: [number,number,number][] = [...corners.map((c): [number,number,number] => [c.x,c.y,c.z])];
    pts.push([corners[0].x, corners[0].y, corners[0].z]);
    return (
      <group onClick={(e) => { e.stopPropagation(); onClick(); }}>
        <Line points={pts} color={color} lineWidth={1.5} dashed dashSize={0.1} gapSize={0.05} />
        <Html position={[labelPos.x, labelPos.y, labelPos.z]} center>
          <div className="text-xs font-bold px-1 rounded pointer-events-none select-none"
            style={{ color, background:'rgba(9,9,11,0.7)' }}>DT</div>
        </Html>
      </group>
    );
  }

  if (marker.type === 'biscuit') {
    // Small oval slot
    const ovalPts = faceRect(0.45, 0.18, 32);
    return (
      <group onClick={(e) => { e.stopPropagation(); onClick(); }}>
        <Line points={ovalPts} color={color} lineWidth={1.5} dashed dashSize={0.08} gapSize={0.04} />
        <Html position={[labelPos.x, labelPos.y, labelPos.z]} center>
          <div className="text-xs font-bold px-1 rounded pointer-events-none select-none"
            style={{ color, background:'rgba(9,9,11,0.7)' }}>B</div>
        </Html>
      </group>
    );
  }

  return null;
}

interface Props { member: WoodMember }

export default function JointMarkerRenderer({ member }: Props) {
  const markers    = member.jointMarkers ?? [];
  const selMarkerId  = useAppStore((s) => s.ui.selectedJointMarkerId);
  const setSelMarker = useAppStore((s) => s.setSelectedJointMarkerId);
  const removeMarker = useAppStore((s) => s.removeJointMarker);

  if (markers.length === 0) return null;

  return (
    <>
      {markers.map((marker) => {
        const isSelected = selMarkerId === marker.id;
        return (
          <group key={marker.id}>
            <MarkerOverlay
              marker={marker}
              member={member}
              isSelected={isSelected}
              onClick={() => {
                if (isSelected) {
                  setSelMarker(null);
                } else {
                  setSelMarker(marker.id);
                }
              }}
            />
            {isSelected && (
              <Html
                position={(() => {
                  const lc = new THREE.Vector3(marker.position.x, marker.position.y, marker.position.z);
                  const wc = worldPos(lc, member);
                  return [wc.x, wc.y + 1.2, wc.z] as [number,number,number];
                })()}
                center
              >
                <button
                  className="px-2 py-0.5 rounded text-xs font-semibold text-red-400 border border-red-500/50 bg-zinc-900/90 hover:bg-red-500/20 transition-colors"
                  onClick={() => {
                    removeMarker(member.id, marker.id);
                    setSelMarker(null);
                  }}
                >
                  Remove Marker
                </button>
              </Html>
            )}
          </group>
        );
      })}
    </>
  );
}
