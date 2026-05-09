import { useEffect } from 'react';
import { useWorldStore } from '../store/world-store';
import { installMockApi } from './mock-api';

installMockApi();

export function useIpcBridge() {
  useEffect(() => {
    let mounted = true;
    window.api.getSnapshot().then(s => {
      if (mounted) {
        useWorldStore.getState().applySnapshot(s);
        console.log('[bridge] applied snapshot:', s.artifacts.length, 'artifacts,', s.edges.length, 'edges');
      }
    }).catch(err => console.error('[bridge] getSnapshot failed', err));
    const unsubDelta = window.api.onWorldDelta(batch => {
      useWorldStore.getState().applyEvents(batch.events);
    });
    const unsubLog = window.api.onAgentLog(e => {
      useWorldStore.getState().appendAgentLog(e);
    });
    return () => {
      mounted = false;
      unsubDelta();
      unsubLog();
    };
  }, []);
}
