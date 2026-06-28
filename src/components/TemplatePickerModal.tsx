import { useAppStore } from '../store';
import { PROJECT_TEMPLATES } from '../data/templates';

export default function TemplatePickerModal() {
  const open = useAppStore((s) => s.ui.templatePickerOpen);
  const setTemplatePickerOpen = useAppStore((s) => s.setTemplatePickerOpen);
  const loadProjectData = useAppStore((s) => s.loadProjectData);
  const newProject = useAppStore((s) => s.newProject);
  const members = useAppStore((s) => s.project.members);

  if (!open) return null;

  function handleSelect(templateId: string) {
    const hasBOards = members.filter((m) => !m.inScrapBox).length > 0;
    if (hasBOards) {
      if (!window.confirm('This will replace your current project. Continue?')) return;
    }
    if (templateId === 'blank') {
      newProject();
      setTemplatePickerOpen(false);
      return;
    }
    const tpl = PROJECT_TEMPLATES.find((t) => t.id === templateId);
    if (!tpl) return;
    loadProjectData(tpl.members, tpl.name);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) setTemplatePickerOpen(false); }}
    >
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
          <h2 className="text-base font-bold text-zinc-100">New from Template</h2>
          <button
            type="button"
            onClick={() => setTemplatePickerOpen(false)}
            className="text-zinc-500 hover:text-zinc-200 transition-colors text-xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[70vh] overflow-y-auto">
          {/* Blank project card */}
          <TemplateCard
            icon="⬜"
            name="Blank Project"
            description="Start with an empty scene — add your own boards from scratch."
            dimensions=""
            onClick={() => handleSelect('blank')}
          />

          {PROJECT_TEMPLATES.map((tpl) => (
            <TemplateCard
              key={tpl.id}
              icon={tpl.icon}
              name={tpl.name}
              description={tpl.description}
              dimensions={tpl.dimensions}
              onClick={() => handleSelect(tpl.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function TemplateCard({
  icon, name, description, dimensions, onClick,
}: {
  icon: string; name: string; description: string; dimensions: string; onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-left p-4 rounded-xl border border-zinc-700 hover:border-amber-500/60 hover:bg-zinc-800/60 transition-all group"
    >
      <div className="text-3xl mb-2">{icon}</div>
      <div className="text-base font-semibold text-zinc-100 group-hover:text-amber-400 transition-colors">{name}</div>
      <div className="text-sm text-zinc-400 mt-1">{description}</div>
      {dimensions && (
        <div className="text-xs text-zinc-500 mt-2 font-mono">{dimensions}</div>
      )}
    </button>
  );
}
