/**
 * B13 — CircuitBreaker behaviour.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { CircuitBreaker } from '../../electron/main/agents/circuit-breaker';

describe('CircuitBreaker', () => {
  let cb: CircuitBreaker;

  beforeEach(() => {
    cb = new CircuitBreaker();
  });

  it('starts closed with no failures', () => {
    const s = cb.status();
    expect(s.state).toBe('closed');
    expect(s.failuresInWindow).toBe(0);
    expect(s.nextAttemptAt).toBeNull();
  });

  it('first failure returns 0 backoff and stays closed', () => {
    const backoff = cb.recordFailure(1000);
    expect(backoff).toBe(0);
    expect(cb.status(1001).state).toBe('closed');
    expect(cb.status(1001).failuresInWindow).toBe(1);
  });

  it('second failure returns 5s backoff', () => {
    cb.recordFailure(1000);
    const backoff = cb.recordFailure(1500);
    expect(backoff).toBe(5_000);
  });

  it('third failure trips to open with 30s backoff', () => {
    cb.recordFailure(1000);
    cb.recordFailure(1500);
    const backoff = cb.recordFailure(2000);
    expect(backoff).toBe(30_000);
    expect(cb.status(2001).state).toBe('open');
  });

  it('subsequent failures double the backoff up to ceiling', () => {
    cb.recordFailure(1000);
    cb.recordFailure(1500);
    cb.recordFailure(2000);
    const b4 = cb.recordFailure(2500);
    expect(b4).toBe(60_000); // 30k * 2
    const b5 = cb.recordFailure(3000);
    expect(b5).toBe(120_000); // 30k * 4, clamped at MAX_BACKOFF_MS
  });

  it('beginProbe moves open → half-open', () => {
    cb.recordFailure(1000);
    cb.recordFailure(1500);
    cb.recordFailure(2000);
    expect(cb.status(2001).state).toBe('open');
    cb.beginProbe();
    expect(cb.status(2001).state).toBe('half-open');
  });

  it('half-open + failure trips back to open', () => {
    cb.recordFailure(1000);
    cb.recordFailure(1500);
    cb.recordFailure(2000);
    cb.beginProbe();
    expect(cb.status(2001).state).toBe('half-open');
    cb.recordFailure(2500);
    expect(cb.status(2501).state).toBe('open');
  });

  it('recordSuccess resets state and counter', () => {
    cb.recordFailure(1000);
    cb.recordFailure(1500);
    cb.recordFailure(2000);
    expect(cb.status(2001).state).toBe('open');
    cb.recordSuccess();
    expect(cb.status().state).toBe('closed');
    expect(cb.status().failuresInWindow).toBe(0);
  });

  it('failures outside the 60s window prune away', () => {
    cb.recordFailure(1000);
    cb.recordFailure(1500);
    cb.recordFailure(2000);
    expect(cb.status(2001).failuresInWindow).toBe(3);
    // 70s later — window cutoff is now 70000-60000=10000 (>2000 so all pruned)
    const s = cb.status(70_000);
    expect(s.failuresInWindow).toBe(0);
    expect(s.state).toBe('closed');
  });
});
