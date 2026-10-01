import React from 'react';
import type { Position } from '../../domain/types';
import { formatRating } from '../../domain/rating';

export interface PlayerRowProps {
  name: string;
  positions?: Position[];
  monthly?: boolean;
  rating?: number;
  mode?: 'list' | 'attendance';
  present?: boolean;
  onToggle?: () => void;
  onClick?: () => void;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function PlayerRow({ name, positions = ['QQ'], monthly, rating, mode = 'list', present, onToggle, onClick }: PlayerRowProps) {
  const isGk = positions.includes('GOL');
  const attendance = mode === 'attendance';
  const rowOn = attendance && Boolean(present);

  return (
    <button type="button" className={`pl-player${rowOn ? ' pl-player-on' : ''}`} onClick={attendance ? onToggle : onClick}>
      <span className={`pl-avatar${rowOn ? ' pl-avatar-on' : isGk ? ' pl-avatar-gk' : ''}`}>
        {rowOn ? (
          <span className="pl-icon" aria-hidden="true">
            check
          </span>
        ) : (
          initials(name)
        )}
      </span>
      <span className="pl-player-main">
        <span className="pl-player-name">
          {name}
          {monthly && (
            <span className="pl-icon pl-player-mono" aria-label="Mensalista">
              workspace_premium
            </span>
          )}
        </span>
        <span className="pl-player-meta">
          {positions.map((p) => (
            <span key={p} className={`pl-pos${p === 'GOL' ? ' pl-pos-gk' : ''}`}>
              {p}
            </span>
          ))}
          {rating !== undefined && (
            <span className="pl-player-rate">
              <span className="pl-icon" aria-hidden="true">
                star
              </span>
              {formatRating(rating)}
            </span>
          )}
        </span>
      </span>
      {attendance ? (
        <span className={`pl-check${present ? ' pl-check-on' : ''}`} aria-hidden="true">
          {present && (
            <span className="pl-icon" aria-hidden="true">
              check
            </span>
          )}
        </span>
      ) : (
        <span className="pl-icon pl-player-go" aria-hidden="true">
          chevron_right
        </span>
      )}
    </button>
  );
}
