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
      <AppBar title="Regras" subtitle="Valem para todo sorteio" large />
      <div className="pl-card">
        <Stepper
          label="Jogadores de linha por time"
          hint="Sem contar o goleiro"
          value={rules.linePerTeam}
          min={2}
          max={11}
          onChange={(v) => setRules({ linePerTeam: v })}
        />
        <hr className="pl-divider" />
        <Stepper label="Quantidade de times" hint="Cada um com uma cor de colete" value={rules.teams} min={2} max={6} onChange={(v) => setRules({ teams: v })} />
      </div>
      <div className="pl-section-title">Goleiros</div>
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
      <div className="pl-section-title">Equilíbrio</div>
      <div className="tt-stack-s">
        <MonthlySwitch
          checked={rules.balance}
          label="Equilibrar pela nota média"
          hint="Médias dos times o mais parecidas possível"
          icon="balance"
          onChange={(v) => setRules({ balance: v })}
        />
        <div className={rules.balance ? '' : 'tt-off'}>
          <MonthlySwitch
            checked={rules.balance && rules.traits}
            disabled={!rules.balance}
            label="Espalhar características"
            hint={rules.balance ? 'Quem corre, defende, ataca e dribla em todos os times' : 'Precisa do equilíbrio pela nota média'}
            icon="scatter_plot"
            onChange={(v) => setRules({ traits: v })}
          />
        </div>
        <MonthlySwitch
          checked={rules.positions}
          label="Garantir posições"
          hint="Pelo menos 1 DEF, 1 MEI e 1 ATA por time"
          icon="tune"
          onChange={(v) => setRules({ positions: v })}
        />
        <MonthlySwitch
          checked={rules.monthlyPriority}
          label="Prioridade para mensalistas"
          hint="Se sobrar gente, avulso espera"
          icon="workspace_premium"
          onChange={(v) => setRules({ monthlyPriority: v })}
        />
        <MonthlySwitch
          checked={rules.avoidRepeatPairs}
          label="Não repetir times"
          hint="Não repete jogadores no mesmo time, mas nem sempre fica equilibrado"
          icon="shuffle"
          onChange={(v) => setRules({ avoidRepeatPairs: v })}
        />
      </div>
      <div className="pl-section-title">Com {presentPlayers.length} presentes hoje</div>
      <div className="pl-card tt-preview">
        <div className="tt-preview-line">
          <span className="pl-icon pl-icon-fill" aria-hidden="true">
            sports_handball
          </span>
          {describeGoalPlan(summary.goal)}
        </div>
        {summary.full > 0 && (
          <div className="tt-preview-line">
            <span className="pl-icon pl-icon-fill" aria-hidden="true">
              check_circle
            </span>
            {summary.full} time(s) completo(s)
          </div>
        )}
        {summary.partial.map((entry, i) => (
          <div key={i} className="tt-preview-line warn">
            <span className="pl-icon pl-icon-fill" aria-hidden="true">
              error
            </span>
            1 time com {entry.size} — completar com {entry.missing} de fora
          </div>
        ))}
        {warnings.map((w) => (
          <div key={w} className="tt-preview-line warn">
            <span className="pl-icon pl-icon-fill" aria-hidden="true">
              error
            </span>
            {w}
          </div>
        ))}
        {summary.bench > 0 && (
          <div className="tt-preview-line">
            <span className="pl-icon pl-icon-fill" aria-hidden="true">
              hourglass_top
            </span>
            {summary.bench} vão para a próxima
          </div>
        )}
      </div>
    </div>
  );
}
