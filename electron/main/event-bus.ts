import mitt, { Emitter } from 'mitt';
import type { WorldEvent, AgentLogEvent } from '../../shared/events';

type Events = {
  world: WorldEvent;
  agentLog: AgentLogEvent;
};

export const bus: Emitter<Events> = mitt<Events>();
