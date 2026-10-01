import React, { useState } from 'react';

export interface StepperProps {
  label: string;
  hint?: string;
  value?: number;
  defaultValue?: number;
  min?: number;
  max?: number;
  onChange?: (value: number) => void;
}

export function Stepper({ label, hint, value, defaultValue = 0, min = -Infinity, max = Infinity, onChange }: StepperProps) {
  const [internal, setInternal] = useState(defaultValue);
  const current = value ?? internal;

  function set(next: number) {
    const clamped = Math.min(max, Math.max(min, next));
    if (value === undefined) setInternal(clamped);
    onChange?.(clamped);
  }

  return (
    <div className="pl-stepper">
      <div className="pl-stepper-text">
        <span className="pl-stepper-label">{label}</span>
        {hint && <span className="pl-stepper-hint">{hint}</span>}
      </div>
      <div className="pl-stepper-ctl">
        <button type="button" className="pl-stepper-btn" aria-label={`Diminuir ${label}`} disabled={current <= min} onClick={() => set(current - 1)}>
          <span className="pl-icon" aria-hidden="true">
            remove
          </span>
        </button>
        <span className="pl-stepper-val">{current}</span>
        <button
          type="button"
          className="pl-stepper-btn pl-stepper-plus"
          aria-label={`Aumentar ${label}`}
          disabled={current >= max}
          onClick={() => set(current + 1)}
        >
          <span className="pl-icon" aria-hidden="true">
            add
          </span>
        </button>
      </div>
    </div>
  );
}
