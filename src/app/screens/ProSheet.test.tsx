import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { ProSheet } from './ProSheet';

describe('ProSheet', () => {
  it('renders nothing when closed', () => {
    render(<ProSheet open={false} onClose={() => {}} onActivate={() => {}} />);
    expect(screen.queryByText('Para quem organiza')).not.toBeInTheDocument();
  });

  it('shows the benefits and price when open', () => {
    render(<ProSheet open onClose={() => {}} onActivate={() => {}} />);
    expect(screen.getByText('Para quem organiza')).toBeInTheDocument();
    expect(screen.getByText('Sem anúncios')).toBeInTheDocument();
    expect(screen.getByText('Histórico de sorteios')).toBeInTheDocument();
  });

  it('calls onActivate and onClose from their buttons', async () => {
    const onActivate = vi.fn();
    const onClose = vi.fn();
    render(<ProSheet open onClose={onClose} onActivate={onActivate} />);
    await userEvent.click(screen.getByRole('button', { name: 'Ativar modo Pro (teste)' }));
    expect(onActivate).toHaveBeenCalledOnce();
    await userEvent.click(screen.getByRole('button', { name: 'Agora não' }));
    expect(onClose).toHaveBeenCalledOnce();
  });
});
