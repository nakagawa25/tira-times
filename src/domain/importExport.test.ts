import { describe, it, expect } from 'vitest';
import { parseImport, mergePlayers, buildExport, exportFilename } from './importExport';
import type { Player } from './types';
import { DEFAULT_RULES } from './types';

describe('parseImport', () => {
  it('rejects invalid JSON with the exact user-facing message', () => {
    const r = parseImport('{ not json');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe('Esse texto não é um JSON válido. Copie o arquivo inteiro, do primeiro { ao último }.');
  });

  it('rejects a JSON without a players array', () => {
    const r = parseImport(JSON.stringify({ app: 'tira-times' }));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe('Não achei a lista "players" nesse JSON. Ele precisa ter sido exportado pelo Tira times.');
  });

  it('rejects a players array with no named player', () => {
    const r = parseImport(JSON.stringify({ players: [{ name: '   ' }, { id: 'x' }] }));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe('O arquivo não tem nenhum jogador com nome.');
  });

  it('accepts app "pelada" (legacy) or missing app', () => {
    const r = parseImport(JSON.stringify({ players: [{ name: 'Dudu' }] }));
    expect(r.ok).toBe(true);
  });

  it('generates an id when missing, trims names, and defaults skills to 3', () => {
    const r = parseImport(JSON.stringify({ players: [{ name: '  Dudu  ' }] }));
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.players[0].id).toBeTruthy();
      expect(r.players[0].name).toBe('Dudu');
      expect(r.players[0].skills).toEqual({ attack: 3, defense: 3, speed: 3, skill: 3 });
      expect(r.players[0].positions).toEqual(['QQ']);
    }
  });

  it('clamps skill values to integers 0-5 and falls back to 3 when invalid', () => {
    const r = parseImport(JSON.stringify({ players: [{ name: 'X', skills: { attack: 9, defense: -1, speed: 2.9, skill: 'bad' } }] }));
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.players[0].skills).toEqual({ attack: 5, defense: 0, speed: 2, skill: 3 });
  });

  it('drops invalid position values and empty positions become QQ', () => {
    const r = parseImport(JSON.stringify({ players: [{ name: 'X', positions: ['NOPE'] }] }));
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.players[0].positions).toEqual(['QQ']);
  });

  it('removes QQ when combined with a real position', () => {
    const r = parseImport(JSON.stringify({ players: [{ name: 'X', positions: ['QQ', 'DEF'] }] }));
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.players[0].positions).toEqual(['DEF']);
  });

  it('merges rules with defaults and keeps group name', () => {
    const r = parseImport(JSON.stringify({ players: [{ name: 'X' }], rules: { teams: 4 }, group: { name: 'Pelada' } }));
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.rules).toEqual({ teams: 4 });
      expect(r.groupName).toBe('Pelada');
    }
  });
});

describe('mergePlayers', () => {
  const a: Player = { id: '1', name: 'A', positions: ['QQ'], monthly: false, skills: { attack: 3, defense: 3, speed: 3, skill: 3 } };
  const b: Player = { id: '2', name: 'B', positions: ['QQ'], monthly: false, skills: { attack: 3, defense: 3, speed: 3, skill: 3 } };

  it('updates players with a matching id and appends new ones', () => {
    const updatedA = { ...a, name: 'A2' };
    const result = mergePlayers([a, b], [updatedA, { ...b, id: '3', name: 'C' }]);
    expect(result).toHaveLength(3);
    expect(result.find((p) => p.id === '1')?.name).toBe('A2');
    expect(result.find((p) => p.id === '3')?.name).toBe('C');
  });
});

describe('buildExport / exportFilename', () => {
  const players: Player[] = [{ id: '1', name: 'A', positions: ['QQ'], monthly: false, skills: { attack: 3, defense: 3, speed: 3, skill: 3 } }];

  it('builds the export payload with app/version/exportedAt/group/rules/players', () => {
    const payload = buildExport('Pelada de Quinta', players, DEFAULT_RULES, new Date('2026-10-01T20:00:00-03:00'));
    expect(payload.app).toBe('tira-times');
    expect(payload.version).toBe(1);
    expect(payload.group).toEqual({ name: 'Pelada de Quinta' });
    expect(payload.rules).toEqual(DEFAULT_RULES);
    expect(payload.players).toEqual(players);
  });

  it('slugifies the group name and dates the filename', () => {
    expect(exportFilename('Pelada de Quinta!', new Date('2026-10-01T12:00:00Z'))).toBe('tira-times-pelada-de-quinta-2026-10-01.json');
  });
});
