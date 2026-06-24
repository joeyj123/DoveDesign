import type { KnowledgeEntry } from './pepeKnowledge';

export const PEPE_KNOWLEDGE_MASTER_J: KnowledgeEntry[] = [
  // ── MORE DESIGN & STYLE ───────────────────────────────────────────────────────
  {
    id: 'mj-craftsman-bungalow',
    topic: 'Craftsman bungalow built-in design elements',
    keywords: ['craftsman','bungalow','built','in','bookcase','bench','window','seat','period'],
    answer: 'Craftsman bungalow built-ins share visual elements: quartersawn white oak or Douglas fir with prominent grain, simple straight lines, through-tenon details with wooden pegs, and wide stiles and rails that look structurally massive. Built-in bookcases flank fireplaces; window seats with storage below line bay windows. Finish is typically a light oak stain or fumed finish with a low-sheen varnish. Exposed wood hardware (wooden knobs, wooden pulls) completes the Craftsman aesthetic.',
  },
  {
    id: 'mj-colonial-furniture',
    topic: 'American colonial furniture characteristics',
    keywords: ['colonial','american','pine','maple','simple','painted','early','puritan','utility'],
    answer: 'Early American colonial furniture (1620–1780) was built from locally available materials — primarily pine, maple, and cherry — by craftsmen trained in English and Dutch traditions. Designs were functional rather than decorative, with simple proportions, minimal ornamentation, and painted finishes that hid the common-grade wood. Mortise-and-tenon joinery, peg construction, and turned elements are characteristic. Later colonial furniture (Georgian, Queen Anne period) adopted more sophisticated carving and proportions.',
  },
  {
    id: 'mj-biedermeier-style',
    topic: 'Biedermeier furniture style characteristics',
    keywords: ['biedermeier','german','austrian','veneer','fruit','wood','simple','bourgeois','Empire'],
    answer: 'Biedermeier furniture (1820–1848, German-speaking Europe) was the middle-class response to Empire style — simpler, more domestic, using fruitwoods (cherry, pear, apple) and birch as primary woods with dark ebony inlay accents. Forms are clean and geometric without imperial ornament. Veneer work is prominent, often with bold matched grain patterns on flat surfaces. Comfortable chairs and settees with upholstered backs and seats are central to the style. Biedermeier is currently very popular with collectors.',
  },
  {
    id: 'mj-wabi-sabi-design',
    topic: 'Wabi-sabi in Japanese woodworking design',
    keywords: ['wabi','sabi','japanese','imperfect','natural','beauty','knot','live','edge','simple'],
    answer: 'Wabi-sabi is a Japanese aesthetic philosophy that finds beauty in imperfection, impermanence, and incompleteness. In woodworking, it manifests as appreciation of live edges, natural knots, the mark of the hand tool, and asymmetrical forms. A perfectly handmade dovetail with a tiny gap tells the story of a human making it — wabi-sabi. Contemporary furniture makers like George Nakashima embraced this philosophy, using natural slab edges and butterfly keys to highlight rather than hide natural wood character.',
  },
  {
    id: 'mj-nakashima-style',
    topic: 'George Nakashima style furniture',
    keywords: ['nakashima','slab','live','edge','walnut','butterfly','natural','organic','japanese'],
    answer: 'George Nakashima (1905–1990) is the most influential 20th-century American furniture artist — he combined Japanese joinery sensibility with Western craft and deep respect for the wood\'s natural form. His signature pieces: live-edge walnut slabs on simple Minguren bases, butterfly keys stabilizing cracks, and turned wooden pegs joining breadboard ends. His philosophy: the furniture\'s form should come from the specific material, not be imposed upon it. Nakashima\'s work established the studio furniture movement and the modern live-edge slab aesthetic.',
  },
  {
    id: 'mj-eames-plywood-influence',
    topic: 'Charles and Ray Eames influence on bent plywood',
    keywords: ['eames','plywood','molded','chair','leg','splint','organic','war','production'],
    answer: 'Charles and Ray Eames developed molded plywood technology during WWII for lightweight military splints, then applied it to revolutionary furniture — the DCW (Dining Chair Wood) and LCW (Lounge Chair Wood) of 1945–46. Their innovation: bonding veneer layers in 3D molds (not just bending in one direction) created compound-curved plywood forms impossible with traditional techniques. The Eames Lounge Chair (1956) later used this technology in the iconic walnut-and-leather lounge. Their work permanently changed what furniture design considers possible.',
  },
  {
    id: 'mj-chair-seat-angle',
    topic: 'Chair seat angle and back angle relationship',
    keywords: ['chair','seat','angle','back','rake','comfortable','tilt','pitch','dining','lounge'],
    answer: 'The seat-to-back angle determines chair comfort type. Dining chairs: seat at 2°–5° down toward the back, back at 5°–10° from vertical — keeps the sitter upright and alert. Lounge chairs: seat at 5°–10° down, back at 20°–30° from vertical — promotes relaxed posture. The angle between seat and back should be 95°–100° for dining (just over 90° to prevent slumping), 105°–115° for lounge. The back angle is measured from the vertical — a 90° back is perfectly upright and quickly becomes uncomfortable for sustained seating.',
  },
  {
    id: 'mj-drawer-design-proportion',
    topic: 'Drawer face design and proportion for visual balance',
    keywords: ['drawer','face','proportion','reveal','overhang','handle','center','align','visual'],
    answer: 'Drawer faces should align with adjacent doors and each other in a continuous vertical reveal. In overlay construction, all faces typically overlap the carcase edge by the same amount (usually 3/8"–1/2"). Face-to-face reveals (gaps between drawer faces) should be uniform — 1/8" is a common standard for production furniture; hand-fitted inset drawers can achieve 1/16" with careful work. Pulls placed consistently (centered, or at 1/3 from the top for tall drawers) create visual rhythm that reads as intentional.',
  },
  {
    id: 'mj-color-wood-selection',
    topic: 'Using wood color as a design element',
    keywords: ['color','wood','palette','contrast','warm','cool','dark','light','species','design'],
    answer: 'Wood color selection is as important as form in furniture design. Contrast creates interest: dark walnut against light maple; black ebony accent on pale cherry. Warm and cool combinations: red-brown cherry with gray-green wenge creates a striking complementary palette. Monochromatic designs (all one species, different figure) create calm sophistication. The finish dramatically affects perceived color — oil finishes deepen and warm colors; water-based finishes maintain the cool natural tone. Consider the room\'s existing wood tones and adjust the furniture\'s species palette to complement or contrast intentionally.',
  },
  {
    id: 'mj-furniture-line-weight',
    topic: 'Visual weight and line in furniture design',
    keywords: ['visual','weight','line','thick','thin','heavy','light','proportion','leg','top'],
    answer: 'Visual weight is the apparent heaviness of a piece based on proportions and details, independent of actual weight. Thick tops on thin legs create tension; thin tops on thick legs look stable. Long horizontal lines read as calm and grounded; tall vertical lines read as elegant or imposing. Curves soften; straight lines strengthen. The viewer\'s eye is drawn to contrast — a single curved detail in an otherwise rectilinear piece becomes a focal point. Study furniture silhouettes in black silhouette form — if the form works as a pure shape, it will work in wood.',
  },

  // ── MORE POWER TOOL TECHNIQUES ────────────────────────────────────────────────
  {
    id: 'mj-router-dado-depth',
    topic: 'Setting router dado depth in multiple passes',
    keywords: ['router','dado','depth','pass','multiple','sneak','burn','chip','load'],
    answer: 'Rout dados in multiple passes rather than full depth in one cut — this reduces load on the bit, minimizes tearout, and produces cleaner walls. First pass: half depth. Second pass: full depth. For wide dados (more than 1"), make a first pass at the near edge, a second pass at the far edge, then clean the middle in a final pass. Going full depth in one pass overloads the bit, produces burning and chip-out, and can move the router away from the fence. Use an upcut spiral bit for cleanest results — it pulls chips out of the groove.',
  },
  {
    id: 'mj-bandsaw-resaw-fence',
    topic: 'Setting the bandsaw drift fence for resawing',
    keywords: ['bandsaw','drift','fence','resaw','angle','compensate','straight','cut','align'],
    answer: 'Bandsaw blade drift is the tendency of the cut to wander off a parallel line — each blade has its own drift angle. To find it: freehand cut a straight line into a piece of scrap, then stop and mark the fence angle where the cut was going straight. Clamp a point fence at this angle and test-cut. The drift angle compensates for the blade\'s tendency to wander right or left, so the fence guides the cut straight even though it\'s not parallel to the blade. A full fence parallel to the table slot will cause curved cuts if drift isn\'t accounted for.',
  },
  {
    id: 'mj-lathe-spindle-turning',
    topic: 'Spindle turning between centers — tool sequence',
    keywords: ['spindle','lathe','between','centers','rough','smooth','detail','gouge','skew'],
    answer: 'Spindle turning sequence: mount the blank between centers, start at low speed, check balance, increase speed. (1) Roughing gouge or skew chisel to knock off corners and make a true cylinder; (2) Spindle gouge for coves, beads, and details; (3) Skew chisel for smooth cylinders and V-cuts; (4) Parting tool for tenons and width references. Calipers check diameters. Work from one end to the other; sand at low speed with the grain moving past you. The spindle roughing gouge is only for between-centers work — never on a faceplate setup.',
  },
  {
    id: 'mj-planer-board-too-thin',
    topic: 'Thickness planer minimum board thickness',
    keywords: ['planer','minimum','thin','board','thickness','feed','roller','support','crush'],
    answer: 'Most thickness planers have a minimum board thickness of 1/4"–3/8" — thinner boards can be caught by the feed rollers, flexed, and shattered. Check your planer\'s manual for its specific minimum. For thin stock (1/8"–3/16"), run the board taped or clamped to a carrier board (a sled of known thickness) — the sled provides support. Alternatively, use a drum sander for stock thinner than 1/4". Never attempt to plane a board thinner than the manufacturer specifies — bent boards can be ejected violently.',
  },
  {
    id: 'mj-planer-grain-direction',
    topic: 'Feeding boards through the planer — grain direction',
    keywords: ['planer','grain','direction','tearout','feed','reversing','downhill','uphill'],
    answer: 'Like the jointer, the thickness planer must receive boards with the grain running "downhill" in the feed direction to avoid tearout. Look at the edge grain of the board; feed the end where fibers slope downward first. For boards with reversing grain, alternate feed ends between passes and take the lightest possible cut (1/64"). A spiral head planer reduces tearout on reversing grain dramatically — the shearing cut from the helical inserts is much less likely to lift fibers than straight knives.',
  },
  {
    id: 'mj-jointer-face-flatten',
    topic: 'Jointing a cupped or twisted face flat',
    keywords: ['jointer','cup','twist','flat','face','pass','depth','high','point','flatten'],
    answer: 'On a cupped board, the edges are higher than the center — the board rocks on the jointer table. Place the cupped face down (concave up) and the high edges contact the infeed table. Take multiple light passes; the jointer removes only the high points and gradually brings the face flat. Severely cupped boards need many passes and significant thickness sacrifice. On a twisted board, the high diagonal corners contact the infeed table and are progressively removed. Hand-plane severe twist first before attempting to joint — a rocking board is difficult to control safely.',
  },
  {
    id: 'mj-table-saw-bevel-cut',
    topic: 'Table saw bevel (tilted blade) cuts',
    keywords: ['bevel','tilt','blade','table','saw','angle','chamfer','splay','degree'],
    answer: 'Set blade bevel angle with the table saw\'s built-in indicator, then verify with a digital angle gauge or bevel gauge on the blade flat. Rip fence position for bevel cuts: on most saws, place the fence on the left (tall) side of the tilted blade — the workpiece leans against the fence and the cut-off piece falls away from the blade. On some saws (right-tilt), the fence must be on the right. Test-cut in scrap and measure the angle before cutting good material. Common bevel cuts: 45° for box corners, 15° for angled tenon cheeks, 20°–25° for drawer blade bevels.',
  },
  {
    id: 'mj-drill-press-angled',
    topic: 'Angled holes on the drill press',
    keywords: ['drill','press','angle','tilt','table','wedge','splay','chair','jig'],
    answer: 'For angled holes on the drill press, tilt the table to the desired angle — most tables tilt 0°–45°. For angles beyond the table range, use a wedge shimming the workpiece instead. The critical issue: the bit must be perpendicular to the desired hole orientation, not perpendicular to the tilted surface. Clamp the workpiece securely — tilted workpieces shift more easily than flat work. For chair leg socket angles (compound), a specialized chair drilling jig holds the seat at the correct compound angle and the drill press drills straight down to produce the angled hole.',
  },
  {
    id: 'mj-hollow-chisel-mortiser',
    topic: 'Hollow chisel mortiser for production mortises',
    keywords: ['hollow','chisel','mortiser','production','square','bit','auger','chip','clear'],
    answer: 'A dedicated mortising machine (bench-top or floor-standing) combines a chisel with an internal auger — the auger drills out chips while the square hollow chisel cuts the walls. This produces a perfectly square-sided mortise rapidly. Key setup: the chisel must be slightly below the auger tip (1/16") so the chisel cuts last. Don\'t plunge too deep on one pass — 1/8"–3/16" per pass prevents chip jamming. Lubricate the chisel occasionally with wax. The hollow chisel mortiser is faster than either hand-mortising or router mortising for production work with identical mortise sizes.',
  },
  {
    id: 'mj-oscillating-spindle-sander',
    topic: 'Oscillating spindle sander technique for inside curves',
    keywords: ['spindle','sander','oscillating','inside','curve','radius','match','smooth','concave'],
    answer: 'Match the spindle drum to the inside radius of the workpiece for best results — a drum too large leaves flat facets; too small leaves ripple marks. Move the workpiece slowly into the drum, making continuous curved passes. The oscillation (up-and-down movement of the spindle) ensures the full height of the workpiece contact area is sanded evenly — without oscillation, a horizontal band would appear. Sand at progressively finer grits by changing the sleeve. The table is adjustable for height — set it so the work contacts the middle of the drum.',
  },
  {
    id: 'mj-router-dovetail-bit',
    topic: 'Dovetail router bit for sliding dovetails and T-slots',
    keywords: ['dovetail','router','bit','sliding','slot','T','undercut','bit','angle'],
    answer: 'A dovetail router bit has an angled cutter that produces a trapezoidal groove — used for sliding dovetail joints, T-slots in jig bases, and router table T-tracks. For sliding dovetails: rout the groove in the housing piece with the dovetail bit at the final depth; then rout the mating male profile on the sliding piece using the same bit at the fence (or with a dedicated dovetail slot jig). Fit the male tenon gradually — sneak up to the final dimension in multiple passes. A too-tight sliding dovetail is very hard to loosen once glued.',
  },
  {
    id: 'mj-scroll-saw-inside-cut',
    topic: 'Scroll saw inside cuts (pierced work)',
    keywords: ['scroll','saw','inside','pierce','thread','blade','drill','interior','relief'],
    answer: 'For inside cuts on the scroll saw (cutting a shape with no path to the outside edge): drill a blade entry hole inside the waste area with a drill bit slightly larger than the scroll saw blade width. Detach the blade from the top arm, thread the blade through the hole, reattach to the top arm, tension, and cut. After completing the cut, detach the blade from the top again and remove the workpiece. This technique enables fretwork, letters, and complex interior shapes that would be impossible to enter from the edge.',
  },

  // ── MORE WORKHOLDING ─────────────────────────────────────────────────────────
  {
    id: 'mj-clamp-count',
    topic: 'How many clamps do you actually need',
    keywords: ['clamp','count','how','many','need','minimum','buy','start'],
    answer: 'You can never have too many clamps. A practical minimum set: 4–6 parallel jaw clamps (18"–24") for panel glue-ups; 4 bar or pipe clamps (36"–48") for larger assemblies; 4 F-clamps (6"–12") for bench clamping and small work; 2 band clamps for frames. Add as projects grow. The most common shop mistake is starting a glue-up and running out of clamps — find every clamp you have before applying any glue. Common woodworking wisdom: if you own 20 clamps, you need 40.',
  },
  {
    id: 'mj-bench-vise-wooden-jaw',
    topic: 'Wooden vise jaw liners for marking and delicate work',
    keywords: ['vise','jaw','wooden','liner','mark','delicate','soft','hold','add'],
    answer: 'The metal jaws of most shop vises will dent soft woods and leave marks on finished work. Glue hardwood jaw liners (maple, beech) to the inner vise jaws — same thickness on both. The wood-on-wood contact distributes clamping force and leaves no marks. Drill dog holes through the liners aligned with bench dog positions for bench-dog clamping. Replace the liners when they accumulate too many gouges and cuts. Quick-Grip clamp-on wooden jaw pads serve the same purpose on clamps — prevent pad marks on finished work.',
  },
  {
    id: 'mj-bench-dog-use',
    topic: 'Bench dogs and tail vise for panel clamping',
    keywords: ['bench','dog','tail','vise','panel','hold','planing','flat','workbench'],
    answer: 'Bench dogs work with a tail vise to clamp flat panels for hand planing — one dog in the vise, the other in a bench dog hole at the appropriate distance, with the panel between them. The vise is tightened until the dogs bear against the panel end. For wide panels, pop-up surface dogs (Veritas Wonder Dogs, for example) grip the panel face without needing the tail vise. Properly clamped with bench dogs, a panel won\'t move even under aggressive hand planing — far better than trying to clamp the panel with regular clamps.',
  },
  {
    id: 'mj-toggle-clamp-jig',
    topic: 'Toggle clamps for repetitive jig work',
    keywords: ['toggle','clamp','jig','hold','down','quick','release','horizontal','vertical','latch'],
    answer: 'Toggle clamps (De-Sta-Co style) apply quick, repeatable, consistent clamping force with a single lever — ideal for production jigs where the same operation repeats many times. Horizontal-handle toggle clamps apply downward force from above; vertical handles apply side force. Bar-style clamps apply force across the workpiece from one side. Size the toggle clamp by its rated holding force (stated in lbs) — oversize is fine, undersized will allow the workpiece to shift. Bolt toggle clamps to jigs through the base with bolts, not wood screws — they must hold under repeated loading cycles.',
  },
  {
    id: 'mj-router-table-hold-down',
    topic: 'Hold-down wheels and shoes for router table work',
    keywords: ['router','table','hold','down','wheel','shoe','featherboard','vertical','pressure'],
    answer: 'Vertical hold-down wheels or featherboards apply downward pressure to keep the workpiece against the router table surface — preventing it from lifting when the bit\'s upward force acts on the workpiece. Position them just before the bit. Set them to flex slightly when the workpiece is under them. A workpiece that lifts from the table while passing over the bit can catch and be kicked back or produce a wavy profile. Horizontal featherboards at the fence plus vertical hold-downs together provide the most controlled feed for profile routing.',
  },
  {
    id: 'mj-pipe-clamp-technique',
    topic: 'Pipe clamp technique for wide glue-ups',
    keywords: ['pipe','clamp','wide','panel','alternate','above','below','bow','caul'],
    answer: 'Pipe clamps on wide panels must alternate above and below the panel — one clamp on top, the next below, the next on top. This alternating pattern counteracts the tendency for pipe clamps to bow the panel (the ends rise as the middle is pressed down from one side only). Add clamping cauls (straight sticks with slight camber) across the panel perpendicular to the clamps to distribute pressure evenly across the joints. A straight caul distributes force; a slightly crowned caul puts extra pressure at the center where it\'s needed most.',
  },
  {
    id: 'mj-clamp-alignment',
    topic: 'Aligning parts while clamping glue-ups',
    keywords: ['align','clamp','slip','register','pin','stop','nail','drift','prevent'],
    answer: 'Glued surfaces are slippery — parts shift as clamping pressure is applied. Prevention strategies: tap small finishing nails into one surface and cut off the heads to leave registration pins (pull out after cure); use biscuits or Dominoes for alignment; add a registration strip (a clamped-on batten that keeps the edge flush) at the joint. Start with light clamping pressure to check alignment, adjust if needed, then tighten fully. For long panel glue-ups, a flat reference surface (assembly table with waxed top) prevents parts from shifting planes.',
  },

  // ── MORE SAFETY DETAIL ────────────────────────────────────────────────────────
  {
    id: 'mj-guard-maintenance',
    topic: 'Maintaining and using machine guards',
    keywords: ['guard','maintain','use','blade','router','table','attach','dust','port'],
    answer: 'Machine guards are safety features, not obstacles. Most modern guards integrate dust collection — a connected guard works better than an unguarded machine with no dust control. Keep guards clean and functional; replace cracked plastic guards immediately. For operations that require removing the blade guard (dado cuts, bevel cuts with old-style splitters), use alternative safety measures: anti-kickback pawls, correct stance, reduced feed speed. Never operate a table saw or jointer without some form of guard or riving knife unless the specific operation makes it impossible and you\'ve minimized risk in other ways.',
  },
  {
    id: 'mj-sharp-tool-safer',
    topic: 'Why sharp tools are actually safer',
    keywords: ['sharp','tool','safe','force','control','dull','slip','pressure','cut','accident'],
    answer: 'Dull tools require more force — the extra force causes slipping, loss of control, and fatigue that leads to accidents. A sharp chisel pares cleanly with hand pressure only; a dull one requires a mallet and levers unpredictably. A sharp hand saw tracks straight in the kerf; a dull one wanders. Sharp plane irons cut with a quiet hiss; dull ones drag and chatter. The most common shop injuries come from forcing dull tools. Time spent sharpening is time invested in both quality and safety — the shop is significantly safer when all tools are maintained sharp.',
  },
  {
    id: 'mj-clutter-safety',
    topic: 'Shop organization and floor safety',
    keywords: ['clutter','trip','floor','safety','offcut','extension','cord','clear','organize'],
    answer: 'Shop floor clutter is a direct safety hazard — a trip over an offcut near a spinning saw is catastrophic. Sweep the floor frequently during work sessions; have an offcut bin within arm\'s reach of the table saw. Route extension cords overhead or along the wall, never across the floor. Keep areas around machine exits clear — don\'t lean boards against machines in the outfeed zone. After each machine use, clear the area before moving to the next machine. Five minutes of cleaning at session end makes the next session start safely.',
  },
  {
    id: 'mj-chemical-storage',
    topic: 'Storing finishing chemicals safely',
    keywords: ['chemical','storage','finish','solvent','flammable','cabinet','cool','ventilate','code'],
    answer: 'Flammable finishing chemicals (lacquer, mineral spirits, paint thinner, acetone) must be stored in a flammable materials storage cabinet or a well-ventilated outbuilding — not in the living space or in an unventilated closet. Keep quantities small; don\'t stockpile more than you\'ll use in a few months. Store containers tightly sealed and upright. Check local fire codes — many jurisdictions limit the quantity of flammable liquids in residential attached garages. Dispose of partly-used and old solvents at a hazardous waste facility, not in the trash or drain.',
  },
  {
    id: 'mj-tool-inspection',
    topic: 'Pre-use tool inspection routine',
    keywords: ['inspect','tool','before','use','blade','sharp','guard','cord','check','routine'],
    answer: 'Before using any power tool: check the cord for damage (cuts, frays, exposed wires), verify the blade or bit is sharp and properly installed, confirm all guards are in place and functional, check that adjustments (depth, angle, fence) are locked and set correctly, and remove the setup key (if a drill press) before turning on power. This 30-second inspection catches problems that could cause injury — a blade installed backwards, a loose collet nut, or a frayed power cord are all findable before they become accidents.',
  },
  {
    id: 'mj-dust-collection-filtration',
    topic: 'Dust collector filter ratings explained',
    keywords: ['filter','micron','dust','collector','1','5','30','MERV','efficiency','fine'],
    answer: 'Dust collector filters are rated by the smallest particle size they capture. A 30-micron felt bag captures most large chips and shavings — visible dust — but allows fine particles (the dangerous ones) to pass through. A 5-micron cartridge filter catches most of the fine dust that reaches the lungs. A 1-micron or HEPA (0.3 micron at 99.97% efficiency) filter is needed to capture the finest particles. For serious health protection, use a 1-micron cartridge filter in your collector AND a ceiling-mounted air filtration unit to catch what escapes.',
  },
  {
    id: 'mj-first-aid-shop',
    topic: 'Shop first aid essentials',
    keywords: ['first','aid','kit','emergency','bleed','bandage','eye','wash','cut','shop'],
    answer: 'Shop first aid kit essentials: sterile gauze pads (2"×2" and 4"×4"), medical tape, elastic bandage, butterfly closures for deeper cuts, antiseptic wipes, eye wash station (at least a portable bottle), nitrile gloves, tweezers for splinter removal. Mount the kit visibly near the shop exit. Know the emergency contact numbers. For serious bleeding (arterial), apply firm direct pressure and call emergency services — don\'t attempt to remove embedded objects. For eye injuries from chemical exposure, flush with water for 15–20 minutes continuously and seek medical attention.',
  },

  // ── MORE BUYING & MILLING ─────────────────────────────────────────────────────
  {
    id: 'mj-green-wood-turning',
    topic: 'Turning green (wet) wood on the lathe',
    keywords: ['green','wet','wood','turn','crack','rough','thin','dry','twice','turn'],
    answer: 'Green wood turns much easier than dry — it\'s softer, cooler on the tools, and the shavings are beautiful long ribbons. The challenge: it will crack as it dries unless the wall is thin enough to move with the drying stress. Rough turn green bowls to 10% of the diameter in wall thickness (a 10" bowl gets 1" walls), let dry for weeks or months in a bag or with end seal, then finish-turn when dry. Alternatively, rough turn, boil for an hour (stabilizes), dry, and finish-turn. "Once-turned" green bowls can dry successfully at 1/8" thickness.',
  },
  {
    id: 'mj-rough-lumber-yield',
    topic: 'Expected yield from rough sawn lumber',
    keywords: ['rough','sawn','yield','milling','loss','flatten','twist','width','length'],
    answer: 'Expect to lose 15–25% of rough sawn lumber to milling operations. A 5/4 (1.25" nominal) rough board yields about 0.9"–1" after surfacing. Boards with significant bow, cup, or twist lose more — a heavily bowed board might yield only 60% of its nominal thickness. Rough width is also oversize by 1/2"–1" per side. When planning a cut list, measure your rough boards in their rough state and calculate available milled dimensions before planning parts. Thin rough boards (4/4 with significant warp) may not be usable without gluing up for required thickness.',
  },
  {
    id: 'mj-sticker-spacing',
    topic: 'Sticker spacing for air drying and shop storage',
    keywords: ['sticker','spacing','dry','stack','support','sag','airflow','even'],
    answer: 'Sticker (spacer strip) spacing for air drying: every 16"–24" along the length for boards up to 8/4 thickness; every 12"–16" for thicker stock that tends to sag between supports. Use dry, consistent-thickness stickers (3/4"×1" is standard) to ensure the stack is level and even pressure is applied. Position end stickers within 12" of board ends to reduce end checking. Align all stickers vertically (one directly above another in all layers) so the weight is transferred straight down without horizontal bending stress on the wet boards.',
  },
  {
    id: 'mj-board-selection-straight',
    topic: 'Selecting boards for straight grain — furniture strength',
    keywords: ['straight','grain','select','wood','run','out','strength','bend','furniture'],
    answer: 'Straight grain (no run-out) is critical for stressed furniture parts like legs, stretchers, and chair spindles. Run-out means the grain lines angle across the surface rather than running parallel to the length. Even 5° of run-out dramatically reduces bending strength — the fibers break across the grain rather than along it. To check: look at the edge of the board; grain lines should run parallel to the edge. For bent laminations, quartersawn stock with perfectly straight edge grain is strongest. Reject boards with significant run-out for structural applications.',
  },
  {
    id: 'mj-freshly-sawn-smell',
    topic: 'Identifying wood species by smell when freshly cut',
    keywords: ['smell','identify','species','scent','fresh','cut','cedar','cherry','walnut','pine'],
    answer: 'Many wood species have distinctive smells that are diagnostic when freshly cut. Cedar: strong aromatic camphorous smell. Cherry: sweet, almost fruity. Pine: resinous, sharp turpentine. Black walnut: a rich, slightly astringent smell. Sassafras: unmistakable root beer or tea smell. Camphor: intense medicinal camphor. Rosewood/cocobolo: a distinctive sweet-spicy resinous smell. These scents fade within days of cutting or drying. An experienced woodworker can identify 20+ species by smell — it\'s a useful field identification skill at the lumber yard.',
  },
  {
    id: 'mj-sequential-boards',
    topic: 'Buying sequential boards for panel continuity',
    keywords: ['sequential','board','match','color','figure','continuous','panel','adjacent','same','log'],
    answer: 'Boards cut sequentially from the same log are similar in color, figure, and grain character. Ask the dealer to pull sequential boards from the same pack. They\'ll have nearly identical grain direction, similar mineral content, and compatible wood movement. When glued into panels, the grain appears to flow continuously across the joint — the most natural-looking result. Buy all boards for a single project from the same pack or log if possible; mixing boards from different trees produces panels with jarring color or figure discontinuities across joints.',
  },

  // ── TROUBLESHOOTING ───────────────────────────────────────────────────────────
  {
    id: 'mj-wavy-planer',
    topic: 'Fixing wavy planer output',
    keywords: ['wavy','planer','washboard','snipe','knives','slow','feed','chatter'],
    answer: 'Wavy or washboard output from a planer (parallel ripples across the surface) is caused by knife marks repeating at a frequency set by the knife count, spindle RPM, and feed rate. Fix: slow the feed rate (more overlapping knife strikes per inch); sharpen or replace the knives (dull knives cause chatter); check that all knives are set to identical height (a high knife cuts more and marks more deeply). On a helical head planer, wavy output usually means a carbide insert is chipped — rotate or replace the offending insert.',
  },
  {
    id: 'mj-bandsaw-cut-drift',
    topic: 'Bandsaw cut drifts during use — mid-session',
    keywords: ['bandsaw','drift','wander','change','session','blade','tension','heat','guide'],
    answer: 'If the bandsaw cut starts drifting during a session but was fine at the start, the blade is heating and changing tension. Blade heat from extended use can alter the drift angle. Another cause: the blade guides are worn or set incorrectly, allowing lateral blade movement under load. Check: let the blade cool, re-check drift angle with a test piece. If drift angle changed, readjust the fence. If it persists, check guide wear. Carbide guide blocks and ceramic cool blocks maintain their positioning better than old steel guides under heat.',
  },
  {
    id: 'mj-table-saw-burning',
    topic: 'Table saw burning on the cut — causes and fix',
    keywords: ['table','saw','burn','scorch','mark','blade','speed','feed','dull','resin'],
    answer: 'Burning on table saw cuts has three main causes: (1) Dull blade — replace or sharpen; (2) Feed rate too slow — move the board faster through the cut; (3) Fence is pinching the wood against the blade (fence is toe-in at the back) — adjust fence to be parallel or very slightly toe-out. Resinous woods (pine) burn more easily than hardwoods — speed up the feed rate. Never stop mid-cut or the blade will burn a visible mark at that point. Cleaning blade pitch with oven cleaner or blade cleaning spray also helps; pitch buildup makes burning worse.',
  },
  {
    id: 'mj-glue-creep',
    topic: 'Glue creep — why joints slip over time',
    keywords: ['creep','glue','slip','PVA','sustained','load','stress','relax','hard'],
    answer: 'Creep is the slow deformation of a glue joint under sustained load — the joint doesn\'t fail suddenly but gradually slips over months or years. PVA wood glue has measurable creep under sustained stress, especially at elevated temperatures. For joints under sustained tension or shear (stacked shelf joints carrying book load, chair stretchers), use a harder-curing adhesive: urea-formaldehyde (plastic resin), epoxy, or hide glue. Hot hide glue is harder when cured than most PVAs and resists creep better. PVA\'s creep is usually not a problem in furniture joints, but it matters in woodworking jigs and instrument-making.',
  },
  {
    id: 'mj-finish-peeling',
    topic: 'Why finish peels and how to prevent it',
    keywords: ['peel','finish','adhesion','prep','contamination','oil','seal','over','coat'],
    answer: 'Finish peels when adhesion between the finish and the substrate (or between finish coats) fails. Common causes: oil, wax, or silicone contamination on the wood surface; applying incompatible topcoat over the wrong sealer; applying a film finish over uncured penetrating oil; not sanding between coats; applying finish in too-cold conditions. Prevention: clean with naphtha before finishing; seal with shellac as a universal bonding agent; sand between coats of varnish/poly; work in temperatures above 55°F. Once finish is peeling, strip completely and start over — partial repairs over peeling finish never hold.',
  },
  {
    id: 'mj-checking-flatness-long',
    topic: 'Checking flatness on long narrow pieces',
    keywords: ['flat','long','narrow','check','board','winding','sight','line','straight'],
    answer: 'Long, narrow pieces (rails, stiles, drawer sides) can have bow, twist, or spring that\'s hard to see visually. Use a long straightedge or a known-flat reference board held alongside the piece — any gap at the center or ends reveals bow. Sight down the edge (eye at one end, looking along the length) to see wind (twist) easily. For high-precision work, mark the high points with chalk and plane or sand to the reference. A bowed drawer side won\'t slide smoothly in its case; straighten it before final fitting.',
  },
];
