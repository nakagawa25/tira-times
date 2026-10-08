import { describe, it, expect } from 'vitest';
import { drawTeams } from './drawTeams';
import { planSummary } from './planSummary';
import { teamProfile } from './teamProfile';
import { rating } from './rating';
import { sampleSquad } from './sampleSquad';
import type { Player, Rules, DrawResult } from './types';

const RULES: Rules = { linePerTeam: 5, teams: 3, goalkeepers: 'fixed', balance: true, traits: true, positions: true, monthlyPriority: true, avoidRepeatPairs: false };
const avg = (ps: Player[]) => ps.reduce((a, p) => a + rating(p), 0) / ps.length;

describe('drawTeams', () => {
  it('exemplo do briefing: 15 presentes, 1 goleiro, 5 por time, 3 times', () => {
    const players = sampleSquad.slice(0, 15);
    const s = planSummary(players, RULES);
    expect(s.goal.fixed).toBe(1);
    expect(s.goal.rotating).toBe(1);
    expect(s.full).toBe(2);
    expect(s.partial).toEqual([{ size: 4, missing: 1 }]);
    const r = drawTeams(players, RULES, 42);
    expect(r.teams.map((t) => t.players.length)).toEqual([5, 5, 4]);
    expect(r.goalkeepers.length).toBe(1);
    expect(r.teams[2].missing).toBe(1);
  });

  it('médias dos times ficam próximas (diferença <= 0,35)', () => {
    for (let seed = 1; seed <= 20; seed++) {
      const r = drawTeams(sampleSquad.slice(0, 15), RULES, seed);
      const avgs = r.teams.map((t) => avg(t.players));
      expect(Math.max(...avgs) - Math.min(...avgs)).toBeLessThanOrEqual(0.35);
    }
  });

  it('todo time tem DEF, MEI e ATA quando há oferta suficiente', () => {
    for (let seed = 1; seed <= 20; seed++) {
      const r = drawTeams(sampleSquad.slice(0, 15), RULES, seed);
      for (const t of r.teams) {
        const roles = teamProfile(t.players).roles;
        expect(roles.DEF).toBeGreaterThan(0);
        expect(roles.MEI).toBeGreaterThan(0);
        expect(roles.ATA).toBeGreaterThan(0);
      }
    }
  });

  it('características espalhadas: 5 corredores + 5 especialistas não ficam separados', () => {
    const mk = (i: number, s: Player['skills']): Player => ({ id: 'x' + i, name: 'J' + i, positions: ['QQ'], monthly: false, skills: s });
    const ps: Player[] = [];
    for (let i = 0; i < 5; i++) ps.push(mk(i, { attack: 1, defense: 1, speed: 5, skill: 1 }));
    (['attack', 'defense', 'skill', 'attack', 'defense'] as const).forEach((k, i) => {
      const s = { attack: 1, defense: 1, speed: 1, skill: 1 };
      s[k] = 5;
      ps.push(mk(10 + i, s));
    });
    for (let seed = 1; seed <= 10; seed++) {
      const r = drawTeams(ps, { ...RULES, teams: 2 }, seed);
      for (const t of r.teams) {
        const runners = t.players.filter((p) => p.skills.speed === 5).length;
        expect(runners).toBeGreaterThanOrEqual(2);
        expect(runners).toBeLessThanOrEqual(3);
      }
    }
  });

  it('excedentes vão para a próxima e avulsos saem antes dos mensalistas', () => {
    const r = drawTeams(sampleSquad, { ...RULES, linePerTeam: 5, teams: 3 }, 7);
    expect(r.bench.length).toBe(5);
    expect(r.bench.every((p) => !p.monthly)).toBe(true);
  });

  it('mesma seed gera o mesmo sorteio', () => {
    const a = drawTeams(sampleSquad.slice(0, 15), RULES, 99);
    const b = drawTeams(sampleSquad.slice(0, 15), RULES, 99);
    expect(a.teams.map((t) => t.players.map((p) => p.id))).toEqual(b.teams.map((t) => t.players.map((p) => p.id)));
  });

  // "Sortear de novo" was getting stuck: the local search only ever accepts a
  // strictly better swap, so from many random starts it kept converging on the
  // same single best grouping. Passing the previous draw lets it pick a different
  // equally-good grouping instead — without ever accepting a worse-balanced one.
  it('"Sortear de novo" não fica viciado no mesmo agrupamento quando há alternativas de empate', () => {
    const players = sampleSquad.slice(0, 15);
    const groupKey = (r: DrawResult) =>
      r.teams
        .map((t) => t.players.map((p) => p.id).slice().sort().join(','))
        .sort()
        .join('|');

    let withAvoid: DrawResult | null = null;
    let withoutAvoid: DrawResult | null = null;
    let repeatsWithAvoid = 0;
    let repeatsWithoutAvoid = 0;
    for (let seed = 1; seed <= 30; seed++) {
      const a = drawTeams(players, RULES, seed, withAvoid);
      const b = drawTeams(players, RULES, seed);
      if (withAvoid && groupKey(a) === groupKey(withAvoid)) repeatsWithAvoid++;
      if (withoutAvoid && groupKey(b) === groupKey(withoutAvoid)) repeatsWithoutAvoid++;
      withAvoid = a;
      withoutAvoid = b;
    }
    expect(repeatsWithAvoid).toBeLessThan(repeatsWithoutAvoid);
  });

  it('com "avoidRepeatPairs" ligado, evita juntar dupla de histórico alto mesmo com jogadores equivalentes', () => {
    const mk = (id: string): Player => ({ id, name: id, positions: ['QQ'], monthly: false, skills: { attack: 3, defense: 3, speed: 3, skill: 3 } });
    const players = ['a', 'b', 'c', 'd', 'e', 'f'].map(mk);
    const rules: Rules = { ...RULES, linePerTeam: 3, teams: 2 };
    const together = (r: DrawResult) => r.teams.some((t) => t.players.some((p) => p.id === 'a') && t.players.some((p) => p.id === 'b'));

    let baselineTogether = 0;
    for (let seed = 1; seed <= 20; seed++) {
      if (together(drawTeams(players, rules, seed))) baselineTogether++;
    }
    expect(baselineTogether).toBeGreaterThan(0);

    let avoidTogether = 0;
    for (let seed = 1; seed <= 20; seed++) {
      if (together(drawTeams(players, { ...rules, avoidRepeatPairs: true }, seed, null, { 'a|b': 10 }))) avoidTogether++;
    }
    expect(avoidTogether).toBe(0);
  });
});
