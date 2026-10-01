// Rodar: node --test reference/sorteio/sorteio.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { drawTeams, planSummary, teamProfile, rating, sampleSquad } from './sorteio.mjs';

const RULES = { linePerTeam: 5, teams: 3, goalkeepers: 'fixed', balance: true, traits: true, positions: true, monthlyPriority: true };
const avg = (ps) => ps.reduce((a, p) => a + rating(p), 0) / ps.length;

test('exemplo do briefing: 15 presentes, 1 goleiro, 5 por time, 3 times', () => {
  const players = sampleSquad.slice(0, 15);
  const s = planSummary(players, RULES);
  assert.equal(s.goal.fixed, 1);
  assert.equal(s.goal.rotating, 1);
  assert.equal(s.full, 2);
  assert.deepEqual(s.partial, [{ size: 4, missing: 1 }]);
  const r = drawTeams(players, RULES, 42);
  assert.deepEqual(r.teams.map((t) => t.players.length), [5, 5, 4]);
  assert.equal(r.goalkeepers.length, 1);
  assert.equal(r.teams[2].missing, 1);
});

test('médias dos times ficam próximas (diferença <= 0,35)', () => {
  for (let seed = 1; seed <= 20; seed++) {
    const r = drawTeams(sampleSquad.slice(0, 15), RULES, seed);
    const avgs = r.teams.map((t) => avg(t.players));
    assert.ok(Math.max(...avgs) - Math.min(...avgs) <= 0.35, `seed ${seed}: ${avgs}`);
  }
});

test('todo time tem DEF, MEI e ATA quando há oferta suficiente', () => {
  for (let seed = 1; seed <= 20; seed++) {
    const r = drawTeams(sampleSquad.slice(0, 15), RULES, seed);
    for (const t of r.teams) {
      const roles = teamProfile(t.players).roles;
      assert.ok(roles.DEF > 0 && roles.MEI > 0 && roles.ATA > 0, `seed ${seed}: ${t.name} ${JSON.stringify(roles)}`);
    }
  }
});

test('características espalhadas: 5 corredores + 5 especialistas não ficam separados', () => {
  const mk = (i, s) => ({ id: 'x' + i, name: 'J' + i, positions: ['QQ'], monthly: false, skills: s });
  const ps = [];
  for (let i = 0; i < 5; i++) ps.push(mk(i, { attack: 1, defense: 1, speed: 5, skill: 1 }));
  ['attack', 'defense', 'skill', 'attack', 'defense'].forEach((k, i) => {
    const s = { attack: 1, defense: 1, speed: 1, skill: 1 }; s[k] = 5; ps.push(mk(10 + i, s));
  });
  for (let seed = 1; seed <= 10; seed++) {
    const r = drawTeams(ps, { ...RULES, teams: 2 }, seed);
    for (const t of r.teams) {
      const runners = t.players.filter((p) => p.skills.speed === 5).length;
      assert.ok(runners >= 2 && runners <= 3, `seed ${seed}: ${t.name} com ${runners} corredores`);
    }
  }
});

test('excedentes vão para a próxima e avulsos saem antes dos mensalistas', () => {
  const r = drawTeams(sampleSquad, { ...RULES, linePerTeam: 5, teams: 3 }, 7); // 22 jogadores, 2 goleiros
  assert.equal(r.bench.length, 5);
  assert.ok(r.bench.every((p) => !p.monthly));
});

test('goleiro um por time: times sem goleiro revezam', () => {
  const s = planSummary(sampleSquad.slice(0, 15), { ...RULES, goalkeepers: 'perTeam' });
  assert.equal(s.goal.fixed, 1);
  assert.equal(s.goal.rotating, 2);
});

test('mesma seed gera o mesmo sorteio', () => {
  const a = drawTeams(sampleSquad.slice(0, 15), RULES, 99);
  const b = drawTeams(sampleSquad.slice(0, 15), RULES, 99);
  assert.deepEqual(a.teams.map((t) => t.players.map((p) => p.id)), b.teams.map((t) => t.players.map((p) => p.id)));
});
