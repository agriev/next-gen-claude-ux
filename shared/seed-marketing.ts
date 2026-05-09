import type { ArtifactKind, EdgeKind, ArtifactSpec, Vec3 } from './types';

export interface SeedArtifact {
  shortName: string;
  kind: ArtifactKind;
  mime: string;
  title: string;
  body: string;
  tags: string[];
  position: Vec3;
  spec?: ArtifactSpec;
}

export type SeedEdge = [src: string, dst: string, kind: EdgeKind];

/**
 * Marketing-strategy demo board for an indie B2B SaaS dev tool ("Ship").
 * Each artifact is a real-shaped piece of strategy work; edges express how
 * pieces relate (derives / references / contradicts / groups-with).
 */
export const MARKETING_ARTIFACTS: SeedArtifact[] = [
  {
    shortName: 'Mission',
    kind: 'doc',
    mime: 'text/markdown',
    title: 'Mission & Vision',
    body: `# Mission

Make shipping production-ready software effortless for solo developers and small teams — by automating the boilerplate nobody enjoys (CI, deploy, monitoring) without taking control away from the engineer.

# Vision (3-yr)

The default "build & ship" toolkit for the long tail of indie SaaS, replacing a fragile chain of free-tier services with one cohesive workflow.`,
    tags: ['strategy', 'core'],
    position: { x: -11, y: 2.5, z: 0 },
    spec: { summary: 'High-level mission and 3-year vision', tags: ['strategy'], refs: [], tokens: 60 }
  },
  {
    shortName: 'Persona',
    kind: 'doc',
    mime: 'text/markdown',
    title: 'Target persona — "Indie dev Sam"',
    body: `# Sam, 32

- Solo founder or part of a 2–3 person team.
- Ships 1–2 products/year, lives in TypeScript and Python.
- Pays for: Vercel, Linear, Stripe, Sentry. Hesitant to add another tool.
- Hates: writing CI yamls, debugging GitHub Actions, weekend incidents.
- Reads: HN, dev.to, indie hackers.

## Pains
1. CI breaks on every dependency change
2. Deploy lives in 4 different dashboards
3. No idea what's broken until a user complains`,
    tags: ['research', 'core'],
    position: { x: -7, y: 2.5, z: 1 },
    spec: { summary: 'Indie dev shipping SaaS, frustrated by ops boilerplate', tags: ['persona', 'research'], refs: [], tokens: 80 }
  },
  {
    shortName: 'Positioning',
    kind: 'doc',
    mime: 'text/markdown',
    title: 'Positioning statement',
    body: `# Positioning

**For** indie developers and small teams **who** ship SaaS,
**we are** the all-in-one shipping platform **that** replaces a tangled chain of free-tier ops services
**with** a single cohesive workflow that just works,
**unlike** Vercel + GitHub Actions + Sentry + Datadog + ad-hoc scripts.

## Wedge
"Replace 6 dashboards with 1, in 10 minutes."`,
    tags: ['strategy', 'messaging'],
    position: { x: -2.5, y: 2.5, z: 0 },
    spec: { summary: 'Replace 6 ops dashboards with 1 cohesive workflow', tags: ['positioning'], refs: ['Persona', 'Mission'], tokens: 70 }
  },
  {
    shortName: 'Pricing',
    kind: 'doc',
    mime: 'text/markdown',
    title: 'Pricing tiers',
    body: `# Tiers

| Tier   | Price       | Targets       | Includes |
|--------|-------------|---------------|----------|
| Hobby  | $0          | side projects | 1 project, 1k req/day |
| Solo   | $19/mo      | indie SaaS    | 5 projects, 100k req/day, alerts |
| Team   | $79/mo      | 3–10 people   | unlimited, SSO, audit log |
| Scale  | custom      | >10 people    | enterprise SLAs |

## Anchors
- Hobby competes with self-host
- Solo undercuts Vercel Pro ($20) + Sentry Team ($26)
- Team upgrades naturally at hire #3`,
    tags: ['pricing', 'strategy'],
    position: { x: 2, y: 2.5, z: -1 },
    spec: { summary: '4-tier pricing: $0 / $19 / $79 / custom', tags: ['pricing'], refs: ['Positioning'], tokens: 90 }
  },
  {
    shortName: 'GTMPlan',
    kind: 'doc',
    mime: 'text/markdown',
    title: 'Q1 GTM plan',
    body: `# Q1 Go-to-Market

## Motion
Product-led with founder-led sales for Team tier.

## Sequence
1. **Wk 1–2** — soft launch on HN + dev.to, 200 signups
2. **Wk 3–4** — 50 user interviews, pick 3 case studies
3. **Wk 5–8** — Show HN, Product Hunt, target 1k signups
4. **Wk 9–12** — outbound to YC W24 batch, target 10 paid Team accounts

## Targets
- 1k signups · 80 paid (Solo) · 10 paid (Team) · ARR run-rate $20k`,
    tags: ['gtm', 'planning'],
    position: { x: 7, y: 2.5, z: 1 },
    spec: { summary: 'Q1 PLG + founder-led; 1k signups, $20k ARR target', tags: ['gtm'], refs: ['Persona', 'Channels'], tokens: 100 }
  },
  {
    shortName: 'Channels',
    kind: 'note',
    mime: 'text/markdown',
    title: 'Marketing channels',
    body: `# Channels (priority)

1. **HN** — Show HN at week 5
2. **dev.to** — 1 long-form/week, technical deep dives
3. **X/Twitter** — daily build-in-public threads
4. **Cold email** — YC W24 batch, hand-curated
5. **Product Hunt** — week 6
6. **YouTube** — 1 demo, 1 podcast appearance

Avoid in Q1: paid ads, Reddit (low signal for B2B dev).`,
    tags: ['gtm', 'channels'],
    position: { x: 11, y: 2.5, z: 0 },
    spec: { summary: 'HN, dev.to, X, cold email, PH; no paid ads in Q1', tags: ['channels'], refs: ['GTMPlan'], tokens: 60 }
  },
  {
    shortName: 'Budget',
    kind: 'code',
    mime: 'text/x-typescript',
    title: 'Q1 budget allocation',
    body: `// Q1 marketing budget (USD)
const budget = {
  total: 12_000,
  buckets: {
    contentWriter:    3_000,  // 3 long-form posts/mo via contractor
    designSubcontract: 1_500, // landing + 1 hero illustration
    swag:                800, // stickers + tee for early adopters
    podcastAds:        2_500, // 2 spots on Changelog + Syntax
    productHuntAds:      500,
    yourTime:              0, // founder doing rest
    contingency:       3_700
  }
} as const;

// CAC ceiling: $12,000 / 1,000 signups = $12`,
    tags: ['gtm', 'budget'],
    position: { x: 7, y: -1, z: 2 },
    spec: { summary: '$12k Q1 budget; $12 CAC ceiling', tags: ['budget'], refs: ['GTMPlan'], tokens: 70 }
  },
  {
    shortName: 'Metrics',
    kind: 'note',
    mime: 'text/markdown',
    title: 'KPIs & North Star',
    body: `# North Star
**Weekly active projects** — a project that built+deployed at least once in 7 days.

# Funnel
- Signup → Activation (first deploy < 10 min): 60% target
- Activation → Paid: 12% target
- Paid → 90-day retention: 80% target

# Counter-metrics
- Time-to-first-deploy must stay < 10 min
- Support tickets per 100 signups: alert if > 5`,
    tags: ['metrics', 'kpi'],
    position: { x: 11, y: -1, z: -1 },
    spec: { summary: 'NS: weekly active projects; activation 60%, paid 12%', tags: ['metrics'], refs: ['GTMPlan'], tokens: 80 }
  },
  {
    shortName: 'BrandVoice',
    kind: 'note',
    mime: 'text/markdown',
    title: 'Brand voice & tone',
    body: `# Voice

- **Direct** — no fluff, get to the value in <2 sentences
- **Technical** — assume the reader is a dev; use precise terms
- **Self-deprecating** — joke about ops pain, never about users
- **Anti-jargon** — say "deploy", not "release pipeline orchestration"

## Examples
✓ "Push to main. We'll handle the rest."
✗ "Streamline your deployment lifecycle with our enterprise-grade orchestration."`,
    tags: ['brand', 'content'],
    position: { x: -7, y: -1, z: -2 },
    spec: { summary: 'Direct, technical, self-deprecating, anti-jargon', tags: ['brand'], refs: [], tokens: 70 }
  },
  {
    shortName: 'Content',
    kind: 'note',
    mime: 'text/markdown',
    title: 'Content strategy',
    body: `# Content strategy

## Pillars
1. **Postmortems** — debug stories with real fixes
2. **Migrations** — "from $TOOL to us in 1 hour" guides
3. **Build-in-public** — weekly progress thread

## Cadence
- 1 long-form (1500w) post/wk on dev.to
- 3 BIP posts/wk on X
- 1 monthly newsletter ("This month in shipping")

## Distribution
Cross-post: dev.to → HN → personal blog`,
    tags: ['content', 'gtm'],
    position: { x: -2.5, y: -1, z: -2 },
    spec: { summary: 'Postmortems + migration guides + BIP; weekly cadence', tags: ['content'], refs: ['BrandVoice', 'Channels'], tokens: 80 }
  },
  {
    shortName: 'LaunchPost',
    kind: 'doc',
    mime: 'text/markdown',
    title: 'Show HN draft',
    body: `# Show HN: Ship — replace 6 ops dashboards with 1

Hi HN — I'm Anton, building Ship for the past 8 months.

If you're an indie dev or small team, you probably have: GitHub Actions for CI, Vercel for deploy, Sentry for errors, Datadog for metrics, cron for backups, and an ad-hoc Slackbot tying it together. That's 6 dashboards, 4 bills, and 0 sanity.

Ship is one workflow that does all of it: \`ship init && git push\`. Free for hobby projects.

Demo: ship.dev/demo (no signup)
Still rough — would love feedback on deploy speed and alert noise.`,
    tags: ['content', 'launch'],
    position: { x: 2, y: -1, z: -2 },
    spec: { summary: 'Show HN copy: 6→1 dashboards consolidation', tags: ['launch'], refs: ['Positioning', 'BrandVoice'], tokens: 90 }
  },
  {
    shortName: 'LandingHero',
    kind: 'note',
    mime: 'text/markdown',
    title: 'Landing hero — A/B variants',
    body: `# Hero copy variants

## A. Function-first
**Push to main. Ship handles the rest.**
Deploy, monitor, alert — one workflow, $0 to start.

## B. Problem-first
**You're tired of 6 ops dashboards.**
We replaced them with one. \`git push\` is the new deploy.

## C. Outcome-first
**Ship 10× more, debug 10× less.**
The build-and-deploy toolkit your weekends deserve.

## CTA variants
- "Try free" (chosen) · "Start shipping" · "See it in 30s"`,
    tags: ['content', 'landing'],
    position: { x: 7, y: -3.5, z: -1 },
    spec: { summary: 'Three hero copy variants for A/B testing', tags: ['landing', 'content'], refs: ['Positioning'], tokens: 90 }
  },
  {
    shortName: 'ColdEmail',
    kind: 'code',
    mime: 'text/x-markdown',
    title: 'Cold email — YC founders',
    body: `Subject: 10 min less ops/week, free for YC W24

Hi {{firstName}},

Saw {{startup}} on the YC W24 list — congrats. I built Ship after wasting half my last YC batch fighting GitHub Actions and Vercel quirks.

It's one config that handles deploy, monitoring, alerts, and rollbacks. We're free for the first year for W24 startups (no card, no email-spam).

Worth 10 minutes? Reply with "yes" and I'll send a setup video for {{startup}} specifically.

— Anton
P.S. If "we already have ops nailed", happy to be wrong — would love to hear what you use.`,
    tags: ['content', 'outbound'],
    position: { x: 11, y: -3.5, z: 0 },
    spec: { summary: 'YC W24 cold email; free first year offer', tags: ['outbound'], refs: ['BrandVoice', 'Positioning'], tokens: 70 }
  },
  {
    shortName: 'Compete',
    kind: 'doc',
    mime: 'text/markdown',
    title: 'Competitor map',
    body: `# Adjacent players

| Player    | Overlap         | Gap |
|-----------|-----------------|-----|
| Vercel    | Deploy + edge   | No CI/alerts; pricey at scale |
| Render    | Deploy + DB     | Slow CI; weak alerting |
| Railway   | Deploy + DB     | No monitoring; no alerts |
| Heroku    | Old guard       | Stagnant; expensive |
| Sentry    | Errors          | Alone, doesn't deploy |
| Datadog   | Metrics         | Enterprise focus, $$$ |

## Direct
- **Coolify, DXOS** — self-host competitors. Smaller mindshare.

## Implication
We're the "all-in-one for indies" — Vercel is closest, but pricing breaks at 100k req/day.`,
    tags: ['research', 'compete'],
    position: { x: -11, y: -1, z: 1 },
    spec: { summary: '6 adjacent players; we are all-in-one for indies', tags: ['compete'], refs: ['Positioning'], tokens: 100 }
  },
  {
    shortName: 'Research',
    kind: 'log',
    mime: 'text/plain',
    title: 'Customer interviews — week 1',
    body: `2026-01-08 14:00 — Maria, ops at Linear
  pain: GH Actions yaml refactors take 2 days; cares about deterministic builds
  wouldn't pay >$200/mo; uses self-hosted runners

2026-01-09 11:30 — Lex, indie SaaS (PostMate)
  pain: Sentry pings during dinner; no good alert routing
  pays $26/mo Sentry + $20 Vercel = sweet spot

2026-01-09 16:00 — Tomás, 3-person team
  pain: 4 different deploy URLs (preview/staging/prod/edge)
  willing to pay up to $100/mo if it kills 3 of these

2026-01-10 10:00 — Sasha, solo founder
  pain: doesn't trust black boxes; wants ssh-able VMs option
  signal: open-source pull is strong with this segment

Themes: alert routing, deterministic CI, deploy URL sprawl, no-black-box trust.`,
    tags: ['research'],
    position: { x: -7, y: -3.5, z: 1 },
    spec: { summary: 'Themes from 4 interviews: alert routing, CI determinism, URL sprawl, transparency', tags: ['research'], refs: ['Persona'], tokens: 100 }
  },
  {
    shortName: 'CaseStudy',
    kind: 'doc',
    mime: 'text/markdown',
    title: 'Case study — PostMate',
    body: `# Case study: PostMate ships 4× faster

**Customer:** PostMate (1-person SaaS, ~2k MAU)
**Before:** GitHub Actions + Vercel + Sentry + DigitalOcean cron. ~6 hours/wk on ops.
**After:** Ship. ~1.5 hours/wk on ops. Deploy time 8min → 90s.

## What changed
- 1 \`ship.config.ts\` replaced 4 yamls
- Alerts grouped by feature, not by error code
- Backups are 1 line, not a cron job

> "I unsubscribed from 4 monthly bills. The savings paid for Ship 3×."
> — Lex Chen, PostMate

*Posted: 2026-01-15*`,
    tags: ['social-proof', 'content'],
    position: { x: -2.5, y: -3.5, z: 1 },
    spec: { summary: 'PostMate: 6→1.5hrs/wk on ops, 4 bills cancelled', tags: ['case-study'], refs: ['Positioning', 'Research'], tokens: 90 }
  },
  {
    shortName: 'FunnelDiagram',
    kind: 'doc',
    mime: 'text/x-plantuml',
    title: 'Funnel — visual',
    body: `# Funnel diagram

@startuml
skinparam backgroundColor #FFFFFF
skinparam ActivityBackgroundColor #E8EAED
skinparam ActivityBorderColor #5EEAD4
start
:Visit landing;
:Sign up (60% funnel target);
:Activate — first deploy <10min;
if (paid?) then (yes)
  :Solo $19 / Team $79;
  :90-day retention 80% target;
else (no)
  :Hobby (free);
  -> nurture via email;
endif
stop
@enduml`,
    tags: ['metrics', 'diagram'],
    position: { x: 11, y: -3.5, z: 1 },
    spec: { summary: 'Visual funnel: visit → activate → paid (PlantUML)', tags: ['funnel', 'diagram'], refs: ['Metrics'], tokens: 70 }
  },
  {
    shortName: 'Onboarding',
    kind: 'note',
    mime: 'text/markdown',
    title: 'Onboarding — first 10 min',
    body: `# Time-to-first-deploy: 10 min target

## Steps
1. \`npm i -g @ship/cli\` (30s)
2. \`ship init\` in repo, picks language, writes config (1 min)
3. \`ship login\` — magic link, no password (45s)
4. \`git push\` — auto-detected, deploy starts (build varies 30s–3min)
5. Live URL + a "first deploy" celebration page with metrics already wired (instant)
6. Optional: connect Sentry-like errors panel (2 min)

## Activation event
First successful deploy = "activated". Trigger Slack ping to founders.`,
    tags: ['ux', 'product'],
    position: { x: 2, y: -3.5, z: 2 },
    spec: { summary: '10-min TTD target; 6 steps; activation = first deploy', tags: ['onboarding'], refs: ['Metrics'], tokens: 80 }
  },
  {
    shortName: 'Analytics',
    kind: 'code',
    mime: 'text/x-typescript',
    title: 'Analytics — tracking events',
    body: `// Event taxonomy
export const EVENTS = {
  signup_started:        { props: ['referrer'] },
  signup_completed:      { props: ['method'] },
  project_created:       { props: ['language', 'tier'] },
  first_deploy_started:  { props: ['projectId'] },
  first_deploy_succeeded:{ props: ['projectId', 'duration_ms'] }, // ACTIVATION
  upgrade_clicked:       { props: ['from_tier', 'to_tier'] },
  upgrade_completed:     { props: ['from_tier', 'to_tier', 'amount_usd'] },
  churned:               { props: ['days_active', 'last_event'] }
} as const;

// Sink: PostHog (self-hosted) -> warehouse for cohort analysis
export function track(event: keyof typeof EVENTS, props: Record<string, unknown>) {
  posthog.capture(event, { ...props, ts: Date.now() });
}`,
    tags: ['product', 'metrics'],
    position: { x: 7, y: -5.5, z: 0 },
    spec: { summary: 'Event taxonomy: 8 events, activation = first_deploy_succeeded', tags: ['analytics'], refs: ['Metrics'], tokens: 80 }
  }
];

export const MARKETING_EDGES: SeedEdge[] = [
  ['Mission',     'Positioning',  'derives'],
  ['Persona',     'Positioning',  'derives'],
  ['Persona',     'GTMPlan',      'derives'],
  ['Positioning', 'Pricing',      'references'],
  ['Positioning', 'LaunchPost',   'derives'],
  ['Positioning', 'LandingHero',  'derives'],
  ['Positioning', 'CaseStudy',    'references'],
  ['Positioning', 'ColdEmail',    'references'],
  ['Compete',     'Positioning',  'contradicts'],
  ['GTMPlan',     'Channels',     'groups-with'],
  ['GTMPlan',     'Budget',       'derives'],
  ['GTMPlan',     'Metrics',      'references'],
  ['Channels',    'Content',      'groups-with'],
  ['BrandVoice',  'Content',      'groups-with'],
  ['BrandVoice',  'LaunchPost',   'references'],
  ['BrandVoice',  'ColdEmail',    'references'],
  ['BrandVoice',  'LandingHero',  'references'],
  ['Research',    'Persona',      'derives'],
  ['Research',    'CaseStudy',    'references'],
  ['Onboarding',  'Metrics',      'groups-with'],
  ['Analytics',   'Metrics',      'groups-with'],
  ['Analytics',   'Onboarding',   'references'],
  ['FunnelDiagram', 'Metrics',    'derives']
];
