import type { Player } from './types';
import { SKILL_KEYS } from './types';

export function rating(player: Player): number {
  const vals = SKILL_KEYS.map((k) => player.skills[k] ?? 3);
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

export function formatRating(n: number): string {
  return n.toFixed(1).replace('.', ',');
}

export function isGoalkeeper(player: Player): boolean {
  return player.positions.includes('GOL');
}
