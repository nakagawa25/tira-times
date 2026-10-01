import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { StarRating } from './StarRating';

describe('StarRating', () => {
  it('defaults to 3 filled stars', () => {
    render(<StarRating label="Ataque" />);
    const stars = screen.getAllByRole('button');
    expect(stars.filter((s) => s.className.includes('pl-star-on'))).toHaveLength(3);
  });

  it('tapping a higher star raises the value', async () => {
    const onChange = vi.fn();
    render(<StarRating label="Ataque" value={3} onChange={onChange} />);
    await userEvent.click(screen.getByRole('button', { name: '5 estrelas' }));
    expect(onChange).toHaveBeenCalledWith(5);
  });

  it('tapping the current star lowers the value by one', async () => {
    const onChange = vi.fn();
    render(<StarRating label="Ataque" value={3} onChange={onChange} />);
    await userEvent.click(screen.getByRole('button', { name: '3 estrelas' }));
    expect(onChange).toHaveBeenCalledWith(2);
  });

  it('does not respond to clicks when readOnly', async () => {
    const onChange = vi.fn();
    render(<StarRating label="Ataque" value={3} onChange={onChange} readOnly />);
    await userEvent.click(screen.getByRole('button', { name: '5 estrelas' }));
    expect(onChange).not.toHaveBeenCalled();
  });
});
