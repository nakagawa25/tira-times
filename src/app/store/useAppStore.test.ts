import { describe, it, expect, beforeEach } from 'vitest';
import { useAppStore } from './useAppStore';
import type { Player } from '../../domain/types';
import { DEFAULT_RULES } from '../../domain/types';

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

  it('turning on avoidRepeatPairs turns off balance/traits/positions', () => {
    useAppStore.getState().setRules({ avoidRepeatPairs: true });
    const rules = useAppStore.getState().rules;
    expect(rules.avoidRepeatPairs).toBe(true);
    expect(rules.balance).toBe(false);
    expect(rules.traits).toBe(false);
    expect(rules.positions).toBe(false);
  });

  it('turning on balance (or traits/positions) turns off avoidRepeatPairs', () => {
    useAppStore.getState().setRules({ avoidRepeatPairs: true });
    useAppStore.getState().setRules({ balance: true });
    const rules = useAppStore.getState().rules;
    expect(rules.balance).toBe(true);
    expect(rules.avoidRepeatPairs).toBe(false);
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

  it('falls back to default rules when localStorage holds corrupted JSON', async () => {
    localStorage.setItem('tira-times', 'not valid json {{{');
    await useAppStore.persist.rehydrate();
    expect(useAppStore.getState().rules).toEqual(DEFAULT_RULES);
  });

  it('runDraw acumula pairHistory por dupla quando avoidRepeatPairs está ligado', () => {
    useAppStore.getState().addPlayer(player('1'));
    useAppStore.getState().addPlayer(player('2'));
    useAppStore.getState().setRules({ teams: 1, linePerTeam: 2, avoidRepeatPairs: true });
    useAppStore.getState().runDraw(1);
    useAppStore.getState().runDraw(2);
    expect(useAppStore.getState().pairHistory['1|2']).toBe(2);
    expect(useAppStore.getState().historyDraws).toBe(2);
  });

  it('runDraw zera pairHistory quando a presença muda', () => {
    useAppStore.getState().addPlayer(player('1'));
    useAppStore.getState().addPlayer(player('2'));
    useAppStore.getState().addPlayer(player('3'));
    useAppStore.getState().setRules({ teams: 1, linePerTeam: 3, avoidRepeatPairs: true });
    useAppStore.getState().runDraw(1);
    useAppStore.getState().togglePresent('3');
    useAppStore.getState().runDraw(2);
    expect(useAppStore.getState().pairHistory['1|2']).toBe(1);
    expect(useAppStore.getState().historyDraws).toBe(1);
  });

  it('runDraw não conta sorteios pro limite quando avoidRepeatPairs está desligado', () => {
    useAppStore.getState().addPlayer(player('1'));
    useAppStore.getState().addPlayer(player('2'));
    useAppStore.getState().setRules({ teams: 1, linePerTeam: 2, avoidRepeatPairs: false });
    useAppStore.getState().runDraw(1);
    useAppStore.getState().runDraw(2);
    expect(useAppStore.getState().historyDraws).toBe(0);
    useAppStore.getState().setRules({ avoidRepeatPairs: true });
    useAppStore.getState().runDraw(3);
    expect(useAppStore.getState().pairHistory['1|2']).toBe(1);
    expect(useAppStore.getState().historyDraws).toBe(1);
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
