import { useEffect } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { useAppStore } from '../store';

export default function ContextMenuHandler() {
  const { gl, camera, scene } = useThree();
  const openContextMenu = useAppStore((s) => s.openContextMenu);
  const raycaster = useThree((s) => s.raycaster);

  useEffect(() => {
    const canvas = gl.domElement;

    function onContextMenu(e: MouseEvent) {
      e.preventDefault();

      const rect = canvas.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );

      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(scene.children, true);

      let memberId: string | null = null;
      for (const hit of hits) {
        let obj: THREE.Object3D | null = hit.object;
        while (obj) {
          if (obj.userData.memberId) {
            memberId = obj.userData.memberId as string;
            break;
          }
          obj = obj.parent;
        }
        if (memberId) break;
      }

      openContextMenu(e.clientX, e.clientY, memberId);
    }

    canvas.addEventListener('contextmenu', onContextMenu);
    return () => canvas.removeEventListener('contextmenu', onContextMenu);
  }, [gl, camera, scene, raycaster, openContextMenu]);

  return null;
}
