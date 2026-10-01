import React, { type ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'tonal' | 'outline' | 'ghost' | 'danger' | 'fab';

export interface ButtonProps {
  variant?: ButtonVariant;
  size?: 'md' | 'lg';
  block?: boolean;
  icon?: string;
  disabled?: boolean;
  onClick?: () => void;
  children?: ReactNode;
}

export function Button({ variant = 'primary', size = 'md', block, icon, disabled, onClick, children }: ButtonProps) {
  const classes = ['pl-btn', `pl-btn-${variant}`, size === 'lg' ? 'pl-btn-lg' : '', block ? 'pl-btn-block' : '']
    .filter(Boolean)
    .join(' ');
  return (
    <button type="button" className={classes} disabled={disabled} onClick={onClick}>
      {icon && (
        <span className="pl-icon" aria-hidden="true">
          {icon}
        </span>
      )}
      {children}
    </button>
  );
}
