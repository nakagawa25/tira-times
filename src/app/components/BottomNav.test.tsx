import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { BottomNav } from './BottomNav';

describe('BottomNav', () => {
  it('renders the four default tabs', () => {
    render(<BottomNav />);
    ['Elenco', 'Presença', 'Times', 'Regras'].forEach((label) => expect(screen.getByText(label)).toBeInTheDocument());
  });

  it('marks the active tab and calls onChange when another is clicked', async () => {
    const onChange = vi.fn();
    render(<BottomNav active="elenco" onChange={onChange} />);
    expect(screen.getByRole('button', { name: /Elenco/ })).toHaveClass('pl-nav-on');
    await userEvent.click(screen.getByRole('button', { name: /Presença/ }));
    expect(onChange).toHaveBeenCalledWith('presenca');
  });

  it('shows a badge when an item has one', () => {
    render(<BottomNav items={[{ id: 'presenca', icon: 'how_to_reg', label: 'Presença', badge: 15 }]} />);
    expect(screen.getByText('15')).toBeInTheDocument();
  });
});
