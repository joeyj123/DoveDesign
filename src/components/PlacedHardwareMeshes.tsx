import { useAppStore } from '../store';
import type { HardwareLibraryId } from '../types';

function HardwareGeometry({ libraryId, scale }: { libraryId: HardwareLibraryId; scale: number }) {
  const s = scale;
  switch (libraryId) {
    case 'drawer-slide':
      return (
        <group scale={s}>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[8, 0.4, 1.2]} />
            <meshStandardMaterial color="#71717a" metalness={0.5} />
          </mesh>
          <mesh position={[0, 0.3, 0]}>
            <boxGeometry args={[7, 0.3, 1]} />
            <meshStandardMaterial color="#a1a1aa" metalness={0.4} />
          </mesh>
        </group>
      );
    case 'cabinet-hinge':
      return (
        <group scale={s}>
          <mesh position={[-0.5, 0, 0]}>
            <cylinderGeometry args={[0.6, 0.6, 0.5, 16]} />
            <meshStandardMaterial color="#52525b" metalness={0.5} />
          </mesh>
          <mesh position={[0.8, 0, 0]}>
            <boxGeometry args={[1.2, 0.3, 0.8]} />
            <meshStandardMaterial color="#71717a" metalness={0.5} />
          </mesh>
        </group>
      );
    case 'drawer-pull':
      return (
        <group scale={s}>
          <mesh position={[-1.5, 0, 0]}>
            <cylinderGeometry args={[0.15, 0.15, 0.8, 8]} />
            <meshStandardMaterial color="#a1a1aa" metalness={0.6} />
          </mesh>
          <mesh position={[1.5, 0, 0]}>
            <cylinderGeometry args={[0.15, 0.15, 0.8, 8]} />
            <meshStandardMaterial color="#a1a1aa" metalness={0.6} />
          </mesh>
          <mesh>
            <boxGeometry args={[2.5, 0.25, 0.4]} />
            <meshStandardMaterial color="#d4d4d8" metalness={0.7} />
          </mesh>
        </group>
      );
    case 'shelf-pin':
      return (
        <mesh scale={s}>
          <cylinderGeometry args={[0.2, 0.2, 0.4, 8]} />
          <meshStandardMaterial color="#a1a1aa" metalness={0.5} />
        </mesh>
      );
    case 'cam-lock':
      return (
        <group scale={s}>
          <mesh>
            <cylinderGeometry args={[0.6, 0.6, 0.3, 16]} />
            <meshStandardMaterial color="#71717a" metalness={0.5} />
          </mesh>
        </group>
      );
    case 'corner-bracket':
      return (
        <group scale={s}>
          <mesh position={[0.4, 0, 0]}>
            <boxGeometry args={[0.8, 0.15, 0.6]} />
            <meshStandardMaterial color="#a1a1aa" metalness={0.5} />
          </mesh>
          <mesh position={[0, 0, 0.4]}>
            <boxGeometry args={[0.6, 0.15, 0.8]} />
            <meshStandardMaterial color="#a1a1aa" metalness={0.5} />
          </mesh>
        </group>
      );
    case 'barrel-bolt':
      return (
        <group scale={s}>
          <mesh position={[-1.2, 0, 0]}>
            <boxGeometry args={[0.8, 0.6, 0.3]} />
            <meshStandardMaterial color="#71717a" metalness={0.5} />
          </mesh>
          <mesh position={[0.8, 0, 0]}>
            <cylinderGeometry args={[0.15, 0.15, 2.5, 8]} />
            <meshStandardMaterial color="#a1a1aa" metalness={0.5} />
          </mesh>
        </group>
      );
    default:
      return null;
  }
}

export default function PlacedHardwareMeshes() {
  const items = useAppStore((s) => s.project.placedHardware);

  return (
    <group>
      {items.map((item) => (
        <group key={item.id} position={item.position} rotation={item.rotation}>
          <HardwareGeometry libraryId={item.libraryId} scale={item.scale} />
        </group>
      ))}
    </group>
  );
}
