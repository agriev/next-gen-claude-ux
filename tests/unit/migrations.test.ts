/**
 * Migration safety tests — Wave 2 / B02 + B17.
 *
 * Verifies:
 *  - Fresh DB applies all migrations (v1..v6) and is reachable from runtime
 *  - Migration is idempotent (runMigrations on already-migrated DB is a no-op)
 *  - Built-in link types are seeded by v5
 *  - panels table accepts an insert with default columns (anchor='world')
 *
 * Uses better-sqlite3 in-memory mode (`:memory:`) — no electron dependency
 * means we exercise the raw schema without booting the app.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import type DatabaseType from 'better-sqlite3';
import { runMigrations } from '../../electron/main/db/migrations';

interface SchemaVersionRow { v: number | null }
interface CountRow { c: number }

/**
 * better-sqlite3 is a native module. After `npm run rebuild` (electron-rebuild),
 * the binary is compiled for Electron's NODE_MODULE_VERSION and won't load
 * in plain Node — which is what Vitest runs. CI installs without
 * electron-rebuild so it loads natively. Locally devs can re-run
 * `npm rebuild better-sqlite3 --update-binary` after testing.
 *
 * We `describe.skipIf` when the require fails so local devs see passing
 * tests even with an Electron-built binary. CI's clean install path keeps
 * us honest.
 */
let Database: typeof DatabaseType | null = null;
let loadError: Error | null = null;
try {
  Database = (await import('better-sqlite3')).default;
  const probe = new Database(':memory:');
  probe.close();
} catch (e) {
  loadError = e as Error;
}

const NATIVE_OK = Database !== null && loadError === null;

function freshDb(): DatabaseType.Database {
  if (!Database) throw loadError ?? new Error('better-sqlite3 not loadable');
  const db = new Database(':memory:');
  db.pragma('foreign_keys = ON');
  return db;
}

describe.skipIf(!NATIVE_OK)('runMigrations', () => {
  let db: DatabaseType.Database;

  beforeEach(() => {
    db = freshDb();
  });

  it('applies all 7 migrations on a fresh DB', () => {
    runMigrations(db);
    const row = db.prepare('SELECT MAX(version) AS v FROM schema_version').get() as SchemaVersionRow;
    expect(row.v).toBe(7);
  });

  it('notifications.severity default is info (B21)', () => {
    runMigrations(db);
    const cols = db.prepare("PRAGMA table_info(notifications)").all() as Array<{ name: string; dflt_value: string | null }>;
    const sev = cols.find(c => c.name === 'severity');
    expect(sev?.dflt_value).toBe("'info'");
  });

  it('is idempotent — second call is a no-op', () => {
    runMigrations(db);
    const firstCount = (db.prepare('SELECT COUNT(*) AS c FROM schema_version').get() as CountRow).c;
    runMigrations(db);
    const secondCount = (db.prepare('SELECT COUNT(*) AS c FROM schema_version').get() as CountRow).c;
    expect(secondCount).toBe(firstCount);
  });

  it('seeds the 4 built-in link types', () => {
    runMigrations(db);
    const rows = db.prepare('SELECT id, label, color, is_builtin FROM link_types ORDER BY id').all() as Array<{ id: string; label: string; color: string; is_builtin: number }>;
    expect(rows).toHaveLength(4);
    expect(rows.map(r => r.id)).toEqual(['contradicts', 'derives', 'groups-with', 'references']);
    for (const r of rows) {
      expect(r.is_builtin).toBe(1);
      expect(r.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(r.label.length).toBeGreaterThan(0);
    }
  });

  it('panels table accepts insert with default anchor=world', () => {
    runMigrations(db);
    const now = Date.now();
    // Need a board for the FK. The default one is seeded in v3.
    db.prepare(`INSERT INTO sessions (id, title, started_at) VALUES ('s1', 'test', ?)`).run(now);
    db.prepare(`
      INSERT INTO panels
        (id, session_id, board_id, title,
         position_x, position_y, position_z,
         size_w, size_h, widget_kind, widget_spec,
         anchor, created_at, updated_at, created_by)
      VALUES
        ('p1', 's1', 'default', 'TestPanel',
         0, 0, 0, 3, 2, 'empty', '{}',
         'world', ?, ?, 'test')
    `).run(now, now);
    const row = db.prepare('SELECT title, anchor, widget_kind FROM panels WHERE id = ?').get('p1') as { title: string; anchor: string; widget_kind: string };
    expect(row.title).toBe('TestPanel');
    expect(row.anchor).toBe('world');
    expect(row.widget_kind).toBe('empty');
  });

  it('migration v6 default columns: anchor and pinned have correct defaults', () => {
    runMigrations(db);
    const cols = db.prepare("PRAGMA table_info(panels)").all() as Array<{ name: string; dflt_value: string | null; notnull: number }>;
    const anchor = cols.find(c => c.name === 'anchor');
    const pinned = cols.find(c => c.name === 'pinned');
    const widget = cols.find(c => c.name === 'widget_kind');
    expect(anchor?.dflt_value).toBe("'world'");
    expect(pinned?.dflt_value).toBe('0');
    expect(widget?.dflt_value).toBe("'empty'");
  });

  it('cannot delete built-in link types via raw SQL DELETE without app-level check', () => {
    // SQLite-level: there's no constraint preventing DELETE of builtins —
    // that protection is enforced by Repo.deleteLinkType. This test
    // documents the boundary so a future schema-level safeguard (CHECK
    // constraint) can be added if app-level enforcement isn't enough.
    runMigrations(db);
    const beforeCount = (db.prepare('SELECT COUNT(*) AS c FROM link_types').get() as CountRow).c;
    expect(beforeCount).toBe(4);
    db.prepare('DELETE FROM link_types WHERE id = ?').run('derives');
    const afterCount = (db.prepare('SELECT COUNT(*) AS c FROM link_types').get() as CountRow).c;
    expect(afterCount).toBe(3); // demonstrates app-level protection is the only gate
  });
});
