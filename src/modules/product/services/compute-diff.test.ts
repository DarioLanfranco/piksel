import { describe, it, expect } from 'vitest';
import { computeDiff } from './compute-diff';

describe('computeDiff', () => {
  it('returns → when values are equal', () => {
    const r = computeDiff(100, 100, true);
    expect(r.direction).toBe('\u2192');
    expect(r.diffLabel).toBe('');
    expect(r.isGain).toBe(false);
  });

  it('returns ↑ with positive diff when higherIsBetter is true', () => {
    const r = computeDiff(150, 100, true);
    expect(r.direction).toBe('\u2191');
    expect(r.diffLabel).toContain('+50');
    expect(r.isGain).toBe(true);
  });

  it('returns ↓ with negative diff when higherIsBetter is true and premium is lower', () => {
    const r = computeDiff(80, 100, true);
    expect(r.direction).toBe('\u2193');
    expect(r.diffLabel).toContain('20');
    expect(r.isGain).toBe(false);
  });

  it('inverts gain when higherIsBetter is false', () => {
    const r = computeDiff(80, 100, false);
    expect(r.direction).toBe('\u2191');
    expect(r.isGain).toBe(true);
  });

  it('includes percentage when market is non-zero', () => {
    const r = computeDiff(120, 100, true);
    expect(r.diffLabel).toContain('+20%');
  });

  it('handles market being zero', () => {
    const r = computeDiff(50, 0, true);
    expect(r.diffLabel).toBe('+50');
  });
});
