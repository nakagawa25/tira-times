import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { Stepper } from './Stepper';

describe('Stepper', () => {
  it('increments on + and calls onChange', async () => {
    const onChange = vi.fn();
    render(<Stepper label="Quantidade de times" value={3} min={2} max={6} onChange={onChange} />);
    await userEvent.click(screen.getByRole('button', { name: /Aumentar/ }));
    expect(onChange).toHaveBeenCalledWith(4);
  });

  it('disables the minus button at the minimum', () => {
    render(<Stepper label="Quantidade de times" value={2} min={2} max={6} />);
    expect(screen.getByRole('button', { name: /Diminuir/ })).toBeDisabled();
  });

  it('disables the plus button at the maximum', () => {
    render(<Stepper label="Quantidade de times" value={6} min={2} max={6} />);
    expect(screen.getByRole('button', { name: /Aumentar/ })).toBeDisabled();
  });
});
