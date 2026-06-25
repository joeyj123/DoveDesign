import { useEffect } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { useAppStore } from '../store';

export default function ContextMenuHandler() {
  const { gl, camera, scene } = useThree();
  const openContextMenu = useAppStore((s) => s.openContextMenu);
  const selectMember = useAppStore((s) => s.selectMember);
  const raycaster = useThree((s) => s.raycaster);

  useEffect(() => {
    const canvas = gl.domElement;
    let downX = 0;
    let downY = 0;

    function onMouseDown(e: MouseEvent) {
      if (e.button !== 2) return;
      downX = e.clientX;
      downY = e.clientY;
    }

    function onContextMenu(e: MouseEvent) {
      e.preventDefault();

      // Suppress if mouse moved significantly — user was panning, not right-clicking
      const dragDist = Math.hypot(e.clientX - downX, e.clientY - downY);
      if (dragDist > 6) return;

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

      if (memberId) {
        selectMember(memberId, { openWheel: false }); // select only, no wheel on right-click
      }

      openContextMenu(e.clientX, e.clientY, memberId);
    }

    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('contextmenu', onContextMenu);
    return () => {
      canvas.removeEventListener('mousedown', onMouseDown);
      canvas.removeEventListener('contextmenu', onContextMenu);
    };
  }, [gl, camera, scene, raycaster, openContextMenu, selectMember]);

  return null;
}
