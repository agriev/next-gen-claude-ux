# Open Questions

**Purpose:** Consolidated catalog of questions that the 12-workstream literature/industry survey could NOT answer. Each is tagged with: (a) sources that flagged it (WS-XX), (b) why it matters for Interactive Jarvis, (c) the most efficient *resolution path* — prototype, measurement, internal experiment, follow-up literature watch, or community outreach.

This is the **inverse** of `patterns.md` / `themes.md` — those summarize what is known. This sheet summarizes what is **not** known and therefore demands action from us.

**Methodology:** Extracted from "Open questions" sections of WS-01..WS-12 (60+ raw entries), deduplicated, and grouped under 8 thematic clusters. ~25 distinct questions retained. Each cluster ends with a **highest-priority** recommendation for what to attempt first.

---

## Cluster 1 — Reasoning trace & agent representation (highest opportunity)

This cluster has the most open questions because **no surveyed tool ships a 3D reasoning trace surface** (WS-07's headline finding). Jarvis can claim this territory but must answer:

### Q1.1 — What is the canonical visual idiom for multi-agent reasoning trace? *[strong open]*
- **Sources:** WS-01 (academic), WS-07 (AI-native UIs), WS-11 (Bret Victor's "immediate connection" principle), WS-12 (operator's mental model)
- **Why it matters:** Jarvis runs Worker + Layout + Listening + Naming concurrently. Today they're text rows in ActivityPanel. The 3D spatial answer is undefined.
- **Resolution path:** Internal prototype. Try at least 3 idioms (linear ribbon, per-agent lane, tree-of-spans) and measure: time to understand "what happened in the last 30s", time to find a specific tool call, time to identify error.

### Q1.2 — Live token streaming in 3D — perceptual cost? *[strong open]*
- **Sources:** WS-07
- **Why:** Streaming text onto a plate may be visually noisy at distance. Threshold for "typing dots pulse" vs full text not known.
- **Resolution path:** Prototype + 5-user feedback in desktop mode; defer AR-mode test to M3 (WebXR experimental).

### Q1.3 — Branch comparison ergonomics — what's the spatial idiom for "show me what would happen if the agent took option B"? *[strong open]*
- **Sources:** WS-07, WS-11 (Bush's named trails — alternative trails)
- **Why:** No tool surveyed does this in 3D. Side-by-side comparison is 2D-native (Cursor diff panes). In 3D, duplicating the scene loses context.
- **Resolution path:** Prototype: "ghost subtree" pattern (agent shows phantom artifacts in adjacent volume, user accepts/rejects).

### Q1.4 — Should agents have visual avatars or remain disembodied? *[fundamental tradeoff]*
- **Sources:** WS-11 (Latour vs Weiser tension)
- **Why:** Latour says yes — agents are quasi-objects with spatial presence. Weiser's calm-tech says no — agents stay ambient. Affects almost every other agent-representation decision.
- **Resolution path:** Pick one for v1 (recommend: disembodied with "agent aura" — region of pulsing color around the area an agent is currently mutating). Reassess after 3 months of own use.

### Q1.5 — Reasoning trace persistence at scale — append-only event log or compacted snapshots? *[design choice]*
- **Sources:** WS-07
- **Why:** A long session may produce thousands of spans. Storage + LOD policy not decided.
- **Resolution path:** Design decision; lean on Event Sourcing pattern (append-only log, derived views via Layout history pattern already in place).

**Cluster 1 priority recommendation:** Start with Q1.1. Prototype 3 trace idioms. Three sessions of 30-min usage will tell us which one we actually return to.

---

## Cluster 2 — Multi-dashboard composition (operator mode)

WS-12 raised these directly relevant to the "horseshoe of slots" Console mode it proposed:

### Q2.1 — How does Console mode coexist with the existing free-form canvas? *[mode-switch design]*
- **Sources:** WS-12, WS-06 (canvases reject pages; control rooms embrace fixed slots)
- **Why:** Two paradigms in one app — toggle via Tab? Persisted independently? Single underlying state with two camera views?
- **Resolution path:** Pick: single underlying state, two `viewMode` settings (`canvas` / `console`). Console mode hides edges, snaps artifacts into slots, locks camera. Toggle via Tab. Prototype on existing board.

### Q2.2 — Right number of slots in the horseshoe? *[empirical]*
- **Sources:** WS-12 (Bloomberg/cockpit ~4-5; visionOS Personal Office 3; trading floor up to 6)
- **Resolution path:** Start with 5 (P + W1 + W2 + A1 + A2 from WS-12). Measure: how often does the user need a 6th? If <10%, hold at 5.

### Q2.3 — Voice loop for single-user + multiple agents? *[interaction design]*
- **Sources:** WS-12, WS-02 (AR vendors)
- **Why:** Distinct TTS voice per agent + spatial audio? Continuous narration vs PTT?
- **Resolution path:** Punt to Whisper landing (already on ROADMAP). After Whisper, prototype TTS for agent status announcements (cheap to try).

### Q2.4 — Can we get away without a "page" primitive? *[architectural]*
- **Sources:** WS-03 (every BI tool has pages/tabs), WS-06 (spatial canvases refuse pages)
- **Why:** Decision has big AR implications (visionOS Volumes don't natively page).
- **Resolution path:** Keep boards as the only page primitive. Within a board, multiple panels (WS-12 horseshoe) live in same canvas. Revisit if 3 boards/topic becomes unwieldy.

### Q2.5 — Co-presence in console mode without a shared wall display? *[multi-user]*
- **Sources:** WS-12, WS-06 (canvases default to multi-user)
- **Resolution path:** Out of scope for v1 (single-user). For v2 multi-user, recommend "shared canvas as the wall, individual horseshoe as private console" — directly mirroring NOC pattern.

**Cluster 2 priority recommendation:** Start with Q2.1 (mode switch) — it's a clean prototype that doesn't require other questions to be answered first.

---

## Cluster 3 — Ontology & typed data

### Q3.1 — What is the right ontology granularity? *[strong open]*
- **Sources:** WS-04 (Palantir's typed Object/Link/Action), WS-05 (Tana supertags), WS-08 (sci-viz pipelines)
- **Why:** Tana rewards heavy typing; Obsidian rewards free-form. Jarvis sits between. The sweet spot for an LLM-driven canvas where the agent can re-type artifacts on demand is unstudied.
- **Resolution path:** Iterative — start by lifting `Edge.kind` to a `link_type` registry (TR4 in tradeoffs.md). Watch what link_types emerge organically over 4 weeks of use. Then decide whether `kind` enum needs similar treatment.

### Q3.2 — Does intermediate-edge collapse [Palantir Vertex pattern] generalize to non-event objects? *[generalization]*
- **Sources:** WS-04
- **Why:** Vertex collapses event chains. Does it work for `derives` chains in Jarvis? Open prototype question.
- **Resolution path:** Try on the marketing-demo board (`shared/seed-marketing.ts` has long `derives` chains). Visual test.

### Q3.3 — Spatial representation of structural gaps (InfraNodus pattern)? *[novel idiom]*
- **Sources:** WS-05
- **Why:** Dashed "missing edge" between two clusters could prompt the LLM ("you have a lot about X and Y but never connected them"). No tool does this in a graph view.
- **Resolution path:** Prototype with a single test cluster pair. Cheap.

**Cluster 3 priority recommendation:** Q3.1 — typed link registry is high-leverage and has clear evidence (TR4).

---

## Cluster 4 — Camera, LOD, and selection at scale

### Q4.1 — Does focus-pivot camera survive multi-select? *[interaction]*
- **Sources:** WS-05 (TheBrain, all PKM tools assume single focus)
- **Why:** Jarvis already supports multi-select. Pivot to centroid feels lost; pivot to bounding-box center may also feel wrong.
- **Resolution path:** Prototype both + a third option ("don't pivot for multi-select, only for single").

### Q4.2 — Should Jarvis ever try to render a "full graph" view? *[design discipline]*
- **Sources:** WS-05 (TheBrain says no; everything else fails at it)
- **Why:** Mini-map-of-clusters as the only overview — explicit refusal of "show all artifacts" affordance.
- **Resolution path:** Design decision: yes, refuse it. Document in CONCEPT.md. Implementation note: keep minimap (`renderer/src/ui/Minimap.tsx`) for orientation but never wire a "fit everything" button.

### Q4.3 — Marking menu vs command palette (Cmd+K) for AI commands? *[input modality]*
- **Sources:** WS-10 (game/3D editor)
- **Why:** Marking menus win on muscle memory + 3.5× faster than linear menus; command palette wins on discoverability.
- **Resolution path:** Both. Cmd+K palette for discovery + power; marking menu (Ctrl+drag on artifact) for high-frequency ops. Hybrid is the modern norm.

### Q4.4 — Bracket-collapse rule firing threshold? *[empirical]*
- **Sources:** WS-10 (Eve's threshold: ~4 in 40 px); WS-08 (sci-viz LOD)
- **Resolution path:** Measure on the marketing-demo board at default zoom; tune to feel.

### Q4.5 — Number of stacked lenses before becoming mud? *[empirical]*
- **Sources:** WS-10 (Civ VI: 1; Cities Skylines: 1 + base render)
- **Resolution path:** Limit to 2 simultaneously visible lenses (e.g. kind-density + recency); design CONCEPT.md tokens to reflect this.

**Cluster 4 priority recommendation:** Q4.2 — make the design decision now and move on. Saves us from being asked to ship a "fit all" feature later.

---

## Cluster 5 — Linked highlighting & cross-view brushing

### Q5.1 — How does cross-filter behave visually in 3D? *[novel]*
- **Sources:** WS-03 (BI dashboards default to cross-filter)
- **Why:** 2D dims non-matching marks. In 3D, do non-matches dim/fade or physically move into a "dimmed cluster"? Both have costs.
- **Resolution path:** Prototype both on a board with a filter chip applied. User feel test.

### Q5.2 — Spatial vocabulary of "filter scope" — how does user know which artifacts a filter affects? *[discoverability]*
- **Sources:** WS-03
- **Why:** BI tools use pages/tabs to imply scope. Jarvis has no pages within a board.
- **Resolution path:** Try "scope region" — a translucent volume highlighting affected artifacts when filter is active.

### Q5.3 — LLM composes ONE dashboard with linked sub-views, or MULTIPLE dashboards? *[fundamental architecture]*
- **Sources:** WS-03 vs WS-12 (BI says single + tiles; control rooms say multiple + linked)
- **Resolution path:** Jarvis's spatial story aligns with multiple-linked (WS-12). Lock this in CONCEPT.md.

**Cluster 5 priority recommendation:** Q5.3 — fundamental architectural decision. Lock in WS-12 view.

---

## Cluster 6 — AR-specific (deferred to M3+)

### Q6.1 — Cognitive cost of mixed anchors (world + hand + head simultaneously)? *[research gap]*
- **Sources:** WS-01 (Friedl-Knirsch 2024 noted as gap), WS-02 (vendor guidelines)
- **Resolution path:** Wait for WebXR branch (M3). Then 5-min sessions × 3 anchor configurations; measure subjective fatigue.

### Q6.2 — Rubber-band 3D multi-select primitive? *[design gap]*
- **Sources:** WS-02 (no vendor specifies)
- **Resolution path:** Cross-reference academic XR-selection papers (CHI 2023-2025 ImmersiveSelection track).

### Q6.3 — AR/VR variant of editor + graph + backlinks linked-triple? *[layout question]*
- **Sources:** WS-05
- **Why:** In DOM, three panels side-by-side is cheap. In AR, explicit placement.
- **Resolution path:** Punt to M4 (companion windows on visionOS).

### Q6.4 — Hand-anchored mini-map — hand jitter cause motion sickness? *[empirical]*
- **Sources:** WS-09
- **Resolution path:** Quick prototype after M3 lands.

### Q6.5 — AR section-plane gesture — hand-plane or voice-summoned slice? *[interaction]*
- **Sources:** WS-08
- **Resolution path:** Prototype after M3.

### Q6.6 — Tableau Vision Pro field-test? *[external observation]*
- **Sources:** WS-03 (TestFlight beta, no public data)
- **Resolution path:** Try the app once it ships GA; write a separate observation doc.

**Cluster 6 priority recommendation:** All deferred until WebXR branch lands (M3). Until then, just design AR-friendly per WS-02 vendor guidelines.

---

## Cluster 7 — Programmability, plugins, and sharing

### Q7.1 — How shareable does a "trail" need to be? *[design]*
- **Sources:** WS-11 (Bush's named trails)
- **Why:** A `.trail` export bundles artifact IDs + bodies + rationale; recipient's Jarvis has different artifacts → merge policy?
- **Resolution path:** v1: trail export is a self-contained zip (artifacts + canvas.json + trail metadata). Recipient imports as a new board. Reuse current export hook (in roadmap, see "Export format" Open product question).

### Q7.2 — Should clusters have headers and be exportable as a unit (tldraw Frame pattern)? *[primitive promotion]*
- **Sources:** WS-06
- **Resolution path:** Yes; design in CONCEPT.md. Cluster gets a `header` field (rendered as a colored bar on top of region).

### Q7.3 — "Same artifact on multiple boards" (Heptabase pattern)? *[multi-board]*
- **Sources:** WS-06
- **Why:** Jarvis is single-canvas-per-board today. Cross-board reference is the entry point for shared knowledge.
- **Resolution path:** Defer to plugin/integration phase (ROADMAP "graph plugin interface"). v1: cross-board reference via `@<board>:<shortName>` syntax.

### Q7.4 — Should named reroute (wireless connection) be a Jarvis primitive? *[primitive scope]*
- **Sources:** WS-09 (Houdini pattern)
- **Why:** Violates "see all relationships" principle but enables long cross-canvas references.
- **Resolution path:** Try after typed-link-registry (TR4) lands. If users complain about edge clutter for cross-cluster references, add named reroute.

**Cluster 7 priority recommendation:** Q7.2 (cluster headers) is the easiest win.

---

## Cluster 8 — Aesthetic & color policy

### Q8.1 — Colorblind-safe default palette? *[accessibility]*
- **Sources:** WS-06 (Mural's palette as reference); WS-01 (Few/Ware on color)
- **Resolution path:** Adopt Mural's documented palette as starting point. Validate against the deuteranopia/protanopia simulators. Document in VISUAL-LANGUAGE.md.

### Q8.2 — Does the artifact's geometry encode state (size, glow, tilt)? *[visual encoding]*
- **Sources:** WS-10 (game UX), WS-04 (Palantir two-layer color)
- **Why:** State on glyph is Tufte-sparkline pattern. Risk: encoding overload.
- **Resolution path:** Follow Themes T5 — two-layer color (kind + state) only, never a third. Geometric encoding (size = importance, glow = recent) deferred until we have a real use-case.

### Q8.3 — What is the smallest viable mnemonic-medium / spaced-repetition integration? *[feature scope]*
- **Sources:** WS-11 (Andy Matuschak's spaced-repetition for understanding)
- **Why:** Full SRS is big; minimum viable surface is undefined.
- **Resolution path:** Skip for v1. Add a "review queue" board template much later if pull arises.

**Cluster 8 priority recommendation:** Q8.1 — adopt Mural palette. Quick win.

---

## Cross-cluster meta-questions (raised by synthesis itself)

### M1 — Do we trust the LLM with spatial layout as our PRIMARY layout method? *[strategic]*
- **Sources:** TR9 (tradeoffs.md), patterns.md⚠ Watch ("trusting LLM spatial reasoning at scale")
- **Why:** Industry default is force-directed + heuristic. Jarvis bet is LLM-driven (Layout agent). Synthesis flags this as risky beyond N artifacts.
- **Resolution path:** Instrument Layout agent success rate per artifact count. Define "success" as: no user re-arrangement within next 5 minutes. Collect 4 weeks of usage data. Decide: keep LLM-primary, fall back to heuristic past threshold, or both (LLM hints + heuristic settles).

### M2 — Visual avatars vs ambient agent presence (cross-cluster) *[philosophy]*
- Already in Q1.4. Repeated here as it touches both reasoning trace (Cluster 1) and aesthetic (Cluster 8).

### M3 — How aggressively to invest in voice as primary input vs keyboard *[strategic]*
- **Sources:** WS-02, WS-07, WS-12, ROADMAP (Whisper landing)
- **Why:** AR-era is voice-first. Desktop-era is keyboard-first. Bridge strategy.
- **Resolution path:** After Whisper lands (★ ROADMAP), 4 weeks of dogfooding voice-primary on desktop. Track: % of commands voice vs kbd. If <30% voice → voice stays optional. If >60% → reorient HUD for voice-first.

### M4 — Multi-user threshold *[product scope]*
- **Sources:** WS-06, WS-12, WS-05 (PKM tools mostly single-user except Reflect/Notion)
- **Why:** Jarvis is explicitly single-user in mission. When does that bend?
- **Resolution path:** Keep single-user for entire 12-month horizon. Re-evaluate at month 12 against actual user pull.

### M5 — Performance horizon: at what artifact count does the experience degrade? *[empirical]*
- **Sources:** WS-05 (1-2k threshold across PKM); WS-08 (sci-viz handles millions but with offline preprocessing); WS-12 (BI tools paginate after ~50 widgets per dashboard).
- **Resolution path:** Run synthetic load test with 100/500/1000/5000 dummy artifacts on the marketing-demo board. Measure: frame rate, first-paint time, Layout agent reorganize time. Identify first cliff.

---

## Recommended next-research / prototyping queue (priority order)

These are the highest-leverage actions to take *after* product composition (Phase 4) lands and before Phase 5 backlog is locked:

1. **Reasoning trace 3D prototype** (Q1.1) — 3 idioms in a branch, 30 min sessions, pick winner.
2. **Console mode prototype** (Q2.1) — single underlying state, two viewMode settings. Toggle on existing board.
3. **Typed link registry** (Q3.1) — refactor `Edge.kind` to `link_type` lookup. Migration script.
4. **Cross-filter spatial behavior** (Q5.1) — apply existing FilterChips, prototype dim vs move.
5. **LLM-layout success-rate instrumentation** (M1) — add `success` (yes/no, time-to-rearrange) telemetry to existing Action records. 4-week data collection.
6. **Synthetic load test** (M5) — find the first cliff. Inform pagination/LOD design.

Each above is ~1 day of prototype work. None requires AR hardware. All produce learnings that feed back into a v2 product composition cycle if needed.

---

## Sheet hygiene

- All raw open-questions from WS-01..WS-12 considered.
- Questions answerable from `patterns.md` / `themes.md` / `tradeoffs.md` were NOT included here.
- Cross-references in this sheet point to `themes.md` (T#) and `tradeoffs.md` (TR#).
- Cluster boundaries are designed to map to *prototype efforts* — one cluster = one focused exploration session.
- Update cadence: revisit this sheet after each prototype experiment lands; mark resolved questions with a strikethrough + link to the experiment writeup.
