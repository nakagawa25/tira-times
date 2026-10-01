import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { PlayerRow } from './PlayerRow';

describe('PlayerRow', () => {
  it('list mode shows name, position, rating and calls onClick', async () => {
    const onClick = vi.fn();
    render(<PlayerRow name="Tiago Souza" positions={['ATA']} rating={3.4} onClick={onClick} />);
    expect(screen.getByText('Tiago Souza')).toBeInTheDocument();
    expect(screen.getByText('ATA')).toBeInTheDocument();
    expect(screen.getByText('3,4')).toBeInTheDocument();
    await userEvent.click(screen.getByText('Tiago Souza'));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('shows the monthly icon when monthly is true', () => {
    render(<PlayerRow name="Dudu" monthly />);
    expect(screen.getByLabelText('Mensalista')).toBeInTheDocument();
  });

  it('hides the rating when not provided (notas ocultas)', () => {
    render(<PlayerRow name="Dudu" />);
    expect(screen.queryByText('3,0')).not.toBeInTheDocument();
  });

  it('attendance mode reflects presence and calls onToggle on click', async () => {
    const onToggle = vi.fn();
    render(<PlayerRow name="Dudu" mode="attendance" present={false} onToggle={onToggle} />);
    const row = screen.getByText('Dudu').closest('button')!;
    expect(row).not.toHaveClass('pl-player-on');
    await userEvent.click(row);
    expect(onToggle).toHaveBeenCalledOnce();
  });

  it('attendance mode shows the filled check when present', () => {
    render(<PlayerRow name="Dudu" mode="attendance" present />);
    expect(screen.getByText('Dudu').closest('button')).toHaveClass('pl-player-on');
  });
});
