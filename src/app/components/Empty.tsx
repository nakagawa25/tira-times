import React, { type ReactNode } from 'react';

export interface EmptyProps {
  icon: string;
  title: string;
  text: string;
  action?: ReactNode;
}

export function Empty({ icon, title, text, action }: EmptyProps) {
  return (
    <div className="tt-empty">
      <span className="tt-empty-icon">
        <span className="pl-icon" style={{ fontSize: 32 }} aria-hidden="true">
          {icon}
        </span>
      </span>
      <div className="tt-empty-title">{title}</div>
      <div className="tt-empty-text">{text}</div>
      {action}
    </div>
  );
}
