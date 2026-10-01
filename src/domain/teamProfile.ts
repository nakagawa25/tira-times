import type { Player, TeamProfile, Role } from './types';
import { SKILL_KEYS, ROLES } from './types';

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
