import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { AppBar } from '../components/AppBar';
import { PlayerRow } from '../components/PlayerRow';
import { Button } from '../components/Button';
import { Empty } from '../components/Empty';
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
    <>
      <AppBar title="Quem veio?" subtitle={formatDateLong(new Date())} large />
      <div className="tt-stats">
        <div className="tt-stat tt-stat-main">
          <div className="tt-stat-n">{presentPlayers.length}</div>
          <div className="tt-stat-l">presentes de {players.length}</div>
        </div>
        <div className="tt-stat">
          <div className="tt-stat-n">{presentGoalkeepers}</div>
          <div className="tt-stat-l">{presentGoalkeepers === 1 ? 'goleiro' : 'goleiros'}</div>
        </div>
      </div>
      <div className="tt-quick">
        <button type="button" className="pl-chip" onClick={setAllMonthlyPresent}>
          <span className="pl-icon" aria-hidden="true">
            workspace_premium
          </span>
          Mensalistas
        </button>
        <button type="button" className="pl-chip" onClick={setAllPresent}>
          <span className="pl-icon" aria-hidden="true">
            done_all
          </span>
          Todos
        </button>
        <button type="button" className="pl-chip" onClick={clearPresent}>
          <span className="pl-icon" aria-hidden="true">
            close
          </span>
          Limpar
        </button>
      </div>
      <div className="pl-screen">
        {sorted.length === 0 ? (
          <Empty icon="groups" title="Elenco vazio" text="Cadastre jogadores na aba Elenco primeiro." />
        ) : (
          sorted.map((p) => (
            <PlayerRow
              key={p.id}
              name={p.name}
              positions={p.positions}
              monthly={p.monthly}
              mode="attendance"
              present={present.includes(p.id)}
              onToggle={() => togglePresent(p.id)}
            />
          ))
        )}
      </div>
      <div className="pl-dock">
        <Button variant="primary" size="lg" block disabled={presentPlayers.length < 4} onClick={handleDraw}>
          {presentPlayers.length < 4 ? 'Marque pelo menos 4' : `Sortear ${presentPlayers.length} jogadores`}
        </Button>
      </div>
    </>
  );
}
