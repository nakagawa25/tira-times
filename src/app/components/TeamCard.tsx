import React from 'react';
import type { Player, TeamColor } from '../../domain/types';
import { teamProfile } from '../../domain/teamProfile';
import { rating, formatRating } from '../../domain/rating';

export interface TeamCardProps {
  name: string;
  color: TeamColor;
  players: Player[];
  goalkeeper?: string | null;
  missing?: number;
  showProfile?: boolean;
}

const METERS: { key: 'attack' | 'defense' | 'speed' | 'skill'; label: string }[] = [
  { key: 'attack', label: 'ATA' },
  { key: 'defense', label: 'DEF' },
  { key: 'speed', label: 'VEL' },
  { key: 'skill', label: 'HAB' },
];

function playerTag(p: Player): string {
  return p.positions.find((pos) => pos !== 'QQ') ?? 'QQ';
}

export function TeamCard({ name, color, players, goalkeeper, missing = 0, showProfile = true }: TeamCardProps) {
  const power = players.length ? players.reduce((a, p) => a + rating(p), 0) / players.length : 0;
  const profile = teamProfile(players);

  return (
    <div className="pl-team">
      <div className={`pl-team-head pl-team-${color}`}>
        <span className="pl-team-name">{name}</span>
        <span className="pl-team-meta">{missing > 0 ? `${players.length}/${players.length + missing}` : `${players.length} jogadores`}</span>
        <span className="pl-team-power">
          <span className="pl-icon" aria-hidden="true">
            bolt
          </span>
          {formatRating(power)}
        </span>
      </div>
      {showProfile && (
        <div className="pl-team-prof">
          <div className="pl-team-meters">
            {METERS.map((m) => (
              <div className="pl-meter" key={m.key}>
                <div className="pl-meter-top">
                  <span>{m.label}</span>
                  <b>{formatRating(profile.skills[m.key])}</b>
                </div>
                <div className="pl-meter-track">
                  <span
                    className="pl-meter-fill"
                    style={{ width: `${(profile.skills[m.key] / 5) * 100}%`, background: 'var(--pitch-600)' }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="pl-team-roles">
            {(['DEF', 'MEI', 'ATA'] as const).map((role) => (
              <span key={role} className={`pl-role${profile.roles[role] === 0 ? ' pl-role-miss' : ''}`}>
                {role}
              </span>
            ))}
          </div>
        </div>
      )}
      {goalkeeper && (
        <div className="pl-team-gk">
          <span className="pl-icon" aria-hidden="true">
            sports_handball
          </span>
          Goleiro: {goalkeeper}
        </div>
      )}
      <ul className="pl-team-list">
        {players.map((p) => (
          <li key={p.id}>
            <span className={`pl-team-dot pl-team-${color}`} aria-hidden="true" />
            <span className="pl-team-player">{p.name}</span>
            <span className="pl-team-pos">{playerTag(p)}</span>
          </li>
        ))}
        {Array.from({ length: Math.max(0, missing) }).map((_, i) => (
          <li key={`open-${i}`} className="pl-team-open">
            <span className="pl-icon" aria-hidden="true">
              person_add
            </span>
            Vaga aberta — completar com 1 de fora
          </li>
        ))}
      </ul>
    </div>
  );
}
