import type { KnowledgeEntry } from './pepeKnowledge';

export const PEPE_KNOWLEDGE_MASTER_U: KnowledgeEntry[] = [
  // ── MORE SAFETY ───────────────────────────────────────────────────────────
  {
    id: 'mu-safety-router-table',
    topic: 'Router and router table safety basics',
    keywords: ['router', 'table', 'safety', 'bit', 'speed', 'feed', 'direction'],
    answer: 'Feed a workpiece into a router bit against the direction the bit is spinning (climb cutting — feeding with the rotation — can grab the workpiece and pull it out of your hands). Use featherboards or guards on a router table to keep the workpiece controlled, use the lowest RPM setting appropriate for large-diameter bits, and always let the bit come to a complete stop before setting the router down.',
  },
  {
    id: 'mu-safety-bandsaw',
    topic: 'Bandsaw safety basics',
    keywords: ['bandsaw', 'safety', 'blade', 'guard', 'fingers', 'guide'],
    answer: 'Keep the blade guard/guide assembly set close to the top of the workpiece (not left high) — this both improves cut accuracy and reduces the amount of exposed blade. Keep fingers well clear of the blade path, use a push stick for narrow cuts, and never back a workpiece out of a curved cut while the blade is still turning if the kerf could pinch the blade — back the blade out slowly or stop and lift out from the top instead.',
  },
  {
    id: 'mu-safety-jointer-planer',
    topic: 'Jointer and planer safety basics',
    keywords: ['jointer', 'planer', 'safety', 'guard', 'kickback', 'hands'],
    answer: 'Keep the jointer\'s cutterhead guard in place except for the instant a cut requires it moved, and never run stock shorter than the guard can safely cover, or stock with knots/checks that could catch and kick back. On a planer, never plane a board shorter than the machine\'s minimum rated length, and be aware planers can also kick a board back if it catches — stand to the side of the feed line rather than directly behind it when possible.',
  },
  {
    id: 'mu-safety-oily-rag-fire',
    topic: 'Why oily rags can spontaneously combust',
    keywords: ['oily', 'rag', 'fire', 'spontaneous', 'combust', 'safety', 'danger'],
    answer: 'Rags soaked with linseed oil, tung oil, and some other drying oils generate heat as the oil cures (an exothermic reaction), and if the rags are balled up or piled together with no airflow to dissipate that heat, they can spontaneously ignite — a real and well-documented shop fire risk, not an old wives\' tale. Lay oily rags flat and separated outdoors to dry fully, or submerge them in a sealed metal container of water, before disposing of them.',
  },
  {
    id: 'mu-safety-finish-ventilation',
    topic: 'Ventilation when applying stains and finishes',
    keywords: ['ventilation', 'finish', 'stain', 'fumes', 'safety', 'solvent'],
    answer: 'Many stains, oil finishes, and especially spray lacquers and solvent-based products release fumes that are harmful to breathe in an enclosed space — work in a well-ventilated area (open windows/doors, fans) or wear an appropriate respirator rated for organic vapors, not just a basic dust mask, when working with strong-smelling finishing products.',
  },
  {
    id: 'mu-safety-table-saw-crosscut-sled',
    topic: 'Why a crosscut sled is safer than the miter gauge for wide crosscuts',
    keywords: ['crosscut', 'sled', 'table', 'saw', 'safety', 'miter', 'gauge'],
    answer: 'A crosscut sled supports the workpiece fully on both sides of the blade and rides in the table\'s miter slots, giving much more control and stability than a stock miter gauge for wide or awkward crosscuts, and reduces the chance of the workpiece rotating or binding mid-cut. Many woodworkers build a shop-made sled early on as one of the best safety and accuracy upgrades for a table saw.',
  },
  {
    id: 'mu-safety-ladder-fatigue',
    topic: 'General fatigue and rushing as a safety factor',
    keywords: ['fatigue', 'rushing', 'safety', 'tired', 'mistake', 'break'],
    answer: 'A large share of shop accidents happen at the end of a long session, when concentration drops and a woodworker rushes the "last quick cut" before stopping for the day. Treat fatigue as a genuine safety factor — if you are tired or in a hurry, that is often the moment to stop rather than push through one more risky cut.',
  },
  // ── MORE MEASURING & LAYOUT ────────────────────────────────────────────────
  {
    id: 'mu-measure-squares-types',
    topic: 'Types of squares used in woodworking',
    keywords: ['square', 'types', 'combination', 'try', 'framing', 'speed'],
    answer: 'A combination square has a sliding, lockable head and is useful for both checking 90-degree squareness and marking a consistent distance from an edge. A try square is a simpler fixed 90-degree square for checking corners. A speed square (a triangular square) is handy for quick angle layout, especially 45-degree miters, and as a saw guide. A framing square is larger, useful for big layout tasks and roof/stair work.',
  },
  {
    id: 'mu-measure-calipers',
    topic: 'Using calipers for precise measurements',
    keywords: ['calipers', 'precise', 'measure', 'thickness', 'digital', 'dial'],
    answer: 'Calipers (digital or dial) measure thickness, diameter, and small distances far more precisely than a tape measure or ruler — useful for checking actual lumber/plywood thickness, tenon thickness, or hole/dowel diameters before cutting mating parts. A cheap digital caliper is a worthwhile precision upgrade over eyeballing thin measurements with a tape measure.',
  },
  {
    id: 'mu-measure-angle-finding',
    topic: 'Finding and transferring an odd angle',
    keywords: ['angle', 'finder', 'bevel', 'gauge', 'transfer', 'odd', 'miter'],
    answer: 'A bevel gauge (sliding T-bevel) captures an existing angle from a real object or structure and lets you transfer that exact angle to your saw or workpiece, without needing to know the angle in degrees at all. A digital angle finder gives you the actual numeric angle, useful when you need to set a saw or miter gauge to match a specific measured angle.',
  },
  {
    id: 'mu-measure-grain-matching-glueup',
    topic: 'Matching grain and color when gluing up a panel',
    keywords: ['grain', 'matching', 'glue', 'up', 'panel', 'arrange', 'color'],
    answer: 'Before gluing several boards edge-to-edge into a wide panel, lay them out side by side and arrange for the best color and grain match (and alternate the direction of any cupping/growth-ring curvature to help the panel stay flatter over time — this is sometimes called "cathedral matching" or growth-ring alternation). Mark the arrangement with chalk or tape before disassembling to apply glue, so you do not lose track of your chosen order.',
  },
  {
    id: 'mu-measure-consistent-reference-edge',
    topic: 'Why to always measure and mark from the same reference edge',
    keywords: ['reference', 'edge', 'consistent', 'measure', 'mark', 'why'],
    answer: 'Always measuring and marking from the same reference edge or face (rather than sometimes from one side and sometimes the other) prevents small errors from compounding across a project — this is the same principle behind squaring lumber (establishing one true face and edge first) and is a core habit for accurate, repeatable joinery.',
  },
  // ── FINISHING: REPAIR, FADING, MISTAKES ──────────────────────────────────
  {
    id: 'mu-finish-uv-fading',
    topic: 'Why finished wood fades or changes color in sunlight',
    keywords: ['uv', 'fading', 'sunlight', 'color', 'change', 'finish', 'protect'],
    answer: 'UV light breaks down both the wood\'s natural coloring compounds and many finish ingredients over time, causing fading or color shifts, especially near windows or outdoors. Some finishes include UV inhibitors that slow this significantly, and rotating furniture periodically or using window film/curtains can reduce uneven fading on pieces that sit in direct sun.',
  },
  {
    id: 'mu-finish-water-rings',
    topic: 'How to remove water ring marks from a finished surface',
    keywords: ['water', 'ring', 'mark', 'remove', 'white', 'finish', 'repair'],
    answer: 'A white water ring is usually moisture trapped just under the surface of the finish, not damage to the wood itself — gentle heat (an iron over a cloth, on low, briefly) or specialized ring-remover products can often draw the moisture out and clear the mark. Deeper black rings usually mean moisture reached the wood itself and are harder to fix, often requiring sanding down to bare wood and refinishing that section.',
  },
  {
    id: 'mu-finish-common-mistakes',
    topic: 'Common finishing mistakes to avoid',
    keywords: ['finish', 'mistakes', 'common', 'avoid', 'errors'],
    answer: 'Common finishing mistakes include: not testing stain/finish on scrap from the same board first, applying a second coat before the first has properly dried, sanding to too fine a grit before staining (which can actually close the wood\'s pores and reduce stain absorption), and finishing in a dusty environment where airborne dust settles into a wet finish. Slowing down and testing on scrap prevents most of these.',
  },
  {
    id: 'mu-finish-recoat-window',
    topic: 'Why some finishes have a strict recoat time window',
    keywords: ['recoat', 'window', 'finish', 'time', 'strict', 'adhesion'],
    answer: 'Some film finishes (particularly certain water-based products and some lacquers) bond best to the previous coat within a specific time window — recoat too soon and solvents can lift the prior coat; wait too long and the surface may need light sanding first for the next coat to adhere properly. Always check the product label\'s recoat window rather than assuming "longer dry time is always better."',
  },
  {
    id: 'mu-finish-test-board',
    topic: 'Why to always make a finish sample/test board',
    keywords: ['test', 'board', 'sample', 'finish', 'before', 'committing'],
    answer: 'A test board — scrap from the same batch of lumber, prepped and sanded the same way as your actual project — lets you preview exactly how a stain and topcoat combination will look before committing on the real piece, since the same product can look noticeably different across species, even across boards of the same species. This is inexpensive insurance against an expensive mistake on a finished project.',
  },
  // ── MORE FASTENERS / JOINERY EDGE CASES ──────────────────────────────────
  {
    id: 'mu-fastener-screws-into-plywood-edge',
    topic: 'Screwing into plywood edges',
    keywords: ['screw', 'plywood', 'edge', 'weak', 'holding', 'layers'],
    answer: 'Screwing directly into the edge (end) of plywood gives relatively weak holding power since the screw threads mostly grip glue lines between thin veneer layers rather than solid wood fibers. Where possible, screw into the face of plywood instead, or reinforce edge connections with pocket screws angled into the face, biscuits, or a solid-wood edge band glued on first.',
  },
  {
    id: 'mu-fastener-lag-bolts',
    topic: 'Lag bolts (lag screws) — what they are for',
    keywords: ['lag', 'bolt', 'lag', 'screw', 'heavy', 'duty', 'structural'],
    answer: 'Lag bolts (lag screws) are large, heavy-duty threaded fasteners driven with a wrench or socket rather than a screwdriver, used for heavy structural connections like attaching a workbench to studs or joining large timber framing members. They typically need a pre-drilled pilot hole and often a washer to prevent the head from crushing into the wood surface.',
  },
  {
    id: 'mu-joinery-miter-vs-butt-corner',
    topic: 'Miter joint vs butt joint at a corner',
    keywords: ['miter', 'joint', 'butt', 'joint', 'corner', 'difference', 'choose'],
    answer: 'A miter joint (each piece cut at 45 degrees, hiding all end grain) gives a cleaner, seamless-looking corner but is structurally weaker on its own since it is mostly end-grain-to-end-grain glue contact — usually reinforced with splines, biscuits, or fasteners. A butt joint (one piece\'s end grain against the other\'s face) is simpler to cut and, when screwed or doweled, can be plenty strong for utility work, though the end grain is visible.',
  },
  {
    id: 'mu-joinery-through-vs-blind',
    topic: 'Through joints vs blind (stopped) joints',
    keywords: ['through', 'blind', 'stopped', 'joint', 'visible', 'hidden'],
    answer: 'A "through" joint (through-dovetail, through-mortise-and-tenon) passes completely through the receiving piece and is visible from the far side — often left as a decorative feature. A "blind" or "stopped" joint stops short of the far face, hiding the joinery entirely for a cleaner look, but is somewhat more difficult to cut accurately since you cannot see all the way through to check fit as you work.',
  },
];
