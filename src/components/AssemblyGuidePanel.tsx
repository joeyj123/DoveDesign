import { useAppStore } from '../store';

export default function AssemblyGuidePanel() {
  const open = useAppStore((s) => s.ui.assemblyGuideOpen);
  const setAssemblyGuideOpen = useAppStore((s) => s.setAssemblyGuideOpen);
  const steps = useAppStore((s) => s.project.assemblySteps);
  const mates = useAppStore((s) => s.project.mates);
  const members = useAppStore((s) => s.project.members);
  const resetAssemblyLayout = useAppStore((s) => s.resetAssemblyLayout);
  const viewportMode = useAppStore((s) => s.ui.viewportMode);

  if (viewportMode !== 'assembly') return null;

  function exportGuide() {
    const lines = steps.map((s) => {
      const mate = mates.find((m) => m.id === s.mateId);
      const join = mate?.joinMethod ?? 'Unset';
      return `Step ${s.stepIndex}: ${s.description} — Join: ${join}`;
    });
    const text = ['Assembly Guide', '================', '', ...lines].join('\n');
    const w = window.open('', '_blank');
    if (w) {
      w.document.write(`<pre style="font-family:monospace;font-size:16px">${text}</pre>`);
      w.document.close();
      w.print();
    }
  }

  return (
    <div className="absolute right-[25rem] top-16 z-30 w-72 pointer-events-auto">
      <div className="bg-zinc-950/95 border-2 border-blue-600/60 rounded-xl overflow-hidden">
        <button
          type="button"
          className="w-full text-left text-base font-semibold text-blue-200 px-4 py-3 border-b border-zinc-800"
          onClick={() => setAssemblyGuideOpen(!open)}
        >
          Assembly Guide {open ? '▼' : '▶'}
        </button>
        {open && (
          <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
            {steps.length === 0 ? (
              <p className="text-base text-zinc-400">Mate boards one by one — steps record here.</p>
            ) : (
              <ol className="space-y-2 list-decimal pl-5 text-base text-zinc-300">
                {steps.map((step) => {
                  const mate = mates.find((m) => m.id === step.mateId);
                  const a = members.find((m) => m.id === mate?.memberAId);
                  const b = members.find((m) => m.id === mate?.memberBId);
                  return (
                    <li key={step.stepIndex}>
                      {a?.label} + {b?.label}
                      {mate && mate.joinMethod !== 'Unset' && (
                        <span className="text-zinc-500"> ({mate.joinMethod})</span>
                      )}
                    </li>
                  );
                })}
              </ol>
            )}
            <button type="button" className="btn-secondary w-full text-base py-2" onClick={resetAssemblyLayout}>
              Reset Assembly
            </button>
            <button type="button" className="btn-primary w-full text-base py-2" onClick={exportGuide}>
              Export Assembly Guide
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
