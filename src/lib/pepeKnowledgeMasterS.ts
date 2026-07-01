import type { KnowledgeEntry } from './pepeKnowledge';

export const PEPE_KNOWLEDGE_MASTER_S: KnowledgeEntry[] = [
  // ── WOOD MOVEMENT ─────────────────────────────────────────────────────────
  {
    id: 'ms-movement-why-it-happens',
    topic: 'Why wood expands and contracts with the seasons',
    keywords: ['wood', 'movement', 'expand', 'contract', 'why', 'humidity', 'seasonal'],
    answer: 'Wood is hygroscopic — it absorbs and releases moisture from the surrounding air, swelling in humid conditions and shrinking in dry ones, even long after it has been kiln-dried and built into furniture. This movement happens mainly across the grain (width and thickness), not along its length, which is why a wide tabletop panel visibly changes width slightly between summer and winter while a table leg barely changes length at all.',
  },
  {
    id: 'ms-movement-across-vs-along-grain',
    topic: 'Why wood moves across the grain but not along its length',
    keywords: ['movement', 'across', 'grain', 'along', 'length', 'difference', 'why'],
    answer: 'Wood cells are long, straw-like tubes running along the length (grain direction) of a board — that structure resists expansion lengthwise almost entirely, but the cell walls readily absorb and release moisture across their width and thickness, causing visible seasonal movement in those directions. This is why designs must always plan for width-wise movement in wide panels, but rarely need to worry about length-wise movement.',
  },
  {
    id: 'ms-movement-breadboard-ends',
    topic: 'How breadboard ends accommodate wood movement',
    keywords: ['breadboard', 'ends', 'movement', 'accommodate', 'design', 'tabletop'],
    answer: 'A breadboard end is a strip of wood capping the end grain of a tabletop, oriented with its own grain running perpendicular to the tabletop\'s grain. Because the two pieces want to move in different directions as humidity changes, breadboard ends are attached with mechanisms that allow slip — elongated mortise/peg holes or a tongue-and-groove with only the center point glued — so the joint does not crack as the seasons change.',
  },
  {
    id: 'ms-movement-slotted-screw-holes',
    topic: 'Why some furniture screw holes are slotted instead of round',
    keywords: ['slotted', 'screw', 'holes', 'movement', 'wide', 'panel', 'attach'],
    answer: 'When attaching a wide panel (like a tabletop) to a base or apron, using elongated (slotted) screw holes lets the panel expand and contract across its width without splitting, since the screw can slide slightly within the slot as the wood moves. A fixed screw or rigid metal bracket at every attachment point instead would eventually crack the panel as it tries to move and cannot.',
  },
  {
    id: 'ms-movement-floating-panels',
    topic: 'Why cabinet door panels "float" in a frame',
    keywords: ['floating', 'panel', 'frame', 'and', 'panel', 'door', 'movement'],
    answer: 'In a frame-and-panel door, the center panel sits in a groove but is not glued in (except sometimes a single center point) — it is left to "float" so it can expand and contract within the groove without pushing the surrounding frame apart or, if the panel shrinks, leaving a visible gap. This is the standard solution for any solid-wood panel captured inside a rigid frame.',
  },
  {
    id: 'ms-movement-estimate-percent',
    topic: 'Rough sense of how much a wood panel can move seasonally',
    keywords: ['movement', 'how', 'much', 'estimate', 'seasonal', 'shrink', 'swell'],
    answer: 'The amount of seasonal movement varies significantly by species, cut (quartersawn moves notably less than flatsawn), and your local climate\'s humidity swings — there is no single universal number, but a common rule of thumb is that a wide flatsawn panel (say 24" across) can visibly gain or lose a noticeable fraction of an inch in width between a humid summer and a dry winter indoors. For any design with wide solid-wood panels, plan movement allowance rather than assuming the wood will stay exactly the size it was on the day you built it.',
  },
  {
    id: 'ms-movement-acclimate-lumber',
    topic: 'Why lumber needs to acclimate before building',
    keywords: ['acclimate', 'lumber', 'before', 'building', 'moisture', 'content', 'wait'],
    answer: 'Freshly purchased lumber usually has a different moisture content than the room it will ultimately live in, so it is common practice to let boards sit (stickered, with airflow between them) in your shop for at least several days to a couple weeks before final milling and building — this lets the wood reach equilibrium with your local humidity so it does not warp or shrink significantly after the piece is already assembled.',
  },
  {
    id: 'ms-movement-cross-grain-construction',
    topic: 'Why gluing two boards with grain running perpendicular is risky',
    keywords: ['cross', 'grain', 'construction', 'perpendicular', 'risky', 'crack', 'glue'],
    answer: 'Gluing two solid wood pieces together with their grain directions perpendicular to each other (cross-grain construction) locks two pieces that want to expand and contract in different directions rigidly together — as humidity changes, the internal stress this creates commonly causes cracking, usually in the piece that is trying to move but cannot. This is exactly the problem breadboard-end joinery and floating panels are specifically designed to avoid.',
  },
  // ── HOW DOVEDESIGN CONCEPTS MAP TO REAL PRACTICE (CATEGORY C) ────────────
  {
    id: 'ms-concept-mate-is-clamping',
    topic: 'The Mate tool models the "clamp before fasten" workflow',
    keywords: ['mate', 'clamp', 'workflow', 'model', 'real', 'shop', 'concept'],
    answer: 'In a real shop, you typically dry-fit and clamp two boards together before you commit to fastening them, so you can check the fit is right first. DoveDesign\'s Mate tool models exactly that two-step idea: mating positions the boards (the "clamp" step, done with perfect precision by the math), and choosing a join method plus placing fasteners is the actual "fasten" step — matching how a real build actually proceeds.',
  },
  {
    id: 'ms-concept-dimension-line-is-tape-measure',
    topic: 'Dimension lines are DoveDesign\'s version of a tape measure and marking pencil',
    keywords: ['dimension', 'line', 'tape', 'measure', 'pencil', 'concept', 'real', 'world'],
    answer: 'A dimension line placed with the Measure tool is the digital equivalent of holding a tape measure against a real board and marking a measurement with a pencil — except the app keeps that measurement mathematically anchored to the board face forever, so it never smudges, gets erased, or becomes wrong after the board moves, the way a pencil mark or a remembered tape measurement can.',
  },
  {
    id: 'ms-concept-cut-optimizer-is-cutlist-planning',
    topic: 'The Cut Optimizer is the digital version of planning your cut list on paper',
    keywords: ['cut', 'optimizer', 'cut', 'list', 'planning', 'paper', 'concept'],
    answer: 'Before buying lumber, experienced woodworkers often sketch out how their parts will be cut from available board lengths to avoid waste and buying too much. The Cut Optimizer automates exactly that planning step — it is the same mental exercise a woodworker does with a pencil and a lumber yard price list, just done faster and more precisely, accounting for kerf automatically.',
  },
  {
    id: 'ms-concept-centerline-is-marking-gauge',
    topic: 'Centerlines are DoveDesign\'s version of a marking gauge center-finding trick',
    keywords: ['centerline', 'marking', 'gauge', 'concept', 'real', 'world', 'trick'],
    answer: 'Finding the exact center of a board face by hand (often done with a folded strip of paper or a story stick trick) is a routine but fiddly shop task. DoveDesign\'s Centerline tool does this instantly and exactly, and — unlike a pencil mark — automatically stays correct if you resize the board afterward, so the model always reflects where the real center actually is.',
  },
  {
    id: 'ms-concept-radial-wheel-is-tool-rack',
    topic: 'The radial wheel is like reaching for the next tool on your bench',
    keywords: ['radial', 'wheel', 'tool', 'rack', 'concept', 'real', 'world', 'analogy'],
    answer: 'Selecting a board and choosing an action from the radial wheel (Dims, Mate, Edge, Flip, Delete) mirrors picking up the next appropriate tool at your workbench once you have a part in hand — the wheel just keeps the "tools" one click away instead of requiring you to dig through menus, similar to how a well-organized shop keeps frequently used tools within arm\'s reach.',
  },
  {
    id: 'ms-concept-bom-is-shopping-list',
    topic: 'The Bill of Materials is your shopping list, generated automatically',
    keywords: ['bill', 'of', 'materials', 'bom', 'shopping', 'list', 'concept'],
    answer: 'Instead of manually tallying up board sizes, species, and hardware from a drawing (the traditional way to build a shopping list before a lumber yard trip), the Bill of Materials reads that information directly off your actual model, so the list can never fall out of sync with what you have actually designed.',
  },
  {
    id: 'ms-concept-why-parametric-matters',
    topic: 'Why DoveDesign recalculates everything instead of remembering fixed positions',
    keywords: ['parametric', 'recalculate', 'why', 'matters', 'stable', 'reliable'],
    answer: 'In plain terms: rather than the app remembering "this dimension line sits at this exact spot in the room," it remembers "this dimension line sits at this exact spot ON THIS BOARD\'S FACE," and works out the room position fresh every time. That is why moving or rotating a board no longer leaves dimension lines, centerlines, or joints behind — everything about the board follows it automatically because it was never actually stored anywhere else.',
  },
  {
    id: 'ms-concept-mate-constraint-vs-remembered-delta',
    topic: 'Why mated boards move together correctly now, in plain terms',
    keywords: ['mate', 'constraint', 'remembered', 'delta', 'plain', 'terms', 'why', 'works'],
    answer: 'Early versions of the mate tool worked by copying a position once when two boards touched, so if one board moved afterward the app had no memory of WHY they were connected — just a stale snapshot. The current version instead remembers the actual rule ("these two faces touch, flush, no gap") and re-solves both boards\' positions from that rule every time anything changes, the same way a real clamp continuously holds two faces together rather than just recording where they happened to be a moment ago.',
  },
  // ── MISC WOODWORKING KNOWLEDGE ROUND-OUT ─────────────────────────────────
  {
    id: 'ms-misc-plywood-thickness-actual',
    topic: 'Plywood is also undersized from its labeled thickness',
    keywords: ['plywood', 'thickness', 'actual', 'undersized', 'nominal', '3/4'],
    answer: 'Like dimensional lumber, plywood is often sold slightly thinner than its labeled size — a sheet labeled 3/4" is commonly closer to 23/32" or even a bit less, especially imported product. Measure your actual sheet with calipers before sizing dado or groove widths meant to hold it, since a dado cut for a "true" 3/4" will be loose on undersized plywood.',
  },
  {
    id: 'ms-misc-grain-direction-planing',
    topic: 'Reading grain direction before hand planing',
    keywords: ['grain', 'direction', 'planing', 'tearout', 'read', 'hand', 'plane'],
    answer: 'Hand planing (or jointing/routing) against the grain direction tends to lift and tear fibers instead of slicing them cleanly, leaving a rough, torn surface. Look at the board\'s edge grain lines — if they run "uphill" away from you as you push the plane, you are usually planing with the grain; if the lines dive down and away, you are likely against it. When in doubt, take a light test pass and check the result before committing to full-depth passes.',
  },
  {
    id: 'ms-misc-end-grain-glue-weak',
    topic: 'Why end-grain-to-end-grain glue joints are weak',
    keywords: ['end', 'grain', 'glue', 'weak', 'joint', 'reinforce'],
    answer: 'End grain is like the open end of a bundle of straws — glue soaks in and does not form the same strong film bond it does on long-grain (face or edge) surfaces, making a plain end-grain-to-end-grain glue joint (like a simple mitered picture frame corner) relatively weak on its own. Reinforcing with a spline, biscuit, dowel, or mechanical fastener is standard practice anywhere two end-grain surfaces meet.',
  },
  {
    id: 'ms-misc-moisture-meter',
    topic: 'Using a moisture meter before building',
    keywords: ['moisture', 'meter', 'use', 'before', 'building', 'check', 'lumber'],
    answer: 'A moisture meter measures how much water is still in a board, which helps confirm lumber has dried enough (and acclimated to your shop) before building — a common target for interior furniture is roughly 6–8% moisture content, though this varies by region. Building with lumber that is still too wet is a common cause of cracking and warping after the piece is finished, as the wood continues drying and shrinking in place.',
  },
  {
    id: 'ms-misc-figure-vs-grain',
    topic: 'Figure vs grain — what the terms mean',
    keywords: ['figure', 'grain', 'difference', 'terms', 'mean', 'curl', 'burl'],
    answer: '"Grain" generally refers to the direction and pattern of the wood fibers (straight, interlocked, spiral). "Figure" refers to decorative visual patterns caused by unusual grain structure — curl/fiddleback, quilted, burl, bird\'s-eye — that show up regardless of the underlying grain direction. Highly figured wood is often prized (and priced) for its appearance but can be trickier to plane and finish evenly because of its irregular structure.',
  },
  {
    id: 'ms-misc-cupping-warping-causes',
    topic: 'What causes a board to cup or warp',
    keywords: ['cupping', 'warping', 'causes', 'why', 'board', 'bend'],
    answer: 'Cupping (a board curling across its width) is usually caused by uneven moisture exposure — one face drying or absorbing moisture faster than the other, often from being stored flat on a damp floor or finished on only one side. Flatsawn boards are more prone to cupping than quartersawn boards. Storing lumber stickered (with spacers for airflow on all sides) and finishing both faces of a panel evenly both reduce the risk.',
  },
];
