export interface KnowledgeEntry {
  id: string;
  keywords: string[];
  topic: string;
  answer: string;
}

export const PEPE_KNOWLEDGE: KnowledgeEntry[] = [
  {
    id: 'draw-board',
    topic: 'How to draw or place a board',
    keywords: ['draw', 'place', 'board', 'footprint', 'extrude', 'grid'],
    answer:
      'Select the Draw tool from the left tool ribbon. Click and drag on the grid to sketch a rectangle footprint — that becomes your board length and width. Release to create the board. You can also use Add to type exact dimensions and species from the Inspector panel.',
  },
  {
    id: 'select-move',
    topic: 'Select, move, rotate, and scale',
    keywords: ['select', 'move', 'rotate', 'scale', 'gizmo', 'transform'],
    answer:
      'Click a board to select it. Use the Move, Rotate, or Scale buttons in the Inspector to change the gizmo mode. Drag the colored arrows or rings to transform. Hold angle snap for 15°, 45°, or 90° rotation steps. Left-click empty space to deselect.',
  },
  {
    id: 'mate-tool',
    topic: 'Using the Mate tool',
    keywords: ['mate', 'face', 'flush', 'align', 'snap'],
    answer:
      'Pick Mate from the tool ribbon or radial wheel. Click a face on the first board, then click a face on a second board. They snap flush automatically. You can also use the face grid overlay — hover a face to see ¼" snap points, then click to set an attachment offset before mating.',
  },
  {
    id: 'face-grid',
    topic: 'Face grid overlay and quarter-inch snap',
    keywords: ['grid', 'snap', 'quarter', 'face', 'overlay', 'attach'],
    answer:
      'With the Mate tool active, hover any board face to see a yellow grid at ¼" increments. Click a grid intersection to set where the joint origin sits relative to the face center. A small amber sphere marks your chosen point.',
  },
  {
    id: 'attachment-points',
    topic: 'Placing and naming attachment points',
    keywords: ['attachment', 'point', 'name', 'connect'],
    answer:
      'Double-click a face while the Mate tool is active to drop a named attachment point. Double-click a second point on another board to connect them — the second board moves so the points meet. Points show as labeled cyan markers in the viewport.',
  },
  {
    id: 'radial-wheel',
    topic: 'Radial orbital selector wheel',
    keywords: ['radial', 'wheel', 'orbital', 'selector', 'menu'],
    answer:
      'When you select a board, a compact HUD wheel appears at the top-left of its screen outline — pill buttons for Dims, Mate, Join, Edge, and more. Click ••• to collapse it without deselecting. Join Method needs at least one mate first.',
  },
  {
    id: 'join-subwheel',
    topic: 'Join method sub-wheel',
    keywords: ['join', 'method', 'screws', 'nails', 'glue', 'dowel', 'biscuit'],
    answer:
      'After mating two boards, open Join Method from the radial wheel. Choose Screws, Nails, Glue, Pocket Holes, Biscuit, Dowel, Bracket, or Mortise & Tenon. Glue and mortise skip fastener placement; other methods enter placement mode so you can click joint faces on the ¼" grid.',
  },
  {
    id: 'fasteners',
    topic: 'Placing physical fasteners',
    keywords: ['fastener', 'screw', 'nail', 'place', 'joint', 'hardware'],
    answer:
      'After choosing a join method (except Glue or Mortise & Tenon), you enter Fastener Placement Mode. Hover the joint face to see the snap grid, click to place each fastener. Press Escape or Done Placing when finished. Click a fastener to see its info panel and remove it if needed.',
  },
  {
    id: 'cut-list',
    topic: 'Reading and exporting the cut list',
    keywords: ['cut', 'list', 'nesting', 'lumber', 'sheet', 'export'],
    answer:
      'Open the Cut List tab in the right sidebar. Dimensional lumber is nested onto 8, 10, and 12-foot sticks with kerf accounted for. Sheet goods show a 48×96 layout diagram. Fastener counts appear at the bottom. Save your project as a .wcad file to keep everything together.',
  },
  {
    id: 'estimating',
    topic: 'Using the estimating panel',
    keywords: ['estimating', 'cost', 'price', 'tax', 'waste', 'ledger'],
    answer:
      'The Estimating tab groups boards by species and size. Set price per LF, BF, or SF for each group. Enable waste buffer and tax rate as needed. Hardware and finishes add to the total. Boards without prices trigger a Pepe suggestion.',
  },
  {
    id: 'save-load',
    topic: 'Saving and loading a wcad file',
    keywords: ['save', 'load', 'wcad', 'file', 'project'],
    answer:
      'Use File → Save Project in the top ribbon to download a .wcad file. File → Open Project loads one back. Autosave keeps your last session in the browser — but save a .wcad file for backups you control.',
  },
  {
    id: 'undo-redo',
    topic: 'Undo and redo',
    keywords: ['undo', 'redo', 'history', 'mistake'],
    answer:
      'Click Undo or Redo in the top ribbon, or press Ctrl+Z and Ctrl+Y. Dimension edits in the floating panel commit to history when you blur a field or deselect the board.',
  },
  {
    id: 'nominal-actual',
    topic: 'Nominal vs actual dimensions',
    keywords: ['nominal', 'actual', '2x4', 'surfaced', 'dimension'],
    answer:
      'Lumber is sold by nominal size (like 2×4) but planed to actual inches — a 2×4 is really about 1½" × 3½". DoveDesign stores actual inches everywhere. The Quick Dimensions panel shows nominal equivalents when your board matches a standard size.',
  },
  {
    id: 'pocket-holes',
    topic: 'Pocket holes in DoveDesign',
    keywords: ['pocket', 'hole', 'kreg', 'angled', 'screw'],
    answer:
      'Apply pocket holes from the Joinery tool or choose Pocket Holes as a join method after mating. CSG cuts angled pilot holes on both mating faces. Great for face frames and cabinet boxes — keep them on the hidden side of show faces.',
  },
  {
    id: 'quick-dimensions',
    topic: 'Quick Dimensions floating panel',
    keywords: ['quick', 'dimensions', 'floating', 'length', 'width', 'height'],
    answer:
      'Select any board and the Quick Dimensions panel appears at the top-right of its screen bounding box. Edit L, W, and H in actual inches. Changes apply live; undo history records when you tab out or deselect. Open it anytime from the radial wheel.',
  },
  {
    id: 'engineering',
    topic: 'Engineering and beam deflection',
    keywords: ['engineering', 'deflection', 'beam', 'span', 'load', 'structural'],
    answer:
      'The Engineering tab runs a simple beam deflection check. Set each member\'s orientation (flat or on-edge), span, species, and uniform load in lbs. Results show deflection vs recommended limits. It is a guide — not a substitute for an engineer on critical loads.',
  },
  {
    id: 'nesting',
    topic: 'Sheet and lumber nesting',
    keywords: ['nesting', 'sheet', 'lumber', 'optimize', 'kerf', 'waste'],
    answer:
      'Cut List automatically bins dimensional parts onto standard stick lengths and packs sheet parts on 48×96 panels. Kerf is ⅛" between cuts. Review waste bars and sheet diagrams before you head to the saw.',
  },
  {
    id: 'screws-vs-nails',
    topic: 'When to use screws vs nails vs glue',
    keywords: ['screw', 'nail', 'glue', 'when', 'choose'],
    answer:
      'Screws give strong, removable joints — great for cabinets and furniture that may need service. Nails are fast for framing and backs where sheer strength matters and disassembly is not needed. Glue adds surface-area strength on long grain-to-grain joints; combine glue with screws or clamps for best results.',
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
    keywords: ['dowel', 'align', 'drill', 'jig'],
    answer:
      'Dowels align parts and add shear strength. Use a dowel jig or center marks for hole alignment. Typical diameters are ⅜" or ½" depending on stock thickness. DoveDesign places dowel geometry at ¼" snap on your joint face.',
  },
  {
    id: 'biscuits',
    topic: 'Biscuits and biscuit joiners',
    keywords: ['biscuit', 'plate', 'joiner', 'alignment'],
    answer:
      'Compressed wood biscuits swell in glue slots to align panel glue-ups like tabletops. A biscuit joiner cuts the slots. Good for alignment more than heavy structure — pair with glue across long grain.',
  },
  {
    id: 'mortise-tenon',
    topic: 'Mortise and tenon joinery',
    keywords: ['mortise', 'tenon', 'strong', 'chair', 'table'],
    answer:
      'A tenon on one part fits a mortise pocket in another — among the strongest traditional joints for chairs, tables, and doors. DoveDesign highlights tenon CSG when you pick Mortise & Tenon as the join method.',
  },
  {
    id: 'dovetails',
    topic: 'Dovetail joints',
    keywords: ['dovetail', 'drawer', 'box', 'hand cut'],
    answer:
      'Dovetails interlock wedge-shaped pins and tails — excellent for drawers and boxes that resist pulling apart. Use the Joinery tool for decorative CSG previews. Hand-cut dovetails take practice; routers and jigs speed production work.',
  },
  {
    id: 'finger-box',
    topic: 'Finger and box joints',
    keywords: ['finger', 'box', 'joint', 'router', 'jig'],
    answer:
      'Finger (box) joints use square interlocking fingers on corners — strong in glue and great for boxes and drawers. Dovetails taper for pull-out resistance; fingers are simpler to machine with a table saw jig or router.',
  },
  {
    id: 'grain-direction',
    topic: 'Wood grain direction',
    keywords: ['grain', 'direction', 'tearout', 'strength'],
    answer:
      'Grain runs along the length of a board. Long-grain glue joints are strongest. Cross-grain joints need allowance for wood movement. Route and plane with the grain when possible to reduce tear-out.',
  },
  {
    id: 'board-feet',
    topic: 'Board feet calculation',
    keywords: ['board', 'feet', 'bf', 'calculate', 'lumber'],
    answer:
      'Board feet = (thickness in inches × width in inches × length in feet) ÷ 12. A 2×4×8\' nominal stick is roughly 5.33 BF in actual dimensions. DoveDesign calculates BF per member for estimating.',
  },
  {
    id: 'nominal-lumber',
    topic: 'Why a 2x4 is not 2 by 4',
    keywords: ['2x4', 'nominal', 'surfaced', 'planed', 'lumber'],
    answer:
      'Rough lumber is named by green rough size. After drying and planing to surfaced four sides (S4S), it shrinks — a 2×4 becomes about 1½" × 3½". Always build from actual dimensions on your cut list.',
  },
  {
    id: 'cut-list-marking',
    topic: 'Reading a cut list efficiently',
    keywords: ['mark', 'cut', 'list', 'efficient', 'shop'],
    answer:
      'Group same-length parts on one stick. Mark waste side away from your best face. Cut longest parts first so mistakes leave usable shorts. Note kerf between every cut.',
  },
  {
    id: 'kerf',
    topic: 'Kerf and saw blade width',
    keywords: ['kerf', 'blade', 'saw', 'waste', 'account'],
    answer:
      'Kerf is the slot removed by the blade — typically ⅛" on table saws. DoveDesign adds kerf in nesting. When cutting manually, measure to the waste side of your line.',
  },
  {
    id: 'sheet-goods',
    topic: 'Sheet goods vs solid wood',
    keywords: ['plywood', 'sheet', 'mdf', 'hdf', 'veneer'],
    answer:
      'Plywood and MDF come in 4×8 sheets — stable for backs, tops, and carcases. Solid wood suits visible edges and parts that need thickness or repair. Match grade to use: Baltic birch for drawers, CDX for shop projects.',
  },
  {
    id: 'wood-movement',
    topic: 'Wood movement across seasons',
    keywords: ['movement', 'expand', 'contract', 'humidity', 'seasonal'],
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
    keywords: ['assembly', 'order', 'sequence', 'build'],
    answer:
      'Plan which joints are reachable last. Face frames often go on after carcase glue-up. Pocket holes on interiors before backs are installed. Dry-fit sub-assemblies before final glue.',
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
    id: 'edge-treatments',
    topic: 'Edge treatments — chamfer, fillet, and more',
    keywords: ['edge', 'chamfer', 'fillet', 'round', 'rabbet', 'ogee', 'cove', 'beading'],
    answer:
      'Select a board and choose Chamfer / Edge from the radial wheel. Hover edges — they highlight amber. Click an edge, pick treatment type, depth or radius, and Apply. Use "Apply to all parallel edges" for uniform profiles on all four top edges, for example.',
  },
  {
    id: 'complex-shapes',
    topic: 'Complex shapes and primitives',
    keywords: ['shape', 'cylinder', 'sphere', 'cone', 'hexagon', 'polygon', 'primitive'],
    answer:
      'Open the Shapes group in the left tool ribbon. Click Cylinder, Sphere, Cone, Triangle, or Hexagon to add a primitive WoodMember. For Custom Polygon, click vertices on the ¼" grid, then close by clicking near the first point and enter extrusion height.',
  },
  {
    id: 'assembly-mode',
    topic: 'Assembly mode',
    keywords: ['assembly', 'explode', 'build', 'sequence', 'guide'],
    answer:
      'Switch to Assembly Mode in the top ribbon. Boards spread flat on the grid. Drag them together and mate one joint at a time — each mate records an assembly step. Open the Assembly Guide panel for the sequence. Reset Assembly spreads boards flat again.',
  },
  {
    id: 'display-modes',
    topic: 'Display modes — wireframe, x-ray, edges',
    keywords: ['display', 'wireframe', 'xray', 'x-ray', 'shaded', 'edges'],
    answer:
      'Use the Display dropdown in the top-right ribbon. Shaded is default. Wireframe shows structure only. Shaded + Edges overlays edge lines. X-Ray makes boards semi-transparent so joinery and fasteners inside stay visible.',
  },
  {
    id: 'hardware-library',
    topic: 'Hardware library',
    keywords: ['hardware', 'hinge', 'slide', 'pull', 'bracket', 'shelf pin'],
    answer:
      'Open the Hardware tab in the right sidebar. Browse drawer slides, hinges, pulls, shelf pins, cam locks, brackets, and barrel bolts. Click an item to arm placement, then click a board face in the viewport. Placed hardware appears in the list and counts toward estimating.',
  },
  {
    id: 'pepe-location',
    topic: 'Where to find Pepe',
    keywords: ['pepe', 'assistant', 'help', 'sidebar', 'frog'],
    answer:
      'Pepe lives at the bottom-right of the sidebar panel — click the green frog mascot. His panel opens upward and left, never over the viewport. Use Suggestions for live tips or Ask Pepe to search woodworking help.',
  },
  {
    id: 'continuous-draw',
    topic: 'Chaining boards while drawing',
    keywords: ['chain', 'continuous', 'draw', 'edge', 'snap', 'connect'],
    answer:
      'Keep the Draw tool active after placing a board. The next stroke snaps its start to the nearest corner or edge of the last board (amber dot). Dashed amber lines show join candidates. Press Escape to end the chain.',
  },
  {
    id: 'box-select',
    topic: 'Multi-select with drag box',
    keywords: ['select', 'multiple', 'rubber', 'band', 'box', 'shift'],
    answer:
      'In Select mode, click-drag on empty space to draw a selection rectangle. All boards whose outlines intersect the box are selected. Hold Shift while dragging to add to the current selection.',
  },
  {
    id: 'quick-join',
    topic: 'Multi-member quick join toolbar',
    keywords: ['join', 'auto', 'detect', 'miter', 'butt', 'lap', 'multi'],
    answer:
      'Select two or more boards (drag box or Shift+click). A join toolbar appears above the selection with Auto-Detect Joints, Miter, Butt Joint, Lap Joint, and Open Radial Wheel. Auto-Detect mates flush faces within 0.1 inch.',
  },
];
