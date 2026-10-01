/* @ds-bundle: {"format":4,"namespace":"Pelada","components":[{"name":"Button"},{"name":"Badge"},{"name":"TextField"},{"name":"StarRating"},{"name":"PositionPicker"},{"name":"MonthlySwitch"},{"name":"PlayerRow"},{"name":"Stepper"},{"name":"TeamCard"},{"name":"AppBar"},{"name":"BottomNav"}]} */
(function () {
  var React = window.React;
  var h = React.createElement;
  var useState = React.useState;

  function cx() {
    return Array.prototype.filter.call(arguments, Boolean).join(' ');
  }
  function useCtl(value, def, onChange) {
    var s = useState(def);
    var ctl = value !== undefined;
    return [ctl ? value : s[0], function (v) {
      if (!ctl) s[1](v);
      if (onChange) onChange(v);
    }];
  }

  var POSITIONS = [
    { id: 'GOL', label: 'Goleiro', short: 'GOL' },
    { id: 'DEF', label: 'Defesa', short: 'DEF' },
    { id: 'ALA', label: 'Ala', short: 'ALA' },
    { id: 'MEI', label: 'Meio', short: 'MEI' },
    { id: 'ATA', label: 'Ataque', short: 'ATA' },
    { id: 'QQ', label: 'Qualquer', short: 'QQ' }
  ];
  var SKILLS = [
    { id: 'attack', label: 'Ataque', icon: 'sports_soccer' },
    { id: 'defense', label: 'Defesa', icon: 'shield' },
    { id: 'speed', label: 'Velocidade', icon: 'bolt' },
    { id: 'skill', label: 'Habilidade', icon: 'auto_awesome' }
  ];
  var TEAM_COLORS = [
    { id: 'verde', label: 'Verde' },
    { id: 'azul', label: 'Azul' },
    { id: 'laranja', label: 'Laranja' },
    { id: 'grafite', label: 'Grafite' },
    { id: 'vermelho', label: 'Vermelho' },
    { id: 'amarelo', label: 'Amarelo' }
  ];

  function Icon(p) {
    return h('span', {
      className: cx('pl-icon', p.filled && 'pl-icon-fill', p.className),
      style: p.size ? { fontSize: p.size } : undefined,
      'aria-hidden': true
    }, p.name);
  }

  function Button(p) {
    var v = p.variant || 'primary';
    return h('button', {
      type: 'button',
      className: cx('pl-btn', 'pl-btn-' + v, p.size === 'lg' && 'pl-btn-lg', p.block && 'pl-btn-block', p.className),
      onClick: p.onClick,
      disabled: p.disabled,
      'aria-label': p.ariaLabel
    }, p.icon ? h(Icon, { name: p.icon, filled: v === 'fab' }) : null, p.children);
  }

  function Badge(p) {
    var tone = p.tone || 'neutral';
    var icon = p.icon || (tone === 'monthly' ? 'workspace_premium' : tone === 'gk' ? 'sports_handball' : null);
    var text = p.children || (tone === 'monthly' ? 'Mensalista' : tone === 'guest' ? 'Avulso' : '');
    return h('span', { className: cx('pl-badge', 'pl-badge-' + tone) }, icon ? h(Icon, { name: icon, filled: true }) : null, text);
  }

  function Avatar(p) {
    var parts = String(p.name || '?').trim().split(/\s+/);
    var ini = (parts[0][0] + (parts[1] ? parts[1][0] : '')).toUpperCase();
    return h('span', { className: cx('pl-avatar', p.gk && 'pl-avatar-gk', p.active && 'pl-avatar-on') },
      p.active ? h(Icon, { name: 'check', size: 22 }) : ini);
  }

  function TextField(p) {
    var st = useCtl(p.value, p.defaultValue || '', p.onChange);
    return h('label', { className: 'pl-field' },
      p.label ? h('span', { className: 'pl-field-label' }, p.label) : null,
      h('span', { className: 'pl-field-box' },
        p.icon ? h(Icon, { name: p.icon }) : null,
        h('input', {
          value: st[0], placeholder: p.placeholder, autoFocus: p.autoFocus,
          onChange: function (e) { st[1](e.target.value); }
        })),
      p.hint ? h('span', { className: 'pl-field-hint' }, p.hint) : null);
  }

  function Stars(p) {
    var out = [];
    for (var i = 1; i <= 5; i++) {
      (function (n) {
        var on = n <= p.value;
        out.push(h(p.readOnly ? 'span' : 'button', {
          key: n, type: p.readOnly ? undefined : 'button',
          className: cx('pl-star', on && 'pl-star-on'),
          'aria-label': p.readOnly ? undefined : n + ' estrela' + (n > 1 ? 's' : ''),
          onClick: p.readOnly ? undefined : function () { p.onPick(p.value === n ? n - 1 : n); }
        }, h(Icon, { name: 'star', filled: on })));
      })(i);
    }
    return h('span', { className: cx('pl-stars', p.small && 'pl-stars-sm') }, out);
  }

  function StarRating(p) {
    var st = useCtl(p.value, p.defaultValue == null ? 3 : p.defaultValue, p.onChange);
    return h('div', { className: 'pl-rating' },
      h('span', { className: 'pl-rating-label' }, p.icon ? h(Icon, { name: p.icon }) : null, p.label),
      h(Stars, { value: st[0], onPick: st[1], readOnly: p.readOnly }));
  }

  function PositionPicker(p) {
    var st = useCtl(p.value, p.defaultValue || ['QQ'], p.onChange);
    var sel = st[0];
    function toggle(id) {
      var next;
      if (id === 'QQ') next = ['QQ'];
      else {
        var base = sel.filter(function (x) { return x !== 'QQ'; });
        next = base.indexOf(id) >= 0 ? base.filter(function (x) { return x !== id; }) : base.concat(id);
        if (!next.length) next = ['QQ'];
      }
      st[1](next);
    }
    return h('div', { className: 'pl-chips', role: 'group', 'aria-label': 'Posições' },
      POSITIONS.map(function (pos) {
        var on = sel.indexOf(pos.id) >= 0;
        return h('button', {
          key: pos.id, type: 'button', 'aria-pressed': on,
          className: cx('pl-chip', on && 'pl-chip-on'),
          onClick: function () { toggle(pos.id); }
        }, on ? h(Icon, { name: 'check' }) : null, pos.label);
      }));
  }

  function Switch(p) {
    return h('button', {
      type: 'button', role: 'switch', 'aria-checked': !!p.checked,
      className: cx('pl-switch', p.checked && 'pl-switch-on'),
      onClick: function () { p.onChange(!p.checked); }
    }, h('span', { className: 'pl-switch-thumb' }, p.checked ? h(Icon, { name: 'check' }) : null));
  }

  function MonthlySwitch(p) {
    var st = useCtl(p.checked, !!p.defaultChecked, p.onChange);
    return h('div', { className: cx('pl-toggle-row', st[0] && 'pl-toggle-row-on'), onClick: function () { st[1](!st[0]); } },
      h('span', { className: 'pl-toggle-icon' }, h(Icon, { name: p.icon || 'workspace_premium', filled: st[0] })),
      h('span', { className: 'pl-toggle-text' },
        h('span', { className: 'pl-toggle-title' }, p.label || 'Mensalista'),
        h('span', { className: 'pl-toggle-hint' }, p.hint || 'Paga por mês e tem prioridade na lista')),
      h('span', { onClick: function (e) { e.stopPropagation(); } }, h(Switch, { checked: st[0], onChange: st[1] })));
  }

  function rating(pl) {
    var s = pl.skills || {};
    var vals = SKILLS.map(function (k) { return s[k.id] == null ? 3 : s[k.id]; });
    return vals.reduce(function (a, b) { return a + b; }, 0) / vals.length;
  }
  function fmt(n) { return n.toFixed(1).replace('.', ','); }
  function isGk(pl) { return (pl.positions || []).indexOf('GOL') >= 0; }

  function PlayerRow(p) {
    var mode = p.mode || 'list';
    var positions = p.positions || ['QQ'];
    var present = !!p.present;
    return h('div', {
      className: cx('pl-player', mode === 'attendance' && present && 'pl-player-on'),
      role: mode === 'attendance' ? 'checkbox' : 'button', 'aria-checked': mode === 'attendance' ? present : undefined,
      onClick: p.onClick || p.onToggle
    },
      h(Avatar, { name: p.name, gk: positions.indexOf('GOL') >= 0, active: mode === 'attendance' && present }),
      h('span', { className: 'pl-player-main' },
        h('span', { className: 'pl-player-name' }, p.name, p.monthly ? h(Icon, { name: 'workspace_premium', filled: true, className: 'pl-player-mono' }) : null),
        h('span', { className: 'pl-player-meta' },
          positions.map(function (x) { return h('span', { key: x, className: cx('pl-pos', x === 'GOL' && 'pl-pos-gk') }, x); }),
          p.rating != null ? h('span', { className: 'pl-player-rate' }, h(Icon, { name: 'star', filled: true }), fmt(p.rating)) : null)),
      mode === 'attendance'
        ? h('span', { className: cx('pl-check', present && 'pl-check-on') }, present ? h(Icon, { name: 'check' }) : null)
        : h(Icon, { name: 'chevron_right', className: 'pl-player-go' }));
  }

  function Stepper(p) {
    var min = p.min == null ? 1 : p.min, max = p.max == null ? 99 : p.max;
    var st = useCtl(p.value, p.defaultValue == null ? min : p.defaultValue, p.onChange);
    var v = st[0];
    return h('div', { className: 'pl-stepper' },
      h('span', { className: 'pl-stepper-text' },
        h('span', { className: 'pl-stepper-label' }, p.label),
        p.hint ? h('span', { className: 'pl-stepper-hint' }, p.hint) : null),
      h('span', { className: 'pl-stepper-ctl' },
        h('button', { type: 'button', className: 'pl-stepper-btn', disabled: v <= min, 'aria-label': 'Diminuir', onClick: function () { st[1](Math.max(min, v - 1)); } }, h(Icon, { name: 'remove' })),
        h('span', { className: 'pl-stepper-val' }, v),
        h('button', { type: 'button', className: 'pl-stepper-btn pl-stepper-plus', disabled: v >= max, 'aria-label': 'Aumentar', onClick: function () { st[1](Math.min(max, v + 1)); } }, h(Icon, { name: 'add' }))));
  }

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

  function TeamCard(p) {
    var color = p.color || 'verde';
    var players = p.players || [];
    var avg = players.length ? players.reduce(function (a, x) { return a + (x.rating == null ? rating(x) : x.rating); }, 0) / players.length : 0;
    var missing = p.missing || 0;
    var slots = [];
    for (var i = 0; i < missing; i++) slots.push(i);
    var prof = p.showProfile ? teamProfile(players) : null;
    var SHORT = { attack: 'ATA', defense: 'DEF', speed: 'VEL', skill: 'HAB' };
    return h('section', { className: 'pl-team' },
      h('header', { className: 'pl-team-head pl-team-' + color },
        h('span', { className: 'pl-team-name' }, p.name || ('Time ' + color)),
        h('span', { className: 'pl-team-meta' }, players.length + (missing ? '/' + (players.length + missing) : '') + ' jogadores'),
        h('span', { className: 'pl-team-power' }, h(Icon, { name: 'star', filled: true }), fmt(avg))),
      prof ? h('div', { className: 'pl-team-prof' },
        h('div', { className: 'pl-team-meters' }, SKILLS.map(function (k) {
          var v = prof.skills[k.id];
          return h('div', { key: k.id, className: 'pl-meter', title: k.label + ' ' + fmt(v) },
            h('span', { className: 'pl-meter-top' }, h('span', null, SHORT[k.id]), h('b', null, fmt(v))),
            h('span', { className: 'pl-meter-track' }, h('span', { className: 'pl-meter-fill pl-team-' + color, style: { width: Math.max(4, v / 5 * 100) + '%' } })));
        })),
        h('div', { className: 'pl-team-roles' }, ROLES.map(function (r) {
          var c = prof.roles[r];
          return h('span', { key: r, className: 'pl-role' + (c ? '' : ' pl-role-miss') }, h(Icon, { name: c ? 'check' : 'remove' }), r + (c > 1 ? ' ×' + c : ''));
        }))) : null,
      p.goalkeeper ? h('div', { className: 'pl-team-gk' }, h(Icon, { name: 'sports_handball' }), h('span', null, p.goalkeeper)) : null,
      h('ol', { className: 'pl-team-list' },
        players.map(function (x, i) {
          var pos = x.positions || ['QQ'];
          return h('li', { key: x.id || x.name || i },
            h('span', { className: 'pl-team-dot pl-team-' + color }),
            h('span', { className: 'pl-team-player' }, x.name),
            h('span', { className: 'pl-team-pos' }, pos.join(' · ')));
        }),
        slots.map(function (i) {
          return h('li', { key: 'm' + i, className: 'pl-team-open' }, h(Icon, { name: 'person_add' }), h('span', null, 'Vaga aberta — completar com 1 de fora'));
        })));
  }

  function AppBar(p) {
    return h('header', { className: cx('pl-appbar', p.large && 'pl-appbar-lg') },
      p.onBack !== undefined ? h('button', { type: 'button', className: 'pl-iconbtn', 'aria-label': 'Voltar', onClick: p.onBack }, h(Icon, { name: 'arrow_back' })) : null,
      h('span', { className: 'pl-appbar-text' },
        h('span', { className: 'pl-appbar-title' }, p.title),
        p.subtitle ? h('span', { className: 'pl-appbar-sub' }, p.subtitle) : null),
      (p.actions || []).map(function (a) {
        return h('button', { key: a.icon, type: 'button', className: 'pl-iconbtn', 'aria-label': a.label, onClick: a.onClick }, h(Icon, { name: a.icon }));
      }));
  }

  var NAV = [
    { id: 'elenco', icon: 'groups', label: 'Elenco' },
    { id: 'presenca', icon: 'how_to_reg', label: 'Presença' },
    { id: 'times', icon: 'shuffle', label: 'Times' },
    { id: 'regras', icon: 'tune', label: 'Regras' }
  ];
  function BottomNav(p) {
    var st = useCtl(p.active, p.defaultValue || 'elenco', p.onChange);
    var items = p.items || NAV;
    return h('nav', { className: 'pl-nav' }, items.map(function (it) {
      var on = it.id === st[0];
      return h('button', { key: it.id, type: 'button', className: cx('pl-nav-item', on && 'pl-nav-on'), onClick: function () { st[1](it.id); } },
        h('span', { className: 'pl-nav-pill' }, h(Icon, { name: it.icon, filled: on }), it.badge ? h('span', { className: 'pl-nav-badge' }, it.badge) : null),
        h('span', { className: 'pl-nav-label' }, it.label));
    }));
  }

  /* ---------- lógica de sorteio ---------- */
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

  window.Pelada = {
    Button: Button, Badge: Badge, TextField: TextField, StarRating: StarRating,
    PositionPicker: PositionPicker, MonthlySwitch: MonthlySwitch, PlayerRow: PlayerRow,
    Stepper: Stepper, TeamCard: TeamCard, AppBar: AppBar, BottomNav: BottomNav,
    Icon: Icon, Avatar: Avatar, Switch: Switch, Stars: Stars,
    POSITIONS: POSITIONS, SKILLS: SKILLS, TEAM_COLORS: TEAM_COLORS,
    rating: rating, formatRating: fmt, isGoalkeeper: isGk, teamProfile: teamProfile, ROLES: ROLES,
    planSummary: planSummary, drawTeams: drawTeams, sampleSquad: sampleSquad
  };
})();
