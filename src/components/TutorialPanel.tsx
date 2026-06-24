import BrandLogo from './BrandLogo';
import { BRAND_TAGLINE } from '../lib/brand';

export default function TutorialPanel() {
  return (
    <div className="space-y-5 text-base text-zinc-300">
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

      <Section title="Quick Dimensions Panel">
        <p className="text-base text-zinc-400">
          Select any board to see the floating Quick Dimensions panel at the top-right of its screen outline.
          Edit L (length), W (width), and H (thickness) in actual inches. Nominal size (like 2×4) shows when applicable.
          Changes apply immediately; undo history records when you leave a field or deselect. Click outside to dismiss.
        </p>
      </Section>

      <Section title="Mate Tool — Full Flow">
        <ul className="space-y-1.5 list-disc pl-4 text-base text-zinc-400">
          <li><strong className="text-zinc-300">Step 1</strong> — Activate Mate from the tool ribbon or radial wheel. Click a face on the first board (highlighted).</li>
          <li><strong className="text-zinc-300">Step 2</strong> — Click a face on a <em>different</em> board. They snap flush and a mate record is created.</li>
          <li><strong className="text-zinc-300">Face grid</strong> — While hovering a face, a ¼&quot; snap grid appears. Click to set the joint origin offset.</li>
          <li><strong className="text-zinc-300">Attachment points</strong> — Double-click a face to place a named point. Double-click a second point on another board to connect them point-to-point.</li>
        </ul>
      </Section>

      <Section title="Radial Orbital Selector">
        <p className="text-base text-zinc-400 mb-2">
          Appears at the top-left of the selected board&apos;s screen outline as a compact HUD arc of pill buttons.
          Click <strong className="text-zinc-300">•••</strong> to collapse the wheel without deselecting.
        </p>
        <ul className="space-y-1 list-disc pl-4 text-base text-zinc-400">
          <li><strong className="text-zinc-300">Dims</strong> — Opens the floating size editor.</li>
          <li><strong className="text-zinc-300">Mate</strong> — Starts face-pick mating for this board.</li>
          <li><strong className="text-zinc-300">Join</strong> — Sub-menu for screws, nails, glue, pocket holes, etc. (requires a mate).</li>
          <li><strong className="text-zinc-300">Edge</strong> — Opens the edge treatment tool on the selected board.</li>
          <li><strong className="text-zinc-300">Copy / Mirror / Solo / Delete</strong> — Common board actions.</li>
        </ul>
        <p className="text-base text-zinc-500 mt-2">Press Escape or click outside to close join sub-menu. Right-click a mate marker to open join methods only.</p>
      </Section>

      <Section title="Join Method Sub-Wheel">
        <ul className="space-y-1 list-disc pl-4 text-base text-zinc-400">
          <li>Screws, Nails, Glue, Pocket Holes, Biscuit, Dowel, Bracket / Hardware, Mortise &amp; Tenon</li>
          <li>Glue and Mortise &amp; Tenon skip fastener placement; others enter placement mode on the joint face.</li>
          <li>A small label appears at the mate marker showing the chosen method.</li>
        </ul>
      </Section>

      <Section title="Physical Fastener Placement">
        <p className="text-base text-zinc-400">
          After choosing a join method, click joint faces on the ¼&quot; grid to place 3D fastener geometry.
          Press Escape or <strong className="text-zinc-300">Done Placing</strong> to exit. Click a fastener to inspect or remove it.
          Counts appear in the Cut List tab.
        </p>
      </Section>

      <Section title="Continuous Edge Drawing">
        <p className="text-base text-zinc-400 mb-2">
          With the Draw tool active, each new board can chain from the last one — the start point snaps to the nearest corner or edge (amber dot).
          Dashed amber lines mark join candidates between chained boards. Press Escape or switch tools to end the chain.
        </p>
      </Section>

      <Section title="Drag Box Selection">
        <p className="text-base text-zinc-400 mb-2">
          In Select mode, click-drag on empty viewport space to rubber-band select multiple boards.
          Shift+drag adds to the selection. A join toolbar appears when two or more boards are selected.
        </p>
      </Section>

      <Section title="Multi-Member Quick Join">
        <ul className="space-y-1 list-disc pl-4 text-base text-zinc-400">
          <li><strong className="text-zinc-300">Auto-Detect Joints</strong> — Finds flush faces within 0.1&quot; and creates mates.</li>
          <li><strong className="text-zinc-300">Miter / Butt / Lap</strong> — Quick joint presets; miter adds 45° CSG cuts.</li>
          <li><strong className="text-zinc-300">Open Radial Wheel</strong> — Assign join methods after mating.</li>
        </ul>
      </Section>

      <Section title="Pepe — Design Assistant">
        <p className="text-base text-zinc-400 mb-2">
          Pepe sits at the bottom-right of the sidebar panel — never over the viewport gizmo. Click him to open <strong className="text-zinc-300">Pepe&apos;s Workshop</strong> — fully offline, no internet needed.
        </p>
        <ul className="space-y-1 list-disc pl-4 text-base text-zinc-400">
          <li><strong className="text-zinc-300">Suggestions</strong> — Live project tips (span warnings, missing prices, overlaps, etc.). Click a suggestion to highlight related boards.</li>
          <li><strong className="text-zinc-300">Ask Pepe</strong> — Type a woodworking or app question. Try: &quot;How do I use pocket holes?&quot;, &quot;What is kerf?&quot;, &quot;How do I save my project?&quot;</li>
        </ul>
      </Section>

      <Section title="Joinery & Mating">
        <ul className="space-y-1 list-disc pl-4 text-base text-zinc-400">
          <li><strong className="text-zinc-300">Pocket Holes</strong> — Dual-sided CSG drills angled pilot holes on both boards. Choose Pocket Holes as a join method or use the Joinery tool in the Inspector.</li>
          <li><strong className="text-zinc-300">Box / Finger / Dovetail</strong> — Complementary slots cut on mating members. Finger joints use square fingers; dovetails taper for drawer strength.</li>
          <li><strong className="text-zinc-300">Mate Tool</strong> — See Mate Tool section above for the full face-pick and grid workflow.</li>
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

      <Section title="Edge Treatments">
        <p className="text-base text-zinc-400">
          Use the radial wheel Chamfer / Edge segment or the Edge tool in the ribbon. Hover edges (amber highlight),
          click to select, choose treatment type and depth/radius, then Apply. Options include chamfer, fillet,
          cove, ogee, rabbet, and beading. Edge treatments appear in the Cut List tab.
        </p>
      </Section>

      <Section title="Complex Shapes">
        <ul className="space-y-1 list-disc pl-4 text-base text-zinc-400">
          <li><strong className="text-zinc-300">Rectangle</strong> — Draw tool (unchanged).</li>
          <li><strong className="text-zinc-300">Cylinder / Sphere / Cone</strong> — Shapes group in the tool ribbon.</li>
          <li><strong className="text-zinc-300">Triangle / Hexagonal prism</strong> — Structural gussets or columns.</li>
          <li><strong className="text-zinc-300">Custom polygon</strong> — Click vertices on ¼&quot; grid, close shape, set height.</li>
        </ul>
      </Section>

      <Section title="Assembly Mode">
        <p className="text-base text-zinc-400">
          Toggle Assembly Mode in the top ribbon. Boards explode flat with spacing. Mate them in build order;
          steps record in the Assembly Guide. Export prints a plain-text checklist. Reset Assembly re-spreads the layout.
        </p>
      </Section>

      <Section title="Display Modes">
        <p className="text-base text-zinc-400">
          Top ribbon Display selector: Shaded, Wireframe, Shaded + Edges, or X-Ray (semi-transparent members).
        </p>
      </Section>

      <Section title="Hardware Library">
        <p className="text-base text-zinc-400">
          Hardware tab — browse labeled items with inline previews. Click to place on a board face.
          Includes slides, hinges, pulls, pins, cam locks, brackets, and barrel bolts.
        </p>
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
        <ul className="space-y-1 list-disc pl-4 text-base text-zinc-400 font-mono">
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
