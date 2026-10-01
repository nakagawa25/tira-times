import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { MonthlySwitch } from './MonthlySwitch';

describe('MonthlySwitch', () => {
  it('defaults to Mensalista label, unchecked', () => {
    render(<MonthlySwitch />);
    const row = screen.getByRole('switch', { name: /Mensalista/ });
    expect(row).toHaveAttribute('aria-checked', 'false');
  });

  it('calls onChange(true) when clicked', async () => {
    const onChange = vi.fn();
    render(<MonthlySwitch onChange={onChange} />);
    await userEvent.click(screen.getByRole('switch'));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('shows the "on" class when controlled checked is true', () => {
    render(<MonthlySwitch checked label="Equilibrar pela nota média" hint="Usa a nota média" />);
    expect(screen.getByRole('switch', { name: /Equilibrar pela nota média/ })).toHaveClass('pl-toggle-row-on');
  });
});
