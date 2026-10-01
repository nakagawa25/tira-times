import { describe, it, expect } from 'vitest';
import { rating, formatRating, isGoalkeeper } from './rating';
import type { Player } from './types';

const player = (skills: Partial<Player['skills']> = {}): Player => ({
  id: 'p1',
  name: 'Jogador',
  positions: ['QQ'],
  monthly: false,
  skills: { attack: 3, defense: 3, speed: 3, skill: 3, ...skills },
});

describe('rating', () => {
  it('averages the four skills', () => {
    expect(rating(player({ attack: 1, defense: 4, speed: 2, skill: 3 }))).toBe(2.5);
  });

  it('formats with a comma and one decimal', () => {
    expect(formatRating(3.4)).toBe('3,4');
  });

  it('detects goalkeepers by position', () => {
    expect(isGoalkeeper({ ...player(), positions: ['GOL'] })).toBe(true);
    expect(isGoalkeeper({ ...player(), positions: ['ATA'] })).toBe(false);
  });
});
