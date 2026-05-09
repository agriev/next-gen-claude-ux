# Data model

## Storage

Single SQLite database at `<userData>/jarvis.db`. WAL mode, foreign keys on, `synchronous = NORMAL`. Schema migrations in `electron/main/db/migrations.ts` as inline SQL strings; a `schema_version` table tracks applied versions.

In-memory mirror in `WorldState` is scoped to the **active board** (artifacts/edges/actions/bookmarks). Board switch unloads and reloads from DB. Other boards persist DB-only until activated.

## Entity reference

### `Board`

```ts
interface Board {
  id: string;              // nanoid(10)
  name: string;
  template?: 'blank' | 'research' | 'journal';
  startedAt: number;
  lastActiveAt: number;
}
```

Default board id is `'default'`, created in migration v3. Cannot be deleted. Active board id is persisted in `app_state.active_board_id`.

### `Artifact`

```ts
interface Artifact {
  id: string;
  boardId: string;
  kind: 'doc' | 'note' | 'code' | 'log' | 'image' | 'link' | 'cluster';
  mime: string;
  title: string;           // human-readable title
  shortName: string;       // unique within board, used for @references
  body: string;            // inline if ≤64KB; else bodyPath points to file
  bodyPath?: string;
  createdAt: number;
  updatedAt: number;
  createdBy: string;       // actionId or 'user' / 'seed' / 'debug' / 'layout'
  spec?: ArtifactSpec;     // ≤200 tokens; what Layout reads
  tags: string[];          // user/agent-set; drives FilterChips
  pinned?: boolean;        // Layout skips pinned cards
  position?: Vec3;         // canvas position
  state: 'streaming' | 'ready' | 'updating' | 'error' | 'awaiting-input';
  parentArtifactId?: string;  // set when this is a highlight forked from parent
  attachmentId?: string;      // set for image/file kinds, links to attachments table
}

interface ArtifactSpec {
  summary: string;         // one or two sentences
  tags: string[];
  refs: string[];          // ids or shortNames of related artifacts
  tokens: number;
}
```

The `cluster` kind is a special render: a translucent labeled region wrapping its `spec.refs`. Body is typically the cluster description.

### `Edge`

```ts
interface Edge {
  id: string;
  src: string;
  dst: string;
  kind: 'derives' | 'references' | 'contradicts' | 'groups-with';
  weight: number;
  createdBy: 'user' | 'layout' | 'worker';
}
```

Directed. Cascade-deletes when either endpoint is removed.

### `Action`

```ts
interface Action {
  id: string;
  kind: 'research' | 'write' | 'edit' | 'clarify' | 'reference';
  status: 'queued' | 'running' | 'done' | 'cancelled' | 'error';
  agent: 'worker' | 'layout' | 'listening' | 'naming';
  label: string;            // first 80 chars of prompt
  prompt: string;           // full prompt, captured for inspection
  startedAt: number;
  endedAt?: number;
  cost?: number;            // total_cost_usd from SDK result
  tokens?: number;          // sum of input/output/cache tokens
  parentActionId?: string;  // for sub-agents
  producedArtifactIds: string[];
}
```

Captured per Worker run; surfaced in the Activity panel with expand-to-detail rows.

### `Bookmark`

```ts
interface Bookmark {
  id: string;
  boardId: string;
  slot: number;             // 1..9
  label: string;
  target: Vec3;             // OrbitControls target
  eye: Vec3;                // camera position
  createdAt: number;
}
```

Per-board, slot-unique. `Shift+1..9` saves current view; `1..9` (no selection) jumps to it.

### `Notification`

```ts
interface Notification {
  id: string;
  kind: 'worker.done' | 'worker.error' | 'fs.conflict' | 'system' | 'digest';
  level: 'info' | 'success' | 'warn' | 'error';
  title: string;
  body?: string;
  payload?: Record<string, unknown>;
  createdAt: number;
  readAt?: number;
}
```

Persistent ring. Worker fires `worker.done` for tasks >10s, `worker.error` for failures. Layout reorganizes fire `system`. NotificationCenter shows last 30 with unread badge.

### `Attachment`

```ts
interface Attachment {
  id: string;
  artifactId: string;
  path: string;             // absolute path under <userData>/attachments/<id>.<ext>
  mime: string;
  size: number;
  sha256: string;
  createdAt: number;
}
```

Created by paste/drop or by Worker calling `create_attachment_artifact`. Files are stored on disk separately from `body` (which holds a Markdown reference / placeholder).

### `TranscriptChunk` / `Utterance`

For voice/keyboard input. Currently mostly stub data — keyboard input bypasses the Listening agent in MVP and submits directly to the Worker.

### `app_state`

Key/value table. Currently used keys:

- `active_board_id` — the board to load on startup
- `onboarded` — `'1'` after the user has dismissed the tour
- `model.worker` / `model.layout` / `model.listening` / `model.naming` — model id per agent role

---

## Migrations

```
v1 — initial: sessions, artifacts, edges, actions, transcript_chunks, utterances
v2 — actions.prompt column
v3 — boards, attachments, bookmarks, notifications, app_state;
     artifacts.{board_id, parent_artifact_id, tags, attachment_id};
     edges.board_id;
     default board row;
     onboarded flag;
```

Each migration is wrapped in a SQLite transaction, version recorded in `schema_version`.

To add a migration: append a new entry to the `MIGRATIONS` array in `electron/main/db/migrations.ts`. Use `ALTER TABLE ... ADD COLUMN ... NOT NULL DEFAULT ...` for safe additions on populated tables.

---

## Filesystem mirror layout

```
<userData>/
├── jarvis.db            # main DB (WAL)
├── jarvis.db-wal
├── jarvis.db-shm
├── attachments/
│   ├── <attachment_id>.png
│   └── ...
└── boards/
    └── <board_id>/
        ├── .git/                     # initialized lazily by FsSync
        └── artifacts/
            ├── Mission.md            # `# Mission\n\nMake shipping...`
            ├── Pulse.ts              # full TypeScript file
            └── Trace.log
```

Extension chosen by `kind` and `mime`:

| kind | default ext | with mime hint |
|---|---|---|
| doc, note | `.md` | |
| code | `.code` | `.ts` (typescript), `.js`, `.py`, `.rs`, `.go` |
| log | `.log` | |
| cluster | `.cluster.md` | |
| image | `.image` | (binary; usually saved as the original .png/.jpg via attachments) |
| link | `.link` | |

The renderer doesn't read these files; they exist as a developer-friendly mirror so you can `cd` into a board and grep, edit in your IDE, or commit to git outside the app.

---

## Live in-memory state (renderer)

```ts
// renderer/src/store/world-store.ts
interface WorldStore {
  artifacts: Map<string, Artifact>;
  edges: Map<string, Edge>;
  actions: Map<string, Action>;
  actionLogs: Map<string, ActionLogEntry[]>; // streamed agent logs per action
  targetPositions: Map<string, Vec3>;        // layout-agent's intended position
  bookmarks: Map<number, Bookmark>;
  boards: Map<string, Board>;
  notifications: Notification[];

  selectedIds: Set<string>;
  inspectorArtifactId: string | null;
  focusedArtifactId: string | null;          // V key — voice routes here
  searchOpen: boolean;
  filters: FilterState;                      // kinds, tags, query, pinnedOnly
  cameraMode: 'orbit' | 'top-down';

  activeBoardId: string;
  modelSettings: ModelSettings;
  undoCount: number;
  redoCount: number;
  layoutHistoryCount: number;
  listeningStatus: ListeningStatus;
  // ...
}
```

Updated by `applySnapshot` on mount and by `applyEvents` on each `WorldDeltaBatch` from main. Components subscribe via Zustand selectors; R3F `useFrame` reads the live `targetPositions` to interpolate card positions.

A separate module-level mutable Map (`scene/live-transforms.ts`) holds per-frame artifact world positions; edges read from it directly to keep their endpoints attached during user drag (without going through React re-renders).
