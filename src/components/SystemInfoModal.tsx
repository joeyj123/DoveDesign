import { useEffect, useRef } from 'react';
import BrandLogo from './BrandLogo';
import { BRAND_COPYRIGHT, BRAND_TAGLINE, BRAND_VERSION } from '../lib/brand';

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function SystemInfoModal({ open, onClose }: Props) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-labelledby="system-info-title"
        className="w-full max-w-md rounded-2xl border border-zinc-700 bg-zinc-900 shadow-2xl p-6 space-y-4"
      >
        <div className="space-y-1">
          <BrandLogo size="lg" id="system-info-title" />
          <p className="text-sm text-zinc-400">{BRAND_TAGLINE}</p>
        </div>

        <dl className="space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-zinc-500">Version</dt>
            <dd className="text-zinc-200 font-mono">{BRAND_VERSION}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-zinc-500">File format</dt>
            <dd className="text-zinc-200 font-mono">.wcad</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-zinc-500">Units</dt>
            <dd className="text-zinc-200">Inches (scene = 1″)</dd>
          </div>
        </dl>

        <p className="text-xs text-zinc-500 leading-relaxed">
          {BRAND_COPYRIGHT}. Built for shop-floor estimating, cut lists, and 3D layout.
        </p>

        <button type="button" onClick={onClose} className="btn-primary w-full">
          Close
        </button>
      </div>
    </div>
  );
}
