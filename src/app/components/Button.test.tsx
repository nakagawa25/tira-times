import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { Button } from './Button';

describe('Button', () => {
  it('renders children and calls onClick', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Sortear</Button>);
    await userEvent.click(screen.getByRole('button', { name: 'Sortear' }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('applies the variant class', () => {
    render(<Button variant="tonal">Salvar</Button>);
    expect(screen.getByRole('button')).toHaveClass('pl-btn-tonal');
  });

  it('does not fire onClick when disabled', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick} disabled>Sortear</Button>);
    await userEvent.click(screen.getByRole('button', { name: 'Sortear' }));
    expect(onClick).not.toHaveBeenCalled();
  });
});
