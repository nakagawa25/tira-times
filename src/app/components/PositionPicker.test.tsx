import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { PositionPicker } from './PositionPicker';

describe('PositionPicker', () => {
  it('defaults to Qualquer selected', () => {
    render(<PositionPicker />);
    expect(screen.getByRole('button', { name: 'Qualquer' })).toHaveClass('pl-chip-on');
  });

  it('selecting a position deselects Qualquer', async () => {
    const onChange = vi.fn();
    render(<PositionPicker onChange={onChange} />);
    await userEvent.click(screen.getByRole('button', { name: 'Defesa' }));
    expect(onChange).toHaveBeenCalledWith(['DEF']);
  });

  it('selecting Qualquer after a position clears the others', async () => {
    const onChange = vi.fn();
    render(<PositionPicker value={['DEF']} onChange={onChange} />);
    await userEvent.click(screen.getByRole('button', { name: 'Qualquer' }));
    expect(onChange).toHaveBeenCalledWith(['QQ']);
  });

  it('deselecting the only selected position reverts to Qualquer', async () => {
    const onChange = vi.fn();
    render(<PositionPicker value={['DEF']} onChange={onChange} />);
    await userEvent.click(screen.getByRole('button', { name: 'Defesa' }));
    expect(onChange).toHaveBeenCalledWith(['QQ']);
  });
});
