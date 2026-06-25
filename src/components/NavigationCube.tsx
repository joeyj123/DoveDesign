import { useAppStore } from '../store';

interface FaceBtn {
  label: string;
  preset: string;
  style: React.CSSProperties;
  className: string;
}

const FACE_BUTTONS: FaceBtn[] = [
  { label: 'TOP',    preset: 'top',    style: { top: 0,   left: '50%', transform: 'translateX(-50%)' }, className: 'w-14 h-8' },
  { label: 'BOTTOM', preset: 'bottom', style: { bottom: 0, left: '50%', transform: 'translateX(-50%)' }, className: 'w-14 h-8' },
  { label: 'FRONT',  preset: 'front',  style: { top: '50%', left: 0, transform: 'translateY(-50%)' }, className: 'w-12 h-8' },
  { label: 'BACK',   preset: 'back',   style: { top: '50%', right: 0, transform: 'translateY(-50%)' }, className: 'w-12 h-8' },
  { label: 'LEFT',   preset: 'left',   style: { top: '25%', left: 0 }, className: 'w-10 h-7' },
  { label: 'RIGHT',  preset: 'right',  style: { top: '25%', right: 0 }, className: 'w-10 h-7' },
];

const ISO_CORNERS: Array<{ label: string; preset: string; style: React.CSSProperties }> = [
  { label: '◤', preset: 'iso-front-top-left',  style: { top: 0, left: 0 } },
  { label: '◥', preset: 'iso-front-top-right', style: { top: 0, right: 0 } },
  { label: '◣', preset: 'iso-back-top-left',   style: { bottom: 0, left: 0 } },
  { label: '◢', preset: 'iso-back-top-right',  style: { bottom: 0, right: 0 } },
];

export default function NavigationCube() {
  const setCameraPreset = useAppStore((s) => s.setCameraPreset);
  const resetCamera = useAppStore((s) => s.resetCamera);

  return (
    <div className="absolute bottom-4 right-4 z-20 select-none" style={{ width: 100, userSelect: 'none' }}>
      {/* Cube face grid */}
      <div
        className="relative rounded-xl border border-zinc-700/80 bg-zinc-900/80 backdrop-blur-sm"
        style={{ width: 96, height: 96 }}
        title="Navigation Cube — click a face or corner to jump to that view"
      >
        {/* Center label */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-xs font-bold text-zinc-500 tracking-widest">3D</span>
        </div>

        {/* Face buttons */}
        {FACE_BUTTONS.map((f) => (
          <button
            key={f.preset}
            type="button"
            title={f.label}
            style={{ ...f.style, position: 'absolute' }}
            className={`${f.className} flex items-center justify-center rounded text-[9px] font-bold text-zinc-400 hover:text-amber-300 hover:bg-amber-500/20 transition-colors cursor-pointer border border-transparent hover:border-amber-500/40`}
            onClick={() => setCameraPreset(f.preset)}
          >
            {f.label}
          </button>
        ))}

        {/* Corner iso buttons */}
        {ISO_CORNERS.map((c) => (
          <button
            key={c.preset}
            type="button"
            title={`Isometric: ${c.preset}`}
            style={{ ...c.style, position: 'absolute', width: 18, height: 18 }}
            className="flex items-center justify-center text-[11px] text-zinc-600 hover:text-amber-400 transition-colors cursor-pointer"
            onClick={() => setCameraPreset(c.preset)}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Home button */}
      <button
        type="button"
        title="Reset camera to home position"
        className="mt-1 w-full text-[10px] font-semibold text-zinc-500 hover:text-amber-300 transition-colors text-center py-0.5 rounded border border-zinc-800 hover:border-amber-500/40 bg-zinc-900/60"
        onClick={resetCamera}
      >
        Home
      </button>
    </div>
  );
}
