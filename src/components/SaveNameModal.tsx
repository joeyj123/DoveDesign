import { useState } from 'react';
import { useAppStore } from '../store';

export default function SaveNameModal() {
  const open = useAppStore((s) => s.ui.saveNameModalOpen);
  const setOpen = useAppStore((s) => s.setSaveNameModalOpen);
  const saveProjectAs = useAppStore((s) => s.saveProjectAs);
  const [name, setName] = useState('');

  if (!open) return null;

  function handleSave() {
    if (!name.trim()) return;
    saveProjectAs(name.trim());
    setName('');
  }

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
    >
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-800">
          <h2 className="text-base font-bold text-zinc-100">Name Your Project</h2>
          <p className="text-sm text-zinc-400 mt-1">Give this project a name before saving it as a .wcad file.</p>
        </div>
        <div className="p-6 space-y-4">
          <label className="block">
            <span className="text-base text-zinc-300">Project name:</span>
            <input
              type="text"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); }}
              className="input-field text-base w-full mt-1"
              placeholder="e.g. Garage Workbench"
            />
          </label>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="btn-secondary text-base py-2 px-4"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!name.trim()}
              className="btn-primary text-base py-2 px-4 disabled:opacity-40"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
