import { describe, it, expect } from 'vitest';
import { planSummary, goalPlan } from './planSummary';
import { sampleSquad } from './sampleSquad';
import type { Rules } from './types';

const RULES: Rules = { linePerTeam: 5, teams: 3, goalkeepers: 'fixed', balance: true, traits: true, positions: true, monthlyPriority: true, avoidRepeatPairs: false };

describe('goalPlan', () => {
  it('fixed mode covers up to 2 goalkeepers', () => {
    expect(goalPlan(1, RULES)).toEqual({ mode: 'fixed', fixed: 1, rotating: 1 });
    expect(goalPlan(0, RULES)).toEqual({ mode: 'fixed', fixed: 0, rotating: 2 });
  });

  it('perTeam mode covers up to one goalkeeper per team', () => {
    const r = { ...RULES, goalkeepers: 'perTeam' as const };
    expect(goalPlan(1, r)).toEqual({ mode: 'perTeam', fixed: 1, rotating: 2 });
  });
});

describe('planSummary', () => {
  it('briefing example: 15 presentes, 1 goleiro, 5 por time, 3 times', () => {
    const s = planSummary(sampleSquad.slice(0, 15), RULES);
    expect(s.goal.fixed).toBe(1);
    expect(s.goal.rotating).toBe(1);
    expect(s.full).toBe(2);
    expect(s.partial).toEqual([{ size: 4, missing: 1 }]);
  });

  it('perTeam goalkeepers: teams without one rotate', () => {
    const s = planSummary(sampleSquad.slice(0, 15), { ...RULES, goalkeepers: 'perTeam' });
    expect(s.goal.fixed).toBe(1);
    expect(s.goal.rotating).toBe(2);
  });
});
