import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import App from './App';
import { useAppStore } from './store/useAppStore';

beforeEach(() => {
  localStorage.clear();
  useAppStore.setState(useAppStore.getInitialState());
});

describe('App', () => {
  it('shows Elenco by default and switches tabs without unmounting the nav', async () => {
    render(<App />);
    expect(screen.getByText('Nenhum jogador ainda')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Presença/ }));
    expect(screen.getByText('Quem veio?')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Times/ }));
    expect(screen.getByText('Bora sortear?')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Regras/ }));
    expect(screen.getByText('Jogadores de linha por time')).toBeInTheDocument();
  });

  it('shows the present-count badge on the Presença tab', () => {
    useAppStore.getState().addPlayer({ id: '1', name: 'Dudu', positions: ['QQ'], monthly: false, skills: { attack: 3, defense: 3, speed: 3, skill: 3 } });
    render(<App />);
    expect(screen.getByText('1')).toBeInTheDocument();
  });
});
