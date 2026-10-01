import React, { useState } from 'react';

export interface MonthlySwitchProps {
  checked?: boolean;
  defaultChecked?: boolean;
  label?: string;
  hint?: string;
  icon?: string;
  onChange?: (value: boolean) => void;
}

export function MonthlySwitch({
  checked,
  defaultChecked = false,
  label = 'Mensalista',
  hint = 'Paga por mês e tem prioridade na lista',
  icon = 'workspace_premium',
  onChange,
}: MonthlySwitchProps) {
  const [internal, setInternal] = useState(defaultChecked);
  const on = checked ?? internal;

  function toggle() {
    const next = !on;
    if (checked === undefined) setInternal(next);
    onChange?.(next);
  }

  return (
    <button
      type="button"
      className={`pl-toggle-row${on ? ' pl-toggle-row-on' : ''}`}
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={toggle}
    >
      <span className="pl-toggle-icon">
        <span className="pl-icon" aria-hidden="true">
          {icon}
        </span>
      </span>
      <span className="pl-toggle-text">
        <span className="pl-toggle-title">{label}</span>
        <span className="pl-toggle-hint">{hint}</span>
      </span>
      <span className={`pl-switch${on ? ' pl-switch-on' : ''}`} aria-hidden="true">
        <span className="pl-switch-thumb" />
      </span>
    </button>
  );
}
