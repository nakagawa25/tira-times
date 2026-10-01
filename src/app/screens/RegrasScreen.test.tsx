import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { RegrasScreen } from './RegrasScreen';
import { useAppStore } from '../store/useAppStore';
import { sampleSquad } from '../../domain/sampleSquad';

beforeEach(() => {
  localStorage.clear();
  useAppStore.setState(useAppStore.getInitialState());
});

describe('RegrasScreen', () => {
  it('shows the default steppers and preview with nobody present', () => {
    render(<RegrasScreen />);
    expect(screen.getByText('Com 0 presentes hoje')).toBeInTheDocument();
    expect(screen.getByText('Sem goleiro · revezamento nos dois gols')).toBeInTheDocument();
  });

  it('the line-per-team stepper updates the store', async () => {
    render(<RegrasScreen />);
    await userEvent.click(screen.getByRole('button', { name: /Aumentar Jogadores de linha por time/ }));
    expect(useAppStore.getState().rules.linePerTeam).toBe(6);
  });

  it('switching to "Um por time" updates the store', async () => {
    render(<RegrasScreen />);
    await userEvent.click(screen.getByRole('button', { name: 'Um por time' }));
    expect(useAppStore.getState().rules.goalkeepers).toBe('perTeam');
  });

  it('turning off "Equilibrar pela nota média" disables "Espalhar características"', async () => {
    render(<RegrasScreen />);
    await userEvent.click(screen.getByRole('switch', { name: 'Equilibrar pela nota média' }));
    expect(useAppStore.getState().rules.balance).toBe(false);
    expect(screen.getByRole('switch', { name: 'Espalhar características' })).toBeDisabled();
  });

  it('shows the real missing count, not a hardcoded 1, when teams are far from full', () => {
    for (let i = 0; i < 6; i++) {
      useAppStore.getState().addPlayer({
        id: `g${i}`,
        name: `g${i}`,
        positions: ['QQ'],
        monthly: false,
        skills: { attack: 3, defense: 3, speed: 3, skill: 3 },
      });
    }
    render(<RegrasScreen />);
    // 6 line players across 3 teams of 5 => each team has 2, missing 3.
    expect(screen.getAllByText('1 time com 2 — completar com 3 de fora')).toHaveLength(3);
  });

  it('matches the briefing preview with 15 presentes', () => {
    sampleSquad.slice(0, 15).forEach((p) => useAppStore.getState().addPlayer(p));
    render(<RegrasScreen />);
    expect(screen.getByText('Com 15 presentes hoje')).toBeInTheDocument();
    expect(screen.getByText('1 goleiro fixo + revezamento no outro gol')).toBeInTheDocument();
    expect(screen.getByText('2 time(s) completo(s)')).toBeInTheDocument();
    expect(screen.getByText('1 time com 4 — completar com 1 de fora')).toBeInTheDocument();
  });
});
