import { describe, it, expect, beforeEach } from 'vitest';
import { useAppStore } from './useAppStore';
import type { Player } from '../../domain/types';

const player = (id: string, monthly = false): Player => ({ id, name: `J${id}`, positions: ['QQ'], monthly, skills: { attack: 3, defense: 3, speed: 3, skill: 3 } });

beforeEach(() => {
  localStorage.clear();
  useAppStore.setState(useAppStore.getInitialState());
});

describe('useAppStore', () => {
  it('addPlayer adds the player and marks them present', () => {
    useAppStore.getState().addPlayer(player('1'));
    expect(useAppStore.getState().players).toHaveLength(1);
    expect(useAppStore.getState().present).toEqual(['1']);
  });

  it('togglePresent flips presence for one id', () => {
    useAppStore.getState().addPlayer(player('1'));
    useAppStore.getState().togglePresent('1');
    expect(useAppStore.getState().present).toEqual([]);
    useAppStore.getState().togglePresent('1');
    expect(useAppStore.getState().present).toEqual(['1']);
  });

  it('setRules merges a partial update over the current rules', () => {
    useAppStore.getState().setRules({ teams: 4 });
    expect(useAppStore.getState().rules.teams).toBe(4);
    expect(useAppStore.getState().rules.linePerTeam).toBe(5);
  });

  it('runDraw only draws players marked present', () => {
    useAppStore.getState().addPlayer(player('1'));
    useAppStore.getState().addPlayer(player('2'));
    useAppStore.getState().togglePresent('2');
    useAppStore.getState().setRules({ teams: 2, linePerTeam: 1 });
    useAppStore.getState().runDraw(1);
    const draw = useAppStore.getState().draw;
    expect(draw).not.toBeNull();
    const allIds = draw!.teams.flatMap((t) => t.players.map((p) => p.id)).concat(draw!.bench.map((p) => p.id));
    expect(allIds).toEqual(['1']);
  });

  it('importData with mode "merge" updates existing players by id and appends new ones', () => {
    useAppStore.getState().addPlayer(player('1'));
    useAppStore.getState().importData({ ok: true, players: [{ ...player('1'), name: 'Atualizado' }, player('2')], rules: {} }, 'merge');
    const players = useAppStore.getState().players;
    expect(players.find((p) => p.id === '1')?.name).toBe('Atualizado');
    expect(players.find((p) => p.id === '2')).toBeTruthy();
  });

  it('importData with mode "replace" clears presence and the last draw', () => {
    useAppStore.getState().addPlayer(player('1'));
    useAppStore.getState().setRules({ teams: 1, linePerTeam: 1 });
    useAppStore.getState().runDraw(1);
    useAppStore.getState().importData({ ok: true, players: [player('9')], rules: {} }, 'replace');
    expect(useAppStore.getState().players).toEqual([player('9')]);
    expect(useAppStore.getState().present).toEqual([]);
    expect(useAppStore.getState().draw).toBeNull();
  });
});
