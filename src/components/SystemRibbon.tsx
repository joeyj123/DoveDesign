import { useRef, useState, useEffect } from 'react';
import { useAppStore } from '../store';
import BrandLogo from './BrandLogo';
import SystemInfoModal from './SystemInfoModal';

type MenuId = 'file' | 'view' | 'help' | null;

export default function SystemRibbon() {
  const [openMenu, setOpenMenu] = useState<MenuId>(null);
  const [systemInfoOpen, setSystemInfoOpen] = useState(false);
  const ribbonRef = useRef<HTMLDivElement>(null);

  const projectName = useAppStore((s) => s.project.name);
  const newProject = useAppStore((s) => s.newProject);
  const saveProjectToFile = useAppStore((s) => s.saveProjectToFile);
  const loadProjectFromFile = useAppStore((s) => s.loadProjectFromFile);
  const resetCamera = useAppStore((s) => s.resetCamera);
  const gridVisible = useAppStore((s) => s.ui.gridVisible);
  const orthographic = useAppStore((s) => s.ui.orthographic);
  const setGridVisible = useAppStore((s) => s.setGridVisible);
  const setOrthographic = useAppStore((s) => s.setOrthographic);
  const setRightPanelTab = useAppStore((s) => s.setRightPanelTab);
  const undo = useAppStore((s) => s.undo);
  const redo = useAppStore((s) => s.redo);
  const canUndo = useAppStore((s) => s.past.length > 0);
  const canRedo = useAppStore((s) => s.future.length > 0);

  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onPointerDown(e: MouseEvent) {
      if (ribbonRef.current && !ribbonRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    }
    window.addEventListener('mousedown', onPointerDown);
    return () => window.removeEventListener('mousedown', onPointerDown);
  }, []);

  async function handleLoad(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await loadProjectFromFile(file);
    } catch {
      alert('Could not load — ensure the file is a valid .wcad project.');
    }
    e.target.value = '';
    setOpenMenu(null);
  }

  function toggle(menu: MenuId) {
    setOpenMenu((m) => (m === menu ? null : menu));
  }

  return (
    <header
      ref={ribbonRef}
      className="h-9 shrink-0 flex items-center bg-zinc-900 border-b border-zinc-800 px-2 gap-1 relative z-40"
    >
      <div className="px-2 hidden sm:block">
        <BrandLogo size="sm" />
      </div>

      <RibbonMenu label="File" open={openMenu === 'file'} onToggle={() => toggle('file')}>
        <MenuItem label="New Project" onClick={() => { newProject(); setOpenMenu(null); }} />
        <MenuItem label="Save Project (.wcad)" onClick={() => { saveProjectToFile(); setOpenMenu(null); }} />
        <MenuItem label="Load Project (.wcad)" onClick={() => fileRef.current?.click()} />
        <input ref={fileRef} type="file" accept=".wcad,.woodproject" className="hidden" onChange={handleLoad} />
      </RibbonMenu>

      <RibbonMenu label="View" open={openMenu === 'view'} onToggle={() => toggle('view')}>
        <MenuItem
          label={`Grid: ${gridVisible ? 'On' : 'Off'}`}
          onClick={() => setGridVisible(!gridVisible)}
        />
        <MenuItem
          label={`Camera: ${orthographic ? 'Orthographic' : 'Perspective'}`}
          onClick={() => setOrthographic(!orthographic)}
        />
        <MenuItem label="Reset Camera" onClick={() => { resetCamera(); setOpenMenu(null); }} />
      </RibbonMenu>

      <RibbonMenu label="Help" open={openMenu === 'help'} onToggle={() => toggle('help')}>
        <MenuItem
          label="Interactive Shop Tutorial"
          onClick={() => { setRightPanelTab('tutorial'); setOpenMenu(null); }}
        />
        <MenuItem
          label="About DoveDesign…"
          onClick={() => { setSystemInfoOpen(true); setOpenMenu(null); }}
        />
      </RibbonMenu>

      <div className="flex-1" />

      <span className="text-xs text-zinc-500 font-mono truncate max-w-[10rem] hidden md:inline">
        {projectName}
      </span>

      <button type="button" onClick={undo} disabled={!canUndo} className="ribbon-btn disabled:opacity-40">
        Undo
      </button>
      <button type="button" onClick={redo} disabled={!canRedo} className="ribbon-btn disabled:opacity-40">
        Redo
      </button>

      <SystemInfoModal open={systemInfoOpen} onClose={() => setSystemInfoOpen(false)} />
    </header>
  );
}

function RibbonMenu({
  label,
  open,
  onToggle,
  children,
}: {
  label: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        className={[
          'ribbon-btn',
          open ? 'bg-zinc-800 text-zinc-100 border-zinc-700' : '',
        ].join(' ')}
      >
        {label}
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-0.5 min-w-[11rem] rounded-lg border border-zinc-700 bg-zinc-900 shadow-xl py-1 z-50">
          {children}
        </div>
      )}
    </div>
  );
}

function MenuItem({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left text-sm px-3 py-1.5 text-zinc-200 hover:bg-zinc-800 transition-colors"
    >
      {label}
    </button>
  );
}
