import type { Player, Rules, Team, DrawResult, Role } from './types';
import { SKILL_KEYS, ROLES, TEAM_COLORS } from './types';
import { rating, isGoalkeeper } from './rating';
import { goalPlan } from './planSummary';

const W = { role: 30, roleStack: 1.5, avg: 60, trait: 10, spec: 2.5, pairRepeat: 40 };

export function pairKey(a: string, b: string): string {
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}

function mulberry32(seed: number) {
  let s = Math.abs(Math.floor(seed)) % 233280 || 1;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function primaryRole(p: Player): Role | 'ZZZ' {
  const positions = p.positions.length ? p.positions : ['QQ'];
  for (const r of ROLES) if (positions.includes(r)) return r;
  return positions.includes('ALA') ? 'MEI' : 'ZZZ';
}

interface PlayerData {
  r: number;
  sk: number[];
  spec: number[];
  roles: number[];
}

function partitionKey(ids: string[], assign: number[]): string {
  const groups = new Map<number, string[]>();
  for (let i = 0; i < ids.length; i++) {
    const t = assign[i];
    const g = groups.get(t) ?? [];
    g.push(ids[i]);
    groups.set(t, g);
  }
  return Array.from(groups.values())
    .map((g) => g.slice().sort().join(','))
    .sort()
    .join('|');
}

export function drawTeams(
  players: Player[],
  rules: Rules,
  seed?: number,
  previous?: DrawResult | null,
  pairCounts?: Record<string, number>,
): DrawResult {
  const rnd = seed == null ? Math.random : mulberry32(seed);
  const balance = rules.balance !== false;
  const traits = balance && rules.traits !== false;
  const keepRoles = rules.positions !== false;
  const T = rules.teams;

  const gks = players
    .filter(isGoalkeeper)
    .map((x) => ({ p: x, r: rating(x) + rnd() * 0.3 }))
    .sort((a, b) => b.r - a.r);
  const gp = goalPlan(gks.length, rules);

  let fixedGks: Player[] = [];
  let teamGks: Player[] = [];
  const line: Player[] = [];
  if (gp.mode === 'fixed') {
    fixedGks = gks.slice(0, 2).map((x) => x.p);
    gks.slice(2).forEach((x) => line.push(x.p));
  } else {
    teamGks = gks.slice(0, T).map((x) => x.p);
    gks.slice(T).forEach((x) => line.push(x.p));
  }
  players.forEach((x) => {
    if (!isGoalkeeper(x)) line.push(x);
  });

  const slots = rules.linePerTeam * T;
  let pool = line.slice();
  let bench: Player[] = [];
  if (pool.length > slots) {
    pool = pool
      .map((x, i) => ({ x, k: rules.monthlyPriority && x.monthly ? 0 : 1, i }))
      .sort((a, b) => a.k - b.k || a.i - b.i)
      .map((o) => o.x);
    bench = pool.slice(slots);
    pool = pool.slice(0, slots);
  }

  const N = pool.length;
  const D: PlayerData[] = pool.map((x) => {
    const sk = SKILL_KEYS.map((k) => x.skills[k] ?? 3);
    return {
      r: rating(x),
      sk,
      spec: sk.map((v) => (v >= 4 ? 1 : 0)),
      roles: ROLES.map((r) => (x.positions.includes(r) ? 1 : 0)),
    };
  });

  const sizes: number[] = [];
  for (let t = 0; t < T; t++) sizes.push(Math.min(rules.linePerTeam, Math.floor(N / T) + (t < N % T ? 1 : 0)));

  let allR = 0;
  const allSk = [0, 0, 0, 0];
  const allSpec = [0, 0, 0, 0];
  const supply = [0, 0, 0];
  D.forEach((d) => {
    allR += d.r;
    for (let k = 0; k < 4; k++) {
      allSk[k] += d.sk[k];
      allSpec[k] += d.spec[k];
    }
    for (let q = 0; q < 3; q++) supply[q] += d.roles[q];
  });
  const meanR = N ? allR / N : 0;
  const meanSk = allSk.map((v) => (N ? v / N : 0));

  function cost(assign: number[]): number {
    const n: number[] = new Array(T).fill(0);
    const sr: number[] = new Array(T).fill(0);
    const ssk: number[][] = Array.from({ length: T }, () => [0, 0, 0, 0]);
    const ssp: number[][] = Array.from({ length: T }, () => [0, 0, 0, 0]);
    const sro: number[][] = Array.from({ length: T }, () => [0, 0, 0]);
    for (let i = 0; i < N; i++) {
      const t = assign[i];
      const d = D[i];
      n[t]++;
      sr[t] += d.r;
      for (let k = 0; k < 4; k++) {
        ssk[t][k] += d.sk[k];
        ssp[t][k] += d.spec[k];
      }
      for (let q = 0; q < 3; q++) sro[t][q] += d.roles[q];
    }
    let c = 0;
    if (keepRoles) {
      for (let q = 0; q < 3; q++) {
        let covered = 0;
        for (let t = 0; t < T; t++) {
          if (sro[t][q] > 0) covered++;
          const ideal = supply[q] / T;
          c += W.roleStack * (sro[t][q] - ideal) * (sro[t][q] - ideal);
        }
        c += W.role * Math.max(0, Math.min(T, supply[q]) - covered);
      }
    }
    if (balance) {
      for (let t = 0; t < T; t++) {
        if (!n[t]) continue;
        const dr = sr[t] / n[t] - meanR;
        c += W.avg * dr * dr;
        if (traits) {
          for (let k = 0; k < 4; k++) {
            const ds = ssk[t][k] / n[t] - meanSk[k];
            c += W.trait * ds * ds;
            const es = ssp[t][k] - (allSpec[k] * n[t]) / N;
            c += W.spec * es * es;
          }
        }
      }
    }
    if (rules.avoidRepeatPairs && pairCounts) {
      const idsByTeam: string[][] = Array.from({ length: T }, () => []);
      for (let i = 0; i < N; i++) idsByTeam[assign[i]].push(pool[i].id);
      for (let t = 0; t < T; t++) {
        const ids = idsByTeam[t];
        for (let a = 0; a < ids.length; a++) {
          for (let b = a + 1; b < ids.length; b++) {
            const cnt = pairCounts[pairKey(ids[a], ids[b])] ?? 0;
            c += W.pairRepeat * cnt * cnt;
          }
        }
      }
    }
    return c;
  }

  function start(jitter: number): number[] {
    const order = D.map((d, i) => ({ i, r: balance ? d.r + rnd() * jitter : rnd() })).sort((a, b) => b.r - a.r);
    const assign: number[] = new Array(N);
    const fill = sizes.map(() => 0);
    let idx = 0;
    let dir = 1;
    order.forEach((o) => {
      let guard = 0;
      while (fill[idx] >= sizes[idx] && guard++ < T * 2) {
        idx += dir;
        if (idx >= T) {
          idx = T - 1;
          dir = -1;
        }
        if (idx < 0) {
          idx = 0;
          dir = 1;
        }
      }
      assign[o.i] = idx;
      fill[idx]++;
      idx += dir;
      if (idx >= T) {
        idx = T - 1;
        dir = -1;
      }
      if (idx < 0) {
        idx = 0;
        dir = 1;
      }
    });
    return assign;
  }

  function improve(assign: number[]): { assign: number[]; cost: number } {
    let best = cost(assign);
    let moved = true;
    let passes = 0;
    while (moved && passes++ < 40) {
      moved = false;
      for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
          if (assign[i] === assign[j]) continue;
          let a = assign[i];
          assign[i] = assign[j];
          assign[j] = a;
          const c = cost(assign);
          if (c < best - 1e-9) {
            best = c;
            moved = true;
          } else {
            a = assign[i];
            assign[i] = assign[j];
            assign[j] = a;
          }
        }
      }
    }
    return { assign, cost: best };
  }

  const runs: { assign: number[]; cost: number }[] = [];
  const R = N <= T ? 1 : balance ? 16 : 4;
  for (let r = 0; r < R; r++) runs.push(improve(start(r === 0 ? 0.3 : 1.6)));
  runs.sort((a, b) => a.cost - b.cost);
  const bestC = runs.length ? runs[0].cost : 0;
  const good = runs.filter((x) => x.cost <= bestC + Math.max(0.4, bestC * 0.15));
  const poolIds = pool.map((x) => x.id);
  const previousKey =
    previous && previous.teams.length ? previous.teams.map((t) => t.players.map((p) => p.id).slice().sort().join(',')).sort().join('|') : null;
  // Prefer a grouping that differs from the previous draw when one equally-good exists;
  // never force a worse-cost split just to vary it. See drawTeams.test.ts for the test
  // showing this avoids "Sortear de novo" repeating the same teams.
  const varied = previousKey ? good.filter((x) => partitionKey(poolIds, x.assign) !== previousKey) : good;
  const candidates = varied.length ? varied : good;
  const pick = candidates.length ? candidates[Math.floor(rnd() * candidates.length)] : { assign: [] as number[], cost: 0 };

  const teams: Team[] = [];
  for (let i = 0; i < T; i++) {
    teams.push({ name: '', color: TEAM_COLORS[0], players: [], goalkeeper: teamGks[i] ? teamGks[i].name : null, missing: 0 });
  }
  pool.forEach((x, i) => teams[pick.assign[i]].players.push(x));
  teams.forEach((tm) => tm.players.sort((a, b) => ROLES.indexOf(primaryRole(a) as Role) - ROLES.indexOf(primaryRole(b) as Role)));
  teams.sort((a, b) => b.players.length - a.players.length);
  teams.forEach((tm, i) => {
    const color = TEAM_COLORS[i % 6];
    tm.name = `Time ${color.charAt(0).toUpperCase()}${color.slice(1)}`;
    tm.color = color;
    tm.missing = rules.linePerTeam - tm.players.length;
  });

  return { teams, goalkeepers: fixedGks, rotating: gp.rotating, mode: gp.mode, bench, cost: pick.cost };
}
