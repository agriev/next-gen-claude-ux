import { nanoid } from 'nanoid';
import { AsyncQueue } from '../async-queue';
import type { TranscriptChunk } from '../../../shared/types';

export interface TranscriptSource {
  start(): AsyncIterable<TranscriptChunk>;
  feedText(text: string): void;
  stop(): void;
}

export class KeyboardSource implements TranscriptSource {
  private queue = new AsyncQueue<TranscriptChunk>();
  private started = false;

  constructor(private sessionId: string) {}

  start(): AsyncIterable<TranscriptChunk> {
    this.started = true;
    return this.queue;
  }

  feedText(text: string): void {
    if (!this.started) return;
    this.queue.push({
      id: nanoid(10),
      sessionId: this.sessionId,
      ts: Date.now(),
      source: 'kbd',
      text,
      isFinal: true
    });
  }

  stop(): void {
    this.queue.close();
    this.started = false;
  }
}
