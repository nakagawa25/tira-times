import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { ImportExportScreen } from './ImportExportScreen';
import { useAppStore } from '../store/useAppStore';

// user-event v14 treats { and [ as the start of special key syntax in .type(); double them to type the literal character.
const esc = (s: string) => s.replace(/[{[]/g, (c) => c + c);

beforeEach(() => {
  localStorage.clear();
  useAppStore.setState(useAppStore.getInitialState());
  Object.defineProperty(navigator, 'clipboard', { value: { writeText: vi.fn().mockResolvedValue(undefined) }, configurable: true });
});

describe('ImportExportScreen', () => {
  it('shows the group name, player count and a valid export preview', () => {
    useAppStore.getState().addPlayer({ id: '1', name: 'Dudu', positions: ['QQ'], monthly: false, skills: { attack: 3, defense: 3, speed: 3, skill: 3 } });
    render(<ImportExportScreen onBack={() => {}} onOpenPro={() => {}} />);
    expect(screen.getByText('1 jogadores')).toBeInTheDocument();
    expect(screen.getByText(/"app": "tira-times"/)).toBeInTheDocument();
  });

  it('calls onBack from the app bar', async () => {
    const onBack = vi.fn();
    render(<ImportExportScreen onBack={onBack} onOpenPro={() => {}} />);
    await userEvent.click(screen.getByRole('button', { name: 'Voltar' }));
    expect(onBack).toHaveBeenCalledOnce();
  });

  it('shows the exact FORMATO_JSON.md error for invalid JSON', async () => {
    render(<ImportExportScreen onBack={() => {}} onOpenPro={() => {}} />);
    await userEvent.type(screen.getByLabelText('Colar JSON'), esc('{ not json'));
    await userEvent.click(screen.getByRole('button', { name: 'Importar' }));
    expect(screen.getByText('Esse texto não é um JSON válido. Copie o arquivo inteiro, do primeiro { ao último }.')).toBeInTheDocument();
  });

  it('merges a valid import and reports how many were added vs updated', async () => {
    useAppStore.getState().addPlayer({ id: 'p01', name: 'Marcão', positions: ['GOL'], monthly: true, skills: { attack: 1, defense: 4, speed: 2, skill: 3 } });
    render(<ImportExportScreen onBack={() => {}} onOpenPro={() => {}} />);
    const json = JSON.stringify({ players: [{ id: 'p01', name: 'Marcão Atualizado' }, { name: 'Novo' }] });
    await userEvent.type(screen.getByLabelText('Colar JSON'), esc(json));
    await userEvent.click(screen.getByRole('button', { name: 'Importar' }));
    expect(screen.getByText('1 adicionados e 1 atualizados.')).toBeInTheDocument();
    expect(useAppStore.getState().players.find((p) => p.id === 'p01')?.name).toBe('Marcão Atualizado');
  });

  it('calls onOpenPro from "Conhecer o Pro"', async () => {
    const onOpenPro = vi.fn();
    render(<ImportExportScreen onBack={() => {}} onOpenPro={onOpenPro} />);
    await userEvent.click(screen.getByRole('button', { name: 'Conhecer o Pro' }));
    expect(onOpenPro).toHaveBeenCalledOnce();
  });
});
