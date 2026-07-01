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
import { PEPE_KNOWLEDGE_MASTER_O } from './pepeKnowledgeMasterO';
import { PEPE_KNOWLEDGE_MASTER_P } from './pepeKnowledgeMasterP';
import { PEPE_KNOWLEDGE_MASTER_Q } from './pepeKnowledgeMasterQ';
import { PEPE_KNOWLEDGE_MASTER_R } from './pepeKnowledgeMasterR';
import { PEPE_KNOWLEDGE_MASTER_S } from './pepeKnowledgeMasterS';
import { PEPE_KNOWLEDGE_MASTER_T } from './pepeKnowledgeMasterT';
import { PEPE_KNOWLEDGE_MASTER_U } from './pepeKnowledgeMasterU';
import { PEPE_KNOWLEDGE_MASTER_V } from './pepeKnowledgeMasterV';
import { PEPE_KNOWLEDGE_MASTER_W } from './pepeKnowledgeMasterW';

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
      'DoveDesign shortcuts: Space = open radial wheel, Escape = cancel/deselect, S = select tool, W = draw board, C = centerline tool, M = move arrows, Tab = cycle Move/Rotate/Scale, R = rip cut, J = mate/join boards, F = finishing panel, D = measure tool (dimension lines), G = toggle snap grid, B = bill of materials, U = unmate most recent connection, Delete = delete board, Ctrl+Z = undo, Ctrl+Y = redo, Shift+drag = box select, Ctrl+S = save, Ctrl+O = open.',
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
      'Right-click the board and choose Duplicate from the context menu. The copy appears offset slightly from the original. (The D key is now the Measure tool.)',
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
    id: 'fasteners-follow-board',
    topic: 'Fastener icons now follow the board when you move it',
    keywords: [
      'fastener', 'screw', 'nail', 'follow', 'move', 'stay', 'behind', 'stuck',
      'floating', 'wrong', 'place', 'stayed', 'did not move',
    ],
    answer:
      'Screw, nail, dowel, biscuit, and bracket icons now stay attached to the exact spot on the board where you placed them, even after you move or rotate that board (or the other board it is mated to). Previously a fastener icon could get left behind floating in its old spot — that is fixed as of Phase 19. If you open an older saved project from before this fix, its fastener icons will still show up in their original saved position until you move that board again.',
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
    keywords: ['grain', 'direction', 'tearout', 'strength', 'what is', 'orientation', 'fiber'],
    answer:
      'Wood fibers run mostly one way along a board, like a bundle of parallel straws — cutting, planing, or routing "with the grain" slices along the straws cleanly, while going against it catches the fiber ends and tears them out. This same fiber orientation is why long-grain-to-long-grain glue joints (like a mortise and tenon or an edge glue-up) are strong while end-grain joints are weak — the open straw ends soak up glue instead of holding it as a film. It is also why boards move (expand/shrink) across the grain but barely at all along its length. Choosing joinery in DoveDesign — favoring mortise-and-tenon or dovetails over plain butt joints wherever a joint carries real load — is really about keeping glue surfaces long-grain-to-long-grain rather than fighting the grain\'s natural strength and movement behavior.',
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
  {
    id: 'rename-board',
    topic: 'How to rename a board',
    keywords: ['rename board', 'change name', 'label', 'board name'],
    answer:
      'Click the Label field in the Inspector panel on the right — just type a new name and press Enter. You can rename a board even while it\'s selected or being moved.',
  },
  {
    id: 'snap-points',
    topic: 'What are snap points',
    keywords: ['snap points', 'snap dots', 'corner dots', 'align boards precisely', 'snap'],
    answer:
      'Snap points are small dots that appear on the corners and face centers of each board when it is selected. In Mate mode, they appear on all boards so you can see possible attachment locations clearly.',
  },
  {
    id: 'nav-cube',
    topic: 'How to use the navigation cube',
    keywords: ['navigation cube', 'nav cube', 'top view', 'front view', 'camera view', 'isometric'],
    answer:
      'The navigation cube in the bottom-right corner shows your view orientation. Click a face (TOP, FRONT, LEFT, etc.) to jump to that view. Click a corner symbol for an isometric view. The Home button below resets the camera to the default position.',
  },
  {
    id: 'apply-cross-cut-result',
    topic: 'What happens when I apply a cross cut',
    keywords: ['apply cross cut', 'cross cut result', 'two boards', 'split board cross'],
    answer:
      'Applying a cross cut splits your board into two separate pieces — the keep piece and the waste piece. Both become independent boards you can move, label, or delete separately.',
  },
  {
    id: 'apply-rip-cut-result',
    topic: 'What happens when I apply a rip cut',
    keywords: ['apply rip cut', 'rip cut result', 'two boards', 'split board rip', 'narrow board'],
    answer:
      'Applying a rip cut splits your board along its width into two separate boards — the target-width piece and the waste strip. Both are independent boards you can work with separately.',
  },
  {
    id: 'radial-wheel-spacebar',
    topic: 'How to open the radial wheel',
    keywords: ['radial wheel', 'open wheel', 'tool wheel', 'spacebar wheel'],
    answer:
      'Press Spacebar while a board is selected to open the radial tool wheel. The wheel only opens with Spacebar — clicking a board just selects it without opening the wheel.',
  },
  {
    id: 'transform-gizmo-persist',
    topic: 'How to keep move arrows visible',
    keywords: ['move arrows', 'gizmo stays', 'transform gizmo', 'arrows disappear'],
    answer:
      'Press M to activate the move arrows on a selected board. They stay visible until you press Escape or switch tools. Press Tab to cycle through Move, Rotate, and Scale modes.',
  },
  {
    id: 'mortise-tenon',
    topic: 'Mortise and tenon joint',
    keywords: ['mortise', 'tenon', 'mortise and tenon', 'socket', 'tongue'],
    answer:
      'A mortise is a rectangular socket chiseled into one board. The tenon is a matching tongue on the end of the other board that slides in. Use the V (Joinery Visualization) tool to place Mortise and Tenon markers on your boards to plan the joint.',
  },
  {
    id: 'pocket-hole',
    topic: 'Pocket holes (Kreg jig)',
    keywords: ['pocket hole', 'pocket screw', 'kreg', 'pocket jig', 'ph marker'],
    answer:
      'Pocket holes are angled holes drilled into one board so a screw can pull two boards together from inside. Press V for the Joinery Visualization tool, choose Pocket Hole, then click a face to mark where the holes go.',
  },
  {
    id: 'dovetail-joint',
    topic: 'Dovetail joint',
    keywords: ['dovetail', 'tail', 'pin board', 'drawer joint', 'dove tail'],
    answer:
      'Dovetails interlock fan-shaped tails on one board with matching pins on the other. They are very strong and resist pulling apart — often used on drawer boxes. Press V and choose Dovetail to mark board ends with the trapezoidal profile.',
  },
  {
    id: 'biscuit-joint',
    topic: 'Biscuit joint',
    keywords: ['biscuit', 'plate joint', 'biscuit joiner', 'wafer'],
    answer:
      'Biscuit joints use small oval wafers glued into slots in both boards to align and hold them together. Good for edge-to-edge joins like tabletops. Press V and choose Biscuit to mark where the slots go.',
  },
  {
    id: 'joint-marker-how-to',
    topic: 'How to add a joint marker',
    keywords: ['add joint', 'place marker', 'joint marker', 'v tool', 'how joint'],
    answer:
      'Press V to open the Joinery Visualization tool. In the Inspector, pick a joint type (Pocket Hole, Mortise, Tenon, Dovetail, or Biscuit). Then click any face on a board — a dashed amber marker appears at that spot.',
  },
  {
    id: 'joint-tool-overview',
    topic: 'Joinery visualization tool overview',
    keywords: ['joinery visualization', 'joint tool', 'v key', 'joint planning'],
    answer:
      'The Joinery Visualization tool (press V) lets you mark where joints will be cut on your boards. Markers are visual-only — no wood is actually removed. They help you plan and communicate your joinery before you cut.',
  },
  {
    id: 'show-joints-on-boards',
    topic: 'How to show where I am joining two boards',
    keywords: ['show join', 'mark joint', 'where cut', 'joint location', 'show joint'],
    answer:
      'Press V for the Joinery Visualization tool, pick the joint type in the Inspector, then click the face of each board where the joint goes. Amber dashed markers show the joint location on each board.',
  },
  {
    id: 'what-joints-available',
    topic: 'What joint types are available',
    keywords: ['joint types', 'available joints', 'what joints', 'list joints', 'all joints'],
    answer:
      'The Joinery Visualization tool (V) supports five types: Pocket Hole, Mortise, Tenon, Dovetail, and Biscuit. Each one shows a different shape on the board face to represent where that joint gets cut.',
  },
  {
    id: 'remove-joint-marker',
    topic: 'How to remove a joint marker',
    keywords: ['remove marker', 'delete marker', 'clear joint', 'erase joint marker'],
    answer:
      'Press V to enter the Joinery Visualization tool, then click the amber marker on the board. A "Remove Marker" button appears — click it to delete just that one marker. You can also click "Clear All Markers" in the Inspector to remove all markers from a selected board.',
  },
  {
    id: 'mortise-vs-tenon',
    topic: 'Mortise vs tenon — which goes where',
    keywords: ['mortise vs tenon', 'which is socket', 'which is tongue', 'mortise difference tenon'],
    answer:
      'The mortise is the hole (socket) — it gets cut INTO the board. The tenon is the plug (tongue) — it sticks OUT from the end of the other board. Mark the mortise on the board that stays still; mark the tenon on the board that slides in.',
  },
  {
    id: 'pocket-hole-angle',
    topic: 'Pocket hole drill angle',
    keywords: ['pocket angle', '15 degree', 'pocket drill angle', 'kreg angle'],
    answer:
      'Pocket holes are drilled at a 15° angle so the screw pulls the joint tight. The Joinery Visualization tool shows this angled drill line on the board face when you place a Pocket Hole marker.',
  },
  {
    id: 'dovetail-layout',
    topic: 'Dovetail pin and tail layout',
    keywords: ['dovetail layout', 'pin board', 'tail board', 'dovetail layout'],
    answer:
      'A dovetail joint has tails (fan-shaped, wider at tip) on one board and pins (narrow) on the other. The Dovetail marker in DoveDesign shows the trapezoidal tail profile on the board end to help you plan the layout.',
  },
  {
    id: 'snap-to-grid',
    topic: 'Snap to grid',
    keywords: ['snap', 'grid', 'snap to grid', 'align grid', 'grid snap', 'g key'],
    answer:
      'Press G to toggle Snap to Grid. When on, boards snap to the nearest 1-inch position on the XZ floor plane when you move them. You can also toggle it in the View menu.',
  },
  {
    id: 'scrap-box',
    topic: 'What is the scrap box',
    keywords: ['scrap box', 'scrap', 'waste box', 'offcut box', 'stash', 'hide board'],
    answer:
      'The Scrap Box is a place to stash cut waste pieces without deleting them. Open it with the 🗑 button at the bottom-left of the viewport. You can retrieve pieces later or clear them permanently.',
  },
  {
    id: 'send-to-scrap',
    topic: 'How to send a piece to the scrap box',
    keywords: ['send scrap', 'save waste', 'move to scrap', 'scrap waste', 'hide piece'],
    answer:
      'Select the board, then click "Send to Scrap Box" at the bottom of the Inspector panel. The board disappears from the viewport but stays stored in the scrap box.',
  },
  {
    id: 'retrieve-from-scrap',
    topic: 'How to retrieve a piece from the scrap box',
    keywords: ['retrieve', 'get back', 'restore piece', 'scrap retrieve', 'bring back'],
    answer:
      'Click the 🗑 Scrap Box button at the bottom-left of the viewport to expand the panel, then click "Retrieve" next to the piece you want. It returns to the viewport near your other boards.',
  },
  {
    id: 'offcut-storage',
    topic: 'Storing offcuts and waste pieces',
    keywords: ['offcut', 'cut off', 'waste piece', 'store piece', 'keep waste'],
    answer:
      'Use the Scrap Box to store offcuts. Select the waste piece and click "Send to Scrap Box" in the Inspector. The piece is hidden but not deleted — you can retrieve it any time.',
  },
  {
    id: 'clear-scrap',
    topic: 'Delete all pieces in the scrap box',
    keywords: ['clear scrap', 'delete waste', 'empty scrap', 'remove all scrap'],
    answer:
      'Open the Scrap Box (🗑 button, bottom-left), then click "Clear All" at the top of the panel. This permanently deletes all pieces in the scrap box — it cannot be undone.',
  },
  {
    id: 'scrap-vs-delete',
    topic: 'Scrap box vs deleting a board',
    keywords: ['scrap vs delete', 'difference scrap delete', 'why scrap'],
    answer:
      'Delete permanently removes a board and cannot be recovered. The Scrap Box keeps the board stored safely — you can retrieve it later if you change your mind about a cut.',
  },
  {
    id: 'scrap-count-badge',
    topic: 'Scrap box count badge',
    keywords: ['scrap count', 'badge scrap', 'how many scraps', 'scrap number'],
    answer:
      'The Scrap Box button at the bottom-left shows an amber number badge when there are pieces inside. Click it to expand the full list and manage your stored pieces.',
  },
  {
    id: 'measure-distance',
    topic: 'How to measure distance between two points',
    keywords: ['measure', 'distance', 'dimension', 'how far', 'measurement', 'd key', 'dimension line'],
    answer:
      'Press D to activate the Measure tool. Click once to set the start point, then move your cursor (no drag needed) and click again to set the end point. The line shows distance in inches and the angle in degrees.',
  },
  {
    id: 'dimension-lines',
    topic: 'What are dimension lines',
    keywords: ['dimension line', 'dimension', 'measurement line', 'measure line', 'ruler'],
    answer:
      'Dimension lines are amber dotted lines you draw with the Measure tool (D). They stay saved in your project and show distance and angle. Toggle them on or off in the View menu, or select one and click Delete to remove it.',
  },
  {
    id: 'measure-tool',
    topic: 'Measure tool — how it works',
    keywords: ['measure tool', 'measuring', 'how measure', 'ruler tool'],
    answer:
      'Press D for the Measure tool. Click once to set the start point. Move your cursor to stretch a live line, then click again to drop the end point. Distance in inches and the angle both show on the line. Press D or Escape to exit.',
  },
  {
    id: 'angle-dimension-line',
    topic: 'Angle shown on dimension line',
    keywords: ['angle', 'dimension angle', 'degree', 'measure angle', 'snap angle'],
    answer:
      'Every dimension line shows its angle near the end point. The line snaps to 0° (horizontal) or 90° (vertical) when you are within 5°. Hold Shift while placing to disable angle snapping and set any angle freely.',
  },
  {
    id: 'snap-dots-follow-board',
    topic: 'Snap dots not following the board',
    keywords: ['snap dots', 'dots stay', 'dots not moving', 'snap points wrong position'],
    answer:
      'Snap dots now update in real time as you move a board. If they look stuck, try deselecting and reselecting the board. This was a known issue fixed in Phase 7.',
  },
  {
    id: 'rotation-ring',
    topic: 'Rotation ring and degree snapping',
    keywords: ['rotation ring', 'rotate ring', 'rotate degrees', 'snap rotation', 'angle snap', '15 degree'],
    answer:
      'In Rotate mode (press M then Tab to reach Rotate), an amber ring appears around the board showing snap positions at every 15°. The current angle displays near the board. Hold Shift while rotating to turn off snapping and rotate to any angle.',
  },
  {
    id: 'duplicate-board',
    topic: 'How to duplicate a board',
    keywords: ['duplicate', 'copy board', 'copy', 'clone'],
    answer:
      'Right-click the board and choose Duplicate, or use the context menu. The D key is now the Measure tool — to duplicate, use the right-click context menu instead.',
  },
  {
    id: 'grid-visibility',
    topic: 'Grid visibility and major/minor lines',
    keywords: ['grid', 'visibility', 'minor', 'major', 'lines', 'inch', 'foot', 'see grid'],
    answer:
      'The grid shows major 1-foot sections (12 inch squares) and minor 1-inch squares. Turn on Snap to Grid with the G key to lock board movement to these intersections.',
  },
  {
    id: 'snap-grid-fine',
    topic: 'Fine snap to grid when zoomed in',
    keywords: ['snap', 'grid', 'fine', 'quarter inch', 'precise', 'zoomed', 'close up'],
    answer:
      'When zoomed in close, snap-to-grid switches to 1/4-inch precision automatically so you can place boards more precisely.',
  },
  {
    id: 'dimension-line-board-face',
    topic: 'How to measure on a board face',
    keywords: ['dimension', 'line', 'board', 'face', 'measure', 'surface', 'on board'],
    answer:
      'Press D to activate the measure tool. Click directly on a board face — a dashed amber line stretches to your cursor. Click again on the same face to place the dimension line right on the surface.',
  },
  {
    id: 'dimension-line-edge-snap',
    topic: 'Dimension line snaps to board edges',
    keywords: ['dimension', 'edge', 'snap', 'corner', 'blue dot', 'exact'],
    answer:
      'While placing a dimension line, the dot turns blue when you hover near a board edge or corner — that means it\'s snapping exactly to that edge.',
  },
  {
    id: 'deselect-board',
    topic: 'How to deselect a board',
    keywords: ['deselect', 'clear selection', 'click empty', 'unselect', 'deselect board'],
    answer:
      'Click anywhere on the grid floor or empty space to deselect the current board or dimension line. Everything clears on an empty click.',
  },
  {
    id: 'join-boards-mate-dots',
    topic: 'Joining boards using face dots',
    keywords: ['join', 'mate', 'dots', 'face dots', 'snap together', 'connect boards'],
    answer:
      'Make sure you\'re in Select mode (press Escape or S). Click a face dot on the first board — it turns green. Then click a face dot on the second board. They snap together face-to-face.',
  },
  {
    id: 'centerline-tool',
    topic: 'Centerline tool — add a CL marker to a board face',
    keywords: ['centerline', 'cl', 'center line', 'center mark', 'centerline tool', 'c key'],
    answer:
      'Press C to activate the Centerline tool. Click any face of a board to add a dashed cyan centerline marker running through the center of that face. Great for locating drill points or reference lines.',
  },
  {
    id: 'remove-centerline',
    topic: 'How to remove a centerline marker',
    keywords: ['remove', 'delete', 'centerline', 'cl marker', 'clear centerline'],
    answer:
      'Select the board, then use the Clear Centerlines button in the tool panel, or press C again to activate the centerline tool and click the same face — markers are managed in the Inspector.',
  },
  {
    id: 'dimension-line-to-cut',
    topic: 'Convert a dimension line into a cut',
    keywords: ['dimension', 'line', 'cut', 'convert', 'cross cut', 'rip cut', 'measurement cut'],
    answer:
      'Draw a dimension line on a board face, click to select it, then look for "Convert to Cross Cut" or "Convert to Rip Cut" in the tool panel. It cuts the board right at that measurement.',
  },
  {
    id: 'choose-wood-species-draw',
    topic: 'Choose wood species before drawing a board',
    keywords: ['species', 'material', 'draw', 'wood type', 'oak', 'pine', 'walnut', 'choose material'],
    answer:
      'When the Draw tool is active (W key), pick a wood species from the material swatches in the tool panel before drawing. Your board will use that species automatically.',
  },
  {
    id: 'apply-finish-to-board',
    topic: 'How to apply a finish to a board',
    keywords: ['finish', 'stain', 'paint', 'clear coat', 'oil', 'apply finish', 'f key', 'finishing'],
    answer:
      'Select a board and press F to open the Finishing panel. Choose stain, paint, clear coat, or oil — the board updates in real time in the 3D view.',
  },
  {
    id: 'stain-vs-paint',
    topic: 'Stain vs paint — what is the difference',
    keywords: ['stain', 'paint', 'difference', 'vs', 'texture', 'grain', 'solid color'],
    answer:
      'Stain blends with the wood grain — you still see the texture underneath. Paint covers it completely with a solid color. Both let you pick from preset colors.',
  },
  {
    id: 'clear-coat-finish',
    topic: 'Clear coat finish for a glossy look',
    keywords: ['clear coat', 'gloss', 'sheen', 'matte', 'satin', 'finish', 'shine'],
    answer:
      'Choose Clear Coat in the Finishing panel to keep the natural wood look but add gloss. Pick Matte, Satin, or Gloss sheen.',
  },
  {
    id: 'nav-cube',
    topic: 'Nav cube — click to set camera view',
    keywords: ['nav cube', 'camera view', 'top view', 'front view', 'right view', 'cube', 'navigation'],
    answer:
      'The small 3D cube in the top-right corner shows face labels (TOP, FRONT, RIGHT). Click any face to instantly jump the camera to that view with a smooth animation.',
  },
  {
    id: 'top-view-camera',
    topic: 'How to get a top-down view',
    keywords: ['top view', 'top down', 'overhead', 'look down', 'bird eye', 'camera top'],
    answer:
      'Click the TOP face on the Nav Cube (top-right corner of the viewport) to look straight down at your project. Click FRONT, BACK, LEFT, or RIGHT for side views.',
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
  ...PEPE_KNOWLEDGE_MASTER_O,
  ...PEPE_KNOWLEDGE_MASTER_P,
  ...PEPE_KNOWLEDGE_MASTER_Q,
  ...PEPE_KNOWLEDGE_MASTER_R,
  ...PEPE_KNOWLEDGE_MASTER_S,
  ...PEPE_KNOWLEDGE_MASTER_T,
  ...PEPE_KNOWLEDGE_MASTER_U,
  ...PEPE_KNOWLEDGE_MASTER_V,
  ...PEPE_KNOWLEDGE_MASTER_W,

  // Phase 10 entries
  {
    id: 'clear-all-boards',
    topic: 'How to clear all boards',
    keywords: ['clear', 'clear all', 'wipe', 'empty', 'start fresh', 'delete all', 'remove all', 'shift delete'],
    answer: 'Press Shift+Delete to clear every board from the scene at once. A confirmation box pops up first so you can change your mind. Press Ctrl+Z to undo and get everything back.',
  },
  {
    id: 'start-over',
    topic: 'Start over with a blank project',
    keywords: ['start over', 'blank', 'new project', 'fresh start', 'empty project', 'restart'],
    answer: 'Go to File → New from Template → Blank Project to start fresh. Or use File → New Project. Either way, Ctrl+Z brings everything back if you change your mind.',
  },
  {
    id: 'dimension-line-select',
    topic: 'How to select and delete a dimension line',
    keywords: ['select dimension line', 'delete dimension line', 'remove dimension line', 'click line'],
    answer: 'Click any dimension line to select it — it glows bright amber. Then press Delete or click the Delete Line button that appears above it. Ctrl+Z to undo.',
  },
  {
    id: 'dimension-line-move-endpoint',
    topic: 'How to move a dimension line endpoint',
    keywords: ['move endpoint', 'drag endpoint', 'reanchor', 'endpoint handle', 'adjust line'],
    answer: 'Click a dimension line to select it, then drag either of the green endpoint handles to reanchor that end anywhere on a board surface or the grid.',
  },
  {
    id: 'dimension-line-edit',
    topic: 'How to edit a dimension line',
    keywords: ['edit dimension line', 'change dimension line', 'modify line', 'move line'],
    answer: 'Click the line to select it (turns bright amber). Drag either green endpoint handle to reanchor that end. The length and angle update live as you drag.',
  },
  {
    id: 'measure-tool-green-dot',
    topic: 'What does the green dot mean in the measure tool',
    keywords: ['green dot', 'measure green', 'start point', 'locked start', 'measure dot'],
    answer: 'The green dot in the Measure tool marks your locked start point. Click once to lock the start (green dot appears), then your cursor stretches a dashed amber line out to wherever you move. Click again to place the permanent dimension line.',
  },
  {
    id: 'measure-tool-cancel',
    topic: 'How to cancel a dimension line while placing',
    keywords: ['cancel measure', 'escape measure', 'cancel dimension line', 'abort measure'],
    answer: 'Press Escape while the Measure tool is active to cancel the current line. If you already placed the start point, Escape clears it so you can start over.',
  },
  {
    id: 'rotation-axis-lock',
    topic: 'How to lock rotation to one axis',
    keywords: ['rotation axis', 'axis lock', 'rotate x y z', 'lock axis', 'rotation direction'],
    answer: 'With a board selected and the rotate gizmo active, look for the X / Y / Z buttons in the tool panel on the left. Click one to lock rotation to that axis — X is red, Y is amber, Z is blue.',
  },
  {
    id: 'rotation-type-degree',
    topic: 'How to rotate to an exact angle',
    keywords: ['exact rotation', 'type angle', 'snap angle', 'enter degrees', 'precise rotation', '45 degrees'],
    answer: 'Select a board, press M then Tab to switch to Rotate mode. In the left panel you will see an axis picker and a degree input. Type the angle you want and press Enter to snap the board exactly there.',
  },
  {
    id: 'rotation-tick-marks',
    topic: 'Click the rotation ring tick marks to snap',
    keywords: ['tick mark', 'rotation ring', 'click tick', 'snap ring', 'ring click'],
    answer: 'When the amber rotation ring is visible, click any tick mark to snap the board to that angle instantly. The larger, brighter ticks are at 0°, 45°, 90°, 135°, and 180°. Hover over a tick to see its angle.',
  },
  {
    id: 'save-project-ctrl-s',
    topic: 'How to save a project',
    keywords: ['save', 'save project', 'ctrl s', 'download project', 'wcad file', 'file save'],
    answer: 'Press Ctrl+S or go to File → Save Project. Your project downloads as a .wcad file you can keep on your computer and reload any time.',
  },
  {
    id: 'open-project-ctrl-o',
    topic: 'How to open a saved project',
    keywords: ['open project', 'ctrl o', 'load project', 'load file', 'open wcad', 'reopen'],
    answer: 'Press Ctrl+O or go to File → Open Project and pick a .wcad file. All your boards and dimension lines come back right where you left them.',
  },
  {
    id: 'wcad-file',
    topic: 'What is a .wcad file',
    keywords: ['wcad', 'wcad file', 'project file', 'what is wcad', 'file format'],
    answer: 'A .wcad file is DoveDesign\'s project format. It is just a regular file you can save to your computer. Drag it back into DoveDesign or use File → Open Project to reopen it.',
  },
  {
    id: 'autosave',
    topic: 'Does DoveDesign autosave',
    keywords: ['autosave', 'auto save', 'lose work', 'refresh', 'browser save', 'automatic save', 'crash recovery'],
    answer: 'DoveDesign quietly keeps a background backup as you work, purely for crash recovery — but as of Phase 18 it is never loaded automatically. If the app finds a recent backup when you open it, a banner appears offering to Recover or Dismiss it. To actually keep and reopen a project on purpose, use Ctrl+S to save a named .wcad file — that is now the real way to save your work.',
  },
  {
    id: 'blank-canvas-start',
    topic: 'Why does DoveDesign open blank',
    keywords: ['open blank', 'blank canvas', 'lost my project', 'app reset', 'why is it empty', 'fresh start'],
    answer: 'As of Phase 18, DoveDesign always opens to a blank canvas instead of reloading your last session — this is intentional, so you always start clean. Your last unsaved session is not gone: check the amber "Unsaved work found" banner at the top for a Recover option, or reopen a saved .wcad file with Ctrl+O.',
  },
  {
    id: 'save-name-prompt',
    topic: 'Save asks for a project name',
    keywords: ['name my project', 'project name prompt', 'save asks for name', 'name your project'],
    answer: 'The first time you save a new project with Ctrl+S, DoveDesign asks you to type a name before downloading the .wcad file. After that first save, Ctrl+S saves immediately under that same name with no prompt.',
  },
  {
    id: 'recent-projects-menu',
    topic: 'Recent Projects list',
    keywords: ['recent projects', 'recent files', 'file menu recent', 'last saved projects'],
    answer: 'The File menu shows your last 3 saved project names under Recent Projects. Clicking one opens the file picker so you can find and load that .wcad file — browsers don\'t let a website reopen a file on its own for privacy reasons, so you still pick the file once.',
  },
  {
    id: 'project-templates',
    topic: 'What are project templates',
    keywords: ['template', 'templates', 'start template', 'pre-built', 'workbench template', 'bookshelf template'],
    answer: 'Templates are pre-built projects to get you started fast. Go to File → New from Template to pick from a workbench, bookshelf, cabinet, side table, or bed frame. All pieces are pre-sized in pine.',
  },
  {
    id: 'workbench-template',
    topic: 'Workbench template',
    keywords: ['workbench', 'workbench template', 'bench template', '6 foot bench'],
    answer: 'The workbench template starts you with a 6 ft × 24" top, four 3.5×3.5 legs, and four stretchers. Classic shop-bench proportions, all in pine. Go to File → New from Template to load it.',
  },
  {
    id: 'bookshelf-template',
    topic: 'Bookshelf template',
    keywords: ['bookshelf', 'bookcase', 'shelf template', 'bookshelf template'],
    answer: 'The bookshelf template gives you a 36" wide × 72" tall bookcase with sides, top, bottom, four shelves, and a back panel — all in pine. File → New from Template to load it.',
  },
  {
    id: 'cabinet-template',
    topic: 'Cabinet template',
    keywords: ['cabinet', 'cabinet template', 'face frame', 'kitchen cabinet'],
    answer: 'The cabinet template is a 24" wide × 18" deep × 36" tall face-frame cabinet with sides, top, bottom, two doors, a back panel, and a shelf. File → New from Template.',
  },
  {
    id: 'side-table-template',
    topic: 'Side table template',
    keywords: ['side table', 'end table', 'table template', 'small table'],
    answer: 'The side table template is a simple 18" × 18" table with four legs and four aprons — a clean, beginner-friendly design. File → New from Template.',
  },
  {
    id: 'bed-frame-template',
    topic: 'Bed frame template',
    keywords: ['bed frame', 'queen bed', 'bed template', 'headboard template'],
    answer: 'The bed frame template is a queen-size frame with headboard, two side rails, footboard, and three support slats. All pre-sized in pine. File → New from Template.',
  },
  {
    id: 'snap-to-grid-how',
    topic: 'Snap to grid',
    keywords: ['snap to grid', 'grid snap', 'snap grid', 'align to grid'],
    answer: 'When Snap to Grid is ON (press G to toggle), boards snap to the nearest 1-inch grid intersection as you drag them. An amber chip in the top-right corner shows when it\'s active.',
  },
  {
    id: 'zoom-in-more',
    topic: 'Zoom closer',
    keywords: ['zoom in', 'zoom closer', 'too far', 'can\'t zoom', 'zoom limit'],
    answer: 'You can zoom in extremely close now — scroll your mouse wheel or pinch to zoom all the way in for detailed work on joints and edges.',
  },
  {
    id: 'redo-shortcut',
    topic: 'Redo shortcut',
    keywords: ['redo', 'ctrl y', 'ctrl shift z', 'redo shortcut'],
    answer: 'Ctrl+Y (or Ctrl+Shift+Z) redoes the last undone action. Ctrl+Z undoes.',
  },
  {
    id: 'dimension-line-anchored',
    topic: 'Dimension line follows board',
    keywords: ['dimension line moves', 'measurement moves', 'line follows board', 'anchored dimension'],
    answer: 'Dimension lines placed on a board\'s surface are anchored to that board — they\'ll follow it when you move the board around the scene.',
  },
  {
    id: 'deselect-board',
    topic: 'Deselect',
    keywords: ['deselect', 'click empty', 'unselect', 'clear selection'],
    answer: 'Click anywhere on the grid floor or empty space to deselect the current board, dimension line, or dot. Everything clears on an empty click.',
  },
  {
    id: 'dots-too-small',
    topic: 'Join dots hard to click',
    keywords: ['dots too small', 'hard to click', 'can\'t click dot', 'dot too small', 'join dot'],
    answer: 'Zoom in closer — the dots get easier to click the more you zoom in. All interactive dots have larger invisible hitboxes to help.',
  },
  {
    id: 'measure-straight-line',
    topic: 'Measure tool straight line',
    keywords: ['measure straight', 'measure tool axis', 'straight measurement', 'lock angle'],
    answer: 'The measure tool snaps to 0°, 90°, 180°, and 270° automatically when you\'re close to a straight axis. Hold Shift to draw at any free angle instead.',
  },
  {
    id: 'measure-edge-snap',
    topic: 'Measure tool edge snap',
    keywords: ['measure snap', 'edge snap', 'snap to edge', 'blue dot measure', 'corner snap', 'yellow dot measure'],
    answer: 'The measure tool snaps to every corner, edge, and face on a board, for both the start and end point. The dot changes color to tell you what it snapped to: green means the center of a face, blue means the middle of an edge, and bright yellow means an exact corner. A plain gray dot means it is not snapped to anything — it will place exactly where you clicked.',
  },
  {
    id: 'measure-width-now-follows',
    topic: 'Measuring a board\'s width now follows correctly',
    keywords: ['measure width', 'cross axis dimension', 'width measurement not following', 'dimension line width', 'measure across board'],
    answer: 'As of Phase 17, measuring across a board\'s width (the narrow side, not the long edge) correctly follows the board when you move or rotate it, just like length measurements always have. If you placed a width measurement before this update, re-place it to get the fix.',
  },
  {
    id: 'rotation-live-angle',
    topic: 'Rotation live angle badge',
    keywords: ['rotation angle', 'rotation badge', 'live angle', 'current angle', 'degree badge'],
    answer: 'While rotating a board, an amber badge shows the current angle right on the board in the 3D view. The axis (X, Y, or Z) and degrees update live as you drag.',
  },
  {
    id: 'bill-of-materials',
    topic: 'Bill of Materials',
    keywords: ['bill of materials', 'bom', 'materials list', 'shopping list', 'lumber list'],
    answer: 'Press B (or click the BOM button in the toolbar) to see a full lumber shopping list for your project. It calculates nominal sizes, board feet, and estimated cost automatically.',
  },
  {
    id: 'how-much-lumber',
    topic: 'How much lumber do I need',
    keywords: ['how much lumber', 'how many boards', 'lumber needed', 'materials needed', 'what to buy'],
    answer: 'Open the Bill of Materials panel (press B) — it groups all your boards by species and size, rounds up to standard lumber lengths, and shows total board feet and estimated cost.',
  },
  {
    id: 'export-shopping-list',
    topic: 'Export shopping list',
    keywords: ['export bom', 'export csv', 'download shopping list', 'lumber yard list', 'csv'],
    answer: 'In the Bill of Materials panel, click "Export CSV" to download a spreadsheet-ready shopping list you can take to the lumber yard.',
  },
  {
    id: 'dimension-line-vertical-face',
    topic: 'Dimension line on vertical face',
    keywords: ['dimension line vertical', 'measure side face', 'measure front face', 'measure wall', 'measure vertical'],
    answer: 'The measure tool (press D) works on any face — top, bottom, front, back, or side. Just click directly on the face you want to measure. The line draws right on that surface.',
  },
  {
    id: 'dimension-line-follow-board',
    topic: 'Dimension line follows board',
    keywords: ['dimension line move', 'measurement follow', 'dim line attached', 'measure moves with board'],
    answer: 'Dimension lines placed on a board face are anchored to that board. When you move the board, the dimension line moves with it automatically.',
  },
  {
    id: 'centerline-follow-board',
    topic: 'Centerline follows board',
    keywords: ['centerline move', 'centerline follow', 'cl marker move', 'centerline attached'],
    answer: 'Centerline markers are attached to their board and follow it wherever it goes. Move the board and the centerline moves too.',
  },
  {
    id: 'rotation-ring-how-to-use',
    topic: 'Rotation ring how to use',
    keywords: ['rotation ring', 'how to rotate', 'rotate board', 'spin board', 'rotate tool'],
    answer: 'Select a board and press Tab to switch to rotate mode. Three colored rings appear: red for X, green for Y, blue for Z. Drag any ring to rotate. A floating badge shows the current angle.',
  },
  {
    id: 'snap-rotation-to-angle',
    topic: 'Snap rotation to angle',
    keywords: ['snap rotation', 'rotate 45', 'rotate 90', 'exact angle', 'set rotation degree'],
    answer: 'While in rotate mode, use the quick-snap buttons (0, 45, 90, 135, 180 degrees) in the tool panel on the left, or type a number in the degree field and press Enter.',
  },
  {
    id: 'mate-boards-group',
    topic: 'Mated boards move together',
    keywords: ['mate group', 'boards move together', 'mated move', 'group boards', 'snap together move'],
    answer: 'After mating two boards together, they move as one group. Grab either board and the other follows. The tool panel shows an Unmate button when a grouped board is selected.',
  },
  {
    id: 'mate-rotate-now-works',
    topic: 'Rotating a mated board',
    keywords: ['rotate mated board', 'rotate group', 'rotating deselects', 'mate rotate broken', 'rotate boards together'],
    answer: 'As of Phase 17, rotating a board that is part of a mate group correctly rotates the whole group together, the same way moving it already did. Earlier versions could lose your selection when you rotated a mated board — that is now fixed.',
  },
  {
    id: 'unmate-boards',
    topic: 'Unmate boards',
    keywords: ['unmate', 'separate boards', 'ungroup boards', 'remove mate', 'break mate'],
    answer: 'Select a mated board and look at the tool panel on the left. Click "Unmate This Board" to remove just that one from the group, or "Unmate All" to fully separate the group. Boards stay in place.',
  },
  {
    id: 'dimension-line-to-cut-not-showing',
    topic: 'Dimension line to cut button not showing',
    keywords: ['convert to cut', 'dim to cut', 'dimension line cut button', 'cross cut from line', 'rip cut from line'],
    answer: 'Make sure the dimension line was placed on a board face (not the floor). Select the line — if it is anchored to a board, the Convert to Cross Cut or Convert to Rip Cut button will appear in the tool panel.',
  },
  {
    id: 'mate-boards-step-by-step',
    topic: 'How to mate boards step by step',
    keywords: ['mate boards step by step', 'how to mate', 'join boards', 'connect boards', 'mate tool'],
    answer: 'Press J to turn on the mate tool, then click a face dot on the first board — it stays still. Click a face dot on the second board and it snaps to the first. The tool stays on so you can keep joining more boards.',
  },
  {
    id: 'mated-boards-move-together-realtime',
    topic: 'Mated boards move together in real time',
    keywords: ['mated boards drag', 'group moves together', 'mate real time', 'mate lag', 'boards move at same time'],
    answer: 'Boards that are mated move together as a group while you drag, not just after you let go. Select either board and drag — both move at the same time.',
  },
  {
    id: 'deselect-click-grid',
    topic: 'Deselect by clicking the grid',
    keywords: ['deselect', 'click empty space', 'click grid floor', 'unselect board', 'close radial wheel'],
    answer: 'Click anywhere on the grid floor to deselect the current board, dimension line, or centerline marker, and close the radial wheel.',
  },
  {
    id: 'dimension-line-follows-board',
    topic: 'Dimension line stays on the board face',
    keywords: ['dimension line move with board', 'dim line stuck', 'measurement follows board', 'dimension line anchored'],
    answer: 'Dimension lines placed on a board face are anchored directly to that board, so they now move and rotate with it automatically — no more lines left behind.',
  },
  {
    id: 'new-boards-overlapping',
    topic: 'New boards overlapping at the same spot',
    keywords: ['new board overlapping', 'boards stacked', 'boards on top of each other', 'spawn position'],
    answer: 'New boards added from the Shapes panel or the quick-add form now spawn in an open spot near your other boards instead of stacking on top of them at the center.',
  },
];
