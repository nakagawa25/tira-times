import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { Badge } from './Badge';

describe('Badge', () => {
  it('renders the monthly tone with its class', () => {
    render(<Badge tone="monthly">Mensalista</Badge>);
    expect(screen.getByText('Mensalista')).toHaveClass('pl-badge', 'pl-badge-monthly');
  });

  it('defaults to the neutral tone', () => {
    render(<Badge>Info</Badge>);
    expect(screen.getByText('Info')).toHaveClass('pl-badge-neutral');
  });
});
