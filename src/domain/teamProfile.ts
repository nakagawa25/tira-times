import type { Player, TeamProfile, Role } from './types';
import { SKILL_KEYS, ROLES } from './types';
import { rating } from './rating';

export function teamProfile(players: Player[]): TeamProfile {
  const n = players.length || 1;
  const skills = {} as TeamProfile['skills'];
  for (const k of SKILL_KEYS) {
    skills[k] = players.reduce((a, p) => a + (p.skills[k] ?? 3), 0) / n;
  }
  const roles = {} as Record<Role, number>;
  for (const r of ROLES) {
    roles[r] = players.filter((p) => p.positions.includes(r)).length;
  }
  return { skills, roles };
}

/** De `candidates` (tipicamente jogadores de outros times), os mais parecidos com a
 * nota média do time, para completar uma vaga aberta sem desequilibrar o time.
 * Ordena por distância até a média atual do time; não considera posição/características, só nota. */
export function suggestFillIns(teamPlayers: Player[], candidates: Player[], limit = 3): Player[] {
  if (candidates.length === 0) return [];
  const teamAvg = teamPlayers.length ? teamPlayers.reduce((a, p) => a + rating(p), 0) / teamPlayers.length : 3;
  return [...candidates].sort((a, b) => Math.abs(rating(a) - teamAvg) - Math.abs(rating(b) - teamAvg)).slice(0, limit);
}
