import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Player, Rules, DrawResult } from '../../domain/types';
import { DEFAULT_RULES } from '../../domain/types';
import { drawTeams } from '../../domain/drawTeams';
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

      setGroupName: (name) => set({ groupName: name }),
      addPlayer: (player) => set((s) => ({ players: [...s.players, player], present: [...s.present, player.id] })),
      updatePlayer: (player) => set((s) => ({ players: s.players.map((p) => (p.id === player.id ? player : p)) })),
      removePlayer: (id) => set((s) => ({ players: s.players.filter((p) => p.id !== id), present: s.present.filter((pid) => pid !== id) })),
      togglePresent: (id) =>
        set((s) => ({ present: s.present.includes(id) ? s.present.filter((pid) => pid !== id) : [...s.present, id] })),
      setAllMonthlyPresent: () => set((s) => ({ present: s.players.filter((p) => p.monthly).map((p) => p.id) })),
      setAllPresent: () => set((s) => ({ present: s.players.map((p) => p.id) })),
      clearPresent: () => set({ present: [] }),
      setRules: (rules) => set((s) => ({ rules: { ...s.rules, ...rules } })),
      runDraw: (seed) => {
        const { players, present, rules } = get();
        const presentPlayers = players.filter((p) => present.includes(p.id));
        set({ draw: drawTeams(presentPlayers, rules, seed), drawnAt: Date.now() });
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
    },
  ),
);
