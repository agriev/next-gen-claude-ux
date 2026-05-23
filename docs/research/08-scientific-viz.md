# WS-08 — Scientific & engineering visualization

**Scope:** What the scientific and engineering visualization world does seriously with 3D — toolchains with 25+ years of investment, used because people have to *believe* what they see (publication figures, design correctness, simulation insight). Covers desktop scientific viz (ParaView, VisIt, VTK, Mol*, ChimeraX, PyMOL, MeshLab, OpenSpace), declarative web grammars (Vega-Lite, D3, Plotly), notebook-embedded 3D (ipyvolume, k3d, pythreejs, Mathematica), large-scale geospatial (deck.gl, kepler.gl), USD pipelines (Houdini Solaris), and parametric CAD (Onshape, Fusion 360). Excludes game-engine viewport patterns (WS-10), node-graph editing (WS-09), BI dashboards (separate).
**Date:** 2026-05-23
**Sources consulted:** 13 primary tools/papers + 7 supporting

## Tools / sources surveyed

- **ParaView** [A, Kitware, 2002+] — visualization application on VTK; HPC-scale meshes, in-situ Catalyst, MPI-parallel. Data-flow model: reader → filters → mapper → actor.
- **VTK** [A, Kitware, 1993+] — foundational C++ library; the sources/filters/mappers/actors pipeline is the reference architecture for nearly every other tool here.
- **VisIt** [A, LLNL, 2000+] — parallel viz from desktop to 12 000-core renders of trillion-cell meshes; plugin reader for 120+ scientific formats.
- **VTK.js** [A, Kitware] — ES6/WebGL port; ~1 B triangles/sec on a GTX 960M with a 30 M-tri model; WebXR for in-browser AR/VR.
- **PyMOL** [A] — molecular viewer with Boolean-algebraic selection language and multi-level pick mode (atom / residue / chain / molecule).
- **UCSF ChimeraX** [A] — successor to Chimera; scripted `view`/`camera`/`cofr`; VR-capable; outline-highlighted selection.
- **Mol\*** [A, PDBe + RCSB PDB, 2021] — web molecular viewer; BinaryCIF + progressive model loading scales to hundreds of superimposed structures and MD trajectories in-browser.
- **Vega-Lite** [A, InfoVis 2017] — JSON-declarative grammar of interactive graphics: data + mark + encoding + selection compile to Vega → SVG/Canvas. Animated Vega-Lite (2023) added an animation grammar.
- **D3.js / Observable** [A] — imperative data-binding library; Observable's reactive cells make it spreadsheet-composable for prototyping.
- **Plotly + Dash** [A] — declarative `graph_objects` for 3D scatter/surface/mesh; Dash binds to Python callbacks.
- **deck.gl + kepler.gl** [A, vis.gl/Uber] — WebGL2 layer compositor for millions of geospatial primitives. Examples: 200 k birds with GPU filtering; 3.6 M trips animated.
- **Cytoscape** [A, NIH-funded] — network viewer for biology with rich force-directed and hierarchical layouts. Also touched in WS-05.
- **Mathematica `Manipulate`** [A, Wolfram] — single function wraps any expression in a slider/animator UI; canonical 3D parameter-sweep.
- **ipyvolume / k3d / pythreejs** [B] — Jupyter widgets wrapping Three.js/WebGL; k3d covers surfaces, isosurfaces, voxels, volume rendering.
- **Houdini Solaris (LOPs)** [A, SideFX] — USD-based VFX scene assembly: every node mutates a USD stage; layers compose via sublayer/over/reference arcs. Industrial "scene as composed layers".
- **Onshape / Fusion 360** [A] — parametric assembly + constraints; section views with draggable plane manipulator; orbit pivots per-selection.
- **MeshLab** [B] — Quadric Edge Collapse and clustering decimation — the canonical LOD-source algorithms.
- **OpenSpace** [A, AMNH/NASA] — astro viz across 20+ orders of magnitude via a Dynamic Scene Graph.
- **Munzner, *Visualization Analysis & Design*** [A, CRC 2014] — source for the marks/channels framework.
- **Hopf et al., OLBVH octree volume rendering** [A, Springer 2020] — reference for octree-streamed volume LOD.

Tier tally: **A = 17, B = 3, C = 0**. Deeply analyzed below: ParaView/VTK, Mol\*/ChimeraX/PyMOL, Vega-Lite vs Three.js, deck.gl, Houdini Solaris USD.

---

## 1. Marks/channels in scientific 3D (extending Munzner)

Munzner's framework defines **marks** (geometric primitives) and **channels** (appearance attributes) for 2D. Scientific viz pushes this into 3D, where each cell of the matrix names a real, converged technique. "—" = conceptually possible but rare in practice.

| Mark ↓ \\ Channel → | Position (X,Y,Z) | Size / scale | Color (hue) | Color (luminance) | Opacity / α | Texture / pattern | Orientation | Animation |
|---|---|---|---|---|---|---|---|---|
| **Point (0D)** | scatter in 3D space (ipyvolume, Plotly Scatter3d) | bubble glyph (radius ∝ value) | category (molecular CPK colors) | confidence/density (heatmap) | density volumes (kepler.gl hex bins) | n/a (point has no surface) | glyph orientation (tensor glyphs in ParaView) | trajectory playback (MD in Mol*) |
| **Line (1D)** | streamlines, polylines, edges | tube radius ∝ flow magnitude | categorical pathway color | gradient along length | fade-out at distance | dashed/dotted pattern for predicted vs measured | tangent direction (intrinsic) | animated streaklines, ribbon flow |
| **Surface (2D)** | isosurfaces, terrain mesh, protein surface | scaled glyph instances | category color per region | scalar field shading | translucent shells (electron density) | hatching (engineering drawings) | normal-map shading | morphing surfaces (deformation playback) |
| **Volume (3D)** | volumetric grid (CT/MRI, EM tomograms) | voxel size = LOD | transfer-function color mapping | density-driven luminance | core technique — **transfer function** maps scalar→α | 3D solid texture (less common) | gradient-direction shading | time-varying scalar fields (4D MRI, climate) |
| **Region / cluster** | bounding hull / convex envelope | enclosed volume ∝ count | category color tint | — | translucent fill (Jarvis cluster pattern) | hatched region (uncertain extent) | rare — usually axis-aligned | grow/shrink to signal change |
| **Glyph / icon (composite)** | placed at anchor coords | scaled to importance | category color | confidence luminance | rare | n/a | **principal**: ellipsoid orientation = tensor eigenvectors | jitter to signal liveness |

Observations for Jarvis: (1) **Opacity becomes load-bearing in 3D** — primary mechanism for revealing interior (volume transfer functions, translucent shells, Jarvis cluster hulls). (2) **Position is over-loaded** — in 3D the (x,y,z) triplet often encodes spatial *geometry* (atom coords, geo lat/lon/elevation), leaving only color/size/opacity for *abstract* data. (3) **Animation is a first-class channel** — ParaView's animation view, Mol\*'s MD playback, Animated Vega-Lite all promote time from playback control to encoding dimension. (4) **Tensor glyphs** are the unique 3D primitive with no 2D analog — orientation only becomes distinguishable with three rotation axes.

---

## 2. Why molecular viz works well (PyMOL / ChimeraX / Mol\*)

Molecular viz is the most-studied "discrete objects in 3D" problem. A protein is the same shape of problem Jarvis has: thousands of discrete addressable units (atoms ≈ artifacts), in hierarchies (atom → residue → chain → assembly ≈ artifact → cluster → board), with non-trivial relationships (bonds ≈ edges). What it got right:

- **Multi-level pick mode.** PyMOL's `Selecting` toggle (atom/residue/chain/molecule) makes the same click select different granularity; ChimeraX uses outline highlighting to show which level is active. *Lesson:* one `LOD-select` modifier (alt-click escalates artifact → cluster → board) beats four parallel selection tools.
- **Algebraic selection language.** PyMOL's `select chain A and (resi 125-200) and (not name CA)` is Boolean algebra over named attributes; selections compose with everything else. *Lesson:* LLMs produce structured selection expressions reliably when the language is small and declarative. Jarvis should expose `kind=note and tag=auth and created>=2025-01` as a first-class concept, not an ad-hoc filter UI.
- **Center-of-rotation tracking.** ChimeraX's `cofr` (view/models/front-auto/independent) ensures the orbit camera always pivots around something meaningful. *Lesson:* Jarvis's orbit should pivot around focused artifact or cluster centroid, not world origin. #1 cause of "camera feels wrong" complaints.
- **Distance-thinned labels.** Atom labels within a few Å; residue labels to ~10 Å; chain labels always. *Lesson:* Jarvis's label LOD should be per-`kind`, not a single global slider.
- **Selection-driven camera framing.** `center sel` / `view sel` zooms, rotates, and rebinds the orbit pivot to the selection centroid in one action. *Lesson:* one canonical "focus on selection" action (single key or LLM tool-call) handling both navigation and pivot rebinding.
- **Representation switching at the same anchor.** Cartoon ↔ surface ↔ ball-and-stick swap freely while camera/selection stay put — data identity decoupled from render. *Lesson:* Jarvis artifacts should switch between card/icon/expanded-panel/ghost without re-anchoring.

Mol\* adds the **streaming dimension**: BinaryCIF + progressive model loading scales to hundreds of co-loaded structures. *Lesson for L4:* discrete primitives can be streamed individually, not as a single mesh blob — exactly Jarvis's case.

---

## 3. Declarative vs imperative 3D viz (Vega-Lite vs Three.js)

Two ends of the viz-API spectrum: **imperative** (Three.js, raw VTK, PyMOL commands) — developer builds the scene graph (`new Mesh(...); scene.add(mesh)`) with total control and total state responsibility — vs **declarative** (Vega-Lite, Plotly Express, Gosling) — developer writes a JSON spec (`{ data, mark, encoding: { x, y, color } }`) and a compiler picks axes, scales, legends, layout. Jarvis's R3F renderer is imperative.

For an LLM-driven canvas this is not stylistic — it's an architectural fork:

| Property | Imperative (Three.js) | Declarative (Vega-Lite) |
|---|---|---|
| LLM output for a chart | JS function (hundreds of tokens, hard to validate) | JSON spec (tens of tokens, schema-validatable) |
| Round-trip edit | Rewrite code, drift across edits | Patch JSON keys, deterministic merge |
| Cache hit rate | Very low (bespoke scenes) | High (same spec → same render) |
| Tool-call surface | Many fine-grained (move/color per object) | Few coarse-grained (set encoding, set transform) |
| User inspectability | Opaque (read code) | Self-describing (read spec) |
| Power ceiling | Anything WebGL allows | Bounded to grammar |

**Implication for Jarvis:** the layout agent and future viz agent should emit artifact/edge specs in a declarative grammar, not Three.js scene-graph code. The Layout agent's `reorganize` already emits position deltas (not mesh assignments) — that's the right direction. The next step is a Vega-Lite-style spec for artifact *appearance*: `{ kind: "note", encoding: { color: { field: "tag" }, size: { field: "importance" } } }` lets the LLM author entire visual schemes by patching JSON.

Animated Vega-Lite's framing — **time as a grammar entry** (`encoding.time = { field: "createdAt" }` is interpreted as "animate marks along this field") — maps cleanly onto Jarvis's "animated reasoning playback". A declarative spec lets the LLM design new playback patterns without renderer changes.

The right answer is a **two-layer system**: Vega-Lite-class declarative grammar for *artifact visual encoding and panel widgets*, atop a Three.js-class imperative scene for *layout, camera, animation*. This mirrors the deck.gl + react-map-gl split that has worked for geospatial for ~8 years.

---

## Lens pass

### L1 — Spatial primitives
Sci-viz uses 4 canonical marks (Munzner): **points** (atoms, samples), **lines** (streamlines, bonds), **surfaces** (isosurfaces, terrain), **volumes** (scalar fields with transfer functions — only case where the 3rd dimension is *intrinsic* to the data, not renderer-added). **Glyphs** (tensor ellipsoids, wind arrows) are a 5th composite primitive specific to 3D. VTK's pipeline (source → filter → mapper → actor) makes every primitive a transformation product, not a hard-coded shape.

### L2 — Data → form mapping
Standard mappings: scalar field → volume with transfer function (ParaView/VisIt); vector field → streamlines/glyphs/LIC (ParaView); tensor field → ellipsoid glyphs; mesh + scalar → colored surface; molecule → cartoon/surface/ball-and-stick (PyMOL/Mol\*); network → force-directed (Cytoscape); geospatial points → scatter/hex/arc/3D extrusion (deck.gl); tabular → marks + encoding (Vega-Lite). **Failure mode**: collapsing multiple data types into one form — flow magnitude into both width *and* color wastes a channel; categorical info in 3D position destroys the geometric reading.

### L3 — Camera & navigation
**Orbit-around-focus** is universal for discrete-object scenes; ChimeraX's `cofr` shows the design space (pivot = selection / bounding-sphere / screen-center / fixed). **Fly/walk** in OpenSpace and VR tools. **Section/clip planes** with draggable manipulator handles are essential for opaque/volumetric data (ParaView, VTK, Mol\*, Onshape). **Named viewpoints** in CAD/ChimeraX. **Multi-view** (4-pane) is CAD-standard but rare in newer tools. OpenSpace solves cosmic-scale (20+ orders of magnitude) via a **Dynamic Scene Graph** — coord frames shift as the camera crosses scale boundaries to avoid float blow-up.

### L4 — Level of Detail (LOD) — emphasized
Sci-viz pioneered every LOD technique now standard in games: **octree volume rendering** (terabyte volumes split into cells; only visible cells streamed; per-cell resolution scales with screen coverage); **mesh decimation** (MeshLab Quadric Edge Collapse builds an offline LOD chain; runtime picks by screen projection); **point-cloud thinning** (Potree hierarchical sampling); **streaming with progressive refinement** (Mol\* BinaryCIF, VTK streaming, deck.gl tiles — render coarse now, refine async); **aggregation marks** (kepler.gl points → hex bins past a density threshold — visibly a *different mark*, not denser scatter).

Recommended Jarvis thresholds: **10** = all detail + labels; **100** = distance-thinned labels, glyph icons at distance; **1 000** = clusters collapse to centroid markers; **10 000+** = heatmap/density rendering, individual objects only on hover. LOD is both **viewer-relative** (distance, screen coverage) and **data-relative** (importance, recency). Jarvis has data-relative scoring; viewer-relative thinning is missing.

### L5 — Anchoring (AR/VR-specific)
ChimeraX and Mol\* support WebXR; ChimeraX VR anchors the molecule to world space (table-top) by default, with HUD palettes. VTK.js added WebXR in 2022 — any VTK pipeline VR-renderable in-browser. CAD VR review (Fusion 360, Onshape) is nascent. Houdini Solaris USD loads in any USD VR viewer. Rest: N/A — desktop windows pinned to monitor pixels.

### L6 — Labels & legends — emphasized
Distance-thinning is **well solved** in molecular and CAD viz: thresholds are per-label-class and hand-tuned. PyMOL/ChimeraX use per-class labels (atom / residue / chain). CAD section views show dimension callouts only on the section line. Vega-Lite auto-generates legends with overlap-avoidance. AR label survey (2025) confirms the practical recipe: **leader-line + edge anchoring** + occlusion-aware repositioning + per-class thresholds.

### L7 — Selection & group operations
PyMOL's Boolean-algebraic selection language is the gold standard — selections are *named, persistent entities* you can re-reference. ChimeraX adds outline highlighting that survives representation changes. ParaView treats selection as a filter that feeds downstream filters. Cytoscape allows "save selection as group". Unifying pattern: **selections are entities, not highlights**.

### L8 — Attention flow
Sci-viz leans on **animation as primary cue**: ParaView time-scrub, Mol\* MD playback, OpenSpace ephemerides. CAD uses **edit indicators** — recently modified parts glow / get badges in the assembly tree. Less interrupt signaling than UI tools — user is in batch-analysis mode.

### L9 — Color system
Strict **separate scales per channel**. Categorical = qualitative palettes (CPK atoms, ColorBrewer Qualitative). Quantitative = perceptually uniform sequential (viridis/magma/inferno — ubiquitous after matplotlib ~2015). Diverging = RdBu/coolwarm. ParaView's transfer-function editor is a dedicated tool for *building* color+opacity scales. Vega-Lite enforces one scale per channel; mismatches are compiler errors. Colorblind-safety is baseline.

### L10 — Inter-view linking
**Brushing-and-linking** is 30+ years old — select in one view, highlights in all. Vega-Lite selection objects drive cross-view conditional encoding; ParaView shares selections across linked views; D3 + Observable use the reactive cell graph. **Pivot** (rebuild views around clicked entity) is rarer — most common in CAD assembly trees. **Brush-to-filter** is standard in BI and Vega-Lite.

### L11 — Process / reasoning representation
Scientific *computation* is usually hidden behind a "compute" button, but the visualization *pipeline* itself is exposed as a node graph (ParaView Pipeline Browser, VisIt tree, Houdini Solaris LOPs). Pattern: **process = editable data-flow graph**, result = 3D viewport. Cleaner than Jarvis's ActivityPanel-as-text-log. Room to render agent reasoning as a *visual pipeline* (input → tool-call nodes → output artifacts).

### L12 — Multi-user, sharing, persistence
Most desktop sci tools are single-user file-based (.vtk/.pml/.ply/.cmm). Mol\* and Vega-Lite are URL-shareable (full spec in URL/JSON). Observable is URL+fork. ParaView Web has shared sessions. Houdini's USD output is the industry interchange format. VR-collaborative sci-viz is still research. **Worth emulating**: USD-style layered scenes — each user/agent contributes a layer, composition is non-destructive, contributions are recoverable.

---

## Top patterns extracted

- **Visualization pipeline as data-flow DAG** — ParaView/VTK, VisIt, Houdini Solaris. Every visualization is the output of a named filter chain; users edit the chain, not the output. Makes provenance visible and edits non-destructive. Caveat: needs careful UI to avoid Houdini-style learning-curve cliff.
- **Algebraic named selections** — PyMOL, ChimeraX, ParaView. Boolean expressions over attributes produce persistent named sets that downstream commands reference. LLM-friendly, composable, deterministic. Caveat: needs an attribute schema the user understands.
- **Center-of-rotation tracking** — ChimeraX, Onshape, Fusion 360. Orbit pivot auto-binds to current selection/focus, not a static origin. Eliminates "camera feels wrong" complaints. Caveat: needs a clear UI signal when the pivot moves.
- **Section / clip planes with manipulators** — ParaView, VTK, Mol\*, Onshape. Draggable plane handle slices through opaque/volumetric data, revealing interior. Only practical way to inspect interior of an opaque shape. Caveat: rare in UI design — Jarvis could pioneer "section a cluster" gesture.
- **Per-class label thinning** — PyMOL/ChimeraX (atom < residue < chain thresholds), CAD callouts. Labels have a class-specific visibility distance. Respects the cognitive hierarchy of the data. Caveat: needs the right class taxonomy.
- **Declarative grammar with auto-compiled chrome** — Vega-Lite, Plotly Express, Gosling. Spec declares marks + encoding + data; library generates axes, legends, scales, layout. LLM-authorable, cacheable, schema-validatable. Caveat: bounded to grammar.
- **Time-as-encoding (animation grammar)** — Animated Vega-Lite, ParaView animation, Mol\* MD playback. Temporal field in encoding drives mark interpolation. Unifies static + animated semantics. Caveat: easy to over-animate.
- **Streaming + progressive refinement** — Mol\* BinaryCIF, ParaView, OpenSpace, deck.gl tiles. Render coarse immediately, refine async as data arrives. Maintains interactivity at any data scale. Caveat: needs LOD-friendly source data.
- **Aggregation as a different mark** — kepler.gl (points → hex bins), Cytoscape (nodes → metanodes). At a density threshold, marks are *replaced* by an aggregating mark, not just made smaller. Avoids "hairball" failure and signals the change. Caveat: must telegraph the mark change.
- **USD-style layered composition** — Houdini Solaris LOPs. Every contributor writes a layer; the stage composes via well-defined arcs. Non-destructive, multi-user-friendly, agent-friendly. Caveat: composition semantics confuse newcomers.

## Anti-patterns observed

- **3D position used for abstract data when intrinsic geometry exists** — early molecular hacks encoded extra attributes by perturbing atom z-coords; user loses both the abstract and geometric readings.
- **Single global color scale** — old Plotly defaults forced one colorbar even when channels had different semantics. Munzner-correct: one scale per encoding channel.
- **Imperative scripting required for routine charts** — pre-Vega-Lite D3 meant every bar chart was hundreds of lines; the grammar approach removed ~90% of that surface.
- **Camera orbit around a static origin** — universal complaint in beginner Three.js and older CAD without per-selection pivot binding.
- **"Hairball" force-directed at scale** — Cytoscape docs warn that >~1000 nodes becomes uninterpretable; aggregation/clustering needed earlier.

## Implications for Interactive Jarvis

- **Per-artifact-kind label LOD policy** — Lens L6. Files: `renderer/src/scene/Artifact.tsx`, new label-LOD config in `shared/`. Effort **S**. AR-readiness **+** (essential when text becomes spatial). Each `kind` gets `labelDistance: { full, abbreviated, hidden }`.
- **Bind orbit pivot to focused selection** — Lens L3. Files: `renderer/src/scene/Canvas.tsx` (OrbitControls), selection store. Effort **S**. AR-readiness **+** (more important in 6DoF). On selection change update `OrbitControls.target` to selection centroid; smooth with damping.
- **Algebraic selection language** — Lens L7. Files: `electron/main/agents/layout.ts` (tool defs) + new selection-resolver module. Effort **M**. AR-readiness **neutral**. PyMOL-style `kind=note and tag=auth and modified>2026-01`; result is a named persistent set reusable across agent calls.
- **Declarative visual-encoding spec layer** — Lens L2 + L9 (and the declarative-vs-imperative analysis). Files: `shared/` (new spec types), `renderer/src/scene/Artifact.tsx`. Effort **L**. AR-readiness **+** (specs survive renderer migration). Vega-Lite-inspired `kind → { encoding: { color, size, glyph } }`; layout agent emits, renderer compiles to Three.js material/scale.
- **Section-plane manipulator for "slicing" the board** — Lens L3 + L4. Files: `renderer/src/scene/Canvas.tsx`. Effort **M**. AR-readiness **+** (hand-gesture target). Draggable plane that hides artifacts in front; useful for "what's behind that cluster".
- **First-class persistent selections** — Lens L7. Files: `renderer/src/store/`, IPC. Effort **M**. AR-readiness **+**. A `Selection` entity with `id`, `name`, `query`, `members[]`; survives view changes; agent tools take `selectionId`.
- **USD-inspired layered persistence for multi-agent edits** — Lens L11 + L12. Files: `electron/main/db/` schema. Effort **L**. AR-readiness **+** (essential for collaborative AR). Each agent's contributions are a layer with provenance; merge at read time; user can mute/solo a layer. Largest item; later milestone.

## Open questions

- Is octree streaming overkill at Jarvis scale (<500 artifacts, not 500 M voxels)? Probably yes — but a 2-level LOD (full / glyph) is likely justified above ~200 artifacts.
- Right primitive for "panel" — textured plane (current), deck.gl-style layer, or Vega-embedded sub-canvas? Open until we have chart use-cases.
- Does a Vega-style time-encoding grammar map cleanly onto agent reasoning traces, or does playback need a new grammar?
- AR equivalent of a "section plane" — draggable hand-plane? voice-summoned slice? Needs user testing.
- USD-layered persistence is industry-standard but has UX cost (composition rules confuse newcomers). Is there a simpler model that still captures non-destructive multi-agent edits?

## References (full)

1. ParaView, "Introduction" — https://docs.paraview.org/en/latest/UsersGuide/introduction.html
2. VTK Book, Ch. 4 "The Visualization Pipeline" — https://book.vtk.org/en/latest/VTKBook/04Chapter4.html
3. LLNL, "VisIt" — https://hpc.llnl.gov/software/visualization-software/visit
4. Kitware, "VTK.js" — https://www.kitware.com/vtk-js-the-visualization-toolkit-on-the-web/
5. Kitware, "VTK.js + WebXR" — https://www.kitware.com/vtk-js-transforms-web-based-visualization-with-immersive-virtual-and-augmented-reality/
6. PyMOL Wiki, "Selection Algebra" — https://pymolwiki.org/Selection_Algebra
7. Compchems, "PyMOL selection tool" — https://www.compchems.com/pymol-selection-tool/
8. UCSF, "ChimeraX User Guide" — https://www.cgl.ucsf.edu/chimerax/docs/user/index.html
9. UCSF, "ChimeraX cofr command" — https://www.cgl.ucsf.edu/chimera/docs/UsersGuide/midas/cofr.html
10. Sehnal et al., "Mol* Viewer", *NAR* 49(W1) (2021) — https://academic.oup.com/nar/article/49/W1/W431/6270780
11. Satyanarayan, Moritz, Wongsuphasawat, Heer, "Vega-Lite: A Grammar of Interactive Graphics", InfoVis 2017 — https://idl.cs.washington.edu/files/2017-VegaLite-InfoVis.pdf
12. Vega-Lite docs — https://vega.github.io/vega-lite/
13. Pu, Kim, Chevalier, Satyanarayan, "Animated Vega-Lite" (2023) — https://vis.csail.mit.edu/pubs/animated-vega-lite/
14. D3 by Observable — https://d3js.org/
15. Plotly, "3D charts in Python" — https://plotly.com/python/3d-charts/
16. kepler.gl — https://kepler.gl/ and deck.gl Showcase — https://deck.gl/showcase
17. Cytoscape layouts — https://www.rapidops.com/blog/best-cytoscape-layouts-network-visualization/
18. Wolfram, "Manipulate" — https://reference.wolfram.com/language/ref/Manipulate.html
19. ipyvolume — https://ipyvolume.readthedocs.io/ ; K3D-jupyter — https://opendreamkit.org/2018/10/28/3d/
20. SideFX, "Houdini Solaris USD basics" — https://www.sidefx.com/docs/houdini/solaris/usd.html ; "How LOPs work" — https://www.sidefx.com/docs/houdini/solaris/about_lops.html
21. Onshape, "3D Section Views" — https://www.onshape.com/en/resource-center/tech-tips/behind-the-scenes-of-3d-section-view
22. Hopf et al., "OLBVH octree volume rendering", *The Visual Computer* (2020) — https://link.springer.com/article/10.1007/s00371-020-01886-6
23. MeshLib vs MeshLab decimation — https://meshlib.io/blog/meshlb-vs-meshlab-mesh-simplification/
24. NASA Science, "OpenSpace" — https://science.nasa.gov/sciact-team/openspace-project/
25. Munzner, *Visualization Analysis and Design*, CRC Press 2014 — https://www.cs.ubc.ca/~tmm/vadbook/
26. Levoy, "Display of Surfaces from Volume Data", *IEEE CG&A* (1988) — https://graphics.stanford.edu/papers/volume-cga88/volume.pdf
27. AR label placement survey (2025) — https://arxiv.org/html/2507.00198v1
28. ArcGIS, "Thinning — high-density data" — https://developers.arcgis.com/javascript/latest/visualization/high-density-data/thinning/
