# WS-11 — Novel & historical interface concepts

**Scope:** Surveys what interface-design thinkers predicted or proposed decades ago, and asks which of those ideas are NOW technically feasible because of LLMs + AR/VR + spatial computing. This is a futures-thinking workstream. Excludes contemporary production tools (covered by WS-03..WS-10) and academic perception research (WS-01). Includes Tier-C design fiction (Knowledge Navigator, Iron Man) read as serious design briefs.
**Date:** 2026-05-23
**Sources consulted:** 14 primary + 12 supporting

## Tools / sources surveyed

**Tier A (deep)**
- **Vannevar Bush — "As We May Think"** (1945, *The Atlantic*) [1]. **Memex** = microfilm workstation with named, shareable **associative trails**. Foundational for hypertext, knowledge graphs, and personal-research tooling.
- **Doug Engelbart — "Augmenting Human Intellect"** (1962) + **Mother of All Demos** (Dec 9, 1968) [2][3]. Introduced mouse, structured editing, hypertext links, video-conferencing, real-time collaborative editing, and **true transclusion**. Framed as **H-LAM/T** — explicitly sociotechnical.
- **Ted Nelson — Project Xanadu + Computer Lib/Dream Machines** (1965+, 1974) [4][5]. **Transclusion** (reference, no copy), bidirectional links, **parallel text** (transpointing windows showing source + reuses), permanent versioning. The web's road-not-taken.
- **Alan Kay — "Personal Computer for Children of All Ages"** (1972) + **"Personal Dynamic Media"** (Kay & Goldberg 1977) [6][7]. **Dynabook** as portable composition device; Smalltalk-80's everything-is-an-object + late-binding makes the dynamic medium possible. Users must be able to program their medium.
- **Bret Victor — Magic Ink** (2006) [8], **Up and Down the Ladder of Abstraction** (2011) [9], **Inventing on Principle** (CUSEC 2012) [10], **Dynamicland** (2017–present) [11][12]. Principle: "creators need an immediate connection to what they're creating." Magic Ink: most software is information-software, interactivity is last resort. Ladder coined "explorable explanations." Dynamicland: room as computer.
- **Andy Matuschak — Evergreen notes & mnemonic medium** ([13][14]; 5-year reflection 2024). **Evergreen notes** = atomic, concept-oriented, densely linked, rewritten; **mnemonic medium** weaves spaced-repetition into prose. Externalizes working memory across small addressable units.
- **Mark Weiser — "The Computer for the 21st Century"** (*Scientific American*, Sep 1991) [15]. **Ubiquitous computing** = "third wave" after mainframes and PCs; **calm technology** moves between center and periphery.

**Tier B (concept videos & systems)**
- **Apple Knowledge Navigator** (1987, Hugh Dubberly for John Sculley) [16][17]. 6-min video of a tablet-AI agent that books meetings, searches papers, runs video calls in 2011. Anticipated Siri, iPad, FaceTime; LLM era makes it shippable.
- **Microsoft Office Labs Productivity Future Vision** (2008/2009/2011) [18][19]. Multi-touch translucent panels, AR overlays on buildings, gesture rerouting. Most concepts hardware-feasible; the missing piece was the agent.
- **HyperCard** (Atkinson, Apple, 1987) [20][21]. Card stacks + HyperTalk; "web before the Web"; inspired HTTP and JavaScript. Died because it missed the network turn. Lesson: programmability for non-programmers + centralization risk.
- **MIT Media Lab augmented reading** (WordSense; AR-PaperSync; Rekimoto's "Augment-able reality" 1995) [22][23][24]. Holographic glosses on physical text; AR overlay on printed papers; situated annotation.
- **Bruno Latour / actor-network theory** [25]. **Quasi-objects** with shifting agency; non-human actors as first-class network participants. Relevant for treating *agents* as first-class spatial citizens.

**Tier C (design fiction, retrospective)**
- **John Underkoffler / Oblong — g-speak, Minority Report, JARVIS** [26][27]. Designed Minority Report (2002) and Iron Man (2008) UIs; founded Oblong; built Mezzanine. Influence on Vision Pro gestures.
- **Hugh Dubberly** — Knowledge Navigator; later wrote interaction-design histories tracing the Bush → Engelbart → Kay → Nelson lineage [16].
- **David Holz / Magic Leap thought-leadership** 2014–2018 — "magicverse" pitch (room-scale persistent AR). Consumer pitch failed; spatial vocabulary survives.

## Lens pass

### L1 — Spatial primitives

Historical thinkers anticipated most of Jarvis's primitives, in different vocabulary:

- **Bush's Memex** = artifact (microfilm item) + edge (named link) + **trail** (ordered, named, *shareable* path). The trail is the missing primitive in modern hypertext — the WWW collapsed Bush's named, replayable trails into the back-button.
- **Engelbart's NLS** = structured artifact + **viewspec** (declarative view config) + link + transclusion (live embed). Viewspec is a per-user, per-task LOD policy.
- **Nelson's Xanadu** = artifact + bidirectional link + transclusion (reference-not-copy) + **parallel text** (transpointing windows with ribbons showing every shared span). The *visual representation of the relationship* is first-class.
- **Kay's Dynabook + Smalltalk** = artifact-as-live-object; the primitive is the **active object** (inspect, modify, re-run in place).
- **Victor's Dynamicland** = physical paper (dot-code) + projection + room-volume address space. Anchor = world, always.
- **Weiser's ubicomp**: three scales — tab (inch) / pad (foot) / board (yard) — at three anchor depths.

Extract for Jarvis: (a) **named trail** as a first-class navigable artifact, (b) **viewspec** as a saveable, sharable filter+layout combo, (c) **parallel-text ribbons** for derives/references between long-form artifacts.

### L2 — Data → form mapping

Bush, Engelbart, Nelson, and Kay all resisted "one form per data type":

- Bush: item → microfilm card; the *trail* is the form for relationships.
- Engelbart: a paragraph is outline node + link target + transclusion source. Same data, multiple viewspecs; user picks the form.
- Nelson: text renders local, transcluded in-place, or in parallel windows. Three forms, one data structure.
- Kay: every media object is a live, self-rendering program with an inspector.
- Victor *Magic Ink*: most software shouldn't be interactive at all — design the *graphic* first; interactivity is last resort. `query → information graphic` should be context-aware, not menu-driven.
- Matuschak: the **evergreen note** is an opinionated form (title-as-claim, atomic, densely linked, often transcluded). The form *coerces* the data toward concept-orientation.

Lesson: **don't fix the form; fix the operations, let the form be selected per-task.** Jarvis has artifact + spec + body — it can grow viewspec selection (matrix vs graph vs timeline) as a per-cluster affordance.

### L3 — Camera & navigation

These sources pre-date 3D-scene cameras; navigation means moving through an information space:

- Bush: **associative jumping** along a trail (named random-access).
- Engelbart: **view-of-view** — jump-link, outline collapse/expand, viewspec switch are three orthogonal navigations on the same data. Anticipated pivot / drill-down / linked-view by 25 years.
- Nelson: **transpointing windows** — scrolling document A auto-moves document B so shared spans align. Camera linked across documents by content alignment, not joystick.
- Kay's Smalltalk Browser: **navigation = chase the reference** (click class name to land in source); implicit camera follows curiosity.
- Weiser: walk through a room that is the interface; no camera, only proximity.
- Dynamicland: pick up a page and move it; the page is the camera, the table arrangement is the layout.

For Jarvis: borrow Nelson's content-aligned cross-pane scrolling (linked-view brushing), Engelbart's saveable viewspecs, Bush's named trails as bookmarks.

### L4 — Level of Detail (LOD)

Scale was modest but the *seeds* are there:

- Engelbart's NLS: collapse any outline subtree to a one-line summary — hand-rolled semantic LOD.
- Kay's Smalltalk: click an object to drill icon → summary → source. Depth = meaning, not pixels.
- Bush's trails imply a summary-of-trail view (annotating connections, not just walking them).
- Victor's Ladder of Abstraction makes LOD the *subject* — same system at concrete, parameterized, pattern levels, with sliders. **Viewer-controlled LOD over an abstraction axis**, not distance.
- Matuschak's evergreen notes LOD via title → claim → full note → link forest.
- Dynamicland: physical scale (sheet / poster / wall) is LOD.

Contribution: **LOD-along-meaning**, not LOD-along-distance. Jarvis should expose LOD chips like {claim, summary, body, linked} per artifact, not just pixel-distance fade.

### L5 — Anchoring (AR/VR-specific)

Sources predate AR/VR but their *implicit anchoring* is striking:

- Bush's Memex: **desk-anchored** (a piece of furniture).
- Engelbart's NLS: **screen-anchored** (single CRT, shared remotely).
- Nelson's Xanadu: **abstract / world-coordinate** — every span has a universal address (the "tumbler"); transclusion location is irrelevant.
- Kay's Dynabook: **hand-anchored** (a notebook you carry).
- Weiser's ubicomp: **all four anchors at three scales** — tab (hand) / pad (desk) / board (wall) [15]. Canonical anchor template.
- Dynamicland: **world-anchored on the room**, table as desk sub-region; no HMD.
- Knowledge Navigator: **head/hand hybrid** (tablet HUD); voice anywhere.

Lesson: **anchor per-artifact by duration and intimacy.** Commit → world; inspect → hand/desk; status → head. Weiser designed for this 35 years ago.

### L6 — Labels & legends

- Bush: trails labeled by typed name; retrieved by keying the name.
- Engelbart's NLS: per-statement IDs (auto-hierarchical) plus user labels; viewspec controls which render.
- Nelson: labels live in the *connector* (colored ribbon), not the node.
- Magic Ink: most labels should be *eliminated* by good context-sensitive graphics.
- Knowledge Navigator: agent speaks labels on focus (voice-on-attend, not always-on).
- Dynamicland: labels printed on paper; projector adds dynamic glyphs around them.

Synthesis: **physical/long-lived → printed; dynamic/contextual → spoken or projected on focus**. Jarvis: persistent compact label + voice-speak-on-focus in voice mode (the AR-era "agent narrates as you look").

### L7 — Selection & group operations

Under-explored historically but two seeds:

- Engelbart's NLS: **structural selection** (select paragraph = select all descendants); type-aware, rare in modern PKM.
- Smalltalk: select the *running object*, not text; operations are methods on the live object.
- Bush's trail-naming = **saved selection of pointers**.
- Dynamicland: gather pages physically on the table.

Revive **structural selection** (artifact → its derives-descendants by default, modifier inverts) and **saved selection = named cluster** across sessions.

### L8 — Attention flow

Weiser is canonical: **calm technology** moves between center and periphery [15]:

1. **Periphery holds most info.** Center is rationed.
2. **Periphery is *attendable* on demand** without explicit interaction — a glance suffices.

Dynamicland enforces this: floor, table, walls show low-priority status; you walk to look. No notification badges. Knowledge Navigator does it via *voice* — the agent narrates as it works.

Jarvis: peripheral status zone per panel; voice narration during agent work; suppress push interrupts unless they encode the agent's *blocking question*. Three tiers (center / focal-periphery / ambient-periphery) per artifact.

### L9 — Color system

Mostly monochrome sources (microfilm, CRT, paper); contribution is conceptual:

- Nelson: **color encodes transclusion relationship** — each shared span gets a persistent hue across documents. Color as *cross-view linking*, not categorical channel.
- Kay's Smalltalk-80: sparing, mostly mode-distinguishing.
- Knowledge Navigator: color for *agent identity*; rest restrained.
- Magic Ink: grayscale first; add color only where it conveys data.

Jarvis: keep categorical-kind color and **add Nelson-style "match color"** (shared-span pulse synchronized across panels) for transclusion/quotation.

### L10 — Inter-view linking

Where historical work most exceeds modern production tools:

- **Engelbart's NLS viewspecs**: edit the same outline through different filters/formats simultaneously; live two-way binding.
- **Nelson's transpointing windows**: auto linked-scroll + color ribbons mapping every shared span.
- **Memex trails**: linked across collections — a trail can contain documents from three separate libraries as one continuous narrative.
- **Kay's MVC** (Smalltalk-80): same Model, many Views, many Controllers, all auto-syncing — the implementation primitive that makes the rest possible.
- **Dynamicland**: shuffle papers on the table and projected lines re-route.

Stronger primitives than contemporary canvas/PKM tools (see WS-05). Adopt **MVC by default + linked highlighting always on** as baseline.

### L11 — Process / reasoning representation

The lens where historical work most directly informs the LLM era:

- **Bush's trail** = literally a reasoning trace, shareable. "How did I conclude X?" → here's the trail.
- **Engelbart's NLS history**: every edit timestamped, replayable; editing history as a navigable outline.
- **Nelson's versioning**: every change is a versioned span; "as of yesterday morning" is addressable.
- **Victor's "Inventing on Principle"**: live-coding demos *show* cause → effect with zero delay. Reasoning becomes visible by eliminating latency, not by adding a log panel.
- **Dynamicland**: every running program is visible — projected on top of its source paper. No hidden state; reasoning is geometry.

Historical consensus: **make the trace ambient, not summoned**. The current ActivityPanel is summoned. The Bush/Victor model: the trail *is* the navigation primitive. Treat agent reasoning as a saveable, replayable, sharable trail-artifact alongside its outputs.

### L12 — Multi-user, sharing, persistence

- Bush: trails **shared between researchers** ("new forms of encyclopedias … with a mesh of associative trails … ready to be dropped into the memex and there amplified" [1]).
- Engelbart 1968: **first public demo of real-time co-editing + video conferencing**. Multi-user foundational, not bolted on.
- Nelson's Xanadu: **micropayment per transcluded span**; sharing built-in economic primitive.
- Kay's Smalltalk image: persistence by snapshotting the entire running world.
- Dynamicland: **communal-only**; no single-user mode; programs are physical objects anyone can pick up.
- Weiser: multi-user implicit — office shared, tabs/pads/boards rotate among occupants.

Historic axis: **shared by default, single-user as special case** — inverse of Jarvis today. Lesson: "design the data model so multi-user grafts on cleanly" (versioned spans, addressable trails, atomic artifacts). The fs-as-state covers most; bookmarks-as-shareable-views and trails-as-shareable-paths are the missing pieces.

---

## Top patterns extracted

- **Named associative trail (Bush)** — Seen in: Memex, NLS history, Matuschak's notes. Mechanism: ordered, named sequence of artifacts + reasoning glue. Why it works: externalizes path-of-thought; re-reading re-walks the reasoning. Caveat: trails go stale; needs a "still valid?" refresh affordance.
- **Transclusion / parallel text (Nelson, Engelbart)** — Seen in: Xanadu transpointing windows, NLS, modern wikis. Mechanism: live source-of-B inside A with visible ribbon to origin. Why it works: kills copy-paste decay; canonical source always visible. Caveat: requires durable addresses (Xanadu tumbler); URL fragility breaks it.
- **Viewspec (Engelbart)** — Seen in: NLS; partially Workflowy/Tana. Mechanism: declarative `filter + format + indent + label rules` saved per user, applied to any subtree. Why it works: same data, many lenses, switchable in O(ms). Caveat: needs structurally addressable data.
- **Active object (Kay)** — Seen in: Smalltalk, Mathematica notebooks, ObservableHQ. Mechanism: artifact carries its own behavior; inspect/modify/re-run in place. Why it works: collapses read/edit/run. Caveat: uniform object model is hard to retrofit.
- **Immediate connection (Victor)** — Seen in: Inventing on Principle demos, *Learnable Programming*, Dynamicland. Mechanism: zero-latency, no-hidden-state cause→effect during edit. Why it works: closes perception-action loop. Caveat: hard at scale (debounce, expensive compute).
- **Information-software-first (*Magic Ink*)** — Seen in: well-designed dashboards (Tableau, Datadog summaries). Mechanism: design static graphic for the user's question first; interactivity last resort. Why it works: graphics scale faster than menus. Caveat: needs correct inference of user's current question — LLM context now helps.
- **Evergreen note as forcing function (Matuschak)** — Seen in: notes.andymatuschak.org and PKM cohort. Mechanism: title-is-claim, atomic, durable, rewritten, densely linked. Why it works: form coerces data toward concept structure that compounds. Caveat: years to pay off; hard to bootstrap.
- **Calm technology three-tier (Weiser)** — Seen in: macOS notification center (vestigial), Apple Watch glances, Dynamicland walls. Mechanism: explicit center / focal-periphery / ambient zones; user controls promotion rate. Why it works: matches human attention biology. Caveat: discipline required not to escalate everything.
- **Room-as-substrate (Dynamicland)** — Seen in: Dynamicland, IllumiRoom prototypes. Mechanism: room is the address space; physical arrangement *is* layout state. Why it works: leverages spatial memory; multi-user free. Caveat: hardware-heavy, doesn't travel.

## Anti-patterns observed

- **Hidden state during edit** (vs Victor) — Most IDEs/graphic tools: effect appears later via re-render. Breaks perception-action loop.
- **One form per data type** (vs Engelbart/Kay) — Most BI/graph tools, Jarvis 1.0: artifact → fixed form, no per-task selection. Forces user to pre-commit to a question.
- **Notifications instead of periphery** (vs Weiser) — Most OS today: any event becomes push-interrupt; trains user to dismiss without reading; obliterates calm.
- **Trail as single back-button stack** (vs Bush) — Every browser since 1995: history collapses to linear undo; cannot share/annotate/branch.
- **Programmability gated by a "real" language** (HyperCard lesson) — HyperCard needing Pascal/C, modern "low-code" needing SQL/JS [21]: competence cliff where novice escape was promised.

---

## Predictions that are NOW feasible

Which historical predictions were limited by missing technology we now have? For each: what changed, what's the Jarvis hint.

### Bush's associative trails → LLM-generated and human-curated trails
- *Missing 1945:* the ability to *suggest* which two artifacts link. Bush imagined humans typing every connection.
- *Changed:* LLMs propose typed edges (`derives`, `references`, `contradicts`) with rationale, at scale, cheaply. The 2024-25 wave of LLM-empowered knowledge-graph construction [28] documents production maturity.
- *Jarvis hint:* add a **named-trail** artifact-kind (ordered IDs + per-step rationale). Layout agent proposes trails from a question; user edits. Trails are addressable, sharable, replayable as a guided tour.

### Engelbart's view-of-views → Layout-agent-driven viewspecs
- *Missing 1968:* labor of defining viewspecs. NLS users wrote terse strings (`vh`, `el`, `m1`).
- *Changed:* an LLM converts "show only contradictions in this cluster, smallest first" into a viewspec.
- *Jarvis hint:* **NL-to-viewspec** input. Each saved viewspec is a versioned artifact. Engine = current `apply_layout_plan` extended with filter + format + grouping.

### Kay's dynamic media → live executable artifact-kinds
- *Missing 1972:* dynamic media required Smalltalk fluency.
- *Changed:* LLM-assisted code-gen makes "make this chart show X" a one-sentence command. Active-object becomes user-facing.
- *Jarvis hint:* **executable artifact-kinds** (chart-panel, flow-panel) whose `body` is an interpretable spec (Vega-Lite, Mermaid, Cytoscape JSON) mutable verbally; LLM rewrites, R3F re-renders.

### Victor's live-everything → sub-second reorganize, ghost preview
- *Missing 2012:* recompute cost limited "immediate" to toy demos.
- *Changed:* Layout agent runs in seconds (recent commits 2804e71, 8167a46); streaming reasoning sub-second.
- *Jarvis hint:* **ghost-preview** every agent move pre-commit; user sees faded duplicates, accepts/rejects by gesture or voice. No hidden state between intent and canvas response.

### Matuschak's evergreen notes → AI-curated atomicity-drift detection
- *Missing 2019:* manual labor of detecting when a note should split, merge, retitle, or grow links.
- *Changed:* an LLM passing over the artifact set can flag all four.
- *Jarvis hint:* background **curator agent** that proposes evergreen-hygiene actions; user batch-approves. Use Worker agent kind; output to a review queue, not in-place edits.

### Weiser's three-tier attention → ambient periphery zones in panels
- *Missing 1991:* surrounding display hardware; Weiser used dedicated boards/pads/tabs.
- *Changed:* AR headsets give 360° peripheral canvas; even desktop multi-monitor + voice gives three zones (focal / glance / spoken).
- *Jarvis hint:* every panel gets an **ambient stripe** (low-priority status, agent thinking); promotion by gaze/click. Voice for *interrupt-class* only.

### Knowledge Navigator's voice agent → already shipping
- *Missing 1987:* real NLU + real TTS + real search.
- *Changed:* all three. The 1987 vision is now a baseline.
- *Jarvis hint:* lift the Knowledge Navigator script verbatim — agent narrates as it works, accepts spoken clarifications, suggests next moves — and substitute Jarvis's domain.

---

## Predictions that AREN'T about technology

Some historical "predictions" are *normative agendas* — what we should want, not what we should build. They carry as **design constraints**.

- **Engelbart's "augmenting intellect" is sociotechnical** [2]. H-LAM/T includes Language + Methodology + Training alongside Artifacts. *Constraint:* a successful Jarvis teaches how to think with it, not just what buttons exist. Ship worked-example flows; treat user-skill growth as a product metric.
- **Victor's "creators need an immediate connection"** [10]. *Constraint:* defend every interaction against "is there a latency or hidden-state break?" Failure → rethink, not "add a spinner."
- **Bush's "encyclopedias with associative trails ready to be dropped in"** [1]. *Constraint:* Jarvis data must be exportable as a **trail-rich bundle** for others' instances. Ship a `.jarvis-bundle` import/export.
- **Nelson's "down with cybercrud"** [5]. *Constraint:* always-inspectable. No black-box agent moves; ActivityPanel stays first-class.
- **Weiser's calm computing** [15]. *Constraint:* every push-interrupt justified against "could this have lived in periphery?"
- **Matuschak's "books don't work"** [13]. *Constraint:* spaced re-encounter inside the workspace ("haven't revisited X cluster in 14 days — one-sentence reminder?"); mnemonic-medium-style retention scaffolding.
- **Latour's quasi-objects / non-human actants** [25]. *Constraint:* agents are first-class participants whose moves are spatially representable (aura, footprint, trail) — not invisible servants.

---

## Iron Man's JARVIS — what makes the fictional UI work?

The cinematic JARVIS UI was designed by Jayse Hansen, conceptually descending from John Underkoffler's g-speak (Minority Report) [26][27]. Underkoffler later founded Oblong and shipped Mezzanine. Most JARVIS vocabulary is now **poseable** with current hardware (Vision Pro, Quest 3, hand-tracking, voice-LLM); the question is what's *interaction pattern* vs *visual flourish*.

**Interaction patterns (worth importing):**

1. **Multiple panels in space, each a focused workspace** (suit schematic, biometrics, comms, target tracker at arms-length, semi-transparent). *Importable as:* anchored panels, hand-grab to focus, two-handed scale, ambient default depth ~80 cm.
2. **Gestural manipulation — pinch-grab, pull-apart, push-away** (Stark explodes a blueprint by pulling his hands apart). *Importable as:* two-handed scale on any cluster; pinch-drop = drill in; flick-away = dismiss.
3. **Voice with name-as-attention-token** ("JARVIS, run diagnostics"). *Importable as:* wake-word for agent; agent narrates results.
4. **Contextual zoom — focal panel grows, periphery dims**. *Importable as:* gaze + voice "focus" pivots the layout; periphery LOD-drops to a status line.
5. **Live simulation co-located with data** (wind-tunnel sim *around* the suit blueprint). *Importable as:* agent execution shown *next to* the artifact, not in a separate panel.
6. **Reveal-on-hover / reveal-on-look** (annotations appear when Stark gazes at a part). *Importable as:* gaze-triggered label/annotation reveal.

**Visual flourish (skip):**

- **Holographic transparency cascade** — readability suffers, depth-disambiguation is hard. Prefer opaque panels with spatial separation.
- **Particle/swarm effects** on data points — pure spectacle, adds noise.
- **Curved/domed displays** suggesting enclosure — constrains user position. Use flat panels with free anchoring.
- **Always-spinning orbital widgets** — chrome, no data. Cut.

Synthesis: **JARVIS is ~70% interaction patterns now feasible + 30% flourish to discard.** The language — many panels, gestural, voice-driven, contextually-focused, agent-narrated — is the directly importable AR-Jarvis vocabulary. Sketched in 2008 cinema, shippable in 2026 hardware: the same 18-year Knowledge-Navigator-to-Siri lag.

---

## Dynamicland and the room-as-computer

Bret Victor's Dynamicland (Oakland, 2017–present; 2024 "intro" video [12]) is the most uncompromising alternative to HMD AR. Premises:

- **The room is the computer.** No personal screen, no HMD. Ceiling projectors + ceiling cameras read printed dot-codes on paper.
- **Programs are physical things.** A page *is* its program; pick it up, walk it to another table, put it next to other pages, and the room re-routes data.
- **Communal by default.** Multiple people manipulate the same programs; displays are outward-facing.
- **No private state.** Everything is visible to everyone.

Implications for long-term Jarvis:

1. **Dynamicland argues against HMD-only thinking.** A multi-year vision should include a **desk-anchored** mode where desk/wall is substrate, not HMD. The purist no-headset version is *almost* consumer-feasible — missing piece is cheap ceiling-mountable projectors with low-latency depth cameras (both exist industrially in 2026).

2. **Desk-surface substrate is near-term feasible.** A "Jarvis desk mat" — printed dot-code mat the desktop camera reads while HMD overlays — bridges to Dynamicland affordances. Physical paper, sticky notes become first-class artifacts.

3. **Programs-as-physical isn't right for personal-research.** Dynamicland's communal premise is antithetical to single-user. Borrow the substrate, not the social model.

4. **Agent UX implication:** in a Dynamicland-style Jarvis the agent has no avatar — it lives in projection, as dynamic glyphs around physical artifacts. The reasoning-trace becomes a literal trail of projected breadcrumbs across the desk, fading over time. This is the Bush-Memex realization Bush couldn't render.

5. **Hardware parity with HMD is 3-5 years out.** Until then Dynamicland is the *horizon* design target; desktop and HMD are the *interim* ship targets.

---

## Implications for Interactive Jarvis

- **Named-trail artifact-kind** — L11, L1. `electron/main/world-state.ts`, `mcp/`, `renderer/src/scene/`. Effort: M. AR: +. *Bush's Memex made shippable by LLMs; highest-leverage historical revival.*
- **Viewspec = saveable filter+layout+format** — L3, L4, L10. `world-state.ts` (bookmarks → viewspecs), Layout agent. Effort: M. AR: neutral. *Engelbart's NLS innovation, never properly resurrected.*
- **Ghost-preview every agent move** — L11, L8. `renderer/src/scene/` (faded duplicates), Layout agent pipeline. Effort: M. AR: +. *Victor's "immediate connection" applied to agent moves.*
- **Transclusion ribbons between content-sharing artifacts** — L2, L10, L9. Edge rendering + body diffing. Effort: L. AR: +. *Nelson's parallel text; expresses derives/references visually.*
- **Background curator agent for evergreen hygiene** — L11. `electron/main/agents/`. Effort: M. AR: neutral. *Matuschak's atomicity discipline at LLM scale.*
- **Three-tier attention zoning per panel** — L8, L5. Panel rendering, anchor policy. Effort: M. AR: + (essential in HMD). *Weiser's calm computing.*
- **JARVIS-cinematic interaction language documented** — all 12. `docs/product/INTERACTION-LANGUAGE.md`. Effort: S. *Articulated reference; "JARVIS but real" is a 5-word pitch.*
- **"Desk substrate" mode for v3** — L5. `docs/product/AR-VR-BRIDGE.md`. Effort: L (research). AR: ++. *Dynamicland horizon; bridges HMD reluctance.*

---

## Open questions

- **How shareable does a trail need to be?** A `.trail` export bundles artifact IDs + bodies + rationale; but if recipient's Jarvis has different artifacts, what's the merge policy? Need a prototype to feel out.
- **How does ghost-preview interact with streaming agent output?** If the agent is still thinking, what does the ghost preview? A skeleton? Partial? Need to specify.
- **What's the smallest viable mnemonic-medium integration?** Full spaced-repetition is a large feature; what minimum surfaces the benefit?
- **Should agents have visual avatars or remain disembodied?** Latour's quasi-object framing says yes, give them spatial presence; Weiser's calm framing says no, keep them ambient. Tradeoff unresolved.
- **For Dynamicland-style desk mode, who manufactures the physical substrate?** Custom mats, dynamic-tag library, dot-code printer pipeline — non-trivial supply chain.

---

## References (full)

1. Bush, V. "As We May Think." *The Atlantic Monthly*, July 1945. https://www.theatlantic.com/magazine/archive/1945/07/as-we-may-think/303881/ ; PDF mirror https://www.ee.columbia.edu/~dpwe/papers/Bush45-aswemaythink.pdf ; Wikipedia summary https://en.wikipedia.org/wiki/As_We_May_Think (Tier A)
2. Engelbart, D. "Augmenting Human Intellect: A Conceptual Framework." SRI summary report AFOSR-3223, Oct 1962. https://dougengelbart.org/content/view/138/ ; full PDF https://www.lri.fr/~mbl/ENS/FundHCI/2018/papers/Englebart-Augmenting62.pdf (Tier A)
3. The "Mother of All Demos," Doug Engelbart + ARC, Fall Joint Computer Conference, San Francisco, Dec 9, 1968. Annotated playback https://www.dougengelbart.org/mousesite/1968Demo.html ; Wikipedia https://en.wikipedia.org/wiki/The_Mother_of_All_Demos (Tier A)
4. Nelson, T. *Project Xanadu* (ongoing, original 1965). https://xanadu.com.au/ ; *Xanalogical Structure* https://xanadu.net/NOWMORETHANEVER/XuSum99.html ; Wikipedia https://en.wikipedia.org/wiki/Project_Xanadu (Tier A)
5. Nelson, T. *Computer Lib / Dream Machines* (1974, rev. 1987). Self-published / Microsoft Press 1987 ed. https://en.wikipedia.org/wiki/Computer_Lib/Dream_Machines ; Internet Archive https://archive.org/details/computer-lib-dream-machines (Tier A)
6. Kay, A. "A Personal Computer for Children of All Ages." Xerox PARC, 1972. Available via Wikipedia summary https://en.wikipedia.org/wiki/Dynabook (Tier A)
7. Kay, A. & Goldberg, A. "Personal Dynamic Media." *IEEE Computer* 10(3): 31-41, March 1977. https://www.newmediareader.com/book_samples/nmr-26-kay.pdf (Tier A)
8. Victor, B. "Magic Ink: Information Software and the Graphical Interface." Draft, March 15, 2006. https://worrydream.com/MagicInk/ (Tier A)
9. Victor, B. "Up and Down the Ladder of Abstraction." 2011. https://worrydream.com/LadderOfAbstraction/ (Tier A)
10. Victor, B. "Inventing on Principle." CUSEC keynote, Montreal, Jan 2012. Video https://vimeo.com/36579366 ; transcript https://jamesclear.com/great-speeches/inventing-on-principle-by-bret-victor (Tier A)
11. Victor, B. et al. "Dynamicland." https://dynamicland.org ; "Computing is Everywhere" talk, https://news.ycombinator.com/item?id=18692329 (Tier A)
12. "Dynamicland intro" (2024 video) — overview. https://machaddr.substack.com/p/dynamicland-bret-victors-vision-for ; MIT Media Lab talk page https://www.media.mit.edu/events/bret-victor-talk/ (Tier B)
13. Matuschak, A. "Why books don't work." 2019. https://andymatuschak.org/books/ ; "About these notes." https://notes.andymatuschak.org/About_these_notes (Tier A)
14. Matuschak, A. "Five years of evergreen notes." Patreon, Aug 2024 (summary at https://talahardin.vinceimbat.com/literature/five-years-of-evergreen-notes-matuschak/ ); Dwarkesh interview https://www.dwarkesh.com/p/andy-matuschak (Tier A)
15. Weiser, M. "The Computer for the 21st Century." *Scientific American* 265(3): 94-104, Sep 1991. https://www.lri.fr/~mbl/Stanford/CS477/papers/Weiser-SciAm.pdf (Tier A)
16. Dubberly, H. "How the Knowledge Navigator video came about." https://www.dubberly.com/articles/how-the-knowledge-navigator-video-came-about.html (Tier B)
17. Apple Knowledge Navigator (1987). Director: Hugh Dubberly. Wikipedia https://en.wikipedia.org/wiki/Knowledge_Navigator ; Cult of Mac retrospective https://www.cultofmac.com/news/apple-knowledge-navigator-video-from-1987-predicts-siri-ipad-and-more (Tier B)
18. Microsoft Office Labs, Productivity Future Vision (2009, 2011). Internet Archive https://archive.org/details/microsoft-office-labs-future-vision-video-collection ; Joshua Lyman analysis https://www.joshualyman.com/2012/04/cues-from-the-microsoft-productivity-future-vision-2011-short/ (Tier B)
19. Microsoft Productivity Future Vision (2011) Released. SlashGear https://www.slashgear.com/microsoft-productivity-future-vision-2011-released-video-27191622/ (Tier B)
20. Atkinson, B. HyperCard, Apple, 1987. Wikipedia https://en.wikipedia.org/wiki/HyperCard ; Internet Archive 30-year retrospective https://blog.archive.org/2017/08/11/hypercard-on-the-archive-celebrating-30-years-of-hypercard/ (Tier B)
21. "Why HyperCard had to die." Loper OS blog. https://www.loper-os.org/?p=568 ; "Why We Still Need a HyperCard for the AI Era." https://rogerwong.me/2025/09/why-we-still-need-a-hypercard-for-the-ai-era (Tier B)
22. Rekimoto, J. et al. "Augment-able reality: situated communication through physical and digital spaces." 1995/1998. https://www.academia.edu/116236129/Augment_able_reality_situated_communication_through_physical_and_digital_spaces (Tier B)
23. WordSense, MIT Media Lab. https://medium.com/mit-media-lab/mixing-realities-language-learning-in-the-wild-dc835ed89c40 ; project page https://www.media.mit.edu/projects/wordsense/ (Tier B)
24. AR-PaperSync (2024): "Augmented Reality and Cross-Device Interaction for Seamless Integration of Physical and Digital Scientific Papers." bioRxiv 2024.02.05.578116. https://www.biorxiv.org/content/10.1101/2024.02.05.578116 (Tier B)
25. Latour, B. "On actor-network theory: A few clarifications." 1996. https://transnationalhistory.net/interconnected/wp-content/uploads/2015/05/Latour-Actor-Network-Clarifications.pdf ; design application: https://portal.findresearcher.sdu.dk/files/245215005/ANT_instrument_2023_prepubl.pdf (Tier B)
26. Underkoffler, J. "Pointing to the future of UI." TED Long Beach, 2010. Oblong g-speak. https://www.ted.com/talks/john_underkoffler_pointing_to_the_future_of_ui (Tier C)
27. Hansen, J. "Iron Man HUDs & Holograms" portfolio. https://jayse.tv/v2/?portfolio=hud-2-2 ; Perception studio Iron Man 2 case study https://www.experienceperception.com/work/iron-man-2/ (Tier C)
28. "LLM-empowered knowledge graph construction: A survey." arXiv 2510.20345 (Oct 2025). https://arxiv.org/abs/2510.20345 (Tier A)
