import React, { useState } from 'react';
import type { Position } from '../../domain/types';

const OPTIONS: { id: Position; label: string }[] = [
  { id: 'GOL', label: 'Goleiro' },
  { id: 'DEF', label: 'Defesa' },
  { id: 'ALA', label: 'Ala' },
  { id: 'MEI', label: 'Meio' },
  { id: 'ATA', label: 'Ataque' },
  { id: 'QQ', label: 'Qualquer' },
];

export interface PositionPickerProps {
  value?: Position[];
  defaultValue?: Position[];
  onChange?: (value: Position[]) => void;
}

export function PositionPicker({ value, defaultValue = ['QQ'], onChange }: PositionPickerProps) {
  const [internal, setInternal] = useState<Position[]>(defaultValue);
  const current = value ?? internal;

  function toggle(id: Position) {
    let next: Position[];
    if (id === 'QQ') {
      next = ['QQ'];
    } else {
      const withoutQQ = current.filter((p) => p !== 'QQ');
      next = withoutQQ.includes(id) ? withoutQQ.filter((p) => p !== id) : [...withoutQQ, id];
      if (next.length === 0) next = ['QQ'];
    }
    if (value === undefined) setInternal(next);
    onChange?.(next);
  }

  return (
    <div className="pl-chips" role="group" aria-label="Posição">
      {OPTIONS.map((opt) => {
        const on = current.includes(opt.id);
        return (
          <button key={opt.id} type="button" className={`pl-chip${on ? ' pl-chip-on' : ''}`} aria-pressed={on} onClick={() => toggle(opt.id)}>
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
