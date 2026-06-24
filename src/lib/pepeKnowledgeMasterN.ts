import type { KnowledgeEntry } from './pepeKnowledge';

export const PEPE_KNOWLEDGE_MASTER_N: KnowledgeEntry[] = [
  // ── ADVANCED TECHNIQUES ──────────────────────────────────────────────────────
  {
    id: 'mn-steam-bending-setup',
    topic: 'Steam bending setup and technique',
    keywords: ['steam','bend','setup','steam','box','form','time','moisture','species','radius'],
    answer: 'Steam bending requires: a steam box (sealed wooden chamber with a steam source), bending forms (the shape to bend around), and bending straps (metal strap to support the outer fibers in compression during bending). Steam time: typically 1 hour per inch of thickness. Bend quickly — the wood is pliable for only a few minutes after leaving the box. Clamp firmly to the form and leave until fully dry (24–72 hours). Best species for steam bending: white ash, hickory, white oak, cherry, elm. Poor benders: maple, pine, walnut, plywood.',
  },
  {
    id: 'mn-finishing-walnut-dark',
    topic: 'How to keep walnut looking dark after finishing',
    keywords: ['walnut','dark','finish','lighten','gray','bleach','oil','preserve','color'],
    answer: 'Freshly sanded walnut is darker than it will look after a few weeks with light exposure — it lightens to gray-brown. To maximize dark color: apply an oil finish (danish oil or tung oil) which deepens the brown tones. Avoid water-based poly which can make walnut look grayish or greenish. Avoid heavy sanding past 150 grit which burnishes the surface and alters color absorption. Oil or wiping varnish deepens and enriches walnut color better than any water-based product. The color will stabilize after a few weeks of exposure regardless of finish.',
  },
  {
    id: 'mn-breadboard-slot-peg',
    topic: 'Breadboard end slot and peg construction details',
    keywords: ['breadboard','slot','peg','elongate','center','glue','only','middle','one','peg'],
    answer: 'A breadboard end (a cross-grain cap on a tabletop end) requires careful construction to allow movement. Attach the breadboard with a tongue-and-groove or series of mortise-and-tenon joints. Glue only the center joint — all other connections must allow movement. Elongate the outer tenon mortises or peg holes parallel to the tabletop grain direction, allowing the top to move while keeping the breadboard aligned. Pegs (wooden pins through the joint) pass through elongated holes in the top; only the center peg hole is round and tight. A common error: gluing all pegs, which cracks the top at the breadboard joint within a season.',
  },
  {
    id: 'mn-wainscoting-install',
    topic: 'Installing wood wainscoting panels',
    keywords: ['wainscoting','install','wall','panel','chair','rail','base','cap','level'],
    answer: 'Wainscoting installation steps: (1) Find level reference lines for the chair rail height (typically 32"–36") and mark around the room with a level. (2) Install the base (bottom) rail using the existing baseboard or a new base rail. (3) Install vertical stiles (every 16"–24") plumbed and fastened to studs. (4) Float the panels in place (not glued). (5) Install the chair rail cap on top. Pre-finish the wainscoting before installation for easier painting of edges. Acclimate the wood panels in the room for at least a week before installation to reduce movement after installation.',
  },
  {
    id: 'mn-cove-cut-table-saw',
    topic: 'Cove cuts on the table saw',
    keywords: ['cove','cut','table','saw','auxiliary','fence','angle','slow','feed','radius'],
    answer: 'A table saw cove cut produces a concave rounded profile by running the workpiece diagonally across the blade. An auxiliary angled fence (a board clamped to the table at the desired angle) guides the workpiece at an angle to the blade, and each slow pass removes a small amount until the cove depth is reached. The profile width and depth depend on the angle and depth of cut. This is a dangerous operation requiring slow feed rates and light passes — never force a cove cut. Clean saw marks with a curved scraper or sandpaper wrapped around a matching radius dowel.',
  },
  {
    id: 'mn-template-half',
    topic: 'Making half-templates for symmetrical parts',
    keywords: ['half','template','symmetrical','trace','flip','accurate','consistent','leg','bracket'],
    answer: 'For symmetrical parts (chair legs, bracket feet, apron profiles), make only a half-template — trace it on the stock, flip it over the centerline, and trace again to get the perfectly symmetrical full profile. This guarantees the two halves are identical and eliminates asymmetry introduced by freehand drawing. Make the template from 1/4" MDF or hardboard; cut accurately with a scroll saw or jigsaw and sand smooth. One half-template also takes up less storage space than a full template and works for both the left and right mirror-image halves of an asymmetric piece.',
  },
  {
    id: 'mn-raised-panel',
    topic: 'Raised panel router bit operation',
    keywords: ['raised','panel','router','bit','solid','large','slow','speed','profile','door'],
    answer: 'Panel-raising bits (cope-and-stick panel raisers) are large-diameter bits (2.5"–3") that produce the raised field on a door panel. They require slower router speeds (10,000–12,000 RPM maximum) because the large diameter produces very high rim speed at normal RPM. Feed direction: always against the bit rotation (conventional). Make multiple passes: first a climb cut (light) to prevent tearout on cross-grain areas at panel ends; then one or two conventional passes to full profile depth. Solid-wood panel must float in the door frame — never glue it into the groove.',
  },
  {
    id: 'mn-half-blind-dovetail-layout',
    topic: 'Laying out half-blind dovetails precisely',
    keywords: ['half','blind','dovetail','layout','depth','front','wall','mark','gauge','sequence'],
    answer: 'Half-blind dovetail layout sequence: (1) Mark the drawer front thickness on the tail board — this is the baseline for the tails. (2) Set a marking gauge to the front wall thickness (typically 3/16"–1/4") and mark the depth line on the tail board end grain and pin board front face. (3) Lay out tails on the tail board end, angle and space as desired. (4) Saw the tails; chop the baseline. (5) Transfer the tail positions to the pin board by setting the tail board on the pin board end and scribing. (6) Saw the pins; chop the waste carefully without breaking through the front face. The front wall makes this joint significantly more difficult than a through dovetail.',
  },
  {
    id: 'mn-hand-cut-tenon',
    topic: 'Hand-cut tenon — saw sequence and fitting',
    keywords: ['tenon','hand','cut','saw','sequence','shoulder','cheek','fit','mortise','trim'],
    answer: 'Hand-cut tenon sequence: (1) Mark all four shoulder lines with a marking knife. (2) Scribe the cheek lines with a mortise gauge set to the mortise width. (3) Saw the shoulder cuts just to the knife line (cross-grain cuts, with a bench hook). (4) Saw the cheek cuts from the end with a rip saw or wide backsaw, staying on the waste side of the line. (5) Check fit in the mortise — if tight, pare the cheeks with a shoulder plane or router plane until the fit is snug. (6) Saw the haunch if required. Work to fit the mortise you actually cut, not a theoretical dimension.',
  },
  {
    id: 'mn-frame-panel-door-sequence',
    topic: 'Frame-and-panel door assembly sequence',
    keywords: ['frame','panel','door','assembly','sequence','float','glue','dry','clamp','stile'],
    answer: 'Frame-and-panel door assembly sequence: (1) Cut all rails and stiles to final length. (2) Rout the groove in all frame members. (3) Cut the haunched tenons on the rails and fit to the stile mortises (dry). (4) Cut the panel to size — allow movement (1/8" per foot of panel width, both directions). (5) Dry-fit the entire door with the panel to check squareness and fit. (6) Apply glue only to the mortise-and-tenon joints — never to the panel or the groove. (7) Clamp, check square, and set flat. A well-built frame-and-panel door stays flat indefinitely because the panel floats freely.',
  },
  {
    id: 'mn-router-table-edge-profile',
    topic: 'Edge profiling sequence on the router table',
    keywords: ['edge','profile','router','table','sequence','order','face','edge','full','partial'],
    answer: 'Sequence for routing edge profiles on all four sides of a panel: (1) Route the two end-grain edges first (cross-grain, higher tearout risk). (2) Route the two long-grain edges. This order means any tearout at the end of the end-grain cuts is cleaned up by the subsequent long-grain cuts. If you route long-grain first, tearout at the corners on the end-grain pass is still visible. Keep the bit below final height and take two passes: a light first pass at 2/3 depth, then a final pass at full depth. This reduces tearout and load on the bit.',
  },
  {
    id: 'mn-turning-hollow-form',
    topic: 'Hollow form turning on the lathe',
    keywords: ['hollow','form','turning','vase','inside','tool','hollowing','light','thin','wall'],
    answer: 'Hollow form turning (closed-top vessels) uses long curved hollowing tools that can reach inside through a small opening. The challenge: you can\'t see the interior, so you feel the cuts and use a wall-thickness gauge to check thickness. Work in concentric circles from the inside out, taking light cuts. The opening must be just large enough for the tool clearance — typically 1"–2". Use a catch box or rest at the opening to control the tool. A digital wall thickness caliper reads the thickness through the wood wall using magnets. Remove the tailstock support once the outside is shaped and the wall is thin enough for completion.',
  },
  {
    id: 'mn-pen-turning',
    topic: 'Pen turning on the lathe — basics',
    keywords: ['pen','turning','lathe','blank','tube','bushings','kit','mandrel','assemble'],
    answer: 'Pen turning requires a lathe, pen turning mandrel, pen blanks (wood or acrylic), and a pen kit (hardware). Process: drill the blank to tube diameter, press in brass tubes with CA glue, mount on mandrel with matching bushings, turn to match bushing diameter, sand through fine grits, apply finish (CA glue polish is the fastest), and assemble the click mechanism. Pens are an excellent project for using exotic wood offcuts too small for furniture. A pen turning kit costs $5–15; the lathe setup time once familiar is under 30 minutes per pen.',
  },
  {
    id: 'mn-router-bit-burning',
    topic: 'Why router bits burn wood and how to prevent it',
    keywords: ['router','bit','burn','scorch','dull','slow','feed','speed','resin','pitch'],
    answer: 'Router bit burning happens when the bit generates too much heat. Causes: feed rate too slow (bit stays in one place too long); bit is dull or has resin buildup; RPM too high for bit diameter; too deep a cut in one pass. Fix: increase feed rate (move the router faster); clean the bit with pitch remover; reduce RPM for large bits; take multiple lighter passes. A sharp bit fed at the right rate should produce chips, not dust. Burning in pine and resinous woods happens more easily — increase feed rate and reduce depth per pass for these species.',
  },

  // ── MORE WOOD SPECIES ────────────────────────────────────────────────────────
  {
    id: 'mn-white-oak-staining',
    topic: 'White oak staining tips and challenges',
    keywords: ['white','oak','stain','even','open','grain','pore','absorb','conditioner'],
    answer: 'White oak is ring-porous with large open pores in the early wood — stain absorbs heavily in the ring pores and lightly between, creating a dramatic but sometimes uneven result. For even staining, either embrace the ring-porous pattern (it looks intentional) or use gel stain which sits on the surface. The large pores can be grain-filled before staining for a uniform, closed-pore appearance. Fumed white oak (ammonia vapors) produces the most natural, even color change — the tannins react uniformly throughout the wood. Test any stain or treatment on a scrap from the same board.',
  },
  {
    id: 'mn-maple-species-selection',
    topic: 'Selecting maple boards for consistent color in a project',
    keywords: ['maple','select','consistent','color','creamy','white','yellow','tone','project'],
    answer: 'Hard maple varies widely in color — from pure creamy white to yellowish to light tan. For a project that will be painted, any variation is acceptable. For natural or stained pieces, inconsistent color between boards looks jarring. Buy all maple for a project from the same tree or kiln lot at once; color consistency within a single lot is much better than between different orders. Steamed maple is more consistent in color than unsteamed. Avoid mixing western and eastern maple — the two regions produce notably different color tones that don\'t blend well in adjacent panels.',
  },
  {
    id: 'mn-cherry-matching',
    topic: 'Matching cherry panels — color and grain consistency',
    keywords: ['cherry','match','color','grain','same','lot','sequential','panel','consistency'],
    answer: 'Cherry\'s color varies between boards from the same tree and varies dramatically between trees and growing regions. For a multi-panel project (kitchen doors, large tabletop), buy all the cherry from the same lot — preferably sequential boards from the same log. The color will still vary but will develop together as the patina darkens. Mismatched cherry (from different lots or different boards of wildly different initial color) produces panels that look dramatically different after patination, even if they appeared similar when purchased. Fuming cherry with ammonia can somewhat equalize initial color variation.',
  },
  {
    id: 'mn-spalt-turning',
    topic: 'Turning spalted wood on the lathe',
    keywords: ['spalted','turn','lathe','safe','respirator','P100','soft','stabilize','zone'],
    answer: 'Spalted wood turning requires specific precautions. Mildly spalted wood (firm to the touch, clean zone lines) is safe to turn with a P100 respirator — the spalt fungi may still be viable in the wood. Heavily punky spalted wood is dangerous: it\'s structurally weak and can fly apart at lathe speed. Stabilize punky areas with penetrating epoxy before mounting. Test the blank by tapping — it should ring, not thud. Start at very low speed and increase gradually while listening and feeling for vibration. Wear full face shield plus safety glasses for spalted wood turning as an extra precaution against fragmentation.',
  },
  {
    id: 'mn-burl-turning',
    topic: 'Turning wood burls — mounting and challenges',
    keywords: ['burl','turn','lathe','faceplate','balance','mount','crazy','grain','void'],
    answer: 'Burls have chaotic grain in all directions, making them spectacular for turning but challenging to work. Mount on a faceplate (not a drive spur) using lag screws into solid wood. Expect severe imbalance — start at the lowest speed setting and increase very slowly. Voids and bark inclusions are common in burls; decide whether to fill them (tinted epoxy) or leave them as natural features. The wildly interlocked grain means the tool will catch in every direction — take very light cuts and keep tools sharp and properly supported on the rest. Wear a full face shield at all times when turning burls.',
  },
  {
    id: 'mn-sap-heartwood-ratio',
    topic: 'Sapwood vs heartwood in furniture decisions',
    keywords: ['sapwood','heartwood','ratio','use','include','exclude','contrast','stability'],
    answer: 'Most furniture woodworkers exclude sapwood because it often contracts differently from heartwood, is less rot-resistant in outdoor applications, and (in stained or natural-finish work) produces jarring color contrasts. However, cherry sapwood next to heartwood produces beautiful warm contrast that many designers intentionally use. Black walnut with its cream sapwood is another case where the contrast is a deliberate design element. For painted work, sapwood vs heartwood doesn\'t matter. For exterior use, exclude sapwood from rot-resistant species (cedar, teak) — the sapwood doesn\'t have the same natural preservative oils.',
  },
  {
    id: 'mn-pine-pitch-sealing',
    topic: 'Sealing pine pitch pockets before painting',
    keywords: ['pine','pitch','sealing','paint','shellac','primer','bleed','stain','knot'],
    answer: 'Pine contains pitch (resin) in knots and pitch pockets that bleeds through almost any topcoat or paint if not sealed. The pitch oozes through water-based primers and paints over time, leaving yellow or brown greasy spots. Solution: seal all knots and pitch pockets with shellac primer (Zinsser BIN) before any other finish. Two coats of shellac blocks pitch and tannin reliably. Oil-based primer also blocks pitch effectively. Water-based primers do not stop pitch bleed regardless of how many coats are applied.',
  },
  {
    id: 'mn-veneered-panel-vs-solid',
    topic: 'Veneered panel vs solid wood — when to choose each',
    keywords: ['veneer','panel','solid','wood','choose','stable','wide','book','match','cost'],
    answer: 'Choose veneered panels when: extreme dimensional stability is needed (computer desks, large flat doors); wide matching patterns are required (bookmatched figure impossible in solid wood at that scale); weight reduction matters; or cost of solid wood is prohibitive. Choose solid wood when: the edges will be shaped, carved, or detailed (veneer has no material to remove); repair and refinishing over decades is expected (veneer has limited sanding life); raw edges will be exposed (solid wood edges look better); or the piece will be subjected to heavy localized stress. The best furniture often combines both: solid for structure and edges, veneered panels for wide flat surfaces.',
  },

  // ── BUYING & FINISHING TIPS ───────────────────────────────────────────────────
  {
    id: 'mn-stain-test-protocol',
    topic: 'Proper stain test protocol before committing',
    keywords: ['stain','test','protocol','scrap','same','board','dry','light','observe'],
    answer: 'A reliable stain test: cut scrap from the same board as the project (not different scrap — species vary significantly in stain uptake). Sand to the same grit you\'ll use on the project. Apply the stain exactly as you will on the project (same brush or rag, same dwell time). Apply a topcoat sample over the dried stain — the topcoat changes the perceived color. Let dry completely and view under the room\'s actual lighting (not shop fluorescent lights). Compare to the target color. Adjust if needed — you can mix stains, add more coats, or apply a toner. Never skip this step for expensive or irreplaceable material.',
  },
  {
    id: 'mn-buying-used-tools',
    topic: 'Buying used woodworking tools — what to check',
    keywords: ['used','tool','buy','check','inspect','estate','flea','market','online','condition'],
    answer: 'At estate sales and flea markets, check hand tools for: cracks in handles (deal-breaker for struck tools); severe pitting on cutting surfaces (affects sharpening time, not always a deal-breaker); completeness (missing adjusting screws or nuts may be unfindable replacements); and flatness of soles on planes (rock on a flat surface to check). For power tools: check power cord condition, run it briefly if possible and listen for bearing noise, verify the fence or guides aren\'t bent. Online (eBay, Craigslist): research model numbers first to avoid buying a tool that had design flaws or missing parts that are unavailable.',
  },
  {
    id: 'mn-shellac-compatibility',
    topic: 'Shellac compatibility with all other finishes',
    keywords: ['shellac','compatible','over','under','any','finish','universal','prime','seal'],
    answer: 'Dewaxed shellac is the only finish that bonds reliably to everything and has everything bond to it. Apply dewaxed shellac over: wax (with some prep), unknown existing finishes, oil-soaked wood, resinous wood, tannin-rich wood. Apply dewaxed shellac under: any lacquer, any varnish, any poly (water or oil based), any paint. The one exception: waxed shellac (not dewaxed) may not accept oil-based varnishes over it reliably. Always use dewaxed shellac (Zinsser SealCoat, or flake-mixed without natural wax) when using shellac as a compatibility bridge.',
  },
  {
    id: 'mn-oily-wood-gluing',
    topic: 'Gluing oily tropical hardwoods reliably',
    keywords: ['oily','wood','glue','teak','cocobolo','rosewood','acetone','wipe','reliability'],
    answer: 'Oily tropical hardwoods (teak, cocobolo, rosewood, ipe) require surface degreasing before gluing or the bond will be weak or fail entirely. Wipe both glue surfaces with acetone immediately before applying glue — "immediately" means within 2–5 minutes; oils wick back to the surface quickly. Let acetone evaporate fully (30–60 seconds) before applying adhesive. Slow-cure epoxy provides the best gap-filling and oil-penetrating bond. Two-part structural adhesives (epoxy, Weldwood plastic resin) outperform PVA on oily species. Test the bond on scrap before gluing a large assembly — a simple shear test reveals adhesion quality.',
  },
  {
    id: 'mn-shop-built-tools',
    topic: 'Essential shop-made tools and jigs worth building early',
    keywords: ['shop','made','tools','jig','bench','hook','shooting','board','winding','stick'],
    answer: 'Build these shop tools early in your woodworking journey: (1) Bench hook — holds work for crosscutting. (2) Shooting board — guides a hand plane for accurate end-grain trimming. (3) Winding sticks — reveals twist in boards. (4) Story stick for current project — eliminates repeated measuring. (5) Crosscut sled for table saw — safer and more accurate than a miter gauge. (6) Box joint jig — for clean finger joints in boxes. (7) Marking gauge (if you don\'t have one) — easier to make than buy in some cases. Each of these takes 1–4 hours to build and pays back that investment on the first project that uses it.',
  },
  {
    id: 'mn-moisture-content-furniture',
    topic: 'Target moisture content for indoor furniture by climate',
    keywords: ['moisture','content','target','indoor','furniture','climate','humid','dry','percent'],
    answer: 'Target moisture content (MC) for interior furniture varies by climate. Dry climates (American Southwest, heated interiors): 5–7% MC. Moderate climates (most of continental US): 7–9% MC. Humid climates (Gulf Coast, Pacific Northwest): 8–11% MC. The rule: build furniture at the MC it will live at. A piece built in a humid shop (12–14% MC) that moves into a dry heated home (6% MC) will shrink 6–8% across the grain — enough to crack panels and open mortise joints. A moisture meter is a $30–150 investment that prevents much more expensive mistakes.',
  },
  {
    id: 'mn-wood-selection-grain',
    topic: 'Grain selection for strength in specific parts',
    keywords: ['grain','selection','strength','run','out','leg','rung','bend','resist'],
    answer: 'For parts under bending stress (chair legs, table stretchers, tool handles), grain must run parallel to the length of the part with minimal runout. Even 5°–10° runout reduces bending strength dramatically — the fibers break across the grain rather than along it. For table legs: select straight-grained wood; reject boards where grain lines angle across the face on the edge view. For chair spindles: rift-sawn or riven (split) stock with absolutely straight grain. For tool handles (hammers, axes): use riven hickory or ash where the grain follows the handle shape without any runout.',
  },

  // ── DESIGN (ADVANCED) ─────────────────────────────────────────────────────────
  {
    id: 'mn-design-iteration',
    topic: 'Iterating on furniture design through prototypes',
    keywords: ['iterate','design','prototype','mockup','refine','try','adjust','cheap','repeat'],
    answer: 'The best furniture comes from iterating — build a rough prototype, live with it for a few days (or seat test a chair for an hour), then refine the design before committing to quality wood. Cardboard, MDF, and cheap pine are prototype materials. Change proportions by adding or subtracting material. Testing a chair prototype ergonomically reveals comfort issues that no amount of drawing or calculation predicts. A day spent prototyping saves days of finishing and refinishing an uncomfortable or ugly piece. Professional furniture designers prototype consistently; hobbyists who skip it often have regrets.',
  },
  {
    id: 'mn-wood-selection-aesthetic',
    topic: 'Wood selection for a complete piece — aesthetic strategy',
    keywords: ['wood','select','aesthetic','strategy','piece','primary','secondary','contrast','grain'],
    answer: 'Effective wood selection strategy for a complete piece: choose the primary wood first (usually the most visible, highest-grade material for tops, doors, drawer fronts). Choose a secondary wood that complements the primary in both color and grain character — poplar or soft maple for painted secondary members; maple or birch for natural secondary members in a walnut piece. Use contrasting accent species sparingly for emphasis: a single ebony edge pull on a maple box; walnut stringing on a cherry tabletop. The accent works only because it\'s rare — overusing contrast diminishes impact.',
  },
  {
    id: 'mn-furniture-scale-room',
    topic: 'Furniture scale relative to the room',
    keywords: ['scale','room','furniture','proportion','large','small','visual','ceiling','size'],
    answer: 'Furniture should be proportioned to the room\'s scale. A massive dining table in a small dining room makes the room feel claustrophobic. A delicate side table in a large, high-ceilinged room disappears. The relationship between furniture height and ceiling height matters: in an 8\' ceiling room, a 7\' armoire feels appropriate; in a 10\' ceiling room, the same armoire looks squat. The visual mass of furniture (not just physical size) determines whether it fills or overwhelms a space. Place paper or cardboard cutouts at scale in the room before building to check visual fit.',
  },
  {
    id: 'mn-bookmatching-asymmetric',
    topic: 'Creating asymmetric bookmatching for dynamism',
    keywords: ['bookmatching','asymmetric','dynamic','offset','half','book','match','design'],
    answer: 'Standard bookmatching produces perfect bilateral symmetry — which can look static and formal. For a more dynamic composition: slip-match (position sequential veneer sheets at the same orientation, creating a flowing pattern that repeats but doesn\'t mirror); or book-match with an offset (center the book-match to one side of the panel intentionally, shifting the visual focal point). For a tabletop, an off-center book-match focal point creates visual movement where a centered match might look overly formal.',
  },

  // ── PROJECT-SPECIFIC TIPS ─────────────────────────────────────────────────────
  {
    id: 'mn-cabinet-shimming',
    topic: 'Shimming and scribing cabinets at installation',
    keywords: ['shim','scribe','cabinet','installation','wall','floor','level','plumb','gap'],
    answer: 'Walls and floors are rarely perfectly plumb, level, or flat. During cabinet installation, shim under and behind cabinets until level and plumb, then scribe the exposed sides to the wall. A scriber (compass) traces the wall contour onto the cabinet side; cut along the scribed line to create a tight fit against the irregular wall. Fill large gaps (over 3/16") with a scribe molding (a strip of solid wood applied over the gap after scribing). Cabinet leveling legs (adjustable feet inside the toe kick) simplify leveling considerably compared to loose shims.',
  },
  {
    id: 'mn-painted-cabinet-prep',
    topic: 'Preparing cabinet frames for a painted finish',
    keywords: ['paint','cabinet','prep','fill','sand','primer','nail','hole','edge','MDF'],
    answer: 'Painted cabinets require more prep work than stained — paint magnifies surface defects while stain somewhat hides them. Fill all nail holes with non-shrinking wood filler; sand flat when dry. Sand all surfaces to 120 grit to remove planer marks. MDF edges: seal with a penetrating primer or drywall compound before painting (MDF edges are very absorbent). Apply one coat of oil-based primer (blocks tannins and knots); sand at 150 grit; apply second primer coat; sand at 180–220 grit; topcoat with alkyd or high-quality latex enamel. More prep steps mean a more professional result.',
  },
  {
    id: 'mn-base-cabinet-corner',
    topic: 'Corner base cabinet construction and access',
    keywords: ['corner','cabinet','base','lazy','susan','blind','rotating','tray','access'],
    answer: 'Corner base cabinets are the most awkward storage in a kitchen — the deep recessed corner is hard to access. Options: lazy susan (rotating turntable), blind corner pull-out (hardware that pulls the contents into accessible position), or simply a large open shelf with a door (most accessible, least organized). Lazy susans require accurate corner-to-corner inside dimensions for the turntable diameter. Pull-out blind corner units mount to a specific cabinet width and depth — measure carefully and order the unit before building the cabinet. The corner cabinet door must swing clear of adjacent cabinet doors.',
  },
  {
    id: 'mn-outdoor-table-drain',
    topic: 'Outdoor table drainage design',
    keywords: ['outdoor','table','drain','water','gap','angle','channel','stainless','seal'],
    answer: 'Outdoor table tops should have design features that allow water to drain quickly rather than pooling. Gaps between slats (1/4"–3/8") allow rain to pass through the top entirely. Alternatively, a solid top can be angled very slightly (1°–2°) so water runs to one end. Avoid inside corners that collect water — design with outward drainage geometry. Solid outdoor tops should never have sealed perimeter edges with no drainage path — water infiltrates through the end grain and causes rot from inside. Leave end-grain faces unsealed or protected with a water-repellent penetrating end-grain sealer specifically.',
  },
  {
    id: 'mn-laminate-countertop',
    topic: 'High-pressure laminate countertop construction',
    keywords: ['laminate','countertop','HPL','contact','cement','substrate','flush','trim','bit'],
    answer: 'HPL (high-pressure laminate) countertops: build the substrate from 3/4" plywood with a second 3/4" layer laminated on top (1.5" total) for flatness and rigidity. Apply contact cement to both the substrate and the HPL sheet; let dry; align carefully (the bond is instant — use dowel rods as spacers until aligned, then remove rods one at a time and press down firmly). Trim the edges with a flush-trim bit in a router. Edge the exposed front with HPL edge banding or a wood edge strip. Sand the transition joint carefully and apply the same laminate to any exposed substrate edges.',
  },
  {
    id: 'mn-garden-planter',
    topic: 'Wood garden planter box construction',
    keywords: ['planter','garden','wood','box','liner','drain','rot','cedar','redwood','waterproof'],
    answer: 'Wooden planter boxes need: rot-resistant wood (cedar, redwood, teak, black locust — never pressure-treated wood with arsenic for food gardens); drainage holes in the bottom (minimum 1" holes every 6"–8"); and a protective liner (hardware cloth on the bottom to prevent soil spillage while allowing drainage; plastic liner on the sides to protect the wood from constant soil contact). Leave joints slightly open (1/8" gaps) rather than gluing tightly — glued joints will push apart as the saturated wood swells seasonally. Annual oil treatment on the exterior extends life considerably.',
  },
  {
    id: 'mn-workbench-top-glue',
    topic: 'Laminating a workbench top from dimensional lumber',
    keywords: ['workbench','top','laminate','glue','construction','lumber','flatten','dense','mass'],
    answer: 'A laminated workbench top from 2×4 or 2×6 construction lumber: alternate heart side (growth rings oriented different directions) to reduce seasonal cupping. Apply glue to every mating surface; use many clamps (every 6"–8"); work in manageable glue-up sections (4–6 boards at a time). After curing, joint the top flat with a hand plane (the No.5 or No.7) — a belt sander works but leaves a rippled surface from uneven pressure. The mass of a thick solid top (4"–5") is the most important feature — it resists movement during planing. Flatten every year or when high spots develop from use.',
  },
];
