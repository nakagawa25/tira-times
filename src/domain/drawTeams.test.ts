import { describe, it, expect } from 'vitest';
import { drawTeams } from './drawTeams';
import { planSummary } from './planSummary';
import { teamProfile } from './teamProfile';
import { rating } from './rating';
import { sampleSquad } from './sampleSquad';
import type { Player, Rules } from './types';

const RULES: Rules = { linePerTeam: 5, teams: 3, goalkeepers: 'fixed', balance: true, traits: true, positions: true, monthlyPriority: true };
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
});
