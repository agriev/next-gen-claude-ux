# 00 — Lens & Scope

**Purpose:** This document defines the analytical lens used across all 12 research workstreams (`01-`..`12-`) and the synthesis pass (`synthesis/`). Every brief MUST pass the same 12 questions so we can build comparable matrices.

**Audience:** Sub-agents executing research workstreams; product team reading the synthesis afterwards.

**Status:** Frozen at start of research cycle. If a lens question is added or revised mid-cycle, regenerate affected briefs.

---

## 0.1 Mission framing

We are designing the next iteration of **Interactive Jarvis**, a spatial multi-agent personal research tool (Electron + R3F + Claude Agent SDK). The current build represents data as plate-shaped artifacts connected by Bézier edges and clustered translucent regions. We want to expand the visual language toward a world where:

- AR/VR headsets are everyday hardware (Apple Vision Pro lineage, lightweight successors, ubiquitous hand+gaze input)
- LLMs are fast enough to drive the canvas in real time (sub-second reorganize, streaming reasoning, multi-agent collaboration)
- Text alone can no longer carry compressed concepts — the human needs **multiple linked diagrams and dashboards arranged in space**, with the LLM acting as navigator/symbiote

The research must surface what is already proven in academia and industry so we don't reinvent failed patterns, and to identify the genuine open problems where original design work is needed.

---

## 0.2 The 12 lens questions

Each workstream brief MUST answer each question for the dominant tools/sources it covers. If a question genuinely does not apply, state **N/A** plus a one-sentence reason (do not silently skip).

### L1 — Spatial primitives
What kinds of *things* live in the space? Possible: nodes (cards, panels, widgets), edges (curves, ribbons, beams), regions (clusters, frames, zones), volumes (3D containers), planes (2D maps, walls), axes (timelines, scales), anchors (world/desk/hand/head attachment points), avatars (user/agent embodiment).

### L2 — Data → form mapping
For each kind of input data the tool ingests, what visual form does it get? Build a small table per source: `entity record → card`, `time series → line on plane`, `pipeline DAG → node-and-edge graph in volume`, etc. Note where the mapping is implicit vs explicit, and where multiple data types collapse into one form (often a failure mode).

### L3 — Camera & navigation
How does the user move through the space? Orbit (rotate around target), fly (free 6DoF), walk (gravity, head-bob), teleport (jump to anchor), fixed multi-view (no movement, multiple cameras shown), pan+zoom (2D-ish). What changes when there are multiple dashboards/views? Are there "named viewpoints" / bookmarks?

### L4 — Level of Detail (LOD)
How does the representation degrade gracefully across scales? Specify behaviour at **10 / 100 / 1 000 / 10 000+** objects. When does aggregation kick in (clusters, heatmaps, density volumes)? When are labels dropped, when are objects culled? Is LOD viewer-relative (distance) or data-relative (importance)?

### L5 — Anchoring (AR/VR-specific)
For tools that exist in AR/VR or have been ported: are surfaces anchored to the **world** (room), **desk** (horizontal surface), **head** (HUD always in front of user), **hand** (palm menu), or **shared** (collaboration anchor)? What is the policy for switching anchors? For non-AR tools, answer N/A but note any implicit anchoring (always pinned to screen edge, etc.).

### L6 — Labels & legends
Are labels always visible? Hover-only? Voice-spoken on focus? Distance-thinned? Where do legends live (always on, panel, hidden)? What happens to text at far distances — is there font-size scaling, occlusion-aware repositioning, or just LOD-culling?

### L7 — Selection & group operations
How does the user select one item, many items, a typed set, or a search-driven set? What operations work on a multi-selection (move, delete, group, recolor, route through agent)? Is there a "saved selection" concept?

### L8 — Attention flow
How does the user notice that something changed? Push signals (animation, sound, haptic, badge bloom, attention beam) vs pull signals (badge in corner, log entry, notification center). What is the rate-limit / suppression policy? How is "ambient awareness" (low-priority background change) handled vs "interrupt" (must-look-now)?

### L9 — Color system
Is there a single color scale or separate scales for (a) categorical kinds, (b) ordinal confidence/quality, (c) quantitative magnitudes, (d) lifecycle/state? How are conflicts resolved when an object has values across all four? Is the system colorblind-safe?

### L10 — Inter-view linking
When multiple views/dashboards/panels exist, how are they linked? Linked highlighting (hover in one → highlight in all), drill-down (click → opens detail view), pivot (rebuild views around clicked entity), brushing (select range in one → filter all). What is the **default** linking behaviour, and how is it overridden?

### L11 — Process / reasoning representation
For agentic/computational tools: how is the *process* (not just the result) made visible? Possibilities: step-by-step trace tree, animated playback, ghost-preview of pending operations, intent-bubbles, live edit indicators, time-scrubber, log panel. Is the representation always-on, or summoned?

### L12 — Multi-user, sharing, persistence
Is the tool single-user, multi-user real-time, async-collaborative? How are snapshots / states shared? How does the tool persist (file format, cloud, local DB)? For AR/VR: how do co-located users see each other and each other's interactions?

---

## 0.3 Output template for each brief

Every workstream brief MUST follow this skeleton (target 3-5 pages, ~1500-3000 words):

```markdown
# WS-NN — <Title>

**Scope:** <one paragraph: what this WS covers, what it excludes>
**Date:** <YYYY-MM-DD when written>
**Sources consulted:** <count> primary + <count> supporting

## Tools / sources surveyed
For each major tool or source, a 1-paragraph snapshot:
- **<Name>** — [type: tool/book/paper/talk] [year] [URL or citation]. <2-3 sentence summary of what it is and why it's relevant.>

(10-20 entries typical; mark which ones are deeply analyzed below)

## Lens pass

### L1 — Spatial primitives
<2-4 paragraphs answering the question across the surveyed sources. Compare. Name 2-3 concrete patterns.>

### L2 — Data → form mapping
<...>

### L3 — Camera & navigation
<...>

(...continue through L12...)

## Top patterns extracted
List 5-10 named patterns this WS contributes to the synthesis pool. Each:
- **<Pattern name>** — Where seen: <tool A, tool B>. Mechanism: <one sentence>. Why it works: <one sentence>. Caveat: <one sentence>.

## Anti-patterns observed
List 2-5 failure modes seen in this WS. Same format.

## Implications for Interactive Jarvis
3-7 concrete recommendations or open questions, each:
- **<Suggestion>** — Maps to lens L#. Affects file(s) <path>. Effort estimate (rough): S/M/L. AR-readiness: +/-/neutral.

## Open questions
2-5 things this WS could not answer and recommends for a follow-up.

## References (full)
Numbered list of all sources cited, with URLs / DOIs / book editions.
```

---

## 0.4 Term definitions (shared vocabulary)

To avoid term drift across briefs, use these definitions consistently. If a source uses a different term, translate and note the original.

- **Artifact** — a discrete addressable unit of content in Jarvis (currently: card-shaped plate; future: also chart-panel, flow-panel, etc.). Has unique `id`, human-readable `shortName`, `kind`, `spec`, `body`.
- **Edge** — a typed directed (or undirected) relationship between two artifacts. Currently 4 kinds: `derives`, `references`, `contradicts`, `groups-with`.
- **Cluster** — a spatial region wrapping a set of artifacts that share a property (topic, tag, kind).
- **Panel** (new term) — a 2D rectangular surface in 3D space that hosts widgets (charts, tables, controls). Equivalent to a "dashboard tile" in BI parlance.
- **View** — a configured camera + filter + layout state. Bookmarks save Views.
- **Spec** — short structured description of an artifact (≤200 tokens), used by Layout agent for placement decisions.
- **Reasoning trace** — the recorded sequence of thoughts + tool calls an agent produced while completing a task. Currently shown as text rows in ActivityPanel.
- **LOD** — Level of Detail; how representation simplifies at distance or under density.
- **Anchor** — in AR/VR, the coordinate frame an object is attached to: world, desk surface, head, hand, or shared (multi-user).
- **Affordance** — visual/spatial hint that an interaction is possible (handle, glow, ghost).
- **Modality** — input channel: keyboard, mouse, voice, gaze, hand gesture, haptic.

---

## 0.5 Source quality tiers

For pattern catalog evidence-strength tagging:

- **Tier A (strong evidence)** — Peer-reviewed paper, industry standard (W3C, Khronos), vendor HIG (Apple, Microsoft), or shipping product with documented design intent (Tableau, Palantir public talks).
- **Tier B (medium evidence)** — Indie product with thoughtful design (tldraw, Obsidian), conference talk, well-cited blog post, working open-source implementation.
- **Tier C (weak / inspirational)** — Concept video, design fiction, single-source claim, retrospective interpretation.

Patterns appearing in **≥2 sources of Tier A** or **≥3 sources across tiers** earn "strong" rating in the synthesis.

---

## 0.6 What is explicitly out of scope

- LLM provider comparison (Anthropic Agent SDK is fixed)
- Performance benchmarking of specific 3D engines (Three.js is fixed; WebGPU migration is a separate question)
- Pricing / monetization strategy (single-user personal tool for now)
- Mobile/touch-only UI (desktop + AR/VR are the only targets)
- Programmatic plugin API design (separate future cycle)

---

## 0.7 Process notes for sub-agents

1. **Read this whole document first.** Then read your assigned WS section in `~/.claude/plans/agile-discovering-stroustrup.md`.
2. **Cite primary sources.** When citing a paper, give the venue + year + URL/DOI. When citing a tool, link to its official docs or a YouTube demo timestamp.
3. **Do not invent.** If you cannot find a source for a claim, mark it as "(inferred from X, Y; no direct citation found)" — the synthesis pass needs to know what is grounded vs interpreted.
4. **Cross-link.** When a pattern in your WS appears in another WS the synthesis will surface, you don't need to know that — just describe what you see and which tools.
5. **Length discipline.** Aim for ~3000 words, hard cap ~5000. Long lists belong in the References section, not the main body.
6. **One file out.** Write directly to your assigned `docs/research/NN-<slug>.md` path. Do not return raw research to the parent — write the file.

---

## 0.8 Cross-reference table (filled by synthesis)

The synthesis pass will fill this with: which pattern appeared in which WS, evidence tier, and which product doc cites it. Skeleton lives at `docs/research/synthesis/patterns.md`.
