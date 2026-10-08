import type { Player, Position, Rules } from './types';

const VALID_POSITIONS: Position[] = ['GOL', 'DEF', 'ALA', 'MEI', 'ATA', 'QQ'];
const RULE_KEYS: (keyof Rules)[] = ['linePerTeam', 'teams', 'goalkeepers', 'balance', 'traits', 'positions', 'monthlyPriority', 'avoidRepeatPairs'];

export interface ImportOk {
  ok: true;
  players: Player[];
  rules: Partial<Rules>;
  groupName?: string;
}
export interface ImportError {
  ok: false;
  error: string;
}
export type ImportResult = ImportOk | ImportError;

export interface ExportPayload {
  app: 'tira-times';
  version: 1;
  exportedAt: string;
  group: { name: string };
  rules: Rules;
  players: Player[];
}

export function genId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `p${Date.now()}${Math.random().toString(36).slice(2, 8)}`;
}

function clampSkill(v: unknown): number {
  const n = typeof v === 'number' ? Math.trunc(v) : NaN;
  if (Number.isNaN(n)) return 3;
  return Math.min(5, Math.max(0, n));
}

function normalizePositions(raw: unknown): Position[] {
  const arr = Array.isArray(raw) ? raw.filter((v): v is Position => VALID_POSITIONS.includes(v as Position)) : [];
  if (arr.length === 0) return ['QQ'];
  if (arr.includes('QQ') && arr.length > 1) return arr.filter((p) => p !== 'QQ');
  return arr;
}

function normalizePlayer(raw: any): Player | null {
  const name = typeof raw?.name === 'string' ? raw.name.trim() : '';
  if (!name) return null;
  const skillsRaw = raw?.skills ?? {};
  return {
    id: typeof raw?.id === 'string' && raw.id ? raw.id : genId(),
    name,
    positions: normalizePositions(raw?.positions),
    monthly: Boolean(raw?.monthly),
    skills: {
      attack: clampSkill(skillsRaw.attack),
      defense: clampSkill(skillsRaw.defense),
      speed: clampSkill(skillsRaw.speed),
      skill: clampSkill(skillsRaw.skill),
    },
  };
}

export function parseImport(text: string): ImportResult {
  let data: any;
  try {
    data = JSON.parse(text);
  } catch {
    return { ok: false, error: 'Esse texto não é um JSON válido. Copie o arquivo inteiro, do primeiro { ao último }.' };
  }
  if (!Array.isArray(data?.players)) {
    return { ok: false, error: 'Não achei a lista "players" nesse JSON. Ele precisa ter sido exportado pelo Tira times.' };
  }
  const players = data.players.map(normalizePlayer).filter((p: Player | null): p is Player => p !== null);
  if (players.length === 0) {
    return { ok: false, error: 'O arquivo não tem nenhum jogador com nome.' };
  }
  const rules: Partial<Rules> = {};
  if (data.rules && typeof data.rules === 'object') {
    for (const key of RULE_KEYS) {
      if (data.rules[key] !== undefined) (rules as any)[key] = data.rules[key];
    }
  }
  const groupName = typeof data.group?.name === 'string' ? data.group.name : undefined;
  return { ok: true, players, rules, groupName };
}

export function mergePlayers(existing: Player[], incoming: Player[]): Player[] {
  const byId = new Map(existing.map((p) => [p.id, p]));
  for (const p of incoming) byId.set(p.id, p);
  return Array.from(byId.values());
}

export function buildExport(groupName: string, players: Player[], rules: Rules, now: Date = new Date()): ExportPayload {
  return {
    app: 'tira-times',
    version: 1,
    exportedAt: now.toISOString(),
    group: { name: groupName },
    rules,
    players,
  };
}

function slugify(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function exportFilename(groupName: string, now: Date = new Date()): string {
  const date = now.toISOString().slice(0, 10);
  return `tira-times-${slugify(groupName)}-${date}.json`;
}
