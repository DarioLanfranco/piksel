export interface DiffResult {
  direction: '\u2191' | '\u2193' | '\u2192';
  diffLabel: string;
  isGain: boolean;
}

export function computeDiff(premium: number, market: number, higherIsBetter: boolean): DiffResult {
  const diff = premium - market;
  if (diff === 0) return { direction: '\u2192', diffLabel: '', isGain: false };
  const gain = higherIsBetter ? diff > 0 : diff < 0;
  const abs = Math.abs(diff);
  const pct = market !== 0 ? Math.round((diff / market) * 100) : 0;
  let label = (gain ? '+' : '') + abs;
  if (pct !== 0) label += ' (' + (gain ? '+' : '') + pct + '%)';
  return { direction: gain ? '\u2191' : '\u2193', diffLabel: label, isGain: gain };
}
