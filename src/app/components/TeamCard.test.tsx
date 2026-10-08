import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { TeamCard } from './TeamCard';
import type { Player } from '../../domain/types';

const mk = (id: string, name: string, positions: Player['positions']): Player => ({
  id,
  name,
  positions,
  monthly: false,
  skills: { attack: 3, defense: 3, speed: 3, skill: 3 },
});

describe('TeamCard', () => {
  it('shows name, player count and power', () => {
    render(<TeamCard name="Time Verde" color="verde" players={[mk('1', 'Dudu', ['DEF']), mk('2', 'Caio', ['MEI'])]} missing={0} />);
    expect(screen.getByText('Time Verde')).toBeInTheDocument();
    expect(screen.getByText('2 jogadores')).toBeInTheDocument();
    expect(screen.getByText('3,0', { selector: '.pl-team-power' })).toBeInTheDocument();
  });

  it('flags a role as missing when no player covers it', () => {
    render(<TeamCard name="Time Verde" color="verde" players={[mk('1', 'Dudu', ['DEF'])]} missing={0} />);
    const defChip = screen.getByText('DEF', { selector: '.pl-role' });
    const ataChip = screen.getByText('ATA', { selector: '.pl-role' });
    expect(defChip).not.toHaveClass('pl-role-miss');
    expect(ataChip).toHaveClass('pl-role-miss');
  });

  it('shows the goalkeeper banner only when provided', () => {
    const { rerender } = render(<TeamCard name="Time Verde" color="verde" players={[]} goalkeeper="Marcão" missing={0} />);
    expect(screen.getByText(/Marcão/)).toBeInTheDocument();
    rerender(<TeamCard name="Time Verde" color="verde" players={[]} missing={0} />);
    expect(screen.queryByText(/Goleiro:/)).not.toBeInTheDocument();
  });

  it('draws one open-slot row per missing player', () => {
    render(<TeamCard name="Time Laranja" color="laranja" players={[mk('1', 'Dudu', ['DEF'])]} missing={1} />);
    expect(screen.getAllByText('Vaga aberta — completar com 1 de fora')).toHaveLength(1);
  });

  it('shows "N/total" instead of "N jogadores" when the team is incomplete', () => {
    render(<TeamCard name="Time Laranja" color="laranja" players={[mk('1', 'Dudu', ['DEF'])]} missing={1} />);
    expect(screen.getByText('1/2')).toBeInTheDocument();
    expect(screen.queryByText('1 jogadores')).not.toBeInTheDocument();
  });

  it('shows no open-slot row when the team is complete', () => {
    render(<TeamCard name="Time Verde" color="verde" players={[mk('1', 'Dudu', ['DEF'])]} missing={0} />);
    expect(screen.queryByText('Vaga aberta — completar com 1 de fora')).not.toBeInTheDocument();
  });

  it('suggests bench players closest to the team rating instead of the generic open-slot text', () => {
    render(
      <TeamCard
        name="Time Laranja"
        color="laranja"
        players={[mk('1', 'Dudu', ['DEF'])]}
        missing={1}
        otherTeamsPlayers={[mk('2', 'Caio', ['MEI']), mk('3', 'Bia', ['ATA'])]}
      />,
    );
    expect(screen.getByText('Caio ou Bia')).toBeInTheDocument();
    expect(screen.queryByText('Vaga aberta — completar com 1 de fora')).not.toBeInTheDocument();
  });
});
