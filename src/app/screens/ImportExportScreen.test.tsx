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
    expect(screen.getByText('1 jogadores + regras')).toBeInTheDocument();
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
    await userEvent.click(screen.getByRole('button', { name: 'Importar texto colado' }));
    expect(screen.getByText('Esse texto não é um JSON válido. Copie o arquivo inteiro, do primeiro { ao último }.')).toBeInTheDocument();
  });

  it('merges a valid import and reports how many were added vs updated', async () => {
    useAppStore.getState().addPlayer({ id: 'p01', name: 'Marcão', positions: ['GOL'], monthly: true, skills: { attack: 1, defense: 4, speed: 2, skill: 3 } });
    render(<ImportExportScreen onBack={() => {}} onOpenPro={() => {}} />);
    const json = JSON.stringify({ players: [{ id: 'p01', name: 'Marcão Atualizado' }, { name: 'Novo' }] });
    await userEvent.type(screen.getByLabelText('Colar JSON'), esc(json));
    await userEvent.click(screen.getByRole('button', { name: 'Importar texto colado' }));
    expect(screen.getByText('1 adicionados e 1 atualizados.')).toBeInTheDocument();
    expect(useAppStore.getState().players.find((p) => p.id === 'p01')?.name).toBe('Marcão Atualizado');
  });

  it('imports a chosen .json file through the same flow as pasted text', async () => {
    render(<ImportExportScreen onBack={() => {}} onOpenPro={() => {}} />);
    const json = JSON.stringify({ players: [{ name: 'Do arquivo' }] });
    const file = new File([json], 'test.json', { type: 'application/json' });
    await userEvent.upload(screen.getByLabelText('Escolher arquivo .json'), file);
    expect(screen.getByText('1 adicionados e 0 atualizados.')).toBeInTheDocument();
    expect(useAppStore.getState().players.find((p) => p.name === 'Do arquivo')).toBeTruthy();
  });

  it('"Copiar JSON" flips its label to "Copiado!" after a successful copy', async () => {
    render(<ImportExportScreen onBack={() => {}} onOpenPro={() => {}} />);
    await userEvent.click(screen.getByRole('button', { name: 'Copiar JSON' }));
    expect(navigator.clipboard.writeText).toHaveBeenCalledOnce();
    expect(await screen.findByRole('button', { name: 'Copiado!' })).toBeInTheDocument();
  });

  it('clearing the squad requires confirmation and then removes every player', async () => {
    useAppStore.getState().addPlayer({ id: '1', name: 'Dudu', positions: ['QQ'], monthly: false, skills: { attack: 3, defense: 3, speed: 3, skill: 3 } });
    render(<ImportExportScreen onBack={() => {}} onOpenPro={() => {}} />);
    await userEvent.click(screen.getByRole('button', { name: 'Excluir elenco inteiro' }));
    expect(screen.getByText('Excluir todo o elenco (1 jogadores)? Essa ação não pode ser desfeita.')).toBeInTheDocument();
    expect(useAppStore.getState().players).toHaveLength(1);
    await userEvent.click(screen.getByRole('button', { name: 'Excluir' }));
    expect(useAppStore.getState().players).toHaveLength(0);
  });
});
