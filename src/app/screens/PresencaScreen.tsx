import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { AppBar } from '../components/AppBar';
import { PlayerRow } from '../components/PlayerRow';
import { Button } from '../components/Button';
import { isGoalkeeper } from '../../domain/rating';
import { formatDateLong } from '../dateFormat';

export interface PresencaScreenProps {
  onDrawn: () => void;
}

export function PresencaScreen({ onDrawn }: PresencaScreenProps) {
  const players = useAppStore((s) => s.players);
  const present = useAppStore((s) => s.present);
  const togglePresent = useAppStore((s) => s.togglePresent);
  const setAllMonthlyPresent = useAppStore((s) => s.setAllMonthlyPresent);
  const setAllPresent = useAppStore((s) => s.setAllPresent);
  const clearPresent = useAppStore((s) => s.clearPresent);
  const runDraw = useAppStore((s) => s.runDraw);

  const presentPlayers = players.filter((p) => present.includes(p.id));
  const presentGoalkeepers = presentPlayers.filter(isGoalkeeper).length;
  const sorted = [...players].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));

  function handleDraw() {
    runDraw();
    onDrawn();
  }

  return (
    <div>
      <div style={{ display: 'none' }}>Presença</div>
      <AppBar title="Quem veio?" subtitle={formatDateLong(new Date())} large />
      <p>
        {presentPlayers.length} de {players.length} presentes · {presentGoalkeepers} goleiros
      </p>
      <div>
        <Button variant="outline" onClick={setAllMonthlyPresent}>
          Mensalistas
        </Button>
        <Button variant="outline" onClick={setAllPresent}>
          Todos
        </Button>
        <Button variant="ghost" onClick={clearPresent}>
          Limpar
        </Button>
      </div>
      {sorted.map((p) => (
        <PlayerRow
          key={p.id}
          name={p.name}
          positions={p.positions}
          monthly={p.monthly}
          mode="attendance"
          present={present.includes(p.id)}
          onToggle={() => togglePresent(p.id)}
        />
      ))}
      <Button variant="primary" size="lg" block disabled={presentPlayers.length < 4} onClick={handleDraw}>
        {presentPlayers.length < 4 ? 'Marque pelo menos 4' : `Sortear ${presentPlayers.length} jogadores`}
      </Button>
    </div>
  );
}
