import type { KnowledgeEntry } from './pepeKnowledge';

export const PEPE_KNOWLEDGE_MASTER_R: KnowledgeEntry[] = [
  // ── DRAW TOOL: DEPTH + CROSS-REFERENCE ──────────────────────────────────
  {
    id: 'mr-draw-common-mistake-short-drag',
    topic: 'Draw tool: why a click sometimes adds no board',
    keywords: ['draw', 'tool', 'click', 'no', 'board', 'short', 'drag', 'threshold'],
    answer: 'The Draw tool requires a real drag, not just a click — if your drag distance is too short, DoveDesign treats it as an accidental click and does not create a board, on purpose, so a shaky click on the grid does not spawn a stray tiny board. If nothing appears after you drag, try a longer, more deliberate drag across the grid.',
  },
  {
    id: 'mr-draw-then-mate',
    topic: 'Draw a board, then mate it — typical workflow',
    keywords: ['draw', 'then', 'mate', 'workflow', 'order', 'next', 'step'],
    answer: 'A typical DoveDesign workflow is: press W to draw a rough board, press S and use Quick Dimensions to set its exact size, then press J to mate it against another board so it snaps into place precisely. Draw gets you a board fast; Mate is what makes it fit exactly — you rarely need to hand-position a board with the move gizmo once mating is involved.',
  },
  {
    id: 'mr-draw-material-picker',
    topic: 'Choosing material/species while drawing a board',
    keywords: ['draw', 'material', 'species', 'picker', 'color', 'choose', 'while'],
    answer: 'The Material Picker lets you choose the wood species (and its color/appearance in the viewport) right from the Draw tool before you place a board, so new boards come in already looking like the lumber you plan to actually use. You can always change a board\'s material later from the Inspector panel if you change your mind.',
  },
  // ── CROSS-CUT / RIP CUT: DEPTH ──────────────────────────────────────────
  {
    id: 'mr-crosscut-vs-ripcut-when',
    topic: 'Cross cut vs rip cut — when to use which in DoveDesign',
    keywords: ['cross', 'cut', 'rip', 'cut', 'difference', 'when', 'use', 'which'],
    answer: 'Use Cross Cut to shorten a board\'s length (cutting across the grain, same as a miter saw or table saw crosscut sled in real life). Use Rip Cut to narrow a board\'s width (cutting with the grain, same as ripping a board down on a table saw with the fence). Picking the wrong one in the app produces a board with the wrong dimension changed, just like picking the wrong real-world cut would.',
  },
  {
    id: 'mr-crosscut-dimension-line-convert',
    topic: 'Turning a dimension line into a cut',
    keywords: ['dimension', 'line', 'convert', 'cut', 'measure', 'then', 'cut'],
    answer: 'After placing a dimension line on a board with the Measure tool, select the line and look for the Convert to Cross Cut or Convert to Rip Cut button in the tool panel — this lets you measure precisely first, then commit that exact measurement as a real cut, instead of retyping the number into a separate cut tool.',
  },
  // ── MEASURE TOOL: DEPTH ──────────────────────────────────────────────────
  {
    id: 'mr-measure-snap-colors',
    topic: 'What the Measure tool cursor colors mean',
    keywords: ['measure', 'cursor', 'color', 'green', 'blue', 'yellow', 'gray', 'snap'],
    answer: 'While placing a dimension line, the cursor color tells you what you are about to snap to: green means you are over a face center, blue means an edge midpoint, bright yellow means a corner, and gray means free placement with no snap. Watching the color before you click helps you place precise, repeatable dimension lines instead of guessing.',
  },
  {
    id: 'mr-measure-cross-axis-fixed',
    topic: 'Measuring a board\'s width (not just its length)',
    keywords: ['measure', 'width', 'cross', 'axis', 'narrow', 'side', 'dimension'],
    answer: 'Dimension lines placed across a board\'s width snap and follow the board correctly, the same as length-wise measurements. The measure cursor snaps anywhere along a board\'s edges — watch for the blue (edge) or yellow (corner) cursor color, then click.',
  },
  // ── CENTERLINE TOOL: DEPTH ───────────────────────────────────────────────
  {
    id: 'mr-centerline-why-use',
    topic: 'Why use the Centerline tool instead of just eyeballing center',
    keywords: ['centerline', 'why', 'use', 'eyeball', 'center', 'accurate'],
    answer: 'The Centerline tool marks the exact mathematical center of a board face along a chosen axis, which is useful for laying out screw lines, shelf-pin rows, or symmetrical joinery — eyeballing center by hand risks being slightly off, which becomes obvious once hardware is installed. Press C, click a face, and the marker updates automatically if the board is later resized.',
  },
  {
    id: 'mr-centerline-real-world-mapping',
    topic: 'How the Centerline tool maps to a real shop marking gauge',
    keywords: ['centerline', 'real', 'world', 'marking', 'gauge', 'shop', 'equivalent'],
    answer: 'The Centerline tool is the digital equivalent of using a marking gauge or a simple find-the-center trick (like a folded story stick) at the workbench — it tells you exactly where to strike a real line on your actual lumber before drilling or cutting, so the model and the real board end up marked the same way.',
  },
  // ── MATE / JOIN TOOL: DEPTH ───────────────────────────────────────────────
  {
    id: 'mr-mate-real-world-clamping',
    topic: 'Why the Mate tool works like clamping two boards together',
    keywords: ['mate', 'clamp', 'real', 'world', 'analogy', 'why', 'works'],
    answer: 'The Mate tool works like clamping two boards face-to-face before fastening in a real shop — you bring two faces together and hold them flush while you decide how to actually join them. The app does the math to make the fit exact (faces perfectly flush, aligned edges) so you are not fighting a slightly-off glue-up the way you might in real life.',
  },
  {
    id: 'mr-mate-then-fastener',
    topic: 'After mating, use the Fastener tool to add real hardware',
    keywords: ['mate', 'then', 'fastener', 'screw', 'dowel', 'after', 'joint'],
    answer: 'After mating two boards together, use the Fastener tool to place a real screw, dowel, or pocket-hole icon at the joint — the fastener icon follows the joint automatically as the boards move, since it is anchored to the same face-relative data as the mate itself. This mirrors real construction: first you position and clamp the parts (mate), then you actually fasten them (screws, glue, dowels).',
  },
  {
    id: 'mr-mate-join-method-choice',
    topic: 'Choosing a join method after mating',
    keywords: ['mate', 'join', 'method', 'screws', 'glue', 'pocket', 'holes', 'choose'],
    answer: 'Once two boards are mated, a join-method sub-wheel opens letting you record how you actually plan to fasten them in real life — screws, glue, pocket holes, dowels, and more. This is separate from the geometric mate itself; it is bookkeeping that feeds your Bill of Materials (BOM) and Estimating panel with the right fastener counts and costs.',
  },
  {
    id: 'mr-mate-group-moves-together',
    topic: 'Mated boards move as one group',
    keywords: ['mate', 'group', 'move', 'together', 'drag', 'chain'],
    answer: 'Once boards are mated, dragging or rotating any one of them moves the whole connected group together in real time, the same way a fully assembled piece of furniture moves as one unit rather than as loose parts. This works through a constraint solver — each board\'s position is recalculated fresh from the mate relationships every time anything in the chain moves, not copied once and left stale.',
  },
  // ── UNMATE: DEPTH ──────────────────────────────────────────────────────
  {
    id: 'mr-unmate-vs-delete',
    topic: 'Unmate vs delete — what is the difference',
    keywords: ['unmate', 'delete', 'difference', 'separate', 'remove', 'board'],
    answer: 'Unmate separates a board from its mated group without removing the board itself — it stays exactly where it was, just no longer linked to move with the others. Delete removes the board entirely from the project. Use Unmate when you want to detach and reposition a board independently; use Delete only when you actually want the board gone.',
  },
  {
    id: 'mr-unmate-fastener-cleanup',
    topic: 'What happens to fasteners and join markers after Unmate',
    keywords: ['unmate', 'fastener', 'cleanup', 'marker', 'ghost', 'leftover'],
    answer: 'Unmating a board also removes the join-method marker and any placed fastener icons tied to that specific connection, so you do not end up with a screw icon or purple join marker floating at a now-broken joint.',
  },
  // ── SNAP POINTS: DEPTH ─────────────────────────────────────────────────
  {
    id: 'mr-snap-points-what-they-are',
    topic: 'What the white snap dots on a board are for',
    keywords: ['snap', 'points', 'white', 'dots', 'what', 'are', 'mate', 'start'],
    answer: 'The small white dots that appear on a board\'s faces are snap points — they mark the face centers you can click on to start or complete a mate connection with the Mate tool. They are recalculated fresh from the board\'s current position and rotation every frame, so they always sit exactly where the face actually is, even right after a move or rotate.',
  },
  {
    id: 'mr-snap-points-mate-tool',
    topic: 'How snap points relate to the Mate tool',
    keywords: ['snap', 'points', 'mate', 'tool', 'relate', 'how', 'use'],
    answer: 'Snap points are the visual targets you click when using the Mate tool — clicking one commits that face as the mate anchor. They always track the board precisely, including after cuts: a ripped board\'s dots sit on the wood that actually remains, not where the waste used to be.',
  },
  // ── JOINERY VISUALIZATION & FASTENER PLACEMENT: DEPTH ────────────────────
  {
    id: 'mr-joinery-visualization-what',
    topic: 'What Joinery Visualization shows you',
    keywords: ['joinery', 'visualization', 'show', 'preview', 'what', 'cut'],
    answer: 'Joinery Visualization renders a preview of joinery cuts (like dados, rabbets, and dovetail-style notches) directly on the board in the viewport, so you can see roughly how the joint will look before committing to the cut. It is a visual planning aid layered on top of the board\'s geometry — the underlying board dimensions are the real source of truth.',
  },
  {
    id: 'mr-fastener-placement-followed',
    topic: 'Why fastener icons follow the board automatically',
    keywords: ['fastener', 'icon', 'follow', 'automatically', 'move', 'board'],
    answer: 'A placed fastener (screw, dowel, nail icon) stores its position relative to the face it is attached to, not as a raw world-space coordinate — so when the board moves or rotates, the fastener icon is recalculated fresh from the board\'s current transform and always stays exactly where you put it relative to the board, instead of being left behind.',
  },
  // ── SAVE/LOAD & UNDO/REDO: DEPTH ─────────────────────────────────────────
  {
    id: 'mr-save-blank-start',
    topic: 'Why DoveDesign opens to a blank project instead of restoring your last session',
    keywords: ['blank', 'start', 'open', 'restore', 'session', 'why', 'startup'],
    answer: 'DoveDesign always opens to a blank project rather than automatically reloading your last session — this is deliberate, because auto-restoring felt confusing (users expected a fresh start). Your work is still backed up quietly in the background in case of a crash; look for the recovery banner at the top of the screen if it detects unsaved work from a previous session.',
  },
  {
    id: 'mr-recovery-banner',
    topic: 'What the recovery banner is for',
    keywords: ['recovery', 'banner', 'unsaved', 'work', 'found', 'crash', 'restore'],
    answer: 'If DoveDesign closed unexpectedly (browser crash, accidental tab close) while you had unsaved work, a dismissible banner appears offering to recover it from a background auto-save. This is separate from normal saving — it is a safety net, not a replacement for regularly pressing Ctrl+S to save a real .wcad file.',
  },
  {
    id: 'mr-save-name-prompt',
    topic: 'Why Ctrl+S asks for a project name the first time',
    keywords: ['save', 'name', 'prompt', 'first', 'time', 'ctrl+s', 'untitled'],
    answer: 'The first time you save a new, still-"Untitled Project," Ctrl+S opens a small prompt asking for a project name before downloading the .wcad file, so your saved files are not all named "Untitled Project." After that first save, Ctrl+S saves silently under the name you chose.',
  },
  {
    id: 'mr-recent-projects',
    topic: 'Recent Projects list in the File menu',
    keywords: ['recent', 'projects', 'file', 'menu', 'list', 'reopen'],
    answer: 'The File menu keeps a list of your last 3 saved or opened projects by name. Clicking one opens the normal file picker (browsers do not allow web apps to silently reopen a previously downloaded file by name alone), so you will still need to browse to the .wcad file — but the list reminds you what you recently worked on and its file name.',
  },
  {
    id: 'mr-unsaved-changes-guard',
    topic: 'The warning when closing the tab with unsaved work',
    keywords: ['unsaved', 'changes', 'warning', 'close', 'tab', 'leave', 'page'],
    answer: 'If your project has any boards in it, closing or navigating away from the tab triggers the browser\'s native "leave site?" warning, so you get a chance to save first. This check is independent of the auto-save/recovery system — it is purely about preventing an accidental close from losing work you have not saved to a file yet.',
  },
  {
    id: 'mr-undo-redo-scope',
    topic: 'What undo/redo covers in DoveDesign',
    keywords: ['undo', 'redo', 'scope', 'covers', 'history', 'what'],
    answer: 'Ctrl+Z / Ctrl+Y undo and redo essentially every project-changing action — adding, moving, cutting, mating, unmating, and deleting boards, plus dimension line and centerline edits. It does not undo UI-only state like which panel tab is open or camera position, since those are not part of the actual project data.',
  },
  // ── BOM, FINISHING PLANNER, TEMPLATES, CUT OPTIMIZER: DEPTH ─────────────
  {
    id: 'mr-bom-what-feeds-it',
    topic: 'What feeds the Bill of Materials',
    keywords: ['bill', 'of', 'materials', 'bom', 'feeds', 'what', 'source'],
    answer: 'The Bill of Materials is generated directly from your actual project data — every board\'s dimensions and species, plus any fasteners and hardware you have placed — so it always reflects your current model rather than something you have to manually keep in sync. Press B to open it any time.',
  },
  {
    id: 'mr-finishing-planner-purpose',
    topic: 'What the Finishing Planner is for',
    keywords: ['finishing', 'planner', 'purpose', 'what', 'stain', 'paint', 'coat'],
    answer: 'The Finishing Planner (press F) lets you record which finish (stain, paint, clear coat, oil) you plan to use on each board or the whole project, mainly for planning and material estimating purposes rather than changing the rendered appearance dramatically. It helps you keep track of finishing decisions across a multi-board project so you are not guessing later which parts still need a coat.',
  },
  {
    id: 'mr-templates-purpose',
    topic: 'What Project Templates are for',
    keywords: ['templates', 'project', 'purpose', 'starter', 'preset'],
    answer: 'Project Templates give you a starting point for common project types (like a basic shelf or table frame) instead of drawing every board from scratch. Loading a template creates real, editable boards you can then resize, mate, and modify just like anything you drew yourself — it is a starting point, not a locked layout.',
  },
  {
    id: 'mr-cut-optimizer-purpose',
    topic: 'What the Cut Optimizer actually solves for',
    keywords: ['cut', 'optimizer', 'purpose', 'solve', 'minimize', 'waste'],
    answer: 'The Cut Optimizer takes your project\'s full list of board parts and figures out how to lay them out across standard lumber lengths (or plywood sheets in Sheet mode) to minimize waste, accounting for saw kerf between cuts. It is the digital equivalent of planning your cut list on paper before heading to the shop, so you buy the right amount of material and get the most usable parts out of each board or sheet.',
  },
  // ── DISPLAY MODES, ASSEMBLY, HARDWARE LIBRARY: DEPTH ────────────────────
  {
    id: 'mr-display-modes-when-use',
    topic: 'When to use Wireframe or X-Ray display mode',
    keywords: ['display', 'mode', 'wireframe', 'x-ray', 'when', 'use', 'shaded'],
    answer: 'Shaded (the default) is best for normal modeling and getting a realistic sense of the finished piece. Wireframe helps you see through overlapping boards to check alignment or spot boards hidden behind others. X-Ray is useful when you need to click or select a board that is completely obscured by another board in front of it, without having to move anything first.',
  },
  {
    id: 'mr-assembly-mode-purpose',
    topic: 'What Assembly Mode is for',
    keywords: ['assembly', 'mode', 'purpose', 'steps', 'sequence', 'build', 'order'],
    answer: 'Assembly Mode walks through your project as a sequence of build steps, generated from the order you mated boards together — useful for reviewing or sharing a logical build order for a piece before you actually start cutting and assembling in the shop. It reflects the mate history rather than requiring you to manually write out steps.',
  },
  {
    id: 'mr-hardware-library-purpose',
    topic: 'What the Hardware Library is for',
    keywords: ['hardware', 'library', 'purpose', 'hinges', 'slides', 'place'],
    answer: 'The Hardware Library lets you place real hardware items (hinges, drawer slides, handles, brackets) onto your model, which then show up in your Bill of Materials for shopping and cost estimating. Placed hardware is a real project object, not just a decal — it can be selected, repositioned, and removed like any other placed item.',
  },
  // ── MODELING-TO-SHOP BEST PRACTICE (CATEGORY C) ─────────────────────────
  {
    id: 'mr-model-vs-real-lumber',
    topic: 'Measure your actual lumber before finalizing the model',
    keywords: ['measure', 'actual', 'lumber', 'before', 'model', 'best', 'practice'],
    answer: 'Because dimensional lumber is sold undersized from its nominal name (a "2x4" is really about 1.5" x 3.5"), it is good practice to measure your actual lumber with a tape measure or calipers and use those real numbers in DoveDesign\'s Quick Dimensions, rather than trusting the nominal size. This keeps your model matching what will actually show up at your workbench.',
  },
  {
    id: 'mr-model-kerf-in-real-cuts',
    topic: 'Remember kerf when translating a model measurement into a real cut',
    keywords: ['kerf', 'real', 'cut', 'model', 'measurement', 'translate', 'best', 'practice'],
    answer: 'A dimension line or cut length in DoveDesign describes the finished part size, but your actual saw blade removes material (kerf) with every cut — when cutting several parts from one real board, add a small kerf allowance between each planned cut length so your last piece does not come up short, the same way the app\'s Cut Optimizer already accounts for kerf internally.',
  },
  {
    id: 'mr-model-hardware-clearance',
    topic: 'Double-check hardware clearances before cutting real parts',
    keywords: ['hardware', 'clearance', 'check', 'before', 'cutting', 'real', 'parts'],
    answer: 'Before committing to real cuts, it is worth double-checking that placed hardware (hinges, slides, handles) actually has room to operate — a drawer slide needs clearance to extend, a hinge needs clearance to swing. DoveDesign shows placed hardware in the model, but it is still the woodworker\'s job to sanity-check real-world clearance the same as with any CAD tool, since the app does not simulate hardware motion.',
  },
];
