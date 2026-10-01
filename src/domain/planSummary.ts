import type { Player, Rules, GoalPlan, PlanSummary } from './types';
import { isGoalkeeper } from './rating';

export function goalPlan(gkCount: number, rules: Rules): GoalPlan {
  if (rules.goalkeepers === 'perTeam') {
    const covered = Math.min(gkCount, rules.teams);
    return { mode: 'perTeam', fixed: covered, rotating: rules.teams - covered };
  }
  const fixed = Math.min(gkCount, 2);
  return { mode: 'fixed', fixed, rotating: 2 - fixed };
}

export function planSummary(players: Player[], rules: Rules): PlanSummary {
  const gks = players.filter(isGoalkeeper);
  const gp = goalPlan(gks.length, rules);
  const gkInTeams = gp.mode === 'perTeam' ? gp.fixed : 0;
  const extraGk = gp.mode === 'fixed' ? Math.max(0, gks.length - 2) : Math.max(0, gks.length - rules.teams);
  const line = players.length - gks.length + extraGk;
  const slots = rules.linePerTeam * rules.teams;
  const used = Math.min(line, slots);
  const sizes: number[] = new Array(rules.teams).fill(0);
  for (let j = 0; j < used; j++) sizes[j % rules.teams]++;
  sizes.sort((a, b) => b - a);
  return {
    goal: gp,
    gkInTeams,
    line,
    full: sizes.filter((s) => s === rules.linePerTeam).length,
    partial: sizes.filter((s) => s < rules.linePerTeam).map((s) => ({ size: s, missing: rules.linePerTeam - s })),
    bench: Math.max(0, line - slots),
  };
}
