import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Player, Rules, DrawResult } from '../../domain/types';
import { DEFAULT_RULES } from '../../domain/types';
import { drawTeams, pairKey } from '../../domain/drawTeams';
import { mergePlayers } from '../../domain/importExport';
import type { ImportOk } from '../../domain/importExport';
import { safeStorage } from './safeStorage';
import { mergeState } from './mergeState';

export interface WebState {
  consent: 'all' | 'essential' | null;
  pro: boolean;
  installDismissed: boolean;
}

export interface AppState {
  groupName: string;
  players: Player[];
  present: string[];
  rules: Rules;
  draw: DrawResult | null;
  drawnAt: number | null;
  showRatings: boolean;
  web: WebState;
  /** Temporary, in-memory only (see persist partialize): how many times each pair of
   * player ids has shared a team, used by rules.avoidRepeatPairs to spread rotation. */
  pairHistory: Record<string, number>;
  historyDraws: number;
  historyKey: string;

  setGroupName: (name: string) => void;
  addPlayer: (player: Player) => void;
  updatePlayer: (player: Player) => void;
  removePlayer: (id: string) => void;
  togglePresent: (id: string) => void;
  setAllMonthlyPresent: () => void;
  setAllPresent: () => void;
  clearPresent: () => void;
  setRules: (rules: Partial<Rules>) => void;
  runDraw: (seed?: number) => void;
  setShowRatings: (value: boolean) => void;
  importData: (result: ImportOk, mode: 'merge' | 'replace') => void;
  setPro: (value: boolean) => void;
  setConsent: (value: WebState['consent']) => void;
  dismissInstall: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      groupName: 'Fut de Sexta. Created By Naka',
      players: [],
      present: [],
      rules: DEFAULT_RULES,
      draw: null,
      drawnAt: null,
      showRatings: true,
      web: { consent: null, pro: false, installDismissed: false },
      pairHistory: {},
      historyDraws: 0,
      historyKey: '',

      setGroupName: (name) => set({ groupName: name }),
      addPlayer: (player) => set((s) => ({ players: [...s.players, player], present: [...s.present, player.id] })),
      updatePlayer: (player) => set((s) => ({ players: s.players.map((p) => (p.id === player.id ? player : p)) })),
      removePlayer: (id) => set((s) => ({ players: s.players.filter((p) => p.id !== id), present: s.present.filter((pid) => pid !== id) })),
      togglePresent: (id) =>
        set((s) => ({ present: s.present.includes(id) ? s.present.filter((pid) => pid !== id) : [...s.present, id] })),
      setAllMonthlyPresent: () => set((s) => ({ present: s.players.filter((p) => p.monthly).map((p) => p.id) })),
      setAllPresent: () => set((s) => ({ present: s.players.map((p) => p.id) })),
      clearPresent: () => set({ present: [] }),
      setRules: (rules) =>
        set((s) => {
          const merged = { ...s.rules, ...rules };
          // ponytail: mutually exclusive — avoidRepeatPairs' rotation-first cost term
          // and the balance/traits/positions cost terms fight over the same swaps, so
          // combining them left teams visibly unbalanced. Turning one group on clears
          // the other instead of trying to blend them.
          if (rules.avoidRepeatPairs) {
            merged.balance = false;
            merged.traits = false;
            merged.positions = false;
          } else if (rules.balance || rules.traits || rules.positions) {
            merged.avoidRepeatPairs = false;
          }
          return { rules: merged };
        }),
      runDraw: (seed) => {
        const { players, present, rules, draw } = get();
        const presentPlayers = players.filter((p) => present.includes(p.id));
        if (!rules.avoidRepeatPairs) {
          set({ draw: drawTeams(presentPlayers, rules, seed, draw), drawnAt: Date.now() });
          return;
        }
        const { pairHistory, historyDraws, historyKey } = get();
        const rosterKey = `${present.slice().sort().join(',')}::${rules.teams}x${rules.linePerTeam}`;
        // ponytail: naive reset cap — after as many redraws as players present, start a
        // fresh rotation round instead of growing the history forever. Tune if real usage
        // shows players "unlock" repeats too soon or too late.
        const cap = presentPlayers.length || 1;
        const stale = rosterKey !== historyKey || historyDraws >= cap;
        const hist = stale ? {} : { ...pairHistory };
        const result = drawTeams(presentPlayers, rules, seed, draw, hist);
        result.teams.forEach((team) => {
          const ids = team.players.map((p) => p.id);
          for (let a = 0; a < ids.length; a++) {
            for (let b = a + 1; b < ids.length; b++) {
              const key = pairKey(ids[a], ids[b]);
              hist[key] = (hist[key] ?? 0) + 1;
            }
          }
        });
        set({ draw: result, drawnAt: Date.now(), pairHistory: hist, historyDraws: (stale ? 0 : historyDraws) + 1, historyKey: rosterKey });
      },
      setShowRatings: (value) => set({ showRatings: value }),
      importData: (result, mode) =>
        set((s) => ({
          players: mode === 'replace' ? result.players : mergePlayers(s.players, result.players),
          present: mode === 'replace' ? [] : s.present,
          draw: mode === 'replace' ? null : s.draw,
          rules: { ...s.rules, ...result.rules },
          groupName: result.groupName ?? s.groupName,
        })),
      setPro: (value) => set((s) => ({ web: { ...s.web, pro: value } })),
      setConsent: (value) => set((s) => ({ web: { ...s.web, consent: value } })),
      dismissInstall: () => set((s) => ({ web: { ...s.web, installDismissed: true } })),
    }),
    {
      name: 'tira-times',
      storage: createJSONStorage(() => safeStorage),
      merge: (persisted, current) => mergeState(current, persisted as Partial<AppState> | undefined),
      partialize: (s) => {
        const { pairHistory, historyDraws, historyKey, ...rest } = s;
        return rest;
      },
    },
  ),
);
