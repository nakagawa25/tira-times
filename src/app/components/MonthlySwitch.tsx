import React, { useState } from 'react';

export interface MonthlySwitchProps {
  checked?: boolean;
  defaultChecked?: boolean;
  label?: string;
  hint?: string;
  icon?: string;
  disabled?: boolean;
  onChange?: (value: boolean) => void;
}

export function MonthlySwitch({
  checked,
  defaultChecked = false,
  label = 'Mensalista',
  hint = 'Paga por mês e tem prioridade na lista',
  icon = 'workspace_premium',
  disabled,
  onChange,
}: MonthlySwitchProps) {
  const [internal, setInternal] = useState(defaultChecked);
  const on = checked ?? internal;

  function toggle() {
    if (disabled) return;
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
      disabled={disabled}
      style={disabled ? { opacity: 0.45 } : undefined}
      onClick={toggle}
    >
      <span className="pl-toggle-icon">
        <span className={`pl-icon${on ? ' pl-icon-fill' : ''}`} aria-hidden="true">
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
