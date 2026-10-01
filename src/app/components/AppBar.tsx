import React from 'react';

export interface AppBarAction {
  icon: string;
  label: string;
  onClick?: () => void;
}

export interface AppBarProps {
  title: string;
  subtitle?: string;
  large?: boolean;
  onBack?: (() => void) | null;
  actions?: AppBarAction[];
}

export function AppBar({ title, subtitle, large, onBack, actions = [] }: AppBarProps) {
  return (
    <header className={`pl-appbar${large ? ' pl-appbar-lg' : ''}`}>
      {onBack && (
        <button type="button" className="pl-iconbtn" aria-label="Voltar" onClick={onBack}>
          <span className="pl-icon" aria-hidden="true">
            arrow_back
          </span>
        </button>
      )}
      <div className="pl-appbar-text">
        <span className="pl-appbar-title">{title}</span>
        {subtitle && <span className="pl-appbar-sub">{subtitle}</span>}
      </div>
      {actions.map((action) => (
        <button key={action.label} type="button" className="pl-iconbtn" aria-label={action.label} onClick={action.onClick}>
          <span className="pl-icon" aria-hidden="true">
            {action.icon}
          </span>
        </button>
      ))}
    </header>
  );
}
