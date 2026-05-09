import type Database from 'better-sqlite3';
import type {
  Artifact, Edge, Action, Session, TranscriptChunk, Utterance, ArtifactSpec, Vec3,
  ArtifactKind, ArtifactState, EdgeKind, ActionKind, ActionStatus, AgentRole, TranscriptSource,
  Board, Bookmark, Notification, NotificationKind, NotificationLevel, Attachment
} from '../../../shared/types';

interface ArtifactRow {
  id: string; session_id: string; board_id: string;
  kind: string; mime: string;
  title: string; short_name: string; body: string | null; body_path: string | null;
  created_at: number; updated_at: number; created_by: string;
  spec: string | null; pinned: number; position: string | null; state: string;
  parent_artifact_id: string | null; tags: string; attachment_id: string | null;
}

interface EdgeRow {
  id: string; session_id: string; board_id: string;
  src: string; dst: string;
  kind: string; weight: number; created_by: string;
  label: string | null;
}

interface ActionRow {
  id: string; session_id: string; kind: string; status: string;
  agent: string; label: string; started_at: number; ended_at: number | null;
  cost: number | null; tokens: number | null; parent_action_id: string | null;
  produced_artifact_ids: string; prompt: string;
}

interface SessionRow {
  id: string; title: string; started_at: number; agent_session_ids: string;
}

interface BoardRow {
  id: string; name: string; template: string | null;
  started_at: number; last_active_at: number;
}

interface BookmarkRow {
  id: string; board_id: string; slot: number; label: string | null;
  target_x: number; target_y: number; target_z: number;
  eye_x: number; eye_y: number; eye_z: number;
  created_at: number;
}

interface NotificationRow {
  id: string; kind: string; level: string;
  title: string; body: string | null; payload: string | null;
  created_at: number; read_at: number | null;
}

interface AttachmentRow {
  id: string; artifact_id: string; path: string;
  mime: string; size: number; sha256: string; created_at: number;
}

function rowToArtifact(r: ArtifactRow): Artifact {
  return {
    id: r.id,
    boardId: r.board_id,
    kind: r.kind as ArtifactKind,
    mime: r.mime,
    title: r.title,
    shortName: r.short_name,
    body: r.body ?? '',
    bodyPath: r.body_path ?? undefined,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    createdBy: r.created_by,
    spec: r.spec ? (JSON.parse(r.spec) as ArtifactSpec) : undefined,
    tags: r.tags ? (JSON.parse(r.tags) as string[]) : [],
    pinned: r.pinned === 1,
    position: r.position ? (JSON.parse(r.position) as Vec3) : undefined,
    state: r.state as ArtifactState,
    parentArtifactId: r.parent_artifact_id ?? undefined,
    attachmentId: r.attachment_id ?? undefined
  };
}

function rowToEdge(r: EdgeRow): Edge {
  return {
    id: r.id, src: r.src, dst: r.dst,
    kind: r.kind as EdgeKind, weight: r.weight,
    createdBy: r.created_by as Edge['createdBy'],
    label: r.label ?? undefined
  };
}

function rowToAction(r: ActionRow): Action {
  return {
    id: r.id,
    kind: r.kind as ActionKind,
    status: r.status as ActionStatus,
    agent: r.agent as AgentRole,
    label: r.label,
    prompt: r.prompt ?? '',
    startedAt: r.started_at,
    endedAt: r.ended_at ?? undefined,
    cost: r.cost ?? undefined,
    tokens: r.tokens ?? undefined,
    parentActionId: r.parent_action_id ?? undefined,
    producedArtifactIds: JSON.parse(r.produced_artifact_ids) as string[]
  };
}

function rowToSession(r: SessionRow): Session {
  return {
    id: r.id, title: r.title, startedAt: r.started_at,
    agentSessionIds: JSON.parse(r.agent_session_ids)
  };
}

function rowToBoard(r: BoardRow): Board {
  return {
    id: r.id, name: r.name,
    template: (r.template as Board['template']) ?? undefined,
    startedAt: r.started_at, lastActiveAt: r.last_active_at
  };
}

function rowToBookmark(r: BookmarkRow): Bookmark {
  return {
    id: r.id, boardId: r.board_id, slot: r.slot,
    label: r.label ?? '',
    target: { x: r.target_x, y: r.target_y, z: r.target_z },
    eye: { x: r.eye_x, y: r.eye_y, z: r.eye_z },
    createdAt: r.created_at
  };
}

function rowToNotification(r: NotificationRow): Notification {
  return {
    id: r.id, kind: r.kind as NotificationKind,
    level: r.level as NotificationLevel,
    title: r.title, body: r.body ?? undefined,
    payload: r.payload ? JSON.parse(r.payload) : undefined,
    createdAt: r.created_at,
    readAt: r.read_at ?? undefined
  };
}

function rowToAttachment(r: AttachmentRow): Attachment {
  return {
    id: r.id, artifactId: r.artifact_id, path: r.path,
    mime: r.mime, size: r.size, sha256: r.sha256, createdAt: r.created_at
  };
}

export class Repo {
  constructor(private db: Database.Database) {}

  // ---------- app state ----------

  getAppState(key: string): string | null {
    const row = this.db.prepare('SELECT value FROM app_state WHERE key = ?').get(key) as { value: string } | undefined;
    return row?.value ?? null;
  }

  setAppState(key: string, value: string): void {
    this.db.prepare(`
      INSERT INTO app_state (key, value) VALUES (?, ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value
    `).run(key, value);
  }

  // ---------- sessions ----------

  upsertSession(s: Session): void {
    this.db.prepare(`
      INSERT INTO sessions (id, title, started_at, agent_session_ids)
      VALUES (@id, @title, @startedAt, @agentSessionIds)
      ON CONFLICT(id) DO UPDATE SET
        title = excluded.title,
        agent_session_ids = excluded.agent_session_ids
    `).run({
      id: s.id, title: s.title, startedAt: s.startedAt,
      agentSessionIds: JSON.stringify(s.agentSessionIds)
    });
  }

  latestSession(): Session | null {
    const r = this.db.prepare('SELECT * FROM sessions ORDER BY started_at DESC LIMIT 1').get() as SessionRow | undefined;
    return r ? rowToSession(r) : null;
  }

  // ---------- boards ----------

  upsertBoard(b: Board): void {
    this.db.prepare(`
      INSERT INTO boards (id, name, template, started_at, last_active_at)
      VALUES (@id, @name, @template, @startedAt, @lastActiveAt)
      ON CONFLICT(id) DO UPDATE SET
        name = excluded.name, template = excluded.template, last_active_at = excluded.last_active_at
    `).run({
      id: b.id, name: b.name, template: b.template ?? null,
      startedAt: b.startedAt, lastActiveAt: b.lastActiveAt
    });
  }

  getBoard(id: string): Board | null {
    const r = this.db.prepare('SELECT * FROM boards WHERE id = ?').get(id) as BoardRow | undefined;
    return r ? rowToBoard(r) : null;
  }

  listBoards(): Board[] {
    const rows = this.db.prepare('SELECT * FROM boards ORDER BY last_active_at DESC').all() as BoardRow[];
    return rows.map(rowToBoard);
  }

  deleteBoard(id: string): void {
    if (id === 'default') return;
    const tx = this.db.transaction(() => {
      this.db.prepare('DELETE FROM edges WHERE board_id = ?').run(id);
      this.db.prepare('DELETE FROM artifacts WHERE board_id = ?').run(id);
      this.db.prepare('DELETE FROM bookmarks WHERE board_id = ?').run(id);
      this.db.prepare('DELETE FROM boards WHERE id = ?').run(id);
    });
    tx();
  }

  // ---------- artifacts ----------

  upsertArtifact(a: Artifact, sessionId: string): void {
    this.db.prepare(`
      INSERT INTO artifacts
        (id, session_id, board_id, kind, mime, title, short_name, body, body_path,
         created_at, updated_at, created_by, spec, tags, pinned, position, state,
         parent_artifact_id, attachment_id)
      VALUES
        (@id, @sessionId, @boardId, @kind, @mime, @title, @shortName, @body, @bodyPath,
         @createdAt, @updatedAt, @createdBy, @spec, @tags, @pinned, @position, @state,
         @parentArtifactId, @attachmentId)
      ON CONFLICT(id) DO UPDATE SET
        board_id = excluded.board_id,
        kind = excluded.kind, mime = excluded.mime,
        title = excluded.title, short_name = excluded.short_name,
        body = excluded.body, body_path = excluded.body_path,
        updated_at = excluded.updated_at,
        spec = excluded.spec, tags = excluded.tags,
        pinned = excluded.pinned,
        position = excluded.position, state = excluded.state,
        parent_artifact_id = excluded.parent_artifact_id,
        attachment_id = excluded.attachment_id
    `).run({
      id: a.id, sessionId, boardId: a.boardId,
      kind: a.kind, mime: a.mime,
      title: a.title, shortName: a.shortName,
      body: a.body || null, bodyPath: a.bodyPath ?? null,
      createdAt: a.createdAt, updatedAt: a.updatedAt, createdBy: a.createdBy,
      spec: a.spec ? JSON.stringify(a.spec) : null,
      tags: JSON.stringify(a.tags ?? []),
      pinned: a.pinned ? 1 : 0,
      position: a.position ? JSON.stringify(a.position) : null,
      state: a.state,
      parentArtifactId: a.parentArtifactId ?? null,
      attachmentId: a.attachmentId ?? null
    });
  }

  removeArtifact(id: string): void {
    this.db.prepare('DELETE FROM artifacts WHERE id = ?').run(id);
  }

  getArtifact(id: string): Artifact | null {
    const r = this.db.prepare('SELECT * FROM artifacts WHERE id = ?').get(id) as ArtifactRow | undefined;
    return r ? rowToArtifact(r) : null;
  }

  listArtifactsByBoard(boardId: string): Artifact[] {
    const rows = this.db.prepare('SELECT * FROM artifacts WHERE board_id = ?').all(boardId) as ArtifactRow[];
    return rows.map(rowToArtifact);
  }

  // ---------- edges ----------

  upsertEdge(e: Edge, sessionId: string, boardId: string): void {
    this.db.prepare(`
      INSERT INTO edges (id, session_id, board_id, src, dst, kind, weight, created_by, label)
      VALUES (@id, @sessionId, @boardId, @src, @dst, @kind, @weight, @createdBy, @label)
      ON CONFLICT(id) DO UPDATE SET
        kind = excluded.kind,
        weight = excluded.weight,
        created_by = excluded.created_by,
        label = excluded.label
    `).run({
      id: e.id, sessionId, boardId,
      src: e.src, dst: e.dst, kind: e.kind, weight: e.weight, createdBy: e.createdBy,
      label: e.label ?? null
    });
  }

  removeEdge(id: string): void {
    this.db.prepare('DELETE FROM edges WHERE id = ?').run(id);
  }

  listEdgesByBoard(boardId: string): Edge[] {
    const rows = this.db.prepare('SELECT * FROM edges WHERE board_id = ?').all(boardId) as EdgeRow[];
    return rows.map(rowToEdge);
  }

  // ---------- actions ----------

  upsertAction(a: Action, sessionId: string): void {
    this.db.prepare(`
      INSERT INTO actions
        (id, session_id, kind, status, agent, label, prompt, started_at, ended_at,
         cost, tokens, parent_action_id, produced_artifact_ids)
      VALUES
        (@id, @sessionId, @kind, @status, @agent, @label, @prompt, @startedAt, @endedAt,
         @cost, @tokens, @parentActionId, @producedArtifactIds)
      ON CONFLICT(id) DO UPDATE SET
        status = excluded.status, ended_at = excluded.ended_at,
        cost = excluded.cost, tokens = excluded.tokens,
        produced_artifact_ids = excluded.produced_artifact_ids
    `).run({
      id: a.id, sessionId,
      kind: a.kind, status: a.status, agent: a.agent, label: a.label, prompt: a.prompt,
      startedAt: a.startedAt, endedAt: a.endedAt ?? null,
      cost: a.cost ?? null, tokens: a.tokens ?? null,
      parentActionId: a.parentActionId ?? null,
      producedArtifactIds: JSON.stringify(a.producedArtifactIds)
    });
  }

  listActions(sessionId: string): Action[] {
    const rows = this.db.prepare(
      'SELECT * FROM actions WHERE session_id = ? ORDER BY started_at DESC LIMIT 200'
    ).all(sessionId) as ActionRow[];
    return rows.map(rowToAction);
  }

  // ---------- transcripts / utterances ----------

  insertTranscriptChunk(c: TranscriptChunk): void {
    this.db.prepare(`
      INSERT OR REPLACE INTO transcript_chunks
        (id, session_id, ts, source, text, utterance_id, is_final)
      VALUES (@id, @sessionId, @ts, @source, @text, @utteranceId, @isFinal)
    `).run({
      id: c.id, sessionId: c.sessionId, ts: c.ts,
      source: c.source as TranscriptSource, text: c.text,
      utteranceId: c.utteranceId ?? null,
      isFinal: c.isFinal ? 1 : 0
    });
  }

  upsertUtterance(u: Utterance, sessionId: string): void {
    this.db.prepare(`
      INSERT INTO utterances (id, session_id, text, completeness, chunk_ids, resulting_action_ids)
      VALUES (@id, @sessionId, @text, @completeness, @chunkIds, @resultingActionIds)
      ON CONFLICT(id) DO UPDATE SET
        text = excluded.text, completeness = excluded.completeness,
        chunk_ids = excluded.chunk_ids, resulting_action_ids = excluded.resulting_action_ids
    `).run({
      id: u.id, sessionId, text: u.text, completeness: u.completeness,
      chunkIds: JSON.stringify(u.chunkIds),
      resultingActionIds: JSON.stringify(u.resultingActionIds)
    });
  }

  // ---------- bookmarks ----------

  upsertBookmark(b: Bookmark): void {
    this.db.prepare(`
      INSERT INTO bookmarks
        (id, board_id, slot, label, target_x, target_y, target_z, eye_x, eye_y, eye_z, created_at)
      VALUES (@id, @boardId, @slot, @label, @tx, @ty, @tz, @ex, @ey, @ez, @createdAt)
      ON CONFLICT(board_id, slot) DO UPDATE SET
        label = excluded.label,
        target_x = excluded.target_x, target_y = excluded.target_y, target_z = excluded.target_z,
        eye_x = excluded.eye_x, eye_y = excluded.eye_y, eye_z = excluded.eye_z
    `).run({
      id: b.id, boardId: b.boardId, slot: b.slot, label: b.label || null,
      tx: b.target.x, ty: b.target.y, tz: b.target.z,
      ex: b.eye.x, ey: b.eye.y, ez: b.eye.z,
      createdAt: b.createdAt
    });
  }

  listBookmarks(boardId: string): Bookmark[] {
    const rows = this.db.prepare('SELECT * FROM bookmarks WHERE board_id = ? ORDER BY slot ASC').all(boardId) as BookmarkRow[];
    return rows.map(rowToBookmark);
  }

  removeBookmark(id: string): void {
    this.db.prepare('DELETE FROM bookmarks WHERE id = ?').run(id);
  }

  // ---------- notifications ----------

  insertNotification(n: Notification): void {
    this.db.prepare(`
      INSERT INTO notifications (id, kind, level, title, body, payload, created_at, read_at)
      VALUES (@id, @kind, @level, @title, @body, @payload, @createdAt, @readAt)
    `).run({
      id: n.id, kind: n.kind, level: n.level,
      title: n.title, body: n.body ?? null,
      payload: n.payload ? JSON.stringify(n.payload) : null,
      createdAt: n.createdAt, readAt: n.readAt ?? null
    });
  }

  markNotificationRead(id: string): void {
    this.db.prepare('UPDATE notifications SET read_at = ? WHERE id = ?').run(Date.now(), id);
  }

  clearNotifications(): void {
    this.db.prepare('UPDATE notifications SET read_at = ? WHERE read_at IS NULL').run(Date.now());
  }

  listNotifications(limit = 50): Notification[] {
    const rows = this.db.prepare(
      'SELECT * FROM notifications ORDER BY created_at DESC LIMIT ?'
    ).all(limit) as NotificationRow[];
    return rows.map(rowToNotification);
  }

  // ---------- attachments ----------

  insertAttachment(a: Attachment): void {
    this.db.prepare(`
      INSERT INTO attachments (id, artifact_id, path, mime, size, sha256, created_at)
      VALUES (@id, @artifactId, @path, @mime, @size, @sha256, @createdAt)
    `).run({
      id: a.id, artifactId: a.artifactId, path: a.path,
      mime: a.mime, size: a.size, sha256: a.sha256, createdAt: a.createdAt
    });
  }

  getAttachment(id: string): Attachment | null {
    const r = this.db.prepare('SELECT * FROM attachments WHERE id = ?').get(id) as AttachmentRow | undefined;
    return r ? rowToAttachment(r) : null;
  }
}
