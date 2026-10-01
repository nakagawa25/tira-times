import type { Player, Rules, GoalPlan } from '../../domain/types';
import { ROLES } from '../../domain/types';

export function describeGoalPlan(goal: GoalPlan): string {
  if (goal.mode === 'perTeam') {
    return goal.fixed > 0 ? `${goal.fixed} time(s) com goleiro próprio` : 'Nenhum goleiro disponível — todos revezam';
  }
  if (goal.fixed === 2) return '2 goleiros fixos';
  if (goal.fixed === 1) return '1 goleiro fixo + revezamento no outro gol';
  return 'Sem goleiro · revezamento nos dois gols';
}

const ROLE_LABEL: Record<(typeof ROLES)[number], string> = { DEF: 'DEF', MEI: 'MEI', ATA: 'ATA' };

export function positionWarnings(players: Player[], rules: Rules): string[] {
  if (!rules.positions) return [];
  return ROLES.filter((role) => players.filter((p) => p.positions.includes(role)).length < rules.teams).map(
    (role) => `Poucos ${ROLE_LABEL[role]} para todos os times — QQ e ALA completam.`,
  );
}
