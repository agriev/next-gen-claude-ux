import { app } from 'electron';
import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';
import chokidar, { type FSWatcher } from 'chokidar';
import simpleGit, { type SimpleGit } from 'simple-git';
import type { Artifact, ArtifactKind } from '../../shared/types';
import type { WorldState } from './world-state';
import { bus } from './event-bus';

const KIND_EXT: Record<ArtifactKind, string> = {
  doc: '.md',
  note: '.md',
  code: '.code',
  log: '.log',
  image: '.image',
  link: '.link',
  cluster: '.cluster.md'
};

function extFor(a: Artifact): string {
  if (a.kind === 'code') {
    if (a.mime?.includes('typescript')) return '.ts';
    if (a.mime?.includes('javascript')) return '.js';
    if (a.mime?.includes('python')) return '.py';
    if (a.mime?.includes('rust')) return '.rs';
    if (a.mime?.includes('go')) return '.go';
    return '.txt';
  }
  return KIND_EXT[a.kind] ?? '.txt';
}

function sha(s: string): string {
  return crypto.createHash('sha256').update(s).digest('hex');
}

export class FsSync {
  private root: string;
  private watcher: FSWatcher | null = null;
  private hashes = new Map<string, string>(); // file path → sha
  private writing = new Set<string>();         // suppress watcher echo
  private pending = new Map<string, NodeJS.Timeout>(); // artifact.id → debounce
  private gitRepos = new Map<string, SimpleGit>();
  private gitTimers = new Map<string, NodeJS.Timeout>();

  constructor(private world: WorldState) {
    this.root = path.join(app.getPath('userData'), 'boards');
    fs.mkdirSync(this.root, { recursive: true });
  }

  start(): void {
    // Initial sync: write all current-board artifacts to disk
    this.syncBoardToDisk(this.world.getActiveBoardId());
    this.startWatcher();
    this.scheduleGitCommit(this.world.getActiveBoardId());

    bus.on('world', e => {
      if (e.type === 'artifact.upserted') this.scheduleWrite(e.artifact);
      else if (e.type === 'artifact.removed') {
        // We don't know shortName from id-only event in all cases; rely on incremental DB pass next sync
        this.removeStaleFiles();
      } else if (e.type === 'board.switched') {
        this.syncBoardToDisk(e.boardId);
      }
    });
  }

  stop(): void {
    void this.watcher?.close();
    for (const t of this.pending.values()) clearTimeout(t);
    for (const t of this.gitTimers.values()) clearTimeout(t);
    this.pending.clear();
    this.gitTimers.clear();
  }

  private boardDir(boardId: string): string {
    const dir = path.join(this.root, boardId, 'artifacts');
    fs.mkdirSync(dir, { recursive: true });
    return dir;
  }

  private artifactPath(a: Artifact): string {
    return path.join(this.boardDir(a.boardId), `${a.shortName}${extFor(a)}`);
  }

  private syncBoardToDisk(boardId: string): void {
    const all = this.world.getAllArtifacts().filter(a => a.boardId === boardId);
    for (const a of all) this.writeNow(a);
    this.removeStaleFiles();
  }

  private removeStaleFiles(): void {
    const boardId = this.world.getActiveBoardId();
    const dir = this.boardDir(boardId);
    const valid = new Set<string>();
    for (const a of this.world.getAllArtifacts()) {
      if (a.boardId === boardId) valid.add(this.artifactPath(a));
    }
    for (const f of fs.readdirSync(dir)) {
      const full = path.join(dir, f);
      if (!valid.has(full)) {
        try { fs.unlinkSync(full); this.hashes.delete(full); } catch { /* ignore */ }
      }
    }
  }

  private scheduleWrite(a: Artifact): void {
    const prev = this.pending.get(a.id);
    if (prev) clearTimeout(prev);
    const t = setTimeout(() => {
      this.pending.delete(a.id);
      this.writeNow(a);
      this.scheduleGitCommit(a.boardId);
    }, 500);
    this.pending.set(a.id, t);
  }

  private writeNow(a: Artifact): void {
    try {
      const file = this.artifactPath(a);
      const existing = this.hashes.get(file);
      const newSha = sha(a.body);
      if (existing === newSha && fs.existsSync(file)) return;
      this.writing.add(file);
      fs.writeFileSync(file, a.body, 'utf-8');
      this.hashes.set(file, newSha);
      setTimeout(() => this.writing.delete(file), 200);
    } catch (err) {
      console.warn('[fs-sync] write failed', err);
    }
  }

  private startWatcher(): void {
    if (this.watcher) return;
    this.watcher = chokidar.watch(this.root, {
      depth: 4,
      persistent: true,
      ignoreInitial: true,
      awaitWriteFinish: { stabilityThreshold: 200, pollInterval: 50 }
    });
    this.watcher.on('change', filePath => this.onFileChanged(filePath));
  }

  private onFileChanged(filePath: string): void {
    if (this.writing.has(filePath)) return;
    let body: string;
    try {
      body = fs.readFileSync(filePath, 'utf-8');
    } catch {
      return;
    }
    const newSha = sha(body);
    if (this.hashes.get(filePath) === newSha) return;
    this.hashes.set(filePath, newSha);

    // Find artifact by file path: parse boardId and shortName from path
    const rel = path.relative(this.root, filePath);
    const parts = rel.split(path.sep);
    if (parts.length < 3 || parts[1] !== 'artifacts') return;
    const boardId = parts[0];
    const fileName = parts.slice(2).join(path.sep);
    const shortName = fileName.replace(/\.[^/.]+$/, '');

    const artifact = [...this.world.getAllArtifacts()].find(
      x => x.boardId === boardId && x.shortName === shortName
    );
    if (!artifact) return;
    if (artifact.body === body) return;

    void this.world.upsertArtifact({ ...artifact, body, updatedAt: Date.now() });
    bus.emit('world', { type: 'artifact.upserted', artifact: { ...artifact, body, updatedAt: Date.now() } });
  }

  private scheduleGitCommit(boardId: string): void {
    if (this.gitTimers.has(boardId)) return;
    const t = setTimeout(() => {
      this.gitTimers.delete(boardId);
      void this.gitCommit(boardId);
    }, 5 * 60 * 1000);
    this.gitTimers.set(boardId, t);
  }

  private async gitCommit(boardId: string): Promise<void> {
    try {
      const dir = path.join(this.root, boardId);
      let git = this.gitRepos.get(boardId);
      if (!git) {
        git = simpleGit({ baseDir: dir });
        this.gitRepos.set(boardId, git);
        const isRepo = await git.checkIsRepo();
        if (!isRepo) {
          await git.init();
          await git.addConfig('user.name', 'jarvis', false, 'local');
          await git.addConfig('user.email', 'jarvis@localhost', false, 'local');
        }
      }
      await git.add('.');
      const status = await git.status();
      if (status.files.length === 0) return;
      const msg = `auto: ${new Date().toISOString().slice(0, 19)} (${status.files.length} files)`;
      await git.commit(msg);
      console.log(`[fs-sync] git commit ${boardId}: ${msg}`);
    } catch (err) {
      console.warn('[fs-sync] git commit failed', err);
    }
  }
}
