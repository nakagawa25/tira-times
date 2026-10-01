import { describe, it, expect } from 'vitest';
import { describeGoalkeepers, buildShareText } from './shareText';
import type { DrawResult, Player } from '../../domain/types';

const p = (id: string, name: string): Player => ({ id, name, positions: ['QQ'], monthly: false, skills: { attack: 3, defense: 3, speed: 3, skill: 3 } });

describe('describeGoalkeepers', () => {
  it('one fixed goalkeeper: names them and notes the rotation', () => {
    const draw = { teams: [], goalkeepers: [p('g1', 'Marcão')], rotating: 1, mode: 'fixed', bench: [], cost: 0 } as DrawResult;
    expect(describeGoalkeepers(draw)).toBe('Marcão + revezamento');
  });

  it('zero fixed goalkeepers: both goals rotate', () => {
    const draw = { teams: [], goalkeepers: [], rotating: 2, mode: 'fixed', bench: [], cost: 0 } as DrawResult;
    expect(describeGoalkeepers(draw)).toBe('Revezamento nos dois gols');
  });

  it('per-team mode', () => {
    const draw = { teams: [], goalkeepers: [], rotating: 0, mode: 'perTeam', bench: [], cost: 0 } as DrawResult;
    expect(describeGoalkeepers(draw)).toBe('Cada time com seu goleiro');
  });
});

describe('buildShareText', () => {
  it('matches the docs/PRODUTO.md example shape', () => {
    const draw: DrawResult = {
      teams: [
        { name: 'Time Verde', color: 'verde', players: [p('1', 'Dudu')], goalkeeper: null, missing: 0 },
        { name: 'Time Laranja', color: 'laranja', players: [p('2', 'Caio')], goalkeeper: null, missing: 1 },
      ],
      goalkeepers: [p('g1', 'Marcão')],
      rotating: 1,
      mode: 'fixed',
      bench: [p('3', 'Serginho'), p('4', 'Paulo')],
      cost: 0,
    };
    const text = buildShareText('Pelada de Quinta', draw, new Date(2026, 9, 1, 19, 42));
    expect(text).toContain('Tira times · Pelada de Quinta');
    expect(text).toContain('Quinta, 1 de outubro · 19:42');
    expect(text).toContain('Gol: Marcão + revezamento');
    expect(text).toContain('TIME VERDE (3,0)');
    expect(text).toContain('  Dudu');
    expect(text).toContain('TIME LARANJA (3,0)');
    expect(text).toContain('  + 1 de fora');
    expect(text).toContain('Próxima: Serginho, Paulo');
  });
});
