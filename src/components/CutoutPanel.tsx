import { useEffect, useState } from 'react';
import { useAppStore } from '../store';
import { formatFractionalInches, parseFractionalInches } from '../lib/fractionalInches';
import type { CutoutProfile } from '../types';
import { PRESET_SHAPES, SHAPE_CATEGORY_ORDER, SHAPE_CATEGORY_LABELS } from '../lib/presetShapes';

const NUDGE_STEP = 1 / 16;

/**
 * Data Flow Pipeline: Cutout Tool Panel (New Order 11 Part 1, extended by
 * New Order 11.1 Part 2 with depth/direction editing)
 *
 * INPUT: ui.cutoutFace (set by clicking a board face in BoardMesh.tsx while
 *   activeTool === 'cutout'), ui.cutoutDrawTool (Line/Arc, picked here),
 *   ui.cutoutEditProfile (New Order 11.1 — which committed profile is armed
 *   for depth/direction editing, set automatically right after a commit or
 *   by clicking a profile in the list below), the picked member's own
 *   cutoutProfiles array (list display, depth/direction edit, remove).
 *
 * CALCULATION: none here — the point-entry/closed-loop math lives in
 *   CutoutDrawTools.tsx, and the actual CSG (extrude + subtract) lives
 *   entirely in Engine.ts's evaluateFeatures CUTOUT case. This panel only
 *   writes the `depth`/`direction` fields, the SAME fields the in-viewport
 *   push/pull handle (BoardMesh.tsx's CutoutDepthHandle) writes — one pair
 *   of fields, two input methods, never two competing sources of truth.
 *
 * OUTPUT: store.setCutoutDrawTool / store.resetCutoutPick /
 *   store.removeCutoutProfile / store.setCutoutEditProfile /
 *   store.updateMember({ cutoutProfiles }) — no second write path beyond
 *   the pre-existing updateMember every other board-parameter edit uses.
 *
 * FOLLOWS-BOARD CHECK: n/a — UI chrome only; the actual geometry re-derives
 *   fresh from these stored fields every render (see Engine.ts / BoardMesh.tsx).
 */
export default function CutoutPanel() {
  const members = useAppStore((s) => s.project.members);
  const cutoutFace = useAppStore((s) => s.ui.cutoutFace);
  const cutoutDrawTool = useAppStore((s) => s.ui.cutoutDrawTool);
  const cutoutPresetShapeId = useAppStore((s) => s.ui.cutoutPresetShapeId);
  const cutoutEditProfile = useAppStore((s) => s.ui.cutoutEditProfile);
  const setCutoutDrawTool = useAppStore((s) => s.setCutoutDrawTool);
  const setCutoutPresetShapeId = useAppStore((s) => s.setCutoutPresetShapeId);
  const resetCutoutPick = useAppStore((s) => s.resetCutoutPick);
  const removeCutoutProfile = useAppStore((s) => s.removeCutoutProfile);
  const setCutoutEditProfile = useAppStore((s) => s.setCutoutEditProfile);

  if (!cutoutFace) {
    const allProfiles = members.flatMap((m) => (m.cutoutProfiles ?? []).map((p) => ({ member: m, profile: p })));

    if (cutoutEditProfile) {
      const member = members.find((m) => m.id === cutoutEditProfile.memberId);
      const profile = member?.cutoutProfiles?.find((p) => p.id === cutoutEditProfile.profileId);
      if (member && profile) {
        return (
          <CutoutProfileEditor
            memberId={member.id}
            memberLabel={member.label}
            profile={profile}
            cutoutProfiles={member.cutoutProfiles ?? []}
            onDone={() => setCutoutEditProfile(null)}
            onRemove={() => removeCutoutProfile(member.id, profile.id)}
          />
        );
      }
      // Stale reference (e.g. the profile was removed elsewhere) — fall through to the list.
    }

    return (
      <div className="p-3 flex flex-col gap-2 text-charcoal-200">
        <p className="text-sm text-charcoal-400">
          Click a face on a board to sketch a profile on it, or pick an existing profile below to set its depth.
        </p>
        {allProfiles.length > 0 && (
          <div className="flex flex-col gap-1 mt-2 pt-2 border-t border-charcoal-800">
            <div className="text-xs uppercase tracking-wider text-charcoal-500">Existing Cutout Profiles</div>
            {allProfiles.map(({ member: m, profile: p }) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setCutoutEditProfile({ memberId: m.id, profileId: p.id })}
                className="flex items-center justify-between rounded px-2 py-1.5 text-sm bg-charcoal-800/50 border border-charcoal-700 hover:border-orange-500 hover:text-white text-charcoal-300"
              >
                <span>
                  {m.label} — {p.faceId} ({p.points.length} pts)
                </span>
                <span className="text-charcoal-500">
                  {p.direction === 'add' ? 'Add' : 'Cut'} {formatFractionalInches(p.depth ?? 0)}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  const member = members.find((m) => m.id === cutoutFace.memberId);

  return (
    <div className="p-3 flex flex-col gap-3 text-charcoal-200">
      <div className="flex items-center gap-2 rounded border border-charcoal-700 bg-charcoal-800/50 px-2 py-1.5">
        <span className="w-3 h-3 rounded-sm shrink-0 bg-orange-500" />
        <div className="text-sm">
          <div className="font-semibold text-white">Face</div>
          <div className="text-charcoal-300">
            {member?.label ?? 'Unknown board'} — {cutoutFace.face}
          </div>
        </div>
      </div>

      <p className="text-sm text-charcoal-400">
        Pick Line, Arc, or a Preset shape, then work on the face. Line/Arc: click to place points, click near your
        first point (3+ points placed) to close the loop.
      </p>

      <div className="flex gap-2">
        {(['line', 'arc', 'preset'] as const).map((tool) => (
          <button
            key={tool}
            type="button"
            onClick={() => setCutoutDrawTool(cutoutDrawTool === tool ? null : tool)}
            className={`flex-1 px-2 py-1.5 rounded text-base border capitalize ${
              cutoutDrawTool === tool
                ? 'bg-orange-600 border-orange-500 text-white'
                : 'bg-charcoal-800 border-charcoal-700 text-charcoal-200 hover:bg-charcoal-700'
            }`}
          >
            {tool}
          </button>
        ))}
      </div>

      {cutoutDrawTool === 'arc' && (
        <p className="text-xs text-charcoal-500">Click a start point, click a point on the arc, click the end point.</p>
      )}

      {cutoutDrawTool === 'preset' && (
        <PresetShapePicker armedId={cutoutPresetShapeId} onArm={setCutoutPresetShapeId} />
      )}

      <button
        type="button"
        onClick={resetCutoutPick}
        className="rounded px-3 py-1.5 bg-charcoal-800 hover:bg-charcoal-700 text-charcoal-300 border border-charcoal-700"
      >
        Cancel / Pick a Different Face
      </button>
    </div>
  );
}

/**
 * New Order 11.1 (Part 2): depth + Cut/Add direction editor for one already-
 * committed profile — same field/update shape as ChamferPanel's
 * ChamferEdgePanel (one write path shared with the in-viewport drag handle).
 */
function CutoutProfileEditor({
  memberId,
  memberLabel,
  profile,
  cutoutProfiles,
  onDone,
  onRemove,
}: {
  memberId: string;
  memberLabel: string;
  profile: CutoutProfile;
  cutoutProfiles: CutoutProfile[];
  onDone: () => void;
  onRemove: () => void;
}) {
  const updateMember = useAppStore((s) => s.updateMember);
  const depth = profile.depth ?? 0.5;
  const direction = profile.direction ?? 'cut';

  function commit(patch: Partial<CutoutProfile>) {
    const next = cutoutProfiles.map((p) => (p.id === profile.id ? { ...p, ...patch } : p));
    updateMember(memberId, { cutoutProfiles: next });
  }

  return (
    <div className="p-3 flex flex-col gap-3 text-charcoal-200">
      <div className="flex items-center gap-2 rounded border border-charcoal-700 bg-charcoal-800/50 px-2 py-1.5">
        <span className="w-3 h-3 rounded-sm shrink-0 bg-orange-500" />
        <div className="text-sm">
          <div className="font-semibold text-white">Profile</div>
          <div className="text-charcoal-300">
            {memberLabel} — {profile.faceId}
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => commit({ direction: 'cut' })}
          className={`flex-1 px-2 py-1.5 rounded text-base border ${
            direction === 'cut'
              ? 'bg-orange-600 border-orange-500 text-white'
              : 'bg-charcoal-800 border-charcoal-700 text-charcoal-200 hover:bg-charcoal-700'
          }`}
        >
          Cut
        </button>
        <button
          type="button"
          onClick={() => commit({ direction: 'add' })}
          className={`flex-1 px-2 py-1.5 rounded text-base border ${
            direction === 'add'
              ? 'bg-orange-600 border-orange-500 text-white'
              : 'bg-charcoal-800 border-charcoal-700 text-charcoal-200 hover:bg-charcoal-700'
          }`}
        >
          Add
        </button>
      </div>

      {direction === 'add' ? (
        <p className="text-sm text-charcoal-400">
          Add (a raised boss extending out from the face) isn't built yet — this profile is stored but won't change
          the board's shape until a future Order implements it. Switch back to Cut to remove material now.
        </p>
      ) : (
        <>
          <p className="text-sm text-charcoal-400">Type a depth, or drag the orange handle on the board directly.</p>
          <DepthField label="Depth" value={depth} onChange={(v) => commit({ depth: v })} />
        </>
      )}

      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={onRemove}
          className="flex-1 rounded px-3 py-1.5 bg-charcoal-800 hover:bg-red-900/40 hover:text-red-300 text-charcoal-300 border border-charcoal-700"
        >
          Remove Cutout
        </button>
        <button
          type="button"
          onClick={onDone}
          className="rounded px-3 py-1.5 bg-charcoal-800 hover:bg-charcoal-700 text-charcoal-300 border border-charcoal-700"
        >
          Done
        </button>
      </div>
    </div>
  );
}

/** Preset Shape catalog picker (src/lib/presetShapes.ts) — regular shapes
 * plus joinery-pocket presets grouped Simple/Intermediate/Advanced. Arming
 * one hands off to CutoutDrawTools.tsx's place -> size -> position sequence
 * in the viewport; this component only ever writes which shape id is armed. */
function PresetShapePicker({ armedId, onArm }: { armedId: string | null; onArm: (id: string | null) => void }) {
  return (
    <div className="flex flex-col gap-3 max-h-80 overflow-y-auto pr-1">
      {SHAPE_CATEGORY_ORDER.map((category) => (
        <div key={category} className="flex flex-col gap-1">
          <div className="text-xs uppercase tracking-wider text-charcoal-500">{SHAPE_CATEGORY_LABELS[category]}</div>
          <div className="grid grid-cols-2 gap-1.5">
            {PRESET_SHAPES.filter((s) => s.category === category).map((shape) => (
              <button
                key={shape.id}
                type="button"
                onClick={() => onArm(armedId === shape.id ? null : shape.id)}
                className={`px-2 py-1.5 rounded text-sm border text-left ${
                  armedId === shape.id
                    ? 'bg-orange-600 border-orange-500 text-white'
                    : 'bg-charcoal-800 border-charcoal-700 text-charcoal-200 hover:bg-charcoal-700'
                }`}
              >
                {shape.label}
              </button>
            ))}
          </div>
        </div>
      ))}
      {armedId && (
        <p className="text-xs text-charcoal-500 pt-1 border-t border-charcoal-800">
          Click the face to place the shape's center, move + click (or Tab to type a size) to set its size, then move
          + click again to drop it in place.
        </p>
      )}
      <p className="text-xs text-charcoal-600">
        Reference Lines on this face are live snap targets while positioning — endpoints, midpoints, where two lines
        cross, or anywhere along a line (Tab types an exact distance from its start). Draw them first with
        Annotate &gt; Reference Line to plan spacing before placing dowel holes or other shapes.
      </p>
      <p className="text-xs text-charcoal-600">
        Drag or place a shape so it crosses one edge of the face for a real rabbet/edge notch (cuts into the
        adjacent side too) — corner notches that cross two edges at once aren't supported yet and are ignored.
      </p>
    </div>
  );
}

/** Same fractional-inch text pattern as ChamferPanel's SizeField — one
 * convention for every "type or nudge a distance" field in the app. */
function DepthField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  const [text, setText] = useState(formatFractionalInches(value));

  useEffect(() => {
    setText(formatFractionalInches(value));
  }, [value]);

  function commit() {
    const parsed = parseFractionalInches(text);
    if (parsed !== null && parsed >= 0) {
      onChange(parsed);
    } else {
      setText(formatFractionalInches(value));
    }
  }

  return (
    <div className="flex items-center gap-1.5 text-sm">
      <span className="text-charcoal-400 w-24 shrink-0">{label}</span>
      <button
        type="button"
        onClick={() => onChange(Math.max(0, value - NUDGE_STEP))}
        className="w-6 h-6 shrink-0 rounded bg-charcoal-800 hover:bg-charcoal-700 text-charcoal-300 border border-charcoal-700"
      >
        −
      </button>
      <input
        type="text"
        inputMode="decimal"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
        }}
        className="w-20 rounded bg-charcoal-800 border border-charcoal-700 px-2 py-1 text-center text-charcoal-100"
      />
      <button
        type="button"
        onClick={() => onChange(value + NUDGE_STEP)}
        className="w-6 h-6 shrink-0 rounded bg-charcoal-800 hover:bg-charcoal-700 text-charcoal-300 border border-charcoal-700"
      >
        +
      </button>
    </div>
  );
}
