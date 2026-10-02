import type { DrawResult } from '../../domain/types';
import { rating, formatRating } from '../../domain/rating';
import { formatDateLong, formatTime } from '../dateFormat';

export function describeGoalkeepers(draw: DrawResult): string {
  if (draw.mode === 'perTeam') return 'Cada time com seu goleiro';
  if (draw.goalkeepers.length === 0) return 'Sem goleiro · revezamento nos dois gols';
  if (draw.goalkeepers.length === 1) return `${draw.goalkeepers[0].name} + revezamento`;
  return draw.goalkeepers.map((g) => g.name).join(' e ');
}

export function buildShareText(groupName: string, draw: DrawResult, now: Date = new Date()): string {
  const lines: string[] = [];
  lines.push(`Tira times · ${groupName}`);
  lines.push(`${formatDateLong(now)} · ${formatTime(now)}`);
  lines.push('');
  lines.push(`Gol: ${describeGoalkeepers(draw)}`);
  lines.push('');
  draw.teams.forEach((team) => {
    const power = team.players.length ? team.players.reduce((a, p) => a + rating(p), 0) / team.players.length : 0;
    lines.push(`TIME ${team.color.toUpperCase()} (${formatRating(power)})`);
    team.players.forEach((p) => lines.push(`  ${p.name}`));
    if (team.missing > 0) lines.push(`  + ${team.missing} de fora`);
    lines.push('');
  });
  if (draw.bench.length > 0) {
    lines.push(`Próxima: ${draw.bench.map((p) => p.name).join(', ')}`);
  }
  return lines.join('\n').trimEnd();
}
