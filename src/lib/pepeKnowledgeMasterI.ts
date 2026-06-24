import type { KnowledgeEntry } from './pepeKnowledge';

export const PEPE_KNOWLEDGE_MASTER_I: KnowledgeEntry[] = [
  // ── JOINERY DEPTH ─────────────────────────────────────────────────────────────
  {
    id: 'mi-stopped-dado',
    topic: 'Stopped (blind) dado for clean front edge',
    keywords: ['stopped','blind','dado','shelf','front','edge','visible','clean','stop'],
    answer: 'A stopped dado ends before the front edge of the carcase side — the front edge remains solid and hides the groove from view. Mark the stop point, chisel a small square pocket at the stop, then rout from the back toward the stop. The shelf front gets a matching notch cut so it fits around the stopped end. This is the standard cabinet-grade method for fixed shelves where the dado would otherwise be visible from the front.',
  },
  {
    id: 'mi-housing-vs-dado',
    topic: 'Housing joint (British) vs dado joint (American)',
    keywords: ['housing','dado','British','American','terminology','shelf','groove','housed'],
    answer: 'These are the same joint called by different names depending on geography. American woodworkers call it a dado; British woodworkers call it a housing. A through housing runs the full width of the panel; a stopped housing (stopped dado) ends before one edge. The joint captures the shelf end in a groove cut across the panel face, providing vertical support for the shelf. Both terms mean exactly the same construction.',
  },
  {
    id: 'mi-tee-bridle',
    topic: 'T-bridle joint for rails meeting at mid-span',
    keywords: ['T','bridle','tee','rail','mid','span','table','frame','slot'],
    answer: 'When a rail meets another rail at its middle rather than at an end, a T-bridle joint (or T-halving) cuts a slot the full depth of the first rail and a matching fork on the crossing member. The two pieces interlock without fasteners and are glued flush on the faces. Used in table bases, stretcher systems, and grid frames where structural integrity at crossing members is required. Stronger than a simple lap at a T-intersection because the slot captures both cheeks of the fork.',
  },
  {
    id: 'mi-fox-wedge-technique',
    topic: 'Fox wedging (blind wedged) mortise and tenon',
    keywords: ['fox','wedge','blind','mortise','tenon','permanent','kerf','splay','lock'],
    answer: 'Fox-wedging places small wedges in saw kerfs cut in the tenon end — as the tenon is driven home, the wedges hit the bottom of the mortise and are forced into the kerfs, splaying the tenon against the mortise walls. The joint is permanent; there\'s no way to disassemble without destroying it. The mortise must be slightly undercut (flared wider at the bottom) to allow the splayed tenon to seat fully. Cut the kerfs just over half the tenon length; wedge thickness should equal the clearance you want the tenon to splay.',
  },
  {
    id: 'mi-stub-tenon',
    topic: 'Stub (stump) tenon for frame and panel doors',
    keywords: ['stub','stump','tenon','short','door','panel','groove','haunch','frame'],
    answer: 'A stub tenon is very short — typically just 3/8"–1/2" deep, the same depth as the panel groove. It\'s used in frame-and-panel door rails where the groove depth limits tenon length. Always add a haunch to fill the groove above or below the stub tenon. The haunched stub tenon is the standard joint for kitchen cabinet doors built with a router and cope-and-stick bits: the cope cut creates the stub tenon shape automatically.',
  },
  {
    id: 'mi-cross-halving',
    topic: 'Cross-halving (cross-lap) joint for grids',
    keywords: ['cross','halving','lap','grid','shelf','divider','intersect','halfway'],
    answer: 'A cross-halving joint interlocks two boards at their crossing point — each board has a slot half its depth cut from the opposite side, and they slide together. Used for shelf dividers, grid patterns, wine racks, and any structure where members cross each other at 90°. The slot width should equal the board thickness for a snug fit. For grids with many intersections, cut all horizontal slots on one setup, then all vertical slots on another — identical setup produces perfectly consistent joints.',
  },
  {
    id: 'mi-pocket-hole-face-frame',
    topic: 'Pocket holes for face frame assembly',
    keywords: ['pocket','hole','face','frame','stile','rail','assemble','clamp','align'],
    answer: 'Face frames assembled with pocket holes are faster than dowels or biscuits and just as strong for non-structural face frame work. Drill the pocket holes on the rails (not the stiles) before assembly. Apply glue and use a face clamp to hold pieces flush while driving the screw — without the clamp, the angled screw force shifts the pieces out of plane. Wipe glue squeeze-out from the front face immediately. After assembly, a face frame router bit or flush-trim bit can level any slight offset between stile and rail faces.',
  },
  {
    id: 'mi-domino-frame',
    topic: 'Using the Domino for timber frame joinery',
    keywords: ['domino','festool','timber','frame','loose','tenon','floating','fast','strong'],
    answer: 'The Festool Domino XL (DF 700) cuts larger mortises for bigger tenons — suitable for light timber frame connections and heavy furniture. It\'s significantly faster than hand-cutting mortises and more precise than most router setups for production work. For a table\'s apron-to-leg connection, the Domino XL cuts a matched mortise in both pieces in under a minute per joint. The XL tenons come in 8mm, 10mm, and 12mm widths and 22mm to 50mm lengths — choose length based on the available tenon depth in the leg.',
  },
  {
    id: 'mi-wedged-barefaced-tenon',
    topic: 'Barefaced (single-shouldered) tenon',
    keywords: ['barefaced','single','shoulder','tenon','frame','thin','rail','offset','groove'],
    answer: 'A barefaced tenon has a shoulder on only one face — the other face is flush with the edge of the stock. Used when a thin rail connects to a groove on a stile (so the tenon thickness equals the groove width) or when the tenon must sit flush with the face of the mortised member. More complex to lay out accurately than a standard twin-shouldered tenon — the layout gauge must be set very precisely because any error isn\'t averaged over two shoulders.',
  },
  {
    id: 'mi-knapp-machine-joint',
    topic: 'Knapp joint — Victorian drawer joinery',
    keywords: ['knapp','machine','pin','drawer','nineteenth','century','Victorian','curved','fan'],
    answer: 'The Knapp joint (patented 1867) was a machine-made dovetail substitute using curved pins and matching sockets — it looks like a fan or scallop pattern. It was used on 19th-century American furniture during the machine age as an alternative to hand-cut dovetails. It\'s not as strong as dovetails but was much faster to machine-produce. Knapp joints are now a useful dating indicator for antique furniture — pieces with them were likely made between 1870 and 1910. No modern equivalent machine is commercially produced.',
  },
  {
    id: 'mi-mitered-corner-biscuit',
    topic: 'Biscuits in mitered box corners',
    keywords: ['biscuit','miter','box','corner','reinforce','slot','align','orientation'],
    answer: 'Biscuits in mitered corners are cut perpendicular to the miter face — the slot is at 90° to the beveled surface. Use a biscuit joiner with a fence set to 45° or use a dedicated miter clamp as a reference. Size 0 or 10 biscuits fit most 3/4"-thick mitered stock. The biscuit adds both alignment and considerable strength to what is otherwise a very weak end-grain glue joint. Splined miters are even stronger, but biscuits are faster to execute and adequate for most box and frame applications.',
  },
  {
    id: 'mi-finger-joint-strength',
    topic: 'Why finger joints are extremely strong in glue',
    keywords: ['finger','joint','strength','surface','area','glue','mechanical','interlock','box'],
    answer: 'Finger (box) joints have vastly more long-grain glue surface area than any other corner joint — the interlocking fingers multiply the glue area by 4–8 times compared to a simple butt joint. The glue area exceeds even dovetails of the same finger count. In tension tests, properly glued finger joints often fail in the wood rather than the glue line. They\'re weaker than dovetails in resisting direct pull-out (no mechanical lock), but in everyday furniture loads (racking, twisting, vibration) they\'re more than adequate.',
  },
  {
    id: 'mi-table-saw-tenon-full',
    topic: 'Complete tenon cutting sequence on the table saw',
    keywords: ['tenon','table','saw','complete','sequence','cheek','shoulder','dado','fence'],
    answer: 'Full tenon on the table saw: (1) Set blade height to tenon cheek cut depth. (2) With a crosscut sled, cut all four shoulder lines on both ends of each piece. (3) Stand the workpiece vertically against a tenon jig; cut both cheek faces to the shoulder line. (4) Lay flat and make the narrow-direction shoulder cuts if the tenon is not square. (5) Test fit in the mortise. This sequence — shoulder cuts first, cheek cuts second — means any saw wander on the cheek cut is absorbed in the waste, not the tenon shoulder.',
  },
  {
    id: 'mi-joinery-glue-surfaces',
    topic: 'Understanding long grain vs short grain vs end grain glue joints',
    keywords: ['long','grain','short','end','glue','strength','orientation','compare'],
    answer: 'Long-grain to long-grain is the strongest glue joint — properly done, it\'s stronger than the wood itself. Long-grain to face grain is slightly weaker but still very strong. Long-grain to end grain is very weak — end grain absorbs glue like a sponge but provides little mechanical bond. Size end grain with a dilute coat of glue, let dry, then apply regular glue for the joint. Short-grain joints (wood fibers at a steep angle to the surface) are intermediate in strength. Design joints so primary load paths run through long-grain connections.',
  },

  // ── FINISHING DEPTH ───────────────────────────────────────────────────────────
  {
    id: 'mi-shellac-pound-cut-table',
    topic: 'Shellac pound cut guide for different applications',
    keywords: ['shellac','pound','cut','application','spray','brush','seal','french','polish'],
    answer: 'Shellac cut (pounds per gallon of denatured alcohol) for different uses: 1/2-lb cut — French polishing, first thin seal coat. 1-lb cut — wiping on between coats, sealing over stain before topcoat. 2-lb cut — brushing on for a full film finish, sealing knots. 3-lb cut — very thick for filling wood pores, repairs. Premixed SealCoat (Zinsser) is a 2-lb cut dewaxed shellac. Spraying requires thinning to 1-lb cut or less for HVLP guns — the full 2-lb cut will clog a fine gun nozzle.',
  },
  {
    id: 'mi-waterbased-poly-bubbles',
    topic: 'Eliminating bubbles in water-based polyurethane',
    keywords: ['bubbles','water','based','poly','foam','brush','flow','floetrol','thin'],
    answer: 'Water-based poly foams easily from overbrushing, a contaminated surface, or incorrect application temperature. Fix: don\'t shake the can (stir gently); apply thin coats with a good-quality synthetic brush using long, light strokes (no scrubbing back and forth); tip off bubbles with the brush held nearly flat immediately after application. Adding Floetrol extender (10–15%) slows dry time and lets bubbles release before the film skins over. Working in temperatures above 75°F also causes faster skinning — work in cooler conditions or thin slightly.',
  },
  {
    id: 'mi-poly-brush-marks',
    topic: 'Eliminating brush marks in oil-based polyurethane',
    keywords: ['brush','marks','poly','level','tip','off','mineral','spirits','thin','quality'],
    answer: 'Oil-based poly brush marks can be minimized with: a high-quality natural-bristle brush held at a low angle; thinning the first coat 10% with mineral spirits; flowing the finish on without going back over partially dried areas; and "tipping off" (final light pass the length of the panel with barely any pressure). Work in a dust-free environment at 65–75°F. If brush marks are already in the cured coat, sand level with 400-grit paper on a flat block before the next coat. The final coat can be rubbed out with steel wool and wax for a perfectly smooth finish.',
  },
  {
    id: 'mi-varnish-oil-stain-wait',
    topic: 'How long to wait after oil-based stain before topcoat',
    keywords: ['stain','wait','dry','oil','topcoat','varnish','poly','hours','days','cure'],
    answer: 'Oil-based stain must be fully dry before topcoating or the topcoat traps wet stain beneath it — the finish stays soft and the stain bleeds. Minimum wait: 24 hours in warm (70°F), dry (below 50% RH) conditions. In cool or humid conditions, wait 48–72 hours. Check dryness: press a clean cloth firmly on the stained surface and lift — no color transfer means it\'s dry. Oil-based stains with Japan driers added dry faster. Gel stains need the same wait time. Water-based stains dry in 1–2 hours.',
  },
  {
    id: 'mi-finish-vertical-surfaces',
    topic: 'Applying finish to vertical surfaces without runs',
    keywords: ['vertical','surface','finish','run','drip','brush','apply','thin','coat'],
    answer: 'Vertical surfaces run and drip easily — apply thin coats and keep the brush moving. On doors and cabinet sides: start with the recessed panels, then the rails, then the stiles. Apply finish in short horizontal strokes to fill the area, then tip off vertically with a nearly-dry brush. Never leave a heavy wet edge on a vertical surface. Lay the workpiece horizontal for the first coat if possible — it dries without runs. If a run does occur in wet finish, brush it out immediately; wait until fully dry and sand level if missed.',
  },
  {
    id: 'mi-lacquer-sand-between-coats',
    topic: 'Why you don\'t sand between lacquer coats',
    keywords: ['lacquer','sand','between','coats','bond','chemical','recoat','window'],
    answer: 'Lacquer recoats bond chemically — each new coat dissolves slightly into the previous one, creating a unified film. This means sanding between coats is unnecessary and counterproductive if you recoat within the recoat window (typically 30 minutes to 2 hours for fast lacquer). If you wait too long (the lacquer has fully cured), you must sand to scuff the surface for mechanical adhesion — the chemical bonding window has closed. The final coat can be sanded and rubbed out for a glass finish after it\'s fully cured (24–48 hours).',
  },
  {
    id: 'mi-oil-finish-reapply',
    topic: 'Reapplying oil finish to worn furniture',
    keywords: ['oil','finish','reapply','maintain','worn','dry','clean','danish','penetrating'],
    answer: 'Oil-finished furniture can be refreshed without stripping. Clean the surface thoroughly with naphtha to remove wax, grime, and contamination. Lightly scuff with 0000 steel wool. Apply a fresh coat of the same oil (danish oil, linseed, tung) and wipe off excess. Allow to fully cure. This "feeding" of the wood restores the look and adds another layer of protection. Oil finishes are the easiest to maintain because there\'s no film to chip or peel — just periodic renewal of the penetrating layer.',
  },
  {
    id: 'mi-conversion-varnish-safety',
    topic: 'Safety when spraying conversion varnish',
    keywords: ['conversion','varnish','catalyzed','isocyanate','acid','PPE','respirator','hazmat'],
    answer: 'Some conversion varnishes use isocyanate (urethane) catalysts — extremely hazardous to the respiratory system even in minute concentrations. With isocyanate catalysts, a supplied-air respirator or full face-piece respirator with organic vapor + P100 cartridges is mandatory. Acid-catalyst conversion varnishes are less acutely hazardous but still require OV + P100 respirators and excellent ventilation. Never spray conversion varnish in an unventilated space. The extreme durability of the finish is proportional to its extreme hazard during application.',
  },
  {
    id: 'mi-finishing-end-grain',
    topic: 'Finishing end grain to match face grain color',
    keywords: ['end','grain','color','seal','stain','dark','pre','coat','even','equalize'],
    answer: 'End grain absorbs stain several times faster than face grain, turning dramatically darker. To equalize: apply a thinned seal coat (10% oil-based poly in mineral spirits, or 1-lb shellac) to the end grain only; let dry; then apply the same stain to the whole surface. The seal coat limits end grain absorption. Another approach: apply the stain overall, then apply a lighter diluted stain to the face grain only for build-up, bringing the face grain closer to the darker end grain color — working from darker to lighter is generally easier.',
  },
  {
    id: 'mi-gel-stain-technique',
    topic: 'Gel stain application technique',
    keywords: ['gel','stain','apply','brush','wipe','thick','time','grain','build','coat'],
    answer: 'Gel stain is applied with a brush, sponge, or cloth and wiped off with a clean cloth after a short dwell time (2–5 minutes typically). Work in manageable sections — gel stain on a large surface can dry unevenly if you apply it all before wiping. Apply with the grain; wipe across and then with the grain for the final wipe to remove streaks. For more color intensity: apply a second coat over the first (dried overnight) rather than a longer dwell time, which can leave a patchy result. Finish immediately over gel stain once dry.',
  },
  {
    id: 'mi-ammonia-fuming-detail',
    topic: 'Ammonia fuming oak — setup and results',
    keywords: ['ammonia','fume','oak','tent','plastic','container','honey','brown','tannin'],
    answer: 'Ammonia fuming uses ammonium hydroxide vapors (26–28% concentration from industrial sources — not household ammonia) to react with tannins in oak, turning it honey-brown to deep chocolate without any stain. Set the piece in a sealed tent (plastic sheeting and tape) with a small bowl of ammonium hydroxide inside. Leave for 4–24 hours depending on depth of color desired. Wear a respirator and gloves — the fumes are extremely irritating. The color penetrates the entire board, not just the surface, and doesn\'t fade like surface stains.',
  },
  {
    id: 'mi-sandpaper-grit-science',
    topic: 'How sandpaper grits and abrasive types differ',
    keywords: ['sandpaper','grit','aluminum','oxide','silicon','carbide','ceramic','garnet','CAMI','FEPA'],
    answer: 'Aluminum oxide (the orange or brown standard paper) is the most common woodworking abrasive — durable and cuts well on most species. Silicon carbide (wet/dry paper, darker gray) is used for sanding between finish coats and on very hard materials. Ceramic aluminum oxide (Siafast, 3M Cubitron) lasts 4–10x longer than standard paper and cuts faster — worth the premium for production work. CAMI grit numbers (US) and FEPA P-grades (European) overlap but are not identical above 220 grit — P320 is roughly 280 CAMI. Garnet paper is natural and gentle; use it for hand-sanding delicate surfaces.',
  },
  {
    id: 'mi-outdoor-finish-maintain',
    topic: 'Exterior finish maintenance schedule',
    keywords: ['exterior','outdoor','finish','maintain','recoat','season','schedule','oil','varnish'],
    answer: 'Penetrating oil finishes (teak oil, linseed-based outdoor oil): reapply annually in spring after cleaning with a brush and mild detergent. Spar varnish (film finish): inspect annually for peeling, checking, or crazing — sand and recoat affected areas before failure reaches bare wood. Once varnish peels back to bare wood, full strip-and-refinish is required. The key rule for exterior finishes: maintain before failure, not after. A 20-minute annual wipe-on application is far less work than a complete strip and refinish.',
  },
  {
    id: 'mi-wipe-on-poly',
    topic: 'Wipe-on polyurethane — make your own',
    keywords: ['wipe','on','poly','make','thin','mineral','spirits','50','percent','easy'],
    answer: 'Commercial wipe-on poly is simply oil-based polyurethane thinned 50% with mineral spirits. Make your own: mix one part oil-based poly with one part mineral spirits by volume. Apply with a lint-free cloth in thin, even coats. Each coat dries faster (4 hours vs 8) and levels without brush marks. Build 4–6 coats for a thin but durable film. Final sheen: add a coat of paste wax for satin; use 0000 steel wool plus wax for matte. Wipe-on poly is ideal for curved turnings, carvings, and any surface where brush application would leave drips.',
  },

  // ── MORE PROJECT TYPES ────────────────────────────────────────────────────────
  {
    id: 'mi-shaker-cabinet-design',
    topic: 'Shaker cabinet design — exact proportions',
    keywords: ['shaker','cabinet','proportion','door','stile','rail','size','panel','design'],
    answer: 'Shaker cabinet door proportions: stile and rail width typically 2"–2.5"; panel setback from frame face: 1/4"–3/8". Door height to width ratio: taller-than-wide is more Shaker-authentic (2:1 to 3:2 ratio). The floating panel is typically raised (shadow line visible around panel perimeter) or flat depending on Shaker variant. Shaker pulls are simple wood knobs or small oval brass knobs — nothing decorative. The restraint of the Shaker style means proportional errors are immediately visible; study original pieces before designing.',
  },
  {
    id: 'mi-bookcase-back',
    topic: 'Bookcase back options — open back vs closed',
    keywords: ['bookcase','back','open','closed','plywood','rabbet','fixed','adjustable','access'],
    answer: 'Open-back bookcases (no back panel) are lighter and allow access from both sides but are less rigid — the back panel of a closed bookcase dramatically stiffens the case and prevents racking. For heavy book loads or freestanding bookcases, a 1/4" plywood back in a dadoed rabbet is the minimum. Attach the back with screws (not glue) so it can be removed if the bookcase ever needs to go through a doorway. For wall-mounted bookcases, the wall serves as the back — anchor cleats to the studs for load-bearing support.',
  },
  {
    id: 'mi-bed-joinery',
    topic: 'Bed rail-to-post connection options',
    keywords: ['bed','rail','post','connect','bolt','hook','hanger','joint','knock','down'],
    answer: 'Options for bed rail-to-post connections in order of strength: (1) Bed bolts (barrel nuts) — very strong, fully removable; (2) Metal bed-rail hook hangers (mortised into rail, bolt to post) — fast and strong; (3) Mortise and tenon with bed bolt reinforcement — traditional and strongest; (4) Pocket screws alone — not recommended, will loosen over time. Whatever method, the connection must resist a 200–400 lb prying force from someone rolling in bed. Test by grabbing the headboard and pushing hard — any wobble means the joint needs reinforcement.',
  },
  {
    id: 'mi-table-leg-attach',
    topic: 'Attaching table legs — options and strength',
    keywords: ['table','leg','attach','hanger','bolt','dowel','mortise','socket','bolt'],
    answer: 'Common leg attachment methods: (1) Threaded leg-leveling bolt with T-nut in the apron corner — fast, adjustable, allows leg removal; (2) Mortise-and-tenon leg-to-apron — traditional and strongest; (3) Corner block with hanger bolt — fast and removable; (4) Direct screw from below — weakest, not recommended for dining tables. For a coffee table or bed frame that needs to disassemble for moving, hanger bolts and threaded inserts in the top of the leg allow easy assembly and disassembly while maintaining strong connection.',
  },
  {
    id: 'mi-wall-cabinet-hang',
    topic: 'Hanging wall cabinets level and securely',
    keywords: ['wall','cabinet','hang','level','cleat','stud','french','screw','secure'],
    answer: 'Wall cabinets must anchor into studs — toggle bolts in drywall alone will eventually fail under kitchen cabinet loads. Find studs, mark their centers, and verify the cabinet can be screwed into at least two studs. French cleats (a beveled cleat on the wall, matching cleat on the back of the cabinet) allow easy leveling and adjustment and distribute the load along the full cleat length. For a run of cabinets, hang the highest first, then work down using a laser level for the reference line.',
  },
  {
    id: 'mi-garage-cabinet',
    topic: 'Garage cabinet construction for utility',
    keywords: ['garage','cabinet','plywood','robust','heavy','duty','simple','construction'],
    answer: 'Garage cabinets prioritize durability and load capacity over appearance. Use 3/4" Baltic birch or sanded plywood (not particleboard — it fails in humidity). Dado-joined shelves at fixed locations are stronger than pin-supported shelves for heavy tool storage. Screw carcase joints with 2" construction screws in addition to glue. Use heavy-duty European hinges rated for heavier doors. Skip veneer and paint — a single coat of oil-based primer seals the wood. Anchor base cabinets to the wall and each other for stability under heavy loads.',
  },
  {
    id: 'mi-laundry-room-cabinet',
    topic: 'Laundry room cabinetry — moisture considerations',
    keywords: ['laundry','cabinet','moisture','humidity','seal','finish','solid','melamine'],
    answer: 'Laundry rooms have higher humidity than most rooms. Use melamine-faced particleboard (easy to clean, moisture-resistant surface) or paint-grade plywood finished with oil-based paint. Avoid MDF in laundry rooms — it swells when it gets wet. Solid wood doors and drawer fronts should be finished on all six sides equally. Keep the floor-level base cabinet off the floor on a toe kick — water on the floor wicks into unfinished particle board quickly. Opt for simple construction with no unfinished edges exposed.',
  },
  {
    id: 'mi-tv-cabinet',
    topic: 'TV stand and media console construction',
    keywords: ['tv','stand','media','console','component','ventilation','cable','height','screen'],
    answer: 'TV stand height should put the center of the screen at eye level when seated — typically 42"–48" from floor. Open back or vented sides allow heat to escape from AV components. Cable management: plan conduit holes through shelves and a cable exit at the back before building. Cabinet depth: 18"–24" is standard for modern AV components; measure your deepest component. Use 3/4" plywood for a sturdy box; 1/2" for shelves with limited load. The cabinet must support the TV\'s weight on a wide, stable footprint.',
  },
  {
    id: 'mi-vanity-tower',
    topic: 'Bathroom linen tower construction',
    keywords: ['linen','tower','bathroom','tall','narrow','shelf','door','proportion','anchor'],
    answer: 'A linen tower is a tall, narrow cabinet (typically 16"–20" wide, 72"–84" tall) for bathroom linen and toiletry storage. Because of the tall-narrow proportions, it must be wall-anchored — a top-heavy freestanding cabinet is a tipping hazard especially with children. Anchor through the back panel into a stud or use a wall cleat. Adjustable shelves on the 32mm system allow flexible organization. Use moisture-resistant construction (plywood, melamine, or solid wood with complete finish) for the humid bathroom environment.',
  },
  {
    id: 'mi-floating-mantel',
    topic: 'Floating fireplace mantel construction',
    keywords: ['mantel','fireplace','float','hang','heat','clearance','build','code','clearance'],
    answer: 'A floating (cantilevered) mantel shelf mounts on hidden structural supports — typically 3/4" steel tubes that pass through the mantel into wall studs. Building code requires minimum clearance from combustible materials to the firebox opening — typically 12" above and 6" to the side of the opening; check local codes. Use solid wood or MDF over a structural frame. Mount the hidden tubes into studs at the correct spacing (matching pre-drilled holes in the mantel back). The mantel slips over the tubes and sits tight to the wall without visible fasteners.',
  },
  {
    id: 'mi-reception-desk',
    topic: 'Reception desk construction — curved and complex',
    keywords: ['reception','desk','curved','laminate','bending','substrate','commercial','face'],
    answer: 'Reception desks with curved fronts typically use bending plywood as the substrate, with a laminate (high-pressure laminate or wood veneer) face. Build the box frame first with the curved profile established by carefully bent MDF ribs. Attach the bending ply in thin layers, gluing and stapling each layer to the frame. Veneer or laminate the exterior. The counter surface is typically solid surface material or a thick hardwood slab. Plan the electrical (receptionist computer, lighting) and wire management through the desk structure before closing it up.',
  },
  {
    id: 'mi-sawhorse-design',
    topic: 'Sawhorse design — foldable vs fixed',
    keywords: ['sawhorse','design','fold','fixed','height','brace','weight','pair','support'],
    answer: 'A good sawhorse pair supports 1000+ lbs combined — the legs must be well braced to resist lateral racking. Fixed sawhorses (non-folding) are stronger; foldable versions trade some strength for storage convenience. Standard height: 28"–32" depending on your working height preference. Use 2×4 or 2×6 construction lumber for legs and top rail. A 15°–20° leg splay on all four legs gives good stability. For sheet goods, a third sawhorse in the middle prevents heavy plywood from sagging and binding the saw.',
  },
  {
    id: 'mi-outfeed-roller-stand',
    topic: 'Roller stand for supporting long stock',
    keywords: ['roller','stand','support','outfeed','long','board','planer','table','saw','infeed'],
    answer: 'A roller stand supports long boards on the infeed and outfeed sides of stationary tools — preventing them from tipping or binding. The top roller must be exactly the same height as the machine table — even 1/8" difference causes the board to catch or tip. Adjustable-height roller stands (most commercial versions) allow dialing in the exact height. Heavy-duty stands have a single wide roller; lighter stands may use a ball roller for omnidirectional support. For work with a consistent material height (tabletop after planing), fixed-height roller stands simplify the setup.',
  },
  {
    id: 'mi-workmate-bench',
    topic: 'Black & Decker Workmate as a portable bench',
    keywords: ['workmate','portable','bench','clamp','vise','folding','jobsite','lightweight'],
    answer: 'The Workmate (Black & Decker) is a folding portable workbench with a built-in vise formed by two separate top surfaces that clamp together. It\'s widely used on job sites and in cramped spaces without a real workbench. The clamping capacity isn\'t as strong as a real vise but is adequate for most light work. It folds flat for storage. For hobbyists without a dedicated workshop, the Workmate is a legitimate starting point; it handles hand tool work, power tool support, and clamping for assembly surprisingly well.',
  },

  // ── MORE SPECIES (SPECIFIC TOPICS) ────────────────────────────────────────────
  {
    id: 'mi-poplar-green-heart',
    topic: 'Poplar heartwood green color explanation',
    keywords: ['poplar','green','heart','color','paint','wood','mineral','streak'],
    answer: 'Yellow poplar (Liriodendron tulipifera) has heartwood that can range from olive-green to dark green or purple-gray — a result of mineral deposits during growth. This green color looks unusual on unfinished stock but completely disappears under paint. The green color can bleed through water-based primers in some cases — use a shellac primer first if concerned. For natural (clear) finishes, the green heartwood can actually be attractive mixed with the cream sapwood. Most cabinet grades specify "no mineral streaks" for paint-grade work.',
  },
  {
    id: 'mi-hickory-uses',
    topic: 'Hickory beyond tool handles — furniture and floors',
    keywords: ['hickory','hard','heavy','floor','furniture','char','character','rustic'],
    answer: 'Hickory is the hardest and heaviest North American hardwood (Janka ~1820) and is extremely shock-resistant — making it the traditional material for axe handles, hammers, and sporting equipment. As a flooring material, it\'s exceptionally durable. As furniture material, it\'s challenging — very hard on tools, difficult to machine smoothly, and heavy to handle. Character hickory (with prominent color variation between cream sapwood and dark reddish-brown heartwood) has a bold, rustic look popular in farmhouse-style furniture.',
  },
  {
    id: 'mi-teak-gluing-prep',
    topic: 'Preparing teak for gluing — degreasing required',
    keywords: ['teak','glue','oil','prep','acetone','wipe','adhesion','failure','surface'],
    answer: 'Teak\'s high natural oil content prevents most adhesives from bonding — oil-soaked fibers repel water-based glues and interfere with epoxy cross-linking. Always wipe teak surfaces with acetone immediately before gluing — this removes the surface oil layer and lets it evaporate completely (wait 5 minutes after wiping before applying glue). The degreasing must be done right before gluing; if you wait hours, the oil wicks back to the surface. The same process applies to other oily tropical hardwoods like cocobolo, rosewood, and ipe.',
  },
  {
    id: 'mi-white-oak-outdoor',
    topic: 'White oak for outdoor use — why it works',
    keywords: ['white','oak','outdoor','closed','pore','barrel','rot','resistant','tight'],
    answer: 'White oak\'s pores are plugged with tyloses — microscopic growths that fill the vessel cells. This makes white oak naturally water-resistant and is why it\'s used for whiskey barrels and traditional boat planking. For outdoor furniture, white oak outperforms red oak dramatically — red oak\'s open pores allow water to penetrate deeply and promote rot. Quartersawn white oak is most stable outdoors. Finish with penetrating oil or exterior varnish to protect the surface while maintaining the natural look.',
  },
  {
    id: 'mi-cherry-mineral-spot',
    topic: 'Cherry gum pockets and dark mineral spots',
    keywords: ['cherry','gum','pocket','dark','spot','mineral','grain','select','avoid'],
    answer: 'Cherry develops dark spots called gum pockets or mineral deposits — natural discolorations that appear as black or dark brown irregular patches in the board. Tight small spots (gum pockets) are usually surrounded by good wood; large mineral zones may signal stressed growth and can be unpredictable in how they take finish. Select around these areas for visible furniture parts, or embrace them as character marks in rustic designs. Gum pockets don\'t affect structural integrity — only appearance.',
  },
  {
    id: 'mi-ash-color-age',
    topic: 'White ash color and aging characteristics',
    keywords: ['ash','white','cream','age','darken','figure','ring','open','porous'],
    answer: 'White ash is nearly pure white to cream color when freshly cut, with bold dark growth rings creating a strong figure. It doesn\'t darken dramatically with age like cherry — it stays light with slight yellowing. Ash absorbs stain readily and evenly due to its open, ring-porous structure; dark stains look dramatic on ash. It\'s one of the best species for fumed (ammonia-treated) finishes, which work well on tannin-rich ash. Ash is also excellent with wire brushing to reveal the dramatic ring-porous grain texture.',
  },
  {
    id: 'mi-maple-blotch-control',
    topic: 'Controlling blotching on hard maple',
    keywords: ['maple','blotch','stain','control','conditioner','wash','seal','coat'],
    answer: 'Hard maple blotches badly with oil-based stains because its tight pores absorb unevenly. Strategies: use a pre-stain conditioner (reduces but doesn\'t eliminate blotching); use gel stain instead of liquid (sits on surface, can\'t penetrate unevenly); use a very dilute NGR dye instead of oil stain (penetrates more evenly); or skip staining and use a tinted oil finish. Maple\'s natural white-cream color often looks best with a clear finish and no stain — the wood\'s own figure is the appeal.',
  },

  // ── SHOP SKILLS & TIPS ───────────────────────────────────────────────────────
  {
    id: 'mi-router-table-startup',
    topic: 'Router table startup sequence and checks',
    keywords: ['router','table','startup','check','bit','collet','fence','featherboard','before'],
    answer: 'Before starting a router table session: check that the bit is fully seated and the collet nut is tight (two-wrench tighten); set the bit height with the router OFF; set and lock the fence; position the featherboard; check the bit rotation direction and plan your feed direction (always against the rotation — right to left for a standard right-hand router); start the router with nothing near the bit; wait 5 seconds for it to come to full speed before feeding stock. This 30-second ritual prevents most router table accidents.',
  },
  {
    id: 'mi-hand-tool-workflow',
    topic: 'Hand tool workflow for a small furniture project',
    keywords: ['hand','tool','workflow','sequence','order','flatten','joint','mark','cut','fit'],
    answer: 'A hand-tool furniture workflow: (1) rough-crosscut lumber to rough length (hand saw or miter saw); (2) flatten one face with a jack plane, then smoother; (3) joint one edge with a jointer plane; (4) mark and gauge all thickness lines; (5) thickness the opposite face to the line; (6) rip to width on the bench; (7) final crosscut to length; (8) layout all joinery with knife and gauge; (9) cut joinery (mortises, tenons, dovetails); (10) dry-fit and fit adjustments; (11) glue-up; (12) surface prep and finish. Each step depends on the precision of the last.',
  },
  {
    id: 'mi-saw-kerf-allowance',
    topic: 'Allowing for saw kerf when marking cut lists',
    keywords: ['kerf','allowance','mark','measure','cut','list','account','lost','waste'],
    answer: 'Each cut removes about 1/8" of wood (the kerf width). When cutting multiple pieces from a single board, account for this or your last piece will be 1/8" short for each cut made before it. On a cut list with three 12" pieces from a 37" board: 3 × 12" = 36" + 2 kerfs (at 1/8" each) = 36.25" required. The 37" board provides 0.75" of waste margin. Mark each line from the last cut end using a square and ruler — don\'t measure from the board end after every cut (cumulative error).',
  },
  {
    id: 'mi-thickness-check',
    topic: 'Checking consistent thickness across a board',
    keywords: ['thickness','check','consistent','dial','caliper','variance','flat','panel'],
    answer: 'Use a dial caliper or marking gauge to check thickness at multiple points across a board after milling. Variance of 0.005"–0.010" (about 1/64") is acceptable for most furniture work. More than that and the board needs another pass through the planer or hand planing to level the high spots. Check both edges, both ends, and the middle — 5 measurement points are usually sufficient. Consistent thickness is especially critical in stacked glue-ups and in parts where edge-to-edge alignment is important (stile-and-rail doors, drawer sides).',
  },
  {
    id: 'mi-twist-removal-order',
    topic: 'Hand planing sequence to remove twist',
    keywords: ['twist','remove','plane','diagonal','winding','stick','order','sequence','flat'],
    answer: 'To remove twist with a hand plane: identify the high corners with winding sticks. Work diagonally from high corner to high corner first — this is the most efficient direction for removing the high corners. Traverse planing (at 90° to the grain) is also effective for removing high spots fast. After each series of diagonal strokes, check with winding sticks again. When the sticks appear parallel, switch to strokes parallel to the grain to clean up the surface. The jack plane is the right tool for twist removal — its cambered iron handles the aggressive diagonal cuts well.',
  },
  {
    id: 'mi-cabinet-square-check',
    topic: 'Checking cabinet squareness at every stage',
    keywords: ['cabinet','square','check','diagonal','stage','before','after','clamp','cure'],
    answer: 'Check a cabinet carcase for square at three stages: before assembly (confirm parts are square individually); immediately after clamping while glue is wet (correct any diagonal discrepancy now); and 30 minutes after clamping (one final check — the parts may have moved as clamp pressure distributed). After the glue fully cures, installing a square back panel helps maintain squareness permanently. A 1/16" diagonal discrepancy in a 24" wide cabinet is barely visible; 1/8" will be obvious in the door reveals.',
  },
];
