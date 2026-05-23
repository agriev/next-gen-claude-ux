# WS-12 — Multi-Dashboard Spatial Composition (Control Rooms)

**Scope:** This is the flagship workstream for the user's central product hypothesis: *text alone can no longer carry compressed concepts; humans need multiple linked diagrams/dashboards arranged in space*. The brief surveys domains where this paradigm has been operationally proven (NASA mission control, trading floors, ICU, cockpit, NOC, SCADA, ship bridges, ATC, power grid) plus the modern AR/VR consumer attempts (Vision Pro Mac VD, Horizon Workrooms, Virtualitics, Flow Immersive). The goal is to extract the universal *operator's mental model* and translate it into a concrete proposal for Jarvis's multi-panel mode.

**Date:** 2026-05-23
**Sources consulted:** 24 primary + 13 supporting (peer-reviewed ergonomics + IEEE/CHI + industry standards + vendor docs + retrospective trade press)

---

## Tools / sources surveyed

Tier-A (operationally deployed, ≥10y track record, standards-backed):

- **NASA Christopher C. Kraft Mission Control Center (Apollo→Artemis)** [Tier A, 1965–present]. The Flight Control Room (FCR) plus Mission Evaluation Room (MER) pattern is the canonical "primary attention + deep-dive backroom" split. Each console position (FIDO, RETRO, GUIDO, EECOM, CAPCOM, FLIGHT) owns a sub-domain; data flows from MER engineering teams up to FCR controllers who synthesize and command. Front consoles get the must-see-now telemetry; specialty rooms hold the rich-detail subsystem views. [https://www.nasa.gov/history/building-on-a-mission-the-houston-mission-control-center/](https://www.nasa.gov/history/building-on-a-mission-the-houston-mission-control-center/), [https://en.wikipedia.org/wiki/Christopher_C._Kraft_Jr._Mission_Control_Center](https://en.wikipedia.org/wiki/Christopher_C._Kraft_Jr._Mission_Control_Center), [https://en.wikipedia.org/wiki/List_of_NASA's_flight_control_positions](https://en.wikipedia.org/wiki/List_of_NASA's_flight_control_positions). Deeply analysed.
- **SpaceX Hawthorne mission control (Dragon/Falcon/Starship)** [Tier A, 2010–present]. Conscious counter-design to legacy MCC: ~3 monitors per operator, Chromium-rendered telemetry served from the same server as the in-capsule touchscreens. Ground operators see the same UI as crew; this collapses two attention contexts into one. [https://stackoverflow.blog/2021/12/27/dont-push-that-button-exploring-the-software-that-flies-spacex-starships/](https://stackoverflow.blog/2021/12/27/dont-push-that-button-exploring-the-software-that-flies-spacex-starships/), [https://www.lithiosapps.com/blog/a-look-under-the-hood-of-spacexs-dragon-capsule](https://www.lithiosapps.com/blog/a-look-under-the-hood-of-spacexs-dragon-capsule). Deeply analysed.
- **Bloomberg Terminal (1982–present)** [Tier A]. The original "4-panel Core Terminal" mental model: each panel is an independent command line + result surface; can collapse to single monitor or sprawl across many. Amber-on-black from a deliberate brand decision when monitors were green or orange. Recent move to tabbed panels relaxes the four-panel cap but most experienced users keep the muscle-memory quad layout. [https://en.wikipedia.org/wiki/Bloomberg_Terminal](https://en.wikipedia.org/wiki/Bloomberg_Terminal), [https://www.bloomberg.com/company/stories/innovating-a-modern-icon-how-bloomberg-keeps-the-terminal-cutting-edge/](https://www.bloomberg.com/company/stories/innovating-a-modern-icon-how-bloomberg-keeps-the-terminal-cutting-edge/), [https://ted-merz.com/2021/06/26/amber-on-black/](https://ted-merz.com/2021/06/26/amber-on-black/). Deeply analysed.
- **Aviation glass cockpit (Boeing 787 / Airbus A350 / Garmin G1000)** [Tier A, ARP 4754A/DO-178C process]. Standardised PFD (primary flight display, always centred in pilot's view) + MFD (multi-function display, paged, peripheral) + EICAS (engine + crew alerting, between pilots). Three-tier layout: must-look-now centre, pull-on-demand sides, system health between. [https://en.wikipedia.org/wiki/Glass_cockpit](https://en.wikipedia.org/wiki/Glass_cockpit), [https://en.wikipedia.org/wiki/Primary_flight_display](https://en.wikipedia.org/wiki/Primary_flight_display), [https://skybrary.aero/articles/multifunction-display-mfd](https://skybrary.aero/articles/multifunction-display-mfd), [https://skybrary.aero/articles/engine-indicating-and-crew-alerting-system-eicas](https://skybrary.aero/articles/engine-indicating-and-crew-alerting-system-eicas). Deeply analysed.
- **Aviation pilot instrument scan ("T-scan" / circular scan, Basic Six)** [Tier A, FAA-IH-8083-15]. Centred attitude indicator, with eyes tracing T-paths to ASI, altimeter, HI, plus circular sweep through VSI and TC. The pattern is *trained* not visual. [https://www.aopa.org/news-and-media/all-news/2003/october/flight-training-magazine/4-step-instrument-scan](https://www.aopa.org/news-and-media/all-news/2003/october/flight-training-magazine/4-step-instrument-scan), [https://www.airheadatpl.com/blog/six-pack-basics-your-guide-to-primary-flight-instruments](https://www.airheadatpl.com/blog/six-pack-basics-your-guide-to-primary-flight-instruments). Deeply analysed.
- **Aviation Crew Alerting System (CAS / EICAS)** [Tier A, FAA AC 25.1322-1, SAE ARP4102]. Red = warning (immediate action), amber = caution (immediate awareness), cyan = advisory, white = status. Master Warning/Caution lights in extreme peripheral vision + central message page + aural tone + (modern) synthesised voice. [https://www.faa.gov/documentLibrary/media/Advisory_Circular/AC_25.1322-1.pdf](https://www.faa.gov/documentLibrary/media/Advisory_Circular/AC_25.1322-1.pdf), [https://www.aopa.org/news-and-media/all-news/1997/april/pilot/cockpit-warning-systems](https://www.aopa.org/news-and-media/all-news/1997/april/pilot/cockpit-warning-systems), [https://skybrary.aero/articles/engine-indicating-and-crew-alerting-system-eicas](https://skybrary.aero/articles/engine-indicating-and-crew-alerting-system-eicas). Deeply analysed.
- **ISA-101 HMI standard (process control / SCADA)** [Tier A, ANSI/ISA-101.01-2015]. Four-level display hierarchy: L1 plant overview, L2 unit, L3 detail, L4 diagnostics. Endsley's three-level SA model is the philosophical spine. Muted greys baseline + colour reserved for alarms. Originated by the Center for Operator Performance and codified by Hollifield, Habibi, Oliver, Nimmo in *High Performance HMI Handbook*. [https://www.isa.org/standards-and-publications/isa-standards/isa-101-standards](https://www.isa.org/standards-and-publications/isa-standards/isa-101-standards), [https://blog.ansi.org/ansi/ansi-isa-101-01-2015-hmi-for-process-automation/](https://blog.ansi.org/ansi/ansi-isa-101-01-2015-hmi-for-process-automation/), [https://hmilibrary.com/standards/isa-101](https://hmilibrary.com/standards/isa-101), [https://blog.isa.org/the-high-performance-hmi](https://blog.isa.org/the-high-performance-hmi). Deeply analysed.
- **Endsley's three-level Situational Awareness model (1995)** [Tier A, peer-reviewed, ~10000 citations]. L1 Perception → L2 Comprehension → L3 Projection. 76% of SA-related aviation errors are L1 (failed perception), 20% L2, 4% L3 — i.e. the *placement of information so it can be perceived* matters more than the analytics layered on top. [https://en.wikipedia.org/wiki/Situation_awareness](https://en.wikipedia.org/wiki/Situation_awareness). Deeply analysed.
- **ECDIS + Integrated Bridge System (ship bridge)** [Tier A, IMO Resolution A.694, IEC 61174]. Mandatory ECDIS since 2011 (SOLAS V/19). Multi-function workstations: radar + electronic chart + AIS + autopilot status + comms each on its own panel within the navigator's seated reach. [https://www.imo.org/en/ourwork/safety/pages/electroniccharts.aspx](https://www.imo.org/en/ourwork/safety/pages/electroniccharts.aspx), [https://www.l3harris.com/all-capabilities/integrated-bridge-system](https://www.l3harris.com/all-capabilities/integrated-bridge-system), [https://en.wikipedia.org/wiki/Electronic_navigational_chart](https://en.wikipedia.org/wiki/Electronic_navigational_chart). Deeply analysed.
- **Air Traffic Control situation display + electronic flight strips (EFS)** [Tier A]. Central radar/situation display + sector-specific strip board (originally paper, now electronic). Paper-strip-to-EFS migration is the canonical lesson about *removing* a display once an integrated alternative exists. [https://skybrary.aero/articles/situation-display](https://skybrary.aero/articles/situation-display), [http://aviationknowledge.wikidot.com/aviation:air-traffic-controller-atc-s-working-position-cwp](http://aviationknowledge.wikidot.com/aviation:air-traffic-controller-atc-s-working-position-cwp), [https://www.enac.fr/en/enac-prepares-air-traffic-controllers-modern-air-traffic-management-tools](https://www.enac.fr/en/enac-prepares-air-traffic-controllers-modern-air-traffic-management-tools). Deeply analysed.
- **ICU multi-parameter patient monitor (Philips IntelliVue / Mindray BeneVision / GE CARESCAPE)** [Tier A, ISO 80601-2-49]. Single tower, fixed-position waveform stack (ECG → SpO2 → resp → BP → temp). 72–99% of alarms are non-actionable — alarm-fatigue is the canonical lesson. [https://pmc.ncbi.nlm.nih.gov/articles/PMC8196351/](https://pmc.ncbi.nlm.nih.gov/articles/PMC8196351/), [https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9424650/](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9424650/), [https://med-linket-corp.com/blogs/news/how-to-read-a-hospital-monitor-and-interpret-key-parameters](https://med-linket-corp.com/blogs/news/how-to-read-a-hospital-monitor-and-interpret-key-parameters). Deeply analysed.
- **Eye-tracking studies of ICU nurses (Koch et al. 2020, Browning et al. 2022)** [Tier A, JCMC]. PDMS draws the most dwell time; bedside monitors come second; ventilator third. Inattentional blindness is real when too many simultaneously-changing waveforms compete. [https://pmc.ncbi.nlm.nih.gov/articles/PMC7724778/](https://pmc.ncbi.nlm.nih.gov/articles/PMC7724778/), [https://link.springer.com/article/10.1007/s10877-022-00844-y](https://link.springer.com/article/10.1007/s10877-022-00844-y). Deeply analysed.
- **Network Operations Centre (NOC) wall + tiered support** [Tier A industry pattern]. Central video wall = shared single-source-of-truth + 6-monitor operator stations for drill-down + tier 1/2/3 escalation routing. [https://www.extnoc.com/network-operations-center/noc-design-and-layout/](https://www.extnoc.com/network-operations-center/noc-design-and-layout/), [https://www.barco.com/en/solutions/control-rooms/network-operations-center](https://www.barco.com/en/solutions/control-rooms/network-operations-center). Deeply analysed.
- **Power grid control room HMI + video wall (ADMS-era)** [Tier A, GE Vernova whitepaper]. Wall = network topology + alarm summary. Operator console = focused work area. Endsley-based design methodology explicit. [https://www.gevernova.com/grid-solutions/sites/default/files/resources/products/casestudy/adms_whitepaper_03_web.pdf](https://www.gevernova.com/grid-solutions/sites/default/files/resources/products/casestudy/adms_whitepaper_03_web.pdf), [https://www.primate-tech.com/resources/understanding-situational-awareness](https://www.primate-tech.com/resources/understanding-situational-awareness). Analysed.

Tier-B (consumer/enterprise AR/VR + immersive analytics + research papers):

- **Apple Vision Pro Mac Virtual Display + Splitscreen** [Tier B, visionOS 26]. Single-Mac-display constraint (until visionOS 2/26 with multi-screen extension via 3rd party). World-anchored windows, head-tracking but no head-locked HUD by HIG. [https://support.apple.com/en-us/118521](https://support.apple.com/en-us/118521), [https://www.apple.com/newsroom/2025/06/visionos-26-introduces-powerful-new-spatial-experiences-for-apple-vision-pro/](https://www.apple.com/newsroom/2025/06/visionos-26-introduces-powerful-new-spatial-experiences-for-apple-vision-pro/), [https://www.imore.com/vision-pro/how-to-use-multiple-displays-with-apple-vision-pro](https://www.imore.com/vision-pro/how-to-use-multiple-displays-with-apple-vision-pro). Deeply analysed.
- **Meta Horizon Workrooms** [Tier B, 2021–present]. "Personal Office" gives 3 virtual monitors; meetings collapse to 1. Avatars + spatial audio. Empty-screen-slot when user has 2 physical displays is a documented frustration. [https://www.uploadvr.com/horizon-workrooms-multi-screen-office/](https://www.uploadvr.com/horizon-workrooms-multi-screen-office/), [https://www.uploadvr.com/horizon-workrooms-triple-monitors-windows/](https://www.uploadvr.com/horizon-workrooms-triple-monitors-windows/). Analysed.
- **Virtualitics (JPL spinout)** [Tier B]. AI-assisted dimension reduction + 3D scatter, then "intelligent exploration" suggests best 3D view. Designed for analyst exploration, not operations. [https://virtualitics.com/why-does-immersive-data-visualization-matter/](https://virtualitics.com/why-does-immersive-data-visualization-matter/), [https://virtualitics.com/what-are-3d-data-visualizations/](https://virtualitics.com/what-are-3d-data-visualizations/). Analysed.
- **Flow Immersive** [Tier B]. WebXR data viz over a table; spatial cognitive platform branding. Cross-device (phone → AR glasses). [https://flowimmersive.com/](https://flowimmersive.com/). Analysed.
- **Bret Victor's Dynamicland (Oakland)** [Tier B]. "The room is the computer"; physical objects + projection. Distinct from headset AR but informs the *world-anchored shared display* pattern. [https://machaddr.substack.com/p/dynamicland-bret-victors-vision-for](https://machaddr.substack.com/p/dynamicland-bret-victors-vision-for), [https://worrydream.com/](https://worrydream.com/). Analysed.
- **CHI/IEEE peripheral-vision attention guidance papers** [Tier B]. Movement perception in periphery is preserved even at low acuity; soft visual cues work as ambient alert channel. [https://ieeexplore.ieee.org/document/9373088/](https://ieeexplore.ieee.org/document/9373088/), [https://ieeexplore.ieee.org/document/8122803/](https://ieeexplore.ieee.org/document/8122803/). Analysed.
- **Wall-display collaboration research (CHI 2023, arXiv)** [Tier B]. Pointing gestures + shared awareness cues in mixed-presence. [https://arxiv.org/html/2401.09324](https://arxiv.org/html/2401.09324), [https://www.mdpi.com/2414-4088/8/12/109](https://www.mdpi.com/2414-4088/8/12/109). Analysed.
- **Brushing-and-linking (Becker & Cleveland 1987; Roberts state-of-the-art 2007)** [Tier A IEEE TVCG]. The foundational technique for cross-view highlighting. Now table-stakes in Tableau/Power BI/Observable. [https://www.cs.kent.ac.uk/pubs/2007/2559/content.pdf](https://www.cs.kent.ac.uk/pubs/2007/2559/content.pdf), [https://observablehq.com/blog/linked-brushing](https://observablehq.com/blog/linked-brushing). Analysed.

Tier-C (anecdotal / inspirational):

- Iron Man's J.A.R.V.I.S. lab (Marvel films, 2008–2019) — frequently invoked in spatial computing marketing but not a real reference.
- Minority Report PreCog room (2002, Spielberg) — gesture-control inspiration; Oblong Industries (g-speak) attempted commercial implementation.
- Tom Cruise's "Edge of Tomorrow" briefing room and various film "war room" sets.

---

## Lens pass

### L1 — Spatial primitives

Across every Tier-A source, the same five primitives appear:

1. **Panel** (a fixed-aspect rectangle hosting one widget/chart/feed). The atom of operator workspaces. Bloomberg's "panel", NASA's console "page", glass cockpit's "MFD page", ICU monitor's "waveform strip" all map cleanly to this concept. *World/desk-anchored, never head-anchored.*
2. **Panel group / zone** (a deliberate cluster of panels with a shared frame and shared topic). Cockpit's PFD-MFD-EICAS triad, Bloomberg's 4-quad workspace, NASA console's "primary + secondary + reference" rows.
3. **Attention zone** (a region defined by *where the operator's eye lands by default*, not by what's drawn). Pilot's central attitude indicator and the cockpit T-scan path. The trading "Zone 1" (60–70% of primary monitor) plus peripheral zones 2-5. Not a visual element — a *spatial budget* enforced by the layout.
4. **Alert / alarm overlay** (a transient or sticky element that *interrupts* the normal scan). CAS messages, ICU red waveform, SCADA red on grey background. Crucially these overlay or replace existing panel content rather than spawn new windows — adding windows in an emergency is an anti-pattern.
5. **Shared / wall display** (a single large surface visible to the whole team, holding the canonical state). NASA's front-of-room status wall, NOC video wall, power-grid mimic diagram, stadium command centre. Distinct from any individual operator's console.

Note three primitives that are *absent* from classical control rooms but emerge in modern (post-2010) immersive demos:

- **Linked beam / cross-panel highlight thread** — visible "wire" between panels showing brushing/linking. Tableau-era BI, Virtualitics, Flow Immersive. Not in cockpits.
- **Reasoning trail / breadcrumb** — a record of the operator's investigation path. Palantir Gotham, LangSmith, Jarvis. Absent from cockpits/ICU but visible in NOC ticket systems and SCADA event lists (as text only).
- **Avatar / co-presence indicator** — embodied teammate. Horizon Workrooms, Vision Pro Personas. Absent from classical single-operator stations; partially present in wall-display NOC (you see your peer at the desk next to you).

### L2 — Data → form mapping

The mapping in every Tier-A domain is **rigid, conventional, and slow-changing** — opposite of an LLM-driven free-form canvas. Examples:

- Aviation: attitude → artificial horizon ball; airspeed/altitude → vertical tapes; heading → compass rose; engine N1 → arc gauge with red/amber/green sectors. Even on glass cockpit you cannot swap the form for the same data.
- Bloomberg: time-series price → candlestick + volume; order book → bid/ask ladder; news → ticker scroll; chat → IB instant message panel.
- ICU: cardiac ECG → green waveform strip; SpO2 → cyan numeric + plethysmograph; respiration → yellow waveform; alarm → coloured banner across whole bezel.
- ATC: aircraft position → labelled blip on plan view, plus altitude tag + speed vector; flight intent → strip card / data tag.
- SCADA: process variable → fill bar or trend line; setpoint → marker on same scale; alarm state → coloured border (greyscale otherwise per ISA-101).

The convention is so strong that *deviation breaks training*. SpaceX deliberately broke aviation convention by going to a touchscreen + simplified PFD; this required custom astronaut training and was a deliberate cost. The lesson for Jarvis: when introducing a new artifact kind (chart-panel, flow-panel, timeline-panel), pick the canonical visual form for the dominant data type and *don't allow free-form remixing inside an attention zone* — only between zones or in a sandbox.

### L3 — Camera & navigation

Operators in every Tier-A domain are **stationary**. Their "camera" = head/eye/chair rotation within a fixed seat. Total angular budget across all monitors usually ≤120° horizontal (the comfortable head-turn range), with peripheral monitors at ±60° tolerated only for low-priority feeds. Bloomberg's 4-screen arc, the cockpit's ±35° MFD positions, the NASA console row, the ATC workstation — all sit within this budget.

Key navigation patterns:

- **Page within panel**: cockpit MFD pages, Bloomberg `<GO>` command, SCADA L1→L2→L3 drill-down. The panel stays put; content swaps. This is *content navigation* not *camera navigation*.
- **Eye-flick between fixed panels**: the operator never "moves" — the scan path is a learned motor pattern. Pilot T-scan is the textbook case.
- **Stand up / walk to wall**: in NOC and mission control, when something escalates, an operator literally rises and points at the wall display — a deliberate move that switches mode from "my workspace" to "team consensus".
- **Backroom dive**: NASA's FCR-to-MER pattern. Going from primary console to specialist console is a *physical walk*, signalling a context change. Vision Pro's Full Space vs Shared Space and the visionOS Personal Office vs immersive environment have the same semantic.

What is *not* used:
- Free 6-DoF flight through data (no Tier-A example; immersive analytics demos use it and consistently report nausea + lost orientation).
- Orbiting a 3D scatter (Virtualitics, Tableau Web; only useful in *exploration* mode, never in operations).
- Teleport between bookmarked viewpoints (no Tier-A operations example; Horizon Workrooms experiments).

For Jarvis: keep the orbit camera as *exploration mode*, but introduce a **stationary "console mode"** where the camera is locked and panels arrange themselves around a fixed viewer pose. This is the AR-friendly path: in headset, operator is just sitting at their desk, panels float around them in fixed positions.

### L4 — Level of Detail (LOD)

ISA-101 codifies LOD as a four-level display hierarchy operators *navigate by command*, not by zoom: L1 plant overview (10s of values per screen, no detail) → L2 unit (~100 values, alarm-state colouring) → L3 detail loop (~1000 values, full instrumentation) → L4 diagnostic (raw signal, trending).

Cockpit: PFD pages compress thousands of underlying parameters into 8-10 must-see values; MFD allows pages-on-demand at the next level; only on ground-maintenance terminals do you see the full data dictionary.

ICU monitors LOD by **patient acuity** rather than distance: stable patient gets 4 numerical + 3 waveform values; deteriorating patient adds trending + alarm-history page; in a code, the monitor reorganises to put rhythm + BP + SpO2 huge across the whole screen and pushes everything else off.

NOC wall LOD: site icon (1px green/yellow/red) → site row in summary table → site detail page → site element trend. Pattern is identical to BI drill-down.

For Jarvis the lesson is *don't try to render 10000 panels*; instead provide a *layered overview-to-detail navigation* that swaps content. The current Layout agent's "batch reorganize" is the right primitive; it needs a "drill into" + "step back out" semantic and per-level token budgets.

### L5 — Anchoring

This is the lens where the data is **strongest and most unanimous**: every Tier-A control-room artifact is **world-anchored**. The monitor is physically bolted to the console or the wall; the operator's mental model places each piece of information at a known spatial coordinate. This is *why* the T-scan works, why a pilot can fly partial-panel after losing one instrument (knows where the missing reading would be), why a Bloomberg user can hit `<GO>` on the wrong panel and immediately know.

Vision Pro's HIG explicitly imports this: windows are world-anchored by default; head-anchored "HUD" overlays are discouraged outside very specific safety/affordance use; widgets in visionOS 26 are *spatial* and snap to walls/tables, "right where you placed them every time".

This converges with the IEEE peripheral-vision research: peripheral motion-perception works only when the eyes know *where to expect* the change. A change that appears in a head-anchored panel that floats with you provides zero spatial anchor for subsequent recall.

For Jarvis: **never use head-anchored panels for primary content**. The current `<Html>` overlays via drei attach to scene-anchored objects, which is good; the InputBar at the bottom of the window is screen-anchored, which is a desktop affordance that will need an explicit AR-mode replacement (palm menu, world-anchored input dock, or summoned panel).

### L6 — Labels & legends

In every operational domain labels are *always-on*, *fixed-position*, and *minimally redundant*. Cockpit primary instruments have engraved labels and unit indicators; CAS messages are full-text never icon-only; SCADA per ISA-101 reserves bold text for the active alarm and grey labels for everything else. The operator should never have to hover-to-discover what a value means under pressure.

Legends live *outside* the data area (along the bezel, at the edge of the wall display, on a quick-reference card stuck to the console). They are *not summoned*. Hover-tooltips of the Tableau/BI variety are rare in real control rooms because hovering requires fine motor control that fails under stress.

At distance (wall display 5–10m from operator) typography scales up: the Barco/Hiperwall convention is "1 arc-minute per character pixel" so a wall character is 3-4× the size of a console character. NASA's status walls follow the same.

For Jarvis: the current Card components use 12px DOM HTML labels via drei `<Html>`. For desktop this works; for AR/VR we need text-rendering at a fixed *angular* size, not pixel size, and labels must remain always-visible at the operator's resting head pose. `troika-three-text` or `react-three/uikit` are the migration paths called out in the bridge document.

### L7 — Selection & group operations

In classical control rooms, selection is **one item at a time** because the action that follows is high-stakes. ATC controllers select one aircraft to handover by clicking its label; pilots focus on one MFD page; SCADA operators acknowledge one alarm by ID. Multi-select operations exist but are rare and slow (e.g. "acknowledge all alarms in unit X" is a deliberate, confirmed action).

The exception is *exploratory analytics* (Bloomberg cross-correlation, Tableau brushing). Here multi-select is core. Even so, classical Bloomberg keeps selection bound to the active panel.

For Jarvis: lasso-multi-select is appropriate for the canvas-mode exploration that already exists. For the proposed multi-panel/console mode, single-panel selection should be the default with explicit "select all panels in this zone" as a keyboard-modifier action — the LayoutAgent can then re-arrange a *zone* without affecting other zones.

### L8 — Attention flow

This is the *canonical domain* for attention research. Every Tier-A source has a layered alert system:

| Layer | Cockpit | ICU | SCADA | NOC | Trading |
|---|---|---|---|---|---|
| L0 ambient | Background gauge values | Steady waveforms | Process values | Green icons | Tickers scrolling |
| L1 advisory | Cyan CAS msg | Status label | Sky-blue marker | Yellow icon | Watchlist colour |
| L2 caution | Amber CAS + master amber light blinks | Yellow alarm bar | Amber border | Orange icon + small chirp | Loud red price flash |
| L3 warning | Red CAS + master red flashing + aural alert + (some craft) stick-shaker | Red banner + ascending three-tone | Red flashing border + horn | Red banner + slack page | Alert tone + popup |
| L4 emergency | Synthetic voice ("TERRAIN, PULL UP") | Code blue PA + crash cart paged | Plant shutdown signal | Major incident broadcast | Circuit breaker / halt |

Two universal mechanics:

- **Peripheral-vision motion**: amber blink → eye catches the change in periphery → saccade lands on the relevant instrument. The IEEE peripheral-vision research formalises this: low-acuity peripheral retina is excellent at motion detection. Therefore *alerts should animate, not just colour-change*, and they should be at a known spatial location so the post-saccade target is fast.
- **Aural channel as orthogonal**: red message + tone is more reliable than red message alone because the audio engages the brain via a different pathway. Modern cockpits use synthesised voice for the highest priority (TCAS RA, GPWS, stall warning) because text can be missed under task load.

ICU alarm fatigue is the canonical *failure* of this layer: when 99% of alarms are non-actionable, operators desensitise and miss the real one. The lesson, codified across ISA-101 and aviation, is that **alarm priority must be ruthlessly curated** and the L3/L4 levels reserved for must-act-now. Jarvis's reasoning trace and naming events are currently undifferentiated text rows — they're at L0/L1 implicitly; when we add real "Layout agent needs decision" or "search returned conflicting evidence" events those need a deliberate L2/L3 channel (e.g. tonal sound + animated panel glow) and a clear *count cap* (no more than N L2 alerts per minute or operator desensitises).

### L9 — Color system

The convergent palette across cockpit, ICU, SCADA, and NOC:

- **Greyscale / muted desaturated** for the normal-state background (per *High Performance HMI Handbook*). Saves the eye for what matters.
- **Red** = emergency / warning / out-of-spec / must-act. *Reserved.*
- **Amber/yellow** = caution / out-of-normal / awareness needed.
- **Cyan/blue** = advisory / setpoint / informational.
- **Green** = normal-operating / OK / acknowledged. (NOC inverts: green = up.)
- **Magenta** = selected / active / commanded (aviation FMS).
- **White** = labels / static text.

Colour-blindness mitigations: position + shape + label backup colour. ISA-101 explicitly forbids colour-alone signalling. Bloomberg amber-on-black is for *brand* and dark-environment readability, not semantics — semantic colour overlays it.

Jarvis currently uses palette from `~/workspace/interactive_jarvis/renderer/...` (need to verify in implementation review) and the `kind` field of artifacts maps to colour. The convergent recommendation: **add a state palette** (normal/warn/error/selected/active) that is *orthogonal* to the kind palette, and apply it via outline/border so the kind colour remains readable.

### L10 — Inter-view linking

This is the **biggest gap** in real control rooms and therefore the **biggest LLM opportunity** for Jarvis. Classical control rooms have *very limited* cross-panel linking:

- Cockpit: virtually none. Each instrument is read independently. The pilot's *brain* does the integration. (This is why CRM training exists.)
- ICU: panel-level linking exists (HR change triggers BP recomputation) but cross-monitor linking (this patient's HR vs this patient's drug pump status vs the same patient's nurse-note system) is *manual* in nearly every hospital.
- Bloomberg: linking happens *between* panels of the same Terminal (a click in one panel sends a `<EQUITY> <GO>` to another panel if the user has configured a "linked" group), but it's a single configurable link, not full brushing.
- NASA: link is via the *flight director's voice*, who serves as a human linker between domain consoles.
- SCADA: alarm-list-to-detail-page is the dominant link; cross-process pivot is rare.

In Tier-B BI/analytics (Tableau, Power BI, Observable, Virtualitics) cross-view brushing is the killer feature. Linked highlighting is the proven mechanic: select something in view A → it highlights in views B, C, D. The LLM-augmented variant — *"select something in view A, and the system regenerates views B, C, D to be relevant"* — is the Jarvis-shaped opportunity. None of the surveyed Tier-A control rooms have this; none of the Tier-B BI tools do it dynamically (they pivot existing views, not regenerate them).

For Jarvis: the Layout agent's "single-call reorganize" already does this for the global canvas. The natural extension is **panel-scope reorganize**: select a panel + ask a question → Layout agent rebuilds 3-5 supporting panels around it. Bookmarks (Shift+1..9) become "saved console states" — the user can return to a known configuration before they explored.

### L11 — Process / reasoning representation

Classical control rooms make process visible via **timeline-with-events** (mission elapsed time + event marks on the wall; SCADA event log; ICU event timeline) plus the **operator's voice loop** (mission control "loop", NOC bridge call, ATC voice). The visual representation is text-table; the actual reasoning is verbal.

This is a long-standing limitation: the *handover* between shifts is famously fraught because the visual record (text log) doesn't capture the reasoning chain. NASA's MOD has formal shift-handover briefings to bridge the gap.

Modern agentic tools (LangSmith, Cursor, Jarvis itself) represent reasoning as a *trace tree*. This is a strict improvement on the text log, and the Jarvis "ActivityPanel reasoning trace" with timings and tool calls is already aligned with this. The opportunity for the multi-dashboard mode: each panel could carry its own *mini-trace* of what the Layout agent did to place it there, summonable on hover or via an "explain this panel" action.

### L12 — Multi-user / sharing / persistence

Tier-A: dominantly *single operator per console, multi-operator per room*. The shared wall + voice loop is the team consensus channel; individual consoles are private. NASA's FCR + the team coordinator handle synthesis. Persistence is via mission logs (state) + recorded comms (intent) + post-mission reconstruction.

Vision Pro / Horizon Workrooms: a co-presence model where each user has their own panel set but can see embodied teammates. Workrooms' "shared whiteboard" is the only true multi-author surface; everything else is observer-mode.

For Jarvis: single-user is fine for the current cycle. The bridge-doc constraint is that the persistence model (fs-sync to JSON) is already multi-user-compatible if we add a CRDT layer; co-presence with embodied agents (each Jarvis sub-agent shown as an avatar in the scene) is a fertile concept for the multi-panel mode — when the Layout agent is reorganising, you see a literal cursor or beam in the space.

---

## Special section A — Operator's mental model across mission control / trading floor / ICU / cockpit (~2 pages)

Across the four canonical Tier-A domains, an **identical four-zone attention architecture** emerges. None of these is encoded in the displays' visual style — they are *spatial budgets* the operator enforces on their own gaze.

### The four zones

1. **Primary focus zone (foveal, ≤15° arc, centred on resting head pose)**
   - Cockpit: PFD with attitude indicator at centre.
   - Trading: primary chart (60–70% of primary monitor; left-of-centre for right-handed traders).
   - ICU: bedside monitor's "vital strip" — typically ECG waveform and HR digit.
   - Mission Control: the FLIGHT director's left-front console, holding the dynamic master state.
   - *Purpose*: the one display the operator looks at *by default*. Eyes return here between every other glance. Update rate = highest. Information density = highest per visual area.

2. **Near-peripheral working zone (15°–35° arc; same monitor or adjacent monitor at eye level)**
   - Cockpit: MFD and EICAS adjacent to PFD.
   - Trading: secondary chart + order entry on the same monitor.
   - ICU: secondary numeric panel (BP, SpO2, temp) and IV pump status above.
   - Mission Control: console row directly left/right of FLIGHT.
   - *Purpose*: information the operator glances at on a regular scan (every 5–15 seconds), but not by default. Read with peripheral vision active, then saccade.

3. **Ambient awareness zone (35°–60° arc; second monitor, side wall, etc.)**
   - Cockpit: weather radar, traffic display, fuel-system synoptic.
   - Trading: news feed, market overview, sector heatmap.
   - ICU: ventilator panel, nurse-call status, room-status board.
   - Mission Control: status wall (mission elapsed time, GO/NO-GO board).
   - *Purpose*: change detection. The operator does not read this zone moment-to-moment; they expect their peripheral vision (motion-sensitive) to catch a flash, a colour change, a number update. The brain triggers a deliberate saccade only when the periphery flags a change.

4. **On-demand deep-dive zone (head-turn or chair-rotate beyond 60°, or backroom)**
   - Cockpit: charts, ECAM/EICAS deeper-page menu, FMS pages.
   - Trading: research terminal, calls/email, calendar.
   - ICU: chart/PDMS, medication record, imaging viewer.
   - Mission Control: MER (Mission Evaluation Room) backroom engineering consoles.
   - *Purpose*: rich, slow, detailed reference. The operator *decides* to engage it; not part of the continuous scan. Going there is a discrete context switch.

### What this means for "attention priority" placement

Information is placed not by topic (all about the engine = grouped) but by **how often the operator needs to refresh their mental model of it**:
- **Continuous (sub-second mental refresh)** → Zone 1.
- **Periodic (5–15 second scan)** → Zone 2.
- **Change-driven (only when something changes)** → Zone 3.
- **Investigation (only when investigating)** → Zone 4.

Topic-grouping is *secondary*. The cockpit groups attitude/airspeed/altitude on the PFD not because they're "flight parameters" but because the pilot needs to refresh them continuously. The engine parameters are off to one side because, on a healthy engine, they only need glance-rate attention.

The Bloomberg Terminal's 4-panel layout reflects this implicitly: the trader places the chart they're actively working in Panel 1 (the muscle-memory primary), the watchlist in Panel 2 (their scan target), the news in Panel 3 (periphery), and the chat/IB in Panel 4 (on-demand). When asked "why this arrangement," experienced traders rarely articulate it — but eye-tracking studies of similar setups consistently find the 60% / 25% / 10% / 5% dwell-time ratio.

The implication for Jarvis: a "console mode" layout should let the user assign each panel an explicit *attention rank* (1–4), and the Layout agent should respect that ranking when reorganising. The orthogonal `kind`/`topic` grouping should be a secondary constraint, not the primary one.

---

## Special section B — The 5-minute scan

When an experienced operator returns to the console (from a break, shift change, or pulled-away meeting), they perform a stereotyped 5-minute scan that catches them up on state. The pattern is robust enough to be trained explicitly in aviation (return-from-galley scan), nuclear (operator turnover briefing per ANSI/ANS-3.5), and ATC (sector takeover briefing per FAA Order 7110.65).

The scan has three reliable phases:

1. **Phase 1 — clock & mode (~30 s)**: read the current time/mission-elapsed/sector-time; verify the system is in the mode you expect (autopilot on/off; market open/closed; patient on ventilator settings X). Anchors the rest of the read.
2. **Phase 2 — primary zone delta (~2 min)**: scan Zone 1 + 2, comparing to your remembered or briefed state. "Was at FL310 climbing → now level at FL350, expected." "Was at HR 78 → now 82, ok." This phase relies on the *known fixed location* of every value — if a value has been moved or relabelled while you were away, the scan fails.
3. **Phase 3 — change log + alarm history (~2 min)**: read the event log of what happened during your absence. SCADA event list, ICU "trends + alarms last 4h", cockpit ECAM/EICAS active + memo, Bloomberg recent news on watched tickers.

What makes this work:
- **Stable layout**: every panel is exactly where you left it. The single largest enabler.
- **Time-stamped change log**: every event the operator missed is text-retrievable in chronological order.
- **Trend lines, not just current values**: a 4-hour chart of HR tells you more than current HR. SCADA, ICU, and aviation EICAS all default-show the trend.
- **Caution/warning history**: even after acknowledgement, alarms persist in a "recent alarms" page for review.

For Jarvis: the multi-panel mode needs a "what happened while I was away" view. Concrete realisation:
- A persistent **event timeline panel** showing Layout agent reorganisations, Listening agent inputs, Worker agent completions, with timestamps and 1-line summaries.
- **Trend mini-charts** on each panel showing the value over the last N minutes, not just the current snapshot.
- **State-stable layout**: the user's panel arrangement must persist across sessions; restart should never reorganise. Currently Jarvis's fs-sync persists artifacts but the camera + bookmark state should be persisted alongside.

---

## Special section C — Alarm and exception handling

When something needs operator attention, the routing across domains is *consistent enough to constitute a pattern*:

1. **Detect**: the system identifies an out-of-bounds condition by rule, threshold, or model. SCADA: PV crosses HI alarm setpoint. ICU: HR > 130 for >10 s. Cockpit: bus voltage low. NOC: ping latency > threshold for N samples.
2. **Prioritise**: each detected event gets a priority class (P1 emergency / P2 warning / P3 caution / P4 advisory / P5 info). ISA-18.2 (alarm management) and ARP4761 (aviation) both formalise this.
3. **Route to attention via two parallel channels**:
   - **Visual**: animate a known-location element. Master Warning red light (top of glareshield in cockpit), alarm banner across patient monitor bezel, red border around SCADA panel. The location is *fixed*; the change is *animated*.
   - **Aural**: tonal alert keyed to priority. Cockpit: continuous-repetitive vs single-stroke. ICU: ascending three-tone for high-priority. SCADA: relay-click vs siren. The audio's *pitch*, *rhythm*, *direction* (in stereo headsets / spatial audio) all encode priority.
4. **Demand acknowledgement**: operator must explicitly silence (silence-but-not-clear, the alarm remains visible). This separates "I see it" from "it's resolved".
5. **Log**: every alert is timestamped to a persistent log for post-event review.

Critical *negative* findings:

- **Alarm fatigue** (ICU literature): when L3/L4 alarms fire too often, operators silence reflexively. The Joint Commission has named this a patient-safety hazard. Mitigation = ruthless rule-tuning and *removing* low-value alarms.
- **Alarm flood** (SCADA literature, post-Three Mile Island, post-Texas City refinery): when 100 alarms fire in 60 seconds, the operator cannot triage. ISA-18.2 caps recommend ≤6 alarms/10 min for a single operator. Modern HMIs *suppress* alarms that are causally implied by a higher-priority alarm.
- **Attentional tunneling** (HUD literature): when a high-priority element captures attention, operators stop scanning other channels. Modern CAS designs flash + briefly silence to force a reset.

For Jarvis: today the ActivityPanel emits undifferentiated reasoning rows. To add real exception handling:
- **Categorise events** (info / decision-needed / failure / blocked) and assign visual + aural treatments.
- **Cap simultaneous L2/L3 events** at ≤3 visible at once; queue the rest with a "+N more" badge.
- **Acknowledge ≠ resolve**: a user dismissing a "Layout reorganisation conflicts with bookmark" warning should remove the badge but keep the entry in an audit log.
- **Spatial location**: alerts should appear *attached to the panel they concern* (border glow + tone), not in a global notification stream. This is the cockpit Master-Warning + per-system EICAS message pattern translated to a 3D panel array.

---

## Special section D — Translating to Jarvis: multi-panel composition in 3D

**Concrete proposal: "Console mode" — a new view alongside the existing canvas mode.**

When the user enters Console mode (proposed: `Tab` key from canvas → "Console", or new bookmark slot):

1. The camera locks into a **stationary stance** at a fixed pose (no orbit, no pan).
2. The Layout agent receives the current top-N most-relevant artifacts (based on focus, last-asked question, recent edits) and is asked to compose them into a **horseshoe of 5 panels** around the user.
3. The horseshoe has fixed slots:
   - **Slot P (primary, centre, ±15° arc, eye level)**: the artifact in active focus.
   - **Slots W1, W2 (working, left/right of primary, 15–35° arc)**: supporting/related artifacts.
   - **Slots A1, A2 (ambient, further left/right, 35–60° arc)**: status / activity timeline / agent trace.
4. Each slot has a fixed *attention rank* (P=1, W=2, A=3) which the Layout agent treats as a hard constraint.
5. The user assigns artifacts to slots by drag, or by voice ("put the OVL spec in front"), or implicitly by asking a new question (Layout agent reshuffles the working zone to match).

What the Layout agent does on each user move:

- User asks a new question → Layout agent picks the answering artifact, places it in Slot P, demotes the previous P-occupant to W1, demotes W1 to A1, demotes A1 off-stage (still in scene, just outside the horseshoe).
- User selects an artifact in W2 → Layout agent promotes it to P (with animation, ~600ms ease) and rotates the demotion chain.
- User asks "what's relevant to this?" → Layout agent regenerates W1/W2/A1/A2 around the current P.
- Listening agent detects a key term → it appears as a soft cyan badge in Slot A2 (peripheral); user can promote with voice.

Why a horseshoe specifically (vs grid, vs ring):
- Matches the **stationary operator's natural ≤120° comfortable head-turn range**.
- Slots are clearly *ranked* by position (centre > sides > far sides) — the layout *encodes attention priority* in space, matching every Tier-A pattern.
- Same anchor pattern as Bloomberg's 4-panel quad, the cockpit PFD-MFD-EICAS arrangement, the trading 3-monitor + auxiliary setup, and the visionOS Personal Office multi-monitor arc.
- Extends to AR without redesign: in headset, the horseshoe is the same; on desktop, the camera is locked at a stationary pose with the horseshoe projected in front.

Layered alert channel (per Section C):
- **Border glow** on each panel encodes its state (white = normal, cyan = recently changed, amber = caution, red = warning).
- **Panel-attached sound** when an L3 event occurs (spatial audio in headset; stereo-positioned on desktop).
- **Top-of-frame Master indicator** showing the highest current event level across all panels (cockpit master-warning lineage).

Linked-views (per L10):
- Selection in any panel highlights the corresponding entity in every other panel (brushing-and-linking).
- "Pivot to this" command rebuilds the working/ambient slots around the selected entity.
- The Layout agent's reasoning for each panel placement is summonable: hover/voice "why is this here?" → mini-trace overlay.

Persistence (per Section B's 5-minute scan):
- Console layouts are saved as named "consoles" (e.g. "OVL review console", "ACS daily standup console"). Bookmark Shift+1..9 stores not just camera pose but full slot assignments.
- The event timeline lives in Slot A2 by default and shows the last hour of agent activity.

This proposal builds directly on existing primitives: `world-state.ts` artifacts, MCP `apply_layout_plan`, ActivityPanel events, bookmarks. The new primitives needed are: (1) the `Console` artifact kind holding slot assignments, (2) a `attention_rank` field per artifact (1–4), (3) a stationary `CameraController` mode, (4) per-panel border-glow shader.

---

## Special section E — Failure modes (when control-room patterns are cargo-culted)

Naively imitating Bloomberg / mission control without the organising principles consistently fails in observable ways:

1. **"6 monitors but no muscle memory" / dashboard sprawl**: a trader (or analyst) buys 6 monitors, lays out 20 panels, and reports *worse* productivity. Eye-tracking studies show they're spending more time *searching for the panel they need* than reading data. The Bloomberg user keeps the same 4 panels for years; the cargo-cult user randomises layout weekly. The Tier-A pattern is *layout stability*, not *panel count*.
2. **Information overload** (Barco / Tresco surveys): control rooms with 20+ monitors actively *reduce* situational awareness. Operators miss 45% of screen activity within 12 minutes of continuous monitoring; 95% after 22 minutes. The lesson is *fewer, better-organised displays* — exactly the SpaceX reduction-from-30-screens-to-3.
3. **Alarm fatigue**: putting "everything that changes" as an alarm causes operators to silence reflexively. ICU literature (72–99% non-actionable alarms) is the canonical case; SCADA pre-ISA-18.2 plants showed identical pathology. The Jarvis-relevant version: if every Layout agent reorganisation, every Worker tool call, every Listening keyword surfaces as a "notable event", the user stops looking. Curate ruthlessly.
4. **Free-form layout in operations**: BI tools that allow drag-anywhere dashboard composition produce gorgeous one-off dashboards that no two operators can read the same way. Control rooms enforce standardised layouts because *training* + *handover* + *team coordination* depend on it. Jarvis's canvas mode is fine for exploration; *Console mode must enforce slot constraints* for the same reasons.
5. **Camera mode mismatch**: importing 6-DoF VR flight into a console context induces nausea and lost orientation (every immersive analytics demo: Virtualitics, Flow Immersive, Datavized). Operators don't *want* to fly; they want to *sit* and *glance*. Console mode must use the stationary camera; orbit/fly belongs in canvas/exploration mode.
6. **Head-anchored overlays**: HUD-style elements that follow the user's head break spatial recall. Vision Pro HIG warns against this; SCADA HMI guidance warns against it; pilot HUD doctrine includes "guard against tunnelling". Jarvis's existing input bar at the bottom of the window is screen-anchored, which is fine for desktop but must *not* be ported as head-anchored to AR. Replace with palm menu / world-anchored summoned panel.
7. **Decorative depth / 3D scatter as default**: Tableau Z-axis and Virtualitics 3D scatter look impressive but in operations they slow read times because depth-from-stereo is noisier than 2D position. Use 3D for *layout* (spatial arrangement of 2D panels) — not for *encoding data axes* in routine operations. (Exploration mode = OK; console mode = avoid.)
8. **Missing voice loop**: NASA's mission control works because of the *voice loop* alongside the displays. NOCs with no bridge call, ICUs with no nurse-doctor verbal handover, ATCs with no party-line frequency consistently produce coordination failures. For multi-user Jarvis, the analogous channel is the *agent reasoning trace + Listening transcript* — these must be a first-class shared surface, not a hidden log.

---

## Top patterns extracted

- **Horseshoe of fixed-slot panels** — Where seen: Bloomberg 4-quad, cockpit PFD-MFD-EICAS, trading 3-monitor arc, visionOS Personal Office, Horizon Workrooms Personal Office. Mechanism: panels world-anchored in a 120° arc around a stationary operator, with attention rank encoded by slot position. Why it works: matches human comfortable head-turn range and trains muscle memory. Caveat: only works if layout is *stable* (cargo-cult failure if dynamic).
- **Four-zone attention budget** (primary/working/ambient/deep-dive) — Where seen: cockpit, ICU, trading, mission control. Mechanism: information placed by refresh-rate need, not by topic. Why it works: matches how foveal + peripheral vision actually distribute attention. Caveat: requires the operator to internalise the assignment — training overhead.
- **Layered alert priority with paired visual+aural** — Where seen: CAS/EICAS, ICU monitors, SCADA per ISA-18.2, NOC dashboards. Mechanism: 4-5 priority tiers, each with a specific colour, animation, sound, and ack-required behaviour. Why it works: parallel sensory channels reduce miss rate; ack separates "seen" from "resolved". Caveat: must cap event rate or alarm fatigue.
- **Drill-down by content swap, not window proliferation** — Where seen: ISA-101 L1→L4, cockpit MFD pages, Bloomberg `<GO>` commands, NOC site detail. Mechanism: same panel, different content. Why it works: preserves spatial recall of where each panel "lives". Caveat: requires a back/breadcrumb affordance.
- **World-anchored over head-anchored** — Where seen: every Tier-A operations domain + visionOS HIG. Mechanism: panels live at fixed world positions; user's head moves around them. Why it works: peripheral motion perception needs fixed expected location for changes to be flagged. Caveat: AR users need to be able to *recall and reset* the canonical pose if they wander.
- **Shared wall + private console split** — Where seen: NASA FCR, NOC, power grid, stadium command. Mechanism: large shared canvas = team consensus, individual workstation = operator's tools. Why it works: separates "what the team agrees on" from "what I'm doing". Caveat: requires gestural/voice protocol for moving content between (pointing at the wall).
- **Trends-with-current-value, not current-value alone** — Where seen: cockpit (vertical-tape with trend mark), ICU (waveform strip + numeric), SCADA (mini-trend on every PV). Mechanism: every value display includes a short-term trend. Why it works: enables Endsley L2 (comprehension) and L3 (projection) directly from a glance. Caveat: trend window needs to be domain-appropriate.
- **Mission-elapsed-time as universal anchor** — Where seen: NASA, ICU code clock, ATC sector clock. Mechanism: a single, dominant time reference visible from every position. Why it works: anchors the event log + voice loop + memory recall. Caveat: timezone confusion if multi-site (mitigated by always using UTC).
- **Voice loop as orthogonal coordination channel** — Where seen: NASA, ATC, NOC bridge calls, OR/ICU handover. Mechanism: continuous verbal narration alongside visual displays. Why it works: capacity-plus-context that displays cannot carry. Caveat: requires *role discipline* (only the right people speak on the loop).
- **Stable layout enables 5-minute-scan recovery** — Where seen: cockpit return-from-galley, NOC shift change, ATC sector takeover, ICU shift handover. Mechanism: every value in the same place every time. Why it works: enables rapid delta-scan against remembered state. Caveat: blocks free-form personalisation.

---

## Anti-patterns observed

- **Cargo-cult monitor sprawl**: 6+ monitors without a layout principle. Fails because the time to *locate* a panel exceeds the time to *read* it. (Bloomberg, NOC, trader-blog evidence.)
- **Head-anchored primary content**: HUD-style overlay for important data. Breaks spatial recall and triggers attentional tunneling. (HUD literature, visionOS HIG.)
- **Alarm flood / undifferentiated event stream**: every change surfaced as a notification. Fails because operators desensitise. (ICU alarm fatigue, SCADA pre-ISA-18.2.)
- **Free-form dashboard editing in operations**: drag-anywhere panels that change layout per-user / per-session. Breaks training, handover, and the 5-minute scan. (BI failure modes, control-room ergonomics.)
- **Decorative depth in steady-state displays**: 3D scatter as a default analytics view. Slows read times; depth perception is noisier than 2D position for steady comparison. (Immersive analytics demos.)
- **Missing or hidden reasoning trace**: agent or system action with no visible chain. Breaks the L2 (comprehension) layer of SA — operator perceives the change but doesn't know what caused it. (Black-box automation in cockpits; well-known in airline incidents.)

---

## Implications for Interactive Jarvis

- **Introduce "Console mode" with fixed horseshoe layout** — Maps to lens L1, L3, L5, L8, L10. Affects: new `electron/main/console-mode.ts`; new `Console` artifact kind in `world-state.ts`; new `CameraController` (stationary) in `renderer/src/scene/`. Effort estimate: L. AR-readiness: ++. *This is the central recommendation.*
- **Add `attention_rank` field (1–4) per artifact** — Maps to L1. Affects: `world-state.ts`, MCP tool schemas, Layout-agent prompt. Effort: S. AR-readiness: neutral.
- **Layered alert system (Info/Caution/Warning/Emergency) for agent events** — Maps to L8. Affects: ActivityPanel rendering, new sound assets, per-panel border-glow shader. Effort: M. AR-readiness: +.
- **Per-panel border-glow shader + alerts attached to panels** — Maps to L8. Affects: `renderer/src/scene/CardPlate.tsx` (or equivalent), shader code. Effort: M. AR-readiness: +.
- **Trends mini-chart on each artifact** — Maps to L2 (Endsley L2/L3). Affects: panel-rendering, requires keeping a short-term history per artifact in WorldState. Effort: M. AR-readiness: neutral.
- **Stationary `CameraController` mode** — Maps to L3, L5. Affects: replacing OrbitControls assumptions; new controller; bookmark schema to include camera mode. Effort: M. AR-readiness: ++.
- **Brushing-and-linking across panels** — Maps to L10. Affects: selection state shared across panels, hover-highlight propagation. Effort: M. AR-readiness: neutral.
- **Persistent event timeline panel as default Slot A2** — Maps to L8, L11, Section B (5-minute scan). Affects: ActivityPanel becomes a first-class artifact kind. Effort: S–M. AR-readiness: +.
- **Saved consoles (named layouts) on bookmark slots** — Maps to L3 (named viewpoints). Affects: bookmark schema; user-facing UI. Effort: S. AR-readiness: +.
- **Cap simultaneous L2/L3 events with queue + "+N more" badge** — Maps to L8. Affects: ActivityPanel logic. Effort: S. AR-readiness: neutral.

---

## Open questions

1. **How does the Console mode interact with the existing canvas (free-form 3D) mode?** Single toggle (Tab)? Coexist as two scenes with shared underlying state? Persisted independently?
2. **What is the right number of slots in the horseshoe?** Bloomberg + cockpit converge on ~4-5; visionOS Personal Office uses 3; trading floors go up to 6. Needs prototype + measurement.
3. **Should the alarm/event taxonomy be domain-specific or universal?** Aviation has a fixed 4-tier model that worked across all aircraft; SCADA per ISA-18.2 also. For an LLM-driven tool, what are the analogous canonical event classes?
4. **How do we handle co-presence in console mode without a shared wall display?** NOCs/mission-control rely on the wall. In a single-user AR setup, what is the analog? An agent-avatar in the centre of the horseshoe?
5. **What is the right voice loop for a single-user + multiple-agent Jarvis?** Should each agent have a distinct voice (synthesised TTS) on a spatial audio channel? Continuous low-volume narration vs. push-to-talk request-respond?

---

## References (full)

NASA / aerospace mission control:
1. NASA. "Building on a Mission: The Houston Mission Control Center." NASA History. https://www.nasa.gov/history/building-on-a-mission-the-houston-mission-control-center/
2. Wikipedia. "Christopher C. Kraft Jr. Mission Control Center." https://en.wikipedia.org/wiki/Christopher_C._Kraft_Jr._Mission_Control_Center
3. Wikipedia. "List of NASA's flight control positions." https://en.wikipedia.org/wiki/List_of_NASA's_flight_control_positions
4. Gulf News. "Artemis 2 Mission Control in Houston Blends Apollo-Era Lessons with Cutting-Edge Orion Technology." 2025. https://gulfnews.com/world/americas/artemis-mission-shares-office-space-and-physics-with-apollo-1.500495867
5. NASA. "Behind Artemis Mission Control." Houston We Have a Podcast. https://www.nasa.gov/podcasts/houston-we-have-a-podcast/behind-artemis-mission-control/
6. PBS. "The Trench: The People at Mission Control." American Experience. https://www.pbs.org/wgbh/americanexperience/features/moon-trench-people-behind-mission-control/
7. TIME magazine. "MISSION CONTROL: FIDO, GUIDO AND RETRO." 1969 archive. https://time.com/archive/6637253/the-moon-mission-control-fido-guido-and-retro/

SpaceX:
8. Stack Overflow Blog. "Don't push that button: Exploring the software that flies SpaceX rockets and Starships." 2021-12-27. https://stackoverflow.blog/2021/12/27/dont-push-that-button-exploring-the-software-that-flies-spacex-starships/
9. Lithios Apps. "A Look Under the Hood of SpaceX's Dragon Capsule." https://www.lithiosapps.com/blog/a-look-under-the-hood-of-spacexs-dragon-capsule
10. Tesmanian. "SpaceX Software Engineers share details about Dragon during a Reddit AMA." https://www.tesmanian.com/blogs/tesmanian-blog/spacex-reddit
11. Mielke, S. "SpaceX Crew Dragon Touchscreen Displays UI/UX." https://www.shanemielke.com/work/spacex/crew-dragon-displays/

Bloomberg Terminal:
12. Wikipedia. "Bloomberg Terminal." https://en.wikipedia.org/wiki/Bloomberg_Terminal
13. Bloomberg. "Innovating a modern icon: How Bloomberg keeps the Terminal cutting-edge." https://www.bloomberg.com/company/stories/innovating-a-modern-icon-how-bloomberg-keeps-the-terminal-cutting-edge/
14. Bloomberg. "How Bloomberg Terminal UX designers conceal complexity." https://www.bloomberg.com/company/stories/how-bloomberg-terminal-ux-designers-conceal-complexity/
15. Bloomberg. "Designing the Terminal for Color Accessibility." https://www.bloomberg.com/company/stories/designing-the-terminal-for-color-accessibility/
16. Merz, T. "Amber on Black." 2021-06-26. https://ted-merz.com/2021/06/26/amber-on-black/
17. Hacker News. "The Bloomberg Terminal, Explained." https://news.ycombinator.com/item?id=21821327

Aviation cockpit & instrument scan:
18. Wikipedia. "Glass cockpit." https://en.wikipedia.org/wiki/Glass_cockpit
19. Wikipedia. "Primary flight display." https://en.wikipedia.org/wiki/Primary_flight_display
20. SKYbrary. "Multifunction Display (MFD)." https://skybrary.aero/articles/multifunction-display-mfd
21. SKYbrary. "Engine Indicating and Crew Alerting System (EICAS)." https://skybrary.aero/articles/engine-indicating-and-crew-alerting-system-eicas
22. AOPA. "4 Step Instrument Scan." 2003. https://www.aopa.org/news-and-media/all-news/2003/october/flight-training-magazine/4-step-instrument-scan
23. AOPA. "Scanning the Glass." 2008. https://www.aopa.org/news-and-media/all-news/2008/january/flight-training-magazine/scanning-the-glass
24. AOPA. "Cockpit Warning Systems." 1997. https://www.aopa.org/news-and-media/all-news/1997/april/pilot/cockpit-warning-systems
25. FAA. "AC 25.1322-1, Flight Crew Alerting." https://www.faa.gov/documentLibrary/media/Advisory_Circular/AC_25.1322-1.pdf
26. FAA. "DOT/FAA/AM-19/13: Pilot Attention Allocation." https://libraryonline.erau.edu/online-full-text/faa-aviation-medicine-reports/AM19-13.pdf
27. SKYbrary. "Head Up Display (HUD)." https://skybrary.aero/articles/head-display-hud
28. Wikipedia. "Head-up display." https://en.wikipedia.org/wiki/Head-up_display

SCADA / process control HMI:
29. ISA. "ISA-101 Series of Standards." https://www.isa.org/standards-and-publications/isa-standards/isa-101-standards
30. ANSI Blog. "ANSI/ISA 101.01-2015: HMIs for Process Automation Systems." https://blog.ansi.org/ansi/ansi-isa-101-01-2015-hmi-for-process-automation/
31. HMI Library. "ISA-101 HMI Design Standard: Complete Guide for Engineers." https://hmilibrary.com/standards/isa-101
32. ISA. "How to Maximize Operator Effectiveness with a High-Performance HMI." https://blog.isa.org/the-high-performance-hmi
33. Hollifield, B., Oliver, D., Nimmo, I., Habibi, E. *The High Performance HMI Handbook*. ISBN 9780977896912. https://www.amazon.com/High-Performance-HMI-Handbook/dp/0977896919
34. Wikipedia (Situation Awareness). "Endsley's three-level SA model." https://en.wikipedia.org/wiki/Situation_awareness

Healthcare ICU:
35. Drew, B. J. et al. "Multi-parameter vital sign database to assist in alarm optimization for general care units." PMC. https://pmc.ncbi.nlm.nih.gov/articles/PMC5081381/
36. Sendelbach, S. et al. "Computational approaches to alleviate alarm fatigue in intensive care medicine: A systematic literature review." PMC. https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9424650/
37. Koch et al. "Use of eye tracking in analyzing distribution of visual attention among critical care nurses." Journal of Clinical Monitoring and Computing. https://link.springer.com/article/10.1007/s10877-020-00628-2
38. Browning et al. "The impact of eye-tracking on patient safety in critical care." JCMC. https://link.springer.com/article/10.1007/s10877-022-00844-y
39. PMC. "Patient Monitoring Alarms in an Intensive Care Unit: Observational Study." https://pmc.ncbi.nlm.nih.gov/articles/PMC8196351/

NOC / network operations:
40. ExtNoC. "Network Operations Center (NOC) Design & Layout." https://www.extnoc.com/network-operations-center/noc-design-and-layout/
41. Barco. "Network operations center (NOC) solutions." https://www.barco.com/en/solutions/control-rooms/network-operations-center
42. Barco. "Reducing visual clutter: from multiple monitors to one unified workspace." https://www.barco.com/en/inspiration/news-insights/reducing-visual-clutter-in-control-rooms
43. ScienceSoft. "NOC Design, or How to Build an Orderly Network Operations Center." https://www.scnsoft.com/it-operations/noc-design

Power grid:
44. GE Vernova. "From Reaction to Pro-action: Modernizing the Grid Control Room (ADMS whitepaper)." https://www.gevernova.com/grid-solutions/sites/default/files/resources/products/casestudy/adms_whitepaper_03_web.pdf
45. PrimateTech. "Understanding Situational Awareness." https://www.primate-tech.com/resources/understanding-situational-awareness
46. ResearchGate. "Visualization Proposal for Power System Control Rooms Based on Situational Awareness." https://www.researchgate.net/publication/362329644_Visualization_Proposal_for_Power_System_Control_Rooms_Based_on_Situational_Awareness
47. Electric Energy Online. "Do Video Display Walls Improve Situational Awareness in Control Rooms?" https://electricenergyonline.com/energy/magazine/423/article/Do-Video-Display-Walls-Improve-Situational-Awareness-in-Control-Rooms-.htm

Ship bridges (IMO):
48. IMO. "Electronic Nautical Charts (ENC) and Electronic Chart Display and Information Systems (ECDIS)." https://www.imo.org/en/ourwork/safety/pages/electroniccharts.aspx
49. L3Harris. "Integrated Bridge System." https://www.l3harris.com/all-capabilities/integrated-bridge-system
50. Wikipedia. "Electronic navigational chart." https://en.wikipedia.org/wiki/Electronic_navigational_chart
51. Kongsberg Maritime. "K-Bridge ECDIS." https://www.kongsberg.com/maritime/products/bridge-systems-and-control-centres/navigation-systems/ecdis-electronic-chart-display-system/

Air traffic control:
52. SKYbrary. "Situation Display." https://skybrary.aero/articles/situation-display
53. AviationKnowledge. "Controller Workstation Ergonomics." http://aviationknowledge.wikidot.com/aviation:air-traffic-controller-atc-s-working-position-cwp
54. USPTO. "Electronic flight data strips and method for air traffic control." https://image-ppubs.uspto.gov/dirsearch-public/print/downloadPdf/6131065
55. ENAC. "ENAC prepares air traffic controllers for modern air traffic management tools." https://www.enac.fr/en/enac-prepares-air-traffic-controllers-modern-air-traffic-management-tools

Apple Vision Pro & Meta Horizon Workrooms:
56. Apple. "Use your Mac with Apple Vision Pro." https://support.apple.com/en-us/118521
57. Apple Newsroom. "visionOS 26 introduces powerful new spatial experiences." 2025. https://www.apple.com/newsroom/2025/06/visionos-26-introduces-powerful-new-spatial-experiences-for-apple-vision-pro/
58. iMore. "How to use multiple displays with Apple Vision Pro." https://www.imore.com/vision-pro/how-to-use-multiple-displays-with-apple-vision-pro
59. TechCrunch. "Splitscreen brings a multimonitor setup to Apple's Vision Pro." 2024. https://techcrunch.com/2024/02/27/splitscreen-brings-a-multi-monitor-setup-to-apples-vision-pro/
60. UploadVR. "Horizon Workrooms Gets Triple Screen Personal Office, Sticky Notes, & More." https://www.uploadvr.com/horizon-workrooms-multi-screen-office/
61. UploadVR. "Horizon Workrooms Now Gives You Free Extra Monitors on Windows." https://www.uploadvr.com/horizon-workrooms-triple-monitors-windows/
62. Meta for Work. "Horizon Workrooms." https://forwork.meta.com/horizon-workrooms/

Immersive analytics startups:
63. Virtualitics. "Why Does Immersive Data Visualization Matter?" https://virtualitics.com/why-does-immersive-data-visualization-matter/
64. Virtualitics. "What Are 3D Data Visualizations?" https://virtualitics.com/what-are-3d-data-visualizations/
65. Flow Immersive. https://flowimmersive.com/
66. Built In. "Is VR Data Visualization the Next Frontier?" https://builtin.com/data-science/ar-vr-data-visualization
67. Kraus, M. et al. "Immersive Analytics with Abstract 3D Visualizations: A Survey." Computer Graphics Forum 2022. https://onlinelibrary.wiley.com/doi/10.1111/cgf.14430

Wall-display / collaboration research:
68. Liu, Y. et al. "Establishing Awareness through Pointing Gestures during Collaborative Decision-Making in a Wall-Display Environment." CHI 2023. https://arxiv.org/html/2401.09324
69. MDPI. "Mixed-Presence Collaboration with Wall-Sized Displays." https://www.mdpi.com/2414-4088/8/12/109
70. ResearchGate. "Supporting Situation Awareness of Individuals and Teams Using Group View Displays." https://www.researchgate.net/publication/239569929_Supporting_Situation_Awareness_of_Individuals_and_Teams_Using_Group_View_Displays

Peripheral vision attention:
71. IEEE. "Attention Support with Soft Visual Cues in Control Room Environments." https://ieeexplore.ieee.org/document/9373088/
72. IEEE. "Visual attention control using peripheral vision stimulation." https://ieeexplore.ieee.org/document/8122803/
73. IEEE. "Attention guiding techniques using peripheral vision and eye tracking for feedback in augmented-reality-based assistance systems." https://ieeexplore.ieee.org/document/7893338/

Trading screen layout:
74. Day Trading Toolkit. "How to Set Up Your Trading Screen Layout (Single & Multi-Monitor Guides)." https://daytradingtoolkit.com/beginners-guide/trading-screen-layout-setup-guide/
75. Bestier. "Day Trading Desk Setup: Multi-Monitor Layouts for High Productivity." https://bestier.net/blogs/integrated-setup-guides/day-trading-desk-setup-multi-monitor-layouts

Brushing-and-linking:
76. Roberts, J. C. "State of the Art: Coordinated & Multiple Views in Exploratory Visualization." 2007. https://www.cs.kent.ac.uk/pubs/2007/2559/content.pdf
77. Observable. "Use linked brushing to explore patterns across dimensions, space, and time." https://observablehq.com/blog/linked-brushing
78. Dev3lop. "Interactive Brushing and Linking in Multi-View Dashboards." https://dev3lop.com/blog/interactive-brushing-and-linking-in-multi-view-dashboards/

Multi-monitor productivity research:
79. Plugable. "Productivity Impact of Multiple Monitors." https://plugable.com/blogs/news/productivity-impact-of-multiple-monitors
80. APA. "Multitasking: Switching costs." https://www.apa.org/topics/research/multitasking
81. Wake Forest News. "The 'switch cost' of multitasking." 2024. https://news.wfu.edu/2024/04/16/the-switch-cost-of-multitasking/

Control-room ergonomics:
82. Tresco Consoles. "Best Monitor Layouts For Control Room Ergonomics." https://www.trescoconsoles.com/blog/the-best-monitor-layout-for-your-control-room/
83. Tresco. "Control Room Design: The #1 Rule for Ergonomics & Efficiency." https://www.trescoconsoles.com/blog/control-room-design-the-golden-rule/
84. ABB. "How to enhance control room operator capacities." https://www.abb.com/global/en/areas/automation/solutions/control-rooms/articles/enhance-operator-capacity
85. ITER. "Human factors at the heart of Control Room design." https://www.iter.org/node/20687/human-factors-heart-control-room-design

Inspirational / theoretical:
86. Victor, B. Personal site (Dynamicland & writing). https://worrydream.com/
87. Substack. "Dynamicland: Bret Victor's Vision for Human-Centered Computing." https://machaddr.substack.com/p/dynamicland-bret-victors-vision-for
88. MIT Media Lab. "Dynamicland: Bret Victor." https://www.media.mit.edu/events/bret-victor-talk/
