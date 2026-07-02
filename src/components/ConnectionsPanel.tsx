import { useAppStore } from '../store';
import type { JoinMethod, WoodJointType } from '../types';
import { JOINT_TYPE_LABELS } from '../lib/workspaceModes';

const WOOD_JOINTS: { type: WoodJointType; blurb: string }[] = [
  { type: 'dovetail', blurb: 'Flared tails lock two boards — the classic drawer joint' },
  { type: 'mortiseTenon', blurb: 'A tongue on one board fits a matching pocket in the other' },
  { type: 'dado', blurb: 'A channel cut across one board that the other slides into' },
  { type: 'lap', blurb: 'A seat cut into one board so the other sits flush in it' },
];

const HARDWARE_FASTENERS: { type: JoinMethod; blurb: string }[] = [
  { type: 'Screws', blurb: 'Standard wood screws through the joint' },
  { type: 'Pocket Holes', blurb: 'Angled screws hidden inside a pocket' },
  { type: 'Bracket / Hardware', blurb: 'Metal brackets reinforcing the joint' },
  { type: 'Dowel', blurb: 'Round wood pins in matching drilled holes' },
  { type: 'Biscuit', blurb: 'Flat oval wafers glued into slots' },
];

/**
 * Phase 20: the unified Connections palette (Detail Mode). Wood joinery
 * (changes the wood itself) and hardware fasteners (separate parts attached
 * to a joint) live in ONE panel with the SAME interaction: pick a type here,
 * then click the board face(s) in the viewport. The hint bar narrates each step.
 */
export default function ConnectionsPanel() {
  const pendingInteraction = useAppStore((s) => s.ui.pendingInteraction);
  const setPendingInteraction = useAppStore((s) => s.setPendingInteraction);
  const setActiveTool = useAppStore((s) => s.setActiveTool);
  const woodJoints = useAppStore((s) => s.project.woodJoints);
  const members = useAppStore((s) => s.project.members);
  const removeWoodJoint = useAppStore((s) => s.removeWoodJoint);

  const activeJointType =
    pendingInteraction?.kind === 'joinery' ? pendingInteraction.jointType : null;
  const activeFastenerType =
    pendingInteraction?.kind === 'fastener' ? pendingInteraction.fastenerType : null;

  function pickJoint(type: WoodJointType) {
    setActiveTool('connection');
    setPendingInteraction({ kind: 'joinery', step: 'pickFaceA', jointType: type });
  }

  function pickFastener(type: JoinMethod) {
    setActiveTool('connection');
    setPendingInteraction({ kind: 'fastener', step: 'pickFace', fastenerType: type });
  }

  const label = (id: string) => members.find((m) => m.id === id)?.label ?? 'board';

  return (
    <div className="space-y-6">
      <section>
        <h3 className="text-base font-semibold text-amber-300 mb-1">Wood Joinery</h3>
        <p className="text-base text-zinc-400 mb-2">
          These change the shape of the wood itself. Pick one, then click the face that
          receives the joint, then a face on the second board.
        </p>
        <div className="space-y-1.5">
          {WOOD_JOINTS.map((j) => (
            <button
              key={j.type}
              type="button"
              onClick={() => pickJoint(j.type)}
              className={[
                'w-full text-left px-3 py-2 rounded border text-base transition-colors',
                activeJointType === j.type
                  ? 'bg-amber-500/25 border-amber-500/70 text-amber-100'
                  : 'border-zinc-700 text-zinc-200 hover:bg-zinc-900',
              ].join(' ')}
            >
              <span className="font-semibold">{JOINT_TYPE_LABELS[j.type]}</span>
              <span className="block text-sm text-zinc-400">{j.blurb}</span>
            </button>
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-base font-semibold text-amber-300 mb-1">Hardware Fasteners</h3>
        <p className="text-base text-zinc-400 mb-2">
          These are separate parts added to a joint. Boards must already be joined
          (Assembly Mode) — pick one, then click a joined board.
        </p>
        <div className="space-y-1.5">
          {HARDWARE_FASTENERS.map((f) => (
            <button
              key={f.type}
              type="button"
              onClick={() => pickFastener(f.type)}
              className={[
                'w-full text-left px-3 py-2 rounded border text-base transition-colors',
                activeFastenerType === f.type
                  ? 'bg-amber-500/25 border-amber-500/70 text-amber-100'
                  : 'border-zinc-700 text-zinc-200 hover:bg-zinc-900',
              ].join(' ')}
            >
              <span className="font-semibold">{f.type}</span>
              <span className="block text-sm text-zinc-400">{f.blurb}</span>
            </button>
          ))}
        </div>
      </section>

      {(woodJoints ?? []).length > 0 && (
        <section>
          <h3 className="text-base font-semibold text-amber-300 mb-1">Joints in this project</h3>
          <ul className="space-y-1.5">
            {woodJoints.map((j) => (
              <li
                key={j.id}
                className="flex items-center justify-between gap-2 px-3 py-2 rounded border border-zinc-800 text-base text-zinc-200"
              >
                <span className="min-w-0 truncate">
                  {JOINT_TYPE_LABELS[j.type]}: {label(j.memberBId)} → {label(j.memberAId)}
                </span>
                <button
                  type="button"
                  onClick={() => removeWoodJoint(j.id)}
                  className="shrink-0 text-sm text-red-400 hover:text-red-300"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
