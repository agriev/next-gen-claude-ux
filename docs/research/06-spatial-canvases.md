# WS-06 — Spatial canvases & infinite whiteboards

**Scope:** Pure "canvas" products: infinite 2D whiteboards. We survey their shape/edge/frame primitives, camera & navigation, selection patterns, multi-user sync, and AI integration. Excludes node-graph editors (WS-09), PKM/graph tools (WS-05), and BI dashboards (WS-03). Focus on what the canvas category — as a distinct UI paradigm — has converged on, and what Interactive Jarvis should adopt before bolting on more agentic features.
**Date:** 2026-05-23
**Sources consulted:** 12 primary (vendor docs, official blogs, SDK references) + 14 supporting (third-party reviews, deep-dive articles, community discussions).

---

## Tools / sources surveyed

- **tldraw** [Tier B; open-source SDK + tldraw.com] — React infinite-canvas SDK with the cleanest shape/binding/frame model in the category. ShapeUtil abstraction, Frame vs Group split, arrow bindings, @tldraw/sync, Make Real / Agent Starter Kit. **Deeply analyzed.** ([SDK docs](https://tldraw.dev/), [Shape System](https://deepwiki.com/tldraw/tldraw/2.5-tools-and-interaction))
- **Excalidraw** [Tier B; open-source] — Hand-drawn aesthetic, two-canvas rendering, Element Binding System with bidirectional `boundElements`, E2E-encrypted sharing, public Libraries directory. **Deeply analyzed.** ([Element Binding](https://deepwiki.com/excalidraw/excalidraw/3.2-element-binding-system))
- **Miro** [Tier A; market leader] — Infinite canvas with frames as "sections", AI sticky-note clustering (keyword or sentiment), Talktrack async walkthroughs, viewport-aware rendering. **Deeply analyzed.** ([Miro AI sticky notes](https://help.miro.com/hc/en-us/articles/28781881506834-Miro-AI-with-Sticky-notes))
- **FigJam** [Tier A; Figma family] — Stamps, emotes, dot voting, timers, music player; playful facilitation on the Figma multiplayer engine. AI sticky summarization. ([FigJam sticky notes](https://www.figma.com/figjam/online-sticky-notes/))
- **Mural** [Tier B; facilitator-focused] — Bounded large canvas (not strictly infinite), strong Outline/Frames flow control, Private Mode, Facilitator Dashboard. ([Miro vs Mural](https://www.facilitator.school/blog/miro-vs-mural))
- **Apple Freeform** [Tier A; Apple HIG canvas] — Cross-Apple-device infinite canvas, up to 100 collaborators, Messages drag-to-invite, FaceTime in-app, Apple Pencil first-class. visionOS 26 SharePlay version is the canonical AR canvas reference. ([visionOS 26](https://www.apple.com/newsroom/2025/06/visionos-26-introduces-powerful-new-spatial-experiences-for-apple-vision-pro/))
- **Muse** [Tier B; defunct 2023, instructive] — iPad-first thinking canvas with gesture-heavy interactions. Wound down because gestures failed onboarding — critical anti-pattern source. ([retrospective](https://adamwiggins.com/muse-retrospective/))
- **Heptabase** [Tier B; PKM-canvas hybrid] — Cards-on-whiteboard where the same Card can appear on multiple Whiteboards without duplication. ([Heptabase](https://wiki.heptabase.com/roadmap))
- **Whimsical** [Tier B; templated diagrams] — Drag-and-drop with smart layout, templated flowcharts/mind-maps/wireframes. ([Whimsical](https://whimsical.com/))
- **Scapple** [Tier C; minimalist] — "Sheet of paper" mind-mapper; no central node, no template, every note equal. ([overview](https://www.literatureandlatte.com/scapple/overview))
- **Lucidchart** [Tier A; enterprise] — Shape-to-data linking with live Google Sheets/Excel/SQL feeds. ([data linking](https://www.lucidchart.com/pages/data-linking))
- **Figma + FigJam multiplayer engine** [Tier A; gold-standard sync] — Custom protocol (simpler than OT), Materializer reactive framework (March 2026), Eg-walker for Code Layers. ([multiplayer deep dive](https://sujeet.pro/articles/figma-multiplayer-infrastructure))

Supporting: Yjs, Liveblocks Yjs provider, Sketch canvas tech, Goodnotes Whiteboard, Velt/SuperViz SDKs.

---

## Feature table

| Tool        | Primitives (kinds) | Connector / edge types | Frame / group concept | Multi-user sync model | Infinite vs bounded | AI integration | Mobile / Desktop / Web |
|-------------|--------------------|------------------------|-----------------------|-----------------------|---------------------|----------------|-------------------------|
| **tldraw**  | geo (20 sub-shapes), draw, text, arrow, line, note, image, video, frame, group + custom ShapeUtil | Arrow with `isPrecise`/`isExact` binding to shape, `kind: 'arc' \| 'elbow' \| <line>`, orthogonal routing | Frame (visual container, **clips** children, has header) **vs** Group (logical only, no visuals; nestable) | @tldraw/sync (Cloudflare Durable Objects), or plug Yjs / Liveblocks / Replicache via public APIs | Infinite (camera (x,y,z); bounds-constrainable per app) | Make Real (UI → HTML/CSS), Agent Starter Kit (read shapes + screenshot + write back), tldraw.computer | Web + SDK (React); iPad PWA; no native AR yet |
| **Excalidraw** | rectangle, ellipse, diamond, line, arrow, freedraw, text, image, frame, embed | Linear (arrow/line) with `startBinding`/`endBinding`, `mode: "inside" \| "orbit"`, `fixedPoint [0..1]`; bidirectional `boundElements` | Frame (visual section); no proper group (use selection or library) | E2E-encrypted realtime (key in URL fragment), client-only logic | Infinite, single layer | Mermaid-to-Excalidraw, AI access controls per team (2026) | Web (PWA), iPad with Pencil, mobile tap-tolerant |
| **Miro**    | sticky, shape (15+), text, connector, frame, table, image, embed, mind-map node, card, widget (50+ via SDK) | Connector (straight/elbow/curve), with sticky-routing | Frame (sections for roadmap phases), groups | WebSocket OT/CRDT, viewport-aware rendering, presence + Talktrack | Infinite | AI cluster sticky notes by keyword or sentiment; summarize selection; doc generation | All three; iPad with trackpad gesture quirks |
| **FigJam**  | sticky, shape, connector, stamp, emote, text, drawing, table, widget (community) | Connector with routing, attaches to shapes | Section (FigJam's "frame"), grouping | Figma multiplayer engine (custom, simpler-than-OT), CRDT-ish | Infinite | AI sort/summarize stickies; integrated with Figma AI | Web, iPad, Figma desktop app |
| **Mural**   | sticky, shape, connector, icon, image, text, framework (template shape) | Connector with shape-edge attach | Frames + **Outline** (ordered sequential view of frames); Areas | WebSocket realtime; Private Mode (writes hidden until reveal), Participant Lock | **Bounded large canvas** (not strictly infinite) | AI summarization, idea cluster (newer) | Web, iPad with Pencil; native iOS facilitator app |
| **Freeform** | text, shape, sticky, drawing (Pencil), image, video, audio, file, link, table (visionOS 26), web preview | Connector (basic line); arrow drawing only — no auto-routing/binding | Implicit grouping by selection; no formal frame | iCloud sync (CloudKit), Messages drag-to-invite, FaceTime hand-off | Infinite (10%-400%) | None as of 2026 (Apple Intelligence likely later) | Mac / iPad / iPhone / **visionOS 26** with SharePlay |
| **Muse** (RIP) | card, ink, image, text, "corkboard" containers | Hand-drawn lines only | Containers (nestable boards) | Cloud sync (iCloud-based) | Infinite (per board), bounded board-of-boards | None | iPad + Mac only |
| **Heptabase** | Card (rich markdown), section, tag, whiteboard | Connector (basic), Card-to-Card | Section (visual container), Tag (cross-cutting) | Cloud sync with version history | Infinite per whiteboard; **Card lives in multiple whiteboards** | AI chat over notes, AI agent on roadmap (2026) | Mac / Win / iPad / Web |
| **Whimsical** | Flowchart, mind-map, wireframe, sticky-board, doc — each with templated primitives | Smart connector (auto-routes for flow & mind-map) | Per-template containers | Realtime cloud | Infinite per board | AI mind-map generator | Web + Mac/Win apps |
| **Scapple** | Note (text), background-shape | Connector (drag-from-note line) | None (deliberate) | Single-user; file-based (.scap) | Infinite | None | Mac, Win |
| **Lucidchart** | Shape (1000s in libraries), connector, text, image, container | Connector with routing, **data-linked** to live sheet rows | Container, swimlane, group | Realtime cloud + version history | Bounded by page or infinite mode | AI auto-diagram from data, prompt-to-diagram | Web + Mac/Win apps |
| **Figma** (design canvas, for contrast) | Frame, instance, component, group, vector, text, image, AutoLayout-frame, Variant set | Connector in FigJam; in Figma design proper, **none** — design files use containment not edges | **Frame** (resizable, AutoLayout-capable, clipping, constraints) **+** Component / Instance (reusable Frame) **+** Group (loose) | Custom multiplayer, **Materializer** reactive framework for derived subtrees (variants, AutoLayout, variables) | Infinite | Figma AI Assistant on the canvas; Code Layers (multiplayer code blocks) | Web + Mac/Win/Linux + iPad |

---

## Lens pass

### L1 — Spatial primitives

The canvas category has converged on a **5-tier primitive vocabulary** that tldraw articulates most cleanly:

1. **Shapes** — geo (rectangle, ellipse, diamond, star, triangle, etc.), draw (freehand), text, sticky, image/video/embed. tldraw's `geo` shape alone covers 20 sub-types under one ShapeUtil. ([Default shapes](https://tldraw.dev/sdk-features/default-shapes))
2. **Connectors / arrows** — first-class edges that bind to endpoint shapes. Two routing styles dominate: straight/Bézier (`arc`) and orthogonal/elbow.
3. **Frames** — *visual* containers with bounds, headers, optional fills, and **clipping**. Frames move children, export as a unit, double as "slides".
4. **Groups** — *logical* containers, no visuals. tldraw's `Group` is the only always-present core shape and exists purely so a selection becomes one selectable unit. ([Groups](https://tldraw.dev/sdk-features/groups))
5. **Bindings / relationships** — endpoint glue. Excalidraw's bidirectional `boundElements` + `startBinding`/`endBinding` with normalized `fixedPoint [0..1]` is the most documented schema. ([Element Binding](https://deepwiki.com/excalidraw/excalidraw/3.2-element-binding-system))

Lucidchart adds a sixth tier — **data-linked shapes** where text/color/state is bound to a live spreadsheet row — the closest the category gets to Jarvis's `spec → artifact` mapping. ([data linking](https://www.lucidchart.com/blog/make-your-diagrams-dynamic-with-data-linking))

Contrast: **Freeform has no formal frame**, only selection — workshop flows feel weaker there than in Miro/Mural. **Scapple has no frame, no group, no shape variation** — by design, forcing composition through proximity alone. The design space spans roughly two orders of magnitude in primitive richness.

### L2 — Data → form mapping

Mapping is almost always **explicit and user-driven** — no canvas tool picks the form for you. Exceptions:

- **Sticky → cluster** (Miro AI, FigJam AI): the *only* automated `data → form` move in the category. The system reads sticky text, clusters by keyword or sentiment, paints a coloured container. This is exactly what Jarvis's Layout agent does. ([Miro AI](https://help.miro.com/hc/en-us/articles/28781881506834-Miro-AI-with-Sticky-notes))
- **Spreadsheet row → shape props** (Lucidchart, Enterprise): row → shape, columns → fill/label/badge.
- **Mermaid → diagram** (Excalidraw, tldraw): single ingest point for structured input.
- **UI sketch → working HTML** (tldraw Make Real): *outbound* — canvas as input, app as output.

No canvas tool maps multiple data sources (time series, ontology, lineage) to differentiated primitives. That gap is the WS-03/WS-04/Jarvis opportunity.

### L3 — Camera & navigation

**Pan + zoom around the cursor** is the universal. tldraw codifies it as `(x, y, z)` where `z` = zoom factor; camera transforms screen ↔ page coords and supports programmatic animation. ([Camera](https://tldraw.dev/sdk-features/camera))

Consensus rules:

- **Zoom toward cursor**, not centre — convert mouse to world coords before and after scaling, offset so the point under the cursor stays put. ([zoom UI](https://www.steveruiz.me/posts/zoom-ui))
- **Scroll = pan; pinch / Cmd+scroll = zoom**, with per-tool `wheelBehavior: 'pan' | 'zoom' | 'none'`.
- **Zoom range** is 10%–400% in Freeform, 1%–800% in Miro/tldraw. Below ~25% labels drop; above ~200% strokes get the "draw mode" detail bump.
- **Camera constraints** — every infinite canvas SDK bounds the camera (presentation, fixed-extent app). tldraw's `cameraOptions.constraints` is the model. ([Camera options](https://tldraw.dev/examples/camera-options))
- **Fit-to-selection / fit-to-content** is the universal panic button (Cmd+0, Shift+1, double-click empty).
- **Minimap** is standard in Miro/Mural/Lucidchart/Heptabase, opt-in in tldraw, absent in Freeform/Scapple.
- **Named viewpoints / bookmarks** = Miro Frames-as-slides, Mural Outline, Figma Sections.

Multi-dashboard handling: only Mural's **Outline** treats frames as an ordered sequence the camera flows through. Everyone else lets you bookmark / "zoom to frame" individually.

### L4 — Level of Detail (LOD)

Canvas tools handle LOD with a layered toolbox:

- **Viewport culling** — `display: none` on shapes outside the visible rect; spatial index tracks visibility. A canvas with 10k shapes might render 50. ([tldraw performance](https://tldraw.dev/sdk-features/performance))
- **Style downgrade at zoom-out** — hide box shadows on stickies, switch freehand "draw" style to plain stroke, hatch fills to solid, drop text-shadow outlines.
- **Text-on-demand** — Goodnotes Whiteboard renders cards without text on load, generates per-frame as it enters the readable LOD zone. ([Goodnotes](https://www.goodnotes.com/blog/building-whiteboard-infinite-canvas))
- **Two-canvas split** — Excalidraw: StaticCanvas for drawing + InteractiveCanvas overlay for handles/cursors; static one redraws only on shape change.
- **Sticky clustering at zoom-out** (Miro AI) — at very low zoom, stickies become a coloured cloud labelled with the cluster summary.

Practical ceiling: ~50k items with WebGL + culling + 3 LOD states before jank. ([PixiJS benchmark](https://alanscodelog.github.io/blog/performant-pixi-infinite-canvas/)) Tools hitting 60fps with 100k+ objects all use GPU rendering (Sketch, Figma, Miro).

### L5 — Anchoring (AR/VR-specific)

Mostly **N/A — these are 2D canvases on glass screens**. Implicit anchoring is "canvas = world; screen = viewport".

AR-relevant exceptions:

- **Apple Freeform on visionOS 26** — canvas as a flat surface in 3D space, world-anchored by default, with SharePlay letting co-located users see each other's pointers on the same surface. Logitech Muse stylus draws as if it were a physical whiteboard. ([visionOS 26](https://www.apple.com/newsroom/2025/06/visionos-26-introduces-powerful-new-spatial-experiences-for-apple-vision-pro/)) Canonical reference: world-anchored, not desk/hand.
- **Mural / Miro on Vision Pro** (Mac Virtual Display or native ports) — same flat plane, no depth use, head-comfortable distance.

The category has not figured out **3D extensions of the canvas itself** — frames-stacked-in-z, parallax layers, perspective. Every AR port flattens to a plane.

### L6 — Labels & legends

Always-on labels are the default (sticky text, shape labels, connector labels). Hover-only is rare (more BI-flavoured).

Distance behaviour:

- Below ~33% zoom most tools drop sticky inner text, show only colour + bounding box.
- Frame **headers** persist longer than frame **contents** (Miro, tldraw, Figma) — so you can navigate low-zoom by reading section names.
- Connector labels vanish around the stroke-width-sub-pixel threshold.

There is no canvas tool with **voice-spoken labels on focus** — clear Jarvis opportunity for the AR future.

### L7 — Selection & group operations

The lens with the most converged design:

- **Single click** = select shape.
- **Click-on-group** = first click selects group, double-click descends (tldraw, Figma).
- **Marquee (rect drag on empty)** = box-select; tldraw exposes enclosed-only vs intersected. ([Lasso example](https://tldraw.dev/examples/lasso-select-tool))
- **Lasso** = freehand path; **only shapes fully enclosed** are selected. Canvas standard.
- **Click-through-frame** = frame border selects frame; child click selects child even inside a clipped frame.
- **Shift-click** adds, **Alt-click** subtracts.
- **Cmd+A** in a frame selects children; on empty canvas selects viewport contents.
- **Type-filter** is rare (Miro "Select all stickies", Lucidchart Find/select-by-type).
- **Saved selections** are essentially absent — Figma "Selection Colors" is the closest.

Multi-selection ops are uniform: move, rotate, scale, recolor, group/ungroup, align, distribute, **tidy-up** (auto-grid; tldraw + Heptabase), copy, delete, lock. **Miro's "frame the selection" (wrap with frame)** is a Jarvis-relevant move.

### L8 — Attention flow

Canvas tools lean **pull-not-push**:

- **Live cursors** with username labels = ambient awareness (all multi-user canvases).
- **Viewport-follow** ("follow @alice") = sticky camera-sync to a user (Miro, FigJam, Mural; tldraw via sync engine).
- **Cursor chat** (tldraw, FigJam) — type into your cursor, others see a bubble. Lowest-friction inline comment.
- **Comments / @mentions** = pull signal in a sidebar; dot pulses on the shape.
- **Stamps / emotes** (FigJam, Mural) = ephemeral push, fade after seconds.
- **Voting** (Miro, Mural, FigJam) = batched push, count revealed after timer.
- **Talktrack** (Miro) = recorded audio walkthrough pinned to a region — async, prototype for Jarvis's reasoning-trace audio mode.
- **Toast / banner** = system events only (sync lost, board saved). Never for content.

**No canvas tool has a "look at this now" beam** — an arrow from your cursor to the change you made, fading after a second. Worth prototyping for the AR pass.

### L9 — Color system

Color is used **categorical / semantic only**, applied by users, not the system:

- **Sticky color** = team-agreed taxonomy (pink = blocker, yellow = idea, blue = decision). Miro AI sentiment uses red/grey/green for neg/neutral/pos.
- **Frame color** = phase / swim-lane.
- **Connector color** = relationship kind (arbitrary).
- **Design fill** (Figma) = design-system tokens.

**No ordinal scale (confidence), no quantitative scale (magnitude), no lifecycle/state scale** in any pure canvas tool. Lucidchart's data-linked shapes can express ordinal/quantitative via external rules, but it's user-configured. Colorblind-safety is mostly missing — only Mural and Lucidchart document colorblind presets.

Huge gap relative to BI/Tableau (WS-03); Jarvis's 4-edge-kind + cluster-color model is already further along.

### L10 — Inter-view linking

Largely **N/A — canvas tools are one big view**. The viewport is not a separately-bound dataset; brushing doesn't apply.

Partial exceptions:

- **Frames-as-slides** (Miro, FigJam, Freeform): each frame is a "view" the camera animates to. No data linking.
- **Multi-board navigation** (Heptabase, Muse) — a card can appear on multiple boards; selecting on board A reflects on board B. Closest to inter-view linking.
- **Lucidchart data-linked shapes** — change source spreadsheet, every dependent diagram updates. Real linking, unidirectional.

Jarvis's `kind: panel` future is exactly where this matters — a chart panel needs brushing/cross-filter; no canvas precedent to copy. BI dashboards (WS-03) are the precedent.

### L11 — Process / reasoning representation

Almost N/A for traditional canvas tools — they have **no process**, only placed shapes.

AI-augmented cases are interesting:

- **tldraw Agent Starter Kit / tldraw.computer** — agent has a side chat panel; reasoning + tool calls stream. Agent reads canvas + screenshot, issues edit commands the user watches happen shape-by-shape. ([AI](https://tldraw.dev/docs/ai), [Agent Starter](https://tldraw.dev/starter-kits/agent))
- **Make Real** — iterative: draw → click → preview → mark-up the preview → click again. The process *is* the back-and-forth on the canvas. ([Make Real](https://tldraw.dev/blog/make-real-the-story-so-far))
- **Miro AI / FigJam AI** — clustering and summarization as batch ops; spinner appears, results land. No streaming reasoning.

No canvas tool visualises **multi-agent collaboration**, **tool-call trees**, or **ghost-preview of pending ops** as first-class spatial elements. Wide-open design space, important for Jarvis.

### L12 — Multi-user, sharing, persistence

The defining lens — what separates a "drawing app" from a "whiteboard". Three patterns:

1. **CRDT-based (Yjs et al)** — concurrent edits compose without central authority. tldraw exposes its store on public APIs so you can swap Yjs/Replicache/Liveblocks as transport. ([tldraw sync](https://tldraw.dev/blog/announcing-tldraw-sync)) Liveblocks ships a Yjs provider with presence/cursor/awareness primitives. ([@liveblocks/yjs](https://www.npmjs.com/package/@liveblocks/yjs))
2. **Custom OT-flavoured engine** — Figma's choice. Simpler than full OT, server-authoritative, optimized for deeply-nested frame/component trees. March-2026 **Materializer** reactive framework powers derived subtrees (variants, AutoLayout, variables). ([multiplayer](https://sujeet.pro/articles/figma-multiplayer-infrastructure)) Code Layers uses **Eg-walker** text-CRDT.
3. **iCloud / shared file** — Freeform, Apple Notes. Per-element last-writer-wins. Works at "100 collaborators", not 10k.

Presence + cursors + viewport-follow + cursor-chat is the universal collab surface. Persistence: cloud-first, optional self-hosted (tldraw, Excalidraw OSS). Export: PNG/SVG/PDF universal; tldraw/Figma also JSON. E2E encryption is rare — Excalidraw is the standout (key in URL fragment). On visionOS, SharePlay carries the cursor/pointer model into 3D space so co-located VR users see each other's gaze + hand pointers on the shared canvas plane.

---

## What canvas tools got right that Jarvis should adopt

1. **Frame vs Group split (visual vs logical container).** tldraw: Frame = visual, clipping, has header, exportable; Group = invisible, just makes a selection one selectable thing. Covers ~90% of organizational needs with two primitives. Jarvis's `cluster` is a Frame; we have no Group. A logical group lets the Layout agent compose related artifacts without painting a translucent region.
2. **Binding endpoints with `mode` + `fixedPoint`.** Excalidraw and tldraw both store endpoints as `{ targetId, mode: 'orbit' | 'inside', fixedPoint: [0..1, 0..1] }`. When the target moves/resizes, the edge follows; the endpoint stays anchored to the right relative spot. Jarvis edges currently track artifacts but not endpoint geometry.
3. **Camera as a programmable subsystem with constraints.** tldraw treats the camera as an `(x, y, z)` reactive atom you can animate, constrain, lock. User gets predictable zoom-to-cursor; agent gets `editor.zoomToBounds(...)` for "focus this cluster". Abstracting Jarvis OrbitControls to a `CameraController` (orbit/fly/teleport-AR) is on the master plan and tldraw is the reference.
4. **LOD via style downgrade, not just culling.** Every serious canvas tool changes *what* is drawn at low zoom (drop shadows, hatch fills, freehand → stroke, sticky-text → solid color), not only *whether*. At 10k+ artifacts Jarvis will need this — per-artifact `lodLevel(distance) → 'full' | 'simplified' | 'icon' | 'dot'`.
5. **Sticky clustering as the prototype for Layout-agent UX.** Miro AI's "cluster these by keyword or sentiment" is exactly the mental model Jarvis already implements with `apply_layout_plan`. Adopt the UX: toolbar button, spinner, fade-in animation as clusters form, `#uncategorized` zone for misfits. Engine exists; copy Miro's wrapper. ([Miro Clustering](https://help.miro.com/hc/en-us/articles/4409706795410-Clustering))
6. **Cursor chat / Talktrack for ambient agent awareness.** tldraw/FigJam cursor-chat (type into cursor → bubble) and Miro Talktrack (audio pinned to a region) surface activity without interrupting. For Jarvis: an "agent cursor" typing intent (`"reorganizing cluster A"`, `"naming 14 artifacts"`) is the lowest-cost agent-presence primitive.
7. **Frames-as-slides for guided narration.** Miro/FigJam Present mode turns frames into an ordered slide deck the camera flows through. For Jarvis: same primitive as bookmarked Views but ordered — capture "the walkthrough of this research" once, replay. Add `View.sequenceIndex` and a Present mode.
8. **Make Real loop: canvas → preview → mark up preview → re-generate.** Killer pattern: the canvas hosts both spec and result, user annotates the result *on the same canvas* to iterate. For Jarvis: when Worker produces an artifact, drop it next to source plates, let user lasso + annotate + "do it again with this change". Ingredients exist; the loop needs explicit UX framing.

---

## Anti-patterns observed

- **Gesture-heavy onboarding (Muse).** Stylus-angle tool switching, three-finger menu taps — tested well in lab, failed in the wild because new users couldn't infer. Every gesture needs a discoverable fallback before launch. ([Muse retro](https://adamwiggins.com/muse-retrospective/))
- **"Just infinite canvas" with no structure.** Freeform/Scapple drop you on a blank plane; users without an internalised meta-structure get lost. Frames + Outline mode are what make Miro/Mural useable for newcomers.
- **Modal pan vs select (Hand-tool toggle).** Excalidraw still has a separate Hand mode; users get stuck in it silently. tldraw/Figma make spacebar-hold or middle-mouse universal pan and never sticky. ([Excalidraw issue #7009](https://github.com/excalidraw/excalidraw/issues/7009))
- **Sticky-color = team convention with no system support.** Pink-means-blocker only works if everyone agrees. New joiners spend weeks decoding. Either systematise with legends or let users customise per board.
- **Bounded canvas misrepresented as infinite (Mural).** Mural's bounded canvas is invisible until users hit the edge mid-workshop. Either be infinite, or expose constraints visibly.

---

## Implications for Interactive Jarvis

1. **Add a logical Group primitive distinct from Cluster.** L1, L7. File: `electron/main/world-state.ts` — new `kind: 'group'` with `members[]`, no renderer. Cluster stays for visual frames. UI hook in `renderer/src/components/Inspector.tsx`. Effort: **S**. AR-readiness: **+**.
2. **Promote edge endpoints from `targetId` to `{targetId, fixedPoint: [u,v]}`.** L1, L2. Files: `electron/main/world-state.ts` Edge schema + `renderer/src/scene/BezierEdge.tsx`. Existing edges migrate to `[0.5, 0.5]`. Effort: **M**. AR-readiness: **neutral**.
3. **Abstract OrbitControls behind `CameraController` with constraints.** L3, L5. Files: new `renderer/src/scene/CameraController.ts`, refactor `renderer/src/scene/CanvasRoot.tsx`. Lifted from tldraw. Required for AR migration. Effort: **M**. AR-readiness: **+++** (single biggest unlock).
4. **LOD policy with 3 states per artifact (`full | simplified | dot`).** L4, L6. File: new `renderer/src/scene/lod.ts`, hook into `Artifact.tsx`. Trigger by distance + screen size + `--max-rendered` setting. Effort: **M**. AR-readiness: **+**.
5. **"Cluster these" toolbar action on current selection.** L7, L11. Files: `renderer/src/components/Toolbar.tsx` → existing `electron/main/agents/layout/`. Miro UX: selection → spinner → fade-in. Effort: **S**. AR-readiness: **neutral**.
6. **Agent cursor with intent bubble.** L8, L11. File: new `renderer/src/scene/AgentCursor.tsx`. Labelled cursor in world space at cluster being worked on; label updates as agent narrates. Copies tldraw cursor-chat. Effort: **S**. AR-readiness: **+++** (in AR becomes canonical "where is the agent" indicator).
7. **Frames-as-slides via ordered Views.** L3, L11. Files: `renderer/src/state/views.ts` (add `View.sequenceIndex?`); new `renderer/src/components/PresentBar.tsx`. Camera flies between views with easing. Effort: **M**. AR-readiness: **+** (translates to gaze-and-teleport).
8. **Document Frame vs Cluster vs Group in `docs/MODEL.md`.** L1. Cluster = current translucent region (Frame-equivalent); Group = new logical container; Frame is reserved for future `kind: 'panel'` (rectangular dashboard surface). Effort: **S**. AR-readiness: **neutral**.

---

## Open questions

- **Do we want endpoint binding at the level of the connector's *visual* tip, or at the abstract "this edge connects A to B" level?** tldraw and Excalidraw diverge here — tldraw's arrow is one shape with two binding records; Excalidraw's arrow is a linear element with `boundElements` declared on the targets. Which matches Jarvis's existing edge model best?
- **Should clusters have headers and be exportable as a unit, like tldraw frames?** Currently they are translucent regions with a label inside. Promoting them to "framed regions with a header bar" makes them more navigable but changes the visual language.
- **What is the Jarvis equivalent of Miro's Talktrack — recorded reasoning attached to a region of canvas?** With Listening agent already in place, this is mostly a UX wrapping question.
- **How do we treat the "same artifact on multiple boards" (Heptabase pattern) given Jarvis is single-canvas today?** This is the entry point for the multi-board / multi-workspace future and needs an explicit decision before implementation.
- **Is there a colorblind-safe default palette policy we should adopt now,** before we add more semantic colours? Mural's palette is the closest documented reference.

---

## References (full)

1. tldraw — Default shapes. https://tldraw.dev/sdk-features/default-shapes
2. tldraw — Groups. https://tldraw.dev/sdk-features/groups
3. tldraw — TLFrameShape. https://tldraw.dev/reference/tlschema/TLFrameShape
4. tldraw — Camera system. https://tldraw.dev/sdk-features/camera
5. tldraw — Camera options. https://tldraw.dev/examples/camera-options
6. tldraw — Performance. https://tldraw.dev/sdk-features/performance
7. tldraw — Arrow binding options. https://tldraw.dev/examples/arrow-binding-options
8. tldraw — Lasso select tool. https://tldraw.dev/examples/lasso-select-tool
9. tldraw — AI integrations. https://tldraw.dev/docs/ai
10. tldraw — Agent starter kit. https://tldraw.dev/starter-kits/agent
11. tldraw — Make Real, the story so far. https://tldraw.dev/blog/make-real-the-story-so-far
12. tldraw — Announcing tldraw sync. https://tldraw.dev/blog/announcing-tldraw-sync
13. tldraw Shape System (DeepWiki). https://deepwiki.com/tldraw/tldraw/2.5-tools-and-interaction
14. tldraw Shape Rendering and Culling (DeepWiki). https://deepwiki.com/tldraw/tldraw/3.4-shape-rendering-and-culling
15. tldraw GitHub. https://github.com/tldraw/tldraw
16. Steve Ruiz — Creating a Zoom UI. https://www.steveruiz.me/posts/zoom-ui
17. Excalidraw — Element Binding System (DeepWiki). https://deepwiki.com/excalidraw/excalidraw/3.2-element-binding-system
18. Excalidraw — Canvas Rendering Pipeline (DeepWiki). https://deepwiki.com/excalidraw/excalidraw/5.1-canvas-rendering-pipeline
19. Excalidraw+ Plus. https://plus.excalidraw.com/plus
20. Excalidraw Libraries directory. https://libraries.excalidraw.com/
21. Excalidraw — Merge Hand mode (issue #7009). https://github.com/excalidraw/excalidraw/issues/7009
22. Miro — AI with Sticky notes. https://help.miro.com/hc/en-us/articles/28781881506834-Miro-AI-with-Sticky-notes
23. Miro — Clustering. https://help.miro.com/hc/en-us/articles/4409706795410-Clustering
24. Miro vs Mural (Facilitator School). https://www.facilitator.school/blog/miro-vs-mural
25. FigJam — Sticky notes. https://www.figma.com/figjam/online-sticky-notes/
26. Figma — Guide to auto layout. https://help.figma.com/hc/en-us/articles/360040451373-Guide-to-auto-layout
27. Figma multiplayer infrastructure (Sujeet Jaiswal). https://sujeet.pro/articles/figma-multiplayer-infrastructure
28. Figma — Building Code Layers. https://www.figma.com/blog/building-figmas-code-layers/
29. Apple — Freeform launch. https://www.apple.com/newsroom/2022/12/apple-launches-freeform-a-powerful-new-app-designed-for-creative-collaboration/
30. Apple — visionOS 26. https://www.apple.com/newsroom/2025/06/visionos-26-introduces-powerful-new-spatial-experiences-for-apple-vision-pro/
31. Adam Wiggins — Muse retrospective. https://adamwiggins.com/muse-retrospective/
32. Heptabase Public Roadmap. https://wiki.heptabase.com/roadmap
33. Whimsical — Diagrams. https://whimsical.com/diagrams
34. Scapple overview (Literature & Latte). https://www.literatureandlatte.com/scapple/overview
35. Lucidchart — Data linking. https://www.lucidchart.com/pages/data-linking
36. Lucidchart — Dynamic diagrams blog. https://www.lucidchart.com/blog/make-your-diagrams-dynamic-with-data-linking
37. Yjs — Awareness & Presence. https://docs.yjs.dev/getting-started/adding-awareness
38. Liveblocks Yjs provider. https://www.npmjs.com/package/@liveblocks/yjs
39. Alan's Code Log — Performant Pixi canvas. https://alanscodelog.github.io/blog/performant-pixi-infinite-canvas/
40. Sketch — Canvas tech deep dive. https://www.sketch.com/blog/canvas-tech/
41. Goodnotes — Building Whiteboard Infinite Canvas. https://www.goodnotes.com/blog/building-whiteboard-infinite-canvas
