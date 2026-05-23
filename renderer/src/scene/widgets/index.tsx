/**
 * Widget dispatcher — given a Panel's widget spec, render the appropriate
 * concrete widget component. Centralises the kind→component routing so the
 * Panel primitive stays slim and the dispatch table is easy to scan.
 *
 * B25 drill-down: each widget receives an `onDrillDown` callback that maps
 * a data-point index back to an artifact (or any focus target). The
 * dispatcher resolves the target from the spec's optional `link` /
 * `nodeLinks` / `eventLinks` fields and forwards to the focus setter.
 */
import { useCallback } from 'react';
import type { Panel } from '@shared/types';
import { useWorldStore } from '../../store/world-store';
import { ChartPanelWidget } from './ChartPanelWidget';
import { FlowPanelWidget, type FlowSpec } from './FlowPanelWidget';
import { TimelineWidget, type TimelineSpec, type TimelineEvent } from './TimelineWidget';
import { Graph3DWidget, type Graph3DSpec } from './Graph3DWidget';
import type { ChartSpec } from '../../util/widgets/chart-canvas';

interface PanelWidgetSpecBase {
  /** Optional drill-down map: data-point index → artifact id/shortName. */
  links?: string[];
  /** Pull title from spec if absent on the panel. */
  title?: string;
}

export interface DispatcherProps {
  panel: Panel;
  /** Inner content area (panel.size minus title bar). */
  innerW: number;
  innerH: number;
}

export function WidgetDispatcher({ panel, innerW, innerH }: DispatcherProps) {
  const setFocusedArtifact = useWorldStore(s => s.setFocusedArtifact);
  const setSelected = useWorldStore(s => s.setSelected);
  const artifacts = useWorldStore(s => s.artifacts);

  const focusArtifact = useCallback((idOrShortName: string) => {
    // Resolve by id first, then by shortName.
    let target = artifacts.get(idOrShortName);
    if (!target) {
      for (const a of artifacts.values()) {
        if (a.shortName === idOrShortName) { target = a; break; }
      }
    }
    if (!target) return;
    setSelected(new Set([target.id]));
    setFocusedArtifact(target.id);
  }, [artifacts, setFocusedArtifact, setSelected]);

  const spec = panel.widget.spec as PanelWidgetSpecBase & Record<string, unknown>;

  switch (panel.widget.kind) {
    case 'chart': {
      const chartSpec = spec as unknown as ChartSpec & PanelWidgetSpecBase;
      return (
        <ChartPanelWidget
          spec={chartSpec}
          width={innerW}
          height={innerH}
          onDrillDown={index => {
            const idx = typeof index === 'number' ? index : index[0];
            const link = chartSpec.links?.[idx];
            if (link) focusArtifact(link);
          }}
        />
      );
    }
    case 'flow': {
      const flowSpec = spec as unknown as FlowSpec & PanelWidgetSpecBase;
      return (
        <FlowPanelWidget
          spec={flowSpec}
          width={innerW}
          height={innerH}
          onDrillDown={() => {
            const link = flowSpec.links?.[0];
            if (link) focusArtifact(link);
          }}
        />
      );
    }
    case 'timeline': {
      const tlSpec = spec as unknown as TimelineSpec & PanelWidgetSpecBase;
      return (
        <TimelineWidget
          spec={tlSpec}
          width={innerW}
          height={innerH}
          onDrillDown={(i, ev: TimelineEvent) => {
            const link = ev.link ?? tlSpec.links?.[i];
            if (link) focusArtifact(link);
          }}
        />
      );
    }
    case 'graph-3d': {
      const gSpec = spec as unknown as Graph3DSpec & PanelWidgetSpecBase;
      return (
        <Graph3DWidget
          spec={gSpec}
          width={innerW}
          height={innerH}
          onDrillDown={nodeId => focusArtifact(nodeId)}
        />
      );
    }
    case 'empty':
    default:
      return null;
  }
}
