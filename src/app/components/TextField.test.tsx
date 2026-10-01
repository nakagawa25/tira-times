import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { TextField } from './TextField';

describe('TextField', () => {
  it('renders the label and calls onChange with the new value', async () => {
    const onChange = vi.fn();
    render(<TextField label="Nome ou apelido" onChange={onChange} />);
    const input = screen.getByLabelText('Nome ou apelido');
    await userEvent.type(input, 'Dudu');
    expect(onChange).toHaveBeenLastCalledWith('Dudu');
  });

  it('auto-focuses when autoFocus is set', () => {
    render(<TextField label="Nome" autoFocus />);
    expect(screen.getByLabelText('Nome')).toHaveFocus();
  });
});
