import { describe, it, expect } from 'vitest';
import { describeGoalPlan, positionWarnings } from './regrasPreview';
import { DEFAULT_RULES } from '../../domain/types';
import type { Player } from '../../domain/types';

describe('describeGoalPlan', () => {
  it('one fixed goalkeeper', () => {
    expect(describeGoalPlan({ mode: 'fixed', fixed: 1, rotating: 1 })).toBe('1 goleiro fixo + revezamento no outro gol');
  });
  it('no goalkeepers', () => {
    expect(describeGoalPlan({ mode: 'fixed', fixed: 0, rotating: 2 })).toBe('Sem goleiro · revezamento nos dois gols');
  });
  it('per-team with coverage', () => {
    expect(describeGoalPlan({ mode: 'perTeam', fixed: 2, rotating: 1 })).toBe('2 time(s) com goleiro próprio');
  });
});

describe('positionWarnings', () => {
  const mk = (id: string, positions: Player['positions']): Player => ({ id, name: id, positions, monthly: false, skills: { attack: 3, defense: 3, speed: 3, skill: 3 } });

  it('warns when a role has less supply than teams', () => {
    const players = [mk('1', ['ATA']), mk('2', ['MEI'])];
    const warnings = positionWarnings(players, { ...DEFAULT_RULES, teams: 3 });
    expect(warnings).toContain('Poucos DEF para todos os times — QQ e ALA completam.');
  });

  it('returns nothing when the positions rule is off', () => {
    const players = [mk('1', ['ATA'])];
    expect(positionWarnings(players, { ...DEFAULT_RULES, teams: 3, positions: false })).toEqual([]);
  });
});
