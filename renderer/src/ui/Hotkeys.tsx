import { useEffect } from 'react';
import { useWorldStore } from '../store/world-store';
import type { EdgeKind } from '@shared/types';

const EDGE_KIND_BY_DIGIT: Record<string, EdgeKind> = {
  '1': 'derives',
  '2': 'references',
  '3': 'contradicts',
  '4': 'groups-with'
};

export function Hotkeys() {
  const setSelected = useWorldStore(s => s.setSelected);
  const requestFrameAll = useWorldStore(s => s.requestFrameAll);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target;
      const inEditable =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        (target instanceof HTMLElement && target.isContentEditable);

      if ((e.metaKey || e.ctrlKey) && e.key === '.') {
        e.preventDefault();
        void window.api.cancelAll();
        return;
      }
      if (!inEditable && (e.key === 'f' || e.key === 'F')) {
        e.preventDefault();
        requestFrameAll();
        return;
      }
      if (!inEditable && (e.key === 'e' || e.key === 'E')) {
        e.preventDefault();
        const sel = [...useWorldStore.getState().selectedIds];
        if (sel.length < 2) return;
        const [first, ...rest] = sel;
        for (const dst of rest) {
          void window.api.createEdge(first, dst, 'references');
        }
        return;
      }
      if (!inEditable && (e.key === 't' || e.key === 'T')) {
        e.preventDefault();
        const state = useWorldStore.getState();
        state.setCameraMode(state.cameraMode === 'orbit' ? 'top-down' : 'orbit');
        return;
      }
      if ((e.metaKey || e.ctrlKey) && (e.key === 'f' || e.key === 'F') && !inEditable) {
        // Cmd+F search (lowercase f when not editable; uppercase 'F' alone is frame all)
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
        e.preventDefault();
        useWorldStore.getState().setSearchOpen(true);
        return;
      }
      if ((e.metaKey || e.ctrlKey) && (e.key === 'z' || e.key === 'Z')) {
        e.preventDefault();
        if (e.shiftKey) void window.api.redo();
        else void window.api.undo();
        return;
      }
      if (!inEditable && (e.key === 'i' || e.key === 'I' || e.key === 'Enter')) {
        const sel = [...useWorldStore.getState().selectedIds];
        if (sel.length === 1) {
          e.preventDefault();
          useWorldStore.getState().setInspectorArtifact(sel[0]);
          return;
        }
      }
      if (!inEditable && (e.key === 'v' || e.key === 'V')) {
        const sel = [...useWorldStore.getState().selectedIds];
        if (sel.length === 1) {
          e.preventDefault();
          const cur = useWorldStore.getState().focusedArtifactId;
          useWorldStore.getState().setFocusedArtifact(cur === sel[0] ? null : sel[0]);
          return;
        }
      }
      if (!inEditable && (e.key === 'p' || e.key === 'P')) {
        const state = useWorldStore.getState();
        const sel = [...state.selectedIds];
        if (sel.length === 0) return;
        e.preventDefault();
        for (const id of sel) {
          const a = state.artifacts.get(id);
          if (!a) continue;
          if (a.pinned) void window.api.unpinArtifact(id);
          else void window.api.pinArtifact(id);
        }
        return;
      }
      if (!inEditable && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        navigateSelection(e.key);
        return;
      }
      // Bookmark hotkeys (1-9)
      if (!inEditable && /^[1-9]$/.test(e.key)) {
        const slot = parseInt(e.key, 10);
        const state = useWorldStore.getState();
        const sel = [...state.selectedIds];

        // Edge kind shortcut: with 2+ selected and digit 1-4, create edges
        if (sel.length >= 2 && EDGE_KIND_BY_DIGIT[e.key]) {
          e.preventDefault();
          const kind = EDGE_KIND_BY_DIGIT[e.key];
          const [first, ...rest] = sel;
          for (const dst of rest) {
            void window.api.createEdge(first, dst, kind);
          }
          return;
        }

        // Save bookmark with shift
        if (e.shiftKey) {
          e.preventDefault();
          window.dispatchEvent(new CustomEvent('jarvis:save-bookmark', { detail: { slot } }));
          return;
        }

        // Jump to bookmark
        if (state.bookmarks.has(slot)) {
          e.preventDefault();
          state.jumpBookmark(slot);
          return;
        }
      }
      if (!inEditable && (e.key === 'Backspace' || e.key === 'Delete')) {
        const sel = [...useWorldStore.getState().selectedIds];
        if (sel.length === 0) return;
        e.preventDefault();
        for (const id of sel) void window.api.deleteArtifact(id);
        setSelected(new Set());
        return;
      }
      if (e.key === 'Escape' && !inEditable) {
        setSelected(new Set());
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [setSelected, requestFrameAll]);

  return null;
}

function navigateSelection(key: string): void {
  const state = useWorldStore.getState();
  const sel = [...state.selectedIds];
  const artifacts = state.artifacts;
  const targets = state.targetPositions;

  if (sel.length === 0) {
    // Pick the artifact closest to camera target as starting point
    const first = [...artifacts.values()][0];
    if (first) state.setSelected(new Set([first.id]));
    return;
  }

  const current = artifacts.get(sel[0]);
  if (!current) return;
  const cur = targets.get(current.id) ?? current.position;
  if (!cur) return;

  let best: { id: string; score: number } | null = null;
  for (const a of artifacts.values()) {
    if (a.id === current.id) continue;
    const p = targets.get(a.id) ?? a.position;
    if (!p) continue;
    const dx = p.x - cur.x;
    const dy = p.y - cur.y;
    const dz = p.z - cur.z;
    let primary: number, secondary: number;
    if (key === 'ArrowRight') { primary = dx;  secondary = Math.abs(dy) + Math.abs(dz); }
    else if (key === 'ArrowLeft')  { primary = -dx; secondary = Math.abs(dy) + Math.abs(dz); }
    else if (key === 'ArrowUp')    { primary = dy;  secondary = Math.abs(dx) + Math.abs(dz); }
    else                            { primary = -dy; secondary = Math.abs(dx) + Math.abs(dz); }
    if (primary <= 0) continue;
    const score = primary - secondary * 0.5;
    if (!best || score > best.score) best = { id: a.id, score };
  }
  if (best) state.setSelected(new Set([best.id]));
}
