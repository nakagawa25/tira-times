import React, { useId } from 'react';

export interface TextFieldProps {
  label?: string;
  placeholder?: string;
  icon?: string;
  hint?: string;
  value?: string;
  defaultValue?: string;
  autoFocus?: boolean;
  onChange?: (value: string) => void;
}

export function TextField({ label, placeholder, icon, hint, value, defaultValue, autoFocus, onChange }: TextFieldProps) {
  const id = useId();
  return (
    <div className="pl-field">
      {label && (
        <label className="pl-field-label" htmlFor={id}>
          {label}
        </label>
      )}
      <div className="pl-field-box">
        {icon && (
          <span className="pl-icon" aria-hidden="true">
            {icon}
          </span>
        )}
        <input
          id={id}
          type="text"
          placeholder={placeholder}
          value={value}
          defaultValue={defaultValue}
          autoFocus={autoFocus}
          onChange={(e) => onChange?.(e.target.value)}
        />
      </div>
      {hint && <span className="pl-field-hint">{hint}</span>}
    </div>
  );
}
