import { useFrame, useThree } from '@react-three/fiber';
import { useAppStore } from '../store';
import { getMemberScreenBounds } from '../lib/screenProjection';

/** Inside Canvas — projects selected member bbox to screen pixels for overlays. */
export default function MemberScreenBoundsTracker() {
  const { camera, size } = useThree();
  const selectedId = useAppStore((s) => s.ui.selectedMemberId);
  const member = useAppStore((s) =>
    s.project.members.find((m) => m.id === s.ui.selectedMemberId)
  );
  const setMemberScreenBounds = useAppStore((s) => s.setMemberScreenBounds);

  useFrame(() => {
    if (!selectedId || !member) {
      setMemberScreenBounds(null);
      return;
    }
    const bounds = getMemberScreenBounds(member, camera, size.width, size.height);
    setMemberScreenBounds(bounds);
  });

  return null;
}
