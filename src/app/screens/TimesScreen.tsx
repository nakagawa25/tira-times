import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { AppBar } from '../components/AppBar';
import { Button } from '../components/Button';
import { TeamCard } from '../components/TeamCard';
import { Empty } from '../components/Empty';
import { formatTime } from '../dateFormat';
import { describeGoalkeepers, buildShareText } from './shareText';

export interface TimesScreenProps {
  onOpenPro: () => void;
  onGoToPresenca: () => void;
}

export function TimesScreen({ onGoToPresenca }: TimesScreenProps) {
  const groupName = useAppStore((s) => s.groupName);
  const draw = useAppStore((s) => s.draw);
  const drawnAt = useAppStore((s) => s.drawnAt);
  const runDraw = useAppStore((s) => s.runDraw);
  const [copied, setCopied] = useState(false);

  const shareText = draw ? buildShareText(groupName, draw) : '';

  async function handleCopy() {
    if (!navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard write failed silently; no destructive effect, nothing to recover
    }
  }

  if (!draw) {
    return (
      <div className="pl-screen">
        <AppBar title="Times" subtitle="Nenhum sorteio ainda" large />
        <Empty
          icon="shuffle"
          title="Bora sortear?"
          text="Marque quem veio na aba Presença e toque em Sortear."
          action={
            <Button icon="how_to_reg" onClick={onGoToPresenca}>
              Marcar presença
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="pl-screen tt-listpad">
      <AppBar
        title="Times"
        subtitle={`${drawnAt ? `Sorteado às ${formatTime(new Date(drawnAt))} · ` : ''}${draw.goalkeepers.length + draw.teams.reduce((n, t) => n + t.players.length, 0) + draw.bench.length} jogadores`}
        large
        actions={[{ icon: 'content_copy', label: 'Copiar times', onClick: handleCopy }]}
      />
      <div className="tt-stack">
        <div className="tt-gk">
          <span className="pl-icon pl-icon-fill" aria-hidden="true">
            sports_handball
          </span>
          {describeGoalkeepers(draw)}
        </div>
        {draw.teams.map((team) => (
          <TeamCard key={team.color} name={team.name} color={team.color} players={team.players} goalkeeper={team.goalkeeper} missing={team.missing} />
        ))}
        {draw.bench.length > 0 && (
          <div className="tt-bench">
            <div className="tt-bench-title">
              <span className="pl-icon" aria-hidden="true">
                hourglass_top
              </span>
              Próxima · {draw.bench.length}
            </div>
            <div className="tt-bench-names">{draw.bench.map((p) => p.name).join(', ')}</div>
          </div>
        )}
      </div>
      <div className="pl-dock tt-row">
        <Button variant="tonal" block icon="refresh" onClick={() => runDraw()}>
          Sortear de novo
        </Button>
        <Button block icon="content_copy" onClick={handleCopy}>
          {copied ? 'Copiado!' : 'Copiar'}
        </Button>
        {typeof navigator !== 'undefined' && 'share' in navigator && (
          <Button variant="outline" icon="ios_share" onClick={() => navigator.share({ text: shareText })}>
            Enviar
          </Button>
        )}
      </div>
    </div>
  );
}
