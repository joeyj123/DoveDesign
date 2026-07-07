import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent } from 'react';
import type { ThreeEvent } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { useAppStore } from '../store';
import { inferMaterialKind } from '../lib/materials';
import { formatFractionalInches, parseFractionalInches } from '../lib/fractionalInches';

/** Minimum corner-to-corner drag distance (inches) before a board commits — guards accidental clicks. */
const MIN_DRAG = 3;
/** Floor for either footprint dimension — prevents a zero-thickness sliver if the drag is nearly axis-locked. */
const MIN_DIM = 0.25;

type FieldName = 'length' | 'width';

/**
 * Data Flow Pipeline: Sketch Tool — Corner-Drag Footprint (New Order 1.2,
 * updated New Order 1.5 — snap removed, cancel + numeric override added)
 *
 * INPUT: pointer-down world (x,z) [start corner], pointer-move world (x,z)
 *   during drag, pointer-up world (x,z) [end corner], ui.drawDefaults.thickness
 *   (vertical extent only, set by the nominal-size selector in App.tsx), and
 *   optionally a typed length/width committed via the numeric-override input.
 *
 * CALCULATION: length = |endX - startX|, width = |endZ - startZ| — an
 *   axis-aligned rectangular footprint between the two corners, with either
 *   dimension replaced by a typed override if one was committed. Board
 *   center is the start corner plus the (overridden or raw) half-extent in
 *   the drag's current direction, so a typed value keeps the same "anchor
 *   the start corner" behavior as free-hand dragging.
 *
 * OUTPUT: a single WoodMember (position/rotation/length/thickness/width) via
 *   the existing addMember() store action — a parameter set, not a mesh.
 *   BoardMesh.tsx derives geometry fresh from these parameters via the kernel;
 *   this component never touches a mesh or vertex buffer. No board-edge/
 *   corner snapping is performed — corner-drag is free-form.
 *
 * FOLLOWS-BOARD CHECK: n/a for placement (creates one new board). Post-
 *   placement editing is handled by BoardEditPanel.tsx via updateMember().
 */
export default function SketchTool() {
  const activeTool = useAppStore((s) => s.ui.activeTool);
  const drawDefaults = useAppStore((s) => s.ui.drawDefaults);
  const drawBoardCancelNonce = useAppStore((s) => s.ui.drawBoardCancelNonce);
  const addMember = useAppStore((s) => s.addMember);
  const selectMember = useAppStore((s) => s.selectMember);
  const setLastPlacedMemberId = useAppStore((s) => s.setLastPlacedMemberId);
  const setOrbitControlsEnabled = useAppStore((s) => s.setOrbitControlsEnabled);

  const [start, setStart] = useState<[number, number] | null>(null);
  const [current, setCurrent] = useState<[number, number] | null>(null);
  const drawing = useRef(false);

  const [lengthOverride, setLengthOverride] = useState<number | null>(null);
  const [widthOverride, setWidthOverride] = useState<number | null>(null);
  const [editingField, setEditingField] = useState<FieldName | null>(null);
  const [editText, setEditText] = useState('');

  /** Refs mirror the latest render's state so the mount-once keydown/contextmenu
      listeners below never read a stale closure. */
  const editingFieldRef = useRef<FieldName | null>(null);
  editingFieldRef.current = editingField;
  const previewRef = useRef<{ length: number; width: number } | null>(null);

  useEffect(() => {
    drawing.current = false;
    setStart(null);
    setCurrent(null);
    setLengthOverride(null);
    setWidthOverride(null);
    setEditingField(null);
    setOrbitControlsEnabled(true);
  }, [drawBoardCancelNonce, setOrbitControlsEnabled]);

  function cancelDraw() {
    drawing.current = false;
    setStart(null);
    setCurrent(null);
    setLengthOverride(null);
    setWidthOverride(null);
    setEditingField(null);
    setOrbitControlsEnabled(true);
  }

  /** Axis-aligned footprint between two corners: length along X, width along Z. */
  function resolveFootprint(a: [number, number], b: [number, number]) {
    const length = Math.max(MIN_DIM, Math.abs(b[0] - a[0]));
    const width = Math.max(MIN_DIM, Math.abs(b[1] - a[1]));
    const cx = (a[0] + b[0]) / 2;
    const cz = (a[1] + b[1]) / 2;
    const diagonal = Math.hypot(b[0] - a[0], b[1] - a[1]);
    return { length, width, cx, cz, diagonal };
  }

  /** Places the board using the start corner + (possibly overridden) dimensions. */
  function finalizeBoard(
    lengthOv: number | null,
    widthOv: number | null,
    endPoint?: [number, number]
  ) {
    const end = endPoint ?? current;
    if (!start || !end) {
      cancelDraw();
      return;
    }
    const diagonal = Math.hypot(end[0] - start[0], end[1] - start[1]);
    if (lengthOv === null && widthOv === null && diagonal < MIN_DRAG) {
      cancelDraw();
      return;
    }

    const signX = Math.sign(end[0] - start[0]) || 1;
    const signZ = Math.sign(end[1] - start[1]) || 1;
    const length = lengthOv ?? Math.max(MIN_DIM, Math.abs(end[0] - start[0]));
    const width = widthOv ?? Math.max(MIN_DIM, Math.abs(end[1] - start[1]));
    const cx = start[0] + (signX * length) / 2;
    const cz = start[1] + (signZ * width) / 2;

    const thickness = drawDefaults.thickness;
    const kind = inferMaterialKind(drawDefaults.species, drawDefaults.category);
    const id = crypto.randomUUID();

    addMember({
      id,
      label: `Board ${Date.now().toString(36).slice(-4)}`,
      category: drawDefaults.category,
      species: drawDefaults.species,
      nominalSize: drawDefaults.nominalSize,
      thickness,
      width,
      length,
      position: [cx, thickness / 2, cz],
      rotation: [0, 0, 0],
      costPerBoardFoot: 3.5,
      color: drawDefaults.color,
      isSelected: false,
      cuts: [],
      orientation: 'flat',
      loadLbs: 0,
      materialKind: kind,
    });

    cancelDraw();
    selectMember(id);
    setLastPlacedMemberId(id);
  }

  /** Commits the field currently being typed, then advances to the next field
      or (on the second field) finalizes the board immediately. */
  function submitField() {
    if (!editingField) return;
    const parsed = parseFractionalInches(editText);
    const value = parsed !== null && parsed > 0 ? parsed : null;

    if (editingField === 'length') {
      if (value !== null) setLengthOverride(value);
      const nextWidth = widthOverride ?? previewRef.current?.width ?? drawDefaults.width;
      setEditText(formatFractionalInches(nextWidth));
      setEditingField('width');
    } else {
      const finalWidth = value !== null ? value : widthOverride;
      if (value !== null) setWidthOverride(value);
      finalizeBoard(lengthOverride, finalWidth);
    }
  }

  // Mount-once listeners: Tab opens the numeric-override input on whichever
  // field isn't already being edited; contextmenu is suppressed during an
  // active drag so a right-click cancels instead of popping the browser menu.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (!drawing.current) return;
      if (e.key === 'Tab' && editingFieldRef.current === null) {
        e.preventDefault();
        const initial = previewRef.current?.length ?? MIN_DRAG;
        setEditText(formatFractionalInches(initial));
        setEditingField('length');
      }
    }
    function onContextMenu(e: MouseEvent) {
      if (drawing.current) e.preventDefault();
    }
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('contextmenu', onContextMenu);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('contextmenu', onContextMenu);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (activeTool !== 'drawBoard') return null;

  function handlePointerDown(e: ThreeEvent<PointerEvent>) {
    if (e.button === 2) {
      // Right-click cancels an in-progress drag without placing a board.
      if (drawing.current) {
        e.stopPropagation();
        cancelDraw();
      }
      return;
    }
    if (e.button !== 0) return;
    e.stopPropagation();
    drawing.current = true;
    setOrbitControlsEnabled(false);
    const xz: [number, number] = [e.point.x, e.point.z];
    setStart(xz);
    setCurrent(xz);
  }

  function handlePointerMove(e: ThreeEvent<PointerEvent>) {
    if (!drawing.current || !start) return;
    e.stopPropagation();
    setCurrent([e.point.x, e.point.z]);
  }

  function handlePointerUp(e: ThreeEvent<PointerEvent>) {
    if (e.button !== 0) return;
    if (!drawing.current || !start) {
      cancelDraw();
      return;
    }
    e.stopPropagation();
    finalizeBoard(lengthOverride, widthOverride, [e.point.x, e.point.z]);
  }

  function handleFieldKeyDown(e: ReactKeyboardEvent<HTMLInputElement>) {
    e.stopPropagation();
    if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      submitField();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancelDraw();
    }
  }

  const rawPreview = start && current ? resolveFootprint(start, current) : null;
  let preview: { length: number; width: number; cx: number; cz: number; diagonal: number } | null = null;
  if (rawPreview && start && current) {
    const length = lengthOverride ?? rawPreview.length;
    const width = widthOverride ?? rawPreview.width;
    // Re-derive center from the start corner + drag direction so an override
    // grows the preview box from the anchored corner, not the raw midpoint.
    const signX = Math.sign(current[0] - start[0]) || 1;
    const signZ = Math.sign(current[1] - start[1]) || 1;
    preview = {
      length,
      width,
      cx: start[0] + (signX * length) / 2,
      cz: start[1] + (signZ * width) / 2,
      diagonal: rawPreview.diagonal,
    };
  }
  previewRef.current = preview;

  return (
    <>
      {/* Invisible ground plane — captures pointer events only, contributes no geometry data. */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.001, 0]}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={() => {
          if (drawing.current) cancelDraw();
        }}
      >
        <planeGeometry args={[5000, 5000]} />
        {/* transparent+opacity 0 (not visible={false}) — Three.js's raycaster skips
            meshes whose material has visible:false, which would make this plane
            un-clickable; fully transparent keeps it raycast-hittable but unseen. */}
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {preview && (preview.diagonal >= MIN_DRAG || lengthOverride !== null || widthOverride !== null) && start && (
        <>
          <mesh position={[preview.cx, drawDefaults.thickness / 2, preview.cz]}>
            <boxGeometry args={[preview.length, drawDefaults.thickness, preview.width]} />
            <meshBasicMaterial color="#f59e0b" transparent opacity={0.45} />
          </mesh>
          {/* Length readout — attached along the length-running edge (fixed to the
              drag's start side so it doesn't jump sides mid-drag), nudged just
              outside the footprint so it doesn't sit on top of the preview box. */}
          <Html
            position={[
              preview.cx,
              drawDefaults.thickness + 1,
              start[1] + Math.sign(start[1] - preview.cz) * 0.6,
            ]}
            center
            style={{ pointerEvents: editingField === 'length' ? 'auto' : 'none' }}
          >
            {editingField === 'length' ? (
              <input
                autoFocus
                type="text"
                inputMode="decimal"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyDown={handleFieldKeyDown}
                className="w-24 bg-zinc-900 border border-orange-500 rounded px-2 py-1 text-base text-white text-center"
              />
            ) : (
              <div
                className="bg-zinc-900/90 border border-zinc-700 rounded px-2 py-1 text-base text-white whitespace-nowrap cursor-text"
                style={{ pointerEvents: 'auto' }}
                onClick={() => {
                  setEditText(formatFractionalInches(preview.length));
                  setEditingField('length');
                }}
              >
                {formatFractionalInches(preview.length)}
              </div>
            )}
          </Html>
          {/* Width readout — attached along the width-running edge, same start-side rule. */}
          <Html
            position={[
              start[0] + Math.sign(start[0] - preview.cx) * 0.6,
              drawDefaults.thickness + 1,
              preview.cz,
            ]}
            center
            style={{ pointerEvents: editingField === 'width' ? 'auto' : 'none' }}
          >
            {editingField === 'width' ? (
              <input
                autoFocus
                type="text"
                inputMode="decimal"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyDown={handleFieldKeyDown}
                className="w-24 bg-zinc-900 border border-orange-500 rounded px-2 py-1 text-base text-white text-center"
              />
            ) : (
              <div
                className="bg-zinc-900/90 border border-zinc-700 rounded px-2 py-1 text-base text-white whitespace-nowrap cursor-text"
                style={{ pointerEvents: 'auto' }}
                onClick={() => {
                  setEditText(formatFractionalInches(preview.width));
                  setEditingField('width');
                }}
              >
                {formatFractionalInches(preview.width)}
              </div>
            )}
          </Html>
        </>
      )}
    </>
  );
}
