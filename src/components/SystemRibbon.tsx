import { useRef, useState, useEffect } from 'react';
import { useAppStore } from '../store';
import BrandLogo from './BrandLogo';
import SystemInfoModal from './SystemInfoModal';

type MenuId = 'file' | 'edit' | 'view' | 'help' | null;

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
  const snapToGrid = useAppStore((s) => s.ui.snapToGrid);
  const dimensionLinesVisible = useAppStore((s) => s.ui.dimensionLinesVisible);
  const setGridVisible = useAppStore((s) => s.setGridVisible);
  const setOrthographic = useAppStore((s) => s.setOrthographic);
  const setSnapToGrid = useAppStore((s) => s.setSnapToGrid);
  const setDimensionLinesVisible = useAppStore((s) => s.setDimensionLinesVisible);
  const setRightPanelTab = useAppStore((s) => s.setRightPanelTab);
  const undo = useAppStore((s) => s.undo);
  const redo = useAppStore((s) => s.redo);
  const canUndo = useAppStore((s) => s.past.length > 0);
  const canRedo = useAppStore((s) => s.future.length > 0);
  const viewportMode = useAppStore((s) => s.ui.viewportMode);
  const displayMode = useAppStore((s) => s.ui.displayMode);
  const setViewportMode = useAppStore((s) => s.setViewportMode);
  const setDisplayMode = useAppStore((s) => s.setDisplayMode);
  const clearAllMembers = useAppStore((s) => s.clearAllMembers);
  const setTemplatePickerOpen = useAppStore((s) => s.setTemplatePickerOpen);

  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onPointerDown(e: MouseEvent) {
      if (ribbonRef.current && !ribbonRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    }
    function onOpenFile() {
      fileRef.current?.click();
    }
    window.addEventListener('mousedown', onPointerDown);
    document.addEventListener('dovedesign:open-file', onOpenFile);
    return () => {
      window.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('dovedesign:open-file', onOpenFile);
    };
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
        <MenuItem label="New from Template…" onClick={() => { setTemplatePickerOpen(true); setOpenMenu(null); }} />
        <MenuDivider />
        <MenuItem label="Save Project  Ctrl+S" onClick={() => { saveProjectToFile(); setOpenMenu(null); }} />
        <MenuItem label="Open Project  Ctrl+O" onClick={() => { fileRef.current?.click(); setOpenMenu(null); }} />
        <input ref={fileRef} type="file" accept=".wcad,.woodproject" className="hidden" onChange={handleLoad} />
      </RibbonMenu>

      <RibbonMenu label="Edit" open={openMenu === 'edit'} onToggle={() => toggle('edit')}>
        <MenuItem label="Undo  Ctrl+Z" onClick={() => { undo(); setOpenMenu(null); }} />
        <MenuItem label="Redo  Ctrl+Y" onClick={() => { redo(); setOpenMenu(null); }} />
        <MenuDivider />
        <MenuItem label="Clear All Boards  Shift+Del" onClick={() => { clearAllMembers(); setOpenMenu(null); }} />
      </RibbonMenu>

      <RibbonMenu label="View" open={openMenu === 'view'} onToggle={() => toggle('view')}>
        <MenuItem
          label={`Grid: ${gridVisible ? 'On' : 'Off'}`}
          onClick={() => setGridVisible(!gridVisible)}
        />
        <MenuItem
          label={`Snap to Grid (G): ${snapToGrid ? 'On' : 'Off'}`}
          onClick={() => {
            const next = !snapToGrid;
            setSnapToGrid(next);
            if (next && !gridVisible) setGridVisible(true);
          }}
        />
        <MenuItem
          label={`Dimension Lines: ${dimensionLinesVisible ? 'On' : 'Off'}`}
          onClick={() => setDimensionLinesVisible(!dimensionLinesVisible)}
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

      <div className="flex-1 flex items-center gap-2 px-2">
        <label className="flex items-center gap-2 text-base text-zinc-400">
          Mode
          <select
            className="input-field text-base py-1 w-auto"
            value={viewportMode}
            onChange={(e) => setViewportMode(e.target.value as 'design' | 'assembly')}
          >
            <option value="design">Design</option>
            <option value="assembly">Assembly</option>
          </select>
        </label>
        <label className="flex items-center gap-2 text-base text-zinc-400">
          Display
          <select
            className="input-field text-base py-1 w-auto"
            value={displayMode}
            onChange={(e) => setDisplayMode(e.target.value as import('../types').DisplayMode)}
          >
            <option value="shaded">Shaded</option>
            <option value="wireframe">Wireframe</option>
            <option value="shadedEdges">Shaded + Edges</option>
            <option value="xray">X-Ray</option>
          </select>
        </label>
      </div>

      <span className="text-base text-zinc-500 font-mono truncate max-w-[10rem] hidden md:inline">
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

function MenuDivider() {
  return <div className="my-1 border-t border-zinc-800" />;
}
