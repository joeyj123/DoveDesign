import type { KnowledgeEntry } from './pepeKnowledge';

export const PEPE_KNOWLEDGE_MASTER_M: KnowledgeEntry[] = [
  // ── WORKHOLDING (MORE) ────────────────────────────────────────────────────────
  {
    id: 'mm-bench-vise-quick-release',
    topic: 'Quick release vise mechanism — how it works',
    keywords: ['quick','release','vise','mechanism','disengage','fast','adjust','width'],
    answer: 'Quick-release vises have a half-nut mechanism that disengages the main screw from the nut — allowing the jaw to slide freely to the approximate width, then re-engage and tighten with just a fraction of a turn. A quarter-turn back on the screw disengages the half-nut; turning forward re-engages it. This allows instant repositioning without spinning the handle through the full range. Older Record and Stanley vises use this mechanism; modern Bessey, Lie-Nielsen, and Benchcrafted vises have similar mechanisms but with different geometry. Always re-engage fully before tightening or the half-nut can be damaged.',
  },
  {
    id: 'mm-pipe-clamp-alignment',
    topic: 'Pipe clamp parallel bar for non-racking glue-ups',
    keywords: ['pipe','clamp','parallel','bar','attachment','non-rack','panel','add','accessory'],
    answer: 'Pipe clamps rack panels out of flat because the upper and lower jaw don\'t stay in the same vertical plane — the jaw rotates as you tighten. Add pipe clamp parallel bar accessories (extenders that clip to both jaws to make them stay parallel) or simply alternate clamps above and below. Another approach: use parallel jaw clamps (Bessey K-Body) which are inherently non-racking. For long panel glue-ups where you must use pipe clamps, place a flat caul bar across the clamps perpendicular to them — the caul resists the jaw rotation and keeps the panel in plane.',
  },
  {
    id: 'mm-clamp-rack',
    topic: 'Clamp storage rack designs',
    keywords: ['clamp','storage','rack','wall','pipe','bar','parallel','organize','hang'],
    answer: 'Clamp storage must be accessible and organized by type. Wall-mounted horizontal rails (pairs of horizontal dowels or pipe flanges spaced 16" apart) hold bar and pipe clamps by their bars. Pipe clamps hang vertically on hooks through the pipe. F-clamps hang on a horizontal rail by their sliding bars. Spring clamps live in a bin. Parallel jaw clamps are bulky — a dedicated shelf or vertical slot rack works. Group clamps by type so you can grab the right one quickly. Store clamps with the screw mechanism closed to maintain the thread over time.',
  },
  {
    id: 'mm-crosscut-sled-stop-blocks',
    topic: 'Crosscut sled stop block system for multiple lengths',
    keywords: ['crosscut','sled','stop','block','multiple','flip','length','production','setting'],
    answer: 'A flip-down stop block system on a crosscut sled allows production cutting of multiple lengths without re-clamping. Multiple stop blocks at different lengths are mounted to a common rail — flip down the one you want, cut, flip it up, and the next cut is at a different length. Commercial T-track stop blocks allow infinite adjustment along the fence. For a run of identical pieces, glue a stop block to a strip of MDF clamped to the sled fence — mark its position in pencil so it can be repositioned accurately next session. Consistent stop block contact is essential — always push the stock firmly against the stop before cutting.',
  },
  {
    id: 'mm-corner-clamp',
    topic: 'Corner clamps for picture frames and boxes',
    keywords: ['corner','clamp','picture','frame','box','right','angle','hold','glue'],
    answer: 'Corner clamps hold two pieces at an exact 90° angle while glue cures — indispensable for picture frames, drawer corners, and box glue-ups. Models range from simple plastic spring-loaded versions (Bessey) to heavy cast versions with screw-adjustable jaws (Woodpeckers). The critical alignment: the inside corner must be exactly 90°, not just the clamp\'s rated angle. Check with a square after clamping. For picture frames, use a band clamp plus corner protectors to pull all four corners tight simultaneously rather than clamping one corner at a time.',
  },
  {
    id: 'mm-glue-joint-jigging',
    topic: 'Jigging edge glue-ups for consistent alignment',
    keywords: ['jig','edge','glue','up','align','straight','biscuit','fence','reference'],
    answer: 'For edge glue-ups that must be dead flat, work on a known-flat reference surface (a torsion-box assembly table or a reliable flat bench). Clamp a straight fence along one edge to keep all boards aligned. Alternate clamps above and below. Use biscuits only for alignment (not strength) — they prevent the boards from slipping sideways as clamps are tightened. The real key to flat panels: joint the edges perfectly (the No.7 plane or jointer) so there are no gaps before clamping. Clamp pressure can\'t close a gap; it only pulls boards laterally, not vertically into alignment.',
  },

  // ── MORE PROJECT TYPES ────────────────────────────────────────────────────────
  {
    id: 'mm-garden-bench',
    topic: 'Garden bench construction with dowel back slats',
    keywords: ['garden','bench','seat','back','slat','dowel','round','tenon','outdoor','cedar'],
    answer: 'A simple garden bench has: a seat of two or three 2×4 planks; two legs and back posts (2×4 or 2×6) at each end; a cross stretcher; and optional back slats. Back slats can be through-bolted to the back posts, dadoed into them, or mortised with round tenons on a lathe. Cedar, teak, or pressure-treated lumber for all structural members. Stainless or galvanized fasteners throughout. The seat slats should have 1/4"–3/8" gaps between them for drainage and airflow. Round all exposed edges with a roundover router bit — sharp edges on outdoor furniture splinter over time.',
  },
  {
    id: 'mm-floating-shelf-cleats',
    topic: 'Floating shelf with concealed wooden cleats',
    keywords: ['floating','shelf','cleat','wooden','concealed','French','dovetail','route','slot'],
    answer: 'Concealed wooden cleats mount to the wall; the shelf has a matching routed slot that slides over the cleat from the front. The dovetail-style cleat (tapered or angled) locks as the shelf slides in and can\'t be pulled forward without sliding it off sideways. Cut the cleat and matching slot with a router and a straightedge guide. The cleat must be level, and the slot in the shelf must match the cleat width exactly — even 1/16" too tight will prevent the shelf from seating. This approach hides all mounting hardware without any visible screws or brackets.',
  },
  {
    id: 'mm-bar-cabinet',
    topic: 'Bar cabinet (liquor cabinet) design',
    keywords: ['bar','cabinet','liquor','wine','glass','bottle','rack','overhead','storage'],
    answer: 'A bar cabinet typically has: bottle storage in the base (adjustable dividers or bottle wine rack), glass storage overhead (inverted glass hangers or shelves), and a pullout counter surface or drop-leaf shelf for mixing. Interior lighting (LED strip) dramatically improves the look and functionality. Overhead glass storage: route channels or dados for an inverted T-bar that glasses hang from. Bottle dividers should accommodate standard wine bottles (3.5" diameter) plus standard liquor bottles (3" diameter). A small sink (plumbed or dry bar) can be incorporated in more elaborate builds.',
  },
  {
    id: 'mm-kids-furniture',
    topic: 'Child-sized furniture dimensions',
    keywords: ['children','kid','furniture','dimension','height','desk','table','chair','age'],
    answer: 'Child furniture dimensions vary by age. Table height: age 2–4 → 18"–20"; age 5–8 → 20"–22"; age 9–12 → 24"–26". Chair seat height: 2 inches below the table height. Desk height: same as table for young children; adults: 28"–30". Toy box: 18"–24" height (accessible without tipping). Bookshelves for children: eye-level top shelf at their standing eye height. All child furniture should use rounded edges, non-toxic finishes, and no small-part hardware that could be swallowed. ASTM and CPSC standards apply to commercially sold pieces but are good guides for shop-made items.',
  },
  {
    id: 'mm-wine-glass-rack',
    topic: 'Overhead wine glass rack construction',
    keywords: ['wine','glass','rack','overhead','inverted','hang','stem','cabinet','slot'],
    answer: 'An overhead wine glass rack hangs glasses upside-down by the stem in slots or channels routed in the underside of a shelf or cabinet bottom. The slot width should match the stem diameter plus a small clearance (typically 3/8"–1/2" wide, 3/4" deep). Route parallel channels with spacing matching the glass bowl diameter plus 1/2" clearance. Glasses hang by the rim resting on the wood on either side of the slot while the stem passes through. For larger glasses, use a grid of routed channels in both directions for a more secure hold. Mount it in a bar cabinet, under an upper cabinet, or as a standalone ceiling-mount piece.',
  },
  {
    id: 'mm-platform-bed',
    topic: 'Platform bed with slat base construction',
    keywords: ['platform','bed','slat','base','low','profile','modern','storage','mattress'],
    answer: 'Platform beds sit lower to the ground (typically 8"–12" total height) and support a mattress directly on a slat or solid base. Slat construction: 2.5"–4" wide hardwood slats (poplar, pine) spaced 3" maximum to fully support the mattress. Slats should flex slightly but not sag. For a king bed, a center support rail running lengthwise from headboard to foot, with a center leg to the floor, prevents slat deflection. Platform beds with storage drawers below use a taller case (18"–22") with full-extension drawer slides in the base structure.',
  },
  {
    id: 'mm-headboard',
    topic: 'Headboard construction and wall mounting',
    keywords: ['headboard','mount','wall','upholster','panel','attach','height','above','mattress'],
    answer: 'A simple wood-panel headboard mounts directly to the wall or to a floor-standing frame attached to the bed frame. Wall-mount headboards should be anchored into studs — a headboard catches pillows and occasional leaning, applying side-to-side forces. Top of headboard: 20"–30" above the finished mattress height is typical for a standard headboard. Upholstered headboards: build a plywood panel, glue on 2"–3" foam, wrap in batting, and staple fabric to the back. For tall statement headboards (72"+), anchor at top and bottom into studs.',
  },
  {
    id: 'mm-breakfast-bar',
    topic: 'Kitchen breakfast bar overhang dimensions',
    keywords: ['breakfast','bar','overhang','counter','knee','clearance','stool','height','dimension'],
    answer: 'Kitchen breakfast bar dimensions depend on stool height. Counter height (36"): standard bar stools, 12"–15" overhang for knee room. Bar height (42"): tall bar stools, 12" overhang minimum. For seated knee clearance: the overhang must extend at least 12" from the supporting cabinet face. Counter top thickness: 1.5"–4" depending on material (laminate: 1.5"; butcher block: 2"–3"; concrete or stone: 2"–4"). Support the overhang with corbels or knee braces for overhangs beyond 12" that will carry sitting load — the substrate alone can\'t canteliver a heavy stone top more than a few inches.',
  },
  {
    id: 'mm-dollhouse',
    topic: 'Dollhouse construction — scale and materials',
    keywords: ['dollhouse','scale','1:12','miniature','plywood','thin','construction','paint'],
    answer: 'Standard dollhouse scale is 1:12 (one inch = one foot). For 1:12 scale, 1/8"–1/4" plywood simulates full walls and floors realistically. Construction uses the same joints as full-size cabinetry but at miniature scale: dados, rabbets, and small nails or wood glue. Windows and doors can be purchased as pre-made laser-cut sets. Lightweight materials (balsa for trim, thin plywood for structure) make the house manageable. Paint interiors before assembly — access becomes impossible in corners once assembled. A classic 12-room dollhouse is a multi-year project; start with a simple 4-room version.',
  },
  {
    id: 'mm-workshop-cabinet',
    topic: 'Shop storage cabinet — maximizing efficiency',
    keywords: ['shop','storage','cabinet','drawer','bin','shallow','hardware','organize','workshop'],
    answer: 'A shop storage cabinet for hardware and supplies should have many shallow drawers (2"–3" high) rather than a few deep ones — small items in deep drawers are impossible to find. Plan: 8–12 shallow drawers for hardware (screws, nails, bolts sorted by size); 4–6 medium drawers (4"–6") for larger hardware, tape, measuring tools; 2–3 deep drawers or doors for bulk supplies. Label every drawer on the front. Drawer boxes in shop cabinets don\'t need the finishing quality of furniture drawers — simple dado-joined plywood boxes that glide smoothly serve perfectly well.',
  },
  {
    id: 'mm-crib-safety',
    topic: 'Baby crib and toddler bed safety requirements',
    keywords: ['crib','baby','toddler','safety','rail','space','standard','entrapment','finish'],
    answer: 'CPSC crib standards are strict and non-negotiable for baby safety. Key requirements: slat spacing maximum 2-3/8" to prevent entrapment of head; no lead paint or toxic finishes; no drop-side rails (banned in US since 2011); mattress height adjustable; corner posts no higher than 1/16" above the end panels (loose clothing catch risk). For a shop-made crib, purchase and conform to CPSC standards meticulously — a non-compliant crib is a serious safety risk. Many woodworkers choose to build a toddler bed instead (for children over 15 months) where standards are less strict.',
  },
  {
    id: 'mm-log-bench',
    topic: 'Simple log bench from a halved tree trunk',
    keywords: ['log','bench','half','trunk','chainsaw','slab','leg','rustic','simple'],
    answer: 'The simplest bench is a log halved lengthwise with a chainsaw or portable band mill — flat face up, bark face down (or bark retained as a design element). Legs can be round branches with angled socket holes drilled into the underside (staked bench), or the log can be supported by two solid end pieces set in deep mortises. A staked log bench: drill four angled holes into the flat face at each corner, shape round tenons on straight branches, and drive them home. Green log benches shrink as they dry, tightening the leg joints. An enduring rustic garden piece.',
  },

  // ── MORE SAFETY ───────────────────────────────────────────────────────────────
  {
    id: 'mm-saw-blade-selection',
    topic: 'Choosing the correct saw blade for the material',
    keywords: ['saw','blade','material','aluminum','non','ferrous','wood','laminate','correct'],
    answer: 'Using the wrong blade for the material causes binding, burning, and dangerous kickback. Wood ripping: 24–40 ATB or FTG teeth. Plywood and crosscuts: 60–80 ATB teeth. Aluminum and non-ferrous metals: specific aluminum-cutting blade with negative hook angle and no-climb feed. MDF and composite: triple-chip grind (TCG) blades reduce edge chipping. Laminate (HPL) and melamine: 80+ tooth TCG blade. Never use a wood blade on metal — the teeth shatter; never use a metal blade on dry wood — it burns and binds. Always check that the blade\'s rated RPM exceeds your saw\'s no-load RPM.',
  },
  {
    id: 'mm-extension-cord-safety',
    topic: 'Extension cord selection for power tools',
    keywords: ['extension','cord','gauge','AWG','length','amps','power','tool','undersized'],
    answer: 'Undersized extension cords cause voltage drop that overloads motor windings, creating heat and premature motor failure. Minimum cord gauge by tool amperage and length: up to 15 amps, up to 25 feet: 14 AWG. Up to 15 amps, 25–50 feet: 12 AWG. Up to 15 amps, 50–100 feet: 10 AWG. Table saws and planers draw 12–15 amps at full load — always use 12 AWG or thicker, and keep cords as short as practical. Never use a cord with a damaged jacket — replace it before use. Three-prong (grounded) cords are mandatory for all power tools.',
  },
  {
    id: 'mm-kickback-stance',
    topic: 'Correct stance at the table saw to avoid kickback injury',
    keywords: ['kickback','stance','position','body','table','saw','side','injury','zone'],
    answer: 'The kickback danger zone at a table saw is directly behind the blade in a narrow arc extending rearward. Stand to the left of the blade line for right-handed rip cuts — your body is out of the danger zone. For crosscuts (using a miter gauge or sled), stand to either side of the blade, not directly behind it. Never lean over the top of the blade to reach for an offcut. Keep your left arm behind your body rather than extended toward the blade when feeding narrow stock. After any cut where a piece becomes small enough to possibly bounce back, step to the side before reaching for it.',
  },
  {
    id: 'mm-carbon-monoxide',
    topic: 'Carbon monoxide hazard from combustion heaters',
    keywords: ['carbon','monoxide','CO','detector','heater','propane','combustion','shop','detector'],
    answer: 'Combustion heaters (propane forced-air, natural gas radiant) in enclosed shops produce carbon monoxide — an odorless, colorless, potentially fatal gas. CO accumulates in unventilated spaces faster than is detectable by smell. Install a CO detector in any shop with a combustion heater — mounted at breathing height (CO is slightly lighter than air). Ensure fresh air ventilation is adequate for the heater\'s BTU rating; most heaters require specific CFM of outside air. Battery-powered CO detectors are recommended over plug-in models in shops where power may be unreliable.',
  },

  // ── MORE HAND TOOLS ───────────────────────────────────────────────────────────
  {
    id: 'mm-spokeshave-concave',
    topic: 'Round-soled spokeshave for concave curves',
    keywords: ['spokeshave','round','sole','concave','hollow','chair','seat','back'],
    answer: 'The round-soled spokeshave has a convex sole that works inside concave curves — the curve of the sole follows the hollow rather than bridging it the way a flat-soled spokeshave would. Use it on the inside of chair back curves, the inside of bent forms, and any concave surface too curved for a flat tool to reach without the corners catching. The round-soled type takes some practice to set — adjust the iron for very light cuts and test on scrap until you understand how the curved sole affects the cutting action.',
  },
  {
    id: 'mm-marking-gauge-set',
    topic: 'Setting a marking gauge accurately',
    keywords: ['marking','gauge','set','accurate','ruler','measurement','repeat','lock'],
    answer: 'Setting a marking gauge from a ruler: hold the ruler vertically with the end on a flat surface; set the marking pin to the desired measurement against the ruler face; tighten the fence lock. A better method: set from a reference piece — hold the fence against the reference, adjust the pin to touch the opposite face, and lock. This takes the dimension directly from the work rather than from a ruler, eliminating any ruler-reading error. Always verify by scribing a test line on scrap and checking it with a caliper before scribing the actual workpiece.',
  },
  {
    id: 'mm-chamfer-handplane',
    topic: 'Cutting chamfers and bevels by hand',
    keywords: ['chamfer','bevel','hand','plane','block','angle','45','consistent','guide'],
    answer: 'A block plane creates chamfers on edges easily and quickly. For consistent 45° chamfers, sight by eye (the reflection in the blade should show equal amounts of the top and side face) or use a simple guide — a piece of wood with a 45° surface that rides on both faces simultaneously. Start the chamfer with a light pass to establish the angle; check it; adjust if needed; then take progressive passes to the desired width. A scratch gauge (mortise gauge) set to the chamfer width scribes both faces to give a target width line to work to.',
  },
  {
    id: 'mm-hand-plane-lateral',
    topic: 'Lateral adjustment of a bench plane iron',
    keywords: ['lateral','adjust','plane','iron','skew','straight','shaving','width','even'],
    answer: 'The lateral adjustment lever on a bench plane moves the iron sideways — correcting skew so the cutting edge is parallel to the sole and produces even-width shavings across the full width. Look down the sole from the toe with the plane bottom-up: adjust until the iron shows as a thin, perfectly even sliver across the full mouth opening. An iron skewed too far one way produces shavings only on one side of the cut, leaving ridges. Test on scrap and check that shavings come from both sides of the blade simultaneously before starting on good material.',
  },
  {
    id: 'mm-chisel-paring-direction',
    topic: 'Paring chisel direction for clean cuts',
    keywords: ['paring','direction','grain','chisel','with','against','clean','slice','control'],
    answer: 'Pare with the grain whenever possible — the chisel slices cleanly along fiber direction. When paring across the grain (as at a dovetail baseline), the knife wall severs the fibers first; the chisel then clears the waste. Paring end grain requires very sharp chisels and steady hand pressure — the fibers run directly into the blade. For dovetail corners: pare from both sides toward the center of the corner to prevent the chisel from splintering the far corner. Never extend the cutting hand past the chisel edge in any direction the chisel could plunge if it slips.',
  },
  {
    id: 'mm-gouge-carving-technique',
    topic: 'Carving gouge technique — push and mallet',
    keywords: ['gouge','carve','push','mallet','cut','relief','depth','direction','grain'],
    answer: 'Carving gouges are driven either by hand push (for fine detail and finishing cuts) or a mallet (for roughing and setting-in). For mallet work: hold the gouge at a steeper angle (more perpendicular to the surface) and drive with short controlled strokes. For hand-push paring: hold at a lower angle (more parallel to the surface) and use your shoulder and body weight for control rather than just wrist pressure. Always cut down-grain (the wood fibers slope away from the cut direction). Avoid cutting up-grain — it lifts fibers and tears the surface rather than slicing clean.',
  },
  {
    id: 'mm-handsaw-track',
    topic: 'Keeping a handsaw tracking straight',
    keywords: ['handsaw','track','straight','drift','guide','accurate','control','tilt'],
    answer: 'A handsaw that drifts sideways is usually dull or has uneven set (teeth bent more one side than the other). On a fresh saw: start with the blade perfectly vertical using the reflection in the side of the blade as a guide; small corrections early are much easier than correcting a deep drifted cut. A bench hook provides a right-angle edge to register the saw against. For a perfectly straight cut in thick material, a saw guide (a clamped hardwood block with a kerf) keeps the saw vertical and on line for the full depth of the cut.',
  },

  // ── DESIGN & AESTHETICS ───────────────────────────────────────────────────────
  {
    id: 'mm-design-sketch',
    topic: 'Sketching furniture designs before building',
    keywords: ['sketch','design','drawing','perspective','plan','elevation','orthographic','idea'],
    answer: 'Sketch furniture designs in orthographic views (front, side, and top) at a consistent scale — 1"=1\' or 1/2"=1\'. Orthographic drawings reveal proportional errors that perspective sketches hide. Add key dimensions (overall height, width, depth; leg size; shelf spacing; door size) to each view. A plan view (top down) helps with leg placement and apron clearances. After the orthographic layout, do a perspective sketch for the client presentation or your own visualization. SketchUp (free version) works well for 3D furniture design without architectural CAD background. DoveDesign handles this natively in 3D.',
  },
  {
    id: 'mm-pull-placement',
    topic: 'Door and drawer pull placement for visual consistency',
    keywords: ['pull','placement','door','drawer','consistent','visual','center','offset','line'],
    answer: 'On cabinet doors: pulls on face-frame overlay doors are typically centered on the stile at a height of 1/3 from the top or bottom. On inset doors: centered in the stile at the same height. Drawer pulls: always centered left-to-right; on narrow drawers, centered top-to-bottom; on tall drawers, placed at the top 1/3 for easy one-finger-pull open. All pulls in a run of cabinets should be at the same height from the same datum (cabinet top or floor) for visual consistency. A drill jig made from 1/4" hardboard ensures all pull holes land in exactly the same position on every door and drawer.',
  },
  {
    id: 'mm-shadow-lines',
    topic: 'Creating shadow lines in furniture for visual depth',
    keywords: ['shadow','line','reveal','setback','depth','detail','visual','interest','inset'],
    answer: 'Shadow lines are small recesses or setbacks that create dark lines of shadow on a surface — adding visual depth and interest without physical decoration. A drawer face set 1/8" back from surrounding face frame creates a subtle shadow line all around. A panel set 3/16" back from a surrounding frame creates a line that reads as defined and crisp from across a room. A back-beveled edge (a very slight chamfer on the back of an edge that sets it back from the adjacent surface) creates a thin shadow line that looks much more finished than a simple square edge. These details are "the difference" in high-quality furniture design.',
  },
  {
    id: 'mm-furniture-hardware-finish',
    topic: 'Matching hardware finish to wood species',
    keywords: ['hardware','finish','brass','oil','bronze','nickel','chrome','oil','rub','match'],
    answer: 'Hardware finish should complement the wood\'s warmth and color. Warm woods (walnut, cherry): oil-rubbed bronze, antique brass, unlacquered brass (will patina). Cool or light woods (maple, ash, white oak): brushed nickel, satin stainless, matte black. Dark woods (ebony, wenge): polished chrome, satin nickel, or contrast with brass. Mid-century modern: brushed gold, matte brass. Shaker and Arts & Crafts: hand-forged iron, rubbed bronze, simple wood knobs. Mixed metal rules: it\'s fine to mix warm and cool metals if they\'re different finishes (e.g., brass pulls + nickel hinges) — never mix two of the same metal in different finishes.',
  },

  // ── HAND TOOL & SHOP SKILLS ───────────────────────────────────────────────────
  {
    id: 'mm-cut-list-marking',
    topic: 'Efficient cut list marking and stock layout',
    keywords: ['cut','list','mark','layout','stock','triangle','waste','side','pencil','knife'],
    answer: 'Efficient cut list layout: (1) Mark the reference face (face side) and reference edge on each rough board before milling. (2) After milling, lay out all parts from the cut list on the surfaced board before cutting anything. (3) Mark the saw line on the waste side. (4) Mark each part with its label (rail, leg, stile) before cutting — parts look identical before cut and can be confused. (5) Cut longest parts first. (6) Mark the waste area with an X to prevent accidentally cutting on the wrong side of the line. A well-marked board takes 5 minutes at the bench and prevents expensive cutting errors.',
  },
  {
    id: 'mm-fitting-drawer-by-hand',
    topic: 'Fitting a drawer to its opening by hand',
    keywords: ['drawer','fit','hand','plane','shave','snug','slide','smooth','open','close'],
    answer: 'Fitting a hand-fit drawer: the box should enter the opening with slight resistance and no racking. Check all four corners of the face for the same small gap. A drawer that binds on one side: lightly plane that side; check fit again. A drawer that\'s too high: plane the top edge. Too much side-to-side slop: add a thin wood shim to the inside of the drawer side. The final fit should slide in smoothly with light hand pressure and stop flush. Wax the drawer bottom edges and runners for easy sliding. Over-fitting (planing too much) results in a sloppy drawer that\'s difficult to put back.',
  },
  {
    id: 'mm-troubleshoot-no4-plane',
    topic: 'Troubleshooting a No.4 plane that won\'t cut well',
    keywords: ['no4','plane','troubleshoot','dull','chatter','tearout','set','fix','adjust'],
    answer: 'Checklist for a No.4 plane that cuts poorly: (1) Is the iron sharp? Dull irons produce dust, not shavings. (2) Is the cap iron/chip breaker set too far back from the edge? Bring it to 1/16"–1/32" for smooth work. (3) Is the mouth too open? Close the frog. (4) Is the sole flat? Check with a reliable straightedge. (5) Is the chip breaker seating fully against the iron (no gap that chips can lift into)? (6) Are you planing against the grain? Reverse direction. (7) Is the iron centered laterally? Adjust with the lateral lever. Address these in order — #1 (sharpness) is responsible for 80% of all plane problems.',
  },
  {
    id: 'mm-chiseling-hinge',
    topic: 'Chiseling a perfect hinge mortise by hand',
    keywords: ['hinge','mortise','chisel','hand','precise','knife','wall','clean','corner'],
    answer: 'Perfect hand-chiseled hinge mortise technique: (1) Scribe the outline with a marking knife using the hinge as a template. (2) Chop just inside the knife line with a bench chisel to sever fibers. (3) Pare the waste away in thin layers starting from the center; work toward the knife line. (4) Use a wide chisel to pare the bottom flat — ride the chisel bevel-up for a flat bottom. (5) Test-fit the hinge; it should sit perfectly flush. Common mistakes: setting the chisel on the knife line and widening the mortise; removing too much at once; not checking flatness of the bottom.',
  },
  {
    id: 'mm-wood-carving-tools',
    topic: 'Essential carving tool starter set',
    keywords: ['carving','tool','set','starter','essential','gouge','v-tool','chip','sweep'],
    answer: 'A practical starter carving set: a #2 sweep straight gouge (flat, wide — for background removal and flattening); a #5 or #6 sweep medium gouge (the workhorse for most carving tasks); a #9 deep sweep bent gouge (for deep hollows and relief backgrounds); a #11 or #12 veiner (narrow deep U-gouge for outlining and veins); and a V-parting tool (#12 60° for straight lines and outlining). This set handles 80% of chip carving, relief carving, and letter carving. Add specialized tools (long-bent, fishtail, spoon gouge) only when a specific project demands them.',
  },

  // ── BUYING SKILLS ──────────────────────────────────────────────────────────────
  {
    id: 'mm-tool-buying-strategy',
    topic: 'Tool buying strategy — buy once buy good',
    keywords: ['tool','buy','quality','once','cheap','good','invest','starter','priority'],
    answer: 'The "buy once, buy good" rule: cheap tools are often false economy — they rust quickly, hold edges poorly, break at critical moments, and are often less safe due to poor construction. Priority for investment: sharpening equipment (a good stone set lasts decades); at least one quality bench plane; one quality chisel set. Everything else: buy mid-tier (Stanley, Lee Valley, Narex), not the cheapest and not the premium. Power tools: mid-tier is usually excellent (DeWalt, Bosch, Makita). Buy used quality tools rather than cheap new tools — a vintage Stanley No.5 that needs cleaning beats a new $30 import every time.',
  },
  {
    id: 'mm-starting-wood-selection',
    topic: 'Wood selection advice for beginning woodworkers',
    keywords: ['beginner','wood','select','start','species','easy','forgiving','poplar','pine'],
    answer: 'For beginners: poplar is the best all-around starter hardwood — inexpensive, machines cleanly, takes paint, holds screws well, and is available everywhere. Pine is good for learning hand tools (soft, easy to work) but tears out easily under machines. Soft maple is a good alternative to poplar with a nicer natural color. Avoid starting with figured hardwoods (curly maple, walnut with wild grain) — they\'re expensive when mistakes happen and challenging to surface without tearout. Save the expensive, beautiful species for projects after you\'ve built confidence with more forgiving woods.',
  },
];
