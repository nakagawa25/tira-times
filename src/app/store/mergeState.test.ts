import { describe, it, expect } from 'vitest';
import { mergeState } from './mergeState';
import { DEFAULT_RULES } from '../../domain/types';
import type { AppState } from './useAppStore';

const base = {
  groupName: 'Minha pelada',
  players: [],
  present: [],
  rules: DEFAULT_RULES,
  draw: null,
  showRatings: true,
  web: { consent: null, pro: false, installDismissed: false },
} as unknown as AppState;

describe('mergeState', () => {
  it('returns the fresh state untouched when nothing was persisted', () => {
    expect(mergeState(base, undefined)).toEqual(base);
  });

  it('fills missing rule fields with defaults (old/partial persisted data)', () => {
    const persisted = { rules: { teams: 4 } } as Partial<AppState>;
    const merged = mergeState(base, persisted);
    expect(merged.rules).toEqual({ ...DEFAULT_RULES, teams: 4 });
  });

  it('keeps persisted players and groupName', () => {
    const persisted = { groupName: 'Pelada de Quinta', players: [{ id: '1' }] } as unknown as Partial<AppState>;
    const merged = mergeState(base, persisted);
    expect(merged.groupName).toBe('Pelada de Quinta');
    expect(merged.players).toEqual([{ id: '1' }]);
  });
});
