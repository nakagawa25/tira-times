import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { AppBar } from '../components/AppBar';
import { Stepper } from '../components/Stepper';
import { MonthlySwitch } from '../components/MonthlySwitch';
import { planSummary } from '../../domain/planSummary';
import { describeGoalPlan, positionWarnings } from './regrasPreview';

export function RegrasScreen() {
  const rules = useAppStore((s) => s.rules);
  const players = useAppStore((s) => s.players);
  const present = useAppStore((s) => s.present);
  const setRules = useAppStore((s) => s.setRules);

  const presentPlayers = players.filter((p) => present.includes(p.id));
  const summary = planSummary(presentPlayers, rules);
  const warnings = positionWarnings(presentPlayers, rules);

  return (
    <div className="pl-screen">
      <AppBar title="Regras" large />
      <div className="pl-card">
        <Stepper label="Jogadores de linha por time" value={rules.linePerTeam} min={2} max={11} onChange={(v) => setRules({ linePerTeam: v })} />
        <hr className="pl-divider" />
        <Stepper label="Quantidade de times" value={rules.teams} min={2} max={6} onChange={(v) => setRules({ teams: v })} />
      </div>
      <div className="pl-card">
        <p>Goleiros</p>
        <div className="tt-seg">
          <button
            type="button"
            className={`tt-seg-btn${rules.goalkeepers === 'fixed' ? ' on' : ''}`}
            aria-pressed={rules.goalkeepers === 'fixed'}
            onClick={() => setRules({ goalkeepers: 'fixed' })}
          >
            Fixos no gol
          </button>
          <button
            type="button"
            className={`tt-seg-btn${rules.goalkeepers === 'perTeam' ? ' on' : ''}`}
            aria-pressed={rules.goalkeepers === 'perTeam'}
            onClick={() => setRules({ goalkeepers: 'perTeam' })}
          >
            Um por time
          </button>
        </div>
      </div>
      <div className="pl-card">
        <MonthlySwitch
          checked={rules.balance}
          label="Equilibrar pela nota média"
          hint="Deixa as médias dos times parecidas"
          icon="balance"
          onChange={(v) => setRules({ balance: v })}
        />
        <MonthlySwitch
          checked={rules.traits}
          disabled={!rules.balance}
          label="Espalhar características"
          hint="Só vale com o equilíbrio pela nota média ligado"
          icon="scatter_plot"
          onChange={(v) => setRules({ traits: v })}
        />
        <MonthlySwitch
          checked={rules.positions}
          label="Garantir posições"
          hint="Cada time com DEF, MEI e ATA quando possível"
          icon="tune"
          onChange={(v) => setRules({ positions: v })}
        />
        <MonthlySwitch
          checked={rules.monthlyPriority}
          label="Prioridade para mensalistas"
          hint="Avulsos saem primeiro quando sobra gente"
          icon="workspace_premium"
          onChange={(v) => setRules({ monthlyPriority: v })}
        />
      </div>
      <div className="pl-card">
        <p>Com {presentPlayers.length} presentes hoje</p>
        <p>{describeGoalPlan(summary.goal)}</p>
        {summary.full > 0 && <p>{summary.full} time(s) completo(s)</p>}
        {summary.partial.map((entry, i) => (
          <p key={i}>1 time com {entry.size} — completar com {entry.missing} de fora</p>
        ))}
        {warnings.map((w) => (
          <p key={w}>{w}</p>
        ))}
        {summary.bench > 0 && <p>{summary.bench} vão para a próxima</p>}
      </div>
    </div>
  );
}
