import { DEFAULT_RULES } from '../../domain/types';
import type { AppState } from './useAppStore';

export function mergeState(current: AppState, persisted: Partial<AppState> | undefined): AppState {
  if (!persisted) return current;
  return { ...current, ...persisted, rules: { ...DEFAULT_RULES, ...persisted.rules } };
}
