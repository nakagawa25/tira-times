import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { TimesScreen } from './TimesScreen';
import { useAppStore } from '../store/useAppStore';
import type { Player } from '../../domain/types';

const mk = (id: string): Player => ({ id, name: `J${id}`, positions: ['QQ'], monthly: false, skills: { attack: 3, defense: 3, speed: 3, skill: 3 } });

beforeEach(() => {
  localStorage.clear();
  useAppStore.setState(useAppStore.getInitialState());
  Object.defineProperty(navigator, 'clipboard', { value: { writeText: vi.fn().mockResolvedValue(undefined) }, configurable: true });
});

describe('TimesScreen', () => {
  it('shows the empty state and goes to Presença', async () => {
    const onGoToPresenca = vi.fn();
    render(<TimesScreen onOpenPro={() => {}} onGoToPresenca={onGoToPresenca} />);
    expect(screen.getByText('Bora sortear?')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Marcar presença' }));
    expect(onGoToPresenca).toHaveBeenCalledOnce();
  });

  it('shows a TeamCard per team, with no ads or Pro upsell shown', () => {
    [1, 2, 3, 4].forEach((i) => useAppStore.getState().addPlayer(mk(String(i))));
    useAppStore.getState().setRules({ teams: 2, linePerTeam: 2 });
    useAppStore.getState().runDraw(1);
    render(<TimesScreen onOpenPro={() => {}} onGoToPresenca={() => {}} />);
    expect(screen.queryByText('Anúncio')).not.toBeInTheDocument();
    expect(screen.queryByText('Remover anúncios')).not.toBeInTheDocument();
  });

  it('"Sortear de novo" calls runDraw again', async () => {
    [1, 2, 3, 4].forEach((i) => useAppStore.getState().addPlayer(mk(String(i))));
    useAppStore.getState().setRules({ teams: 2, linePerTeam: 2 });
    useAppStore.getState().runDraw(1);
    const runDrawSpy = vi.fn();
    useAppStore.setState({ runDraw: runDrawSpy });
    render(<TimesScreen onOpenPro={() => {}} onGoToPresenca={() => {}} />);
    await userEvent.click(screen.getByRole('button', { name: 'Sortear de novo' }));
    expect(runDrawSpy).toHaveBeenCalledOnce();
  });

  it('"Copiar" writes the share text to the clipboard and flips its label', async () => {
    [1, 2, 3, 4].forEach((i) => useAppStore.getState().addPlayer(mk(String(i))));
    useAppStore.getState().setRules({ teams: 2, linePerTeam: 2 });
    useAppStore.getState().runDraw(1);
    render(<TimesScreen onOpenPro={() => {}} onGoToPresenca={() => {}} />);
    await userEvent.click(screen.getByRole('button', { name: 'Copiar' }));
    expect(navigator.clipboard.writeText).toHaveBeenCalledOnce();
    expect(await screen.findByRole('button', { name: 'Copiado!' })).toBeInTheDocument();
  });

  it('shows "Enviar" only when the Web Share API is available', () => {
    [1, 2, 3, 4].forEach((i) => useAppStore.getState().addPlayer(mk(String(i))));
    useAppStore.getState().setRules({ teams: 2, linePerTeam: 2 });
    useAppStore.getState().runDraw(1);
    const { rerender } = render(<TimesScreen onOpenPro={() => {}} onGoToPresenca={() => {}} />);
    expect(screen.queryByRole('button', { name: 'Enviar' })).not.toBeInTheDocument();
    Object.defineProperty(navigator, 'share', { value: vi.fn().mockResolvedValue(undefined), configurable: true });
    rerender(<TimesScreen onOpenPro={() => {}} onGoToPresenca={() => {}} />);
    expect(screen.getByRole('button', { name: 'Enviar' })).toBeInTheDocument();
  });
});
