import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { ElencoScreen } from './ElencoScreen';
import { useAppStore } from '../store/useAppStore';
import type { Player } from '../../domain/types';

const noop = () => {};
const player1: Player = { id: '1', name: 'Dudu', positions: ['QQ'], monthly: false, skills: { attack: 3, defense: 3, speed: 3, skill: 3 } };

beforeEach(() => {
  localStorage.clear();
  useAppStore.setState(useAppStore.getInitialState());
});

describe('ElencoScreen', () => {
  it('shows the empty state and opens the sheet from "Cadastrar primeiro"', async () => {
    render(<ElencoScreen onHideNavChange={noop} onOpenPro={noop} />);
    expect(screen.getByText('Nenhum jogador ainda')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Cadastrar primeiro' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('adding a player through the sheet shows it in the list, present by default', async () => {
    render(<ElencoScreen onHideNavChange={noop} onOpenPro={noop} />);
    await userEvent.click(screen.getByRole('button', { name: 'Novo jogador' }));
    await userEvent.type(screen.getByLabelText('Nome ou apelido'), 'Dudu');
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    expect(screen.getByText('Dudu')).toBeInTheDocument();
    const state = useAppStore.getState();
    expect(state.present).toEqual(state.players.map((p) => p.id));
  });

  it('filters the list by name and shows the no-results message', async () => {
    useAppStore.getState().addPlayer(player1);
    render(<ElencoScreen onHideNavChange={noop} onOpenPro={noop} />);
    await userEvent.type(screen.getByPlaceholderText('Buscar jogador'), 'zzz');
    expect(screen.getByText('Ninguém com esse nome')).toBeInTheDocument();
  });

  it('toggles rating visibility with the "Notas" action', async () => {
    useAppStore.getState().addPlayer(player1);
    render(<ElencoScreen onHideNavChange={noop} onOpenPro={noop} />);
    expect(screen.getByText('3,0')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Notas' }));
    expect(screen.queryByText('3,0')).not.toBeInTheDocument();
  });

  it('opens Importar/Exportar and hides the bottom nav', async () => {
    let hidden = false;
    render(<ElencoScreen onHideNavChange={(h) => (hidden = h)} onOpenPro={noop} />);
    await userEvent.click(screen.getByRole('button', { name: 'Importar/Exportar' }));
    expect(screen.getByText('Importar / Exportar')).toBeInTheDocument();
    expect(hidden).toBe(true);
  });
});
