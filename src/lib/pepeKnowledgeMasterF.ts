import type { KnowledgeEntry } from './pepeKnowledge';

export const PEPE_KNOWLEDGE_MASTER_F: KnowledgeEntry[] = [
  // ── MORE SAFETY ───────────────────────────────────────────────────────────────
  {
    id: 'mf-electrical-safety-shop',
    topic: 'Electrical safety in the woodworking shop',
    keywords: ['electrical','gfci','outlet','extension','cord','grounded','short','fire','circuit'],
    answer: 'Wood shops need dedicated circuits for major tools — a table saw and dust collector on the same circuit can trip breakers or cause voltage drops. Use GFCI-protected outlets near sinks and wet areas. Never use undersized extension cords for power tools — a 10-gauge cord is minimum for 15-amp tools; undersized cords cause voltage drop that overloads motor windings and starts fires. Keep cords off the floor where they collect sawdust (fire risk). Inspect cords regularly for cuts and frays.',
  },
  {
    id: 'mf-fire-extinguisher',
    topic: 'Fire extinguisher types for the woodworking shop',
    keywords: ['fire','extinguisher','ABC','CO2','class','sawdust','finishing','spray'],
    answer: 'Every shop needs a minimum 5-lb ABC dry chemical extinguisher near the exit. For finishing rooms with flammable solvents, a CO2 or clean-agent extinguisher is preferred — CO2 leaves no residue on equipment and doesn\'t conduct electricity. Mount extinguishers at eye level on the wall between you and the exit (so you can grab it while moving toward the exit). Check the gauge monthly. Know how to use it before a fire — the PASS method: Pull, Aim, Squeeze, Sweep.',
  },
  {
    id: 'mf-shop-lighting',
    topic: 'Shop lighting for safety and accuracy',
    keywords: ['lighting','shop','lumen','raking','overhead','task','led','fluorescent'],
    answer: 'Adequate lighting is a safety issue — poor light leads to missed layout lines and misjudged cuts. Overhead LED shop lights provide general illumination; aim for 50+ foot-candles at the bench and tool surfaces. Raking light (angled from the side) reveals surface defects, plane tracks, and glue lines that overhead light obscures. A movable task light at each major tool dramatically improves both safety and work quality. Shadow-free LED panel lights eliminate the flicker of old fluorescent tubes that causes eye fatigue.',
  },
  {
    id: 'mf-machine-layout-workflow',
    topic: 'Machine placement for workflow and safety',
    keywords: ['machine','placement','layout','workflow','outfeed','clearance','traffic','zone'],
    answer: 'Place machines so their outfeed zones don\'t overlap — the table saw outfeed area should never face into the jointer\'s infeed zone, or someone using one tool creates a hazard for the other. Allow 4\' of clearance behind and to the side of every major machine for the longest material you\'ll handle. Place the dust collector where its hose reach covers all machines without creating trip hazards. Put the bench against a wall (not in a traffic area) and orient it so natural light or overhead light falls from your left (for right-handers) onto the work.',
  },
  {
    id: 'mf-lathe-catch',
    topic: 'Lathe catch — causes and prevention',
    keywords: ['lathe','catch','dig','in','grab','spindle','bowl','speed','sharp','tool','rest'],
    answer: 'A lathe catch happens when a turning tool digs into the spinning wood instead of cutting it — usually from presenting the tool at the wrong angle or with the edge below the tool rest height. The result is a violent jerk that can fling the tool or send material flying. Prevention: always have the tool rest adjusted close to the work; present tools with the bevel rubbing the wood first, then gently lift the handle to engage the edge; keep turning tools sharp; use the correct tool for the operation (bowl gouge for bowls, spindle gouge for spindles). If you feel resistance, retract immediately.',
  },
  {
    id: 'mf-router-table-start-pin',
    topic: 'Starting pin on the router table for freehand profiling',
    keywords: ['start','pin','router','table','freehand','pivot','curved','stock','entry'],
    answer: 'The starting pin (a small metal pin set into the router table near the bit) provides a pivot point for starting freehand cuts on curved stock — where you can\'t use a fence. Hold the workpiece against the starting pin, then pivot it into the spinning bit. Without the starting pin, the bit grabs the end of the stock and kicks it backward (a potentially dangerous catch). Once the stock is fully past the bit entry, you can remove it from the pin and maintain contact with just the bit bearing. Never start a freehand cut against a spinning bit without a starting pin.',
  },
  {
    id: 'mf-circular-saw-kickback',
    topic: 'Circular saw kickback prevention',
    keywords: ['circular','saw','kickback','bind','pinch','anti','kickback','clutch','stance'],
    answer: 'Circular saw kickback occurs when the blade pinches — the blade stops and the saw is thrown backward at high speed. Prevention: support the material so it doesn\'t sag and pinch the blade (use sawhorses with the off-cut supported); start cuts with a straight blade, no angle; never force the saw; use a riving knife behind the blade (modern saws have one); stand to the side of the blade, not directly behind it. Retract the guard manually only when absolutely necessary (starting an angled cut into a corner) and never hold it retracted during the cut.',
  },
  {
    id: 'mf-vibration-white-finger',
    topic: 'Vibration white finger (hand-arm vibration syndrome)',
    keywords: ['vibration','white','finger','HAVS','circulation','numb','chainsaw','grinder','time'],
    answer: 'Hand-Arm Vibration Syndrome (HAVS) results from prolonged use of vibrating tools — grinders, chainsaws, and reciprocating saws are the worst offenders. Symptoms include numbness, tingling, loss of dexterity, and in severe cases permanent vascular damage that causes fingers to turn white in cold temperatures. Limit continuous use of high-vibration tools; take regular breaks; use anti-vibration gloves (limited effectiveness); and address vibration at the source by keeping cutting tools sharp (which reduces vibration). Report symptoms to a doctor early — the condition is progressive.',
  },
  {
    id: 'mf-back-safety',
    topic: 'Back safety when handling heavy lumber',
    keywords: ['back','safe','lift','heavy','sheet','lumber','technique','assist','dolly'],
    answer: 'Full sheets of 3/4" plywood weigh 60–75 lbs and are awkward to handle alone. Lift with your legs, not your back — squat, keep the sheet close to your body, and don\'t twist while holding heavy material. Use a sheet good cart or panel dolly for moving plywood. For heavy lumber like 8/4 walnut, have a partner on the other end. A panel carrier hook ($15) lets one person carry a 4×8 sheet vertically. Don\'t try to be a hero with material over 50 lbs — back injuries are the most common woodworking-adjacent health problem.',
  },
  {
    id: 'mf-ergonomic-injury',
    topic: 'Repetitive strain injuries in woodworking',
    keywords: ['repetitive','strain','RSI','carpal','tunnel','tendinitis','grip','wrist','prevent'],
    answer: 'Repetitive motions like hand planing, sanding, and routing can cause tendinitis, carpal tunnel syndrome, and other repetitive strain injuries. Prevention: take breaks every 30–45 minutes of continuous repetitive work; use anti-vibration gloves for grinding; vary your grip frequently; keep tools sharp (more force = more strain); adjust workbench height so you\'re not working with arms raised or hunched over. Symptoms like tingling, numbness, or persistent aching after work should be evaluated by a doctor before they progress.',
  },
  {
    id: 'mf-splinter-treatment',
    topic: 'Treating wood splinters in the shop',
    keywords: ['splinter','remove','tweezers','needle','clean','infection','exotic','tropical'],
    answer: 'Most splinters can be removed with a needle or fine-tip tweezers under magnification. Clean the area with alcohol, remove the splinter completely (no fragments left), clean again, and cover with a bandage. Wood splinters that aren\'t fully removed become infected more readily than most other foreign bodies. Exotic wood splinters (wenge, rosewood, cocobolo) may carry allergens or toxic compounds — remove completely and watch for allergic reactions. If a splinter is deep or you can\'t remove it completely, see a doctor — retained splinters cause serious infections.',
  },
  {
    id: 'mf-sanding-fire-risk',
    topic: 'Sanding fire risk from friction heat and dust',
    keywords: ['sanding','fire','risk','friction','heat','spontaneous','combustion','bag','filter'],
    answer: 'Belt sander and random orbit sander bags collect fine, warm sawdust that can smolder. Empty the bag after each session — don\'t leave a full, warm bag overnight. Fine dust generated by sanding is also explosive in high concentrations in an enclosed space — keep shop ventilated. Black walnut dust is especially prone to slow combustion in the bag. After sanding oily woods (teak, tung-oil-finished stock), shake the bag contents into a metal can and leave outdoors to cool before disposal.',
  },

  // ── MORE WORKHOLDING ─────────────────────────────────────────────────────────
  {
    id: 'mf-parallel-jaw-clamp',
    topic: 'Parallel jaw clamps for panel glue-ups',
    keywords: ['parallel','jaw','clamp','even','pressure','Bessey','panel','face','racking'],
    answer: 'Parallel jaw clamps (Bessey K-Body, Jorgensen, Jet) have a fixed and a movable jaw that remain parallel regardless of clamping pressure — unlike pipe clamps, which tend to rotate and produce a bow in the glued-up panel. For wide panel glue-ups, alternate clamps above and below the panel and place them every 6–8" to distribute pressure evenly. Wax the clamp jaws or use wax paper at joint lines to prevent the clamps from bonding to squeeze-out. Parallel jaw clamps are the most versatile clamp type for furniture production.',
  },
  {
    id: 'mf-band-clamp-use',
    topic: 'Band (strap) clamps for polygons and frames',
    keywords: ['band','strap','clamp','polygon','frame','miter','corner','octagon','hexagon'],
    answer: 'Band clamps wrap a ratcheting nylon strap around irregular shapes — polygon frames, bent laminations, and box corner miters that would be impossible to clamp with parallel jaw or bar clamps. The strap applies even pressure all the way around the perimeter simultaneously. Add corner protectors (plastic or shop-made wood corners) to prevent the strap from cutting into the corners at pressure points. For picture frames and polygon boxes, they\'re indispensable. Check that all corners are equally tight before the glue sets.',
  },
  {
    id: 'mf-wooden-handscrew',
    topic: 'Wooden handscrew clamps for face work',
    keywords: ['wooden','handscrew','parallel','jaw','adjust','angle','face','taper','clamp'],
    answer: 'Wooden handscrew clamps (also called parallel jaw wooden clamps) have two independently adjustable wooden jaws connected by two threaded rods. The two-rod adjustment allows the jaws to clamp tapered or angled pieces that would slip out of a single-screw clamp. They\'re excellent for clamping work to the workbench face, clamping face frames directly to cabinet carcases, and as a third-hand holder for jigs and templates. The wooden jaws don\'t mark soft workpieces. Sizes range from 4" to 24" jaw opening.',
  },
  {
    id: 'mf-cam-clamp',
    topic: 'Cam clamps for quick light-duty work',
    keywords: ['cam','clamp','luthier','quick','release','light','guitar','instrument','assembly'],
    answer: 'Cam clamps use an eccentric (cam) lever to apply and release clamping pressure instantly — no screwing required. They\'re faster than any other clamp type for repetitive tasks. Popular in instrument making for clamping thin pieces where torque from screw clamps would crush the material. Applying pressure with a cam clamp: simply push the lever. Release: push back. They don\'t apply as much force as screw clamps but plenty for light wood-to-wood joints. Buy them or make them from plywood and a wooden toggle.',
  },
  {
    id: 'mf-t-track-jigs',
    topic: 'T-track and miter track for jigs and stop blocks',
    keywords: ['T','track','miter','stop','block','jig','router','table','fence','adjustable'],
    answer: 'T-track (extruded aluminum channel) is embedded in jigs, fences, and router table surfaces to allow bolt-on adjustable components like stop blocks, featherboards, and hold-downs. Standard T-track accepts 5/16"-18 hex-head bolts with T-nuts. Miter track (3/4" × 3/8" typically) fits table saw and router table miter slots. Design jigs with T-track from the start rather than trying to add it later — routing an accurate T-track channel requires careful setup but pays off in every jig you build afterward.',
  },
  {
    id: 'mf-vacuum-bag-pressing',
    topic: 'Vacuum bag pressing for veneer and bent lamination',
    keywords: ['vacuum','bag','press','veneer','lamination','form','even','pressure','pump'],
    answer: 'Vacuum bags press veneered panels and bent laminations with perfectly even pressure in all directions — impossible to achieve with individual clamps. The bag is sealed and air evacuated with a vacuum pump, applying 14.7 psi uniformly across the entire surface. For flat panels, a simple bag and a flat caul work. For curved forms, the form goes inside the bag and the atmospheric pressure presses the lamination against the form perfectly. Good vacuum bags for woodworking use a 2-stage or 1-stage pump — 22–25 inHg vacuum is typical.',
  },
  {
    id: 'mf-clamping-cauls',
    topic: 'Making and using clamping cauls',
    keywords: ['caul','clamping','curved','even','pressure','wax','straight','bow','prevent'],
    answer: 'Cauls are auxiliary pieces placed between clamps and the workpiece to distribute pressure over an area or protect the surface. Straight cauls on edge-glued panels prevent cupping under clamp pressure (clamp every 8–10" alternating top and bottom). Curved cauls (with a slight bow) apply extra pressure at the center of a panel. Wax your cauls so glue squeeze-out doesn\'t bond them to the work. Particleboard or MDF cauls stay flat and don\'t dent soft wood surfaces as readily as solid wood cauls.',
  },
  {
    id: 'mf-dovetail-jig-compare',
    topic: 'Dovetail jig comparison — Leigh, Keller, Porter Cable',
    keywords: ['dovetail','jig','leigh','keller','porter','cable','compare','router','half','through'],
    answer: 'The Porter Cable 4212 uses a fixed-spacing aluminum template for both half-blind and through dovetails — fast setup, good results, but limited to equal spacing. The Leigh D4R allows variable spacing and ratios, and makes half-blind, through, and box joints with one jig — more flexible but complex to set up. Keller jigs are simple, accurate, and produce through dovetails with variable spacing, though limited compared to the Leigh. Hand-cut dovetails remain faster for one-offs once you have the skill; jigs pay off in batches of four or more identical boxes.',
  },
  {
    id: 'mf-shooting-board-miter',
    topic: 'Miter shooting board for accurate 45° cuts',
    keywords: ['shooting','miter','board','45','accurate','frame','picture','plane','end','grain'],
    answer: 'A miter shooting board has a 45° fence on the platform — place the mitered piece against the fence and plane the end grain to exactly 45°. A sharp, well-set No.5 or No.7 plane works well for the end grain cuts. Shoot one piece, check with a reference square, adjust, then shoot all similar pieces in sequence without re-adjusting. For picture frames, even 0.5° of error in a miter produces a visible gap at the corner — the shooting board eliminates this. Make two mirror-image shooting boards (left and right 45°) for a complete set.',
  },
  {
    id: 'mf-glue-up-assembly-table',
    topic: 'Assembly table for flat panel glue-ups',
    keywords: ['assembly','table','flat','reference','glue','up','caul','level','torsion'],
    answer: 'Gluing up panels on a flat, level assembly table keeps glue-ups from setting up bowed or twisted. A torsion-box top (hollow core with a grid of internal ribs, MDF skin) produces a very flat, light surface. Level the table with adjustable feet. Keep the table surface free of clamp pressure dents by using sacrificial strips. For a simpler option, a guaranteed-flat surface reference table (cast iron or thick MDF) serves the same purpose — just cover it with wax paper to prevent glue bonding.',
  },

  // ── MORE PROJECT TYPES ────────────────────────────────────────────────────────
  {
    id: 'mf-jewelry-box',
    topic: 'Jewelry box construction — lining and hinge',
    keywords: ['jewelry','box','lining','felt','velvet','hinge','lid','small','lock','tray'],
    answer: 'Jewelry boxes need a lined interior (felt, suede, or velvet), a fitted lid with a small hinge, and optional lift-out trays. Cut the lid from the assembled box with a thin blade (scroll saw or fine table saw blade) for a perfect fit. Use small knife hinges or barrel hinges for a clean hidden look. Line the interior after finishing — apply contact cement to the wood and back of the felt, let dry, and press into place. A removable tray (a shallow tray that sits inside the main compartment on ledges) adds organization.',
  },
  {
    id: 'mf-wine-rack',
    topic: 'Wine rack construction and bottle spacing',
    keywords: ['wine','rack','bottle','spacing','angle','diameter','wood','lattice','stacking'],
    answer: 'Standard wine bottles are about 3"–3.5" in diameter and 12" long. A simple slot-style wine rack needs openings slightly larger than the bottle neck for easy in-and-out — about 4"×4" or a 3.5" circular hole. Bottles should rest at 5°–15° below horizontal (cork stays wet). A lattice-style rack (crossing diagonal strips) is the classic design. Use clear or lightly-finished hardwood for appearance. Space the openings on a grid and calculate the total grid size for the number of bottles — 75mm center-to-center (about 3") is the tightest practical spacing.',
  },
  {
    id: 'mf-knife-block',
    topic: 'Kitchen knife block construction',
    keywords: ['knife','block','slot','width','angle','wood','bamboo','magnetic','food','safe'],
    answer: 'Knife blocks have angled slots cut at 15°–20° from vertical so the blades hang at a slight angle and are easily gripped. Slots are typically 3/32"–1/8" wide and 5"–7" deep (matching common blade length). Stack thin strips of wood with spacers between them, clamp and glue, then drill or rout the slots from the front face. Use a dense, fine-grained hardwood (cherry, maple, walnut) that won\'t generate splinters at the slot edges. Finish with a food-safe oil (mineral oil, walnut oil). Alternative: a magnetic knife strip mounted on the wall is simpler to make.',
  },
  {
    id: 'mf-cutting-board-end-grain',
    topic: 'End grain cutting board assembly tips',
    keywords: ['end','grain','cutting','board','assembly','strips','rotate','glue','flat','oil'],
    answer: 'For an end grain cutting board, rip a thick board into strips, rotate them 90° (end grain up), and glue them back together. The key challenge is keeping the glue-up flat — end grain is unforgiving with clamps. Apply glue quickly (PVA has short open time when end grain is absorbent), use cauls above and below, and alternate clamp directions to avoid bowing. After curing, flatten on a drum sander or with a hand plane. Finish with multiple coats of food-grade mineral oil applied liberally — end grain is thirsty and absorbs a lot on the first several coats.',
  },
  {
    id: 'mf-serving-tray',
    topic: 'Serving tray with handles — design and construction',
    keywords: ['serving','tray','handle','cut','out','bottom','panel','frame','carry'],
    answer: 'A serving tray typically has a flat bottom panel in a frame with short sides and cut-out handles at each end. The bottom can be a floating panel (solid wood) or fixed plywood. Handle cut-outs are made with a jigsaw or router after the frame is assembled. Round over all edges that hands will contact — sharp edges on handles are uncomfortable. The frame joints need to be very strong (mortise-and-tenon or well-glued finger joints) because a loaded tray puts significant stress on the handle-to-frame corners.',
  },
  {
    id: 'mf-desktop-organizer',
    topic: 'Desk organizer and pen holder construction',
    keywords: ['desk','organizer','pen','holder','box','divider','dado','compartment','office'],
    answer: 'Desk organizers are great beginner projects using dado and rabbet joints. Build the main box from 1/2" hardwood with dadoed dividers creating compartments of different widths. A pencil cup (a cylinder or square tube) can be a section of turned wood or a box joint cylinder. Finish with a light oil for a natural look, or milk paint for a colored option. Proportions: keep the overall height of back compartments at 4"–5" for pens and markers; front sections at 2"–3" for paper clips and rubber bands.',
  },
  {
    id: 'mf-picture-frame',
    topic: 'Picture frame construction and glass sizing',
    keywords: ['picture','frame','miter','rabbet','backing','glass','mat','art','size'],
    answer: 'Picture frames use 45° miter joints at corners, reinforced with splines, biscuits, or nails plus glue. The rabbet (rebate) on the back inside edge holds the glass, mat board, art, and backing in place. Rabbet depth: typically 1/4"–3/8" to accommodate glass + mat + backing. Inside dimension of the rabbet = mat size. For standard size mats (8×10", 11×14", etc.), work backward from the mat size when laying out the frame. Key fit order: cut all pieces from the same stick to get identical profiles, miter, dry-fit with a band clamp, check square, then glue.',
  },
  {
    id: 'mf-mirror-frame',
    topic: 'Mirror frame construction and hanging',
    keywords: ['mirror','frame','rabbet','clip','keyhole','hang','weight','backing','plate'],
    answer: 'Mirror frames are built like picture frames with a deeper rabbet (the glass is heavier). Use mirror mounting clips or aluminum channel to secure the mirror — never glue mirrors directly into a frame with solvent-based adhesives (they attack the silvering). Mirrors are heavy: a 24×36" mirror with frame weighs 15–25 lbs. Hang using keyhole brackets or French cleat — never just a single hook. French cleats are the strongest and most adjustable option. On the wall, find studs or use toggle anchors rated well above the actual mirror weight.',
  },
  {
    id: 'mf-plant-stand',
    topic: 'Plant stand construction and indoor use',
    keywords: ['plant','stand','indoor','spill','water','finish','height','pot','moisture'],
    answer: 'Plant stands need moisture resistance because pots overflow and drip. Use a waterproof finish (oil-based poly or exterior varnish) on all surfaces. Design the top with a slight lip to contain water spills, or add a tray. Elevation height depends on the plant light requirements; taller stands push plants closer to windows. Splayed legs (angled outward) make stands more stable and look more elegant than straight vertical legs. The top opening for a pot should match the pot\'s outer diameter — allow 1/4" clearance all around.',
  },
  {
    id: 'mf-step-stool',
    topic: 'Step stool construction and safety requirements',
    keywords: ['step','stool','safe','height','load','stability','kitchen','footrest','anti-slip'],
    answer: 'A step stool must be extremely stable — base footprint should be wider than the top platform. Legs should splay outward in both directions (typically 7°–10° from vertical). Mortise-and-tenon or well-glued and screwed joints are mandatory for safety. Test load capacity by standing on it yourself and bouncing gently. Add non-slip rubber feet and non-slip strip on the platform surface. CPSC recommends step stools support 300 lbs minimum. Keep height proportional to stability — a 12" step needs a wide base to avoid tipover.',
  },
  {
    id: 'mf-blanket-chest',
    topic: 'Blanket chest construction and lid hardware',
    keywords: ['blanket','chest','chest','cedar','lid','hinge','tray','tills','storage'],
    answer: 'Blanket chests are traditionally lined with aromatic cedar for moth protection. The case is typically frame-and-panel or solid wood with breadboard ends on the lid. The lid is attached with heavy-duty continuous (piano) hinge or large butt hinges — it must support repeated opening and closing under full weight. A lid stay (chain or lid support hardware) is essential to prevent the lid from falling and hitting a child or slamming shut. Optional interior tills (removable partitioned trays) provide organized storage within the chest.',
  },
  {
    id: 'mf-tool-chest-construction',
    topic: 'Hand tool chest design and organization',
    keywords: ['tool','chest','tray','till','interior','organize','dovetail','lid','dutch'],
    answer: 'The classic wooden tool chest (like the Dutch chest style) has a deep base with a sliding interior till, and sometimes a smaller till above. Hand tools are stored upright in the base (planes, saw, mallet) and smaller tools in the till (chisels, gauges, small planes). The lid typically has a small tray inside. Dovetailed corners are traditional and show the maker\'s skill. Felt or leather lining protects tools from rust and scrapes. Size the chest to the specific tools it will hold — pre-plan the interior before building.',
  },
  {
    id: 'mf-birdhouse',
    topic: 'Birdhouse construction and hole sizing',
    keywords: ['birdhouse','hole','size','species','bluebird','wren','drill','cedar','roof'],
    answer: 'Birdhouse hole diameter determines which species will use it: 1.25" for wrens, 1.5" for chickadees, 1.5" for nuthatches, 1.56" for bluebirds, 2" for flickers. Interior floor size and depth also matter — bluebirds need a 5"×5" floor with 8" of depth. Avoid perches (predators use them). Make the roof removable or a side panel hinged for cleaning each fall. Use untreated cedar, redwood, or pine — no pressure-treated wood near nesting birds. Leave the wood unfinished or use exterior latex paint in earth tones only; avoid creosote or bright paints.',
  },
  {
    id: 'mf-outdoor-bench',
    topic: 'Outdoor garden bench construction',
    keywords: ['outdoor','bench','garden','seat','rot','resistant','cedar','teak','mortise','span'],
    answer: 'Garden bench seats are typically 2" thick decking boards or 2×6 lumber spanning 4\' between supports. The seat spans should be no more than 18"–24" between supports to prevent deflection under load. Mortise-and-tenon or through-bolt connections at the leg-to-seat support joints. Use rot-resistant wood (cedar, teak, ipe, black locust) and stainless or hot-dip galvanized hardware. Leave small gaps (1/4") between seat boards for drainage. Angle the seat very slightly (2°–5°) toward the back so rainwater drains toward the back rather than pooling.',
  },
  {
    id: 'mf-garden-gate',
    topic: 'Garden gate construction and bracing',
    keywords: ['garden','gate','brace','diagonal','sag','hinge','latch','lumber','pressure'],
    answer: 'Wood gates sag at the latch corner over time if not properly braced. A diagonal brace must run from the bottom hinge corner up to the top latch corner (compression along the diagonal when the gate sags). Getting this wrong is a common mistake — a brace from top-hinge to bottom-latch is in tension and doesn\'t work as well in wood. Use rot-resistant lumber, galvanized hardware throughout, and at least three hinges on any gate taller than 4 feet. The gate frame should be rigid before adding diagonal bracing.',
  },
  {
    id: 'mf-spice-rack',
    topic: 'Spice rack design — wall mount vs counter',
    keywords: ['spice','rack','wall','mount','counter','depth','opening','jar','label'],
    answer: 'Wall-mounted spice racks use a simple case (3"–4" deep) with 2"–3" lips on the front of each shelf to keep jars in place. Make shelf depth based on your specific jar diameter — most common spice jars are 2" diameter. A tiered wall rack (angled shelves) lets you see labels on all jars simultaneously. Counter racks can be pull-out drawers or tiered trays. Mount wall racks with keyhole brackets for easy removal when cleaning. Label orientation matters — design the shelf angle so labels face out.',
  },
  {
    id: 'mf-mudroom-locker',
    topic: 'Mudroom locker and bench with storage',
    keywords: ['mudroom','locker','bench','storage','hooks','cubbies','seat','shoe','boot'],
    answer: 'Mudroom lockers combine a bench (for sitting while putting on shoes), storage cubbies above, coat hooks, and sometimes enclosed cabinet sections. Typical bench height: 17"–18". Cubbies above the bench should be at a comfortable reach height — 60"–70" maximum for an adult-height installation. Make each cubby about 12"–15" wide for a person\'s bag and jacket space. Waterproof the floor of the bench storage area (shoes bring in moisture). PVC edge banding on plywood cubbies is more moisture-resistant than solid wood banding in this environment.',
  },
  {
    id: 'mf-floating-nightstand',
    topic: 'Wall-mounted (floating) nightstand construction',
    keywords: ['floating','nightstand','wall','mount','stud','cantilever','shelf','drawer'],
    answer: 'A floating nightstand must be mounted into studs or substantial blocking — it carries 20–40 lbs of load on a cantilever. Use a French cleat (wide for distributed load) or heavy-duty shelf brackets concealed inside the case. The cleat must catch at least two studs or be into solid blocking installed behind the drywall. Single-drawer or open-shelf designs work best for floating nightstands — drawers add weight and movement. Size: 14"–16" wide × 10"–12" deep is typical for a single bed; wider for a king.',
  },
  {
    id: 'mf-turned-bowl',
    topic: 'Bowl turning on the lathe — basic technique',
    keywords: ['bowl','turn','lathe','gouge','outside','inside','scraper','wall','thickness'],
    answer: 'Mount the blank on a faceplate or chuck (glued to a waste block). Shape the outside with a bowl gouge cutting from the rim down to the center. Reverse the blank to finish the foot, then reverse again to hollow the interior. Interior cuts go from the rim toward the center, never from center to rim (which causes dig-ins). Target wall thickness for a wooden bowl: 1/4"–3/8" for decorative pieces, thicker for utility bowls. Sand while spinning at low speed (600 RPM or less) starting at 80 grit if the tool finish is rough, ending at 220 or 320.',
  },
  {
    id: 'mf-segmented-bowl',
    topic: 'Segmented bowl turning basics',
    keywords: ['segmented','bowl','turning','rings','miter','glue','layer','pattern','angle'],
    answer: 'Segmented turning builds up rings from individual wood segments glued at mitered angles. Each ring segment is cut at the same miter angle (360° ÷ number of segments ÷ 2). Common segment counts: 12 per ring (30° miter each) or 16 (22.5° miter). Cut all segments for a ring identically, glue into a ring using a band clamp, flatten each ring, then glue rings into a stack. The turning process is the same as solid wood turning, but segments must all be well-glued — a failed glue line becomes a dangerous projectile at lathe speed.',
  },
  {
    id: 'mf-humidor-construction',
    topic: 'Cigar humidor construction and wood selection',
    keywords: ['humidor','cigar','spanish','cedar','humidity','seal','hygrometer','70','percent'],
    answer: 'Cigar humidors maintain 65–70% relative humidity — ideal for cigar storage. The interior must be lined with Spanish cedar (a tropical hardwood, not true cedar) which is the traditional and proven lining material for its ability to absorb and release moisture consistently while imparting a pleasant aroma to cigars. The box must seal well — test by closing the lid and watching for immediate spring back from trapped air. Include a hygrometer and humidifier element. Never use aromatic eastern red cedar in a humidor — its strong oils are too harsh for cigars.',
  },

  // ── MORE FASTENERS ────────────────────────────────────────────────────────────
  {
    id: 'mf-threaded-insert',
    topic: 'Threaded inserts for removable hardware in wood',
    keywords: ['threaded','insert','T','nut','bolt','machine','screw','removable','wood'],
    answer: 'Threaded inserts are brass or steel barrels installed into wood to accept machine screws repeatedly without stripping. Options: press-in, drive-in (with a hex driver), or glue-in inserts. Choose the insert diameter to match the drill bit and the screw thread (M6, M8, or 1/4"-20 are common). Apply a small drop of CA glue to the outside threads before installing to prevent back-out. Threaded inserts are essential for jigs and fixtures that need frequent disassembly, adjustable parts like router table inserts, and removable hardware that needs to be tightened reliably.',
  },
  {
    id: 'mf-hinge-mortising',
    topic: 'Hinge mortising by hand and with a router',
    keywords: ['hinge','mortise','butt','chisel','router','depth','mark','knife','outline'],
    answer: 'By hand: trace the hinge on the wood with a marking knife, chop just inside the knife lines with a bench chisel, then pare to depth. Test-fit the hinge — it should sit perfectly flush. With a router: clamp a simple L-shaped guide fence to locate the router exactly, set depth to the hinge leaf thickness, and rout in multiple passes toward the corners. Finish corners by hand with a chisel. The most common mistake: setting router depth to the full hinge leaf thickness and forgetting that two hinges stack — the combined recess equals one leaf thickness total per piece.',
  },
  {
    id: 'mf-drawer-front-adjust',
    topic: 'Adjusting a drawer front for even reveals',
    keywords: ['drawer','front','adjust','reveal','gap','screw','slot','up','down','left','right'],
    answer: 'Most inset drawer fronts attach to the drawer box with two screws through the box front face into the back of the drawer front. Use screws through slotted holes (elongated vertically and horizontally) to allow adjusting the front up/down and left/right. Drill the attachment holes slightly oversize in the drawer front to allow adjustment. Set the drawer into the opening, hold the front in the correct position with the reveals you want, drive the screws while holding position (a second person helps), then check reveals and adjust. On frame-and-panel cabinets, set the gap with playing card shims while fastening.',
  },
  {
    id: 'mf-shelf-standard',
    topic: 'Adjustable shelf standards and brackets',
    keywords: ['shelf','standard','bracket','metal','pilaster','hole','adjustable','load','wall'],
    answer: 'Metal shelf standards (pilasters) mount vertically in pairs, and brackets clip in at any height on the standard\'s slotted holes. They\'re the fastest adjustable shelf system for utility shelving. For a bookcase, recessed standards look much cleaner than surface-mounted. Most standards are 1" wide and require a groove routed in the cabinet side to recess them flush. Load rating per bracket varies — heavy loads need brackets every 12"–16" and robust standards. For heavy loads (reference books), double up the standards or use continuous standards the full case height.',
  },
  {
    id: 'mf-lid-support-types',
    topic: 'Lid support hardware types for boxes and chests',
    keywords: ['lid','support','chain','stay','pneumatic','hold','open','angle','prevent','drop'],
    answer: 'Lid supports prevent the lid from falling to a destructive angle or onto hands. Chain stops simply limit opening angle — very simple but allows the lid to drop to the end of the chain with a jolt. Surface-mounted lid stays (flat metal arm) hold at 90° and are common on boxes. Pneumatic (gas spring) lid supports slow the opening and hold open with silky smooth operation — the best option for larger chests and hope chests where finger pinch is a serious risk. Pneumatic springs are sized by force in Newtons — choose based on lid weight and arm leverage.',
  },
  {
    id: 'mf-pocket-hole-hardware',
    topic: 'Pocket hole jig accessories and variations',
    keywords: ['pocket','hole','jig','Kreg','Festool','setup','clamp','face','frame','variations'],
    answer: 'Pocket hole jigs range from $20 single-hole units to bench-mounted production jigs with dual holes and built-in clamps. The Kreg K4 and K5 are the workhorses — clamp the board, adjust for material thickness, drill both holes in one setup. A face clamp (Kreg clamp or similar) holds joints together while driving pocket screws — without it, the screw angle pushes the boards apart. For production face frame assembly, a dedicated pocket hole clamp system is faster than repositioning a bench clamp for every joint.',
  },

  // ── MORE SHARPENING ───────────────────────────────────────────────────────────
  {
    id: 'mf-scary-sharp',
    topic: 'Scary sharp system — sandpaper on glass',
    keywords: ['scary','sharp','sandpaper','glass','psa','adhesive','progression','flat','cheap'],
    answer: 'The "Scary Sharp" system uses PSA (pressure-sensitive adhesive) sandpaper stuck to a flat glass plate as a cheap, flat sharpening medium. Start at 220 grit to establish the bevel, work through 400, 600, 800, 1000, 2000 for polishing. The advantage: perfectly flat surface (glass doesn\'t dish), inexpensive to get started, and fine grits produce excellent edges. The disadvantage: sandpaper wears quickly compared to stones and must be frequently replaced. Stick the paper to a piece of float glass (from a hardware store mirror) — thicker glass is flatter.',
  },
  {
    id: 'mf-tormek-system',
    topic: 'Tormek wet grinder system for tool sharpening',
    keywords: ['tormek','wet','grinder','slow','wheel','jig','angle','leather','hone'],
    answer: 'Tormek systems use a slow-speed (90 RPM) wet grinding wheel that removes steel without overheating, followed by a leather honing wheel. The system\'s jigs (sold separately) hold plane irons, chisels, gouges, knives, and other tools at precise, repeatable angles. The slow wheel is nearly impossible to overheat. The main advantages: tool-specific jigs produce consistent bevel angles; the wet wheel creates no sparks or heat stress. Tormek\'s main limitations: slow (faster to freehand on a waterstone once skilled), and the wheel costs $30–80 to replace.',
  },
  {
    id: 'mf-plane-iron-camber',
    topic: 'Plane iron camber — when and how to add it',
    keywords: ['camber','plane','iron','curve','edge','jack','scrub','crown','track'],
    answer: 'Camber (a slight curve across the iron\'s edge) is added to roughing planes (jack planes and scrub planes) so they take a heavy, scooping cut without leaving sharp track marks. A No.5 jack plane iron is often cambered 3/32"–1/8" across a 2" wide iron. To add camber: hone the corners of the iron back by concentrating strokes on them, checking progress with a straightedge across the edge. Smoothing plane irons should have just a whisper of camber (1/1000" crown) to prevent leaving edge tracks on finished surfaces.',
  },
  {
    id: 'mf-lapping-film',
    topic: 'Lapping film for high-polish sharpening',
    keywords: ['lapping','film','mylar','micron','final','polish','razor','sharp','automotive'],
    answer: 'Lapping film (available in micron ratings: 30, 15, 9, 5, 3, 1, 0.3 micron) provides extremely fine cutting action for final edge polishing. Stick it to a glass plate or granite surface plate. The finest lapping films (0.3–1 micron) produce mirror-polish edges beyond what most whetstones achieve. They\'re used by knife makers for the final polish on razors and woodworking tools. Automotive-grade (2000–5000 grit) wet/dry sandpaper provides similar performance at lower cost for most woodworking needs.',
  },
  {
    id: 'mf-drawknife-sharpen',
    topic: 'Sharpening a drawknife',
    keywords: ['drawknife','sharpen','file','flat','stone','bevel','outside','wire','edge'],
    answer: 'Drawknives have a single bevel on the flat side and a flat back (like a chisel). To sharpen: hone the bevel on a flat stone (the curve of the blade makes it challenging — use a rocking motion to follow the curve). Remove the wire edge on the flat back with light strokes on the flat stone. A leather strop helps because it conforms to the blade\'s curve. Some drawknives have a slight hollow grind from the factory; maintain this with a bench grinder held stationary while the drawknife rolls across it — tricky but effective.',
  },
  {
    id: 'mf-saw-sharpening',
    topic: 'Filing and setting hand saw teeth',
    keywords: ['saw','sharpen','file','set','tooth','joint','fleam','gullet','maintain'],
    answer: 'Sharpening a hand saw: first joint (lightly file the tips flat to equalize height), then shape (restore tooth profile with a triangular file at the correct fleam angle), then set (bend alternate teeth outward with a saw set tool). Rip saws are filed straight across (0° fleam, 0° rake). Crosscut saws use 15°–25° fleam angle and 10°–15° rake. Use a saw vise (or wooden jaws in a bench vise) to hold the saw. Full saw sharpening takes 20–45 minutes. Modern hard-point saws (gray teeth) can\'t be sharpened.',
  },
  {
    id: 'mf-convex-grind',
    topic: 'Convex (Appleseed) edge grind on chisels',
    keywords: ['convex','grind','appleseed','edge','bevel','freehand','fat','back','strength'],
    answer: 'A convex grind (sometimes called an appleseed edge) has a slightly convex bevel rather than perfectly flat or hollow. This is the natural result of freehand sharpening on a flat stone with a rocking motion. Proponents argue it\'s more durable than a flat grind (more steel behind the edge) and rolls over the stone with less friction. Critics prefer hollow or flat grinds for their precise edge geometry. For heavy mortise work, a slightly convex bevel is very durable. For paring, a flat or hollow grind allows a more consistent angle presentation.',
  },

  // ── BUYING & MILLING (MORE) ──────────────────────────────────────────────────
  {
    id: 'mf-lumber-defects-buying',
    topic: 'Defects to accept and reject when buying lumber',
    keywords: ['defect','buy','reject','accept','knot','check','warp','sticker','shadow','fungus'],
    answer: 'Accept: tight knots in appropriate projects (rustic style), small checks that can be cut around, mild bow (can be flattened), sticker shadows (will mill out), and mineral streaks if you like the look. Reject: boards with loose knots near structural sections, severe twist that would leave too little flat thickness, boards with insect damage (active powderpost beetles especially), extensive end checks that go deep into usable sections, or boards with very irregular grain near defects that can\'t be predicted.',
  },
  {
    id: 'mf-sequencing-mill',
    topic: 'When to mill lumber in relation to the project schedule',
    keywords: ['mill','schedule','rough','dimension','allow','move','acclimate','two','stage'],
    answer: 'Mill lumber in two stages for best results. Stage 1 (rough mill): get boards close to final thickness (1/16" to 1/8" heavy) and rough width, but leave them 2"–3" longer than final length. Stack and sticker the rough-milled stock in the shop for 1–2 weeks to allow it to move and stabilize. Stage 2 (final mill): flatten and true the now-stable boards to final dimensions and cut to final length. This two-stage approach dramatically reduces warping and twist in finished furniture parts.',
  },
  {
    id: 'mf-online-lumber',
    topic: 'Buying lumber online — pros and cons',
    keywords: ['online','lumber','buy','shipping','cost','source','figured','species','risk'],
    answer: 'Online hardwood dealers (Bell Forest Products, Woodworkers Source, Hearne Hardwoods, Cook Woods) offer excellent species variety including exotics and figured wood. The risk: you can\'t personally select the boards, and even photos don\'t capture true figure, color variation, or hidden defects. Buy from dealers who offer liberal return policies and good customer service. Shipping for heavy lumber is expensive — calculate total cost before assuming online pricing is better than a local yard. Figured veneer is excellent to buy online (lighter, easier to evaluate from detailed photos).',
  },
  {
    id: 'mf-urban-lumber',
    topic: 'Urban lumber — finding and using city trees',
    keywords: ['urban','lumber','city','tree','remove','sawmill','species','free','local'],
    answer: 'Urban trees (walnut, cherry, oak, elm from parks, streets, and backyards) are often excellent quality — wide, straight-grained trees from open-grown conditions. When a tree is removed, the logs often go to a chipper unless you arrange otherwise. Connect with local arborists, tree services, and city parks departments. Have a contact ready with a portable sawmill who can come to the site and mill the logs. The wood may need years to dry but can be spectacular — large walnut crotches and wide cherry slabs from urban trees are worth the wait.',
  },
];
