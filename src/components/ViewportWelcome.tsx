import BrandLogo from './BrandLogo';
import { BRAND_TAGLINE } from '../lib/brand';

/** Empty-canvas welcome overlay — visible until the first board is placed. */
export default function ViewportWelcome() {
  return (
    <div
      className="pointer-events-none absolute inset-0 flex items-center justify-center z-10"
      aria-hidden
    >
      <div className="text-center space-y-3 px-6 max-w-md">
        <BrandLogo size="lg" className="block" />
        <p className="text-base text-zinc-400">{BRAND_TAGLINE}</p>
        <p className="text-sm text-zinc-500 leading-relaxed">
          Use <strong className="text-zinc-400 font-medium">Draw Board</strong> on the tool dock,
          or open <strong className="text-zinc-400 font-medium">File → New Project</strong> to begin.
        </p>
        <p className="text-xs text-zinc-600 pt-1">
          Left-drag orbit · Middle-drag or Shift+left-drag pan · Scroll zoom
        </p>
      </div>
    </div>
  );
}
