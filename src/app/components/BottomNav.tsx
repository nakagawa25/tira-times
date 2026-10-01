import React, { useState } from 'react';

export interface BottomNavItem {
  id: string;
  icon: string;
  label: string;
  badge?: number;
}

export interface BottomNavProps {
  active?: string;
  defaultValue?: string;
  items?: BottomNavItem[];
  onChange?: (id: string) => void;
}

const DEFAULT_ITEMS: BottomNavItem[] = [
  { id: 'elenco', icon: 'groups', label: 'Elenco' },
  { id: 'presenca', icon: 'how_to_reg', label: 'Presença' },
  { id: 'times', icon: 'shuffle', label: 'Times' },
  { id: 'regras', icon: 'tune', label: 'Regras' },
];

export function BottomNav({ active, defaultValue = 'elenco', items = DEFAULT_ITEMS, onChange }: BottomNavProps) {
  const [internal, setInternal] = useState(defaultValue);
  const current = active ?? internal;

  function select(id: string) {
    if (active === undefined) setInternal(id);
    onChange?.(id);
  }

  return (
    <nav className="pl-nav">
      {items.map((item) => {
        const on = item.id === current;
        return (
          <button key={item.id} type="button" className={`pl-nav-item${on ? ' pl-nav-on' : ''}`} aria-current={on} onClick={() => select(item.id)}>
            <span className="pl-nav-pill">
              <span className={`pl-icon${on ? ' pl-icon-fill' : ''}`} aria-hidden="true">
                {item.icon}
              </span>
              {item.badge !== undefined && item.badge > 0 && <span className="pl-nav-badge">{item.badge}</span>}
            </span>
            <span className="pl-nav-label">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
