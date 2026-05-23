# WS-09 — Node-graph & flow editors

**Scope:** Pattern library for node-based UIs across VFX (Houdini, Nuke, Substance), game tooling (Unreal Blueprint, Unity ShaderGraph, Blender Geometry Nodes), realtime / broadcast (TouchDesigner, Notch), open-source editor libraries (React Flow, rete.js, litegraph.js), workflow automation (n8n, Node-RED, Make/Zapier), and the emerging class of LLM-flow tools (ComfyUI, LangFlow, Flowise, Dify). Excludes: BI dashboards (WS-03), Palantir pipeline UI (WS-04), generic knowledge-graph rendering (WS-05). Cross-pollinates with WS-07 (AI-native reasoning UIs) on ComfyUI specifically.

**Date:** 2026-05-23
**Sources consulted:** 12 primary + 14 supporting

## Tools / sources surveyed

- **Houdini (SideFX)** [tool, Tier A] — VFX procedural standard. Dive-in/up sub-networks, network boxes, sticky notes with adjustable text size, HDA parameter promotion, geometry spreadsheet. **Deep-analyzed.**
- **Unreal Blueprint (Epic)** [tool, Tier A] — Visual scripting at AAA-game scale. Comments, functions, macros, reroute nodes, named reroute (5.0+). **Deep-analyzed.**
- **Blender Geometry / Shader Nodes** [tool, Tier A] — Frames as visual containers, node groups, recent (2025) investment in frame label visibility at zoom-out and link portals.
- **ComfyUI** [tool, Tier A] — DAG for diffusion pipelines, frontier of LLM-driven workflow generation (ComfyUI-R1). Uses litegraph.js fork. **Deep-analyzed (LLM-flow section).**
- **TouchDesigner (Derivative)** [tool, Tier A] — Typed operator families: CHOPs (channels), TOPs (textures), SOPs (surfaces), DATs (data), MATs (materials), COMPs (containers). Cross-family conversion nodes (`CHOP to SOP`).
- **Nuke (Foundry)** [tool, Tier A] — Compositing node graph. B-pipe convention. Backdrops, sticky notes, in-place node drop on existing wires. Nuke 16 (Feb 2025) added Group Node internal-view and Link nodes.
- **Substance 3D Designer (Adobe)** [tool, Tier A] — Compositing graphs for materials. Parameter exposure as the central reuse mechanism. Sub-graph instancing.
- **Unity Shader Graph / VFX Graph** [tool, Tier B] — Sister node-graphs that interop.
- **Maya Node Editor** [tool, Tier B] — Earliest mainstream colored-port type system.
- **n8n** [tool, Tier B] — Workflow automation. Three-pane layout (palette + canvas + config). Resource→Operation parameter pattern.
- **Node-RED (IBM/OpenJS)** [tool, Tier B] — IoT flow-based programming, J.P. Morrison heritage. 4,000+ community nodes.
- **LangFlow / Flowise / Dify** [tools, Tier B] — LLM agent visual builders. **Deep-analyzed (LLM-flow section).**
- **Notch** [tool, Tier B] — Broadcast/live-event real-time visuals. "Anything-to-anything" parameter graph.
- **React Flow / xyflow** [library, Tier A] — Industry de-facto open-source library for web node-UIs. Built-in minimap, bezier/step/straight/smoothstep edge types.
- **rete.js** [library, Tier B] — 36k weekly downloads (npm 2025). Modular plugin architecture; validation via `ConnectionValidator` callback.
- **litegraph.js** [library, Tier B] — Powers ComfyUI; Comfy-Org fork is now the active version after the original was archived.
- **Max/MSP, Pure Data** [tools, Tier C] — Founding patcher metaphor; multi-channel patch cords.

## Lens pass

### L1 — Spatial primitives
Every tool surveyed uses the same four primitives: **node** (rectangular box with title bar), **port** (left-input / right-output; Houdini and Substance are top-down), **connection** (curve or polyline between ports), and **frame / sticky-note / backdrop** (visual container that holds nodes without affecting semantics). Houdini separates **network box** (selectable container that moves nodes together) from **Subnet** (semantic encapsulation) and from **sticky note** — most other tools collapse these into one "comment box". Blender's 2025 work doubled down on **Frame** as a first-class primitive.

Two structural primitives are universal in mature tools and absent from beginners' tools: **sub-network / group / function** (semantic encapsulation that hides internal complexity behind a single node) and **reroute / knot** (a near-zero-cost node whose only job is to bend a wire). Unreal added **named reroute** in 5.0 — a labeled wireless teleporter pin pair, killing the most common form of spaghetti.

### L2 — Data → form mapping
**Node = computation, edge = data.** Port colour and shape encode type. Maya's Node Editor was an early standard: int, float, vector, matrix, mesh each got a distinct hue. Houdini, Substance, Unreal, ComfyUI, n8n all inherited this. **Round ports = data**, **arrow / pentagon ports = execution flow** (Unreal Blueprint distinguishes white execution arrows from coloured data circles — inherited from Kismet). TouchDesigner takes typing further: the *entire network* has a type — CHOPs only connect to CHOPs, with explicit `CHOP to SOP` bridge nodes when crossing — so colour drops to a per-family convention (green for CHOPs).

LLM flow tools (LangFlow, Flowise, ComfyUI) abuse this language by overloading every connection as "the latent tensor / message / context" without strong typing — see the **LLM flow tools** section.

### L3 — Camera & navigation
Universal: **pan + zoom 2D**. No surveyed tool uses 3D camera for the graph (TouchDesigner's 3D viewport is a separate pane). Scaling characteristics: Houdini, Nuke, and modern React Flow / litegraph.js tolerate **hundreds to low thousands of nodes** before responsiveness degrades; Blender geometry-nodes slows past 800 nodes. For 1k+ networks, only tools with (a) **dive-in sub-networks** so you rarely see all 1k at once, and (b) a **mini-map** in the corner with a draggable viewport box, survive ([Foblex FMinimap](https://flow.foblex.com/docs/f-minimap-component), [Houdini-style mini-map for Blender](https://github.com/strike-digital/node_minimap)).

The **Tab menu** (Houdini, Blender, ComfyUI "Add Node" search, React Flow examples) is the universal *teleport-by-name* — type a few characters, fuzzy-match jumps to node creator. n8n's left palette serves the same role but slower.

### L4 — Level of Detail
Three stages in mature node tools:
1. **Far zoom** — names disappear, box becomes a colored rectangle. Houdini fades titles and shows a flag bar. Frame labels scale up to remain readable (Houdini "extra-large" sticky-notes, Blender 2025 frame-label-at-zoom-out work).
2. **Medium zoom** — title and ports visible; values hidden.
3. **Close zoom** — full port labels, in-canvas value editing, parameter previews (Substance and Houdini render thumbnail output on the node itself when display-flagged).

Houdini and Nuke collapse a Subnet / Group to a single icon-sized container node at outer view — the user *cannot see* the internal 500 nodes from outside, which is the LOD trick that scales. ComfyUI lacks this and routinely produces unreadable mega-graphs spanning several screens.

### L5 — Anchoring (AR/VR-specific)
**N/A.** Every tool is a 2D screen pane; no production node-graph ships an AR/VR mode in 2026. Implicit anchoring: window-anchored editor pane, in-place sub-network dive, fixed-corner mini-map and controls. Notch is the closest to AR-adjacent (broadcast 3D outputs), but the authoring graph is still flat.

### L6 — Labels & legends
Node titles **always-on** except farthest zoom. Port labels **always-on close, hidden far**. Houdini, Substance, Unreal, n8n show editable value previews inline on the node when zoomed close — one of the strongest "node + inspector compression" patterns. Sticky notes / frames carry human-readable explanation and are intentionally non-functional; Blender's 2025 work elevates sticky-label visibility at zoom-out — wayfinding signage at network scale.

Legends as such barely exist — port colors *are* the legend; users learn by exposure. Maya, Houdini, Substance let users recolor the type palette in settings.

### L7 — Selection & group operations
Click / drag-rect / Shift-add / Ctrl-toggle — universal. Houdini and Nuke add **selection by wire path** (select all upstream / downstream) — killer operation for debugging dataflow. Multi-selection ops: move, delete, **Collapse to Subnet / Group / Function** (most important — see L1), recolor, align (Unreal "Align Tops" / "Distribute Horizontally"), copy/paste with reference rewriting.

n8n / Node-RED expose "saved selection" via **sub-workflows / subflows**. Houdini's saved-selection mechanism *is* the HDA — once encapsulated and parametrized, a selection becomes a reusable asset.

### L8 — Attention flow
**Push signals are subtle.** Errored nodes get a red outline / red `!` badge (Houdini, Nuke, ComfyUI, n8n). Live-executing nodes glow (TouchDesigner cooking, ComfyUI sampling, n8n spinner). Nuke 16 added bounding-box-size and channel-count indicators inline on the node — performance heuristics surfaced on the node, not in a separate panel.

Houdini's **display flag** (blue dot on a SOP = "viewport shows this node's output") is a user-pull mechanism that also pushes: designating focus visualizes everything downstream through it. This *node-as-focus-anchor* pattern is rare outside DCC tools and is a candidate for cross-pollination.

### L9 — Color system
Three orthogonal scales coexist:
1. **Categorical** — node *kind*: header band color per category (Houdini SOP=orange, VOP=teal, DOP=red; Unreal bands per function-group).
2. **Type** — port and wire color per data type (universal; see L2).
3. **State / role** — selection (yellow), error (red), bypass (gray crosshatch), display/template/lock flags (colored markers).

User-applied **comment / frame / network-box colors** form a fourth *semantic* scale chosen by the artist. Houdini exposes 32 default Cd palette colors plus arbitrary RGB; Unreal lets comments be any color. None are documented as colorblind-tested; Maya allows user override.

### L10 — Inter-view linking
**Houdini's signature and the strongest competitive moat in the space.** The network editor, parameter panel, geometry spreadsheet, and 3D viewport are bound by a **selection + display-flag** model: select a node → parameter panel re-renders for that node; flag a node → 3D viewport renders that node's output; open a Geometry Spreadsheet → it shows points/primitives/attributes of the display-flagged node *live as the timeline scrubs*. **Walking the display flag up and down the network is the canonical debugging gesture.**

Nuke's Properties Bin + Viewer have the same triadic linking. Substance has node thumbnail + 3D view + parameter promotion. Unreal Blueprint's Details + viewport play a weaker version: no live "show the data at this wire". ComfyUI's per-node preview-toggle is the closest LLM-flow analogue, but opt-in and lossy. n8n and Node-RED show **per-node execution output** sliding out under the node when clicked — LangFlow / Flowise / Dify borrowed this.

### L11 — Process / reasoning representation
A node graph **is** a process representation. Execution adds time: running graphs animate the wire currently passing data (TouchDesigner cooking, ComfyUI green box advancing through sampling). Trace history beyond "what is happening right now" is uncommon. Exceptions: n8n stores per-execution data and lets you replay; Dify ships per-step timing and OpenTelemetry export; LangSmith (separate, see WS-07) layers tracing on LangFlow.

Houdini's **node + cache** model is its own answer: every node optionally caches output. The "process" is the chain of cached frames; stepping the network *is* stepping the process.

### L12 — Multi-user, sharing, persistence
**Generally single-user.** Houdini, Nuke, Substance, Blender ship single-user files versioned via Perforce/Git. Houdini's `.hipnc` JSON export is diff-friendly but binary `.hip` is still canonical for production. Unreal Blueprints serialize to binary `.uasset` that resist git merging; teams use Perforce + Unreal's Diff Asset visual tool.

ComfyUI JSON workflows *look* git-friendly but **don't capture environment dependencies** — model checkpoints by filename, custom-node versions — so workflows break across machines ([numonic.ai](https://www.numonic.ai/blog/sharing-comfyui-workflows-team)). Comfy Deploy and ComfyGit emerged in 2025 to package environments alongside the workflow.

n8n, Node-RED, LangFlow, Flowise, Dify all serialize JSON and support multi-user via shared server (workflow-as-document). None offer real-time co-editing à la Figma; they assume "one operator, others view".

## Houdini-vs-Blueprint detailed analysis

Both ship a node-graph metaphor and both scale to thousands of nodes in production. The gap between them is instructive.

**Panning huge networks — Houdini wins.** Houdini's network editor was designed in 1996 around thousands-of-nodes VFX scenes; GPU-accelerated canvas, built-in mini-map, the Tab menu as fastest-in-industry node-create. Pan/zoom stays responsive at 5k+ nodes if sensibly sub-divided. Unreal Blueprint slows visibly past a few hundred nodes per graph and encourages splitting into Event Graph / Construction Script / Function / Macro *tabs* — the tab is Blueprint's pan-equivalent at scale.

**Sub-network encapsulation — Houdini wins on transparency, Blueprint wins on reuse semantics.** Houdini's Subnet is a *live* container: dive in, edit inline, jump out — the parent renders one Subnet node. Collapse-to-Subnet is one keystroke. Parameter promotion to the Subnet interface is drag-and-drop; promoting the Subnet to an HDA gives it versioning, an icon, help URL, and library presence. Blueprint Functions live in their own graph tabs with **defined return signatures** (Houdini Subnets don't enforce typed outputs). Macros differ from Functions: macros expand inline at compile time and support **latent nodes** (delay, timeline) Functions don't ([Laaksonen on Blueprints](https://www.linkedin.com/pulse/ue-blueprints-depth-part-1-graphs-functions-macros-laaksonen)). Functions support **override in child blueprints** — a true OO encapsulation Houdini doesn't match.

**Parameter visibility — Houdini wins decisively.** Every node's parameters appear in the Parameter Panel the instant the node is selected — no double-click, no panel switch. Parameter promotion to HDA is one drag or one `Alt+Middle-click` ([HDA guide](https://www.artstation.com/blogs/julianbragagna/yVO4/the-beginners-guide-to-hdas-parameters)). Unreal Blueprint requires double-clicking a Function to enter its graph, then surfacing variables to Details via a separate mechanism — a two-step penalty per inspection.

**Type checking on connections — Blueprint wins on safety, Houdini wins on flexibility.** Blueprint refuses incompatible connections outright (static typing inherited from C++). Houdini connects almost anything: failures surface as a red node banner at evaluation, not a refused connection. Blueprint is more "guard-railed" for beginners; Houdini more "expressive" for experts — a tradeoff TouchDesigner reproduces (typed families = guard-rail, explicit bridge nodes = expressivity).

**Visual debugging — Houdini wins overwhelmingly.** Geometry Spreadsheet + display-flag + viewport linkage means at any node you see the exact data flowing through. Common idiom: store a value into an attribute (`f@test = something`) so it appears in the spreadsheet — an inline `printf` for procedural geometry. Blueprint's debugger is a step-through breakpoint model: pause execution, hover a wire, see its current value — useful but ergonomically heavier and only works in PIE (Play-in-Editor) sessions.

**Version-control friendliness — both lose, Blueprint loses harder.** Houdini's binary `.hip` is unmergeable; `.hipnc` JSON is text-diffable but UI-authored so merges are advisory. Teams use git for HDAs (exportable as `.hda` or unpacked text) and Perforce for full scenes ([artivoxa.com](https://www.artivoxa.com/version-control-for-houdini-projects-git-perforce-best-practices/)). Unreal Blueprints serialize to binary `.uasset`; Epic ships a Diff Asset visual tool, but you cannot merge two divergent Blueprints automatically — one wins, the other rebases manually. Both ecosystems standardized on Perforce for this reason.

**Net summary:** Houdini wins 5/6 axes. Blueprint wins on type-safety and Function-override semantics. Houdini's wins all derive from the same root cause — *the network editor is the primary surface*, not a side panel, and every other view (parameters, viewport, spreadsheet) is engineered as a linked second-class consumer of network-editor state.

## Wiring patterns

**Connector geometry.** Three styles dominate: **bezier curves** (Houdini, Substance, Unreal, ComfyUI, Nuke, React Flow default), **orthogonal / step lines** (Maya Hypershade alternate, n8n, Node-RED, React Flow `step` / `smoothstep`), **straight lines** (rare, debug only). Beziers feel organic and tolerate dense layouts; orthogonal lines align with Manhattan-routed schematic intuition and are easier to follow at extreme density. React Flow exposes all four as a one-line config ([reactflow.dev examples](https://reactflow.dev/examples/overview)) — a useful pattern: let the user or the data pick.

**Auto-routing.** Houdini and Nuke do *not* auto-route — crossings are accepted, fixed via reroute nodes or manual layout. Force-directed `Layout Selected` exists in Houdini, "Format" in Substance, but artists use them sparingly — auto-layout disrupts intentional spatial meaning. n8n auto-layouts aggressively left-to-right; Node-RED does the same. Lesson: **auto-layout works for left-to-right linear flows, fails for procedural many-branch DAGs** because spatial position carries author intent the algorithm can't recover.

**Port types and colors.** Maya's 2015 doc remains the clearest convention: int orange, bool red, float yellow, string magenta, vector cyan, matrix greenish; connection inherits source color ([Maya Node Editor colors](https://help.autodesk.com/cloudhelp/2015/ENU/MayaLT/files/Connection_colors_in_Node_Editor.htm)). Houdini extends with **shape** (round = data, slot = flow); Unreal extends with **arrow heads** for execution edges. Substance and ComfyUI add **port labels on hover** because every tool has more types than distinguishable colours.

**Broken connections.** When a referenced node is deleted, Houdini leaves a dangling "lost" wire painted red until repaired. Blueprint refuses the operation upstream. ComfyUI silently removes the wire and the downstream node turns red on next execution. n8n highlights the disconnected input with a red dot. Principle: **never silently drop a connection without a persistent error marker.** Houdini's dangling-wire is friendliest — it preserves authoring intent for repair.

**Validation while dragging.** Rete.js's `ConnectionValidator` callback ([NodeNetwork cookbook](https://wouterdek.me/NodeNetwork/cookbook/validation.html)) and Maya's "pending connection recolors red to indicate it cannot be made" are the cleanest interactive feedback: while you drag, the wire is provisional and recolors red if hovering an incompatible port. Pre-empts errors before commit.

## Why node graphs fail at scale and how Houdini survives

A naive node graph is **O(n²) visually**: every node added increases not just the count but the potential wire crossings. Past ~50 nodes on a single canvas, comprehension collapses — the "wall of spaghetti" plaguing novice Blueprints, undisciplined ComfyUI workflows, and large n8n flows.

Houdini survives because it stacks five mitigations that compound:

1. **Sub-networks (Subnet, HDA).** The most important — the canvas the user looks at *is never* the full network. Diving in/out is one key (`Enter` / `U`). A 5k-node production scene typically shows 30-100 nodes per visible level. ([Subnetwork SOP](https://www.sidefx.com/docs/houdini/nodes/sop/subnet.html))
2. **Sticky notes with adjustable size.** Notes can be set to "extra large" text so the label reads at full zoom-out; turning off the background gives a free-floating section header like a neighborhood label on a city map ([organize.html](https://www.sidefx.com/docs/houdini/network/organize.html), [velozetetic 2025](https://velozetetic.com/2025/06/18/houdini-sticky-note-editor/)).
3. **Network boxes.** Drag-resizable rectangle around a group of nodes; nodes inside move together. Distinct from Subnet because it doesn't encapsulate semantically — pure spatial grouping. Lets the artist construct a 2D legend without committing to dive-in encapsulation.
4. **Network search.** Tab menu, `Quick Search`, `Find Nodes` traverse the whole hierarchy by name ([shortcuts.html](https://www.sidefx.com/docs/houdini/network/shortcuts.html)). The user navigates *by name*, not by spatial scrolling, once networks pass ~100 nodes.
5. **Mini-map.** Always-on corner overview with draggable viewport rectangle. Blender added a Houdini-style mini-map plugin in 2024 ([strike-digital/node_minimap](https://github.com/strike-digital/node_minimap)); React Flow ships one out of the box. Value is not navigation efficiency — it's situational awareness: "I'm in the lower-left of a much bigger thing".

Unreal Blueprint partially mitigates with **Functions / Macros + named reroute nodes** (UE 5.0; [hojdee.com](https://hojdee.com/named-reroute-node-in-unreal-engine-clean-up-material-graphs/)). ComfyUI mitigates via **Group Nodes** (recent) and community-built collapse-to-subgraph custom nodes — but the canvas-as-primary-surface assumption is shallower than Houdini's, so failures are louder.

General principle: **hierarchical compression** — every successful node tool layers a containment hierarchy that hides depth at the outer view and reveals it on demand. Tools that don't (early Blueprint, naive ComfyUI workflows) become illegible past workshop-demo scale.

## LLM flow tools — what's emerging

The youngest sub-category and the one most relevant to Jarvis. Patterns evolving fast; limitations documented in real time.

**ComfyUI** (2023+) is the surprise standard-bearer. Born for Stable Diffusion, its DAG-of-nodes felt familiar to VFX artists. Uses litegraph.js as editor library. 2025 brought **ComfyUI-R1**, a reasoning LLM that generates ComfyUI workflows from natural-language descriptions ([arxiv.org/html/2506.09790v1](https://arxiv.org/html/2506.09790v1)) — the first concrete demonstration that **LLMs can drive node graphs**, not just sit inside them.

What ComfyUI does well: typed (loosely) ports — LATENT, CONDITIONING, IMAGE, MODEL, CLIP have distinct colors; vast community custom-node library. Killer pattern: **per-node preview** — any intermediate node can be flagged to show its image output inline, turning the graph into a multi-stage debugging surface.

What ComfyUI does poorly: no sub-network encapsulation in the original (Group Nodes added later, bolted-on); no environment capture in shared workflows (JSON exports break across model versions, [numonic.ai](https://www.numonic.ai/blog/sharing-comfyui-workflows-team)); no multi-user; no native trace/replay; "data" is implicitly always tensors and the type system can't catch logical errors. **Comfy Deploy**, **ComfyGit**, **RunComfy** emerged in 2025 to package workflow + custom-nodes + checkpoints together.

**LangFlow / Flowise / Dify** (2023+) are LangChain/agent visual builders. LangFlow is most powerful (LangGraph multi-agent + custom Python components + interactive playground) but most complex. Flowise has friendliest UX but weakest logic control — basic If/Else only. Dify ships per-step timing, conversation logs, OpenTelemetry export, plus a Celery+Redis worker model for async-safe long flows ([elest.io](https://blog.elest.io/dify-vs-langflow-vs-flowise-which-open-source-llm-app-builder-actually-ships-to-production/), [zenml.io](https://www.zenml.io/blog/langflow-alternatives)).

Where they all fall short:
- **Type safety on connections is weak** — most ports are "the message" / "the context"; incompatible meanings (a tool result into a prompt template slot) often "work" but break at run time.
- **No native sub-graphs** matching Houdini's encapsulation — no real "Collapse to Subgraph"; LangFlow's "Chat" and "Agent" nodes are hand-crafted macros, not user-composable.
- **No spatial mini-map / search-by-name** as first-class. The Tab menu pattern is missing — users hunt through a left-sidebar palette.
- **Sharing is "export JSON, hope receiver has same custom nodes / API keys"** — same disease as ComfyUI.
- **Process trace is per-execution, not per-state-change** — "this run took 8s" but not "the LLM rewrote the prompt at step 4 because it judged intent ambiguous." LangSmith (separate) compensates.

Directional signal: LLM-flow tools sit at the *immature* end of the maturity spectrum. They have canvas-as-primary-surface; they're missing the L10 inter-view linking, L4 LOD hierarchy, L11 reasoning trace, and L12 versioning that VFX tools spent 25+ years building. Jarvis is positioned to leapfrog several gaps because its source model already supports the linkable views (artifact + edge + reasoning trace + cluster) — LLM-flow tools added a canvas on top of a flat chain abstraction.

## Top patterns extracted

- **Dive-in / dive-up Sub-network** — Where: Houdini, Nuke (Groups), Blender (Node Groups), Substance (sub-graphs). Mechanism: Collapse to Subnet → parent shows one icon; Enter to dive, U to exit. Why: hierarchical compression is the only known mitigation for visual O(n²). Caveat: nesting past 3 deep loses the user.
- **Tab-menu node create** — Where: Houdini, Blender, ComfyUI, React Flow. Mechanism: hover, press Tab, type, Enter. Why: keyboard-first creation is 5-10× faster than palette drag. Caveat: poor discoverability without paired visible palette.
- **Display-flag node-as-focus-anchor** — Where: Houdini SOPs (blue flag), Substance (output preview). Mechanism: a small clickable badge designates "this node drives the other views". Why: turns the network into a navigable filmstrip — walking the flag *is* debugging. Caveat: requires linked viewer panes.
- **Sticky note with zoom-aware text size** — Where: Houdini (extra-large mode), Blender (2025 frame label work). Mechanism: notes visible at full zoom-out as section headers like neighborhood signs. Why: semantic wayfinding at scale that a mini-map cannot provide. Caveat: authoring discipline required.
- **Named reroute (wireless connection)** — Where: Unreal 5.0+, ComfyUI Get/Set custom nodes, LabVIEW historically. Mechanism: two labeled endpoints share data without a visible line. Why: eliminates longest spaghetti wires; converts spatial routing to named lookup. Caveat: hides dataflow — overuse defeats the visual model.
- **Typed colored ports + provisional-wire validation** — Where: Maya, Houdini, Substance, Unreal, Rete.js. Mechanism: each type gets a stable color; dragged wires recolor red on incompatible target. Why: prevents errors before commit with zero added UI. Caveat: needs a real type system.
- **Mini-map with viewport rectangle** — Where: Houdini, React Flow, Foblex, Blender plugin, litegraph.js. Mechanism: shrunken redraw of full network with draggable box. Why: situational awareness at zero attention cost. Caveat: ~150-200 px is the sweet spot.
- **Per-node inline preview** — Where: ComfyUI (image), Houdini (geometry thumbnail), Substance (texture), n8n (data row). Mechanism: small viewport renders the node's output on the node. Why: compresses inspector + graph; visual scan of dataflow. Caveat: GPU/compute cost; usually toggleable.
- **Backdrop / frame with semantic color** — Where: every mature node tool. Mechanism: transparent labeled rectangle behind a group of related nodes. Why: visual chunking is preattentive; named regions are recognized faster than wire patterns. Caveat: authoring discipline required.

## Anti-patterns observed

- **Wall-of-spaghetti** — naive ComfyUI workflows or undisciplined Blueprints with hundreds of crossing wires. Cause: no sub-network discipline + no named reroute + no frames. Fix: enforce a "collapse threshold" — at 50 nodes a section *must* be subnetted or framed.
- **JSON-only sharing without environment** — ComfyUI, LangFlow, Flowise all suffer this. Cause: workflow file references custom-nodes / models by name, receiver has different installed versions. Fix: package environment alongside (Comfy Deploy pattern); pin custom-node versions in the workflow.
- **Auto-layout that destroys author intent** — n8n's aggressive left-to-right reflow on every node add is jarring for branchy DAGs; Houdini artists almost never use "Layout Selected" for the same reason. Fix: auto-layout on user request only; never silently reflow.
- **Loose-typed everything-is-context** — LangFlow / Flowise's port system can't catch most errors at edit time. Fix: type-tag every port, even at the cost of more bridge nodes (TouchDesigner trade-off).
- **No mini-map / no Tab menu** — surprisingly common in homemade tools (some LLM-flow MVPs). Cause: underestimating the cost of navigating at scale. Fix: ship both from day one even if the graph is initially small.

## Implications for Interactive Jarvis

1. **Add a `Subnetwork` artifact kind that collapses cluster-of-artifacts into one navigable container.** Maps to L1 + L4. Affects `electron/main/world-state.ts` (new `kind: 'subnetwork'`), `renderer/src/scene/Artifact.tsx` (collapsed-state icon + double-click to dive in), `renderer/src/store/` (camera-stack to remember dive history). Effort: **L** (2-3 weeks; camera-stack is the hard part). AR-readiness: **+** (dive-in/up is intrinsically anchor-friendly — diving switches the active anchor).
2. **Add a sticky-note / frame primitive with adjustable text size visible at zoom-out.** Maps to L1 + L6. Affects `renderer/src/scene/Artifact.tsx` (new render path for non-functional label artifacts) and `electron/main/world-state.ts` (new kind `'sticky'`). Effort: **S** (3-5 days). AR-readiness: **neutral**. Pairs with existing Cluster: cluster = Houdini network-box, sticky note = Houdini sticky note; both should ship.
3. **Build a Tab-menu / fuzzy node-create on the canvas.** Maps to L3 + L7. Affects `renderer/src/ui/InputBar.tsx` (lift to a floating canvas-anchored variant) and `renderer/src/scene/Canvas.tsx` (Tab key handler). Effort: **M** (1-2 weeks). AR-readiness: **+** (a floating hand-anchored menu generalizes from a Tab popup). **The single highest-leverage pattern to import from Houdini.**
4. **Promote the Layout-agent reasoning trace to a per-node "display flag" model.** Maps to L10 + L11. Affects `electron/main/agents/layout-agent.ts` (emit per-step focus events selecting an artifact), `renderer/src/scene/Canvas.tsx` (highlight the focused artifact like a Houdini display flag), `renderer/src/ui/LayoutActivityPanel.tsx` (clickable trace steps that move camera + flag). Effort: **M** (1 week; most plumbing exists). AR-readiness: **+** (a flag is a hand-grabbable anchor in AR).
5. **Type-tag artifact edges and recolor at edit time.** Maps to L9 + L2. Affects `electron/main/world-state.ts` (Edge already has `kind`; add color per kind) and `renderer/src/scene/Edge.tsx` (color bezier per kind, recolor red when dragging onto incompatible target). Effort: **S** (2-3 days; data model is already there). AR-readiness: **neutral**.
6. **Build a true mini-map pane in the corner with draggable viewport rectangle.** Maps to L3 + L4. Existing mini-map (per recent commits) should be reviewed against Houdini/React-Flow patterns. Affects `renderer/src/ui/Minimap.tsx` if extant. Effort: **S** if it exists, **M** if not. AR-readiness: **neutral** (in AR could hand-anchor to non-dominant palm).
7. **Per-artifact inline preview for chart/flow-panel artifact kinds (when those land).** Maps to L10 + L11 + L4. Affects future `renderer/src/scene/` panel renderers — design now so the panel renders compact preview on the artifact card and only expands on focus. Effort: **L** (paired with Concept-doc panel work). AR-readiness: **+** (compact preview saves polygon budget in VR).

## Open questions

1. **How does dive-in/dive-up map to a 3D spatial workspace?** Houdini's 2D canvas re-renders a different 2D canvas in the same pane on dive. In Jarvis 3D, what's the analogous transition — fly inside the Cluster bounding volume, open a portal, switch the scene root? Needs a prototype.
2. **Should named reroute (wireless connection) be a primitive in Jarvis?** Violates "see all relationships" but could answer long cross-canvas references. Untested.
3. **Can the Layout agent author Subnetwork containers itself — collapsing related artifacts when crowded?** Natural extension of single-call reorganize (commit `2804e71`). Needs containment-aware layout cost function.
4. **Can a "live trace" of agent work be encoded as Houdini-style cached node outputs — each agent step a node, output cached, user steps through?** WS-07 is the home for trace UI, but the *visual* answer might live here.
5. **AR/VR: do hand-anchored mini-maps work, or does hand jitter cause motion sickness?** No surveyed tool addresses this.

## References (full)

1. SideFX — Organizing, customizing, annotating nodes and networks. https://www.sidefx.com/docs/houdini/network/organize.html
2. SideFX — Networks and parameters. https://www.sidefx.com/docs/houdini/network/index.html
3. SideFX — Subnetwork SOP. https://www.sidefx.com/docs/houdini/nodes/sop/subnet.html
4. SideFX — Foundations 20.5: Nodes, Networks & Assets. https://www.sidefx.com/tutorials/foundations-205-nodes-networks-assets/
5. SideFX — Network editor shortcuts. https://www.sidefx.com/docs/houdini/network/shortcuts.html
6. SideFX — Edit an asset's user interface. https://www.sidefx.com/docs/houdini/assets/asset_ui.html
7. SideFX — Geometry Spreadsheet pane. https://www.sidefx.com/docs/houdini/ref/panes/geosheet.html
8. velozetetic — Houdini Sticky Note Editor (2025). https://velozetetic.com/2025/06/18/houdini-sticky-note-editor/
9. artivoxa — Version Control for Houdini Projects. https://www.artivoxa.com/version-control-for-houdini-projects-git-perforce-best-practices/
10. ArtStation / julianbragagna — Beginner's Guide to HDAs: Parameters. https://www.artstation.com/blogs/julianbragagna/yVO4/the-beginners-guide-to-hdas-parameters
11. Epic Games — Blueprint Best Practices. https://dev.epicgames.com/documentation/en-us/unreal-engine/blueprint-best-practices-in-unreal-engine
12. Laaksonen, LinkedIn — UE Blueprints in depth: Graphs, Functions, Macros. https://www.linkedin.com/pulse/ue-blueprints-depth-part-1-graphs-functions-macros-laaksonen
13. hojdee — Named Reroute Node in Unreal Engine. https://hojdee.com/named-reroute-node-in-unreal-engine-clean-up-material-graphs/
14. uhiyama-lab — 10 Techniques for Organizing Blueprint Graphs. https://uhiyama-lab.com/en/notes/ue/blueprint-spaghetti-code-prevention-techniques/
15. jdn.dev — Avoiding blueprint spaghetti. https://jdn.dev/avoiding-blueprint-spaghetti/
16. Blender Manual — Geometry Nodes. https://docs.blender.org/manual/en/latest/modeling/geometry_nodes/index.html
17. Blender Code — Geometry Nodes Workshop July 2025. https://code.blender.org/2025/07/geometry-nodes-workshop-july-2025/
18. Blender Code — Geometry Nodes Workshop September 2025. https://code.blender.org/2025/10/geometry-nodes-workshop-september-2025/
19. Blender Devtalk — Proposal: Addressing Geometry Nodes UX. https://devtalk.blender.org/t/proposal-addressing-geometry-nodes-ux-issues/23239
20. strike-digital — node_minimap. https://github.com/strike-digital/node_minimap
21. Comfy-Org — ComfyUI. https://github.com/Comfy-Org/ComfyUI
22. Comfy-Org — litegraph.js (Comfy fork). https://github.com/Comfy-Org/litegraph.js/
23. ComfyUI Docs — Share workflows. https://docs.comfy.org/cloud/share-workflow
24. Numonic — Sharing ComfyUI Workflows with Your Team. https://www.numonic.ai/blog/sharing-comfyui-workflows-team
25. ArXiv — ComfyUI-R1 (2025-06). https://arxiv.org/html/2506.09790v1
26. Derivative — TouchDesigner CHOP docs. https://docs.derivative.ca/CHOP
27. Derivative — CHOP to SOP. https://docs.derivative.ca/CHOP_to_SOP
28. Interactive & Immersive HQ — TouchDesigner's Data Model. https://interactiveimmersive.io/blog/touchdesigner-lessons/touchdesigners-data-model/
29. Foundry — Working with Nodes (Nuke). https://learn.foundry.com/nuke/content/getting_started/using_interface/working_nodes.html
30. Foundry — What's New in Nuke 16.0 (Feb 2025). https://learn.foundry.com/nuke/content/release_notes/nuke_16.0.html
31. Adobe — Substance 3D Designer: Graph parameters. https://helpx.adobe.com/substance-3d-designer/substance-compositing-graphs/graph-parameters.html
32. Adobe — Substance 3D Designer: Exposing a parameter. https://experienceleague.adobe.com/en/docs/substance-3d-designer/using/substance-graphs/manage-parameters/exposing-a-parameter
33. Adobe — Substance 3D Designer: Graph instances and subgraphs. https://helpx.adobe.com/substance-3d-designer/substance-compositing-graphs/creating-a-substance-compositing-graph/graph-instances-sub-graphs.html
34. Unity — Shader Graph. https://unity.com/features/shader-graph
35. Autodesk — Maya Node Editor connection colors. https://help.autodesk.com/cloudhelp/2015/ENU/MayaLT/files/Connection_colors_in_Node_Editor.htm
36. n8n Docs — Node UI design. https://docs.n8n.io/integrations/creating-nodes/plan/node-ui-design/
37. n8n.spot — n8n UI/UX Deep Dive. https://n8n.spot/n8n-ui-ux-deep-dive-how-thoughtful-design-streamlines-visual-automation/
38. DeepWiki / n8n-io — Workflow Canvas and Node Management. https://deepwiki.com/n8n-io/n8n/6.2-workflow-canvas-and-node-management
39. Node-RED Docs — Nodes. https://nodered.org/docs/user-guide/editor/workspace/nodes
40. ZenML — Langflow Alternatives. https://www.zenml.io/blog/langflow-alternatives
41. Elest.io — Dify vs Langflow vs Flowise. https://blog.elest.io/dify-vs-langflow-vs-flowise-which-open-source-llm-app-builder-actually-ships-to-production/
42. Leanware — LangFlow vs Flowise. https://www.leanware.co/insights/compare-langflow-vs-flowise
43. Notch — Working in Notch. https://www.notch.one/features/working-in-notch
44. React Flow — Node-Based UIs in React. https://reactflow.dev/
45. React Flow — MiniMap. https://reactflow.dev/api-reference/components/minimap
46. React Flow — Feature Overview. https://reactflow.dev/examples/overview
47. Velt — React Flow Guide (Oct 2025). https://velt.dev/blog/react-flow-guide-advanced-node-based-ui
48. NodeNetwork cookbook — Validation. https://wouterdek.me/NodeNetwork/cookbook/validation.html
49. xyflow — awesome-node-based-uis. https://github.com/xyflow/awesome-node-based-uis
50. Foblex — FMinimapComponent. https://flow.foblex.com/docs/f-minimap-component
51. Wikipedia — Pure Data. https://en.wikipedia.org/wiki/Pure_Data
