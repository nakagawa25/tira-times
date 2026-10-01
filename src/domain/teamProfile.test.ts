import { describe, it, expect } from 'vitest';
import { teamProfile } from './teamProfile';
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
