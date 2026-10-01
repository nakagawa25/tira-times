import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { AppBar } from './AppBar';

describe('AppBar', () => {
  it('renders title and subtitle, large variant', () => {
    render(<AppBar title="Elenco" subtitle="22 jogadores · 12 mensalistas" large />);
    expect(screen.getByText('Elenco')).toBeInTheDocument();
    expect(screen.getByText('22 jogadores · 12 mensalistas')).toBeInTheDocument();
  });

  it('shows a back button and calls onBack when provided', async () => {
    const onBack = vi.fn();
    render(<AppBar title="Importar / Exportar" onBack={onBack} />);
    await userEvent.click(screen.getByRole('button', { name: 'Voltar' }));
    expect(onBack).toHaveBeenCalledOnce();
  });

  it('omits the back button when onBack is not provided', () => {
    render(<AppBar title="Elenco" />);
    expect(screen.queryByRole('button', { name: 'Voltar' })).not.toBeInTheDocument();
  });

  it('renders actions and fires their onClick', async () => {
    const onClick = vi.fn();
    render(<AppBar title="Elenco" actions={[{ icon: 'swap_vert', label: 'Importar/Exportar', onClick }]} />);
    await userEvent.click(screen.getByRole('button', { name: 'Importar/Exportar' }));
    expect(onClick).toHaveBeenCalledOnce();
  });
});
