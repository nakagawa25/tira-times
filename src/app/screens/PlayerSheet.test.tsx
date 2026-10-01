import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { PlayerSheet } from './PlayerSheet';
import type { Player } from '../../domain/types';

const dudu: Player = { id: '1', name: 'Dudu', positions: ['DEF'], monthly: true, skills: { attack: 1, defense: 5, speed: 2, skill: 3 } };

describe('PlayerSheet', () => {
  it('shows a validation error when saving without a name', async () => {
    const onSave = vi.fn();
    render(<PlayerSheet player={null} onSave={onSave} onClose={() => {}} />);
    await userEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    expect(screen.getByText('Digite o nome ou apelido do jogador.')).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });

  it('"Salvar e + outro" calls onSaveAndAddAnother and resets the form for the next player', async () => {
    const onSaveAndAddAnother = vi.fn();
    render(<PlayerSheet player={null} onSave={() => {}} onSaveAndAddAnother={onSaveAndAddAnother} onClose={() => {}} />);
    const input = screen.getByLabelText('Nome ou apelido') as HTMLInputElement;
    await userEvent.type(input, 'Dudu');
    await userEvent.click(screen.getByRole('button', { name: 'Salvar e + outro' }));
    expect(onSaveAndAddAnother).toHaveBeenCalledWith(expect.objectContaining({ name: 'Dudu', positions: ['QQ'] }));
    expect(input.value).toBe('');
  });

  it('prefills fields and opens Habilidades when editing', () => {
    render(<PlayerSheet player={dudu} onSave={() => {}} onClose={() => {}} />);
    expect((screen.getByLabelText('Nome ou apelido') as HTMLInputElement).value).toBe('Dudu');
    expect(screen.getByText(/Nota média/)).toBeInTheDocument();
  });

  it('delete requires confirmation before calling onDelete', async () => {
    const onDelete = vi.fn();
    render(<PlayerSheet player={dudu} onSave={() => {}} onDelete={onDelete} onClose={() => {}} />);
    await userEvent.click(screen.getByRole('button', { name: 'Excluir jogador' }));
    expect(screen.getByText('Excluir Dudu do elenco?')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Manter' }));
    expect(onDelete).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: 'Excluir jogador' }));
    await userEvent.click(screen.getByRole('button', { name: 'Excluir' }));
    expect(onDelete).toHaveBeenCalledWith('1');
  });
});
