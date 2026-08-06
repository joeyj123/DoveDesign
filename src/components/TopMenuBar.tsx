import { useEffect, useRef, useState } from 'react';
import { useAppStore } from '../store';

/**
 * Data Flow Pipeline: Top Menu Bar
 *
 * INPUT: project.name, project.members.length (to decide whether Save needs
 *   a name prompt / New needs a confirm).
 *
 * CALCULATION: none — pure UI routing to store.ts's existing
 *   saveProjectToFile/saveProjectAs/loadProjectFromFile/loadProjectData
 *   actions (built pre-reset, preserved through the Samson Option, but never
 *   given a UI trigger after the reset).
 *
 * OUTPUT: none new — this is a menu, not a tool. It never touches board
 *   geometry or parameters.
 *
 * FOLLOWS-BOARD CHECK: n/a — UI chrome only.
 */

export default function TopMenuBar() {
  const projectName = useAppStore((s) => s.project.name);
  const memberCount = useAppStore((s) => s.project.members.length);
  const saveProjectToFile = useAppStore((s) => s.saveProjectToFile);
  const saveProjectAs = useAppStore((s) => s.saveProjectAs);
  const loadProjectFromFile = useAppStore((s) => s.loadProjectFromFile);
  const loadProjectData = useAppStore((s) => s.loadProjectData);

  const [openMenu, setOpenMenu] = useState<'file' | null>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!openMenu) return;
    function onPointerDown(e: MouseEvent) {
      if (barRef.current && !barRef.current.contains(e.target as Node)) setOpenMenu(null);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpenMenu(null);
    }
    window.addEventListener('mousedown', onPointerDown);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [openMenu]);

  function handleSave() {
    setOpenMenu(null);
    if (!projectName.trim() || projectName === 'Untitled Project') {
      const name = window.prompt('Save project as:', projectName || 'My Project');
      if (name && name.trim()) saveProjectAs(name.trim());
      return;
    }
    saveProjectToFile();
  }

  function handleOpenClick() {
    setOpenMenu(null);
    fileInputRef.current?.click();
  }

  function handleOpenFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (file) loadProjectFromFile(file);
  }

  function handleNew() {
    setOpenMenu(null);
    if (memberCount > 0 && !window.confirm('Start a new project? Unsaved work will be lost unless you saved a .wcad file.')) {
      return;
    }
    loadProjectData([], 'Untitled Project');
  }

  return (
    <div
      ref={barRef}
      className="absolute top-0 left-0 right-0 h-10 z-40 flex flex-row items-stretch bg-charcoal-900 border-b border-charcoal-700 text-base"
    >
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpenMenu(openMenu === 'file' ? null : 'file')}
          className={`h-full px-4 transition-colors ${
            openMenu === 'file' ? 'bg-spruce-800/70 text-white' : 'text-charcoal-300 hover:bg-charcoal-800 hover:text-white'
          }`}
        >
          File
        </button>
        {openMenu === 'file' && (
          <div className="absolute top-full left-0 w-40 flex flex-col bg-charcoal-900 border border-charcoal-700 rounded-b-lg py-1 shadow-xl">
            <MenuItem label="Save" shortcut="Ctrl+S" onClick={handleSave} />
            <MenuItem label="Open..." onClick={handleOpenClick} />
            <MenuItem label="New" onClick={handleNew} />
          </div>
        )}
      </div>
      <input ref={fileInputRef} type="file" accept=".wcad" className="hidden" onChange={handleOpenFile} />
    </div>
  );
}

function MenuItem({ label, shortcut, onClick }: { label: string; shortcut?: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center justify-between gap-4 px-3 py-1.5 text-left text-charcoal-200 hover:bg-charcoal-800 hover:text-white"
    >
      <span>{label}</span>
      {shortcut && <span className="text-xs text-charcoal-500">{shortcut}</span>}
    </button>
  );
}
