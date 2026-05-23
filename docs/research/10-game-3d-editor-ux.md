# WS-10 — Game UX & 3D-Editor Patterns

**Scope:** What games and DCC (digital content creation) 3D editors have settled on for "lots of information, fast access, in 3D space" over decades of iteration. Tier A focus on Blender, Maya/3ds Max, Eve Online, StarCraft 2 / Civilization VI; Tier B sweep across MMOs, ARPGs, AR-future fictions, VR-native games, flight sims, city-builders, RTS minimaps; Tier C touch on async-multiplayer overlays, diegetic survival HUDs, and starship MFD extremism. Excludes node-graph editors (covered in WS-09) and broad scientific viz (WS-08); the focus here is on **camera + selection + label + attention** patterns that survive in commercial software with millions of users.

**Date:** 2026-05-23
**Sources consulted:** 14 primary + 10 supporting

---

## Tools / sources surveyed

- **Blender 5.1** — [tool, 2026] [https://docs.blender.org/manual/en/latest/editors/3dview/navigate/navigation.html]. The free 3D DCC reference. Orbit-focus camera with Alt-MMB re-pivot, modal G/R/S transform operators, N-panel / T-panel split, Workspaces tabs, viewport gizmo. **Deeply analyzed.**
- **Maya / Autodesk** — [tool, 2018-2024] [http://www.dgp.toronto.edu/~gf/papers/CHI99%20-%20Hotbox.pdf]. The Hotbox + Marking Menus (Kurtenbach & Buxton, CHI 1999) — radial menus that double as both novice menu and expert gesture. Customizable hotbox holds an "infinite" command vocabulary. **Deeply analyzed.**
- **3ds Max** — [tool, 2024] [https://help.autodesk.com/view/3DSMAX/2024/ENU/?guid=GUID-D97C423B-1AD4-46EA-892B-3A807823892C]. Reference gizmo design: X=red, Y=green, Z=blue; corner plane-handles for two-axis transforms; trackball rotate gizmo. **Deeply analyzed.**
- **Eve Online** — [tool, 2003-present, redesigned 2025-2026] [https://www.eveonline.com/news/view/new-default-overview-in-testing]. The Overview window plus space brackets — the strongest "label hundreds of distant objects" pattern in any commercial product. Two-line in-space brackets in 2026 default. **Deeply analyzed.**
- **StarCraft 2** — [tool, 2010-present] [https://sc2mapster.wiki.gg/wiki/UI/Layout_Tutorial]. Anchor-based UI layout, command-card discipline (3×3 grid), minimap polling rituals, multi-resource HUD. **Deeply analyzed.**
- **Civilization VI** — [tool, 2016-2024] [https://civilization.fandom.com/wiki/Lens_(Civ6)]. 11 lenses; togglable map overlays for religion, government, political ownership, etc. Same map geometry, different data layer painted on. **Deeply analyzed.**
- **Microsoft Flight Simulator 2024** — [tool, 2024] [https://docs.flightsimulator.com/msfs2024/html/5_Content_Configuration/Modular_SimObjects/Aircraft/Instruments/Instruments.htm]. Modular cockpit composition: G1000 PFD/MFD packages, pop-out instruments, modular avionics framework. The "panels can be popped out as separate windows" pattern.
- **Star Citizen MFDs** — [tool, 2020+] [https://starcitizen.tools/Multifunction_display]. Touchscreen MFDs in cockpits, multiple per ship, each can be retargeted between systems (power, scanner, comms). The extreme of cockpit complexity.
- **Cyberpunk 2077** — [game, 2020] [https://www.hudsandguis.com/home/2019/cyberpunk-2077]. AR-overlay vision of future UI: scanner highlights NPCs/objects with structural data, paths, threat tags. Predominantly text-based, off-red Terminator aesthetic.
- **Half-Life: Alyx** — [game, 2020] [https://en.wikipedia.org/wiki/Half-Life:_Alyx]. The reference for VR hand interaction: gravity gloves (telekinesis-grab), wrist holsters, over-shoulder backpack, one-handed weapons to keep hand free for world. **Deeply analyzed.**
- **Beat Saber** — [game, 2018] [https://medium.com/vr-review/the-breathtaking-simplicity-of-beat-sabers-vr-interface-9b5161c5cac5]. Non-diegetic floating UI with huge buttons readable from any distance, hand-touch activation. Almost no on-screen state during play.
- **Path of Exile passive tree** — [game, 2013+] [https://www.pathofexile.com/passive-skill-tree]. 1300+ nodes on a 2D infinite canvas with zoom; "suburbs and roads" mental model. Directly relevant to knowledge-tree navigation.
- **Cities Skylines** — [game, 2015+] [https://thunderstore.io/c/cities-skylines-ii/p/Cities2Modding/MapImageLayer/]. 29 "info views" — togglable overlays for traffic, pollution, education, land value, etc. — painted on the same 3D city.
- **World of Warcraft (ElvUI, Bartender)** — [addon ecosystem, 2004+] [https://www.wowhead.com/guide/elvui-addon-setup-customization]. Extreme UI density tolerance proven by ~20 years of community addons; player-built configs survive raid encounters with 40 simultaneous objects.
- **Death Stranding** — [game, 2019; sequel 2025] [https://deathstranding.fandom.com/wiki/Social_Strand_System]. Asynchronous overlays — other players' signs and structures appear in your world over time. Like-based reinforcement creates a self-curating spatial layer.
- **Subnautica** — [game, 2018] [https://medium.com/@tht13/beneath-the-surface-narrative-design-and-emotional-immersion-in-subnautica-e314f958a997]. Diegetic PDA — physical wrist device the avatar holds — vs minimal non-diegetic O2 meter. Hybrid that informs without breaking submersion.
- **Civilization VI lenses doc** — [primary] [https://www.civilopedia.net/en-US/standard-rules/concepts/world_7/].
- **Eve University Overview wiki** — [primary] [https://wiki.eveuniversity.org/Overview].
- **Kurtenbach 1991 PhD thesis on marking menus** — [paper] [https://www.research.autodesk.com/app/uploads/2023/03/the-design-and-evaluation.pdf_recHpUp1v9dc1n2CJ.pdf].
- **Blender Workspaces docs** — [primary] [https://docs.blender.org/manual/en/latest/interface/window_system/workspaces.html].
- **3ds Max Transform Gizmo docs** — [primary] [https://help.autodesk.com/view/3DSMAX/2025/ENU/?guid=GUID-D97C423B-1AD4-46EA-892B-3A807823892C].
- **gamedeveloper.com — UI Strategy Game Design Dos and Don'ts** — [supporting] [https://www.gamedeveloper.com/design/ui-strategy-game-design-dos-and-don-ts].
- **Tuts+ — Off-screen indicator math** — [supporting] [https://code.tutsplus.com/positioning-on-screen-indicators-to-point-to-off-screen-targets--gamedev-6644t].
- **Cyberpunk Game UI Database entry** — [supporting] [https://www.gameuidatabase.com/gameData.php?id=439].

---

## Special section 1 — Blender's camera + gizmos as model for desktop Jarvis

Blender is the most relevant single product for Jarvis's *current* desktop iteration. Its viewport idioms have been re-derived by every modern 3D tool because they solve real problems for users who spend 8 hours a day in 3D.

**Orbit-focus camera (L3).** MMB-drag orbits around a *point of interest*. Alt-click on any object re-sets that pivot to the clicked point. Numpad `.` (period) frames the current selection. The combination eliminates the "lost in space" failure mode that plagues fly-cameras: you always know what you're rotating around. Jarvis today uses `OrbitControls` with target re-snap on artifact click — partial implementation. **Missing pieces:** explicit "frame selection" hotkey (current `F` for follow is similar but not identical); explicit "frame all" reset (Home in Blender); persistent visual indicator of the current pivot point (Blender draws a small dot).

**View gizmo (L3).** Upper-right corner shows a clickable axis tripod (X/Y/Z). Click an axis to snap to that ortho view; drag the gizmo to orbit. Provides discoverability for users who don't yet know `Numpad 1/3/7`. Jarvis has a mini-map (good for L8) but no orientation gizmo — adding one in the corner would give users a "which way is up in this 3D space" anchor.

**Modal G/R/S operators (L7, L11).** The single most-copied pattern. `G` enters move-mode; mouse moves the object; `X/Y/Z` constrains to axis; `Shift+X` constrains to plane; typing `2.5` then Enter moves exactly 2.5 units; `Esc` cancels. The mode is *visible* (cursor changes, the object ghosts during move) and *reversible* (Esc returns to start). Compared to gizmo-only direct manipulation, modal operators are 2-3× faster for power users because there's no mouse travel to a tiny axis handle. **Direct transfer to Jarvis:** add modal `G/R/S` for moving artifacts and clusters in the scene, with axis-lock and numeric-entry. Affects `renderer/src/scene/` selection layer.

**N-panel and T-panel split (L7, L11).** Right-side N-panel (`N` key toggle) holds *properties* of current selection — read/edit fields. Left-side T-panel (`T` key) holds *tools* — current operator parameters. Separation matters: properties of the thing vs. parameters of the action. Jarvis's Inspector currently merges both into one right pane. Splitting them into N-style (artifact properties, edges, spec) and T-style (current agent action, layout parameters) would let users see what's happening *to* a selection while inspecting *what it is*.

**Workspaces tabs (L3, L10).** Top-bar tabs: Layout / Modeling / Sculpting / UV / Texture Paint / Animation / Rendering / Scripting. Each tab is a saved arrangement of editors + camera + visibility. Switching tabs = switching tool layout, not switching files. Jarvis bookmarks (Shift+1..9) save *camera positions* but not panel/HUD configurations. **Recommended:** extend Bookmarks to also save Inspector open/closed state, mini-map visibility, current Cluster filter, current 2D-ortho toggle. Effectively → "Research mode" vs "Reading mode" vs "Layout mode" tabs.

**Quad-view (L3).** `Ctrl+Alt+Q` splits the viewport into Top/Front/Right/Perspective. Useful for precise placement when you need to see along multiple axes. Probably *not* useful for Jarvis (artifacts don't have axis-precise positions worth checking from three sides), but the underlying split-screen pattern is — splitting the canvas into "scene" + "outline list" + "details" would unlock comparison workflows.

**Pattern summary:** Jarvis should not invent new viewport idioms when Blender's are this thoroughly tested. The cheapest wins are modal G-key, N-panel split, and orientation gizmo.

---

## Special section 2 — Brackets at distance: Eve Online + flight sims

The hardest visual problem for an immersive Jarvis is: "I'm 200m from a cluster of 50 artifacts; what *are* they?" Eve Online has solved this for 20+ years at the scale of *thousands of objects in a single grid*, most of them player ships at varying distance.

**Anatomy of an Eve in-space bracket.** A bracket is a small icon (10-20px) that hovers over a distant object. It carries:
1. A **type icon** (cruiser, frigate, station, asteroid) — readable at one glance from shape alone.
2. A **threat color** (player corp standing) — blue=friendly, red=hostile, white=neutral.
3. A **distance label** (e.g., "32km").
4. A **name string** (player or NPC name).
5. **Active state** (selected=highlighted, locked=square corners, targeting=animated).

In the 2025-2026 default overview, brackets render on **two lines** with text formatting (bold for name, dim for distance). The Overview *window* — a separate scrollable list — duplicates the same information as a sortable table, and selection in either view highlights the other. **This is exactly the linked-highlighting pattern Jarvis needs between mini-map and scene** (L10).

**Bracket aggregation.** When dozens of brackets overlap on screen, Eve clusters them into a numeric badge ("12 ships within 5km") and lets the user drill in. The mini-map equivalent shows "20+" with no per-bracket clutter. Jarvis already does *cluster* aggregation in 3D space but lacks the "too many overlapping labels collapse to count" rule. Adding bracket-overlap-collapse at ≥4 overlapping labels would prevent label-thrash at desktop resolution.

**Flight sim variant: instrument-style annotation.** MSFS 2024 and Star Citizen use HUD-level brackets that combine pip + ID + distance + threat type, attached to objects via screen-projection of world coordinates. The pattern is identical in mechanism but adopts a fixed-position, monospace-text aesthetic appropriate to a cockpit. **Implication:** the *information schema* (icon + name + distance + state) is invariant across genres; only the visual styling adapts.

**Brackets must obey LOD rules (L4 + L6).** Eve's brackets fade with distance: at >250km, brackets become tiny dots; on overview-only display, they vanish entirely from the 3D scene. This protects screen real estate. Jarvis's current label-always-on policy for artifacts will break at ~30 visible artifacts; brackets-with-distance-fade is the proven escape hatch.

**For Jarvis future AR mode.** Brackets are the *answer* to L6 in AR — text floating in space at 2m looks fine, text at 20m is unreadable, text at 200m is invisible. The Eve pattern translates directly: a small floating bracket with text-on-billboard, scaled by inverse-distance with a floor and ceiling, and a "show overview list" wrist or palm panel for cases where the user wants a sortable table view.

**Pattern transfer summary:**
- Each artifact gets a bracket: kind-icon + shortName + (optional) distance + selection state.
- Brackets billboard toward camera with `troika-three-text` (R3F-native, AR-portable).
- Aggregate when ≥4 brackets overlap within ~40px screen distance → show a "+N" badge that drills into a hover-list.
- Bracket text-size = clamp(8px, k/distance, 14px) at desktop; analogous arc-distance rule at AR.
- Add an "Overview window" — sortable list of all artifacts in current cluster/scene, with linked highlight to brackets.

---

## Special section 3 — Marking menus and radial menus

Kurtenbach and Buxton at Toronto/Autodesk (CHI 1993, 1994, 1999) proved a result that has shaped 30 years of DCC tools: **a radial menu that the user can also draw blind, as a gesture, is 3.5× faster than a linear menu** once memorized, while still being self-revealing for novices.

**Three design principles:**
1. **Self-revelation** — holding the trigger reveals the menu visually. The user can always learn by waiting.
2. **Guidance** — the menu shows where to draw, while the user is drawing.
3. **Rehearsal** — every novice selection is a practice rep for the expert gesture. There is no "different mode" to learn.

**Why radial > linear for muscle memory:** spatial direction is encoded by the motor cortex; an "up-then-right" stroke becomes proprioceptive after a few dozen reps. Linear menus require visual scan + click, which never becomes blind.

**Hierarchical marking menus.** Maya's Hotbox extends the pattern to ≥4 levels: a single button-hold can produce a multi-segment "compound mark" — e.g., right-down-left — that descends through 3 nested menus in one stroke. Expert users execute commands in ~250ms with no menu ever appearing. This is the **scaling answer**: 8 items per level × 4 levels = 4096 commands accessible by one button + gesture.

**Direct transfer to AR hand-input (relevant for Jarvis future).** Pinch-and-drag in air is the AR equivalent of mouse-down-and-drag. Visionos and Quest 3 already use this as a primary input. A radial menu that pops up on pinch-hold and accepts a directional flick is:
- Hardware-aware (uses the pinch-distance the headset already tracks)
- Glanceable (the menu billboards in front of the gaze)
- Eyes-free at expert level (no need to look)

**Recommended placement in Jarvis:**
- **Right-click on artifact** → marking menu with N/E/S/W: open-inspector / promote-to-cluster / delete / new-derived-from. Maya's "default 4 directions" rule keeps the gesture vocabulary small enough to memorize.
- **Spacebar-hold + drag** → marking menu for *creation* commands: new-artifact / new-cluster / new-board / new-edge-from-selection. Spacebar is the Blender command-palette equivalent in many tools.
- **Future AR**: pinch-and-hold left hand → palm-anchored marking menu, right hand executes the directional flick. Beat Saber-style "huge buttons readable at distance" for the visible state.

**Anti-pattern to avoid:** "context menu with 30 items" — flat lists kill discoverability and never become muscle memory. Cap each radial level at 8 (Maya's optimum); use sub-menus if more needed.

---

## Special section 4 — Diegetic vs HUD UI in VR (Alyx, Beat Saber)

The polar examples in VR-native UX. Both shipped to critical acclaim, with opposite philosophies — which suggests *both win for different goals*.

**Half-Life: Alyx (diegetic).** All "UI" is an object in the world.
- **Health/ammo** is read off the gun itself or the inventory slot, not from a floating HUD.
- **Inventory** = wrist gauntlets (left wrist + right wrist hold one item each, glanceable by tilting wrist).
- **Backpack** = reach-over-shoulder gesture retrieves resin/ammo. Diegetic gesture, no menu open.
- **Weapon swap** = pull from holster on opposite hip / shoulder. The "where the gun is" becomes the menu.
- **Gravity gloves** = telekinesis grab with a flick gesture. Lets the player interact with distant objects without walking — the *only* explicit "UI" affordance is a subtle highlight on grabbable objects when looked at, no on-screen prompt.

Result: zero floating HUD during gameplay. The world is the interface. Cost: every action has to be learnable physically; some users took 2-3 hours to internalize the gauntlet inventory.

**Beat Saber (non-diegetic, but minimal).** UI elements are explicit floating panels, but:
- During gameplay, almost no UI — just score in the corner and the saber controllers in your hands.
- In menus, **huge buttons (~30cm equivalent)** that any user can touch from any angle.
- High-contrast color on dark background — readable in any HMD.
- Hand-touch activation; no joysticks-as-menu-pointer.

Result: a 5-year-old can use the menu without instruction. Cost: visual style is "rave / kiosk", not "personal workspace".

**Synthesis for Jarvis future AR mode.**

| User goal | Best approach | Why |
|---|---|---|
| Persistent data (artifact body, edges, layout) | Diegetic — the artifact *is* the UI | Avoids HUD clutter, scales with content |
| Transient action (create artifact, run agent) | Non-diegetic floating panel | Discoverable, no need to find a "tool table" in space |
| Status (agent running, edits pending) | Diegetic glow / aura on the affected artifact | Doesn't fight for attention with persistent UI |
| Settings / preferences | Non-diegetic, wrist or palm anchored | Rarely accessed; muscle memory + simple grid |
| Inspector (detailed read of one thing) | Non-diegetic panel summoned next to selection | Alyx-style "menu in the world but at hand" |

**The decision rule:** *if the data is about the world, put it in the world; if the action is about the system, put it on a panel.* Jarvis's current Inspector breaks this by being a screen-edge DOM panel — it should become a floating R3F panel that summons next to the selected artifact (desktop) or pin to the user's left palm (AR).

**Don't copy Alyx wholesale.** A productivity tool is not a game. The 2-3-hour learning curve for diegetic-everything is unacceptable for daily work. Jarvis should be **mostly non-diegetic floating panels** with diegetic *enhancements* (artifact glow for state, edge pulse for data flow, aura for agent activity).

---

## Lens pass

### L1 — Spatial primitives

Games use a broader vocabulary than DCC tools:
- **Blender / Maya / 3ds Max:** mesh, curve, light, camera, empty (transform-only), modifier stack, gizmo, axis grid.
- **Eve Online:** ships, structures, brackets (label-objects in space), grid (~250km local region), overview-list (UI panel).
- **Cyberpunk 2077:** scanner-highlighted entities, AR overlay labels, in-world signs, holo-call portrait.
- **StarCraft 2:** units, buildings, command card slots (3×3), minimap region, control groups.
- **Half-Life: Alyx:** prop-objects, wrist holsters (containers), pickup-volume around hand, world signage.

The pattern Jarvis is missing: **brackets as a separate primitive from the artifact they label**. Bracket lives at screen-space; artifact lives at world-space. Decoupling lets brackets follow LOD rules without touching artifact geometry.

### L2 — Data → form mapping

Games map data → form *aggressively* (a strong contrast to BI tools):
- **Civ VI lenses:** same hex map; data shown as colored fill, animated arrows (religious pressure), pulsing markers (resources). One map, many overlays — exactly the multi-overlay paradigm Jarvis should adopt.
- **Cities Skylines:** 29 info views — traffic = colored road lines, pollution = green-to-purple cloud, education = circle radii from schools. Same 3D city; toggle changes the painted overlay only.
- **Blender:** vertex group weights → red-to-blue heat on mesh. Modifier modifiers stack visualized as a list, not as a graph.
- **Eve:** ship icons by class; color by standings; size constant (because real ships are huge → all need to be visible).
- **MSFS / Star Citizen:** each cockpit panel is a *configurable* display — same physical screen, retargetable to scanner / map / power / radar.

**Pattern for Jarvis:** "Lens" as a first-class concept. The base scene shows artifacts + edges; a lens overlay can repaint to show last-edit-recency, agent-confidence, kind-distribution heatmap, etc. Civ VI's keyboard `1-9` lens toggles map perfectly onto Jarvis bookmarks (Shift+1..9).

### L3 — Camera & navigation

DCC convention: **orbit-around-pivot** + numeric-keypad-ortho-views. Games convention: **third-person follow** or **first-person** + minimap. Both converge on "named viewpoints" (cameras in Blender; bookmarks in Eve; control-groups-as-camera in SC2 via double-tap).

- **Blender orbit (MMB-drag) with Alt-MMB pivot re-snap** is the gold standard for "I'm exploring this 3D scene as a god, not embodied in it." Jarvis is correctly in this camp.
- **Quad-view (Top/Front/Right/Perspective)** is for axis-precise placement; not useful for Jarvis.
- **Civ VI strategic view** = zoom out far enough to see the whole world; reads as a different visual mode (cleaner, more iconic) while remaining the same camera type. Jarvis's 2D-ortho mode (T key) is a similar pattern but more aggressive (different projection).
- **Eve "warp to" + "dock" + "jump"** = teleport between named anchors. The bookmark in Eve doubles as a teleport destination. Jarvis bookmarks should optionally animate-camera-to or jump-camera-to — currently they only restore camera position; let them also pull selection into frame.

### L4 — Level of Detail

Games are the LOD masters and the most relevant lessons are at the **10K-object** scale:
- **Eve Online**: at 200km distance brackets drop to dots, then to overview-only.
- **Cities Skylines:** car models replaced with colored dots when zoomed out, pedestrian rendering disabled, traffic shown as flow lines instead of vehicles.
- **Blender:** wireframe-on-far-LOD, simplified shading, optional bounding-box-only display per object.
- **WoW:** distant nameplates disappear; only friendly/hostile silhouette + threat color survives.
- **MSFS:** terrain tile LOD; airports at high LOD only when nearby.

**LOD policy template for Jarvis (10/100/1k/10k):**
- 10: full artifact card, label, all edges, agent-aura visible.
- 100: card simplified to colored quad with shortName; edges thinned; clusters become translucent volumes.
- 1k: artifacts become dots colored by kind; edges visible only for selection + hover-neighborhood; clusters opaque.
- 10k: only clusters visible as territory shapes; individual artifacts only on zoom-in. Use Eve's "overview list" pattern as the alternative read path.

### L5 — Anchoring

Mostly N/A for desktop DCC tools (everything is screen-anchored). For VR games:
- **Alyx:** world-anchored objects, hand-anchored inventory (wrist gauntlets), head-anchored nothing. Backpack is body-anchored (over-shoulder reach).
- **Beat Saber:** world-anchored (track + cubes), hand-anchored (sabers), head-anchored (score in fixed FOV slot).
- **MSFS VR:** cockpit-anchored (the cockpit *is* world from your seat), head-anchored nothing.

Strong pattern: **menus = palm or wrist; persistent UI = world; status = body-relative.** Jarvis future AR should follow this.

### L6 — Labels & legends

This is the lens game UX dominates. Strategies seen:
- **Always-on:** SC2 unit names (toggleable), Civ VI city names.
- **Hover-only:** Blender object names (in default view), DCC modifier tooltips.
- **Distance-thinned:** Eve brackets, WoW nameplates beyond 30m.
- **Voice-spoken on focus:** rare in games; common in Alyx-style audio-cue augmentation.
- **Overview-window alternate path:** Eve's overview, Star Citizen's MFD comms list. *The user always has a sortable list as a fallback when in-world labels are insufficient.*

**Combined pattern:** always-on for selection + cluster names; distance-thinned for individual artifacts; overview-list as an alternate-access panel. Currently Jarvis has bracket-less always-on labels (DOM `<Html>` overlays) — these will not scale beyond ~30 visible artifacts.

### L7 — Selection & group operations

DCC tools have the deepest vocabulary:
- **Click** = select one; **Shift-click** = add/remove; **Drag-box** = box-select; **Ctrl-L** in Blender = select linked (whole graph component); **L** = select connected at the hover point.
- **Maya marking menu on select** = "select hierarchy", "select all of type", "invert".
- **Eve overview right-click** = "lock target", "warp to", "approach", "scan" — group action on the *type-filtered* selection.
- **SC2 control groups (Ctrl+1..9)** = save selection as a hotkey; tap once to select, double-tap to camera-snap. This is the killer feature for managing many simultaneous targets.

**Jarvis gaps:** no select-linked operation (select all artifacts reachable through edges from the current selection), no type-filter selection ("select all artifacts of kind=chart-panel"), no control-group-style saved selections. Adding Ctrl+1..9 as saved-selection (separate from Shift+1..9 bookmarks) would let the user manage "current investigation set" vs "background context set".

### L8 — Attention flow

Game vocabulary:
- **Minimap ping** — SC2, WoW: animated circle on minimap + audio cue when an ally needs help. Optional voice ("help!") for accessibility.
- **Screen-edge arrow** — used in racing/RPGs to point at off-screen objectives. Math: project world point to screen; if outside frustum, clamp to edge + rotate arrow.
- **Audio cue** — Civ VI's distinct sounds for "research complete" vs "civic complete" vs "trade route lost". Spatial 3D audio in Alyx pulls attention to a sound source.
- **Animation (subtle):** Eve's targeting-progress ring around a bracket; pulse on a unit taking damage.
- **Notification bloom:** Civ's bottom-of-screen log with severity colors; Cyberpunk's quest-update flashes top-right.

**Rate limiting:** All games impose a "no more than N events per second visible" rule; queue the rest. The failure mode "spam stream of notifications" is what users hate.

**Jarvis transfer:** when a background agent finishes a long task on an artifact not in view, fire a (a) mini-map ping at the artifact location, (b) screen-edge arrow if off-screen, (c) optional audio cue. Suppress if user has dismissed >3 events in last 60s (likely not paying attention to this stream).

### L9 — Color system

Game color systems are **conflict-tolerant** through separation of channels:
- **Standings color** (red/orange/yellow/green/blue/teal) for hostility — independent from
- **Resource color** (mineral=blue, vespene=green in SC2; food=green, science=cyan, gold=yellow in Civ) — independent from
- **State color** (selected=highlight, damaged=red flash, building=green progress bar) — independent from
- **Type icon** (carries categorical info without color)

The trick: **never overload one channel with two meanings.** Jarvis currently uses color for kind (categorical) — that's one channel. Adding a second channel for state (last-edit recency, agent-touched, contested) requires either a second channel (border vs fill, outline glow vs base color) or a side-by-side approach (small badge corner on the artifact card).

### L10 — Inter-view linking

Eve's Overview ↔ in-space brackets is the canonical model — selecting in either highlights the other. SC2's minimap ↔ main view, Civ's diplomacy panel ↔ city on map. Blender's outliner ↔ viewport is the desktop equivalent.

**Always linked-highlight as default**; brushing rare in games (more BI). Jarvis already does this between scene and mini-map; should extend to Inspector ↔ scene (currently the Inspector is decoupled).

### L11 — Process / reasoning representation

Games make *agent activity* visible through:
- **Build progress bars** (SC2's "Probe building Pylon, 60%" with a ring around the worker).
- **Targeting reticule progression** in Eve (lock-on takes seconds; visible ring fills as the lock acquires).
- **Animated path lines** (Civ VI shows a unit's planned move with a dotted arrow; SC2 shows a move command with a green line briefly).
- **Tool-tip on hover** that shows what an action *will* do (Blender modifier preview; ghost-of-result preview in Alyx for grabbing).
- **Combat log** (WoW) — scrolling text log of every event; players can scroll back to debug.

**Jarvis transfer:** the agent reasoning trace is currently in ActivityPanel — that is "combat log" (good, keep). What's missing is the *spatial* equivalent: an animated path from agent → artifact → result, fading after completion. Also missing: ghost-preview of what the Layout agent will move before it commits.

### L12 — Multi-user, sharing, persistence

Mostly N/A for DCC (file-based, single user). For games:
- **Death Stranding:** asynchronous structures + signs from other players appear in your world, with like-economy reinforcement. Like an *async curated overlay* — a moderation pipeline turns 10K player contributions into ~3 visible to you, by relevance/likes.
- **Eve / WoW:** real-time multi-user; chat panels, shared overview, fleet command UI.
- **MSFS shared cockpit:** two players in the same plane, mouse cursors visible to each other.

Death Stranding's pattern is **deeply relevant to multi-user Jarvis**: as more users build clusters of knowledge, the system needs to curate what *others* show you — not all of it, only the highest-signal pieces.

---

## Top patterns extracted

- **Modal-key operators (G/R/S)** — Where: Blender. Mechanism: hotkey enters mode; mouse drives; axis-lock + numeric entry. Why works: 2-3× faster than direct manipulation for experts. Caveat: needs visible mode indicator or new users feel "stuck".
- **Marking menu (radial gesture)** — Where: Maya, 3ds Max, Houdini. Mechanism: button-hold reveals radial menu; flick direction executes; same gesture works blind for experts. Why: muscle memory + self-revealing. Caveat: cap at 8 per level.
- **Hierarchical hotbox (compound mark)** — Where: Maya. Mechanism: multi-direction stroke descends multiple menu levels in one continuous motion. Why: hundreds of commands accessible in ~250ms expert time. Caveat: only for users who commit.
- **Brackets at distance** — Where: Eve Online, Cyberpunk 2077, MSFS, flight sims. Mechanism: small icon + name + distance + state hovers over object; thinned by distance; collapsible to dots; overview-window alternate. Why: scales label rendering to thousands of objects. Caveat: needs careful occlusion ordering.
- **Lens overlay system** — Where: Civ VI, Cities Skylines. Mechanism: same base view; keyboard-toggled colored overlay paints data. Why: doesn't fragment workspace, leverages spatial memory. Caveat: limit to ≤2 concurrent lenses or visual mud.
- **Workspaces / saved layouts** — Where: Blender, Maya, MSFS pop-out panels, Star Citizen MFD profiles. Mechanism: tabs/profiles save panel arrangement + visibility + camera. Why: task-switching without losing context. Caveat: users need a "restore default" escape hatch.
- **Control groups (Ctrl+1..9)** — Where: SC2, WoW raid frames, RTS in general. Mechanism: save current selection to numeric hotkey; tap to select, double-tap to camera-snap. Why: lets users manage many parallel targets. Caveat: collisions with bookmarks if same key.
- **Diegetic-state, non-diegetic-action UI** — Where: Alyx (mostly diegetic) + Beat Saber (mostly non-diegetic). Mechanism: data lives in world (glow on grabbable, ammo on gun); commands live on floating panels. Why: data scales with content, commands stay discoverable. Caveat: pure diegetic has steep learning curve.
- **Overview window ↔ scene linked highlight** — Where: Eve, SC2 minimap, Civ city list. Mechanism: sortable list duplicates the spatial view; selection in either highlights the other. Why: gives users a "table view" fallback when spatial gets cluttered. Caveat: must stay in sync (cost of cross-view selection).
- **Off-screen arrow + minimap ping** — Where: all RTS, RPGs. Mechanism: project world-point to screen; if outside, clamp + arrow; ping the minimap concurrently. Why: pulls attention without modal interrupt. Caveat: rate-limit to avoid spam.

---

## Anti-patterns observed

- **30-item context menu** (any non-marking-menu DCC tool's right-click). Failure: never becomes muscle memory, scanning cost grows linearly. Replace with marking menu + sub-menus.
- **Always-on dense HUD** (WoW default UI; Star Citizen default cockpit). Failure: users start ignoring it. Mitigation: fade non-essentials, demand-on-hover, configurable density (ElvUI).
- **Sticky modal that user can't escape** (early Blender modal operators without visible exit hint). Failure: users feel trapped. Fix: always show "Esc to cancel" hint.
- **HUD elements competing for one corner** (Cyberpunk 2077's top-right has 4 systems fighting). Failure: visual mud. Fix: each corner one "owner" system; supplement with screen-edge brackets.
- **Brackets without LOD** (Eve circa 2010 — would render hundreds of labels causing CPU stutter and unreadable mud). Fix: aggregate ≥4 overlapping into "+N" badge.
- **Cybersickness from mode-switching** (early VR with abrupt camera teleports without fade). Fix: 100-200ms fade between camera modes.
- **Diegetic-everything purism** (some Alyx mods). Failure: settings/preferences need menus; users hate hunting in 3D for a slider. Fix: hybrid model.

---

## Implications for Interactive Jarvis

1. **Add modal G/R/S transform for artifacts and clusters.** Maps to L7. Affects `renderer/src/scene/canvasInput.ts` (selection handling), `renderer/src/scene/Artifact.tsx` (ghost-during-move state). Effort: **M**. AR-readiness: **neutral** (gesture equivalent for AR is pinch-and-drag; same conceptual model).

2. **Brackets-with-LOD replacing always-on labels.** Maps to L4 + L6 (the critical AR enabler). Affects `renderer/src/scene/Artifact.tsx` (replace `<Html>` label with `troika-three-text` billboard), `renderer/src/scene/LabelLayer.tsx` (new collapse-on-overlap logic). Effort: **L** (text rendering swap is the AR-readiness wedge issue). AR-readiness: **+** strong (DOM Html doesn't survive WebXR; this fixes it).

3. **Lens overlay system (data lens like Civ VI).** Maps to L2 + L9. Affects `renderer/src/scene/Scene.tsx` (lens dispatcher), new `renderer/src/scene/lenses/*` modules. Lenses to ship: recency, kind-density, agent-touched, edge-degree. Keyboard `L` to cycle, `Shift+L` to clear. Effort: **M**. AR-readiness: **+** (lens system is geometry-agnostic).

4. **Marking menu on right-click and Spacebar-hold.** Maps to L7 + L11. Affects `renderer/src/scene/canvasInput.ts`, new `renderer/src/ui/MarkingMenu.tsx`. 8-item cap per level; 2 levels max for v1. Effort: **M**. AR-readiness: **+** (radial pinch-menus are the dominant AR input idiom).

5. **Workspaces / saved layouts** (extend Bookmarks).  Maps to L3 + L10. Affects `electron/main/persistence.ts` (extend Bookmark schema to include panel visibility, current lens, current cluster filter), `renderer/src/ui/BookmarksPanel.tsx`. Pre-seed three workspaces: "Compose", "Read", "Layout". Effort: **S**. AR-readiness: **neutral**.

6. **Overview window ↔ scene linked highlight.** Maps to L7 + L10. Affects new `renderer/src/ui/OverviewPanel.tsx` (sortable table of current scene artifacts: shortName, kind, distance-from-camera, last-edit), reuse existing event bus for selection-sync. Effort: **S**. AR-readiness: **+** (palm-anchored table view in AR; same component).

7. **Off-screen arrow + minimap ping for agent-activity at unseen artifacts.** Maps to L8. Affects `renderer/src/scene/MiniMap.tsx`, new `renderer/src/scene/OffscreenArrowLayer.tsx`. Rate-limit to 1 ping/second; suppress if >3 ignored in 60s. Effort: **S**. AR-readiness: **+** (head-anchored peripheral indicators are an AR comfort pattern).

---

## Open questions

- **How many concurrent lenses can stack visually before becoming mud?** Civ VI shows one at a time. Cities Skylines allows one info-view + the base render. Would a Jarvis "kind-density + recency" combo work, or do we need additive design? Needs prototype.
- **Marking menu vs. command palette for AI commands?** Spotlight-style fuzzy-search (`Cmd+K`) is the modern alternative. Marking menu wins on muscle memory but loses on discoverability for the "I forget the command name" case. Hybrid?
- **Where does diegetic state live for a non-physical artifact?** A ChatGPT "card" doesn't have a hand to look at; its state is metadata. Should the artifact's geometry encode state (size = importance, glow = recent edit, tilt = uncertainty)? At what point does this become a Tufte-style sparkline-on-object pattern vs. just bad?
- **Async-multiplayer Death Stranding pattern for shared knowledge graphs?** When multiple Jarvis users collaborate via shared fs-sync, do we show others' artifacts at all? With what curation/like-economy? Out of scope for v1 (single-user), but the moderation problem applies.
- **At what frame rate / artifact count does the bracket-collapse rule fire?** Need empirical test. Eve's threshold is ~4 in 40 screen-pixels; might need to be denser at desktop high-DPI.

---

## References (full)

1. Blender 5.1 Manual — Navigation. https://docs.blender.org/manual/en/latest/editors/3dview/navigate/navigation.html
2. Blender 5.1 Manual — Workspaces. https://docs.blender.org/manual/en/latest/interface/window_system/workspaces.html
3. Blender 5.1 Manual — Operators. https://docs.blender.org/manual/en/latest/interface/operators.html
4. CGCookie — Blender G/R/S shortcut keys. https://cgcookie.com/community/18549-blender-4-1-g-r-and-s-shortcut-keys
5. Kurtenbach, G. — *The Design and Evaluation of Marking Menus* (PhD thesis, U. Toronto, 1993). https://www.research.autodesk.com/app/uploads/2023/03/the-design-and-evaluation.pdf_recHpUp1v9dc1n2CJ.pdf
6. Kurtenbach, G. & Buxton, W. — User Learning and Performance with Marking Menus (CHI 1994). https://dl.acm.org/doi/10.1145/191666.191759
7. Fitzmaurice, G. et al — *The Hotbox: Efficient Access to a Large Number of Menu-Items* (CHI 1999). http://www.dgp.toronto.edu/~gf/papers/CHI99%20-%20Hotbox.pdf
8. Autodesk Maya Customizing the Hotbox docs. https://knowledge.autodesk.com/support/maya/learn-explore/caas/CloudHelp/cloudhelp/2018/ENU/Maya-Customizing/files/GUID-F182139D-1E00-44E6-9D79-4AF053860EDA-htm.html
9. Autodesk 3ds Max 2025 — Using Transform Gizmos. https://help.autodesk.com/view/3DSMAX/2025/ENU/?guid=GUID-D97C423B-1AD4-46EA-892B-3A807823892C
10. CCP Games — Eve Online Overview Settings (official). https://support.eveonline.com/hc/en-us/articles/203273831-Overview-Settings
11. CCP Games — New default overview in testing (news 2025-2026). https://www.eveonline.com/news/view/new-default-overview-in-testing
12. EVE University — Overview wiki. https://wiki.eveuniversity.org/Overview
13. SC2Mapster Wiki — UI/Layout Tutorial. https://sc2mapster.wiki.gg/wiki/UI/Layout_Tutorial
14. Liquipedia — StarCraft 2 Minimap. https://liquipedia.net/starcraft2/Minimap
15. Civilization Wiki — Lens (Civ6). https://civilization.fandom.com/wiki/Lens_(Civ6)
16. Civilopedia — Lenses concept. https://www.civilopedia.net/en-US/standard-rules/concepts/world_7/
17. Microsoft Flight Simulator 2024 SDK — Instruments. https://docs.flightsimulator.com/msfs2024/html/5_Content_Configuration/Modular_SimObjects/Aircraft/Instruments/Instruments.htm
18. Star Citizen Wiki — Multifunction display. https://starcitizen.tools/Multifunction_display
19. HUDS+GUIS — Cyberpunk 2077 analysis. https://www.hudsandguis.com/home/2019/cyberpunk-2077
20. Interface In Game — Cyberpunk 2077 UX/UI Critique. https://interfaceingame.com/articles/cyberpunk-2077-ux-ui-critique/
21. Wikipedia — Half-Life: Alyx. https://en.wikipedia.org/wiki/Half-Life:_Alyx
22. TransformInteractive — What Half-Life: Alyx Taught Us About VR Development. https://transforminteractive.com/what-half-life-alyx-taught-us/
23. Medium / Alvarez Trentini — Beat Saber's VR Interface. https://medium.com/vr-review/the-breathtaking-simplicity-of-beat-sabers-vr-interface-9b5161c5cac5
24. Medium / Sawant Darshini — Beat Saber UI Analysis. https://medium.com/@sawantdarshini/beat-saber-vr-a-ui-ux-and-interaction-analysis-of-immersive-game-design-in-vr-d9a8039d9ee0
25. Path of Exile — Passive Skill Tree (official). https://www.pathofexile.com/passive-skill-tree
26. PoE Wiki — Passive Skill. https://www.poewiki.net/wiki/Passive_skill
27. Wowhead — ElvUI Setup & Customization. https://www.wowhead.com/guide/elvui-addon-setup-customization
28. Thunderstore — MapImageLayer (Cities Skylines 2 overlay mod). https://thunderstore.io/c/cities-skylines-ii/p/Cities2Modding/MapImageLayer/
29. Cities Skylines Information Panel guide. https://guides.gamepressure.com/citiesskylines/guide.asp?ID=30101
30. Death Stranding Wiki — Social Strand System. https://deathstranding.fandom.com/wiki/Social_Strand_System
31. Medium / Thant Hayman Thway — Beneath the Surface: Subnautica narrative design. https://medium.com/@tht13/beneath-the-surface-narrative-design-and-emotional-immersion-in-subnautica-e314f958a997
32. Subnautica HUD Wiki. https://subnautica.fandom.com/wiki/HUD
33. gamedeveloper.com — UI Strategy Game Design Dos and Don'ts. https://www.gamedeveloper.com/design/ui-strategy-game-design-dos-and-don-ts
34. Envato Tuts+ — Positioning On-Screen Indicators to Point to Off-Screen Targets. https://code.tutsplus.com/positioning-on-screen-indicators-to-point-to-off-screen-targets--gamedev-6644t
35. Game UI Database — Cyberpunk 2077. https://www.gameuidatabase.com/gameData.php?id=439
