import type { KnowledgeEntry } from './pepeKnowledge';

export const PEPE_KNOWLEDGE_MASTER_V: KnowledgeEntry[] = [
  // ── PROJECT-TYPE GUIDANCE ─────────────────────────────────────────────────
  {
    id: 'mv-project-tabletop-design',
    topic: 'Designing a solid wood tabletop — key considerations',
    keywords: ['tabletop', 'design', 'solid', 'wood', 'movement', 'attach', 'apron'],
    answer: 'A solid wood tabletop needs room to expand and contract across its width — attach it to the base with slotted screw holes, figure-8 fasteners, or wood buttons rather than rigid screws straight through an apron, or seasonal movement will eventually crack the top or the apron. Also plan grain orientation and glue-up sequence for the panel before you ever touch the base.',
  },
  {
    id: 'mv-project-chair-considerations',
    topic: 'Chair building — why chairs are considered advanced',
    keywords: ['chair', 'building', 'advanced', 'joinery', 'angles', 'load'],
    answer: 'Chairs are widely considered one of the harder furniture types because nearly every joint is compound-angled (seat, legs, and back are rarely square to each other) and chairs take significant repeated racking stress from people sitting, leaning back, and shifting weight — joints that look fine on a bookshelf can fail on a chair. Strong joinery (mortise-and-tenon or well-fit floating tenons) and careful angle layout matter more here than on most other furniture types.',
  },
  {
    id: 'mv-project-cabinet-carcase',
    topic: 'Cabinet/case carcase construction basics',
    keywords: ['cabinet', 'carcase', 'case', 'construction', 'basics', 'box'],
    answer: 'A cabinet carcase (the basic box structure before doors, drawers, and face frame) is usually built first and squared up carefully with a temporary diagonal brace or clamp check before anything else is attached — an out-of-square carcase makes every door and drawer that goes in afterward fight the error. Plywood carcases with solid-wood face frames are a common, stable approach that avoids solid-wood movement issues in the large case panels.',
  },
  {
    id: 'mv-project-drawer-box-basics',
    topic: 'Drawer box construction basics',
    keywords: ['drawer', 'box', 'construction', 'basics', 'bottom', 'groove'],
    answer: 'A drawer box typically uses a stronger corner joint (dovetails or box joints) since drawers see repeated racking stress from being pulled and pushed thousands of times over its life, with the bottom panel captured in a groove near the bottom edge (not glued in, so it can move) rather than just nailed on. Size the drawer box slightly smaller than the opening to leave clearance for the slides and for wood movement.',
  },
  {
    id: 'mv-project-shelving-sag',
    topic: 'Preventing shelf sag',
    keywords: ['shelf', 'sag', 'prevent', 'thickness', 'span', 'support'],
    answer: 'Shelf sag over time is mainly a function of span (distance between supports), thickness, and material — a common rule of thumb is that longer, thinner, or particleboard/MDF shelves sag more than shorter, thicker, or solid-wood/plywood shelves under the same load. If a design calls for a long span, consider a thicker shelf, an added front edge banding strip (which stiffens a shelf significantly), a center support, or a torsion-box construction rather than assuming a thin panel will hold up — for heavy loads, consider consulting published shelf span/load tables rather than guessing.',
  },
  {
    id: 'mv-project-cutting-board-design',
    topic: 'Designing a cutting board (edge grain vs end grain)',
    keywords: ['cutting', 'board', 'design', 'edge', 'grain', 'end', 'grain'],
    answer: 'An edge-grain cutting board (strips glued face-to-face, long grain facing up) is easier to build and more durable in typical use. An end-grain cutting board (small blocks arranged so the end grain faces up, like a butcher block) is more forgiving on knife edges and can "self-heal" slightly from knife marks, but is significantly more work to build and glue up successfully. Both need a food-safe finish and regular oiling to stay in good shape.',
  },
  // ── ADVANCED / SPECIALTY TECHNIQUES ──────────────────────────────────────
  {
    id: 'mv-technique-bent-lamination',
    topic: 'Bent lamination — an alternative to steam bending',
    keywords: ['bent', 'lamination', 'curve', 'bend', 'glue', 'form', 'alternative'],
    answer: 'Bent lamination creates a curved part by gluing several thin, flexible strips (resawn on a bandsaw) together over a curved form/mold, so the glued-up stack holds the curved shape once cured — an alternative to steam bending that does not require a steam box and gives very consistent, repeatable curves. It uses more material (kerf loss from resawing) and requires building an accurate form, but is generally more predictable for a beginner than steam bending.',
  },
  {
    id: 'mv-technique-veneering-basics',
    topic: 'Veneering basics — applying veneer to a substrate',
    keywords: ['veneering', 'apply', 'substrate', 'basics', 'press', 'glue'],
    answer: 'Veneering glues a thin sheet of decorative wood to a stable substrate (plywood or MDF) using contact cement, PVA with a vacuum press, or traditional hide glue with cauls/hammer veneering. A vacuum press gives the most even, reliable pressure across the whole panel, which matters because uneven pressure during veneering commonly causes bubbles or delamination later.',
  },
  {
    id: 'mv-technique-marquetry-inlay',
    topic: 'Marquetry and inlay — what they are',
    keywords: ['marquetry', 'inlay', 'decorative', 'pattern', 'veneer', 'technique'],
    answer: 'Marquetry assembles a decorative picture or pattern from cut pieces of contrasting veneer, glued down as a single composite sheet. Inlay sets a contrasting material (wood, metal, shell) into a recess cut into solid wood or a panel, flush with the surrounding surface. Both are advanced decorative techniques, generally taken up after the woodworker is comfortable with basic joinery and precise cutting.',
  },
  {
    id: 'mv-technique-french-polish',
    topic: 'French polishing — what it is',
    keywords: ['french', 'polish', 'shellac', 'traditional', 'technique', 'finish'],
    answer: 'French polishing is a traditional technique of building up many thin coats of shellac with a cloth pad ("rubber"), producing an exceptionally glossy, deep finish historically used on fine antique furniture and musical instruments. It is labor-intensive and somewhat delicate (sensitive to water and alcohol spills) compared to modern film finishes, so it is mostly used today for restoration work or by woodworkers specifically seeking that traditional look.',
  },
  {
    id: 'mv-technique-milk-paint',
    topic: 'Milk paint — properties and use',
    keywords: ['milk', 'paint', 'traditional', 'finish', 'chippy', 'farmhouse'],
    answer: 'Milk paint is a traditional water-based paint made from milk protein (casein), lime, and pigment, mixed from powder before use, giving an authentic matte, slightly chalky look popular for farmhouse and colonial-style furniture. It can be finicky to mix and apply evenly compared to modern paint, and often benefits from a topcoat (wax or clear finish) for added durability and stain resistance.',
  },
  {
    id: 'mv-technique-chalk-paint',
    topic: 'Chalk paint — properties and use',
    keywords: ['chalk', 'paint', 'furniture', 'distress', 'finish', 'popular'],
    answer: 'Chalk paint is a thick, matte furniture paint designed to adhere to many surfaces (including old finishes) with minimal sanding or priming, popular for furniture makeovers and distressed/farmhouse styles. It typically needs a wax or poly topcoat for durability, since the paint itself is fairly soft and can mark or scuff without a protective layer.',
  },
  {
    id: 'mv-technique-spray-finishing-tips',
    topic: 'Basic tips for spray-applying a finish',
    keywords: ['spray', 'finish', 'tips', 'apply', 'even', 'coat'],
    answer: 'When spraying a finish, keep the gun moving at a consistent distance and speed rather than pausing over one spot (which causes runs), overlap each pass by roughly half the spray fan width for even coverage, and always spray in a well-ventilated area or booth away from ignition sources. Doing a few practice passes on cardboard first helps dial in gun settings before spraying the actual project.',
  },
  // ── SHOP SETUP ────────────────────────────────────────────────────────────
  {
    id: 'mv-shop-workbench-essentials',
    topic: 'What makes a good woodworking workbench',
    keywords: ['workbench', 'essentials', 'good', 'sturdy', 'vise', 'flat'],
    answer: 'A good workbench needs to be heavy and rigid enough not to shift or vibrate under hand-tool work, have a flat, stable top, and typically includes a vise (front vise and/or end vise) plus dog holes for holding work with clamps or bench dogs. Height matters too — a common rule of thumb is setting bench height so you can rest your palms flat on the surface with arms relaxed, though preference varies by task and by whether you mostly hand-plane or mostly use power tools.',
  },
  {
    id: 'mv-shop-dust-collection-basics',
    topic: 'Dust collection system basics',
    keywords: ['dust', 'collection', 'system', 'basics', 'shop', 'vacuum', 'cyclone'],
    answer: 'A dust collection system (a dedicated dust collector or shop vacuum connected to individual tools) captures dust and chips at the source, which is both a respiratory health measure and a way to keep the shop cleaner and safer (less slipping on chips, less material buildup near motors). A cyclone-style separator ahead of a shop vac extends filter life significantly by dropping out heavier debris before it reaches the vacuum\'s filter.',
  },
  {
    id: 'mv-shop-layout-workflow',
    topic: 'Shop layout — planning a logical workflow',
    keywords: ['shop', 'layout', 'workflow', 'planning', 'space', 'flow'],
    answer: 'A well-planned shop layout generally follows the rough order lumber moves through a project: rough stock storage and cutting near the entry, milling machines (jointer/planer/table saw) in a central zone with room to handle long boards, then joinery and assembly area, with finishing done in a separate, cleaner, dust-free area if possible. Even a small shop benefits from thinking through this flow rather than placing tools wherever they happen to fit.',
  },
  {
    id: 'mv-shop-lumber-storage',
    topic: 'How to store lumber properly',
    keywords: ['lumber', 'storage', 'stack', 'sticker', 'store', 'warp', 'prevent'],
    answer: 'Store lumber flat (not leaning on end, which encourages warping) and stickered — stacked with thin spacer strips between each board so air can circulate evenly on all sides, which helps the whole stack dry and acclimate evenly and reduces warping. Keep stock off a concrete floor (which can hold moisture) and away from big humidity swings if possible, such as near an exterior door.',
  },
  // ── MORE MEASURING/SAFETY ROUND-OUT ──────────────────────────────────────
  {
    id: 'mv-safety-chemical-storage',
    topic: 'Storing finishing chemicals and solvents safely',
    keywords: ['chemical', 'storage', 'solvent', 'finish', 'safety', 'flammable'],
    answer: 'Most stains, finishes, and solvents (mineral spirits, lacquer thinner, denatured alcohol) are flammable and should be stored in a metal cabinet away from ignition sources (sparks, pilot lights, direct sun/heat), tightly sealed to slow evaporation and reduce fume buildup. Keep an appropriate fire extinguisher within reach of your finishing area, and never store oily rags inside a closed metal cabinet with other flammables (see oily rag spontaneous combustion).',
  },
  {
    id: 'mv-safety-electrical-shop',
    topic: 'Basic electrical safety in a home shop',
    keywords: ['electrical', 'safety', 'shop', 'gfci', 'outlet', 'extension', 'cord'],
    answer: 'Use GFCI-protected outlets in a shop, especially anywhere near moisture (finishing area, a sink, or a damp garage floor), and avoid daisy-chaining multiple extension cords or overloading a single circuit with several high-draw tools at once. Inspect cords periodically for fraying or damage and replace rather than tape over a damaged cord.',
  },
];
