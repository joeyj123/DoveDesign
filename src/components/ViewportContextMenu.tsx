import { useEffect, useRef } from 'react';
import { useAppStore } from '../store';

export default function ViewportContextMenu() {
  const menu = useAppStore((s) => s.ui.contextMenu);
  const closeContextMenu = useAppStore((s) => s.closeContextMenu);
  const removeMember = useAppStore((s) => s.removeMember);
  const duplicateMember = useAppStore((s) => s.duplicateMember);
  const mirrorMember = useAppStore((s) => s.mirrorMember);
  const setActiveTool = useAppStore((s) => s.setActiveTool);
  const setRightPanelTab = useAppStore((s) => s.setRightPanelTab);
  const setIsolatedMember = useAppStore((s) => s.setIsolatedMember);
  const isolatedMemberId = useAppStore((s) => s.ui.isolatedMemberId);
  const selectMember = useAppStore((s) => s.selectMember);
  const resetCamera = useAppStore((s) => s.resetCamera);
  const undo = useAppStore((s) => s.undo);
  const canUndo = useAppStore((s) => s.past.length > 0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menu.open) return;
    function onPointerDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        closeContextMenu();
      }
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') closeContextMenu();
    }
    window.addEventListener('mousedown', onPointerDown);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [menu.open, closeContextMenu]);

  if (!menu.open) return null;

  const memberId = menu.memberId;

  function run(action: () => void) {
    action();
    closeContextMenu();
  }

  return (
    <div
      ref={ref}
      className="fixed z-50 min-w-[11rem] rounded-xl border border-zinc-700/80 bg-zinc-900/90 backdrop-blur-md shadow-2xl py-1"
      style={{ left: menu.x, top: menu.y }}
      role="menu"
    >
      {memberId ? (
        <>
          <MenuItem label="Delete Member" onClick={() => run(() => removeMember(memberId))} danger />
          <MenuItem label="Duplicate" onClick={() => run(() => duplicateMember(memberId))} />
          <MenuItem label="Copy" onClick={() => run(() => duplicateMember(memberId))} />
          <MenuItem label="Mirror" onClick={() => run(() => mirrorMember(memberId, 'x'))} />
          <MenuItem
            label="Open Joinery Menu"
            onClick={() => run(() => {
              selectMember(memberId);
              setActiveTool('joinery');
              setRightPanelTab('inspector');
            })}
          />
          <MenuItem
            label={isolatedMemberId === memberId ? 'Show All Boards' : 'Solo'}
            onClick={() => run(() =>
              setIsolatedMember(isolatedMemberId === memberId ? null : memberId)
            )}
          />
        </>
      ) : (
        <>
          <MenuItem label="Reset Camera" onClick={() => run(resetCamera)} />
          <MenuItem label="Clear Selection" onClick={() => run(() => selectMember(null))} />
          <MenuItem label="Undo Last Action" onClick={() => run(undo)} disabled={!canUndo} />
          {isolatedMemberId && (
            <MenuItem label="Show All Boards" onClick={() => run(() => setIsolatedMember(null))} />
          )}
        </>
      )}
    </div>
  );
}

function MenuItem({
  label,
  onClick,
  danger,
  disabled,
}: {
  label: string;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      onClick={onClick}
      className={[
        'w-full text-left text-base px-4 py-2 transition-colors disabled:opacity-40',
        danger
          ? 'text-red-300 hover:bg-red-950/50'
          : 'text-zinc-200 hover:bg-zinc-800/80',
      ].join(' ')}
    >
      {label}
    </button>
  );
}
