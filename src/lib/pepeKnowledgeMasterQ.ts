import type { KnowledgeEntry } from './pepeKnowledge';

export const PEPE_KNOWLEDGE_MASTER_Q: KnowledgeEntry[] = [
  // ── FINISHING ─────────────────────────────────────────────────────────────
  {
    id: 'mq-finish-stain-basics',
    topic: 'Wood stain basics',
    keywords: ['stain', 'wood', 'color', 'basics', 'apply', 'wipe'],
    answer: 'Stain adds color to wood by soaking pigment or dye into the surface fibers — it does not protect the wood on its own, so it is almost always followed by a clear topcoat. Apply with a rag or brush, let it sit a few minutes to penetrate, then wipe off the excess; the longer you leave it before wiping, generally the darker the result, though this varies by product. Always test on scrap or an inconspicuous spot first, since the same stain can look very different on different species.',
  },
  {
    id: 'mq-finish-blotchy-pine',
    topic: 'Why pine (and other softwoods) blotch when stained',
    keywords: ['blotchy', 'pine', 'stain', 'uneven', 'conditioner', 'softwood'],
    answer: 'Pine, along with birch, maple, cherry, and other tight/uneven-grained woods, has areas of end grain and soft early-wood that absorb stain much faster than the surrounding wood, leading to a splotchy, uneven appearance. A pre-stain wood conditioner (applied before staining) partially seals the wood so it absorbs more evenly; gel stains (which sit on the surface rather than soaking in unevenly) are another common fix. Testing on scrap from the same board is the only reliable way to know how bad the blotching will be before committing.',
  },
  {
    id: 'mq-finish-oil-white-oak',
    topic: 'How oil finishes interact with white oak',
    keywords: ['oil', 'finish', 'white', 'oak', 'tannin', 'react', 'darken'],
    answer: 'White oak has a high tannin content, which reacts favorably with oil finishes (danish oil, tung oil, boiled linseed oil) to produce a rich, warm amber tone that many woodworkers specifically choose oak for. That same tannin content can react poorly with water-based finishes or certain metal fasteners (iron/steel can cause dark tannin staining around a screw or nail in oak) — stainless or brass hardware avoids this on visible oak surfaces.',
  },
  {
    id: 'mq-finish-food-safe',
    topic: 'Food-safe finishes for cutting boards and utensils',
    keywords: ['food', 'safe', 'finish', 'cutting', 'board', 'mineral', 'oil', 'butcher'],
    answer: 'Food-safe finishes for cutting boards and utensils include plain food-grade mineral oil (inexpensive, needs reapplying every few weeks), a mineral-oil-and-beeswax "board butter" blend (adds a bit more water resistance), and pure tung oil or walnut-based oils (some people avoid walnut oil for nut-allergy reasons). Most fully-cured film finishes (polyurethane, lacquer, shellac) are considered food-safe once completely cured, but many woodworkers still prefer oil finishes for cutting surfaces since they can be renewed easily and do not chip.',
  },
  {
    id: 'mq-finish-poly',
    topic: 'Polyurethane finish — properties and use',
    keywords: ['polyurethane', 'poly', 'finish', 'film', 'durable', 'topcoat'],
    answer: 'Polyurethane is a durable, film-forming topcoat available in oil-based (ambers slightly, more durable, longer dry time) and water-based (dries clear, faster recoat, less odor) versions. It is a good general-purpose choice for tabletops, floors, and anything that needs strong scratch and water resistance. Apply thin coats and sand lightly between coats for the smoothest result — thick single coats are prone to drips, bubbles, and slow, uneven curing.',
  },
  {
    id: 'mq-finish-lacquer',
    topic: 'Lacquer finish — properties and use',
    keywords: ['lacquer', 'finish', 'spray', 'fast', 'dry', 'furniture'],
    answer: 'Lacquer is a fast-drying, sprayed film finish widely used in production furniture and cabinet shops because it dries quickly enough to recoat within an hour and rubs out to a very smooth, clear finish. It generally requires spray equipment (not practical to brush well) and proper ventilation/spray booth setup due to strong solvent fumes, which makes it less common for casual hobbyist use than brush-on poly.',
  },
  {
    id: 'mq-finish-shellac',
    topic: 'Shellac finish — properties and use',
    keywords: ['shellac', 'finish', 'traditional', 'sealer', 'natural', 'dewaxed'],
    answer: 'Shellac is a natural resin finish (secreted by the lac insect, dissolved in alcohol) with a long history in furniture finishing — fast drying, easy to repair (a new coat melts into the old one), and a good sealer/barrier coat under other finishes. It has lower water and heat resistance than polyurethane, so it is more common as a sanding sealer or on decorative pieces than on hard-use tabletops. "Dewaxed" shellac is required as a base coat if you plan to topcoat with polyurethane, since wax in standard shellac prevents poly from bonding well.',
  },
  {
    id: 'mq-finish-oil-vs-film',
    topic: 'Oil finishes vs film finishes — key differences',
    keywords: ['oil', 'finish', 'film', 'finish', 'difference', 'penetrating', 'topcoat'],
    answer: 'Oil (penetrating) finishes like danish oil or tung oil soak into the wood fibers, giving a natural, low-sheen look that is easy to touch up (just wipe on more oil) but offers less scratch and water protection. Film (topcoat) finishes like polyurethane or lacquer form a protective layer on top of the wood, giving much better durability and water resistance, but they are harder to spot-repair since scratches sit in the film layer rather than the wood. Many woodworkers combine both — an oil for color and warmth, then a film topcoat for protection.',
  },
  {
    id: 'mq-finish-drying-vs-curing',
    topic: 'Dry time vs cure time for finishes',
    keywords: ['dry', 'time', 'cure', 'time', 'finish', 'wait', 'how', 'long'],
    answer: '"Dry" generally means the finish is no longer tacky to the touch and can be recoated or handled carefully — this can happen in hours. "Cured" means the finish has reached its full hardness and chemical resistance, which for many oil-based and polyurethane finishes takes 1–4 weeks even though the surface feels dry much sooner. Avoid heavy use (stacking items, hot dishes, hard use) on a freshly finished piece until it has fully cured, even though it may look and feel done.',
  },
  {
    id: 'mq-finish-application-methods',
    topic: 'Brush, wipe, and spray application methods',
    keywords: ['finish', 'apply', 'brush', 'wipe', 'spray', 'method', 'application'],
    answer: 'Wiping (rag application) is the easiest method for beginners and works well for oils and wiping varnishes — low mess, forgiving, but limited to thin coats. Brushing gives more control and thicker build for film finishes like polyurethane, but requires attention to avoid brush marks and dust nibs. Spraying (with a proper sprayer and ventilation) gives the smoothest, most even coat and is standard in production shops, but has the highest equipment cost and learning curve.',
  },
  {
    id: 'mq-finish-sanding-between-coats',
    topic: 'Sanding between coats of finish',
    keywords: ['sand', 'between', 'coats', 'finish', 'grit', 'smooth', 'nibs'],
    answer: 'Light sanding between coats of a film finish (typically with 320–400 grit sandpaper or a fine synthetic abrasive pad) knocks down dust nibs and raised grain, giving a smoother final result and better adhesion for the next coat. Always let the previous coat dry (not necessarily fully cure) before sanding, and wipe away sanding dust thoroughly before recoating.',
  },
  {
    id: 'mq-finish-raised-grain',
    topic: 'Why grain raises after the first coat of a water-based finish',
    keywords: ['raised', 'grain', 'water', 'based', 'finish', 'fuzzy', 'first', 'coat'],
    answer: 'Water-based finishes and stains can cause tiny wood fibers to swell and stand up, leaving the surface feeling slightly fuzzy after the first coat dries — this is normal and expected, not a defect. A light sanding with fine grit (320+) after the first coat knocks the raised fibers down; subsequent coats generally do not raise the grain again since the fibers are already sealed.',
  },
  {
    id: 'mq-finish-wax',
    topic: 'Paste wax as a finish or topcoat',
    keywords: ['wax', 'paste', 'finish', 'topcoat', 'sheen', 'protect'],
    answer: 'Paste wax is often applied as a final topcoat over an existing finish (oil or film) to add a soft sheen and a bit of surface protection and slickness — it is not durable enough to use alone as a primary finish on furniture that sees regular use, since it wears off with handling and offers minimal water resistance. It is easy to renew with a fresh coat and buff.',
  },
  {
    id: 'mq-finish-danish-oil',
    topic: 'Danish oil — what it is and how to use it',
    keywords: ['danish', 'oil', 'finish', 'blend', 'wipe', 'easy'],
    answer: 'Danish oil is a blended finish (typically a mix of drying oil, varnish, and thinner) that combines some of the durability of a varnish with the easy application and natural look of an oil. Apply generously, let it soak in for the time stated on the can, then wipe off all excess — leaving excess on the surface causes a sticky, uneven film. Multiple thin coats (with light sanding between) build more protection than one heavy coat.',
  },
  // ── MEASURING & LAYOUT ────────────────────────────────────────────────────
  {
    id: 'mq-measure-board-feet',
    topic: 'How to calculate board feet',
    keywords: ['board', 'feet', 'calculate', 'lumber', 'volume', 'formula'],
    answer: 'A board foot is a unit of lumber volume equal to a piece 12" x 12" x 1" thick. The formula is (thickness in inches x width in inches x length in inches) divided by 144, or more simply for rough estimating: thickness (inches) x width (feet) x length (feet). Hardwood lumber is commonly priced per board foot, so this calculation is the standard way to estimate material cost before a project.',
  },
  {
    id: 'mq-measure-kerf-allowance',
    topic: 'Kerf allowance when planning cuts',
    keywords: ['kerf', 'allowance', 'blade', 'width', 'cut', 'planning'],
    answer: 'Kerf is the width of material a saw blade removes as it cuts — typically around 1/8" for a standard table saw blade, though thin-kerf blades remove less. When planning multiple cuts from one board, add the kerf width between each planned piece in your layout, or your parts will come up short. This matters most when cutting several same-size pieces from one board and cutting close to the minimum length needed.',
  },
  {
    id: 'mq-measure-squaring-stock',
    topic: 'How to square up rough lumber',
    keywords: ['square', 'stock', 'rough', 'lumber', 'jointer', 'planer', 'four', 'square', 'sequence', 'order', 'dimensioning', 'reference face', 'reference edge'],
    answer: 'Squaring ("four-squaring") rough lumber is the process of milling a board so all faces are flat and all edges are square to each other: (1) flatten one face on a jointer — this becomes your reference face; (2) joint one edge square to that same face — this becomes your reference edge; (3) run the board through a planer with the reference face down, making the opposite face parallel to it; (4) rip the second edge parallel to the reference edge on the table saw. The order matters because each step measures or registers off the flat/square surface the previous step just created — skip or reorder a step and there is nothing reliable left to reference, so the error shows up later as parts that will not fit together squarely. Starting from a warped or twisted board without this process leads to inaccurate joints and parts that do not fit together squarely.',
  },
  {
    id: 'mq-measure-marking-gauge',
    topic: 'What a marking gauge is used for',
    keywords: ['marking', 'gauge', 'layout', 'tool', 'scribe', 'line', 'consistent'],
    answer: 'A marking gauge scribes a fine, consistent line parallel to a reference edge — used for laying out mortise widths, tenon cheeks, and other joinery that needs to be marked at a repeatable distance from an edge, more accurately than a pencil and ruler. A cutting gauge (a variant with a small blade instead of a pin) is preferred for marking across the grain since it severs the fibers cleanly rather than tearing them.',
  },
  {
    id: 'mq-measure-story-stick',
    topic: 'What a story stick is and why to use one',
    keywords: ['story', 'stick', 'layout', 'measure', 'repeat', 'template', 'consistent'],
    answer: 'A story stick is a strip of wood or scrap marked with the exact locations of key measurements for a project (shelf positions, joint locations, repeated dimensions) instead of writing numbers on a tape measure or plan. Using the story stick to transfer marks directly to your workpieces avoids compounding small measurement errors from repeatedly reading a tape measure or ruler, and is a traditional technique for anything with repeated identical measurements.',
  },
  {
    id: 'mq-measure-twice-cut-once',
    topic: 'Why "measure twice, cut once" actually matters',
    keywords: ['measure', 'twice', 'cut', 'once', 'mistake', 'verify', 'check'],
    answer: 'This old rule persists because a cut cannot be undone, but a repeated measurement check can catch a misread number, a transposed digit, or a mark on the wrong side of the line before the mistake becomes an unusable, wasted piece of stock. Cross-checking against a story stick, another finished part, or the overall project dimensions is especially valuable for the first cut in a batch of identical parts.',
  },
  {
    id: 'mq-measure-nominal-actual',
    topic: 'Nominal vs actual dimensional lumber sizes',
    keywords: ['nominal', 'actual', 'dimensional', 'lumber', 'size', '2x4', 'undersized'],
    answer: 'Dimensional lumber is sold by its rough-cut "nominal" size, but the actual size after drying and surfacing is smaller — a "2x4" is actually about 1.5" x 3.5", and a "1x6" is actually about 0.75" x 5.5". Always measure your actual lumber with calipers or a ruler before modeling or cutting to it, rather than assuming the nominal number is the real dimension.',
  },
  // ── SAFETY ────────────────────────────────────────────────────────────────
  {
    id: 'mq-safety-kickback',
    topic: 'Table saw kickback — what it is and how to avoid it',
    keywords: ['kickback', 'table', 'saw', 'safety', 'danger', 'avoid'],
    answer: 'Kickback happens when a workpiece binds against the spinning blade and gets violently thrown back toward the operator — one of the most dangerous table saw hazards. Common causes include cutting with a warped or twisted board, letting the offcut pinch between the blade and the fence, or freehanding a cut without the fence or a guide. A riving knife or splitter (keeps the kerf open behind the blade), a sharp blade, and never standing directly in line with the blade all reduce kickback risk — consider consulting your saw\'s manual and established safety guides for full technique.',
  },
  {
    id: 'mq-safety-push-stick',
    topic: 'Push sticks and push blocks — why to use them',
    keywords: ['push', 'stick', 'block', 'safety', 'hands', 'blade', 'distance'],
    answer: 'Push sticks and push blocks keep your hands a safe distance from a spinning blade or bit while still giving you control to feed the workpiece through, and are especially important for narrow rips where your hand would otherwise pass close to the blade. As a common rule of thumb, if a cut would bring your hand within several inches of the blade, use a push stick or push block rather than your bare hand.',
  },
  {
    id: 'mq-safety-blade-guard',
    topic: 'Blade guards — why they matter',
    keywords: ['blade', 'guard', 'safety', 'saw', 'protect', 'remove'],
    answer: 'A blade guard covers the exposed portion of a spinning blade above the workpiece, protecting against accidental contact and often helping control dust and debris. It is tempting to remove for certain cuts (like non-through cuts), but many accidents happen specifically when the guard has been removed and not reinstalled — put it back as soon as the cut that required its removal is finished.',
  },
  {
    id: 'mq-safety-dust-respiratory',
    topic: 'Dust and respiratory safety in the shop',
    keywords: ['dust', 'respiratory', 'safety', 'mask', 'collection', 'lungs', 'health'],
    answer: 'Fine wood dust is a long-term respiratory hazard — regular exposure over years is associated with respiratory irritation and other health issues, and some species carry additional allergy/sensitizer risk (see wood dust toxicity). Good practice includes dust collection at the tool (a shop vac or dust collector hooked to sanders, saws, and routers), a well-fitted respirator rated for fine dust during heavy sanding, and good shop ventilation. This is a cumulative, long-term risk, not something to only think about occasionally.',
  },
  {
    id: 'mq-safety-eye-hearing',
    topic: 'Eye and hearing protection basics',
    keywords: ['eye', 'protection', 'hearing', 'ear', 'safety', 'glasses', 'plugs'],
    answer: 'Safety glasses (rated for impact, not just sunglasses) should be worn for essentially any power tool operation — flying chips and dust are a constant risk. Hearing protection (earmuffs or plugs) matters more than many hobbyists realize, since routers, planers, and shop vacs regularly exceed noise levels that cause gradual hearing damage with repeated exposure — cheap and easy insurance against a permanent loss.',
  },
  {
    id: 'mq-safety-loose-clothing-jewelry',
    topic: 'Loose clothing, jewelry, and hair around power tools',
    keywords: ['loose', 'clothing', 'jewelry', 'hair', 'safety', 'entangle', 'rotating'],
    answer: 'Loose sleeves, dangling jewelry, and untied long hair can catch on rotating tools like lathes, drill presses, and router bits, pulling a hand or worse into the machine before you can react. Roll up sleeves, remove rings and bracelets, and tie back long hair before running rotating equipment — this is standard shop practice, not overly cautious.',
  },
  {
    id: 'mq-safety-general-shop',
    topic: 'General shop safety habits',
    keywords: ['shop', 'safety', 'general', 'habits', 'checklist', 'workshop'],
    answer: 'General good habits: keep the floor clear of scrap and cords (trip hazards), keep blades and bits sharp (a dull tool requires more force and is more likely to slip or bind), unplug tools before changing blades or bits, never reach over a running blade, and take breaks when tired — fatigue is a common contributing factor in shop accidents. None of this guarantees safety, but it meaningfully reduces risk.',
  },
  // ── TOOL BASICS ───────────────────────────────────────────────────────────
  {
    id: 'mq-tools-hand-vs-power',
    topic: 'Hand tools vs power tools — overview',
    keywords: ['hand', 'tools', 'power', 'tools', 'versus', 'overview', 'choose'],
    answer: 'Power tools (table saw, router, planer, sander) are faster and better suited to repeatable, production-style work, while hand tools (hand planes, chisels, hand saws) offer more control for fine joinery, fitting, and finish work, and are quieter and require no electricity. Most woodworkers use a mix — power tools for rough dimensioning and repetitive cuts, hand tools for final fitting and delicate work — rather than committing entirely to one approach.',
  },
  {
    id: 'mq-tools-sharpening-basics',
    topic: 'Sharpening basics for chisels and plane irons',
    keywords: ['sharpen', 'chisel', 'plane', 'iron', 'edge', 'stone', 'basics'],
    answer: 'A sharp edge is safer and more effective than a dull one — dull tools require more force and are more likely to slip. Basic sharpening involves flattening and polishing the back of the blade, then honing a consistent bevel angle (commonly around 25–30 degrees for chisels and plane irons) on progressively finer abrasives (stones, sandpaper, or diamond plates), finishing with a light "micro-bevel" strop pass. Consistency in angle matters more than the specific sharpening system you choose.',
  },
  {
    id: 'mq-tools-beginner-mistakes',
    topic: 'Common beginner woodworking mistakes',
    keywords: ['beginner', 'mistakes', 'common', 'new', 'woodworker', 'avoid'],
    answer: 'Common beginner mistakes include: not accounting for wood movement in wide panel glue-ups, using dull blades/bits (leads to burning, tearout, and more dangerous cuts), skipping test cuts on scrap before cutting good stock, ignoring pilot holes and splitting wood near edges, and rushing glue-ups without a dry-fit first. Slowing down for a dry-fit (assembling without glue to check everything lines up) before every glue-up prevents a large share of frustrating mistakes.',
  },
  {
    id: 'mq-tools-dry-fit',
    topic: 'Why to dry-fit before gluing',
    keywords: ['dry', 'fit', 'test', 'assembly', 'before', 'glue', 'check'],
    answer: 'A dry-fit is assembling a joint or project without glue first, to confirm everything lines up, fits snugly, and that you have all clamps and cauls ready — glue has a limited open time, and discovering a problem mid-glue-up is far worse than catching it during a dry run. Always dry-fit any glue-up with more than two pieces, and any joint you have not cut before.',
  },
  {
    id: 'mq-tools-clamps-types',
    topic: 'Common clamp types and what they are for',
    keywords: ['clamps', 'types', 'bar', 'pipe', 'spring', 'f-clamp', 'parallel'],
    answer: 'Bar and pipe clamps apply strong, long-reach pressure for panel glue-ups and large assemblies. F-style (quick) clamps are fast to apply for general clamping and jig work. Spring clamps are quick and light-duty, good for small parts or holding things temporarily. Parallel clamps (with wide, flat, non-marring jaws) apply even pressure without racking the joint, a common choice for cabinet and furniture glue-ups where flatness matters.',
  },
];
