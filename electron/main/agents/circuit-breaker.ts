/**
 * CircuitBreaker — B13 in BACKLOG-v2.md.
 *
 * Tiny state machine to keep long-lived agents (Layout, Listening) alive
 * across transient API failures (429, 5xx, network blips). Used by
 * `LayoutAgent.restart('error')`.
 *
 * States:
 *   - closed   : healthy; no recent failures; restart on error is OK
 *   - half-open: probing after a backoff; one more failure trips to open
 *   - open     : too many failures in window; further restart attempts wait
 *                MAX_BACKOFF_MS before resetting to half-open
 *
 * Backoff schedule: 0s → 5s → 30s → 2min → 2min → ... Each failure inside
 * the window doubles the wait (clamped to MAX_BACKOFF_MS). A successful
 * turn (recordSuccess) resets the counter to 0 and the state to closed.
 *
 * Reference: classic Hystrix-style breaker; tuned for a single-process
 * Electron app rather than a distributed service.
 */

/** ms; failures within this window count against each other. */
const FAILURE_WINDOW_MS = 60_000;
/** ms; ceiling on the exponential backoff. */
const MAX_BACKOFF_MS = 120_000;
/** number of failures inside FAILURE_WINDOW_MS that trips closed → open. */
const TRIP_THRESHOLD = 3;

export type BreakerState = 'closed' | 'half-open' | 'open';

export interface BreakerStatus {
  state: BreakerState;
  failuresInWindow: number;
  nextAttemptAt: number | null;
}

export class CircuitBreaker {
  private failureTimes: number[] = [];
  private state: BreakerState = 'closed';
  private nextAttemptAt: number | null = null;

  /**
   * Caller invokes after an error and asks "should I restart now?". Returns
   * the delay in ms to wait before attempting; 0 = restart immediately.
   * If the breaker is open beyond MAX_BACKOFF_MS retries, returns Infinity
   * — caller should give up (or surface to user).
   */
  recordFailure(now = Date.now()): number {
    this.pruneOld(now);
    this.failureTimes.push(now);

    const count = this.failureTimes.length;
    if (this.state === 'closed' && count >= TRIP_THRESHOLD) {
      this.state = 'open';
    } else if (this.state === 'half-open') {
      // Single failure in probe trips back to open.
      this.state = 'open';
    }

    // Backoff: 0s on 1st failure, 5s on 2nd, 30s on 3rd, doubling thereafter.
    const backoff =
      count <= 1 ? 0 :
      count === 2 ? 5_000 :
      count === 3 ? 30_000 :
      Math.min(MAX_BACKOFF_MS, 30_000 * Math.pow(2, count - 3));

    this.nextAttemptAt = now + backoff;
    return backoff;
  }

  /**
   * Called when the loop completes a turn without error. Resets state.
   */
  recordSuccess(): void {
    this.failureTimes = [];
    this.state = 'closed';
    this.nextAttemptAt = null;
  }

  /**
   * Called after a backoff timer fires before re-attempting. Moves the
   * breaker into half-open so a single subsequent failure will trip it
   * back to open.
   */
  beginProbe(): void {
    if (this.state === 'open') this.state = 'half-open';
  }

  status(now = Date.now()): BreakerStatus {
    this.pruneOld(now);
    return {
      state: this.state,
      failuresInWindow: this.failureTimes.length,
      nextAttemptAt: this.nextAttemptAt
    };
  }

  private pruneOld(now: number): void {
    const cutoff = now - FAILURE_WINDOW_MS;
    this.failureTimes = this.failureTimes.filter(t => t > cutoff);
    if (this.failureTimes.length === 0 && this.state !== 'closed') {
      // Window cleared organically — return to baseline.
      this.state = 'closed';
      this.nextAttemptAt = null;
    }
  }
}
