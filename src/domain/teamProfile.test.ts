import { describe, it, expect } from 'vitest';
import { teamProfile, suggestFillIns } from './teamProfile';
import type { Player } from './types';

const mk = (positions: Player['positions'], attack: number): Player => ({
  id: positions.join('') + attack,
  name: 'J',
  positions,
  monthly: false,
  skills: { attack, defense: 3, speed: 3, skill: 3 },
});

describe('teamProfile', () => {
  it('averages skills and counts roles', () => {
    const profile = teamProfile([mk(['DEF'], 1), mk(['ATA'], 5)]);
    expect(profile.skills.attack).toBe(3);
    expect(profile.roles.DEF).toBe(1);
    expect(profile.roles.ATA).toBe(1);
    expect(profile.roles.MEI).toBe(0);
  });

  it('returns zeroed profile for an empty team without dividing by zero', () => {
    const profile = teamProfile([]);
    expect(profile.skills.attack).toBe(0);
    expect(Number.isFinite(profile.skills.attack)).toBe(true);
  });
});

describe('suggestFillIns', () => {
  it('orders bench players by how close their rating is to the team average', () => {
    const team = [mk(['DEF'], 3), mk(['ATA'], 3)]; // avg rating 3
    const close = { ...mk(['MEI'], 3), id: 'close', name: 'Perto' };
    const far = { ...mk(['MEI'], 5), id: 'far', name: 'Longe' };
    expect(suggestFillIns(team, [far, close]).map((p) => p.id)).toEqual(['close', 'far']);
  });

  it('caps suggestions at the given limit', () => {
    const team = [mk(['DEF'], 3)];
    const bench = [1, 2, 3, 4].map((n) => ({ ...mk(['MEI'], 3), id: `b${n}`, name: `B${n}` }));
    expect(suggestFillIns(team, bench, 3)).toHaveLength(3);
  });

  it('returns an empty list when there is no one waiting', () => {
    expect(suggestFillIns([mk(['DEF'], 3)], [])).toEqual([]);
  });
});
