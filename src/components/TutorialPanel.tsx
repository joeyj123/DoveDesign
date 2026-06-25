import { useState } from 'react';
import BrandLogo from './BrandLogo';
import { BRAND_TAGLINE } from '../lib/brand';

function HighlightText({ text, search }: { text: string; search: string }) {
  if (!search) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(search.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-amber-400/40 text-amber-200 rounded px-0.5">{text.slice(idx, idx + search.length)}</mark>
      <HighlightText text={text.slice(idx + search.length)} search={search} />
    </>
  );
}

const ALL_SECTION_TITLES = [
  'Keyboard Shortcuts',
  'Left Tool Panel — Model, Modify, Joinery, Shapes',
  'Shop Tools',
  'Cross-Cuts & Rip Cuts',
  'Board Dimensions & Quick Dimensions',
  'Mate / Join Tool',
  'Unmate & Edit Connections',
  'Attachment Points',
  'Radial Wheel & Board Actions',
  'Join Methods (after Mating)',
  'Fastener Placement',
  'Continuous Edge Drawing (Chain Mode)',
  'Multi-Select & Box Selection',
  'Quick-Join Toolbar',
  'Pepe the Woodworking Owl',
  'Joinery Detail Cuts',
  'Edge Treatments',
  'Shapes & Special Geometry',
  'Assembly Mode',
  'Display Modes (Shaded, Wireframe, X-Ray)',
  'Hardware Library & Placed Hardware',
  'System Ribbon — File, View & More',
  'Right-Click Context Menu',
  'Workbench Quick-Start Blueprint',
  'Viewport Navigation',
  'Navigation Cube',
  'Snap Points',
  'Renaming Boards (Label)',
  'Keyboard Shortcuts & Escape Priority',
];

export default function TutorialPanel() {
  const [search, setSearch] = useState('');
  const searchLower = search.toLowerCase().trim();

  const matchCount = searchLower
    ? ALL_SECTION_TITLES.filter((t) => t.toLowerCase().includes(searchLower)).length
    : 0;

  function registerMatch() {
    // no-op: count computed above
  }

  return (
    <div className="space-y-5 text-base text-zinc-300">
      <div className="sticky top-0 z-10 bg-zinc-950 pb-2 pt-1 -mx-4 px-4 border-b border-zinc-800">
        <input
          type="text"
          className="input-field text-base w-full"
          placeholder="Search tutorial... (e.g. 'mate', 'shortcuts', 'cut')"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.stopPropagation()}
        />
        <div className="flex items-center justify-between mt-1 min-h-[1.25rem]">
          {search && matchCount > 0 && (
            <span className="text-sm text-amber-400">{matchCount} match{matchCount !== 1 ? 'es' : ''}</span>
          )}
          {search && matchCount === 0 && (
            <span className="text-sm text-zinc-500">No matches</span>
          )}
          {!search && <span />}
          {search && (
            <button
              type="button"
              className="text-sm text-zinc-400 underline"
              onClick={() => setSearch('')}
            >
              Clear
            </button>
          )}
        </div>
      </div>
      <div>
        <BrandLogo size="md" className="mb-1 block" />
        <h2 className="text-base font-semibold text-zinc-100 mb-1">
          Interactive Shop Tutorial
        </h2>
        <p className="text-zinc-400">
          {BRAND_TAGLINE} — a plain-language guide to every tool, panel, and workflow in DoveDesign.
        </p>
      </div>

      <Section search={searchLower} onMatch={registerMatch} title="Keyboard Shortcuts">
        <p className="text-base text-zinc-400 mb-2">
          DoveDesign uses industry-standard CAD shortcuts so experienced woodworkers
          feel right at home.
        </p>
        <ul className="space-y-1.5 list-none pl-0 text-zinc-400">
          <li><kbd className="bg-zinc-700 text-zinc-200 px-1.5 py-0.5 rounded text-sm">Space</kbd> — Open / close the radial tool wheel on selected board</li>
          <li><kbd className="bg-zinc-700 text-zinc-200 px-1.5 py-0.5 rounded text-sm">Escape</kbd> — Cancel current tool, deselect all, close wheel</li>
          <li><kbd className="bg-zinc-700 text-zinc-200 px-1.5 py-0.5 rounded text-sm">S</kbd> — Switch to Select tool</li>
          <li><kbd className="bg-zinc-700 text-zinc-200 px-1.5 py-0.5 rounded text-sm">B</kbd> — Switch to Draw Board tool</li>
          <li><kbd className="bg-zinc-700 text-zinc-200 px-1.5 py-0.5 rounded text-sm">M</kbd> — Activate Move (shows transform arrows on selected board)</li>
          <li><kbd className="bg-zinc-700 text-zinc-200 px-1.5 py-0.5 rounded text-sm">R</kbd> — Switch to Rip Cut tool</li>
          <li><kbd className="bg-zinc-700 text-zinc-200 px-1.5 py-0.5 rounded text-sm">D</kbd> — Duplicate selected board</li>
          <li><kbd className="bg-zinc-700 text-zinc-200 px-1.5 py-0.5 rounded text-sm">G</kbd> — Toggle grid on / off</li>
          <li><kbd className="bg-zinc-700 text-zinc-200 px-1.5 py-0.5 rounded text-sm">C</kbd> — Cross Cut tool</li>
          <li><kbd className="bg-zinc-700 text-zinc-200 px-1.5 py-0.5 rounded text-sm">J</kbd> — Mate / Join tool (join boards face to face)</li>
          <li><kbd className="bg-zinc-700 text-zinc-200 px-1.5 py-0.5 rounded text-sm">F</kbd> — Flip board (toggles between normal and flipped — press again to flip back)</li>
          <li><kbd className="bg-zinc-700 text-zinc-200 px-1.5 py-0.5 rounded text-sm">U</kbd> — Unmate the most recent connection on the selected board</li>
          <li><kbd className="bg-zinc-700 text-zinc-200 px-1.5 py-0.5 rounded text-sm">Tab</kbd> — Cycle through Move / Rotate / Scale when move arrows are active</li>
          <li><kbd className="bg-zinc-700 text-zinc-200 px-1.5 py-0.5 rounded text-sm">Delete</kbd> — Delete selected board</li>
          <li><kbd className="bg-zinc-700 text-zinc-200 px-1.5 py-0.5 rounded text-sm">Ctrl+Z</kbd> — Undo</li>
          <li><kbd className="bg-zinc-700 text-zinc-200 px-1.5 py-0.5 rounded text-sm">Ctrl+Y</kbd> — Redo</li>
          <li><kbd className="bg-zinc-700 text-zinc-200 px-1.5 py-0.5 rounded text-sm">Shift+drag</kbd> — Box select multiple boards</li>
        </ul>
        <p className="text-base text-zinc-500 mt-2">
          <strong className="text-zinc-400">Ask Pepe:</strong> &quot;What are the keyboard shortcuts?&quot; · &quot;How do I move a board with the keyboard?&quot;
        </p>
      </Section>

      <Section search={searchLower} onMatch={registerMatch} title="Left Tool Panel — Model, Modify, Joinery, Shapes">
        <p className="text-base text-zinc-400 mb-2">
          The vertical panel on the left side of the screen is organized into four tabs. Click a tab name to switch groups.
          Use the « / » button at the top to collapse the panel to a narrow strip (abbreviated tab labels) or expand it for full tool names.
        </p>
        <ol className="space-y-1.5 list-decimal pl-4 text-base text-zinc-400">
          <li><strong className="text-zinc-300">Model</strong> — Select, Draw, and Add boards.</li>
          <li><strong className="text-zinc-300">Modify</strong> — Cross Cut, Rip Cut, Miter, Trim, and Join tools.</li>
          <li><strong className="text-zinc-300">Joinery</strong> — Mate, Edge Treatment, and Attach Point.</li>
          <li><strong className="text-zinc-300">Shapes</strong> — Cylinder, Sphere, Cone, Triangle, Hexagon, and Custom Polygon.</li>
        </ol>
        <p className="text-base text-zinc-500 mt-2">
          <strong className="text-zinc-400">Ask Pepe:</strong> &quot;What tools are in the left panel?&quot; · &quot;Where is the Draw tool?&quot; · &quot;How do I add a cylinder?&quot;
        </p>
      </Section>

      <Section search={searchLower} onMatch={registerMatch} title="Shop Tools">
        <p className="text-base text-zinc-400 mb-2">
          These are the core tools in the <strong className="text-zinc-300">Model</strong> and <strong className="text-zinc-300">Modify</strong> tabs:
        </p>
        <ul className="space-y-1.5 list-disc pl-4 text-zinc-400">
          <li><strong className="text-zinc-300">Select</strong> — Click a board to highlight it. Press <kbd className="bg-zinc-700 text-zinc-200 px-1 py-0.5 rounded text-sm">Space</kbd> to open the radial wheel. Press <kbd className="bg-zinc-700 text-zinc-200 px-1 py-0.5 rounded text-sm">M</kbd> to activate move arrows. Shift+click to multi-select.</li>
          <li><strong className="text-zinc-300">Draw</strong> — Click and drag on the grid to sketch a rectangle footprint; release to create a board. See Continuous Edge Drawing below for chaining.</li>
          <li><strong className="text-zinc-300">Add</strong> — Place a board with exact dimensions; finish details in the Inspector tab on the right.</li>
          <li><strong className="text-zinc-300">Cross Cut (C)</strong> — Select a board, press C, then set the cut position in the Inspector panel on the right.</li>
          <li><strong className="text-zinc-300">Rip Cut / Miter / Trim / Join</strong> — Select a board first, pick the tool, then apply settings from the Inspector panel.</li>
        </ul>
        <p className="text-base text-zinc-500 mt-2">
          <strong className="text-zinc-400">Ask Pepe:</strong> &quot;How do I draw a board?&quot; · &quot;How do I move a board?&quot; · &quot;What is the difference between cross cut and rip cut?&quot;
        </p>
      </Section>

      <Section search={searchLower} title="Cross-Cuts & Rip Cuts" onMatch={registerMatch}>
        <ul className="space-y-2 list-disc pl-4 text-zinc-400">
          <li>
            <strong className="text-zinc-300">Cross Cut (C)</strong> — Select a board, press <kbd className="bg-zinc-700 text-zinc-200 px-1 py-0.5 rounded text-sm">C</kbd> or click Cross Cut in the Modify tab.
            In the Inspector panel, set the <strong className="text-zinc-300">Cut Position</strong> in inches from the board&apos;s start end, then click <strong className="text-zinc-300">Apply Cross Cut</strong>.
            <strong className="text-zinc-300"> This creates TWO separate boards</strong> — a keep piece and a waste piece — both fully independent and moveable.
            This goes ACROSS the grain — like a chop saw shortening the board.
          </li>
          <li>
            <strong className="text-zinc-300">Rip Cut (R)</strong> — Select a board, press <kbd className="bg-zinc-700 text-zinc-200 px-1 py-0.5 rounded text-sm">R</kbd> or click Rip Cut.
            Set the <strong className="text-zinc-300">Target Width</strong> in inches, then click <strong className="text-zinc-300">Apply Rip Cut</strong>.
            <strong className="text-zinc-300"> This creates TWO separate boards</strong> — the target-width piece and the waste strip — both fully independent.
            This goes ALONG the grain — like a table saw narrowing the board.
          </li>
        </ul>
        <p className="text-base text-zinc-400 mt-2">
          <strong className="text-zinc-300">Remember:</strong> Cross cut = shorter board. Rip cut = narrower board. Both cuts always produce two independent pieces you can move and label separately.
        </p>
        <p className="text-base text-zinc-500 mt-2">
          <strong className="text-zinc-400">Ask Pepe:</strong> &quot;How do I make a cross cut?&quot; · &quot;What is a rip cut?&quot; · &quot;What happens when I apply a cut?&quot;
        </p>
      </Section>

      <Section search={searchLower} onMatch={registerMatch} title="Miter & Bevel Guides">
        <ol className="space-y-1.5 list-decimal pl-4 text-zinc-400">
          <li>Select the board and choose <strong className="text-zinc-300">Miter</strong> from the Modify tab.</li>
          <li>Use the Inspector to set the angle (45° for standard corners, 30° for bevels).</li>
          <li>For runners on edge, use rotation presets in the Inspector before mitering.</li>
        </ol>
        <ul className="space-y-1 list-disc pl-4 text-zinc-400 mt-2">
          <li><strong className="text-zinc-300">45° Miter</strong> — Standard corner joints for frames and trim.</li>
          <li><strong className="text-zinc-300">30° Bevel</strong> — Angled end cuts for roof pitches or decorative edges.</li>
        </ul>
      </Section>

      <Section search={searchLower} onMatch={registerMatch} title="Quick Dimensions Panel">
        <ol className="space-y-1.5 list-decimal pl-4 text-base text-zinc-400">
          <li>Select a board (left-click with the Select tool, or right-click any board).</li>
          <li>Click the <strong className="text-zinc-300">Dims</strong> segment on the radial wheel, or open it when the wheel first appears.</li>
          <li>A floating panel appears near the board showing <strong className="text-zinc-300">L</strong> (length), <strong className="text-zinc-300">W</strong> (width), and <strong className="text-zinc-300">H</strong> (thickness) in actual inches.</li>
          <li>Type new values — changes apply live in the viewport.</li>
          <li>Press Tab or click outside to finish; undo history records when you leave a field or deselect.</li>
        </ol>
        <p className="text-base text-zinc-400 mt-2">
          Nominal size (like 2×4) displays when your board matches a standard lumber size. Press Escape to close the panel.
        </p>
        <p className="text-base text-zinc-500 mt-2">
          <strong className="text-zinc-400">Ask Pepe:</strong> &quot;How do I change board size?&quot; · &quot;What is the Quick Dimensions panel?&quot; · &quot;What is nominal vs actual size?&quot;
        </p>
      </Section>

      <Section search={searchLower} onMatch={registerMatch} title="Mate Tool — Full Flow">
        <ol className="space-y-1.5 list-decimal pl-4 text-base text-zinc-400">
          <li><strong className="text-zinc-300">Step 1</strong> — Press <kbd className="bg-zinc-700 text-zinc-200 px-1 py-0.5 rounded text-sm">J</kbd>, or open the <strong className="text-zinc-300">Joinery</strong> tab and click <strong className="text-zinc-300">Mate</strong>, or choose Mate from the radial wheel.</li>
          <li><strong className="text-zinc-300">Step 2</strong> — Click a face on the first board. It highlights and a ¼&quot; grid overlay appears on hover.</li>
          <li><strong className="text-zinc-300">Step 3</strong> — Optionally click a grid intersection to set where the joint origin sits (amber marker).</li>
          <li><strong className="text-zinc-300">Step 4</strong> — Click a face on a <em>different</em> board. The second board snaps flush to the first and a mate record is created.</li>
          <li><strong className="text-zinc-300">Step 5</strong> — Choose a join method from the sub-wheel (see Join Method Sub-Wheel below).</li>
        </ol>
        <p className="text-base text-zinc-400 mt-2">
          <strong className="text-zinc-300">Controlling where boards attach:</strong> When you click a face, click near the EDGE of the face to attach there, or near the CENTER to attach at the center. The ¼&quot; snap grid on the face helps you place the joint precisely. The board will snap so that exact point on face B meets that exact point on face A.
        </p>
        <p className="text-base text-zinc-400 mt-2">
          <strong className="text-zinc-300">Attachment points</strong> — With Mate active, double-click a face to place a named point (cyan marker).
          Double-click a second point on another board to connect them point-to-point. Drag a point to reposition it on its face.
        </p>
        <p className="text-base text-zinc-500 mt-2">
          <strong className="text-zinc-400">Ask Pepe:</strong> &quot;How do I mate two boards?&quot; · &quot;Why won&apos;t my boards attach?&quot; · &quot;How do I use the J shortcut?&quot;
        </p>
      </Section>

      <Section search={searchLower} onMatch={registerMatch} title="Connections & Unmate">
        <p className="text-base text-zinc-400">
          To see what a board is connected to, select it and check the <strong className="text-zinc-300">Inspector</strong> tab — Connections lists every mate. Click <strong className="text-zinc-300">Unmate</strong> next to any connection to detach those two boards.
        </p>
        <p className="text-base text-zinc-400 mt-1">
          <strong className="text-zinc-300">Shortcut:</strong> Press <kbd className="bg-zinc-700 text-zinc-200 px-1 py-0.5 rounded text-sm">U</kbd> to instantly unmate the most recent connection on the selected board without opening the Inspector.
        </p>
        <p className="text-base text-zinc-400 mt-1">
          This does <strong className="text-zinc-300">NOT</strong> undo the position change — use <kbd className="bg-zinc-700 text-zinc-200 px-1 py-0.5 rounded text-sm">Ctrl+Z</kbd> if you want to fully reverse a mate including where the board moved.
        </p>
        <p className="text-base text-zinc-500 mt-2">
          <strong className="text-zinc-400">Ask Pepe:</strong> &quot;How do I unmate boards?&quot; · &quot;Can I undo a mate?&quot; · &quot;U key unmate&quot;
        </p>
      </Section>

      <Section search={searchLower} onMatch={registerMatch} title="Attachment Points & Face Grid">
        <ol className="space-y-1.5 list-decimal pl-4 text-base text-zinc-400">
          <li>Activate the <strong className="text-zinc-300">Mate</strong> tool from the Joinery tab or radial wheel.</li>
          <li>Hover any board face — a yellow ¼&quot; snap grid appears on the face.</li>
          <li>Click a grid intersection to set the joint origin offset (amber sphere marker).</li>
          <li>Double-click a face to drop a named attachment point (cyan labeled marker).</li>
          <li>Double-click a second point on another board — the boards snap so the two points meet.</li>
          <li>Click and drag an attachment point to slide it along its face; connected pairs show a dashed line between them.</li>
        </ol>
        <p className="text-base text-zinc-500 mt-2">
          <strong className="text-zinc-400">Ask Pepe:</strong> &quot;How do I place an attachment point?&quot; · &quot;Can I move an attachment point?&quot; · &quot;What does the face grid do?&quot;
        </p>
      </Section>

      <Section search={searchLower} onMatch={registerMatch} title="Radial Orbital Wheel">
        <ol className="space-y-1.5 list-decimal pl-4 text-base text-zinc-400">
          <li>With the <strong className="text-zinc-300">Select</strong> tool active, left-click any board — the wheel opens every time.</li>
          <li>Or right-click any board with any tool active — the wheel opens and the context menu appears.</li>
          <li>The wheel positions itself offset from your click, away from the center of the screen, so it does not cover the board under your cursor.</li>
          <li>Click a segment to run that action. Click empty space, press Escape, or pick an action to close the wheel.</li>
          <li>Clicking the same board again keeps the wheel open — it does not toggle off.</li>
        </ol>
        <p className="text-base text-zinc-400 mt-2">Five segments:</p>
        <ul className="space-y-1 list-disc pl-4 text-base text-zinc-400">
          <li><strong className="text-zinc-300">Dims</strong> — Opens the floating Quick Dimensions editor.</li>
          <li><strong className="text-zinc-300">Mate</strong> — Starts face-pick mating for this board.</li>
          <li><strong className="text-zinc-300">Edge</strong> — Opens the edge treatment tool on the selected board.</li>
          <li><strong className="text-zinc-300">Flip</strong> — Flips the board 180° across its longest axis.</li>
          <li><strong className="text-zinc-300">Delete</strong> — Click once to arm, click again within a few seconds to confirm deletion.</li>
        </ul>
        <p className="text-base text-zinc-500 mt-2">
          <strong className="text-zinc-400">Ask Pepe:</strong> &quot;How do I open the radial wheel?&quot; · &quot;What does Flip do?&quot; · &quot;How do I delete a board?&quot;
        </p>
      </Section>

      <Section search={searchLower} onMatch={registerMatch} title="Join Method Sub-Wheel">
        <ol className="space-y-1.5 list-decimal pl-4 text-base text-zinc-400">
          <li>Mate two boards first (see Mate Tool section).</li>
          <li>After the mate is confirmed, the join method sub-wheel opens automatically.</li>
          <li>Or right-click an existing mate marker in the viewport to reopen join methods for that joint.</li>
          <li>Pick a method: Screws, Nails, Glue, Pocket Holes, Biscuit, Dowel, Bracket / Hardware, or Mortise &amp; Tenon.</li>
          <li>Glue and Mortise &amp; Tenon skip fastener placement. All other methods enter placement mode on the joint face.</li>
        </ol>
        <p className="text-base text-zinc-400 mt-2">
          A small label appears at the mate marker showing the chosen method. Use the Multi-Member Quick Join toolbar to mate first, then assign methods.
        </p>
        <p className="text-base text-zinc-500 mt-2">
          <strong className="text-zinc-400">Ask Pepe:</strong> &quot;How do I choose a join method?&quot; · &quot;When should I use screws vs nails?&quot; · &quot;What are pocket holes?&quot;
        </p>
      </Section>

      <Section search={searchLower} onMatch={registerMatch} title="Physical Fastener Placement">
        <ol className="space-y-1.5 list-decimal pl-4 text-base text-zinc-400">
          <li>Choose a join method that requires fasteners (Screws, Nails, Pocket Holes, Biscuit, Dowel, or Bracket).</li>
          <li>Placement mode activates — the joint face shows a ¼&quot; snap grid.</li>
          <li>Click grid intersections to place 3D fastener meshes on the joint.</li>
          <li>Click <strong className="text-zinc-300">Done Placing</strong> in the bar at the bottom of the viewport, or press Escape.</li>
          <li>Click an existing fastener to inspect it or remove it from the info panel.</li>
        </ol>
        <p className="text-base text-zinc-400 mt-2">
          Fastener counts appear in the Cut List tab. Glue and Mortise &amp; Tenon joints do not use this placement step.
        </p>
        <p className="text-base text-zinc-500 mt-2">
          <strong className="text-zinc-400">Ask Pepe:</strong> &quot;How do I place screws?&quot; · &quot;How do I exit fastener placement?&quot; · &quot;Where do fastener counts show up?&quot;
        </p>
      </Section>

      <Section search={searchLower} onMatch={registerMatch} title="Continuous Edge Drawing">
        <ol className="space-y-1.5 list-decimal pl-4 text-base text-zinc-400">
          <li>Select the <strong className="text-zinc-300">Draw</strong> tool from the Model tab.</li>
          <li>Click and drag on the grid to place your first board.</li>
          <li>Keep Draw active — the next stroke snaps its start to the nearest corner or edge of the last board (amber dot).</li>
          <li>Dashed amber lines mark join candidates between chained boards.</li>
          <li>Press <strong className="text-zinc-300">Escape</strong> or switch to another tool to end the chain.</li>
        </ol>
        <p className="text-base text-zinc-500 mt-2">
          <strong className="text-zinc-400">Ask Pepe:</strong> &quot;How do I chain boards while drawing?&quot; · &quot;What is the amber snap dot?&quot;
        </p>
      </Section>

      <Section search={searchLower} onMatch={registerMatch} title="Drag Box Selection">
        <ol className="space-y-1.5 list-decimal pl-4 text-base text-zinc-400">
          <li>Make sure the <strong className="text-zinc-300">Select</strong> tool is active.</li>
          <li>Click and drag on empty viewport space (not on a board).</li>
          <li>A dashed amber rectangle appears — release to select every board inside it.</li>
          <li>Hold <strong className="text-zinc-300">Shift</strong> while dragging to add boards to the current selection instead of replacing it.</li>
        </ol>
        <p className="text-base text-zinc-400 mt-2">
          When two or more boards are selected, the Multi-Member Quick Join toolbar appears automatically.
        </p>
        <p className="text-base text-zinc-500 mt-2">
          <strong className="text-zinc-400">Ask Pepe:</strong> &quot;How do I select multiple boards?&quot; · &quot;What is box selection?&quot;
        </p>
      </Section>

      <Section search={searchLower} onMatch={registerMatch} title="Multi-Member Quick Join Toolbar">
        <ol className="space-y-1.5 list-decimal pl-4 text-base text-zinc-400">
          <li>Select two or more boards (drag box or Shift+click).</li>
          <li>A toolbar appears above the selection with these actions:</li>
        </ol>
        <ul className="space-y-1 list-disc pl-4 text-base text-zinc-400 mt-1">
          <li><strong className="text-zinc-300">Auto-Detect Joints</strong> — Finds flush faces within 0.1&quot; and creates mates automatically.</li>
          <li><strong className="text-zinc-300">Miter</strong> — Adds 45° miter cuts at detected joints.</li>
          <li><strong className="text-zinc-300">Butt Joint</strong> — Mates boards face-to-face without angle cuts.</li>
          <li><strong className="text-zinc-300">Lap Joint</strong> — Overlapping joint preset with CSG overlap cuts.</li>
          <li><strong className="text-zinc-300">Open Radial Wheel</strong> — Opens the wheel on the primary selection to assign join methods.</li>
        </ul>
        <p className="text-base text-zinc-500 mt-2">
          <strong className="text-zinc-400">Ask Pepe:</strong> &quot;How does auto-detect joints work?&quot; · &quot;What is a lap joint?&quot; · &quot;How do I join multiple boards at once?&quot;
        </p>
      </Section>

      <Section search={searchLower} onMatch={registerMatch} title="Pepe — Design Assistant">
        <ol className="space-y-1.5 list-decimal pl-4 text-base text-zinc-400">
          <li>Find Pepe the frog at the <strong className="text-zinc-300">bottom of the left tool panel</strong> (below the tool buttons).</li>
          <li>Click Pepe to open <strong className="text-zinc-300">Pepe&apos;s Workshop</strong> — fully offline, no internet needed.</li>
          <li>Switch between two tabs:</li>
        </ol>
        <ul className="space-y-1 list-disc pl-4 text-base text-zinc-400 mt-1">
          <li><strong className="text-zinc-300">Suggestions</strong> — Live rule-based analysis of your project (span warnings, missing prices, overlaps, unset join methods). Click a suggestion to highlight related boards.</li>
          <li><strong className="text-zinc-300">Ask Pepe</strong> — Type any woodworking or app question. Fuzzy search matches your words to Pepe&apos;s built-in knowledge base.</li>
        </ul>
        <p className="text-base text-zinc-400 mt-2">Example questions:</p>
        <ul className="space-y-1 list-disc pl-4 text-base text-zinc-400">
          <li>&quot;How do I use pocket holes?&quot;</li>
          <li>&quot;What is kerf?&quot;</li>
          <li>&quot;How do I save my project?&quot;</li>
          <li>&quot;How do I open the radial wheel?&quot;</li>
          <li>&quot;What is assembly mode?&quot;</li>
        </ul>
      </Section>

      <Section search={searchLower} onMatch={registerMatch} title="Joinery & Mating">
        <ul className="space-y-1 list-disc pl-4 text-base text-zinc-400">
          <li><strong className="text-zinc-300">Pocket Holes</strong> — Dual-sided CSG drills angled pilot holes on both boards. Choose Pocket Holes as a join method after mating, or use the Join tool in the Inspector.</li>
          <li><strong className="text-zinc-300">Box / Finger / Dovetail</strong> — Complementary slots cut on mating members. Finger joints use square fingers; dovetails taper for drawer strength.</li>
          <li><strong className="text-zinc-300">Mate Tool</strong> — See Mate Tool and Attachment Points sections above for the full face-pick and grid workflow.</li>
        </ul>
        <p className="text-base text-zinc-500 mt-2">
          <strong className="text-zinc-400">Ask Pepe:</strong> &quot;What is a dovetail joint?&quot; · &quot;How do pocket holes work in DoveDesign?&quot;
        </p>
      </Section>

      <Section search={searchLower} onMatch={registerMatch} title="Edge Treatments">
        <ol className="space-y-1.5 list-decimal pl-4 text-base text-zinc-400">
          <li>Select a board and click <strong className="text-zinc-300">Edge</strong> on the radial wheel, or choose <strong className="text-zinc-300">Edge Treatment</strong> from the Joinery tab.</li>
          <li>Hover board edges — they highlight amber.</li>
          <li>Click an edge to select it.</li>
          <li>Choose a treatment type and set depth or radius in the Inspector.</li>
          <li>Click <strong className="text-zinc-300">Apply</strong>. Use &quot;Apply to all parallel edges&quot; for uniform profiles.</li>
        </ol>
        <p className="text-base text-zinc-400 mt-2">
          Available types: chamfer, fillet (round-over), cove, ogee, rabbet, and beading. Edge treatments appear in the Cut List tab.
        </p>
        <p className="text-base text-zinc-500 mt-2">
          <strong className="text-zinc-400">Ask Pepe:</strong> &quot;How do I chamfer an edge?&quot; · &quot;What edge treatments are available?&quot;
        </p>
      </Section>

      <Section search={searchLower} onMatch={registerMatch} title="Complex Shapes">
        <ol className="space-y-1.5 list-decimal pl-4 text-base text-zinc-400">
          <li>Open the <strong className="text-zinc-300">Shapes</strong> tab in the left panel.</li>
          <li>Click a shape button to add it to the scene:</li>
        </ol>
        <ul className="space-y-1 list-disc pl-4 text-base text-zinc-400 mt-1">
          <li><strong className="text-zinc-300">Cylinder</strong> — Round column or dowel stock.</li>
          <li><strong className="text-zinc-300">Sphere</strong> — Ball or knob form.</li>
          <li><strong className="text-zinc-300">Cone</strong> — Tapered form.</li>
          <li><strong className="text-zinc-300">Triangle Prism</strong> — Three-sided structural gusset or column.</li>
          <li><strong className="text-zinc-300">Hexagon Prism</strong> — Six-sided column.</li>
          <li><strong className="text-zinc-300">Custom Polygon</strong> — Click vertices on the ¼&quot; grid to outline a footprint, close the shape, then set extrusion height. Drag vertex handles to adjust.</li>
        </ul>
        <p className="text-base text-zinc-400 mt-2">
          Rectangle boards still use the <strong className="text-zinc-300">Draw</strong> tool in the Model tab.
        </p>
        <p className="text-base text-zinc-500 mt-2">
          <strong className="text-zinc-400">Ask Pepe:</strong> &quot;How do I add a cylinder?&quot; · &quot;How does custom polygon work?&quot;
        </p>
      </Section>

      <Section search={searchLower} onMatch={registerMatch} title="Assembly Mode">
        <ol className="space-y-1.5 list-decimal pl-4 text-base text-zinc-400">
          <li>Click <strong className="text-zinc-300">Mode</strong> in the top ribbon and choose <strong className="text-zinc-300">Assembly</strong>.</li>
          <li>Boards explode and spread flat on the grid with spacing between them.</li>
          <li>Drag boards together and mate joints one at a time in build order.</li>
          <li>Each mate records a step in the <strong className="text-zinc-300">Assembly Guide</strong> panel.</li>
          <li>Use <strong className="text-zinc-300">Reset Assembly</strong> to re-spread the flat layout.</li>
          <li>Use <strong className="text-zinc-300">Export Assembly Guide</strong> to download a plain-text build checklist.</li>
        </ol>
        <p className="text-base text-zinc-500 mt-2">
          <strong className="text-zinc-400">Ask Pepe:</strong> &quot;What is assembly mode?&quot; · &quot;How do I export an assembly guide?&quot;
        </p>
      </Section>

      <Section search={searchLower} onMatch={registerMatch} title="Display Modes">
        <ol className="space-y-1.5 list-decimal pl-4 text-base text-zinc-400">
          <li>Find the <strong className="text-zinc-300">Display</strong> dropdown in the top ribbon.</li>
          <li>Choose a mode:</li>
        </ol>
        <ul className="space-y-1 list-disc pl-4 text-base text-zinc-400 mt-1">
          <li><strong className="text-zinc-300">Shaded</strong> — Default solid wood appearance with grain texture.</li>
          <li><strong className="text-zinc-300">Wireframe</strong> — Structure outline only, no fill.</li>
          <li><strong className="text-zinc-300">Shaded + Edges</strong> — Solid fill with orange edge lines.</li>
          <li><strong className="text-zinc-300">X-Ray</strong> — Semi-transparent boards so internal joinery and fasteners stay visible.</li>
        </ul>
        <p className="text-base text-zinc-500 mt-2">
          <strong className="text-zinc-400">Ask Pepe:</strong> &quot;How do I see inside my project?&quot; · &quot;What is X-Ray mode?&quot;
        </p>
      </Section>

      <Section search={searchLower} onMatch={registerMatch} title="Hardware Library">
        <ol className="space-y-1.5 list-decimal pl-4 text-base text-zinc-400">
          <li>Open the <strong className="text-zinc-300">Hardware</strong> tab in the right sidebar.</li>
          <li>Browse labeled items with inline previews: drawer slides, hinges, pulls, shelf pins, cam locks, brackets, and barrel bolts.</li>
          <li>Click an item to arm placement mode.</li>
          <li>Click a board face in the viewport to place the hardware at that location.</li>
        </ol>
        <p className="text-base text-zinc-400 mt-2">
          Placed hardware appears in the Hardware list and counts toward estimating.
        </p>
        <p className="text-base text-zinc-500 mt-2">
          <strong className="text-zinc-400">Ask Pepe:</strong> &quot;How do I place a hinge?&quot; · &quot;Where is the hardware library?&quot;
        </p>
      </Section>

      <Section search={searchLower} onMatch={registerMatch} title="Top Ribbon & Right Sidebar">
        <p className="text-base text-zinc-400 mb-2">
          <strong className="text-zinc-300">Top ribbon</strong> — File (save, open, new), View (grid, camera, orthographic), Help, Mode (Design / Assembly),
          Display dropdown (Shaded, Wireframe, Shaded + Edges, X-Ray), and Undo / Redo.
        </p>
        <p className="text-base text-zinc-400">
          <strong className="text-zinc-300">Right sidebar tabs</strong> — Inspector (selected board properties), Estimating (cost ledger),
          Cut List (lumber nesting and fastener counts), Engineering (beam deflection), Hardware (library and placed items), and Tutorial (this guide).
        </p>
        <p className="text-base text-zinc-500 mt-2">
          <strong className="text-zinc-400">Ask Pepe:</strong> &quot;How do I save my project?&quot; · &quot;Where is the cut list?&quot; · &quot;How do I switch to assembly mode?&quot;
        </p>
      </Section>

      <Section search={searchLower} onMatch={registerMatch} title="Right-Click Context Menu">
        <ol className="space-y-1.5 list-decimal pl-4 text-base text-zinc-400">
          <li>Right-click any board (short click, no drag) to open the context menu.</li>
          <li>If you hold right mouse and drag to pan the camera, the menu will <strong className="text-zinc-300">not</strong> appear — it only opens on a short click.</li>
          <li>Right-click empty space for viewport actions.</li>
        </ol>
        <p className="text-base text-zinc-400 mt-2">On a board:</p>
        <ul className="space-y-1 list-disc pl-4 text-base text-zinc-400">
          <li><strong className="text-zinc-300">Delete Member</strong> — Remove the board.</li>
          <li><strong className="text-zinc-300">Duplicate / Copy</strong> — Make a copy offset from the original.</li>
          <li><strong className="text-zinc-300">Mirror</strong> — Mirror across an axis.</li>
          <li><strong className="text-zinc-300">Open Joinery Menu</strong> — Jump to joinery tools for this board.</li>
          <li><strong className="text-zinc-300">Solo</strong> — Hide all other boards to focus on this one. Choose Show All Boards to restore.</li>
        </ul>
        <p className="text-base text-zinc-400 mt-2">On empty space:</p>
        <ul className="space-y-1 list-disc pl-4 text-base text-zinc-400">
          <li><strong className="text-zinc-300">Reset Camera</strong> — Return to the default view.</li>
          <li><strong className="text-zinc-300">Clear Selection</strong> — Deselect all boards.</li>
          <li><strong className="text-zinc-300">Undo Last Action</strong> — Step back one change.</li>
        </ul>
      </Section>

      <Section search={searchLower} onMatch={registerMatch} title="Workbench Quick-Start Blueprint">
        <ol className="space-y-2 list-decimal pl-4 text-zinc-400">
          <li>
            <strong className="text-zinc-300">Top slab</strong> — Draw a 48&quot; × 24&quot; plywood sheet on the grid
            (material: Baltic Birch or CDX Plywood).
          </li>
          <li>
            <strong className="text-zinc-300">Four legs</strong> — Add four 4×4×29&quot; members (nominal 4×4, length 29&quot;).
            Use rotation preset <em>Vertical leg (90° Z)</em> on each leg.
          </li>
          <li>
            <strong className="text-zinc-300">Position legs</strong> — Move each leg to a corner under the top using
            the translate gizmo; use the Mate tool for precise face alignment.
          </li>
          <li>
            <strong className="text-zinc-300">Apron framing</strong> — Add 2×4×18&quot; stretchers between legs.
            Orient on-edge (90° X) and mate faces flush to leg tops.
          </li>
          <li>
            <strong className="text-zinc-300">Joinery</strong> — Mate aprons to legs, then choose Pocket Holes as the join method and place fasteners.
          </li>
          <li>
            <strong className="text-zinc-300">Review</strong> — Check the Estimating tab for cost ledger and
            Cut List for optimized lumber and sheet layouts.
          </li>
        </ol>
      </Section>

      <Section search={searchLower} title="Viewport Navigation" onMatch={registerMatch}>
        <ul className="space-y-1 list-disc pl-4 text-zinc-400">
          <li><strong className="text-zinc-300">Left-click + drag</strong> — Orbit / rotate the camera around the focal point.</li>
          <li><strong className="text-zinc-300">Middle mouse + drag</strong> — Pan across the workbench plane.</li>
          <li><strong className="text-zinc-300">Shift + left-click + drag</strong> — Pan (for trackpads and mice without a wheel button).</li>
          <li><strong className="text-zinc-300">Scroll wheel</strong> — Zoom in and out.</li>
          <li><strong className="text-zinc-300">Right-click + drag</strong> — Also pans the camera.</li>
        </ul>
        <p className="text-base text-zinc-400 mt-2">
          The <strong className="text-zinc-300">Navigation Cube</strong> in the bottom-right corner lets you jump to preset views — see the Navigation Cube section below.
        </p>
      </Section>

      <Section search={searchLower} title="Navigation Cube" onMatch={registerMatch}>
        <p className="text-base text-zinc-400">
          The small cube in the <strong className="text-zinc-300">bottom-right corner</strong> of the viewport shows your current orientation and lets you jump to preset views instantly.
        </p>
        <ul className="space-y-1.5 list-disc pl-4 text-zinc-400 mt-2">
          <li><strong className="text-zinc-300">Click TOP / BOTTOM / FRONT / BACK / LEFT / RIGHT</strong> — Jump to that exact orthographic-style view. Great for checking alignment.</li>
          <li><strong className="text-zinc-300">Click a corner symbol (◤ ◥ ◣ ◢)</strong> — Jump to an isometric 3-quarter view from that corner.</li>
          <li><strong className="text-zinc-300">Home button (below the cube)</strong> — Returns camera to the default perspective starting position.</li>
        </ul>
        <p className="text-base text-zinc-400 mt-2">
          The cube does <em>not</em> replace mouse navigation — you can still orbit with left-click drag at any time.
        </p>
        <p className="text-base text-zinc-500 mt-2">
          <strong className="text-zinc-400">Ask Pepe:</strong> &quot;How do I use the navigation cube?&quot; · &quot;How do I get a top view?&quot; · &quot;How do I reset the camera?&quot;
        </p>
      </Section>

      <Section search={searchLower} title="Snap Points" onMatch={registerMatch}>
        <p className="text-base text-zinc-400">
          When you select a board, small white dots appear at all its <strong className="text-zinc-300">corners and face centers</strong> — these are snap points.
        </p>
        <ul className="space-y-1.5 list-disc pl-4 text-zinc-400 mt-2">
          <li>8 corner dots at each vertex of the board</li>
          <li>6 face-center dots (one per face — top, bottom, front, back, left end, right end)</li>
          <li>1 center dot at the board&apos;s center</li>
        </ul>
        <p className="text-base text-zinc-400 mt-2">
          In <strong className="text-zinc-300">Mate / Join mode (J)</strong>, amber snap dots appear on all boards so you can see possible attachment points clearly. Clicking near a snap point initiates the mate at that exact location for more precise alignment.
        </p>
        <p className="text-base text-zinc-500 mt-2">
          <strong className="text-zinc-400">Ask Pepe:</strong> &quot;What are snap points?&quot; · &quot;How do I align boards precisely?&quot;
        </p>
      </Section>

      <Section search={searchLower} title="Renaming Boards (Label)" onMatch={registerMatch}>
        <p className="text-base text-zinc-400">
          Every board has a <strong className="text-zinc-300">Label</strong> field at the top of the Inspector panel on the right side.
        </p>
        <ul className="space-y-1.5 list-disc pl-4 text-zinc-400 mt-2">
          <li>Select a board, then click the Label field in the Inspector.</li>
          <li>Type your new name — for example &quot;Leg A&quot; or &quot;Top Rail&quot;.</li>
          <li>Press <kbd className="bg-zinc-700 text-zinc-200 px-1 py-0.5 rounded text-sm">Enter</kbd> to confirm, or just click anywhere else.</li>
          <li>You can rename a board even while the move arrows are active — it will not interrupt your transform.</li>
        </ul>
        <p className="text-base text-zinc-500 mt-2">
          <strong className="text-zinc-400">Ask Pepe:</strong> &quot;How do I rename a board?&quot; · &quot;How do I change the board name?&quot;
        </p>
      </Section>

      <Section search={searchLower} onMatch={registerMatch} title="Keyboard Shortcuts & Escape Priority">
        <p className="text-base text-zinc-400 mb-2">
          Press <strong className="text-zinc-300">Escape</strong> repeatedly to step through open UI in this order:
        </p>
        <ol className="space-y-1 list-decimal pl-4 text-base text-zinc-400">
          <li>Close the right-click context menu (if open).</li>
          <li>Exit fastener placement mode.</li>
          <li>Cancel the Draw tool / end a draw chain.</li>
          <li>Close the Quick Dimensions panel.</li>
          <li>Close the radial wheel.</li>
          <li>Deselect all boards.</li>
        </ol>
        <ul className="space-y-1 list-disc pl-4 text-base text-zinc-400 mt-3 font-mono">
          <li><span className="font-sans text-zinc-400">Ctrl+Z</span> — Undo</li>
          <li><span className="font-sans text-zinc-400">Ctrl+Y</span> — Redo</li>
          <li><span className="font-sans text-zinc-400">Right-click</span> — Context menu + radial wheel on boards</li>
        </ul>
      </Section>
    </div>
  );
}

function Section({
  title,
  children,
  search = '',
  onMatch,
}: {
  title: string;
  children: React.ReactNode;
  search?: string;
  onMatch?: () => void;
}) {
  const matches = !search || title.toLowerCase().includes(search);
  if (!matches) return null;
  if (onMatch) onMatch();
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-3 space-y-2">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-500/90">
        <HighlightText text={title} search={search} />
      </h3>
      {children}
    </div>
  );
}
