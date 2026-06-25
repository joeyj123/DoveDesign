import { PEPE_KNOWLEDGE_BOOKS } from './pepeKnowledgeBooks';
import { PEPE_KNOWLEDGE_EXPANDED } from './pepeKnowledgeExpanded';
import { PEPE_KNOWLEDGE_MASTER_A } from './pepeKnowledgeMasterA';
import { PEPE_KNOWLEDGE_MASTER_B } from './pepeKnowledgeMasterB';
import { PEPE_KNOWLEDGE_MASTER_C } from './pepeKnowledgeMasterC';
import { PEPE_KNOWLEDGE_MASTER_D } from './pepeKnowledgeMasterD';
import { PEPE_KNOWLEDGE_MASTER_E } from './pepeKnowledgeMasterE';
import { PEPE_KNOWLEDGE_MASTER_F } from './pepeKnowledgeMasterF';
import { PEPE_KNOWLEDGE_MASTER_G } from './pepeKnowledgeMasterG';
import { PEPE_KNOWLEDGE_MASTER_H } from './pepeKnowledgeMasterH';
import { PEPE_KNOWLEDGE_MASTER_I } from './pepeKnowledgeMasterI';
import { PEPE_KNOWLEDGE_MASTER_J } from './pepeKnowledgeMasterJ';
import { PEPE_KNOWLEDGE_MASTER_K } from './pepeKnowledgeMasterK';
import { PEPE_KNOWLEDGE_MASTER_L } from './pepeKnowledgeMasterL';
import { PEPE_KNOWLEDGE_MASTER_M } from './pepeKnowledgeMasterM';
import { PEPE_KNOWLEDGE_MASTER_N } from './pepeKnowledgeMasterN';

export interface KnowledgeEntry {
  id: string;
  keywords: string[];
  topic: string;
  answer: string;
}

const PEPE_KNOWLEDGE_APP: KnowledgeEntry[] = [
  {
    id: 'keyboard-shortcuts',
    topic: 'Keyboard shortcuts',
    keywords: ['keyboard', 'shortcut', 'hotkey', 'key', 'shortcuts', 'ctrl', 'escape', 'delete', 'undo', 'redo', 'space'],
    answer:
      'DoveDesign shortcuts: Space = open radial wheel, Escape = cancel/deselect, S = select tool, B = draw board, C = cross cut, M = move (shows transform arrows), Tab = cycle Move/Rotate/Scale, R = rip cut, J = mate/join boards, F = flip board (toggle), D = duplicate, G = toggle grid, U = unmate most recent connection, Delete = delete board, Ctrl+Z = undo, Ctrl+Y = redo, Shift+drag = box select.',
  },
  {
    id: 'how-move-board',
    topic: 'How to move a board',
    keywords: ['move', 'drag', 'reposition', 'translate', 'arrow', 'gizmo', 'transform', 'how do i move'],
    answer:
      'Click the board to select it (it glows amber), then press M to activate the move arrows, or press Space to open the radial wheel and choose Move. Drag the colored arrows to move along that axis.',
  },
  {
    id: 'how-open-radial-wheel',
    topic: 'How to open the radial wheel',
    keywords: ['radial', 'wheel', 'open', 'menu', 'circular', 'tool wheel', 'how do i open'],
    answer:
      'Click any board to select it, then press Space to open the radial wheel at your cursor. Press Space again or Escape to close it.',
  },
  {
    id: 'how-delete-board',
    topic: 'How to delete a board',
    keywords: ['delete', 'remove', 'erase', 'get rid of', 'trash', 'board'],
    answer:
      'Click the board to select it, then press the Delete key. Or press Space to open the radial wheel and choose Delete.',
  },
  {
    id: 'how-undo',
    topic: 'How to undo',
    keywords: ['undo', 'redo', 'ctrl z', 'ctrl y', 'revert', 'back', 'history'],
    answer:
      'Press Ctrl+Z to undo your last action. Press Ctrl+Y or Ctrl+Shift+Z to redo.',
  },
  {
    id: 'how-duplicate-board',
    topic: 'How to duplicate a board',
    keywords: ['duplicate', 'copy', 'clone', 'repeat', 'board'],
    answer:
      'Select a board by clicking it, then press D to duplicate it. The copy appears offset slightly from the original.',
  },
  {
    id: 'how-attach-boards',
    topic: 'How to attach two boards together',
    keywords: ['attach', 'join', 'connect', 'mate', 'snap', 'together', 'face', 'j shortcut'],
    answer:
      'Press J to activate the Mate tool, then click a face on the first board (other boards glow blue). Then click any face on the second board — it snaps flush to the first automatically. Then choose a join method like Screws or Glue.',
  },
  {
    id: 'mate-not-working',
    topic: 'Mate tool not working or boards not snapping',
    keywords: ['mate', 'not working', 'wont snap', 'attach fail', 'boards wont connect', 'join broken'],
    answer:
      'Make sure you click two DIFFERENT boards. Click a face on board A first (other boards turn blue), then click any face on board B. They snap together. Press J to start the Mate tool.',
  },
  {
    id: 'how-control-attach-offset',
    topic: 'How to control where boards attach',
    keywords: ['attach', 'offset', 'where', 'edge', 'center', 'mate offset', 'joint position', 'control where'],
    answer:
      'When using the Mate tool (J), click near the edge of a face to attach there, or near the center to attach at the center. The grid on the face helps you pick exactly where the joint sits.',
  },
  {
    id: 'how-crosscut',
    topic: 'How to cross cut a board',
    keywords: ['crosscut', 'cross cut', 'chop', 'c key', 'cut shortcut', 'cut length'],
    answer:
      'Select the board, press C to activate the Cross Cut tool, then set the cut position in the Inspector panel on the right.',
  },
  {
    id: 'tab-cycle-transform',
    topic: 'Tab key cycles Move Rotate Scale',
    keywords: ['tab', 'cycle', 'transform mode', 'rotate mode', 'scale mode', 'switch mode'],
    answer:
      'When move arrows are active (press M first), pressing Tab cycles between Move, Rotate, and Scale transform modes.',
  },
  {
    id: 'how-cycle-transform',
    topic: 'How to cycle between move rotate and scale',
    keywords: ['cycle', 'between', 'move rotate scale', 'transform modes', 'how do i switch'],
    answer:
      'First press M to activate move arrows, then press Tab to cycle through Move, Rotate, and Scale modes.',
  },
  {
    id: 'flip-toggle',
    topic: 'How to flip a board back',
    keywords: ['flip back', 'undo flip', 'toggle flip', 'f key flip'],
    answer:
      'Press F again to flip it back. F toggles between normal and flipped — it won\'t keep spinning.',
  },
  {
    id: 'how-flip-board',
    topic: 'How to flip a board',
    keywords: ['flip', 'rotate 180', 'turn around', 'f key', 'mirror', 'reverse'],
    answer:
      'Select the board and press F to flip it 180 degrees. Or press Space to open the radial wheel and choose Flip.',
  },
  {
    id: 'j-shortcut',
    topic: 'J keyboard shortcut for Mate tool',
    keywords: ['j', 'shortcut', 'mate', 'join', 'keyboard'],
    answer:
      'Press J to activate the Mate tool — this is the standard CAD shortcut for joining parts. Click face A on one board, then face B on another board to snap them together.',
  },
  {
    id: 'left-tool-panel',
    topic: 'Left tool panel tabs',
    keywords: [
      'left', 'panel', 'tool', 'tab', 'model', 'modify', 'joinery', 'shapes',
      'ribbon', 'dock', 'sidebar', 'collapse', 'expand',
    ],
    answer:
      'The left tool panel has four tabs: Model (Select, Draw, Add), Modify (Cross Cut, Rip Cut, Miter, Trim, Join), Joinery (Mate, Edge Treatment, Attach Point), and Shapes (Cylinder, Sphere, Cone, Triangle, Hexagon, Custom Polygon). Click the « / » button at the top to collapse the panel to a narrow strip with abbreviated tab labels, or expand it for full tool names. Pepe the frog sits at the bottom of this panel.',
  },
  {
    id: 'draw-board',
    topic: 'How to draw or place a board',
    keywords: ['draw', 'place', 'board', 'footprint', 'extrude', 'grid', 'sketch', 'rectangle'],
    answer:
      'Open the Model tab on the left panel and click Draw. Click and drag on the grid to sketch a rectangle footprint — that becomes your board length and width. Release to create the board. Keep Draw active to chain the next board edge-to-edge (see Continuous Drawing). You can also click Add to place a board and type exact dimensions in the Inspector tab on the right.',
  },
  {
    id: 'select-move',
    topic: 'Select, move, rotate, and scale',
    keywords: ['select', 'move', 'rotate', 'scale', 'gizmo', 'transform', 'click', 'pick'],
    answer:
      'Choose Select from the Model tab. Left-click any board to select it and open the radial wheel. Use the Move, Rotate, or Scale buttons in the Inspector to change the gizmo mode. Drag the colored arrows or rings to transform. Angle snap gives you 15°, 45°, or 90° rotation steps. Click empty space to deselect, or press Escape after closing the radial wheel.',
  },
  {
    id: 'quick-dimensions',
    topic: 'Quick Dimensions floating panel',
    keywords: [
      'quick', 'dimensions', 'floating', 'length', 'width', 'height', 'size',
      'dims', 'edit', 'panel', 'what is',
    ],
    answer:
      'The Quick Dimensions panel is a floating editor that shows L (length), W (width), and H (thickness) in actual inches. Select a board, then click the Dims segment on the radial wheel to open it. Type new values and they apply live in the viewport. Nominal size (like 2×4) shows when your board matches a standard size. Undo history records when you tab out of a field or deselect. Press Escape to close the panel.',
  },
  {
    id: 'mate-tool',
    topic: 'Using the Mate tool',
    keywords: [
      'mate', 'face', 'flush', 'align', 'snap', 'join', 'connect', 'how',
      'pick', 'board', 'two', 'members', 'together', 'attach', 'boards',
      'fasten', 'link', 'couple', 'affix',
    ],
    answer:
      'Open the Joinery tab and click Mate, or click Mate on the radial wheel. Step 1: click a face on the first board — it highlights. Step 2: optionally click a point on the ¼" face grid to set the joint origin. Step 3: click a face on a different board — the second board snaps flush and a mate record is created. After mating, the join method sub-wheel opens so you can pick screws, glue, pocket holes, and more.',
  },
  {
    id: 'face-grid',
    topic: 'Face grid overlay and quarter-inch snap',
    keywords: [
      'grid', 'snap', 'quarter', 'face', 'overlay', 'attach', 'inch',
      'yellow', 'marker', 'origin', 'offset', 'what is',
    ],
    answer:
      'The face grid is a yellow ¼" snap overlay that appears when you hover a board face with the Mate tool active. Click any grid intersection to set where the joint origin sits on that face — an amber sphere marks your choice. This lets you offset a joint from the face center, which is handy for aligning screw lines or shelf pin rows.',
  },
  {
    id: 'attachment-points',
    topic: 'Placing and naming attachment points',
    keywords: [
      'attachment', 'point', 'name', 'connect', 'cyan', 'double click',
      'double-click', 'place', 'what is',
    ],
    answer:
      'Attachment points are named connection markers on board faces. With the Mate tool active, double-click a face to drop a point — it appears as a labeled cyan marker. Double-click a second point on another board to connect them; the second board moves so the two points meet. You can also use Attach Point from the Joinery tab. Points are useful for precise point-to-point alignment beyond simple face mating.',
  },
  {
    id: 'attachment-drag',
    topic: 'Dragging attachment points on a face',
    keywords: [
      'drag', 'move', 'reposition', 'attachment', 'point', 'slide',
      'dashed', 'line', 'connected', 'handle',
    ],
    answer:
      'Click and drag any attachment point to slide it along its face. The point stays on the face plane and snaps to the ¼" grid. When two points are connected, a dashed line shows the link between them. Dragging updates the connection live so you can fine-tune alignment without re-mating the boards.',
  },
  {
    id: 'radial-wheel',
    topic: 'Radial orbital selector wheel',
    keywords: [
      'radial', 'wheel', 'orbital', 'selector', 'menu', 'open', 'click',
      'right click', 'right-click', 'segments', 'how', 'what is',
    ],
    answer:
      'The radial wheel is a circular action menu with five segments: Dims, Mate, Edge, Flip, and Delete. With the Select tool active, left-click any board to open it — every time, reliably. Right-click any board with any tool active to open it too. The wheel positions itself offset from your click, away from the screen center, so it does not cover the board under your cursor. Clicking the same board again keeps the wheel open. Close it with Escape, by clicking empty space, or by choosing a segment action.',
  },
  {
    id: 'radial-flip',
    topic: 'Flip board on the radial wheel',
    keywords: ['flip', 'rotate', '180', 'longest', 'axis', 'mirror', 'turn', 'over'],
    answer:
      'Click the Flip segment on the radial wheel to rotate the selected board 180° around its longest axis. This is a quick way to turn a board over or reverse its orientation without using the rotation gizmo. The wheel stays open after flipping so you can take another action.',
  },
  {
    id: 'radial-delete',
    topic: 'Deleting a board from the radial wheel',
    keywords: ['delete', 'remove', 'board', 'radial', 'wheel', 'confirm', 'trash'],
    answer:
      'Click the Delete segment on the radial wheel once to arm deletion — the segment turns red and shows "Confirm?". Click Delete again within a few seconds to permanently remove the board. If you wait too long, the confirmation resets and you must click Delete twice again. You can also delete from the right-click context menu.',
  },
  {
    id: 'join-subwheel',
    topic: 'Join method sub-wheel',
    keywords: [
      'join', 'method', 'screws', 'nails', 'glue', 'dowel', 'biscuit',
      'pocket', 'bracket', 'hardware', 'mortise', 'tenon', 'sub', 'wheel',
      'what is', 'how', 'connect', 'attach', 'members', 'together', 'boards',
      'fasten', 'link', 'two',
    ],
    answer:
      'After you mate two boards, the join method sub-wheel opens automatically. You can also right-click an existing mate marker in the viewport to reopen it. Choose from Screws, Nails, Glue, Pocket Holes, Biscuit, Dowel, Bracket / Hardware, or Mortise & Tenon. Glue and Mortise & Tenon skip fastener placement. All other methods enter placement mode so you can click joint faces on the ¼" grid to place 3D fastener meshes.',
  },
  {
    id: 'fasteners',
    topic: 'Placing physical fasteners',
    keywords: [
      'fastener', 'screw', 'nail', 'place', 'joint', 'hardware', '3d',
      'mesh', 'placement', 'done', 'grid', 'how', 'what is',
    ],
    answer:
      'After choosing a join method that needs fasteners (Screws, Nails, Pocket Holes, Biscuit, Dowel, or Bracket), you enter Fastener Placement Mode. The joint face shows a ¼" snap grid. Click intersections to place 3D fastener meshes. Click Done Placing in the viewport bar or press Escape when finished. Click an existing fastener to inspect or remove it. Fastener counts appear in the Cut List tab.',
  },
  {
    id: 'continuous-draw',
    topic: 'Chaining boards while drawing',
    keywords: [
      'chain', 'continuous', 'draw', 'edge', 'snap', 'connect', 'amber',
      'dot', 'escape', 'end', 'how',
    ],
    answer:
      'Keep the Draw tool active after placing a board. The next stroke snaps its start to the nearest corner or edge of the last board — look for the amber dot. Dashed amber lines show join candidates between chained boards. Press Escape or switch to another tool to end the chain. This is great for sketching frames and runouts quickly without placing each board separately.',
  },
  {
    id: 'box-select',
    topic: 'Multi-select with drag box',
    keywords: [
      'select', 'multiple', 'rubber', 'band', 'box', 'shift', 'drag',
      'rectangle', 'dashed', 'how', 'what is',
    ],
    answer:
      'With the Select tool active, click and drag on empty viewport space to draw a dashed amber selection rectangle. Release to select every board whose outline intersects the box. Hold Shift while dragging to add to the current selection instead of replacing it. When two or more boards are selected, the Multi-Member Quick Join toolbar appears above the selection.',
  },
  {
    id: 'quick-join',
    topic: 'Multi-member quick join toolbar',
    keywords: [
      'join', 'auto', 'detect', 'miter', 'butt', 'lap', 'multi',
      'toolbar', 'several', 'multiple', 'how', 'what is',
      'connect', 'attach', 'members', 'together', 'boards', 'two',
    ],
    answer:
      'Select two or more boards using drag box or Shift+click. A toolbar appears above the selection with: Auto-Detect Joints (finds flush faces within 0.1" and creates mates), Miter (adds 45° cuts), Butt Joint (face-to-face mate), Lap Joint (overlapping preset), and Open Radial Wheel (assign join methods on the primary selection). Use Auto-Detect first, then pick join methods from the sub-wheel.',
  },
  {
    id: 'pepe-assistant',
    topic: 'Pepe the frog design assistant',
    keywords: [
      'pepe', 'assistant', 'help', 'frog', 'suggestions', 'ask',
      'workshop', 'offline', 'what is', 'where', 'how',
    ],
    answer:
      'Pepe is your offline design assistant — a friendly frog at the bottom of the left tool panel. Click him to open Pepe\'s Workshop. Two tabs: Suggestions runs live rule-based analysis on your project (span warnings, missing prices, overlaps, unset join methods) — click a suggestion to highlight boards. Ask Pepe lets you type any woodworking or app question; fuzzy search matches your words to Pepe\'s built-in knowledge. No internet required.',
  },
  {
    id: 'pepe-location',
    topic: 'Where to find Pepe',
    keywords: ['pepe', 'assistant', 'help', 'sidebar', 'frog', 'left', 'panel', 'bottom', 'where'],
    answer:
      'Pepe lives at the bottom of the left tool panel, below the tool buttons. Click the green frog mascot to open his panel. Use the Suggestions tab for live project tips or Ask Pepe to search woodworking and app help. He works fully offline.',
  },
  {
    id: 'edge-treatments',
    topic: 'Edge treatments — chamfer, fillet, and more',
    keywords: [
      'edge', 'chamfer', 'fillet', 'round', 'rabbet', 'ogee', 'cove',
      'beading', 'roundover', 'treatment', 'how', 'what is',
    ],
    answer:
      'Select a board and click Edge on the radial wheel, or choose Edge Treatment from the Joinery tab. Hover board edges — they highlight amber. Click an edge, then pick a treatment type in the Inspector: chamfer, fillet (round-over), cove, ogee, rabbet, or beading. Set depth or radius and click Apply. Use "Apply to all parallel edges" for uniform profiles. Edge treatments appear in the Cut List tab.',
  },
  {
    id: 'complex-shapes',
    topic: 'Complex shapes and primitives',
    keywords: [
      'shape', 'cylinder', 'sphere', 'cone', 'hexagon', 'polygon',
      'primitive', 'triangle', 'prism', 'custom', 'vertex', 'how', 'what is',
    ],
    answer:
      'Open the Shapes tab in the left panel. Click Cylinder, Sphere, Cone, Triangle Prism, or Hexagon Prism to add a primitive board. For Custom Polygon, activate the tool and click vertices on the ¼" grid to outline a footprint, close by clicking near the first point, then set extrusion height. Drag vertex handles to adjust the outline. Rectangle boards still use the Draw tool in the Model tab.',
  },
  {
    id: 'assembly-mode',
    topic: 'Assembly mode',
    keywords: [
      'assembly', 'explode', 'build', 'sequence', 'guide', 'mode',
      'reset', 'export', 'flat', 'how', 'what is',
    ],
    answer:
      'Click Mode in the top ribbon and choose Assembly. Boards explode and spread flat on the grid with spacing. Drag them together and mate joints one at a time in build order — each mate records a step in the Assembly Guide panel. Reset Assembly re-spreads the flat layout. Export Assembly Guide downloads a plain-text build checklist you can print for the shop floor.',
  },
  {
    id: 'display-modes',
    topic: 'Display modes — wireframe, x-ray, edges',
    keywords: [
      'display', 'wireframe', 'xray', 'x-ray', 'shaded', 'edges',
      'transparent', 'view', 'mode', 'how', 'what is',
    ],
    answer:
      'Use the Display dropdown in the top ribbon. Shaded is the default with wood grain texture. Wireframe shows structure outlines only. Shaded + Edges adds orange edge lines on solid boards. X-Ray makes boards semi-transparent so internal joinery, fasteners, and hardware inside stay visible — handy for checking pocket holes and dowels.',
  },
  {
    id: 'hardware-library',
    topic: 'Hardware library',
    keywords: [
      'hardware', 'hinge', 'slide', 'pull', 'bracket', 'shelf pin',
      'cam lock', 'barrel bolt', 'drawer', 'library', 'place', 'how', 'what is',
    ],
    answer:
      'Open the Hardware tab in the right sidebar. Browse drawer slides, hinges, pulls, shelf pins, cam locks, brackets, and barrel bolts — each item has a labeled preview. Click an item to arm placement mode, then click a board face in the viewport to place it. Placed hardware appears in the Hardware list and counts toward estimating.',
  },
  {
    id: 'context-menu',
    topic: 'Right-click context menu',
    keywords: [
      'right click', 'right-click', 'context', 'menu', 'duplicate', 'copy',
      'mirror', 'solo', 'isolate', 'undo', 'camera', 'clear', 'selection',
    ],
    answer:
      'Right-click any board to open the context menu and the radial wheel together. On a board: Delete Member, Duplicate, Copy, Mirror, Open Joinery Menu, and Solo (hide all other boards). Right-click empty space for Reset Camera, Clear Selection, and Undo Last Action. Choose Show All Boards to exit Solo mode.',
  },
  {
    id: 'escape-priority',
    topic: 'Escape key priority',
    keywords: [
      'escape', 'esc', 'cancel', 'close', 'priority', 'order', 'dismiss',
      'keyboard', 'shortcut',
    ],
    answer:
      'Press Escape repeatedly to step through open UI in order: close the context menu, exit fastener placement mode, cancel the Draw tool / end a draw chain, close Quick Dimensions, close the radial wheel, then deselect all boards. Ctrl+Z undoes and Ctrl+Y redoes.',
  },
  {
    id: 'top-ribbon',
    topic: 'Top ribbon menus',
    keywords: [
      'ribbon', 'file', 'view', 'help', 'mode', 'design', 'display',
      'menu', 'save', 'open', 'undo', 'redo', 'camera', 'grid',
    ],
    answer:
      'The top ribbon has File (save, open, new project), View (grid toggle, camera reset, orthographic), Help, Mode (Design or Assembly), Display dropdown (Shaded, Wireframe, Shaded + Edges, X-Ray), and Undo / Redo buttons. Use Mode to switch between free design and assembly build sequencing.',
  },
  {
    id: 'right-sidebar',
    topic: 'Right sidebar tabs',
    keywords: [
      'sidebar', 'right', 'inspector', 'estimating', 'cut list',
      'engineering', 'hardware', 'tutorial', 'tab', 'panel',
    ],
    answer:
      'The right sidebar has six tabs: Inspector (selected board properties, cuts, joinery, and transforms), Estimating (cost ledger with tax and waste buffer), Cut List (lumber nesting, sheet layouts, and fastener counts), Engineering (beam deflection analysis), Hardware (library and placed items), and Tutorial (the full in-app guide).',
  },
  {
    id: 'cut-list',
    topic: 'Reading and exporting the cut list',
    keywords: ['cut', 'list', 'nesting', 'lumber', 'sheet', 'export', 'how', 'what is'],
    answer:
      'Open the Cut List tab in the right sidebar. Dimensional lumber is nested onto 8, 10, and 12-foot sticks with ⅛" kerf accounted for. Sheet goods show a 48×96 layout diagram. Fastener counts and edge treatment summaries appear at the bottom. Save your project as a .wcad file from File → Save Project to keep everything together.',
  },
  {
    id: 'estimating',
    topic: 'Using the estimating panel',
    keywords: ['estimating', 'cost', 'price', 'tax', 'waste', 'ledger', 'how', 'what is'],
    answer:
      'The Estimating tab groups boards by species and size. Set price per LF, BF, or SF for each group. Enable waste buffer and tax rate as needed. Hardware and finishes add to the total. Boards without prices trigger a Pepe suggestion so you do not forget to price a part.',
  },
  {
    id: 'save-load',
    topic: 'Saving and loading a wcad file',
    keywords: ['save', 'load', 'wcad', 'file', 'project', 'backup', 'how'],
    answer:
      'Use File → Save Project in the top ribbon to download a .wcad file to your computer. File → Open Project loads one back. Autosave keeps your last session in the browser, but save a .wcad file for backups you control and can share.',
  },
  {
    id: 'undo-redo',
    topic: 'Undo and redo',
    keywords: ['undo', 'redo', 'history', 'mistake', 'ctrl', 'how'],
    answer:
      'Click Undo or Redo in the top ribbon, or press Ctrl+Z and Ctrl+Y. Dimension edits in the Quick Dimensions panel commit to history when you blur a field or deselect the board. Right-click empty space and choose Undo Last Action as another shortcut.',
  },
  {
    id: 'nominal-actual',
    topic: 'Nominal vs actual dimensions',
    keywords: ['nominal', 'actual', '2x4', 'surfaced', 'dimension', 'what is'],
    answer:
      'Lumber is sold by nominal size (like 2×4) but planed to actual inches — a 2×4 is really about 1½" × 3½". DoveDesign stores actual inches everywhere. The Quick Dimensions panel shows nominal equivalents when your board matches a standard size.',
  },
  {
    id: 'pocket-holes',
    topic: 'Pocket holes in DoveDesign',
    keywords: ['pocket', 'hole', 'kreg', 'angled', 'screw', 'how', 'what is'],
    answer:
      'Mate two boards, then choose Pocket Holes from the join method sub-wheel. CSG cuts angled pilot holes on both mating faces. You can also apply pocket holes from the Join tool in the Inspector. Great for face frames and cabinet boxes — keep them on the hidden side of show faces.',
  },
  {
    id: 'engineering',
    topic: 'Engineering and beam deflection',
    keywords: ['engineering', 'deflection', 'beam', 'span', 'load', 'structural', 'what is'],
    answer:
      'The Engineering tab runs a simple beam deflection check. Set each member\'s orientation (flat or on-edge), span, species, and uniform load in lbs. Results show deflection vs recommended limits. It is a guide — not a substitute for an engineer on critical loads.',
  },
  {
    id: 'nesting',
    topic: 'Sheet and lumber nesting',
    keywords: ['nesting', 'sheet', 'lumber', 'optimize', 'kerf', 'waste', 'what is'],
    answer:
      'The Cut List tab automatically bins dimensional parts onto standard stick lengths and packs sheet parts on 48×96 panels. Kerf is ⅛" between cuts. Review waste bars and sheet diagrams before you head to the saw.',
  },
  {
    id: 'screws-vs-nails',
    topic: 'When to use screws vs nails vs glue',
    keywords: ['screw', 'nail', 'glue', 'when', 'choose', 'which'],
    answer:
      'Screws give strong, removable joints — great for cabinets and furniture that may need service. Nails are fast for framing and backs where shear strength matters and disassembly is not needed. Glue adds surface-area strength on long grain-to-grain joints; combine glue with screws or clamps for best results. Pick your method from the join sub-wheel after mating.',
  },
  {
    id: 'pocket-hole-limits',
    topic: 'Pocket hole limitations',
    keywords: ['pocket', 'hole', 'limit', 'weak', 'end grain'],
    answer:
      'Pocket holes excel on face frames and box joints but are weak into end grain alone. Keep screw length about two-thirds into the receiving board. Not ideal for fine hardwood show faces without plugs.',
  },
  {
    id: 'dowels',
    topic: 'Dowels and alignment',
    keywords: ['dowel', 'align', 'drill', 'jig', 'how'],
    answer:
      'Dowels align parts and add shear strength. Use a dowel jig or center marks for hole alignment. Typical diameters are ⅜" or ½" depending on stock thickness. In DoveDesign, choose Dowel as the join method after mating, then click the ¼" snap grid on the joint face to place dowel geometry.',
  },
  {
    id: 'biscuits',
    topic: 'Biscuits and biscuit joiners',
    keywords: ['biscuit', 'plate', 'joiner', 'alignment', 'how'],
    answer:
      'Compressed wood biscuits swell in glue slots to align panel glue-ups like tabletops. A biscuit joiner cuts the slots. Good for alignment more than heavy structure — pair with glue across long grain. Choose Biscuit from the join sub-wheel and place on the joint face grid.',
  },
  {
    id: 'mortise-tenon',
    topic: 'Mortise and tenon joinery',
    keywords: ['mortise', 'tenon', 'strong', 'chair', 'table', 'how', 'what is'],
    answer:
      'A tenon on one part fits a mortise pocket in another — among the strongest traditional joints for chairs, tables, and doors. Choose Mortise & Tenon from the join sub-wheel after mating. This method skips fastener placement because the joint geometry itself represents the connection.',
  },
  {
    id: 'dovetails',
    topic: 'Dovetail joints',
    keywords: ['dovetail', 'drawer', 'box', 'hand cut', 'what is'],
    answer:
      'Dovetails interlock wedge-shaped pins and tails — excellent for drawers and boxes that resist pulling apart. Use the Join tool in the Inspector for decorative CSG previews. Hand-cut dovetails take practice; routers and jigs speed production work.',
  },
  {
    id: 'finger-box',
    topic: 'Finger and box joints',
    keywords: ['finger', 'box', 'joint', 'router', 'jig', 'what is'],
    answer:
      'Finger (box) joints use square interlocking fingers on corners — strong in glue and great for boxes and drawers. Dovetails taper for pull-out resistance; fingers are simpler to machine with a table saw jig or router. Apply from the Join tool in the Inspector.',
  },
  {
    id: 'cross-rip-cut',
    topic: 'Cross cuts and rip cuts',
    keywords: ['cross', 'cut', 'rip', 'chop', 'saw', 'width', 'how'],
    answer:
      'Select a board, open the Modify tab, and choose Cross Cut or Rip Cut. Set the cut position or target width in the Inspector. Cross Cut is a vertical chop across the board width (like a chop saw). Rip Cut removes a waste strip to reach a target width. Both appear immediately as CSG subtractions in the 3D view.',
  },
  {
    id: 'grain-direction',
    topic: 'Wood grain direction',
    keywords: ['grain', 'direction', 'tearout', 'strength', 'what is'],
    answer:
      'Grain runs along the length of a board. Long-grain glue joints are strongest. Cross-grain joints need allowance for wood movement. Route and plane with the grain when possible to reduce tear-out.',
  },
  {
    id: 'board-feet',
    topic: 'Board feet calculation',
    keywords: ['board', 'feet', 'bf', 'calculate', 'lumber', 'what is'],
    answer:
      'Board feet = (thickness in inches × width in inches × length in feet) ÷ 12. A 2×4×8\' nominal stick is roughly 5.33 BF in actual dimensions. DoveDesign calculates BF per member for estimating.',
  },
  {
    id: 'nominal-lumber',
    topic: 'Why a 2x4 is not 2 by 4',
    keywords: ['2x4', 'nominal', 'surfaced', 'planed', 'lumber', 'what is'],
    answer:
      'Rough lumber is named by green rough size. After drying and planing to surfaced four sides (S4S), it shrinks — a 2×4 becomes about 1½" × 3½". Always build from actual dimensions on your cut list.',
  },
  {
    id: 'cut-list-marking',
    topic: 'Reading a cut list efficiently',
    keywords: ['mark', 'cut', 'list', 'efficient', 'shop', 'how'],
    answer:
      'Group same-length parts on one stick. Mark waste side away from your best face. Cut longest parts first so mistakes leave usable shorts. Note kerf between every cut.',
  },
  {
    id: 'kerf',
    topic: 'Kerf and saw blade width',
    keywords: ['kerf', 'blade', 'saw', 'waste', 'account', 'what is'],
    answer:
      'Kerf is the slot removed by the blade — typically ⅛" on table saws. DoveDesign adds kerf in nesting on the Cut List tab. When cutting manually, measure to the waste side of your line.',
  },
  {
    id: 'sheet-goods',
    topic: 'Sheet goods vs solid wood',
    keywords: ['plywood', 'sheet', 'mdf', 'hdf', 'veneer', 'what is'],
    answer:
      'Plywood and MDF come in 4×8 sheets — stable for backs, tops, and carcases. Solid wood suits visible edges and parts that need thickness or repair. Match grade to use: Baltic birch for drawers, CDX for shop projects.',
  },
  {
    id: 'wood-movement',
    topic: 'Wood movement across seasons',
    keywords: ['movement', 'expand', 'contract', 'humidity', 'seasonal', 'what is'],
    answer:
      'Wood swells across grain with humidity. Allow gaps on panel inserts, orient grain consistently on tabletops, and avoid trapping wide solid panels in rigid frames without a floating panel groove.',
  },
  {
    id: 'finishing',
    topic: 'Finishing basics and sanding grits',
    keywords: ['finish', 'sand', 'grit', 'stain', 'poly'],
    answer:
      'Sand progressively — 120 to 150 for prep, 180 to 220 before stain, 320 between poly coats. Stop at 220 on bare wood before oil unless you want a closed pore look. Always test finish on scrap from the same board.',
  },
  {
    id: 'structural-span',
    topic: 'Shelf span and supports',
    keywords: ['span', 'shelf', 'sag', 'support', 'structural'],
    answer:
      'Shelves over 36" in common ¾" plywood often sag under books. Add a center divider, thicker stock, or edge banding for stiffness. Check the Engineering tab for deflection estimates on loaded members.',
  },
  {
    id: 'assembly-order',
    topic: 'Designing for assembly order',
    keywords: ['assembly', 'order', 'sequence', 'build', 'how'],
    answer:
      'Plan which joints are reachable last. Face frames often go on after carcase glue-up. Pocket holes on interiors before backs are installed. Dry-fit sub-assemblies before final glue. Assembly Mode in the top ribbon helps you practice the build sequence step by step.',
  },
  {
    id: 'beginner-mistakes',
    topic: 'Common beginner mistakes',
    keywords: ['beginner', 'mistake', 'tip', 'learn'],
    answer:
      'Measure twice, cut once. Account for actual not nominal sizes. Do not skip square checks on carcases. Pre-drill hardwood screws. Let finish cure before hardware install. Save often and use undo liberally.',
  },
  {
    id: 'shop-safety',
    topic: 'Shop safety basics',
    keywords: ['safety', 'guard', 'eye', 'ear', 'push stick'],
    answer:
      'Wear eye and ear protection. Keep guards on tools. Use push sticks past the blade. Unplug tools when changing bits or blades. Keep floors clear of offcuts and extension cords. Never reach over a spinning blade.',
  },
  {
    id: 'left-panel-tools',
    topic: 'What tools are in the left panel',
    keywords: ['left panel', 'tools', 'tabs', 'model tab', 'modify tab', 'joinery tab', 'shapes tab', 'panel'],
    answer:
      'The left panel has 4 tabs: Model (Select, Draw, Add boards), Modify (Cross Cut, Rip Cut, Miter, Trim, Join), Joinery (Mate, Edge Treatment, Attach Point), and Shapes (Cylinder, Sphere, Cone, Triangle, Hexagon, Custom Polygon).',
  },
  {
    id: 'modify-tab-tools',
    topic: 'What is in the Modify tab',
    keywords: ['modify', 'modify tab', 'cross cut', 'rip cut', 'miter', 'trim', 'join', 'cut tool'],
    answer:
      'The Modify tab has: Cross Cut (chop across the board width), Rip Cut (cut along the length to a target width), Miter (angled end cuts), Trim (trim a board to a boundary), and Join (auto-detect joints between selected boards).',
  },
  {
    id: 'joinery-tab-tools',
    topic: 'What is in the Joinery tab',
    keywords: ['joinery', 'joinery tab', 'mate tool', 'edge treatment', 'attach point'],
    answer:
      'The Joinery tab has: Mate (snap two board faces together, press J), Edge Treatment (add chamfers, fillets, rabbets to edges), and Attach Point (place named connection points on faces).',
  },
  {
    id: 'right-panel-tabs',
    topic: 'What panels are on the right side',
    keywords: ['right panel', 'right sidebar', 'inspector', 'estimating', 'cut list', 'optimizer', 'engineering', 'right side'],
    answer:
      'The right sidebar has: Inspector (dimensions, position, rotation of selected board), Estimating (material costs), Cut List (all boards listed), Optimizer (cut layout for lumber), and Engineering (deflection calculations).',
  },
  {
    id: 'cut-optimizer',
    topic: 'What is the cut optimizer',
    keywords: ['optimizer', 'cut optimizer', 'lumber layout', 'nesting', 'waste', 'sheet layout'],
    answer:
      'The Cut Optimizer shows you how to cut your boards from standard lumber lengths with the least waste. Open it from the Optimizer tab on the right sidebar.',
  },
  {
    id: 'engineering-panel',
    topic: 'What is the engineering panel',
    keywords: ['engineering', 'deflection', 'beam', 'sag', 'load', 'structural'],
    answer:
      'The Engineering panel calculates beam deflection — how much a board will sag under a load. Select a board, set the load in the Inspector, then check the Engineering tab.',
  },
  {
    id: 'estimating-panel',
    topic: 'What is the estimating panel',
    keywords: ['estimating', 'cost', 'price', 'board foot', 'material cost'],
    answer:
      'The Estimating panel calculates material costs for your project. Set prices per board foot for each species in the Estimating tab on the right sidebar.',
  },
  {
    id: 'assembly-mode',
    topic: 'What is assembly mode',
    keywords: ['assembly', 'assembly mode', 'build sequence', 'assembly guide', 'step by step'],
    answer:
      'Assembly mode (in the Mode menu at the top) spreads your boards out in order and shows an assembly guide so you can see the step-by-step build sequence.',
  },
  {
    id: 'save-project',
    topic: 'How to save a project',
    keywords: ['save', 'file', 'open', 'export', 'wcad', 'project file'],
    answer:
      'Go to File > Save in the top menu to download your project as a .wcad file. Open it again with File > Open.',
  },
  {
    id: 'what-is-mate',
    topic: 'What is a mate',
    keywords: ['what is mate', 'what is a mate', 'mate definition', 'connection record'],
    answer:
      'A mate is a connection between two board faces. Use the Mate tool (press J) to snap boards together. Mates are listed in the Inspector under Connections, where you can also unmate them.',
  },
  {
    id: 'display-modes',
    topic: 'What display modes are available',
    keywords: ['display', 'wireframe', 'xray', 'shaded', 'edges', 'view mode'],
    answer:
      'Use the Display menu at the top to switch between Shaded (normal), Wireframe (see through), Shaded with Edges, and X-Ray modes.',
  },
  {
    id: 'multi-select',
    topic: 'How to select multiple boards',
    keywords: ['multi select', 'multiple boards', 'select all', 'shift click', 'box select', 'group select'],
    answer:
      'Hold Shift and click boards to add them to the selection, or hold Shift and drag a box around multiple boards to select them all at once.',
  },
  {
    id: 'quick-dimensions',
    topic: 'What is the quick dimensions panel',
    keywords: ['quick dimensions', 'dims', 'exact dimensions', 'type dimensions', 'dimension panel'],
    answer:
      'Press Space to open the radial wheel on a selected board, then choose Dims. A floating panel lets you type exact dimensions for length, width, and thickness in inches.',
  },
  {
    id: 'how-unmate',
    topic: 'How to unmate boards',
    keywords: ['unmate', 'detach', 'disconnect', 'remove mate', 'undo mate', 'remove connection'],
    answer:
      'Select either board, then look in the Inspector tab under Connections. Click Unmate next to the connection you want to remove. Use Ctrl+Z if you want to fully undo the mate including the position change.',
  },
  {
    id: 'undo-mate',
    topic: 'Can I undo a mate',
    keywords: ['undo mate', 'reverse mate', 'ctrl z mate', 'unsnap', 'undo snap'],
    answer:
      'Yes — press Ctrl+Z right after mating to fully undo it including the position snap. Or select the board later and click Unmate in the Inspector to just remove the connection record.',
  },
  {
    id: 'cross-vs-rip',
    topic: 'Difference between cross cut and rip cut',
    keywords: ['cross cut vs rip cut', 'difference cross rip', 'cross cut rip cut', 'chop saw table saw'],
    answer:
      'Cross cut goes ACROSS the grain like a chop saw — it shortens the board. Rip cut goes ALONG the grain like a table saw — it narrows the board. Press C for cross cut, R for rip cut.',
  },
  {
    id: 'how-shorten-board',
    topic: 'How to shorten a board',
    keywords: ['shorten board', 'cut board shorter', 'trim length', 'chop cut', 'cut to length'],
    answer:
      'Use Cross Cut — select the board, press C, then set the cut position in the Inspector and click Apply Cross Cut.',
  },
  {
    id: 'how-narrow-board',
    topic: 'How to narrow a board',
    keywords: ['narrow board', 'cut board narrower', 'rip cut narrow', 'reduce width'],
    answer:
      'Use Rip Cut — select the board, press R, then set the target width in the Inspector and click Apply Rip Cut.',
  },
  {
    id: 'u-key-unmate',
    topic: 'U key to unmate',
    keywords: ['u key', 'unmate shortcut', 'u unmate', 'quick unmate', 'keyboard unmate'],
    answer:
      'Press U to quickly unmate the most recent connection on the selected board. Or open the Inspector tab and click Unmate next to any connection.',
  },
  {
    id: 'right-click-pan',
    topic: 'Right click menu keeps appearing after panning',
    keywords: ['right click menu', 'context menu pan', 'menu appears panning', 'right click drag'],
    answer:
      'The right-click menu only appears on a short click. If you hold right mouse and drag to pan the camera, the menu will not appear — just release without dragging to open it.',
  },
];

export const PEPE_KNOWLEDGE: KnowledgeEntry[] = [
  ...PEPE_KNOWLEDGE_APP,
  ...PEPE_KNOWLEDGE_BOOKS,
  ...PEPE_KNOWLEDGE_EXPANDED,
  ...PEPE_KNOWLEDGE_MASTER_A,
  ...PEPE_KNOWLEDGE_MASTER_B,
  ...PEPE_KNOWLEDGE_MASTER_C,
  ...PEPE_KNOWLEDGE_MASTER_D,
  ...PEPE_KNOWLEDGE_MASTER_E,
  ...PEPE_KNOWLEDGE_MASTER_F,
  ...PEPE_KNOWLEDGE_MASTER_G,
  ...PEPE_KNOWLEDGE_MASTER_H,
  ...PEPE_KNOWLEDGE_MASTER_I,
  ...PEPE_KNOWLEDGE_MASTER_J,
  ...PEPE_KNOWLEDGE_MASTER_K,
  ...PEPE_KNOWLEDGE_MASTER_L,
  ...PEPE_KNOWLEDGE_MASTER_M,
  ...PEPE_KNOWLEDGE_MASTER_N,
];
