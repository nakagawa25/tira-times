export type Position = 'GOL' | 'DEF' | 'ALA' | 'MEI' | 'ATA' | 'QQ';

export interface Skills {
  attack: number;
  defense: number;
  speed: number;
  skill: number;
}

export interface Player {
  id: string;
  name: string;
  positions: Position[];
  monthly: boolean;
  skills: Skills;
}

export type GoalkeeperMode = 'fixed' | 'perTeam';

export interface Rules {
  linePerTeam: number;
  teams: number;
  goalkeepers: GoalkeeperMode;
  balance: boolean;
  traits: boolean;
  positions: boolean;
  monthlyPriority: boolean;
  avoidRepeatPairs: boolean;
}

export const DEFAULT_RULES: Rules = {
  linePerTeam: 5,
  teams: 3,
  goalkeepers: 'fixed',
  balance: true,
  traits: true,
  positions: true,
  monthlyPriority: true,
  avoidRepeatPairs: false,
};

export type TeamColor = 'verde' | 'azul' | 'laranja' | 'grafite' | 'vermelho' | 'amarelo';
export const TEAM_COLORS: TeamColor[] = ['verde', 'azul', 'laranja', 'grafite', 'vermelho', 'amarelo'];

export const ROLES = ['DEF', 'MEI', 'ATA'] as const;
export type Role = (typeof ROLES)[number];

export const SKILL_KEYS = ['attack', 'defense', 'speed', 'skill'] as const;

export interface Team {
  name: string;
  color: TeamColor;
  players: Player[];
  goalkeeper: string | null;
  missing: number;
}

export interface DrawResult {
  teams: Team[];
  goalkeepers: Player[];
  rotating: number;
  mode: GoalkeeperMode;
  bench: Player[];
  cost: number;
}

export interface GoalPlan {
  mode: GoalkeeperMode;
  fixed: number;
  rotating: number;
}

export interface PlanSummary {
  goal: GoalPlan;
  gkInTeams: number;
  line: number;
  full: number;
  partial: { size: number; missing: number }[];
  bench: number;
}

export interface TeamProfile {
  skills: Record<(typeof SKILL_KEYS)[number], number>;
  roles: Record<Role, number>;
}
