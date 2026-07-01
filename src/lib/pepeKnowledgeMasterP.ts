import type { KnowledgeEntry } from './pepeKnowledge';

export const PEPE_KNOWLEDGE_MASTER_P: KnowledgeEntry[] = [
  // ── JOINERY TYPES ────────────────────────────────────────────────────────
  {
    id: 'mp-joint-mortise-tenon',
    topic: 'Mortise and tenon joint — strength and use',
    keywords: ['mortise', 'tenon', 'joint', 'strong', 'frame', 'leg', 'apron'],
    answer: 'Mortise and tenon is one of the strongest traditional joints — a tongue (tenon) on one piece fits into a matching hole (mortise) in the other, giving a large glue surface and strong resistance to racking. It is the standard joint for chair and table leg-to-apron connections, door frames, and any structural frame that needs to resist twisting. It takes more skill and setup than a pocket screw but is stronger and more historically appropriate for fine furniture.',
  },
  {
    id: 'mp-joint-dovetail',
    topic: 'Dovetail joint — strength and use',
    keywords: ['dovetail', 'joint', 'strong', 'drawer', 'box', 'interlocking'],
    answer: 'A dovetail joint interlocks angled "pins" and "tails" so the joint mechanically resists being pulled apart along the direction of pull — no clamps or fasteners are needed to hold it together while the glue cures, and it remains strong even if the glue eventually fails. It is the traditional gold-standard joint for drawer boxes and fine box/chest corners. It is the most difficult common joint to cut by hand, though router dovetail jigs make it far more approachable.',
  },
  {
    id: 'mp-joint-box-joint',
    topic: 'Box joint (finger joint) — strength and use',
    keywords: ['box', 'joint', 'finger', 'joint', 'strong', 'simple', 'jig'],
    answer: 'A box joint (finger joint) uses interlocking straight rectangular fingers rather than angled dovetails — nearly as strong as a dovetail for glue surface area, but much easier to cut with a simple table saw jig or router jig since every cut is the same width. A popular choice for boxes, drawers, and casework when you want dovetail-level strength without the hand-cutting skill requirement, though it has a more "modern/geometric" look than a dovetail.',
  },
  {
    id: 'mp-joint-biscuit',
    topic: 'Biscuit joint — strength and use',
    keywords: ['biscuit', 'joint', 'plate', 'joiner', 'alignment', 'panel'],
    answer: 'A biscuit joint uses a football-shaped compressed-wood "biscuit" glued into matching slots cut with a biscuit joiner (plate joiner) — it is primarily an alignment aid for panel glue-ups and light-duty joints rather than a major strength contributor on its own. It is fast and forgiving for edge-gluing boards into wide panels or joining face frames, but is not a substitute for mortise-and-tenon or dowels on structural, load-bearing joints.',
  },
  {
    id: 'mp-joint-pocket-screw',
    topic: 'Pocket screw joint — strength and use',
    keywords: ['pocket', 'screw', 'joint', 'jig', 'fast', 'beginner', 'kreg'],
    answer: 'Pocket screws (often cut with a Kreg-style jig) drill an angled hole so a screw can be driven diagonally through one board into another, pulling the joint tight without visible fasteners on the face. It is fast, beginner-friendly, and strong enough for face frames, cabinet carcasses, and shop furniture, though it is generally considered less strong and less elegant than a mortise-and-tenon for chairs, tables, or anything that will see racking stress over years of use.',
  },
  {
    id: 'mp-joint-dowel',
    topic: 'Dowel joint — strength and use',
    keywords: ['dowel', 'joint', 'pin', 'alignment', 'strength', 'jig'],
    answer: 'A dowel joint uses round wooden pins glued into matching drilled holes in both pieces — a traditional, moderately strong joint that depends heavily on precise hole alignment (a doweling jig helps a lot here). It is a reasonable middle ground between biscuits (alignment-focused) and mortise-and-tenon (maximum strength), often used in cabinet-grade furniture and chair joints where mortise-and-tenon would be overkill.',
  },
  {
    id: 'mp-joint-lap-joint',
    topic: 'Lap joint (half-lap) — strength and use',
    keywords: ['lap', 'joint', 'half', 'lap', 'simple', 'frame', 'strength'],
    answer: 'A lap joint removes half the thickness from each of two overlapping pieces so they sit flush when joined, giving a large glue surface with a relatively simple cut (a dado stack or router makes quick work of it). Half-laps are common at frame corners, cross-braces, and shelf/divider intersections — strong and easy to cut, though visually less refined than a mortise-and-tenon since the joint line is visible on two faces.',
  },
  {
    id: 'mp-joint-difficulty-ranking',
    topic: 'Joint difficulty — beginner to advanced ranking',
    keywords: ['joint', 'difficulty', 'beginner', 'easiest', 'hardest', 'skill', 'level'],
    answer: 'As a rough beginner-to-advanced ranking: pocket screws and dowels are the easiest to learn and jig-assisted; biscuits and box joints (with a jig) are next, mostly about accurate setup; lap joints and simple mortise-and-tenon come next, requiring careful layout and clean square cuts; hand-cut dovetails and complex joinery (through-tenons, wedged joints) sit at the advanced end, rewarding practice and patience. Pick a joint that matches your current comfort level rather than the "fanciest" option — a well-executed pocket screw joint beats a sloppy dovetail.',
  },
  {
    id: 'mp-joint-choosing',
    topic: 'How to choose which joint to use',
    keywords: ['choose', 'joint', 'which', 'pick', 'best', 'right', 'select'],
    answer: 'A common rule of thumb for choosing a joint: consider how visible it will be (hidden joints can use pocket screws or dowels; visible ones often look better as dovetails or exposed joinery), how much load or racking stress it will see (chairs and tables benefit from mortise-and-tenon strength), your available tools, and your skill/time budget. There is rarely one "correct" answer — many good pieces of furniture mix joint types depending on what each connection needs to do.',
  },
  // ── FASTENERS & HARDWARE ─────────────────────────────────────────────────
  {
    id: 'mp-screw-gauge',
    topic: 'Wood screw gauge — what the number means',
    keywords: ['screw', 'gauge', 'number', 'size', 'diameter', 'choose'],
    answer: 'Screw gauge is a number (commonly #6 through #14 for woodworking) indicating the shank diameter — a higher gauge number means a thicker screw. A common rule of thumb: #6–#8 screws suit light joinery and hardware mounting, #8–#10 suit general furniture assembly, and #10–#14 suit heavier structural connections. Pick a gauge appropriate to the thickness of wood you are screwing into — too large a screw in thin stock risks splitting it.',
  },
  {
    id: 'mp-screw-length',
    topic: 'Choosing wood screw length',
    keywords: ['screw', 'length', 'choose', 'penetration', 'depth', 'how', 'long'],
    answer: 'A common rule of thumb for screw length: the screw should penetrate at least half to two-thirds of the way into the receiving (bottom) piece for good holding strength, without poking all the way through. For a 3/4" thick board being screwed into another 3/4" board, that generally means a screw around 1 1/4"–1 1/2" long, but always check the actual combined material thickness before choosing.',
  },
  {
    id: 'mp-screw-pilot-hole',
    topic: 'Why and how to drill a pilot hole',
    keywords: ['pilot', 'hole', 'drill', 'split', 'screw', 'prevent'],
    answer: 'A pilot hole is a hole drilled slightly smaller than the screw before driving it, which prevents the wood from splitting (especially near edges or in hardwoods) and makes the screw go in straighter and easier. A common rule of thumb: use a drill bit close to the screw\'s minor (root) diameter, and always pilot-drill near the end grain or edge of a board, and always in hardwoods, dense woods, or brittle exotics.',
  },
  {
    id: 'mp-nails-vs-screws',
    topic: 'Nails vs screws — when to use each',
    keywords: ['nails', 'screws', 'versus', 'difference', 'choose', 'fastener'],
    answer: 'Screws have much greater holding and pull-out resistance than nails and are easy to remove, making them the better choice for most furniture and structural joinery. Nails are faster to drive, have some flex/give (useful in trim work that will see wood movement), and are the traditional choice for finish trim, small moldings, and temporary assembly/glue-up clamping. As a rule of thumb: use screws where strength and future disassembly matter, nails where speed and slight flexibility matter more.',
  },
  {
    id: 'mp-glue-pva',
    topic: 'PVA (yellow/white) glue — properties and use',
    keywords: ['pva', 'yellow', 'glue', 'wood', 'glue', 'titebond', 'common'],
    answer: 'PVA glue (yellow carpenter\'s glue, e.g. Titebond) is the everyday go-to wood glue — strong, easy to use, sands well once dry, and forms a bond that is often stronger than the wood itself when done correctly. It has a working (open) time of several minutes and typically needs clamping for 30–60 minutes, with full cure over 24 hours. Not waterproof by default (though "Type II/III" waterproof-rated versions exist for outdoor use) — check the label for your project\'s exposure needs.',
  },
  {
    id: 'mp-glue-epoxy',
    topic: 'Epoxy glue — properties and use',
    keywords: ['epoxy', 'glue', 'two', 'part', 'gap', 'filling', 'waterproof'],
    answer: 'Epoxy is a two-part glue (resin + hardener mixed together) that is fully waterproof, gap-filling (unlike PVA, which needs tight-fitting joints), and bonds well to non-wood materials like metal, glass, or stone as well as wood. It is more expensive and messier to use than PVA, and cure/working times vary widely by product (5-minute epoxy to 24-hour slow-cure epoxy) — pick a formulation based on how much working time you need versus how fast you want it to set.',
  },
  {
    id: 'mp-glue-hide',
    topic: 'Hide glue — properties and use',
    keywords: ['hide', 'glue', 'traditional', 'reversible', 'antique', 'repair'],
    answer: 'Hide glue is a traditional animal-protein-based glue, notable because it is reversible — a bit of heat and moisture will release the bond, which is exactly why it was historically favored for furniture that might someday need repair or disassembly (and why old antiques can often be carefully taken apart at the joints). It has a shorter open (working) time than PVA and requires either a glue pot (hot hide glue) or careful use of the liquid pre-mixed version, but is prized by furniture restorers and some traditional/period furniture makers.',
  },
  {
    id: 'mp-glue-cure-time',
    topic: 'Glue clamp time vs full cure time',
    keywords: ['glue', 'clamp', 'time', 'cure', 'dry', 'wait', 'how', 'long'],
    answer: 'Most wood glues reach enough strength to safely remove clamps within 30 minutes to 1 hour, but full cure strength — the point where the glue has reached its maximum bond strength — typically takes 24 hours. As a common rule of thumb, avoid stressing a fresh glue joint (heavy sanding, machining, or load-bearing use) until a full 24 hours has passed, even if the clamps come off sooner.',
  },
  {
    id: 'mp-hinges-types',
    topic: 'Common hinge types for furniture',
    keywords: ['hinges', 'types', 'butt', 'concealed', 'overlay', 'door', 'cabinet'],
    answer: 'Butt hinges are the traditional visible hinge mortised into the edge of a door and frame, common on furniture and interior doors. European (concealed) cup hinges are the standard for modern cabinet doors — they hide entirely inside the cabinet and offer adjustable overlay, and typically need a 35mm cup hole bored into the door. Piano (continuous) hinges run the full length of a lid or door for even support, common on toy boxes and long cabinet doors.',
  },
  {
    id: 'mp-drawer-slides',
    topic: 'Drawer slide types and how to choose',
    keywords: ['drawer', 'slides', 'runners', 'ball', 'bearing', 'undermount', 'side'],
    answer: 'Side-mount ball-bearing slides are the most common and affordable, mounting to the sides of the drawer box and cabinet — reliable and easy to install but visible from inside the drawer. Undermount (concealed) slides mount beneath the drawer for a cleaner look and often include soft-close, but cost more and require more precise drawer box sizing. Wooden runners (traditional, no metal hardware) are the classic period-furniture option but need more maintenance (wax) and have less smooth glide.',
  },
  {
    id: 'mp-brackets-corner',
    topic: 'Corner brackets and metal reinforcement hardware',
    keywords: ['bracket', 'corner', 'metal', 'reinforce', 'l', 'bracket', 'hardware'],
    answer: 'Metal corner brackets, L-brackets, and T-brackets reinforce joints (especially shelving and utility furniture) with screws into both connected pieces — fast to install and strong, though visible unless mortised in flush or hidden inside a cabinet. They are a good practical option for shop furniture, workbenches, and utility shelving where appearance matters less than speed and strength.',
  },
  // ── MORE JOINERY: GROOVES, DADOS, RABBETS ───────────────────────────────
  {
    id: 'mp-joint-dado',
    topic: 'Dado joint — what it is and when to use it',
    keywords: ['dado', 'joint', 'groove', 'shelf', 'across', 'grain', 'slot'],
    answer: 'A dado is a rectangular slot cut across the grain of a board, sized to hold the end of another board — the classic way to seat a fixed shelf into a bookcase side so the shelf cannot sag or pull out. It is stronger than simply screwing a shelf to cleats because the shelf load is carried by the whole width of the joint, not just fasteners.',
  },
  {
    id: 'mp-joint-rabbet',
    topic: 'Rabbet joint — what it is and when to use it',
    keywords: ['rabbet', 'rebate', 'joint', 'edge', 'step', 'cabinet', 'back'],
    answer: 'A rabbet is an L-shaped step cut along the edge or end of a board, commonly used to recess a cabinet back panel or to let two boards overlap at a corner with more glue surface than a simple butt joint. Rabbeted corners are also more forgiving to align during glue-up than a plain butt joint, since the step helps register the pieces.',
  },
  {
    id: 'mp-joint-groove-tongue',
    topic: 'Groove and tongue-and-groove joints',
    keywords: ['groove', 'tongue', 'and', 'groove', 'panel', 'flooring', 'joint'],
    answer: 'A groove is a slot cut with the grain (as opposed to a dado, which runs across the grain), often used to hold a floating panel in a frame-and-panel door. Tongue-and-groove joints cut a matching tongue on one board\'s edge and a groove on the next, used for flooring, paneling, and edge-joining boards where you want self-aligning, gap-free seams.',
  },
  {
    id: 'mp-joint-spline',
    topic: 'Spline joint — reinforcing miters and edge joints',
    keywords: ['spline', 'joint', 'miter', 'reinforce', 'strength', 'thin', 'strip'],
    answer: 'A spline is a thin strip of wood glued into matching slots cut into two adjoining pieces, most often used to reinforce a miter joint (which is weak on its own since it is mostly end grain glued to end grain). Splines can be hidden inside the joint or cut all the way through and left visible as a decorative contrasting-wood accent.',
  },
  {
    id: 'mp-joint-domino',
    topic: 'Domino (floating tenon) joint',
    keywords: ['domino', 'floating', 'tenon', 'festool', 'joint', 'modern'],
    answer: 'A "Domino" or floating-tenon joint uses a separate loose tenon (often a purpose-made oval tool like the Festool Domino, but the same idea works with shop-made loose tenons and a router) glued into matching mortises cut in both pieces. It gets mortise-and-tenon strength without cutting an integral tenon on the workpiece itself, and is much faster to set up than traditional mortise-and-tenon while still being strong enough for chairs, tables, and door frames.',
  },
  // ── MORE FASTENERS & HARDWARE ────────────────────────────────────────────
  {
    id: 'mp-countersink-counterbore',
    topic: 'Countersink vs counterbore',
    keywords: ['countersink', 'counterbore', 'screw', 'head', 'flush', 'plug', 'recess'],
    answer: 'A countersink cuts a small conical recess so a screw head sits flush with (or just below) the surface. A counterbore cuts a larger, deeper flat-bottomed hole so the screw head sits well below the surface, leaving room for a wood plug to hide it completely — a common technique on visible furniture surfaces where you do not want the screw head showing at all.',
  },
  {
    id: 'mp-wood-plugs',
    topic: 'Wood plugs to hide screws',
    keywords: ['wood', 'plug', 'hide', 'screw', 'counterbore', 'matching', 'grain'],
    answer: 'A wood plug is a small round dowel-like piece glued into a counterbored hole to hide a screw head, then trimmed and sanded flush. Cutting the plug from the same board (or a matching offcut) gives the best color/grain match; a plug cutter tool makes this easy. Plugs are common on farmhouse-style furniture where the plug is left slightly proud and visible as a decorative detail, as well as on fine furniture where it is sanded perfectly flush and nearly invisible.',
  },
  {
    id: 'mp-threaded-inserts',
    topic: 'Threaded inserts for knock-down furniture',
    keywords: ['threaded', 'insert', 'knock', 'down', 'disassemble', 'bolt', 'hardware'],
    answer: 'Threaded inserts are metal fittings installed into a pre-drilled hole (often screwed or pressed in) that create a permanent metal thread in the wood, letting you use a machine bolt instead of a wood screw for a connection that can be assembled and disassembled repeatedly without wearing out the wood threads. Common in knock-down (flat-pack) furniture, workbench accessories, and anywhere a joint needs to come apart for moving.',
  },
  {
    id: 'mp-cam-lock-fasteners',
    topic: 'Cam lock and knock-down fasteners',
    keywords: ['cam', 'lock', 'knock', 'down', 'fastener', 'flat', 'pack', 'fittings'],
    answer: 'Cam locks and similar knock-down fittings (the hardware behind most flat-pack furniture) use a dowel or bolt in one panel paired with a rotating cam fitting in the other — turning the cam with a screwdriver pulls the joint tight without glue. They allow strong, tool-free (or simple-tool) assembly and disassembly, useful for furniture that needs to ship flat or move through doorways in pieces.',
  },
  {
    id: 'mp-t-nuts-washers',
    topic: 'T-nuts and washers in woodworking hardware',
    keywords: ['t-nut', 'washer', 'hardware', 'bolt', 'fixture', 'jig'],
    answer: 'A T-nut is a flanged nut with prongs that anchor it into a pre-drilled hole from the back, giving a permanent, strong threaded connection point often used in workbenches, jigs, and knock-down furniture (bolt goes in from the front, threads into the T-nut in the back). Washers spread a fastener\'s clamping force over a wider area, useful under bolt heads or nuts to prevent the fastener from crushing into softer wood.',
  },
  {
    id: 'mp-clamping-pressure-glue',
    topic: 'How much clamping pressure a glue joint needs',
    keywords: ['clamp', 'pressure', 'glue', 'joint', 'how', 'tight', 'squeeze'],
    answer: 'A common rule of thumb: clamp firmly enough to see a thin, even bead of glue squeeze out along the joint line — that is a sign of good contact and adequate pressure. Over-tightening past that point does not add strength and can actually starve the joint of glue by squeezing out too much, so "snug with visible squeeze-out" is generally the right target, not "as tight as the clamp will go."',
  },
  {
    id: 'mp-fastener-selection-outdoor',
    topic: 'Choosing fasteners for outdoor projects',
    keywords: ['outdoor', 'fastener', 'screw', 'rust', 'stainless', 'coated', 'exterior'],
    answer: 'Standard zinc-plated screws will rust and stain outdoor wood over time — use stainless steel or exterior-rated coated (e.g. ceramic or polymer coated deck) screws for any outdoor project, and pair with a glue rated for exterior/waterproof exposure (Type II/III PVA or epoxy). Rust stains from the wrong fastener are a very common and preventable outdoor-project mistake.',
  },
];
