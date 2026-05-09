import type Database from 'better-sqlite3';

interface Migration {
  version: number;
  sql: string;
}

const MIGRATIONS: Migration[] = [
  {
    version: 1,
    sql: `
      CREATE TABLE sessions (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        started_at INTEGER NOT NULL,
        agent_session_ids TEXT NOT NULL DEFAULT '{}'
      );

      CREATE TABLE artifacts (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL REFERENCES sessions(id),
        kind TEXT NOT NULL,
        mime TEXT NOT NULL,
        title TEXT NOT NULL,
        short_name TEXT NOT NULL,
        body TEXT,
        body_path TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        created_by TEXT NOT NULL,
        spec TEXT,
        pinned INTEGER NOT NULL DEFAULT 0,
        position TEXT,
        state TEXT NOT NULL DEFAULT 'ready'
      );
      CREATE INDEX idx_artifacts_session ON artifacts(session_id);
      CREATE INDEX idx_artifacts_kind ON artifacts(kind);
      CREATE INDEX idx_artifacts_short_name ON artifacts(short_name);

      CREATE TABLE edges (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL REFERENCES sessions(id),
        src TEXT NOT NULL REFERENCES artifacts(id) ON DELETE CASCADE,
        dst TEXT NOT NULL REFERENCES artifacts(id) ON DELETE CASCADE,
        kind TEXT NOT NULL,
        weight REAL NOT NULL DEFAULT 1.0,
        created_by TEXT NOT NULL
      );
      CREATE INDEX idx_edges_session ON edges(session_id);
      CREATE INDEX idx_edges_src ON edges(src);
      CREATE INDEX idx_edges_dst ON edges(dst);

      CREATE TABLE actions (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL REFERENCES sessions(id),
        kind TEXT NOT NULL,
        status TEXT NOT NULL,
        agent TEXT NOT NULL,
        label TEXT NOT NULL,
        started_at INTEGER NOT NULL,
        ended_at INTEGER,
        cost REAL,
        tokens INTEGER,
        parent_action_id TEXT,
        produced_artifact_ids TEXT NOT NULL DEFAULT '[]'
      );
      CREATE INDEX idx_actions_session ON actions(session_id);
      CREATE INDEX idx_actions_status ON actions(status);

      CREATE TABLE transcript_chunks (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL REFERENCES sessions(id),
        ts INTEGER NOT NULL,
        source TEXT NOT NULL,
        text TEXT NOT NULL,
        utterance_id TEXT,
        is_final INTEGER NOT NULL
      );
      CREATE INDEX idx_chunks_session_ts ON transcript_chunks(session_id, ts);

      CREATE TABLE utterances (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL REFERENCES sessions(id),
        text TEXT NOT NULL,
        completeness REAL NOT NULL DEFAULT 0,
        chunk_ids TEXT NOT NULL DEFAULT '[]',
        resulting_action_ids TEXT NOT NULL DEFAULT '[]'
      );
    `
  },
  {
    version: 2,
    sql: `ALTER TABLE actions ADD COLUMN prompt TEXT NOT NULL DEFAULT '';`
  },
  {
    version: 3,
    sql: `
      CREATE TABLE boards (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        template TEXT,
        started_at INTEGER NOT NULL,
        last_active_at INTEGER NOT NULL
      );

      INSERT INTO boards (id, name, template, started_at, last_active_at)
        VALUES ('default', 'Workspace', 'blank', strftime('%s','now')*1000, strftime('%s','now')*1000);

      ALTER TABLE artifacts ADD COLUMN board_id TEXT NOT NULL DEFAULT 'default' REFERENCES boards(id);
      ALTER TABLE artifacts ADD COLUMN parent_artifact_id TEXT REFERENCES artifacts(id);
      ALTER TABLE artifacts ADD COLUMN tags TEXT NOT NULL DEFAULT '[]';
      ALTER TABLE artifacts ADD COLUMN attachment_id TEXT;

      CREATE INDEX idx_artifacts_board ON artifacts(board_id);
      CREATE INDEX idx_artifacts_parent ON artifacts(parent_artifact_id);

      ALTER TABLE edges ADD COLUMN board_id TEXT NOT NULL DEFAULT 'default' REFERENCES boards(id);
      CREATE INDEX idx_edges_board ON edges(board_id);

      CREATE TABLE attachments (
        id TEXT PRIMARY KEY,
        artifact_id TEXT NOT NULL REFERENCES artifacts(id) ON DELETE CASCADE,
        path TEXT NOT NULL,
        mime TEXT NOT NULL,
        size INTEGER NOT NULL,
        sha256 TEXT NOT NULL,
        created_at INTEGER NOT NULL
      );
      CREATE INDEX idx_attachments_artifact ON attachments(artifact_id);

      CREATE TABLE bookmarks (
        id TEXT PRIMARY KEY,
        board_id TEXT NOT NULL REFERENCES boards(id),
        slot INTEGER NOT NULL,
        label TEXT,
        target_x REAL NOT NULL, target_y REAL NOT NULL, target_z REAL NOT NULL,
        eye_x REAL NOT NULL, eye_y REAL NOT NULL, eye_z REAL NOT NULL,
        created_at INTEGER NOT NULL,
        UNIQUE(board_id, slot)
      );

      CREATE TABLE notifications (
        id TEXT PRIMARY KEY,
        kind TEXT NOT NULL,
        level TEXT NOT NULL,
        title TEXT NOT NULL,
        body TEXT,
        payload TEXT,
        created_at INTEGER NOT NULL,
        read_at INTEGER
      );
      CREATE INDEX idx_notifications_created ON notifications(created_at);
      CREATE INDEX idx_notifications_unread ON notifications(read_at) WHERE read_at IS NULL;

      CREATE TABLE app_state (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
      INSERT INTO app_state (key, value) VALUES ('active_board_id', 'default');
      INSERT INTO app_state (key, value) VALUES ('onboarded', '0');
    `
  },
  {
    version: 4,
    sql: `
      ALTER TABLE edges ADD COLUMN label TEXT;
    `
  }
];

export function runMigrations(db: Database.Database): void {
  db.exec(`CREATE TABLE IF NOT EXISTS schema_version (
    version INTEGER PRIMARY KEY,
    applied_at INTEGER NOT NULL
  )`);

  const row = db.prepare('SELECT MAX(version) AS v FROM schema_version').get() as { v: number | null };
  const current = row.v ?? 0;

  const sorted = [...MIGRATIONS].sort((a, b) => a.version - b.version);
  for (const m of sorted) {
    if (m.version <= current) continue;
    const tx = db.transaction(() => {
      db.exec(m.sql);
      db.prepare('INSERT INTO schema_version (version, applied_at) VALUES (?, ?)').run(m.version, Date.now());
    });
    tx();
    console.log(`[db] applied migration v${m.version}`);
  }
}
