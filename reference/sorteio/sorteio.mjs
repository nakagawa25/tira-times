/**
 * Tira times — lógica de sorteio (referência, sem dependências).
 * Extraída do protótipo funcionando. Porte para TypeScript em src/domain/ mantendo o comportamento
 * coberto por sorteio.test.mjs.
 */
const POSITIONS = [
  { id: 'GOL', label: 'Goleiro', short: 'GOL' },
  { id: 'DEF', label: 'Defesa', short: 'DEF' },
  { id: 'ALA', label: 'Ala', short: 'ALA' },
  { id: 'MEI', label: 'Meio', short: 'MEI' },
  { id: 'ATA', label: 'Ataque', short: 'ATA' },
  { id: 'QQ', label: 'Qualquer', short: 'QQ' }
];
const SKILLS = [
  { id: 'attack', label: 'Ataque', icon: 'sports_soccer' },
  { id: 'defense', label: 'Defesa', icon: 'shield' },
  { id: 'speed', label: 'Velocidade', icon: 'bolt' },
  { id: 'skill', label: 'Habilidade', icon: 'auto_awesome' }
];
const TEAM_COLORS = [
  { id: 'verde', label: 'Verde' },
  { id: 'azul', label: 'Azul' },
  { id: 'laranja', label: 'Laranja' },
  { id: 'grafite', label: 'Grafite' },
  { id: 'vermelho', label: 'Vermelho' },
  { id: 'amarelo', label: 'Amarelo' }
];

function rating(pl) {
  var s = pl.skills || {};
  var vals = SKILLS.map(function (k) { return s[k.id] == null ? 3 : s[k.id]; });
  return vals.reduce(function (a, b) { return a + b; }, 0) / vals.length;
}
function fmt(n) { return n.toFixed(1).replace('.', ','); }
function isGk(pl) { return (pl.positions || []).indexOf('GOL') >= 0; }

var ROLES = ['DEF', 'MEI', 'ATA'];
function teamProfile(players) {
  var n = players.length || 1, out = { skills: {}, roles: {} };
  SKILLS.forEach(function (k) {
    out.skills[k.id] = players.reduce(function (a, x) { var v = (x.skills || {})[k.id]; return a + (v == null ? 3 : v); }, 0) / n;
  });
  ROLES.forEach(function (r) {
    out.roles[r] = players.filter(function (x) { return (x.positions || []).indexOf(r) >= 0; }).length;
  });
  return out;
}

function goalPlan(gkCount, rules) {
  if (rules.goalkeepers === 'perTeam') {
    var covered = Math.min(gkCount, rules.teams);
    return { mode: 'perTeam', fixed: covered, rotating: rules.teams - covered };
  }
  var fixed = Math.min(gkCount, 2);
  return { mode: 'fixed', fixed: fixed, rotating: 2 - fixed };
}

function planSummary(players, rules) {
  var gks = players.filter(isGk);
  var gp = goalPlan(gks.length, rules);
  var gkInTeams = gp.mode === 'perTeam' ? gp.fixed : 0;
  var extraGk = gp.mode === 'fixed' ? Math.max(0, gks.length - 2) : Math.max(0, gks.length - rules.teams);
  var line = players.length - gks.length + extraGk;
  var slots = rules.linePerTeam * rules.teams;
  var used = Math.min(line, slots);
  var sizes = [];
  for (var i = 0; i < rules.teams; i++) sizes.push(0);
  for (var j = 0; j < used; j++) sizes[j % rules.teams]++;
  sizes.sort(function (a, b) { return b - a; });
  return {
    goal: gp, gkInTeams: gkInTeams, line: line,
    full: sizes.filter(function (s) { return s === rules.linePerTeam; }).length,
    partial: sizes.filter(function (s) { return s < rules.linePerTeam; }).map(function (s) { return { size: s, missing: rules.linePerTeam - s }; }),
    bench: Math.max(0, line - slots)
  };
}

/*
 * Sorteio equilibrado em 3 camadas (pesos em ordem de importância):
 *  1. posições  — cada time com DEF, MEI e ATA sempre que houver gente suficiente
 *  2. nota média — médias dos times o mais próximas possível
 *  3. características — médias de Ataque/Defesa/Velocidade/Habilidade parecidas
 *     e "especialistas" (4+ estrelas numa habilidade) espalhados entre os times
 * Busca local: parte de uma serpentina, troca pares de jogadores entre times enquanto o custo cair,
 * repete com vários pontos de partida e sorteia entre as melhores soluções (para "Sortear de novo" variar).
 */
var W = { role: 30, roleStack: 1.5, avg: 60, trait: 10, spec: 2.5 };
function drawTeams(players, rules, seed) {
  var rnd = seed == null ? Math.random : (function (s) { s = Math.abs(Math.floor(s)) % 233280 || 1; return function () { s = (s * 9301 + 49297) % 233280; return s / 233280; }; })(seed);
  var balance = rules.balance !== false;
  var traits = balance && rules.traits !== false;
  var keepRoles = rules.positions !== false;
  var T = rules.teams;
  var gks = players.filter(isGk).map(function (x) { return { p: x, r: rating(x) + rnd() * 0.3 }; }).sort(function (a, b) { return b.r - a.r; });
  var gp = goalPlan(gks.length, rules);
  var fixedGks = [], teamGks = [], line = [];
  if (gp.mode === 'fixed') {
    fixedGks = gks.slice(0, 2).map(function (x) { return x.p; });
    gks.slice(2).forEach(function (x) { line.push(x.p); });
  } else {
    teamGks = gks.slice(0, T).map(function (x) { return x.p; });
    gks.slice(T).forEach(function (x) { line.push(x.p); });
  }
  players.forEach(function (x) { if (!isGk(x)) line.push(x); });
  var slots = rules.linePerTeam * T;
  var pool = line.slice(), bench = [];
  if (pool.length > slots) {
    pool = pool.map(function (x, i) { return { x: x, k: (rules.monthlyPriority && x.monthly ? 0 : 1), i: i }; })
      .sort(function (a, b) { return a.k - b.k || a.i - b.i; }).map(function (o) { return o.x; });
    bench = pool.slice(slots);
    pool = pool.slice(0, slots);
  }

  // dados pré-calculados por jogador
  var N = pool.length;
  var D = pool.map(function (x) {
    var sk = SKILLS.map(function (k) { var v = (x.skills || {})[k.id]; return v == null ? 3 : v; });
    return { r: rating(x), sk: sk, spec: sk.map(function (v) { return v >= 4 ? 1 : 0; }),
      roles: ROLES.map(function (r) { return (x.positions || []).indexOf(r) >= 0 ? 1 : 0; }) };
  });
  var sizes = [];
  for (var t = 0; t < T; t++) sizes.push(Math.min(rules.linePerTeam, Math.floor(N / T) + (t < N % T ? 1 : 0)));
  var allR = 0, allSk = [0, 0, 0, 0], allSpec = [0, 0, 0, 0], supply = [0, 0, 0];
  D.forEach(function (d) { allR += d.r; for (var k = 0; k < 4; k++) { allSk[k] += d.sk[k]; allSpec[k] += d.spec[k]; } for (var q = 0; q < 3; q++) supply[q] += d.roles[q]; });
  var meanR = N ? allR / N : 0, meanSk = allSk.map(function (v) { return N ? v / N : 0; });

  function cost(assign) {
    var n = [], sr = [], ssk = [], ssp = [], sro = [];
    for (var t = 0; t < T; t++) { n.push(0); sr.push(0); ssk.push([0, 0, 0, 0]); ssp.push([0, 0, 0, 0]); sro.push([0, 0, 0]); }
    for (var i = 0; i < N; i++) {
      var t2 = assign[i], d = D[i];
      n[t2]++; sr[t2] += d.r;
      for (var k = 0; k < 4; k++) { ssk[t2][k] += d.sk[k]; ssp[t2][k] += d.spec[k]; }
      for (var q = 0; q < 3; q++) sro[t2][q] += d.roles[q];
    }
    var c = 0;
    if (keepRoles) {
      for (var q2 = 0; q2 < 3; q2++) {
        var covered = 0;
        for (var t3 = 0; t3 < T; t3++) {
          if (sro[t3][q2] > 0) covered++;
          var ideal = supply[q2] / T;
          c += W.roleStack * (sro[t3][q2] - ideal) * (sro[t3][q2] - ideal);
        }
        c += W.role * Math.max(0, Math.min(T, supply[q2]) - covered);
      }
    }
    if (balance) {
      for (var t4 = 0; t4 < T; t4++) {
        if (!n[t4]) continue;
        var dr = sr[t4] / n[t4] - meanR;
        c += W.avg * dr * dr;
        if (traits) {
          for (var k2 = 0; k2 < 4; k2++) {
            var ds = ssk[t4][k2] / n[t4] - meanSk[k2];
            c += W.trait * ds * ds;
            var es = ssp[t4][k2] - allSpec[k2] * n[t4] / N;
            c += W.spec * es * es;
          }
        }
      }
    }
    return c;
  }

  function start(jitter) {
    var order = D.map(function (d, i) { return { i: i, r: balance ? d.r + rnd() * jitter : rnd() }; }).sort(function (a, b) { return b.r - a.r; });
    var assign = new Array(N), fill = sizes.map(function () { return 0; }), idx = 0, dir = 1;
    order.forEach(function (o) {
      var guard = 0;
      while (fill[idx] >= sizes[idx] && guard++ < T * 2) { idx += dir; if (idx >= T) { idx = T - 1; dir = -1; } if (idx < 0) { idx = 0; dir = 1; } }
      assign[o.i] = idx; fill[idx]++;
      idx += dir; if (idx >= T) { idx = T - 1; dir = -1; } if (idx < 0) { idx = 0; dir = 1; }
    });
    return assign;
  }
  function improve(assign) {
    var best = cost(assign), moved = true, passes = 0;
    while (moved && passes++ < 40) {
      moved = false;
      for (var i = 0; i < N; i++) for (var j = i + 1; j < N; j++) {
        if (assign[i] === assign[j]) continue;
        var a = assign[i]; assign[i] = assign[j]; assign[j] = a;
        var c = cost(assign);
        if (c < best - 1e-9) { best = c; moved = true; }
        else { a = assign[i]; assign[i] = assign[j]; assign[j] = a; }
      }
    }
    return { assign: assign, cost: best };
  }
  var runs = [];
  var R = N <= T ? 1 : (balance ? 16 : 4);
  for (var r = 0; r < R; r++) runs.push(improve(start(r === 0 ? 0.3 : 1.6)));
  runs.sort(function (a, b) { return a.cost - b.cost; });
  var bestC = runs.length ? runs[0].cost : 0;
  var good = runs.filter(function (x) { return x.cost <= bestC + Math.max(0.4, bestC * 0.15); });
  var pick = good.length ? good[Math.floor(rnd() * good.length)] : { assign: [], cost: 0 };

  var teams = [];
  for (var i2 = 0; i2 < T; i2++) teams.push({ players: [], goalkeeper: teamGks[i2] ? teamGks[i2].name : null });
  pool.forEach(function (x, i) { teams[pick.assign[i]].players.push(x); });
  teams.forEach(function (tm) { tm.players.sort(function (a, b) { return ROLES.indexOf(primaryRole(a)) - ROLES.indexOf(primaryRole(b)); }); });
  teams.sort(function (a, b) { return b.players.length - a.players.length; });
  teams.forEach(function (tm, i) {
    tm.name = 'Time ' + TEAM_COLORS[i % 6].label; tm.color = TEAM_COLORS[i % 6].id;
    tm.missing = rules.linePerTeam - tm.players.length;
  });
  return { teams: teams, goalkeepers: fixedGks, rotating: gp.rotating, mode: gp.mode, bench: bench, cost: pick.cost };
}
function primaryRole(x) {
  var p = x.positions || ['QQ'];
  for (var i = 0; i < ROLES.length; i++) if (p.indexOf(ROLES[i]) >= 0) return ROLES[i];
  return p.indexOf('ALA') >= 0 ? 'MEI' : 'ZZZ';
}

function P(id, name, pos, monthly, a, d, s, k) {
  return { id: id, name: name, positions: pos, monthly: monthly, skills: { attack: a, defense: d, speed: s, skill: k } };
}
var sampleSquad = [
  P('p01', 'Marcão', ['GOL'], true, 1, 4, 2, 3),
  P('p02', 'Tiago Souza', ['ATA'], true, 5, 2, 4, 5),
  P('p03', 'Rafa', ['MEI', 'ATA'], true, 4, 3, 4, 4),
  P('p04', 'Dudu', ['DEF'], true, 2, 5, 3, 3),
  P('p05', 'Léo Martins', ['ALA'], true, 3, 3, 5, 3),
  P('p06', 'Bruno', ['QQ'], false, 3, 3, 3, 3),
  P('p07', 'Caio', ['MEI'], true, 3, 4, 3, 4),
  P('p08', 'Gui', ['ATA'], false, 4, 2, 5, 3),
  P('p09', 'Pedrinho', ['ALA', 'DEF'], true, 2, 4, 4, 2),
  P('p10', 'Fábio', ['DEF'], false, 2, 4, 2, 2),
  P('p11', 'Juninho', ['MEI'], true, 4, 2, 3, 5),
  P('p12', 'Vini', ['QQ'], false, 3, 2, 4, 3),
  P('p13', 'Neto', ['DEF', 'MEI'], true, 2, 4, 3, 3),
  P('p14', 'Beto', ['QQ'], false, 2, 3, 2, 2),
  P('p15', 'Alemão', ['ATA'], true, 4, 1, 3, 4),
  P('p16', 'Serginho', ['GOL'], false, 1, 3, 2, 2),
  P('p17', 'Paulo Henrique', ['MEI'], true, 3, 3, 3, 4),
  P('p18', 'Nando', ['ALA'], false, 3, 2, 4, 3),
  P('p19', 'Diego', ['DEF'], true, 2, 5, 3, 2),
  P('p20', 'Careca', ['QQ'], false, 3, 3, 2, 3),
  P('p21', 'Wellington', ['ATA', 'ALA'], false, 4, 2, 4, 3),
  P('p22', 'Thiago Jr', ['QQ'], false, 2, 2, 3, 2)
];

export {
  POSITIONS, SKILLS, TEAM_COLORS, ROLES,
  rating, fmt as formatRating, isGk as isGoalkeeper, teamProfile,
  goalPlan, planSummary, drawTeams, sampleSquad
};
