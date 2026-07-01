import type { KnowledgeEntry } from './pepeKnowledge';

export const PEPE_KNOWLEDGE_MASTER_W: KnowledgeEntry[] = [
  // ── DOVEDESIGN: ENGINEERING & ESTIMATING PANELS ──────────────────────────
  {
    id: 'mw-engineering-panel-purpose',
    topic: 'What the Engineering panel deflection numbers mean',
    keywords: ['engineering', 'panel', 'deflection', 'sag', 'load', 'meaning'],
    answer: 'The Engineering panel gives a rough deflection (bending/sag) estimate for a selected board under an assumed load, based on its length, thickness, width, and species stiffness — useful as a sanity check for shelves and spans before you build. Treat it as a common rule-of-thumb estimate, not a guarantee: for load-bearing or structural builds, consider consulting published span tables or a professional engineer rather than relying on the estimate alone.',
  },
  {
    id: 'mw-engineering-panel-when-use',
    topic: 'When to check the Engineering panel',
    keywords: ['engineering', 'panel', 'when', 'use', 'shelf', 'span', 'check'],
    answer: 'It is worth checking the Engineering panel any time you have a long, thin span carrying real weight — a shelf, a bench seat, a long unsupported tabletop overhang — since these are exactly the situations where sag becomes visible over time. Short spans or thick stock rarely need the check, but it costs nothing to glance at before committing to a cut.',
  },
  {
    id: 'mw-estimating-panel-what-it-tracks',
    topic: 'What the Estimating panel calculates',
    keywords: ['estimating', 'panel', 'calculate', 'cost', 'material', 'what'],
    answer: 'The Estimating panel totals up material cost across your whole project — board footage or square footage times a per-unit cost you set for each species, plus any priced hardware you have placed — giving a running project cost estimate as you design, rather than requiring you to tally it up by hand at the end.',
  },
  {
    id: 'mw-estimating-panel-set-prices',
    topic: 'Setting your own lumber prices in the Estimating panel',
    keywords: ['estimating', 'panel', 'set', 'prices', 'lumber', 'cost', 'custom'],
    answer: 'Since lumber prices vary a lot by region and supplier, the Estimating panel lets you enter your own per-board-foot or per-sheet cost for each species used in the project, so the running total reflects your actual local prices rather than a generic average.',
  },
  // ── DOVEDESIGN: QUICK-JOIN, WORKBENCH BLUEPRINT ──────────────────────────
  {
    id: 'mw-quick-join-toolbar-purpose',
    topic: 'What the Quick-Join toolbar is for',
    keywords: ['quick', 'join', 'toolbar', 'purpose', 'fast', 'common'],
    answer: 'The Quick-Join toolbar surfaces the most common mate/join actions (like "join flush" or a common fastener choice) as one-click buttons for a selected pair of boards, saving you the full Mate tool click-sequence when you are doing a lot of straightforward joins in a row.',
  },
  {
    id: 'mw-workbench-blueprint-purpose',
    topic: 'What the Workbench Quick-Start Blueprint is for',
    keywords: ['workbench', 'blueprint', 'quick', 'start', 'purpose', 'template'],
    answer: 'The Workbench Quick-Start Blueprint is a ready-made starter layout (legs, aprons, top) sized like a typical shop workbench, meant as a fast starting point you can then resize and modify rather than building a workbench model completely from scratch.',
  },
  // ── DOVEDESIGN: HARDWARE LIBRARY DEPTH ────────────────────────────────────
  {
    id: 'mw-hardware-casters',
    topic: 'Placing casters from the Hardware Library',
    keywords: ['casters', 'wheels', 'hardware', 'library', 'mobile', 'cart'],
    answer: 'Casters placed from the Hardware Library attach to the underside of a project (like a mobile cart or workbench base) and appear in your Bill of Materials for shopping — useful for planning ground clearance and making sure your leg/base design leaves room for them before you build.',
  },
  {
    id: 'mw-hardware-shelf-pins',
    topic: 'Placing shelf pins from the Hardware Library',
    keywords: ['shelf', 'pins', 'hardware', 'library', 'adjustable', 'holes'],
    answer: 'Shelf pin hardware in the library represents the small pins that hold an adjustable shelf in a row of drilled holes — placing them helps you visualize and plan hole spacing (and pairs well with the Centerline tool for laying out an even, symmetrical row of holes on the cabinet side).',
  },
  {
    id: 'mw-hardware-table-legs',
    topic: 'Hardware Library table leg attachment fittings',
    keywords: ['table', 'legs', 'hardware', 'fittings', 'attach', 'library'],
    answer: 'Table leg attachment hardware (leg mounting plates, hairpin leg fittings, corner blocks) in the Hardware Library lets you model exactly how a removable or attached leg will connect to the apron/top, which is useful for confirming clearance and screw placement before drilling real hardware into a real tabletop.',
  },
  // ── MORE WOOD SPECIES: FIGURED/SPECIALTY ──────────────────────────────────
  {
    id: 'mw-species-curly-maple',
    topic: 'Curly (tiger/fiddleback) maple — what it is',
    keywords: ['curly', 'maple', 'tiger', 'fiddleback', 'figure', 'species'],
    answer: 'Curly (tiger or fiddleback) maple is regular maple with a wavy grain figure that produces a shimmering, three-dimensional "chatoyance" effect under light, especially with an oil or clear finish. It is prized for fine furniture and instrument backs, priced at a premium over plain maple, and can be a bit trickier to plane cleanly due to its wavy grain (a sharp blade or scraper reduces tearout).',
  },
  {
    id: 'mw-species-quilted-maple',
    topic: 'Quilted maple — what it is',
    keywords: ['quilted', 'maple', 'figure', 'species', 'veneer'],
    answer: 'Quilted maple shows a puffy, three-dimensional "quilt" figure pattern, most dramatic on the flatsawn face, and is usually sold as veneer or thin figured boards rather than thick lumber since it is relatively rare. It commands a high premium and is typically used only as a feature panel or accent rather than structurally.',
  },
  {
    id: 'mw-species-spalted-wood',
    topic: 'Spalted wood — what causes the dark lines and how to use it',
    keywords: ['spalted', 'wood', 'fungus', 'dark', 'lines', 'figure', 'stabilize'],
    answer: 'Spalting is a pattern of dark contrasting lines caused by early-stage fungal decay in a log before it is fully dried — the fungus is halted (by drying) before it structurally weakens the wood too much, leaving a striking pattern behind. Spalted wood can be softer or more fragile than un-spalted stock, so it is often stabilized with a penetrating resin for turning or thin decorative pieces, and is best test-cut carefully since decay severity varies within one board.',
  },
  {
    id: 'mw-species-burl',
    topic: 'Burl wood — what it is and how it is typically used',
    keywords: ['burl', 'wood', 'figure', 'grain', 'bowl', 'veneer'],
    answer: 'A burl is a deformed growth on a tree (often from stress or injury) with wildly swirling, chaotic grain, prized for its unique figure in bowls, small boxes, and veneer. It is unstable and prone to cracking as it dries due to the irregular grain, so burl pieces are often stabilized or turned "green" (wet) with a controlled slow-drying process, or used as thin veneer over a stable substrate.',
  },
  // ── MORE FINISHING DEPTH ─────────────────────────────────────────────────
  {
    id: 'mw-finish-tung-vs-linseed',
    topic: 'Tung oil vs boiled linseed oil — differences',
    keywords: ['tung', 'oil', 'linseed', 'oil', 'difference', 'finish', 'compare'],
    answer: 'Pure tung oil dries harder and more water-resistant than boiled linseed oil, though it takes longer to cure between coats. Boiled linseed oil is cheaper and easier to find, penetrates well and enriches wood color nicely, but offers less water resistance and can remain slightly softer/tackier than tung oil long-term. Many commercial "oil finish" products are actually blends of one or both with varnish and thinner rather than either oil in pure form — check the label.',
  },
  {
    id: 'mw-finish-wipe-on-poly',
    topic: 'Wipe-on polyurethane — what it is and why use it',
    keywords: ['wipe', 'on', 'polyurethane', 'finish', 'thin', 'easy'],
    answer: 'Wipe-on poly is standard polyurethane thinned down (either purchased pre-thinned or diluted with mineral spirits) so it can be applied with a rag instead of a brush, giving thinner, more forgiving coats with fewer brush marks or bubbles, at the cost of needing more coats to build the same protective thickness as full-strength brushed poly.',
  },
  {
    id: 'mw-finish-dye-vs-pigment-stain',
    topic: 'Dye stains vs pigment stains — what is the difference',
    keywords: ['dye', 'stain', 'pigment', 'stain', 'difference', 'compare'],
    answer: 'Pigment stains (the common kind sold at hardware stores) contain solid color particles that settle into open pores and scratches, which is why they can look blotchy on tight or uneven grain. Dye stains dissolve completely and penetrate evenly regardless of pore structure, giving more uniform color especially on blotch-prone woods like maple, cherry, or pine, though dye can be less fade-resistant in direct sunlight over time than some pigment stains.',
  },
  {
    id: 'mw-finish-gel-stain',
    topic: 'Gel stain — what it is and when to use it',
    keywords: ['gel', 'stain', 'thick', 'even', 'blotch', 'vertical'],
    answer: 'Gel stain is a thick, non-drip stain that sits more on the surface than soaking in unevenly, making it a popular choice for blotch-prone woods (pine, cherry, maple) and for vertical surfaces where a thin liquid stain would run or drip. It generally builds color more slowly than a thin liquid stain, so a second coat may be needed for a darker result.',
  },
  {
    id: 'mw-finish-toner-glaze',
    topic: 'Toner and glaze — advanced color-correction techniques',
    keywords: ['toner', 'glaze', 'color', 'correct', 'finish', 'advanced'],
    answer: 'A toner is a thinned, tinted topcoat sprayed between finish coats to adjust or even out overall color across a whole piece. A glaze is a tinted product applied and then wiped back, settling into recesses and profiles to add depth/shading (common on raised panel doors and carved details). Both are more advanced techniques usually reached for after basic staining is not achieving the desired look.',
  },
  // ── MORE SAFETY: TABLE SAW SPECIFICS ──────────────────────────────────────
  {
    id: 'mw-safety-featherboard',
    topic: 'Featherboards — what they do and why use them',
    keywords: ['featherboard', 'safety', 'table', 'saw', 'router', 'control'],
    answer: 'A featherboard is a slotted board (or hardware) mounted to hold a workpiece firmly against the fence or table, with flexible fingers that allow forward feed but resist kickback/backward movement — commonly used on a table saw or router table for narrow or thin-stock rip cuts where hand control alone is riskier.',
  },
  {
    id: 'mw-safety-riving-knife-splitter',
    topic: 'Riving knife vs splitter on a table saw',
    keywords: ['riving', 'knife', 'splitter', 'table', 'saw', 'kickback', 'prevent'],
    answer: 'A riving knife is a curved metal piece mounted just behind the blade that rises and falls with it, keeping the cut kerf open behind the blade so the workpiece cannot pinch the blade and kick back — the modern standard on most current table saws. An older-style splitter does a similar job but is usually fixed and often removed for non-through cuts. Keep whichever your saw has installed for standard through-cuts whenever possible.',
  },
  {
    id: 'mw-safety-zero-clearance-insert',
    topic: 'Zero-clearance table saw insert — what it does',
    keywords: ['zero', 'clearance', 'insert', 'table', 'saw', 'tearout', 'safety'],
    answer: 'A zero-clearance insert is a table saw throat plate with a slot cut exactly to the blade\'s width (rather than the wider factory opening), which reduces tearout on the underside of a cut and also prevents small offcuts from dropping down into the saw\'s cabinet or catching on the wider factory opening. Many woodworkers keep several, one per common blade/dado setup.',
  },
  // ── MORE JOINERY/HARDWARE ROUND-OUT ──────────────────────────────────────
  {
    id: 'mw-joinery-corner-blocks-gussets',
    topic: 'Corner blocks and gussets for reinforcing joints',
    keywords: ['corner', 'block', 'gusset', 'reinforce', 'joint', 'chair', 'apron'],
    answer: 'A corner block (a small triangular or square block glued and/or screwed into the inside corner where an apron meets a leg) reinforces the joint against racking, common on chairs and tables. A gusset is a similar reinforcing piece, often plywood, spanning a joint on the flat rather than tucked into a corner — both are simple, low-skill ways to add real strength to an otherwise adequate joint.',
  },
  {
    id: 'mw-joinery-domino-vs-biscuit',
    topic: 'Floating tenon (Domino-style) vs biscuit — which is stronger',
    keywords: ['domino', 'biscuit', 'compare', 'strength', 'which', 'stronger'],
    answer: 'A floating-tenon (Domino-style) joint is significantly stronger than a biscuit joint because the loose tenon is thicker and seats deeper into both pieces with more long-grain glue surface, closer to a true mortise-and-tenon in strength. Biscuits are better thought of as an alignment aid for glue-ups and light-duty joints, not a primary structural joint for chairs, tables, or anything taking real racking load.',
  },
  // ── MORE MEASURING DEPTH ──────────────────────────────────────────────────
  {
    id: 'mw-measure-laser-distance',
    topic: 'Laser distance measurers in woodworking',
    keywords: ['laser', 'distance', 'measure', 'tool', 'digital', 'room'],
    answer: 'A laser distance measurer is handy for quickly capturing room or space dimensions (like measuring an alcove a built-in cabinet needs to fit) faster and sometimes more accurately over long distances than a tape measure, though for fine joinery-level precision on the actual workpieces, a tape measure, square, and calipers remain the standard.',
  },
  {
    id: 'mw-measure-story-pole-large-build',
    topic: 'Using a story pole for large multi-part builds (like built-ins)',
    keywords: ['story', 'pole', 'large', 'build', 'built', 'in', 'consistent'],
    answer: 'For a large project with many repeated measurements (a run of built-in cabinets, a staircase, a set of matching bookcases), a story pole — a single long reference stick marked with every key height and position — keeps every part consistent with the actual room and with each other, rather than relying on separately re-measuring each piece and risking small mismatches accumulating across the run.',
  },
];
