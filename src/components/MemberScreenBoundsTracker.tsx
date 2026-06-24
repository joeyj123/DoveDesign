import { useFrame, useThree } from '@react-three/fiber';
import { useAppStore } from '../store';
import { getMemberScreenBounds } from '../lib/screenProjection';
import { exposeCameraForSelection } from './BoxSelectionHandler';

function unionBounds(
  a: { left: number; top: number; right: number; bottom: number },
  b: { left: number; top: number; right: number; bottom: number }
) {
  return {
    left: Math.min(a.left, b.left),
    top: Math.min(a.top, b.top),
    right: Math.max(a.right, b.right),
    bottom: Math.max(a.bottom, b.bottom),
  };
}

/** Inside Canvas — projects selection bbox to screen pixels for overlays. */
export default function MemberScreenBoundsTracker() {
  const { camera, size } = useThree();
  const selectedId = useAppStore((s) => s.ui.selectedMemberId);
  const multiSelection = useAppStore((s) => s.ui.multiSelection);
  const members = useAppStore((s) => s.project.members);
  const setMemberScreenBounds = useAppStore((s) => s.setMemberScreenBounds);
  const setCombinedSelectionBounds = useAppStore((s) => s.setCombinedSelectionBounds);

  useFrame(() => {
    exposeCameraForSelection(camera);

    const ids =
      multiSelection.length > 1
        ? multiSelection
        : selectedId
          ? [selectedId]
          : [];

    if (ids.length === 0) {
      setMemberScreenBounds(null);
      setCombinedSelectionBounds(null);
      return;
    }

    let combined: { left: number; top: number; right: number; bottom: number } | null = null;
    for (const id of ids) {
      const member = members.find((m) => m.id === id);
      if (!member) continue;
      const b = getMemberScreenBounds(member, camera, size.width, size.height);
      combined = combined ? unionBounds(combined, b) : b;
    }

    if (ids.length === 1 && selectedId) {
      const member = members.find((m) => m.id === selectedId);
      if (member) {
        setMemberScreenBounds(getMemberScreenBounds(member, camera, size.width, size.height));
      }
    } else {
      setMemberScreenBounds(null);
    }

    setCombinedSelectionBounds(combined);
  });

  return null;
}
