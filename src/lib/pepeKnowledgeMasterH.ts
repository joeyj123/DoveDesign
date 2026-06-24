import type { KnowledgeEntry } from './pepeKnowledge';

export const PEPE_KNOWLEDGE_MASTER_H: KnowledgeEntry[] = [
  // ── GENERAL WOODWORKING TIPS & TRICKS ────────────────────────────────────────
  {
    id: 'mh-measuring-tape-accuracy',
    topic: 'Getting accurate tape measure readings',
    keywords: ['tape','measure','accuracy','hook','bend','end','zero','true','reliable'],
    answer: 'Tape measure hooks are designed to shift by exactly the thickness of the hook for both inside and outside measurements — but cheap tapes have sloppy hooks that introduce error. Test your tape by measuring the same distance with the hook pulled out (outside measure) and pushed in (inside measure). Both should read the same. Mark your most-used tapes with a Sharpie to identify which are most accurate. For precise joinery, a 6" steel rule is more reliable than any tape measure.',
  },
  {
    id: 'mh-pencil-vs-knife',
    topic: 'When to use a pencil vs a marking knife',
    keywords: ['pencil','marking','knife','line','accurate','when','which','thickness','reference'],
    answer: 'Use a pencil for rough layout, dimensioning long boards, and marking waste areas. Use a marking knife at shoulder lines, dovetail baselines, and any line where the saw or chisel must hit exactly — the knife severs surface fibers cleanly and leaves a crisp reference line that\'s sharper than any pencil line. The knife line also creates a tiny trench that the chisel registers in automatically, giving you mechanical guidance. The general rule: if a mismatch of 1/64" matters, use a knife; if 1/32" is acceptable, use a pencil.',
  },
  {
    id: 'mh-dry-fit-always',
    topic: 'Why dry-fitting before gluing is mandatory',
    keywords: ['dry','fit','assemble','test','clamp','glue','up','problem','find','practice'],
    answer: 'Always dry-fit an entire assembly before applying glue. This reveals joints that won\'t fully close, clamp positions that don\'t reach, parts assembled in the wrong order, and square problems. Once glue is applied, you have 5–10 minutes to fix problems — not enough time to discover them. A good dry-fit with all clamps staged and checked means glue-up is simply a repeat of the dry run. Rushing to glue without a dry-fit is one of the most common and expensive beginner mistakes in furniture making.',
  },
  {
    id: 'mh-test-cut-scrap',
    topic: 'Always make a test cut in scrap first',
    keywords: ['test','cut','scrap','same','material','dial','in','jig','bit','blade'],
    answer: 'Make every first cut in scrap from the same board (or at least the same species and thickness) as your project material. A setup dial-in in different material may not transfer — different species have different machine resistance, causing routing depth or blade position to shift. This applies to every new jig setup, every first rip on a new board, every router bit change, and every miter angle setup. The 2 minutes spent on a test cut prevents the most frustrating outcome in woodworking: a ruined piece of expensive lumber.',
  },
  {
    id: 'mh-sandpaper-loading',
    topic: 'Preventing sandpaper loading — chalking and changing',
    keywords: ['sandpaper','load','clog','resin','pine','chalk','change','fresh','clean'],
    answer: 'Sandpaper loads (clogs) when sanding residue fills the abrasive grit, reducing cutting action and causing heat. Loaded paper produces burn marks and deposits residue into the wood rather than removing it. With resinous woods (pine, cherry), the problem is worst. Use a rubber abrasive cleaning stick (sandpaper cleaning stick) — drag it across the moving belt sander or ROS pad to clean the grit. Chalk the surface before sanding resinous wood — the chalk breaks the resin adhesion slightly. Change paper frequently; loading is cumulative.',
  },
  {
    id: 'mh-layout-reference-face',
    topic: 'Reference face and edge — marking and maintaining',
    keywords: ['reference','face','edge','mark','datum','square','check','consistent'],
    answer: 'Mark your reference face (face side) with a loop and your reference edge (face edge) with a tick mark as soon as a board is flattened. All measurements and markings originate from these faces. Always place the reference face down on the jointer and against the planer infeed table. Always place the reference edge against the table saw fence. This consistency ensures parts that appear to have the same dimensions actually do have them — measuring from mixed faces introduces cumulative error. Never lose track of which face is which during a project.',
  },
  {
    id: 'mh-squaring-carcase',
    topic: 'Squaring a cabinet carcase during glue-up',
    keywords: ['square','carcase','cabinet','diagonal','clamp','rack','diagonal','adjust'],
    answer: 'Check diagonal measurements immediately after clamping and before the glue stiffens. Equal diagonals mean square. If one diagonal is longer, push the longer-diagonal corners together by angling a clamp or bar diagonally across the out-of-square direction. A clamp placed diagonally on the long diagonal compresses it. Re-check diagonals. Also ensure the carcase isn\'t in wind (twisted) — set it on a known-flat surface or check with winding sticks across the top and bottom. A twisted carcase is harder to fix than a racked one.',
  },
  {
    id: 'mh-checking-flat-handplane',
    topic: 'Checking a panel for flat using a winding stick and straightedge',
    keywords: ['flat','check','winding','stick','straightedge','panel','twist','cup','hump'],
    answer: 'Check a panel in three ways before final assembly. Winding sticks across both ends reveal twist. A straightedge along the length (both diagonals and down the middle) reveals bow. A straightedge across the width reveals cupping. All three checks are necessary — a board can pass two tests and still have a significant defect in the third direction. Hand-plane to address each condition in order: flatten twist first, then bow, then cup. After each correction, re-check all three before moving on.',
  },
  {
    id: 'mh-glue-squeeze-out-interior',
    topic: 'Cleaning glue from cabinet interiors',
    keywords: ['glue','squeeze','out','interior','cabinet','corner','reach','clean','finish'],
    answer: 'Interior cabinet corners are the hardest place to remove glue squeeze-out. Use a small chisel held flat against the panel surface to pare the gel-stage squeeze-out. A glue scraper with a corner profile (or a sharpened wooden stick) reaches into the corner. Alternatively, tape the inside corner with masking tape before glue-up — pull the tape while squeeze-out is still wet for a clean corner. Interior glue residue blocks stain and is visible through finishes, so clean completely before finishing.',
  },
  {
    id: 'mh-assembly-stage-sequence',
    topic: 'Staging complex assembly — sub-assemblies first',
    keywords: ['assembly','stage','sub','sequence','complex','order','accessible','reach','clamp'],
    answer: 'Large furniture assemblies (bookcases, tables with multiple stretchers) are impossible to glue in one step within the open time of the adhesive. Break the project into sub-assemblies and identify the correct order. Typically: glue the two-rail subassemblies first (like two side frames), let cure, then connect those with cross rails. Identify which joints are inaccessible after other parts are assembled — those must be glued early in the sequence. Write the assembly order on paper and rehearse it completely dry before touching any glue.',
  },
  {
    id: 'mh-masking-tape-tearout',
    topic: 'Masking tape to prevent tearout on sensitive cuts',
    keywords: ['masking','tape','tearout','veneer','plywood','laminate','score','cut','line'],
    answer: 'Applying a strip of blue painter\'s tape along a cut line supports the surface fibers and dramatically reduces tearout on veneered plywood and crosscut ends. Apply tape, mark and score the cut line through the tape with a knife, then saw right through both tape and wood. Remove tape after cutting. The tape keeps the fibers supported right up to the saw kerf. This works for table saw crosscuts, circular saw cuts, and jigsaw cuts where tearout is otherwise unavoidable. On veneer and melamine, tape reduces splintering to near-zero on the top face.',
  },
  {
    id: 'mh-registration-marks',
    topic: 'Registration marks for assembly orientation',
    keywords: ['registration','mark','assembly','orient','pencil','triangle','face','edge','match'],
    answer: 'Before disassembling any dry-fitted structure, mark all mating joints with matching marks — a triangle across the joint is the classic method (half on each piece). When the triangle points are aligned at assembly, the parts are in the correct orientation. This is essential when parts look identical but aren\'t (face frames, carcases with subtle asymmetry) and when multiple similar joints could be mixed up. Mark inside surfaces that won\'t be visible in the final piece.',
  },
  {
    id: 'mh-wax-lubricant',
    topic: 'Wax as a lubricant in the shop',
    keywords: ['wax','lubricant','drawer','runner','plane','sole','table','saw','resist','sticky'],
    answer: 'Paste wax (or toilet bowl wax) lubricates drawer runners, plane soles, saw table surfaces, and router table tops. On a wooden drawer runner, wax reduces drag dramatically. On a cast iron machine table, wax prevents rust and allows workpieces to glide smoothly. On a hand plane sole, wax reduces the effort needed to push the plane. Avoid silicone spray in the shop — it contaminates wood surfaces and causes fisheye in finishes. Wax is always the safe choice: it won\'t hurt the wood and wipes off before finishing.',
  },
  {
    id: 'mh-wood-movement-rules',
    topic: 'The five rules of wood movement in furniture',
    keywords: ['movement','rule','grain','direction','allow','float','glue','seasonal','design'],
    answer: 'Rule 1: Wood moves across the grain only (tangential and radial), negligibly along the grain. Rule 2: Never glue solid wood cross-grain — it will crack. Rule 3: Float solid panels in frames without glue. Rule 4: Attach solid tabletops with clips or figure-8s that allow movement. Rule 5: Orient all boards in a panel with grain running the same direction. Follow these rules and seasonal movement becomes a managed design element rather than a destructive force.',
  },
  {
    id: 'mh-prototype-mockup',
    topic: 'Building a prototype or mockup before the real thing',
    keywords: ['prototype','mockup','cardboard','cheap','pine','test','proportion','sit','chair'],
    answer: 'For seating (chairs, benches), always build a prototype at full scale before committing to expensive material. A cardboard or cheap pine mockup reveals whether angles are comfortable and proportions look right in reality vs how they appeared in a drawing. For chairs especially, sit in the prototype extensively before building the final piece. A 2-hour mockup can save a 40-hour build from producing an uncomfortable chair. The same principle applies to cabinets — a full-scale paper template on the wall shows whether a cabinet will fit and look right in the actual space.',
  },
  {
    id: 'mh-panel-glue-up-strategy',
    topic: 'Strategy for successful wide panel glue-ups',
    keywords: ['panel','glue','up','wide','board','arrange','alternate','grain','direction','joint'],
    answer: 'For glued-up solid wood panels: arrange boards in multiple combinations before committing to a grain pattern. Alternate the direction of the annual ring curves (one board ring-side up, next ring-side down) to reduce potential cupping — this is traditional advice, though its effectiveness is debated. More important: keep grain directions consistent for planing, and book-match adjacent boards from the same log for visual continuity. Mark the layout in pencil on the face side before disassembling. Glue in groups of 2–3 boards rather than all at once to manage open time.',
  },
  {
    id: 'mh-shop-math-rule-of-thumb',
    topic: 'Rule-of-thumb measurements that every woodworker should know',
    keywords: ['rule','thumb','measurement','standard','approximate','estimate','quick','common'],
    answer: 'Useful shop rules of thumb: 3/4" is the most common furniture panel thickness. 1.5" square is the minimum leg size for a dining table that won\'t look spindly. 2" square to 2.5" feels substantial. Tenon thickness = 1/3 the stock. Shelf sag: 3/4" ply sags noticeably over 36" under book loads. A comfortable seat height is 17"–18". Desk height is 28"–30". Standard cabinet depth for kitchen uppers: 12". For base cabinets: 24". Bevel angle for a 1:6 dovetail: 9.5°. These numbers become automatic with experience.',
  },
  {
    id: 'mh-using-offcuts',
    topic: 'Getting value from lumber offcuts',
    keywords: ['offcut','scrap','small','wood','use','wedge','shim','caul','test','setup'],
    answer: 'Never throw away hardwood offcuts immediately — they\'re useful for wedges (align cabinet feet, shim clamping cauls), setup test pieces (confirm bit depth, blade height, finish compatibility), small parts (drawer stops, shelf pin filler pieces, hinge backing), and clamping cauls. Keep a scrap bin organized by species and thickness. The greatest value of a scrap bin: being able to make one more test cut on identical material before committing to the actual workpiece. When scrap exceeds what you can use, donate or sell it.',
  },
  {
    id: 'mh-finish-schedule',
    topic: 'Creating a finishing schedule for a project',
    keywords: ['finish','schedule','plan','sequence','grain','stain','seal','coat','timeline'],
    answer: 'Write a finish schedule before opening any can. Specify: surface prep steps and grits; raise grain (Y/N); stain or dye steps; wash coat or sealer steps; topcoat product; number of coats; grit between coats; final rub-out approach. Test the complete schedule on sample boards before touching the project. A finish schedule prevents the common mistake of applying products in the wrong order (stain over sealed wood, wax over un-cured poly) and ensures you have all products on hand before starting.',
  },
  {
    id: 'mh-restoring-old-planes',
    topic: 'Restoring old Stanley or Record hand planes',
    keywords: ['restore','old','plane','stanley','record','rust','clean','lap','frog','adjust'],
    answer: 'Old Stanley No.4 and No.5 planes from flea markets and estate sales are often better-quality steel than new budget planes. Restoration: soak in WD-40 and scrub with a wire brush for initial rust removal. Flatten the sole on a sheet of 120-grit sandpaper on plate glass. Flatten the back of the iron. Sharpen to a working edge. Check that the frog sits flat and the lever cap has correct tension. Adjust the chip breaker gap. The whole process takes 1–2 hours and produces a very capable plane. A rusty vintage No.5 for $15 often outperforms a new $50 import plane.',
  },
  {
    id: 'mh-oiling-cast-iron',
    topic: 'Caring for cast iron machine surfaces',
    keywords: ['cast','iron','rust','oil','protect','clean','machine','table','saw','jointer'],
    answer: 'Cast iron rusts quickly in humid shops. After use: wipe the machine table clean of sawdust, then apply a thin coat of paste wax or a few drops of camellia oil (traditional Japanese tool oil) and buff lightly. This leaves a micro-thin protective film. For existing light rust: scrub with 0000 steel wool and WD-40, then apply the protective wax. For heavy rust: use a rust eraser or sandpaper (120 grit) on a flat block to remove the rust without damaging the flatness of the table. Never use coarse sandpaper on a precision machine surface.',
  },

  // ── MORE JOINERY TROUBLESHOOTING ─────────────────────────────────────────────
  {
    id: 'mh-joint-wont-close',
    topic: 'Why a joint won\'t fully close and how to fix it',
    keywords: ['joint','close','gap','shoulder','tenon','mortise','fix','gap','trim'],
    answer: 'A joint that won\'t close usually has a high spot somewhere. Rub chalk or pencil on the tenon faces, assemble, disassemble, and read where the chalk transferred to the mortise walls — those are the high spots. Remove material only from the high spots, working incrementally. Gaps at tenon shoulders (the flat faces around the tenon) are fixed with a shoulder plane. Gaps caused by a mortise that\'s not quite square are fixed by paring the mortise wall square. Never force a tight joint with a mallet — identify and fix the cause.',
  },
  {
    id: 'mh-racking-frame',
    topic: 'Preventing and fixing a racked frame after glue-up',
    keywords: ['racked','frame','diagonal','square','push','pull','fix','adjust','glue'],
    answer: 'A racked frame (one that\'s parallelogram-shaped instead of rectangular) must be corrected before the glue cures — after that it\'s very difficult to fix. Prevention: check diagonals immediately after clamping, adjust by angling a clamp diagonally across the longer diagonal. If the frame has already cured racked: cut it apart at the joints (carefully with a handsaw and chisel), clean the joint surfaces, and reglue squarely. For minor racking on face frames and cabinet backs, a diagonal back panel (plywood) screwed across the back can force the carcase square as it\'s fastened.',
  },
  {
    id: 'mh-dovetail-gap-causes',
    topic: 'Diagnosing gaps in hand-cut dovetails',
    keywords: ['dovetail','gap','cause','diagnose','tail','pin','fit','open','tight','chisel'],
    answer: 'Gaps in dovetails have specific causes. Gap at the baseline: the bottom of the tails isn\'t seated (chop the baseline deeper on the pin board or the baseline of the tail board). Gap in the middle of a tail: the pin is too wide in the middle; pare the mortise walls. Gap at the outside of the joint (at the face): either the tails or pins are slightly too narrow at the outside — accept it as cosmetic or re-cut the joint. Tails won\'t enter at all: pins too wide; pare the pin sides carefully in the direction that\'s tight.',
  },
  {
    id: 'mh-tenon-too-loose',
    topic: 'Fixing a tenon that\'s too loose in its mortise',
    keywords: ['tenon','loose','sloppy','wobble','fix','shim','veneer','glue','rattle'],
    answer: 'A tenon that\'s too loose in its mortise produces a joint with inadequate glue contact and poor mechanical strength. Small slop (1/64"–1/32"): a bit of extra PVA thickness will bridge it — the joint will be somewhat weaker but functional. More slop: glue a thin veneer or wood shim to the tenon face, let cure, then pare to the correct thickness. The ideal is to re-cut a new tenon from a new piece of stock — patching a very sloppy tenon rarely looks or performs well. Prevention is always better: sneak up on tenon thickness in multiple passes.',
  },
  {
    id: 'mh-miter-gap-fix',
    topic: 'Fixing a visible gap in a miter joint',
    keywords: ['miter','gap','fix','burnish','sawdust','glue','color','match','rub'],
    answer: 'A small miter gap (less than 1/32") can be closed by burnishing — rub the surface of the miter with a smooth rod (burnisher or chisel back) to compress and raise the wood fibers into the gap. This works on solid wood, not veneer or plywood. For slightly larger gaps: fill with a mixture of the same wood\'s fine sawdust (from sanding the mating piece) and glue, let cure, sand flush. For miter gaps on frame-and-panel projects: a spline added after assembly is the structural fix; filling is only cosmetic.',
  },

  // ── MORE DESIGN (FURNITURE ERGONOMICS) ───────────────────────────────────────
  {
    id: 'mh-desk-ergonomics',
    topic: 'Desk ergonomics — height, monitor, and keyboard',
    keywords: ['desk','ergonomics','height','monitor','keyboard','adjustable','standing','wrist'],
    answer: 'Ergonomic desk height: elbows at 90° when hands rest on the keyboard — typically 25"–29" depending on person height. Monitor eye level at arm\'s length (18"–24") from eyes; top of screen at or slightly below eye level. A fixed-height desk optimized for typing (lower) conflicts with monitor height (ideally higher) — the traditional solution is a keyboard tray under a standard 30" desk. Adjustable-height (sit-stand) desks are increasingly preferred as the healthiest option for all-day computer work.',
  },
  {
    id: 'mh-arm-chair-dimensions',
    topic: 'Armchair dimensions for comfort',
    keywords: ['armchair','dimension','seat','arm','height','depth','back','comfort','lounge'],
    answer: 'Lounge armchair dimensions: seat height 15"–17" (lower than dining chair for relaxed posture). Seat depth 18"–22" (deeper than dining chair). Seat width 22"–26". Arm height above seat: 7"–8". Back angle from vertical: 15°–25° (more recline than dining). Overall seat back height: 30"–36" for head support. For upholstered chairs, finished dimensions after cushion must match these targets — calculate the required unupholstered frame dimensions by subtracting cushion thickness from the target seat height.',
  },
  {
    id: 'mh-shelf-depth-standards',
    topic: 'Shelf depth standards for different items',
    keywords: ['shelf','depth','standard','book','dinnerware','pantry','closet','linen'],
    answer: 'Standard shelf depths by application: paperback books 8"–9"; hardcovers and trade paperbacks 10"–12"; oversized art books 14"–16"; average dinner plate 12"–14"; standard closet shelf 12"–14"; linen closet 12"–16"; pantry items 12"–16"; garage shelving 18"–24". In custom shelving, depth affects the visual weight of the piece — deeper shelves look heavier; shallow shelves lighter. Always measure your specific items before finalizing depth — a shelf 1" too shallow for your items is worthless.',
  },
  {
    id: 'mh-drawer-width-height',
    topic: 'Drawer sizing by intended contents',
    keywords: ['drawer','size','width','height','silverware','file','clothing','deep','contents'],
    answer: 'Size drawers for their contents. Silverware drawer: 2"–3" interior height. Shallow utility drawer (office supplies): 3"–4". Clothing: 6"–8" height per drawer for folded clothes. File drawers: letter file is 8.5" wide minimum clear (12"–14" for hanging files); legal is 14"–15". Kitchen utensil drawer: 3"–4" interior height. Deep pot and pan drawer: 8"–12" interior height. Width: plan each drawer for its specific function — a kitchen knife drawer should be as long as your longest knife (usually 14"+).',
  },
  {
    id: 'mh-closet-standard-heights',
    topic: 'Closet rod and shelf height standards',
    keywords: ['closet','rod','height','shelf','double','hang','long','short','standard'],
    answer: 'Single-hang closet rod: 66"–68" from floor (for full-length dresses and coats). Double-hang top rod: 80"–82"; bottom rod: 40"–42". Short-hang (shirts, jackets) rod: 40"–42". Shelf above single rod: 82"–84". Standard closet shelf above the rod: 8"–12" of clearance above the rod to the shelf. For custom closets, measure the specific garments to be stored — a tall person\'s shirts hang longer; account for this in the short-hang section.',
  },

  // ── MORE POWER TOOLS ─────────────────────────────────────────────────────────
  {
    id: 'mh-router-table-height',
    topic: 'Router table bit height setting techniques',
    keywords: ['router','table','bit','height','set','ruler','reference','fence','groove','depth'],
    answer: 'Set router table bit height with a setup block (a dedicated piece of MDF or solid wood set to a known height) or a router table setup gauge. For edge profiles, the bit height relative to the fence surface determines where the profile appears on the edge. Test on scrap before cutting good material. For grooves or rabbets, use a steel rule on the table to measure from the table surface to the highest point of the bit. After dialing in, never adjust the bit height during a cut — retract the workpiece first, adjust, then run through again.',
  },
  {
    id: 'mh-bandsaw-curve-technique',
    topic: 'Cutting curves on the bandsaw',
    keywords: ['bandsaw','curve','technique','feed','relief','pivot','tight','exit','steer'],
    answer: 'Cut curves on the bandsaw by feeding slowly and steering gently — never force the turn. If the curve is tighter than the blade width allows, make relief cuts (straight cuts from the outside edge to the cut line at intervals) so the waste falls away in sections as you cut the curve. For a very tight radius, switch to a narrower blade before attempting the cut. Exit the cut the same way you entered — pull the workpiece straight back out if you need to stop mid-cut. Blade drift means you may need to steer slightly to keep the cut on the line.',
  },
  {
    id: 'mh-jigsaw-circle',
    topic: 'Cutting circles with a jigsaw and pivot guide',
    keywords: ['jigsaw','circle','pivot','guide','radius','smooth','round','cut'],
    answer: 'A jigsaw pivot guide clamps to the saw base and allows scribing a circle by pivoting around a fixed center nail. The nail drives into the center of the desired circle; the guide sets the radius. Feed the jigsaw slowly and steadily around the circle. The result is smoother than cutting freehand but still needs sanding. For circles under 12" diameter where a router circle jig is impractical because of bit reach limitations, the jigsaw pivot guide is the quickest approach. Finish with a drum sander or router flush-trim bit for a truly smooth edge.',
  },
  {
    id: 'mh-drill-press-speed-chart',
    topic: 'Drill press speed selection by bit size and material',
    keywords: ['drill','press','speed','rpm','bit','size','material','hardwood','softwood','forstner'],
    answer: 'General drill press speed guide (RPM): 1/4" bit in hardwood: 3000. 1/2" in hardwood: 1500. 1" Forstner in hardwood: 500–750. 1-1/2" Forstner in hardwood: 300–400. 2" Forstner: 200–300. In softwood, use speeds 25% higher. Spade bits in softwood: use higher speeds for clean cutting (2000–3000 for small sizes). Hole saws (1-1/2"+ diameter): 400–600 RPM. Twist drills in metal (if needed in the wood shop): much slower than in wood. The general rule: larger bits need lower speeds to maintain safe rim cutting velocity and prevent burning.',
  },
  {
    id: 'mh-pocket-hole-angle',
    topic: 'Why pocket hole joints drive at an angle',
    keywords: ['pocket','hole','angle','15','degree','jig','clamping','counter','torque'],
    answer: 'Pocket hole jigs drill at 15° — this angle allows the screw to pass from one workpiece and cross-grain into the mating piece without the shallow angle that would exit through a face. The 15° angle also provides mechanical advantage when tightening — the screw threads engage wood fibers across a longer length than a perpendicular screw would. A pocket hole clamp (Kreg or similar) is essential because the angled screw exerts a force that shifts the mating pieces apart as the screw drives — the clamp holds them together until the screw is fully seated.',
  },
  {
    id: 'mh-table-saw-riving-knife',
    topic: 'Installing and setting a riving knife correctly',
    keywords: ['riving','knife','set','height','distance','blade','anti','kickback','position'],
    answer: 'A riving knife must be: the same thickness or very slightly thinner than the kerf of the blade (so the cut workpiece can move past it without binding); positioned behind the blade (never beside or in front); set so the top of the knife is below the top of the blade (to allow the workpiece to pass over it on the exit side). The knife follows the blade as it tilts. Never use a blade thinner than the riving knife (the knife would then be wider than the kerf, splitting the cut wood and causing binding). Replace the riving knife any time you change blade thickness.',
  },
  {
    id: 'mh-random-orbit-technique',
    topic: 'Random orbit sander — move it slowly',
    keywords: ['random','orbit','sander','move','slow','fast','swirl','cross','scratch','pressure'],
    answer: 'The most common ROS mistake is moving too fast — at one inch per second, the random pattern doesn\'t develop, leaving quasi-directional scratches that appear as swirl marks under finish. Move the sander at half an inch per second or less. Apply only the sander\'s own weight — extra pressure forces the pad to spin in a fixed pattern. Sand the entire surface in overlapping passes before changing grit. Inspect under raking light after each grit change — previous grit scratches must be fully removed before moving to the next finer grit.',
  },
  {
    id: 'mh-track-saw-setup',
    topic: 'Setting up a track saw for accurate cuts',
    keywords: ['track','saw','setup','align','anti-splinter','offset','score','parallel','fence'],
    answer: 'Track saw setup: place the track\'s anti-splinter strip exactly on the cut line (the strip marks where the blade will cut, not an offset to account for). Clamp the track at both ends. Make sure the track is long enough to support the saw for the full cut length. Score lightly first if the material chips easily. The track\'s factory anti-splinter strip may need trimming on first use — run the saw along the track without a workpiece to cut the strip to its exact width. After that, align the strip edge to the cut line for perfect accuracy.',
  },

  // ── MORE FASTENERS (SPECIFIC) ─────────────────────────────────────────────────
  {
    id: 'mh-screw-species-hold',
    topic: 'Screw holding power in different wood species',
    keywords: ['screw','holding','power','species','withdrawal','load','hardwood','softwood'],
    answer: 'Screw withdrawal resistance scales with wood density. Hard maple holds screws roughly twice as strongly as pine. Walnut, cherry, and white oak have excellent screw holding. Soft, low-density woods (balsa, basswood, western red cedar) hold screws poorly. In any species, face grain screws hold far better than end grain screws. In sheet goods (particleboard, MDF), screw holding depends on the particulate size and glue quality — generally much weaker than solid wood. Use coarser threads and larger diameters in softer materials to compensate.',
  },
  {
    id: 'mh-mortise-hinge-depth',
    topic: 'Hinge mortise depth — avoiding common error',
    keywords: ['hinge','mortise','depth','leaf','thick','measure','recess','plate','error'],
    answer: 'The most common hinge mortising error: cutting the mortise to the full hinge open thickness instead of one leaf thickness. Each leaf of the hinge gets its own mortise — one in the door edge, one in the frame or carcase. Each mortise depth equals one leaf thickness (typically 1.5mm or 1/16"). Measure the leaf thickness with a dial caliper, not a ruler. Too deep a mortise makes the door bind when closing (hinges bottom out). Too shallow means the door face sits proud of the carcase face. A correctly mortised hinge sits perfectly flush on both pieces.',
  },
  {
    id: 'mh-wood-screw-drive',
    topic: 'Screw drive types — slotted, Phillips, square, star',
    keywords: ['screw','drive','slotted','phillips','square','star','Torx','cam','out','strip'],
    answer: 'Slotted screws strip easily and are no longer used in furniture. Phillips (cross) drive cams out intentionally at a design force limit — useful in production but causes strip-out when the screw is over-torqued. Square (Robertson) drive is the favorite of cabinetmakers for its positive engagement and no cam-out. Star (Torx) has even better engagement and is common in structural and stainless screws. For pocket hole and face frame work, use square drive or Torx drive screws — they strip out far less often than Phillips and don\'t require holding pressure on the driver.',
  },
  {
    id: 'mh-toggle-bolt-wood',
    topic: 'When NOT to use toggle bolts in wood',
    keywords: ['toggle','bolt','drywall','anchor','hollow','wood','wrong','alternative'],
    answer: 'Toggle bolts are designed for hollow walls (drywall, hollow block) — in wood, they create unnecessarily large holes and provide less holding power than a properly sized wood screw or lag bolt. For hanging heavy items on wood shelves or cleats, use a through-bolt with washer and nut on the back, or lag bolts into the studs or solid blocking. If you must attach to a panel where you can\'t reach the back, a screw-in threaded insert for wood provides better holding power than any toggle in a wood member.',
  },
  {
    id: 'mh-glue-and-screw',
    topic: 'Glue and screws together — redundant or synergistic',
    keywords: ['glue','screw','together','combine','redundant','face','frame','cabinet'],
    answer: 'Glue and screws together are synergistic for face frames and non-structural assembly — the screws clamp the joint while the glue cures and the glue makes the joint permanent. In structural joints, the screw adds little to a well-glued joint because the glue bond far exceeds the screw\'s holding power in face grain. Never rely on screws as the primary structural fastener in joinery under stress — the screw acts as a clamp during the glue-up, and after the glue cures, the wood fiber failure load exceeds any reasonable screw count.',
  },

  // ── FINISHING SPECIAL CASES ───────────────────────────────────────────────────
  {
    id: 'mh-finishing-before-assembly',
    topic: 'Pre-finishing — applying finish before assembly',
    keywords: ['pre','finish','before','assembly','glue','area','inside','corner','mask'],
    answer: 'Pre-finishing applies finish to individual parts before assembly, then assembles the finished parts. This allows you to coat inside corners and narrow recesses that would be inaccessible after assembly. Mask the glue areas with tape before finishing — glue won\'t bond to finished surfaces. After finishing, remove tape, apply glue to bare wood areas, and assemble. Touch up any finish damage from assembly after the glue cures. Pre-finishing is particularly useful for bookcases with fixed shelves and any case with dado-joined parts.',
  },
  {
    id: 'mh-finish-wood-species-guide',
    topic: 'Recommended finish by wood species',
    keywords: ['finish','species','recommend','walnut','cherry','oak','maple','pine','match'],
    answer: 'Walnut: oil or wiping varnish to preserve the natural color; avoid heavy poly that obscures the grain. Cherry: oil or shellac; let UV develop the color naturally. Oak: oil finish or wipe-on poly; grain filler first for smooth results. Hard maple: water-based poly (no amber to yellow the white color); or Danish oil for a more natural look. Pine: gel stain to control blotching; shellac primer before paint. Mahogany: wiping varnish or oil; grain filler first. These are starting points — test on scrap from your specific board first.',
  },
  {
    id: 'mh-furniture-wax-maintain',
    topic: 'Maintaining wax-finished furniture',
    keywords: ['wax','maintain','furniture','reapply','buff','polish','annual','beeswax','carnauba'],
    answer: 'Wax finishes (beeswax, carnauba, Briwax, Renaissance Wax) on furniture need periodic reapplication — typically once a year in normal use or whenever the surface looks dry. Clean the surface with a slightly damp cloth, dry thoroughly, apply thin wax coats, and buff. Never use silicone-based furniture polish on wax-finished pieces — silicone contaminates the surface and prevents future refinishing. Avoid water and heat (hot cups) on wax surfaces — wax provides minimal protection against either. Wax finishes are beautiful but require more maintenance than film finishes.',
  },
  {
    id: 'mh-aniline-dye-use',
    topic: 'Using aniline dye for intense transparent color',
    keywords: ['aniline','dye','intense','transparent','alcohol','water','NGR','mix','color','fade'],
    answer: 'Aniline dyes produce the most intense, transparent color available for wood — the grain figure shows through brilliantly. Available in water-soluble, alcohol-soluble (NGR), and oil-soluble forms. Water-soluble dyes raise grain — pre-wet and sand first. Alcohol (NGR) dyes dry almost instantly — ideal for spray but tricky to brush. Oil-soluble dyes extend pot life for brushing and don\'t raise grain. Aniline dyes are generally not lightfast (fade with UV) — use them as a basecoat under a UV-filtering topcoat for furniture that will receive sunlight.',
  },
  {
    id: 'mh-finishing-turned-bowls',
    topic: 'Finishing turned bowls for food use',
    keywords: ['bowl','finish','food','safe','mineral','oil','wax','tung','water','contact'],
    answer: 'For wood bowls used with food (salad bowls, fruit bowls, serving pieces): use finishes that are food-safe when fully cured. Pure mineral oil (pharmaceutical or food-grade) is safe, widely available, and easy to apply — flood the bowl, let soak, wipe dry. Repeat 4–6 times. Mineral oil doesn\'t harden, so it needs periodic renewal. Mixed mineral oil + beeswax (board butter) provides a slightly harder surface. Fully cured pure tung oil and linseed oil are also considered food-safe. Film finishes (poly, lacquer) may be food-safe when cured but opinions vary — avoid them on cutting contact surfaces.',
  },

  // ── HAND TOOLS (ADVANCED) ────────────────────────────────────────────────────
  {
    id: 'mh-moving-fillister',
    topic: 'Moving fillister plane for rabbets with fence',
    keywords: ['moving','fillister','plane','rabbet','rebate','fence','depth','stop','skewed'],
    answer: 'The moving fillister plane cuts rabbets across or with the grain using an adjustable fence (for width) and a depth stop. The nicker (a small round knife) scores the fibers ahead of the iron for clean crossgrain cuts — critical for cutting across grain without tearout. Set the nicker just fractionally wider than the iron. This plane handles the most common rabbet cuts in traditional furniture and cabinet work without the tearout risk of a router, and with more flexibility than a fixed-width rabbet plane.',
  },
  {
    id: 'mh-combination-plane',
    topic: 'Stanley 45 and 55 combination planes',
    keywords: ['stanley','45','55','combination','plane','groove','tongue','plough','profile'],
    answer: 'The Stanley 45 and 55 combination planes accept interchangeable blades for cutting grooves, tongues, beads, and moulding profiles — a complete set of specialized planes in one tool. The 45 uses a simpler mechanism with a limited blade range; the 55 accommodates more profiles. Setting up a combination plane is fiddly — depth stop, fence, and nicker all need careful coordination. But once set, they produce perfect grooves and profiles repeatedly. Modern equivalents include the Veritas Combination Plane and the Lee Valley plow plane.',
  },
  {
    id: 'mh-shooting-miter-correction',
    topic: 'Correcting a miter angle by shooting on stone',
    keywords: ['miter','correct','shoot','stone','angle','error','cumulative','frame','accurate'],
    answer: 'When mitered frame parts don\'t close perfectly, the error is often distributed across multiple cuts — even 0.1° off per miter produces a significant gap after four corners. Correction: shoot each miter on a shooting board, taking off the minimum needed to close the frame. Shoot two pieces identically (the two pieces that share each corner), maintaining the same angle. Reassemble and check — gaps should close. If a gap remains at one corner only, adjust just the pieces in that corner. Don\'t try to fix a miter by cutting it over; use the shooting board for fine correction.',
  },

  // ── WORKSHOP SETUP ────────────────────────────────────────────────────────────
  {
    id: 'mh-shop-heating',
    topic: 'Heating a woodworking shop safely',
    keywords: ['heat','shop','propane','electric','radiant','infrared','fire','safe','dust'],
    answer: 'Never use open-flame propane heaters in a shop with solvent-based finishes or significant airborne dust. Radiant electric heaters are the safest option — they heat objects and people, not air, and have no open flame. For non-finishing shops, a propane forced-air heater is common but requires excellent ventilation. Wall-mounted infrared heaters (natural gas or propane) heat efficiently in larger shops. A separate finishing room with its own clean, spark-free ventilation is the safest approach for spray finishing. Minimum shop temperature for glue work: 55°F.',
  },
  {
    id: 'mh-ventilation-finishing',
    topic: 'Shop ventilation for finishing',
    keywords: ['ventilation','finish','spray','solvent','fume','exhaust','fresh','air','booth'],
    answer: 'Solvent-based finishes require exhaust ventilation rated to remove fumes below explosive concentration (LEL — lower explosive limit). For spray finishing, build or buy a finishing booth with an explosion-proof exhaust fan (no brushed motors) vented to the outside. A DIY booth from rigid foam insulation and a window-mounted explosion-proof fan works for small-scale spraying. Always spray with cross-ventilation (air flowing from behind you, out through the booth). Turn off all pilot lights and ignition sources within 50 feet of solvent spray.',
  },
  {
    id: 'mh-air-filtration',
    topic: 'Shop air filtration unit for fine dust',
    keywords: ['air','filtration','ceiling','unit','ambient','fine','dust','0.3','micron','filter'],
    answer: 'Ceiling-mounted air filtration units (Delta, Jet, WEN) capture the finest dust particles that escape the dust collector and float in the air. They use multiple filter stages, with the finest stage rated at 1 micron or better. Ambient dust (the invisible cloud present in any active shop) is the long-term health risk. Run an air filtration unit during sanding and for 15–30 minutes after work to clear the air. Position the unit to create a circular airflow pattern in the shop for maximum capture efficiency. This is separate from — and complementary to — source-capture dust collection.',
  },
  {
    id: 'mh-shop-floor',
    topic: 'Shop floor materials — concrete, wood, rubber',
    keywords: ['shop','floor','concrete','fatigue','rubber','mat','wood','comfort','standing'],
    answer: 'Bare concrete is hard on knees and back for extended standing — anti-fatigue rubber mats at each primary work station dramatically reduce fatigue. Interlocking foam tiles cover the whole shop floor at low cost and provide cushioning; they\'re less durable than rubber but very comfortable. A wooden floor (3/4" plywood on sleepers) above concrete is the most comfortable but adds significant cost and raises machine heights. Dropped tools and chisels are less damaged on wood than concrete — an important consideration for hand tool users.',
  },
  {
    id: 'mh-small-shop-strategies',
    topic: 'Small shop strategies for limited space',
    keywords: ['small','shop','space','limited','mobile','base','fold','wall','organize','maximize'],
    answer: 'In a small shop (1-car garage or less), maximize vertical storage (wall-mounted tool racks, overhead lumber storage). Put major tools on mobile bases — even a 100-lb table saw can be repositioned when the machine isn\'t being used. Fold-down workbenches and outfeed tables reclaim floor space when idle. A combination machine (jointer-planer-table saw combination) reduces footprint significantly. Sequence your work to minimize machine moves — plan what machines you\'ll use each session and stage them before starting work. Many exceptional furniture makers work in 200 sq ft or less.',
  },
  {
    id: 'mh-lumber-storage',
    topic: 'Lumber storage solutions in the shop',
    keywords: ['lumber','storage','rack','sticker','cantilever','wall','vertical','horizontal'],
    answer: 'Horizontal wall-mounted lumber racks (cantilever arms on a vertical wall post) keep lumber accessible and off the floor. Store the longest, heaviest stock on the lowest arms. Sticker (spacer) the stored stock for airflow even in a finished shop. Sheet goods store best vertically in a slot-style rack — horizontal storage of sheets causes them to sag and warp. A sheet caddy (with wheels) lets you transport and store sheets vertically without carrying them flat. Limit shop lumber storage to what you\'ll use in 6 months — long-term storage belongs in a better-ventilated and humidity-controlled space.',
  },
];
