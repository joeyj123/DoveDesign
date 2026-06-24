import BrandLogo from './BrandLogo';
import { BRAND_TAGLINE } from '../lib/brand';

export default function TutorialPanel() {
  return (
    <div className="space-y-5 text-sm text-zinc-300">
      <div>
        <BrandLogo size="md" className="mb-1 block" />
        <h2 className="text-base font-semibold text-zinc-100 mb-1">
          Interactive Shop Tutorial
        </h2>
        <p className="text-zinc-400">
          {BRAND_TAGLINE} — reference guide for tools, cuts, and a workbench quick-start blueprint.
        </p>
      </div>

      <Section title="Shop Tools">
        <ul className="space-y-1.5 list-disc pl-4 text-zinc-400">
          <li><strong className="text-zinc-300">Select</strong> — Move, rotate, or scale boards with the gizmo.</li>
          <li><strong className="text-zinc-300">Draw</strong> — Click-drag on the grid to extrude a board footprint.</li>
          <li><strong className="text-zinc-300">Add</strong> — Form-based entry with nominal sizes and species.</li>
          <li><strong className="text-zinc-300">Cross / Rip / Miter / Join / Trim / Mate</strong> — See sections below.</li>
        </ul>
      </Section>

      <Section title="Cross-Cuts & Rip Cuts">
        <p className="text-zinc-400 mb-1">
          Select a board, choose the tool, then apply from the Inspector panel.
        </p>
        <ul className="space-y-1 list-disc pl-4 text-zinc-400">
          <li><strong className="text-zinc-300">Cross-Cut</strong> — Vertical chop across the board width.</li>
          <li><strong className="text-zinc-300">Rip Cut</strong> — Enter a target width; waste strip is removed via CSG.</li>
        </ul>
      </Section>

      <Section title="Miter & Bevel Guides">
        <ul className="space-y-1 list-disc pl-4 text-zinc-400">
          <li><strong className="text-zinc-300">45° Miter</strong> — Standard corner joints for frames and trim.</li>
          <li><strong className="text-zinc-300">30° Bevel</strong> — Angled end cuts for roof pitches or decorative edges.</li>
          <li>Use Inspector rotation presets to orient runners on-edge before mitering.</li>
        </ul>
      </Section>

      <Section title="Joinery & Mating">
        <ul className="space-y-1 list-disc pl-4 text-zinc-400">
          <li><strong className="text-zinc-300">Pocket Holes</strong> — Dual-sided CSG drills pilot holes on both boards.</li>
          <li><strong className="text-zinc-300">Box / Finger / Dovetail</strong> — Complementary slots cut on mating members.</li>
          <li><strong className="text-zinc-300">Mate Tool</strong> — Pick face A and face B, then Apply Mate for flush alignment.</li>
        </ul>
      </Section>

      <Section title="Workbench Quick-Start Blueprint">
        <ol className="space-y-2 list-decimal pl-4 text-zinc-400">
          <li>
            <strong className="text-zinc-300">Top slab</strong> — Draw a 48" × 24" plywood sheet on the grid
            (material: Baltic Birch or CDX Plywood).
          </li>
          <li>
            <strong className="text-zinc-300">Four legs</strong> — Add four 4×4×29" members (nominal 4×4, length 29").
            Use rotation preset <em>Vertical leg (90° Z)</em> on each leg.
          </li>
          <li>
            <strong className="text-zinc-300">Position legs</strong> — Move each leg to a corner under the top using
            the translate gizmo; face snapping engages within 0.5".
          </li>
          <li>
            <strong className="text-zinc-300">Apron framing</strong> — Add 2×4×18" stretchers between legs.
            Orient on-edge (90° X) and mate faces flush to leg tops.
          </li>
          <li>
            <strong className="text-zinc-300">Joinery</strong> — Apply pocket holes between aprons and legs,
            or use the Mate tool for precise face alignment.
          </li>
          <li>
            <strong className="text-zinc-300">Review</strong> — Check the Estimating tab for cost ledger and
            Cut List for optimized lumber and sheet layouts.
          </li>
        </ol>
      </Section>

      <Section title="Viewport Navigation">
        <ul className="space-y-1 list-disc pl-4 text-zinc-400">
          <li><strong className="text-zinc-300">Left-click + drag</strong> — Orbit / rotate the camera around the focal point.</li>
          <li><strong className="text-zinc-300">Middle mouse + drag</strong> — Pan across the workbench plane.</li>
          <li><strong className="text-zinc-300">Shift + left-click + drag</strong> — Pan (for trackpads and mice without a wheel button).</li>
          <li><strong className="text-zinc-300">Scroll wheel</strong> — Zoom in and out.</li>
        </ul>
      </Section>

      <Section title="Keyboard Shortcuts">
        <ul className="space-y-1 list-disc pl-4 text-zinc-400 font-mono text-xs">
          <li>Esc — Cancel tool / clear draw preview</li>
          <li>Ctrl+Z — Undo</li>
          <li>Ctrl+Y — Redo</li>
          <li>Right-click — Context menu (Delete, Duplicate, Joinery, Isolate)</li>
        </ul>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-3 space-y-2">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-500/90">{title}</h3>
      {children}
    </div>
  );
}
