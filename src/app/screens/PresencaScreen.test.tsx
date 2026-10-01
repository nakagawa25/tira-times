import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { PresencaScreen } from './PresencaScreen';
import { useAppStore } from '../store/useAppStore';
import type { Player } from '../../domain/types';

const mk = (id: string, monthly = false): Player => ({ id, name: `J${id}`, positions: ['QQ'], monthly, skills: { attack: 3, defense: 3, speed: 3, skill: 3 } });

beforeEach(() => {
  localStorage.clear();
  useAppStore.setState(useAppStore.getInitialState());
});

describe('PresencaScreen', () => {
  it('disables the draw button and shows the warning under 4 present', () => {
    render(<PresencaScreen onDrawn={() => {}} />);
    expect(screen.getByRole('button', { name: 'Marque pelo menos 4' })).toBeDisabled();
  });

  it('"Todos" marks everyone present and enables the draw button with the right count', async () => {
    [1, 2, 3, 4].forEach((i) => useAppStore.getState().addPlayer(mk(String(i))));
    useAppStore.getState().clearPresent();
    render(<PresencaScreen onDrawn={() => {}} />);
    await userEvent.click(screen.getByRole('button', { name: 'Todos' }));
    expect(screen.getByRole('button', { name: 'Sortear 4 jogadores' })).toBeEnabled();
  });

  it('"Mensalistas" marks only monthly players present', async () => {
    useAppStore.getState().addPlayer(mk('1', true));
    useAppStore.getState().addPlayer(mk('2', false));
    useAppStore.getState().clearPresent();
    render(<PresencaScreen onDrawn={() => {}} />);
    await userEvent.click(screen.getByRole('button', { name: 'Mensalistas' }));
    expect(useAppStore.getState().present).toEqual(['1']);
  });

  it('clicking the draw button runs the draw and calls onDrawn', async () => {
    [1, 2, 3, 4].forEach((i) => useAppStore.getState().addPlayer(mk(String(i))));
    useAppStore.getState().setRules({ teams: 2, linePerTeam: 2 });
    const onDrawn = vi.fn();
    render(<PresencaScreen onDrawn={onDrawn} />);
    await userEvent.click(screen.getByRole('button', { name: 'Sortear 4 jogadores' }));
    expect(useAppStore.getState().draw).not.toBeNull();
    expect(onDrawn).toHaveBeenCalledOnce();
  });
});
