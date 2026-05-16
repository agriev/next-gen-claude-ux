interface Waiter<T> {
  resolve: (v: IteratorResult<T>) => void;
}

export class AsyncQueue<T> {
  private buffer: T[] = [];
  private waiters: Array<Waiter<T>> = [];
  private closed = false;

  push(value: T): void {
    if (this.closed) return;
    if (this.waiters.length > 0) {
      const w = this.waiters.shift()!;
      w.resolve({ value, done: false });
    } else {
      this.buffer.push(value);
    }
  }

  close(): void {
    if (this.closed) return;
    this.closed = true;
    while (this.waiters.length > 0) {
      const w = this.waiters.shift()!;
      w.resolve({ value: undefined as unknown as T, done: true });
    }
  }

  size(): number { return this.buffer.length; }

  /**
   * Snapshot and clear pending values. Used during a context restart so we can
   * replay in-flight deltas onto the new queue. Does not affect waiters.
   */
  drain(): T[] {
    const out = this.buffer;
    this.buffer = [];
    return out;
  }

  async *[Symbol.asyncIterator](): AsyncGenerator<T> {
    while (true) {
      if (this.buffer.length > 0) {
        yield this.buffer.shift()!;
        continue;
      }
      if (this.closed) return;
      const result = await new Promise<IteratorResult<T>>(resolve => {
        this.waiters.push({ resolve });
      });
      if (result.done) return;
      yield result.value;
    }
  }
}
