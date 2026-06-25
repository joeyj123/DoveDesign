import { useRef, useState, useEffect } from 'react';
import { ThreeEvent } from '@react-three/fiber';
import { useAppStore } from '../store';
import { inferMaterialKind } from '../lib/materials';
import { findDrawSnapPoint } from '../lib/drawSnap';

export default function DrawBoardTool() {
  const activeTool = useAppStore((s) => s.ui.activeTool);
  const drawDefaults = useAppStore((s) => s.ui.drawDefaults);
  const drawBoardCancelNonce = useAppStore((s) => s.ui.drawBoardCancelNonce);
  const lastPlacedMemberId = useAppStore((s) => s.ui.lastPlacedMemberId);
  const drawSnapIndicator = useAppStore((s) => s.ui.drawSnapIndicator);
  const members = useAppStore((s) => s.project.members);
  const addMember = useAppStore((s) => s.addMember);
  const addAttachmentPoint = useAppStore((s) => s.addAttachmentPoint);
  const addDrawChainLink = useAppStore((s) => s.addDrawChainLink);
  const setLastPlacedMemberId = useAppStore((s) => s.setLastPlacedMemberId);
  const setDrawSnapIndicator = useAppStore((s) => s.setDrawSnapIndicator);
  const setOrbitControlsEnabled = useAppStore((s) => s.setOrbitControlsEnabled);

  const [start, setStart] = useState<[number, number] | null>(null);
  const [current, setCurrent] = useState<[number, number] | null>(null);
  const [chainFromApId, setChainFromApId] = useState<string | null>(null);
  const drawing = useRef(false);

  useEffect(() => {
    drawing.current = false;
    setStart(null);
    setCurrent(null);
    setChainFromApId(null);
    setOrbitControlsEnabled(true);
  }, [drawBoardCancelNonce, setOrbitControlsEnabled]);

  if (activeTool !== 'drawBoard') return null;

  function lockCamera() {
    setOrbitControlsEnabled(false);
  }

  function unlockCamera() {
    setOrbitControlsEnabled(true);
  }

  function cancelDraw() {
    drawing.current = false;
    setStart(null);
    setCurrent(null);
    setDrawSnapIndicator(null);
    unlockCamera();
  }

  function resolveStart(xz: [number, number]): [number, number] {
    if (!lastPlacedMemberId) return xz;
    const prev = members.find((m) => m.id === lastPlacedMemberId);
    if (!prev) return xz;
    const snap = findDrawSnapPoint(prev, xz);
    if (snap) {
      setDrawSnapIndicator({ x: snap.point[0], z: snap.point[1] });
      return snap.point;
    }
    setDrawSnapIndicator(null);
    return xz;
  }

  function handlePointerDown(e: ThreeEvent<PointerEvent>) {
    if (e.button !== 0) return;
    e.stopPropagation();
    drawing.current = true;
    lockCamera();
    const xz = resolveStart([e.point.x, e.point.z]);
    setStart(xz);
    setCurrent(xz);

    if (lastPlacedMemberId) {
      const prev = members.find((m) => m.id === lastPlacedMemberId);
      const snap = prev ? findDrawSnapPoint(prev, xz) : null;
      if (snap) {
        const existingAp = useAppStore.getState().project.attachmentPoints.find(
          (p) =>
            p.memberId === snap.memberId &&
            p.faceIndex === snap.face &&
            Math.hypot(p.offset[0] - snap.offset[0], p.offset[1] - snap.offset[1]) < 0.01
        );
        if (existingAp) {
          setChainFromApId(existingAp.id);
        } else {
          const id = crypto.randomUUID();
          addAttachmentPoint({
            id,
            memberId: snap.memberId,
            faceIndex: snap.face,
            offset: snap.offset,
            name: `Chain ${useAppStore.getState().project.attachmentPoints.length + 1}`,
          });
          setChainFromApId(id);
        }
      }
    }
  }

  function handlePointerMove(e: ThreeEvent<PointerEvent>) {
    if (!drawing.current) return;
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
    drawing.current = false;

    const end: [number, number] = [e.point.x, e.point.z];

    // Minimum drag distance — cancel if the user just clicked without dragging
    const dragDist = Math.hypot(end[0] - start[0], end[1] - start[1]);
    if (dragDist < 3) {
      cancelDraw();
      return;
    }

    const length = Math.max(Math.abs(end[0] - start[0]), 6);
    const width = Math.max(Math.abs(end[1] - start[1]), drawDefaults.thickness);
    const cx = (start[0] + end[0]) / 2;
    const cz = (start[1] + end[1]) / 2;
    const thickness = drawDefaults.thickness;
    const kind = inferMaterialKind(drawDefaults.species, drawDefaults.category);
    const memberId = crypto.randomUUID();

    addMember({
      id: memberId,
      label: `Board ${Date.now().toString(36).slice(-4)}`,
      category: drawDefaults.category,
      species: drawDefaults.species,
      nominalSize: 'Custom',
      thickness,
      width: kind === 'sheet' ? width : Math.max(width, thickness),
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

    if (chainFromApId && lastPlacedMemberId) {
      const newMember = useAppStore.getState().project.members.find((m) => m.id === memberId);
      if (newMember) {
        const snap = findDrawSnapPoint(newMember, start);
        const toApId = crypto.randomUUID();
        addAttachmentPoint({
          id: toApId,
          memberId,
          faceIndex: snap?.face ?? 'yMax',
          offset: snap?.offset ?? [0, 0, 0],
          name: `Chain ${useAppStore.getState().project.attachmentPoints.length + 1}`,
        });
        addDrawChainLink(chainFromApId, toApId);
      }
    }

    setLastPlacedMemberId(memberId);
    setStart(null);
    setCurrent(null);
    setChainFromApId(null);
    setDrawSnapIndicator(null);
    unlockCamera();
  }

  const previewL = start && current ? Math.max(Math.abs(current[0] - start[0]), 0.5) : 0;
  const previewW = start && current ? Math.max(Math.abs(current[1] - start[1]), 0.5) : 0;
  const previewCx = start && current ? (start[0] + current[0]) / 2 : 0;
  const previewCz = start && current ? (start[1] + current[1]) / 2 : 0;

  return (
    <>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.01, 0]}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={() => {
          if (drawing.current) cancelDraw();
        }}
      >
        <planeGeometry args={[5000, 5000]} />
        <meshBasicMaterial visible={false} />
      </mesh>

      {drawSnapIndicator && (
        <mesh position={[drawSnapIndicator.x, drawDefaults.thickness / 2 + 0.15, drawSnapIndicator.z]}>
          <sphereGeometry args={[0.22, 10, 10]} />
          <meshStandardMaterial color="#fbbf24" emissive="#d97706" emissiveIntensity={0.6} />
        </mesh>
      )}

      {start && current && (
        <mesh position={[previewCx, drawDefaults.thickness / 2 + 0.02, previewCz]}>
          <boxGeometry args={[previewL, 0.05, previewW]} />
          <meshBasicMaterial color="#f59e0b" transparent opacity={0.45} />
        </mesh>
      )}
    </>
  );
}
