import React, { type ReactNode } from 'react';

export type BadgeTone = 'monthly' | 'guest' | 'gk' | 'warn' | 'neutral';

export interface BadgeProps {
  tone?: BadgeTone;
  icon?: string;
  children?: ReactNode;
}

export function Badge({ tone = 'neutral', icon, children }: BadgeProps) {
  return (
    <span className={`pl-badge pl-badge-${tone}`}>
      {icon && (
        <span className="pl-icon" aria-hidden="true">
          {icon}
        </span>
      )}
      {children}
    </span>
  );
}
